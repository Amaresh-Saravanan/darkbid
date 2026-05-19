const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function capture() {
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,800']
  });
  
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  const page = await browser.newPage();
  
  // 1. Hero Screenshot
  try {
    console.log("Capturing Hero Screenshot...");
    await page.setViewport({ width: 1200, height: 630 });
    
    // Mock phantom wallet
    await page.evaluateOnNewDocument(() => {
      window.solana = {
        isPhantom: true,
        isConnected: true,
        publicKey: { toString: () => "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH" },
        on: () => {},
        connect: async () => { return { publicKey: { toString: () => "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH" } }; },
        disconnect: async () => {},
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
        signMessage: async (msg) => msg,
      };
    });

    await page.goto('http://localhost:5174', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for some animations to finish
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
    
    // Try to change Connect Wallet button text just in case mock didn't work
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        if (btn.innerText && btn.innerText.includes('Select Wallet')) {
          btn.innerText = 'HN7c...WrH';
        }
      }
    });

    await page.screenshot({ path: 'screenshots/hero.png', type: 'png' });
    console.log("Saved screenshots/hero.png");
  } catch (e) {
    console.error("Failed Hero:", e);
  }

  // 2. Solscan Screenshot
  try {
    console.log("Capturing Solscan Screenshot...");
    await page.setViewport({ width: 1200, height: 800 });
    
    // We will spoof user agent to avoid basic blocks
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.goto('https://solscan.io/account/7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK?cluster=devnet', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for content to load
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));
    
    await page.screenshot({ path: 'screenshots/solscan.png', type: 'png' });
    console.log("Saved screenshots/solscan.png");
  } catch (e) {
    console.error("Failed Solscan:", e);
  }

  // 3. Code Snippet
  try {
    console.log("Capturing Code Snippet...");
    const codeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
      <style>
        body { background: #1a1a1a; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
        .window { background: #2d2d2d; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); overflow: hidden; width: 800px; border: 1px solid #444; }
        .header { background: #1e1e1e; padding: 10px; display: flex; align-items: center; border-bottom: 1px solid #000; }
        .dots { display: flex; gap: 8px; margin-left: 10px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot.red { background: #ff5f56; }
        .dot.yellow { background: #ffbd2e; }
        .dot.green { background: #27c93f; }
        .title { color: #888; font-size: 14px; margin-left: auto; margin-right: auto; }
        pre { margin: 0; padding: 20px !important; background: transparent !important; font-size: 16px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="window" id="code-window">
        <div class="header">
          <div class="dots">
            <div class="dot red"></div>
            <div class="dot yellow"></div>
            <div class="dot green"></div>
          </div>
          <div class="title">commit_bid.rs</div>
          <div style="width: 50px;"></div>
        </div>
        <pre><code class="language-rust">
    let bid = &mut ctx.accounts.bid;
    bid.bidder = ctx.accounts.bidder.key();
    bid.hash = hash;
    bid.amount = amount;
    bid.is_revealed = false;
    bid.bump = ctx.bumps.bid;

    // Transfer SOL via raw system program invoke
    anchor_lang::solana_program::program::invoke(
        &anchor_lang::solana_program::system_instruction::transfer(
            ctx.accounts.bidder.key,
            ctx.accounts.escrow.key,
            amount,
        ),
        &[
            ctx.accounts.bidder.to_account_info(),
            ctx.accounts.escrow.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;
        </code></pre>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-rust.min.js"></script>
    </body>
    </html>
    `;
    
    fs.writeFileSync('code.html', codeHtml);
    await page.goto('file://' + path.resolve('code.html'), { waitUntil: 'networkidle0' });
    
    const element = await page.$('#code-window');
    await element.screenshot({ path: 'screenshots/code.png' });
    console.log("Saved screenshots/code.png");
  } catch (e) {
    console.error("Failed Code:", e);
  }

  await browser.close();
  console.log("Done!");
}

capture();
