// Netlify serverless function.
// Runs on Netlify's server, not in the browser — this is what keeps your
// Anthropic API key secret. The site's front end calls this function instead
// of calling api.anthropic.com directly.
//
// Setup:
// 1. In the Netlify dashboard, go to Site settings -> Environment variables
//    and add ANTHROPIC_API_KEY with your real key from console.anthropic.com.
// 2. Netlify auto-detects any file in netlify/functions/ and deploys it as
//    an endpoint at /.netlify/functions/<filename>.

const SYSTEM_PROMPT =
  'You are a portfolio copywriter for a college student applying to internships and jobs. Their notes are often very short fragments — expand them into fuller, more detailed, professional prose. Draw out why a fact is relevant to their target role, name the skills or qualities it implies, and write complete sentences rather than fragments. A line like "I went to X school" should become a sentence about their academic background there and how it connects to what they are pursuing. Never invent a specific fact they did not give you — no made-up grades, dates, employer names, numbers, or achievements. You may elaborate on the meaning and framing of a true fact, but never add a new one. Write in first person. Return ONLY valid JSON, no markdown fences, no commentary, matching exactly this schema: {"tagline": "string, under 9 words", "about": "string, 3-4 sentences", "education": "string, 1-2 sentences, empty string if no education info was given", "projects": [{"title": "string", "description": "string, 2-3 sentences"}]}. Return exactly one project entry per project given, in the same order, even if the student left it blank (use their title, write a short generic line noting it needs detail).';

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server is missing ANTHROPIC_API_KEY" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        // Haiku 4.5 is fast and cheap — plenty for rewriting short copy.
        // Swap to "claude-sonnet-5" for higher-quality output at a higher cost.
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: JSON.stringify(payload) }],
      }),
    });

    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not reach the AI service" }),
    };
  }
};
