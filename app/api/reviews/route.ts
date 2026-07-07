import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Review } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, comment, ratingClean, ratingComm, ratingLoc, ratingValue } = body;

    if (!propertyId || !comment || comment.trim() === "") {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const clean = parseFloat(ratingClean) || 5;
    const comm = parseFloat(ratingComm) || 5;
    const loc = parseFloat(ratingLoc) || 5;
    const val = parseFloat(ratingValue) || 5;
    const average = parseFloat(((clean + comm + loc + val) / 4).toFixed(2));

    const db = readDB();

    // Verify property exists
    const property = db.properties.find((p) => p.id === propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      propertyId,
      authorId: user.id,
      comment: comment.trim(),
      ratingClean: clean,
      ratingComm: comm,
      ratingLoc: loc,
      ratingValue: val,
      ratingAverage: average,
      createdAt: new Date().toISOString(),
    };

    db.reviews.push(newReview);
    writeDB(db);

    const enrichedReview = {
      ...newReview,
      authorName: user.name,
      authorImage: user.image,
    };

    return NextResponse.json({ review: enrichedReview });
  } catch (error) {
    console.error("Reviews POST error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
