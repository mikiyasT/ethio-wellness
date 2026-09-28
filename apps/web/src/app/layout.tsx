import type { Metadata } from "next";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ethiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
});

export const metadata: Metadata = {
  title: "Ethio Wellness",
  description: "Support for your mind, in the language of your heart.",
};

const themeInit = `(function(){try{var t=localStorage.getItem("ethio-wellness-theme");document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light");document.documentElement.style.colorScheme=t==="dark"?"dark":"light";}catch(e){}document.addEventListener("change",function(e){var el=e.target;if(!el||el.getAttribute("data-chrome")!=="theme")return;var v=el.value==="dark"?"dark":"light";document.documentElement.setAttribute("data-theme",v);document.documentElement.style.colorScheme=v;try{localStorage.setItem("ethio-wellness-theme",v);}catch(err){}},true);})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${ethiopic.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full font-sans">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
