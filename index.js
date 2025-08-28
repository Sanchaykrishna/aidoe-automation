import { create } from "venom-bot";
import OpenAI from "openai";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

create({
  session: "aidoe",
  multidevice: true,
  puppeteerOptions: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu"
    ],
    headless: true,
    executablePath: "/usr/bin/google-chrome", // Use system Chrome in Render
  },
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

app.get("/", (req, res) => {
  res.send("✅ Aidoe WhatsApp bot is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
