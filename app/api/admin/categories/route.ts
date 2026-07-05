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

    const categories = await prisma.categories.findMany({
      orderBy: { sort_order: "asc" },
    });

    return NextResponse.json(serializeBigInt(categories));
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

    const { name, slug, icon, sortOrder, isActive } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "Tên danh mục và slug là bắt buộc" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const newCat = await prisma.categories.create({
      data: {
        name,
        slug: slug.trim().toLowerCase(),
        icon: icon || null,
        sort_order: sortOrder ? Number(sortOrder) : 0,
        is_active: isActive !== false,
      },
    });

    return NextResponse.json(serializeBigInt(newCat));
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

    const { id, name, slug, icon, sortOrder, isActive } = await req.json();

    if (!id || !name || !slug) {
      return NextResponse.json({ error: "ID, tên danh mục và slug là bắt buộc" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const updated = await prisma.categories.update({
      where: { id: BigInt(id) },
      data: {
        name,
        slug: slug.trim().toLowerCase(),
        icon: icon || null,
        sort_order: sortOrder ? Number(sortOrder) : 0,
        is_active: isActive !== false,
      },
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
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    // Check if category is used in products
    const productCount = await prisma.products.count({
      where: { category_id: BigInt(id) },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: "Không thể xóa danh mục đang có sản phẩm liên kết." },
        { status: 400 }
      );
    }

    await prisma.categories.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
