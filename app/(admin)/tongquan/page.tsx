import type { Metadata } from "next";
import { AdminDashboardPage } from "@/components/admin/dashboard";

export const metadata: Metadata = {
  title: "Tổng quan hệ thống | ShopNow Admin",
  description: "Trang tổng quan báo cáo số liệu và hoạt động của hệ thống ShopNow.",
  robots: { index: false, follow: false },
};

export default AdminDashboardPage;