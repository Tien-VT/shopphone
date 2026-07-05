import type { Metadata } from "next";
import { AdminFlashSalePage } from "@/components/admin/flash-sale";

export const metadata: Metadata = {
  title: "Quản lý Flash Sale | ShopNow Admin",
  description: "Trang thiết lập sự kiện Flash Sale, giờ vàng giảm giá kịch sàn của ShopNow.",
  robots: { index: false, follow: false },
};

export default AdminFlashSalePage;