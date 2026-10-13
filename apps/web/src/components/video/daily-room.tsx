"use client";

import { useEffect, useState } from "react";

/** Daily prebuilt call. The room address is used by the embed and is not shown as a link. */
export function DailyRoom({ roomUrl, token }: { roomUrl: string; token: string }) {
  const [secure, setSecure] = useState<boolean | null>(null);

  useEffect(() => {
    setSecure(window.isSecureContext);
  }, []);

  if (secure === null) {
    return <div className="mt-4 min-h-48 rounded-2xl bg-surface-warm" />;
  }

  if (!secure) {
    return (
      <div className="mt-4 rounded-2xl border border-border bg-surface-warm p-4 text-sm text-ink-2">
        The camera stays dark on this address. A phone only turns the camera on for a secure https link.
        Open that link, then tap Join session again.
      </div>
    );
  }

  const src = `${roomUrl}${roomUrl.includes("?") ? "&" : "?"}t=${encodeURIComponent(token)}`;
  return (
    <div className="mt-4">
      <iframe
        src={src}
        title="Video session"
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="h-[70vh] w-full rounded-2xl border-0 bg-surface"
      />
      <p className="mt-2 text-sm text-ink-3">
        If the preview is dark, tap the camera button in the video window and allow the camera when your phone asks.
      </p>
    </div>
  );
}
