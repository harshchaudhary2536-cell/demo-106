export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const GROQ_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_KEY) {
      return res.status(500).json({ error: "GROQ KEY NOT FOUND" });
    }

    const { messages } = req.body;

    const userText =
      messages?.[messages.length - 1]?.parts?.[0]?.text || "Hello";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // ✅ UPDATED MODEL
        messages: [
          {
            role: "system",
            content: "You are MindEase, a funny chill best friend. Keep replies short, casual and supportive."
          },
          {
            role: "user",
            content: userText
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "Groq error"
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    return res.status(200).json({
      reply: reply || "No response 😭"
    });

  } catch (err) {
    return res.status(500).json({
      error: "SERVER ERROR",
      details: err.message
    });
  }
}
