import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Bong Vespera — an AI creative pipeline, failures included";

export default function Image() {
  return ogCard({
    eyebrow: "Case study · AI creative pipeline",
    title: "BÓNG",
    accent: "VESPERA",
    subtitle: "A Vietnamese dark-fantasy ad taken from brief to motion across four AI models, with every failure documented.",
    stats: [
      ["6h", "End-to-end"],
      ["4", "Models"],
      ["5+1", "KFs + ad"],
      ["$0", "Free tier"],
    ],
  });
}
