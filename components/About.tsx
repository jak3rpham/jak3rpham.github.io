"use client";

type Lane = { n: string; t: string; d: string; go: string; href: string };

// Range proof: four disciplines actually shipped in, each pointing straight to a case.
const LANES: Lane[] = [
  {
    n: "01",
    t: "Growth & technical",
    d: "Technical SEO, data pipelines, GA4 and GSC dashboards, and full-funnel execution in EN and VI.",
    go: "terra-plat.vn",
    href: "#terra",
  },
  {
    n: "02",
    t: "Product & AI builds",
    d: "Shipped apps end to end: IELTS Studio with Claude API grading, a Badminton PWA on Supabase with live VietQR.",
    go: "Selected builds",
    href: "#work",
  },
  {
    n: "03",
    t: "AI orchestration",
    d: "Directing several AI models into one pipeline: from eleven raw generations to a finished music video.",
    go: "ある男",
    href: "#aru",
  },
  {
    n: "04",
    t: "Creative & film",
    d: "TVCs, music videos, and AI-directed video from brief to final cut. Two-time Top 1 TVC at Business Challenge.",
    go: "Video reel",
    href: "#video",
  },
];

/**
 * A lane, sized for the hero stage's left column rather than for a section of its own. It has to
 * be readable inside one viewport alongside a headline, four of its siblings and a credentials
 * line, so the description is one clamped line and the whole row is a third of the height the
 * standalone version used.
 */
/**
 * A lane, sized for the hero stage's left column.
 *
 * It was a third of the height of the standalone version and it paid for that twice: the
 * description was truncated to one line, so every lane ended in an ellipsis mid sentence, and the
 * type was small enough to be work to read at arm's length. Both are undone. The description
 * wraps to two lines and the row is allowed the height that needs; four of these plus a headline
 * and a credentials line still fit one screen beside the portrait, which is the only constraint
 * that ever mattered.
 */
function LaneRow({ lane }: { lane: Lane }) {
  return (
    <a
      href={lane.href}
      className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-5 border-t border-rule py-[clamp(0.4rem,1.8vh,1rem)] transition-colors hover:bg-forest/[0.05]"
    >
      <span className="font-serif-jp text-[1.35rem] font-black leading-none text-forest">{lane.n}</span>
      <span className="min-w-0">
        <span className="block text-[clamp(0.88rem,2.2vh,1.12rem)] font-medium leading-snug text-cream">{lane.t}</span>
        <span className="mt-1 block max-w-[46ch] text-[clamp(0.75rem,1.75vh,0.92rem)] font-light leading-[1.5] text-tan">
          {lane.d}
        </span>
      </span>
      <span className="flex items-center gap-1.5 whitespace-nowrap font-mono t-micro uppercase tracking-[0.1em] text-forest transition-transform duration-200 group-hover:translate-x-1">
        {lane.go} <span aria-hidden>&rarr;</span>
      </span>
    </a>
  );
}

/**
 * The whole of About, as the left hand column of the pinned opening rather than as a section
 * below it.
 *
 * It used to be a section of its own, and before that only its headline had been lifted up here.
 * Neither survived contact with the composition: the headline arriving on the left with nothing
 * under it left the column looking unfinished, and a reader who had just been shown the claim
 * then had to scroll past the portrait to reach its proof. Everything is together now, which is
 * also what shortened the page by a screen and a half.
 *
 * `id="about"` rides on this rather than on a section so the nav rail still has something to
 * scroll to, and it is a proper h2 again, so the outline is unchanged.
 *
 * Sized to fit one viewport beside the portrait, and that is why the sizes here are `min()` and
 * `clamp()` against `vh` rather than the site's type scale steps. This panel is a composition
 * that has to hold one screen, so its type is a function of how much screen there is; at a fixed
 * 644px it slid under the header on any window shorter than about 780px. It is the same
 * exception the scale already makes for display sizes, and the only one on the page. Every one
 * of them is a `clamp()` with 0.75rem as its lower bound, because the scale's floor is a floor:
 * a `min()` against vh alone took the lane descriptions to 11.2px on a 640px window, which is
 * exactly the thing the scale exists to stop.
 *
 * Nothing here animates on its own: HeroStage brings the whole column in from the left, and a
 * second set of reveals inside it would be two gestures where the brief asked for one.
 */
export function AboutPanel() {
  return (
    <div id="about">
      <h2 className="font-display text-[clamp(1.35rem,min(3.3vw,4.6vh),2.9rem)] font-bold leading-[1.04] tracking-[-0.035em] text-cream">
        One person, the <span className="text-forest">whole pipeline</span>.
      </h2>

      <p className="mt-[clamp(0.5rem,1.6vh,1rem)] max-w-[54ch] text-[clamp(0.82rem,2.2vh,1.12rem)] font-light leading-[1.55] text-tan">
        Four lanes, four disciplines I actually ship in. Each one goes straight to the proof.
      </p>

      <div className="mt-[clamp(0.75rem,2.4vh,1.5rem)]">
        {LANES.map((lane) => (
          <LaneRow key={lane.n} lane={lane} />
        ))}
      </div>

      <div className="mt-[clamp(0.75rem,2.4vh,1.5rem)] whitespace-nowrap border-t border-rule pt-[clamp(0.5rem,1.8vh,1.25rem)] font-mono text-[clamp(0.75rem,1.6vh,0.82rem)] uppercase tracking-[0.13em] text-sand">
        Ho Chi Minh City · UEH ISB B.Intl Business 2025 · IELTS 7.0 C1 · VI / EN
      </div>
    </div>
  );
}
