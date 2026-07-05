"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "../admin-shell";
import { useApp } from "@/lib/app-context";

export function AdminVoucherPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const { showToast, adminSearch } = useApp();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "percent",
    discountValue: "",
    minimumOrderValue: "0",
    maxDiscountValue: "",
    startAt: "",
    endAt: "",
    usageLimit: "",
    status: "active",
  });

  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/admin/vouchers");
      if (res.ok) {
        const data = await res.json();
        setVouchers(data || []);
      }
    } catch (err) {
      console.error("Error fetching vouchers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const openAddModal = () => {
    setEditingVoucher(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      discountType: "percent",
      discountValue: "",
      minimumOrderValue: "0",
      maxDiscountValue: "",
      startAt: "",
      endAt: "",
      usageLimit: "",
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (v: any) => {
    setEditingVoucher(v);
    setFormData({
      code: v.code,
      name: v.name,
      description: v.description || "",
      discountType: v.discount_type,
      discountValue: String(v.discount_value),
      minimumOrderValue: String(v.minimum_order_value || "0"),
      maxDiscountValue: v.max_discount_value ? String(v.max_discount_value) : "",
      startAt: v.start_at ? new Date(v.start_at).toISOString().split("T")[0] : "",
      endAt: v.end_at ? new Date(v.end_at).toISOString().split("T")[0] : "",
      usageLimit: v.usage_limit ? String(v.usage_limit) : "",
      status: v.status,
    });
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingVoucher ? "PUT" : "POST";
      const payload = editingVoucher
        ? { id: editingVoucher.id.toString(), ...formData }
        : formData;

      const res = await fetch("/api/admin/vouchers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ Thất bại: ${data.error || "Lỗi lưu voucher"}`);
        return;
      }

      showToast(editingVoucher ? "✓ Đã cập nhật voucher thành công." : "✓ Đã thêm voucher thành công.");
      setShowModal(false);
      fetchVouchers();
    } catch {
      showToast("✗ Gặp sự cố kết nối.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa voucher này?")) return;

    try {
      const res = await fetch(`/api/admin/vouchers?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("✓ Đã xóa voucher thành công.");
        fetchVouchers();
      } else {
        const data = await res.json();
        showToast(`✗ Lỗi xóa voucher: ${data.error}`);
      }
    } catch {
      showToast("✗ Lỗi kết nối hệ thống.");
    }
  };

  const formatPrice = (num: number) => {
    return num.toLocaleString("vi-VN") + "đ";
  };

  const filteredVouchers = vouchers.filter(
    (v) =>
      (v.code || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (v.description || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (v.name || "").toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <AdminShell
      activeKey="voucher"
      title="Quản lý Voucher"
      subtitle="Quản lý viên"
      actionLabel="Thêm Voucher"
      actionIcon="add"
      sectionLabel="Marketing"
      onActionClick={openAddModal}
    >
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-black text-on-surface">Danh sách Voucher</h1>
            <p className="text-[15px] text-on-surface-variant mt-1">
              Quản lý và theo dõi hiệu suất các chương trình khuyến mãi giảm giá của cửa hàng.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-primary text-on-primary px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity text-[14px] shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tạo Voucher mới
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card bg-white p-6 rounded-[24px] flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-fixed text-primary rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined">confirmation_number</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-[12px] font-medium">Tổng số mã</p>
              <p className="text-[24px] font-black text-gray-800">{vouchers.length}</p>
            </div>
          </div>
          <div className="glass-card bg-white p-6 rounded-[24px] flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-[#e9fff5] text-emerald-600 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined">done</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-[12px] font-medium">Đang hoạt động</p>
              <p className="text-[24px] font-black text-gray-800">{vouchers.filter((v) => v.status === "active").length}</p>
            </div>
          </div>
          <div className="glass-card bg-white p-6 rounded-[24px] flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-tertiary-fixed text-on-tertiary-container rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-[12px] font-medium">Đã tạm ẩn</p>
              <p className="text-[24px] font-black text-gray-800">{vouchers.filter((v) => v.status === "inactive").length}</p>
            </div>
          </div>
          <div className="glass-card bg-white p-6 rounded-[24px] flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-error-container text-on-error-container rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined">trending_down</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-[12px] font-medium">Đã hết hạn</p>
              <p className="text-[24px] font-black text-gray-800">{vouchers.filter((v) => v.status === "expired").length}</p>
            </div>
          </div>
        </div>

        {/* Vouchers Table */}
        <div className="glass-card bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
          {loading ? (
            <div className="text-center py-20">
              <i className="fa-solid fa-spinner fa-spin text-primary text-[30px] mb-3"></i>
              <p className="text-gray-500 text-sm">Đang tải danh sách voucher...</p>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-[60px] text-gray-300 block mb-4">confirmation_number</span>
              <p className="text-gray-500 text-sm">Không tìm thấy voucher phù hợp.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[13px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 border-b border-outline-variant">MÃ VOUCHER</th>
                  <th className="px-6 py-4 border-b border-outline-variant">GIÁ TRỊ GIẢM</th>
                  <th className="px-6 py-4 border-b border-outline-variant">ĐIỀU KIỆN</th>
                  <th className="px-6 py-4 border-b border-outline-variant">HẠN SỬ DỤNG</th>
                  <th className="px-6 py-4 border-b border-outline-variant">TRẠNG THÁI</th>
                  <th className="px-6 py-4 border-b border-outline-variant text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-[14px]">
                {filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-container/10 p-2 rounded-lg text-primary">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            local_offer
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{v.code}</p>
                          <p className="text-[12px] text-gray-400 mt-0.5">{v.description || v.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-secondary-container/30 text-on-secondary-container px-3 py-1 rounded-full font-bold text-[12px]">
                        {v.discount_type === "percent" ? `Giảm ${v.discount_value}%` : `Giảm ${formatPrice(Number(v.discount_value))}`}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant font-medium">
                      Đơn từ {formatPrice(Number(v.minimum_order_value))}
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant text-xs">
                      {v.end_at ? new Date(v.end_at).toLocaleDateString("vi-VN") : "Không thời hạn"}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${
                        v.status === "active"
                          ? "bg-green-100 text-green-700"
                          : v.status === "expired"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {v.status === "active" && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
                        {v.status === "active" ? "Đang chạy" : v.status === "expired" ? "Hết hạn" : "Tạm dừng"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 text-on-surface-variant">
                        <button
                          onClick={() => openEditModal(v)}
                          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-highest text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(v.id.toString())}
                          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-error-container text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Voucher Form Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden border border-outline-variant flex flex-col max-h-[90vh]">
              <div className="p-6 bg-gradient-to-r from-primary to-primary-container text-white flex justify-between items-center shrink-0">
                <h3 className="text-[18px] font-bold">{editingVoucher ? "Chỉnh sửa Voucher" : "Tạo Voucher mới"}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-600">Mã giảm giá (Code)</label>
                    <input
                      name="code"
                      required
                      type="text"
                      className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 font-mono text-xs uppercase"
                      placeholder="Ví dụ: SALE50K"
                      value={formData.code}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-600">Tên chương trình</label>
                    <input
                      name="name"
                      required
                      type="text"
                      className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                      placeholder="Ví dụ: Chào mừng khách mới"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-600">Loại giảm giá</label>
                    <select
                      name="discountType"
                      className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 bg-white"
                      value={formData.discountType}
                      onChange={handleInputChange}
                    >
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (đ)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-600">Giá trị giảm giá</label>
                    <input
                      name="discountValue"
                      required
                      type="number"
                      className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                      placeholder="Ví dụ: 10 hoặc 50000"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-600">Đơn hàng tối thiểu (đ)</label>
                    <input
                      name="minimumOrderValue"
                      type="number"
                      className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                      value={formData.minimumOrderValue}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-600">Giảm tối đa (đ) - Tùy chọn</label>
                    <input
                      name="maxDiscountValue"
                      type="number"
                      className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                      value={formData.maxDiscountValue}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-600">Ngày bắt đầu</label>
                    <input
                      name="startAt"
                      type="date"
                      className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                      value={formData.startAt}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-600">Ngày hết hạn</label>
                    <input
                      name="endAt"
                      type="date"
                      className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                      value={formData.endAt}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-600">Giới hạn số lần dùng</label>
                    <input
                      name="usageLimit"
                      type="number"
                      placeholder="Bỏ trống nếu vô hạn"
                      className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-600">Trạng thái</label>
                    <select
                      name="status"
                      className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 bg-white"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Đang kích hoạt</option>
                      <option value="inactive">Tạm ngưng</option>
                      <option value="expired">Hết hạn</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[13px] font-semibold text-gray-600">Mô tả ngắn</label>
                    <textarea
                      name="description"
                      rows={2}
                      className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 resize-none"
                      placeholder="Mô tả điều kiện hoặc chính sách áp dụng..."
                      value={formData.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-outline-variant hover:bg-gray-50 rounded-xl font-bold text-gray-600 text-sm transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-on-primary hover:opacity-90 rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
