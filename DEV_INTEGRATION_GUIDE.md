# Dev 3 ↔ Dev 2 ↔ Dev 4 Integration Guide

## 🔄 Complete Flow: Bid Placement & Reveal

### Phase 1: Bidding (Dev 3 ZK Proof)

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Dev 4)                                            │
│  BidForm.jsx → usePlaceBid() hook                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ DEV 3: ZK PROOF GENERATION (proof-generator.js)             │
│                                                             │
│ generateBidProof({                                          │
│   bidAmount: 100,           ← SECRET (user's actual bid)    │
│   bidSecret: random(),      ← SECRET (random nonce)         │
│   reservePrice: 50,         ← PUBLIC                        │
│   commitHash: hash(...)     ← PUBLIC                        │
│ })                                                           │
│                                                             │
│ PROVES:                                                     │
│   ✓ bidAmount >= reservePrice                              │
│   ✓ hash(bidAmount + bidSecret) == commitHash              │
│                                                             │
│ RETURNS:                                                    │
│   {                                                         │
│     proof: Groth16Proof,                                    │
│     publicSignals: [reservePrice, commitHash]              │
│   }                                                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ DEV 2: SMART CONTRACT (Solana/Anchor)                       │
│                                                             │
│ pub async fn commit_bid(                                    │
│     ctx: Context<CommitBid>,                                │
│     commit_hash: [u8; 32],    ← Must match proof signal    │
│     proof: Groth16Proof,       ← Verified on-chain ✓       │
│     public_signals: [Fr; 2],   ← [reserve, commitHash]     │
│ ) {                                                         │
│     // Verify ZK proof                                      │
│     verify_groth16_proof(&proof, &public_signals)?;        │
│                                                             │
│     // Check commitment hash                               │
│     assert!(public_signals[1] == commit_hash);             │
│                                                             │
│     // Store encrypted bid hash in auction account         │
│     auction.bids[bidder] = commit_hash;                    │
│                                                             │
│     // Lock SOL in escrow                                   │
│     escrow.lock_funds()?;                                   │
│ }                                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ DEV 1: BACKEND (Rust/Actix)                                 │
│                                                             │
│ POST /bid/commit {                                          │
│   auction_id: "...",                                        │
│   bidder: "...",                                            │
│   commitment: hash(...),     ← Same as on-chain             │
│   tx_hash: "..."             ← Solana tx hash              │
│ }                                                           │
│                                                             │
│ Stores bid in database for tracking/history                │
└─────────────────────────────────────────────────────────────┘


Phase 2: Reveal (No ZK Proof - Just Plain Bid + Nonce)
═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Dev 4)                                            │
│  RevealPanel.jsx → useRevealBid() hook                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓ RETRIEVE from localStorage:
                   │ { bidAmount: 100, bidSecret: random() }
                   │
┌─────────────────────────────────────────────────────────────┐
│ DEV 2: SMART CONTRACT (Solana/Anchor)                       │
│                                                             │
│ pub async fn reveal_bid(                                    │
│     ctx: Context<RevealBid>,                                │
│     bid_amount: u64,         ← PLAIN, no proof              │
│     bid_secret: u64,         ← PLAIN, no proof              │
│ ) {                                                         │
│     // Recompute hash from revealed values                  │
│     computed_hash = hash(bid_amount, bid_secret);          │
│                                                             │
│     // Verify matches stored commitment                    │
│     assert!(computed_hash == auction.bids[bidder]);        │
│                                                             │
│     // ZK proof verification NOT NEEDED here!              │
│     // (Already done during commit phase) ✓                │
│                                                             │
│     // Check amount >= reserve (double-check)              │
│     assert!(bid_amount >= auction.reserve);                │
│                                                             │
│     // Store for winner selection                          │
│     auction.revealed_bids[bidder] = bid_amount;            │
│ }                                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ DEV 1: BACKEND (Rust/Actix)                                 │
│                                                             │
│ POST /bid/reveal {                                          │
│   auction_id: "...",                                        │
│   bidder: "...",                                            │
│   bid_amount: 100,           ← PLAINTEXT during reveal      │
│   bid_nonce: random(),       ← PLAINTEXT during reveal      │
│   tx_hash: "..."                                            │
│ }                                                           │
│                                                             │
│ Stores as audit trail                                       │
└─────────────────────────────────────────────────────────────┘


