import { useState, useContext, createContext, useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'
import { getToken, setToken, clearToken, walletAuth, getAuthNonce } from '../lib/api'

export const WalletAuthContext = createContext(null)

export function useWalletAuth() {
  const context = useContext(WalletAuthContext)
  if (!context) {
    throw new Error('useWalletAuth must be used within WalletAuthProvider')
  }
  return context
}

/** Timeout wrapper — rejects if the promise doesn't resolve within `ms` */
function withTimeout(promise, ms, label = 'Operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    )
  ])
}

export function WalletAuthProvider({ children }) {
  const { connected, publicKey, signMessage, disconnect } = useWallet()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const loginInProgress = useRef(false)

  // Restore session if token exists and wallet is connected
  useEffect(() => {
    const token = getToken()
    const claims = token ? decodeJwt(token) : null

    // Don't restore expired tokens
    if (claims?.exp && claims.exp * 1000 < Date.now()) {
      console.log('[WalletAuth] Token expired, clearing')
      clearToken()
      return
    }

    // Don't restore token from a different wallet
    if (claims?.wallet && publicKey && claims.wallet !== publicKey.toString()) {
      console.log('[WalletAuth] Wallet mismatch, clearing stale token')
      clearToken()
      return
    }

    if (token && publicKey && connected) {
      setUser({
        walletAddress: claims?.wallet || publicKey.toString(),
        userId: claims?.sub || null,
        authenticated: true
      })
      setError(null)
      console.log('[WalletAuth] Session restored for:', publicKey.toString().slice(0, 8) + '...')
    }
  }, [publicKey, connected])

  // Clear auth when wallet disconnects
  useEffect(() => {
    if (!connected && user) {
      console.log('[WalletAuth] Wallet disconnected, clearing auth')
      setUser(null)
      clearToken()
      setError(null)
      loginInProgress.current = false
    }
  }, [connected, user])

  const login = async () => {
    if (!connected || !publicKey || !signMessage) {
      const msg = 'Wallet not connected or signMessage not available'
      setError(msg)
      console.error('[WalletAuth]', msg)
      return
    }

    // Prevent concurrent login attempts
    if (loginInProgress.current) {
      console.log('[WalletAuth] Login already in progress, skipping')
      return
    }

    try {
      loginInProgress.current = true
      setLoading(true)
      setError(null)

      // Step 1: Get nonce from backend (with 10s timeout)
      console.log('[WalletAuth] Step 1: Requesting nonce...')
      const nonceResponse = await withTimeout(
        getAuthNonce(publicKey.toString()),
        10000,
        'Nonce request'
      )
      const nonce = nonceResponse.nonce
      console.log('[WalletAuth] Nonce received:', nonce?.slice(0, 20) + '...')

      // Step 2: Create message to sign (must match backend exactly)
      const message = new TextEncoder().encode(
        `Sign this message to authenticate with DarkBid\nNonce: ${nonce}`
      )

      // Step 3: Sign with Phantom wallet (with 60s timeout for user interaction)
      console.log('[WalletAuth] Step 2: Requesting signature...')
      let signature
      try {
        signature = await withTimeout(signMessage(message), 60000, 'Signature request')
      } catch (err) {
        if (err.message?.includes('User rejected') || err.message?.includes('rejected')) {
          throw new Error('User rejected the signature request')
        }
        throw err
      }
      console.log('[WalletAuth] Message signed successfully')

      // Step 4: Convert to Base58 and send to backend (with 10s timeout)
      const signatureB58 = bs58.encode(signature)
      console.log('[WalletAuth] Step 3: Verifying with backend...')
      const response = await withTimeout(
        walletAuth(publicKey.toString(), signatureB58, nonce),
        10000,
        'Backend verification'
      )

      if (response.token) {
        setToken(response.token)
        setUser({
          walletAddress: publicKey.toString(),
          userId: response.user_id || decodeJwt(response.token)?.sub || null,
          authenticated: true
        })
        setError(null)
        console.log('[WalletAuth] ✅ Authenticated successfully')
        return response
      }

      throw new Error('No token received from backend')
    } catch (err) {
      console.error('[WalletAuth] Error:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
      loginInProgress.current = false
    }
  }

  const logout = () => {
    setUser(null)
    clearToken()
    setError(null)
    loginInProgress.current = false
    console.log('[WalletAuth] Logged out')
  }

  const value = {
    user,
    loading,
    error,
    authenticated: !!user,
    walletAddress: user?.walletAddress,
    userId: user?.userId || null,
    login,
    logout
  }

  return (
    <WalletAuthContext.Provider value={value}>
      {children}
    </WalletAuthContext.Provider>
  )
}

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const pad = '='.repeat((4 - (normalized.length % 4)) % 4)
    const json = atob(normalized + pad)
    return JSON.parse(json)
  } catch {
    return null
  }
}
