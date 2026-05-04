# DarkBid: Complete Dev 1, 2, 3, 4 Integration Overview

## 🎯 The Big Picture

```
User Places Sealed Bid (Commit Phase)
════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────┐
│ USER (Browser)                          │
│  Wallet: Connected with Phantom         │
│  Bid: 100 SOL (SECRET)                  │
│  Reserve: 50 SOL (PUBLIC)               │
└──────────────┬──────────────────────────┘
               │
               ↓ (1) User inputs bid amount
┌──────────────────────────────────────────────────────────────────┐
│ DEV 4: Frontend (React)                                          │
│  BidForm.jsx calls usePlaceBid()                                 │
│                                                                  │
│  const { placeBid } = usePlaceBid()                              │
│  await placeBid(auctionId, 100, 50)  ← bid amount, reserve     │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ↓ (2) Generate ZK proof
┌──────────────────────────────────────────────────────────────────┐
│ DEV 3: ZK Proof Generation (Browser)                             │
│  proof-generator.js (Takes < 3 seconds)                          │
│                                                                  │
│  Generates proof proving:                                        │
│  ✓ bidAmount (100) >= reservePrice (50)                          │
│  ✓ hash(100 + secret) == commitmentHash                          │
│                                                                  │
│  Returns: { proof, publicSignals }                               │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ↓ (3) Send proof to smart contract
┌──────────────────────────────────────────────────────────────────┐
│ DEV 2: Smart Contract (Solana/Anchor)                            │
│  commitBid(commitmentHash, proof, publicSignals)                 │
│                                                                  │
│  ✓ Verify Groth16 proof from DEV 3                               │
│  ✓ Check commitment matches proof                                │
│  ✓ Lock SOL in escrow                                            │
│  ✓ Store bid commitment                                          │
│  ✓ Return tx hash to frontend                                    │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ↓ (4) Log to backend
┌──────────────────────────────────────────────────────────────────┐
│ DEV 1: Backend (Rust/Actix)                                      │
│  POST /bid/commit                                                │
│                                                                  │
│  Receives:                                                       │
│    - auctionId                                                   │
│    - bidderPublicKey                                             │
│    - commitmentHash                                              │
│    - txHash (from Solana)                                        │
│                                                                  │
│  Stores for audit trail (NOT the actual bid amount!)            │
└──────────────────────────────────────────────────────────────────┘


User Reveals Bid (Reveal Phase)
════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────┐
│ USER (Browser)                          │
│  During reveal window (after bidding)   │
│  Clicks "Reveal Your Bid"               │
└──────────────┬──────────────────────────┘
               │
               ↓ (1) Click reveal button
┌──────────────────────────────────────────────────────────────────┐
│ DEV 4: Frontend (React)                                          │
│  RevealPanel.jsx calls useRevealBid()                            │
│                                                                  │
│  const { revealBid } = useRevealBid()                            │
│  await revealBid(auctionId)  ← retrieves nonce from localStorage│
└──────────────┬───────────────────────────────────────────────────┘
               │
               ↓ (2) Get saved nonce, send plain bid
┌──────────────────────────────────────────────────────────────────┐
│ DEV 2: Smart Contract (Solana/Anchor)                            │
│  revealBid(bidAmount, bidSecret)  ← PLAIN VALUES, NO PROOF!     │
│                                                                  │
│  ✓ Re-compute hash(bidAmount, bidSecret)                        │
│  ✓ Verify it matches stored commitmentHash                      │
│  ✓ Store revealed amount for winner selection                   │
│  ✓ Return tx hash                                                │
│                                                                  │
│  Note: NO ZK proof verification here!                            │
│        Proof was already verified during commit phase            │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ↓ (3) Log to backend
┌──────────────────────────────────────────────────────────────────┐
│ DEV 1: Backend (Rust/Actix)                                      │
│  POST /bid/reveal                                                │
│                                                                  │
│  Receives:                                                       │
│    - auctionId                                                   │
│    - bidderPublicKey                                             │
│    - bidAmount (NOW REVEALED!)                                   │
│    - bidNonce                                                    │
│    - txHash (from Solana)                                        │
│                                                                  │
│  Stores for audit trail                                         │
└──────────────────────────────────────────────────────────────────┘


Contract Finalizes & Selects Winner
════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────┐
│ DEV 2: Smart Contract (Solana/Anchor)                            │
│  finalize_auction()                                              │
│                                                                  │
│  ✓ All bids already verified (commit + reveal phases)           │
│  ✓ Find highest bid amount from revealed amounts                │
│  ✓ Transfer tokens to winner                                     │
│  ✓ Refund losers                                                 │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ↓ (4) Log winner to backend
┌──────────────────────────────────────────────────────────────────┐
│ DEV 1: Backend (Rust/Actix)                                      │
│  GET /auction/:id/result                                         │
│                                                                  │
│  Returns:                                                        │
│    - winner address                                              │
│    - winning bid amount                                          │
│    - all other bids (for history)                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Responsibility Matrix

| Function | Dev 1 | Dev 2 | Dev 3 | Dev 4 |
|----------|-------|-------|-------|-------|
| **Commit Phase** |
| User inputs bid | - | - | - | ✓ |
| Generate ZK proof | - | - | ✓ | - |
| Verify proof on-chain | - | ✓ | - | - |
| Lock escrow | - | ✓ | - | - |
| Log to backend | ✓ | - | - | - |
| **Reveal Phase** |
| Show reveal UI | - | - | - | ✓ |
| Send plain bid to contract | - | ✓ | - | - |
| Verify commitment hash | - | ✓ | - | - |
| Log to backend | ✓ | - | - | - |
| **Finalize Phase** |
| Select winner | - | ✓ | - | - |
| Distribute funds | - | ✓ | - | - |
| Get result from contract | ✓ | - | - | ✓ |
| Display winner | - | - | - | ✓ |

---

## 🔗 Data Flow

### Commit Phase Data
```
Frontend → Contract:
{
  commitmentHash: [u8; 32],        ← hash(bid + secret) [from DEV 3]
  proof: Groth16Proof,             ← Generated by DEV 3
  publicSignals: [Fr; 2],          ← [reservePrice, commitmentHash]
}

