import type { Metadata } from "next";
import { AdminReviewsPage } from "@/components/admin/reviews";

export const metadata: Metadata = {
  title: "Quản lý đánh giá | ShopNow Admin",
  description: "Trang kiểm duyệt và phản hồi ý kiến đánh giá từ khách hàng ShopNow.",
  robots: { index: false, follow: false },
};

export default AdminReviewsPage;
