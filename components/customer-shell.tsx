"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { useApp } from "@/lib/app-context";
import { AuthModal } from "./auth-modal";

type CustomerShellProps = {
  children: ReactNode;
};

const navigationItems = [
  { href: "/trangchu", label: "Trang chủ" },
  { href: "/sanpham", label: "Sản phẩm" },
  { href: "/flashsale", label: "Flash Sale" },
  { href: "/uudai", label: "Ưu đãi" },
  { href: "/tintuc", label: "Tin tức" },
  { href: "/lienhe", label: "Liên hệ" },
];

export function CustomerShell({ children }: CustomerShellProps) {
  const pathname = usePathname();
  const { openAuthModal, user, logout, cartCount, cartTotal, wishlistCount } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [authNotification, setAuthNotification] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const msg = localStorage.getItem("auth_success_msg");
      if (msg) {
        setAuthNotification(msg);
        localStorage.removeItem("auth_success_msg");
        const timer = setTimeout(() => {
          setAuthNotification(null);
        }, 8000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === "/trangchu" && (pathname === "/" || pathname === "/trangchu")) {
      return true;
    }
    return pathname === href;
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "0đ";
    return amount.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#2d2d2d] antialiased flex flex-col">
      {/* Auth Modal - renders as an overlay */}
      <AuthModal />

      {/* Top bar info */}
      <div className="bg-white border-b border-gray-100 py-2 text-[12px] text-gray-600">
        <div className="max-w-[1280px] mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-truck text-gray-400 text-[14px]"></i>
            <span>Miễn phí vận chuyển cho đơn từ 499k</span>
          </div>

          {authNotification && (
            <div className="text-emerald-700 font-semibold text-[12px] flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 px-4 py-1 rounded-full shadow-sm animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{authNotification}</span>
            </div>
          )}

          <div className="flex items-center space-x-6">
            <Link href="/uudaithanhvien" className="hover:text-[#4f22d6] flex items-center gap-1">
              <i className="fa-regular fa-id-card text-gray-400"></i> Ưu đãi thành viên
            </Link>
            <a href="#" className="hover:text-[#4f22d6] flex items-center gap-1">
              <i className="fa-regular fa-comments text-gray-400"></i> Hỗ trợ 24/7
            </a>
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-phone text-gray-400"></i> 1900 1234
            </span>
            <span className="flex items-center gap-1">
              <i className="fa-regular fa-envelope text-gray-400"></i> contact@shopnow.vn
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 py-4 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/trangchu" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-[#4f22d6] rounded-xl flex items-center justify-center shadow-md shadow-purple-200">
              <i className="fa-solid fa-bag-shopping text-white text-[18px]"></i>
            </div>
            <span className="text-[25px] font-extrabold tracking-tight text-[#4f22d6]">ShopNow</span>
          </Link>

          {/* Search bar */}
          <div className="flex-grow max-w-[580px] flex border-2 border-[#4f22d6] rounded-lg overflow-hidden bg-white">
            <input
              className="w-full px-4 py-2 text-[14px] text-gray-700 placeholder-gray-400 border-none focus:ring-0 focus:outline-none"
              placeholder="Bạn cần tìm gì hôm nay?"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  window.location.href = `/sanpham?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
            />
            <button className="bg-gray-50 px-4 text-[13px] text-gray-600 border-l border-gray-100 flex items-center gap-1 shrink-0 whitespace-nowrap hover:bg-gray-100 transition-colors">
              Tất cả danh mục
              <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
            </button>
            <button
              className="bg-[#4f22d6] text-white px-6 py-2 text-[14px] font-medium tracking-wide shrink-0 hover:bg-[#3800ae] transition-colors"
              onClick={() => {
                if (searchQuery.trim()) {
                  window.location.href = `/sanpham?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
            >
              Tìm kiếm
            </button>
          </div>

          {/* Nav Icons */}
          <div className="flex items-center space-x-6 shrink-0">
            {/* Auth Button */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center gap-2.5 cursor-pointer group"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover shadow-md border border-[#4f22d6]/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-[#4f22d6] rounded-full flex items-center justify-center text-white font-bold text-[14px] shadow-md">
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-[12px] leading-tight">
                    <p className="text-gray-500 group-hover:text-[#4f22d6]">Xin chào,</p>
                    <p className="font-bold text-gray-800 flex items-center gap-0.5 group-hover:text-[#4f22d6]">
                      {(user.name || "").split(" ").slice(-1)[0]}{" "}
                      <i className="fa-solid fa-chevron-down text-[8px]"></i>
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-[13px] font-bold text-gray-800">{user.name}</p>
                      <p className="text-[12px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/taikhoan"
                      className="flex items-center gap-3 px-4 py-3 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-[#4f22d6] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="fa-regular fa-user w-4 text-center"></i>
                      Tài khoản của tôi
                    </Link>
                    <Link
                      href="/donhang"
                      className="flex items-center gap-3 px-4 py-3 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-[#4f22d6] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="fa-solid fa-box w-4 text-center"></i>
                      Đơn hàng của tôi
                    </Link>
                    <Link
                      href="/trangyeuthich"
                      className="flex items-center gap-3 px-4 py-3 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-[#4f22d6] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="fa-regular fa-heart w-4 text-center"></i>
                      Sản phẩm yêu thích
                    </Link>
                    <div className="border-t border-gray-100 mt-1" />
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <i className="fa-solid fa-right-from-bracket w-4 text-center"></i>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <i className="fa-regular fa-user text-[22px] text-gray-700 group-hover:text-[#4f22d6] transition-colors"></i>
                <div className="text-[12px] leading-tight">
                  <p className="text-gray-500 group-hover:text-[#4f22d6] transition-colors">Đăng nhập / Đăng ký</p>
                  <p className="font-bold text-gray-800 flex items-center gap-0.5 group-hover:text-[#4f22d6] transition-colors">
                    Tài khoản của tôi <i className="fa-solid fa-chevron-down text-[8px]"></i>
                  </p>
                </div>
              </button>
            )}

            {/* Wishlist */}
            <Link href="/trangyeuthich" className="relative cursor-pointer group">
              <i className="fa-regular fa-heart text-[22px] text-gray-700 group-hover:text-[#4f22d6] transition-colors"></i>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#4f22d6] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/giohang" className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <i className="fa-solid fa-cart-shopping text-[21px] text-gray-700 group-hover:text-[#4f22d6] transition-colors"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#4f22d6] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <div className="text-[12px] leading-tight">
                <p className="text-gray-500 group-hover:text-[#4f22d6] transition-colors">Giỏ hàng</p>
                <p className="font-bold text-[#4f22d6]">{formatCurrency(cartTotal)}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Menu category */}
        <div className="max-w-[1280px] mx-auto px-4 flex items-center">
          <div className="w-[240px] bg-[#4f22d6] text-white px-4 py-3 rounded-t-xl flex items-center gap-3 font-bold text-[13px] tracking-wide shrink-0">
            <i className="fa-solid fa-bars text-[15px]"></i>
            DANH MỤC SẢN PHẨM
          </div>

          <ul className="flex space-x-8 ml-8 text-[14px] font-semibold text-gray-700">
            {navigationItems.map((item) => (
              <li
                key={item.href}
                className={`py-2 border-b-2 transition-all ${
                  isActive(item.href)
                    ? "font-bold text-[#4f22d6] border-[#4f22d6]"
                    : "border-transparent hover:text-[#4f22d6]"
                }`}
              >
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Main body content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-10">
        <div className="max-w-[1280px] mx-auto px-4 py-10">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-[#4f22d6] font-black text-[24px] mb-4">
                <i className="fa-solid fa-bag-shopping"></i>
                <span>ShopNow.</span>
              </div>
              <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
                Nền tảng mua sắm trực tuyến hàng đầu, cung cấp các sản phẩm chất lượng cao với giá cả cạnh tranh nhất thị trường.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#4f22d6] hover:text-white transition-colors">
                  <i className="fa-brands fa-facebook-f text-[14px]"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#4f22d6] hover:text-white transition-colors">
                  <i className="fa-brands fa-tiktok text-[14px]"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#4f22d6] hover:text-white transition-colors">
                  <i className="fa-brands fa-instagram text-[14px]"></i>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 text-[15px] mb-4 uppercase">Về chúng tôi</h3>
              <ul className="text-[13px] text-gray-500 space-y-2.5">
                <li><a href="#" className="hover:text-[#4f22d6] transition-colors">Giới thiệu ShopNow</a></li>
                <li><a href="#" className="hover:text-[#4f22d6] transition-colors">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-[#4f22d6] transition-colors">Điều khoản sử dụng</a></li>
                <li><a href="#" className="hover:text-[#4f22d6] transition-colors">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-[#4f22d6] transition-colors">Chương trình Affiliate</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 text-[15px] mb-4 uppercase">Chăm sóc khách hàng</h3>
              <ul className="text-[13px] text-gray-500 space-y-2.5">
                <li><a href="#" className="hover:text-[#4f22d6] transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-[#4f22d6] transition-colors">Hướng dẫn mua hàng</a></li>
                <li><a href="#" className="hover:text-[#4f22d6] transition-colors">Chính sách đổi trả</a></li>
                <li><a href="#" className="hover:text-[#4f22d6] transition-colors">Chính sách bảo hành</a></li>
                <li><a href="#" className="hover:text-[#4f22d6] transition-colors">Thanh toán & Giao hàng</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 text-[15px] mb-4 uppercase">Tải ứng dụng</h3>
              <p className="text-[13px] text-gray-500 mb-3">Mua sắm tiện lợi hơn trên ứng dụng ShopNow</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="bg-gray-900 text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 w-[150px] transition-colors">
                  <i className="fa-brands fa-apple text-[20px]"></i>
                  <div className="text-left">
                    <div className="text-[9px] text-gray-300">Download on the</div>
                    <div className="text-[12px] font-semibold leading-none mt-0.5">App Store</div>
                  </div>
                </a>
                <a href="#" className="bg-gray-900 text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 w-[150px] transition-colors">
                  <i className="fa-brands fa-google-play text-[18px]"></i>
                  <div className="text-left">
                    <div className="text-[9px] text-gray-300">GET IT ON</div>
                    <div className="text-[12px] font-semibold leading-none mt-0.5">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6 flex items-center justify-between">
            <p className="text-[12px] text-gray-400">© 2026 ShopNow. Tất cả các quyền được bảo lưu.</p>
            <div className="flex gap-2">
              <div className="w-10 h-6 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-blue-800 font-bold text-[10px] italic">VISA</div>
              <div className="w-10 h-6 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-red-500 font-bold text-[10px] italic">Master</div>
              <div className="w-10 h-6 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-blue-500 font-bold text-[10px] italic">JCB</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}