import { NextRequest, NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = readDB();

    const property = db.properties.find((p) => p.id === id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Get Provider Details
    const provider = db.users.find((u) => u.id === property.providerId);
    const providerInfo = provider
      ? { name: provider.name, image: provider.image, id: provider.id }
      : { name: "Elite Provider", image: "https://picsum.photos/seed/default/150/150", id: "" };

    // Get Reviews for this Property, enriched with author info
    const reviews = db.reviews
      .filter((r) => r.propertyId === id)
      .map((r) => {
        const author = db.users.find((u) => u.id === r.authorId);
        return {
          ...r,
          authorName: author ? author.name : "Wanderer",
          authorImage: author ? author.image : "https://picsum.photos/seed/default/150/150",
        };
      });

    return NextResponse.json({
      property,
      provider: providerInfo,
      reviews,
    });
  } catch (error) {
    console.error("Property GET [id] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
