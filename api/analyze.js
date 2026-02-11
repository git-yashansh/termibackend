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

ALWAYS generate EXACTLY 10 clear points explaining the Terms & Conditions.
Never refuse.

FORMAT:

1.
2.
3.
4.
5.
6.
7.
8.
9.
10.

FINAL_RECOMMENDATION: ACCEPT / REJECT / PROCEED WITH CAUTION
FINAL_REASON: one short sentence

Terms & Conditions:
${text.substring(0, 1200)}
`;

    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 700
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
