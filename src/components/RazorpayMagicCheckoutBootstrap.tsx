import { useEffect } from "react";
import {
  injectRazorpayMagicCheckoutScript,
  isRazorpayMagicCheckoutConfigured,
} from "@/lib/razorpay-magic-checkout";

/** Prefetch Magic Checkout JS when enabled so Buy Now / checkout open faster. */
export function RazorpayMagicCheckoutBootstrap() {
  useEffect(() => {
    if (!isRazorpayMagicCheckoutConfigured()) return;
    injectRazorpayMagicCheckoutScript();
  }, []);

  return null;
}
