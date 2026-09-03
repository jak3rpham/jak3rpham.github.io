# Handoff: the homepage two state rebuild

Written to be read cold at the start of a new session. It covers where the work is, how the
homepage is built now, and the traps that have already been paid for once.

## Where things are

| | |
| --- | --- |
| Working folder | `D:\code\jak3rpham.github.io` |
| Branch | `home-gradient-theme`, pushed |
| `main` | untouched by this work; it is what is live at jak3rpham.github.io |
| Deploy | GitHub Actions, triggered on push to `main` only. Pushing this branch deploys nothing. |

There is a second clone at `E:\Repo\jak3rpham.github.io`, which is where Antigravity generated
the assets. Everything it produced has been copied into the working folder and committed, so
that clone is now redundant. It sits on `main`, several commits behind, with the copied files
untracked. Either delete it or bring it onto this branch; do not edit files in both.

## What the homepage is

It is one page with two states, black and white, plus one accent, and the state is a function
of scroll position rather than a property of a section.

```
light   hero + about (one screen)    who he is; the container over it is dark
dark    systems, terra               the growth work and the tooling under it
light   nha minh, selected builds    the product work
dark    aru, bong, video, close      the film work
```

Three crossovers. The opening is NOT one of them: the page is paper from its first pixel and the
hero container is a dark surface laid on top of it, so the frame closing on the portrait uncovers
light that was always behind. See item 15. It used to be seven runs and six, alternating on nearly every
section, which turned the device into a tic. Aru and Bong were moved down out of the middle to
join the video reel rather than being printed on paper or costing two more crossovers; they are
both music video work and the reel follows them, so it is the run they belonged to. That is the
only place the READING ORDER was changed rather than the colour.

The hero sequence therefore plays as ink artwork for the first 60% of the stage and inverts to
its pale form for the rest, on the same frame the page does.

### The pieces

- **`components/ThemeFlow.tsx`** decides the state. Children mark themselves `data-zone="dark"`
  or `"light"`; the winner is written to `data-theme` on `<html>`. It is on `<html>` and not on
  a wrapper because the scrollbar and the body background sit outside any wrapper, and
  `color-scheme` is the only thing that actually recolours a scrollbar.
- **`FlowGround`**, in the same file, is the page colour: two stacked sheets that crossfade,
  each with its own drifting orbs and pointer glow in its own state's accent.
- **`components/Preloader.tsx`** carries `.theme-ink`. The curtain is the same object on every
  route and must not read the page's state; the homepage opens on paper, so without it the site
  loaded dark, flashed to a white sheet and then uncovered a dark hero. It also covers the one
  frame between the server's default palette, which is the dark one from `@theme`, and the
  homepage asking for paper.
- **`components/HeroStage.tsx`** is the opening, as one pinned 300vh screen with three things
  happening at once: the hero's frame CLOSES IN on the portrait with `clip-path: inset()`, four
  corners rounding by different amounts on the way; the closed frame drifts across to settle at
  63% of the viewport on a curve that LAGS the close, so it reads as two beats rather than a
  scale; and the whole About panel arrives from the left into the room that leaves while the
  numbers arrive from the right. `clip-path` rather than `scale` because the container pulls in
  TO the portrait, which means the frame closes over the copy while the portrait stays the size
  it was. The container itself is `.theme-ink` on a light zone, so it is the dark thing and
  closing it uncovers paper. It replaced `ShrinkSection`, which narrowed the hero by 7% on its
  way out of the viewport.
- **`components/About.tsx`** exports `AboutPanel`, not a section. All of it, headline through
  credentials line, is the stage's left column; there is no About section below any more, which
  is what took a screen and a half off the page.
- **`components/StatColumn.tsx`** is the numbers as a vertical column, to the right of the
  portrait. It replaced the horizontal marquee band, which had nowhere to run once the opening
  became one pinned screen.
- **The nav rail hides for the length of the stage**, on `html[data-opening="1"]`. Measured at
  1440: the three columns of the closed composition want 72 + 672 + 40 + 332 + 40 + 162 = 1318 of
  the 1440, and the rail with an active label showing is another 160. Something had to give, and
  a rail for moving between sections has nothing to offer while one section is pinned across the
  whole screen.
