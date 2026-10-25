const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/', (req, res) => {
  res.send('Brahmastra Backend is running with Streaming!');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Koi message nahi mila.' });
    }

    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.1-flash-lite', 
      contents: contents,
    config: {
  systemInstruction: `You are Brahmastra, a helpful AI assistant.

  LANGUAGE RULES:
  1. If the user speaks or writes in English, you MUST reply in English only.
  2. If the user speaks or writes in Hindi or Hinglish (e.g., "kaise ho"), you MUST reply in Hinglish (Hindi written using English alphabets).
  3. NEVER reply in pure Hindi (Devanagari script) unless the user specifically asks for it.
  4. Match the user's language style naturally and keep answers direct and friendly.`,
},
    });


    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');


    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    res.end();

  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({ error: 'AI se reply nahi mila. Details backend terminal mein hain.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
