import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
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
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    await syncFlashSaleState(prisma);

    const sales = await prisma.flash_sales.findMany({
      orderBy: { start_at: "desc" },
    });

    return NextResponse.json(serializeBigInt(sales));
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

    const { title, slug, description, startAt, endAt, status, productsJson } = await req.json();

    if (!title || !slug || !startAt || !endAt) {
      return NextResponse.json({ error: "Thiếu thông tin chiến dịch bắt buộc" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const newSale = await prisma.flash_sales.create({
      data: {
        title,
        slug: slug.trim().toLowerCase(),
        description: description || null,
        products_json: productsJson ? JSON.stringify(productsJson) : null,
        start_at: new Date(startAt),
        end_at: new Date(endAt),
        status: status || "scheduled",
      } as any,
    });

    await syncFlashSaleState(prisma);

    return NextResponse.json(serializeBigInt(newSale));
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

    const { id, title, slug, description, startAt, endAt, status, productsJson } = await req.json();

    if (!id || !title || !slug || !startAt || !endAt) {
      return NextResponse.json({ error: "Thiếu thông tin chiến dịch bắt buộc" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const updated = await prisma.flash_sales.update({
      where: { id: BigInt(id) },
      data: {
        title,
        slug: slug.trim().toLowerCase(),
        description: description || null,
        products_json: productsJson ? JSON.stringify(productsJson) : null,
        start_at: new Date(startAt),
        end_at: new Date(endAt),
        status: status || "scheduled",
      } as any,
    });

    await syncFlashSaleState(prisma);

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
      return NextResponse.json({ error: "Flash Sale ID is required" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    await prisma.flash_sales.delete({
      where: { id: BigInt(id) },
    });

    await syncFlashSaleState(prisma);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
