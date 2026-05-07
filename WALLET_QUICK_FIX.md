# 🚀 Quick Fix: Wallet Not Connecting on Edge

## Symptoms
- ✅ Phantom detected
- ✅ Modal opens
- ✅ Shows wallet address
- ❌ Clicking "Approve" doesn't connect
- ❌ Stuck on "Connecting..." state

---

## 🔧 Quick Fixes (Try in Order)

### Fix 1: Refresh Everything (30 seconds)
1. Close Phantom popup (click X)
2. Press **Ctrl+Shift+R** (hard refresh)
3. Wait 5 seconds for page to load
4. Try connecting again

---

### Fix 2: Reset Phantom Connection (1 minute)
1. Click Phantom icon
2. Click settings (gear icon)
3. Find "Connected apps" or "Connected sites"
4. **Remove DarkBid** (http://localhost:5174)
5. Close Phantom
6. Refresh page
7. Try connecting again

---

### Fix 3: Check Phantom Settings (2 minutes)
1. Click Phantom icon
2. Click settings (gear icon)
3. Verify:
   - [ ] Network = **"Devnet"** (not "Mainnet")
   - [ ] Account is **unlocked** (no password needed)
   - [ ] Have test SOL balance (not required for connection, but needed for transactions)
4. Close Phantom
5. Refresh page
6. Try again

---

### Fix 4: Check Browser Console for Errors (3 minutes)
1. Press **F12** to open DevTools
2. Click **"Console"** tab
3. Look for red error messages (they appear when you try to connect)
4. Copy the entire error message
5. If error mentions:
   - **"CORS"**: Restart Phantom extension
   - **"Timeout"**: Try again after 10 seconds
   - **"Rejected"**: You clicked "Decline" - click "Approve" instead

---

### Fix 5: Restart Phantom Extension (5 minutes)
1. Click Phantom icon in toolbar
2. If you see three dots (**⋮**), click it
3. Select "Remove from Edge"
4. Go to **https://phantom.app/**
5. Click "Download for Edge" and reinstall
6. Go through setup
7. Make sure network is set to **Devnet**
8. Refresh DarkBid page
9. Try connecting

---

### Fix 6: Disable Other Extensions (5 minutes)
Edge extensions sometimes conflict:
1. Go to **edge://extensions**
2. Disable all extensions **except Phantom**
3. Refresh DarkBid
4. Try connecting
5. Re-enable other extensions if it works

---

### Fix 7: Clear Site Data (5 minutes)
1. In Edge, press **Ctrl+Shift+Delete**
2. Select:
   - [ ] "All time"
   - [ ] "Cookies and other site data"
   - [ ] "Cached images and files"
3. Click "Clear now"
4. Refresh DarkBid
5. Try connecting

---

## 📊 Testing the Fix

After trying a fix:

1. **Open DevTools** (F12)
2. **Click Console** tab
3. **Click Connect Wallet**
4. Watch for messages:
   ```
   ✅ WORKING:
   [Wallet] Connecting to Phantom...
   [Wallet] ✅ Successfully connected: 7YWfu...

   ❌ NOT WORKING:
   [Wallet] Connection error: [error message]
   ```

---

## 🆘 If None of These Work

Provide these details:

1. **Exact error message** from console
2. **Screenshot of DevTools Console** when you try to connect
3. **Phantom version** (extension → details)
4. **Edge version** (Settings → About Microsoft Edge)
5. **Steps you already tried**

Then we can:
- Add detailed logging to find the exact issue
- Switch to alternative wallet (Solflare, TrustWallet)
- Create mock wallet for testing
- Debug at the extension communication level

---

## ⚡ Pro Tips

### Tip 1: DevTools Console is Your Friend
- Always keep F12 open while testing
- Look for `[Wallet]` prefixed messages
- Copy errors for debugging

### Tip 2: Phantom Settings
- Network must be "Devnet"
- Extension must be unlocked
- Check "Connected apps" list

### Tip 3: Browser Cache
- Hard refresh: **Ctrl+Shift+R** (not Ctrl+R)
- This clears browser cache
- Forces fresh download of page

### Tip 4: Test in Chrome/Firefox Too
- If it works in Chrome but not Edge
- It's likely an Edge-specific issue
- Could be permissions or cache

---

## ✅ Successful Connection Signs

When wallet connects successfully:

1. **Browser Console**
   ```
   [Wallet] ✅ Successfully connected: 7YWfu...
   ```

2. **UI Changes**
   - Button text changes from "Connect Wallet" 
   - To your wallet address: "7YWf...EbzK"

3. **Navbar**
   - Shows your Solana address
   - Shows "Disconnect" option when clicked

4. **Phantom Popup**
   - Shows "Connected" badge
   - Lists DarkBid in "Connected sites"

---

## 🎯 Next After Connection Works

Once wallet connects successfully:

1. Your wallet is now connected to DarkBid
2. You can now:
   - View auctions
   - Create auctions
   - Place bids
   - Reveal bids

3. Backend will request JWT token via wallet signature

---

## 🚨 CRITICAL: Never Share

- Don't share seed phrase
- Don't share private key
- Don't share wallet secret recovery phrase
- Phantom will NEVER ask for these

