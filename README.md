# DarkBid

DarkBid is a sealed-bid auction app that combines a React frontend, a Rust backend API, an Anchor Solana program, and ZK circuits for bid proofs.

## What is in this repo

- Frontend (Vite + React): `src/`
- Backend API (Rust): `dbit/`
- Anchor program (Solana on-chain): `anchor-prg/`
- ZK circuits: `circuits/`
- Docs and integration notes: repo root

## Quick start (frontend)

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Anchor program overview

The on-chain logic lives in `anchor-prg/programs/darkbid/` and exposes the core auction flow:

- `initialize_auction`
- `commit_bid`
- `reveal_bid`
- `finalize_auction`
- `refund`

Localnet config is in `anchor-prg/Anchor.toml`.

## Frontend structure

```
src/
	components/    UI building blocks
	hooks/         Solana and app hooks
	lib/           IDL, helpers, constants
	pages/         Route-level screens
	styles/        Global styles and tokens
```

## Useful docs

- `DEVELOPER_GUIDE.md`
- `DOCUMENTATION_INDEX.md`
- `DEV_INTEGRATION_GUIDE.md`
