export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "❌ API key missing in Vercel" });
    }

    const { messages } = req.body;

    const userMessage =
      messages?.[messages.length - 1]?.parts?.[0]?.text || "Hello";

    const prompt = `You are MindEase, a funny chill best friend.
Keep replies short, casual, and friendly.

User: ${userMessage}
MindEase:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "Gemini API error"
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Bro I forgot what to say 😭";

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({
      error: "SERVER CRASH",
      details: err.message
    });
  }
}
