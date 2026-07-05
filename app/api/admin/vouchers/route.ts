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

    const vouchers = await prisma.vouchers.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(serializeBigInt(vouchers));
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
      code,
      name,
      description,
      discountType,
      discountValue,
      minimumOrderValue,
      maxDiscountValue,
      startAt,
      endAt,
      usageLimit,
      status,
    } = await req.json();

    if (!code || !name || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "Thiếu thông tin voucher bắt buộc" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const newVoucher = await prisma.vouchers.create({
      data: {
        code: code.trim().toUpperCase(),
        name,
        description: description || null,
        discount_type: discountType,
        discount_value: Number(discountValue),
        minimum_order_value: minimumOrderValue ? Number(minimumOrderValue) : 0,
        max_discount_value: maxDiscountValue ? Number(maxDiscountValue) : null,
        start_at: startAt ? new Date(startAt) : null,
        end_at: endAt ? new Date(endAt) : null,
        usage_limit: usageLimit ? Number(usageLimit) : null,
        status: status || "active",
      },
    });

    return NextResponse.json(serializeBigInt(newVoucher));
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
      id,
      code,
      name,
      description,
      discountType,
      discountValue,
      minimumOrderValue,
      maxDiscountValue,
      startAt,
      endAt,
      usageLimit,
      status,
    } = await req.json();

    if (!id || !code || !name || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "Thiếu thông tin voucher bắt buộc" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const updated = await prisma.vouchers.update({
      where: { id: BigInt(id) },
      data: {
        code: code.trim().toUpperCase(),
        name,
        description: description || null,
        discount_type: discountType,
        discount_value: Number(discountValue),
        minimum_order_value: minimumOrderValue ? Number(minimumOrderValue) : 0,
        max_discount_value: maxDiscountValue ? Number(maxDiscountValue) : null,
        start_at: startAt ? new Date(startAt) : null,
        end_at: endAt ? new Date(endAt) : null,
        usage_limit: usageLimit ? Number(usageLimit) : null,
        status: status || "active",
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
      return NextResponse.json({ error: "Voucher ID is required" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    await prisma.vouchers.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
