/**
 * Finalise Shopify order after Razorpay Magic Checkout payment success.
 * POST /api/razorpay-magic-complete
 * @see https://razorpay.com/docs/payments/magic-checkout/shopify/custom/web-integration-nextjs
 */
type CompleteBody = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
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
    return new Response(JSON.stringify({ error: "Missing VITE_RAZORPAY_KEY_ID" }), {
      status: 503,
    });
  }

  let body: CompleteBody;
  try {
    body = (await request.json()) as CompleteBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  if (!body.razorpay_payment_id || !body.razorpay_order_id) {
    return new Response(
      JSON.stringify({ error: "razorpay_payment_id and razorpay_order_id are required" }),
      { status: 400 },
    );
  }

  try {
    const url = `https://api.razorpay.com/v1/1cc/shopify/complete?key_id=${encodeURIComponent(keyId)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        razorpay_payment_id: body.razorpay_payment_id,
        razorpay_order_id: body.razorpay_order_id,
      }),
    });
    const raw = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      /* non-JSON */
    }

    if (!res.ok) {
      const errObj = data.error as { description?: string } | undefined;
      return new Response(
        JSON.stringify({
          error: "Failed to complete Magic Checkout",
          detail: errObj?.description || (data.message as string) || raw.slice(0, 400),
        }),
        { status: 502 },
      );
    }

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Magic Checkout complete failed";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
