import type { Metadata } from "next";
import { AdminProductsPage } from "@/components/admin/products";

export const metadata: Metadata = {
  title: "Quản lý sản phẩm | ShopNow Admin",
  description: "Trang quản trị sản phẩm, số lượng tồn kho và giá bán lẻ của hệ thống ShopNow.",
  robots: { index: false, follow: false },
};

export default AdminProductsPage;
