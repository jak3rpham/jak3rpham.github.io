# Next.js + Framer Motion Homepage Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-platform `index.html` (the homepage of `jak3rpham.github.io`) onto Next.js + TypeScript + Tailwind CSS + Framer Motion, deployed via GitHub Actions to the same GitHub Pages user-page domain, while `terra.html`, `video.html`, `bong-vespera.html`, and `pati-challenge/` continue to be served unchanged from `public/`.

**Architecture:** App Router Next.js project scaffolded via `create-next-app` into a temp folder and merged into the existing repo root (repo isn't empty, so scaffolding can't run in place). The homepage becomes `app/page.tsx` assembling ~11 section components. Every GSAP/ScrollTrigger-driven effect is ported to Framer Motion (`whileInView`, `useScroll`/`useTransform`, `layoutId`, `AnimatePresence`, `useMotionValue`/`useSpring`). Purely decorative CSS-only elements that were never GSAP (grain overlay, blob morph, per-section motif shapes, image hover-pan) stay as plain CSS — they don't benefit from a JS animation library and rewriting them would add risk with no upside. Non-DOM-animation interactivity (canvas contour lines, scramble-on-hover text, the live clock) stays as plain React state/`useEffect`, per the design doc.

**Tech Stack:** Next.js (App Router, static export), TypeScript, Tailwind CSS v4, Framer Motion, Vitest + @testing-library/react for the handful of pure-logic hooks worth unit testing.

---

## Fidelity notes (read before starting)

This is a **re-platform, not a redesign** — but exact-to-the-pixel parity is not the goal either. Deviations from the original, made deliberately to keep this plan tractable:

- Breakpoints use Tailwind's default scale (`sm`/`md`/`lg`) instead of the original's bespoke `560px`/`900px`/`820px` values, **except** where a breakpoint gates whether a whole interaction runs at all (the Terra sticky-stack scroll effect, gated at `768px` in the original) — those exact thresholds are preserved because they're functional, not cosmetic.
- The Terra sticky-stack scroll effect is reimplemented with `position: sticky` + `useScroll`/`useTransform` per-card, which produces the same visual outcome (cards recede/blur as the next one arrives) but does not reproduce GSAP's exact `endTrigger`-pinned scrub timing frame-for-frame.
- The hero's 48-frame canvas image-sequence intro is **dropped, not ported**. Checked `images/hero/sequence/` — it's empty (only a `rename-frames.ps1` helper script exists there). In the live site today this code path always fails silently (`img.onerror` fires for every frame, `frame0Ready` never becomes true). It has never actually run. Porting dead code forward isn't worth it.
- Decorative background motifs (`m-radar`, `m-bars`, `m-aurora`, `m-stripes`, `m-eq`, `m-signal`) are ported as plain CSS `@keyframes`, consolidated behind one `<SectionMotif variant="...">` component instead of six near-duplicate blocks of markup. They were never GSAP-driven, so this isn't a scope violation of "GSAP → Framer Motion" — there's nothing to convert.

## File Structure

```
app/
  layout.tsx            - root layout: fonts (next/font/google), metadata, GrainOverlay, FloatingCV
  page.tsx              - assembles all homepage sections
  globals.css           - Tailwind import, @theme color/font tokens, custom CSS for motifs/spotlight/grain
lib/
  useMediaQuery.ts       - matchMedia hook (breakpoint + hover-capability checks)
  useCountUp.ts          - ease-out count-up hook, triggered by Framer Motion onViewportEnter
  useScramble.ts         - scramble-on-hover text hook
  useSpotlight.ts        - mouse-tracked --sx/--sy CSS var hook (spotlight-border hover)
  useMagnetic.ts         - magnetic-pull hook (Framer Motion useMotionValue + useSpring)
  useLiveWhenVisible.ts  - IntersectionObserver hook, toggles a "live" class so per-section
                           motif CSS animations pause when the section is off-screen
components/
  GrainOverlay.tsx
  Clock.tsx
  Nav.tsx
  SectionMotif.tsx
  SpotlightCard.tsx
  HoverScrollShot.tsx    - shared "hover to scroll screenshot" card (Terra + Work sections)
  HeroCanvasFlow.tsx     - canvas contour-line background (plain canvas, not Framer Motion)
  Hero.tsx
  StatStrip.tsx
  About.tsx
  TerraStack.tsx         - the sticky-stack scroll mechanism, isolated from TerraTeaser's content
  TerraTeaser.tsx
  BongTeaser.tsx
  WorkSection.tsx
  VideoTeaser.tsx
  VideoLightbox.tsx
  Contact.tsx
  Footer.tsx
  FloatingCV.tsx
public/
  CV.pdf, favicon*, apple-touch-icon.png, icon-192.png, icon-512.png, images/  (moved as-is)
  terra.html, video.html, bong-vespera.html, pati-challenge/                  (moved as-is, untouched)
next.config.ts           - output: 'export', images.unoptimized: true
.github/workflows/deploy.yml
```

`index.html` at the repo root is deleted once its content lives in `app/page.tsx` + components.

---

### Task 1: Scaffold the Next.js project and merge it into the repo

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`, `app/layout.tsx` (temporary default), `app/page.tsx` (temporary default), `app/globals.css` (temporary default)
- Modify: `.gitignore` (add `node_modules/`, `.next/`, `out/`)

- [ ] **Step 1: Scaffold into a temporary sibling directory**

The repo root already has files (`index.html`, `images/`, `CV.pdf`, `.git`, etc.), so `create-next-app` will refuse to run in place. Scaffold next to it instead:

```bash
cd /d/code
npx create-next-app@latest _scaffold --typescript --tailwind --eslint --app --import-alias "@/*" --use-npm --disable-git --empty --yes
```

Expected: a `_scaffold/` directory is created with `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `public/`, `.gitignore`.

- [ ] **Step 2: Move the generated project files into the repo root**

```bash
cd /d/code
mv _scaffold/package.json _scaffold/package-lock.json _scaffold/tsconfig.json _scaffold/next.config.ts _scaffold/postcss.config.mjs _scaffold/eslint.config.mjs _scaffold/next-env.d.ts jak3rpham.github.io/
mv _scaffold/app jak3rpham.github.io/app
rm -rf _scaffold
```

Expected: `jak3rpham.github.io/` now has `app/`, `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`, alongside the pre-existing `index.html`, `images/`, `CV.pdf`, etc. Do not overwrite the existing `public/` folder — it doesn't exist yet at this point, so there's nothing to conflict with (assets move into it in Task 9).

- [ ] **Step 3: Update `.gitignore`**

```
.superpowers/
.claude/
node_modules/
.next/
out/
```

- [ ] **Step 4: Install dependencies and add Framer Motion**

