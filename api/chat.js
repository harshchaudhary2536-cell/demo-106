export default async function handler(req, res) {
  console.log("🚀 OPENROUTER RUNNING");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_KEY) {
      return res.status(500).json({ error: "OPENROUTER KEY NOT FOUND" });
    }

    const { messages } = req.body;

    const userText =
      messages?.[messages.length - 1]?.parts?.[0]?.text || "Hello";

    const prompt = `You are MindEase, a funny chill best friend.
- Keep replies short
- Use casual language
- If user sad → comfort + joke

User: ${userText}
MindEase:`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const raw = await response.text();
    console.log("RAW:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "INVALID JSON",
        raw
      });
    }

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "OpenRouter error",
        full: data
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
