import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const articles = await prisma.news_articles.findMany({
      where: {
        status: "published",
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(serializeBigInt(articles));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
