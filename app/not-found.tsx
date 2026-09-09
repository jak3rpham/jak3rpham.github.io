import type { Metadata } from "next";
import Link from "next/link";
import s from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found · Pham Ngoc Thanh (Tatsuki)",
  description: "That page is not here. The selected work, case studies and film reel are all one click away.",
  robots: { index: false, follow: true },
};

const ROUTES = [
  { href: "/terra", label: "terra-plat.vn", note: "B2B SaaS growth" },
  { href: "/nha-minh", label: "Nhà Mình", note: "AI family care" },
  { href: "/aru-otoko", label: "ある男", note: "AI music video" },
  { href: "/bong-vespera", label: "Bóng Vespera", note: "AI creative pipeline" },
  { href: "/ielts-studio", label: "IELTS Studio", note: "AI grading build" },
  { href: "/video", label: "Films", note: "TVCs and brand video" },
];

export default function NotFound() {
  return (
    <main className={s.wrap}>
      <div className={s.inner}>
        <p className={s.code}>404</p>
        <h1>
          That page isn&rsquo;t
          <br />
          <em>here anymore.</em>
        </h1>
        <p className={s.lede}>
          The link may be old, or the address slightly off. Everything below still works.
        </p>
        <Link href="/" className={s.home}>
          Back to the homepage
          <span aria-hidden="true">↗</span>
        </Link>
        <nav className={s.routes} aria-label="Selected work">
          {ROUTES.map((r) => (
            <Link key={r.href} href={r.href}>
              <b>{r.label}</b>
              <span>
                {r.note} <i aria-hidden="true">↗</i>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
