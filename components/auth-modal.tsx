"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";

export function AuthModal() {
  const { authModalOpen, authModalTab, closeAuthModal, login, showToast } = useApp();
  const [tab, setTab] = useState<"login" | "signup">(authModalTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleGoogleLogin = () => {
    if (typeof window === "undefined") return;

    const executeLogin = () => {
      if (!(window as any).google) return;

      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: "706891351908-2hd066onb61adtjkrcev767afbpdo7h1.apps.googleusercontent.com",
        scope: "email profile",
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            setLoading(true);
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
                localStorage.setItem("auth_success_msg", "Đăng nhập bằng Google thành công!");
                closeAuthModal();
                window.location.reload();
              } else {
                showToast(`✗ Đăng nhập thất bại: ${data.error}`);
              }
            } catch {
              showToast("✗ Gặp sự cố kết nối với hệ thống.");
            } finally {
              setLoading(false);
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

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ ${data.error || "Đăng nhập thất bại"}`);
        return;
      }
      login({
        name: data.user.full_name || data.user.name || "",
        email: data.user.email,
        avatar: data.user.avatar_url || data.user.avatar || undefined,
        role: data.user.role,
      });
      localStorage.setItem("auth_success_msg", "Đăng nhập thành công! Chào mừng bạn quay trở lại.");
      window.location.reload(); // Refresh the page to reload state
    } catch {
      showToast("✗ Lỗi hệ thống, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password !== confirm) {
      showToast("✗ Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ ${data.error || "Đăng ký thất bại"}`);
        return;
      }
      login({
        name: data.user.full_name || data.user.name || "",
        email: data.user.email,
        avatar: data.user.avatar_url || data.user.avatar || undefined,
        role: data.user.role,
      });
      localStorage.setItem("auth_success_msg", "Đăng ký tài khoản thành công! Chào mừng bạn đến với ShopNow.");
      window.location.reload();
    } catch {
      showToast("✗ Lỗi hệ thống, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      onClick={closeAuthModal}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <i className="fa-solid fa-xmark text-[18px]" />
        </button>

        {/* Header */}
        <div className="relative h-28 bg-gradient-to-br from-[#4f22d6] to-[#3800ae] overflow-hidden flex items-center px-6 flex-shrink-0">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-8 bottom-4 w-24 h-24 rounded-full bg-white/5" />

          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Chào mừng bạn!</h1>
            <p className="text-[14px] text-white/80 mt-1">Tham gia cùng ShopNow ngay hôm nay</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-4 text-[15px] font-semibold text-center border-b-2 transition-all ${tab === "login"
              ? "text-brand-purple border-brand-purple"
              : "text-gray-500 hover:text-brand-purple border-transparent"
              }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 py-4 text-[15px] font-semibold text-center border-b-2 transition-all ${tab === "signup"
              ? "text-brand-purple border-brand-purple"
              : "text-gray-500 hover:text-brand-purple border-transparent"
              }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form Area - Ẩn thanh cuộn nhưng vẫn cuộn được */}
        <div className="p-6 md:p-8 bg-white flex-1 overflow-y-auto scrollbar-hide">
          {tab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="text-[13px] font-medium text-gray-600 block mb-1.5">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-0 text-[15px]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[13px] font-medium text-gray-600">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => showToast("Hãy kiểm tra email để đặt lại mật khẩu!")}
                    className="text-[13px] text-brand-purple hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-0 text-[15px] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="accent-brand-purple" />
                <label htmlFor="remember" className="text-[14px] text-gray-600">Ghi nhớ đăng nhập</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-purple hover:bg-purple-700 text-white font-bold rounded-xl text-[15px] transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-xs text-gray-500">Hoặc đăng nhập bằng</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOoST1DkYv7i4LPsIKaBg-bebKEhm8r2G0ppRSqqVYtA&s=10"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-700">Tiếp tục với Google</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              <div>
                <label className="text-[13px] font-medium text-gray-600 block mb-1.5">Họ và tên</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-0 text-[15px]"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-600 block mb-1.5">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-0 text-[15px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-medium text-gray-600 block mb-1.5">Mật khẩu</label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-0 text-[15px]"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-600 block mb-1.5">Xác nhận</label>
                  <input
                    name="confirm"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-0 text-[15px]"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" required className="accent-brand-purple mt-1" />
                <label className="text-[13px] text-gray-600 leading-relaxed">
                  Tôi đồng ý với{" "}
                  <span className="text-brand-purple hover:underline cursor-pointer">Điều khoản</span> và{" "}
                  <span className="text-brand-purple hover:underline cursor-pointer">Chính sách bảo mật</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-purple hover:bg-purple-700 text-white font-bold rounded-xl text-[15px] transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Đang tạo tài khoản...
                  </>
                ) : (
                  "Đăng ký miễn phí"
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-xs text-gray-500">Hoặc đăng ký bằng</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOoST1DkYv7i4LPsIKaBg-bebKEhm8r2G0ppRSqqVYtA&s=10"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-700">Tiếp tục với Google</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 py-5 px-6 text-center border-t border-gray-100 flex-shrink-0">
          <p className="text-[13px] text-gray-600">
            {tab === "login" ? (
              <>
                Chưa có tài khoản?{" "}
                <button onClick={() => setTab("signup")} className="text-brand-purple font-semibold hover:underline">
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{" "}
                <button onClick={() => setTab("login")} className="text-brand-purple font-semibold hover:underline">
                  Đăng nhập
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}