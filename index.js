import { create } from "venom-bot";
import OpenAI from "openai";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000; // Render auto-assigns PORT

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Start Venom Bot
create({
  session: "aidoe",
  multidevice: true,
})
  .then((client) => start(client))
  .catch((err) => console.error("Venom error:", err));

function start(client) {
  client.onMessage(async (message) => {
    if (!message.isGroupMsg) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message.body }],
        });

        const reply = completion.choices[0].message.content;
        await client.sendText(message.from, reply);
      } catch (error) {
        console.error("OpenAI error:", error);
        client.sendText(message.from, "⚠️ Error generating reply.");
      }
    }
  });
}

// Keep Render happy with a small HTTP server
app.get("/", (req, res) => {
  res.send("✅ Aidoe WhatsApp bot is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
