import { create } from "venom-bot";
import OpenAI from "openai";

// Render provides environment variables automatically from Dashboard → Environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ make sure you set this in Render
});

create({
  session: "aidoe",
  multidevice: true,
})
  .then((client) => start(client))
  .catch((err) => console.error("Venom error:", err));

function start(client) {
  client.onMessage(async (message) => {
    if (message.isGroupMsg === false) {
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
