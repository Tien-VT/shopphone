import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const news = await prisma.news_articles.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(serializeBigInt(news));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, slug, excerpt, content, thumbnailUrl, status } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ error: "Tiêu đề và slug là bắt buộc" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const newArticle = await prisma.news_articles.create({
      data: {
        title,
        slug: slug.trim().toLowerCase(),
        excerpt: excerpt || null,
        content: content || null,
        thumbnail_url: thumbnailUrl || null,
        status: status || "draft",
        author_user_id: BigInt(session.userId),
        published_at: status === "published" ? new Date() : null,
      },
    });

    return NextResponse.json(serializeBigInt(newArticle));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, slug, excerpt, content, thumbnailUrl, status } = await req.json();

    if (!id || !title || !slug) {
      return NextResponse.json({ error: "ID, tiêu đề và slug là bắt buộc" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const article = await prisma.news_articles.findUnique({
      where: { id: BigInt(id) },
    });

    const data: any = {
      title,
      slug: slug.trim().toLowerCase(),
      excerpt: excerpt || null,
      content: content || null,
      thumbnail_url: thumbnailUrl || null,
      status: status || "draft",
    };

    if (status === "published" && article?.status !== "published") {
      data.published_at = new Date();
    }

    const updated = await prisma.news_articles.update({
      where: { id: BigInt(id) },
      data,
    });

    return NextResponse.json(serializeBigInt(updated));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    await prisma.news_articles.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
