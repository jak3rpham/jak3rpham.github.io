import type { Metadata } from "next";
import { Outfit, Bricolage_Grotesque, Noto_Serif_JP, DM_Mono } from "next/font/google";
import { SITE_URL, PERSON } from "@/lib/site";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Nav } from "@/components/Nav";
import { ThemeScope } from "@/components/ThemeScope";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";
import { ScrollProgress } from "@/components/ScrollProgress";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-outfit" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-bricolage" });
const notoSerifJP = Noto_Serif_JP({ subsets: ["latin"], weight: ["600", "700", "900"], variable: "--font-noto-serif-jp" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

const TITLE = "Pham Ngoc Thanh (Tatsuki) · Growth, product & video";
const DESCRIPTION =
  "Pham Ngoc Thanh (Tatsuki): technical enough to build it, creative enough to film it. Technical SEO and growth, product builds, AI orchestration, and video. Ho Chi Minh City.";

export const metadata: Metadata = {
  // every relative URL below (canonicals, og:image) resolves against this
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Pham Ngoc Thanh · Tatsuki",
    locale: "en_US",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32" },
      { url: "/favicon-16.png", sizes: "16x16" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: PERSON.name,
  alternateName: PERSON.alternateName,
  url: SITE_URL,
  image: `${SITE_URL}/images/hero-portrait.webp`,
  email: `mailto:${PERSON.email}`,
  telephone: PERSON.phone,
  jobTitle: "Growth & technical marketer, product builder, video director",
  description: DESCRIPTION,
  knowsLanguage: ["vi", "en"],
  address: { "@type": "PostalAddress", addressLocality: PERSON.city, addressCountry: PERSON.country },
  alumniOf: { "@type": "CollegeOrUniversity", name: "UEH International School of Business" },
  knowsAbout: [
    "Technical SEO",
    "Growth marketing",
    "Google Analytics 4",
    "Google Search Console",
    "Web development",
    "AI orchestration",
    "Video production",
  ],
  sameAs: PERSON.profiles,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${bricolage.variable} ${notoSerifJP.variable} ${dmMono.variable}`}>
      <body>
        {/* Person graph: this is the page an "who is Pham Ngoc Thanh" query resolves to,
            so state the identity, the disciplines, and the contact points explicitly. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeScope>
          <Preloader />
          <ScrollProgress />
          <GrainOverlay />
          <Nav />
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeScope>
      </body>
    </html>
  );
}
