import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/quiz")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { subject, difficulty, count, language, subtopic, locale, context } = (await request.json()) as {
            subject: string;
            difficulty: "Easy" | "Medium" | "Hard";
            count?: number;
            language?: string;
            subtopic?: string;
            locale?: string;
            context?: string;
          };

          const n = Math.min(Math.max(count ?? 5, 1), 10);
          const apiKey = process.env.GROQ_API_KEY || process.env.TUTOR_API_KEY || process.env.OPENAI_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "Groq API key not configured. Please add GROQ_API_KEY to your .env file." }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const baseUrl = process.env.TUTOR_BASE_URL || "https://api.groq.com/openai/v1/chat/completions";
          const primaryModel = process.env.TUTOR_MODEL || "llama-3.1-8b-instant";
          const fallbackModel = "llama-3.3-70b-versatile";

          // Language localization instruction
          const langInstruction = locale && locale !== "en"
            ? ` CRITICAL: ALL quiz content — questions, options, explanations — MUST be written entirely in ${locale}. Keep code syntax, variable names, and math symbols universal, but all natural language text MUST be in ${locale}. Do not use any English text in questions or explanations.`
            : "";

          const isCoding = subject.toLowerCase() === "programming" || subject.toLowerCase() === "coding";
          const systemInstruction = context 
            ? `You generate premium educational multiple choice questions based strictly on the provided conversation context. Ensure questions target the concepts discussed. Keep explanations supportive and Gen-Z friendly. Always call the generate_quiz tool.` + langInstruction
            : (isCoding
            ? `You generate highly engaging and interactive multiple choice programming questions for Gen-Z students.
For EVERY single question, you MUST include a distinct, relevant code snippet formatted inside a standard markdown block in the question text, like so:
\`\`\`${language?.toLowerCase() || "python"}
[code here]
\`\`\`
Create a mix of debugging questions (finding the error), output prediction (what does this code print?), and logic problems. Keep options distinct and explanations extremely helpful and Gen-Z friendly (e.g., "Lowkey tricky, but here's why..."). Every question must test that specific code block. Always call the generate_quiz tool.`
            : `You generate premium quality, educational multiple choice questions for Gen-Z STEM students.
Focus on intuitive, clear problem solving. If math formulas are included, make them clear and formatted. Keep explanations supportive, modern, and subtly Gen-Z friendly (e.g., "You cooked this concept! 🔥"). Always call the generate_quiz tool.`) + langInstruction;

          const userPrompt = context
            ? `Generate ${n} multiple choice questions based on the following conversation context. Ensure they test understanding of the topics discussed.\n\nContext:\n${context}`
            : isCoding
            ? `Generate ${n} ${difficulty}-difficulty programming multiple choice questions in ${language || "Python"}${subtopic ? ` specifically about ${subtopic}` : ""}. You MUST include a formatted code snippet inside EVERY single question to test output prediction, tracing, or debugging. Do not omit code snippets under any circumstance.`
            : `Generate ${n} ${difficulty}-difficulty multiple choice questions on the subject of ${subject}${subtopic ? ` specifically focusing on the topic of ${subtopic}` : ""}. Ensure they target deep comprehension and vary well.`;

          const payload = {
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: userPrompt },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "generate_quiz",
                  description: "Return the generated quiz questions.",
                  parameters: {
                    type: "object",
                    properties: {
                      questions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            question: { type: "string" },
                            options: {
                              type: "array",
                              items: { type: "string" },
                              minItems: 4,
                              maxItems: 4,
                            },
                            correct_index: {
                              type: "integer",
                              minimum: 0,
                              maximum: 3,
                            },
                            explanation: { type: "string" },
                          },
                          required: ["question", "options", "correct_index", "explanation"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["questions"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: {
              type: "function",
              function: { name: "generate_quiz" },
            },
          };

          let res: Response;
          try {
            res = await fetch(baseUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ model: primaryModel, ...payload }),
            });

            if (!res.ok) {
              throw new Error(`Primary model quiz generation returned status ${res.status}`);
            }
          } catch (e) {
            console.warn(`Primary model (${primaryModel}) failed for quiz. Retrying with fallback (${fallbackModel})...`, e);
            res = await fetch(baseUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ model: fallbackModel, ...payload }),
            });
          }

          if (!res.ok) {
            const t = await res.text();
            console.error("quiz gen error", res.status, t);
            const status = res.status === 429 || res.status === 402 ? res.status : 500;
            const msg =
              res.status === 429
                ? "Rate limit reached. Try again in a few seconds."
                : res.status === 402
                  ? "Tutor service limits or credits exhausted."
                  : "Could not generate quiz.";
            return new Response(JSON.stringify({ error: msg }), {
              status,
              headers: { "Content-Type": "application/json" },
            });
          }

          const data = await res.json();
          const call = data.choices?.[0]?.message?.tool_calls?.[0];
          if (!call) {
            return new Response(JSON.stringify({ error: "No quiz returned" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
          const args = JSON.parse(call.function.arguments);
          return Response.json(args);
        } catch (e) {
          console.error("quiz route error", e);
          return new Response(JSON.stringify({ error: "Internal error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
