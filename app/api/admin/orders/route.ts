import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

// Helper to check if current session is Admin
async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return false;
  }
  return true;
}

export async function GET() {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const orders = await prisma.orders.findMany({
      orderBy: { created_at: "desc" },
      include: {
        order_items: true,
        addresses: true,
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(serializeBigInt(orders));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const { id, order_status, payment_status } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const orderId = BigInt(id);

    // Prepare update data
    const updateData: any = {};
    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;
    updateData.updated_at = new Date();

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Get current order
      const order = await tx.orders.findUnique({
        where: { id: orderId },
        include: { order_items: true }
      });

      if (!order) {
        throw new Error("Đơn hàng không tồn tại");
      }

      // 2. If status transitions to cancelled and was not cancelled before, restore stock
      if (order_status === "cancelled" && order.order_status !== "cancelled") {
        for (const item of order.order_items) {
          await tx.products.update({
            where: { id: item.product_id },
            data: {
              stock_quantity: { increment: item.quantity },
            },
          });
        }
      }

      // 3. Perform update
      return await tx.orders.update({
        where: { id: orderId },
        data: updateData,
      });
    });

    return NextResponse.json({
      success: true,
      order: serializeBigInt(updatedOrder),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
