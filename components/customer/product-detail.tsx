"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";
import { useApp } from "@/lib/app-context";

export function CustomerProductDetailPage() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [uploadingReviewImage, setUploadingReviewImage] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [replyComment, setReplyComment] = useState<{[reviewId: string]: string}>({});
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [relatedOffset, setRelatedOffset] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxSingleImage, setLightboxSingleImage] = useState<string | null>(null);

  const { addToCart, toggleWishlist, isInWishlist, openAuthModal, user } = useApp();

  // Read URL search params on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSlug(params.get("slug") || params.get("id") || "");
    }
  }, []);

  // Fetch product details
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        const baseOpt = {
          id: "base",
          name: data.color ? `Bản gốc (${data.color})` : "Bản gốc",
          sku: data.sku,
          price: data.price,
          old_price: data.old_price,
          stock_quantity: data.stock_quantity,
          color: data.color,
          color_hex: data.color_hex,
          image_url: data.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png",
          is_base: true,
        };
        const def = data.product_variants?.find((v: any) => v.is_default) || baseOpt;
        setSelectedVariant(def);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy chi tiết sản phẩm:", err);
        setLoading(false);
      });
  }, [slug]);

  const fetchReviews = () => {
    if (!product?.id) return;
    fetch(`/api/reviews?productId=${product.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch(err => console.error("Error fetching reviews:", err));
  };

  useEffect(() => {
    if (product?.id) {
      fetchReviews();
    }
  }, [product?.id]);

  useEffect(() => {
    if (product?.category_id) {
      fetch(`/api/products?category=${product.category_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            const filtered = data.items.filter((item: any) => item.id.toString() !== product.id.toString());
            setRelatedProducts(filtered);
          }
        })
        .catch(err => console.error("Error fetching related products:", err));
    }
  }, [product?.category_id, product?.id]);

  const handleReviewImageUpload = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      try {
        const err = await res.json();
        alert(err.error || "Tải lên ảnh thất bại");
      } catch {
        alert("Tải lên ảnh thất bại");
      }
      return null;
    }
    const data = await res.json();
    return data.url;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (submittingReview) return;
    setSubmittingReview(true);

    try {
      let imageUrl = null;
      if (newImageFile) {
        setUploadingReviewImage(true);
        imageUrl = await handleReviewImageUpload(newImageFile);
        setUploadingReviewImage(false);
        if (!imageUrl) {
          setSubmittingReview(false);
          return;
        }
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id.toString(),
          rating: newRating,
          comment: newComment,
          imageUrl,
        })
      });

      if (res.ok) {
        setNewComment("");
        setNewRating(5);
        setNewImageFile(null);
        fetchReviews();
      } else {
        const err = await res.json();
        alert(err.error || "Gửi đánh giá thất bại");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    const comment = replyComment[reviewId];
    if (!comment || !comment.trim()) return;

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          comment: comment.trim(),
        })
      });

      if (res.ok) {
        setReplyComment(prev => ({ ...prev, [reviewId]: "" }));
        setReplyingToReviewId(null);
        fetchReviews();
      } else {
        const err = await res.json();
        alert(err.error || "Gửi phản hồi thất bại");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    try {
      const res = await fetch("/api/reviews/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId })
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderStarsSelector = () => {
    return (
      <div className="flex gap-1 text-xl text-amber-400">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setNewRating(s)}
            className="hover:scale-110 transition-transform"
          >
            <i className={`${s <= newRating ? "fa-solid" : "fa-regular"} fa-star`}></i>
          </button>
        ))}
      </div>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-400 text-xs">
        {Array.from({ length: 5 }).map((_, i) => (
          <i key={i} className={`${i < rating ? "fa-solid" : "fa-regular"} fa-star`}></i>
        ))}
      </div>
    );
  };

  const maskName = (name: string) => {
    if (!name) return "";
    const trimmed = name.trim();
    if (trimmed.length <= 1) return trimmed;
    if (trimmed.length === 2) return trimmed.charAt(0) + "*";
    const first = trimmed.charAt(0);
    const last = trimmed.charAt(trimmed.length - 1);
    return `${first}${"*".repeat(trimmed.length - 2)}${last}`;
  };

  // Collect all images from product_images and all variants' images
  const images = useMemo(() => {
    if (!product) return ["/giaodienkhachhang/img/banner/ip-1.png"];
    
    const list = product.product_images?.length > 0
      ? product.product_images.map((img: any) => img.image_url)
      : ["/giaodienkhachhang/img/banner/ip-1.png"];
    
    // Add all variant images if they are not already in the list
    if (product.product_variants) {
      product.product_variants.forEach((v: any) => {
        if (v.image_url && !list.includes(v.image_url)) {
          list.push(v.image_url);
        }
      });
    }
    
    return list;
  }, [product]);

  useEffect(() => {
    if (selectedVariant?.image_url) {
      const idx = images.indexOf(selectedVariant.image_url);
      if (idx !== -1) {
        setActiveImgIdx(idx);
      }
    }
  }, [selectedVariant?.image_url, images]);

  const versions = useMemo(() => {
    if (!product) return [];
    const baseOpt = {
      id: "base",
      name: product.color ? `Bản gốc (${product.color})` : "Bản gốc",
      sku: product.sku,
      price: product.price,
      old_price: product.old_price,
      stock_quantity: product.stock_quantity,
      color: product.color,
      color_hex: product.color_hex,
      image_url: product.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png",
      is_base: true,
    };
    return [baseOpt, ...(product.product_variants || [])];
  }, [product]);

  const uniqueColors = useMemo(() => {
    if (!versions.length) return [];
    const colorsMap = new Map<string, { color: string; colorHex: string; variantId: string }>();
    versions.forEach((v: any) => {
      if (v.color) {
        const colorName = v.color.trim();
        if (!colorsMap.has(colorName.toLowerCase())) {
          colorsMap.set(colorName.toLowerCase(), {
            color: colorName,
            colorHex: v.color_hex || "#000000",
            variantId: v.id.toString(),
          });
        }
      }
    });
    return Array.from(colorsMap.values());
  }, [versions]);

  const filteredVersions = useMemo(() => {
    if (!product) return [];
    if (!selectedVariant?.color) return versions;
    return versions.filter((v: any) => v.color?.trim().toLowerCase() === selectedVariant.color.trim().toLowerCase());
  }, [versions, selectedVariant?.color, product]);

  if (loading) {
    return (
      <CustomerShell>
        <div className="max-w-[1280px] mx-auto px-4 py-20 text-center">
          <i className="fa-solid fa-spinner fa-spin text-brand-purple text-[30px] mb-3"></i>
          <p className="text-gray-500 text-sm">Đang tải thông tin sản phẩm...</p>
        </div>
      </CustomerShell>
    );
  }

  if (!product) {
    return (
      <CustomerShell>
        <div className="max-w-[1280px] mx-auto px-4 py-20 text-center">
          <i className="fa-solid fa-triangle-exclamation text-red-500 text-[50px] mb-4"></i>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-500 mb-6 text-sm">Sản phẩm có thể đã ngừng bán hoặc đường dẫn không chính xác.</p>
          <Link href="/sanpham" className="bg-brand-purple text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90">
            Quay lại cửa hàng
          </Link>
        </div>
      </CustomerShell>
    );
  }

  let price = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
  let oldPrice = selectedVariant 
    ? (selectedVariant.old_price ? Number(selectedVariant.old_price) : price)
    : (product.old_price ? Number(product.old_price) : price);
  let discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  if (product.is_flash_sale && product.flash_sale_discount_percent) {
    oldPrice = price;
    price = price * (1 - product.flash_sale_discount_percent / 100);
    discountPercent = product.flash_sale_discount_percent;
  }

  const saving = oldPrice > price ? oldPrice - price : 0;

  const stockQty = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const specDetails = [
    { name: "Thương hiệu", value: product.categories?.name || "Chưa phân loại" },
    { name: "Mã sản phẩm (SKU)", value: selectedVariant?.sku || product.sku },
    { name: "Tình trạng", value: stockQty > 0 ? `Còn hàng (${stockQty} sản phẩm)` : "Hết hàng" },
    { name: "Mô tả ngắn", value: product.short_description || "Đang cập nhật..." },
  ];

  if (product.color) {
    specDetails.push({ name: "Màu sắc chính", value: product.color });
  }

  let dynamicSpecs: { key: string; value: string }[] = [];
  try {
    if (product.specifications) {
      if (typeof product.specifications === "string") {
        const trimmed = product.specifications.trim();
        if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            dynamicSpecs = parsed;
          } else if (typeof parsed === "object") {
            dynamicSpecs = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
          }
        } else {
          // Fallback plain text line-by-line parsing
          dynamicSpecs = trimmed.split(/\r?\n/).map((line: string) => {
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
      } else if (typeof product.specifications === "object") {
        const parsed = product.specifications;
        if (Array.isArray(parsed)) {
          dynamicSpecs = parsed;
        } else {
          dynamicSpecs = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
        }
      }
    }
  } catch (e) {
    console.warn("Lỗi parse specifications JSON, chuyển sang parse text:", e);
    try {
      dynamicSpecs = String(product.specifications || "").trim().split(/\r?\n/).map((line: string) => {
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

  const handleAddToCart = () => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      category: product.categories?.name || "Sản phẩm",
      variant: selectedVariant ? selectedVariant.name : "Mặc định",
      price,
      originalPrice: oldPrice,
      image: selectedVariant?.image_url || images[0],
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    handleAddToCart();
    window.location.href = "/thanhtoan";
  };

  const handleWishlist = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    toggleWishlist({
      id: Number(product.id),
      name: product.name,
      category: product.categories?.name || "Sản phẩm",
      price,
      originalPrice: oldPrice,
      image: images[0],
      rating: 5,
      reviews: 99,
    });
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "đ";
  };

  return (
    <CustomerShell>
      <div className="bg-[#f8f9fa] text-slate-800 min-h-screen">
        <main className="max-w-[1280px] mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-6 text-gray-500 text-xs">
            <Link className="hover:text-brand-purple" href="/trangchu">Trang chủ</Link>
            <span className="fa-solid fa-chevron-right text-[10px] text-gray-300"></span>
            <Link className="hover:text-brand-purple" href={`/sanpham?category=${product.category_id}`}>
              {product.categories?.name || "Danh mục"}
            </Link>
            <span className="fa-solid fa-chevron-right text-[10px] text-gray-300"></span>
            <span className="text-gray-800 font-medium truncate max-w-[200px] md:max-w-[400px]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Product Gallery */}
            <section className="lg:col-span-7 grid grid-cols-12 gap-4">
              {/* Vertical Thumbs (Desktop) */}
              <div className="hidden md:flex md:col-span-2 flex-col gap-3 overflow-y-auto max-h-[500px]">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`aspect-square rounded-xl overflow-hidden transition-all border-2 ${
                      idx === activeImgIdx ? "border-brand-purple shadow-sm shadow-purple-100" : "border-gray-200 hover:border-brand-purple"
                    }`}
                  >
                    <img className="w-full h-full object-contain p-1 bg-white" src={img} alt={`Thumb ${idx + 1}`} />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="col-span-12 md:col-span-10 relative">
                <div
                  className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center p-6 shadow-sm relative cursor-zoom-in select-none"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={(e) => {
                    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - left) / width) * 100;
                    const y = ((e.clientY - top) / height) * 100;
                    setZoomPos({ x, y });
                  }}
                  onClick={() => setShowLightbox(true)}
                >
                  <img
                    className="w-full h-full object-contain transition-transform duration-100 ease-out"
                    style={
                      isZoomed
                        ? {
                            transform: "scale(2.2)",
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          }
                        : undefined
                    }
                    src={images[activeImgIdx]}
                    alt={product.name}
                  />
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                    {product.is_featured && (
                      <span className="bg-[#4f22d6] text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase">
                        Nổi Bật
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Thumbs (Horizontal) */}
              <div className="col-span-12 flex md:hidden gap-2 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-16 h-16 flex-shrink-0 rounded-xl border-2 overflow-hidden bg-white p-1 ${
                      idx === activeImgIdx ? "border-brand-purple" : "border-gray-200"
                    }`}
                  >
                    <img className="w-full h-full object-contain" src={img} alt={`Thumb ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </section>

            {/* Right: Product Information */}
            <section className="lg:col-span-5 flex flex-col gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="space-y-2">
                <span className="text-brand-purple font-bold text-xs uppercase tracking-wider block">
                  {product.categories?.name || "Danh mục"}
                </span>
                <h1 className="text-[24px] font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {reviews.length > 0 ? (
                    <>
                      <div className="flex text-amber-400 gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                          return (
                            <i key={i} className={`${i < Math.round(avg) ? "fa-solid" : "fa-regular"} fa-star`}></i>
                          );
                        })}
                      </div>
                      <span>({reviews.length} đánh giá)</span>
                    </>
                  ) : (
                    <span>Chưa có đánh giá</span>
                  )}
                  <span className="text-gray-300">|</span>
                  <span className={product.stock_quantity > 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                    {product.stock_quantity > 0 ? "Còn hàng" : "Hết hàng"}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-red-600 font-extrabold text-2xl">
                    {formatCurrency(price)}
                  </span>
                  {oldPrice > price && (
                    <span className="text-gray-400 line-through text-sm block mt-0.5">
                      {formatCurrency(oldPrice)}
                    </span>
                  )}
                </div>
                {saving > 0 && (
                  <div className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold border border-red-100">
                    Tiết kiệm {formatCurrency(saving)}
                  </div>
                )}
              </div>

              {/* Màu sắc Selector */}
              {uniqueColors.length > 1 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Màu sắc</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueColors.map((colorItem) => {
                      const isActive = selectedVariant?.color?.trim().toLowerCase() === colorItem.color.toLowerCase();
                      return (
                        <button
                          key={colorItem.color}
                          type="button"
                          onClick={() => {
                            const found = versions.find((v: any) => v.color?.trim().toLowerCase() === colorItem.color.toLowerCase());
                            if (found) setSelectedVariant(found);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? "border-brand-purple bg-purple-50 text-brand-purple shadow-sm font-bold animate-pulse-subtle"
                              : "border-gray-200 hover:border-brand-purple text-gray-600 bg-white"
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: colorItem.colorHex }} />
                          <span>{colorItem.color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chọn phiên bản Selector */}
              {product.product_variants && product.product_variants.length > 0 && filteredVersions.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Chọn phiên bản</p>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredVersions.map((v: any) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id.toString()}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`p-3 border rounded-xl flex flex-col text-left transition-all relative ${
                            isSelected
                              ? "border-brand-purple bg-purple-50 text-brand-purple shadow-sm"
                              : "border-gray-200 hover:border-brand-purple text-slate-700 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {v.color_hex && (
                              <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: v.color_hex }} />
                            )}
                            <span className="text-xs font-bold line-clamp-1">{v.name}</span>
                          </div>
                          <span className={`text-xs font-extrabold mt-1.5 ${isSelected ? "text-brand-purple" : "text-slate-500"}`}>
                            {formatCurrency(Number(v.price))}
                          </span>
                          {v.stock_quantity <= 0 && (
                            <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              Hết hàng
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={stockQty <= 0}
                    className="flex-1 py-3.5 bg-purple-50 text-brand-purple font-bold rounded-xl border border-brand-purple/20 hover:bg-purple-100 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-cart-plus text-[16px]"></i>
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={handleWishlist}
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                      isInWishlist(Number(product.id))
                        ? "border-red-100 bg-red-50 text-red-500"
                        : "border-gray-200 hover:border-brand-purple text-gray-500 hover:text-brand-purple"
                    }`}
                  >
                    <i className={`${isInWishlist(Number(product.id)) ? "fa-solid" : "fa-regular"} fa-heart text-[18px]`}></i>
                  </button>
                </div>
                <button
                  onClick={handleBuyNow}
                  disabled={stockQty <= 0}
                  className="w-full py-4 bg-brand-purple text-white font-bold rounded-xl hover:opacity-90 shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mua Ngay
                </button>
              </div>
            </section>
          </div>

          {/* Details Tabs (Description / Specs) */}
          <section className="mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100 bg-gray-50">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === "description" ? "border-brand-purple text-brand-purple bg-white" : "border-transparent text-gray-500 hover:text-brand-purple"
                }`}
              >
                Mô tả chi tiết
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === "specs" ? "border-brand-purple text-brand-purple bg-white" : "border-transparent text-gray-500 hover:text-brand-purple"
                }`}
              >
                Thông số kỹ thuật
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === "reviews" ? "border-brand-purple text-brand-purple bg-white" : "border-transparent text-gray-500 hover:text-brand-purple"
                }`}
              >
                Đánh giá ({reviews.length})
              </button>
            </div>

            <div className="p-6 md:p-8">
              {activeTab === "description" ? (
                <div className="prose max-w-none text-gray-600 leading-relaxed text-sm">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, "<br/>") }} />
                  ) : (
                    <p>Sản phẩm {product.name} đang được cập nhật thông tin mô tả chi tiết từ nhà sản xuất.</p>
                  )}
                </div>
              ) : activeTab === "specs" ? (
                <div className="max-w-xl">
                  <table className="w-full border-collapse">
                    <tbody>
                      {dynamicSpecs.length > 0 ? (
                        dynamicSpecs.map((spec, index) => (
                          <tr key={index} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 pr-4 font-bold text-gray-500 text-xs w-48 uppercase tracking-wide">
                              {spec.key}
                            </td>
                            <td className="py-3 text-gray-800 text-sm">{spec.value}</td>
                          </tr>
                        ))
                      ) : (
                        specDetails.map((spec) => (
                          <tr key={spec.name} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 pr-4 font-bold text-gray-500 text-xs w-48 uppercase tracking-wide">
                              {spec.name}
                            </td>
                            <td className="py-3 text-gray-800 text-sm">{spec.value}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Customer Reviews Tab */
                <div className="space-y-8 animate-fadeIn">
                  {/* Reviews Summary / Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Overall rating info */}
                    <div className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl border border-gray-100 text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Đánh giá trung bình</p>
                      <h3 className="text-5xl font-black text-slate-800 mt-2">
                        {reviews.length > 0
                          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                          : "0.0"}
                      </h3>
                      <div className="flex justify-center mt-3 mb-2">
                        {renderStars(
                          reviews.length > 0
                            ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                            : 0
                        )}
                      </div>
                      <p className="text-xs text-gray-400">({reviews.length} đánh giá từ khách hàng)</p>
                    </div>

                    {/* Right: Submit Review Form */}
                    <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h4 className="font-bold text-[13px] text-gray-800 mb-4 uppercase tracking-wide">Gửi đánh giá của bạn</h4>
                      {user ? (
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-600">Chọn số sao đánh giá:</span>
                            {renderStarsSelector()}
                          </div>

                          <div>
                            <textarea
                              value={newComment}
                              onChange={e => setNewComment(e.target.value)}
                              rows={3}
                              required
                              placeholder="Chia sẻ nhận xét của bạn về sản phẩm này..."
                              className="w-full border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-brand-purple resize-none"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 px-3.5 py-2 border border-dashed border-gray-300 hover:border-brand-purple rounded-xl cursor-pointer text-[12px] font-semibold text-gray-500 hover:text-brand-purple transition-colors bg-gray-50/50">
                                <i className="fa-solid fa-camera"></i>
                                <span>Thêm hình ảnh</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) setNewImageFile(file);
                                  }}
                                />
                              </label>
                              {newImageFile && (
                                <div className="flex items-center gap-1.5 bg-purple-50 text-brand-purple text-xs font-bold px-2.5 py-1 rounded-full border border-purple-100">
                                  <span className="truncate max-w-[120px]">{newImageFile.name}</span>
                                  <button type="button" onClick={() => setNewImageFile(null)} className="hover:text-red-500">
                                    <i className="fa-solid fa-xmark"></i>
                                  </button>
                                </div>
                              )}
                            </div>

                            <button
                              type="submit"
                              disabled={submittingReview || uploadingReviewImage}
                              className="px-6 py-2.5 bg-brand-purple hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                            >
                              {(submittingReview || uploadingReviewImage) ? (
                                <><i className="fa-solid fa-spinner animate-spin"></i> Đang gửi...</>
                              ) : (
                                <><i className="fa-solid fa-paper-plane"></i> Gửi đánh giá</>
                              )}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500 text-sm mb-3">Vui lòng đăng nhập để gửi đánh giá cho sản phẩm này.</p>
                          <button
                            type="button"
                            onClick={() => openAuthModal("login")}
                            className="px-6 py-2 bg-brand-purple text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                          >
                            Đăng nhập ngay
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6 pt-4">
                    <h4 className="font-bold text-[13px] text-gray-800 border-b border-gray-100 pb-3 uppercase tracking-wide">
                      Đánh giá từ khách hàng ({reviews.length})
                    </h4>

                    {reviews.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <i className="fa-regular fa-comment-dots text-4xl mb-2 opacity-50"></i>
                        <p className="text-sm">Chưa có đánh giá nào cho sản phẩm này.</p>
                        <p className="text-xs mt-0.5">Hãy là người đầu tiên gửi đánh giá của bạn!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 space-y-6">
                        {reviews.map((r: any, rIdx: number) => (
                          <div key={r.id} className={`${rIdx > 0 ? "pt-6" : ""} space-y-4`}>
                            {/* User Header */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-100 to-purple-200 border border-purple-200 flex items-center justify-center font-bold text-brand-purple text-sm flex-shrink-0">
                                  {r.userAvatar ? (
                                    <img src={r.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    r.userName ? r.userName.charAt(0).toUpperCase() : "?"
                                  )}
                                </div>
                                <div>
                                  <h5 className="font-bold text-[13px] text-gray-800">{maskName(r.userName)}</h5>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {renderStars(r.rating)}
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Comment */}
                            <div className="text-[13px] text-gray-600 leading-relaxed pl-13">
                              {r.comment && <p className="mb-3">{r.comment}</p>}
                              {r.imageUrl && (
                                <div className="mb-3 max-w-[200px]">
                                  <img
                                    src={r.imageUrl}
                                    alt="Đánh giá"
                                    onClick={() => setLightboxSingleImage(r.imageUrl)}
                                    className="rounded-xl border border-gray-100 shadow-sm max-h-40 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                                  />
                                </div>
                              )}

                              {/* Likes & Replies buttons */}
                              <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 select-none">
                                <button
                                  type="button"
                                  onClick={() => handleLikeReview(r.id)}
                                  className={`flex items-center gap-1.5 transition-colors font-medium ${
                                    r.hasLiked ? "text-red-500 font-bold" : "hover:text-red-500"
                                  }`}
                                >
                                  <i className={`${r.hasLiked ? "fa-solid" : "fa-regular"} fa-heart`}></i>
                                  <span>Thích ({r.likesCount})</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setReplyingToReviewId(replyingToReviewId === r.id ? null : r.id)}
                                  className="flex items-center gap-1.5 hover:text-brand-purple transition-colors font-medium"
                                >
                                  <i className="fa-regular fa-comment-dots"></i>
                                  <span>Phản hồi ({r.replies?.length || 0})</span>
                                </button>
                              </div>

                              {/* Reply Form */}
                              {replyingToReviewId === r.id && (
                                <div className="mt-3 flex gap-2 items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 animate-fadeIn">
                                  <input
                                    type="text"
                                    value={replyComment[r.id] || ""}
                                    onChange={e => setReplyComment(prev => ({ ...prev, [r.id]: e.target.value }))}
                                    placeholder="Viết phản hồi..."
                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-brand-purple"
                                    onKeyDown={e => {
                                      if (e.key === "Enter") handleReplySubmit(r.id);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleReplySubmit(r.id)}
                                    className="px-4 py-1.5 bg-brand-purple text-white text-xs font-bold rounded-lg hover:opacity-90"
                                  >
                                    Gửi
                                  </button>
                                </div>
                              )}

                              {/* Replies List */}
                              {r.replies && r.replies.length > 0 && (
                                <div className="mt-4 border-l-2 border-purple-50 pl-4 space-y-3.5 bg-gray-50/30 p-3 rounded-r-xl">
                                  {r.replies.map((reply: any) => (
                                    <div key={reply.id} className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800 text-[12px]">
                                          {reply.isAdmin ? reply.userName : maskName(reply.userName)}
                                        </span>
                                        {reply.isAdmin && (
                                          <span className="bg-purple-100 text-brand-purple text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                            Admin
                                          </span>
                                        )}
                                        <span className="text-[10px] text-gray-400">
                                          {new Date(reply.createdAt).toLocaleDateString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-[12px] text-gray-600">{reply.comment}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Related Products Carousel */}
          {relatedProducts.length > 0 && (
            <section className="mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[15px] font-black text-slate-800 uppercase tracking-wide">Sản phẩm liên quan</h3>
                <Link
                  href={`/sanpham?category=${product.category_id}`}
                  className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
                >
                  <span>Xem tất cả</span>
                  <i className="fa-solid fa-chevron-right text-[10px]" />
                </Link>
              </div>

              <div className="relative">
                {/* Carousel wrapper */}
                <div className="overflow-hidden">
                  <div
                    className="flex gap-4 transition-transform duration-500"
                    style={{
                      transform: `translateX(-${relatedOffset * 220}px)`
                    }}
                  >
                    {relatedProducts.map((item) => {
                      const itemPrice = Number(item.price);
                      const itemOldPrice = item.old_price ? Number(item.old_price) : 0;
                      const itemDiscount = item.is_flash_sale && item.flash_sale_discount_percent
                        ? item.flash_sale_discount_percent
                        : (itemOldPrice > itemPrice ? Math.round(((itemOldPrice - itemPrice) / itemOldPrice) * 100) : 0);
                      const displayPrice = item.is_flash_sale && item.flash_sale_discount_percent
                        ? itemPrice * (1 - item.flash_sale_discount_percent / 100)
                        : itemPrice;
                      const displayOldPrice = item.is_flash_sale && item.flash_sale_discount_percent
                        ? itemPrice
                        : itemOldPrice;
                      const itemImg = item.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png";

                      return (
                        <div
                          key={item.id}
                          className="w-[204px] bg-white p-3 rounded-xl border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative flex-shrink-0 group/card"
                        >
                          <div>
                            {itemDiscount > 0 && (
                              <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold z-10">
                                -{itemDiscount}%
                              </span>
                            )}
                            <Link href={`/chitietsanpham?slug=${item.slug}`} className="h-[120px] mb-2 flex items-center justify-center block">
                              <img alt={item.name} className="max-h-full object-contain group-hover/card:scale-105 transition-transform duration-300" src={itemImg} />
                            </Link>
                            <h4 className="text-[12px] font-semibold text-gray-800 line-clamp-2 mb-1">
                              <Link href={`/chitietsanpham?slug=${item.slug}`} className="hover:text-brand-purple">{item.name}</Link>
                            </h4>
                          </div>
                          <div>
                            <p className="text-brand-purple font-extrabold text-[13px]">{displayPrice.toLocaleString("vi-VN")}đ</p>
                            {displayOldPrice > 0 && (
                              <p className="text-[10px] text-gray-400 line-through">{displayOldPrice.toLocaleString("vi-VN")}đ</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation Buttons */}
                {relatedOffset > 0 && (
                  <button
                    type="button"
                    onClick={() => setRelatedOffset(o => Math.max(0, o - 1))}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md border border-gray-100 flex items-center justify-center hover:bg-brand-purple hover:text-white hover:scale-110 active:scale-95 transition-all text-gray-500 z-20"
                  >
                    <i className="fa-solid fa-chevron-left text-sm" />
                  </button>
                )}
                {relatedOffset < relatedProducts.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setRelatedOffset(o => {
                      // Total item width = 204px + gap (16px) = 220px
                      return Math.min(relatedProducts.length - 1, o + 1);
                    })}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md border border-gray-100 flex items-center justify-center hover:bg-brand-purple hover:text-white hover:scale-110 active:scale-95 transition-all text-gray-500 z-20"
                  >
                    <i className="fa-solid fa-chevron-right text-sm" />
                  </button>
                )}
              </div>
            </section>
          )}
          {/* Fullscreen Lightbox Modal */}
          {showLightbox && (
            <div
              className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
              onClick={() => setShowLightbox(false)}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowLightbox(false)}
                className="absolute top-6 right-6 text-white/80 hover:text-white text-2xl w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              {/* Prev Button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-xl w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95 z-50"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
              )}

              {/* Main Image */}
              <div
                className="w-[85vw] h-[75vh] max-w-[800px] max-h-[600px] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={images[activeImgIdx]}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-lg shadow-2xl animate-scaleIn select-none"
                />
              </div>

              {/* Next Button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-xl w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95 z-50"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              )}

              {/* Counter Indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-[11px] font-bold bg-white/10 px-4.5 py-2 rounded-full border border-white/10 tracking-wider">
                ẢNH {activeImgIdx + 1} / {images.length}
              </div>
            </div>
          )}
          {/* Fullscreen Review Image Lightbox Modal */}
          {lightboxSingleImage && (
            <div
              className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
              onClick={() => setLightboxSingleImage(null)}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setLightboxSingleImage(null)}
                className="absolute top-6 right-6 text-white/80 hover:text-white text-2xl w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              {/* Image */}
              <div
                className="w-[85vw] h-[75vh] max-w-[800px] max-h-[600px] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={lightboxSingleImage}
                  alt="Chi tiết ảnh đánh giá"
                  className="w-full h-full object-contain rounded-lg shadow-2xl animate-scaleIn select-none"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </CustomerShell>
  );
}
