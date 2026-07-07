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
    const { propertyId, startDate, endDate, selectedAdventures, comfortEquipment, isDayRetreat, partialPayment } = body;

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

    if (!isDayRetreat && start >= end) {
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
    let nights = 1;
    let nightlyTotal = property.price;
    if (isDayRetreat) {
      nightlyTotal = Math.round(property.price * 0.5); // Day retreats are 50% price
    } else {
      const msPerDay = 1000 * 60 * 60 * 24;
      nights = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
      nightlyTotal = property.price * nights;
    }
    const serviceFee = parseFloat((nightlyTotal * 0.10).toFixed(2)); // 10% service fee
    const totalPrice = nightlyTotal + serviceFee;

    // Milestone payment calculation
    const depositPaid = partialPayment ? parseFloat((totalPrice * 0.3).toFixed(2)) : totalPrice;
    const remainingBalance = partialPayment ? parseFloat((totalPrice * 0.7).toFixed(2)) : 0;
    const paymentMilestones = partialPayment ? [
      { title: "Initial Deposit (30%)", amount: depositPaid, dueDate: new Date().toISOString().slice(0, 10), paid: true },
      { title: "Remaining Balance (70%)", amount: remainingBalance, dueDate: new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), paid: false }
    ] : [];

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
      isDayRetreat: !!isDayRetreat,
      depositPaid,
      depositTotal: totalPrice,
      remainingBalance,
      escrowStatus: "Held Securely", // held securely in escrow
      paymentMilestones: paymentMilestones.length > 0 ? paymentMilestones : undefined,
    };

    db.reservations.push(newReservation);
    
    // Add an initial welcome message from the provider automatically to open the chat thread!
    let welcomeMessageStr = `Welcome, ${user.name}! Thank you for reserving ${property.title}. Your booking is confirmed from ${startDate} to ${endDate}.`;

    if (isDayRetreat) {
      welcomeMessageStr = `Welcome, ${user.name}! Your Day-Retreat Micro-Stay at ${property.title} is confirmed for ${startDate} (9:00 AM - 5:00 PM). It's prepared perfectly for your creative sprint and remote-work productivity.`;
    }

    if (partialPayment) {
      welcomeMessageStr += `\n\n💰 Partial Payment Milestones Confirmed: Your 30% initial deposit ($${depositPaid}) has been captured. The remaining 70% balance ($${remainingBalance}) is automatically scheduled for ${paymentMilestones[1]?.dueDate}.`;
    }

    welcomeMessageStr += `\n\n🛡️ Escrow Security Active: Your $200 security deposit is held securely in our neutral WanderTrust escrow account. It will be released automatically within 48 hours of check-out after a status clearance.`;

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

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reservationId, action, coTraveler, expense, expenseId } = body;

    if (!reservationId) {
      return NextResponse.json({ error: "Missing reservationId" }, { status: 400 });
    }

    const db = readDB();
    const resIndex = db.reservations.findIndex((r) => r.id === reservationId);
    if (resIndex === -1) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const reservation = db.reservations[resIndex];
    
    // Ensure the user belongs to this reservation (is either traveler or provider)
    const property = db.properties.find((p) => p.id === reservation.propertyId);
    if (reservation.travelerId !== user.id && property?.providerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!reservation.coTravelers) {
      reservation.coTravelers = [];
    }
    if (!reservation.groupExpenses) {
      reservation.groupExpenses = [];
    }

    // 1. Add Co-Traveler
    if (action === "add-co-traveler") {
      if (!coTraveler || !coTraveler.email || !coTraveler.name) {
        return NextResponse.json({ error: "Missing co-traveler details" }, { status: 400 });
      }
      
      // Check if email already added
      if (reservation.coTravelers.some(c => c.email.toLowerCase() === coTraveler.email.toLowerCase())) {
        return NextResponse.json({ error: "Co-traveler already invited." }, { status: 400 });
      }

      const randomSeed = Math.floor(Math.random() * 1000);
      reservation.coTravelers.push({
        name: coTraveler.name,
        email: coTraveler.email,
        role: coTraveler.role || "Adult",
        image: `https://picsum.photos/seed/${randomSeed}/150/150`
      });

      writeDB(db);
      return NextResponse.json({ reservation });
    }

    // 2. Add Expense
    if (action === "add-expense") {
      if (!expense || !expense.description || isNaN(parseFloat(expense.amount))) {
        return NextResponse.json({ error: "Invalid expense details" }, { status: 400 });
      }

      reservation.groupExpenses.push({
        id: `exp-${Date.now()}`,
        description: expense.description,
        amount: parseFloat(expense.amount),
        paidByName: expense.paidByName || user.name
      });

      writeDB(db);
      return NextResponse.json({ reservation });
    }

    // 3. Remove Expense
    if (action === "remove-expense") {
      if (!expenseId) {
        return NextResponse.json({ error: "Missing expenseId" }, { status: 400 });
      }

      reservation.groupExpenses = reservation.groupExpenses.filter((e) => e.id !== expenseId);
      writeDB(db);
      return NextResponse.json({ reservation });
    }

    // 4. Extend Stay (Stay Extender)
    if (action === "extend-stay") {
      if (!property) {
        return NextResponse.json({ error: "Property metadata not found" }, { status: 404 });
      }
      const end = new Date(reservation.endDate);
      end.setDate(end.getDate() + 1);
      reservation.endDate = end.toISOString().slice(0, 10);
      
      const extraNightPrice = Math.round(property.price * 0.65); // 35% last-minute special discount
      reservation.totalPrice += extraNightPrice;
      
      if (reservation.paymentMilestones && reservation.paymentMilestones.length > 1) {
        reservation.paymentMilestones[1].amount = parseFloat((reservation.paymentMilestones[1].amount + extraNightPrice).toFixed(2));
        reservation.remainingBalance = parseFloat(((reservation.remainingBalance || 0) + extraNightPrice).toFixed(2));
      } else {
        reservation.depositTotal = (reservation.depositTotal || reservation.totalPrice) + extraNightPrice;
      }
      
      db.messages.push({
        id: `msg-ext-${Date.now()}`,
        senderId: property.providerId,
        receiverId: reservation.travelerId,
        reservationId: reservation.id,
        content: `⏳ Stay Extended successfully! I've added 1 more night to your stay at a discounted last-minute special rate of $${extraNightPrice} (35% off). Thank you for choosing to stretch your wilderness retreat!`,
        timestamp: new Date().toISOString(),
      });

      writeDB(db);
      return NextResponse.json({ reservation });
    }

    // 5. Rain-Check Weather Guarantee Reschedule
    if (action === "rain-check") {
      const { newStart, newEnd } = body;
      if (!newStart || !newEnd) {
        return NextResponse.json({ error: "Missing rescheduled dates" }, { status: 400 });
      }
      reservation.startDate = newStart;
      reservation.endDate = newEnd;
      reservation.rainCheckClaimed = true;
      
      db.messages.push({
        id: `msg-weather-${Date.now()}`,
        senderId: "system",
        receiverId: reservation.travelerId,
        reservationId: reservation.id,
        content: `🌦️ Rain-Check Weather Guarantee Approved! Since severe weather conditions compromised your outdoor plans, your booking has been rescheduled to ${newStart} - ${newEnd} at zero additional charge. Your neutral escrow held deposits remain active.`,
        timestamp: new Date().toISOString(),
      });

      writeDB(db);
      return NextResponse.json({ reservation });
    }

    // 6. Host Cancellation Back-up Simulation
    if (action === "trigger-host-cancel") {
      reservation.status = ReservationStatus.CANCELLED;
      
      // Find a superior alternative property (e.g. anything not matching the current one)
      const alternativeLodge = db.properties.find((p) => p.id !== reservation.propertyId) || property;
      if (!alternativeLodge) {
        return NextResponse.json({ error: "No alternative properties available" }, { status: 400 });
      }

      const backupReservation: Reservation = {
        id: `res-backup-${Date.now()}`,
        propertyId: alternativeLodge.id,
        travelerId: reservation.travelerId,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        totalPrice: reservation.totalPrice, // matching original price exactly
        status: ReservationStatus.CONFIRMED,
        createdAt: new Date().toISOString(),
        selectedAdventures: reservation.selectedAdventures,
        comfortEquipment: reservation.comfortEquipment,
        coTravelers: reservation.coTravelers,
        groupExpenses: reservation.groupExpenses,
        isDayRetreat: reservation.isDayRetreat,
        depositPaid: reservation.depositPaid,
        depositTotal: reservation.depositTotal,
        remainingBalance: reservation.remainingBalance,
        paymentMilestones: reservation.paymentMilestones,
        escrowStatus: "Held Securely",
        originalLodgeTitle: property?.title || "Original Lodge",
      };

      db.reservations.push(backupReservation);

      // System notification
      db.messages.push({
        id: `msg-insurance-alert-${Date.now()}`,
        senderId: "system",
        receiverId: reservation.travelerId,
        reservationId: reservation.id,
        content: `⚠️ WanderShield Alert: Host ${property?.title || "Lodge"} had to cancel unexpectedly. Do not worry! Our Host Cancellation Back-Up Guarantee has automatically matched and secured a superior alternative lodge at NO extra charge: "${alternativeLodge.title}". This booking is confirmed! Check your active journeys.`,
        timestamp: new Date().toISOString(),
      });

      db.messages.push({
        id: `msg-welcome-backup-${Date.now()}`,
        senderId: alternativeLodge.providerId,
        receiverId: reservation.travelerId,
        reservationId: backupReservation.id,
        content: `👋 Hello! I'm your transfer host at "${alternativeLodge.title}". I've received your backup booking from the WanderShield Insurance system. Your original price and requested gear is preserved completely. We're excited to have you!`,
        timestamp: new Date().toISOString(),
      });

      writeDB(db);
      return NextResponse.json({ reservation, backupReservationId: backupReservation.id });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Reservations PUT error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
