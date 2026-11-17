/**
 * Razorpay Magic Checkout for headless Shopify (custom React storefront).
 * @see https://razorpay.com/docs/payments/magic-checkout/shopify/custom/web-integration-nextjs
 */
import type { CartItem } from "@/lib/shopify";
import { BRAND_NAME } from "@/lib/brand";

const MAGIC_SCRIPT = "https://checkout.razorpay.com/v1/magic-checkout.js";
const SCRIPT_ID = "razorpay-magic-checkout-js";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayMagicCheckoutOptions) => { open: () => void };
  }
}

export type RazorpayMagicCartItem = {
  id: number;
  quantity: number;
  product_id: number;
  variant_id: number;
  properties: Record<string, string>;
};

export type RazorpayMagicCartPayload = {
  token: string;
  note: string | null;
  attributes: Record<string, string>;
  item_count: number;
  items: RazorpayMagicCartItem[];
};

export type RazorpayPaymentSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature?: string;
};

type RazorpayMagicCheckoutOptions = {
  key: string;
  name: string;
  order_id: string;
  show_coupons?: boolean;
  theme?: { color?: string };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    coupon_code?: string;
  };
  handler: (response: RazorpayPaymentSuccess) => void;
  modal?: { ondismiss?: () => void };
};

const ENABLED = (() => {
  const v = (import.meta.env.VITE_RAZORPAY_MAGIC_CHECKOUT_ENABLED as string | undefined)
    ?.trim()
    .toLowerCase();
  return v === "1" || v === "true" || v === "yes";
})();

const KEY_ID = (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined)?.trim() ?? "";

const BUSINESS_NAME =
  (import.meta.env.VITE_RAZORPAY_BUSINESS_NAME as string | undefined)?.trim() || BRAND_NAME;

export function isRazorpayMagicCheckoutConfigured(): boolean {
  return ENABLED && Boolean(KEY_ID);
}

export function getRazorpayKeyId(): string {
  return KEY_ID;
}

export function getRazorpayBusinessName(): string {
  return BUSINESS_NAME;
}

/** `gid://shopify/Cart/TOKEN?key=KEY` → `TOKEN?key=KEY` */
export function shopifyCartIdToMagicToken(cartId: string): string {
  const m = cartId.match(/Cart\/(.+)$/i);
  return (m?.[1] ?? cartId).trim();
}

export function shopifyGidToNumericId(gid: string): number {
  const m = gid.match(/\/(\d+)(?:\?|$)/) || gid.match(/(\d+)\s*$/);
  if (!m) return 0;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : 0;
}

export function buildMagicCartPayload(
  cartId: string,
  items: CartItem[],
): RazorpayMagicCartPayload {
  const magicItems: RazorpayMagicCartItem[] = items.map((item) => {
    const variantId = shopifyGidToNumericId(item.variantId);
    const productId = shopifyGidToNumericId(item.product.node.id);
    const lineId = item.lineId ? shopifyGidToNumericId(item.lineId) : 0;
    return {
      id: lineId || variantId,
      quantity: item.quantity,
      product_id: productId,
      variant_id: variantId,
      properties: {},
    };
  });

  return {
    token: shopifyCartIdToMagicToken(cartId),
    note: null,
    attributes: {},
    item_count: magicItems.reduce((sum, i) => sum + i.quantity, 0),
    items: magicItems,
  };
}

export function injectRazorpayMagicCheckoutScript(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = MAGIC_SCRIPT;
  script.async = true;
  document.body.appendChild(script);
}

async function whenRazorpayReady(timeoutMs = 15000): Promise<boolean> {
  injectRazorpayMagicCheckoutScript();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (typeof window !== "undefined" && window.Razorpay) return true;
    await new Promise((r) => setTimeout(r, 80));
  }
  return false;
}

type StartApiResponse = {
  order_id?: string;
  key_id?: string;
  error?: string;
  detail?: string;
};

