import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Property } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const db = readDB();
    let properties = [...db.properties];

    // Filter by Location
    const location = searchParams.get("location");
    if (location && location.trim() !== "") {
      const locLower = location.toLowerCase().trim();
      properties = properties.filter(
        (p) =>
          p.location.toLowerCase().includes(locLower) ||
          p.title.toLowerCase().includes(locLower) ||
          p.description.toLowerCase().includes(locLower)
      );
    }

    // Filter by Guests
    const guests = searchParams.get("guests");
    if (guests) {
      const guestNum = parseInt(guests, 10);
      if (!isNaN(guestNum)) {
        properties = properties.filter((p) => p.maxGuests >= guestNum);
      }
    }

    // Filter by Min Price
    const minPrice = searchParams.get("minPrice");
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        properties = properties.filter((p) => p.price >= min);
      }
    }

    // Filter by Max Price
    const maxPrice = searchParams.get("maxPrice");
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        properties = properties.filter((p) => p.price <= max);
      }
    }

    // Filter by Amenities (comma-separated list)
    const amenitiesStr = searchParams.get("amenities");
    if (amenitiesStr && amenitiesStr.trim() !== "") {
      const requestedAmenities = amenitiesStr.split(",").map((a) => a.trim().toLowerCase());
      properties = properties.filter((p) => {
        const pAmenitiesLower = p.amenities.map((a) => a.toLowerCase());
        return requestedAmenities.every((reqA) => pAmenitiesLower.includes(reqA));
      });
    }

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Properties GET error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized. Must be a Provider." }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, price, location, amenities, maxGuests, images } = body;

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
    };

    db.properties.push(newProperty);
    writeDB(db);

    return NextResponse.json({ property: newProperty });
  } catch (error) {
    console.error("Properties POST error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
