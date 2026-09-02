import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Video reel — TVCs, brand films, music videos";

export default function Image() {
  return ogCard({
    eyebrow: "Reel · TVC · Brand · Events",
    title: "Video &",
    accent: "brand",
    subtitle: "End-to-end production: TVCs, brand films, event recaps, music videos, explainers.",
    stats: [
      ["2", "Top 1 TVCs"],
      ["7", "Formats"],
      ["EN", "/ VI"],
      ["HCMC", "Vietnam"],
    ],
  });
}
