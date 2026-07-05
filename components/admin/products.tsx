"use client";

import { useState, useEffect, useRef } from "react";
import { AdminShell } from "../admin-shell";
import { useApp } from "@/lib/app-context";
import * as XLSX from "xlsx";

type Variant = {
  id?: string;
  name: string;
  sku: string;
  price: string;
  oldPrice: string;
  stockQuantity: string;
  color: string;
  colorHex: string;
  imageUrl: string;
};

const emptyVariant = (): Variant => ({
  name: "", sku: "", price: "", oldPrice: "", stockQuantity: "0",
  color: "", colorHex: "#000000", imageUrl: "",
});

const DEFAULT_FORM = {
  categoryId: "",
  name: "",
  slug: "",
  sku: "",
  shortDescription: "",
  description: "",
  color: "",
  colorHex: "#000000",
  price: "",
  oldPrice: "",
  stockQuantity: "0",
  isFeatured: false,
  isFlashSale: false,
  flashSaleDiscountPercent: "",
  status: "active",
  imageUrls: [] as string[],
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"info" | "specs" | "variants">("info");
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [uploading, setUploading] = useState(false);
  const [variantUploadingIdx, setVariantUploadingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const mainImgRef = useRef<HTMLInputElement>(null);
  const variantImgRef = useRef<HTMLInputElement>(null);
  const [variantImgForIdx, setVariantImgForIdx] = useState<number | null>(null);
  const { showToast, adminSearch } = useApp();

  const [excelPath, setExcelPath] = useState("");
  const [importingExcel, setImportingExcel] = useState(false);
  const excelFileRef = useRef<HTMLInputElement>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingExcel(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        
        const importedSpecs: { key: string; value: string }[] = [];
        for (const row of data) {
          if (Array.isArray(row) && row.length >= 2) {
            const key = String(row[0] || "").trim();
            const value = String(row[1] || "").trim();
            
            if (
              key.toLowerCase() === "tên thông số" ||
              key.toLowerCase() === "thông số" ||
              key.toLowerCase() === "key" ||
              key.toLowerCase() === "name" ||
              key === ""
            ) {
              continue;
            }
            
            importedSpecs.push({ key, value });
          }
        }

        if (importedSpecs.length > 0) {
          setSpecs(importedSpecs);
          showToast(`✓ Đã nhập thành công ${importedSpecs.length} thông số từ file Excel.`);
        } else {
          showToast("✗ Không tìm thấy dữ liệu thông số kỹ thuật hợp lệ.");
        }
      } catch (err) {
        console.error(err);
        showToast("✗ Đọc file Excel thất bại.");
      } finally {
        setImportingExcel(false);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const handleExcelPathImport = async () => {
    if (!excelPath.trim()) {
      showToast("✗ Vui lòng nhập đường dẫn file Excel.");
      return;
    }

    setImportingExcel(true);
    try {
      const res = await fetch("/api/admin/products/import-specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: excelPath.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ Thất bại: ${data.error || "Lỗi đọc file Excel"}`);
        return;
      }

      if (data.specs && data.specs.length > 0) {
        setSpecs(data.specs);
        showToast(`✓ Đã nhập thành công ${data.specs.length} thông số từ đường dẫn Excel.`);
      } else {
        showToast("✗ Không tìm thấy dữ liệu thông số hợp lệ tại đường dẫn này.");
      }
    } catch (err) {
      console.error(err);
      showToast("✗ Lỗi kết nối đến server.");
    } finally {
      setImportingExcel(false);
    }
  };

  /* ─── Data Fetch ─── */
  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      if (prodRes.ok) setProducts(await prodRes.json() || []);
      if (catRes.ok) setCategories(await catRes.json() || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ─── Upload helper ─── */
  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) { showToast("✗ Upload ảnh thất bại"); return null; }
    const data = await res.json();
    return data.url;
  };

  /* ─── Main image upload ─── */
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const f of files) {
      const url = await uploadFile(f);
      if (url) urls.push(url);
    }
    setFormData(p => ({ ...p, imageUrls: [...p.imageUrls, ...urls] }));
    setUploading(false);
    e.target.value = "";
  };

  /* ─── Variant image upload ─── */
  const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVariantUploadingIdx(idx);
    const url = await uploadFile(file);
    if (url) {
      setVariants(vs => vs.map((v, i) => i === idx ? { ...v, imageUrl: url } : v));
    }
    setVariantUploadingIdx(null);
    e.target.value = "";
  };

  /* ─── Open modals ─── */
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ ...DEFAULT_FORM, categoryId: categories[0]?.id?.toString() || "" });
    setVariants([]);
    setSpecs([]);
    setActiveTab("info");
    setShowModal(true);
  };

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);
    setFormData({
      categoryId: prod.category_id.toString(),
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      shortDescription: prod.short_description || "",
      description: prod.description || "",
      color: prod.color || "",
      colorHex: prod.color_hex || "#000000",
      price: String(prod.price),
      oldPrice: prod.old_price ? String(prod.old_price) : "",
      stockQuantity: String(prod.stock_quantity),
      isFeatured: prod.is_featured,
      isFlashSale: prod.is_flash_sale,
      flashSaleDiscountPercent: prod.flash_sale_discount_percent ? String(prod.flash_sale_discount_percent) : "",
      status: prod.status,
      imageUrls: prod.product_images?.map((img: any) => img.image_url) || [],
    });
    setVariants(
      (prod.product_variants || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        sku: v.sku || "",
        price: String(v.price),
        oldPrice: v.old_price ? String(v.old_price) : "",
        stockQuantity: String(v.stock_quantity),
        color: v.color || "",
        colorHex: v.color_hex || "#000000",
        imageUrl: v.image_url || "",
      }))
    );
    let parsedSpecs = [];
    try {
      if (prod.specifications) {
        if (typeof prod.specifications === "string") {
          const trimmed = prod.specifications.trim();
          if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              parsedSpecs = parsed;
            } else if (typeof parsed === "object") {
              parsedSpecs = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
            }
          } else {
            // Fallback plain text line-by-line parsing
            parsedSpecs = trimmed.split(/\r?\n/).map((line: string) => {
              const colonIdx = line.indexOf(":");
              if (colonIdx > -1) {
                return {
                  key: line.slice(0, colonIdx).trim(),
                  value: line.slice(colonIdx + 1).trim()
                };
              }
              return { key: line.trim(), value: "" };
            }).filter((item: any) => item.key !== "");
          }
        } else if (typeof prod.specifications === "object") {
          const parsed = prod.specifications;
          if (Array.isArray(parsed)) {
            parsedSpecs = parsed;
          } else {
            parsedSpecs = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
          }
        }
      }
    } catch (e) {
      console.warn("Lỗi parse specifications JSON, chuyển sang parse text:", e);
      try {
        parsedSpecs = String(prod.specifications || "").trim().split(/\r?\n/).map((line: string) => {
          const colonIdx = line.indexOf(":");
          if (colonIdx > -1) {
            return {
              key: line.slice(0, colonIdx).trim(),
              value: line.slice(colonIdx + 1).trim()
            };
          }
          return { key: line.trim(), value: "" };
        }).filter((item: any) => item.key !== "");
      } catch (err) {
        console.error("Lỗi parse specifications text:", err);
      }
    }
    setSpecs(parsedSpecs);
    setActiveTab("info");
    setShowModal(true);
  };

  /* ─── Form helpers ─── */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const slug = val.toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
    const sku = val.toUpperCase().normalize("NFD")
      .replace(/[^A-Z0-9]/g, "").slice(0, 6) + "-" + Math.floor(100 + Math.random() * 900);
    setFormData(p => ({ ...p, name: val, slug, sku: p.sku || sku }));
  };

  /* ─── Variant helpers ─── */
  const addVariant = () => setVariants(vs => [...vs, emptyVariant()]);
  const removeVariant = (i: number) => setVariants(vs => vs.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: keyof Variant, val: string) =>
    setVariants(vs => vs.map((v, idx) => idx === i ? { ...v, [field]: val } : v));

  /* ─── Submit ─── */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validate basic info
    if (!formData.categoryId) {
      showToast("✗ Vui lòng chọn danh mục sản phẩm");
      setActiveTab("info");
      setSaving(false);
      return;
    }
    if (!formData.name.trim()) {
      showToast("✗ Vui lòng nhập tên sản phẩm");
      setActiveTab("info");
      setSaving(false);
      return;
    }
    if (!formData.slug.trim()) {
      showToast("✗ Vui lòng nhập slug sản phẩm");
      setActiveTab("info");
      setSaving(false);
      return;
    }
    if (!formData.sku.trim()) {
      showToast("✗ Vui lòng nhập mã SKU");
      setActiveTab("info");
      setSaving(false);
      return;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      showToast("✗ Vui lòng nhập giá bán hợp lệ");
      setActiveTab("info");
      setSaving(false);
      return;
    }

    // Validate specs
    const validSpecs = specs.filter(s => s.key.trim() !== "");
    for (const spec of validSpecs) {
      if (!spec.value.trim()) {
        showToast(`✗ Vui lòng nhập giá trị cho thông số "${spec.key}"`);
        setActiveTab("specs");
        setSaving(false);
        return;
      }
    }

    // Validate variants
    if (variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v.name.trim()) {
          showToast(`✗ Biến thể #${i + 1}: Vui lòng nhập tên biến thể`);
          setActiveTab("variants");
          setSaving(false);
          return;
        }
        if (!v.price.trim() || isNaN(Number(v.price)) || Number(v.price) < 0) {
          showToast(`✗ Biến thể #${i + 1}: Vui lòng nhập giá bán hợp lệ`);
          setActiveTab("variants");
          setSaving(false);
          return;
        }
      }
    }

    try {
      const method = editingProduct ? "PUT" : "POST";
      const payload = {
        ...(editingProduct ? { id: editingProduct.id.toString() } : {}),
        ...formData,
        specifications: JSON.stringify(validSpecs),
        variants: variants.map(v => ({
          name: v.name, sku: v.sku, price: v.price, oldPrice: v.oldPrice,
          stockQuantity: v.stockQuantity, color: v.color, colorHex: v.colorHex, imageUrl: v.imageUrl,
        })),
      };
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { showToast(`✗ Thất bại: ${data.error || "Lỗi lưu sản phẩm"}`); return; }
      showToast(editingProduct ? "✓ Đã cập nhật sản phẩm thành công." : "✓ Đã thêm sản phẩm thành công.");
      setShowModal(false);
      fetchData();
    } catch { showToast("✗ Gặp sự cố kết nối."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) { showToast("✓ Đã xóa sản phẩm."); fetchData(); }
      else { const d = await res.json(); showToast(`✗ ${d.error}`); }
    } catch { showToast("✗ Lỗi kết nối."); }
  };

  const fmt = (v: number) => v.toLocaleString("vi-VN") + "đ";


  const filteredProducts = products.filter((prod) => {
    if (selectedCategoryFilter !== "all" && String(prod.category_id) !== selectedCategoryFilter) {
      return false;
    }
    const searchLower = adminSearch.toLowerCase();
    return (
      (prod.name || "").toLowerCase().includes(searchLower) ||
      (prod.sku || "").toLowerCase().includes(searchLower) ||
      (prod.categories?.name || "").toLowerCase().includes(searchLower)
    );
  });

  /* ─── Render ─── */
  return (
    <AdminShell activeKey="products" title="Quản lý sản phẩm" subtitle="Quản trị viên"
      actionLabel="Thêm sản phẩm" actionIcon="add" sectionLabel="Admin" onActionClick={openAddModal}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-black text-on-surface">Quản lý sản phẩm</h1>
            <p className="text-[15px] text-on-surface-variant mt-1">
              Quản trị danh sách sản phẩm, giá bán, tồn kho và các chiến dịch khuyến mãi trong hệ thống ShopNow.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] bg-white focus:outline-none focus:border-[#4f22d6] font-semibold text-gray-700 cursor-pointer shadow-sm"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id.toString()} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button onClick={openAddModal}
              className="flex items-center gap-2 bg-[#4f22d6] hover:bg-[#3b12be] text-white px-5 py-2.5 rounded-xl font-bold text-[13px] shadow-md transition-all cursor-pointer">
              <i className="fa-solid fa-plus" /> Thêm sản phẩm mới
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fa-solid fa-spinner animate-spin text-[28px] text-[#4f22d6] mb-3" />
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {["SẢN PHẨM", "MÃ SKU", "DANH MỤC", "ĐƠN GIÁ", "TỒN KHO", "BÁN CHẠY", "TRẠNG THÁI", "THAO TÁC"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-gray-500 tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(prod => {
                  const img = prod.product_images?.[0]?.image_url;
                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} alt={prod.name}
                              className="w-11 h-11 rounded-lg object-cover border border-gray-100 bg-gray-50"
                              onError={e => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.endsWith("/uploads/placeholder.png")) {
                                  target.src = "/uploads/placeholder.png";
                                }
                              }} />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <i className="fa-solid fa-image text-gray-300 text-[16px]" />
                            </div>
                          )}
                          <span className="font-semibold text-gray-800 line-clamp-2 max-w-[200px]">{prod.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-[12px]">{prod.sku}</td>
                      <td className="px-4 py-3 text-gray-600">{prod.categories?.name}</td>
                      <td className="px-4 py-3 font-bold text-[#4f22d6]">{fmt(Number(prod.price))}</td>
                      <td className="px-4 py-3 text-gray-600">{prod.stock_quantity}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {prod.is_featured && <span className="bg-purple-100 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-full w-fit">Nổi bật</span>}
                          {prod.is_flash_sale && <span className="bg-orange-100 text-orange-700 text-[11px] font-bold px-2 py-0.5 rounded-full w-fit">Flash Sale</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
                          prod.status === "active" ? "bg-green-100 text-green-700"
                          : prod.status === "draft" ? "bg-gray-100 text-gray-500"
                          : "bg-red-100 text-red-500"
                        }`}>
                          {prod.status === "active" ? "Kinh doanh" : prod.status === "draft" ? "Nháp" : "Ẩn"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(prod)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#4f22d6] hover:bg-purple-50 transition-colors">
                            <i className="fa-solid fa-pen-to-square" />
                          </button>
                          <button onClick={() => handleDelete(prod.id.toString())}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <i className="fa-solid fa-box-open text-[40px] mb-3 opacity-50" />
                <p>Không tìm thấy sản phẩm phù hợp.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-[18px] font-black text-gray-800">
                {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 flex-shrink-0 px-6">
              {(["info", "specs", "variants"] as const).map(tab => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-[13px] font-bold border-b-2 transition-colors ${
                    activeTab === tab ? "border-[#4f22d6] text-[#4f22d6]" : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}>
                  {tab === "info" ? (
                    <><i className="fa-solid fa-circle-info mr-1.5" />Thông tin cơ bản</>
                  ) : tab === "specs" ? (
                    <><i className="fa-solid fa-gears mr-1.5" />Thông số kỹ thuật ({specs.length})</>
                  ) : (
                    <><i className="fa-solid fa-layer-group mr-1.5" />Biến thể ({variants.length})</>
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 p-6">

                {/* ── Tab: Thông tin cơ bản ── */}
                {activeTab === "info" && (
                  <div className="space-y-4">
                    {/* Ảnh sản phẩm */}
                    <div>
                      <label className="block text-[12px] font-bold text-gray-600 mb-2">
                        <i className="fa-solid fa-images mr-1.5 text-[#4f22d6]" />ẢNH SẢN PHẨM
                      </label>
                      <div className="flex flex-wrap gap-3 mb-3">
                        {formData.imageUrls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200 bg-gray-50" />
                            <button type="button"
                              onClick={() => setFormData(p => ({ ...p, imageUrls: p.imageUrls.filter((_, j) => j !== i) }))}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <i className="fa-solid fa-xmark" />
                            </button>
                            {i === 0 && (
                              <span className="absolute bottom-1 left-1 bg-[#4f22d6] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                CHÍNH
                              </span>
                            )}
                          </div>
                        ))}
                        <button type="button"
                          onClick={() => mainImgRef.current?.click()}
                          disabled={uploading}
                          className="w-20 h-20 border-2 border-dashed border-gray-300 hover:border-[#4f22d6] rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-[#4f22d6] transition-colors text-[11px] gap-1">
                          {uploading ? <i className="fa-solid fa-spinner animate-spin text-[18px]" />
                            : <><i className="fa-solid fa-plus text-[18px]" /><span>Upload</span></>}
                        </button>
                        <input ref={mainImgRef} type="file" accept="image/*" multiple className="hidden"
                          onChange={handleMainImageUpload} />
                      </div>
                      <p className="text-[11px] text-gray-400">
                        <i className="fa-solid fa-circle-info mr-1" />Hỗ trợ JPG, PNG, WebP. Tối đa 5MB/ảnh. Ảnh đầu tiên là ảnh chính.
                      </p>
                    </div>

                    {/* Tên sản phẩm */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[12px] font-bold text-gray-600 mb-1.5">TÊN SẢN PHẨM *</label>
                        <input name="name" value={formData.name} onChange={handleNameChange} required
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#4f22d6]"
                          placeholder="iPhone 15 Pro Max" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-600 mb-1.5">SLUG *</label>
                        <input name="slug" value={formData.slug}
                          onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} required
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] font-mono focus:outline-none focus:border-[#4f22d6]" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-600 mb-1.5">SKU *</label>
                        <input name="sku" value={formData.sku}
                          onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))} required
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] font-mono focus:outline-none focus:border-[#4f22d6]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-gray-600 mb-1.5">DANH MỤC *</label>
                      <select name="categoryId" value={formData.categoryId}
                        onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value }))} required
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#4f22d6]">
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    {/* Màu sắc sản phẩm chính */}
                    <div>
                      <label className="block text-[12px] font-bold text-gray-600 mb-1.5">MÀU SẮC SẢN PHẨM CHÍNH</label>
                      <div className="flex items-center gap-3">
                        <input type="color" name="colorHex" value={formData.colorHex}
                          onChange={handleInputChange}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
                        <input name="color" value={formData.color} onChange={handleInputChange}
                          placeholder="VD: Đen Titan, Xanh Dương (Để trống nếu không áp dụng)"
                          className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#4f22d6]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-600 mb-1.5">GIÁ BÁN (đ) *</label>
                        <input name="price" value={formData.price} onChange={handleInputChange} required type="number" min="0"
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#4f22d6]"
                          placeholder="28990000" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-600 mb-1.5">GIÁ GỐC (đ)</label>
                        <input name="oldPrice" value={formData.oldPrice} onChange={handleInputChange} type="number" min="0"
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#4f22d6]"
                          placeholder="32000000" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-600 mb-1.5">TỒN KHO</label>
                        <input name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} type="number" min="0"
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#4f22d6]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-gray-600 mb-1.5">MÔ TẢ NGẮN</label>
                      <textarea name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} rows={2}
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#4f22d6] resize-none"
                        placeholder="Mô tả ngắn gọn về sản phẩm..." />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-gray-600 mb-1.5">MÔ TẢ CHI TIẾT</label>
                      <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4}
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#4f22d6] resize-none"
                        placeholder="Mô tả chi tiết thông số kỹ thuật..." />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-600 mb-1.5">TRẠNG THÁI</label>
                        <select name="status" value={formData.status} onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#4f22d6]">
                          <option value="active">Kinh doanh</option>
                          <option value="draft">Bản nháp</option>
                          <option value="hidden">Ẩn</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-end gap-2 col-span-2">
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange}
                              className="w-4 h-4 accent-[#4f22d6]" />
                            <span className="text-[13px] font-semibold text-gray-700">Sản phẩm nổi bật</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" name="isFlashSale" checked={formData.isFlashSale} onChange={handleInputChange}
                              className="w-4 h-4 accent-[#4f22d6]" />
                            <span className="text-[13px] font-semibold text-gray-700">Flash Sale</span>
                          </label>
                        </div>
                        {formData.isFlashSale && (
                          <div className="mt-2 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-600 whitespace-nowrap">GIẢM GIÁ FLASH SALE (%):</label>
                            <input
                              type="number"
                              name="flashSaleDiscountPercent"
                              value={formData.flashSaleDiscountPercent}
                              onChange={handleInputChange}
                              min="1"
                              max="100"
                              placeholder="VD: 15"
                              className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-[13px] focus:outline-none focus:border-[#4f22d6]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Tab: Thông số kỹ thuật ── */}
                {activeTab === "specs" && (
                  <div className="space-y-4">
                    {/* Excel Import Controls */}
                    <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 space-y-3">
                      <h4 className="text-[13px] font-bold text-gray-800 flex items-center gap-2">
                        <i className="fa-solid fa-file-excel text-green-600 text-[16px]"></i>
                        NHẬP THÔNG SỐ TỪ FILE EXCEL
                      </h4>
                      <p className="text-[12px] text-gray-500">
                        Hỗ trợ file Excel (.xlsx, .xls) có 2 cột: <strong>Tên thông số</strong> và <strong>Giá trị</strong>. Bạn có thể nhập đường dẫn file trên ổ đĩa hoặc chọn file trực tiếp.
                      </p>
                      
                      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={excelPath}
                            onChange={e => setExcelPath(e.target.value)}
                            placeholder="VD: D:\website-ban-dthoai\thongsokythuat.xlsx"
                            className="w-full border border-gray-200 rounded-xl pl-3.5 pr-10 py-2.5 text-[13px] bg-white focus:outline-none focus:border-[#4f22d6]"
                          />
                          {excelPath && (
                            <button 
                              type="button" 
                              onClick={() => setExcelPath("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={handleExcelPathImport}
                            disabled={importingExcel}
                            className="bg-[#4f22d6] hover:bg-[#3b12be] disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            {importingExcel ? (
                              <i className="fa-solid fa-spinner animate-spin"></i>
                            ) : (
                              <i className="fa-solid fa-bolt"></i>
                            )}
                            Nhập đường dẫn
                          </button>
                          
                          <button 
                            type="button" 
                            onClick={() => excelFileRef.current?.click()}
                            disabled={importingExcel}
                            className="border border-green-600 hover:bg-green-50 text-green-600 disabled:border-gray-300 disabled:text-gray-300 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <i className="fa-solid fa-upload"></i>
                            Chọn file...
                          </button>
                        </div>
                      </div>
                      
                      <input 
                        ref={excelFileRef} 
                        type="file" 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                        onChange={handleExcelImport}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] text-gray-600">
                          Quản lý các thông số kỹ thuật chi tiết của sản phẩm (Chip, RAM, Camera, Pin...).
                        </p>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                          Các thông số này sẽ hiển thị ở dạng bảng trên trang chi tiết sản phẩm.
                        </p>
                      </div>
                      <button type="button" onClick={() => setSpecs(s => [...s, { key: "", value: "" }])}
                        className="flex items-center gap-1.5 bg-[#4f22d6] hover:bg-[#3b12be] text-white px-4 py-2 rounded-xl text-[13px] font-bold transition-colors">
                        <i className="fa-solid fa-plus" /> Thêm thông số
                      </button>
                    </div>

                    {specs.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                        <i className="fa-solid fa-gears text-[40px] mb-3 opacity-40" />
                        <p className="font-semibold">Chưa có thông số kỹ thuật nào</p>
                        <p className="text-[12px] mt-1">Nhấn "Thêm thông số" để bắt đầu thêm cấu hình động</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {specs.map((spec, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <input
                              type="text"
                              value={spec.key}
                              onChange={e => setSpecs(s => s.map((item, idx) => idx === i ? { ...item, key: e.target.value } : item))}
                              placeholder="Tên thông số (VD: RAM, CPU, Pin)"
                              required
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#4f22d6]"
                            />
                            <input
                              type="text"
                              value={spec.value}
                              onChange={e => setSpecs(s => s.map((item, idx) => idx === i ? { ...item, value: e.target.value } : item))}
                              placeholder="Giá trị thông số (VD: 8GB, Apple A17, 5000mAh)"
                              required
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#4f22d6]"
                            />
                            <button type="button" onClick={() => setSpecs(s => s.filter((_, idx) => idx !== i))}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab: Biến thể ── */}
                {activeTab === "variants" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] text-gray-600">
                          Thêm các biến thể cho sản phẩm, ví dụ: màu sắc, dung lượng, kích thước...
                        </p>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                          Mỗi biến thể có thể có giá, tồn kho và ảnh riêng.
                        </p>
                      </div>
                      <button type="button" onClick={addVariant}
                        className="flex items-center gap-1.5 bg-[#4f22d6] hover:bg-[#3b12be] text-white px-4 py-2 rounded-xl text-[13px] font-bold transition-colors">
                        <i className="fa-solid fa-plus" /> Thêm biến thể
                      </button>
                    </div>

                    {variants.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                        <i className="fa-solid fa-layer-group text-[40px] mb-3 opacity-40" />
                        <p className="font-semibold">Chưa có biến thể nào</p>
                        <p className="text-[12px] mt-1">Nhấn "Thêm biến thể" để bắt đầu</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {variants.map((v, i) => (
                          <div key={i} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 relative">
                            {/* Variant header */}
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[12px] font-bold text-[#4f22d6] bg-purple-50 px-3 py-1 rounded-full">
                                Biến thể #{i + 1}
                              </span>
                              <button type="button" onClick={() => removeVariant(i)}
                                className="text-red-400 hover:text-red-600 text-[12px] font-semibold flex items-center gap-1">
                                <i className="fa-solid fa-trash" /> Xóa
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {/* Ảnh biến thể */}
                              <div className="col-span-2 flex items-center gap-4">
                                <div className="flex-shrink-0">
                                  {v.imageUrl ? (
                                    <div className="relative group">
                                      <img src={v.imageUrl} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                                      <button type="button"
                                        onClick={() => updateVariant(i, "imageUrl", "")}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="fa-solid fa-xmark" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button type="button"
                                      onClick={() => { setVariantImgForIdx(i); variantImgRef.current?.click(); }}
                                      className="w-16 h-16 border-2 border-dashed border-gray-300 hover:border-[#4f22d6] rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-[#4f22d6] transition-colors text-[10px] gap-0.5">
                                      {variantUploadingIdx === i
                                        ? <i className="fa-solid fa-spinner animate-spin text-[16px]" />
                                        : <><i className="fa-solid fa-camera text-[16px]" /><span>Ảnh</span></>}
                                    </button>
                                  )}
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[11px] font-bold text-gray-500 mb-1 block">TÊN BIẾN THỂ *</label>
                                    <input value={v.name} onChange={e => updateVariant(i, "name", e.target.value)} required
                                      placeholder="VD: Đen - 256GB"
                                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#4f22d6] bg-white" />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-bold text-gray-500 mb-1 block">SKU BIẾN THỂ</label>
                                    <input value={v.sku} onChange={e => updateVariant(i, "sku", e.target.value)}
                                      placeholder="IP15-BLK-256"
                                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-[#4f22d6] bg-white" />
                                  </div>
                                </div>
                              </div>

                              {/* Color */}
                              <div className="col-span-2">
                                <label className="text-[11px] font-bold text-gray-500 mb-1 block">MÀU SẮC</label>
                                <div className="flex items-center gap-3">
                                  <input type="color" value={v.colorHex}
                                    onChange={e => updateVariant(i, "colorHex", e.target.value)}
                                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
                                  <input value={v.color} onChange={e => updateVariant(i, "color", e.target.value)}
                                    placeholder="Tên màu: Đen, Trắng, Titan..."
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#4f22d6] bg-white" />
                                  <code className="text-[12px] text-gray-400 font-mono">{v.colorHex}</code>
                                </div>
                              </div>

                              {/* Price + Stock */}
                              <div>
                                <label className="text-[11px] font-bold text-gray-500 mb-1 block">GIÁ BÁN (đ) *</label>
                                <input value={v.price} onChange={e => updateVariant(i, "price", e.target.value)} required type="number" min="0"
                                  placeholder="28990000"
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#4f22d6] bg-white" />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-gray-500 mb-1 block">GIÁ GỐC (đ)</label>
                                <input value={v.oldPrice} onChange={e => updateVariant(i, "oldPrice", e.target.value)} type="number" min="0"
                                  placeholder="32000000"
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#4f22d6] bg-white" />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-gray-500 mb-1 block">TỒN KHO</label>
                                <input value={v.stockQuantity} onChange={e => updateVariant(i, "stockQuantity", e.target.value)} type="number" min="0"
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#4f22d6] bg-white" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hidden variant image input */}
                    <input ref={variantImgRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { if (variantImgForIdx !== null) handleVariantImageUpload(e, variantImgForIdx); }} />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50 rounded-b-2xl">
                <div className="text-[12px] text-gray-400">
                  {variants.length > 0 && (
                    <span><i className="fa-solid fa-layer-group mr-1 text-[#4f22d6]" />{variants.length} biến thể</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-[13px] font-bold">
                    Hủy
                  </button>
                  <button type="submit" disabled={saving || uploading}
                    className="px-6 py-2.5 rounded-xl bg-[#4f22d6] hover:bg-[#3b12be] disabled:bg-gray-300 text-white text-[13px] font-bold flex items-center gap-2 shadow-md shadow-purple-100 transition-all">
                    {saving ? <><i className="fa-solid fa-spinner animate-spin" /> Đang lưu...</>
                      : <><i className="fa-solid fa-floppy-disk" /> {editingProduct ? "Cập nhật" : "Thêm sản phẩm"}</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
