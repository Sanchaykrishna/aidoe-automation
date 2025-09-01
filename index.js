require('dotenv').config();
const { create } = require('venom-bot');
const OpenAI = require('openai');
const express = require('express');

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Start Venom
create({
  session: 'session1',
  multidevice: true,
  headless: false,        // 🚀 Open Chrome visibly (not headless)
  useChrome: true,
  browserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
}).then((client) => start(client));

function start(client) {
  client.onMessage(async (message) => {
    if (!message.isGroupMsg) {
      try {
        // ✅ Ignore messages with no text
        if (!message.body || typeof message.body !== "string") {
          console.log("⚠️ Skipped non-text message");
          return;
        }

        // Call OpenAI
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message.body }],
        });

        const reply =
          response.choices[0].message?.content || "⚠️ Sorry, I couldn’t reply.";

        await client.sendText(message.from, reply);
        console.log("✅ User:", message.body);
        console.log("✅ Recuria:", reply);

      } catch (err) {
        console.error("❌ Error:", err.message);
        await client.sendText(
          message.from,
          "⚠️ Error: Couldn’t fetch reply from AI."
        );
      }
    }
  });
}

// ✅ Express server for Koyeb / cloud hosting
const app = express();
app.get("/", (req, res) => res.send("✅ Recuria running 24/7"));
app.listen(process.env.PORT || 3000, () =>
  console.log("🌍 Web server running on port " + (process.env.PORT || 3000))
);