Phase 3: Finalize (Just Math, No Crypto)
════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ DEV 2: SMART CONTRACT (Solana/Anchor)                       │
│                                                             │
│ pub async fn finalize_auction(                              │
│     ctx: Context<Finalize>,                                 │
│ ) {                                                         │
│     // All bids already verified during reveal              │
│     // Just find max and distribute                         │
│                                                             │
│     let winner = find_max_bid();                            │
│     let losers = all_other_bidders;                         │
│                                                             │
│     transfer_to_winner(winner_amount);                      │
│     refund_losers(losers);                                  │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Dev 3 Responsibilities (ZK Proof Only)

### ✅ REQUIRED
- Generate ZK proof proving: `bidAmount >= reservePrice && hash(bid+secret) == commitHash`
- Proof generation < 3s in browser ✓
- Circuit: `bid_range.circom` ✓
- API: `generateBidProof()` in `proof-generator.js` ✓

### ❌ NOT Dev 3's Job
- ~~Create usePlaceBid hook~~ (Dev 4 does this)
- ~~Verify proofs on-chain~~ (Dev 2 does this)
- ~~Store bids~~ (Dev 1 does this)
- ~~Reveal phase logic~~ (Dev 2 does this)

---

## 📝 Contract Integration Points

### For Dev 2: Expected Proof Format

```rust
// What Dev 2 receives from frontend/Dev 4
pub struct ProofInput {
    pub proof: Groth16Proof,              // Vec<String>
    pub public_signals: [Fr; 2],          // [reservePrice, commitHash]
    pub commitment_hash: [u8; 32],        // Also included as separate param
}

// Dev 2 must implement
pub fn verify_groth16_proof(
    proof: &Groth16Proof,
    public_signals: &[Fr; 2],  // [reservePrice, commitHash]
) -> Result<()> {
    // Use BidRangeVerifier.sol (generated by Dev 3)
    // Verify proof matches these exact public signals
}
```

### For Dev 4: Expected Hook Signature

```typescript
// Dev 4 should call this during bid placement
const { proof, publicSignals } = await generateBidProof({
    bidAmount: 100,
    bidSecret: Math.random(),
    reservePrice: 50,
    commitHash: await computeBidHash(100, bidSecret)
});

// Then pass to contract:
await program.methods.commitBid(
    commitHash,
    proof,
    publicSignals
).accounts({
    auction: auctionAddress,
    bidder: walletAddress,
}).rpc();
```

---

## 🔑 Key Assumptions for Dev 3 Work

1. **Circuit assumes**:
   - Reserve price is known and public
   - Bid hash uses Poseidon (ZK-friendly)
   - Proof system is Groth16

2. **Integration assumes**:
   - Proof verification happens in `commit_bid()` ONLY
   - Reveal phase does NOT need ZK proof
   - Frontend stores nonce in localStorage between phases

3. **Security boundary**:
   - ZK proof proves correctness of bid validity
   - Smart contract ensures proof is verified before accepting bid
   - Backend tracks for audit trail

---

## ✅ Dev 3 Verification Checklist

Based on Dev 1, 2, 4 requirements:

- [x] Proof proves: bidAmount >= reservePrice
- [x] Proof proves: hash(bid + secret) == commitHash
- [x] Proof generation < 3 seconds
- [x] Groth16 proof format (for on-chain verification)
- [x] Browser-native (WASM)
- [x] Public signals in correct order: [reservePrice, commitHash]
- [x] API callable from frontend hooks
- [x] Integration documentation provided

---

## 📂 File Responsibility Matrix

| File | Dev 1 | Dev 2 | Dev 3 | Dev 4 |
|------|-------|-------|-------|-------|
| `bid_range.circom` | - | - | ✓ | - |
| `proof-generator.js` | - | - | ✓ | uses |
| `usePlaceBid.js` | - | - | owns proof gen | ✓ integrates |
| `useDarkBidProgram.js` | - | ✓ IDL | - | ✓ wires |
| Smart contract ProgramID | - | ✓ | - | ✓ |
| BidRangeVerifier.sol | - | ✓ integrates | ✓ generates | - |
| API endpoints | ✓ | - | - | ✓ uses |
| Wallet signing | - | - | - | ✓ |

---

## 🚀 Handoff Checklist

**Dev 3 → Dev 2:**
- [ ] `BidRangeVerifier.sol` - contract verifier
- [ ] `ZK_IMPLEMENTATION.md` - technical docs
- [ ] Proof format specification

**Dev 3 → Dev 4:**
- [ ] `proof-generator.js` - API spec
- [ ] `proof-generator.js` - actual implementation
- [ ] Example usage in comments

**Dev 3 → Dev 1:**
- [ ] Nothing (ZK is on-chain)

---

## 🎯 Summary

**Dev 3 does**: Generate ZK proofs in browser proving bid validity  
**Dev 2 uses it**: To verify commitment during bid placement on-chain  
**Dev 4 uses it**: To call generateBidProof before submitting to contract  
**Dev 1 uses results**: Tracks bid commitments for audit trail  

All three phases (commit, reveal, finalize) work together, but **only commit phase uses ZK proof**.

