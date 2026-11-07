import { BRAND_NAME, BRAND_SHORT, BRAND_WHATSAPP_PHONE, SITE_DOMAIN } from "@/lib/brand";

/** Primary WhatsApp business line (E.164 without +). */
export const ATHARVA_WHATSAPP_PHONE = BRAND_WHATSAPP_PHONE;

export const ATHARVA_WHATSAPP_DISPLAY = "+91 96693 61290";

/** Bulk-order enquiries — same primary line unless a dedicated number is added later. */
export const ATHARVA_BULK_ORDER_WHATSAPP_PHONE = BRAND_WHATSAPP_PHONE;
export const ATHARVA_BULK_ORDER_WHATSAPP_DISPLAY = ATHARVA_WHATSAPP_DISPLAY;

/** @deprecated Prefer ATHARVA_WHATSAPP_PHONE */
export const DARDGO_WHATSAPP_PHONE = ATHARVA_WHATSAPP_PHONE;
/** @deprecated Prefer ATHARVA_WHATSAPP_DISPLAY */
export const DARDGO_WHATSAPP_DISPLAY = ATHARVA_WHATSAPP_DISPLAY;
/** @deprecated Prefer ATHARVA_BULK_ORDER_WHATSAPP_PHONE */
export const DARDGO_BULK_ORDER_WHATSAPP_PHONE = ATHARVA_BULK_ORDER_WHATSAPP_PHONE;
/** @deprecated Prefer ATHARVA_BULK_ORDER_WHATSAPP_DISPLAY */
export const DARDGO_BULK_ORDER_WHATSAPP_DISPLAY = ATHARVA_BULK_ORDER_WHATSAPP_DISPLAY;

export function buildWhatsAppUrl(message: string, phone = ATHARVA_WHATSAPP_PHONE): string {
  const text = message.trim();
  const base = `https://wa.me/${phone}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export type BulkOrderFormData = {
  name: string;
  phone: string;
  email: string;
  company: string;
  city: string;
  products: string;
  quantity: string;
  notes: string;
};

export function buildBulkOrderWhatsAppMessage(data: BulkOrderFormData): string {
  const lines = [
    `Hello ${BRAND_SHORT}, I would like to place a *bulk order*.`,
    "",
    `*Name:* ${data.name}`,
    `*Phone:* ${data.phone}`,
  ];
  if (data.email.trim()) lines.push(`*Email:* ${data.email.trim()}`);
  if (data.company.trim()) lines.push(`*Company / Store:* ${data.company.trim()}`);
  if (data.city.trim()) lines.push(`*City:* ${data.city.trim()}`);
  lines.push(`*Products:* ${data.products}`);
  lines.push(`*Approx. quantity:* ${data.quantity}`);
  if (data.notes.trim()) lines.push(`*Notes:* ${data.notes.trim()}`);
  lines.push("", `Sent from ${SITE_DOMAIN} bulk order form`);
  return lines.join("\n");
}

export function openBulkOrderWhatsApp(data: BulkOrderFormData): void {
  const url = buildWhatsAppUrl(
    buildBulkOrderWhatsAppMessage(data),
    ATHARVA_BULK_ORDER_WHATSAPP_PHONE,
  );
  window.open(url, "_blank", "noopener,noreferrer");
}

export { BRAND_NAME };
