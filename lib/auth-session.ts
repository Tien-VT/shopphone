import { cookies } from "next/headers";
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = process.env.SESSION_SECRET || "shopnow-super-secret-key-32-chars-long!";
// Ensure key is exactly 32 bytes
const KEY = crypto.scryptSync(SECRET_KEY, "salt", 32);
const IV_LENGTH = 16;

export interface SessionData {
  userId: string;
  role: "customer" | "admin";
  email: string;
  name: string;
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string | null {
  try {
    const parts = text.split(":");
    const ivHex = parts.shift();
    if (!ivHex) return null;
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return null;
  }
}

export async function setSession(data: SessionData) {
  const encrypted = encrypt(JSON.stringify(data));
  const cookieStore = await cookies();
  cookieStore.set("shopnow_session", encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("shopnow_session");
    if (!cookie || !cookie.value) return null;

    const decrypted = decrypt(cookie.value);
    if (!decrypted) return null;

    return JSON.parse(decrypted) as SessionData;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("shopnow_session");
}
