export const LOGO_URL =
  "https://twybuesrupusogzoszqf.supabase.co/storage/v1/object/public/gallery/luchiz-farm-logo.jpg";

export const HERO_IMAGE_URL =
  "https://twybuesrupusogzoszqf.supabase.co/storage/v1/object/public/gallery/hero-farm.jpg";

export const PAYMENT_PHONE =
  import.meta.env.VITE_PAYMENT_PHONE?.replace(/\D/g, "") || "260979654602";

export const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, "") || "260979654602";

export const PAYMENT_PHONE_DISPLAY = `+${PAYMENT_PHONE.replace(/^260/, "260 ")}`;

export function paymentTelLink() {
  return `tel:+${PAYMENT_PHONE}`;
}

export function paymentWhatsAppLink(orderId: string, amount: number) {
  const text = [
    "Hi Luchiz Farm, I am paying for my order.",
    `Order ID: ${orderId}`,
    `Amount: K${amount}`,
    "Please confirm when received. Thank you!",
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
