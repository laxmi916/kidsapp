import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🔹 Utility: simple chat wrapper
async function askGroq(prompt) {
  const chat = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  return chat.choices[0].message.content;
}

// Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 Groq backend running! Use /story, /quiz, /translate, /math, /words.");
});

// 📖 Story endpoint
app.post("/story", async (req, res) => {
  const { age, topic } = req.body;
  const prompt = `Write a short fun story (max 200 words) for a ${age}-year-old indian child about ${topic}. 
  Use simple English. Do not use * inside story.`;

  try {
    const story = await askGroq(prompt);
    res.json({ story });
  } catch (err) {
    console.error("❌ Story error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ❓ Quiz endpoint
app.post("/quiz", async (req, res) => {
  const { story } = req.body;
  const prompt = `
  Based on this story:
  "${story}"

  Create 10 multiple-choice questions for kids.
  Each must have 4 options (A, B, C, D) and one correct answer.
  Return STRICT JSON only:
  {
    "questions": [
      {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "answer": "Correct Option"
      }
    ]
  }
  `;

  try {
    const text = await askGroq(prompt);
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (err) {
    console.error("❌ Quiz error:", err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// 🌍 Translate endpoint
app.post("/translate", async (req, res) => {
  const { text } = req.body;
  const prompt = `Translate this into Telugu with simple words for kids:\n\n${text}`;

  try {
    const translated = await askGroq(prompt);
    res.json({ translated });
  } catch (err) {
    console.error("❌ Translation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✍️ Words endpoint
app.post("/words", async (req, res) => {
  const { age } = req.body;
  const prompt = `Pretend you are a ${age}-year-old Indian child. Describe your daily routine in your own words (max 200 words), step by step, from morning to night. Use Indian food, modern games like cricket, football, and toys. Do not use * or old games.`;

  try {
    const words = await askGroq(prompt);
    res.json({ words });
  } catch (err) {
    console.error("❌ Words error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🧮 Math endpoint
app.post("/math", async (req, res) => {
  const { age, operation } = req.body;
  const prompt = `
  Generate 5 ${operation} math problems for a ${age}-year-old child.
  Return ONLY valid JSON array:
  [
    {"question": "5 + 3 =", "answer": 8},
    {"question": "10 + 2 =", "answer": 12}
  ]
  `;

  try {
    const raw = await askGroq(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const problems = JSON.parse(cleaned);
    res.json({ problems });
  } catch (err) {
    console.error("❌ Math error:", err);
    res.status(500).json({ error: "Failed to generate problems" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`)
);
