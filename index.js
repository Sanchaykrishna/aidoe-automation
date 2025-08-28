import { create } from "venom-bot";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

create({
  session: "aidoe",
  multidevice: true,
})
  .then((client) => start(client))
  .catch((err) => console.log(err));

function start(client) {
  client.onMessage(async (message) => {
    if (message.isGroupMsg === false) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message.body }],
        });

        const reply = completion.choices[0].message.content;
        client.sendText(message.from, reply);
      } catch (error) {
        console.error(error);
        client.sendText(message.from, "⚠️ Error generating reply.");
      }
    }
  });
}
