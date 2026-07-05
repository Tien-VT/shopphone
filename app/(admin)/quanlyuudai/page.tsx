import type { Metadata } from "next";
import { AdminOffersPage } from "@/components/admin/offers";

export const metadata: Metadata = {
  title: "Quản lý ưu đãi | ShopNow Admin",
  description: "Trang quản trị các chương trình ưu đãi, đặc quyền khách hàng ShopNow.",
  robots: { index: false, follow: false },
};

export default AdminOffersPage;