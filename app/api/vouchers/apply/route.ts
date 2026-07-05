import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, orderValue } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Mã giảm giá là bắt buộc." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const voucher = await prisma.vouchers.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!voucher || voucher.status !== "active") {
      return NextResponse.json(
        { error: "Mã giảm giá không tồn tại hoặc đã hết hiệu lực." },
        { status: 400 }
      );
    }

    const now = new Date();
    if (voucher.start_at && now < new Date(voucher.start_at)) {
      return NextResponse.json(
        { error: "Chương trình khuyến mãi chưa bắt đầu." },
        { status: 400 }
      );
    }

    if (voucher.end_at && now > new Date(voucher.end_at)) {
      return NextResponse.json(
        { error: "Mã giảm giá đã hết hạn." },
        { status: 400 }
      );
    }

    if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
      return NextResponse.json(
        { error: "Mã giảm giá đã hết lượt sử dụng." },
        { status: 400 }
      );
    }

    const subtotal = Number(orderValue || 0);
    const minVal = Number(voucher.minimum_order_value || 0);

    if (subtotal < minVal) {
      return NextResponse.json(
        {
          error: `Đơn hàng tối thiểu từ ${minVal.toLocaleString("vi-VN")}đ để áp dụng voucher này.`,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    const discountVal = Number(voucher.discount_value);

    if (voucher.discount_type === "percent") {
      discountAmount = (subtotal * discountVal) / 100;
      if (voucher.max_discount_value) {
        const maxVal = Number(voucher.max_discount_value);
        if (discountAmount > maxVal) {
          discountAmount = maxVal;
        }
      }
    } else {
      discountAmount = discountVal;
    }

    // Return calculated discount
    return NextResponse.json({
      success: true,
      voucherId: voucher.id.toString(),
      code: voucher.code,
      name: voucher.name,
      discountAmount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Không thể áp dụng mã giảm giá." },
      { status: 500 }
    );
  }
}
