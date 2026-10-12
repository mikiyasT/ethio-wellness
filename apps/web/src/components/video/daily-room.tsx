"use client";

import { useEffect, useRef } from "react";

/** Daily prebuilt call. The room address is used by the embed and is not shown as a link. */
export function DailyRoom({ roomUrl, token }: { roomUrl: string; token: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroyed = false;
    let call: { destroy: () => void } | null = null;
    void (async () => {
      const DailyIframe = (await import("@daily-co/daily-js")).default;
      if (destroyed || !ref.current) return;
      const frame = DailyIframe.createFrame(ref.current, {
        iframeStyle: { width: "100%", height: "70vh", border: "0", borderRadius: "16px" },
        showLeaveButton: true,
      });
      call = frame;
      await frame.join({ url: roomUrl, token });
    })();
    return () => {
      destroyed = true;
      call?.destroy();
    };
  }, [roomUrl, token]);

  return <div ref={ref} className="mt-4 min-h-[70vh] overflow-hidden rounded-2xl bg-black" />;
}
