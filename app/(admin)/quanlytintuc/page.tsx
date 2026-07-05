import type { Metadata } from "next";
import { AdminNewsPage } from "@/components/admin/news";

export const metadata: Metadata = {
  title: "Quản lý tin tức | ShopNow Admin",
  description: "Trang viết bài, biên tập tin tức công nghệ và truyền thông ShopNow.",
  robots: { index: false, follow: false },
};

export default AdminNewsPage;