import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useState, useEffect, useCallback } from 'react'

// Shortens wallet address: "AbCd...XyZ1"
function shortenAddress(address) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function WalletButton() {
  const { connected, publicKey, disconnect, connecting, error: walletError, select, wallet } = useWallet()
  const { setVisible } = useWalletModal()
  const [showDropdown, setShowDropdown] = useState(false)
  const [hasPhantom, setHasPhantom] = useState(false)
  const [connectionError, setConnectionError] = useState(null)

  // Check if Phantom is installed
  useEffect(() => {
    const checkPhantom = () => {
      const isPhantomInstalled = window.phantom?.solana?.isPhantom
      setHasPhantom(!!isPhantomInstalled)
      console.log('[Wallet] Phantom check:', { isPhantomInstalled, hasPhantom: !!isPhantomInstalled })
      if (!isPhantomInstalled) {
        console.warn('[Wallet] Phantom wallet not detected. Please install: https://phantom.app')
      }
    }
    
    // Check immediately
    checkPhantom()
    
    // Check again after a short delay (in case extension loads later)
    const timer = setTimeout(checkPhantom, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Log wallet connection state changes
  useEffect(() => {
    console.log('[Wallet] State changed:', { connected, connecting, wallet: wallet?.adapter.name, error: walletError })
    if (walletError) {
      console.error('[Wallet] Connection error:', walletError)
      setConnectionError(walletError.message)
    }
  }, [connected, connecting, wallet, walletError])

  const handleConnect = useCallback(async () => {
    try {
      setConnectionError(null)
      
      if (!hasPhantom) {
        console.warn('[Wallet] Phantom not detected')
        alert('Phantom wallet not detected.\n\nPlease install the Phantom extension:\nhttps://phantom.app')
        window.open('https://phantom.app', '_blank')
        return
      }

      console.log('[Wallet] Selecting Phantom wallet and opening modal...')
      // First select the wallet
      await select('Phantom')
      console.log('[Wallet] Phantom selected, modal should open')
    } catch (err) {
      console.error('[Wallet] Connect error:', err)
      setConnectionError(err.message)
    }
  }, [hasPhantom, select])

  // Log wallet changes when connecting
  useEffect(() => {
    if (connecting) {
      console.log('[Wallet] Connecting to Phantom...')
    }
  }, [connecting])

  // Success handler
  useEffect(() => {
    if (connected && publicKey) {
      console.log('[Wallet] ✅ Successfully connected:', publicKey.toString())
      setConnectionError(null)
    }
  }, [connected, publicKey])

  // LOADING STATE — wallet is connecting
  if (connecting) {
    return (
      <button className="wallet-btn wallet-btn--loading" disabled>
        Connecting...
      </button>
    )
  }

  // NOT CONNECTED — show connect button
  if (!connected) {
    return (
      <div>
        <button
          className="wallet-btn wallet-btn--connect"
          onClick={handleConnect}
          title={!hasPhantom ? 'Phantom not installed' : 'Connect wallet'}
        >
          Connect Wallet
        </button>
        {connectionError && (
          <div className="wallet-error" style={{
            fontSize: '12px',
            color: '#ff6b6b',
            marginTop: '8px',
            padding: '8px',
            background: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '4px'
          }}>
            Error: {connectionError}
          </div>
        )}
      </div>
    )
  }

  // CONNECTED — show address with disconnect option
  return (
    <div className="wallet-connected">
      <button
        className="wallet-btn wallet-btn--connected"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="wallet-dot" />
        {shortenAddress(publicKey.toString())}
      </button>

      {showDropdown && (
        <div className="wallet-dropdown">
          <p className="wallet-full-address">
            {publicKey.toString()}
          </p>
          <button
            className="wallet-disconnect"
            onClick={() => { disconnect(); setShowDropdown(false) }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
