import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { decrypt } from "@/lib/auth-session";
import bcryptjs from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Thiếu thông tin xác thực hoặc mật khẩu mới." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải từ 6 ký tự trở lên." },
        { status: 400 }
      );
    }

    // Decrypt the token
    const decrypted = decrypt(token);
    if (!decrypted) {
      return NextResponse.json(
        { error: "Mã xác thực không hợp lệ hoặc đã bị chỉnh sửa." },
        { status: 400 }
      );
    }

    let payload: { userId: string; expiresAt: number };
    try {
      payload = JSON.parse(decrypted);
    } catch {
      return NextResponse.json(
        { error: "Mã xác thực không hợp lệ." },
        { status: 400 }
      );
    }

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return NextResponse.json(
        { error: "Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng gửi yêu cầu mới." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    // Hash the new password
    const passwordHash = await bcryptjs.hash(newPassword, 10);

    // Update user record
    await prisma.users.update({
      where: { id: BigInt(payload.userId) },
      data: { password_hash: passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Mật khẩu của bạn đã được cập nhật thành công.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
