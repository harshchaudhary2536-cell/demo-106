export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const GROQ_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const { messages } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
You are MindEase — a real human-like best friend.

- Talk like normal texting
- No "User:" or "Assistant:"
- Never write emoji names
- Use real emojis 😄🔥🤍
- Keep spacing natural
- Reply in same language (Hindi/English/Hinglish)
- Be supportive, chill, funny when needed
`
          },
          ...messages.map(m => ({
            role: m.role === "model" ? "assistant" : "user",
            content: m.parts[0].text
          }))
        ]
      })
    });

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content;

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
