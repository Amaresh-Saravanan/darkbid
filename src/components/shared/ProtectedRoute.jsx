import { useWalletAuth } from '@/hooks/useWalletAuth'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/shared/WalletButton'
import { motion } from 'framer-motion'

export function ProtectedRoute({ children }) {
  const { authenticated, login, loading, error } = useWalletAuth()
  const { connected, connecting } = useWallet()

  // Initial loading — wallet adapter is still initializing
  if (connecting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 mt-[-72px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-2xl max-w-md w-full text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.3)] rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl animate-spin" style={{ display: 'inline-block' }}>⏳</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Initializing Wallet</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Please wait while we connect to your wallet...
          </p>
        </motion.div>
      </div>
    )
  }

  // Not connected — prompt to connect wallet
  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 mt-[-72px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel p-8 rounded-2xl max-w-md w-full text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.3)] rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl">🔗</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Connect Your Wallet</h2>
          <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
            Connect your Phantom wallet to access this page. No sign-up required.
          </p>
          <WalletButton />
        </motion.div>
      </div>
    )
  }

  // Connected but not authenticated — prompt to sign message
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 mt-[-72px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel p-8 rounded-2xl max-w-md w-full text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.3)] rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl">{loading ? '⏳' : '✍️'}</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">
            {loading ? 'Waiting for Signature...' : 'Signature Required'}
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
            {loading
              ? 'Please approve the signature request in your Phantom wallet.'
              : 'Sign a message with your wallet to verify ownership and access this page. This doesn\'t cost any SOL.'
            }
          </p>
          
          {error && (
            <div className="w-full p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-left">
              <strong>❌ Error:</strong> {error}
            </div>
          )}

          {!loading && (
            <button 
              onClick={login}
              disabled={loading}
              className="w-full btn-primary-glow text-white font-medium py-3 rounded-xl disabled:opacity-50 transition-all duration-200 hover:shadow-[0_0_24px_rgba(124,58,237,0.4)]"
            >
              Sign Message to Continue
            </button>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
              <span className="animate-spin inline-block">⏳</span>
              Check your Phantom wallet popup...
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  return children
}
