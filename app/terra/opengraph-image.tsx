import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "terra-plat.vn case study — 12x organic growth";

export default function Image() {
  return ogCard({
    eyebrow: "Featured case study · 22 months",
    title: "terra-plat.vn",
    accent: "growth",
    subtitle: "12× organic growth for a B2B payroll and HR SaaS, and the custom tooling that made it scale.",
    stats: [
      ["12×", "Organic growth"],
      ["978", "Keywords top 10"],
      ["31.4M", "Impressions"],
      ["55→90", "Site health"],
    ],
  });
}
