import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletAuth } from '@/hooks/useWalletAuth.jsx'

function shortenAddress(addr) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

export function WalletButton() {
  const { connected, publicKey, disconnect, connecting, select, wallets, connect, wallet } = useWallet()
  const { authenticated, login, logout, loading: authLoading } = useWalletAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [status, setStatus] = useState('')
  const authAttempted = useRef(false)
  const pendingConnect = useRef(false)

  // Clear stale adapter state on mount
  useEffect(() => {
    localStorage.removeItem('WalletAdapterNetwork')
  }, [])

  // Reset on disconnect
  useEffect(() => {
    if (!connected) {
      authAttempted.current = false
      pendingConnect.current = false
    }
  }, [connected])

  // When wallet is selected AND we initiated the connect, call adapter connect()
  useEffect(() => {
    if (wallet && !connected && !connecting && pendingConnect.current) {
      pendingConnect.current = false
      console.log('[WB] Wallet selected, now calling adapter connect()...')
      connect().catch(err => {
        console.error('[WB] Adapter connect failed:', err.message)
        setStatus('Error: ' + err.message)
      })
    }
  }, [wallet, connected, connecting, connect])

  // Auto-sign ONCE after connected
  useEffect(() => {
    if (connected && publicKey && !authenticated && !authLoading && !authAttempted.current) {
      authAttempted.current = true
      const timer = setTimeout(() => {
        console.log('[WB] Connected! Triggering sign...')
        login().catch(err => {
          console.error('[WB] Auth error:', err.message)
          setStatus('Auth: ' + err.message)
        })
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [connected, publicKey, authenticated, authLoading])

  const handleConnect = useCallback(() => {
    setStatus('')

    const phantomAdapter = wallets.find(w =>
      w.adapter.name.toLowerCase().includes('phantom')
    )

    if (!phantomAdapter) {
      // Check if Phantom extension exists at all
      const hasPhantom = window.phantom?.solana?.isPhantom || window.solana?.isPhantom
      if (hasPhantom) {
        setStatus('Phantom detected but adapter not ready. Refresh the page.')
      } else {
        setStatus('Phantom not installed!')
        window.open('https://phantom.app/', '_blank')
      }
      return
    }

    console.log('[WB] Selecting Phantom adapter:', phantomAdapter.adapter.name)
    pendingConnect.current = true
    select(phantomAdapter.adapter.name)
  }, [wallets, select])

  const handleDisconnect = useCallback(() => {
    disconnect()
    logout()
    setShowDropdown(false)
    authAttempted.current = false
    pendingConnect.current = false
    setStatus('')
    localStorage.removeItem('WalletAdapterNetwork')
  }, [disconnect, logout])

  // LOADING
  if (connecting || authLoading) {
    return (
      <button className="wallet-btn wallet-btn--loading" disabled>
        {connecting ? 'Connecting...' : 'Signing...'}
      </button>
    )
  }

  // NOT CONNECTED
  if (!connected) {
    return (
      <div>
        <button className="wallet-btn wallet-btn--connect" onClick={handleConnect}>
          Connect Wallet
        </button>
        {status && (
          <p style={{
            color: '#f87171', fontSize: '11px', marginTop: '4px',
            textAlign: 'center', maxWidth: '220px'
          }}>
            {status}
          </p>
        )}
      </div>
    )
  }

  // CONNECTED
  return (
    <div className="wallet-connected" style={{ position: 'relative' }}>
      <button
        className="wallet-btn wallet-btn--connected"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="wallet-dot" />
        {shortenAddress(publicKey.toString())}
        {!authenticated && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>⏳</span>}
      </button>

      {showDropdown && (
        <div className="wallet-dropdown">
          <p className="wallet-full-address">{publicKey.toString()}</p>
          {!authenticated && (
            <button
              onClick={() => { authAttempted.current = false; login(); setShowDropdown(false) }}
              style={{
                width: '100%', padding: '8px 12px',
                background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
                borderRadius: '8px', color: '#A78BFA', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s'
              }}
            >
              ✍️ Sign to Authenticate
            </button>
          )}
          {status && <p style={{ color: '#f87171', fontSize: '11px', marginBottom: 8 }}>{status}</p>}
          <button className="wallet-disconnect" onClick={handleDisconnect}>Disconnect</button>
        </div>
      )}
    </div>
  )
}
