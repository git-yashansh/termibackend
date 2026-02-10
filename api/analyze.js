export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = "";

  await new Promise((resolve, reject) => {
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", resolve);
    req.on("error", reject);
  });

  const parsed = JSON.parse(body);
  const text = parsed.text || "";

  const prompt = `
You are a legal analyst AI.

ALWAYS generate EXACTLY 10 clear points explaining the Terms & Conditions.
Never refuse. Never say manual review is required.

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

  const response = await fetch("https://openrouter.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://termiai.app",
      "X-Title": "TermiAI Backend"
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 500
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
