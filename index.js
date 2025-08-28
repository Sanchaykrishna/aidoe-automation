import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";
import OpenAI from "openai";
import os from "os";

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Detect environment: Windows (local) vs Railway/Linux (prod)
let puppeteerConfig = { headless: true };

if (os.platform() === "win32") {
  // Local Windows (use installed Chrome)
  puppeteerConfig.executablePath =
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
} else {
  // Railway/Linux (use bundled Chromium with safe args)
  puppeteerConfig.args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
  ];
}

// Setup WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: puppeteerConfig,
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp bot is ready!");
});

client.on("message", async (message) => {
  try {
    if (!message.body) return;

    console.log(`💬 Incoming: ${message.body}`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message.body }],
    });

    const reply = completion.choices[0].message.content;
    console.log(`🤖 Replying: ${reply}`);

    message.reply(reply);
  } catch (err) {
    console.error("❌ Error:", err);
  }
});

client.initialize();