type CompleteApiResponse = {
  order_status_url?: string;
  order_id?: string;
  error?: string;
  detail?: string;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & {
    error?: string;
    detail?: string | Record<string, unknown>;
    hint?: string;
  };
  if (!res.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : data.detail
          ? JSON.stringify(data.detail)
          : "";
    let detailMsg = detail;
    try {
      const parsed = JSON.parse(detail) as { Description?: string; description?: string };
      detailMsg = parsed.Description || parsed.description || detail;
    } catch {
      /* plain text detail */
    }
    const msg =
      [data.error, detailMsg, data.hint].filter(Boolean).join(" — ") ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function createMagicOrder(options: {
  cartId: string;
  items: CartItem[];
  couponCode?: string;
}): Promise<{ orderId: string; keyId: string }> {
  if (!isRazorpayMagicCheckoutConfigured()) {
    throw new Error(
      "Razorpay Magic Checkout is not configured. Set VITE_RAZORPAY_MAGIC_CHECKOUT_ENABLED=true and VITE_RAZORPAY_KEY_ID.",
    );
  }
  if (!options.cartId) throw new Error("Shopify cart is missing. Add items and try again.");
  if (!options.items.length) throw new Error("Cart is empty.");

  const cart = buildMagicCartPayload(options.cartId, options.items);
  if (!cart.token) throw new Error("Invalid Shopify cart token.");
  if (cart.items.some((i) => !i.variant_id || !i.product_id)) {
    throw new Error("Cart items are missing Shopify product/variant ids.");
  }

  const data = await postJson<StartApiResponse>("/api/razorpay-magic-start", {
    cart,
    coupon_code: options.couponCode || undefined,
    source_url: typeof window !== "undefined" ? window.location.href : undefined,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  });

  if (!data.order_id) throw new Error(data.error || "Razorpay did not return an order id.");
  return { orderId: data.order_id, keyId: data.key_id || KEY_ID };
}

export async function completeMagicCheckout(
  payment: RazorpayPaymentSuccess,
): Promise<{ orderStatusUrl?: string; shopifyOrderId?: string }> {
  const data = await postJson<CompleteApiResponse>("/api/razorpay-magic-complete", {
    razorpay_payment_id: payment.razorpay_payment_id,
    razorpay_order_id: payment.razorpay_order_id,
  });
  return {
    orderStatusUrl: data.order_status_url,
    shopifyOrderId: data.order_id,
  };
}

/**
 * Create Razorpay order for the Shopify cart, open Magic Checkout modal,
 * complete Shopify order on success, then redirect to Shopify order status.
 */
export async function initiateRazorpayMagicCheckout(options: {
  cartId: string;
  items: CartItem[];
  couponCode?: string;
  onDismiss?: () => void;
}): Promise<void> {
  const { orderId, keyId } = await createMagicOrder(options);
  const ready = await whenRazorpayReady();
  if (!ready || !window.Razorpay) {
    throw new Error("Razorpay Magic Checkout script did not load. Check network or ad blockers.");
  }

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const rzp = new window.Razorpay!({
      key: keyId,
      name: BUSINESS_NAME,
      order_id: orderId,
      show_coupons: true,
      theme: { color: "#2E7D32" },
      prefill: {
        ...(options.couponCode ? { coupon_code: options.couponCode } : {}),
      },
      handler: (response) => {
        void (async () => {
          try {
            const result = await completeMagicCheckout(response);
            settled = true;
            if (result.orderStatusUrl) {
              window.location.assign(result.orderStatusUrl);
            }
            resolve();
          } catch (err) {
            settled = true;
            reject(err instanceof Error ? err : new Error("Could not finalise Magic Checkout."));
          }
        })();
      },
      modal: {
        ondismiss: () => {
          if (settled) return;
          settled = true;
          options.onDismiss?.();
          reject(new Error("Checkout closed before payment completed."));
        },
      },
    });
    rzp.open();
  });
}
