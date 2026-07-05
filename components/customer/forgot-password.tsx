"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";
import { useApp } from "@/lib/app-context";

export function CustomerForgotPasswordPage() {
  const { showToast } = useApp();

  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  // Extract token from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setToken(params.get("token"));
    }
  }, []);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ ${data.error || "Gửi yêu cầu thất bại"}`);
        return;
      }
      setSubmitted(true);
      showToast("✓ Đã gửi yêu cầu đặt lại mật khẩu!");
      if (data.simulated && data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch {
      showToast("✗ Gặp lỗi khi kết nối tới máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      showToast("✗ Xác nhận mật khẩu không trùng khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ ${data.error || "Thay đổi mật khẩu thất bại"}`);
        return;
      }
      showToast("✓ Mật khẩu đã được thay đổi thành công! Vui lòng đăng nhập.");
      window.location.href = "/dangnhap";
    } catch {
      showToast("✗ Lỗi kết nối hệ thống khi đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerShell>
      <div className="relative min-h-[700px] overflow-hidden bg-background text-on-background flex items-center justify-center p-4">
        {/* Background Content Simulator */}
        <div className="absolute inset-0 w-full h-full grayscale-[0.2] blur-[8px] scale-105 pointer-events-none z-0 opacity-40 select-none">
          <header className="w-full h-16 bg-surface shadow-sm px-gutter flex items-center justify-between">
            <div className="font-headline-md font-bold text-primary">ShopNow</div>
            <div className="flex gap-4">
              <span className="material-symbols-outlined">favorite</span>
              <span className="material-symbols-outlined">shopping_cart</span>
            </div>
          </header>
          <div className="w-full h-[614px] bg-primary-container relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container to-primary/80"></div>
          </div>
        </div>

        {/* Modal Card */}
        <div className="glass-panel w-full max-w-[440px] rounded-xl shadow-2xl overflow-hidden border border-surface-container-highest flex flex-col z-10 animate-in fade-in zoom-in duration-300 bg-white p-6">
          {token ? (
            /* Mode 2: Reset Password Form */
            <>
              <div className="flex flex-col items-center text-center pb-4">
                <div className="w-16 h-16 bg-[#ebf8ff] text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">published_with_changes</span>
                </div>
                <h1 className="text-[22px] font-bold text-on-surface mb-2">Đặt lại mật khẩu</h1>
                <p className="text-[14px] text-gray-500 max-w-[320px]">
                  Thiết lập mật khẩu mới cho tài khoản của bạn.
                </p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[13px] font-semibold text-gray-600 block" htmlFor="newPassword">
                    Mật khẩu mới
                  </label>
                  <input
                    className="w-full border border-gray-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-xl px-4 py-3 outline-none text-[14px] bg-white text-gray-800"
                    id="newPassword"
                    type="password"
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[13px] font-semibold text-gray-600 block" htmlFor="confirmPassword">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    className="w-full border border-gray-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-xl px-4 py-3 outline-none text-[14px] bg-white text-gray-800"
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  className="w-full py-3.5 bg-brand-purple text-white font-bold rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 text-[14px] disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">lock_open</span>
                      Đặt lại mật khẩu
                    </>
                  )}
                </button>
              </form>
            </>
          ) : submitted ? (
            /* Mode 1 Success Screen */
            <div className="text-center space-y-6 py-6">
              <div className="w-16 h-16 bg-[#e6fffa] text-teal-600 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[36px]">mark_email_read</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800">Kiểm tra hộp thư điện tử</h3>
                <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
                  Chúng tôi đã gửi link đặt lại mật khẩu đến địa chỉ email <strong>{email}</strong>.
                </p>
              </div>

              {devResetUrl && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
                  <p className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Chế độ giả lập (SMTP chưa thiết lập)
                  </p>
                  <p className="text-[11px] text-amber-700">Bấm nút bên dưới để tiến hành đặt lại mật khẩu thử nghiệm:</p>
                  <a
                    href={devResetUrl}
                    className="inline-block bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-amber-700"
                  >
                    Click test mật khẩu mới
                  </a>
                </div>
              )}

              <div className="pt-2">
                <Link href="/dangnhap" className="inline-flex items-center gap-1 text-[13px] font-bold text-brand-purple hover:underline">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            /* Mode 1: Forgot Password Form */
            <>
              <div className="flex flex-col items-center text-center pb-4">
                <div className="w-16 h-16 bg-purple-50 text-brand-purple rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">lock_reset</span>
                </div>
                <h1 className="text-[22px] font-bold text-on-surface mb-2">Quên mật khẩu?</h1>
                <p className="text-[14px] text-gray-500 max-w-[320px]">
                  Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu.
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[13px] font-semibold text-gray-600 block" htmlFor="email">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                    </div>
                    <input
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-xl outline-none text-[14px] bg-white text-gray-800"
                      id="email"
                      placeholder="name@example.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="w-full py-3.5 bg-brand-purple text-white font-bold rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 text-[14px] disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Gửi liên kết khôi phục
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link href="/dangnhap" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-purple hover:underline">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </CustomerShell>
  );
}
