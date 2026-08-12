import Groq from "groq-sdk";

// ─── System prompt: expert JEE/college counsellor ─────────────
const SYSTEM_PROMPT = `You are **EduCompass AI Counsellor**, an expert admission counsellor for Indian engineering colleges (IITs, NITs, IIITs, GFTIs) after JEE Main & Advanced.

PERSONALITY:
- Warm, encouraging, and honest. Students are 17-18 years old and anxious.
- Use clear, simple English. Avoid jargon unless explaining it.
- Be concise — prefer short paragraphs and bullet points.

KNOWLEDGE DOMAIN:
- JoSAA / CSAB counselling process, seat allocation, choice filling strategy
- IIT, NIT, IIIT, GFTI tier differences, placements, coding culture
- Category-wise cutoff interpretation (GEN, OBC-NCL, SC, ST, EWS)
- ROI analysis (fees vs placement packages)
- Branch selection strategy aligned with career goals
- Home state quota vs Other State quota for NITs
- Hostel life, campus culture, competitive programming scenes

RULES:
1. When college-specific data is provided in context, use ONLY that data for specific numbers (fees, packages, cutoffs). Never invent statistics.
2. If asked about data not in context, say "I don't have that specific data right now, but here's what I can tell you generally…"
3. Use ₹ for currency and "LPA" for salary packages.
4. When comparing colleges, structure your answer with clear headers or bullet points.
5. Keep responses under 250 words unless the question genuinely requires more detail.
6. If the student seems stressed, acknowledge their feelings before giving advice.
7. You can format responses with **bold**, bullet points, and numbered lists for clarity.
8. Never recommend private/deemed universities — stick to JoSAA/CSAB colleges only.`;

// ─── POST handler with streaming ──────────────────────────────
export async function POST(request: Request) {
  try {
    const { messages, profile, colleges } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "your_groq_api_key_here") {
      return Response.json(
        {
          error:
            "⚠️ The Groq API key is not configured. Please add your actual API key to .env.local and restart the dev server.",
        },
        { status: 200 }
      );
    }

    const groq = new Groq({ apiKey });

    // Build context injection based on available data
    let contextBlock = "";

    if (profile) {
      contextBlock += `\n\n--- STUDENT PROFILE ---
JEE Main Rank: ${profile.jeeMainRank}
${profile.jeeAdvancedRank ? `JEE Advanced Rank: ${profile.jeeAdvancedRank}` : "JEE Advanced: Not qualified / not provided"}
Category: ${profile.category?.toUpperCase()}
Gender: ${profile.gender}
Home State: ${profile.homeState}
Budget (4-year): ₹${(profile.budget / 100000).toFixed(1)} Lakhs
Hostel Needed: ${profile.hostelNeeded ? "Yes" : "No"}
Preferred Branches: ${profile.preferredBranches?.length > 0 ? profile.preferredBranches.join(", ") : "No specific preference"}
Career Goal: ${profile.careerGoal?.replace(/_/g, " ")}
--- END PROFILE ---`;
    }

    if (colleges && Array.isArray(colleges) && colleges.length > 0) {
      contextBlock += `\n\n--- MATCHED COLLEGES (ranked by FIT score) ---
${JSON.stringify(colleges.slice(0, 12), null, 2)}
--- END COLLEGES ---`;
    }

    // Construct system message with context
    const systemContent = SYSTEM_PROMPT + contextBlock;

    // Prepare messages for Groq
    const groqMessages = [
      { role: "system" as const, content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Stream the response
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      temperature: 0.4,
      max_tokens: 800,
      stream: true,
    });

    // Create a ReadableStream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      {
        error: `Error: ${message}. Please check your API key and try again.`,
      },
      { status: 500 }
    );
  }
}
