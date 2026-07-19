import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";
type Arrow = "right" | "up-right" | "none";

/**
 * The single CTA system for the whole site. One look, one size scale, one hover.
 *
 * Emphasis comes from contrast, not colour: `primary` is a solid cream fill on the dark
 * theme (theme-agnostic — it also reads on the amber/bong re-themes, which only override
 * --color-cream/-ink, so the button follows each page's own cream+ink). `secondary` is a
 * matching outline. This keeps the neutral palette while giving CTAs real weight.
 *
 * `ctaClass()` is exported so the few buttons that need their own element (the magnetic
 * end-of-page links, which are motion.a with pointer handlers) stay pixel-identical to
 * <Cta> instead of hand-copying the classes.
 */
const SIZE: Record<Size, string> = {
  md: "px-7 py-3.5 text-[0.95rem]",
  lg: "px-8 py-4 text-[1rem]",
};

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-cream text-ink font-semibold hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(241,243,234,0.35)]",
  secondary:
    "border border-cream/25 text-cream font-medium hover:-translate-y-0.5 hover:border-cream/70 hover:bg-cream/[0.08]",
};

export function ctaClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `group inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200 ${SIZE[size]} ${VARIANT[variant]} ${extra}`.trim();
}

const GLYPH: Record<Arrow, string | null> = { right: "→", "up-right": "↗", none: null };

/** Trailing arrow that slides on hover of the parent `group`. */
export function CtaArrow({ arrow = "right" }: { arrow?: Arrow }) {
  const g = GLYPH[arrow];
  if (!g) return null;
  return (
    <span
      aria-hidden
      className={`transition-transform duration-200 ${
        arrow === "up-right"
          ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          : "group-hover:translate-x-0.5"
      }`}
    >
      {g}
    </span>
  );
}

export function Cta({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = "right",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: Arrow;
  className?: string;
}) {
  const cls = ctaClass(variant, size, className);
  const inner = (
    <>
      <span>{children}</span>
      <CtaArrow arrow={arrow} />
    </>
  );

  if (/^https?:/.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  if (/^(mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
