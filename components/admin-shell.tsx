"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useApp } from "@/lib/app-context";

type AdminShellProps = {
  activeKey: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  actionIcon: string;
  sectionLabel: string;
  children: ReactNode;
  onActionClick?: () => void;
};

const menuGroups = [
  {
    title: "Báo cáo & Tổng quan",
    items: [
      { key: "dashboard", label: "Bảng tổng quan", icon: "dashboard", href: "/tongquan" },
    ]
  },
  {
    title: "Quản lý kinh doanh",
    items: [
      { key: "products", label: "Sản phẩm", icon: "inventory_2", href: "/quanlysanpham" },
      { key: "orders", label: "Đơn hàng", icon: "shopping_cart", href: "/quanlydonhang" },
      { key: "categories", label: "Danh mục", icon: "category", href: "/quanlydanhmuc" },
      { key: "users", label: "Khách hàng", icon: "group", href: "/quanlynguoidung" },
    ]
  },
  {
    title: "Khuyến mãi & Marketing",
    items: [
      { key: "flashsale", label: "Flash Sale", icon: "bolt", href: "/quanlyflashsale" },
      { key: "voucher", label: "Mã giảm giá (Voucher)", icon: "confirmation_number", href: "/quanlyvoucher" },
      { key: "offers", label: "Chương trình ưu đãi", icon: "redeem", href: "/quanlyuudai" },
    ]
  },
  {
    title: "Nội dung & Đánh giá",
    items: [
      { key: "news", label: "Tin tức & Bài viết", icon: "newspaper", href: "/quanlytintuc" },
      { key: "reviews", label: "Đánh giá của khách", icon: "reviews", href: "/quanlydanhgia" },
    ]
  }
];

function Icon({ name, filled = false, className = "" }: { name: string; filled?: boolean; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24" } : undefined}
    >
      {name}
    </span>
  );
}

