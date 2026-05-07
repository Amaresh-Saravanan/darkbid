import { useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Solana wallet imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'
import './index.css'

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
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.LAUNCH}    element={<Launch />} />
        <Route path={ROUTES.AUCTION}   element={<Auction />} />
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
  const wallets  = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
