import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Aru Otoko — an AI-directed music video";

export default function Image() {
  return ogCard({
    eyebrow: "Case study · AI music video",
    title: "A man the city",
    accent: "won't slow for",
    subtitle: "A 33-second music video, directed and edited end to end from eleven AI generations.",
    stats: [
      ["11", "AI clips"],
      ["33s", "Final cut"],
      ["1", "Director"],
      ["0", "Camera"],
    ],
  });
}
