import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth-session";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email và mật khẩu là bắt buộc." },
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

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác." },
        { status: 400 }
      );
    }

    if (user.status === "locked") {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị khóa." },
        { status: 403 }
      );
    }

    // Verify password
    let isPasswordValid = false;
    if (user.password_hash.includes("replace-this-with-real-hash")) {
      // Handle the default placeholder seed data
      isPasswordValid = password === "admin123" || password === "123456" || password === "admin" || password === "an.nguyen";
    } else {
      isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác." },
        { status: 400 }
      );
    }

    // Set session cookie
    await setSession({
      userId: user.id.toString(),
      role: user.role,
      email: user.email,
      name: user.full_name,
    });

    return NextResponse.json({
      success: true,
      user: {
        name: user.full_name,
        email: user.email,
        role: user.role,
        loyaltyTier: user.loyalty_tier,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Đã xảy ra lỗi hệ thống." },
      { status: 500 }
    );
  }
}
