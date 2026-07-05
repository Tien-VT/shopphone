import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderStatus, paymentStatus } = await req.json();

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const orderId = BigInt(id);

    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { order_items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    // Role check and status transition check
    const isCustomer = session.role === "customer";
    const isAdmin = session.role === "admin";

    if (isCustomer) {
      if (order.user_id.toString() !== session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Customer can only cancel pending orders
      if (orderStatus === "cancelled") {
        if (order.order_status !== "pending") {
          return NextResponse.json(
            { error: "Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý." },
            { status: 400 }
          );
        }

        // Cancel order and restore stock in transaction
        const updated = await prisma.$transaction(async (tx) => {
          // Restore stocks
          for (const item of order.order_items) {
            await tx.products.update({
              where: { id: item.product_id },
              data: {
                stock_quantity: { increment: item.quantity },
              },
            });
          }

          return await tx.orders.update({
            where: { id: orderId },
            data: { order_status: "cancelled" },
          });
        });

        return NextResponse.json(serializeBigInt(updated));
      } else {
        return NextResponse.json({ error: "Action not allowed for customer" }, { status: 403 });
      }
    }

    if (isAdmin) {
      const data: any = {};
      if (orderStatus) data.order_status = orderStatus;
      if (paymentStatus) data.payment_status = paymentStatus;

      // Handle stock restoral if admin cancels order
      const updated = await prisma.$transaction(async (tx) => {
        if (orderStatus === "cancelled" && order.order_status !== "cancelled") {
          for (const item of order.order_items) {
            await tx.products.update({
              where: { id: item.product_id },
              data: {
                stock_quantity: { increment: item.quantity },
              },
            });
          }
        }
        return await tx.orders.update({
          where: { id: orderId },
          data,
        });
      });

      return NextResponse.json(serializeBigInt(updated));
    }

    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
