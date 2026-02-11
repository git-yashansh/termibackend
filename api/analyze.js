export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "No text provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `
You are a legal analyst AI.

IMPORTANT RULES:
- You MUST generate EXACTLY 5 numbered points.
- Do NOT generate more than 5.
- Do NOT generate less than 5.
- If you generate 6 or more points, the answer is incorrect.
- Points must be numbered 1 to 5 only.

IMPORTANT:
Generate ONLY 5 numbered points.
Do not generate more than 5.
Stop after point 5.


FORMAT EXACTLY:

1. Point
2. Point
3. Point
4. Point
5. Point

FINAL_RECOMMENDATION: ACCEPT / REJECT / PROCEED WITH CAUTION
FINAL_REASON: one short sentence

Terms & Conditions:
${text.substring(0, 800)}
`;

    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 300
      })
    });

    const data = await aiRes.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      return new Response(
        JSON.stringify({ error: "Invalid AI response", details: data }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
