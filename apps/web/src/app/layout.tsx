import type { Metadata } from "next";
import { Manrope, Noto_Sans_Ethiopic } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { PixelPageView } from "@/components/pixel-page-view";
import { Providers } from "@/components/providers";
import { themeInitScript } from "@/lib/db";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ethiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
});

export const metadata: Metadata = {
  title: "Ayzon",
  description: "Support for your mind, in the language of your heart.",
  metadataBase: new URL("https://ayzoncare.com"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${ethiopic.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full font-sans">
        <Providers>
          <PixelPageView />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
