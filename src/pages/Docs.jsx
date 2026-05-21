import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import {
  LockKeyhole, Shield, Wallet, Clock, Key, Trophy, Cpu,
  BookOpen, Zap, Server, Globe, Menu, ChevronRight, Copy, Check
} from 'lucide-react'
import './Docs.css'

/* ── Sidebar sections ─────────────────────────────────────── */
const SECTIONS = [
  { group: 'Overview', items: [
    { id: 'intro', label: 'Introduction', icon: BookOpen },
    { id: 'how-it-works', label: 'How It Works', icon: Zap },
  ]},
  { group: 'User Guide', items: [
    { id: 'connect', label: 'Connect Wallet', icon: Wallet },
    { id: 'commit', label: 'Commit Phase', icon: LockKeyhole },
    { id: 'reveal', label: 'Reveal Phase', icon: Key },
    { id: 'winner', label: 'Winner & Refunds', icon: Trophy },
  ]},
  { group: 'Architecture', items: [
    { id: 'zk-proofs', label: 'Zero-Knowledge Proofs', icon: Shield },
    { id: 'escrow', label: 'Rust Escrow Contracts', icon: Server },
    { id: 'auth', label: 'Authentication', icon: Globe },
  ]},
  { group: 'Reference', items: [
    { id: 'api', label: 'API Reference', icon: Cpu },
  ]},
]

