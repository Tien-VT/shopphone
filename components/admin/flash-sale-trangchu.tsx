"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "../admin-shell";
import { useApp } from "@/lib/app-context";

export function AdminFlashSaleTrangChuPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; discountPercent: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const { showToast } = useApp();

  useEffect(() => {
    // 1. Fetch all products
    const fetchAllProducts = fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      })
      .catch((err) => console.error("Error loading products:", err));

    // 2. Fetch selected flash sale products
    const fetchSelectedProducts = fetch("/api/admin/products/homepage-flashsale")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSelectedProducts(
            data.map((p: any) => ({
              productId: String(p.id),
              discountPercent: Number(p.flash_sale_discount_percent || 10),
            }))
          );
        }
      })
      .catch((err) => console.error("Error loading selected flash sales:", err));

    Promise.all([fetchAllProducts, fetchSelectedProducts]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleToggleProduct = (productId: string) => {
    const exists = selectedProducts.some((p) => p.productId === productId);
    if (exists) {
      setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
    } else {
      if (selectedProducts.length >= 5) {
        showToast("⚠ Chỉ được phép chọn tối đa 5 sản phẩm hiển thị trên trang chủ");
        return;
      }
      setSelectedProducts((prev) => [...prev, { productId, discountPercent: 10 }]);
    }
  };

  const handleSave = async () => {
    if (selectedProducts.length !== 5) {
      showToast("✗ Vui lòng chọn chính xác 5 sản phẩm cho mục Flash Sale trang chủ");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/products/homepage-flashsale", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedProducts }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("✓ Cập nhật sản phẩm Flash Sale trang chủ thành công!");
      } else {
        showToast(`✗ Thất bại: ${data.error || "Lỗi lưu cấu hình"}`);
      }
    } catch {
      showToast("✗ Gặp sự cố kết nối.");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = allProducts.filter((p) => {
    const query = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.sku || "").toLowerCase().includes(query)
    );
  });

  return (
    <AdminShell
      activeKey="flashsaletrangchu"
      title="Flash Sale Trang Chủ"
      subtitle="Quản lý viên"
      actionLabel="Lưu cấu hình"
      actionIcon="save"
      sectionLabel="Marketing"
      onActionClick={handleSave}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-black text-on-surface text-slate-800">Flash Sale Trang Chủ</h1>
            <p className="text-[15px] text-on-surface-variant mt-1 text-slate-500">
              Chọn đúng <span className="font-bold text-[#4f22d6]">5 sản phẩm</span> và điều chỉnh tỷ lệ giảm giá (%) để hiển thị ở mục Flash Sale của Trang chủ khách hàng.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || selectedProducts.length !== 5}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] shadow-md transition-all cursor-pointer ${
              selectedProducts.length === 5
                ? "bg-[#4f22d6] hover:bg-[#3b12be] text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            {saving ? (
              <i className="fa-solid fa-spinner animate-spin" />
            ) : (
              <i className="fa-solid fa-save" />
            )}
            Lưu cấu hình ({selectedProducts.length}/5)
          </button>
        </div>

        {/* Selected products panel */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-[15px] font-bold text-gray-700">Các sản phẩm đã chọn hiển thị ({selectedProducts.length}/5)</h3>
            {selectedProducts.length !== 5 && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                ⚠ Cần chọn đúng 5 sản phẩm
              </span>
            )}
          </div>
          {selectedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 relative">
              {selectedProducts.map((sp) => {
                const prod = allProducts.find((p) => String(p.id) === sp.productId);
                if (!prod) return null;
                const imgUrl = prod.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png";
                return (
                  <div
                    key={sp.productId}
                    className="bg-purple-50/20 p-3 rounded-xl border border-[#4f22d6] relative flex flex-col justify-between hover:shadow-md transition-shadow group"
                  >
                    <button
                      onClick={() => handleToggleProduct(sp.productId)}
                      className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-[11px] hover:bg-red-200 transition-colors"
                      title="Bỏ chọn"
                    >
                      ✕
                    </button>
                    <div>
                      <div className="h-[90px] mb-2 flex items-center justify-center">
                        <img alt={prod.name} className="max-h-full object-contain" src={imgUrl} />
                      </div>
                      <h4 className="text-[11px] font-semibold text-gray-800 line-clamp-2 mb-1">
                        {prod.name}
                      </h4>
                      <p className="text-[9px] text-gray-400 font-mono">{prod.sku}</p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1">
                      <p className="text-[#4f22d6] font-extrabold text-[12px]">
                        {Number(prod.price).toLocaleString("vi-VN")}đ
                      </p>
                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className="text-[10px] text-gray-500 shrink-0">Giảm %:</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={sp.discountPercent}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(1, Number(e.target.value)));
                            setSelectedProducts((prev) =>
                              prev.map((item) =>
                                item.productId === sp.productId ? { ...item, discountPercent: val } : item
                              )
                            );
                          }}
                          className="w-12 border border-gray-200 rounded px-1 py-0.5 text-center font-bold text-xs text-[#4f22d6] focus:border-[#4f22d6] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-gray-400 italic text-center py-6">Chưa chọn sản phẩm nào. Vui lòng chọn bên dưới.</p>
          )}
        </div>

        {/* Product selector section */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <h3 className="text-[15px] font-bold text-gray-700">Danh sách sản phẩm hệ thống</h3>
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary/30 rounded-xl pl-9 pr-4 py-2 outline-none text-xs text-gray-800 transition-all"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <i className="fa-solid fa-spinner animate-spin text-[28px] text-[#4f22d6] mb-3" />
              <p>Đang tải danh sách sản phẩm...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center py-12 text-gray-400 italic">Không tìm thấy sản phẩm phù hợp.</p>
          ) : (
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 relative">
              {filteredProducts.map((p) => {
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
          )}
        </div>
      </div>
    </AdminShell>
  );
}
