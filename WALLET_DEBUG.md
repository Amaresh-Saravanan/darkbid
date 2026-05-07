# 🔍 Wallet Connection Debugging Guide (Edge Browser)

## Symptoms
- ✅ Wallet detected
- ✅ Modal opens
- ❌ Connection fails / times out
- ❌ No error message shown

---

## 📋 Step-by-Step Debugging

### Step 1: Open Developer Console

In Microsoft Edge:
1. Press **F12** or **Ctrl+Shift+I**
2. Click the **"Console"** tab
3. Keep it open while testing

### Step 2: Try to Connect Wallet

1. Click **"Connect Wallet"** button
2. Watch the console for log messages
3. Look for **`[Wallet]`** prefixed logs

### Step 3: Check Console for Errors

Look for messages like:
```
[Wallet] Connecting to Phantom...
[Wallet] State changed: { connected: false, connecting: true }
[Wallet] Connection error: [error message]
```

---

## 🛠️ Common Issues & Fixes

### Issue 1: "Modal opens but no wallet options shown"

**Cause**: WalletModalProvider not rendering properly

**Fix**:
1. Refresh page completely (Ctrl+Shift+R)
2. Check if Phantom icon appears in the list
3. If empty, restart Phantom extension:
   - Click Phantom icon
   - Click settings (gear)
   - Click "Disconnect"
   - Close Phantom popup
   - Refresh page

---

### Issue 2: "Stuck on 'Connecting...' state"

**Cause**: Timeout or async issue with Phantom

**Fix**:
1. Wait 10 seconds
2. If still stuck:
   - Click browser "X" to close modal
   - Press F5 to refresh
   - Try again
3. Check Phantom popup - may be asking for approval in background

---

### Issue 3: "Error: Phantom not responding"

**Cause**: Extension communication issue

**Fix**:
1. Open Phantom extension (click icon in toolbar)
2. Make sure it's unlocked (enter password if needed)
3. Go to Phantom Settings → Network
4. Verify **Devnet** is selected
5. Close Phantom and try again
6. If still fails: Disable and re-enable Phantom extension

---

### Issue 4: "Error: User rejected"

**Cause**: Normal - user clicked "Cancel" or "Decline"

**Fix**: Try connecting again, make sure to click "Approve"

---

## 🐛 Advanced Debugging

### Enable Detailed Logs

Add this to browser console (F12):
```javascript
localStorage.setItem('DEBUG', '*')
window.location.reload()
```

This enables verbose logging across all components.

---

### Check Network Tab

1. Open DevTools (F12)
2. Click **"Network"** tab
3. Try to connect wallet
4. Look for failed requests
5. Check if any requests to Phantom extension are blocked

---

### Check Application/Storage

1. Open DevTools (F12)
2. Click **"Application"** tab (or "Storage" in Firefox)
3. Check **"Local Storage"**
4. Look for wallet-related data

---

## 📱 Edge-Specific Issues

### Phantom on Edge Known Issues

1. **Extension permissions**: Edge may block extension communication
   - **Fix**: Settings → Extensions → Phantom → "Allow in InPrivate"

2. **Service Worker issues**: Edge caches service workers differently
   - **Fix**: Clear site data:
     - Settings → Privacy, search, and services
     - Clear browsing data → "All time"
     - Check all boxes → Clear now

3. **CORS issues with localhost**: Less common but possible
   - **Fix**: Add to Edge's advanced settings
     - Not usually needed for localhost

---

## ✅ Testing Checklist

Before reporting an issue, verify:

- [ ] Phantom extension installed and enabled
- [ ] Phantom is set to **Devnet** (not Mainnet)
- [ ] Phantom is **unlocked** (not asking for password)
- [ ] Page fully loaded (wait 5 seconds after refresh)
- [ ] No other wallet extension conflicts (disable others)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Tried on different browser (Chrome/Firefox) if possible

---

## 🎯 Working Connection Flow

When everything works, you should see:

**Console logs:**
```
[Wallet] Phantom check: { isPhantomInstalled: true }
[Wallet] Opening modal...
[Wallet] Connecting to Phantom...
[Wallet] State changed: { connected: false, connecting: true, wallet: 'Phantom' }
[Wallet] ✅ Successfully connected: 7YWfupxWK...
```

**UI:**
1. Click "Connect Wallet"
2. Phantom popup appears
3. Shows your Phantom wallet address
4. Click "Approve"
5. Page shows wallet address in navbar
6. "Connect Wallet" button → becomes wallet address

---

## 📞 If Nothing Works

Provide these details:

1. **Console output** (Screenshot of F12 console)
2. **Phantom version** (click icon → settings → version)
3. **Edge version** (Settings → About Microsoft Edge)
4. **Error message** (exact text)
5. **Steps to reproduce** (what you did)

Then we can:
- Add mock wallet for testing
- Use Phantom testnet instead of devnet
- Try alternative wallet (Solflare, etc.)
- Implement custom connection flow

---

## 🔧 Current Implementation

**WalletButton.jsx** now includes:
- ✅ Detailed console logging (`[Wallet]` prefix)
- ✅ Error state display
- ✅ Connection error messages
- ✅ Phantom detection
- ✅ Better error handling

**App.jsx** now includes:
- ✅ onError handler with logging
- ✅ Connection state tracking
- ✅ User-friendly error alerts
- ✅ autoConnect disabled (safer)