export function AdminShell({
  activeKey,
  title,
  subtitle,
  actionLabel,
  actionIcon,
  sectionLabel,
  children,
  onActionClick,
}: AdminShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { user, adminSearch, setAdminSearch } = useApp();
  const [settingsData, setSettingsData] = useState({
    shopName: "ShopNow",
    hotline: "1900 8888",
    email: "support@shopnow.vn",
    address: "Hà Nội, Việt Nam",
    maintenance: false
  });

  const handleExportReport = () => {
    const headers = "ID,Tên sản phẩm,Giá niêm yết,Số lượng tồn kho,Trạng thái\n";
    const rows = 
      "1,iPhone 17 Pro Max,36000000,10,Mở bán\n" +
      "2,Samsung Galaxy S24 Ultra,29990000,15,Mở bán\n" +
      "3,Sony WH-1000XM5,8490000,8,Mở bán\n" +
      "4,MacBook Air M3,27990000,5,Mở bán\n";
    
    const BOM = "\uFEFF";
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(BOM + headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `Bao_cao_ton_kho_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✓ Đã lưu cấu hình hệ thống thành công!");
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex">
      {/* Sidebar - Premium White Glassmorphism */}
      <aside className={`h-screen w-72 flex flex-col fixed left-0 top-0 bg-white/95 backdrop-blur-xl border-r border-slate-100 text-slate-855 z-50 transition-all duration-300 shadow-[2px_0_15px_-3px_rgba(0,0,0,0.02)] ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-slate-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-violet-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 relative shrink-0">
              <Icon name="shopping_bag" filled className="text-white text-[20px]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h1 className="text-[15px] font-black text-slate-800 tracking-tight leading-none">
                ShopNow Admin
              </h1>
              <p className="text-[9px] text-slate-400 font-extrabold mt-1 tracking-wider uppercase">Workspace Pro</p>
            </div>
          </div>
        </div>

        {/* Grouped Sidebar Items */}
        <nav className="flex-grow px-3 py-5 overflow-y-auto custom-scrollbar space-y-6">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="px-3 mb-1.5 text-[9px] font-black text-slate-400 tracking-widest uppercase">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.key === activeKey;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 text-[13.5px] font-semibold relative group active:scale-[0.98] ${
                        isActive
                          ? "bg-primary/8 text-primary font-bold shadow-sm"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/70"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"></span>
                      )}
                      <Icon 
                        name={item.icon} 
                        filled={isActive} 
                        className={`transition-colors duration-200 text-[19px] ${
                          isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"
                        }`} 
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Action Buttons Grid in Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/40 space-y-2">
          <button
            onClick={handleExportReport}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-[13px] shadow-sm cursor-pointer"
          >
            <Icon name="add_chart" className="text-slate-500 text-[18px]" />
            <span>Xuất báo cáo nhanh</span>
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex-1 flex items-center justify-center gap-2 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 py-2.5 rounded-xl text-[12.5px] font-bold active:scale-[0.98] transition-all cursor-pointer"
              title="Cài đặt hệ thống"
            >
              <Icon name="settings" className="text-[17px] text-slate-500" />
              <span>Cài đặt</span>
            </button>
            
            <button
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                } catch (err) {
                  console.error("Lỗi đăng xuất:", err);
                }
                window.location.href = "/admin";
              }}
              className="flex-1 flex items-center justify-center gap-2 text-rose-600 bg-rose-50 hover:bg-rose-100 py-2.5 rounded-xl text-[12.5px] font-bold active:scale-[0.98] transition-all cursor-pointer"
            >
              <Icon name="logout" className="text-[17px]" />
              <span>Thoát</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Topbar and Main Content */}
      <div className={`flex flex-col min-h-screen w-full transition-all duration-300 ${
        isSidebarOpen ? "pl-72" : "pl-0"
      }`}>
        <header className="flex justify-between items-center w-full px-8 h-20 sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4 w-1/2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all text-slate-700 shrink-0 active:scale-90"
              title={isSidebarOpen ? "Đóng Sidebar" : "Mở Sidebar"}
            >
              <Icon name={isSidebarOpen ? "menu_open" : "menu"} />
            </button>
            
            <div className="hidden xl:block shrink-0">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 leading-none">{sectionLabel}</p>
              <h2 className="text-[18px] font-extrabold text-primary leading-tight mt-1">{title}</h2>
            </div>
            
            <div className="relative w-full max-w-md xl:ml-4">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-full py-2.5 pl-12 pr-4 text-[14px] transition-all outline-none text-slate-800"
                placeholder="Tìm kiếm mọi thứ ở đây..."
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notification Button */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowHelp(false); }}
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all relative text-slate-700 active:scale-95 cursor-pointer ${
                  showNotifications ? "bg-slate-100 ring-2 ring-primary/10" : ""
                }`}
              >
                <Icon name="notifications" className="text-[20px]" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl p-4 z-50 animate-slide-up text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50 mb-3">
                    <h4 className="text-[12.5px] font-extrabold text-slate-800 uppercase tracking-wider">Thông báo hệ thống</h4>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">3 mới</span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    <div className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>
                      <div>
                        <p className="text-[12.5px] font-bold text-slate-700 leading-tight">Đơn hàng mới #1405 đang chờ xử lý</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">5 phút trước</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                      <div>
                        <p className="text-[12.5px] font-bold text-slate-700 leading-tight">Khách hàng Nguyễn Văn A vừa đăng ký VIP</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">20 phút trước</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                      <div>
                        <p className="text-[12.5px] font-bold text-slate-700 leading-tight font-mono">Sản phẩm "iPhone 15 Pro" sắp hết hàng</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">1 giờ trước</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help Button */}
            <div className="relative">
              <button 
                onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); }}
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all text-slate-700 active:scale-95 cursor-pointer ${
                  showHelp ? "bg-slate-100 ring-2 ring-primary/10" : ""
                }`}
              >
                <Icon name="help_outline" className="text-[20px]" />
              </button>

              {showHelp && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl p-4 z-50 animate-slide-up text-left">
                  <div className="pb-2 border-b border-slate-50 mb-3">
                    <h4 className="text-[12.5px] font-extrabold text-slate-800 uppercase tracking-wider">Thông tin trợ giúp</h4>
                  </div>
                  <div className="space-y-3.5 text-[12.5px] font-medium text-slate-600">
                    <p>Chào mừng bạn đến với hệ thống quản trị **ShopNow Pro**.</p>
                    <p>💡 **Mẹo nhanh:**</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[12px] font-semibold">
                      <li>Nhập từ khóa ở ô tìm kiếm để lọc dữ liệu ở mọi trang con.</li>
                      <li>Click nút xuất báo cáo ở sidebar để tải dữ liệu thống kê.</li>
                      <li>Cài đặt chế độ bảo trì hệ thống trong mục Cài đặt.</li>
                    </ul>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] font-semibold text-slate-400 flex items-center justify-between mt-2">
                      <span>Phiên bản hệ thống:</span>
                      <span className="text-primary font-bold">v1.2.0 (Stable)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            
            {onActionClick ? (
              <button 
                onClick={onActionClick}
                className="bg-gradient-to-r from-primary-container to-violet-600 text-white px-5 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md shadow-primary/10 cursor-pointer"
              >
                <Icon name={actionIcon} className="text-[18px]" />
                <span>{actionLabel}</span>
              </button>
            ) : (
              <button className="bg-slate-200 text-slate-400 px-5 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 cursor-not-allowed opacity-50">
                <Icon name={actionIcon} className="text-[18px]" />
                <span>{actionLabel}</span>
              </button>
            )}
            
            <div className="flex items-center gap-3 pl-2">
              <div className="relative admin-status-online shrink-0">
                <img
                  className="w-10 h-10 rounded-full border-2 border-primary-container/20 object-cover shadow-sm bg-slate-50"
                  src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuD7uL6Tml1PVP5WB3ZrZcXsiUwjijsFr3qDPjuo8h3zLrEO0oVQb8TQHt722XwN9Y7mfyhU601MBlZJ3tbhw_1ROarB5_lSopKz7Z0XkjyTMT3zJvAAnm_SVnV7MEeyxfuqLlRZS_NqR46VhyMPqvYrkfWsFKzCV5F3fRKfAkGqseFf7MsspD3Gwj9wRn8D7lmGtrAEZ9s83rmPrbnoNq-5sKo_HsKgi7cBigjZZ3ps_rtRzC43buI"}
                  alt="Ảnh đại diện Admin chuyên nghiệp"
                />
              </div>
              <div className="hidden xl:block">
                <p className="text-[14px] font-bold text-slate-800 leading-none">{user?.name || "Admin ShopNow"}</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">{user?.role === "admin" ? "Quản trị viên" : subtitle}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-grow bg-[#f8fafc]">{children}</main>
      </div>

      {/* Settings Modal - Glassmorphic overlay & card */}
      {showSettings && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-slide-up">
            <div className="p-6 bg-gradient-to-r from-primary to-violet-700 text-white flex justify-between items-center shadow-md">
              <h3 className="text-[18px] font-black flex items-center gap-2">
                <Icon name="settings" className="text-[22px]" />
                <span>Cài đặt hệ thống</span>
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Tên cửa hàng</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/5 rounded-xl px-4 py-3 outline-none text-[14px] text-slate-800 transition-all"
                  value={settingsData.shopName}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, shopName: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Đường dây nóng (Hotline)</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/5 rounded-xl px-4 py-3 outline-none text-[14px] text-slate-800 transition-all"
                  value={settingsData.hotline}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, hotline: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Email hỗ trợ</label>
                <input
                  required
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/5 rounded-xl px-4 py-3 outline-none text-[14px] text-slate-800 transition-all"
                  value={settingsData.email}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Địa chỉ cửa hàng</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/5 rounded-xl px-4 py-3 outline-none text-[14px] text-slate-800 transition-all"
                  value={settingsData.address}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="maintenance_mode"
                    className="w-5 h-5 text-primary border-slate-300 rounded-lg focus:ring-primary focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer"
                    checked={settingsData.maintenance}
                    onChange={(e) => setSettingsData(prev => ({ ...prev, maintenance: e.target.checked }))}
                  />
                </div>
                <label htmlFor="maintenance_mode" className="text-[13px] font-bold text-slate-600 select-none cursor-pointer">
                  Kích hoạt chế độ bảo trì toàn hệ thống
                </label>
              </div>

              <div className="flex gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-[14px] transition-colors border border-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-violet-700 text-white font-bold rounded-xl text-[14px] shadow-lg shadow-primary/10 active:scale-95 transition-all"
                >
                  Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}