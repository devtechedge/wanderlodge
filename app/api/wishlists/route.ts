import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Wishlist } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = readDB();
    const wishlists = db.wishlists.filter((w) => w.userId === user.id);

    // Enrich wishlists with full property objects
    const enriched = wishlists.map((w) => {
      const savedProperties = db.properties.filter((p) => w.propertyIds.includes(p.id));
      return {
        ...w,
        properties: savedProperties,
      };
    });

    return NextResponse.json({ wishlists: enriched });
  } catch (error) {
    console.error("Wishlists GET error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;
    const db = readDB();

    if (action === "create") {
      const { name } = body;
      if (!name || name.trim() === "") {
        return NextResponse.json({ error: "Wishlist name is required" }, { status: 400 });
      }

      const newWishlist: Wishlist = {
        id: `wish-${Date.now()}`,
        userId: user.id,
        name: name.trim(),
        propertyIds: [],
      };

      db.wishlists.push(newWishlist);
      writeDB(db);

      return NextResponse.json({ wishlist: { ...newWishlist, properties: [] } });
    }

    if (action === "toggle") {
      const { wishlistId, propertyId } = body;
      if (!wishlistId || !propertyId) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }

      const wishlistIndex = db.wishlists.findIndex((w) => w.id === wishlistId && w.userId === user.id);
      if (wishlistIndex === -1) {
        return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
      }

      const list = db.wishlists[wishlistIndex];
      const pIndex = list.propertyIds.indexOf(propertyId);

      if (pIndex === -1) {
        list.propertyIds.push(propertyId);
      } else {
        list.propertyIds.splice(pIndex, 1);
      }

      db.wishlists[wishlistIndex] = list;
      writeDB(db);

      const savedProperties = db.properties.filter((p) => list.propertyIds.includes(p.id));
      return NextResponse.json({
        wishlist: {
          ...list,
          properties: savedProperties,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Wishlists POST error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
