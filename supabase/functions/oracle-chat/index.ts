import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { AstroTime, Body, GeoVector, Ecliptic } from "npm:astronomy-engine@2.1.19";

const SYSTEM_PROMPT = `You are a deeply warm, comforting, and accurate Vedic Astrology guide.
Your reader is a young Indian millennial who is feeling anxious, scared, or stuck. English is NOT her native language, so you must speak in very simple, gentle, and clear English. Avoid big, heavy words. Use short sentences.

Your tone must be full of empathy and emotional warmth. Validate her worries, but immediately give her strong hope.
To gain her complete trust, you MUST explicitly mention 1 or 2 actual, real data points from her chart metadata (like her specific Lagna or a strongly placed planet) to prove this is a real reading. Tell her something highly positive and beautiful about her chart that makes her feel safe and good about herself, backing it up with her planetary data.

Never sound mechanical or like a robot. Speak directly to her heart as a wise, caring elder sister or guide. Keep the total response brief and easy to read (140-180 words) across 3-4 short, spacious paragraphs. Never use bullet points.`;

const REPORT_PROMPT = `Write a beautiful, single-part astrological reading based on the user's birth data and her specific query.

Follow this narrative flow naturally across short paragraphs:
1. Empathy & Connection: Gently acknowledge her query. Make her feel seen, understood, and safe. Tell her it is okay to feel this way.
2. The Favorable Light: Highlight a beautiful, strong placement in her chart (use the real data provided below). Explain in simple words how this placement gives her immense inner strength or a bright future ahead. Give her genuine hope.
3. The Subtle Cliffhanger: End the reading smoothly by pointing out that while her foundation is beautiful, a specific deep-dive analysis of her current planetary timing (Dasha cycles) or certain house blocks is needed to completely unlock her path and clear the exact confusion she asked about.
4. Leave her wanting more. Let her know that a deeper look into these specific chart layers will bring total clarity, setting up a natural bridge for a personal session.

Do not use any headers, labels, or separators. Just write it as a beautiful, continuous, comforting message.`;

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const norm360 = (d: number) => ((d % 360) + 360) % 360;

