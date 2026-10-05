/**
 * Meta Pixel — generic events only (PageView, InitiateCheckout, Purchase).
 * Never send need category, provider identity, slot time, or health data.
 */

type PixelEvent = "PageView" | "InitiateCheckout" | "Purchase";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackPixel(event: PixelEvent, params?: { value?: number; currency?: string }) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.fbq === "function") {
      if (event === "Purchase" && params?.value != null) {
        window.fbq("track", event, { value: params.value, currency: params.currency ?? "USD" });
      } else {
        window.fbq("track", event);
      }
    }
  } catch {
    /* ignore */
  }
}
