import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trophy, ExternalLink, Coins, RotateCcw, Receipt } from 'lucide-react'
import { ConfettiBurst } from '@/components/shared/ConfettiBurst'

const leaderboard = [
  { rank: 1, wallet: '6DiY…3bX', bid: 0.75, result: 'WINNER',   won: true },
  { rank: 2, wallet: '8xKp…mT4', bid: 0.60, result: 'Refunded', won: false },
  { rank: 3, wallet: '3mNq…9pL', bid: 0.50, result: 'Refunded', won: false },
  { rank: 4, wallet: '7pAb…2qZ', bid: 0.45, result: 'Refunded', won: false },
  { rank: 5, wallet: '1cWs…8nF', bid: 0.40, result: 'Refunded', won: false },
]

const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

export function WinnerPanel({ isWinner }) {
  const confettiRef = useRef(null)

  // Fire confetti when component mounts if user is winner
  useEffect(() => {
    if (isWinner) {
      const t = setTimeout(() => confettiRef.current?.fire(), 600)
      return () => clearTimeout(t)
    }
  }, [isWinner])

  return (
    <>
      {/* Confetti canvas (fixed, full-screen) */}
      <ConfettiBurst ref={confettiRef} />

      <div className="flex flex-col gap-6 max-w-2xl mx-auto">

        {/* ── Winner / Ended announcement ── */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.1 }}
          className={`p-8 rounded-2xl border text-center flex flex-col items-center gap-4
            ${isWinner
              ? 'bg-[rgba(6,255,165,0.05)] border-[rgba(6,255,165,0.35)] shadow-[0_0_48px_rgba(6,255,165,0.12)]'
              : 'bg-[var(--bg-surface)] border-[var(--border-default)]'
            }`}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl
            ${isWinner
              ? 'bg-[rgba(6,255,165,0.12)] border-2 border-[rgba(6,255,165,0.4)]'
              : 'bg-[var(--bg-elevated)] border border-[var(--border-default)]'
            }`}
          >
            {isWinner ? '🏆' : '🎯'}
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-1">
              {isWinner ? '🎉 You Won the Auction!' : '🏁 Auction Complete'}
            </h2>
            <p className="text-[var(--text-secondary)]">
              {isWinner
                ? 'Congratulations! Your tokens are ready to be claimed.'
                : 'The winning bid was ◎ 0.75 SOL. Your bid has been automatically refunded.'}
            </p>
          </div>

          {/* Winner address chip */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <span className="font-mono text-xs text-[var(--text-muted)]">Winner:</span>
            <span className="font-mono text-xs text-white">6DiY…3bX</span>
            <a href="https://explorer.solana.com" target="_blank" rel="noreferrer">
              <ExternalLink className="w-3 h-3 text-[var(--text-muted)] hover:text-white transition-colors" />
            </a>
          </div>
        </motion.div>

        {/* ── Leaderboard ── */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-4">
          <h3 className="font-display font-bold text-white">Bid Leaderboard</h3>

          {/* Table header */}
          <div className="grid grid-cols-4 px-3 py-2 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-elevated)] rounded-lg">
            <span>Rank</span>
            <span>Wallet</span>
            <span className="text-right">Bid (SOL)</span>
            <span className="text-right">Status</span>
          </div>

          {/* Rows — staggered entry */}
          {leaderboard.map((row, i) => (
            <motion.div
              key={row.rank}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              className={`grid grid-cols-4 items-center px-3 py-3.5 rounded-xl border font-mono text-sm
                ${row.won
                  ? 'bg-[rgba(6,255,165,0.07)] border-[rgba(6,255,165,0.3)] text-[var(--success)]'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                }
                ${isWinner && row.won ? 'ring-1 ring-[rgba(6,255,165,0.5)]' : ''}
              `}
            >
              <span className="font-bold text-base">{rankEmojis[i]}</span>
              <span className={row.won ? 'text-[var(--success)] font-bold' : ''}>
                {row.wallet}
                {isWinner && row.won && (
                  <span className="ml-1.5 text-[10px] bg-[rgba(6,255,165,0.2)] text-[var(--success)] px-1.5 py-0.5 rounded-full font-sans font-bold">YOU</span>
                )}
              </span>
              <span className="text-right">◎ {row.bid.toFixed(2)}</span>
              <span className={`text-right font-bold text-xs ${row.won ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                {row.result}
              </span>
            </motion.div>
          ))}
        </div>

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {isWinner ? (
            <button className="sm:col-span-3 py-4 rounded-xl font-display font-bold text-base flex items-center justify-center gap-2
              bg-[var(--success)] text-[#001A0F] animate-glow-green hover:-translate-y-0.5 transition-all">
              <Coins className="w-5 h-5" /> 💰 Claim Tokens
            </button>
          ) : (
            <>
              <button className="py-3.5 rounded-xl font-semibold border-2 border-[var(--success)] text-[var(--success)]
                hover:bg-[rgba(6,255,165,0.08)] transition-all flex items-center justify-center gap-2 col-span-2">
                <RotateCcw className="w-4 h-4" /> ↩️ Get Refund
              </button>
              <button className="py-3.5 rounded-xl font-semibold border border-[var(--border-default)] text-[var(--text-secondary)]
                hover:bg-[var(--bg-elevated)] hover:text-white transition-all flex items-center justify-center gap-2">
                <Receipt className="w-4 h-4" /> Receipt
              </button>
            </>
          )}
        </motion.div>

      </div>
    </>
  )
}
