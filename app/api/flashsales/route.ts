import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

async function syncFlashSaleState(prisma: any) {
  const now = new Date();
  
  // 1. End expired campaigns
  await prisma.flash_sales.updateMany({
    where: {
      status: "active",
      end_at: { lt: now }
    },
    data: { status: "ended" }
  });

  // 2. Activate upcoming campaigns that reached start time
  const toActivate = await prisma.flash_sales.findFirst({
    where: {
      status: "scheduled",
      start_at: { lte: now },
      end_at: { gte: now }
    }
  });

  if (toActivate) {
    await prisma.flash_sales.update({
      where: { id: toActivate.id },
      data: { status: "active" }
    });
  }

  // 3. Sync to products table
  const activeCampaign = await prisma.flash_sales.findFirst({
    where: { status: "active" }
  });

  if (activeCampaign) {
    try {
      const productsJson = (activeCampaign as any).products_json;
      if (productsJson) {
        const parsed = JSON.parse(productsJson);
        if (Array.isArray(parsed)) {
          // Reset all products first
          await prisma.products.updateMany({
            data: {
              is_flash_sale: false,
              flash_sale_discount_percent: null
            }
          });

          // Set flash sale on participating products
          for (const item of parsed) {
            if (item.productId) {
              await prisma.products.update({
                where: { id: BigInt(item.productId) },
                data: {
                  is_flash_sale: true,
                  flash_sale_discount_percent: Number(item.discountPercent || 0)
                }
              });
            }
          }
          return;
        }
      }
    } catch (err) {
      console.error("Error syncing active campaign products:", err);
    }
  }

  // If no active campaign, make sure all products have is_flash_sale = false
  const flaggedCount = await prisma.products.count({ where: { is_flash_sale: true } });
  if (flaggedCount > 0) {
    await prisma.products.updateMany({
      data: {
        is_flash_sale: false,
        flash_sale_discount_percent: null
      }
    });
  }
}

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    await syncFlashSaleState(prisma);

    const sales = await prisma.flash_sales.findMany({
      orderBy: { start_at: "asc" },
    });

    const flashSaleProducts = await prisma.products.findMany({
      where: {
        is_flash_sale: true,
        status: "active",
      },
      include: {
        product_images: {
          orderBy: { sort_order: "asc" },
        },
      },
    });

    return NextResponse.json({
      sales: serializeBigInt(sales),
      products: serializeBigInt(flashSaleProducts),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch flash sales" },
      { status: 500 }
    );
  }
}
