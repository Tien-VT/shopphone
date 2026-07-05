"use client";

import { useState } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";
import { useApp } from "@/lib/app-context";

export function CustomerLoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { login } = useApp();

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleGoogleLogin = () => {
    if (typeof window === "undefined") return;

    const executeLogin = () => {
      if (!(window as any).google) return;

      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: "706891351908-2hd066onb61adtjkrcev767afbpdo7h1.apps.googleusercontent.com",
        scope: "email profile",
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            triggerToast("Đang xác thực tài khoản Google...");
            try {
              const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: tokenResponse.access_token }),
              });
              const data = await res.json();
              if (res.ok) {
                login({
                  name: data.user.full_name || data.user.name || "",
                  email: data.user.email,
                  avatar: data.user.avatar_url || data.user.avatar || undefined,
                  role: data.user.role,
                });
                triggerToast("✓ Đăng nhập bằng Google thành công!");
                window.location.href = "/trangchu";
              } else {
                triggerToast(`✗ Đăng nhập thất bại: ${data.error}`);
              }
            } catch {
              triggerToast("✗ Gặp sự cố kết nối với hệ thống.");
            }
          }
        },
      });
      client.requestAccessToken();
    };

    if ((window as any).google) {
      executeLogin();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = executeLogin;
      document.head.appendChild(script);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = document.getElementById("login-email") as HTMLInputElement;
    const passwordInput = document.getElementById("login-password") as HTMLInputElement;
    const email = emailInput?.value;
    const password = passwordInput?.value;

    triggerToast("Đang đăng nhập...");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        triggerToast(`✗ ${data.error || "Đăng nhập thất bại"}`);
        return;
      }
      login({
        name: data.user.full_name || data.user.name || "",
        email: data.user.email,
        avatar: data.user.avatar_url || data.user.avatar || undefined,
        role: data.user.role,
      });
      triggerToast("✓ Đăng nhập thành công!");
      window.location.href = "/trangchu";
    } catch {
      triggerToast("✗ Lỗi kết nối hệ thống.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameInput = document.getElementById("signup-name") as HTMLInputElement;
    const emailInput = document.getElementById("signup-email") as HTMLInputElement;
    const passwordInput = document.getElementById("signup-password") as HTMLInputElement;
    const confirmInput = document.getElementById("signup-confirm") as HTMLInputElement;

    const name = nameInput?.value;
    const email = emailInput?.value;
    const password = passwordInput?.value;
    const confirm = confirmInput?.value;

    if (password !== confirm) {
      triggerToast("✗ Mật khẩu xác nhận không khớp!");
      return;
    }

    triggerToast("Đang tạo tài khoản...");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        triggerToast(`✗ ${data.error || "Đăng ký thất bại"}`);
        return;
      }
      login({
        name: data.user.full_name || data.user.name || "",
        email: data.user.email,
        avatar: data.user.avatar_url || data.user.avatar || undefined,
        role: data.user.role,
      });
      triggerToast("✓ Đăng ký thành công!");
      window.location.href = "/trangchu";
    } catch {
      triggerToast("✗ Lỗi kết nối hệ thống.");
    }
  };

  return (
    <CustomerShell>
      <div className="relative min-h-[700px] overflow-hidden bg-background text-on-background flex items-center justify-center p-4">
        {/* Background Content Simulator (Blurred Shop Page) */}
        <div className="absolute inset-0 w-full h-full grayscale-[0.2] blur-[8px] scale-105 pointer-events-none z-0 opacity-40 select-none">
          <header className="w-full h-16 bg-surface shadow-sm px-gutter flex items-center justify-between">
            <div className="font-headline-md font-bold text-primary">ShopNow</div>
            <div className="flex gap-4">
              <div className="w-24 h-4 bg-outline-variant rounded"></div>
              <div className="w-24 h-4 bg-outline-variant rounded"></div>
            </div>
          </header>
          <main className="max-w-container-max mx-auto p-gutter grid grid-cols-4 gap-6">
            <div className="col-span-4 h-64 bg-surface-container-high rounded-xl mb-8"></div>
            <div className="h-80 bg-surface-container rounded-xl"></div>
            <div className="h-80 bg-surface-container rounded-xl"></div>
            <div className="h-80 bg-surface-container rounded-xl"></div>
            <div className="h-80 bg-surface-container rounded-xl"></div>
          </main>
        </div>

        {/* Modal Auth Overlay */}
        <div className="relative w-full max-w-[460px] bg-white border border-outline-variant rounded-[24px] shadow-2xl overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="relative h-28 w-full bg-gradient-to-br from-[#4f22d6] to-[#3800ae] overflow-hidden flex items-center px-8 flex-shrink-0">
            <div>
              <h1 className="text-[24px] font-bold text-white">Chào mừng bạn!</h1>
              <p className="text-[14px] text-white/80">Tham gia cùng ShopNow ngay hôm nay</p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex border-b border-outline-variant flex-shrink-0 bg-white">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-4 text-[14px] font-bold text-center border-b-2 transition-all ${
                activeTab === "login" 
                  ? "text-primary border-primary font-bold" 
                  : "text-on-surface-variant hover:text-primary border-transparent"
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-4 text-[14px] font-bold text-center border-b-2 transition-all ${
                activeTab === "signup" 
                  ? "text-primary border-primary font-bold" 
                  : "text-on-surface-variant hover:text-primary border-transparent"
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Form container */}
          <div className="flex-grow p-8 bg-white overflow-y-auto">
            {activeTab === "login" ? (
              /* Login Form */
              <form onSubmit={handleLoginSubmit} className="space-y-5 block">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-on-surface-variant" htmlFor="login-email">Email</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant focus:border-primary focus:ring-0 transition-all text-[14px] bg-white text-gray-800"
                      id="login-email"
                      placeholder="name@example.com"
                      required
                      type="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[13px] font-medium text-on-surface-variant" htmlFor="login-password">Mật khẩu</label>
                      <Link className="text-[13px] text-primary hover:underline font-semibold" href="/quenmatkhau">
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <input
                      className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant focus:border-primary focus:ring-0 transition-all text-[14px] bg-white text-gray-800"
                      id="login-password"
                      placeholder="••••••••"
                      required
                      type="password"
                    />
                  </div>
                  <button
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-container transition-all active:scale-[0.98] shadow-sm text-[15px]"
                    type="submit"
                  >
                    Đăng nhập
                  </button>
                </div>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-on-surface-variant font-semibold">Hoặc</span>
                  </div>
                </div>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignupSubmit} className="space-y-5 block">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-on-surface-variant" htmlFor="signup-name">Họ và tên</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant focus:border-primary focus:ring-0 transition-all text-[14px] bg-white text-gray-800"
                      id="signup-name"
                      placeholder="Nguyễn Văn A"
                      required
                      type="text"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-on-surface-variant" htmlFor="signup-email">Email</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant focus:border-primary focus:ring-0 transition-all text-[14px] bg-white text-gray-800"
                      id="signup-email"
                      placeholder="name@example.com"
                      required
                      type="email"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-on-surface-variant" htmlFor="signup-password">Mật khẩu</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant focus:border-primary focus:ring-0 transition-all text-[14px] bg-white text-gray-800"
                        id="signup-password"
                        placeholder="••••••••"
                        required
                        type="password"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-on-surface-variant" htmlFor="signup-confirm">Xác nhận</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant focus:border-primary focus:ring-0 transition-all text-[14px] bg-white text-gray-800"
                        id="signup-confirm"
                        placeholder="••••••••"
                        required
                        type="password"
                      />
                    </div>
                  </div>
                  <button
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-container transition-all active:scale-[0.98] shadow-sm text-[15px]"
                    type="submit"
                  >
                    Đăng ký
                  </button>
                </div>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-on-surface-variant font-semibold">Hoặc</span>
                  </div>
                </div>
              </form>
            )}

            {/* Social Login */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-4 py-3.5 border-2 border-outline-variant rounded-xl hover:bg-surface-container-low hover:border-primary transition-all group active:scale-[0.98]"
              >
                <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
                  <img
                    alt="Google"
                    className="w-full h-full object-contain"
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOoST1DkYv7i4LPsIKaBg-bebKEhm8r2G0ppRSqqVYtA&s=10"
                  />
                </div>
                <span className="font-bold text-[14px] text-on-surface group-hover:text-primary">Tiếp tục với Google</span>
              </button>
            </div>
          </div>

          {/* Footer inside Modal */}
          <div className="bg-surface-container-low py-6 px-8 text-center flex-shrink-0 border-t border-outline-variant">
            <p className="text-[13px] text-on-surface-variant">
              {activeTab === "login" ? (
                <>
                  Bạn mới biết đến ShopNow?{" "}
                  <button onClick={() => setActiveTab("signup")} className="text-primary font-bold hover:underline">
                    Đăng ký ngay
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{" "}
                  <button onClick={() => setActiveTab("login")} className="text-primary font-bold hover:underline">
                    Đăng nhập ngay
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-inverse-surface text-inverse-on-surface rounded-full shadow-xl animate-bounce">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </CustomerShell>
  );
}
