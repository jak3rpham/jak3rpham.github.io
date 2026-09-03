"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { onScrollFrame } from "@/lib/scrollTicker";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * The opening, as one pinned screen with three things happening at once.
 *
 * The scroll is spent on a single move: the hero's frame CLOSES IN on the portrait, and as it
 * closes it drifts across to sit right of centre, while the whole About panel arrives from the
 * left into the room that leaves and the numbers arrive from the right. It ends as a three part
 * composition, and the sequence behind it has been drawing the whole time.
 *
 * The page is PAPER from its first pixel and the container is a dark surface laid on top of it,
 * so what the closing frame uncovers is light that was always there rather than a state change
 * timed to happen. Nothing about the ground moves; only the thing covering it does.
 *
 * That leaves the site chrome, which is the part that took two goes. The header and the nav rail
 * sit above the container, so while the container is under them they have to be read against ink
 * even though the page is paper. An earlier version made the whole zone dark and swapped it mid
 * stage, which got the chrome right and made the reveal a state change again. This writes
 * `data-chrome="ink"` on the document for exactly as long as the closing frame's top edge is
 * still above the header, and drops it the moment the frame passes; see `.chrome-adaptive`.
 *
 * Why `clip-path` and not `scale`. A scale shrinks the picture; the brief was that the container
 * pulls in TO the portrait, which means the frame has to close over the copy while the portrait
 * itself stays the size it was. `inset()` does exactly that and carries its own four corner
 * radii, so "the four edges round by different amounts" is the same declaration rather than a
 * second one; see BUMPS for how those four are shaped. The cost is a clip on a full screen
 * layer changing every frame, which is the one
 * thing here that could show up on a slow machine; `will-change` promotes it so the compositor
 * applies the rounded rect to an existing texture instead of repainting the contents.
 *
 * The drift LAGS the close on purpose. Both finishing together would only be a scale toward the
 * centre; starting the drift a fifth of the way in gives the two beats the brief describes, the
 * frame collapsing onto the portrait and then the whole thing moving in.
 *
 * `lead` and `aside` are MOUNTED at their cue rather than present and hidden. The numbers count
 * up off an IntersectionObserver, and a hidden element inside a pinned stage is intersecting
 * from the moment the page loads, so leaving it in the tree would spend the count while nobody
 * could see it. After mounting, their travel is driven by the scroll like everything else: a one
 * shot animation with `both` would hold them in place for the rest of the session, and scrolling
 * back to the top of the stage would find them sitting on top of the hero.
 *
 * The stage also publishes `--hero-fade`, 0 to 1, which the hero's own copy block reads so that
 * it is out of the way before the frame reaches it and nothing is ever cropped mid sentence.
 *
 * Geometry is measured on mount, on resize and whenever the card's layout changes, never in the
 * scroll path.
 *
 * The portrait's box is read from OFFSETS rather than from `getBoundingClientRect`, and that is
 * not a preference. The portrait arrives with a framer entry animation, `y: 40`, and a client
 * rect includes transforms, so measuring on mount aimed the frame 40px below where the portrait
 * was going to settle: the shut frame cut the top off the picture and left a band of scrim under
 * it. It only showed at some window sizes because at others the difference hid inside the inset
 * that used to be there. Offsets are layout positions and ignore transforms, so there is nothing
 * to wait for. A ResizeObserver covers the rest, the portrait image loading and a font swapping,
 * either of which moves the box after mount.
 */
type Zone = "dark" | "light";

/**
 * Clockwise from top left: how far each corner bulges PAST the settled radius on its way in.
 *
 * The four edges have to round by different amounts while the frame is closing, and land as one
 * clean shape when it has. A plain multiplier could only do the first of those; it left four
 * different radii sitting around the portrait at the end, which read as a second frame drawn
 * around the card that is already there. Each corner is `end * close + bump * sin(pi * close)`
 * instead: the bump peaks half way and is gone by the end, so they differ hardest exactly where
 * it can be seen and all arrive at the portrait's own radius.
 */
const BUMPS = [46, 12, 28, 36];

/** the site header's height, which is how far down the frame has to get before it clears it */
const CHROME_H = 76;

