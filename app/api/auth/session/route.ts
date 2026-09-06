import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Role, User } from "@/lib/db";
import { getSessionUser, setSessionUser, clearSession } from "@/lib/session";
import { DEMO_PASSWORD, hashPassword, passwordsEqual } from "@/lib/password";

function publicUser(user: User) {
  const { password: _pw, ...safe } = user as User & { password?: string };
  return safe;
}

async function passwordMatches(stored: string | undefined, incomingPlain: string): Promise<boolean> {
  if (!stored) return false;
  const incomingHash = await hashPassword(incomingPlain);
  if (/^[a-f0-9]{64}$/i.test(stored)) {
    return passwordsEqual(stored, incomingHash);
  }
  // Legacy plaintext seeds (ephemeral /tmp DB)
  return stored === incomingPlain;
}

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = readDB();

    if (action === "login") {
      const { email, password } = body;
      if (typeof email !== "string" || typeof password !== "string") {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user || !(await passwordMatches(user.password, password))) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      await setSessionUser(user.id);
      return NextResponse.json({ user: publicUser(user) });
    }

    if (action === "register") {
      const { name, email, password, role } = body;
      if (typeof email !== "string" || typeof name !== "string") {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }
      const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }

      const rawPassword =
        typeof password === "string" && password.length > 0 ? password : DEMO_PASSWORD;
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password: await hashPassword(rawPassword),
        image: `https://picsum.photos/seed/${String(name).replace(/\s+/g, "")}/150/150`,
        role: role === "PROVIDER" ? Role.PROVIDER : Role.TRAVELER,
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      writeDB(db);

      await setSessionUser(newUser.id);
      return NextResponse.json({ user: publicUser(newUser) });
    }

    if (action === "switch-role") {
      const currentUser = await getSessionUser();
      if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userIndex = db.users.findIndex((u) => u.id === currentUser.id);
      if (userIndex === -1) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const newRole = db.users[userIndex].role === Role.TRAVELER ? Role.PROVIDER : Role.TRAVELER;
      db.users[userIndex].role = newRole;
      writeDB(db);

      return NextResponse.json({ user: db.users[userIndex] });
    }

    if (action === "update-profile") {
      const currentUser = await getSessionUser();
      if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { name, image } = body;
      const userIndex = db.users.findIndex((u) => u.id === currentUser.id);
      if (userIndex === -1) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (name) db.users[userIndex].name = name;
      if (image) db.users[userIndex].image = image;

      writeDB(db);
      return NextResponse.json({ user: db.users[userIndex] });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth session error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}
