import type { Metadata } from "next";
import { NhaStory } from "@/components/stories/ProductStories";
const TITLE = "Nhà Mình · AI Family Healthcare Companion · Case Study · Pham Ngoc Thanh";
const DESCRIPTION =
  "AI Riser Vietnam 2026 entry: Dual-interface healthcare companion for elderly parents and adult caregivers, featuring Gemini 2.5 Flash Vision OCR, voice assistant 'Cháu Bi', and 5-invariant medical safety guardrails.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/nha-minh" },
  openGraph: { type: "article", url: "/nha-minh", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};
export default function Page() { return <NhaStory />; }
