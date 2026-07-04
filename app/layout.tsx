import type { Metadata } from "next";
import { Outfit, Noto_Serif_JP, DM_Mono } from "next/font/google";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Nav } from "@/components/Nav";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-outfit" });
const notoSerifJP = Noto_Serif_JP({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-noto-serif-jp" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: "Tatsuki · Pham Ngoc Thanh / Digital Marketing & Creative",
  description:
    "Pham Ngoc Thanh (Tatsuki), Digital Marketing Strategist building full-funnel campaigns for B2B SaaS. SEO, performance, video. Ho Chi Minh City.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${notoSerifJP.variable} ${dmMono.variable}`}>
      <body>
        <GrainOverlay />
        <Nav />
        {children}
      </body>
    </html>
  );
}
