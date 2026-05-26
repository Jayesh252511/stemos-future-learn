import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/quiz")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { subject, difficulty, count } = (await request.json()) as {
            subject: string;
            difficulty: "Easy" | "Medium" | "Hard";
            count?: number;
          };

          const n = Math.min(Math.max(count ?? 5, 1), 10);
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "AI not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const res = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  {
                    role: "system",
                    content:
                      "You generate high-quality, factually correct multiple choice quizzes for STEM students. Always call the generate_quiz tool.",
                  },
                  {
                    role: "user",
                    content: `Generate ${n} ${difficulty}-difficulty multiple choice questions on ${subject}. Each must have exactly 4 distinct options, one correct answer, and a concise 1-2 sentence explanation. Vary the topics across the subject.`,
                  },
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
                              required: [
                                "question",
                                "options",
                                "correct_index",
                                "explanation",
                              ],
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
              }),
            },
          );

          if (!res.ok) {
            const t = await res.text();
            console.error("quiz gen error", res.status, t);
            const status = res.status === 429 || res.status === 402 ? res.status : 500;
            const msg =
              res.status === 429
                ? "Rate limit reached. Try again in a few seconds."
                : res.status === 402
                  ? "AI credits exhausted."
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
