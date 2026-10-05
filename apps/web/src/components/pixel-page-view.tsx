"use client";

import { trackPixel } from "@/lib/pixel";
import { useEffect } from "react";

/** Fires generic Meta Pixel PageView once per mount. */
export function PixelPageView() {
  useEffect(() => {
    trackPixel("PageView");
  }, []);
  return null;
}
