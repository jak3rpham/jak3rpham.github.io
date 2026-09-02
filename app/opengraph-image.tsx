import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Pham Ngoc Thanh (Tatsuki) — growth, product and video";

export default function Image() {
  return ogCard({
    eyebrow: "Pham Ngoc Thanh · Tatsuki · Ho Chi Minh City",
    title: "Technical enough to build it,",
    accent: "creative enough to film it.",
    subtitle: "Technical SEO and growth, product builds, AI orchestration, and video — shipped end to end by one person.",
    stats: [
      ["12×", "Organic growth"],
      ["978", "Keywords top 10"],
      ["31.4M", "Impressions"],
      ["2", "Top 1 TVCs"],
    ],
  });
}
