import type { Metadata } from "next";
import { AdminUsersPage } from "@/components/admin/users";

export const metadata: Metadata = {
  title: "Quản lý người dùng | ShopNow Admin",
  description: "Trang quản trị thành viên, phân quyền và lịch sử hoạt động hệ thống ShopNow.",
  robots: { index: false, follow: false },
};

export default AdminUsersPage;