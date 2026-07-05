import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const include = {
      product_images: { orderBy: { sort_order: "asc" as const } },
      product_variants: { orderBy: { sort_order: "asc" as const } },
      categories: { select: { name: true, slug: true } },
    };

    const isNumeric = /^\d+$/.test(slug);
    const product = isNumeric
      ? await prisma.products.findUnique({ where: { id: BigInt(slug) }, include })
      : await prisma.products.findUnique({ where: { slug }, include });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(product));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch product details" },
      { status: 500 }
    );
  }
}
