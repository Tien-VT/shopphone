import type { Metadata } from "next";
import { AdminCategoriesPage } from "@/components/admin/categories";

export const metadata: Metadata = {
  title: "Quản lý danh mục | ShopNow Admin",
  description: "Trang quản lý phân loại danh mục sản phẩm của hệ thống ShopNow.",
  robots: { index: false, follow: false },
};

export default AdminCategoriesPage;
