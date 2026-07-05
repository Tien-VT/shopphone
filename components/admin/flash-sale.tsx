"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "../admin-shell";
import { useApp } from "@/lib/app-context";

export function AdminFlashSalePage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const { showToast, adminSearch } = useApp();

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; discountPercent: number }[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    startAt: "",
    endAt: "",
    status: "scheduled",
  });

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/flashsales");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();

    // Fetch all products for selection
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  const openAddModal = () => {
    setEditingCampaign(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      startAt: "",
      endAt: "",
      status: "scheduled",
    });
    setSelectedProducts([]);
    setShowModal(true);
  };

  const openEditModal = (c: any) => {
    setEditingCampaign(c);
    setFormData({
      title: c.title,
      slug: c.slug,
      description: c.description || "",
      startAt: c.start_at ? new Date(c.start_at).toISOString().substring(0, 16) : "",
      endAt: c.end_at ? new Date(c.end_at).toISOString().substring(0, 16) : "",
      status: c.status,
    });
    // Parse selected products from c.products_json
    try {
      if (c.products_json) {
        const parsed = JSON.parse(c.products_json);
        if (Array.isArray(parsed)) {
          setSelectedProducts(parsed.map((p: any) => ({
            productId: String(p.productId),
            discountPercent: Number(p.discountPercent || 0)
          })));
        } else {
          setSelectedProducts([]);
        }
      } else {
        setSelectedProducts([]);
      }
    } catch {
      setSelectedProducts([]);
    }
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: generatedSlug,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingCampaign ? "PUT" : "POST";
      const payload = {
        ...(editingCampaign ? { id: editingCampaign.id.toString() } : {}),
        ...formData,
        productsJson: selectedProducts.map(p => ({
          productId: p.productId,
          discountPercent: Number(p.discountPercent)
        }))
      };

      const res = await fetch("/api/admin/flashsales", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ Thất bại: ${data.error || "Lỗi lưu chiến dịch"}`);
        return;
      }

      showToast(editingCampaign ? "✓ Đã cập nhật chiến dịch thành công." : "✓ Đã thêm chiến dịch thành công.");
      setShowModal(false);
      fetchCampaigns();
    } catch {
      showToast("✗ Gặp sự cố kết nối.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có muốn xóa chiến dịch này không?")) return;

    try {
      const res = await fetch(`/api/admin/flashsales?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("✓ Đã xóa chiến dịch thành công.");
        fetchCampaigns();
      } else {
        const data = await res.json();
        showToast(`✗ Lỗi xóa chiến dịch: ${data.error}`);
      }
    } catch {
      showToast("✗ Lỗi kết nối hệ thống.");
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = 
      (c.title || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(adminSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filter === "active") return c.status === "active";
    if (filter === "upcoming") return c.status === "scheduled";
    return true;
  });

  return (
    <AdminShell
      activeKey="flashsale"
      title="Chiến dịch Flash Sale"
      subtitle="Quản lý viên"
      actionLabel="Thêm chiến dịch"
      actionIcon="add"
      sectionLabel="Marketing"
      onActionClick={openAddModal}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-black text-on-surface">Chiến dịch Flash Sale</h1>
            <p className="text-[15px] text-on-surface-variant mt-1">
              Tạo và quản lý các chương trình giảm giá giờ vàng (Flash Sale) trong hệ thống ShopNow.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#4f22d6] hover:bg-[#3b12be] text-white px-5 py-2.5 rounded-xl font-bold text-[13px] shadow-md transition-all cursor-pointer"
          >
            <i className="fa-solid fa-plus" /> Thêm chiến dịch mới
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-outline-variant pb-1">
          {[
            { key: "all", label: "Tất cả" },
            { key: "active", label: "Đang diễn ra" },
            { key: "upcoming", label: "Chờ bắt đầu" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-[13px] font-bold transition-all relative ${
                filter === tab.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <i className="fa-solid fa-spinner animate-spin text-[28px] text-[#4f22d6] mb-3" />
              <p>Đang tải danh sách chiến dịch...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="material-symbols-outlined text-[48px] mb-2 text-gray-300">bolt</span>
              <p>Chưa có chiến dịch Flash Sale nào được tạo.</p>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant text-[13px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-5 text-left">Tên chiến dịch</th>
                  <th className="px-6 py-5 text-left">Thời gian bắt đầu</th>
                  <th className="px-6 py-5 text-left">Thời gian kết thúc</th>
                  <th className="px-6 py-5 text-left">Trạng thái</th>
                  <th className="px-6 py-5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-[14px]">
                {filteredCampaigns.map((c) => (
                  <tr key={c.id.toString()} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{c.title}</span>
                        <span className="text-[12px] text-gray-400 mt-0.5 font-mono">Slug: {c.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant font-medium">
                      {new Date(c.start_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant font-medium">
                      {new Date(c.end_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 font-bold text-[12px] ${
                        c.status === "active" ? "text-emerald-600" : c.status === "ended" ? "text-red-500" : "text-amber-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          c.status === "active" ? "bg-emerald-500 animate-pulse" : c.status === "ended" ? "bg-red-500" : "bg-amber-500"
                        }`}></span>
                        {c.status === "active" ? "Đang diễn ra" : c.status === "ended" ? "Đã kết thúc" : "Chờ bắt đầu"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 text-on-surface-variant">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 hover:bg-primary-fixed/20 rounded-full text-primary transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c.id.toString())}
                          className="p-2 hover:bg-error-container/20 text-error rounded-full transition-colors cursor-pointer"
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

        {/* Campaign Form Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-[720px] shadow-2xl overflow-hidden border border-outline-variant flex flex-col max-h-[90vh]">
              <div className="p-6 bg-gradient-to-r from-primary to-primary-container text-white flex justify-between items-center shrink-0">
                <h3 className="text-[18px] font-bold">{editingCampaign ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch mới"}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 flex-grow overflow-y-auto">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Tiêu đề chiến dịch</label>
                  <input
                    name="title"
                    required
                    type="text"
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                    placeholder="Ví dụ: Siêu Sale Khai Trương"
                    value={formData.title}
                    onChange={handleTitleChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Slug</label>
                  <input
                    name="slug"
                    required
                    type="text"
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 font-mono text-xs"
                    value={formData.slug}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Thời gian bắt đầu</label>
                  <input
                    name="startAt"
                    required
                    type="datetime-local"
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                    value={formData.startAt}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Thời gian kết thúc</label>
                  <input
                    name="endAt"
                    required
                    type="datetime-local"
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                    value={formData.endAt}
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
                    <option value="scheduled">Chờ bắt đầu</option>
                    <option value="active">Đang diễn ra</option>
                    <option value="ended">Đã kết thúc</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Mô tả ngắn</label>
                  <textarea
                    name="description"
                    rows={2}
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 resize-none"
                    placeholder="Mô tả chiến dịch..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                {/* Chọn sản phẩm tham gia Flash Sale */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <h4 className="text-[14px] font-bold text-gray-700">Sản phẩm tham gia Flash Sale</h4>
                  
                  <div className="flex gap-2">
                    <select
                      id="fs-product-select"
                      className="flex-grow bg-gray-50 border border-outline-variant rounded-xl px-3 py-2.5 text-[13px] text-gray-800 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>-- Chọn sản phẩm --</option>
                      {allProducts.filter(p => !selectedProducts.some(sp => sp.productId === String(p.id))).map(p => (
                        <option key={p.id.toString()} value={p.id.toString()}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                    
                    <input
                      id="fs-discount-input"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="% Giảm"
                      defaultValue="10"
                      className="w-20 bg-gray-50 border border-outline-variant rounded-xl px-3 py-2.5 text-[13px] text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    
                    <button
                      type="button"
                      onClick={() => {
                        const selectEl = document.getElementById("fs-product-select") as HTMLSelectElement;
                        const discountEl = document.getElementById("fs-discount-input") as HTMLInputElement;
                        if (selectEl && selectEl.value && discountEl) {
                          const pId = selectEl.value;
                          const pct = Number(discountEl.value || 0);
                          if (pct <= 0 || pct > 100) {
                            showToast("✗ Phần trăm giảm giá phải từ 1 đến 100%");
                            return;
                          }
                          setSelectedProducts(prev => [...prev, { productId: pId, discountPercent: pct }]);
                          selectEl.value = "";
                        } else {
                          showToast("✗ Vui lòng chọn sản phẩm muốn thêm");
                        }
                      }}
                      className="bg-primary text-white px-4 py-2.5 rounded-xl text-[12px] font-bold hover:opacity-90 active:scale-95 shrink-0 cursor-pointer transition-all shadow-sm"
                    >
                      Thêm
                    </button>
                  </div>

                  {/* Danh sách sản phẩm đã thêm */}
                  {selectedProducts.length > 0 ? (
                    <div className="border border-purple-50 bg-purple-50/5 rounded-2xl p-3 space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {selectedProducts.map((sp, idx) => {
                        const prod = allProducts.find(p => String(p.id) === sp.productId);
                        return (
                          <div key={sp.productId} className="flex items-center justify-between gap-3 text-[12px] p-2 bg-white border border-gray-100 rounded-xl">
                            <span className="font-semibold text-gray-700 truncate flex-grow">
                              {prod ? prod.name : `Sản phẩm #${sp.productId}`}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-gray-400">Giảm:</span>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={sp.discountPercent}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setSelectedProducts(prev => prev.map((item, i) => i === idx ? { ...item, discountPercent: val } : item));
                                }}
                                className="w-14 border border-gray-200 rounded px-1.5 py-0.5 text-center font-bold text-primary"
                              />
                              <span className="font-bold text-gray-500">%</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProducts(prev => prev.filter(item => item.productId !== sp.productId));
                                }}
                                className="text-red-500 hover:text-red-700 font-bold ml-1 text-[16px] cursor-pointer"
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center py-2">Chưa có sản phẩm nào tham gia.</p>
                  )}
                </div>

                <div className="pt-4 flex gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-outline-variant hover:bg-gray-50 rounded-xl font-bold text-gray-600 text-sm transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-on-primary hover:opacity-90 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
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
