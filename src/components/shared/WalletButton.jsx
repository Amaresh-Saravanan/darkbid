import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletAuth } from '@/hooks/useWalletAuth.jsx'
import './WalletButton.css'

function shortenAddress(addr) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

/**
 * Check if Phantom's service worker is alive by testing a simple method.
 * Returns true if responsive, false if crashed.
 */
async function isPhantomHealthy() {
  try {
    const phantom = window.phantom?.solana
    if (!phantom?.isPhantom) return false
    // Attempt a lightweight call — if the service worker is dead, this throws
    // We use a generous 8-second timeout to allow asleep/cold extension service workers to boot up
    await Promise.race([
      phantom.connect({ onlyIfTrusted: true }).catch(() => 'ok'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
    ])
    return true
  } catch {
    return false
  }
}

export function WalletButton() {
  const { connected, publicKey, disconnect, connecting, select, wallets, connect, wallet } = useWallet()
  const { authenticated, login, logout, loading: authLoading, error: authError } = useWalletAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [status, setStatus] = useState('')
  const [connectStep, setConnectStep] = useState('') // '', 'checking', 'connecting', 'signing'
  const authAttempted = useRef(false)
  const dropdownRef = useRef(null)

  // Clear stale adapter state on mount
  useEffect(() => {
    localStorage.removeItem('WalletAdapterNetwork')
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showDropdown])

  // Reset on disconnect
  useEffect(() => {
    if (!connected) {
      authAttempted.current = false
      setConnectStep('')
    }
  }, [connected])

  // Auto-sign ONCE after connected
  useEffect(() => {
    if (connected && publicKey && !authenticated && !authLoading && !authAttempted.current) {
      authAttempted.current = true
      setConnectStep('signing')
      const timer = setTimeout(() => {
        console.log('[WB] Connected! Triggering sign...')
        login()
          .then(() => setConnectStep(''))
          .catch(err => {
            console.error('[WB] Auth error:', err.message)
            setConnectStep('')
            if (err.message?.includes('User rejected')) {
              setStatus('Signature rejected. Click your address to retry.')
            } else {
              setStatus(err.message)
            }
          })
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [connected, publicKey, authenticated, authLoading])

  const handleConnect = useCallback(async () => {
    setStatus('')
    setConnectStep('checking')

    // Find Phantom adapter
    const phantomAdapter = wallets.find(w =>
      w.adapter.name.toLowerCase().includes('phantom')
    )

    if (!phantomAdapter) {
      const hasPhantom = window.phantom?.solana?.isPhantom || window.solana?.isPhantom
      if (hasPhantom) {
        setStatus('Phantom detected but adapter not ready. Please refresh.')
        setConnectStep('')
      } else {
        setStatus('Phantom not installed!')
        setConnectStep('')
        window.open('https://phantom.app/', '_blank')
      }
      return
    }

    // Pre-flight: check if Phantom extension is responsive
    const healthy = await isPhantomHealthy()
    if (!healthy) {
      setStatus('Phantom extension is not responding. Go to chrome extention and can you reload Phantom, then refresh this page.')
      setConnectStep('')
      return
    }

    setConnectStep('connecting')

    try {
      console.log('[WB] Selecting Phantom adapter...')
      select(phantomAdapter.adapter.name)

      // Connect directly on the adapter instance (stays in user gesture context)
      const connectWithRetry = async (attempt = 0) => {
        if (phantomAdapter.adapter.connected) return

        try {
          await phantomAdapter.adapter.connect()
          console.log('[WB] Adapter connected successfully')
        } catch (err) {
          // User explicitly rejected — don't retry
          if (err.message?.includes('User rejected') || err.code === 4001) {
            throw new Error('Connection rejected by user')
          }
          // Transient error — retry with exponential backoff
          if (attempt < 4 && err.message?.includes('Unexpected error')) {
            const delay = Math.min(200 * Math.pow(2, attempt), 2000)
            console.warn(`[WB] Retry ${attempt + 1}/4 in ${delay}ms...`)
            await new Promise(r => setTimeout(r, delay))
            return connectWithRetry(attempt + 1)
          }
          throw err
        }
      }

      await connectWithRetry()
      setConnectStep('')

    } catch (err) {
      console.error('[WB] Connect failed:', err)
      setConnectStep('')

      if (err.message?.includes('rejected')) {
        setStatus('Connection rejected. Click to try again.')
      } else if (err.message?.includes('Unexpected error')) {
        setStatus('Phantom is not responding. Reload the extension at chrome://extensions then refresh.')
      } else {
        setStatus(err.message || 'Connection failed')
      }
    }
  }, [wallets, select])

  const handleDisconnect = useCallback(() => {
    disconnect()
    logout()
    setShowDropdown(false)
    authAttempted.current = false
    setStatus('')
    setConnectStep('')
    localStorage.removeItem('WalletAdapterNetwork')
  }, [disconnect, logout])

  const handleRetrySign = useCallback(() => {
    authAttempted.current = false
    setStatus('')
    setShowDropdown(false)
    login().catch(err => {
      setStatus(err.message?.includes('User rejected')
        ? 'Signature rejected. Click your address to retry.'
        : err.message)
    })
  }, [login])

  // LOADING states with descriptive text
  if (connecting || connectStep === 'checking' || connectStep === 'connecting') {
    return (
      <button className="wallet-btn wallet-btn--loading" disabled>
        <span className="wallet-btn-spinner" />
        {connectStep === 'checking' ? 'Checking Phantom...' :
          connectStep === 'connecting' ? 'Opening Phantom...' :
            'Connecting...'}
      </button>
    )
  }

  if (authLoading || connectStep === 'signing') {
    return (
      <button className="wallet-btn wallet-btn--loading" disabled>
        <span className="wallet-btn-spinner" />
        Waiting for signature...
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
            color: '#f87171', fontSize: '11px', marginTop: '6px',
            textAlign: 'center', maxWidth: '240px', lineHeight: '1.4'
          }}>
            {status}
          </p>
        )}
      </div>
    )
  }

  // CONNECTED
  return (
    <div className="wallet-connected" style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        className="wallet-btn wallet-btn--connected"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="wallet-dot" />
        {shortenAddress(publicKey.toString())}
        {!authenticated && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>⏳</span>}
        {authenticated && <span style={{ marginLeft: 6, fontSize: 10, color: '#06FFA5' }}>✓</span>}
      </button>

      {showDropdown && (
        <div className="wallet-dropdown">
          <p className="wallet-full-address">{publicKey.toString()}</p>

          {/* Auth status indicator */}
          <div style={{
            padding: '6px 10px', borderRadius: '8px', marginBottom: '8px', fontSize: '12px',
            background: authenticated ? 'rgba(6,255,165,0.08)' : 'rgba(251,191,36,0.08)',
            border: `1px solid ${authenticated ? 'rgba(6,255,165,0.2)' : 'rgba(251,191,36,0.2)'}`,
            color: authenticated ? '#06FFA5' : '#FBB024'
          }}>
            {authenticated ? '✅ Authenticated' : '⏳ Signature needed'}
          </div>

          {!authenticated && (
            <button
              onClick={handleRetrySign}
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

          {(status || authError) && (
            <p style={{ color: '#f87171', fontSize: '11px', marginBottom: 8, lineHeight: '1.4' }}>
              {status || authError}
            </p>
          )}

          <button className="wallet-disconnect" onClick={handleDisconnect}>Disconnect</button>
        </div>
      )}
    </div>
  )
}
