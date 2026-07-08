"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";
import { useApp } from "@/lib/app-context";

const slides = [
  {
    brand: "Apple",
    icon: "fa-brands fa-apple",
    name: "iPhone 15 Pro Max",
    desc: "Titan mạnh mẽ. Nhẹ bất ngờ.",
    price: "28.990.000",
    oldPrice: "32.990.000",
    image: "/giaodienkhachhang/banner/iphone.png",
    features: [
      { icon: "fa-solid fa-microchip", text: "Chip A17 Pro" },
      { icon: "fa-solid fa-camera", text: "Camera 48MP" },
      { icon: "fa-solid fa-battery-three-quarters", text: "Pin cả ngày" }
    ]
  },
  {
    brand: "Samsung",
    icon: "fa-solid fa-mobile-screen-button",
    name: "Galaxy S24 Ultra",
    desc: "Bình cao cấp. Quay chụp chuyên nghiệp.",
    price: "26.990.000",
    oldPrice: "29.990.000",
    image: "/giaodienkhachhang/banner/samsung.png",
    features: [
      { icon: "fa-solid fa-pen-nib", text: "Bút S Pen" },
      { icon: "fa-solid fa-camera", text: "Zoom 100x" },
      { icon: "fa-solid fa-bolt", text: "Sạc siêu nhanh" }
    ]
  },
  {
    brand: "Sony",
    icon: "fa-solid fa-headphones",
    name: "Sony WH-1000XM5",
    desc: "Chống ồn đỉnh cao. Âm thanh đắm chìm.",
    price: "8.490.000",
    oldPrice: "9.990.000",
    image: "/giaodienkhachhang/banner/tainghe-1.png",
    features: [
      { icon: "fa-solid fa-volume-high", text: "Âm thanh Hi-Res" },
      { icon: "fa-solid fa-battery-three-quarters", text: "Pin 30 giờ" },
      { icon: "fa-solid fa-microphone", text: "Micro khử ồn" }
    ]
  },
  {
    brand: "Apple",
    icon: "fa-brands fa-apple",
    name: "MacBook Air M3",
    desc: "Mỏng nhẹ. Mạnh mẽ.",
    price: "24.990.000",
    oldPrice: "27.990.000",
    image: "/giaodienkhachhang/banner/macbook.png",
    features: [
      { icon: "fa-solid fa-laptop", text: "Thiết kế siêu mỏng" },
      { icon: "fa-solid fa-bolt", text: "Hiệu năng M3" },
      { icon: "fa-solid fa-battery-three-quarters", text: "Pin dài" }
    ]
  },
  {
    brand: "Sony",
    icon: "fa-solid fa-tv",
    name: "Sony Bravia TV 4K",
    desc: "Hình ảnh sắc nét. Trải nghiệm sống động.",
    price: "19.990.000",
    oldPrice: "22.990.000",
    image: "/giaodienkhachhang/banner/tivi.png",
    features: [
      { icon: "fa-solid fa-display", text: "4K HDR" },
      { icon: "fa-solid fa-volume-high", text: "Âm thanh vòm" },
      { icon: "fa-solid fa-wand-magic-sparkles", text: "Tối ưu AI" }
    ]
  }
];

const sidebarCategories = [
  { label: "Điện thoại & Tablet", icon: "fa-solid fa-mobile-screen" },
  { label: "Laptop & Phụ kiện", icon: "fa-solid fa-laptop" },
  { label: "Thiết bị điện tử", icon: "fa-solid fa-microchip" },
  { label: "Phụ kiện công nghệ", icon: "fa-solid fa-headphones" },
  { label: "Đồ gia dụng", icon: "fa-solid fa-blender" },
  { label: "Thời trang nam", icon: "fa-solid fa-shirt" },
  { label: "Thời trang nữ", icon: "fa-solid fa-person-dress" },
  { label: "Giày dép", icon: "fa-solid fa-shoe-prints" },
  { label: "Túi xách & Phụ kiện", icon: "fa-solid fa-bag-shopping" },
  { label: "Làm đẹp - Sức khỏe", icon: "fa-solid fa-sparkles" },
  { label: "Mẹ & Bé", icon: "fa-solid fa-baby-carriage" },
  { label: "Đồ chơi & Sách", icon: "fa-solid fa-puzzle-piece" }
];

const iconsCategories = [
  { label: "Điện thoại", image: "/giaodienkhachhang/icon/iphone-x.png" },
  { label: "Laptop", image: "/giaodienkhachhang/icon/analytics.png" },
  { label: "Tai nghe", image: "/giaodienkhachhang/icon/headphone.png" },
  { label: "Đồng hồ", image: "/giaodienkhachhang/icon/wristwatch.png" },
  { label: "Loa", image: "/giaodienkhachhang/icon/speaker.png" },
  { label: "Máy ảnh", image: "/giaodienkhachhang/icon/camera.png" },
  { label: "Bàn phím", image: "/giaodienkhachhang/icon/wired-keyboard.png" },
  { label: "Chuột", image: "/giaodienkhachhang/icon/computer.png" },
  { label: "Sạc dự phòng", image: "/giaodienkhachhang/icon/power-bank.png" },
  { label: "Xem thêm", image: "/giaodienkhachhang/icon/more.png" }
];

