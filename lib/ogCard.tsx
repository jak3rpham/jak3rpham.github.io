import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Brand tokens, inlined: next/og resolves plain CSS only, no Tailwind, no CSS vars.
const INK = "#0E110D";
const CREAM = "#F5F0E8";
const TAN = "#C7B9A1";
const SAND = "#8C8578";
const FOREST = "#8FD49E";
const RULE = "rgba(199,185,161,0.22)";

/**
 * One shared link-preview card for every route. Deliberately typographic rather
 * than a screenshot: a preview thumbnail is ~300px wide in a LinkedIn feed, where
 * a screenshot turns to mush but a headline and four numbers still read.
 *
 * No kanji here on purpose — next/og's default font has no CJK coverage and would
 * render 達樹 as tofu boxes.
 */
export function ogCard({
  eyebrow,
  title,
  accent,
  subtitle,
  stats,
}: {
  eyebrow: string;
  title: string;
  /** trailing fragment of the title, printed in the accent colour */
  accent?: string;
  subtitle: string;
  stats: [string, string][];
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          padding: "68px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 10, height: 10, background: FOREST, transform: "rotate(45deg)" }} />
          <div style={{ color: SAND, fontSize: 21, letterSpacing: 4, textTransform: "uppercase" }}>{eyebrow}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 78,
              fontWeight: 800,
              letterSpacing: -2.6,
              lineHeight: 1.04,
              color: CREAM,
            }}
          >
            <span>{title}</span>
            {accent ? <span style={{ color: FOREST, marginLeft: 18 }}>{accent}</span> : null}
          </div>
          <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.4, color: TAN, maxWidth: 900 }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", borderTop: `1px solid ${RULE}`, paddingTop: 26, gap: 60 }}>
          {stats.map(([value, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: CREAM, letterSpacing: -1 }}>{value}</div>
              <div style={{ marginTop: 6, fontSize: 18, letterSpacing: 2, textTransform: "uppercase", color: SAND }}>
                {label}
              </div>
            </div>
          ))}
          <div style={{ marginLeft: "auto", alignSelf: "flex-end", fontSize: 20, letterSpacing: 2, color: SAND }}>
            jak3rpham.github.io
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