- **`components/SequenceSpan.tsx`** plays a frame sequence across a RUN of sections. It pins a
  viewport sized canvas behind its children with `sticky` plus a negative bottom margin of its
  own height, so the artwork holds still and keeps drawing while the sections move over it, then
  fades out once it is spent. Progress is the wrapper's own traversal,
  `(scrollY - top) / (height - viewport)`; `playStart`/`playEnd` are the window inside that run
  the frames are spent over, so a sequence can lead a section in and be finished before the run
  ends. `SequenceBackdrop`, which filled one section, is gone; both sequences use this.
- **`components/FrameScrub.tsx`** plays one as a pinned stage of its own. Used on `/aru-otoko`,
  not on the homepage.
- **`lib/scrollTicker.ts`** is the single scroll listener and rAF for the whole page.
- Palette states live in `app/globals.css` under `html[data-theme="dark"|"light"]`.
- **The type scale** lives there too, as `.t-micro` through `.t-lead`. There were thirty one
  different literal font sizes on the homepage and twenty of them were under 0.75rem, the
  commonest being 0.62rem and 0.6rem and a few at 0.54rem, which is under 9px. 255 literals across
  54 files were mapped onto five steps and **0.75rem is the floor**; the smallest rendered text on
  the page measures 12px and nothing is below it. Two SVG `fontSize` literals were raised by hand,
  since there is no class to hang the scale on there. Use the class, never a literal: the next
  tuning pass should happen in one place. Display sizes stay as `clamp()` in the components,
  because those are compositional rather than scale steps.

## Twenty-one things that are true and cost time to learn

**1. Do not animate the palette tokens.** They were registered with `@property` and
transitioned, which animates inherited custom properties on the root and invalidates the
computed style of every element in the document on every frame. Measured on the built page, one
palette swap costs 24.5ms of style and layout; animating it paid that about sixty times a
second. The swap is now a single frame, and the transition the reader sees is two compositor
only moves: the ground sheets crossfade and the content dips in opacity.

**2. Ground and text change on the same frame.** An earlier version flipped the ground on the
boundary and let the tokens follow 90ms later, so a dip could hide the swap. What it produced
was copy visibly sitting on the wrong ground. Both are keyed to `data-theme` now and there is
no ordering left to tune.

**3. Keep comments in `globals.css` plain ASCII and undecorated, and VERIFY the compiled sheet
after every CSS change.** A comment with a long `-----` rule, an em dash and an ellipsis made the
build silently drop the entire rule below it while the rules after it survived. It has now cost
time three times. The third was `.theme-ink` vanishing from the dev server's sheet after having
been verified present earlier in the same session, which turned the hero container white and
inverted the whole opening; the file still had two non ASCII characters left in old comments, an
em dash and an ellipsis, and they are gone now.

The check that actually settles it, because the dev server's cache is not to be trusted:

```bash
npx next build && grep -c "your-rule" .next/static/chunks/*.css
```

A rule present in the source and absent from the sheet is this, every time. Do not spend an hour
looking anywhere else.

**4. Nothing scroll driven may call `getBoundingClientRect` in the scroll path.** It forces a
synchronous layout every frame. Measure on mount and on resize; the scroll path compares
numbers. `lib/scrollTicker.ts` gives you a `measure` callback for exactly this.

**5. Use a scroll listener, never an IntersectionObserver, for continuous state.** The site
runs Lenis, which does not emit events IO observes, so IO never fires. One shot triggers that
only need to fire once at some point are fine with IO; the stat strip does that.

**6. Moving tokens up the tree can put them below an inline override.** `ThemeScope` set the
accent as an inline style on a div inside `body`. Moving the palette to `<html>` put it above
that div, an inline style on a descendant beats an inherited value from an ancestor, and the
accent silently stayed bone everywhere. `ThemeScope` is deleted.

**7. The hero could not be pinned until it stopped having to survive the swap.** The first
attempt put a pinned sequence behind the old shrink card and it was invisible, because the card
painted a literal ink to keep its cream copy legible through a swap that lands while the hero is
still more than half on screen. Making the card transparent put paper under paper themed copy.
What fixed it was not a z-index but the height: HeroStage is one 280vh dark zone, so the page
does not reach for paper until the card is long gone, and the card can be a scrim over the
artwork instead of a block in front of it.

**8. The sequence layer inverts on paper rather than dying at the boundary.** ThemeFlow hands the
page to paper when the NEXT zone's top crosses 55% of the viewport, and `#systems` is shorter
than a viewport, so paper arrives 15% into that run. Measured on frame 75 at the opacity it
ships with: laid over paper unchanged it drops the mean from 241 to 170, which is the whole page
going grey. Inverted it lands at 235, with the line work reading at 160. So `.seq-art` carries
`invert(1) hue-rotate(180deg)` under `html[data-theme="light"]`, on the same 190ms as the ground
sheets. The hue rotate is not decoration: without it the accent goes to its complement.

