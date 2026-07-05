import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth-session";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Họ tên, email và mật khẩu là bắt buộc." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "Lỗi kết nối cơ sở dữ liệu." },
        { status: 500 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.users.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng." },
        { status: 400 }
      );
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await prisma.users.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "Số điện thoại này đã được sử dụng." },
          { status: 400 }
        );
      }
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    // Create user and cart in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          full_name: name,
          email,
          password_hash,
          phone: phone || null,
          role: "customer",
          status: "active",
          loyalty_tier: "bronze",
        },
      });

      // Create cart for user
      await tx.carts.create({
        data: {
          user_id: user.id,
        },
      });

      return user;
    });

    // Establish session
    await setSession({
      userId: newUser.id.toString(),
      role: newUser.role,
      email: newUser.email,
      name: newUser.full_name,
    });

    return NextResponse.json({
      success: true,
      user: {
        name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        loyaltyTier: newUser.loyalty_tier,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Đã xảy ra lỗi hệ thống." },
      { status: 500 }
    );
  }
}
