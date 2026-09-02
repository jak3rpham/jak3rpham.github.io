import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Nha Minh — an AI family healthcare companion";

export default function Image() {
  return ogCard({
    eyebrow: "Case study · AI Riser Vietnam 2026",
    title: "Nhà",
    accent: "Mình",
    subtitle: "A dual-interface healthcare companion for elderly parents and the adult children caring for them.",
    stats: [
      ["100%", "Safety pass rate"],
      ["134", "Unit tests"],
      ["<1.2s", "OCR latency"],
      ["0", "Hallucinated Rx"],
    ],
  });
}
