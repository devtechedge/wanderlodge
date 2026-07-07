import { cookies } from "next/headers";
import { readDB, User } from "./db";

const SESSION_COOKIE_NAME = "wanderlodge_session_id";

export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!userId) {
      return null;
    }
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error in getSessionUser", error);
    return null;
  }
}

export async function setSessionUser(userId: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return true;
  } catch (error) {
    console.error("Error setting session cookie", error);
    return false;
  }
}

export async function clearSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return true;
  } catch (error) {
    console.error("Error clearing session cookie", error);
    return false;
  }
}
