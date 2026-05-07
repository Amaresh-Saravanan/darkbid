# 🔐 DarkBid Wallet Setup Guide

## What's Needed for Wallet Connection to Work

The DarkBid application requires the **Phantom Wallet** browser extension to connect Solana wallets.

### Current Status
✅ Frontend wallet detection: **Working**
✅ Error handling: **Improved** 
❌ Phantom extension: **Not installed on this device**

---

## 🚀 Installation Steps

### 1. **Install Phantom Wallet**

Go to: **https://phantom.app/**

Click "Download" and select your browser:
- Chrome / Brave / Edge: [Phantom for Chrome](https://chrome.google.com/webstore/detail/phantom/fjmooijahdhallfgpmme5/reviews)
- Firefox: [Phantom for Firefox](https://addons.mozilla.org/en-US/firefox/addon/phantom-app/)

### 2. **Create or Import a Wallet**

After installation, the Phantom extension will:
- Open a popup asking to create a new wallet or import existing one
- Generate a seed phrase (save this securely!)
- Create a Solana address on **devnet**

### 3. **Switch to Devnet**

By default, Phantom connects to mainnet. For testing DarkBid:

1. Click Phantom icon in browser
2. Click settings (gear icon)
3. Go to "Network"
4. Select **"Devnet"** (not mainnet)

### 4. **Get Test SOL**

DarkBid runs on Solana devnet. To test, you need devnet SOL:

```bash
# Option 1: Use Solana CLI
solana airdrop 2 -k ~/.config/solana/id.json --url devnet

# Option 2: Use web airdrop tool
# Visit: https://solfaucet.com/
# Paste your Phantom address
# Click "Request SOL"
```

---

## ✅ Testing Wallet Connection

1. Refresh DarkBid page: **http://localhost:5174**
2. Click **"Connect Wallet"** button (top right)
3. Phantom popup should appear
4. Click **"Approve"**
5. Your wallet address should show in navbar

---

## 🔧 What the Frontend Does

The improved wallet connection (`WalletButton.jsx`) now:

✅ Detects if Phantom is installed
✅ Shows helpful error message if not found
✅ Logs warnings to browser console
✅ Provides direct link to install Phantom
✅ Handles connection errors gracefully

---

## 🐛 Troubleshooting

### "Phantom wallet not detected"
- **Solution**: Install Phantom extension from https://phantom.app

### "Connection failed" / "User rejected"
- **Solution**: 
  - Ensure Phantom is set to **Devnet** (not mainnet)
  - Check browser console for errors (F12)
  - Try disconnecting and reconnecting

### "No SOL balance"
- **Solution**: Request test SOL from devnet faucet
  - https://solfaucet.com/
  - Paste your Phantom address (shown in popup)
  - Click "Request SOL"

### Browser shows "Your connection is private" warning
- This is HTTPS security - DarkBid runs on HTTP localhost during development
- **Solution**: In Phantom settings, enable "Allow Local Host"

---

## 📋 Backend Integration (For Authentication)

Once wallet is connected, the full flow is:

1. **Connect Wallet** (Phantom popup)
2. **Request Auth Nonce** → `GET /auth/nonce?wallet=<address>`
3. **Sign Nonce** with Phantom (user approves)
4. **Submit Signature** → `POST /login` with signature
5. **Receive JWT Token** (stored in localStorage)
6. **API Calls** include `Authorization: Bearer <token>` header

This is already implemented in the backend. Frontend just needs to wire it up in the login flow.

---

## 🎯 Next Steps

1. ✅ Install Phantom wallet extension
2. ✅ Switch to Devnet
3. ✅ Request test SOL
4. ✅ Refresh DarkBid and test connection
5. ⏳ Implement wallet → nonce → signature flow in frontend

