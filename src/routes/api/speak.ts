import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/speak")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { text } = (await request.json()) as { text: string };
          if (!text) {
            return new Response(JSON.stringify({ error: "Text is required" }), { status: 400 });
          }

          // Clean Markdown elements to ensure natural, clear spoken audio
          const cleanText = text
            .replace(/(\*\*|__)(.*?)\1/g, "$2") // strip bold
            .replace(/(\*|_)(.*?)\1/g, "$2")   // strip italic
            .replace(/`{1,3}[\s\S]*?`{1,3}/g, "") // remove code blocks entirely
            .replace(/\[(.*?)\]\(.*?\)/g, "$1")  // strip link markdown, keeping text
            .replace(/#+\s+/g, "") // strip headers
            .slice(0, 400); // safe limit for standard speech length

          const apiKey = process.env.ELEVENLABS_API_KEY || "sk_ef13adfe5cbf044c61eba8806196a2e515f27bfd64e6811b"; // XI API Key
          const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel premium voice ID
          const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

          const resp = await fetch(url, {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
              "accept": "audio/mpeg"
            },
            body: JSON.stringify({
              text: cleanText,
              model_id: "eleven_monolingual_v1",
              voice_settings: {
                stability: 0.75,
                similarity_boost: 0.75
              }
            })
          });

          if (!resp.ok) {
            const errText = await resp.text();
            throw new Error(`ElevenLabs returned status ${resp.status}: ${errText}`);
          }

          const audioBuffer = await resp.arrayBuffer();

          return new Response(audioBuffer, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=3600"
            }
          });

        } catch (e: any) {
          console.error("Vocal TTS bridge error:", e);
          return new Response(JSON.stringify({ error: e.message || "Failed to generate speech audio" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
