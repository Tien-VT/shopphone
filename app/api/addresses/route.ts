import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

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

    const addresses = await prisma.addresses.findMany({
      where: { user_id: BigInt(session.userId) },
      orderBy: { is_default: "desc" },
    });

    return NextResponse.json(serializeBigInt(addresses));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch addresses" },
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

    const { recipientName, phone, addressLine, ward, district, province, isDefault } = await req.json();

    if (!recipientName || !phone || !addressLine) {
      return NextResponse.json(
        { error: "Tên người nhận, số điện thoại và địa chỉ là bắt buộc." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const userId = BigInt(session.userId);

    // Run in transaction
    const newAddress = await prisma.$transaction(async (tx) => {
      // If setting as default, unset other defaults
      if (isDefault) {
        await tx.addresses.updateMany({
          where: { user_id: userId },
          data: { is_default: false },
        });
      }

      // Check if this is the first address, make it default anyway
      const count = await tx.addresses.count({
        where: { user_id: userId },
      });

      return await tx.addresses.create({
        data: {
          user_id: userId,
          recipient_name: recipientName,
          phone,
          address_line: addressLine,
          ward: ward || null,
          district: district || null,
          province: province || null,
          is_default: count === 0 ? true : !!isDefault,
        },
      });
    });

    return NextResponse.json(serializeBigInt(newAddress));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save address" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, recipientName, phone, addressLine, ward, district, province, isDefault } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Mã địa chỉ không hợp lệ" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const userId = BigInt(session.userId);
    const addressId = BigInt(id);

    const updatedAddress = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.addresses.updateMany({
          where: { user_id: userId },
          data: { is_default: false },
        });
      }

      return await tx.addresses.update({
        where: {
          id: addressId,
          user_id: userId,
        },
        data: {
          recipient_name: recipientName,
          phone,
          address_line: addressLine,
          ward: ward || null,
          district: district || null,
          province: province || null,
          is_default: !!isDefault,
        },
      });
    });

    return NextResponse.json(serializeBigInt(updatedAddress));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update address" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");
    if (!idStr) {
      return NextResponse.json({ error: "Mã địa chỉ không hợp lệ" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const userId = BigInt(session.userId);
    const addressId = BigInt(idStr);

    await prisma.addresses.delete({
      where: {
        id: addressId,
        user_id: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete address" },
      { status: 500 }
    );
  }
}

