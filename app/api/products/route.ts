import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");
    const isFeatured = searchParams.get("featured") === "true";
    const isFlashSale = searchParams.get("flash_sale") === "true";
    const sort = searchParams.get("sort");

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const where: any = {
      status: "active",
    };

    if (categoryId) {
      where.category_id = BigInt(categoryId);
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { short_description: { contains: search } },
      ];
    }

    if (isFeatured) {
      where.is_featured = true;
    }

    if (isFlashSale) {
      where.is_flash_sale = true;
    }

    let orderBy: any = { created_at: "desc" };
    if (sort === "low-to-high") {
      orderBy = { price: "asc" };
    } else if (sort === "high-to-low") {
      orderBy = { price: "desc" };
    } else if (sort === "newest") {
      orderBy = { created_at: "desc" };
    }

    const products = await prisma.products.findMany({
      where,
      orderBy,
      include: {
        product_images: {
          orderBy: { sort_order: "asc" },
        },
        product_variants: {
          orderBy: { sort_order: "asc" },
        },
        categories: {
          select: { name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ items: serializeBigInt(products) });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}