"use client";

import { useState } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";
import { useApp } from "@/lib/app-context";

const initialCartItems = [
  {
    id: 1,
    name: "Bàn phím Cơ Ergonomic Pro X",
    category: "Electronics",
    desc: "Màu: Pearl White | Switch: Brown",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuArTPuAaWzrhOc63PdK93aFpLYJT0hsUsiLrIINBPCx2DZrS3ldANh745ZWyQDKc40X9YMQ4JSwH6xaC6RculbrA_8Gjd5iywx8zR2XO-8JrL8c9mGYpSuvLwS-FiYXTndZ7iwP63GOZniB-j_I8KWeVw92if97dfZMIX3KJ4ZBIZ8pshuCpm-JMb6-_mGuKmmDWS7G97CHCYMX47IeQDjx5uqA11Dste7-_kKPcYm0U76TWcnl9eNswoCl3T1IqIDQ32vzZcWe5Q",
    price: 1850000,
    oldPrice: 2490000,
    quantity: 1
  },
  {
    id: 2,
    name: "Tai nghe Noise Cancel Elite 2",
    category: "Fashion & Tech",
    desc: "Màu: Space Grey",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAkb26-5wa6gzclkCZOmuRQTYdIDiXyz1pO80vmP-BCnWNWoqlqteeK74H_MnLSOjxIVf_wKwHmmUYBxLndJqvrZMa8u53FZUUNASFNLAS_hargbNpq3zgLTlo9jeZSwMUX_he-qpPNuzGM2lK1WXJCIh0C9h1_E-oVZ3yqu2V02snvIyx1nd4ZV5ezbQ7qbnRY8hLW3APv_fWyfpdHZNL6vd0HguH1_3nHd8J79ts_QDNoxhcGREi5Cm-Z4m3l34zXno0MJ48RA",
    price: 3200000,
    quantity: 1
  },
  {
    id: 3,
    name: "Đèn Bàn Cảm ứng Smart Ambient",
    category: "Home & Garden",
    desc: "Công suất: 10W",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoQpFM4OPfVf5axBB-kle_4DFi6cSCfwCTCjp1lqgWK66gx4xsGS4Vncw0OzOepkug-4IRWj4hcVnr1Dg-LISNOTwE9VoMa8IPqq-bTB_ONsL3BYSsnHVG2hBdGDPeWtScn63MeamwbUtJmC3_iUML15tjn1DdbVfEu-p_2Bj3_vTSW_jDpZKVegayjJH9ijRh1DhPgNqUTEn3DR6DE45Y_ZnMT70aQmOsPMuEfL9uJtYKTtYoh_l6ecnhGSUXzRkN-9kQ4QSeBg",
    price: 1100000,
    quantity: 2
  }
];

