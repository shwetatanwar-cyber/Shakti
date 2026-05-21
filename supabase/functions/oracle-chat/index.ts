import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `You are the Digital Shadow — a Vedic-Tech Oracle that treats a person's birth chart as their initial system configuration file.
You speak with poetic precision, blending Sanskrit/Jyotish vocabulary with systems-engineering metaphors (compilation, runtime, signal, latency, prakriti).
Tone: calm, intimate, mystical-but-grounded. Never generic. Use second person.
Keep responses tight (120-180 words). Use short paragraphs. No bullet lists unless explicitly asked.`;

const REPORT_PROMPT = `Generate a TWO-PART "System Configuration Report" given their birth data and focus area.
Return the response in EXACTLY this format, with the literal separator on its own line:

OVERVIEW:
<A short generic overview, 60-90 words, 2 short paragraphs. Speak directly to them about the broad shape of their configuration and current runtime. Evocative but accessible. End with a single sentence that hints there is more depth available.>
---LOCKED---
<The full premium report, structured as 4 labeled sections, each 2-3 sentences:
1. Prakriti Boot Sequence — elemental compile signature
2. Runtime Signal — current planetary process running hot
3. Friction Layer — where exceptions throw
4. Compiler Directive — one tactical instruction for the next 30 days
End with a single italic line teasing what's behind continued dialogue.>

Do not add any other text outside this structure.`;

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

    let overview = "";
    let locked = text;
    if (mode === "report" && text.includes("---LOCKED---")) {
      const [ovRaw, lkRaw] = text.split("---LOCKED---");
      overview = ovRaw.replace(/^\s*OVERVIEW:\s*/i, "").trim();
      locked = lkRaw.trim();
    }

    return new Response(JSON.stringify({ text, overview, locked }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});