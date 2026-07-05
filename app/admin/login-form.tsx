"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-context";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }

      if (data.user.role !== "admin") {
        setError("Tài khoản của bạn không có quyền truy cập quản trị.");
        setLoading(false);
        return;
      }

      // Log in in app context
      login({
        name: data.user.name || data.user.full_name || "",
        email: data.user.email,
        role: data.user.role,
      });

      // Redirect directly to dashboard using window.location.href
      // to ensure cookie changes are fully parsed by layouts
      window.location.href = "/tongquan";
    } catch (err) {
      setError("Gặp sự cố kết nối hệ thống.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-[#f4f2ff] to-[#edf0fe] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs for premium glassmorphism glow */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 animate-float" style={{ animationDuration: "6s" }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl -z-10 animate-float" style={{ animationDuration: "8s", animationDelay: "2s" }}></div>

      <div className="w-full max-w-[460px] bg-white/80 backdrop-blur-xl border border-white/80 rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(79,34,214,0.08)] flex flex-col animate-slide-up">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary-container to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 mb-4 animate-float">
            <span className="material-symbols-outlined text-[28px] font-semibold">shopping_bag</span>
          </div>
          <h1 className="text-[24px] font-black text-slate-800 tracking-tight flex items-center gap-2">
            ShopNow Admin
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          </h1>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-1">Hệ thống quản lý cửa hàng</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[13px] font-semibold text-rose-600 flex items-start gap-2 animate-shake">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Tài khoản Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
              <input
                required
                type="email"
                placeholder="admin@shopnow.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/5 rounded-2xl py-3 pl-12 pr-4 text-[14px] text-slate-850 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Mật khẩu</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/5 rounded-2xl py-3 pl-12 pr-12 text-[14px] text-slate-850 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-primary to-violet-600 hover:brightness-110 active:scale-[0.98] text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin text-[16px]"></i>
                <span>Đang kiểm tra bảo mật...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span>Đăng nhập hệ thống</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <a
            href="/trangchu"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-400 hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Quay lại Cửa hàng
          </a>
        </div>
      </div>
    </div>
  );
}
