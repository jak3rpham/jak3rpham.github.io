import type { Metadata } from "next";
import { IeltsStory } from "@/components/stories/ProductStories";
const TITLE = "IELTS Studio case study · AI grading on Next.js + Supabase · Pham Ngoc Thanh";
const DESCRIPTION =
  "How IELTS Studio was built: two separate examiner rubrics for Writing Task 1 and 2, an anti-inflation grading prompt, an original item-writer built around exam traps, and a Supabase schema that runs with zero configuration.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/ielts-studio" },
  openGraph: { type: "article", url: "/ielts-studio", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};
export default function Page() { return <IeltsStory />; }
