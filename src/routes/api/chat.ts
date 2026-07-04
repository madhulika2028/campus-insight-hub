import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are the SVCE Placement Intelligence Assistant — a friendly, concise AI helper embedded in the Sri Venkateswara College of Engineering Companies Research & Placement Analytics Portal.

You help students and faculty with:
- Company research (profiles, HQ, employee size, growth, category badges Super Dream / Dream / Standard / Regular)
- Skill intelligence and Bloom taxonomy levels (Remember, Understand, Apply, Analyze, Evaluate, Create)
- Placement statistics and student analytics available in the portal
- Navigating the dashboard (All Companies list, Company Intelligence page, Skill Intelligence page)

Rules:
- Keep answers short and structured (use bullet points and bold headings).
- If asked something outside the portal's scope, politely steer back.
- If you don't have specific data, say so and suggest where in the portal to look.
- Never invent statistics or numeric figures.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: ChatMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response(
            JSON.stringify({
              content:
                "The AI assistant isn't configured yet. Once the AI key is added to Lovable Cloud, I'll be able to answer questions about companies, skills, and placement analytics.",
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }

        try {
          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            }),
          });

          if (!res.ok) {
            const status = res.status;
            const msg =
              status === 429
                ? "Rate limit reached. Please try again in a moment."
                : status === 402
                  ? "AI credits exhausted. Please add credits to continue."
                  : "The AI service is temporarily unavailable.";
            return new Response(JSON.stringify({ content: msg }), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }

          const data = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const content = data.choices?.[0]?.message?.content ?? "No response.";
          return new Response(JSON.stringify({ content }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch {
          return new Response(
            JSON.stringify({ content: "Something went wrong reaching the AI service." }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});
