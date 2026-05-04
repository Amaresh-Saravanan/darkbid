# dbit backend

Authoritative auction backend for DarkBid using Axum + PostgreSQL.
This service verifies Solana transactions before accepting commit or reveal.

## Setup
1) Copy .env.example to .env and update values.
2) Create the database and run migrations in dbit/migrations.
3) Run: cargo run

## Endpoints
- POST /register
- POST /login
- POST /auction/create
- GET /auctions
- GET /auction/:id
- POST /bid/commit
- POST /bid/reveal
- GET /auction/:id/result

## Notes
- Backend is the source of truth for auction status.
- Winner is calculated after reveal ends using deterministic tie-breaks.