**9. Do not wash an image toward `--color-ink` to calm it down.** The work cards are in a light
zone, where the ink token IS the paper, so a wash toward it lightens. Three of the four
screenshots are light UI at a mean luminance around 230; washing them 35% toward paper took them
to 240 against a white card and the window disappeared. Measured, not guessed. What unifies them
now is `mix-blend-color` alone, which takes hue and saturation from the sheet and keeps the
screenshot's own luminance: the four came out at 137 / 222 / 241 / 235 with their contrast ranges
intact at 207 / 224 / 194 / 230. Separation from the card is a border's job, not a wash's.

**10. Turbopack served a stale globals.css across a full server restart.** A block added between
`.shrink-stage` and `.grain-bg` was simply absent from the compiled sheet, and stopping and
restarting the dev server did not change it, which looks exactly like the dropped rule in item 3
and is not. Writing the file again cleared it. Before spending an hour on a CSS rule that is not
being emitted, touch the file and refetch the compiled sheet.

**11. A child's effect runs before its parent's, so the first tick can read a stale theme.**
`SequenceSpan` chose its opacity by reading `data-theme` in the scroll path. Its own effect
subscribes before `ThemeFlow`'s effect has written that attribute, so the very first tick found
nothing and painted the dark strength for a frame on a page that opens on paper. The tick now
writes only `--seq-p`, the 0 to 1 ramp, and which peak it multiplies is a CSS decision keyed to
`data-theme`. Anything scroll driven that needs to know the theme has this problem; prefer a
declarative selector to a read.

**12. A dark artifact on a paper page needs `.theme-ink`, not a data-zone.** The Nha Minh teaser
renders a simulated app interface, and when its run moved onto paper the whole mock inverted with
the tokens: dark glass panels went white on a white card and the white hairlines they are drawn
with disappeared into them. `.theme-ink` re declares the palette custom properties on a wrapper,
which works because they are inherited. Use it for a self contained picture of a product. Do not
use it to opt a section out of the theme flow; that is what `data-zone` is for.

**13. The corner radii have to CONVERGE, not just differ.** Four different multipliers on one
radius gave four different radii sitting around the portrait once the frame was shut, which read
as a second frame drawn around the card that is already there. Each corner is
`end * close + bump * sin(pi * close)` now: the bump peaks half way and is gone by the end, so
they differ hardest where it can be seen and all land on the portrait card's own 16px.

**14. An inline style cannot be overridden by a hover class.** The selected builds screenshots
carried their rest filter as `style={{ filter: ... }}` and `group-hover:[filter:...]` next to it,
so the hover had nothing to beat and the colour never came back. Rest states that a hover has to
win against belong in a class. This is the same shape as the `ThemeScope` bug in item 6.