const fallbackFlashSaleProducts = [
  {
    id: 991,
    name: "Apple AirPods Pro 2 (USB-C)",
    slug: "apple-airpods-pro-2-usb-c",
    price: 5990000,
    old_price: 7490000,
    is_flash_sale: true,
    flash_sale_discount_percent: 20,
    product_images: [{ image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=200&q=80" }],
    categories: { name: "Tai nghe" }
  },
  {
    id: 992,
    name: "MacBook Air M2 13 inch 2024",
    slug: "macbook-air-m2-13-inch-2024",
    price: 21990000,
    old_price: 25990000,
    is_flash_sale: true,
    flash_sale_discount_percent: 15,
    product_images: [{ image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80" }],
    categories: { name: "Laptop" }
  },
  {
    id: 993,
    name: "Apple Watch Series 9 41mm GPS",
    slug: "apple-watch-series-9-41mm-gps",
    price: 8990000,
    old_price: 11990000,
    is_flash_sale: true,
    flash_sale_discount_percent: 25,
    product_images: [{ image_url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=200&q=80" }],
    categories: { name: "Đồng hồ" }
  },
  {
    id: 994,
    name: "Samsung Galaxy S24 Ultra 5G",
    slug: "samsung-galaxy-s24-ultra-5g",
    price: 26990000,
    old_price: 29990000,
    is_flash_sale: true,
    flash_sale_discount_percent: 10,
    product_images: [{ image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80" }],
    categories: { name: "Điện thoại" }
  },
  {
    id: 995,
    name: "Loa Bluetooth JBL Charge 5 Chính Hãng",
    slug: "loa-bluetooth-jbl-charge-5",
    price: 3490000,
    old_price: 3990000,
    is_flash_sale: true,
    flash_sale_discount_percent: 15,
    product_images: [{ image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=200&q=80" }],
    categories: { name: "Loa & Âm thanh" }
  }
];

const fallbackSuggestionsProducts = [
  {
    id: 981,
    name: "iPad Pro 11 inch M2 Wi-Fi 128GB",
    slug: "ipad-pro-11-inch-m2-wi-fi-128gb",
    price: 20490000,
    product_images: [{ image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=200&q=80" }],
    categories: { name: "Máy tính bảng" }
  },
  {
    id: 982,
    name: "Tai nghe Chụp Tai Sony WH-1000XM5",
    slug: "tai-nghe-chup-tai-sony-wh-1000xm5",
    price: 7990000,
    product_images: [{ image_url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=200&q=80" }],
    categories: { name: "Tai nghe" }
  },
  {
    id: 983,
    name: "Chuột Không Dây Logitech MX Master 3S",
    slug: "chuot-khong-day-logitech-mx-master-3s",
    price: 2490000,
    product_images: [{ image_url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=200&q=80" }],
    categories: { name: "Bàn phím & Chuột" }
  },
  {
    id: 984,
    name: "Bàn phím cơ Keychron K8 Pro QMK/VIA",
    slug: "ban-phim-co-keychron-k8-pro",
    price: 2390000,
    product_images: [{ image_url: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=200&q=80" }],
    categories: { name: "Bàn phím & Chuột" }
  },
  {
    id: 985,
    name: "Màn hình LG 27UP600-W 27\" IPS 4K HDR400",
    slug: "man-hinh-lg-27up600-w-27-ips-4k",
    price: 6890000,
    product_images: [{ image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=200&q=80" }],
    categories: { name: "Màn hình máy tính" }
  }
];

function getCategoryIcon(slug: string) {
  if (slug.includes("dien-thoai")) return { type: "icon", value: "fa-solid fa-mobile-screen" };
  if (slug.includes("laptop")) return { type: "icon", value: "fa-solid fa-laptop" };
  if (slug.includes("tai-nghe")) return { type: "icon", value: "fa-solid fa-headphones" };
  if (slug.includes("dong-ho")) return { type: "image", value: "/icontrangchu/smart-watch.png" };
  if (slug.includes("phu-kien")) return { type: "image", value: "/icontrangchu/3d-print.png" };
  if (slug.includes("may-tinh-bang")) return { type: "icon", value: "fa-solid fa-tablet-screen-button" };
  if (slug.includes("man-hinh-may-tinh")) return { type: "icon", value: "fa-solid fa-desktop" };
  if (slug.includes("ban-phim-chuot")) return { type: "icon", value: "fa-solid fa-keyboard" };
  if (slug.includes("loa-am-thanh")) return { type: "icon", value: "fa-solid fa-volume-high" };
  if (slug.includes("nha-thong-minh")) return { type: "icon", value: "fa-solid fa-house-laptop" };
  if (slug.includes("may-anh")) return { type: "icon", value: "fa-solid fa-camera" };
  if (slug.includes("thiet-bi-luu-tru")) return { type: "icon", value: "fa-solid fa-database" };
  return { type: "icon", value: "fa-solid fa-microchip" };
}

const slideSlugMap: Record<string, string> = {
  "iPhone 15 Pro Max": "iphone-15-pro-max",
  "Galaxy S24 Ultra": "samsung-galaxy-s24-ultra",
  "Sony WH-1000XM5": "sony-wh-1000xm5",
  "MacBook Air M3": "macbook-air-m3",
  "Sony Bravia TV 4K": "sony-bravia-tv-4k"
};

export function CustomerHomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);
  const [suggestionsProducts, setSuggestionsProducts] = useState<any[]>([]);
  const [flashSaleLoading, setFlashSaleLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [activeSale, setActiveSale] = useState<any | null>(null);
  const [visibleSuggestions, setVisibleSuggestions] = useState(10);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, toggleWishlist, isInWishlist, openAuthModal, user } = useApp();

  // Load dynamic data from APIs progressively
  useEffect(() => {
    // Fetch categories
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error categories:", err))
      .finally(() => setCategoriesLoading(false));

    // Fetch flash sale products (exactly 5 products selected from admin)
    setFlashSaleLoading(true);
    fetch("/api/products?flash_sale=true")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((prodData) => {
        const items = prodData.items || [];
        setFlashSaleProducts(items.slice(0, 5));
      })
      .catch((err) => console.error("Error fetching homepage flash sale products:", err))
      .finally(() => setFlashSaleLoading(false));

    // Fetch active sale for countdown timer
    fetch("/api/flashsales")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((fsData) => {
        const foundActive = fsData.sales?.find((s: any) => {
          const now = new Date().getTime();
          const start = new Date(s.start_at).getTime();
          const end = new Date(s.end_at).getTime();
          return s.status === "active" && now >= start && now <= end;
        }) || fsData.sales?.[0];
        if (foundActive) {
          setActiveSale(foundActive);
        }
      })
      .catch((err) => console.error("Error loading flash sale active timer:", err));

    // Fetch products
    setSuggestionsLoading(true);
    fetch("/api/products?featured=true")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((suggestData) => {
        if (suggestData.items && suggestData.items.length > 0) {
          setSuggestionsProducts(suggestData.items);
        }
      })
      .catch((err) => console.error("Error suggest products:", err))
      .finally(() => {
        setSuggestionsLoading(false);
        setLoading(false);
      });

    // Fetch news
    fetch("/api/news")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((newsData) => {
        if (Array.isArray(newsData) && newsData.length > 0) {
          setNewsArticles(newsData);
        }
      })
      .catch((err) => console.error("Error news:", err));

    // Fetch reviews
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((reviewsData) => {
        if (Array.isArray(reviewsData) && reviewsData.length > 0) {
          setDbReviews(reviewsData);
        }
      })
      .catch((err) => console.error("Error reviews:", err));
  }, []);

  const addDbProductToCart = (product: any) => {
    const price = Number(product.price);
    const originalPrice = product.old_price ? Number(product.old_price) : price;
    addToCart({
      id: Number(product.id),
      name: product.name,
      category: product.categories?.name || "Sản phẩm",
      variant: "Mặc định",
      price,
      originalPrice,
      image: product.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png",
    });
  };

  const handleDbWishlist = (product: any) => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    const price = Number(product.price);
    const originalPrice = product.old_price ? Number(product.old_price) : price;
    toggleWishlist({
      id: Number(product.id),
      name: product.name,
      category: product.categories?.name || "Sản phẩm",
      price,
      originalPrice,
      image: product.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png",
      rating: 5,
      reviews: 99,
    });
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "đ";
  };

  const maskName = (name: string) => {
    if (!name) return "K***";
    const clean = name.trim();
    if (clean.length <= 2) return clean.charAt(0) + "*";
    return clean.charAt(0) + "*".repeat(clean.length - 2) + clean.charAt(clean.length - 1);
  };

  const getCategoryIdBySlug = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    return cat ? cat.id : null;
  };

  // Slide loop
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(slideTimer);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!activeSale) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
          if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
          return { hours: 12, minutes: 45, seconds: 30 };
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(activeSale.end_at).getTime();
      const diff = end - now;
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSale]);

  const slide = slides[currentSlide];
  const slideSlug = slideSlugMap[slide.name] || "iphone-15-pro-max";

  const categoriesToRender = categories.length > 0 ? categories : [
    { id: "1", name: "Điện thoại", slug: "dien-thoai" },
    { id: "2", name: "Laptop", slug: "laptop" },
    { id: "3", name: "Tai nghe", slug: "tai-nghe" },
    { id: "4", name: "Đồng hồ", slug: "dong-ho" },
    { id: "5", name: "Phụ kiện", slug: "phu-kien" },
  ];

  return (
    <CustomerShell>
      <div className="max-w-[1280px] mx-auto px-4 py-5">
        <div className="flex gap-5 items-stretch">
          {/* Sidebar */}
          <aside className="w-[240px] shrink-0 bg-white border border-t-0 border-gray-200 rounded-b-xl overflow-hidden flex flex-col justify-between min-h-[300px]">
            {categoriesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2.5 flex-grow">
                <i className="fa-solid fa-circle-notch fa-spin text-brand-purple text-[22px]"></i>
                <span className="text-[12px] font-medium text-gray-500 tracking-wide animate-pulse">Đang tải danh mục...</span>
              </div>
            ) : (
              <ul className="text-[13px] text-gray-700 divide-y divide-gray-50 w-full">
                {categoriesToRender.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/sanpham?category=${cat.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-purple-50 hover:text-brand-purple cursor-pointer group">
                      <span className="flex items-center gap-3">
                        {(() => {
                          if (cat.icon && (cat.icon.startsWith("/") || cat.icon.startsWith("http"))) {
                            return (
                              <img
                                src={cat.icon}
                                className="w-4 h-4 object-contain opacity-60 group-hover:opacity-100 transition-all text-center"
                                alt={cat.name}
                              />
                            );
                          }
                          const iconConfig = getCategoryIcon(cat.slug);
                          return iconConfig.type === "image" ? (
                            <img
                              src={iconConfig.value}
                              className="w-4 h-4 object-contain opacity-60 group-hover:opacity-100 transition-all text-center"
                              alt={cat.name}
                            />
                          ) : (
                            <i className={`${iconConfig.value} text-gray-400 group-hover:text-brand-purple w-4 text-center`}></i>
                          );
                        })()}
                        {cat.name}
                      </span>
                      <i className="fa-solid fa-chevron-right text-[10px] text-gray-300 group-hover:text-brand-purple"></i>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Hero Banner Carousel */}
          <section id="hero-banner" className="flex-grow bg-gradient-to-br from-[#e8ecfc] to-[#e1e6f9] rounded-xl overflow-hidden flex relative p-10 items-center justify-between border border-blue-100 min-h-[420px]">
            <div className="max-w-[48%] z-10 pl-6">
              <div className="flex items-center gap-1.5 text-gray-800 font-semibold text-[15px] mb-1">
                <i className={`${slide.icon} text-[18px]`}></i>
                <span>{slide.brand}</span>
              </div>
              <h1 className="text-[38px] font-extrabold text-gray-900 leading-tight tracking-tight mb-2">
                {slide.name}
              </h1>
              <p className="text-[16px] text-gray-600 font-medium mb-4">
                {slide.desc}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6 text-[13px]">
                {slide.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <i className={`${f.icon} text-brand-purple`}></i>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Link href={`/chitietsanpham?slug=${slideSlug}`} className="bg-brand-purple text-white px-6 py-2.5 rounded-lg text-[13px] font-bold tracking-wide shadow-md shadow-purple-200 hover:opacity-90">
                  MUA NGAY
                </Link>
                <div>
                  <span className="text-gray-400 line-through text-[15px]">{slide.oldPrice}</span>
                  <div className="text-[20px] font-extrabold text-red-600 flex items-start">
                    <span>{slide.price}</span>
                    <span className="text-[14px] font-bold underline ml-0.5">đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Image */}
            <div className="w-[45%] h-[320px] flex items-center justify-center relative pr-6">
              <img
                src={slide.image}
                className="max-h-full object-contain drop-shadow-2xl transition-all duration-700"
                alt={slide.name}
              />
            </div>

            {/* Navigation arrows */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white hover:bg-brand-purple hover:text-white rounded-full flex items-center justify-center shadow-lg text-gray-600 text-sm transition-all border border-gray-100 z-20"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white hover:bg-brand-purple hover:text-white rounded-full flex items-center justify-center shadow-lg text-gray-600 text-sm transition-all border border-gray-100 z-20"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
              {slides.map((_, i) => (
                <span
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${i === currentSlide ? "bg-brand-purple scale-125" : "bg-gray-300"
                    }`}
                ></span>
              ))}
            </div>
          </section>
        </div>

        {/* Categories Icons */}
        <section className="mb-6 mt-6 bg-white p-5 rounded-xl border border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 text-center text-[12px] font-medium text-gray-700">
            {iconsCategories.map((category) => {
              const catSlug = category.label === "Điện thoại" ? "dien-thoai"
                : category.label === "Laptop" ? "laptop"
                : category.label === "Tai nghe" ? "tai-nghe"
                : category.label === "Đồng hồ" ? "dong-ho"
                : category.label === "Loa" ? "loa-am-thanh"
                : category.label === "Máy ảnh" ? "may-anh"
                : category.label === "Bàn phím" ? "ban-phim-chuot"
                : category.label === "Chuột" ? "ban-phim-chuot"
                : category.label === "Sạc dự phòng" ? "phu-kien"
                : "";
              const catId = catSlug ? getCategoryIdBySlug(catSlug) : null;
              const linkUrl = catId ? `/sanpham?category=${catId}` : "/sanpham";

              return (
                <Link href={linkUrl} key={category.label} className="cursor-pointer group flex flex-col items-center">
                  <div className="w-12 h-12 bg-circle-gray rounded-full flex items-center justify-center mb-1.5 group-hover:bg-brand-purple group-hover:text-white transition-all overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.label}
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                  <p className="text-gray-600 group-hover:text-brand-purple">{category.label}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Flash Sale Section */}
        <section className="flex gap-4 items-stretch mb-5">
          <div className="w-[240px] bg-gradient-to-b from-[#6b42f4] to-[#451ece] rounded-xl p-5 text-white flex flex-col justify-between shrink-0">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <i className="fa-solid fa-bolt text-yellow-400 text-[20px]"></i>
                <h2 className="text-[20px] font-black tracking-wide italic">FLASH SALE</h2>
              </div>
              <p className="text-[12px] opacity-90 italic mb-5">
                Ưu đãi chớp nhoáng<br />Giá tốt mỗi ngày
              </p>
              <div className="flex justify-center items-center space-x-1.5">
                <div className="bg-white text-brand-purple w-11 py-1 rounded-md font-extrabold text-center">
                  <div className="text-[15px]">{String(timeLeft.hours).padStart(2, "0")}</div>
                  <div className="text-[7px] text-gray-400 uppercase -mt-0.5">Giờ</div>
                </div>
                <div className="font-bold text-white text-[14px]">:</div>
                <div className="bg-white text-brand-purple w-11 py-1 rounded-md font-extrabold text-center">
                  <div className="text-[15px]">{String(timeLeft.minutes).padStart(2, "0")}</div>
                  <div className="text-[7px] text-gray-400 uppercase -mt-0.5">Phút</div>
                </div>
                <div className="font-bold text-white text-[14px]">:</div>
                <div className="bg-white text-brand-purple w-11 py-1 rounded-md font-extrabold text-center">
                  <div className="text-[15px]">{String(timeLeft.seconds).padStart(2, "0")}</div>
                  <div className="text-[7px] text-gray-400 uppercase -mt-0.5">Giây</div>
                </div>
              </div>
            </div>
            <Link href="/flashsale" className="bg-white/10 hover:bg-white/20 py-2 rounded-lg text-[12px] font-bold border border-white/20 uppercase text-center transition-all tracking-wider mt-6 block">
              Xem tất cả
            </Link>
          </div>

          <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 relative">
            {flashSaleLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={`fs-skeleton-${idx}`}
                  className="bg-white p-3 rounded-xl border border-gray-200 animate-pulse flex flex-col justify-between h-[230px]"
                >
                  <div>
                    <div className="w-full h-[120px] bg-gray-100 rounded-lg mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="mt-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : flashSaleProducts.length > 0 ? (
              flashSaleProducts.slice(0, 5).map((product, idx) => {
                let displayPrice = Number(product.price);
                let displayOldPrice = 0;
                let discount = "";

                if (product.is_flash_sale && product.flash_sale_discount_percent) {
                  displayOldPrice = displayPrice;
                  displayPrice = displayPrice * (1 - product.flash_sale_discount_percent / 100);
                  discount = `-${product.flash_sale_discount_percent}%`;
                }
                const imgUrl = product.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png";

                return (
                  <div
                    key={product.id}
                    className="bg-white p-3 rounded-xl border border-gray-200 relative flex flex-col justify-between hover:shadow-md transition-shadow group"
                  >
                    <div>
                      {discount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold z-10">
                          {discount}
                        </span>
                      )}
                      <button
                        onClick={() => handleDbWishlist(product)}
                        className={`absolute top-2 right-2 z-10 transition-colors ${
                          isInWishlist(Number(product.id)) ? "text-red-500" : "text-gray-300 hover:text-red-500"
                        }`}
                      >
                        <i className={`${isInWishlist(Number(product.id)) ? "fa-solid" : "fa-regular"} fa-heart text-[15px]`}></i>
                      </button>
                      <Link href={`/chitietsanpham?slug=${product.slug}`} className="h-[120px] mb-2 flex items-center justify-center block">
                        <img alt={product.name} className="max-h-full object-contain" src={imgUrl} />
                      </Link>
                      <h4 className="text-[12px] font-semibold text-gray-800 line-clamp-2 mb-1">
                        <Link href={`/chitietsanpham?slug=${product.slug}`} className="hover:text-[#4f22d6]">{product.name}</Link>
                      </h4>
                    </div>
                    <div>
                      <p className="text-[#4f22d6] font-extrabold text-[13px]">{formatCurrency(displayPrice)}</p>
                      {displayOldPrice > 0 && <p className="text-[10px] text-gray-400 line-through">{formatCurrency(displayOldPrice)}</p>}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                        <div className="flex text-amber-400 text-[9px] gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className="fa-solid fa-star"></i>
                          ))}
                          <span className="text-gray-400 text-[9px] ml-0.5">(99)</span>
                        </div>
                        <button
                          onClick={() => addDbProductToCart(product)}
                          className="bg-[#4f22d6] text-white w-6 h-6 rounded-md flex items-center justify-center hover:opacity-90 active:scale-90 transition-all"
                        >
                          <i className="fa-solid fa-cart-plus text-[11px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100 w-full">
                <i className="fa-solid fa-box-open text-[24px] mb-2 text-gray-300"></i>
                <span className="text-[12px]">Không có sản phẩm khuyến mãi</span>
              </div>
            )}
          </div>
        </section>

        {/* Commitments Section */}
        <section className="mb-8 mt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center shrink-0">
                <i className="fa-solid fa-truck-fast text-lg"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-[13px]">Giao hàng siêu tốc</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Miễn phí toàn quốc từ 500k</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center shrink-0">
                <i className="fa-solid fa-shield-halved text-lg"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-[13px]">Chính hãng 100%</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Đền gấp 10 nếu phát hiện giả</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center shrink-0">
                <i className="fa-solid fa-rotate-left text-lg"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-[13px]">Đổi trả miễn phí</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Thời gian đổi trả lên tới 30 ngày</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center shrink-0">
                <i className="fa-solid fa-headset text-lg"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-[13px]">Hỗ trợ 24/7</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Tư vấn kỹ thuật chuyên nghiệp</p>
              </div>
            </div>
          </div>
        </section>

        {/* Promo banners */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Banner 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-800 text-white p-6 md:p-8 flex flex-col justify-between h-[200px] shadow-md hover:shadow-lg transition-all group">
            {/* Background elements */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=300&h=200&q=80"
                alt=""
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-2 relative z-10">
              <span className="bg-red-500/90 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider inline-block">
                Ưu đãi độc quyền
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold leading-tight max-w-[280px]">
                Giảm tới 40% Phụ kiện chính hãng
              </h3>
              <p className="text-xs text-white/80 max-w-[240px]">
                Bảo vệ toàn diện cho flagship của bạn
              </p>
            </div>
            
            <div className="relative z-10">
              <Link
                href="/sanpham"
                className="inline-flex items-center gap-1.5 bg-white text-brand-purple hover:bg-purple-50 px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <span>Mua ngay</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>

          {/* Banner 2 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white p-6 md:p-8 flex flex-col justify-between h-[200px] shadow-md hover:shadow-lg transition-all group">
            {/* Background elements */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=300&h=200&q=80"
                alt=""
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-2 relative z-10">
              <span className="bg-white/20 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider inline-block">
                Hỗ trợ tài chính
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold leading-tight max-w-[280px]">
                Trả góp 0% Lãi suất
              </h3>
              <p className="text-xs text-white/80 max-w-[240px]">
                Sở hữu siêu phẩm công nghệ dễ dàng hơn bao giờ hết
              </p>
            </div>

            <div className="relative z-10">
              <Link
                href="/sanpham"
                className="inline-flex items-center gap-1.5 bg-white text-red-600 hover:bg-amber-50 px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <span>Tìm hiểu ngay</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* Suggestions section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 bg-white px-4 py-3 rounded-xl border border-gray-200">
            <h2 className="text-[18px] font-bold text-gray-800 uppercase tracking-wide">Gợi ý cho bạn</h2>
            <Link href="/sanpham" className="text-brand-purple text-[13px] font-medium hover:underline flex items-center gap-1">
              Xem thêm <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {suggestionsLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={`suggest-skeleton-${idx}`}
                  className="bg-white p-3 rounded-xl border border-gray-200 animate-pulse flex flex-col justify-between h-[250px]"
                >
                  <div>
                    <div className="w-full h-[140px] bg-gray-100 rounded-lg mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="mt-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : suggestionsProducts.length > 0 ? (
              suggestionsProducts.slice(0, visibleSuggestions).map((product, idx) => {
                const price = Number(product.price);
                const imgUrl = product.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png";

                return (
                  <div
                    key={product.id}
                    className="bg-white p-3 rounded-xl border border-gray-200 relative flex flex-col justify-between hover:shadow-md transition-shadow group animate-fadeIn"
                  >
                    <div>
                      <button
                        onClick={() => handleDbWishlist(product)}
                        className={`absolute top-2 right-2 z-10 transition-colors ${
                          isInWishlist(Number(product.id)) ? "text-red-500" : "text-gray-300 hover:text-red-500"
                        }`}
                      >
                        <i className={`${isInWishlist(Number(product.id)) ? "fa-solid" : "fa-regular"} fa-heart text-[15px]`}></i>
                      </button>
                      <Link href={`/chitietsanpham?slug=${product.slug}`} className="h-[140px] mb-2 flex items-center justify-center p-2 block">
                        <img alt={product.name} className="max-h-full object-contain mix-blend-multiply" src={imgUrl} />
                      </Link>
                      <h4 className="text-[12px] font-semibold text-gray-800 line-clamp-2 mb-1">
                        <Link href={`/chitietsanpham?slug=${product.slug}`} className="hover:text-[#4f22d6]">{product.name}</Link>
                      </h4>
                    </div>
                    <div className="mt-2">
                      <p className="text-[#4f22d6] font-extrabold text-[13px]">{formatCurrency(price)}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <div className="flex text-amber-400 text-[9px] gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className="fa-solid fa-star"></i>
                          ))}
                          <span className="text-gray-400 text-[9px] ml-0.5">(88)</span>
                        </div>
                        <button
                          onClick={() => addDbProductToCart(product)}
                          className="bg-gray-100 text-gray-600 hover:bg-[#4f22d6] hover:text-white w-6 h-6 rounded-md flex items-center justify-center transition-colors active:scale-90"
                        >
                          <i className="fa-solid fa-cart-plus text-[11px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100 w-full">
                <i className="fa-solid fa-box-open text-[24px] mb-2 text-gray-300"></i>
                <span className="text-[12px]">Không có sản phẩm gợi ý</span>
              </div>
            )}
          </div>

          {/* Load More Suggestions Trigger */}
          {visibleSuggestions < suggestionsProducts.length && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setVisibleSuggestions(prev => prev + 10)}
                className="bg-white border border-brand-purple text-brand-purple px-10 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-purple-50 transition-colors cursor-pointer"
              >
                Xem thêm sản phẩm gợi ý
              </button>
            </div>
          )}
        </section>

        {/* Shopping Trends */}
        <section className="mb-8">
          <h3 className="font-bold text-gray-800 text-[14px] uppercase tracking-wider mb-5 flex items-center gap-2">
            <i className="fa-solid fa-compass text-brand-purple"></i> XU HƯỚNG MUA SẮM 2026
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Gaming Flagship", desc: "Hiệu năng cực đỉnh, chiến game mượt mà", bg: "from-blue-600 to-cyan-500", icon: "fa-gamepad" },
              { title: "Camera Phone 8K", desc: "Bắt trọn từng khoảnh khắc siêu sắc nét", bg: "from-pink-600 to-rose-400", icon: "fa-camera" },
              { title: "Văn phòng & Đồ họa", desc: "Mỏng nhẹ sang trọng, xử lý mượt mà", bg: "from-amber-500 to-orange-400", icon: "fa-laptop-code" },
              { title: "Smartwatch Thể thao", desc: "Theo dõi sức khỏe, đo nhịp tim thông minh", bg: "from-emerald-600 to-teal-400", icon: "fa-heart-pulse" }
            ].map((trend, index) => (
              <div key={index} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${trend.bg} text-white p-5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer`}>
                <div className="absolute right-3 bottom-3 text-white/10 text-6xl transform group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                  <i className={`fa-solid ${trend.icon}`}></i>
                </div>
                <h4 className="font-bold text-[15px] mb-1">{trend.title}</h4>
                <p className="text-[11px] text-white/80 max-w-[160px] leading-relaxed">{trend.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Brands */}
        <section className="mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 text-[14px] uppercase tracking-wider mb-5 flex items-center gap-2">
              <i className="fa-solid fa-award text-brand-purple"></i> THƯƠNG HIỆU NỔI BẬT
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { name: "Apple", desc: "Đỉnh cao đẳng cấp" },
                { name: "Samsung", desc: "Đột phá công nghệ" },
                { name: "Xiaomi", desc: "Giá trị vượt trội" },
                { name: "Sony", desc: "Chất âm đỉnh cao" },
                { name: "Oppo", desc: "Chuyên gia selfie" },
                { name: "Vivo", desc: "Thiết kế năng động" }
              ].map((brand) => (
                <Link
                  key={brand.name}
                  href={`/sanpham?search=${brand.name}`}
                  className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl hover:border-brand-purple hover:shadow-sm transition-all group cursor-pointer"
                >
                  <div className="h-8 flex items-center justify-center mb-2 transform group-hover:scale-105 transition-transform">
                    <span className="font-extrabold text-[15px] tracking-tight text-gray-400 group-hover:text-brand-purple transition-colors">
                      {brand.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-brand-purple/80 text-center font-medium leading-none">{brand.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Tech News */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 bg-white px-4 py-3 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-800 text-[14px] uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-newspaper text-brand-purple"></i> TIN TỨC CÔNG NGHỆ NỔI BẬT
            </h3>
            <Link href="/quanlytintuc" className="text-brand-purple text-[13px] font-medium hover:underline flex items-center gap-1">
              Xem tất cả <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(newsArticles.length > 0 ? newsArticles.slice(0, 3) : [
              {
                title: "Đánh giá iPhone 17 Pro Max: Có đáng để nâng cấp không?",
                created_at: new Date().toISOString(),
                excerpt: "Cùng đi sâu vào phân tích camera ẩn dưới màn hình mới nhất và chip A20 Bionic siêu mạnh mẽ trên siêu phẩm iPhone 17 năm nay...",
                image_url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&h=250&q=80"
              },
              {
                title: "Top 5 mẹo tiết kiệm battery tối đa cho Samsung Galaxy S24 Ultra",
                created_at: new Date().toISOString(),
                excerpt: "Khám phá các cài đặt ẩn vô cùng hiệu quả giúp kéo dài thời gian sử dụng pin trên dòng điện thoại cao cấp S24 Ultra của bạn...",
                image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&h=250&q=80"
              },
              {
                title: "Hướng dẫn lựa chọn tai nghe chống ồn tốt nhất năm 2026",
                created_at: new Date().toISOString(),
                excerpt: "So sánh chi tiết khả năng khử ồn ANC giữa Sony WH-1000XM5, Bose QuietComfort và Apple AirPods Max trong môi trường văn phòng ồn ào...",
                image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=250&q=80"
              }
            ]).map((post, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                <div>
                  <div className="h-44 overflow-hidden relative bg-gray-50 flex items-center justify-center">
                    <img
                      src={post.thumbnail_url || post.image_url || "/giaodienkhachhang/icon/ip-1.png"}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-brand-purple text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Tin tức
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] text-gray-400 font-semibold block">
                      {new Date(post.created_at || post.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <h4 className="font-bold text-[14px] text-gray-800 line-clamp-2 leading-tight hover:text-brand-purple transition-colors">
                      <Link href={`/tintuc?slug=${post.slug}`}>{post.title}</Link>
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{post.excerpt || "Đang cập nhật..."}</p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <Link href={`/tintuc?slug=${post.slug}`} className="text-brand-purple text-[11px] font-bold hover:text-purple-700 inline-flex items-center gap-1">
                    Đọc tiếp <i className="fa-solid fa-arrow-right-long"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-8">
          <h3 className="font-bold text-gray-800 text-[14px] uppercase tracking-wider mb-5 flex items-center gap-2">
            <i className="fa-solid fa-comments text-brand-purple"></i> KHÁCH HÀNG NÓI GÌ VỀ SHOPNOW
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(dbReviews.length > 0 ? dbReviews.slice(0, 3) : [
              {
                userName: "Nguyễn Văn T***",
                rating: 5,
                comment: "Rất hài lòng với dịch vụ giao hàng nhanh của shop. Đặt mua iPhone 17 lúc sáng mà chiều đã nhận được hàng nguyên seal, nhân viên tư vấn nhiệt tình.",
                location: "Hà Nội"
              },
              {
                userName: "Trần Thị H***",
                rating: 5,
                comment: "Mình đã mua trả góp 0% tại đây, thủ tục cực kỳ nhanh chóng và không phát sinh bất kỳ khoản phí ẩn nào. Chất lượng sản phẩm chính hãng, đầy đủ hóa đơn.",
                location: "TP. Hồ Chí Minh"
              },
              {
                userName: "Lê Minh Q***",
                rating: 5,
                comment: "Chính sách bảo hành 30 ngày đổi trả miễn phí rất tuyệt vời. Tai nghe Sony mình bị lỗi nhỏ được đổi ngay bộ mới không làm khó khách hàng. Sẽ ủng hộ lâu dài.",
                location: "Đà Nẵng"
              }
            ]).map((t, idx) => {
              const displayName = t.location ? t.userName : maskName(t.userName || "Khách hàng");
              const displayLocation = t.location || "Việt Nam";
              const userAvatar = t.userAvatar || "";

              return (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
                  <span className="absolute top-4 right-5 text-gray-100 text-5xl font-serif pointer-events-none select-none">“</span>
                  <div>
                    <div className="flex text-amber-400 text-[10px] gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <i key={i} className="fa-solid fa-star"></i>
                      ))}
                    </div>
                    <p className="text-[12px] text-gray-600 italic leading-relaxed mb-4">"{t.comment}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-brand-purple text-xs overflow-hidden shrink-0">
                      {userAvatar ? (
                        <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-[12px] text-gray-800">{displayName}</h5>
                      <span className="text-[9px] text-gray-400">
                        {displayLocation} • {t.productName ? `Đã mua ${t.productName}` : "Đã mua hàng"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQs Section */}
        <section className="mb-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 text-[14px] uppercase tracking-wider mb-5 flex items-center gap-2">
            <i className="fa-solid fa-circle-question text-brand-purple"></i> CÂU HỎI THƯỜNG GẶP (FAQ)
          </h3>
          <div className="space-y-3.5">
            {[
              {
                q: "ShopNow cam kết chất lượng sản phẩm như thế nào?",
                a: "Toàn bộ điện thoại, laptop, phụ kiện bán ra tại ShopNow đều là hàng chính hãng 100%, nguyên seal, đầy đủ hóa đơn chứng từ. Nếu phát hiện sản phẩm giả hoặc nhái, chúng tôi cam kết hoàn tiền gấp 10 lần giá trị sản phẩm."
              },
              {
                q: "Chương trình trả góp 0% lãi suất được thực hiện ra sao?",
                a: "ShopNow liên kết với hơn 20 ngân hàng lớn để hỗ trợ trả góp 0% qua thẻ tín dụng. Thủ tục duyệt hồ sơ online cực nhanh, không giữ giấy tờ và không phát sinh phụ phí bảo hiểm, phụ phí dịch vụ ẩn."
              },
              {
                q: "Thời gian giao hàng và chính sách vận chuyển như thế nào?",
                a: "Chúng tôi miễn phí giao hàng trên toàn quốc cho đơn hàng từ 500.000đ trở lên. Đối với khu vực nội thành Hà Nội và TP. Hồ Chí Minh, ShopNow hỗ trợ giao hàng hỏa tốc trong vòng 2 - 4 giờ."
              },
              {
                q: "Sản phẩm được áp dụng chính sách bảo hành, đổi trả như thế nào?",
                a: "Trong vòng 30 ngày kể từ khi mua hàng, nếu sản phẩm gặp lỗi từ nhà sản xuất, khách hàng được đổi mới 1-đổi-1 hoàn toàn miễn phí. Các sản phẩm sau đó được bảo hành chính hãng từ 12 - 24 tháng theo đúng tiêu chuẩn của nhà sản xuất."
              }
            ].map((faq, idx) => {
              const isOpen = faqOpenIdx === idx;
              return (
                <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFaqOpenIdx(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center p-4 bg-gray-50/50 hover:bg-purple-50/30 text-left transition-colors outline-none"
                  >
                    <span className="font-bold text-[13px] text-gray-800">{faq.q}</span>
                    <span className={`material-symbols-outlined text-[18px] text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-40 border-t border-gray-50 p-4" : "max-h-0 overflow-hidden"
                    }`}
                  >
                    <p className="text-[12px] text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mb-6 bg-gradient-to-r from-brand-purple via-[#5f33e0] to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-md">
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold mb-1">Đăng ký nhận bản tin khuyến mãi</h3>
              <p className="text-xs text-white/80">Nhận ngay Voucher 100k cho khách hàng mới và nhiều ưu đãi bí mật hàng tuần</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              alert("✓ Đăng ký thành công! Cảm ơn bạn đã quan tâm đến ShopNow.");
              (e.target as HTMLFormElement).reset();
            }} className="flex w-full md:w-auto max-w-md shrink-0">
              <input
                required
                type="email"
                placeholder="Nhập địa chỉ email của bạn..."
                className="flex-grow px-4 py-3 rounded-l-xl text-gray-800 text-[13px] outline-none w-full md:w-64 border-none"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-r-xl text-[13px] whitespace-nowrap transition-colors active:scale-[0.98]"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </section>
      </div>
    </CustomerShell>
  );
}