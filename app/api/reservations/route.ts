import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Reservation, ReservationStatus, Role } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = readDB();
    
    if (user.role === Role.TRAVELER) {
      // Return traveler's own bookings
      const travelerReservations = db.reservations
        .filter((r) => r.travelerId === user.id)
        .map((res) => {
          const property = db.properties.find((p) => p.id === res.propertyId);
          return {
            ...res,
            propertyTitle: property ? property.title : "Unknown Property",
            propertyImage: property && property.images.length > 0 ? property.images[0] : "",
            propertyLocation: property ? property.location : "",
          };
        });
      return NextResponse.json({ reservations: travelerReservations });
    } else {
      // Return provider's properties' reservations
      const providerPropertyIds = db.properties
        .filter((p) => p.providerId === user.id)
        .map((p) => p.id);
      
      const providerReservations = db.reservations
        .filter((r) => providerPropertyIds.includes(r.propertyId))
        .map((res) => {
          const property = db.properties.find((p) => p.id === res.propertyId);
          const traveler = db.users.find((u) => u.id === res.travelerId);
          return {
            ...res,
            propertyTitle: property ? property.title : "Unknown Property",
            propertyImage: property && property.images.length > 0 ? property.images[0] : "",
            travelerName: traveler ? traveler.name : "Guest",
            travelerImage: traveler ? traveler.image : "",
          };
        });
      return NextResponse.json({ reservations: providerReservations });
    }
  } catch (error) {
    console.error("Reservations GET error", error);
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
    const { propertyId, startDate, endDate, selectedAdventures, comfortEquipment } = body;

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const db = readDB();
    const property = db.properties.find((p) => p.id === propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid dates provided" }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ error: "Check-out date must be after Check-in" }, { status: 400 });
    }

    // Overlapping reservation validation (Check for CONFIRMED bookings only)
    const overlaps = db.reservations.some((res) => {
      if (res.propertyId !== propertyId || res.status === ReservationStatus.CANCELLED) {
        return false;
      }
      const existingStart = new Date(res.startDate);
      const existingEnd = new Date(res.endDate);
      
      return start < existingEnd && end > existingStart;
    });

    if (overlaps) {
      return NextResponse.json(
        { error: "Double Booking Alert: The selected dates overlap with an existing reservation." },
        { status: 400 }
      );
    }

    // Calculate nights and price
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
    const nightlyTotal = property.price * nights;
    const serviceFee = parseFloat((nightlyTotal * 0.10).toFixed(2)); // 10% service fee
    const totalPrice = nightlyTotal + serviceFee;

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      propertyId,
      travelerId: user.id,
      startDate: startDate,
      endDate: endDate,
      totalPrice: totalPrice,
      status: ReservationStatus.CONFIRMED,
      createdAt: new Date().toISOString(),
      selectedAdventures: selectedAdventures || [],
      comfortEquipment: comfortEquipment || undefined,
    };

    db.reservations.push(newReservation);
    
    // Add an initial welcome message from the provider automatically to open the chat thread!
    let welcomeMessageStr = `Welcome, ${user.name}! Thank you for reserving ${property.title}. Your booking is confirmed from ${startDate} to ${endDate}.`;

    if (comfortEquipment && (comfortEquipment.orthoMats || comfortEquipment.medicalKit || comfortEquipment.largePrintGames || comfortEquipment.walkerRamp)) {
      const gearList = [];
      if (comfortEquipment.orthoMats) gearList.push("Non-Slip Bath Mats & Shower Chair");
      if (comfortEquipment.medicalKit) gearList.push("Immediate Medical Kit");
      if (comfortEquipment.largePrintGames) gearList.push("Large-Print Games & Puzzles");
      if (comfortEquipment.walkerRamp) gearList.push("Portable Walkway Threshold Ramp");
      welcomeMessageStr += `\n\nI have queued your requested comfort equipment for dispatch: ${gearList.join(", ")}. It will be prepared and styled in the lodge prior to your arrival!`;
    }

    if (selectedAdventures && selectedAdventures.length > 0) {
      welcomeMessageStr += `\n\nI'm absolutely thrilled that you are embarking on these dynamic local adventures: ${selectedAdventures.join(", ")}. I have notified our regional guides to prep your equipment and secure any necessary trail passes.`;
    }

    welcomeMessageStr += `\n\nPlease let me know if you have any questions or additional custom planning requests. Have an amazing stay!`;

    db.messages.push({
      id: `msg-welcome-${Date.now()}`,
      senderId: property.providerId,
      receiverId: user.id,
      reservationId: newReservation.id,
      content: welcomeMessageStr,
      timestamp: new Date().toISOString(),
    });

    writeDB(db);

    return NextResponse.json({ reservation: newReservation });
  } catch (error) {
    console.error("Reservations POST error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
