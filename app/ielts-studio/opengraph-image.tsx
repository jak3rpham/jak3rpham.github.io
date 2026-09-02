import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "IELTS Studio — AI grading on Next.js and Supabase";

export default function Image() {
  return ogCard({
    eyebrow: "Case study · Product build",
    title: "IELTS",
    accent: "Studio",
    subtitle: "An examiner-calibrated grader, an original item-writer, and a database that runs on nothing until you give it something.",
    stats: [
      ["23", "Question types"],
      ["4", "RLS tables"],
      ["3", "Server routes"],
      ["0", "Config to run"],
    ],
  });
}
