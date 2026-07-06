import type { Metadata } from "next";
import { Outfit, Bricolage_Grotesque, Noto_Serif_JP, DM_Mono } from "next/font/google";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Nav } from "@/components/Nav";
import { FloatingCV } from "@/components/FloatingCV";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";
import { ScrollProgress } from "@/components/ScrollProgress";
import { CursorFollower } from "@/components/CursorFollower";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-outfit" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-bricolage" });
const notoSerifJP = Noto_Serif_JP({ subsets: ["latin"], weight: ["600", "700", "900"], variable: "--font-noto-serif-jp" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: "Tatsuki · Pham Ngoc Thanh / Digital Marketing & Creative",
  description:
    "Pham Ngoc Thanh (Tatsuki), Digital Marketing Strategist building full-funnel campaigns for B2B SaaS. SEO, performance, video. Ho Chi Minh City.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32" },
      { url: "/favicon-16.png", sizes: "16x16" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${bricolage.variable} ${notoSerifJP.variable} ${dmMono.variable}`}>
      <body>
        <Preloader />
        <ScrollProgress />
        <CursorFollower />
        <GrainOverlay />
        <Nav />
        <FloatingCV />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
