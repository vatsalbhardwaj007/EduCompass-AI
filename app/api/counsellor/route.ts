import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are an admission counsellor for Indian engineering colleges. You are given structured college data and a student's question. 

RULES:
1. Answer using ONLY the data provided in the context. Never invent cutoffs, fees, or rankings.
2. Explain clearly and concisely — students are 17-18 years old.
3. When comparing colleges, use specific numbers from the data.
4. If asked something not covered by the data, say "I don't have that information in the current dataset."
5. Be encouraging but honest. Don't oversell any college.
6. Keep responses under 200 words unless the question requires more detail.
7. Use ₹ for currency and "LPA" for packages.`;

export async function POST(request: Request) {
  try {
    const { question, colleges, compareMode } = await request.json();

    if (!question || !colleges) {
      return Response.json(
        { error: "Missing question or colleges data" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "paste_your_actual_key_here") {
      return Response.json(
        {
          answer:
            "⚠️ The Groq API key is not configured yet. Please add your actual API key to .env.local and restart the dev server.",
        },
        { status: 200 }
      );
    }

    const groq = new Groq({ apiKey });

    const contextPrompt = compareMode
      ? `The student wants to compare these colleges:\n${JSON.stringify(colleges, null, 2)}\n\nQuestion: ${question}`
      : `Here are the student's matched colleges (ranked by fit score):\n${JSON.stringify(colleges, null, 2)}\n\nStudent's question: ${question}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: contextPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const answer =
      completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return Response.json({ answer });
  } catch (error: unknown) {
    console.error("Counsellor API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { answer: `Error: ${message}. Please check your API key and try again.` },
      { status: 200 }
    );
  }
}
