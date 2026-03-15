const HF_TOKEN = process.env.EXPO_PUBLIC_HF_TOKEN;

function cleanBeeReply(text: string) {
  if (!text) return "";

  return text
    .replace(/^Bee answer:\s*/i, "")
    .replace(/^Assistant:\s*/i, "")
    .replace(/^Answer:\s*/i, "")
    .trim();
}

export async function askBee(prompt: string) {
  const fallback =
    "I can help with providers, bookings, schedule, and general questions. You can also tap the quick actions below.";

  if (!prompt.trim()) {
    return "Please type a message first.";
  }

  if (!HF_TOKEN) {
    return fallback;
  }

  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/google/flan-t5-large",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `
You are Bee, the in-app assistant of BeeHive.

BeeHive is an intelligent scheduling and booking mobile app.
Bee helps users:
- find service providers
- understand services
- manage bookings
- check schedules
- answer app-related questions

Rules:
- Be warm, concise, and helpful.
- Never say "I had trouble answering."
- Never say "AI error."
- If unsure, guide the user toward bookings, providers, or schedule help.
- Keep answers short and natural for a mobile app.

User message: ${prompt}

Bee reply:
`,
        }),
      }
    );

    const data = await response.json();

    if (data?.error) {
      return fallback;
    }

    if (Array.isArray(data) && data[0]?.generated_text) {
      const cleaned = cleanBeeReply(data[0].generated_text);

      if (cleaned) {
        return cleaned;
      }
    }

    if (typeof data?.generated_text === "string" && data.generated_text.trim()) {
      return cleanBeeReply(data.generated_text);
    }

    return fallback;
  } catch (error) {
    console.log("askBee error:", error);
    return fallback;
  }
}