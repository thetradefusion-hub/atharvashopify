/**
 * Create Razorpay Magic Checkout id + order for a Shopify cart.
 * POST /api/razorpay-magic-start
 * @see https://razorpay.com/docs/payments/magic-checkout/shopify/custom/web-integration-nextjs
 */
type MagicCartBody = {
  cart?: {
    token?: string;
    note?: string | null;
    attributes?: Record<string, string>;
    item_count?: number;
    items?: Array<{
      id?: number;
      quantity?: number;
      product_id?: number;
      variant_id?: number;
      properties?: Record<string, string>;
    }>;
  };
  coupon_code?: string;
  source_url?: string;
  user_agent?: string;
};

function getKeyId(): string {
  return (
    process.env.VITE_RAZORPAY_KEY_ID?.trim() ||
    process.env.RAZORPAY_KEY_ID?.trim() ||
    ""
  );
}

function isEnabled(): boolean {
  const v = (
    process.env.VITE_RAZORPAY_MAGIC_CHECKOUT_ENABLED ||
    process.env.RAZORPAY_MAGIC_CHECKOUT_ENABLED ||
    ""
  )
    .trim()
    .toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

async function razorpayPost<T>(
  path: string,
  keyId: string,
  body: unknown,
  accept = "application/json",
): Promise<{ ok: boolean; status: number; data: T; raw: string }> {
  const url = `https://api.razorpay.com/v1${path}?key_id=${encodeURIComponent(keyId)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: accept,
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let data = {} as T;
  try {
    data = raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch {
    /* non-JSON */
  }
  return { ok: res.ok, status: res.status, data, raw };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  if (!isEnabled()) {
    return new Response(
      JSON.stringify({ error: "Razorpay Magic Checkout is disabled" }),
      { status: 503 },
    );
  }

  const keyId = getKeyId();
  if (!keyId) {
    return new Response(
      JSON.stringify({
        error: "Missing VITE_RAZORPAY_KEY_ID (Razorpay Dashboard → API Keys → Key Id)",
      }),
      { status: 503 },
    );
  }

  let body: MagicCartBody;
  try {
    body = (await request.json()) as MagicCartBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const cart = body.cart;
  if (!cart?.token || !Array.isArray(cart.items) || cart.items.length === 0) {
    return new Response(
      JSON.stringify({ error: "cart.token and cart.items are required" }),
      { status: 400 },
    );
  }

  const cartPayload = {
    cart: {
      token: cart.token,
      note: cart.note ?? null,
      attributes: cart.attributes ?? {},
      item_count: cart.item_count ?? cart.items.reduce((s, i) => s + (i.quantity || 0), 0),
      items: cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product_id: item.product_id,
        variant_id: item.variant_id,
        properties: item.properties ?? {},
      })),
    },
  };

  try {
    const checkout = await razorpayPost<{
      shopify_checkout_id?: string;
      error?: { description?: string; code?: string };
      message?: string;
    }>("/magic/checkout/shopify", keyId, cartPayload);

    if (!checkout.ok || !checkout.data.shopify_checkout_id) {
      const detail =
        checkout.data.error?.description ||
        checkout.data.message ||
        checkout.raw.slice(0, 400) ||
        `HTTP ${checkout.status}`;
      return new Response(
        JSON.stringify({
          error: "Failed to create Magic Checkout id",
          detail,
        }),
        { status: 502 },
      );
    }

    const sourceUrl = body.source_url || undefined;
    const order = await razorpayPost<{
      order_id?: string;
      error?: { description?: string };
      message?: string;
    }>(
      "/magic/order/shopify",
      keyId,
      {
        shopify_checkout_id: checkout.data.shopify_checkout_id,
        ...(sourceUrl
          ? {
              utm_parameters: {
                landing_page_url: sourceUrl,
                user_agent: body.user_agent || undefined,
              },
              analytics: { source_url: sourceUrl },
            }
          : {}),
      },
      "*/*",
    );

    if (!order.ok || !order.data.order_id) {
      const detail =
        order.data.error?.description ||
        order.data.message ||
        order.raw.slice(0, 400) ||
        `HTTP ${order.status}`;
      return new Response(
        JSON.stringify({
          error: "Failed to create Razorpay order",
          detail,
        }),
        { status: 502 },
      );
    }

    return new Response(
      JSON.stringify({
        order_id: order.data.order_id,
        shopify_checkout_id: checkout.data.shopify_checkout_id,
        key_id: keyId,
        coupon_code: body.coupon_code || null,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Magic Checkout start failed";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