```bash
cd /d/code/jak3rpham.github.io
npm install
npm install framer-motion
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 5: Verify the dev server boots**

```bash
npm run dev
```

Expected: Next.js dev server starts on `http://localhost:3000` showing the default scaffolded page, no errors in the terminal.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs next-env.d.ts app .gitignore
git commit -m "Scaffold Next.js + TypeScript + Tailwind project"
```

---

### Task 2: Design tokens, fonts, and global styles

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-ink: #0F140F;
  --color-cream: #F2F4E9;
  --color-tan: #D9E0C8;
  --color-sand: #A9BC92;
  --color-clay: #7FA773;
  --color-forest: #8FD49E;
  --color-amber: #6FBE7F;
  --color-panel: rgba(22, 30, 22, 0.52);
  --color-panel-border: rgba(180, 205, 160, 0.2);
  --color-rule: rgba(180, 205, 160, 0.2);

  --font-sans: "Outfit", sans-serif;
  --font-serif-jp: "Noto Serif JP", serif;
  --font-mono: "DM Mono", monospace;
}

:root {
  --pad: clamp(1.6rem, 5vw, 5rem);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--color-ink);
  color: var(--color-cream);
  font-family: var(--font-sans);
  overflow-x: hidden;
  line-height: 1.7;
}

a {
  color: inherit;
  text-decoration: none;
}

.font-serif-jp {
  font-family: var(--font-serif-jp);
}

.font-mono {
  font-family: var(--font-mono);
}

/* grain overlay texture */
.grain-bg {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px;
}

/* spotlight-border hover (About stack cards, Terra/Work shots, feature panels) */
.spotlight {
  position: relative;
  --sx: 50%;
  --sy: 50%;
}
.spotlight::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  pointer-events: none;
  z-index: 5;
  background: radial-gradient(240px circle at var(--sx) var(--sy), rgba(143, 212, 158, 0.85), rgba(180, 205, 160, 0.08) 60%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.spotlight:hover::before {
  opacity: 1;
}

/* per-section decorative background layer */
.sbg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.motif {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}
.motif-radar {
  top: 9%;
  right: 7%;
  width: min(28vw, 340px);
  aspect-ratio: 1;
  opacity: 0.6;
}
.motif-radar span {
  position: absolute;
  inset: 0;
  border: 1px solid var(--color-forest);
  border-radius: 50%;
  opacity: 0;
}
.live .motif-radar span {
  animation: radar 4.2s ease-out infinite;
}
.motif-radar span:nth-child(2) {
  animation-delay: 1.4s;
}
.motif-radar span:nth-child(3) {
  animation-delay: 2.8s;
}
@keyframes radar {
  0% {
    transform: scale(0.08);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
.motif-radar i {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0 290deg, rgba(121, 180, 136, 0.22) 360deg);
}
.live .motif-radar i {
  animation: spin 7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.motif-bars {
  bottom: 0;
  right: 5%;
  width: min(30vw, 360px);
  height: 42%;
  display: flex;
  align-items: flex-end;
  gap: 5%;
  opacity: 0.4;
}
.motif-bars span {
  flex: 1;
  background: linear-gradient(var(--color-forest), transparent);
  border-radius: 4px 4px 0 0;
  transform-origin: bottom;
  transform: scaleY(var(--h, 0.4));
}
.live .motif-bars span {
  animation: bars 3.2s ease-in-out infinite;
}
@keyframes bars {
  0%,
  100% {
    transform: scaleY(var(--h, 0.4));
  }
  50% {
    transform: scaleY(calc(var(--h, 0.4) * 1.6));
  }
}
.motif-aurora {
  top: -12%;
  left: -6%;
  width: 62%;
  height: 88%;
  background: conic-gradient(from 90deg, rgba(60, 130, 90, 0.42), rgba(143, 212, 158, 0.3), rgba(40, 95, 65, 0.42), rgba(60, 130, 90, 0.42));
  filter: blur(70px);
  border-radius: 48% 52% 55% 45%;
}
.live .motif-aurora {
  animation: spin 26s linear infinite;
}
.tw {
  position: absolute;
  z-index: 1;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-amber);
  box-shadow: 0 0 12px var(--color-amber);
  opacity: 0.4;
  pointer-events: none;
}
.live .tw {
  animation: twk 3s ease-in-out infinite;
}
@keyframes twk {
  0%,
  100% {
    opacity: 0.15;
    transform: scale(0.7);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.3);
  }
}
.motif-stripes {
  inset: 0;
  background: repeating-linear-gradient(60deg, rgba(180, 205, 160, 0.07) 0 2px, transparent 2px 28px);
  opacity: 0.6;
}
.live .motif-stripes {
  animation: stripeMove 7s linear infinite;
}
@keyframes stripeMove {
  to {
    background-position: 130px 0;
  }
}
.motif-eq {
  bottom: 0;
  left: 0;
  right: 0;
  height: 32%;
  display: flex;
  align-items: flex-end;
  gap: 0.9%;
  padding: 0 var(--pad);
  opacity: 0.32;
}
.motif-eq span {
  flex: 1;
  background: linear-gradient(var(--color-amber), var(--color-forest));
  transform-origin: bottom;
  transform: scaleY(0.15);
  border-radius: 2px;
}
.live .motif-eq span {
  animation: eq 1.2s ease-in-out infinite;
}
@keyframes eq {
  0%,
  100% {
    transform: scaleY(0.12);
  }
  50% {
    transform: scaleY(1);
  }
}
.motif-signal {
  bottom: 8%;
  left: 7%;
  width: min(26vw, 300px);
  aspect-ratio: 1;
  opacity: 0.6;
}
.motif-signal span {
  position: absolute;
  inset: 0;
  border: 1px solid var(--color-amber);
  border-radius: 50%;
  opacity: 0;
}
.live .motif-signal span {
  animation: radar 4.6s ease-out infinite;
}
.motif-signal span:nth-child(2) {
  animation-delay: 1.5s;
}
.motif-signal span:nth-child(3) {
  animation-delay: 3s;
}

@media (prefers-reduced-motion: reduce) {
  .spotlight::before {
    display: none;
  }
  .motif span,
  .motif i,
  .motif-aurora,
  .tw,
  .motif-stripes {
    animation: none;
  }
}
```

- [ ] **Step 2: Load fonts and mount `GrainOverlay` in `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Outfit, Noto_Serif_JP, DM_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-outfit" });
const notoSerifJP = Noto_Serif_JP({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-noto-serif-jp" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: "Tatsuki · Pham Ngoc Thanh / Digital Marketing & Creative",
  description:
    "Pham Ngoc Thanh (Tatsuki), Digital Marketing Strategist building full-funnel campaigns for B2B SaaS. SEO, performance, video. Ho Chi Minh City.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${notoSerifJP.variable} ${dmMono.variable}`}>
      <body>
        <div aria-hidden className="grain-bg pointer-events-none fixed inset-0 z-[60] opacity-[0.022]" />
        {children}
      </body>
    </html>
  );
}
```

Note: this inline `<div className="grain-bg ...">` is a placeholder until Task 4, where the real `GrainOverlay` component is created and swapped in.

- [ ] **Step 3: Run dev server, confirm fonts load and background is dark green-black**

```bash
npm run dev
```

Expected: `http://localhost:3000` shows a dark background (`#0F140F`) with cream text in the Outfit font, no console errors about missing fonts.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "Add design tokens, fonts, and motif/spotlight CSS"
```

---

### Task 3: Shared hooks with unit tests

**Files:**
- Create: `lib/useMediaQuery.ts`, `lib/useMediaQuery.test.ts`
- Create: `lib/useCountUp.ts`, `lib/useCountUp.test.ts`
- Create: `lib/useScramble.ts`
- Create: `lib/useSpotlight.ts`
- Create: `lib/useMagnetic.ts`
- Create: `lib/useLiveWhenVisible.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Add Vitest config**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

```bash
npm install -D @vitejs/plugin-react
```

Add to `package.json` scripts:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write `lib/useMediaQuery.ts`**

```ts
"use client";
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
```

- [ ] **Step 3: Write the failing test for `useMediaQuery`**

```ts
// lib/useMediaQuery.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery";

function mockMatchMedia(initialMatches: boolean) {
  const listeners: Array<() => void> = [];
  const mql = {
    matches: initialMatches,
    addEventListener: (_: string, cb: () => void) => listeners.push(cb),
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return {
    mql,
    trigger(next: boolean) {
      mql.matches = next;
      listeners.forEach((cb) => cb());
    },
  };
}

describe("useMediaQuery", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the initial match state", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("updates when the media query changes", () => {
    const { trigger } = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
    act(() => trigger(true));
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 4: Run the test**

```bash
npx vitest run lib/useMediaQuery.test.ts
```

Expected: 2 passed.

- [ ] **Step 5: Write `lib/useCountUp.ts`**

```ts
"use client";
import { useRef, useState } from "react";

