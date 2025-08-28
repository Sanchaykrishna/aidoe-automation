import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import OpenAI from "openai";

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Put this in Railway's environment vars
});

// Setup WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
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

    // Send user query to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast + cheap
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
