import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const vouchers = await prisma.vouchers.findMany({
      where: {
        status: "active",
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(serializeBigInt(vouchers));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
