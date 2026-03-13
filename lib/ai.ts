export async function askBee(message: string) {

  try {

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `You are Bee, the assistant of the BeeHive service app. Help the user: ${message}`
        })
      }
    );

    const data = await response.json();

    return data?.[0]?.generated_text || "🐝 Bee is thinking...";

  } catch (error) {

    console.log("Bee error:", error);

    return "🐝 Bee couldn't respond.";

  }

}