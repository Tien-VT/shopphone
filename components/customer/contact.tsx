"use client";

import { useState } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";

const faqItems = [
  {
    question: "Làm thế nào để tôi theo dõi trạng thái đơn hàng của mình?",
    answer: "Bạn có thể dễ dàng kiểm tra trạng thái đơn hàng tại mục 'Tài khoản của tôi' -> 'Đơn hàng của tôi'. Ngoài ra, ShopNow cũng sẽ tự động gửi email cập nhật chi tiết kèm mã vận đơn ngay sau khi đơn hàng được bàn giao cho đối tác vận chuyển."
  },
  {
    question: "ShopNow hiện hỗ trợ những phương thức thanh toán nào?",
    answer: "Chúng tôi hỗ trợ đa dạng phương thức thanh toán bao gồm: Thanh toán khi nhận hàng (COD), Thẻ tín dụng/ghi nợ quốc tế (Visa, Mastercard, JCB) và ví điện tử phổ biến như MoMo, ZaloPay."
  },
  {
    question: "Chính sách đổi trả sản phẩm của cửa hàng như thế nào?",
    answer: "ShopNow hỗ trợ đổi trả miễn phí trong vòng 7 ngày kể từ khi nhận hàng đối với các sản phẩm phát sinh lỗi từ nhà sản xuất hoặc giao sai mẫu mã. Sản phẩm cần giữ nguyên hộp, phụ kiện, nhãn mác và chưa qua sử dụng."
  },
  {
    question: "Thời gian giao hàng mất bao lâu và phí ship tính thế nào?",
    answer: "Thời gian giao hàng tiêu chuẩn từ 2 - 4 ngày làm việc. Đặc biệt, miễn phí vận chuyển cho tất cả đơn hàng trị giá từ 499k trở lên toàn quốc. Hỗ trợ giao hỏa tốc nhận hàng trong vòng 24h đối với khu vực nội thành."
  }
];

