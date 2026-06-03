export type OrderStatus =
  | "placed"
  | "packaging"
  | "ready_for_payment"
  | "paid"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order placed",
  packaging: "Sent for packaging",
  ready_for_payment: "Ready to pay",
  paid: "Payment received",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "placed",
  "packaging",
  "ready_for_payment",
  "paid",
  "delivered",
];

/** Customer-facing journey steps shown in UI */
export const CUSTOMER_JOURNEY_STEPS = [
  {
    status: "placed" as const,
    title: "Place order",
    description: "Add produce to your cart and confirm your details.",
  },
  {
    status: "packaging" as const,
    title: "Send for packaging",
    description: "Tell the farm to prepare your order.",
  },
  {
    status: "ready_for_payment" as const,
    title: "Ready to pay",
    description: "Farm confirms your total — pay via mobile money.",
  },
  {
    status: "paid" as const,
    title: "Payment received",
    description: "Farm confirms your payment.",
  },
  {
    status: "delivered" as const,
    title: "Delivered",
    description: "Enjoy your fresh produce!",
  },
];

export function getJourneyStepIndex(status: string): number {
  if (status === "cancelled") return -1;
  const idx = CUSTOMER_JOURNEY_STEPS.findIndex((s) => s.status === status);
  if (idx >= 0) return idx;
  // payment_status paid but status still ready_for_payment edge case
  if (status === "paid") return CUSTOMER_JOURNEY_STEPS.findIndex((s) => s.status === "paid");
  return 0;
}

export function canCustomerSubmitForPackaging(status: string) {
  return status === "placed";
}

export function canCustomerPay(status: string, paymentStatus: string) {
  return status === "ready_for_payment" && paymentStatus !== "paid";
}

export function isOrderComplete(status: string) {
  return status === "delivered" || status === "cancelled";
}

export function getNextCustomerAction(status: string, paymentStatus: string): string | null {
  if (status === "placed") return "Send your order for packaging";
  if (status === "packaging") return "Wait for the farm to confirm your total";
  if (canCustomerPay(status, paymentStatus)) return "Pay now using mobile money";
  if (status === "paid") return "Your order will be delivered soon";
  if (status === "delivered") return null;
  if (status === "cancelled") return null;
  return null;
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case "placed":
      return "bg-blue-100 text-blue-800";
    case "packaging":
      return "bg-amber-100 text-amber-800";
    case "ready_for_payment":
      return "bg-purple-100 text-purple-800";
    case "paid":
      return "bg-green-100 text-green-800";
    case "delivered":
      return "bg-farm-leaf/20 text-farm-forest";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
