import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      orderBy: { sort_order: "asc" },
    });

    return NextResponse.json(serializeBigInt(categories));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
