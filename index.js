import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";
import OpenAI from "openai";

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Setup WhatsApp client with system Chrome path (Linux for Railway)
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: "/usr/bin/google-chrome", // Linux Chrome path
    headless: true, // Run without opening a visible browser window
    args: ["--no-sandbox", "--disable-setuid-sandbox"] // Stability flags
  },
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
