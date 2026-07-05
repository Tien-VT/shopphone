import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Đăng nhập hệ thống | ShopNow Admin",
  description: "Trang đăng nhập bảo mật dành riêng cho quản trị viên hệ thống ShopNow.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getSession();

  // If already logged in as admin, redirect directly to dashboard
  if (session && session.role === "admin") {
    redirect("/tongquan");
  }

  return <AdminLoginForm />;
}
