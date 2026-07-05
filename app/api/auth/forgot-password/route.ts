import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth-session";
import { sendEmail } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email là bắt buộc." }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const user = await prisma.users.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản liên kết với địa chỉ email này." },
        { status: 404 }
      );
    }

    // Generate reset payload
    const payload = JSON.stringify({
      userId: user.id.toString(),
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour validity
    });

    const token = encrypt(payload);

    // Build reset URL dynamically
    const origin = req.headers.get("origin") || "https://shopphone.vercel.app";
    const resetUrl = `${origin}/quenmatkhau?token=${encodeURIComponent(token)}`;

    // Compose HTML content
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1a202c;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #4f22d6; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ShopNow</h2>
        </div>
        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">Yêu cầu khôi phục mật khẩu</h3>
        <p>Xin chào <strong>${user.full_name}</strong>,</p>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại ShopNow.</p>
        <p>Vui lòng click vào nút bên dưới để thiết lập mật khẩu mới. Liên kết này sẽ hết hạn sau <strong>1 giờ</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #4f22d6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 34, 214, 0.2);">Đặt lại mật khẩu</a>
        </div>
        <p style="font-size: 13px; color: #718096; line-height: 1.5;">Nếu nút trên không hoạt động, bạn hãy sao chép và dán liên kết sau vào trình duyệt:<br/>
        <a href="${resetUrl}" style="color: #4f22d6; word-break: break-all;">${resetUrl}</a></p>
        <p style="margin-top: 24px;">Nếu bạn không thực hiện yêu cầu này, bạn có thể an tâm bỏ qua email này.</p>
        <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;" />
        <p style="font-size: 11px; color: #a0aec0; text-align: center; margin: 0;">Đây là email tự động gửi từ hệ thống ShopNow. Vui lòng không trả lời email này.</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: user.email,
      subject: "[ShopNow] Hướng dẫn đặt lại mật khẩu",
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: "Email hướng dẫn khôi phục mật khẩu đã được gửi đi.",
      simulated: !!emailResult.simulated,
      // For local testing without SMTP setup, expose the reset URL in response so they can test it instantly
      devResetUrl: emailResult.simulated ? resetUrl : undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process forgot password request" },
      { status: 500 }
    );
  }
}
