require('dotenv').config();
const fs = require('fs');
const { create } = require('venom-bot');
const OpenAI = require('openai');
const express = require('express');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const QR_DB = 'qr_db.json';

// Express server (optional)
const app = express();
app.use(express.static('.'));
app.get("/", (req, res) => res.send("✅ Recuria running 24/7"));
app.listen(process.env.PORT || 3000, () =>
  console.log("🌍 Web server running on port " + (process.env.PORT || 3000))
);

// Save QR as JSON file
function saveQR(base64Qr) {
  fs.writeFileSync(QR_DB, JSON.stringify({ qr: base64Qr, savedAt: new Date().toISOString() }));
  console.log('✅ The QR code got saved as json file: qr_db.json');
}

// Initialize Venom locally
function initVenom() {
  create({
    session: 'session1',
    multidevice: true,
    headless: false, 
    logQR: true,
    disableSpins: true,
    useChrome: true,
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  },
  (base64Qr, asciiQR, attempt, urlCode) => {
    console.log('🖨️ Scan this QR with WhatsApp Web:\n', asciiQR);
    saveQR(base64Qr);  // save immediately
  })
  .then(client => startClient(client))
  .catch(err => {
    console.error('❌ Venom init error:', err);
    console.log('🔄 Retrying Venom in 5 seconds...');
    setTimeout(initVenom, 5000); // Retry if failed
  });
}

// Handle messages
function startClient(client) {
  client.onMessage(async message => {
    if (!message.isGroupMsg && message.body) {
      try {
        const response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
          messages: [{ role: "user", content: message.body }],
        });

        const reply = response.choices?.[0]?.message?.content?.trim() || "⚠️ Sorry, I couldn’t reply.";
        await client.sendText(message.from, reply);

        console.log("✅ User:", message.body);
        console.log("✅ Recuria:", reply);

      } catch (err) {
        console.error("❌ Error:", err.message || err);
        try { await client.sendText(message.from, "⚠️ Error fetching AI reply."); } catch {}
      }
    }
  });

  client.onStateChange(state => {
    if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
      console.log('⚠️ Session conflict/unlaunched detected. Re-initializing...');
      client.close();
      initVenom(); // Auto-restart if session dies
    }
  });
}

// Start bot
initVenom();
