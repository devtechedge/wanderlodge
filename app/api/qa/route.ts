import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, QA, QAAnswer, Role } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { GoogleGenAI } from "@google/genai";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId parameter" }, { status: 400 });
    }

    const db = readDB();
    const propertyQAs = (db.qas || []).filter((q) => q.propertyId === propertyId);

    // Sort by newest question first
    propertyQAs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ qas: propertyQAs });
  } catch (error) {
    console.error("QA GET error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, action, question, questionId, text } = body;

    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
    }

    const db = readDB();
    const property = db.properties.find((p) => p.id === propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Initialize qas if undefined
    if (!db.qas) {
      db.qas = [];
    }

    // 1. Ask a new question
    if (action === "ask") {
      if (!question || question.trim() === "") {
        return NextResponse.json({ error: "Question text is required" }, { status: 400 });
      }

      const newQA: QA = {
        id: `qa-${Date.now()}`,
        propertyId,
        question: question.trim(),
        authorName: user.name,
        authorImage: user.image,
        answers: [],
        createdAt: new Date().toISOString(),
      };

      db.qas.push(newQA);
      writeDB(db);

      return NextResponse.json({ qa: newQA });
    }

    // 2. Answer an existing question (by host or fellow traveler)
    if (action === "answer") {
      if (!questionId || !text || text.trim() === "") {
        return NextResponse.json({ error: "Missing questionId or answer text" }, { status: 400 });
      }

      const qaIndex = db.qas.findIndex((q) => q.id === questionId && q.propertyId === propertyId);
      if (qaIndex === -1) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }

      // Determine the answering user's role relative to this property
      const role = user.id === property.providerId ? Role.PROVIDER : Role.TRAVELER;

      const newAnswer: QAAnswer = {
        id: `qaa-${Date.now()}`,
        authorName: user.name,
        authorImage: user.image,
        role,
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };

      db.qas[qaIndex].answers.push(newAnswer);
      writeDB(db);

      return NextResponse.json({ qa: db.qas[qaIndex] });
    }

    // 3. Trigger AI Concierge Answer (using Gemini API)
    if (action === "ask-ai") {
      if (!questionId) {
        return NextResponse.json({ error: "Missing questionId for AI assist" }, { status: 400 });
      }

      const qaIndex = db.qas.findIndex((q) => q.id === questionId && q.propertyId === propertyId);
      if (qaIndex === -1) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }

      const currentQA = db.qas[qaIndex];

      // Check if AI answer already exists to prevent duplicate generation
      const alreadyHasAI = currentQA.answers.some((ans) => ans.role === "AI_CONCIERGE");
      if (alreadyHasAI) {
        return NextResponse.json({ qa: currentQA, warning: "AI has already responded to this question." });
      }

      let aiResponseText = "";
      try {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error("GEMINI_API_KEY environment variable is not defined");
        }

        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const prompt = `You are the AI Lodge Concierge for '${property.title}' located in '${property.location}'.
Property Description: ${property.description}
Amenities: ${property.amenities.join(", ")}

A traveler has asked this question: '${currentQA.question}'

Answer the question in a highly helpful, concise, and professional tone (maximum 2-3 short, friendly sentences).
Ground your answer purely in the property's actual details above.
If the details do not mention the answer, do not invent anything. Instead, say that you've queued this for the host (${db.users.find(u => u.id === property.providerId)?.name || "Evelyn"}), but provide any helpful general info or mention related amenities.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        aiResponseText = response.text || "I have received your question and forwarded it to our verified host for an immediate response! Thank you for inquiring.";
      } catch (genError) {
        console.error("Gemini Q&A assist generation error:", genError);
        aiResponseText = `I have logged this question for our verified host, ${db.users.find(u => u.id === property.providerId)?.name || "Evelyn"}. They will get back to you shortly! In the meantime, feel free to explore our ${property.amenities.slice(0, 3).join(", ")} and other verified features.`;
      }

      const aiAnswer: QAAnswer = {
        id: `qaa-ai-${Date.now()}`,
        authorName: "AI Concierge Assist",
        authorImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
        role: "AI_CONCIERGE",
        content: aiResponseText.trim(),
        createdAt: new Date().toISOString(),
      };

      db.qas[qaIndex].answers.push(aiAnswer);
      writeDB(db);

      return NextResponse.json({ qa: db.qas[qaIndex] });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("QA POST error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
