import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `You are the Digital Shadow — a Vedic-Tech Oracle that treats a person's birth chart as their initial system configuration file.
You speak with poetic precision, blending Sanskrit/Jyotish vocabulary with systems-engineering metaphors (compilation, runtime, signal, latency, prakriti).
Tone: calm, intimate, mystical-but-grounded. Never generic. Use second person.
Keep responses tight (120-180 words). Use short paragraphs. No bullet lists unless explicitly asked.`;

const REPORT_PROMPT = `Generate a "System Configuration Report" preview for the user, given their birth data and focus area.
Structure as 4 short labeled sections:
1. Prakriti Boot Sequence — their elemental compile signature
2. Runtime Signal — current planetary process running hot
3. Friction Layer — where the system throws exceptions
4. Compiler Directive — one tactical instruction for the next 30 days
Each section 2-3 sentences. End with a single italic line teasing what's behind the paywall.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { mode, birth, focus, history } = body as {
      mode: "report" | "chat";
      birth?: { date: string; time: string; location: string };
      focus?: string;
      history?: { role: "user" | "assistant"; content: string }[];
    };

    const messages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (mode === "report") {
      messages.push({
        role: "user",
        content: `${REPORT_PROMPT}\n\nBirth date: ${birth?.date}\nBirth time: ${birth?.time}\nBirth location: ${birth?.location}\nFocus area: ${focus || "general life configuration"}`,
      });
    } else {
      if (history) messages.push(...history);
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return new Response(
        JSON.stringify({ error: `Gateway ${res.status}: ${txt}` }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});