export default async function handler(req, res) {
  console.log("🔥 HF FINAL FIX RUNNING");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

    if (!HF_TOKEN) {
      return res.status(500).json({ error: "TOKEN NOT FOUND" });
    }

    const { messages } = req.body;

    const userText =
      messages?.[messages.length - 1]?.parts?.[0]?.text || "Hello";

    const prompt = `You are MindEase, a funny chill best friend.
Keep replies short, casual and supportive.

User: ${userText}
MindEase:`;

    // ✅ WORKING MODEL + ROUTER
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/HuggingFaceH4/zephyr-7b-beta",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7
          }
        })
      }
    );

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
        error: data.error || "HF ERROR",
        full: data
      });
    }

    const reply = Array.isArray(data)
      ? data[0]?.generated_text
      : data.generated_text;

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
