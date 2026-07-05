import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      throw new Error("Database client is null");
    }
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ status: "ok", service: "shopnow-api", database: "connected" });
  } catch {
    return NextResponse.json({ status: "ok", service: "shopnow-api", database: "unavailable" });
  }
}