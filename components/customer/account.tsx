"use client";

import { useState, useEffect } from "react";
import { CustomerShell } from "../customer-shell";
import { useApp } from "@/lib/app-context";

type Address = {
  id: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  ward?: string;
  district?: string;
  province?: string;
  is_default: boolean;
};

export function CustomerAccountPage() {
  const { user, login, showToast, openAuthModal } = useApp();
  const [activeTab, setActiveTab] = useState<"profile" | "addresses">("profile");
  
  // Profile Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address List States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [addressPhone, setAddressPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Sync state with logged in user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải địa chỉ:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("✗ Họ và tên không được để trống.");
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ Cập nhật thất bại: ${data.error || "Lỗi hệ thống"}`);
        return;
      }
      login(data.user);
      showToast("✓ Đã lưu thông tin tài khoản thành công!");
    } catch {
      showToast("✗ Lỗi hệ thống khi cập nhật thông tin.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !addressPhone.trim() || !addressLine.trim()) {
      showToast("✗ Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    setSavingAddress(true);
    try {
      const body = {
        id: editingAddressId,
        recipientName,
        phone: addressPhone,
        addressLine,
        ward,
        district,
        province,
        isDefault,
      };

      const res = await fetch("/api/addresses", {
        method: editingAddressId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ Không thể lưu địa chỉ: ${data.error}`);
        return;
      }

      showToast(editingAddressId ? "✓ Đã cập nhật địa chỉ thành công!" : "✓ Đã thêm địa chỉ mới thành công!");
      resetAddressForm();
      fetchAddresses();
    } catch {
      showToast("✗ Lỗi hệ thống khi lưu địa chỉ.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

    try {
      const res = await fetch(`/api/addresses?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("✓ Đã xóa địa chỉ thành công.");
        fetchAddresses();
      } else {
        const data = await res.json();
        showToast(`✗ Xóa địa chỉ thất bại: ${data.error}`);
      }
    } catch {
      showToast("✗ Lỗi hệ thống khi xóa địa chỉ.");
    }
  };

  const handleSetDefaultAddress = async (address: Address) => {
    try {
      const res = await fetch("/api/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: address.id,
          recipientName: address.recipient_name,
          phone: address.phone,
          addressLine: address.address_line,
          ward: address.ward,
          district: address.district,
          province: address.province,
          isDefault: true,
        }),
      });
      if (res.ok) {
        showToast("✓ Đã thiết lập địa chỉ mặc định.");
        fetchAddresses();
      } else {
        const data = await res.json();
        showToast(`✗ Thất bại: ${data.error}`);
      }
    } catch {
      showToast("✗ Lỗi hệ thống.");
    }
  };

  const openEditForm = (addr: Address) => {
    setEditingAddressId(addr.id);
    setRecipientName(addr.recipient_name);
    setAddressPhone(addr.phone);
    setAddressLine(addr.address_line);
    setWard(addr.ward || "");
    setDistrict(addr.district || "");
    setProvince(addr.province || "");
    setIsDefault(addr.is_default);
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setRecipientName("");
    setAddressPhone("");
    setAddressLine("");
    setWard("");
    setDistrict("");
    setProvince("");
    setIsDefault(false);
    setShowAddressForm(false);
  };

  const getLoyaltyBadge = (tier?: string) => {
    switch (tier) {
      case "diamond":
        return <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">Diamond Member</span>;
      case "gold":
        return <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">Gold Member</span>;
      case "silver":
        return <span className="bg-gradient-to-r from-slate-400 to-slate-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">Silver Member</span>;
      default:
        return <span className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">Bronze Member</span>;
    }
  };

  return (
    <CustomerShell>
      <div className="max-w-[1280px] mx-auto px-4 py-8 flex-grow w-full">
        {/* Breadcrumb */}
        <div className="text-[13px] text-gray-500 mb-6 flex items-center gap-1.5">
          <a href="/trangchu" className="hover:text-[#4f22d6]">Trang chủ</a>
          <i className="fa-solid fa-chevron-right text-[10px]"></i>
          <span className="text-gray-800 font-medium">Tài khoản</span>
        </div>

        {!user ? (
          /* Empty / Unauthenticated State */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-12 text-center max-w-[500px] mx-auto my-12 animate-fade-in">
            <div className="w-20 h-20 bg-purple-50 text-[#4f22d6] rounded-full flex items-center justify-center mx-auto mb-6 text-[32px] shadow-inner">
              <i className="fa-regular fa-user"></i>
            </div>
            <h2 className="text-[22px] font-bold text-gray-800 tracking-tight">Vui lòng đăng nhập</h2>
            <p className="text-[14px] text-gray-500 mt-2 mb-8 leading-relaxed">
              Bạn cần đăng nhập tài khoản để xem thông tin cá nhân và quản lý sổ địa chỉ giao hàng của mình.
            </p>
            <button
              onClick={() => openAuthModal("login")}
              className="bg-[#4f22d6] hover:bg-[#3b12be] text-white px-8 py-3 rounded-xl font-semibold tracking-wide shadow-md shadow-purple-100 transition-all active:scale-[0.98]"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          /* Main Account View */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Left Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* User Profile Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                <div className="relative mb-4 group">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-purple-50 group-hover:border-purple-100 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-[#4f22d6] to-[#3b12be] rounded-full flex items-center justify-center text-white font-extrabold text-[36px] shadow-md border-4 border-purple-50">
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="text-[18px] font-bold text-gray-800 leading-tight">{user.name}</h3>
                <p className="text-[13px] text-gray-400 mt-0.5 truncate max-w-full">{user.email}</p>
                <div className="mt-3">
                  {getLoyaltyBadge(user.loyaltyTier)}
                </div>
              </div>

              {/* Navigation Menu Tabs */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => { setActiveTab("profile"); resetAddressForm(); }}
                  className={`w-full text-left px-5 py-4 text-[14px] font-medium flex items-center gap-3 border-l-4 transition-all ${
                    activeTab === "profile"
                      ? "bg-purple-50/50 border-[#4f22d6] text-[#4f22d6]"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-[#4f22d6]"
                  }`}
                >
                  <i className="fa-regular fa-address-card text-[16px] w-5 text-center"></i>
                  Thông tin tài khoản
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full text-left px-5 py-4 text-[14px] font-medium flex items-center gap-3 border-l-4 transition-all ${
                    activeTab === "addresses"
                      ? "bg-purple-50/50 border-[#4f22d6] text-[#4f22d6]"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-[#4f22d6]"
                  }`}
                >
                  <i className="fa-solid fa-map-location-dot text-[16px] w-5 text-center"></i>
                  Sổ địa chỉ nhận hàng
                </button>
              </div>
            </div>

            {/* Content Right Column */}
            <div className="lg:col-span-3">
              {activeTab === "profile" ? (
                /* Profile Tab Page */
                <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                  <h2 className="text-[20px] font-bold text-gray-800 border-b border-gray-100 pb-4 mb-6">
                    Thông tin tài khoản
                  </h2>

                  <form onSubmit={handleUpdateProfile} className="max-w-[600px] flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập họ và tên của bạn"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:border-[#4f22d6] transition-colors"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-semibold text-gray-700">Địa chỉ Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-[11px] text-gray-400">Email tài khoản không thể thay đổi.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-semibold text-gray-700">Số điện thoại</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại nhận hàng"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:border-[#4f22d6] transition-colors"
                      />
                    </div>

                    <div className="mt-4">
                      <button
                        type="submit"
                        disabled={updatingProfile}
                        className="bg-[#4f22d6] hover:bg-[#3b12be] disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-bold tracking-wide shadow-md shadow-purple-100 transition-all flex items-center gap-2"
                      >
                        {updatingProfile ? (
                          <>
                            <i className="fa-solid fa-spinner animate-spin"></i>
                            Đang cập nhật...
                          </>
                        ) : (
                          "Lưu thay đổi"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Addresses Tab Page */
                <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                    <h2 className="text-[20px] font-bold text-gray-800">
                      Sổ địa chỉ nhận hàng
                    </h2>
                    {!showAddressForm && (
                      <button
                        onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
                        className="bg-[#4f22d6] hover:bg-[#3b12be] text-white text-[13px] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <i className="fa-solid fa-plus"></i> Thêm địa chỉ mới
                      </button>
                    )}
                  </div>

                  {showAddressForm ? (
                    /* Address Creation / Editing Form */
                    <form onSubmit={handleSaveAddress} className="max-w-[600px] flex flex-col gap-5 border border-purple-100/50 bg-purple-50/10 rounded-2xl p-5 md:p-6 mb-8 animate-fade-in">
                      <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2 mb-2">
                        <i className="fa-solid fa-location-dot text-[#4f22d6]"></i>
                        {editingAddressId ? "Chỉnh sửa địa chỉ nhận hàng" : "Thêm địa chỉ nhận hàng mới"}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[12px] font-semibold text-gray-700">Tên người nhận <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Nhập tên người nhận hàng"
                            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#4f22d6]"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[12px] font-semibold text-gray-700">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                          <input
                            type="tel"
                            value={addressPhone}
                            onChange={(e) => setAddressPhone(e.target.value)}
                            placeholder="Nhập số điện thoại giao hàng"
                            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#4f22d6]"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-semibold text-gray-700">Địa chỉ cụ thể (Số nhà, Tên đường...) <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={addressLine}
                          onChange={(e) => setAddressLine(e.target.value)}
                          placeholder="Số 123, đường Nguyễn Trãi..."
                          className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#4f22d6]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[12px] font-semibold text-gray-700">Phường / Xã</label>
                          <input
                            type="text"
                            value={ward}
                            onChange={(e) => setWard(e.target.value)}
                            placeholder="Phường 1"
                            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#4f22d6]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[12px] font-semibold text-gray-700">Quận / Huyện</label>
                          <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="Quận 5"
                            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#4f22d6]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[12px] font-semibold text-gray-700">Tỉnh / Thành phố</label>
                          <input
                            type="text"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            placeholder="TP. Hồ Chí Minh"
                            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#4f22d6]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="is_default"
                          checked={isDefault}
                          onChange={(e) => setIsDefault(e.target.checked)}
                          className="w-4 h-4 text-[#4f22d6] border-gray-300 rounded focus:ring-[#4f22d6] accent-[#4f22d6]"
                        />
                        <label htmlFor="is_default" className="text-[13px] font-semibold text-gray-700 select-none cursor-pointer">
                          Đặt làm địa chỉ mặc định nhận hàng
                        </label>
                      </div>

                      <div className="flex gap-3 justify-end mt-4 border-t border-purple-100/50 pt-4">
                        <button
                          type="button"
                          onClick={resetAddressForm}
                          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-5 py-2.5 rounded-xl text-[13px] font-bold"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="bg-[#4f22d6] hover:bg-[#3b12be] disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-md shadow-purple-100 flex items-center gap-1.5"
                        >
                          {savingAddress ? (
                            <>
                              <i className="fa-solid fa-spinner animate-spin"></i>
                              Đang lưu...
                            </>
                          ) : (
                            "Lưu địa chỉ"
                          )}
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {/* Address List View */}
                  {loadingAddresses ? (
                    <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-3">
                      <i className="fa-solid fa-spinner animate-spin text-[28px] text-[#4f22d6]"></i>
                      <p className="text-[13px]">Đang tải danh sách địa chỉ...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <i className="fa-regular fa-map text-[40px] mb-3 opacity-60"></i>
                      <p className="text-[13px]">Bạn chưa thêm địa chỉ nhận hàng nào.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`border rounded-2xl p-5 relative transition-all ${
                            addr.is_default
                              ? "bg-purple-50/20 border-[#4f22d6]/30 shadow-sm"
                              : "bg-white border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          {/* Default Badge */}
                          {addr.is_default && (
                            <span className="absolute top-5 right-5 bg-purple-50 text-[#4f22d6] border border-purple-200/50 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <i className="fa-solid fa-circle-check text-[#4f22d6]"></i> Mặc định
                            </span>
                          )}

                          <div className="flex flex-col gap-1.5 max-w-[80%]">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-800 text-[14px]">{addr.recipient_name}</p>
                              <span className="text-gray-300">|</span>
                              <p className="text-gray-500 text-[13px] font-medium">{addr.phone}</p>
                            </div>
                            <p className="text-gray-600 text-[13px] mt-1 leading-relaxed">
                              {addr.address_line}
                              {addr.ward && `, ${addr.ward}`}
                              {addr.district && `, ${addr.district}`}
                              {addr.province && `, ${addr.province}`}
                            </p>
                          </div>

                          <div className="flex gap-4 items-center mt-4 pt-3 border-t border-gray-50">
                            <button
                              onClick={() => openEditForm(addr)}
                              className="text-[12px] text-gray-500 hover:text-[#4f22d6] font-semibold flex items-center gap-1"
                            >
                              <i className="fa-regular fa-pen-to-square"></i> Sửa
                            </button>
                            {!addr.is_default && (
                              <>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="text-[12px] text-gray-500 hover:text-red-600 font-semibold flex items-center gap-1"
                                >
                                  <i className="fa-regular fa-trash-can"></i> Xóa
                                </button>
                                <button
                                  onClick={() => handleSetDefaultAddress(addr)}
                                  className="text-[12px] text-[#4f22d6] hover:text-[#3800ae] font-semibold flex items-center gap-1 ml-auto"
                                >
                                  Đặt làm mặc định
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CustomerShell>
  );
}
