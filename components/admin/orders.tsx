"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "../admin-shell";
import { useApp } from "@/lib/app-context";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const { showToast, adminSearch } = useApp();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      } else {
        showToast("✗ Không thể tải danh sách đơn hàng.");
      }
    } catch {
      showToast("✗ Lỗi kết nối hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, orderStatus: string, paymentStatus?: string) => {
    try {
      setUpdatingId(orderId);
      const payload: any = { id: orderId, order_status: orderStatus };
      if (paymentStatus) payload.payment_status = paymentStatus;

      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("✓ Cập nhật trạng thái đơn hàng thành công.");
        fetchOrders();
        // Update selectedOrder if it is currently open in modal
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({
            ...prev,
            order_status: orderStatus,
            ...(paymentStatus ? { payment_status: paymentStatus } : {}),
          }));
        }
      } else {
        const data = await res.json();
        showToast(`✗ Cập nhật thất bại: ${data.error}`);
      }
    } catch {
      showToast("✗ Gặp sự cố kết nối.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders by search query
  const filteredOrders = orders.filter((order) => {
    const searchLower = adminSearch.toLowerCase();
    return (
      (order.order_code || "").toLowerCase().includes(searchLower) ||
      (order.users?.full_name || "").toLowerCase().includes(searchLower) ||
      (order.users?.email || "").toLowerCase().includes(searchLower) ||
      (order.users?.phone || "").includes(searchLower)
    );
  });

  const fmt = (v: number) => v.toLocaleString("vi-VN") + "đ";

  // Statistics calculation
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.order_status === "pending").length;
  const completedCount = orders.filter((o) => o.order_status === "completed").length;
  const totalRevenue = orders
    .filter((o) => o.order_status === "completed" && o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-amber-100 text-amber-700 text-[12px] font-bold px-3 py-1 rounded-full">Đang xử lý</span>;
      case "confirmed":
        return <span className="bg-blue-100 text-blue-700 text-[12px] font-bold px-3 py-1 rounded-full">Đã xác nhận</span>;
      case "shipping":
        return <span className="bg-indigo-100 text-indigo-700 text-[12px] font-bold px-3 py-1 rounded-full">Đang giao</span>;
      case "completed":
        return <span className="bg-emerald-100 text-emerald-700 text-[12px] font-bold px-3 py-1 rounded-full">Đã hoàn thành</span>;
      case "cancelled":
        return <span className="bg-rose-100 text-rose-700 text-[12px] font-bold px-3 py-1 rounded-full">Đã hủy</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-[12px] font-bold px-3 py-1 rounded-full">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="bg-green-100 text-green-700 text-[12px] font-bold px-2 py-0.5 rounded-md">Đã thanh toán</span>;
      case "unpaid":
        return <span className="bg-red-100 text-red-700 text-[12px] font-bold px-2 py-0.5 rounded-md">Chưa thanh toán</span>;
      case "refunded":
        return <span className="bg-amber-100 text-amber-700 text-[12px] font-bold px-2 py-0.5 rounded-md">Đã hoàn tiền</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-[12px] font-bold px-2 py-0.5 rounded-md">{status}</span>;
    }
  };

  return (
    <AdminShell
      activeKey="orders"
      title="Quản lý đơn hàng"
      subtitle="Quản trị viên"
      actionLabel="Đồng bộ đơn"
      actionIcon="sync"
      sectionLabel="Kinh doanh"
      onActionClick={fetchOrders}
    >
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-black text-on-surface">Quản lý đơn hàng</h1>
            <p className="text-[15px] text-on-surface-variant mt-1">
              Theo dõi, xử lý và cập nhật trạng thái giao hàng, thanh toán cho các đơn hàng của hệ thống.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card bg-white p-6 rounded-[24px] flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-[12px] font-medium">Tổng đơn hàng</p>
              <p className="text-[24px] font-black text-gray-800">{totalOrders}</p>
            </div>
          </div>
          
          <div className="glass-card bg-white p-6 rounded-[24px] flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">hourglass_empty</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-[12px] font-medium">Đơn chờ xử lý</p>
              <p className="text-[24px] font-black text-gray-800">{pendingCount}</p>
            </div>
          </div>

          <div className="glass-card bg-white p-6 rounded-[24px] flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-[12px] font-medium">Đã hoàn thành</p>
              <p className="text-[24px] font-black text-gray-800">{completedCount}</p>
            </div>
          </div>

          <div className="glass-card bg-white p-6 rounded-[24px] flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-[12px] font-medium">Doanh thu xác nhận</p>
              <p className="text-[22px] font-black text-[#4f22d6]">{fmt(totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-20">
              <i className="fa-solid fa-spinner fa-spin text-primary text-[30px] mb-3"></i>
              <p className="text-gray-500 text-sm font-semibold">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <span className="material-symbols-outlined text-[60px] block mb-3 opacity-40">orders</span>
              <p className="text-sm">Không tìm thấy đơn hàng nào phù hợp.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">MÃ ĐƠN</th>
                    <th className="px-6 py-4">KHÁCH HÀNG</th>
                    <th className="px-6 py-4">NGÀY MUA</th>
                    <th className="px-6 py-4">PHƯƠNG THỨC</th>
                    <th className="px-6 py-4">TỔNG TIỀN</th>
                    <th className="px-6 py-4">THANH TOÁN</th>
                    <th className="px-6 py-4">TRẠNG THÁI</th>
                    <th className="px-6 py-4 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[14px]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 font-mono text-[13px]">
                        {order.order_code}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800 text-[13.5px]">
                            {order.users?.full_name || "Khách vãng lai"}
                          </p>
                          <p className="text-[11.5px] text-slate-400 font-medium mt-0.5">
                            {order.users?.phone || order.users?.email || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[13px] font-medium">
                        {new Date(order.created_at).toLocaleDateString("vi-VN")} {new Date(order.created_at).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                        {order.payment_method === "cod" ? "COD" : order.payment_method === "momo" ? "MOMO" : "Thẻ ATM"}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#4f22d6]">
                        {fmt(Number(order.total_amount))}
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentStatusBadge(order.payment_status)}
                      </td>
                      <td className="px-6 py-4">
                        {getOrderStatusBadge(order.order_status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-[17px] font-black text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">receipt_long</span>
                  Chi tiết đơn hàng: {selectedOrder.order_code}
                </h2>
                <p className="text-[12px] text-slate-400 font-semibold mt-0.5">
                  Ngày mua: {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setShowDetailsModal(false);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Customer and Delivery address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Thông tin khách hàng</h4>
                  <p className="font-bold text-slate-700 text-[14px]">{selectedOrder.users?.full_name || "Khách hàng"}</p>
                  <p className="text-[12.5px] text-slate-500 font-semibold mt-1">Email: {selectedOrder.users?.email || "-"}</p>
                  <p className="text-[12.5px] text-slate-500 font-semibold mt-1">SĐT: {selectedOrder.users?.phone || "-"}</p>
                </div>
                <div>
                  <h4 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Địa chỉ giao hàng</h4>
                  {selectedOrder.addresses ? (
                    <>
                      <p className="font-bold text-slate-700 text-[14px]">{selectedOrder.addresses.recipient_name}</p>
                      <p className="text-[12.5px] text-slate-500 font-semibold mt-1">SĐT nhận: {selectedOrder.addresses.phone}</p>
                      <p className="text-[12.5px] text-slate-500 font-medium leading-relaxed mt-1">
                        {selectedOrder.addresses.address_line}, {selectedOrder.addresses.ward}, {selectedOrder.addresses.district}, {selectedOrder.addresses.province}
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-400 text-[13px] font-semibold italic">Không có địa chỉ giao hàng.</p>
                  )}
                </div>
              </div>

              {/* Order Items list */}
              <div>
                <h4 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Sản phẩm đã mua</h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-[13px] border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-2.5">TÊN SẢN PHẨM</th>
                        <th className="px-4 py-2.5 text-center">SL</th>
                        <th className="px-4 py-2.5 text-right">ĐƠN GIÁ</th>
                        <th className="px-4 py-2.5 text-right">THÀNH TIỀN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {selectedOrder.order_items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-bold text-slate-700 max-w-[250px] line-clamp-2">
                            {item.product_name}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 font-mono">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500">
                            {fmt(Number(item.unit_price))}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800">
                            {fmt(Number(item.total_price))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes and pricing Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <h4 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Ghi chú đơn hàng</h4>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-[13px] text-slate-600 font-medium min-h-[60px] italic">
                    {selectedOrder.note || "Không có ghi chú nào."}
                  </div>
                </div>
                <div className="space-y-2 text-[13.5px] font-medium text-slate-500">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span className="font-bold text-slate-700">{fmt(Number(selectedOrder.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>Giảm giá (Voucher):</span>
                    <span className="font-bold">- {fmt(Number(selectedOrder.discount_amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="font-bold text-slate-700">{fmt(Number(selectedOrder.shipping_fee))}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dashed border-slate-100 text-[15px] font-black text-slate-800">
                    <span>Tổng số tiền:</span>
                    <span className="text-[#4f22d6]">{fmt(Number(selectedOrder.total_amount))}</span>
                  </div>
                </div>
              </div>

              {/* Status and updating options */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-wider">Cập nhật trạng thái đơn hàng</h4>
                
                {updatingId === selectedOrder.id.toString() ? (
                  <div className="flex items-center justify-center py-2 text-slate-400 text-sm">
                    <i className="fa-solid fa-spinner animate-spin mr-2"></i> Đang cập nhật...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {/* Status pending transitions */}
                    {selectedOrder.order_status === "pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id.toString(), "confirmed")}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-[12.5px] shadow-sm transition-all cursor-pointer"
                        >
                          ✓ Xác nhận đơn hàng
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id.toString(), "cancelled")}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold px-4 py-2 rounded-xl text-[12.5px] transition-all cursor-pointer"
                        >
                          ✕ Hủy đơn hàng
                        </button>
                      </>
                    )}

                    {/* Status confirmed transitions */}
                    {selectedOrder.order_status === "confirmed" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id.toString(), "shipping")}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-[12.5px] shadow-sm transition-all cursor-pointer"
                        >
                          🚚 Giao cho ĐVVC
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id.toString(), "cancelled")}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold px-4 py-2 rounded-xl text-[12.5px] transition-all cursor-pointer"
                        >
                          ✕ Hủy đơn hàng
                        </button>
                      </>
                    )}

                    {/* Status shipping transitions */}
                    {selectedOrder.order_status === "shipping" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id.toString(), "completed", "paid")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-[12.5px] shadow-sm transition-all cursor-pointer"
                        >
                          ✓ Hoàn thành đơn hàng
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id.toString(), "cancelled")}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold px-4 py-2 rounded-xl text-[12.5px] transition-all cursor-pointer"
                        >
                          ✕ Đơn giao thất bại / Hủy đơn
                        </button>
                      </>
                    )}

                    {/* Order status completed transitions */}
                    {selectedOrder.order_status === "completed" && (
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 text-[12.5px] font-bold">
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                        Đơn hàng đã hoàn tất giao dịch. Không thể sửa trạng thái.
                      </div>
                    )}

                    {/* Order status cancelled transitions */}
                    {selectedOrder.order_status === "cancelled" && (
                      <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl border border-rose-100 text-[12.5px] font-bold">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        Đơn hàng này đã bị hủy.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
