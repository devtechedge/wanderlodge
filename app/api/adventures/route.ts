import { NextRequest, NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { GoogleGenAI, Type } from "@google/genai";

// Curated high-fidelity local fallbacks for each default lodge
const FALLBACK_ADVENTURES: Record<string, Array<{
  title: string;
  type: string;
  distance: string;
  description: string;
  link: string;
  difficulty?: string;
}>> = {
  "prop-1": [
    {
      title: "Eldorado Peak Summit Trail",
      type: "Hiking",
      distance: "1.2 miles away",
      description: "A rugged, pine-shaded alpine ascent leading directly to a dramatic 360-degree overlook of the Pinecrest ridge. Exceptional for viewing mountain sunsets.",
      link: "https://www.google.com/search?q=Pinecrest+Valley+Oregon+hiking+trails",
      difficulty: "Moderate"
    },
    {
      title: "Whispering Pines Creek Fly Fishing",
      type: "Fly Fishing",
      distance: "0.5 miles away",
      description: "A silent stretch of crystalline water stocked with native rainbow trout. Instructors and premium cedar rods can be organized via your host.",
      link: "https://www.google.com/search?q=Pinecrest+Valley+Oregon+fishing",
      difficulty: "Easy"
    },
    {
      title: "Timberline Ridge Hot Springs",
      type: "Scenic Wellness",
      distance: "3.4 miles away",
      description: "Bespoke, natural rock-carved thermal pools heated by geothermal vents. Features a small wooden sauna house next to the cascading stream.",
      link: "https://www.google.com/search?q=Oregon+cascade+hot+springs",
      difficulty: "Easy"
    }
  ],
  "prop-2": [
    {
      title: "Sunset Bay Canoe Loop",
      type: "Kayaking & Canoeing",
      distance: "Direct access from private dock",
      description: "Paddle along the glassy shorelines of Sunset Bay, tracing the scenic nesting grounds of blue herons and bald eagles. High-contrast wooden canoes are included with the lodge.",
      link: "https://www.google.com/search?q=Sunset+Bay+Oregon+kayaking",
      difficulty: "Easy"
    },
    {
      title: "Lakeside Salmon Smokehouse",
      type: "Dining",
      distance: "2.1 miles away",
      description: "A rustic, shore-side culinary landmark famous for wood-fired cedar-plank sockeye salmon, wild huckleberry cobbler, and locally crafted Oregon ciders.",
      link: "https://www.google.com/search?q=Sunset+Bay+Oregon+restaurants",
      difficulty: "Easy"
    },
    {
      title: "Mossy Rock Lighthouse Trail",
      type: "Walking",
      distance: "1.5 miles away",
      description: "A gentle beachfront timber boardwalk that guides you through windswept salt-pines to a historic 1880s stone signal beacon. Ideal for twilight photography.",
      link: "https://www.google.com/search?q=Sunset+Bay+Oregon+lighthouse+trail",
      difficulty: "Easy"
    }
  ],
  "prop-3": [
    {
      title: "Mossy Glen Canopy Walk",
      type: "Eco-Adventure",
      distance: "Directly outside your treehouse",
      description: "A stunning network of secure timber suspension bridges suspended 15 feet high in the canopy of old-growth Douglas firs. Built exclusively for our guests.",
      link: "https://www.google.com/search?q=Mossy+Glen+Woods+canopy+walk",
      difficulty: "Easy"
    },
    {
      title: "Hidden Waterfall Plunge",
      type: "Scenic Point",
      distance: "0.8 miles away",
      description: "A secluded emerald pool fed by a roaring 40-foot mountain cascade, completely insulated by giant ferns and mossy basalt arches. A perfect reward for a short trek.",
      link: "https://www.google.com/search?q=Mossy+Glen+Woods+waterfalls",
      difficulty: "Moderate"
    },
    {
      title: "Fern Forest Mountain Biking",
      type: "Mountain Biking",
      distance: "1.2 miles away",
      description: "Fast-flowing dirt singletracks snaking through ancient giant redwood groves and moss-covered rock drops. Premium full-suspension bikes can be reserved.",
      link: "https://www.google.com/search?q=Oregon+mountain+bike+trails+woods",
      difficulty: "Strenuous"
    }
  ],
  "prop-4": [
    {
      title: "Slate Canyon Basalt Gorge Hike",
      type: "Hiking",
      distance: "2.0 miles away",
      description: "Scramble through dark basalt volcanic columns and deep slot canyons where glacial waters flow. Sturdy waterproof footwear and trekking poles recommended.",
      link: "https://www.google.com/search?q=Slate+Canyon+Oregon+basalt+hike",
      difficulty: "Strenuous"
    },
    {
      title: "Alpine Sunken Springs",
      type: "Scenic Wellness",
      distance: "4.2 miles away",
      description: "Soak in mineral-rich, sulfur-free volcanic thermal springs nestled in alpine meadows with towering views of the snowy mountain peaks.",
      link: "https://www.google.com/search?q=Oregon+alpine+thermal+springs",
      difficulty: "Easy"
    },
    {
      title: "Glacier Valley Snowshoeing",
      type: "Snowshoeing",
      distance: "0.5 miles away",
      description: "A breathtaking winter trail that traces old glacial moraines and snowy meadows under the mountain's shadow. Snowshoes are provided in the chalet gear-room.",
      link: "https://www.google.com/search?q=Oregon+glacier+valley+snowshoeing",
      difficulty: "Moderate"
    }
  ],
  "prop-5": [
    {
      title: "Echo Bay Glass-Bottom Kayaking",
      type: "Kayaking",
      distance: "Direct access",
      description: "Glide over submerged timber gardens and watch schools of lake trout in ultra-clear glacier waters. Tandem glass-bottom kayaks are anchored right at your dock.",
      link: "https://www.google.com/search?q=Echo+Bay+Oregon+kayaking",
      difficulty: "Easy"
    },
    {
      title: "Whiskey Point Sunset Lookout",
      type: "Scenic Point",
      distance: "1.8 miles away",
      description: "The highest rocky bluff overlooking Echo Bay. Features a panoramic vista of the surrounding peak chains, making it the supreme sunset viewing site.",
      link: "https://www.google.com/search?q=Echo+Bay+Oregon+sunset+lookout",
      difficulty: "Easy"
    },
    {
      title: "Bayview Brew Lodge & Eatery",
      type: "Dining",
      distance: "0.9 miles away",
      description: "A local waterfront micro-brewery with a floating timber terrace. Known for its craft IPAs, hand-tossed sourdough wood-fired pizzas, and live acoustic music.",
      link: "https://www.google.com/search?q=Echo+Bay+Oregon+brewery",
      difficulty: "Easy"
    }
  ]
};

// Default generic fallback if property ID is unrecognized
const GENERIC_FALLBACK = [
  {
    title: "Mountain Ridge Loop Hike",
    type: "Hiking",
    distance: "1.5 miles away",
    description: "A stunning pine-canopied loop providing expansive valley vistas and clean alpine air.",
    link: "https://www.google.com/search?q=Oregon+mountain+ridge+hiking",
    difficulty: "Moderate"
  },
  {
    title: "River Glen Kayaking",
    type: "Water Adventure",
    distance: "0.8 miles away",
    description: "A tranquil paddle along the calm local creek, featuring beautiful forests and local wildlife.",
    link: "https://www.google.com/search?q=Oregon+river+kayak+rentals",
    difficulty: "Easy"
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    const db = readDB();
    const property = db.properties.find((p) => p.id === propertyId);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Lazy initialization of Gemini client
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Check if key exists and is not a placeholder
    const isKeyConfigured = Boolean(apiKey) && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "YOUR_API_KEY" && apiKey?.trim() !== "";

    if (!isKeyConfigured) {
      // Return curated fallback gracefully
      const fallbacks = FALLBACK_ADVENTURES[propertyId] || GENERIC_FALLBACK;
      return NextResponse.json({
        adventures: fallbacks,
        grounded: false,
        source: "Curated EliteProvider Specs (Demo Fallback)"
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Construct a dynamic, descriptive prompt with coordinates and regional name
      const prompt = `You are the local adventure concierge for WanderLodge, an elite lodging network.
Generate a list of 3 highly tailored, real-world outdoor adventures, local culinary gems, or scenic points of interest located immediately near "${property.title}" in ${property.location}, Oregon.

Geographic Grounding Context:
- Property Coordinates: Latitude ${property.lat}, Longitude ${property.lng}
- Property Location Description: ${property.location}
- Property Theme: ${property.description}

Requirements:
1. Use the googleSearch grounding tool to find ACTUAL real-life outdoor trails, lakes, kayak docks, hot springs, view points, or legendary local diners near these coordinates (in the Mount Hood or Oregon cascades regions depending on ${property.location}).
2. Ensure each adventure feels completely integrated with the lodge's unique vibe (e.g., water sports for waterfront houses, hiking/snowshoeing for mountain cabins, tree walks for treehouses).
3. Provide precise distances or driving times from the lodge.
4. Provide a descriptive link to a reputable search page or source page.
5. Return the response strictly matching the requested JSON schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              adventures: {
                type: Type.ARRAY,
                description: "List of 3 local adventures grounded in real search results.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Name of the local adventure, trail, viewpoint, or eatery." },
                    type: { type: Type.STRING, description: "Category, e.g., Hiking, Kayaking, Scenic Point, Dining, Snowshoeing." },
                    distance: { type: Type.STRING, description: "Estimated distance or drive time from the property." },
                    description: { type: Type.STRING, description: "Polished, evocative paragraph describing what to do and why it is incredible." },
                    link: { type: Type.STRING, description: "Google Search query link or specific source URL supporting this location." },
                    difficulty: { type: Type.STRING, description: "Level of physical challenge: Easy, Moderate, or Strenuous." },
                  },
                  required: ["title", "type", "distance", "description", "link"]
                }
              }
            },
            required: ["adventures"]
          }
        }
      });

      const rawText = response.text?.trim() || "";
      if (rawText) {
        const parsed = JSON.parse(rawText);
        
        // Extract any grounding metadata for the UI to display verified sources
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const verifiedSources = groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title,
          uri: chunk.web?.uri
        })).filter((src: any) => src.title && src.uri).slice(0, 3) || [];

        return NextResponse.json({
          adventures: parsed.adventures,
          grounded: true,
          source: "Google Search Grounding Engine",
          verifiedSources
        });
      }

      throw new Error("Empty response from Gemini API");
    } catch (apiError) {
      console.error("Gemini API call failed, falling back to curated data", apiError);
      const fallbacks = FALLBACK_ADVENTURES[propertyId] || GENERIC_FALLBACK;
      return NextResponse.json({
        adventures: fallbacks,
        grounded: false,
        source: "Curated EliteProvider Specs (API Fallback)",
        error: apiError instanceof Error ? apiError.message : "API Error"
      });
    }
  } catch (error) {
    console.error("Adventures API route error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
