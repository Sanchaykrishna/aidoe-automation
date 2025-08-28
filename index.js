import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";
import OpenAI from "openai";

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Setup WhatsApp client with system Chrome path
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Path to your Chrome
    headless: true, // run without opening a visible browser window
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
