import type { Metadata } from "next";
import { VitaliteStory } from "@/components/stories/VitaliteStory";

const title = "VITALITÉ case study · WooCommerce build for a streetwear label · Pham Ngoc Thanh";
const description =
  "A WordPress and WooCommerce storefront built for a Vietnamese streetwear label whose Instagram audience is twice its marketplace following. Strategy, custom theme, bilingual routing and a working demo.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/vitalite" },
  openGraph: { type: "article", url: "/vitalite", title, description },
  twitter: { card: "summary_large_image", title, description },
};

export default function Page() { return <VitaliteStory />; }
