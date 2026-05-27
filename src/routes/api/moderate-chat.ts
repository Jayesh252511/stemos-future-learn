import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/moderate-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { message } = (await request.json()) as { message: string };

          if (!message || message.trim().length === 0) {
            return new Response(JSON.stringify({ allowed: false, reason: "Empty message" }), { status: 400 });
          }

          const apiKey = process.env.GROQ_API_KEY || process.env.TUTOR_API_KEY || process.env.OPENAI_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "API key not configured." }), { status: 500 });
          }

          const baseUrl = process.env.TUTOR_BASE_URL || "https://api.groq.com/openai/v1/chat/completions";
          const model = process.env.TUTOR_MODEL || "llama-3.1-8b-instant";

          const systemInstruction = `You are a strict, fast moderation AI for a student study arena.
Your ONLY job is to determine if a message is appropriate and related to studying, STEM, education, school, motivation, or answering quiz questions.
If the message is off-topic, spam, inappropriate, bullying, or talking about unrelated things (like gaming, dating, politics), you must reject it.
Respond EXACTLY in valid JSON format:
{
  "allowed": boolean,
  "reason": "Short explanation if rejected, or 'OK' if allowed"
}`;

          const resp = await fetch(baseUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `Moderate this message: "${message}"` }
              ],
              response_format: { type: "json_object" },
              temperature: 0.1,
              max_tokens: 150
            }),
          });

          if (!resp.ok) {
            throw new Error(`Moderation API error: ${await resp.text()}`);
          }

          const data = await resp.json();
          const result = JSON.parse(data.choices[0].message.content);

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });

        } catch (e: any) {
          console.error("Moderation error:", e);
          // Fail open or fail closed? Fail closed (allowed: false) is safer for a strict chat.
          return new Response(JSON.stringify({ allowed: false, reason: "Moderation system error." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