Contract → Backend:
{
  auctionId: string,
  bidderPublicKey: PublicKey,
  commitmentHash: [u8; 32],        ← Same as above
  txHash: string,                  ← Solana transaction
  timestamp: datetime,
}
```

### Reveal Phase Data
```
Frontend: Retrieves from localStorage
{
  bidAmount: u64,                  ← Original bid amount
  bidSecret: u64,                  ← Original random nonce
  commitmentHash: [u8; 32],        ← Should match stored
}

Frontend → Contract:
{
  bidAmount: u64,                  ← PLAIN, no longer secret
  bidSecret: u64,                  ← PLAIN, no longer secret
}

Contract → Backend:
{
  auctionId: string,
  bidderPublicKey: PublicKey,
  bidAmount: u64,                  ← NOW REVEALED
  bidNonce: u64,                   ← NOW REVEALED
  commitmentHash: [u8; 32],        ← For verification
  txHash: string,                  ← Solana transaction
  timestamp: datetime,
}
```

---

## 📝 API Endpoints (Dev 1)

### Authentication
```
POST /register
{
  username: string,
  password: string,
}
→ { userId, token, publicKey }

POST /login
{
  username: string,
  password: string,
}
→ { userId, token, publicKey }
```

### Auction Management
```
POST /auction/create
{
  title: string,
  description: string,
  reservePrice: u64,
  duration: u64,
}
→ { auctionId, createdAt }

GET /auctions
→ [{ auctionId, title, status, timeLeft }]

GET /auction/:id
→ { auctionId, title, status, bidsCount, winner, result }
```

### Bid Tracking
```
POST /bid/commit
{
  auctionId: string,
  bidderPublicKey: string,       ← From Phantom wallet
  commitmentHash: string,        ← From DEV 3 proof
  txHash: string,                ← From DEV 2 contract
}
→ { success: true }

