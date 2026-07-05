"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";
import { useApp } from "@/lib/app-context";

export function CustomerOrdersPage() {
  const { user, showToast, openAuthModal } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?t=${Date.now()}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data || []);
      } else {
        showToast(`✗ Lỗi tải đơn hàng: ${data.error || "Không xác định"}`);
      }
    } catch (err) {
      console.error(err);
      showToast("✗ Gặp sự cố kết nối hệ thống khi tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: "cancelled" }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ ${data.error || "Không thể hủy đơn hàng"}`);
        return;
      }
      showToast("✓ Đã hủy đơn hàng thành công.");
      fetchOrders(); // reload
    } catch {
      showToast("✗ Lỗi hệ thống khi hủy đơn hàng.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Chờ xử lý</span>;
      case "confirmed":
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Đã xác nhận</span>;
      case "shipping":
        return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold font-semibold animate-pulse">Đang giao hàng</span>;
      case "completed":
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Hoàn thành</span>;
      case "cancelled":
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Đã hủy</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const formatPrice = (num: number) => {
    return num.toLocaleString("vi-VN") + "đ";
  };

  if (!user) {
    return (
      <CustomerShell>
        <div className="max-w-[1280px] mx-auto px-4 py-20 text-center">
          <i className="fa-solid fa-lock text-gray-300 text-[60px] mb-4"></i>
          <p className="text-gray-500 mb-6 text-[15px]">Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn.</p>
          <button
            onClick={() => openAuthModal("login")}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90"
          >
            Đăng nhập ngay
          </button>
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell>
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <h1 className="text-[28px] font-black text-slate-800 mb-6">Đơn hàng của tôi</h1>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <i className="fa-solid fa-spinner fa-spin text-brand-purple text-[30px] mb-3"></i>
            <p className="text-gray-500 text-sm">Đang tải lịch sử đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <span className="material-symbols-outlined text-[60px] text-gray-300 block mb-4">receipt_long</span>
            <p className="text-gray-500 mb-6 text-[15px]">Bạn chưa đặt đơn hàng nào tại ShopNow.</p>
            <Link href="/sanpham" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="flex-grow space-y-4 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-3">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Mã đơn hàng</p>
                      <p className="text-[15px] font-bold text-gray-900">{order.order_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Ngày đặt</p>
                      <p className="text-[13px] text-gray-700">{new Date(order.created_at).toLocaleString("vi-VN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Trạng thái</p>
                      <div className="mt-1">{getStatusBadge(order.order_status)}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center gap-4 text-[13px]">
                        <p className="text-gray-700 font-medium line-clamp-1 flex-grow">
                          {item.product_name} <span className="text-gray-400 font-normal ml-1">x {item.quantity}</span>
                        </p>
                        <p className="text-gray-900 font-bold shrink-0">{formatPrice(Number(item.total_price))}</p>
                      </div>
                    ))}
                  </div>

                  {order.addresses && (
                    <div className="text-[12px] text-gray-500 bg-gray-50 p-3 rounded-xl">
                      <p className="font-bold text-gray-700">Địa chỉ nhận hàng:</p>
                      <p className="mt-0.5">{order.addresses.recipient_name} - {order.addresses.phone}</p>
                      <p className="text-gray-400">{order.addresses.address_line}{order.addresses.ward ? `, ${order.addresses.ward}` : ""}{order.addresses.district ? `, ${order.addresses.district}` : ""}{order.addresses.province ? `, ${order.addresses.province}` : ""}</p>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-auto shrink-0 md:text-right flex flex-row md:flex-col justify-between items-center md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-semibold">Tổng thanh toán</p>
                    <p className="text-[22px] font-black text-primary mt-0.5">{formatPrice(Number(order.total_amount))}</p>
                  </div>
                  {order.order_status === "pending" && (
                    <button
                      onClick={() => handleCancelOrder(String(order.id))}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-[12px] font-bold border border-red-200 transition-all active:scale-95 shrink-0"
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerShell>
  );
}