export function HeroStage({
  children,
  lead,
  aside,
  zone = "dark",
  /** total height of the run, in vh. Everything below is a fraction of the pinned travel. */
  heightVh = 300,
  /** the frame has reached the portrait by here */
  closeEnd = 0.55,
  /** the drift to the middle starts here and finishes just after the close */
  driftStart = 0.2,
  /**
   * The shut frame's radius, which has to be the portrait card's own 16 plus whatever `inset`
   * stands off it, or the two curves are not parallel. At -2 that is 14.
   */
  radius = 14,
  /**
   * How far the shut frame stands off the portrait, per side, px. Positive shows a band of the
   * dark container around the picture; NEGATIVE cuts inside it.
   *
   * Negative is deliberate and is what "no border at all" costs. At 0 the frame lands on the
   * portrait card's box, and that card carries its own 1px hairline, drawn inside the box, which
   * survives as a faint line down every edge. Two pixels in takes the hairline and the softened
   * edge the drop-shadow leaves against it, and the clip meets the photograph itself. Per side
   * rather than a single number because an earlier pass needed a band on the right alone; it
   * still can.
   */
  inset = -2,
  /**
   * Where the shut frame settles horizontally, as a fraction of the viewport. The three columns
   * have to share one screen, so this is not a free number: the frame at 0.68 leaves roughly
   * 70px either side of it at 1440, between the About panel on the left and the numbers on the
   * right, with the nav rail clear beyond those.
   */
  settleX = 0.68,
  /** lead and aside mount here, and are fully in a third of the run later */
  enterAt = 0.3,
}: {
  children: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
  zone?: Zone;
  heightVh?: number;
  closeEnd?: number;
  driftStart?: number;
  radius?: number;
  inset?: number | { t?: number; r?: number; b?: number; l?: number };
  settleX?: number;
  enterAt?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  // read as a query rather than set as state from inside the effect: a reduced motion reader gets
  // the finished composition from the first render, with no cascading update to schedule it
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");

  // derived in the body, not the effect, so the four numbers can be dependencies of their own
  // rather than an object literal that is a new identity on every render
  const padT = typeof inset === "number" ? inset : inset.t ?? 0;
  const padR = typeof inset === "number" ? inset : inset.r ?? 0;
  const padB = typeof inset === "number" ? inset : inset.b ?? 0;
  const padL = typeof inset === "number" ? inset : inset.l ?? 0;

  useEffect(() => {
    if (reduce) return;

    let top = 0;
    let travel = 1;
    // the closed frame, as insets from each edge of the viewport, and where its middle lands
    let shut = { t: 0, r: 0, b: 0, l: 0 };
    let drift = { x: 0, y: 0 };

    const measure = () => {
      const el = wrap.current;
      const c = card.current;
      if (!el || !c) return;
      const r = el.getBoundingClientRect();
      top = r.top + window.scrollY;
      travel = Math.max(1, r.height - window.innerHeight);

      const por = c.querySelector<HTMLElement>("[data-hero-portrait]");
      if (!por || !por.offsetWidth || !por.offsetHeight) return;

      // walk the offset chain up to the card, which fills the viewport
      let left = 0;
      let topOff = 0;
      for (let n: HTMLElement | null = por; n && n !== c; n = n.offsetParent as HTMLElement | null) {
        left += n.offsetLeft;
        topOff += n.offsetTop;
      }
      const box = { left, top: topOff, right: left + por.offsetWidth, bottom: topOff + por.offsetHeight };

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      shut = {
        t: Math.max(0, box.top - padT),
        r: Math.max(0, vw - box.right - padR),
        b: Math.max(0, vh - box.bottom - padB),
        l: Math.max(0, box.left - padL),
      };
      // the frame is what settles, not the picture inside it, so the centre used here is the
      // frame's own middle; with an uneven band those two are not the same point
      const fx = (box.left - padL + box.right + padR) / 2;
      const fy = (box.top - padT + box.bottom + padB) / 2;
      drift = { x: vw * settleX - fx, y: vh / 2 - fy };
    };

    const html = document.documentElement;
    let chromeInk = false;
    const setChrome = (on: boolean) => {
      if (on === chromeInk) return;
      chromeInk = on;
      if (on) html.dataset.chrome = "ink";
      else delete html.dataset.chrome;
    };

    // The nav rail is hidden for the length of this stage. Measured at 1440: the three columns
    // want 72 + 672 + 40 + 332 + 40 + 162 = 1318 of the 1440, and the rail with an active label
    // showing is another 160, so something had to give. It gives here, because a rail for moving
    // between sections has nothing to offer while one section is pinned across the whole screen.
    let opening = false;
    const setOpening = (on: boolean) => {
      if (on === opening) return;
      opening = on;
      if (on) html.dataset.opening = "1";
      else delete html.dataset.opening;
    };

    const smooth = (x: number) => {
      const t = Math.max(0, Math.min(1, x));
      return t * t * (3 - 2 * t);
    };

    // the image loading or a font swapping moves the portrait after mount, and neither fires a
    // resize; without this the frame keeps aiming at where the box used to be
    const ro = new ResizeObserver(() => measure());
    if (card.current) ro.observe(card.current);

    const off = onScrollFrame((y) => {
      const c = card.current;
      const el = wrap.current;
      if (!c || !el) return;
      const q = Math.max(0, Math.min(1, (y - top) / travel));

      const close = smooth(q / closeEnd);
      const d = smooth((q - driftStart) / Math.max(0.01, closeEnd + 0.1 - driftStart));

      const px = (v: number) => `${(v * close).toFixed(1)}px`;
      const bulge = Math.sin(Math.PI * close);
      const rad = BUMPS.map((b) => `${(radius * close + b * bulge).toFixed(1)}px`).join(" ");
      c.style.clipPath = `inset(${px(shut.t)} ${px(shut.r)} ${px(shut.b)} ${px(shut.l)} round ${rad})`;
      c.style.transform = `translate3d(${(drift.x * d).toFixed(1)}px, ${(drift.y * d).toFixed(1)}px, 0)`;
      el.style.setProperty("--hero-fade", smooth(q / (closeEnd * 0.72)).toFixed(3));
      // the chrome is over ink for exactly as long as the frame's top edge is above the header
      setChrome(shut.t * close + drift.y * d < CHROME_H);
      setOpening(q > 0 && q < 1);

      if (!entered) {
        if (q >= enterAt) setEntered(true);
        return;
      }
      const a = smooth((q - enterAt) / 0.3);
      const off = (1 - a) * 70;
      // no -50% here any more: the columns are boxes spanning the safe area and centre their own
      // contents, so the transform carries the slide alone
      if (leadRef.current) {
        leadRef.current.style.opacity = a.toFixed(3);
        leadRef.current.style.transform = `translate3d(${(-off).toFixed(1)}px, 0, 0)`;
      }
      if (asideRef.current) {
        asideRef.current.style.opacity = a.toFixed(3);
        asideRef.current.style.transform = `translate3d(${off.toFixed(1)}px, 0, 0)`;
      }
    }, measure);

    return () => {
      ro.disconnect();
      off();
      setChrome(false);
      setOpening(false);
    };
  }, [reduce, closeEnd, driftStart, radius, padT, padR, padB, padL, settleX, enterAt, entered]);

  const shown = entered || reduce;

  return (
    <div ref={wrap} data-zone={zone} className="relative z-[4]" style={{ height: `${heightVh}vh` }}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {/* The shadow lives on the wrapper because clip-path is applied after an element's own
            box-shadow and would take it away with everything else; a drop-shadow filter on the
            parent casts from the already clipped shape. theme-ink on the card, because the
            container is the dark thing on a page that is paper throughout. */}
        <div className="hero-shadow absolute inset-0">
          <div ref={card} className="theme-ink absolute inset-0 will-change-[clip-path,transform]">
            {children}
          </div>
        </div>

        {/* Both start visible, so a reduced motion reader, who gets no ticker, sees the finished
            composition.

            They span from the header to just short of the bottom and centre their own contents,
            rather than being centred on the viewport. Centring on the viewport is what put the
            About headline underneath the header on any window shorter than about 780px: the panel
            is a fixed 644px tall and half of what is left over is not enough to clear a 68px bar.
            The panel also shrinks with viewport height now; see components/About.tsx. */}
        {lead && shown && (
          <div
            ref={leadRef}
            className="absolute bottom-5 left-[var(--pad)] top-[var(--nav-h)] z-[3] flex w-[min(52vw,42rem)] items-center will-change-[opacity,transform]"
            style={{ transform: "translate3d(0, 0, 0)" }}
          >
            {lead}
          </div>
        )}

        {aside && shown && (
          <div
            ref={asideRef}
            className="absolute bottom-5 right-[clamp(3.5rem,5vw,5.5rem)] top-[var(--nav-h)] z-[3] hidden items-center will-change-[opacity,transform] lg:flex"
            style={{ transform: "translate3d(0, 0, 0)" }}
          >
            {aside}
          </div>
        )}
      </div>
    </div>
  );
}
