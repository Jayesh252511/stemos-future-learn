import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-path")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { subject, level } = (await request.json()) as {
            subject: string;
            level: "Beginner" | "Intermediate" | "Advanced";
          };

          if (!subject || !level) {
            return new Response(JSON.stringify({ error: "Subject and level are required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const apiKey = process.env.GROQ_API_KEY || process.env.TUTOR_API_KEY || process.env.OPENAI_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "Groq API key not configured." }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const baseUrl = process.env.TUTOR_BASE_URL || "https://api.groq.com/openai/v1/chat/completions";
          const primaryModel = process.env.TUTOR_MODEL || "llama-3.1-8b-instant";

          const systemInstruction = `You are a curriculum designer for a Gen-Z learning platform. Generate a custom roadmap for the subject '${subject}' tailored for a user who is currently at a '${level}' level. 
The roadmap MUST have exactly three stages: Beginner, Intermediate, and Advanced. Each stage MUST have exactly 4 subtopic nodes (short string titles).
Generate a fun, short tagline (max 6 words) and choose exactly ONE emoji that best represents the subject.
Always call the generate_roadmap tool.`;

          const payload = {
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: `Create a 3-stage learning roadmap for ${subject} tailored to a ${level} learner.` },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "generate_roadmap",
                  description: "Generates a 3-stage learning roadmap",
                  parameters: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "The normalized name of the subject" },
                      tagline: { type: "string", description: "A catchy, short tagline for the roadmap" },
                      emoji: { type: "string", description: "A single emoji representing the subject" },
                      stages: {
                        type: "object",
                        properties: {
                          Beginner: { type: "array", items: { type: "string" }, description: "4 topics for beginner stage" },
                          Intermediate: { type: "array", items: { type: "string" }, description: "4 topics for intermediate stage" },
                          Advanced: { type: "array", items: { type: "string" }, description: "4 topics for advanced stage" },
                        },
                        required: ["Beginner", "Intermediate", "Advanced"],
                      },
                    },
                    required: ["name", "tagline", "emoji", "stages"],
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "generate_roadmap" } },
            model: primaryModel,
            temperature: 0.7,
            max_tokens: 1000,
          };

          const fetchRoadmap = async (model: string) => {
            const resp = await fetch(baseUrl, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ...payload, model }),
            });
            if (!resp.ok) {
              const text = await resp.text();
              throw new Error(`API error: ${text}`);
            }
            const data = await resp.json();
            const call = data.choices?.[0]?.message?.tool_calls?.[0];
            if (!call || call.function.name !== "generate_roadmap") {
              throw new Error("Model failed to call the roadmap generator tool");
            }
            return JSON.parse(call.function.arguments);
          };

          let roadmap;
          try {
            roadmap = await fetchRoadmap(primaryModel);
          } catch (e: any) {
            console.error("Primary model failed:", e);
            roadmap = await fetchRoadmap("llama-3.3-70b-versatile");
          }

          return new Response(JSON.stringify({ roadmap }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });

        } catch (e: any) {
          console.error("Path generation error:", e);
          return new Response(JSON.stringify({ error: e.message || "Failed to generate path" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