export function CustomerCartPage() {
  const { cart, updateCartQty, removeFromCart, showToast } = useApp();
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

  const updateQuantity = (id: number, delta: number) => {
    const item = cart.find((c) => c.id === id);
    if (item) updateCartQty(id, item.qty + delta);
  };

  const removeItem = (id: number) => {
    removeFromCart(id);
  };

  const applyVoucher = async () => {
    if (!voucherCode.trim()) return;
    try {
      const res = await fetch("/api/vouchers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode, orderValue: subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ ${data.error || "Mã không hợp lệ"}`);
        setDiscount(0);
        setAppliedVoucher(null);
        return;
      }
      setDiscount(data.discountAmount);
      setAppliedVoucher(data);
      showToast(`✓ Đã áp dụng: ${data.name}!`);
    } catch {
      showToast("✗ Lỗi kết nối hệ thống.");
    }
  };

  // Calculations
  const cartItems = cart.map(c => ({ ...c, quantity: c.qty, desc: c.variant, oldPrice: c.originalPrice }));
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPayment = Math.max(0, subtotal - discount);

  const formatPrice = (num: number) => {
    return num.toLocaleString("vi-VN") + "đ";
  };

  const checkoutUrl = appliedVoucher
    ? `/thanhtoan?voucherId=${appliedVoucher.voucherId}&discount=${discount}&code=${appliedVoucher.code}`
    : "/thanhtoan";

  return (
    <CustomerShell>
      <div className="bg-background text-on-surface min-h-screen">
        <main className="max-w-container-max mx-auto px-gutter py-12">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-[32px] font-black text-on-surface">Giỏ hàng của bạn</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Bạn đang có <span className="font-semibold text-primary">{totalCount} sản phẩm</span> trong giỏ hàng
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white border border-outline-variant rounded-3xl p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-[60px] text-gray-300 block mb-4">shopping_cart</span>
              <p className="text-gray-500 mb-6 text-[15px]">Giỏ hàng của bạn đang trống.</p>
              <Link href="/sanpham" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90">
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
              {/* Product Table Section */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="glass-card bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 transition-all hover:shadow-lg"
                  >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                      <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                    </div>

                    <div className="flex-grow flex flex-col gap-1 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[12px] font-bold text-primary uppercase tracking-wider mb-1">
                            {item.category}
                          </p>
                          <h3 className="text-[20px] font-bold leading-tight text-on-surface">
                            {item.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-outline hover:text-error transition-colors p-1"
                        >
                          <span className="material-symbols-outlined text-red-500">delete</span>
                        </button>
                      </div>
                      <p className="text-[14px] text-on-surface-variant mt-1">
                        {item.desc}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center border border-outline-variant rounded-full p-1 bg-surface">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors font-bold text-[18px]"
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-semibold text-[15px]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors font-bold text-[18px]"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          {item.oldPrice && (
                            <p className="text-xs text-outline-variant line-through text-gray-400">
                              {formatPrice(item.oldPrice)}
                            </p>
                          )}
                          <p className="text-[22px] font-black text-primary">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Continue Shopping */}
                <div className="flex items-center mt-4">
                  <Link
                    className="group flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all text-[15px]"
                    href="/sanpham"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>

              {/* Summary Section */}
              <div className="lg:col-span-4 sticky top-24">
                <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant">
                  <h2 className="text-[20px] font-bold mb-6 text-on-surface">Tóm tắt đơn hàng</h2>
                  <div className="space-y-4 mb-8 text-[14px]">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Tạm tính ({totalCount} sản phẩm)</span>
                      <span className="font-semibold text-on-surface">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Phí vận chuyển</span>
                      <span className="font-semibold text-secondary">Miễn phí</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Giảm giá voucher</span>
                      <span className="font-semibold text-error">- {formatPrice(discount)}</span>
                    </div>
                    <div className="pt-4 border-t border-outline-variant">
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-[18px]">Tổng thanh toán</span>
                        <span className="text-[28px] font-black text-primary">{formatPrice(totalPayment)}</span>
                      </div>
                      <p className="text-[12px] text-on-surface-variant text-right mt-1">
                        (Đã bao gồm VAT nếu có)
                      </p>
                    </div>
                  </div>

                  {/* Voucher Input */}
                  <div className="mb-8">
                    <label className="text-[13px] font-semibold text-on-surface-variant block mb-2">
                      Mã giảm giá (Voucher)
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 flex-grow"
                        placeholder="Nhập mã giảm giá..."
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                      />
                      <button
                        onClick={applyVoucher}
                        className="bg-primary text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 text-[13px] tracking-wide shrink-0 transition-all active:scale-95"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {appliedVoucher && (
                      <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Đang áp dụng voucher: {appliedVoucher.code} ({appliedVoucher.name})
                      </p>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href={checkoutUrl}
                    className="w-full bg-[#4f22d6] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md text-center block text-[15px]"
                  >
                    <span>TIẾN HÀNH THANH TOÁN</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>

                  <div className="mt-6 flex flex-col gap-4 text-on-surface-variant text-[13px]">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary">verified_user</span>
                      Thanh toán an toàn & bảo mật 100%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </CustomerShell>
  );
}
