import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

// Map frontend payment key to DB enum
function mapPaymentMethod(method: string): any {
  if (method === "credit") return "card";
  if (method === "wallet") return "momo";
  return "cod"; // fallback
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const orders = await prisma.orders.findMany({
      where: { user_id: BigInt(session.userId) },
      orderBy: { created_at: "desc" },
      include: {
        order_items: true,
        addresses: true,
      },
    });

    return NextResponse.json(serializeBigInt(orders));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch order history" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      addressId,
      voucherId,
      cartItems,
      subtotal,
      discountAmount,
      shippingFee,
      totalAmount,
      paymentMethod,
      note,
    } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Giỏ hàng rỗng. Không thể đặt hàng." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const userId = BigInt(session.userId);
    const orderCode = `SN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Place order in transaction
    const finalOrder = await prisma.$transaction(async (tx) => {
      // 1. Verify and update stock for each item
      for (const item of cartItems) {
        const dbProduct = await tx.products.findUnique({
          where: { id: BigInt(item.id) },
        });

        if (!dbProduct) {
          throw new Error(`Sản phẩm '${item.name}' không tồn tại.`);
        }

        if (dbProduct.stock_quantity < item.quantity) {
          throw new Error(
            `Sản phẩm '${dbProduct.name}' không đủ hàng tồn kho. Chỉ còn lại ${dbProduct.stock_quantity} sản phẩm.`
          );
        }

        // Decrease stock
        await tx.products.update({
          where: { id: dbProduct.id },
          data: {
            stock_quantity: dbProduct.stock_quantity - item.quantity,
          },
        });
      }

      // 2. Increment voucher usage if applicable
      if (voucherId) {
        const vId = BigInt(voucherId);
        const voucher = await tx.vouchers.findUnique({
          where: { id: vId },
        });
        if (voucher) {
          await tx.vouchers.update({
            where: { id: vId },
            data: {
              used_count: voucher.used_count + 1,
            },
          });
        }
      }

      // 3. Check and clear user's cart in DB (in case there's any)
      const userCart = await tx.carts.findUnique({
        where: { user_id: userId },
      });
      if (userCart) {
        await tx.cart_items.deleteMany({
          where: { cart_id: userCart.id },
        });
      }

      // 4. Create the order
      const newOrder = await tx.orders.create({
        data: {
          order_code: orderCode,
          user_id: userId,
          address_id: addressId ? BigInt(addressId) : null,
          voucher_id: voucherId ? BigInt(voucherId) : null,
          subtotal: Number(subtotal),
          discount_amount: Number(discountAmount),
          shipping_fee: Number(shippingFee),
          total_amount: Number(totalAmount),
          payment_method: mapPaymentMethod(paymentMethod),
          payment_status: "unpaid",
          order_status: "pending",
          note: note || null,
        },
      });

      // 5. Create order items
      for (const item of cartItems) {
        await tx.order_items.create({
          data: {
            order_id: newOrder.id,
            product_id: BigInt(item.id),
            product_name: item.name,
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
            total_price: Number(item.price * item.quantity),
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      orderCode: finalOrder.order_code,
      orderId: finalOrder.id.toString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Đặt hàng không thành công." },
      { status: 400 }
    );
  }
}
