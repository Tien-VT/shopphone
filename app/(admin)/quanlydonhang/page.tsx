import { AdminOrdersPage } from "@/components/admin/orders";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng | Admin ShopNow",
  description: "Trang quản trị danh sách và trạng thái đơn hàng ShopNow",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminOrdersPage />;
}