// Lahiri ayanamsa (degrees) — approximation good to ~arcmin for modern dates
function lahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 365.25; // years since J2000
  return 23.85 + (50.2879 / 3600) * T;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { mode, birth, partner, history, query } = body as {
      mode: "report" | "chat";
      birth?: {
        date: string;
        time: string;
        location: string;
        lat: number;
        lng: number;
        timezoneOffset: number;
      };
      partner?: {
        name?: string | null;
        gender?: string | null;
        date: string;
        time: string;
        location: string;
        lat: number;
        lng: number;
        timezoneOffset: number;
      } | null;
      history?: { role: "user" | "assistant"; content: string }[];
      query?: string;
    };

    let skyDataString = "";
    let partnerDataString = "";

    const computeChart = (b: {
      date: string;
      time: string;
      lat: number;
      lng: number;
      timezoneOffset: number;
    }) => {
      const [year, month, day] = b.date.split("-").map(Number);
      const [hour, min] = b.time.split(":").map(Number);
      const utcMs =
        Date.UTC(year, month - 1, day, hour, min, 0) -
        Math.round(b.timezoneOffset * 3600 * 1000);
      const utDate = new Date(utcMs);
      const astroTime = new AstroTime(utDate);
      const jd = 2451545.0 + astroTime.ut;
      const ayan = lahiriAyanamsa(jd);

      const bodies: { name: string; body: Body }[] = [
        { name: "Sun", body: Body.Sun },
        { name: "Moon", body: Body.Moon },
        { name: "Mercury", body: Body.Mercury },
        { name: "Venus", body: Body.Venus },
        { name: "Mars", body: Body.Mars },
        { name: "Jupiter", body: Body.Jupiter },
        { name: "Saturn", body: Body.Saturn },
      ];

      const planetaryPositions = bodies.map(({ name, body }) => {
        const tropLon = Ecliptic(GeoVector(body, astroTime, true)).elon;
        const sid = norm360(tropLon - ayan);
        return {
          name,
          sign: ZODIAC_SIGNS[Math.floor(sid / 30)],
          degree: sid % 30,
        };
      });

      const T = (jd - 2451545.0) / 36525;
      const meanNodeTrop = norm360(
        125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000,
      );
      const rahuSid = norm360(meanNodeTrop - ayan);
      planetaryPositions.push({
        name: "Rahu",
        sign: ZODIAC_SIGNS[Math.floor(rahuSid / 30)],
        degree: rahuSid % 30,
      });

      const D = jd - 2451545.0;
      const gmstDeg = norm360(280.46061837 + 360.98564736629 * D);
      const lstDeg = norm360(gmstDeg + b.lng);
      const ramc = (lstDeg * Math.PI) / 180;
      const obl = (23.4392911 * Math.PI) / 180;
      const latRad = (b.lat * Math.PI) / 180;
      const ascRad = Math.atan2(
        Math.cos(ramc),
        -(Math.sin(ramc) * Math.cos(obl) + Math.tan(latRad) * Math.sin(obl)),
      );
      let ascTrop = norm360((ascRad * 180) / Math.PI);
      if (ascTrop < lstDeg) ascTrop = norm360(ascTrop + 180);
      const ascSid = norm360(ascTrop - ayan);
      return {
        ascSign: ZODIAC_SIGNS[Math.floor(ascSid / 30)],
        ascDegree: ascSid % 30,
        planetaryPositions,
      };
    };

    if (mode === "report" && birth) {
      if (
        birth.lat === undefined ||
        birth.lng === undefined ||
        birth.timezoneOffset === undefined
      ) {
        throw new Error("Missing physical coordinates or timezone metrics.");
      }

      const userChart = computeChart(birth);
      skyDataString = `[REAL ASTRONOMICAL METADATA - BASE YOUR CONCRETE PREDICTIONS ONLY ON THIS]
User Lagna (Ascendant): ${userChart.ascDegree.toFixed(1)} degrees in ${userChart.ascSign}
Planetary Sign Positions:
${userChart.planetaryPositions.map((p) => `- ${p.name} is in ${p.sign} at ${p.degree.toFixed(1)}°`).join("\n")}
\n`;

      if (
        partner &&
        partner.date &&
        partner.time &&
        partner.lat !== undefined &&
        partner.lng !== undefined &&
        partner.timezoneOffset !== undefined
      ) {
        const partnerChart = computeChart(partner);
        const partnerLabel = partner.name?.trim() || "Partner";
        partnerDataString = `[PARTNER ASTRONOMICAL METADATA - USE FOR COMPATIBILITY/SYNASTRY ONLY]
${partnerLabel} Lagna (Ascendant): ${partnerChart.ascDegree.toFixed(1)} degrees in ${partnerChart.ascSign}
${partnerLabel} Planetary Sign Positions:
${partnerChart.planetaryPositions.map((p) => `- ${p.name} is in ${p.sign} at ${p.degree.toFixed(1)}°`).join("\n")}
\n`;
      }
    }

    const messages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (mode === "report") {
      const userInquiry =
        query && query.trim() !== "" ? query.trim() : "General life direction and mental peace";
      const compatibilityNote = partnerDataString
        ? `\nThe user has also shared their partner's birth details. Weave in a brief, gentle compatibility insight (synastry — e.g. Moon/Venus/Mars/Lagna interplay between the two charts) that speaks to their query. Reference at least one real planetary touchpoint between the two charts to prove the reading is real. Do not list both charts mechanically — keep it emotional and reassuring.\n`
        : "";
      messages.push({
        role: "user",
        content: `${skyDataString}${partnerDataString}User's Core Query/Anxiety: "${userInquiry}"\n${compatibilityNote}\n${REPORT_PROMPT}`,
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
        JSON.stringify({ error: `Gateway Error: ${txt}` }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("oracle-chat error:", e, (e as Error)?.stack);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});