export function CustomerContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Hỗ trợ đơn hàng",
    message: ""
  });

  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: "", show: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({ message: "Yêu cầu của bạn đã được gửi đi thành công! ShopNow sẽ phản hồi trong vòng 24h làm việc.", show: true });
    setFormData({ name: "", email: "", subject: "Hỗ trợ đơn hàng", message: "" });
    
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx((prev) => (prev === idx ? null : idx));
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
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-4 font-medium font-sans">
          <Link href="/trangchu" className="hover:text-[#4f22d6] transition-colors">Trang chủ</Link>
          <i className="fa-solid fa-chevron-right text-[8px] text-gray-300"></i>
          <span className="text-gray-700 font-semibold">Liên hệ</span>
        </div>

        {/* Hero Section Banner */}
        <section className="mb-8">
          <div className="relative rounded-2xl p-8 text-white overflow-hidden bg-gradient-to-r from-[#4f22d6] via-[#5c31e2] to-[#7146ed] shadow-lg shadow-purple-100">
            {/* Background pattern overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-white blur-3xl"></div>
              <div className="absolute -right-20 -bottom-20 w-52 h-52 rounded-full bg-blue-300 blur-2xl"></div>
            </div>

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex bg-white/20 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
                Hỗ trợ 24/7
              </span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 leading-tight">
                Liên Hệ Với Chúng Tôi
              </h1>
              <p className="text-[14px] md:text-[15px] text-purple-100/90 leading-relaxed font-medium">
                ShopNow luôn luôn sẵn sàng lắng nghe ý kiến phản hồi và giải đáp thắc mắc từ quý khách hàng. Đừng ngần ngại liên lạc với chúng tôi.
              </p>
            </div>
          </div>
        </section>

        {/* Main Grid: Form and Information */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Card (7 Columns) */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-extrabold text-gray-800 mb-6 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-gray-100">
              <i className="fa-solid fa-paper-plane text-[#4f22d6]"></i> Gửi tin nhắn phản hồi
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4f22d6] focus:ring-2 focus:ring-purple-100 outline-none text-[13px] text-gray-800 bg-white transition-all font-medium"
                    placeholder="Nhập họ tên của bạn"
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Địa chỉ Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4f22d6] focus:ring-2 focus:ring-purple-100 outline-none text-[13px] text-gray-800 bg-white transition-all font-medium"
                    placeholder="example@email.com"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col relative">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Chủ đề cần hỗ trợ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4f22d6] focus:ring-2 focus:ring-purple-100 outline-none text-[13px] text-gray-800 bg-white transition-all font-medium appearance-none cursor-pointer pr-10"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option>Hỗ trợ đơn hàng</option>
                    <option>Tư vấn sản phẩm</option>
                    <option>Khiếu nại dịch vụ</option>
                    <option>Hợp tác kinh doanh</option>
                    <option>Yêu cầu hỗ trợ khác</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                    <i className="fa-solid fa-chevron-down"></i>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4f22d6] focus:ring-2 focus:ring-purple-100 outline-none text-[13px] text-gray-800 bg-white transition-all font-medium resize-none min-h-[140px]"
                  placeholder="Mô tả chi tiết thắc mắc hoặc yêu cầu của bạn..."
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3.5 bg-[#4f22d6] text-white font-extrabold rounded-xl hover:bg-[#3b00ae] hover:shadow-lg hover:shadow-purple-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>Gửi thông tin</span>
                <i className="fa-regular fa-paper-plane text-xs"></i>
              </button>
            </form>
          </div>

          {/* Info Cards (5 Columns) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Contact Details Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="text-[15px] font-extrabold text-gray-800 uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-[#4f22d6]"></i> Thông tin liên hệ
              </h3>

              <div className="space-y-4">
                {/* 1. Address */}
                <div className="flex items-start gap-4 p-1 group">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4f22d6] flex items-center justify-center shrink-0 border border-purple-100/50 group-hover:bg-[#4f22d6] group-hover:text-white transition-colors duration-300">
                    <i className="fa-solid fa-map-location-dot text-sm"></i>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Địa chỉ trụ sở</h4>
                    <p className="text-[13px] text-gray-700 font-semibold leading-relaxed mt-0.5">
                      Số 123, Đường Lê Lợi, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>

                {/* 2. Hotlines */}
                <div className="flex items-start gap-4 p-1 group">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4f22d6] flex items-center justify-center shrink-0 border border-purple-100/50 group-hover:bg-[#4f22d6] group-hover:text-white transition-colors duration-300">
                    <i className="fa-solid fa-phone-volume text-sm"></i>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Điện thoại</h4>
                    <div className="text-[13px] text-gray-700 font-bold mt-0.5 space-y-0.5">
                      <p>Hotline CSKH: <a href="tel:19001234" className="text-[#4f22d6] hover:underline">1900 1234</a></p>
                      <p>Kỹ thuật: <a href="tel:02838388888" className="text-gray-600 hover:text-[#4f22d6] hover:underline font-semibold">(028) 3838 8888</a></p>
                    </div>
                  </div>
                </div>

                {/* 3. Emails */}
                <div className="flex items-start gap-4 p-1 group">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4f22d6] flex items-center justify-center shrink-0 border border-purple-100/50 group-hover:bg-[#4f22d6] group-hover:text-white transition-colors duration-300">
                    <i className="fa-solid fa-envelope-open-text text-sm"></i>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Hòm thư điện tử</h4>
                    <div className="text-[13px] text-gray-700 font-semibold mt-0.5 space-y-0.5">
                      <p>Hỗ trợ: <a href="mailto:support@shopnow.vn" className="text-[#4f22d6] hover:underline">support@shopnow.vn</a></p>
                      <p>Hợp tác: <a href="mailto:sales@shopnow.vn" className="text-gray-600 hover:text-[#4f22d6] hover:underline">sales@shopnow.vn</a></p>
                    </div>
                  </div>
                </div>

                {/* 4. Hours */}
                <div className="flex items-start gap-4 p-1 group">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4f22d6] flex items-center justify-center shrink-0 border border-purple-100/50 group-hover:bg-[#4f22d6] group-hover:text-white transition-colors duration-300">
                    <i className="fa-regular fa-clock text-sm"></i>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Thời gian làm việc</h4>
                    <p className="text-[13px] text-gray-700 font-semibold leading-relaxed mt-0.5">
                      Tất cả các ngày trong tuần: từ 08:00 đến 21:30
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-60 shadow-sm relative group">
              <div
                className="w-full h-full bg-gray-100 flex items-center justify-center bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDcEaCj2oy1c56OBwkzaE3S7ZM9eJc9aD_F6tyZ4VHGBrGvc0hejhKRLKFKLDhHH-KOqaWQKR6kMY-dazkh9PC6rUhHOlR9HyjiYqH1oxPfb-HP068qITfJGed1iZ2InK2oKTjR9ic8Pb-eQTIhWg8shFuqoCKWKCKcZPt9Xrc9iNgzAsdx7h03a7_YLeL6EYdX8x_9EcFCysq-n6ogMhZbSOxhGCVYb0o6ViR7IHwr6YPuIjvFxefRiUbccMtWRiCre-YGWPEgyQ')"
                }}
              >
                <div className="absolute inset-0 bg-[#4f22d6]/5 group-hover:bg-[#4f22d6]/0 transition-colors"></div>
                <button
                  type="button"
                  onClick={() => window.open("https://maps.google.com", "_blank")}
                  className="z-10 bg-white/95 backdrop-blur px-5 py-2.5 rounded-xl border border-gray-100 flex items-center gap-2 shadow-lg hover:scale-105 transition-all text-gray-800 hover:text-[#4f22d6] font-bold text-[12px] uppercase tracking-wider cursor-pointer"
                >
                  <i className="fa-solid fa-map-location-dot"></i>
                  <span>Xem trên Google Maps</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="mt-16 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="text-center mb-8">
            <span className="text-[#4f22d6] font-extrabold uppercase tracking-widest text-[11px] bg-purple-50 px-3 py-1 rounded-full">
              Hỗ trợ khách hàng
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 mt-2.5">
              Câu Hỏi Thường Gặp (FAQs)
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-xl overflow-hidden bg-white transition-all ${
                    isOpen ? "border-[#4f22d6]/40 shadow-sm" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-purple-50/20 transition-colors outline-none cursor-pointer"
                  >
                    <span className="font-extrabold text-[14.5px] text-gray-800 pr-4">{faq.question}</span>
                    <i
                      className={`fa-solid fa-chevron-down text-xs text-[#4f22d6] transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    ></i>
                  </button>
                  
                  <div
                    className="transition-all duration-300 ease-in-out overflow-hidden"
                    style={{
                      maxHeight: isOpen ? "220px" : "0px",
                      borderTop: isOpen ? "1px solid rgba(229, 231, 235, 0.5)" : "none"
                    }}
                  >
                    <div className="px-6 py-4.5 text-[13px] text-gray-600 leading-relaxed font-medium bg-purple-50/5">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </CustomerShell>
  );
}
