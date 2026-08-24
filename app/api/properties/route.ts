import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Property } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { filterProperties, filtersFromSearchParams } from "@/lib/filters";
import { canCreateListing } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const db = readDB();
    const properties = filterProperties(db.properties, filtersFromSearchParams(searchParams));
    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Properties GET error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !canCreateListing(user)) {
      return NextResponse.json({ error: "Unauthorized. Must be a Provider." }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, price, location, amenities, maxGuests, images, ecoScore, carbonFootprint, ecoAmenities, hasEVCharging, chargingType } = body;

    if (!title || !description || !price || !location || !maxGuests) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = readDB();

    // Auto-generate some coordinates inside our canvas map's bounding box
    // (center around Lat: 45.15, Lng: -121.60 with small random offsets)
    const lat = 45.10 + Math.random() * 0.15;
    const lng = -121.75 + Math.random() * 0.30;

    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      title,
      description,
      price: parseFloat(price),
      location,
      lat: parseFloat(lat.toFixed(4)),
      lng: parseFloat(lng.toFixed(4)),
      images: images && images.length > 0 ? images : ["https://picsum.photos/seed/newlodge/1200/800"],
      amenities: amenities || [],
      maxGuests: parseInt(maxGuests, 10),
      providerId: user.id,
      createdAt: new Date().toISOString(),
      ecoScore: ecoScore ? parseInt(ecoScore, 10) : 80,
      carbonFootprint: carbonFootprint ? parseFloat(carbonFootprint) : 5.0,
      ecoAmenities: ecoAmenities || ["LED Energy Star bulbs"],
      hasEVCharging: !!hasEVCharging,
      chargingType: chargingType || "",
      ecoPledged: false,
    };

    db.properties.push(newProperty);
    writeDB(db);

    return NextResponse.json({ property: newProperty });
  } catch (error) {
    console.error("Properties POST error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
