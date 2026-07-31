import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./products";

type CartItem = { slug: string; qty: number };

type Store = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (slug: string, qty?: number) => void;
  removeFromCart: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  toggleWishlist: (slug: string) => void;
  inWishlist: (slug: string) => boolean;
  cartCount: number;
  wishlistCount: number;
};

const StoreCtx = createContext<Store | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(read<CartItem[]>("sk_cart", []));
    setWishlist(read<string[]>("sk_wish", []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("sk_cart", JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem("sk_wish", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const value = useMemo<Store>(
    () => ({
      cart,
      wishlist,
      addToCart: (slug, qty = 1) =>
        setCart((c) => {
          const ex = c.find((i) => i.slug === slug);
          return ex
            ? c.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i))
            : [...c, { slug, qty }];
        }),
      removeFromCart: (slug) => setCart((c) => c.filter((i) => i.slug !== slug)),
      setQty: (slug, qty) =>
        setCart((c) =>
          qty <= 0 ? c.filter((i) => i.slug !== slug) : c.map((i) => (i.slug === slug ? { ...i, qty } : i)),
        ),
      toggleWishlist: (slug) =>
        setWishlist((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug])),
      inWishlist: (slug) => wishlist.includes(slug),
      cartCount: cart.reduce((n, i) => n + i.qty, 0),
      wishlistCount: wishlist.length,
    }),
    [cart, wishlist],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
};

export const cartTotal = (cart: CartItem[], resolve: (slug: string) => Product | undefined) =>
  cart.reduce((s, i) => s + (resolve(i.slug)?.price ?? 0) * i.qty, 0);
