/**
 * Finalise Shopify order after Razorpay Magic Checkout payment success.
 * POST /api/razorpay-magic-complete
 * @see https://razorpay.com/docs/payments/magic-checkout/shopify/custom/web-integration-nextjs
 */
import { defineEventHandler, readBody, setResponseStatus } from "nitro/h3";

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

export default defineEventHandler(async (event) => {
  if (!isEnabled()) {
    setResponseStatus(event, 503);
    return { error: "Razorpay Magic Checkout is disabled" };
  }

  const keyId = getKeyId();
  if (!keyId) {
    setResponseStatus(event, 503);
    return { error: "Missing VITE_RAZORPAY_KEY_ID" };
  }

  let body: CompleteBody;
  try {
    body = (await readBody(event)) as CompleteBody;
  } catch {
    setResponseStatus(event, 400);
    return { error: "Invalid JSON body" };
  }

  if (!body || typeof body !== "object") {
    setResponseStatus(event, 400);
    return { error: "Invalid JSON body" };
  }

  if (!body.razorpay_payment_id || !body.razorpay_order_id) {
    setResponseStatus(event, 400);
    return { error: "razorpay_payment_id and razorpay_order_id are required" };
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
      setResponseStatus(event, 502);
      return {
        error: "Failed to complete Magic Checkout",
        detail: errObj?.description || (data.message as string) || raw.slice(0, 400),
      };
    }

    setResponseStatus(event, 200);
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Magic Checkout complete failed";
    setResponseStatus(event, 500);
    return { error: message };
  }
});
