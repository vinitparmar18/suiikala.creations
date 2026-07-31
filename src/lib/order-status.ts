export const STATUS_ORDER = [
  "order_placed",
  "payment_confirmed",
  "preparing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  order_placed: "Order Placed",
  payment_confirmed: "Payment Confirmed",
  preparing: "Preparing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};
