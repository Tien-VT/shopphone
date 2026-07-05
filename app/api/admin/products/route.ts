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
      orderBy: { created_at: "desc" },
      include: {
        product_images: { orderBy: { sort_order: "asc" } },
        product_variants: { orderBy: { sort_order: "asc" } },
        categories: { select: { name: true } },
      },
    });

    return NextResponse.json(serializeBigInt(products));
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

    const {
      categoryId, name, slug, sku, shortDescription, description, specifications, color, colorHex,
      price, oldPrice, stockQuantity, isFeatured, isFlashSale, flashSaleDiscountPercent, status,
      imageUrls, variants,
    } = await req.json();

    if (!categoryId || !name || !slug || !sku || price === undefined) {
      return NextResponse.json({ error: "Thiếu thông tin sản phẩm bắt buộc" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "Database offline" }, { status: 500 });

    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.products.create({
        data: {
          category_id: BigInt(categoryId),
          name,
          slug: slug.trim().toLowerCase(),
          sku: sku.trim().toUpperCase(),
          short_description: shortDescription || null,
          description: description || null,
          specifications: specifications ? (typeof specifications === "string" ? specifications : JSON.stringify(specifications)) : null,
          color: color || null,
          color_hex: colorHex || null,
          price: Number(price),
          old_price: oldPrice ? Number(oldPrice) : null,
          stock_quantity: Number(stockQuantity || 0),
          is_featured: !!isFeatured,
          is_flash_sale: !!isFlashSale,
          flash_sale_discount_percent: flashSaleDiscountPercent ? Number(flashSaleDiscountPercent) : null,
          status: status || "active",
        },
      });

      // Insert images
      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        for (let i = 0; i < imageUrls.length; i++) {
          if (imageUrls[i]) {
            await tx.product_images.create({
              data: { product_id: prod.id, image_url: imageUrls[i], sort_order: i, is_primary: i === 0 },
            });
          }
        }
      }

      // Insert variants
      if (Array.isArray(variants) && variants.length > 0) {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          await tx.product_variants.create({
            data: {
              product_id: prod.id,
              name: v.name,
              sku: v.sku || null,
              price: Number(v.price),
              old_price: v.oldPrice ? Number(v.oldPrice) : null,
              stock_quantity: Number(v.stockQuantity || 0),
              color: v.color || null,
              color_hex: v.colorHex || null,
              image_url: v.imageUrl || null,
              sort_order: i,
              is_default: i === 0,
            },
          });
        }
      }

      return prod;
    });

    return NextResponse.json(serializeBigInt(newProduct));
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

    const {
      id, categoryId, name, slug, sku, shortDescription, description, specifications, color, colorHex,
      price, oldPrice, stockQuantity, isFeatured, isFlashSale, flashSaleDiscountPercent, status,
      imageUrls, variants,
    } = await req.json();

    if (!id || !categoryId || !name || !slug || !sku || price === undefined) {
      return NextResponse.json({ error: "Thiếu thông tin sản phẩm bắt buộc" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "Database offline" }, { status: 500 });

    const productId = BigInt(id);

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.products.update({
        where: { id: productId },
        data: {
          category_id: BigInt(categoryId),
          name,
          slug: slug.trim().toLowerCase(),
          sku: sku.trim().toUpperCase(),
          short_description: shortDescription || null,
          description: description || null,
          specifications: specifications ? (typeof specifications === "string" ? specifications : JSON.stringify(specifications)) : null,
          color: color || null,
          color_hex: colorHex || null,
          price: Number(price),
          old_price: oldPrice ? Number(oldPrice) : null,
          stock_quantity: Number(stockQuantity || 0),
          is_featured: !!isFeatured,
          is_flash_sale: !!isFlashSale,
          flash_sale_discount_percent: flashSaleDiscountPercent ? Number(flashSaleDiscountPercent) : null,
          status: status || "active",
        },
      });

      // Update images
      if (Array.isArray(imageUrls)) {
        await tx.product_images.deleteMany({ where: { product_id: productId } });
        for (let i = 0; i < imageUrls.length; i++) {
          if (imageUrls[i]) {
            await tx.product_images.create({
              data: { product_id: productId, image_url: imageUrls[i], sort_order: i, is_primary: i === 0 },
            });
          }
        }
      }

      // Update variants: delete all and re-insert
      await tx.product_variants.deleteMany({ where: { product_id: productId } });
      if (Array.isArray(variants) && variants.length > 0) {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          await tx.product_variants.create({
            data: {
              product_id: productId,
              name: v.name,
              sku: v.sku || null,
              price: Number(v.price),
              old_price: v.oldPrice ? Number(v.oldPrice) : null,
              stock_quantity: Number(v.stockQuantity || 0),
              color: v.color || null,
              color_hex: v.colorHex || null,
              image_url: v.imageUrl || null,
              sort_order: i,
              is_default: i === 0,
            },
          });
        }
      }

      return prod;
    });

    return NextResponse.json(serializeBigInt(updatedProduct));
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
    if (!id) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "Database offline" }, { status: 500 });

    await prisma.products.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
