# 🔒 DarkBid: ZK Sealed-Bid Auctions on Solana

**Zero-knowledge sealed auctions on Solana. Fair launch, guaranteed by math — not promises.**

DarkBid is a decentralized auction platform that leverages Zero-Knowledge Proofs (ZKP) and the Solana blockchain to enable privacy-preserving, sealed-bid auctions. This ensures that bids remain secret until the reveal phase, preventing front-running and ensuring a truly fair price discovery mechanism.

---

## 🚀 Key Features

- **🔐 Sealed Bids:** Bids are cryptographically hashed and committed to the blockchain, remaining hidden from everyone (including the auctioneer) until the reveal phase.
- **🛡️ ZK Verification:** Leverages Circom and Groth16 proofs to verify that bids meet auction requirements without revealing the bid amount.
- **💼 Phantom Wallet Integration:** Seamless authentication and transaction signing using the Phantom wallet.
- **⚡ High Performance:** Built with a high-performance Rust backend using Axum and SQLx.
- **🎨 Premium UI:** Modern, responsive dashboard built with React, Tailwind CSS, and Framer Motion for smooth animations.

---

## 🏗️ Architecture

DarkBid consists of three primary layers:

1.  **Frontend (React/Vite):** The user interface where users connect their Phantom wallet, browse auctions, and participate in the commit/reveal flow.
2.  **Backend (Rust/Axum):** A robust API server handling authentication, auction state management, and ZK-proof verification.
3.  **Blockchain & Circuits:**
    *   **Solana (Anchor):** Smart contracts that anchor the commitments and settle the auctions on-chain.
    *   **ZK-Circuits (Circom):** Logic for generating and verifying cryptographic proofs that bids are valid.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS + Vanilla CSS
- **Animations:** Framer Motion
- **Web3:** `@solana/wallet-adapter` + `@solana/web3.js`
- **Icons:** Lucide React

### Backend
- **Language:** Rust
- **Web Framework:** Axum
- **Database:** PostgreSQL with SQLx
- **Cryptography:** Ed25519-dalek (for signature verification), SHA-256
- **ZK Integration:** snarkjs (via placeholder)

### Infrastructure
- **Development Environment:** Node.js + Cargo
- **Database Hosting:** Local PostgreSQL or Neon.tech

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/) (latest stable)
- [PostgreSQL](https://www.postgresql.org/)

### Local Setup

#### 1. Clone the repository
```bash
git clone https://github.com/Amaresh-Saravanan/darkbid.git
cd darkbid
```

#### 2. Frontend Configuration
```bash
# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8080" > .env

# Run development server
npm run dev
```

#### 3. Backend Configuration
```bash
cd dbit
# Create .env file with your database URL
# Example: DATABASE_URL=postgres://user:password@localhost:5432/darkbid
# JWT_SECRET=your_super_secret_key

# Run migrations
# (Ensure you have sqlx-cli installed: cargo install sqlx-cli)
sqlx database create
sqlx migrate run

# Start the server
cargo run
```

---

## 🔄 Auction Lifecycle

1.  **Creation:** An auction is launched with a title, reserve price, and specific durations for the *Commit* and *Reveal* phases.
2.  **Commit Phase:** Users place bids. The bid amount is combined with a secret salt and hashed locally. Only the hash is sent to the backend and anchored to the blockchain.
3.  **Reveal Phase:** After the commit duration ends, users must "reveal" their bids by providing the original amount and secret salt. The backend verifies the hash against the original commitment.
4.  **Settlement:** Once the reveal phase ends, the winner is determined (highest valid bid). Refunds are processed for losing bids, and the winner claims the prize.

---

## 🗺️ Roadmap

- [ ] **Full ZK Integration:** Complete the `snarkjs` integration for on-chain proof verification.
- [ ] **Mainnet Deployment:** Deploy Anchor programs to Solana Mainnet.
- [ ] **Audit:** Conduct security audits of ZK circuits and smart contracts.
- [ ] **Analytics Dashboard:** Real-time stats on auction performance and bid distributions.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
