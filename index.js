import { default as makeWASocket, useMultiFileAuthState, DisconnectReason } from 'baileys';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text) return;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // ✅ Using your existing key
        messages: [{ role: "user", content: text }]
      });

      const reply = completion.choices[0].message.content;
      await sock.sendMessage(msg.key.remoteJid, { text: reply });
    } catch (err) {
      console.error("OpenAI error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Error generating reply." });
    }
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (!lastDisconnect?.error?.output || lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
        console.log("Reconnecting...");
        startWhatsApp();
      } else {
        console.log("Logged out, scan QR again.");
      }
    }
  });
}

startWhatsApp();
