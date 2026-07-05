import type { Metadata } from "next";
import { AdminVoucherPage } from "@/components/admin/voucher";

export const metadata: Metadata = {
  title: "Quản lý voucher | ShopNow Admin",
  description: "Trang quản lý mã giảm giá, khuyến mãi và tích lũy ưu đãi ShopNow.",
  robots: { index: false, follow: false },
};

export default AdminVoucherPage;