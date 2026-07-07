import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Message } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reservationId = searchParams.get("reservationId");

    if (!reservationId) {
      return NextResponse.json({ error: "Missing reservationId" }, { status: 400 });
    }

    const db = readDB();
    const reservation = db.reservations.find((r) => r.id === reservationId);
    
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const property = db.properties.find((p) => p.id === reservation.propertyId);
    const providerId = property?.providerId;

    // Check permissions
    if (reservation.travelerId !== user.id && providerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to chat" }, { status: 403 });
    }

    // Find and return messages
    const threadMessages = db.messages
      .filter((m) => m.reservationId === reservationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Enrich messages with sender info
    const enriched = threadMessages.map((msg) => {
      const sender = db.users.find((u) => u.id === msg.senderId);
      return {
        ...msg,
        senderName: sender ? sender.name : "Wanderer",
        senderImage: sender ? sender.image : "",
      };
    });

    return NextResponse.json({ messages: enriched });
  } catch (error) {
    console.error("Messages GET error", error);
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
    const { reservationId, content } = body;

    if (!reservationId || !content || content.trim() === "") {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const db = readDB();
    const reservation = db.reservations.find((r) => r.id === reservationId);

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const property = db.properties.find((p) => p.id === reservation.propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const travelerId = reservation.travelerId;
    const providerId = property.providerId;

    // Authorize sender
    if (user.id !== travelerId && user.id !== providerId) {
      return NextResponse.json({ error: "Unauthorized to send messages" }, { status: 403 });
    }

    // Determine receiver
    const receiverId = user.id === travelerId ? providerId : travelerId;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId,
      reservationId,
      content,
      timestamp: new Date().toISOString(),
    };

    db.messages.push(newMessage);
    writeDB(db);

    const sender = db.users.find((u) => u.id === user.id);
    const enrichedMessage = {
      ...newMessage,
      senderName: sender ? sender.name : "Wanderer",
      senderImage: sender ? sender.image : "",
    };

    return NextResponse.json({ message: enrichedMessage });
  } catch (error) {
    console.error("Messages POST error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