**15. The opening is a LAYER, not a state.** (And when it looked reversed, the cause was item 3,
not the design: `.theme-ink` had been dropped from the compiled CSS, so the container read the
page's own paper tokens and the dark thing became the white thing.)

 Three versions of this were built before the right
one. A dark zone that swapped to light mid stage got the chrome right and made the reveal a timed
state change. A light zone with a dark container got the reveal right and left the header and the
nav rail in paper colours on a black screen. What works is neither: the page is paper throughout,
the container is a dark surface over it, and the SITE CHROME adapts on its own. HeroStage writes
`data-chrome="ink"` on the document for exactly as long as the closing frame's top edge is still
above the header, and `.chrome-adaptive` on the nav and the rail re declares the ink palette while
it is set. Nothing about the ground moves; only the thing covering it does.

Two techniques were retired on the way and are worth remembering. A `[data-zone]` marker does not
have to be at the top of its zone: put it partway down and the swap fires where you want it. And
a `ThemeBand`, an empty block between runs whose marker sits `LINE` deep inside it, lands the swap
on a frame where no copy is on screen at all. Both work. Both cost a screenful of scrolling.

**16. Never measure an element that animates, and never animate the element you measure.** The
hero portrait arrived with framer's `y: 40`, and `getBoundingClientRect` includes transforms, so
HeroStage aimed its shut frame 40px below where the portrait would settle: the frame cut the top
off the picture and left a band of scrim under it. It only showed at some window sizes, which is
what made it look like an aspect ratio bug. Three things fix it and all three are needed: the box
is read from `offsetLeft`/`offsetTop`, which are layout positions and ignore transforms; the
`data-hero-portrait` marker is a plain wrapper with the motion element inside it; and the entry
animation is opacity only, because a positional one still put the picture 40px below the frame
for the first second and a half of the page. Verified: window [751,255,1063,645], image
[752,256,1062,644]. A `ResizeObserver` on the card covers the rest, the image loading and a font
swapping after mount.

**17. A palette scope overrides ALL of it, accent included.** There was a `.theme-ink` class for a
while, re declaring the ink palette on a wrapper so the Nha Minh simulation could stay a dark
picture on a paper page. It also re declared `--color-forest`, which beat the orange the section
sets from above, so the mock went back to the page's green while everything around it was orange.
Both the class and the mock's dark treatment are gone now, but the rule stands for the next time:
a scope that overrides a palette overrides every token in it, so anything set further up has to
be set again inside.

Nha Minh's accent is still `--color-forest: #E05334` on the section, which is the cheapest way to
recolour a whole section: every `text-forest`, `border-forest` and `bg-forest` inside follows,
and it still crosses states with everything else because it is set once rather than per element.

**18. A `clip-path` takes the element's shadow with it.** Clipping is applied after an element's
own box-shadow and after its filters, so a shadow on the closing container was clipped away with
everything else. The shadow lives on a WRAPPER as `filter: drop-shadow()`, which takes the already
clipped shape as its input and casts from that. It is static, so nothing is written per frame; at
full bleed the shadow is simply off screen. Heavier on paper, where a dark card has to be lifted.

**19. The frame's band is UNEVEN on purpose, and the settle point follows the frame.** At 0 all
round, the shut frame landed exactly on the portrait card and the right hand edge was the one that
read as missing its border. Opening all four sides to 10px fixed that edge and turned the other
three into a mount nobody had asked for. `inset` takes per side values now: three sides sit 3px
off the card, enough that no edge can land on a sub pixel, and the right carries an 18px band.
It ships even, at -2 a side: the clip lands 1px INSIDE the photograph, which takes the card's
hairline and the edge the drop-shadow softens against it, so no dark trace survives anywhere.
Measured: -1 on all four sides, the difference being the hairline. The uneven form is still there
if it is wanted, and was measured at left 4, top 4, bottom 4, right 19.

Two consequences. The radius is 19, the smaller offsets plus the card's 16, because an outer
radius has to be the inner one plus the offset or the curves are not parallel. And `drift` settles
the FRAME's centre rather than the picture's, which with an uneven band are different points;
measured, the frame lands at 980 against a target of 979.

**20. A fixed height panel cannot be centred on the viewport.** The About panel is 644px tall and
the closed composition centred it on the screen, so on any window shorter than about 780px half of
what was left over could not clear the 68px header and the headline went under it. Two things fix
it and both are needed: the columns now span from `--nav-h` to just short of the bottom and centre
their own contents, and the panel's type and rhythm are `clamp()` against `vh` so it shrinks with
the window. Measured: 599px tall at 900, 526 at 740, 484 at 640, clearing the header at all three.

The vh sizing is the ONE exception to the type scale on the page, and every clamp in it has
0.75rem as its lower bound: a `min()` against vh alone took the lane descriptions to 11.2px on a
640px window, which is the exact thing the scale exists to stop.

**21. Lightning CSS folds `color-mix()` against a registered property's `initial-value`.** It
emits a static fallback first and the real `color-mix` second, so modern browsers are fine, but
do not be surprised by the frozen colour in the built CSS.

## Verification, given that the preview pane lies

The Browser pane freezes the animation timeline. Consequences:

- **Screenshots of the app are useless.** The preloader uses an `AnimatePresence` exit, the
  exit needs rAF, rAF is frozen, so the curtain never leaves the DOM and every screenshot is a
  picture of it. This is why the whole session was verified by measuring the DOM.
- CSS transitions never advance, so reading a transitioning value returns the start value.
  Set `element.style.transition = 'none'` before asserting a themed value.
- Lenis never scrolls, so scroll driven behaviour cannot be exercised live. Worse, once a frozen
  rAF is pending the shared ticker's own guard never clears, so dispatching `scroll` by hand does
  nothing either, and replacing `window.requestAnimationFrame` after load does not help.
- **The way through it is to sample by reload.** `document.documentElement.scrollTop = N`, then
  reload: the browser restores the offset and `onScrollFrame` runs its first tick synchronously
  at that position, so every scroll driven value can be read for one point on the curve. One
  reload per sample, and it is real. This is how the hero card was checked at q=0.35 and q=0.72.

What does work:

- Measuring computed styles, geometry and attributes.
- **A standalone static HTML page** in `public/`, built from the real CSS extracted out of
  `globals.css`. It has no Lenis and no preloader, so it screenshots. This is how the seam
  gradients and the shader were checked. Delete it afterwards.
- Resolving colours by painting them on a 1x1 canvas twice, over black and over white, to
  recover true colour and alpha. `getComputedStyle` returns `oklab(...)`, which naive parsers
  read as RGB and get badly wrong.
- Serving `out/` with `python -m http.server` on a spare port, so the user's own dev server on
  3000 is left alone. Stop it before `rm -rf out`, or the delete fails.

## The generated assets

Antigravity produced them from `docs/antigravity-brief.md`, which is a standalone file with no
engineering in it and can be handed to the agent as is. `docs/scroll-sequence.md` holds the
pipeline and the component contracts.

```
public/images/home/frames/hero/      150 frames, 1920x1080, 8.2MB   ships
public/images/home/frames/systems/   150 frames, 1920x1080, 6.4MB   ships
public/images/home/*-still.webp      posters                        ships
assets-src/home/                     source PNG and MP4, 18MB       not shipped
scripts/*.py                         the Veo pipeline
```

Kept at full resolution deliberately: quality was chosen over weight. The cost is managed by
when and where the frames are fetched, not by degrading them. `SequenceBackdrop` and
`FrameScrub` both take `minWidth` (900, so phones never fetch a sequence they cannot resolve)
and `preloadVh` (0.75, so the fetch starts once the reader has begun scrolling). Both checks
run per tick, not once on mount, because a window that starts narrow and is widened would
otherwise be stuck on the poster for the session.

The first pass from Antigravity was unusable and it was not obvious: a 1376x768 still that was
a **JPEG renamed to `.png`**, a 720p video, and 960x540 frames. Check the magic bytes and
`ffprobe` every delivery before building on it.

## Open

- **Accent mismatch.** The artwork uses teal, from an earlier version of the brief. The page
  accent is now green, `#8FD49E` on ink and `#1E6E42` on paper. The user chose to leave it for
  now. `#14796C` is terra's brand colour and belongs to the terra 3D mark only.
- **Nothing has been visually approved.** Every claim in this document is measured, not seen.
  The composition of the hero with the sequence behind it, and of the systems section, needs
  the user's eyes.
- Both runs are tuned against measured geometry at a 900px viewport: the hero stage gives 1800px
  of travel, and the second run is systems for its first 46% and terra for the rest. Every
  fraction in `app/page.tsx` moves if a section is re-cut. The systems sequence used to start
  part way through About so it could lead the label in; About is inside the pinned opening now,
  so there is no section above that run to lead it from.
- **The frame sequences are the real weight, and it is decoded memory rather than bytes.** The
  two directories are 8.2MB and 6.4MB on the wire, which is fine, but each holds 150 images at
  1920x1080 in an array and every one of them is drawn to a canvas, which forces a decode. Held
  as bitmaps that is 1.16 GB per sequence; Chrome evicts, so the real figure is lower and could
  not be measured from here, because decoded images live outside the JS heap that
  `performance.memory` reports. If the page is ever heavy on a weaker machine, look here before
  looking at the theme flow, which costs three crossfades for the whole document.
- **The hero's clip is the one performance unknown.** It is a `clip-path` on a full screen layer
  changing every frame. `will-change` is set so the compositor should apply the rounded rect to
  an existing texture rather than repainting the contents, but that has not been measured on a
  real machine, only reasoned about. If the opening ever feels heavy, this is the first thing to
  look at.
- The theme crossover was slowed from 190ms to 320ms on the ground with the dip stretched to
  match. The tokens still swap in one frame, so there is a limit here: past about this the copy
  sits on a half mixed ground long enough to see.
- **Per section motion** beyond the three parallax pairs and the stat count up was discussed
  and not specified.
- The reversal of the bone accent decision is recorded; if the homepage should go back to a
  neutral accent, the light state needs a different value, because bone measures 1.9:1 against
  paper.
