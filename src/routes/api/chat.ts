import { createFileRoute } from "@tanstack/react-router";

const BASE_SYSTEM = `You are STEMOS, an expert, highly encouraging AI tutor for Gen-Z STEM students (Math, Physics, Chemistry, Biology, Programming).

Your personality:
- Intelligent, modern, supportive, motivating, emotionally engaging, and student-friendly.
- Use a relatable, subtly Gen-Z tone: "You're cooking this 🍳", "Let's break this down step-by-step.", "Locked in mode 🧠", "You're actually getting this fast."
- Do NOT spam slang or act immature. Keep it professional but highly motivating and conversational.
- Explain step-by-step, starting with the core intuition before diving into formulas.
- If a student gets something right, celebrate it (e.g. "Brain XP upgraded 🚀", "Lowkey mastering this").
- Format code elegantly with markdown fences, and suggest a smart next step.
- Never invent facts; if unsure, say so clearly.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages, locale, isVoiceMode } = (await request.json()) as {
            messages: { role: "user" | "assistant"; content: string }[];
            locale?: string;
            isVoiceMode?: boolean;
          };

          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "messages required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const apiKey = process.env.GROQ_API_KEY || process.env.TUTOR_API_KEY || process.env.OPENAI_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "Groq API key not configured. Please add GROQ_API_KEY to your .env file." }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Build localized system prompt
          const langInstruction = locale && locale !== "en"
            ? `\n\nLANGUAGE RULE (CRITICAL): You MUST respond ONLY in ${locale}. All explanations, examples, and text must be in ${locale}. Do NOT switch to English under any circumstances. Keep technical terms (like variable names, math symbols) in their universal form, but all natural language MUST be in ${locale}.`
            : "";

          // Voice Mode instruction override: friendly, short, conversational
          const voiceModeInstruction = isVoiceMode
            ? `\n\nVOICE MODE INSTRUCTION (CRITICAL): The user is communicating via hands-free Voice Mode. You MUST keep your responses very short (maximum 1 to 3 sentences), highly conversational, friendly, and natural. Do NOT use bullet points, numbered lists, markdown styling, bold markers, or code snippets. Keep it purely natural, spoken-friendly text, as it will be read back via Text-to-Speech.`
            : "";

          const SYSTEM = BASE_SYSTEM + langInstruction + voiceModeInstruction;

          const baseUrl = process.env.TUTOR_BASE_URL || "https://api.groq.com/openai/v1/chat/completions";
          const primaryModel = process.env.TUTOR_MODEL || "llama-3.1-8b-instant";
          const fallbackModel = "llama-3.3-70b-versatile";

          let upstream: Response;
          try {
            upstream = await fetch(baseUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: primaryModel,
                stream: true,
                messages: [
                  { role: "system", content: SYSTEM },
                  ...messages.slice(-20),
                ],
              }),
            });

            if (!upstream.ok) {
              throw new Error(`Primary model returned status ${upstream.status}`);
            }
          } catch (e) {
            console.warn(`Primary model (${primaryModel}) failed. Retrying with fallback (${fallbackModel})...`, e);
            upstream = await fetch(baseUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: fallbackModel,
                stream: true,
                messages: [
                  { role: "system", content: SYSTEM },
                  ...messages.slice(-20),
                ],
              }),
            });
          }

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({ error: "Tutor service limits or credits exhausted." }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            const t = await upstream.text();
            console.error("Tutor upstream error", upstream.status, t);
            return new Response(JSON.stringify({ error: "Tutor service error" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        } catch (e) {
          console.error("chat route error", e);
          return new Response(JSON.stringify({ error: "Internal error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