export function useCountUp(to: number, decimals = 0, duration = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  function start() {
    if (started.current) return;
    started.current = true;
    const t0 = performance.now();
    function step(now: number) {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Number((to * eased).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return { value, start };
}
```

- [ ] **Step 6: Write the failing test for `useCountUp`**

```ts
// lib/useCountUp.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCountUp } from "./useCountUp";

describe("useCountUp", () => {
  it("is idempotent: calling start twice only schedules one animation", () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0);
    const { result } = renderHook(() => useCountUp(100));
    act(() => {
      result.current.start();
      result.current.start();
    });
    expect(rafSpy).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 7: Run the test**

```bash
npx vitest run lib/useCountUp.test.ts
```

Expected: 1 passed.

- [ ] **Step 8: Write `lib/useScramble.ts`**

```ts
"use client";
import { useRef, useState } from "react";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#";

export function useScramble(finalText: string) {
  const [display, setDisplay] = useState(finalText);
  const [isScrambling, setIsScrambling] = useState(false);
  const scrambling = useRef(false);

  function trigger() {
    if (scrambling.current) return;
    scrambling.current = true;
    setIsScrambling(true);
    const queue = [...finalText].map((ch) => ({
      to: ch,
      start: Math.floor(Math.random() * 8),
      end: Math.floor(Math.random() * 8) + 10,
      char: "",
    }));
    let frame = 0;
    function update() {
      let out = "";
      let done = 0;
      queue.forEach((q) => {
        if (frame >= q.end) {
          done++;
          out += q.to;
        } else if (frame >= q.start) {
          if (q.to === " ") q.char = " ";
          else if (!q.char || Math.random() < 0.28) {
            q.char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
          out += q.char;
        } else {
          out += " ";
        }
      });
      setDisplay(out);
      if (done < queue.length) {
        frame++;
        requestAnimationFrame(update);
      } else {
        setDisplay(finalText);
        scrambling.current = false;
        setIsScrambling(false);
      }
    }
    update();
  }

  return { display, isScrambling, trigger };
}
```

- [ ] **Step 9: Write `lib/useSpotlight.ts`**

```ts
"use client";
import { useRef } from "react";
import type { MouseEvent } from "react";

export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  function onMouseMove(e: MouseEvent<T>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  }

  return { ref, onMouseMove };
}
```

- [ ] **Step 10: Write `lib/useMagnetic.ts`**

```ts
"use client";
import { useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import type { MouseEvent } from "react";

export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springOpts = { stiffness: 300, damping: 20, mass: 0.5 };
  const springX = useSpring(x, springOpts);
  const springY = useSpring(y, springOpts);

  function onMouseMove(e: MouseEvent<T>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return { ref, style: { x: springX, y: springY }, onMouseMove, onMouseLeave };
}
```

- [ ] **Step 11: Write `lib/useLiveWhenVisible.ts`**

```ts
"use client";
import { useEffect, useRef, useState } from "react";

export function useLiveWhenVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, live };
}
```

- [ ] **Step 12: Run the full test suite and commit**

```bash
npm run test
git add lib vitest.config.ts package.json package-lock.json
git commit -m "Add shared animation/interaction hooks with unit tests"
```

---

### Task 4: `GrainOverlay`, `Clock`, `SpotlightCard`, `SectionMotif`, `HoverScrollShot`

**Files:**
- Create: `components/GrainOverlay.tsx`
- Create: `components/Clock.tsx`, `components/Clock.test.ts`
- Create: `components/SpotlightCard.tsx`
- Create: `components/SectionMotif.tsx`
- Create: `components/HoverScrollShot.tsx`
- Modify: `app/layout.tsx` (use real `GrainOverlay`)

- [ ] **Step 1: `components/GrainOverlay.tsx`**

```tsx
export function GrainOverlay() {
  return <div aria-hidden className="grain-bg pointer-events-none fixed inset-0 z-[60] opacity-[0.022]" />;
}
```

- [ ] **Step 2: Write the failing test for the clock formatter**

```ts
// components/Clock.test.ts
import { describe, expect, it } from "vitest";
import { formatHCMC } from "./Clock";

describe("formatHCMC", () => {
  it("shifts UTC time by +7 hours and pads to HH:MM:SS", () => {
    const utcMidnight = new Date(Date.UTC(2026, 0, 1, 0, 0, 5));
    expect(formatHCMC(utcMidnight)).toBe("HCMC 07:00:05");
  });

  it("wraps correctly across a day boundary", () => {
    const lateUtc = new Date(Date.UTC(2026, 0, 1, 23, 30, 0));
    expect(formatHCMC(lateUtc)).toBe("HCMC 06:30:00");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run components/Clock.test.ts
```

Expected: FAIL — `formatHCMC` is not exported / module doesn't exist yet.

- [ ] **Step 4: Write `components/Clock.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";

export function formatHCMC(date: Date): string {
  const shifted = new Date(date.getTime() + 7 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `HCMC ${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}`;
}

export function Clock() {
  const [label, setLabel] = useState("HCMC 00:00:00");

  useEffect(() => {
    setLabel(formatHCMC(new Date()));
    const id = setInterval(() => setLabel(formatHCMC(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute right-[var(--pad)] top-[4.4rem] z-[6] font-mono text-[0.68rem] uppercase tracking-[0.16em] text-sand">
      {label}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run components/Clock.test.ts
```

Expected: 2 passed.

- [ ] **Step 6: `components/SpotlightCard.tsx`**

```tsx
"use client";
import { useSpotlight } from "@/lib/useSpotlight";
import type { ReactNode } from "react";

export function SpotlightCard({ className, children }: { className?: string; children: ReactNode }) {
  const { ref, onMouseMove } = useSpotlight<HTMLDivElement>();
  return (
    <div ref={ref} onMouseMove={onMouseMove} className={`spotlight ${className ?? ""}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 7: `components/SectionMotif.tsx`**

```tsx
type MotifVariant = "radar" | "bars" | "aurora" | "stripes" | "eq" | "signal";

const BAR_HEIGHTS = [0.32, 0.55, 0.4, 0.72, 0.48, 0.85, 0.42];
const BAR_DELAYS = [0, 0.4, 0.8, 0.2, 0.6, 0.3, 0.7];
const EQ_DELAYS = [0, 0.3, 0.6, 0.2, 0.5, 0.85, 0.1, 0.45, 0.7, 0.25, 0.55, 0.9, 0.15, 0.4, 0.65, 0.35];

export function SectionMotif({ variant }: { variant: MotifVariant }) {
  if (variant === "radar") {
    return (
      <div className="sbg">
        <div className="motif motif-radar">
          <span />
          <span />
          <span />
          <i />
        </div>
      </div>
    );
  }
  if (variant === "bars") {
    return (
      <div className="sbg">
        <div className="motif motif-bars">
          {BAR_HEIGHTS.map((h, i) => (
            <span key={i} style={{ "--h": h, animationDelay: `${BAR_DELAYS[i]}s` } as React.CSSProperties} />
          ))}
        </div>
      </div>
    );
  }
  if (variant === "aurora") {
    return (
      <div className="sbg">
        <div className="motif motif-aurora" />
        <span className="tw" style={{ top: "28%", left: "58%" }} />
        <span className="tw" style={{ top: "52%", left: "42%" }} />
        <span className="tw" style={{ top: "68%", left: "64%" }} />
      </div>
    );
  }
  if (variant === "stripes") {
    return (
      <div className="sbg">
        <div className="motif motif-stripes" />
      </div>
    );
  }
  if (variant === "eq") {
    return (
      <div className="sbg">
        <div className="motif motif-eq">
          {EQ_DELAYS.map((d, i) => (
            <span key={i} style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="sbg">
      <div className="motif motif-signal">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
```

- [ ] **Step 8: `components/HoverScrollShot.tsx`**

This renders only the top-bar + hover-pan image unit, **without** its own outer border/background/rounded-corners — the caller supplies that frame (via `SpotlightCard`'s `className`), since some callers (Terra's featured shot) want just the image framed, while others (Work's compact cards) want the frame to wrap the image *and* the text content below it in one bordered card, matching the original's single `.work-compact-card.shot` element. Giving `HoverScrollShot` its own border too would nest a second border/background inside the caller's, doubling both.

```tsx
export function HoverScrollShot({ src, alt, urlLabel }: { src: string; alt: string; urlLabel: string }) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 border-b border-rule bg-black/30 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-clay" />
        <span className="h-2.5 w-2.5 rounded-full bg-clay" />
        <span className="h-2.5 w-2.5 rounded-full bg-clay" />
        <span className="ml-2 font-mono text-[0.64rem] text-sand">{urlLabel}</span>
      </div>
      <div className="relative h-[460px] overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute left-0 top-0 w-full transition-transform duration-[6000ms] ease-out group-hover:translate-y-[calc(460px-100%)]"
        />
        <span className="absolute right-3 top-2.5 z-[2] hidden rounded bg-black/55 px-2 py-1 font-mono text-[0.5rem] uppercase tracking-[0.08em] text-cream opacity-90 [@media(hover:hover)]:block">
          hover to scroll ↓
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Wire `GrainOverlay` into `app/layout.tsx`**

Replace the inline `<div className="grain-bg ...">` placeholder from Task 2 with:

```tsx
import { GrainOverlay } from "@/components/GrainOverlay";
// ...
<body>
  <GrainOverlay />
  {children}
</body>
```

- [ ] **Step 10: Run tests and commit**

```bash
npm run test
git add components app/layout.tsx
git commit -m "Add GrainOverlay, Clock, SpotlightCard, SectionMotif, HoverScrollShot"
```

---

### Task 5: `Nav`

**Files:**
- Create: `components/Nav.tsx`
- Modify: `app/layout.tsx` (mount `<Nav />`)

- [ ] **Step 1: Write `components/Nav.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMagnetic } from "@/lib/useMagnetic";
import { useMediaQuery } from "@/lib/useMediaQuery";

const SECTIONS = ["about", "terra", "contact"] as const;
type SectionId = (typeof SECTIONS)[number];

function PillLink({ id, label, active }: { id: SectionId; label: string; active: boolean }) {
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const magnetic = useMagnetic<HTMLAnchorElement>(0.3);
  return (
    <motion.a
      href={`#${id}`}
      ref={magnetic.ref}
      onMouseMove={hoverCapable ? magnetic.onMouseMove : undefined}
      onMouseLeave={hoverCapable ? magnetic.onMouseLeave : undefined}
      style={hoverCapable ? magnetic.style : undefined}
      className={`relative z-[2] whitespace-nowrap rounded-full px-4 py-2 text-[0.7rem] transition-colors ${
        active ? "text-ink" : "text-sand hover:text-cream"
      }`}
    >
      {active && (
        <motion.span
          layoutId="pill-indicator"
          className="absolute inset-0 -z-10 rounded-full bg-forest"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      {label}
    </motion.a>
  );
}

export function Nav() {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const targets = SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent px-[var(--pad)] py-[1.1rem] font-mono text-[0.7rem] uppercase tracking-[0.14em] text-sand">
      <a href="#hero" className="flex items-center gap-2 text-cream">
        Tatsuki <b className="font-serif-jp text-forest">達樹</b>
      </a>
      <div className="relative hidden gap-0.5 rounded-full border border-panel-border bg-panel p-1 backdrop-blur-md sm:flex">
        <PillLink id="about" label="About" active={active === "about"} />
        <PillLink id="terra" label="Work" active={active === "terra"} />
        <a href="/video.html" className="relative z-[2] rounded-full px-4 py-2 text-sand hover:text-cream">
          Video
        </a>
        <PillLink id="contact" label="Contact" active={active === "contact"} />
        <a href="/CV.pdf" className="relative z-[2] rounded-full px-4 py-2 text-sand hover:text-cream">
          ↓ CV
        </a>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Mount in `app/layout.tsx`**

```tsx
import { Nav } from "@/components/Nav";
// ...
<body>
  <GrainOverlay />
  <Nav />
  {children}
</body>
```

- [ ] **Step 3: Manual check in dev server**

Run `npm run dev`, open the page, confirm the nav is fixed to the top, pills are visible on desktop widths, hidden below `sm` (640px). Scroll-spy indicator can't be checked yet (no `#about`/`#terra`/`#contact` sections exist until Task 12).

- [ ] **Step 4: Commit**

```bash
git add components/Nav.tsx app/layout.tsx
git commit -m "Add Nav with scroll-spy pill indicator and magnetic hover"
```

---

### Task 6: `HeroCanvasFlow` and `Hero`

**Files:**
- Create: `components/HeroCanvasFlow.tsx`
- Create: `components/Hero.tsx`

- [ ] **Step 1: `components/HeroCanvasFlow.tsx`**

```tsx
"use client";
import { useEffect, useRef } from "react";

const LINES = 28;

export function HeroCanvasFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !hero || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let t = 0;
    let visible = true;
    let raf = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = hero!.clientWidth;
      height = hero!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      ctx!.clearRect(0, 0, width, height);
      for (let i = 0; i < LINES; i++) {
        const f = i / (LINES - 1);
        const yBase = height * f;
        ctx!.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const y =
            yBase +
            Math.sin(x * 0.0042 + t + i * 0.55) * 26 * Math.sin(t * 0.25 + i * 0.3) +
            Math.cos(x * 0.0021 - t * 0.6 + i) * 15;
          if (x === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = `rgba(${Math.round(150 - 58 * f)},${Math.round(206 - 44 * f)},${Math.round(150 - 52 * f)},0.2)`;
        ctx!.lineWidth = 1.1;
        ctx!.stroke();
      }
      t += 0.01;
      if (!reduceMotion && visible) raf = requestAnimationFrame(frame);
    }
    if (!reduceMotion) raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(
      ([entry]) => {
        const was = visible;
        visible = entry.isIntersecting && !document.hidden;
        if (visible && !was && !reduceMotion) raf = requestAnimationFrame(frame);
      },
      { threshold: 0 }
    );
    io.observe(hero);

    function onVisibilityChange() {
      const was = visible;
      visible = !document.hidden;
      if (visible && !was && !reduceMotion) raf = requestAnimationFrame(frame);
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}
```

- [ ] **Step 2: `components/Hero.tsx`**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useScramble } from "@/lib/useScramble";
import { useCountUp } from "@/lib/useCountUp";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { HeroCanvasFlow } from "./HeroCanvasFlow";
import { Clock } from "./Clock";

function Telemetry({ to, decimals = 0, suffix = "", label }: { to: number; decimals?: number; suffix?: string; label: string }) {
  const countUp = useCountUp(to, decimals);
  useEffect(() => {
    const id = setTimeout(() => countUp.start(), 300);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="flex-1 border-r border-rule py-4 pr-5 last:border-r-0">
      <div className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-4xl font-semibold leading-none text-transparent">
        {countUp.value.toFixed(decimals)}
        {suffix}
      </div>
      <div className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-sand">{label}</div>
    </div>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const { display, isScrambling, trigger } = useScramble("Pham Ngoc Thanh");

  const mainX = useMotionValue(0);
  const mainY = useMotionValue(0);
  const portraitX = useMotionValue(0);
  const portraitY = useMotionValue(0);
  const springOpts = { stiffness: 120, damping: 20, mass: 0.6 };
  const mainSX = useSpring(mainX, springOpts);
  const mainSY = useSpring(mainY, springOpts);
  const portraitSX = useSpring(portraitX, springOpts);
  const portraitSY = useSpring(portraitY, springOpts);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduceMotion || !hoverCapable) return;
    const hero = heroRef.current;
    if (!hero) return;
    function onMove(e: MouseEvent) {
      const r = hero!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      mainX.set(px * 4);
      mainY.set(py * 4);
      portraitX.set(px * 14);
      portraitY.set(py * 14);
    }
    function onLeave() {
      mainX.set(0);
      mainY.set(0);
      portraitX.set(0);
      portraitY.set(0);
    }
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion, hoverCapable]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative z-[4] grid min-h-screen grid-cols-1 items-center gap-8 overflow-hidden px-[var(--pad)] pb-16 pt-24 md:grid-cols-[1.5fr_1fr]"
    >
      <HeroCanvasFlow />
      <div className="absolute left-[var(--pad)] top-[4.4rem] z-[6] flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-sand">
        <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-forest shadow-[0_0_10px_var(--color-forest)]" />
        Available 2026 · HCMC
      </div>
      <Clock />
      <motion.div
        style={{ x: mainSX, y: mainSY }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[2]"
      >
        <h1
          className="mb-2.5 pb-[0.12em] text-[clamp(3.4rem,8vw,7.5rem)] font-bold leading-[1.02] tracking-[-0.035em] text-cream [text-shadow:0_2px_50px_rgba(20,13,7,0.6)]"
          onMouseEnter={hoverCapable && !reduceMotion ? trigger : undefined}
        >
          {isScrambling ? (
            display
          ) : (
            <>
              Pham Ngoc <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">Thanh</span>
            </>
          )}
        </h1>
        <div className="mb-7 flex items-center gap-4">
          <span className="font-serif-jp text-[1.7rem] font-bold tracking-[0.16em] text-forest">達樹 / Tatsuki</span>
          <span className="h-px w-[60px] flex-none bg-rule" />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-sand">Digital × Creative</span>
        </div>
        <p className="mb-9 max-w-[32ch] text-[clamp(1.15rem,1.6vw,1.4rem)] font-light leading-[1.7] text-tan">
          Digital marketing strategist for B2B SaaS. I build{" "}
          <strong className="font-medium text-cream">full-funnel systems</strong> for compounding, measurable growth.
        </p>
        <div className="flex max-w-[580px]">
          <Telemetry to={12} suffix="×" label="Organic growth" />
          <Telemetry to={978} label="Keywords top 10" />
          <Telemetry to={31.4} decimals={1} suffix="M" label="Impressions" />
        </div>
      </motion.div>
      <motion.div
        style={{ x: portraitSX, y: portraitSY }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[2] aspect-square w-[min(34vw,400px)] justify-self-center"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[14px] border border-panel-border shadow-[0_22px_60px_rgba(0,0,0,0.4),0_0_55px_rgba(120,200,140,0.16)]">
          <img
            src="/images/photo2.webp"
            alt="Pham Ngoc Thanh"
            className="relative z-[1] h-full w-full object-cover [filter:saturate(0.92)_contrast(1.03)]"
          />
        </div>
        <span className="absolute bottom-[0.6rem] right-[0.9rem] z-[2] font-serif-jp text-[3.2rem] font-black text-cream [text-shadow:0_2px_20px_rgba(20,13,7,0.6)]">
          達樹
        </span>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 3: Manual check** — mount `<Hero />` temporarily in `app/page.tsx`, run `npm run dev`, confirm: canvas contour lines animate, hovering the name scrambles then resolves, moving the mouse over the hero parallaxes the text/portrait slightly, the three telemetry numbers count up ~0.3s after load.

- [ ] **Step 4: Commit**

```bash
git add components/HeroCanvasFlow.tsx components/Hero.tsx
git commit -m "Add Hero with canvas flow background, scramble name, parallax, count-up stats"
```

---

### Task 7: `StatStrip` and `About`

**Files:**
- Create: `components/StatStrip.tsx`
- Create: `components/About.tsx`

- [ ] **Step 1: `components/StatStrip.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";

const ITEMS = ["Technical SEO", "12× Organic Growth", "31.4M Impressions", "978 Keywords Top 10"];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function StatStrip() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className="relative z-[4] flex flex-wrap justify-center gap-x-9 gap-y-2 border-y border-rule bg-black/30 px-[var(--pad)] py-5"
    >
      {ITEMS.map((label) => (
        <motion.div key={label} variants={item} className="font-mono text-[0.78rem] uppercase tracking-[0.1em] text-sand">
          <b className="font-medium text-amber">{label}</b>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

- [ ] **Step 2: `components/About.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { useCountUp } from "@/lib/useCountUp";
import { SpotlightCard } from "./SpotlightCard";
import { SectionMotif } from "./SectionMotif";
import { useLiveWhenVisible } from "@/lib/useLiveWhenVisible";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

function Fact({
  label,
  sparkPoints,
  to,
  decimals = 0,
  suffix = "",
  staticValue,
}: {
  label: string;
  sparkPoints?: string;
  to?: number;
  decimals?: number;
  suffix?: string;
  staticValue?: string;
}) {
  const countUp = useCountUp(to ?? 0, decimals);
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rule py-[0.95rem] first:border-t">
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.1em] text-sand">{label}</span>
      <span className="flex items-center gap-2.5 text-2xl font-semibold text-cream">
        {sparkPoints && (
          <svg className="h-[15px] w-14" viewBox="0 0 56 15">
            <polyline points={sparkPoints} fill="none" stroke="#79B488" strokeWidth="1.4" />
          </svg>
        )}
        <motion.b
          className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text font-bold text-transparent"
          viewport={{ once: true, amount: 0.5 }}
          onViewportEnter={to !== undefined ? () => countUp.start() : undefined}
        >
          {staticValue ?? `${countUp.value.toFixed(decimals)}${suffix}`}
        </motion.b>
      </span>
    </div>
  );
}

const STACK = [
  ["01", "Growth & SEO", "Technical SEO · Schema/CWV · Paid Media"],
  ["02", "Analytics & Data", "GA4/GSC/Clarity · Semrush/Ahrefs · Power BI"],
  ["03", "Creative & Production", "Video · Adobe Suite · Photography"],
  ["04", "Build & AI", "WordPress/Elementor · AI Workflows · MCP"],
];

export function About() {
  const { ref, live } = useLiveWhenVisible<HTMLElement>();
  return (
    <section ref={ref} id="about" className={`sec relative z-[4] overflow-hidden ${live ? "live" : ""}`}>
      <SectionMotif variant="radar" />
      <div className="relative z-[2] px-[var(--pad)] py-[clamp(5rem,9vw,7.5rem)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-11 flex flex-wrap items-end justify-between gap-8 border-b border-rule pb-6"
        >
          <h2 className="relative pl-5 text-[clamp(2.8rem,5.6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream before:absolute before:bottom-[0.1em] before:left-0 before:top-[0.1em] before:w-1.5 before:rounded before:bg-gradient-to-r before:from-[#D2E8B4] before:to-[#6FBE7F]">
            Who I <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">am</span>
          </h2>
          <div className="text-right font-mono text-[0.66rem] uppercase leading-[1.8] tracking-[0.14em] text-sand">
            22 · Cancer · INTJ-T
            <br />
            HCMC, Vietnam
          </div>
        </motion.div>

        <div className="mb-11 grid grid-cols-1 gap-8 md:grid-cols-[1.5fr_1fr] md:items-start">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <p className="mb-6 max-w-[24ch] text-[clamp(1.5rem,2.6vw,2.3rem)] font-normal leading-[1.4] tracking-[-0.01em] text-cream">
              I build{" "}
              <strong className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text font-semibold text-transparent">
                full-funnel growth systems
              </strong>{" "}
              for B2B SaaS, where strategy and craft meet.
            </p>
            <p className="mb-5 max-w-[54ch] text-[1.18rem] font-light leading-[1.85] text-tan">
              Digital marketing professional at{" "}
              <strong className="font-medium text-cream">I-Glocal Co., Ltd. (Vina Payroll Outsourcing)</strong>, leading the marketing
              build for{" "}
              <a href="https://terra-plat.vn" target="_blank" rel="noreferrer" className="border-b border-forest/40 text-forest">
                terra-plat.vn
              </a>
              . In 17 months I&apos;ve owned the full stack: technical SEO, content architecture, analytics, paid, AI-assisted
              production, and creative.
            </p>
            <p className="max-w-[54ch] text-[1.18rem] font-light leading-[1.85] text-tan">
              International Business at UEH ISB. VP of <strong className="font-medium text-cream">L.O.M Music Club</strong>, Head of
              Media at <strong className="font-medium text-cream">S Communications</strong>: teams of 6 to 50, 10+ events, 800+
              participants. <strong className="font-medium text-cream">Top 1 TVC at Business Challenge 2023 &amp; 2024.</strong>
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1 }}
          >
            <Fact label="Organic growth" sparkPoints="0,13 15,10 30,7 43,4 56,1" to={12} suffix="×" />
            <Fact label="Keywords top 10" sparkPoints="0,12 17,10 31,6 44,5 56,2" to={978} />
            <Fact label="Impressions" sparkPoints="0,13 15,12 30,8 43,5 56,1" to={31.4} decimals={1} suffix="M" />
            <Fact label="Events produced" staticValue="10+" />
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1 }}
          className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {STACK.map(([n, name, tools]) => (
            <SpotlightCard
              key={n}
              className="rounded-[14px] border border-panel-border bg-panel p-6 backdrop-blur-md transition-transform hover:-translate-y-1 hover:border-forest"
            >
              <span className="mb-2 block font-serif-jp text-xl font-bold text-forest">{n}</span>
              <div className="mb-1 text-[1.05rem] font-semibold text-cream">{name}</div>
              <div className="font-mono text-[0.64rem] text-sand">{tools}</div>
            </SpotlightCard>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="border-t border-rule pt-5 font-mono text-[0.66rem] uppercase tracking-[0.13em] text-sand"
        >
          EST. HCMC · UEH ISB B.Intl Business 2025 · IELTS 7.0 C1
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/StatStrip.tsx components/About.tsx
git commit -m "Add StatStrip and About sections"
```

---

### Task 8: `TerraStack` (sticky-stack scroll mechanism) and `TerraTeaser`

**Files:**
- Create: `components/TerraStack.tsx`
- Create: `components/TerraTeaser.tsx`

- [ ] **Step 1: `components/TerraStack.tsx`**

```tsx
"use client";
import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

function StackCard({ index, total, children }: { index: number; total: number; children: ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isLast = index === total - 1;
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.4]);
  const blurPx = useTransform(scrollYProgress, [0, 1], [0, isLast ? 0 : 2]);
  const filter = useTransform(blurPx, (b) => `blur(${b}px)`);

  return (
    <div ref={cardRef} className="sticky top-0 flex min-h-[56vh] items-center justify-center py-6">
      <motion.div style={{ scale, opacity, filter }} className="w-full [&>*]:shadow-[0_26px_60px_rgba(0,0,0,0.45)]">
        {children}
      </motion.div>
    </div>
  );
}

export function TerraStack({ children }: { children: ReactNode[] }) {
  const disableStack = useMediaQuery("(max-width: 767px)");
  const reduceMotion = useReducedMotion();

  if (disableStack || reduceMotion) {
    return <div className="flex flex-col gap-6">{children}</div>;
  }

  return (
    <div id="terraStack" className="relative">
      {children.map((child, i) => (
        <StackCard key={i} index={i} total={children.length}>
          {child}
        </StackCard>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: `components/TerraTeaser.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { TerraStack } from "./TerraStack";
import { SpotlightCard } from "./SpotlightCard";
import { HoverScrollShot } from "./HoverScrollShot";
import { SectionMotif } from "./SectionMotif";
import { useLiveWhenVisible } from "@/lib/useLiveWhenVisible";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

const CHART_PATH =
  "M0.0,138.0 L46.2,129.9 L92.3,124.4 L138.5,133.8 L184.6,137.0 L230.8,129.2 L276.9,60.8 L323.1,29.7 L369.2,103.7 L415.4,97.7 L461.5,55.1 L507.7,31.3 L553.8,88.7 L600.0,12.0";
const AREA_PATH = `${CHART_PATH} L600,170 L0,170 Z`;

const TELEMETRY: [string, string][] = [
  ["12×", "Organic growth"],
  ["978", "Keywords top 10"],
  ["31.4M", "Impressions"],
  ["55→90", "Site health"],
];

const BULLETS = [
  "Built the publishing tooling: custom WordPress plugins that turn a one-hour manual workflow into a single click, so a non-technical team ships SEO-ready content on its own.",
  "Built the marketing data layer: automated pipelines feeding GSC, GA4, and PageSpeed into live dashboards and weekly reports.",
  "Owned full-funnel growth: technical SEO, content architecture, and paid coordination, in EN and VI, for FDI buyers.",
];

export function TerraTeaser() {
  const { ref, live } = useLiveWhenVisible<HTMLElement>();

  return (
    <section ref={ref} id="terra" className={`sec relative z-[4] overflow-hidden ${live ? "live" : ""}`}>
      <SectionMotif variant="bars" />
      <div className="relative z-[2] px-[var(--pad)] py-[clamp(5rem,9vw,7.5rem)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-11 flex flex-wrap items-end justify-between gap-8 border-b border-rule pb-6"
        >
          <h2 className="text-[clamp(2.8rem,5.6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            terra-plat.vn <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">growth</span>
          </h2>
          <div className="text-right font-mono text-[0.66rem] uppercase leading-[1.8] tracking-[0.14em] text-sand">
            Featured case study · Live
            <br />
            Sole Tech &amp; Creative Lead
          </div>
        </motion.div>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-11 max-w-[62ch] text-[clamp(1.15rem,1.6vw,1.35rem)] font-light leading-[1.75] text-tan"
        >
          17 months of full-funnel work for a B2B payroll &amp; HR SaaS targeting FDI. From launch to a 2,137 clicks/day peak (12× the
          launch baseline) and 978 keywords in the Top 10.
        </motion.p>

        <TerraStack>
          <SpotlightCard className="mx-auto w-full max-w-[640px] overflow-hidden rounded-[14px] border border-panel-border bg-[#18211A]">
            <HoverScrollShot src="/images/terra-outsourcing-preview.webp" alt="terra-plat.vn" urlLabel="terra-plat.vn · live site" />
          </SpotlightCard>

          <SpotlightCard className="rounded-[14px] border border-panel-border bg-panel p-7 backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2 border-b border-rule pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-clay" />
              <span className="h-2.5 w-2.5 rounded-full bg-clay" />
              <span className="h-2.5 w-2.5 rounded-full bg-clay" />
              <span className="ml-2 font-mono text-[0.64rem] text-sand">terra-plat.vn · Google Search Console</span>
            </div>
            <svg className="mb-4 h-[170px] w-full" viewBox="0 0 600 170" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gareaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#79B488" stopOpacity=".3" />
                  <stop offset="1" stopColor="#79B488" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d={AREA_PATH}
                fill="url(#gareaG)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 1.4 }}
              />
              <motion.path
                d={CHART_PATH}
                fill="none"
                stroke="var(--color-forest)"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.circle
                cx="600"
                cy="12"
                r="5"
                fill="var(--color-amber)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 1.8 }}
              />
            </svg>
            <div className="text-center font-mono text-[0.64rem] uppercase tracking-[0.1em] text-sand">
              Organic clicks/day · Feb 2025 → Mar 2026 peak · 2,137/day (12× launch)
            </div>
          </SpotlightCard>

          <div className="flex divide-x divide-rule border-y border-rule">
            {TELEMETRY.map(([n, l]) => (
              <div key={l} className="flex-1 px-3 py-4 text-center">
                <div className="text-[1.7rem] font-semibold leading-none text-amber">{n}</div>
                <div className="mt-1 font-mono text-[0.54rem] uppercase tracking-[0.06em] text-sand">{l}</div>
              </div>
            ))}
          </div>
        </TerraStack>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]"
        >
          <ul className="flex flex-col gap-4">
            {BULLETS.map((text, i) => (
              <li
                key={i}
                className="relative pl-5 text-[1.05rem] font-light leading-[1.65] text-tan before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-forest"
              >
                {text}
              </li>
            ))}
          </ul>
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              {["B2B SaaS", "FDI Targeting", "EN / VI"].map((p) => (
                <span key={p} className="rounded-full border border-rule px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-sand">
                  {p}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <a href="/terra.html" className="inline-flex items-center gap-2 rounded-[9px] bg-amber px-6 py-3.5 text-[0.92rem] font-semibold text-ink transition-colors hover:bg-forest">
                Full case study →
              </a>
              <a href="https://terra-plat.vn" target="_blank" rel="noreferrer" className="border-b border-forest pb-0.5 text-[0.92rem] text-tan transition-colors hover:text-forest">
                Live site ↗
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Manual check** — mount `<TerraTeaser />` in `app/page.tsx` temporarily alongside `Hero`, scroll through it in the dev server, confirm: the first two cards shrink/blur/fade as you scroll past them and the third (telemetry strip) stays crisp; on a narrow viewport (resize below 767px or use the browser device toolbar) the three cards stack normally with no sticky/shrink behavior.

- [ ] **Step 4: Commit**

```bash
git add components/TerraStack.tsx components/TerraTeaser.tsx
git commit -m "Add TerraTeaser with sticky-stack scroll effect and animated GSC chart"
```

---

### Task 9: `BongTeaser`

**Files:**
- Create: `components/BongTeaser.tsx`

- [ ] **Step 1: Write `components/BongTeaser.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { SectionMotif } from "./SectionMotif";
import { useLiveWhenVisible } from "@/lib/useLiveWhenVisible";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

const PIPELINE = [
  { x: 100, n: "01", t: "Concept", m: "Claude Opus 4.7" },
  { x: 300, n: "02", t: "Keyframes", m: "Flux Pro 1.1" },
  { x: 500, n: "03", t: "Typography", m: "GPT Image 1" },
  { x: 700, n: "04", t: "Motion", m: "Seedance 2.0" },
  { x: 900, n: "05", t: "Failures", m: "documented" },
];

export function BongTeaser() {
  const { ref, live } = useLiveWhenVisible<HTMLElement>();
  return (
    <section ref={ref} id="bong" className={`sec relative z-[4] overflow-hidden ${live ? "live" : ""}`}>
      <SectionMotif variant="aurora" />
      <div className="relative z-[2] px-[var(--pad)] py-[clamp(5rem,9vw,7.5rem)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-11 flex flex-wrap items-end justify-between gap-8 border-b border-rule pb-6"
        >
          <h2 className="text-[clamp(2.8rem,5.6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            BÓNG <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">VESPERA</span>
          </h2>
          <div className="text-right font-mono text-[0.66rem] uppercase leading-[1.8] tracking-[0.14em] text-sand">
            Latest experiment · May 2026
            <br />
            Solo · 6 hours · $0
          </div>
        </motion.div>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-11 max-w-[62ch] text-[clamp(1.15rem,1.6vw,1.35rem)] font-light leading-[1.75] text-tan"
        >
          A Vietnamese dark-fantasy ad concept taken from brief to motion by orchestrating four AI models, each for what it does best,
          with every failure documented.
        </motion.p>

        <motion.svg
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-8 h-auto w-full"
          viewBox="0 0 1000 130"
        >
          <motion.line
            x1="100"
            y1="40"
            x2="900"
            y2="40"
            stroke="var(--color-rule)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
          {PIPELINE.map((node, i) => (
            <motion.g
              key={node.n}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
            >
              <circle cx={node.x} cy="40" r="14" fill="#18211A" stroke="var(--color-forest)" strokeWidth="2" />
              <text x={node.x} y="45" textAnchor="middle" fill="var(--color-amber)" fontFamily="var(--font-mono)" fontSize="12">
                {node.n}
              </text>
              <text x={node.x} y="76" textAnchor="middle" fill="var(--color-cream)" fontFamily="var(--font-sans)" fontSize="14" fontWeight={500}>
                {node.t}
              </text>
              <text x={node.x} y="93" textAnchor="middle" fill="var(--color-sand)" fontFamily="var(--font-mono)" fontSize="10.5">
                {node.m}
              </text>
            </motion.g>
          ))}
        </motion.svg>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_1.2fr]"
        >
          <div>
            <div className="mb-4 flex divide-x divide-rule border-y border-rule">
              {[
                ["6h", "End-to-end"],
                ["5+1", "KFs + ad"],
                ["4", "Models"],
                ["$0", "Free tier"],
              ].map(([n, l]) => (
                <div key={l} className="flex-1 px-2 py-4 text-center">
                  <div className="text-[1.7rem] font-semibold leading-none text-amber">{n}</div>
                  <div className="mt-1 font-mono text-[0.54rem] uppercase tracking-[0.06em] text-sand">{l}</div>
                </div>
              ))}
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {["AI Orchestration", "Creative Pipeline", "Solo Build"].map((p) => (
                <span key={p} className="rounded-full border border-rule px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-sand">
                  {p}
                </span>
              ))}
            </div>
            <a href="/bong-vespera.html" className="inline-flex items-center gap-2 rounded-[9px] bg-amber px-6 py-3.5 text-[0.92rem] font-semibold text-ink transition-colors hover:bg-forest">
              Full case study →
            </a>
          </div>
          <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[14px] border border-panel-border bg-[#18211A] md:ml-auto md:mr-0">
            <div className="aspect-[2/3]">
              <img src="/images/vng-demo/final/ad-mockup-final.webp" alt="BÓNG VESPERA ad mockup" className="h-full w-full object-cover" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/BongTeaser.tsx
git commit -m "Add BongTeaser with draw-in pipeline diagram"
```

---

### Task 10: `WorkSection`

**Files:**
- Create: `components/WorkSection.tsx`

- [ ] **Step 1: Write `components/WorkSection.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { SpotlightCard } from "./SpotlightCard";
import { HoverScrollShot } from "./HoverScrollShot";
import { SectionMotif } from "./SectionMotif";
import { useLiveWhenVisible } from "@/lib/useLiveWhenVisible";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

const COMPACT_PROJECTS = [
  {
    n: "02",
    title: "Badminton Payment Splitter",
    tags: "AI-directed build + Supabase · 2026",
    desc: "Solved a recurring group-payment friction point - built a live PWA that auto-generates a VietQR code per member and tracks payment status in real time.",
    img: "/images/badminton-preview.webp",
    urlLabel: "badminton-app-weld.vercel.app",
    live: "https://badminton-app-weld.vercel.app/",
    code: "https://github.com/jak3rpham/badminton-app",
  },
  {
    n: "03",
    title: "IELTS Studio",
    tags: "AI-directed build + Claude API · 2026",
    desc: "Built a full-stack IELTS practice platform with server-side AI grading for Writing tasks, multi-user auth, and graceful degradation with or without a configured database.",
    img: "/images/ielts-preview.webp",
    urlLabel: "ielts-test-kohl.vercel.app",
    live: "https://ielts-test-kohl.vercel.app/",
    code: "https://github.com/jak3rpham/Ielts-Test",
  },
];

export function WorkSection() {
  const { ref, live } = useLiveWhenVisible<HTMLElement>();
  return (
    <section ref={ref} id="work" className={`sec relative z-[4] overflow-hidden ${live ? "live" : ""}`}>
      <SectionMotif variant="stripes" />
      <div className="relative z-[2] px-[var(--pad)] py-[clamp(5rem,9vw,7.5rem)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-11 border-b border-rule pb-6"
        >
          <h2 className="text-[clamp(2.8rem,5.6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            Selected <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">work</span>
          </h2>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="mb-6">
          <SpotlightCard className="overflow-hidden rounded-[14px] border border-panel-border bg-[#18211A]">
            <div className="flex items-center gap-2 border-b border-rule bg-black/25 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-clay" />
              <span className="h-2.5 w-2.5 rounded-full bg-clay" />
              <span className="h-2.5 w-2.5 rounded-full bg-clay" />
              <span className="ml-2 font-mono text-[0.64rem] text-sand">uphub.vn</span>
            </div>
            <div className="aspect-[21/9] overflow-hidden">
              <img src="/images/uphub.webp" alt="uphub.vn" loading="lazy" className="h-full w-full object-cover object-top" />
            </div>
            <div className="flex flex-wrap justify-between gap-8 px-7 py-6">
              <div>
                <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text font-serif-jp text-3xl font-bold text-transparent">01</span>
                <div className="mb-1 mt-1 text-[1.7rem] font-semibold text-cream">uphub.vn</div>
                <div className="font-mono text-[0.64rem] uppercase tracking-[0.06em] text-sand">SEO Consulting · Freelance 2024 · EN / VI</div>
              </div>
              <div className="max-w-[52ch]">
                <p className="mb-3 text-[1rem] font-light leading-[1.7] text-tan">
                  Metadata audit and rebuild across 18 bilingual variants, keyword gap analysis, H1 and slug restructuring, 301
                  redirect mapping with zero indexed traffic loss.
                </p>
                <a href="https://uphub.vn" target="_blank" rel="noreferrer" className="inline-block rounded-lg border border-rule px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-amber transition-colors hover:border-amber hover:bg-amber hover:text-ink">
                  Visit ↗
                </a>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {COMPACT_PROJECTS.map((p) => (
            <SpotlightCard key={p.n} className="overflow-hidden rounded-[14px] border border-panel-border bg-[#18211A] pb-6">
              <HoverScrollShot src={p.img} alt={p.title} urlLabel={p.urlLabel} />
              <div className="px-6">
                <span className="mt-4 block bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text font-serif-jp text-2xl font-bold text-transparent">
                  {p.n}
                </span>
                <div className="mb-1 text-[1.7rem] font-semibold text-cream">{p.title}</div>
                <div className="mb-3 font-mono text-[0.64rem] uppercase tracking-[0.06em] text-sand">{p.tags}</div>
                <p className="mb-3 text-[1rem] font-light leading-[1.7] text-tan">{p.desc}</p>
                <div className="flex flex-wrap gap-2.5">
                  <a href={p.live} target="_blank" rel="noreferrer" className="rounded-lg border border-rule px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-amber transition-colors hover:border-amber hover:bg-amber hover:text-ink">
                    Live ↗
                  </a>
                  <a href={p.code} target="_blank" rel="noreferrer" className="rounded-lg border border-rule px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-amber transition-colors hover:border-amber hover:bg-amber hover:text-ink">
                    Code ↗
                  </a>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-t border-rule py-8"
        >
          <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text font-serif-jp text-3xl font-bold text-transparent">
            04
          </span>
          <div>
            <div className="mb-1 text-[1.7rem] font-semibold text-cream">Open for freelance</div>
            <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.06em] text-sand">Web · SEO · Video Production · 2026</div>
            <p className="max-w-[62ch] text-[1rem] font-light leading-[1.7] text-tan">
              End-to-end website builds from brief to live deployment. SEO audits, keyword strategy, brand video and photography.
              Selective availability, full ownership.
            </p>
          </div>
          <a href="mailto:pnthanh.work@gmail.com" className="whitespace-nowrap rounded-lg border border-rule px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-amber transition-colors hover:border-amber hover:bg-amber hover:text-ink">
            Email →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/WorkSection.tsx
git commit -m "Add WorkSection with featured + compact project cards"
```

---

### Task 11: `VideoTeaser` and `VideoLightbox`

**Files:**
- Create: `components/VideoLightbox.tsx`
- Create: `components/VideoTeaser.tsx`

- [ ] **Step 1: `components/VideoLightbox.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function VideoLightbox({ videoId, onClose }: { videoId: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!videoId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [videoId, onClose]);

  return (
    <AnimatePresence>
      {videoId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 px-[var(--pad)]"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[960px]"
          >
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-cream"
            >
              ✕ Close
            </button>
            <iframe
              className="aspect-video w-full rounded-[10px] border-none"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: `components/VideoTeaser.tsx`**

```tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { SectionMotif } from "./SectionMotif";
import { VideoLightbox } from "./VideoLightbox";
import { useLiveWhenVisible } from "@/lib/useLiveWhenVisible";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

const FEATURED = { yt: "Nr8vCC5JWCQ", badge: "TVC · Top 1 · 2024", title: "Business Challenge 2024 · TVC ARISAQUA", meta: "Top 1 TVC · ISB Academic Team" };
const STRIP = [
  { yt: "1cJGz4wwduA", badge: "Social · Top 20", title: "Let's On Air 2023", meta: "S Communications" },
  { yt: "BWeBzuIDSRk", badge: "Explainer", title: "Shadow Funnel", meta: "Mona Media" },
  { yt: "3xfFHWMzung", badge: "Product", title: "Explainer trên iPad", meta: "Mona Media" },
];

function VideoCard({ yt, badge, title, meta, onOpen, featured }: { yt: string; badge: string; title: string; meta: string; onOpen: (yt: string) => void; featured?: boolean }) {
  return (
    <button
      onClick={() => onOpen(yt)}
      className={`group relative overflow-hidden rounded-[14px] border border-panel-border bg-[#18211A] text-left ${featured ? "" : "aspect-[16/10]"}`}
    >
      <img
        src={`https://img.youtube.com/vi/${yt}/maxresdefault.jpg`}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-45% to-black/85" />
      <span className="absolute left-3 top-3 z-[2] rounded-md bg-black/60 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-cream">
        {badge}
      </span>
      <span className="absolute left-1/2 top-1/2 z-[2] flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-cream/85 text-cream">
        ▶
      </span>
      <div className="absolute bottom-3.5 left-4 right-4 z-[2]">
        <div className="text-[1rem] font-semibold leading-[1.3] text-cream">{title}</div>
        <div className="mt-1 font-mono text-[0.58rem] text-sand">{meta}</div>
      </div>
    </button>
  );
}

export function VideoTeaser() {
  const { ref, live } = useLiveWhenVisible<HTMLElement>();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section ref={ref} id="video" className={`sec relative z-[4] overflow-hidden ${live ? "live" : ""}`}>
      <SectionMotif variant="eq" />
      <div className="relative z-[2] px-[var(--pad)] py-[clamp(5rem,9vw,7.5rem)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-9 flex flex-wrap items-end justify-between gap-8 border-b border-rule pb-6"
        >
          <h2 className="text-[clamp(2.8rem,5.6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            Video &amp; <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">brand</span>
          </h2>
          <div className="text-right font-mono text-[0.66rem] uppercase leading-[1.8] tracking-[0.14em] text-sand">
            Two-time Top 1 TVC
            <br />
            Business Challenge
          </div>
        </motion.div>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-9 max-w-[62ch] text-[clamp(1.15rem,1.6vw,1.35rem)] font-light leading-[1.75] text-tan"
        >
          End-to-end video production: TVCs, brand films, event recaps, music videos, explainers.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[1.6fr_1fr]"
        >
          <VideoCard {...FEATURED} onOpen={setOpenId} featured />
          <div className="grid grid-rows-3 gap-4">
            {STRIP.map((v) => (
              <VideoCard key={v.yt} {...v} onOpen={setOpenId} />
            ))}
          </div>
        </motion.div>

        <motion.a
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1 }}
          href="/video.html"
          className="flex items-center justify-between rounded-[14px] border border-rule px-7 py-6 transition-colors hover:bg-forest hover:text-ink"
        >
          <div>
            <div className="text-[1.1rem] font-semibold">View full video reel</div>
            <div className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-sand">
              Brand films · TVCs · Events · Music videos · Explainers
            </div>
          </div>
          <span className="text-[1.4rem]">→</span>
        </motion.a>
      </div>
      <VideoLightbox videoId={openId} onClose={() => setOpenId(null)} />
    </section>
  );
}
```

- [ ] **Step 3: Manual check** — mount temporarily, click a video card, confirm the YouTube embed opens with autoplay, and closes via the close button, clicking the backdrop, and pressing Escape.

- [ ] **Step 4: Commit**

```bash
git add components/VideoLightbox.tsx components/VideoTeaser.tsx
git commit -m "Add VideoTeaser reel grid and AnimatePresence lightbox"
```

---

### Task 12: `Contact`, `Footer`, `FloatingCV`, and page assembly

**Files:**
- Create: `components/Contact.tsx`
- Create: `components/Footer.tsx`
- Create: `components/FloatingCV.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx` (mount `<FloatingCV />`)

- [ ] **Step 1: `components/Contact.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { useMagnetic } from "@/lib/useMagnetic";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { SectionMotif } from "./SectionMotif";
import { useLiveWhenVisible } from "@/lib/useLiveWhenVisible";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

const CONTACT_LINES = [
  { k: "Email", v: "pnthanh.work@gmail.com", href: "mailto:pnthanh.work@gmail.com" },
  { k: "Phone", v: "+84 398 81 2349", href: "tel:+84398812349" },
  { k: "Location", v: "Ho Chi Minh City, VN" },
  { k: "Languages", v: "VI · EN IELTS 7.0" },
  { k: "Status", v: "Available 2026 · hybrid / remote" },
];

export function Contact() {
  const { ref, live } = useLiveWhenVisible<HTMLElement>();
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const magnetic = useMagnetic<HTMLAnchorElement>(0.3);

  return (
    <section ref={ref} id="contact" className={`sec relative z-[4] overflow-hidden ${live ? "live" : ""}`}>
      <SectionMotif variant="signal" />
      <div className="relative z-[2] px-[var(--pad)] py-[clamp(5rem,12vw,9rem)]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <h2 className="max-w-[18ch] text-[clamp(2.6rem,6vw,5.2rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            Let&apos;s build something{" "}
            <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">that compounds</span>
          </h2>
          <div className="mt-7 flex flex-wrap items-center gap-6">
            <motion.a
              href="mailto:pnthanh.work@gmail.com"
              ref={magnetic.ref}
              onMouseMove={hoverCapable ? magnetic.onMouseMove : undefined}
              onMouseLeave={hoverCapable ? magnetic.onMouseLeave : undefined}
              style={hoverCapable ? magnetic.style : undefined}
              className="inline-flex items-center gap-2 rounded-[9px] bg-amber px-6 py-3.5 text-[0.92rem] font-semibold text-ink transition-colors hover:bg-forest"
            >
              Send an email →
            </motion.a>
            <a href="/CV.pdf" className="border-b border-forest pb-0.5 text-[0.92rem] text-tan transition-colors hover:text-forest">
              Download CV ↓
            </a>
          </div>
          <div className="my-8 flex flex-wrap gap-x-12 gap-y-6 border-t border-rule pt-7">
            {CONTACT_LINES.map(({ k, v, href }) => (
              <div key={k} className="flex flex-col gap-1">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-sand">{k}</span>
                {href ? (
                  <a href={href} className="text-[1.05rem] text-cream hover:text-forest">
                    {v}
                  </a>
                ) : (
                  <span className="text-[1.05rem] text-cream">{v}</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["LinkedIn", "https://linkedin.com/in/jkpham03/"],
              ["Facebook", "https://facebook.com/phamth.jaker/"],
              ["Instagram", "https://instagram.com/jak3rpham/"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-rule px-3 py-1.5 font-mono text-[0.62rem] text-sand transition-colors hover:border-forest hover:bg-forest hover:text-ink"
              >
                {label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `components/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="relative z-[4] border-t border-rule px-[var(--pad)] py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-sand">
        <span>
          Tatsuki <b className="font-serif-jp text-forest">達樹</b>
        </span>
        <span>© 2026 Pham Ngoc Thanh · Digital Marketing &amp; Creative</span>
        <a href="https://linkedin.com/in/jkpham03/" target="_blank" rel="noreferrer" className="hover:text-forest">
          linkedin.com/in/jkpham03
        </a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: `components/FloatingCV.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { useMagnetic } from "@/lib/useMagnetic";
import { useMediaQuery } from "@/lib/useMediaQuery";

export function FloatingCV() {
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const magnetic = useMagnetic<HTMLAnchorElement>(0.3);
  return (
    <motion.a
      href="/CV.pdf"
      ref={magnetic.ref}
      onMouseMove={hoverCapable ? magnetic.onMouseMove : undefined}
      onMouseLeave={hoverCapable ? magnetic.onMouseLeave : undefined}
      style={hoverCapable ? magnetic.style : undefined}
      className="fixed bottom-[1.4rem] right-[1.4rem] z-[90] flex items-center gap-1.5 rounded-full bg-amber px-4 py-3 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-forest"
    >
      <span>↓</span> CV
    </motion.a>
  );
}
```

- [ ] **Step 4: Assemble `app/page.tsx`**

```tsx
import { Hero } from "@/components/Hero";
import { StatStrip } from "@/components/StatStrip";
import { About } from "@/components/About";
import { TerraTeaser } from "@/components/TerraTeaser";
import { BongTeaser } from "@/components/BongTeaser";
import { WorkSection } from "@/components/WorkSection";
import { VideoTeaser } from "@/components/VideoTeaser";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

function Divider() {
  return (
    <div className="relative z-[5] flex items-center justify-center gap-5 px-[var(--pad)]">
      <span className="h-px max-w-[42%] flex-1 bg-gradient-to-r from-transparent via-rule to-transparent" />
      <span className="h-[10px] w-[10px] flex-none rotate-45 border border-amber shadow-[0_0_14px_rgba(120,200,140,0.55)]" />
      <span className="h-px max-w-[42%] flex-1 bg-gradient-to-r from-transparent via-rule to-transparent" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <StatStrip />
      <About />
      <Divider />
      <TerraTeaser />
      <Divider />
      <BongTeaser />
      <Divider />
      <WorkSection />
      <Divider />
      <VideoTeaser />
      <Divider />
      <Contact />
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Mount `FloatingCV` in `app/layout.tsx`**

```tsx
import { FloatingCV } from "@/components/FloatingCV";
// ...
<body>
  <GrainOverlay />
  <Nav />
  {children}
  <FloatingCV />
</body>
```

- [ ] **Step 6: Full manual walkthrough**

```bash
npm run dev
```

Walk the whole page top to bottom in the browser: nav scroll-spy tracks About/Work/Contact, hero canvas/scramble/parallax/count-up all work, stat strip and about reveal on scroll, Terra sticky-stack shrinks/blurs correctly, Bong pipeline draws in, Work section cards show spotlight-border on hover and hover-scroll screenshots pan, video cards open/close the lightbox, contact CTA has magnetic pull, floating CV button is magnetic and links to `/CV.pdf`.

- [ ] **Step 7: Commit**

```bash
git add components/Contact.tsx components/Footer.tsx components/FloatingCV.tsx app/page.tsx app/layout.tsx
git commit -m "Add Contact, Footer, FloatingCV and assemble the homepage"
```

---

### Task 13: Move static assets and remaining pages into `public/`, remove old `index.html`

**Files:**
- Move: `CV.pdf`, `favicon.ico`, `favicon-16.png`, `favicon-32.png`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `images/`, `terra.html`, `video.html`, `bong-vespera.html`, `pati-challenge/` → `public/`
- Delete: `index.html`

- [ ] **Step 1: Move assets into `public/`**

```bash
cd /d/code/jak3rpham.github.io
mv CV.pdf favicon.ico favicon-16.png favicon-32.png favicon.svg apple-touch-icon.png icon-192.png icon-512.png images public/
mv terra.html video.html bong-vespera.html pati-challenge public/
```

- [ ] **Step 2: Delete the old homepage**

```bash
rm index.html
```

- [ ] **Step 3: Update favicon references in `app/layout.tsx` metadata**

```tsx
export const metadata: Metadata = {
  title: "Tatsuki · Pham Ngoc Thanh / Digital Marketing & Creative",
  description:
    "Pham Ngoc Thanh (Tatsuki), Digital Marketing Strategist building full-funnel campaigns for B2B SaaS. SEO, performance, video. Ho Chi Minh City.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32" },
      { url: "/favicon-16.png", sizes: "16x16" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};
```

- [ ] **Step 4: Verify the untouched pages still reference their own assets correctly**

`terra.html`, `video.html`, `bong-vespera.html` use relative paths like `images/...` and `CV.pdf`. Since they now live in `public/` and `public/images/` sits alongside them, relative paths still resolve the same way once served from the site root — no edits needed inside those files. Confirm by opening `http://localhost:3000/terra.html` in the dev server after Task 14's `next.config.ts` is in place (dev server serves `public/` at the root automatically already, so this can be checked now).

```bash
npm run dev
```

Open `http://localhost:3000/terra.html`, `http://localhost:3000/video.html`, `http://localhost:3000/bong-vespera.html`, `http://localhost:3000/pati-challenge/` — confirm each loads with its images intact.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Move static assets and untouched pages into public/, remove old index.html"
```

---

### Task 14: Static export config and GitHub Actions deployment

**Note carried over from Task 13:** `npm run dev` returns 308→404 for `/pati-challenge/` (trailing slash) because `next dev`'s dev server doesn't do directory-index resolution for nested folders under `public/` — only `next dev` is affected; `/pati-challenge/index.html` (exact path) already returns 200. This is expected to resolve correctly once statically exported and served by GitHub Pages (a plain static host that does directory-index resolution natively, with no Next.js server in the loop at request time). **Verify this empirically in Step 3 below** rather than assuming — e.g. after `next build`, run `npx serve out` (or equivalent static server) and confirm `/pati-challenge/` resolves, since that's a closer approximation of GitHub Pages' actual serving behavior than `next dev`.

**Files:**
- Modify: `next.config.ts`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Update `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 2: Run a local static export to verify it builds**

```bash
npm run build
```

Expected: build succeeds, an `out/` directory is created containing `index.html`, `_next/`, and all the passthrough files from `public/` (`terra.html`, `video.html`, `bong-vespera.html`, `pati-challenge/index.html`, `CV.pdf`, `images/`, favicons).

- [ ] **Step 3: Spot-check the export**

```bash
ls out/
ls out/pati-challenge
```

Expected: `terra.html`, `video.html`, `bong-vespera.html`, `pati-challenge/`, `CV.pdf`, `images/`, `index.html` are all present at the top level of `out/`.

- [ ] **Step 4: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 5: Commit**

```bash
git add next.config.ts .github/workflows/deploy.yml
git commit -m "Configure static export and GitHub Actions Pages deployment"
```

- [ ] **Step 6: One-time manual step (flag to the user, don't do it silently)**

In the GitHub repo Settings → Pages, the "Build and deployment" source must be switched from "Deploy from a branch" to "GitHub Actions". This is a one-time toggle in the GitHub UI (or via `gh api repos/jak3rpham/jak3rpham.github.io/pages -X PUT -f build_type=workflow` if the user wants it automated) and should be confirmed with the user before running, since it changes how the live site deploys.

---

### Task 15: Push and verify the live deployment

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite and a final build one more time**

```bash
npm run test
npm run build
```

Expected: all tests pass, build succeeds with no errors.

- [ ] **Step 2: Push to `main`**

```bash
git push origin main
```

- [ ] **Step 3: Watch the GitHub Actions run**

```bash
gh run watch
```

Expected: the "Deploy to GitHub Pages" workflow completes successfully.

- [ ] **Step 4: Verify the live site**

Open `https://jak3rpham.github.io/` and confirm the new Next.js homepage loads. Then check `https://jak3rpham.github.io/terra.html`, `https://jak3rpham.github.io/video.html`, `https://jak3rpham.github.io/bong-vespera.html`, and `https://jak3rpham.github.io/pati-challenge/` all still load exactly as before.
