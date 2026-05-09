import { useMemo, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Polyfill Buffer for Solana libraries in Vite
import { Buffer } from 'buffer'
window.Buffer = window.Buffer || Buffer

// Solana wallet imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'
import './styles/globals.css'
import './index.css'

// Auth
import { WalletAuthProvider } from './hooks/useWalletAuth.jsx'
import { ProtectedRoute } from './components/shared/ProtectedRoute.jsx'

// Layout
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ROUTES } from './lib/constants'

// Pages
import Landing   from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Launch    from './pages/Launch'
import Auction   from './pages/Auction'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path={ROUTES.HOME}      element={<Landing />} />
        <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path={ROUTES.LAUNCH}    element={<ProtectedRoute><Launch /></ProtectedRoute>} />
        <Route path={ROUTES.AUCTION}   element={<ProtectedRoute><Auction /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  )
}

function AppContent() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[var(--bg-base)] text-[var(--text-secondary)]">
        <Navbar />
        <main className="flex-1 mt-[72px]">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default function App() {
  const endpoint = clusterApiUrl('devnet')
  // Phantom auto-registers via Wallet Standard — no explicit adapters needed
  const wallets  = useMemo(() => [], [])

  const onError = useCallback((error) => {
    // Log structured error for debugging
    console.error('[Wallet] Error:', {
      message: error.message,
      name: error.name,
    })
    
    // Classify and log — don't alert() the user, WalletButton handles UI
    if (error.message?.includes('User rejected')) {
      console.log('[Wallet] User rejected the request — no action needed')
    } else if (error.message?.includes('Unexpected error') || error.message?.includes('disconnected port')) {
      console.warn('[Wallet] Phantom extension may have crashed — user should reload it')
    }
    // All other errors are silently logged; WalletButton displays them inline
  }, [])

  const localStorageKey = 'WalletAdapterNetwork'

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false}
        onError={onError}
        localStorageKey={localStorageKey}
      >
        <WalletModalProvider>
          <WalletAuthProvider>
            <AppContent />
          </WalletAuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