POST /bid/reveal
{
  auctionId: string,
  bidderPublicKey: string,
  bidAmount: u64,                ← NOW REVEALED
  bidNonce: u64,                 ← NOW REVEALED
  commitmentHash: string,        ← For verification
  txHash: string,
}
→ { success: true }

GET /auction/:id/result
→ {
  winner: PublicKey,
  winningBid: u64,
  totalBids: u64,
  revealedBids: u64,
  auctionStatus: "ENDED"
}
```

---

## 🛠️ Tech Stack by Dev

### Dev 1: Backend Engineer
- **Language**: Rust (Actix-web)
- **Database**: PostgreSQL (users, auctions, bids tables)
- **Responsibilities**: APIs, auth, audit trail, winner result
- **Files**: 
  - `src/api/auth.rs` - /register, /login
  - `src/api/auction.rs` - /auction/* endpoints
  - `src/api/bid.rs` - /bid/commit, /bid/reveal
  - `src/db/schema.rs` - Database schema

### Dev 2: Smart Contract Engineer
- **Language**: Rust (Anchor/Solana)
- **Chain**: Solana Devnet
- **Responsibilities**: commitBid, revealBid, finalize_auction, escrow
- **Files**:
  - `programs/darkbid/src/instructions/commit_bid.rs` - Verify ZK proof
  - `programs/darkbid/src/instructions/reveal_bid.rs` - Verify hash
  - `programs/darkbid/src/instructions/finalize.rs` - Winner selection
  - `programs/darkbid/src/state/auction.rs` - Auction account
  - Integrate: `circuits/bid_range/BidRangeVerifier.sol` (from DEV 3)

### Dev 3: ZK Engineer
- **Language**: Circom + JavaScript
- **Focus**: Proof generation & verification
- **Responsibilities**: Circuit, proof gen, verifier contract
- **Files**:
  - `circuits/bid_range/bid_range.circom` - Circuit definition
  - `src/lib/proof-generator.js` - Browser proof generation
  - `circuits/bid_range/BidRangeVerifier.sol` - Auto-generated verifier
  - **DONE** ✓

### Dev 4: Integration Engineer
- **Language**: React + TypeScript
- **Responsibilities**: UI, wallet connection, API calls, hook integration
- **Files**:
  - `src/components/auction/BidForm.jsx` - Uses usePlaceBid()
  - `src/components/auction/RevealPanel.jsx` - Uses useRevealBid()
  - `src/hooks/useAuction.ts` - Read auction state from API
  - `src/hooks/usePlaceBid.js` - ← Updated by DEV 3
  - `src/hooks/useRevealBid.js` - ← Updated by DEV 3
  - `src/lib/proof-generator.js` - ← From DEV 3
  - `src/lib/api.js` - Fetch calls to DEV 1's API

---

## ✅ Completion Checklist

### Dev 1: Backend Engineer
- [ ] Implement POST /register (create user, generate wallet)
- [ ] Implement POST /login (auth, return token)
- [ ] Implement POST /auction/create (store auction, init state: ACTIVE)
- [ ] Implement GET /auctions (list all with status)
- [ ] Implement GET /auction/:id (details + bid count)
- [ ] Implement POST /bid/commit (log commitment only)
- [ ] Implement POST /bid/reveal (log revealed bid)
- [ ] Implement GET /auction/:id/result (query winner from contract)
- [ ] Database migrations: users, auctions, bids tables
- [ ] Timer logic: transition ACTIVE → REVEAL → ENDED

### Dev 2: Smart Contract Engineer
- [ ] Copy BidRangeVerifier.sol from circuits/ folder
- [ ] Integrate verifier into contract (CPI or inline)
- [ ] Implement initialize_auction() instruction
- [ ] Implement commit_bid(commitHash, proof, signals) instruction
  - ✓ Verify Groth16 proof
  - ✓ Check commitment matches
  - ✓ Lock escrow
- [ ] Implement reveal_bid(amount, secret) instruction
  - ✓ Re-compute and verify hash commitment
  - ✓ Store revealed amount
- [ ] Implement finalize_auction() instruction
  - ✓ Find max bid
  - ✓ Distribute funds
- [ ] Implement refund() instruction
- [ ] Test with sample proofs from test-proving.js
- [ ] Deploy to Devnet

### Dev 3: ZK Engineer
- [x] Create bid_range.circom circuit
- [x] Generate proving/verification keys
- [x] Create proof-generator.js browser API
- [x] Generate BidRangeVerifier.sol
- [x] Update usePlaceBid.js hook
- [x] Update useRevealBid.js hook
- [x] Create integration documentation
- [x] Test proof generation < 3 seconds
- **DONE** ✓

### Dev 4: Integration Engineer
- [ ] Connect BidForm to usePlaceBid() hook
- [ ] Show proofLoadingPercent progress bar
- [ ] Connect RevealPanel to useRevealBid() hook
- [ ] Verify proper error handling
- [ ] Test with 3 different Phantom wallets
  - [ ] Wallet A: Place bid + reveal
  - [ ] Wallet B: Place bid + reveal
  - [ ] Wallet C: Place bid + reveal
- [ ] Verify all transactions visible on Solana Explorer
- [ ] Record demo video

---

## 🚀 Timeline

### Week 1 (Apr 25-29)
```
Dev 3: ✅ ZK proof system (DONE)
Dev 2: Build smart contract, integrate BidRangeVerifier.sol
Dev 1: Build backend API, auction logic
```

### Week 2 (Apr 30 - May 4)
```
Dev 2: Deploy to Devnet
Dev 1: Test API endpoints
Dev 4: Build UI, integrate hooks
```

### Week 3 (May 5-9)
```
All: E2E testing with 3 wallets
All: Fix bugs from testing
All: Record demo video
Submit!
```

---

## 🎓 Key Insights

### Why ZK Proof Only in Commit Phase?
- **Commit**: User proves bid >= reserve WITHOUT revealing amount (ZK proof)
- **Reveal**: User reveals actual bid, contract verifies matches commitment
- **Finalize**: Contract just picks max, no crypto needed

### Why No Proof in Reveal?
- Already proven during commit: `bidAmount >= reservePrice`
- Only need to verify: `hash(amount, nonce) == commitment`
- Cheaper on-chain (just hash, no Groth16)

### Why Backend Also Logs?
- Audit trail: Cryptocurrency is first source of truth
- Backend second source of truth: Complements, doesn't replace
- User can always verify on-chain

### Security Model
1. **User inputs bid** → Phantom signs (keys safe)
2. **ZK proof** → Proves validity without revealing (DDev 3)
3. **Smart contract** → Verifies proof before accepting (Dev 2)
4. **Backend logs** → Tracks for audit (Dev 1)
5. **Reveal phase** → Contract verifies commitment (Dev 2)
6. **Winner selected** → On-chain, transparent (Dev 2)

---

## 📞 Communication Quick Links

**Dev 2 needs from Dev 3:**
- BidRangeVerifier.sol ✓ 
- DEV2_ZK_INTEGRATION.md ✓
- Test proof examples ✓

**Dev 4 needs from Dev 3:**
- proof-generator.js ✓
- usePlaceBid hook ✓
- useRevealBid hook ✓
- DEV_INTEGRATION_GUIDE.md ✓

**Dev 4 needs from Dev 2:**
- Program IDL
- Expected account structure
- Function signatures

**Dev 4 needs from Dev 1:**
- API documentation
- Error codes
- Response formats

---

## ✨ Final Notes

- **Dev 3's work is complete!** ✓
- **Dev 2 can start integration now** - Has all files needed
- **Dev 1 can start APIs** - Doesn't depend on Dev 3
- **Dev 4 waits for Dev 2** - Needs contract functions

Good luck! 🚀
