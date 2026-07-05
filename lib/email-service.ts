import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"ShopNow" <noreply@shopphone.vercel.app>`;

  // Log to console for testing/debugging
  console.log(`\n==================================================`);
  console.log(`[EMAIL SEND SIMULATOR]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body Snippet: ${html.replace(/<[^>]*>/g, "").substring(0, 150)}...`);
  console.log(`==================================================\n`);

  if (!host || !user || !pass) {
    console.log("[EMAIL SERVICE] SMTP configuration missing. Email simulated successfully in development.");
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL SERVICE] Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[EMAIL SERVICE] Error sending email via SMTP:", error);
    throw error;
  }
}
