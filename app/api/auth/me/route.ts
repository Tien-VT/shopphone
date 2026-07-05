import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.users.findUnique({
      where: { id: BigInt(session.userId) },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        loyalty_tier: true,
        avatar_url: true,
      },
    });

    if (!user || user.status === "locked") {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id.toString(),
        name: user.full_name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        loyaltyTier: user.loyalty_tier,
        avatar: user.avatar_url,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, avatar } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Họ và tên là bắt buộc." }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const userId = BigInt(session.userId);

    if (phone) {
      const existingPhone = await prisma.users.findFirst({
        where: {
          phone,
          id: { not: userId },
        },
      });
      if (existingPhone) {
        return NextResponse.json({ error: "Số điện thoại này đã được sử dụng bởi tài khoản khác." }, { status: 400 });
      }
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        full_name: name,
        phone: phone || null,
        avatar_url: avatar || undefined,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
        loyalty_tier: true,
        avatar_url: true,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id.toString(),
        name: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
        loyaltyTier: updatedUser.loyalty_tier,
        avatar: updatedUser.avatar_url,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

