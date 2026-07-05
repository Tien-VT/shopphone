"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/* ────────────────── Types ────────────────── */
export type CartItem = {
  id: number;
  name: string;
  category: string;
  variant: string;
  price: number;
  originalPrice: number;
  qty: number;
  image: string;
};

export type WishlistItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
};

export type User = {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  loyaltyTier?: string;
  avatar?: string;
};

type AppContextType = {
  // Auth Modal
  authModalOpen: boolean;
  authModalTab: "login" | "signup";
  openAuthModal: (tab?: "login" | "signup") => void;
  closeAuthModal: () => void;

  // Auth State
  user: User | null;
  login: (user: User) => void;
  logout: () => void;

  // Cart
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: number) => void;
  updateCartQty: (id: number, qty: number) => void;
  clearCart: () => void;

  // Wishlist
  wishlist: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  toggleWishlist: (item: WishlistItem) => void;

  // Toast
  toast: string | null;
  showToast: (message: string) => void;

  // Admin Search
  adminSearch: string;
  setAdminSearch: (val: string) => void;
};

/* ────────────────── Context ────────────────── */
const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth Modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");

  // User
  const [user, setUser] = useState<User | null>(null);

  // Cart and hydration safety
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // Wishlist
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Admin Search
  const [adminSearch, setAdminSearch] = useState("");

  // Load session and cart on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.warn("Error loading session:", err));

    // Load cart from localStorage
    try {
      const saved = localStorage.getItem("shopnow_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading cart:", e);
    }
    setIsCartLoaded(true);
  }, []);

  // Persist cart to localStorage whenever it changes (only after loaded)
  useEffect(() => {
    if (isCartLoaded && typeof window !== "undefined") {
      localStorage.setItem("shopnow_cart", JSON.stringify(cart));
    }
  }, [cart, isCartLoaded]);

  /* ── Auth Modal ── */
  const openAuthModal = useCallback((tab: "login" | "signup" = "login") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  /* ── Auth ── */
  const login = useCallback((userData: User) => {
    setUser(userData);
    setAuthModalOpen(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    window.location.href = "/trangchu";
  }, []);

  /* ── Toast ── */
  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ── Cart ── */
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const addToCart = useCallback((item: Omit<CartItem, "qty">) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
    showToast(`✓ Đã thêm vào giỏ hàng!`);
  }, [showToast]);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCartQty = useCallback((id: number, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty } : c))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("shopnow_cart");
    }
  }, []);

  /* ── Wishlist ── */
  const wishlistCount = wishlist.length;

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.find((w) => w.id === item.id)) return prev;
      return [...prev, item];
    });
    showToast(`♡ Đã thêm vào yêu thích!`);
  }, [showToast]);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const isInWishlist = useCallback(
    (id: number) => wishlist.some((w) => w.id === id),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (item: WishlistItem) => {
      if (isInWishlist(item.id)) {
        removeFromWishlist(item.id);
        showToast("Đã xóa khỏi yêu thích");
      } else {
        addToWishlist(item);
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist, showToast]
  );

  return (
    <AppContext.Provider
      value={{
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        user,
        login,
        logout,
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        wishlist,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        toast,
        showToast,
        adminSearch,
        setAdminSearch,
      }}
    >
      {children}

      {/* Global Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 bg-gray-900 text-white rounded-full shadow-2xl text-[14px] font-medium transition-all animate-bounce whitespace-nowrap">
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
