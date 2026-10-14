import { metaPixelId } from "@/lib/pixel-id";

/**
 * Loads the Meta snippet only when NEXT_PUBLIC_META_PIXEL_ID is a numeric id.
 * PageView, InitiateCheckout, and Purchase are sent by trackPixel. No health fields.
 */
export function PixelBootstrap() {
  const id = metaPixelId(process.env.NEXT_PUBLIC_META_PIXEL_ID);
  if (!id) return null;
  const html = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');`;
  return <script dangerouslySetInnerHTML={{ __html: html }} />;
}
