"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";
import { useApp } from "@/lib/app-context";

export function CustomerCheckoutPage() {
  const { cart, clearCart, showToast, user, openAuthModal } = useApp();

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "credit" | "wallet">("cod");

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [prodVoucherId, setProdVoucherId] = useState<string | null>(null);
  const [prodVoucherCode, setProdVoucherCode] = useState("");
  const [prodDiscount, setProdDiscount] = useState(0);

  const [shipVoucherId, setShipVoucherId] = useState<string | null>(null);
  const [shipVoucherCode, setShipVoucherCode] = useState("");
  const [shipDiscount, setShipDiscount] = useState(0);

  const [voucherCode, setVoucherCode] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);

  const isShippingVoucher = (v: any) => {
    const code = (v.code || "").toUpperCase();
    const name = (v.name || "").toLowerCase();
    const desc = (v.description || "").toLowerCase();
    return (
      code.includes("SHIP") ||
      code.includes("FREE") ||
      name.includes("vận chuyển") ||
      name.includes("ship") ||
      desc.includes("vận chuyển") ||
      desc.includes("ship")
    );
  };

  const applyVoucherByCode = async (codeStr: string) => {
    if (!codeStr.trim()) return;
    const currentSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const currentShippingFee = shippingMethod === "standard" ? 30000 : 55000;
    try {
      const res = await fetch("/api/vouchers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeStr, orderValue: currentSubtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ ${data.error || "Mã không hợp lệ"}`);
        return;
      }
      
      const isShip = isShippingVoucher(data);
      if (isShip) {
        const calculatedShipDiscount = Math.min(currentShippingFee, Number(data.discountAmount || 0));
        setShipVoucherId(data.voucherId);
        setShipVoucherCode(data.code);
        setShipDiscount(calculatedShipDiscount);
        showToast(`✓ Đã áp dụng mã vận chuyển: ${data.name}!`);
      } else {
        setProdVoucherId(data.voucherId);
        setProdVoucherCode(data.code);
        setProdDiscount(Number(data.discountAmount || 0));
        showToast(`✓ Đã áp dụng mã sản phẩm: ${data.name}!`);
      }
      setVoucherCode("");
    } catch {
      showToast("✗ Lỗi kết nối hệ thống.");
    }
  };

  const handleApplyVoucherCode = () => {
    applyVoucherByCode(voucherCode);
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  // Vietnam address selection states
  const [dbType, setDbType] = useState<"before" | "after">("after");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [hamlet, setHamlet] = useState<string>("");         // Thôn/Xóm/Tổ/Ấp (nhập tay)
  const [streetAddress, setStreetAddress] = useState<string>(""); // Số nhà, tên đường (nhập tay)

  const [provincesList, setProvincesList] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [wardsList, setWardsList] = useState<any[]>([]);

  // Extract voucher query params & load available vouchers
  useEffect(() => {
    let initialCode = "";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      initialCode = params.get("code") || "";
    }

    fetch("/api/vouchers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableVouchers(data);
          if (initialCode) {
            applyVoucherByCode(initialCode);
          }
        }
      })
      .catch((err) => console.error("Error loading vouchers:", err));
  }, []);

  // Fetch addresses if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, email: user.email }));
      fetch("/api/addresses")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAddresses(data);
            const def = data.find((a: any) => a.is_default) || data[0];
            if (def) {
              setSelectedAddressId(String(def.id));
              setFormData({
                name: def.recipient_name,
                phone: def.phone,
                email: user.email,
                address: `${def.address_line}${def.ward ? `, ${def.ward}` : ""}${def.district ? `, ${def.district}` : ""}${def.province ? `, ${def.province}` : ""}`
              });
            }
          }
        })
        .catch((err) => console.error("Error loading addresses:", err));
    }
  }, [user]);

  // Load provinces list based on database type selection
  useEffect(() => {
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setHamlet("");
    setDistrictsList([]);
    setWardsList([]);

    fetch(`/api/vietnam-addresses?type=${dbType}&level=province`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProvincesList(data);
        }
      })
      .catch((err) => console.error("Error loading provinces:", err));
  }, [dbType]);

  // Load districts list (only when dbType is "before" and province is selected)
  useEffect(() => {
    if (dbType === "before" && selectedProvince) {
      setSelectedDistrict("");
      setSelectedWard("");
      setWardsList([]);
      fetch(`/api/vietnam-addresses?type=before&level=district&parentId=${selectedProvince}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setDistrictsList(data);
          }
        })
        .catch((err) => console.error("Error loading districts:", err));
    }
  }, [selectedProvince, dbType]);

  // Load communes list (when dbType is "before" and district is selected)
  useEffect(() => {
    if (dbType === "before" && selectedDistrict) {
      setSelectedWard("");
      fetch(`/api/vietnam-addresses?type=before&level=commune&parentId=${selectedDistrict}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setWardsList(data);
          }
        })
        .catch((err) => console.error("Error loading communes:", err));
    }
  }, [selectedDistrict, dbType]);

  // Load wards list (when dbType is "after" and province is selected)
  useEffect(() => {
    if (dbType === "after" && selectedProvince) {
      setSelectedWard("");
      fetch(`/api/vietnam-addresses?type=after&level=ward&parentId=${selectedProvince}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setWardsList(data);
          }
        })
        .catch((err) => console.error("Error loading wards:", err));
    }
  }, [selectedProvince, dbType]);

  // Auto construct full address string for order submission
  useEffect(() => {
    if (selectedAddressId) return;

    if (dbType === "before") {
      // Trước sát nhập: Số nhà/đường, Thôn/Xóm, Xã/Phường, Quận/Huyện, Tỉnh/TP
      const p = provincesList.find((x) => x.idProvince === selectedProvince)?.name || "";
      const d = districtsList.find((x) => x.idDistrict === selectedDistrict)?.name || "";
      const w = wardsList.find((x) => x.idCommune === selectedWard)?.name || "";
      const parts = [streetAddress, hamlet, w, d, p].filter(Boolean);
      setFormData((prev) => ({ ...prev, address: parts.join(", ") }));
    } else {
      // Sau sát nhập: Số nhà/đường, Thôn/Xóm, Xã/Phường, Tỉnh/TP
      const p = provincesList.find((x) => x.code === selectedProvince)?.fullName || "";
      const w = wardsList.find((x) => x.Code === selectedWard)?.FullName || "";
      const parts = [streetAddress, hamlet, w, p].filter(Boolean);
      setFormData((prev) => ({ ...prev, address: parts.join(", ") }));
    }
  }, [selectedProvince, selectedDistrict, selectedWard, hamlet, streetAddress, dbType, provincesList, districtsList, wardsList, selectedAddressId]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingFee = shippingMethod === "standard" ? 30000 : 55000;
  const actualShipDiscount = Math.min(shippingFee, shipDiscount);
  const discount = prodDiscount + actualShipDiscount;
  const totalPayment = Math.max(0, subtotal - prodDiscount - actualShipDiscount + shippingFee);

  const productVouchers = availableVouchers.filter((v) => !isShippingVoucher(v));
  const shippingVouchers = availableVouchers.filter((v) => isShippingVoucher(v));

  const formatPrice = (num: number) => {
    return num.toLocaleString("vi-VN") + "đ";
  };

  const handleAddressSelect = (addr: any) => {
    setSelectedAddressId(String(addr.id));
    setFormData({
      name: addr.recipient_name,
      phone: addr.phone,
      email: user?.email || "",
      address: `${addr.address_line}${addr.ward ? `, ${addr.ward}` : ""}${addr.district ? `, ${addr.district}` : ""}${addr.province ? `, ${addr.province}` : ""}`
    });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (cart.length === 0) {
      showToast("✗ Giỏ hàng của bạn đang trống!");
      return;
    }

    setLoading(true);
    try {
      let addrId = selectedAddressId;

      // If no address selected or user manually modified, register new address
      if (!addrId) {
        let finalWard = "";
        let finalDistrict = "";
        let finalProvince = "";

        if (dbType === "before") {
          finalProvince = provincesList.find((x) => x.idProvince === selectedProvince)?.name || "";
          finalDistrict = districtsList.find((x) => x.idDistrict === selectedDistrict)?.name || "";
          finalWard = wardsList.find((x) => x.idCommune === selectedWard)?.name || "";
        } else {
          finalProvince = provincesList.find((x) => x.code === selectedProvince)?.fullName || "";
          finalWard = wardsList.find((x) => x.Code === selectedWard)?.FullName || "";
        }

        // Compose address line from street address field
        const finalAddressLine = streetAddress || formData.address || "";

        const addrRes = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientName: formData.name,
            phone: formData.phone,
            addressLine: finalAddressLine,
            ward: finalWard,
            district: finalDistrict,
            province: finalProvince,
            isDefault: false
          })
        });
        const savedAddr = await addrRes.json();
        if (addrRes.ok) {
          addrId = savedAddr.id;
        } else {
          showToast(`✗ Lỗi lưu địa chỉ: ${savedAddr.error}`);
          setLoading(false);
          return;
        }
      }

      // Submit order details to API
      const finalNote = note + (shipVoucherCode ? ` [Mã vận chuyển: ${shipVoucherCode} (-${actualShipDiscount.toLocaleString("vi-VN")}đ)]` : "");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: addrId,
          voucherId: prodVoucherId || null,
          cartItems: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.qty })),
          subtotal,
          discountAmount: discount,
          shippingFee,
          totalAmount: totalPayment,
          paymentMethod,
          note: finalNote
        })
      });

      const orderData = await res.json();
      if (!res.ok) {
        showToast(`✗ Đặt hàng thất bại: ${orderData.error}`);
        return;
      }

      showToast("✓ Đặt hàng thành công! Cảm ơn bạn.");
      clearCart();
      window.location.href = "/donhang"; // Redirect to orders history page
    } catch {
      showToast("✗ Đã xảy ra lỗi khi xử lý đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerShell>
      <div className="bg-background text-on-surface font-body-md min-h-screen">
        <main className="max-w-container-max mx-auto px-gutter py-12">
          <h1 className="text-[32px] font-black text-on-surface mb-8">Thanh toán</h1>

          <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Column: Information & Methods */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Address Quick Selector */}
              {user && addresses.length > 0 && (
                <section className="glass-card bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <span className="material-symbols-outlined">map</span>
                    <h2 className="text-[20px] font-bold">Địa chỉ đã lưu</h2>
                  </div>
                  <div className="flex flex-col gap-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleAddressSelect(addr)}
                        className={`p-3.5 border rounded-xl cursor-pointer hover:bg-gray-50 flex items-start gap-3 transition-all ${
                          selectedAddressId === String(addr.id) ? "border-primary bg-primary-container/5" : "border-outline-variant"
                        }`}
                      >
                        <input
                          type="radio"
                          className="mt-1"
                          checked={selectedAddressId === String(addr.id)}
                          onChange={() => handleAddressSelect(addr)}
                        />
                        <div className="text-[13px]">
                          <p className="font-bold text-gray-800">
                            {addr.recipient_name} - {addr.phone} {addr.is_default && <span className="text-[10px] text-primary bg-purple-100 px-1.5 py-0.5 rounded ml-1.5 font-bold">Mặc định</span>}
                          </p>
                          <p className="text-gray-500 mt-1">
                            {addr.address_line}{addr.ward ? `, ${addr.ward}` : ""}{addr.district ? `, ${addr.district}` : ""}{addr.province ? `, ${addr.province}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(null);
                        setFormData({ name: "", phone: "", email: user.email, address: "" });
                      }}
                      className="text-xs text-primary font-bold hover:underline text-left mt-2 flex items-center gap-1"
                    >
                      + Sử dụng địa chỉ giao hàng khác
                    </button>
                  </div>
                </section>
              )}

              {/* Customer Info */}
              <section className="glass-card bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <span className="material-symbols-outlined">person</span>
                  <h2 className="text-[20px] font-bold">Thông tin khách hàng</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-on-surface-variant ml-1">Họ và tên</label>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 outline-none text-[14px] text-gray-800"
                      placeholder="Nhập họ tên của bạn"
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-on-surface-variant ml-1">Số điện thoại</label>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 outline-none text-[14px] text-gray-800"
                      placeholder="0xxx xxx xxx"
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[13px] font-semibold text-on-surface-variant ml-1">Email</label>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 outline-none text-[14px] text-gray-800"
                      placeholder="example@gmail.com"
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  {selectedAddressId ? (
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-[13px] font-semibold text-on-surface-variant ml-1">Địa chỉ nhận hàng (Đã chọn từ danh sách)</label>
                      <div className="p-4 bg-gray-50 border border-outline-variant rounded-lg text-[14px] text-gray-700">
                        {formData.address}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 md:col-span-2 border border-purple-100 rounded-xl p-4 bg-purple-50/20">
                      {/* Chọn loại địa chỉ */}
                      <div>
                        <label className="text-[13px] font-bold text-on-surface-variant ml-1 block mb-3">
                          🗺️ Phân cấp địa giới hành chính
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all flex-1 ${dbType === "before" ? "border-primary bg-white shadow-sm" : "border-gray-200 hover:border-gray-300"}`}>
                            <input
                              type="radio"
                              name="dbType"
                              checked={dbType === "before"}
                              onChange={() => setDbType("before")}
                              className="mt-0.5 text-primary focus:ring-primary"
                            />
                            <div>
                              <p className="text-[13px] font-bold text-gray-800">Trước sát nhập</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">Tỉnh/TP → Quận/Huyện → Xã/Phường</p>
                            </div>
                          </label>
                          <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all flex-1 ${dbType === "after" ? "border-primary bg-white shadow-sm" : "border-gray-200 hover:border-gray-300"}`}>
                            <input
                              type="radio"
                              name="dbType"
                              checked={dbType === "after"}
                              onChange={() => setDbType("after")}
                              className="mt-0.5 text-primary focus:ring-primary"
                            />
                            <div>
                              <p className="text-[13px] font-bold text-gray-800">Sau sát nhập</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">Tỉnh/TP → Xã/Phường (địa giới mới)</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Dropdowns phân cấp địa chỉ */}
                      <div className={`grid gap-3 ${dbType === "before" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
                        {/* Tỉnh / Thành phố */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-semibold text-gray-500 ml-1">Tỉnh / Thành phố <span className="text-red-400">*</span></label>
                          <select
                            value={selectedProvince}
                            onChange={(e) => setSelectedProvince(e.target.value)}
                            required
                            className="bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2.5 outline-none text-[13px] text-gray-800"
                          >
                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                            {provincesList.map((p) => (
                              <option key={dbType === "before" ? p.idProvince : p.code} value={dbType === "before" ? p.idProvince : p.code}>
                                {p.name || p.fullName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quận / Huyện (chỉ cho dữ liệu Trước sát nhập) */}
                        {dbType === "before" && (
                          <div className="flex flex-col gap-1">
                            <label className="text-[12px] font-semibold text-gray-500 ml-1">Quận / Huyện <span className="text-red-400">*</span></label>
                            <select
                              value={selectedDistrict}
                              onChange={(e) => setSelectedDistrict(e.target.value)}
                              required
                              disabled={!selectedProvince}
                              className="bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2.5 outline-none text-[13px] text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <option value="">-- Chọn Quận/Huyện --</option>
                              {districtsList.map((d) => (
                                <option key={d.idDistrict} value={d.idDistrict}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Xã / Phường */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-semibold text-gray-500 ml-1">Xã / Phường <span className="text-red-400">*</span></label>
                          <select
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            required
                            disabled={!selectedProvince || (dbType === "before" && !selectedDistrict)}
                            className="bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2.5 outline-none text-[13px] text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <option value="">-- Chọn Xã/Phường --</option>
                            {wardsList.map((w) => (
                              <option key={dbType === "before" ? w.idCommune : w.Code} value={dbType === "before" ? w.idCommune : w.Code}>
                                {w.name || w.FullName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Thôn / Xóm / Tổ / Ấp + Số nhà, tên đường */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-semibold text-gray-500 ml-1">
                            Thôn / Xóm / Tổ / Ấp <span className="text-gray-400 font-normal">(Nếu có)</span>
                          </label>
                          <input
                            type="text"
                            value={hamlet}
                            onChange={(e) => setHamlet(e.target.value)}
                            placeholder="Ví dụ: Thôn 3, Xóm Cầu, Tổ 12, Ấp Bình..."
                            className="bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2.5 outline-none text-[13px] text-gray-800"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[12px] font-semibold text-gray-500 ml-1">Số nhà, tên đường <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            placeholder="Ví dụ: Số 123, đường Nguyễn Trãi"
                            className="bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2.5 outline-none text-[13px] text-gray-800"
                            required
                          />
                        </div>
                      </div>

                      {/* Preview địa chỉ đầy đủ */}
                      <div className="flex items-start gap-2 text-[12px] bg-white border border-dashed border-purple-200 rounded-lg px-3 py-2.5">
                        <span className="text-purple-400 mt-0.5">📍</span>
                        <div>
                          <span className="text-gray-400">Địa chỉ giao hàng: </span>
                          <span className="font-semibold text-gray-700">{formData.address || "(Vui lòng hoàn thành các lựa chọn)"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[13px] font-semibold text-on-surface-variant ml-1">Ghi chú đơn hàng (Tùy chọn)</label>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 outline-none text-[14px] text-gray-800"
                      placeholder="Ví dụ: Giao ngoài giờ hành chính..."
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Shipping Method */}
              <section className="glass-card bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <span className="material-symbols-outlined">local_shipping</span>
                  <h2 className="text-[20px] font-bold">Phương thức vận chuyển</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    onClick={() => setShippingMethod("standard")}
                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer hover:border-primary transition-all ${
                      shippingMethod === "standard" ? "border-primary bg-primary-container/5" : "border-outline-variant"
                    }`}
                  >
                    <input
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="text-primary focus:ring-primary h-5 w-5"
                      name="shipping"
                      type="radio"
                      value="standard"
                    />
                    <div className="ml-4">
                      <p className="text-[14px] font-bold text-on-surface">Giao hàng tiêu chuẩn</p>
                      <p className="text-on-surface-variant text-[12px]">Dự kiến nhận sau 2-4 ngày</p>
                    </div>
                    <span className="ml-auto font-bold text-primary text-[14px]">30.000đ</span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("express")}
                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer hover:border-primary transition-all ${
                      shippingMethod === "express" ? "border-primary bg-primary-container/5" : "border-outline-variant"
                    }`}
                  >
                    <input
                      checked={shippingMethod === "express"}
                      onChange={() => setShippingMethod("express")}
                      className="text-primary focus:ring-primary h-5 w-5"
                      name="shipping"
                      type="radio"
                      value="express"
                    />
                    <div className="ml-4">
                      <p className="text-[14px] font-bold text-on-surface">Giao hàng hỏa tốc</p>
                      <p className="text-on-surface-variant text-[12px]">Nhận trong vòng 24h</p>
                    </div>
                    <span className="ml-auto font-bold text-primary text-[14px]">55.000đ</span>
                  </label>
                </div>
              </section>

              {/* Payment Method */}
              <section className="glass-card bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                  <h2 className="text-[20px] font-bold">Phương thức thanh toán</h2>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { key: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: "payments" },
                    { key: "credit", label: "Thẻ tín dụng / Ghi nợ", icon: "credit_card" },
                    { key: "wallet", label: "Ví điện tử (MoMo, ZaloPay)", icon: "account_balance_wallet" }
                  ].map((pay) => (
                    <label
                      key={pay.key}
                      onClick={() => setPaymentMethod(pay.key as any)}
                      className={`flex items-center p-4 rounded-xl border-2 hover:bg-gray-50 cursor-pointer transition-all ${
                        paymentMethod === pay.key ? "border-primary bg-primary-container/5" : "border-outline-variant"
                      }`}
                    >
                      <input
                        checked={paymentMethod === pay.key}
                        onChange={() => setPaymentMethod(pay.key as any)}
                        className="text-primary focus:ring-primary h-5 w-5"
                        name="payment"
                        type="radio"
                        value={pay.key}
                      />
                      <span className="material-symbols-outlined ml-4 text-on-surface-variant">{pay.icon}</span>
                      <span className="ml-3 font-semibold text-[14px] text-on-surface">{pay.label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Order Details */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <section className="glass-card bg-white p-6 rounded-xl shadow-sm sticky top-24">
                <h2 className="text-[20px] font-bold mb-6 text-on-surface">Đơn hàng của bạn</h2>
                <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center justify-between">
                      <img src={item.image} className="w-12 h-12 object-contain bg-gray-50 rounded border border-gray-100 p-1 shrink-0" alt={item.name} />
                      <div className="flex-grow min-w-0">
                        <p className="text-[12px] font-bold text-gray-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.variant} x {item.qty}</p>
                      </div>
                      <p className="text-[12px] font-bold text-gray-800 shrink-0 text-right">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>

                {/* Mã giảm giá */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <h3 className="text-[13px] font-bold text-gray-700 mb-2">Mã giảm giá (Voucher)</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá..."
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="flex-grow border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-[#4f22d6]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucherCode}
                      className="bg-primary text-white px-4 py-2 rounded-xl text-[12px] font-bold hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>

                  {/* Applied Vouchers Summary */}
                  {(prodVoucherCode || shipVoucherCode) && (
                    <div className="mt-3 space-y-2">
                      {prodVoucherCode && (
                        <div className="flex items-center justify-between bg-emerald-50/40 border border-emerald-100 p-2.5 rounded-xl text-[12px]">
                          <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px]">local_offer</span>
                            Giảm sản phẩm: <strong className="tracking-wide">{prodVoucherCode}</strong>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-600 font-bold">-{prodDiscount.toLocaleString("vi-VN")}đ</span>
                            <button
                              type="button"
                              onClick={() => {
                                setProdVoucherId(null);
                                setProdVoucherCode("");
                                setProdDiscount(0);
                              }}
                              className="text-gray-400 hover:text-red-500 text-[16px] font-bold cursor-pointer"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      )}
                      {shipVoucherCode && (
                        <div className="flex items-center justify-between bg-blue-50/40 border border-blue-100 p-2.5 rounded-xl text-[12px]">
                          <span className="text-blue-700 font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                            Giảm vận chuyển: <strong className="tracking-wide">{shipVoucherCode}</strong>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-600 font-bold">-{actualShipDiscount.toLocaleString("vi-VN")}đ</span>
                            <button
                              type="button"
                              onClick={() => {
                                setShipVoucherId(null);
                                setShipVoucherCode("");
                                setShipDiscount(0);
                              }}
                              className="text-gray-400 hover:text-red-500 text-[16px] font-bold cursor-pointer"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* List of Available Vouchers */}
                  {availableVouchers.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {/* Mục 1: Mã Sản Phẩm */}
                      {productVouchers.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">local_offer</span>
                            MÃ SẢN PHẨM:
                          </p>
                          <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                            {productVouchers.map((v) => {
                              const isEligible = subtotal >= Number(v.minimum_order_value || 0);
                              const isApplied = prodVoucherCode.toUpperCase() === v.code.toUpperCase();

                              return (
                                <div
                                  key={v.id.toString()}
                                  className={`p-2.5 border rounded-lg flex items-center justify-between transition-all ${
                                    isApplied
                                      ? "border-emerald-500 bg-emerald-50/10"
                                      : isEligible
                                      ? "border-purple-100 bg-purple-50/10 hover:border-purple-200"
                                      : "border-gray-100 bg-gray-50/50 opacity-60"
                                  }`}
                                >
                                  <div className="text-[11px]">
                                    <p className="font-bold text-gray-800 flex items-center gap-1.5">
                                      <span className="px-1.5 py-0.5 rounded font-black tracking-wider text-[10px] bg-purple-100 text-primary">
                                        {v.code}
                                      </span>
                                      {v.name}
                                    </p>
                                    <p className="text-gray-500 mt-1">
                                      {v.discount_type === "percent"
                                        ? `Giảm ${v.discount_value}%`
                                        : `Giảm ${Number(v.discount_value).toLocaleString("vi-VN")}đ`
                                      }
                                      {v.minimum_order_value && ` cho đơn từ ${Number(v.minimum_order_value).toLocaleString("vi-VN")}đ`}
                                    </p>
                                  </div>
                                  {isEligible ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isApplied) {
                                          setProdVoucherId(null);
                                          setProdVoucherCode("");
                                          setProdDiscount(0);
                                        } else {
                                          applyVoucherByCode(v.code);
                                        }
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                        isApplied
                                          ? "bg-red-500 text-white hover:bg-red-600"
                                          : "bg-[#4f22d6]/10 text-[#4f22d6] hover:bg-[#4f22d6]/20"
                                      }`}
                                    >
                                      {isApplied ? "Hủy" : "Áp dụng"}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 font-semibold italic">Chưa đủ ĐK</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Mục 2: Mã Vận Chuyển */}
                      {shippingVouchers.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                            MÃ VẬN CHUYỂN:
                          </p>
                          <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                            {shippingVouchers.map((v) => {
                              const isEligible = subtotal >= Number(v.minimum_order_value || 0);
                              const isApplied = shipVoucherCode.toUpperCase() === v.code.toUpperCase();

                              return (
                                <div
                                  key={v.id.toString()}
                                  className={`p-2.5 border rounded-lg flex items-center justify-between transition-all ${
                                    isApplied
                                      ? "border-blue-500 bg-blue-50/10"
                                      : isEligible
                                      ? "border-blue-100 bg-blue-50/5 hover:border-blue-200"
                                      : "border-gray-100 bg-gray-50/50 opacity-60"
                                  }`}
                                >
                                  <div className="text-[11px]">
                                    <p className="font-bold text-gray-800 flex items-center gap-1.5">
                                      <span className="px-1.5 py-0.5 rounded font-black tracking-wider text-[10px] bg-blue-100 text-blue-700">
                                        {v.code}
                                      </span>
                                      {v.name}
                                    </p>
                                    <p className="text-gray-500 mt-1">
                                      {v.discount_type === "percent"
                                        ? `Giảm ${v.discount_value}%`
                                        : `Giảm ${Number(v.discount_value).toLocaleString("vi-VN")}đ`
                                      }
                                      {v.minimum_order_value && ` cho đơn từ ${Number(v.minimum_order_value).toLocaleString("vi-VN")}đ`}
                                    </p>
                                  </div>
                                  {isEligible ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isApplied) {
                                          setShipVoucherId(null);
                                          setShipVoucherCode("");
                                          setShipDiscount(0);
                                        } else {
                                          applyVoucherByCode(v.code);
                                        }
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                        isApplied
                                          ? "bg-red-500 text-white hover:bg-red-600"
                                          : "bg-blue-600/10 text-blue-700 hover:bg-blue-600/20"
                                      }`}
                                    >
                                      {isApplied ? "Hủy" : "Áp dụng"}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 font-semibold italic">Chưa đủ ĐK</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-[13px] border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  {prodDiscount > 0 && (
                    <div className="flex justify-between text-red-500 font-medium">
                      <span>Giảm giá sản phẩm ({prodVoucherCode})</span>
                      <span>-{formatPrice(prodDiscount)}</span>
                    </div>
                  )}
                  {actualShipDiscount > 0 && (
                    <div className="flex justify-between text-blue-500 font-medium">
                      <span>Giảm vận chuyển ({shipVoucherCode})</span>
                      <span>-{formatPrice(actualShipDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                    <span className="font-bold text-base text-gray-800">Tổng cộng</span>
                    <span className="text-[22px] font-black text-primary">{formatPrice(totalPayment)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Đang xử lý đặt hàng...
                    </>
                  ) : (
                    <>
                      <span>XÁC NHẬN ĐẶT HÀNG</span>
                      <span className="material-symbols-outlined">done</span>
                    </>
                  )}
                </button>
              </section>
            </div>
          </form>
        </main>
      </div>
    </CustomerShell>
  );
}