/* ── Copy button ──────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button className="docs-code__copy" onClick={handleCopy}>
      {copied ? <><Check size={10}/> Copied</> : <><Copy size={10}/> Copy</>}
    </button>
  )
}

/* ── Code block component ─────────────────────────────────── */
function CodeBlock({ lang, code }) {
  return (
    <div className="docs-code">
      <div className="docs-code__header">
        <span className="docs-code__lang">{lang}</span>
        <CopyBtn text={code} />
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}

/* ── Main Docs Page ───────────────────────────────────────── */
export default function Docs() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('intro')
  const contentRef = useRef(null)

  const scrollTo = (id) => {
    setActive(id)
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <PageTransition className="w-full">
      <div className="docs-layout">

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className={`docs-sidebar ${mobileOpen ? 'docs-sidebar--open' : ''}`}>
          <div className="docs-sidebar__title">📖 Documentation</div>
          {SECTIONS.map(group => (
            <div key={group.group} className="docs-sidebar__group">
              <div className="docs-sidebar__group-label">{group.group}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`docs-sidebar__link ${active === item.id ? 'docs-sidebar__link--active' : ''}`}
                >
                  <item.icon size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: '-2px' }} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* ── Mobile toggle ────────────────────────────────── */}
        <button className="docs-mobile-toggle" onClick={() => setMobileOpen(v => !v)}>
          <Menu size={20} />
        </button>

        {/* ── Content ──────────────────────────────────────── */}
        <div className="docs-content" ref={contentRef}>

          {/* Hero */}
          <motion.div className="docs-hero"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="docs-hero__badge">
              <LockKeyhole size={14} /> DarkBid Protocol
            </div>
            <h1>Technical Documentation</h1>
            <p>
              Complete guide to the privacy-preserving sealed-bid auction protocol
              built on Solana with Zero-Knowledge Proofs.
            </p>
          </motion.div>

          {/* ═══════ INTRODUCTION ═══════ */}
          <section id="intro" className="docs-section">
            <h2><BookOpen className="section-icon" /> Introduction &amp; Vision</h2>
            <p>
              <strong>DarkBid</strong> is a decentralized, privacy-first auction protocol deployed on Solana.
              Traditional on-chain auctions are fundamentally broken: every bid is publicly visible the
              moment it hits the mempool. Bots front-run honest bidders, whales intimidate smaller
              participants, and fairness is impossible.
            </p>
            <div className="docs-card docs-card--violet">
              <div className="docs-card__title">💡 Core Insight</div>
              <div className="docs-card__body">
                DarkBid uses a <strong>Commit → Reveal</strong> scheme secured by
                <strong> ZK-SNARKs (Groth16 on BN254)</strong>. Bids are cryptographically sealed during the
                commit phase, then verified during the reveal phase — ensuring no one (not even the
                auctioneer) can see bid amounts until the timer expires.
              </div>
            </div>
            <h3>Key Properties</h3>
            <ul>
              <li><strong>Bid Privacy:</strong> Bids are SHA-256 hashed with a secret nonce — invisible until the reveal phase.</li>
              <li><strong>Anti-Front-Running:</strong> No bot can read or outbid you because amounts are sealed on-chain.</li>
              <li><strong>Trustless Escrow:</strong> Funds are locked in Rust-based smart contracts — no centralized custodian.</li>
              <li><strong>Mathematical Fairness:</strong> Winner selection is deterministic: highest valid bid wins, with earliest-commit tiebreaker.</li>
              <li><strong>ZK Verification:</strong> Optional Groth16 proofs let bidders prove their bid meets the reserve price without revealing the exact amount.</li>
            </ul>
          </section>

          {/* ═══════ HOW IT WORKS ═══════ */}
          <section id="how-it-works" className="docs-section">
            <h2><Zap className="section-icon" /> How It Works</h2>
            <p>The DarkBid protocol operates in three distinct phases:</p>

            <div className="docs-diagram">
              <div className="docs-diagram__node docs-diagram__node--violet">🔒 Commit Phase</div>
              <span className="docs-diagram__arrow">→</span>
              <div className="docs-diagram__node docs-diagram__node--cyan">🔑 Reveal Phase</div>
              <span className="docs-diagram__arrow">→</span>
              <div className="docs-diagram__node docs-diagram__node--green">🏆 Settlement</div>
            </div>

            <div className="docs-card docs-card--green">
              <div className="docs-card__title">✅ Fairness Guarantee</div>
              <div className="docs-card__body">
                Every phase transition is time-locked on-chain. No single party — not even the auction
                creator — can peek at bids, alter the timer, or manipulate results.
              </div>
            </div>
          </section>

          {/* ═══════ CONNECT WALLET ═══════ */}
          <section id="connect" className="docs-section">
            <h2><Wallet className="section-icon" /> Step 1: Connect Wallet</h2>
            <p>
              DarkBid uses <strong>Phantom Wallet</strong> for authentication. The connection flow uses
              a cryptographic challenge-response protocol:
            </p>
            <div className="docs-steps">
              <div className="docs-step">
                <div className="docs-step__number">1</div>
                <div className="docs-step__content">
                  <h4>Request Nonce</h4>
                  <p>The frontend requests a random 32-byte challenge nonce from the server, bound to your wallet address. Nonces expire after 5 minutes.</p>
                </div>
              </div>
              <div className="docs-step">
                <div className="docs-step__number">2</div>
                <div className="docs-step__content">
                  <h4>Sign the Challenge</h4>
                  <p>Phantom prompts you to sign a human-readable message containing the nonce. This proves you own the private key for that wallet.</p>
                </div>
              </div>
              <div className="docs-step">
                <div className="docs-step__number">3</div>
                <div className="docs-step__content">
                  <h4>Receive JWT</h4>
                  <p>The server verifies the Ed25519 signature against your public key. If valid, it issues a signed JWT (valid for 24 hours) for all subsequent requests.</p>
                </div>
              </div>
            </div>
            <CodeBlock lang="javascript" code={`// Frontend auth flow
const { nonce } = await api('/auth/nonce?wallet=' + publicKey)
const message = "Sign this message to authenticate with DarkBid\\nNonce: " + nonce
const signature = await wallet.signMessage(new TextEncoder().encode(message))
const { token } = await api('/login', {
  method: 'POST',
  body: JSON.stringify({
    wallet_address: publicKey,
    nonce, signature: bs58.encode(signature)
  })
})`} />
          </section>

          {/* ═══════ COMMIT PHASE ═══════ */}
          <section id="commit" className="docs-section">
            <h2><LockKeyhole className="section-icon" /> Step 2: Commit Phase</h2>
            <p>
              During the commit phase, you submit a <strong>sealed bid</strong>. Your actual bid amount
              is never sent to the blockchain — only a hash of it.
            </p>
            <h3>How the Commitment is Created</h3>
            <CodeBlock lang="pseudocode" code={`commit_hash = SHA-256(bid_amount || secret_nonce || bidder_id)

// The hash is anchored on-chain via a Solana transaction.
// The backend verifies:
//   1. The Solana program was invoked in the transaction
//   2. Your wallet was a signer
//   3. The commit_hash appears in the program logs`} />
            <div className="docs-card docs-card--warning">
              <div className="docs-card__title">⚠️ Important</div>
              <div className="docs-card__body">
                Save your <strong>secret nonce</strong>! You will need it during the reveal phase to prove
                your bid. If you lose it, your bid cannot be revealed and your escrowed funds will be
                returned after the auction ends.
              </div>
            </div>
          </section>

          {/* ═══════ REVEAL PHASE ═══════ */}
          <section id="reveal" className="docs-section">
            <h2><Key className="section-icon" /> Step 3: Reveal Phase</h2>
            <p>
              Once the commit timer expires, the auction transitions to the <strong>Reveal Phase</strong>.
              You must now prove your bid by submitting the original amount + nonce.
            </p>
            <h3>Server-Side Verification</h3>
            <ol>
              <li><strong>Hash Preimage Check:</strong> The server recomputes <code>SHA-256(amount || nonce || bidder_id)</code> and compares it to your stored commit hash.</li>
              <li><strong>Reserve Price Check:</strong> The bid amount must be ≥ the auction's reserve price to be marked valid.</li>
              <li><strong>ZK Proof (Optional):</strong> Submit a Groth16 proof to cryptographically prove your bid meets the reserve without revealing the exact amount to other participants.</li>
              <li><strong>On-Chain Verification:</strong> A reveal transaction is submitted to Solana, verified by program ID and signer.</li>
            </ol>
          </section>

          {/* ═══════ WINNER ═══════ */}
          <section id="winner" className="docs-section">
            <h2><Trophy className="section-icon" /> Step 4: Winner &amp; Refunds</h2>
            <p>After all bids are revealed, the winner is determined by this algorithm:</p>
            <CodeBlock lang="rust" code={`// Winner selection (from auction.rs)
fn pick_winner(bids: &[Bid]) -> Option<Bid> {
    bids.iter()
        .filter(|b| b.is_valid && b.reveal_amount.is_some())
        .max_by(|a, b| {
            match a.reveal_amount.cmp(&b.reveal_amount) {
                Ordering::Equal => b.commit_at.cmp(&a.commit_at),  // earlier wins tie
                other => other,  // highest bid wins
            }
        })
}`} />
            <div className="docs-card docs-card--green">
              <div className="docs-card__title">🔄 Automatic Refunds</div>
              <div className="docs-card__body">
                All losing bidders receive an automatic refund of their escrowed funds. Invalid bids
                (below reserve price) and unrevealed bids are also refunded after auction settlement.
              </div>
            </div>
          </section>

          {/* ═══════ ZK PROOFS ═══════ */}
          <section id="zk-proofs" className="docs-section">
            <h2><Shield className="section-icon" /> Zero-Knowledge Proofs</h2>
            <p>
              DarkBid implements <strong>Groth16 ZK-SNARKs on the BN254 curve</strong> via a custom
              Circom circuit called <code>BidRangeProof</code>.
            </p>
            <h3>What the ZK Proof Proves</h3>
            <ul>
              <li>The bidder knows a <code>bid_amount</code> and <code>nonce</code> that hash to the on-chain <code>commit_hash</code>.</li>
              <li>The <code>bid_amount ≥ reserve_price</code> (range proof).</li>
              <li>The bidder has sufficient balance to cover the bid.</li>
            </ul>
            <h3>Proof Structure</h3>
            <CodeBlock lang="rust" code={`// ZkProof bundle (from types.rs)
struct ZkProof {
    proof_a: String,        // G1 affine point (33 bytes compressed)
    proof_b: String,        // G2 affine point (65 bytes compressed)  
    proof_c: String,        // G1 affine point (33 bytes compressed)
    public_inputs: Vec<String>,  // [reservePrice, commitHash] as hex
}`} />
            <h3>Verification Flow</h3>
            <div className="docs-diagram">
              <div className="docs-diagram__node docs-diagram__node--violet">Client: Generate Proof</div>
              <span className="docs-diagram__arrow">→</span>
              <div className="docs-diagram__node docs-diagram__node--cyan">Server: Validate Structure</div>
              <span className="docs-diagram__arrow">→</span>
              <div className="docs-diagram__node docs-diagram__node--green">Groth16::verify()</div>
            </div>
          </section>

          {/* ═══════ ESCROW ═══════ */}
          <section id="escrow" className="docs-section">
            <h2><Server className="section-icon" /> Rust Escrow Contracts</h2>
            <p>
              The DarkBid backend is written in <strong>Rust</strong> using <strong>Axum</strong> for
              high-performance async HTTP, and <strong>SQLx</strong> with PostgreSQL for data persistence.
            </p>
            <h3>Security Guarantees</h3>
            <ul>
              <li><strong>On-Chain Anchoring:</strong> Every commit and reveal is verified against a real Solana transaction — the server checks program ID, signer, and logs.</li>
              <li><strong>Transactional Integrity:</strong> All database operations (store commit, store reveal, pick winner) run inside SQL transactions with status checks to prevent race conditions.</li>
              <li><strong>Double-Bid Prevention:</strong> Unique constraints on <code>(auction_id, bidder_id)</code> prevent any user from submitting multiple bids.</li>
              <li><strong>Password Security:</strong> Argon2id hashing for optional password-based auth alongside wallet signatures.</li>
            </ul>
            <h3>Tech Stack</h3>
            <div className="docs-diagram">
              <div className="docs-diagram__node docs-diagram__node--violet">React + Vite</div>
              <span className="docs-diagram__arrow">→</span>
              <div className="docs-diagram__node docs-diagram__node--cyan">Axum (Rust)</div>
              <span className="docs-diagram__arrow">→</span>
              <div className="docs-diagram__node docs-diagram__node--green">PostgreSQL + Solana</div>
            </div>
          </section>

          {/* ═══════ AUTH ═══════ */}
          <section id="auth" className="docs-section">
            <h2><Globe className="section-icon" /> Authentication System</h2>
            <p>DarkBid implements a dual-mode authentication system:</p>
            <div className="docs-steps">
              <div className="docs-step">
                <div className="docs-step__number">A</div>
                <div className="docs-step__content">
                  <h4>Wallet Signature Login (Recommended)</h4>
                  <p>Cryptographic challenge-response using Ed25519 signatures from Phantom. Server verifies the signature matches the wallet's public key. Nonces are single-use and expire after 5 minutes.</p>
                </div>
              </div>
              <div className="docs-step">
                <div className="docs-step__number">B</div>
                <div className="docs-step__content">
                  <h4>Password Login (Fallback)</h4>
                  <p>Optional password auth with Argon2id hashing. Useful for testing and environments where wallet extensions are unavailable.</p>
                </div>
              </div>
            </div>
            <div className="docs-card docs-card--violet">
              <div className="docs-card__title">🛡️ Crash Recovery</div>
              <div className="docs-card__body">
                The frontend includes automatic retry logic and graceful fallback UI for when the Phantom
                extension becomes unresponsive. Connection timeouts are handled without crashing the app,
                and users receive clear instructions to reload the extension.
              </div>
            </div>
          </section>

          {/* ═══════ API REFERENCE ═══════ */}
          <section id="api" className="docs-section">
            <h2><Cpu className="section-icon" /> API Reference</h2>
            <p>All endpoints require <code>Content-Type: application/json</code>. Protected endpoints require a <code>Bearer</code> JWT token.</p>
            
            <h3>Authentication</h3>
            <table className="docs-table">
              <thead>
                <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="docs-method docs-method--get">GET</span></td>
                  <td><code>/auth/nonce?wallet=…</code></td>
                  <td>Request a login challenge nonce</td>
                </tr>
                <tr>
                  <td><span className="docs-method docs-method--post">POST</span></td>
                  <td><code>/login</code></td>
                  <td>Authenticate with wallet signature or password</td>
                </tr>
                <tr>
                  <td><span className="docs-method docs-method--post">POST</span></td>
                  <td><code>/register</code></td>
                  <td>Register a new user with wallet address</td>
                </tr>
              </tbody>
            </table>

            <h3>Auctions</h3>
            <table className="docs-table">
              <thead>
                <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="docs-method docs-method--get">GET</span></td>
                  <td><code>/auctions</code></td>
                  <td>List all auctions</td>
                </tr>
                <tr>
                  <td><span className="docs-method docs-method--get">GET</span></td>
                  <td><code>/auction/:id</code></td>
                  <td>Get auction details</td>
                </tr>
                <tr>
                  <td><span className="docs-method docs-method--post">POST</span></td>
                  <td><code>/auction/create</code></td>
                  <td>Create a new auction 🔒</td>
                </tr>
                <tr>
                  <td><span className="docs-method docs-method--get">GET</span></td>
                  <td><code>/auction/:id/result</code></td>
                  <td>Get auction result &amp; winner</td>
                </tr>
              </tbody>
            </table>

            <h3>Bids</h3>
            <table className="docs-table">
              <thead>
                <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="docs-method docs-method--post">POST</span></td>
                  <td><code>/bid/commit</code></td>
                  <td>Submit a sealed bid commitment 🔒</td>
                </tr>
                <tr>
                  <td><span className="docs-method docs-method--post">POST</span></td>
                  <td><code>/bid/reveal</code></td>
                  <td>Reveal a previously committed bid 🔒</td>
                </tr>
              </tbody>
            </table>

            <div className="docs-card">
              <div className="docs-card__title">🔒 = Requires JWT Authorization header</div>
              <div className="docs-card__body">
                Pass the token as: <code>Authorization: Bearer &lt;jwt_token&gt;</code>
              </div>
            </div>
          </section>

        </div>
      </div>
    </PageTransition>
  )
}
