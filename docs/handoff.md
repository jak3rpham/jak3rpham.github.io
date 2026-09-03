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
dark    hero                    generated sequence as its ground
light   stat strip, about
dark    systems                 generated sequence as its ground
light   terra teaser
dark    nha minh, aru, bong     the case studies, each with its own look
light   selected builds
dark    video, contact, footer
```

Light where the work is being proved, dark where it is being shown.

### The pieces

- **`components/ThemeFlow.tsx`** decides the state. Children mark themselves `data-zone="dark"`
  or `"light"`; the winner is written to `data-theme` on `<html>`. It is on `<html>` and not on
  a wrapper because the scrollbar and the body background sit outside any wrapper, and
  `color-scheme` is the only thing that actually recolours a scrollbar.
- **`FlowGround`**, in the same file, is the page colour: two stacked sheets that crossfade,
  each with its own drifting orbs and pointer glow in its own state's accent.
- **`components/ShrinkSection.tsx`** narrows the hero into a rounded card as it leaves.
- **`components/SequenceBackdrop.tsx`** plays a frame sequence as a section's background.
- **`components/FrameScrub.tsx`** plays one as a pinned stage of its own. Used on `/aru-otoko`,
  not on the homepage.
- **`lib/scrollTicker.ts`** is the single scroll listener and rAF for the whole page.
- Palette states live in `app/globals.css` under `html[data-theme="dark"|"light"]`.

## Seven things that are true and cost time to learn

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

**3. Keep comments in `globals.css` plain ASCII and undecorated.** A comment with a long
`-----` rule, an em dash and an ellipsis made the build **silently drop the entire rule below
it** from the compiled CSS while the rules after it survived. This cost an hour twice, the
second time in the comment warning about the first.

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

**7. Lightning CSS folds `color-mix()` against a registered property's `initial-value`.** It
emits a static fallback first and the real `color-mix` second, so modern browsers are fine, but
do not be surprised by the frozen colour in the built CSS.

## Verification, given that the preview pane lies

The Browser pane freezes the animation timeline. Consequences:

- **Screenshots of the app are useless.** The preloader uses an `AnimatePresence` exit, the
  exit needs rAF, rAF is frozen, so the curtain never leaves the DOM and every screenshot is a
  picture of it. This is why the whole session was verified by measuring the DOM.
- CSS transitions never advance, so reading a transitioning value returns the start value.
  Set `element.style.transition = 'none'` before asserting a themed value.
- Lenis never scrolls, so scroll driven behaviour cannot be exercised. `window.scrollTo` does
  nothing.

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
- **Per section motion** beyond the three parallax pairs and the stat count up was discussed
  and not specified.
- The reversal of the bone accent decision is recorded; if the homepage should go back to a
  neutral accent, the light state needs a different value, because bone measures 1.9:1 against
  paper.
