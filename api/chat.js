export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key missing" });
  }

  try {
    const { message } = req.body;

    const prompt = `You are MindEase, a funny and chill best friend.

Rules:
- Keep replies short (1-2 lines)
- Use casual English like WhatsApp
- If user is sad → comfort + small joke
- Never sound like AI or therapist

User: ${message}
MindEase:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Brain freeze ho gaya 😭 try again";

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: "Server crash 😵" });
  }
}
