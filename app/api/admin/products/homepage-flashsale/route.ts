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

    const products = await prisma.products.findMany({
      where: {
        is_homepage_flash_sale: true,
        status: "active",
      },
      include: {
        product_images: { orderBy: { sort_order: "asc" } },
        categories: { select: { name: true } },
      },
    });

    // Map homepage columns to flash_sale columns for admin frontend compatibility
    const mapped = products.map((p) => ({
      ...p,
      is_flash_sale: true,
      flash_sale_discount_percent: p.homepage_flash_sale_discount_percent,
    }));

    return NextResponse.json(serializeBigInt(mapped));
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

    const { selectedProducts } = await req.json();
    if (!Array.isArray(selectedProducts) || selectedProducts.length !== 5) {
      return NextResponse.json({ error: "Yêu cầu chọn chính xác 5 sản phẩm" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Reset all products homepage flash sale status
      await tx.products.updateMany({
        data: {
          is_homepage_flash_sale: false,
          homepage_flash_sale_discount_percent: null,
        },
      });

      // 2. Set is_homepage_flash_sale = true and discount percent for the selected 5 products
      for (const sp of selectedProducts) {
        await tx.products.update({
          where: { id: BigInt(sp.productId) },
          data: {
            is_homepage_flash_sale: true,
            homepage_flash_sale_discount_percent: Number(sp.discountPercent || 10),
          },
        });
      }
    });

    return NextResponse.json({ message: "Cập nhật sản phẩm Flash Sale trang chủ thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
