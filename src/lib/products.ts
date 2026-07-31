// Compatibility shim — real catalog lives in "@/lib/catalog".
// Only static bits remain here: the currency formatter.
export type { Product } from "./catalog";
export { PLACEHOLDER_IMG } from "./catalog";


export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
