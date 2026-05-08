import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Lock, Unlock } from 'lucide-react'

import { AUCTION_STATES } from '@/lib/constants'
import { CountdownTimer } from '@/components/auction/CountdownTimer'
import { BidForm } from '@/components/auction/BidForm'
import { RevealPanel } from '@/components/auction/RevealPanel'
import { WinnerPanel } from '@/components/auction/WinnerPanel'

const DUMMY_AUCTION = {
  id: 'token-xyz-123',
  title: 'ProjectXYZ Token Launch',
  reservePrice: 0.5,
  state: AUCTION_STATES.BIDDING,
  bidsCount: 12,
  revealedCount: 8,
  startTime: Date.now() - 3600000, 
  endTime: Date.now() + (42 * 60 * 1000) + (15 * 1000), // 42 mins 15s 
  revealEndTime: Date.now() + 7200000
}

export function Auction() {
  const { id } = useParams()
  const [state, setState] = useState(DUMMY_AUCTION.state)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    // Basic countdown simulation
    const target = state === AUCTION_STATES.BIDDING ? DUMMY_AUCTION.endTime : DUMMY_AUCTION.revealEndTime
    const updateTime = () => setTimeLeft(Math.max(0, Math.floor((target - Date.now())/1000)))
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [state])

  // Dev state toggles
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '1') setState(AUCTION_STATES.BIDDING)
      if (e.key === '2') setState(AUCTION_STATES.REVEAL)
      if (e.key === '3') setState(AUCTION_STATES.CALCULATING)
      if (e.key === '4') setState(AUCTION_STATES.CLOSED)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 md:px-8 max-w-[1200px] mx-auto relative z-10 w-full">
      <Link to="/dashboard" className="absolute top-24 left-8 text-[var(--text-muted)] hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex flex-col w-full"
        >
          {/* Header Area based on state */}
          {state === AUCTION_STATES.BIDDING && (
            <div className="mb-12 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--violet-400)]/40 bg-[var(--violet-500)]/10 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                <Lock className="w-4 h-4 text-[var(--violet-400)]" />
                <span className="font-mono text-xs text-[var(--violet-400)] tracking-[0.2em] uppercase font-bold text-shadow-sm">
                  Active Sealed Auction
                </span>
              </div>
              <h1 className="font-display text-[56px] text-white mb-3 tracking-tight drop-shadow-2xl">
                {DUMMY_AUCTION.title}
              </h1>
              <p className="font-mono text-lg text-[var(--text-muted)] uppercase tracking-wider">
                Reserve Price: <span className="text-white font-medium text-glow">{DUMMY_AUCTION.reservePrice} SOL</span>
              </p>
            </div>
          )}

          {state === AUCTION_STATES.REVEAL && (
            <div className="text-center mb-16 w-full max-w-3xl mx-auto flex flex-col items-center">
              <h1 className="text-[48px] font-display font-bold text-white flex items-center justify-center gap-4 mb-4 drop-shadow-2xl tracking-tighter">
                <Unlock className="w-12 h-12 text-[var(--violet-400)] glow-effect" strokeWidth={1.5} />
                REVEAL PHASE
              </h1>
              <p className="text-xl text-[var(--text-secondary)]">Time to show your hand!</p>
            </div>
          )}

          {state === AUCTION_STATES.CLOSED && (
            <div className="mb-12 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--success)]/40 bg-[var(--success)]/10 mb-6">
                <span className="font-mono text-xs text-[var(--success)] tracking-[0.2em] uppercase font-bold">
                  Auction Concluded
                </span>
              </div>
              <h1 className="font-display text-[48px] text-white mb-3 tracking-tight drop-shadow-2xl">
                {DUMMY_AUCTION.title}
              </h1>
            </div>
          )}

          {/* Grid Layout Container */}
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {state === AUCTION_STATES.BIDDING && (
              <>
                <div className="md:col-span-5 h-full">
                  <CountdownTimer 
                    timeLeft={timeLeft} 
                    totalDuration={3600} 
                    bids={DUMMY_AUCTION.bidsCount} 
                  />
                </div>
                <div className="md:col-span-7 h-full">
                  <BidForm reserve={DUMMY_AUCTION.reservePrice} auctionId={id} />
                </div>
              </>
            )}

            {state === AUCTION_STATES.REVEAL && (
              <RevealPanel />
            )}

            {state === AUCTION_STATES.CLOSED && (
              <div className="md:col-span-12 w-full max-w-4xl mx-auto">
                <WinnerPanel />
              </div>
            )}
            
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default Auction
