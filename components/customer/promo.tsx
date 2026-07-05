"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";

const promoFilters = [
  { id: "all", label: "Tất cả ưu đãi", icon: "fa-solid fa-gift" },
  { id: "ship", label: "Miễn phí vận chuyển", icon: "fa-solid fa-truck" },
  { id: "direct", label: "Giảm giá trực tiếp", icon: "fa-solid fa-tags" },
  { id: "member", label: "Ưu đãi thành viên", icon: "fa-solid fa-crown" },
];

export function CustomerPromoPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: "", show: false });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/vouchers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVouchers(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi load vouchers:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToast({ message: `Sao chép mã "${code}" thành công!`, show: true });
    
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
    
    setTimeout(() => {
      setCopiedCode(null);
    }, 4500);
  };

  // Filter categorization
  const memberVouchers = vouchers.filter((v: any) =>
    v.code.toLowerCase().includes("member") ||
    v.code.toLowerCase().includes("vip") ||
    v.code.toLowerCase().includes("thanhvien") ||
    v.code.toLowerCase().includes("gold") ||
    v.code.toLowerCase().includes("silver") ||
    v.code.toLowerCase().includes("bronze") ||
    v.name.toLowerCase().includes("thành viên") ||
    v.name.toLowerCase().includes("thanh vien") ||
    v.name.toLowerCase().includes("vip")
  );

  const shippingVouchers = vouchers.filter((v: any) =>
    (v.code.toLowerCase().includes("ship") ||
    v.code.toLowerCase().includes("free") ||
    v.name.toLowerCase().includes("vận chuyển") ||
    v.name.toLowerCase().includes("van chuyen")) &&
    !memberVouchers.includes(v)
  );

  const directVouchers = vouchers.filter(
    (v: any) => !shippingVouchers.includes(v) && !memberVouchers.includes(v)
  );

  const renderVoucherCard = (v: any, type: "ship" | "direct" | "member") => {
    const discountDesc = v.discount_type === "percent"
      ? `Giảm ${Number(v.discount_value)}%`
      : `Giảm ${Number(v.discount_value).toLocaleString("vi-VN")}đ`;
    const minOrder = Number(v.minimum_order_value || 0);
    const desc = `${discountDesc} cho đơn hàng từ ${minOrder.toLocaleString("vi-VN")}đ`;
    const expiry = v.end_at ? new Date(v.end_at).toLocaleDateString("vi-VN") : "Không thời hạn";
    const isCopied = copiedCode === v.code;

    let bgBadge = "from-emerald-50 to-teal-50 text-emerald-600";
    let iconClass = "fa-solid fa-truck-fast text-[28px]";
    let badgeText = "FREE SHIP";

    if (type === "direct") {
      const discountValStr = v.discount_type === "percent"
        ? `${Number(v.discount_value)}%`
        : `${Math.round(Number(v.discount_value) / 1000)}K`;
      bgBadge = "from-rose-50 to-red-50 text-red-600";
      iconClass = ""; 
      badgeText = discountValStr;
    } else if (type === "member") {
      bgBadge = "from-purple-50 to-indigo-50 text-[#4f22d6]";
      iconClass = "fa-solid fa-crown text-[28px]";
      badgeText = "MEMBER";
    }

    return (
      <div
        key={v.id.toString()}
        className="relative bg-white border border-gray-200 rounded-2xl flex hover:-translate-y-1 hover:shadow-lg transition-all duration-300 min-h-[145px]"
      >
        {/* Ticket Cutouts */}
        <div className="absolute left-[110px] -top-3 w-6 h-6 rounded-full bg-[#f8f9fa] border border-gray-200 z-10"></div>
        <div className="absolute left-[110px] -bottom-3 w-6 h-6 rounded-full bg-[#f8f9fa] border border-gray-200 z-10"></div>

        {/* Left Side: Badge */}
        <div className={`w-[122px] shrink-0 flex flex-col items-center justify-center p-4 border-r border-dashed border-gray-200 rounded-l-2xl bg-gradient-to-br ${bgBadge}`}>
          {iconClass ? (
            <i className={`${iconClass} mb-2`}></i>
          ) : (
            <span className="text-[28px] font-black tracking-tighter mb-1">{badgeText}</span>
          )}
          <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-85">
            {iconClass ? badgeText : "GIẢM GIÁ"}
          </span>
        </div>

        {/* Right Side: Content */}
        <div className="flex-grow p-5 flex flex-col justify-between z-0">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-extrabold text-[15px] text-gray-800 leading-snug line-clamp-1">
                {v.name}
              </h4>
              {type === "member" && (
                <span className="bg-[#4f22d6]/10 text-[#4f22d6] text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  VIP
                </span>
              )}
            </div>
            
            <p className="text-[13px] text-gray-600 mt-2 font-medium">
              {desc}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-400 font-medium">
                Hạn dùng: <span className="text-gray-500 font-bold">{expiry}</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Mã:</span>
                <span className="text-[11px] font-bold font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded uppercase select-all border border-gray-200/50">
                  {v.code}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleSave(v.code)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm cursor-pointer ${
                isCopied
                  ? "bg-emerald-500 text-white shadow-emerald-100 hover:opacity-95"
                  : "bg-[#4f22d6] hover:bg-[#3b00ae] text-white shadow-purple-100"
              }`}
            >
              {isCopied ? (
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-check"></i> Đã lưu
                </span>
              ) : (
                "Lưu mã"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <CustomerShell>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-gray-800 animate-fadeIn">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/20">
            <i className="fa-solid fa-check text-xs"></i>
          </div>
          <span className="text-[13px] font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-4 py-5">
        <div className="flex gap-6 items-start">
          {/* Sidebar Filter */}
          <aside className="w-[260px] shrink-0 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h3 className="font-extrabold text-gray-800 text-[13px] uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
              <i className="fa-solid fa-sliders text-[#4f22d6] text-[15px]"></i> Bộ lọc ưu đãi
            </h3>
            <ul className="space-y-1.5 text-[13px]">
              {promoFilters.map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <li
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                      isActive
                        ? "bg-purple-50 text-[#4f22d6] font-bold border-purple-200/50 shadow-sm shadow-purple-50"
                        : "hover:bg-gray-50 text-gray-600 border-transparent hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <i className={`${filter.icon} w-4 text-center text-[15px] opacity-75 ${isActive ? "text-[#4f22d6]" : ""}`}></i>
                      {filter.label}
                    </span>
                    <i className={`fa-solid fa-chevron-right text-[9px] transition-transform ${
                      isActive ? "text-[#4f22d6] translate-x-0.5" : "text-gray-300"
                    }`}></i>
                  </li>
                );
              })}
            </ul>

            {/* Quick Helper Card */}
            <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100/50 rounded-xl p-4">
              <h5 className="font-extrabold text-[12px] text-[#4f22d6] mb-1.5 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-question"></i> Bạn có biết?
              </h5>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                Hãy click <strong>"Lưu mã"</strong> để copy code nhanh. Nhập mã này tại trang thanh toán để áp dụng giảm giá tự động.
              </p>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-grow">
            {/* Hero banner */}
            <div className="relative rounded-2xl p-8 mb-8 text-white overflow-hidden bg-gradient-to-r from-[#4f22d6] via-[#6c3df1] to-[#805af5] shadow-lg shadow-purple-100">
              {/* Background Image Overlay */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" 
                  alt="" 
                  className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                />
              </div>

              {/* Background abstract overlay elements */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-white blur-3xl"></div>
                <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-indigo-300 blur-2xl"></div>
              </div>

              <div className="relative z-10 max-w-xl">
                <span className="inline-flex bg-red-500 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 shadow-sm shadow-red-500/20">
                  Đặc quyền ShopNow
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 leading-tight drop-shadow-sm">
                  Săn Mã Ưu Đãi
                </h1>
                <p className="text-[14px] md:text-[15px] text-purple-100/95 leading-relaxed font-medium drop-shadow-sm">
                  Tổng hợp các mã giảm giá, voucher miễn phí vận chuyển và ưu đãi đặc quyền lớn nhất dành cho khách hàng.
                </p>
              </div>
            </div>

            {/* Vouchers lists */}
            {loading ? (
              <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <i className="fa-solid fa-spinner fa-spin text-[32px] text-[#4f22d6] mb-3" />
                <p className="text-gray-500 text-sm font-semibold">Đang tải danh sách ưu đãi...</p>
              </div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <i className="fa-solid fa-gift text-[48px] text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-bold">Hiện chưa có mã ưu đãi nào được phát hành.</p>
                <p className="text-gray-400 text-xs mt-1">Vui lòng quay lại sau để nhận các khuyến mãi mới nhất.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* 1. Member Vouchers */}
                {memberVouchers.length > 0 && (activeFilter === "all" || activeFilter === "member") && (
                  <div>
                    <h2 className="font-extrabold text-[16px] uppercase tracking-wider mb-4 flex items-center gap-2 text-gray-800">
                      <i className="fa-solid fa-crown text-[#4f22d6]"></i>
                      Đặc Quyền Thành Viên VIP
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {memberVouchers.map((v) => renderVoucherCard(v, "member"))}
                    </div>
                  </div>
                )}

                {/* 2. Shipping Vouchers */}
                {shippingVouchers.length > 0 && (activeFilter === "all" || activeFilter === "ship") && (
                  <div>
                    <h2 className="font-extrabold text-[16px] uppercase tracking-wider mb-4 flex items-center gap-2 text-gray-800">
                      <i className="fa-solid fa-truck-fast text-emerald-600"></i>
                      Miễn Phí Vận Chuyển
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {shippingVouchers.map((v) => renderVoucherCard(v, "ship"))}
                    </div>
                  </div>
                )}

                {/* 3. Direct Discounts */}
                {directVouchers.length > 0 && (activeFilter === "all" || activeFilter === "direct") && (
                  <div>
                    <h2 className="font-extrabold text-[16px] uppercase tracking-wider mb-4 flex items-center gap-2 text-gray-800">
                      <i className="fa-solid fa-tags text-red-600"></i>
                      Giảm Giá Trực Tiếp
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {directVouchers.map((v) => renderVoucherCard(v, "direct"))}
                    </div>
                  </div>
                )}

                {/* Empty filter fallbacks */}
                {activeFilter === "member" && memberVouchers.length === 0 && (
                  <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <i className="fa-solid fa-crown text-[36px] text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm font-semibold">Chưa có mã ưu đãi dành riêng cho thành viên.</p>
                  </div>
                )}
                {activeFilter === "ship" && shippingVouchers.length === 0 && (
                  <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <i className="fa-solid fa-truck text-[36px] text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm font-semibold">Chưa có mã miễn phí vận chuyển nào khả dụng.</p>
                  </div>
                )}
                {activeFilter === "direct" && directVouchers.length === 0 && (
                  <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <i className="fa-solid fa-tags text-[36px] text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm font-semibold">Chưa có mã giảm giá trực tiếp nào khả dụng.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerShell>
  );
}
