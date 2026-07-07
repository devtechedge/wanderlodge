import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { imageName } = await req.json();
    if (!imageName) {
      return NextResponse.json({ error: "Missing imageName" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        commonName: imageName,
        botanicalName: "Mentha arvensis (Simulated)",
        safe: "Yes",
        safetyWarning: "Always wash thoroughly under safe, certified drinking tap water before consumption.",
        flavorProfile: "Cool, sweet, herbal with crisp cooling undertones.",
        culinaryUses: "Excellent for wildberry teas, muddled summer mocktails, or crushed into morning fire-pit trout dressings.",
        quickRecipe: "Wild Mint Campfire Butter: Mix crushed mint leaves, local honey, and sea salt into softened butter; spread over wood-fired bannock bread."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `You are a professional subalpine botanist and wilderness culinary expert.
Identify this wild garden herb/plant: "${imageName}".
Explain if it is safe for culinary seasoning, its flavor profile, botanical name, typical garden environment, and a quick tip/recipe for using it.
Response MUST be in JSON format matching this schema:
{
  "botanicalName": "string",
  "commonName": "string",
  "safe": "Yes" | "No" | "Caution",
  "safetyWarning": "string detailing any caution or warning",
  "flavorProfile": "string describing taste/aroma",
  "culinaryUses": "string detailing how to use in cabin cooking",
  "quickRecipe": "string for a quick fire-pit seasoning or butter infusion"
}
Provide strictly valid JSON. Do not wrap with markdown blocks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Identify herb error:", error);
    return NextResponse.json({
      commonName: "Wild Mountain Herb",
      botanicalName: "Botanical Unknown",
      safe: "Caution",
      safetyWarning: "Could not establish high-confidence match via satellite link. Cross-reference with the physical local foraging manual in your cabin library.",
      flavorProfile: "Unknown",
      culinaryUses: "Do not consume unless verified by physical manual.",
      quickRecipe: "Check physical subalpine handbook."
    });
  }
}
