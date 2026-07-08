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
  const [productSearch, setProductSearch] = useState("");

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

  const handleToggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.productId === productId);
      if (exists) {
        return prev.filter((p) => p.productId !== productId);
      } else {
        return [...prev, { productId, discountPercent: 10 }];
      }
    });
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
            <div className="bg-white rounded-3xl w-full max-w-[1000px] shadow-2xl overflow-hidden border border-outline-variant flex flex-col max-h-[90vh]">
              <div className="p-6 bg-gradient-to-r from-primary to-primary-container text-white flex justify-between items-center shrink-0">
                <h3 className="text-[18px] font-bold">{editingCampaign ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch mới"}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 flex-grow overflow-y-auto text-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="flex items-center justify-between">
                    <h4 className="text-[14px] font-bold text-gray-700">Chọn sản phẩm tham gia Flash Sale ({selectedProducts.length} đã chọn)</h4>
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-9 pr-4 py-1.5 outline-none text-[12px] text-gray-800"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                      <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]" />
                    </div>
                  </div>
                  
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 relative max-h-[300px] overflow-y-auto border border-gray-100 rounded-2xl p-3 bg-gray-50/50">
                    {allProducts
                      .filter((p) => {
                        const query = productSearch.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(query) ||
                          (p.sku || "").toLowerCase().includes(query)
                        );
                      })
                      .map((p) => {
                        const isSelected = selectedProducts.some((sp) => sp.productId === String(p.id));
                        const currentSp = selectedProducts.find((sp) => sp.productId === String(p.id));
                        const discountVal = currentSp ? currentSp.discountPercent : 10;
                        const imgUrl = p.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png";

                        return (
                          <div
                            key={p.id.toString()}
                            onClick={() => handleToggleProduct(String(p.id))}
                            className={`bg-white p-3 rounded-xl border relative flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer ${
                              isSelected ? "border-[#4f22d6] ring-1 ring-[#4f22d6]/50" : "border-gray-200"
                            }`}
                          >
                            <div>
                              {isSelected && (
                                <span className="absolute top-2 left-2 bg-[#4f22d6] text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold z-10">
                                  Đã chọn
                                </span>
                              )}
                              <div className="h-[90px] mb-2 flex items-center justify-center">
                                <img alt={p.name} className="max-h-full object-contain" src={imgUrl} />
                              </div>
                              <h4 className="text-[11px] font-semibold text-gray-800 line-clamp-2 mb-1">
                                {p.name}
                              </h4>
                              <p className="text-[9px] text-gray-400 font-mono">{p.sku}</p>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t border-gray-50 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                              <p className="text-[#4f22d6] font-extrabold text-[12px]">
                                {Number(p.price).toLocaleString("vi-VN")}đ
                              </p>
                              {isSelected && (
                                <div className="flex items-center justify-between gap-1 mt-1">
                                  <span className="text-[10px] text-gray-500 shrink-0">Giảm %:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={discountVal}
                                    onChange={(e) => {
                                      const val = Math.min(100, Math.max(1, Number(e.target.value)));
                                      setSelectedProducts((prev) =>
                                        prev.map((item) =>
                                          item.productId === String(p.id) ? { ...item, discountPercent: val } : item
                                        )
                                      );
                                    }}
                                    className="w-12 border border-gray-200 rounded px-1 py-0.5 text-center font-bold text-xs text-[#4f22d6] focus:border-[#4f22d6] outline-none"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
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
