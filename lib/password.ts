/** Demo password hashing (SHA-256 + static salt). Portfolio only — not Argon2. */
const SALT = "wanderlodge_demo_salt_2026";

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`${SALT}:${password}`),
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function passwordsEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Public demo password — documented; compared only after hashing on the server. */
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD?.trim() || "password123";
