import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { AuctionCard } from '@/components/auction/AuctionCard'
import { Filter } from 'lucide-react'

const FILTERS = ['All', 'Live', 'Revealing', 'Ended']

const FILTER_COLORS = {
  Live:      'text-[#06FFA5]',
  Revealing: 'text-[#FFA500]',
  Ended:     'text-[#8B8FA8]',
  All:       'text-white',
}

const auctions = [
  { id: '1', name: 'PhantomToken', symbol: '$PHNTM', reserve: '100.00', time: '00:45', bids: '21', status: 'Live' },
  { id: '2', name: 'ZeroCoin',     symbol: '$ZERO',  reserve: '50.00',  time: '02:15', bids: '14', status: 'Live' },
  { id: '3', name: 'Eclipse',      symbol: '$ECL',   reserve: '500.00', time: '14:00', bids: '5',  status: 'Live' },
  { id: '4', name: 'Nebula',       symbol: '$NBLA',  reserve: '25.00',  time: '08:32', bids: '9',  status: 'Revealing' },
  { id: '5', name: 'Axiom',        symbol: '$AX',    reserve: '150.00', time: '03:48', bids: '17', status: 'Revealing' },
  { id: '6', name: 'Stardust',     symbol: '$DUST',  reserve: '10.00',  time: 'Ended', bids: '145',status: 'Ended' },
  { id: '7', name: 'SolFlame',     symbol: '$FLAME', reserve: '75.00',  time: 'Ended', bids: '88', status: 'Ended' },
  { id: '8', name: 'VoidMark',     symbol: '$VOID',  reserve: '200.00', time: 'Ended', bids: '32', status: 'Ended' },
]

const cardVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22,1,0.36,1] }
  }),
}

export default function Dashboard() {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? auctions : auctions.filter(a => a.status === filter)

  const counts = {
    All:      auctions.length,
    Live:      auctions.filter(a => a.status === 'Live').length,
    Revealing: auctions.filter(a => a.status === 'Revealing').length,
    Ended:     auctions.filter(a => a.status === 'Ended').length,
  }

  return (
    <PageTransition className="w-full max-w-7xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-display mb-3">Auctions</h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-xl">
          Browse all sealed-bid token launches. Bid, reveal, and claim — all cryptographically fair.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] w-fit">
        <Filter className="w-4 h-4 text-[var(--text-muted)] ml-2 shrink-0" />
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
              ${filter === f
                ? 'bg-[var(--bg-elevated)] text-white shadow-card'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
          >
            <span className={filter === f && FILTER_COLORS[f] ? FILTER_COLORS[f] : ''}>
              {f === 'Live' ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06FFA5] animate-pulse" />
                  Live
                </span>
              ) : f}
            </span>
            {/* Count pill */}
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-mono
              ${filter === f ? 'bg-[var(--violet-500)] text-white' : 'bg-[var(--bg-overlay)] text-[var(--text-muted)]'}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.length > 0 ? filtered.map((a, i) => (
            <motion.div
              key={a.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <AuctionCard {...a} isLive={a.status === 'Live'} />
            </motion.div>
          )) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-24 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-surface)]/30"
            >
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">No {filter.toLowerCase()} auctions</h3>
              <p className="text-[var(--text-muted)]">Check back soon or launch your own token.</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </PageTransition>
  )
}
