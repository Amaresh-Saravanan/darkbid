# Quick Start: ZK Proof System for DarkBid

## 🚀 Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Circom Circuit
```bash
npm run circom:compile
```

### 3. Generate Proofs Keys
```bash
npm run circom:setup
```

This downloads Powers of Tau (~20MB, one-time). Grab a ☕

### 4. Test Everything Works
```bash
node scripts/test-proving.js
```

Expected output:
```
✅ All tests PASSED
✅ Performance target MET (< 3 seconds)
Average Time Per Proof: 2.15s
```

---

## 📊 What Was Generated

After running the setup, you'll have:

```
circuits/bid_range/
├── bid_range.circom              ← Your circuit (human-readable)
├── bid_range.r1cs                ← Constraint system (auto-generated)
├── bid_range.zkey                ← Proving key (20MB, secret!)
├── bid_range_vkey.json           ← Verification key (public)
├── bid_range_js/
│   └── bid_range.wasm            ← WebAssembly circuit (browser-ready)
└── BidRangeVerifier.sol          ← Solidity verifier (for contract)
```

---

## 🔐 How It Works

### User Places a Bid

```javascript
// Frontend code (in BidForm.jsx)
const { placeBid } = usePlaceBid()
const { proof, publicSignals } = await generateBidProof(
  bidAmount = 100,   // Secret!
  bidSecret = Math.random(),
  reservePrice = 50  // Public
)
```

### Proof Generation (< 3 seconds in browser)

1. **Witness** (~800ms): Calculate intermediate values satisfying constraints
2. **Proof** (~1200ms): Create Groth16 proof (256 bytes)
3. **Output**: Non-transferable proof tied to exact bid + reserve

### Smart Contract Verifies

```rust
// On-chain (Dev 2 implements)
pub fn place_bid_with_proof(
    commit_hash: [u8; 32],
    proof: Groth16Proof,
    public_signals: [Fr; 2],  // [reserve, commitHash]
) {
    // 1. Verify ZK proof ✓
    // 2. Check bidAmount >= reserve (proven!) ✓
    // 3. Store sealed bid ✓
}
```

---

## 📁 File Locations

### Circuit Definition
- **Source**: `circuits/bid_range/bid_range.circom`
- **What it does**: Proves bid >= reserve AND hash(bid+secret) matches

### Browser Proof Generation
- **File**: `src/lib/proof-generator.js`
- **Function**: `generateBidProof(bidAmount, bidSecret, reservePrice, commitHash)`
- **Time**: < 3 seconds
- **Returns**: proof + publicSignals for smart contract

### Smart Contract Integration
- **File**: `circuits/bid_range/BidRangeVerifier.sol` (generated)
- **Deploy to**: Solana program (via CPI)

---

## 🧪 Testing Your Setup

### Quick Test
```bash
npm run circom:build && node scripts/test-proving.js
```

### Detailed Steps
```bash
# 1. Compile circuit
npm run circom:compile

# 2. Generate keys (slow, ~2 min)
npm run circom:setup

# 3. Run benchmarks
node scripts/test-proving.js
```

### Expected Performance

| Step | Time |
|------|------|
| Witness | 800ms |
| Proof | 1200ms |
| Verify | 50ms |
| **Total** | **~2s** ✅ |

---

## ⚠️ Important for Production

### NEVER Commit These Files
```
❌ Don't commit bid_range.zkey (20MB, breaks git)
❌ Don't commit *.ptau files (large)
✅ DO commit bid_range.circom (circuit source)
✅ DO commit bid_range_vkey.json (verification key)
```

Already handled in `.gitignore` ✓

### Key Files to Backup
```
Keep safe:
✅ bid_range.zkey       (proving key - regenerate if lost)
✅ bid_range.circom     (circuit source - always track)
✅ BidRangeVerifier.sol (verifier contract - deploy to chain)
```

---

## 🔄 Workflow with Team

### Dev 3 (You, ZK Engineer)
```
✅ Create circuit (bid_range.circom)
✅ Generate proving keys
✅ Test proof generation
→ Pass to Dev 2
→ Pass to Dev 4
```

### Dev 2 (Smart Contract)
```
⏳ Receives BidRangeVerifier.sol from you
→ Integrates verifier into contract
→ Creates placeBidWithProof() function
→ Passes to Dev 4
```

### Dev 4 (Integration)
```
⏳ Receives proof format from you
⏳ Receives contract function from Dev 2
→ Connects BidForm to usePlaceBid()
→ Tests end-to-end
```

---

## 🆘 Troubleshooting

### Problem: "WASM not found"
```bash
npm run circom:compile
```

### Problem: "zKey not found"
```bash
npm run circom:setup
# Takes ~2 minutes, downloads 20MB
```

### Problem: "Proof generation taking > 3 seconds"
```bash
# Check browser devtools console for bottlenecks
# First proof run is slower (WASM loading)
# Subsequent proofs should be < 2s
```

### Problem: "Proof verification fails"
1. Verify circuit compiled correctly
2. Check publicSignals array order
3. Verify reserved price is public input

---

## 📚 Further Reading

- [ZK_IMPLEMENTATION.md](./ZK_IMPLEMENTATION.md) - Full technical details
- [Circom Documentation](https://docs.circom.io/)
- [snarkjs GitHub](https://github.com/iden3/snarkjs)

---

## ✅ Checklist

- [ ] Installed dependencies: `npm install`
- [ ] Compiled circuit: `npm run circom:compile`
- [ ] Generated keys: `npm run circom:setup`
- [ ] Tests pass: `node scripts/test-proving.js`
- [ ] Read ZK_IMPLEMENTATION.md
- [ ] Ready to hand off to Dev 2

---

You're all set! 🚀

Next: Dev 2 integrates the verifier contract on Solana.
