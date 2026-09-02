import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Static export: Next writes this out as /sitemap.xml at build time.
export const dynamic = "force-static";

const ROUTES = ["", "/terra", "/nha-minh", "/aru-otoko", "/bong-vespera", "/ielts-studio", "/video"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    // the homepage is the entry point; the featured case study outranks the rest
    priority: path === "" ? 1 : path === "/terra" ? 0.9 : 0.8,
  }));
}
