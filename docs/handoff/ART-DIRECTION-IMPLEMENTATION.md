# Art direction continuation — 2026-09-09

Continues PORTFOLIO-VISUALIZATION-NEXT.md and VISUALIZATION-IMPLEMENTATION.md on the existing working tree. This pass responds to the request for substantial visual storytelling and restores the distinct language of the original Video archive.

## Implemented

- Video: restored the original seven section components and all 46 catalogue entries. Awards stage, Roman numeral TVC index, commercial frames, campaign fan (desktop hover and keyboard / mobile swipe), music wall, event timeline, reels strip. Added an original-media film-frame hero and individual section palettes.
- Three generated editorial artworks: shared care, publishing systems, and manuscript revision. Used in Nhà Mình, Terra, IELTS and the homepage systems section. These are visual metaphors, not product screenshots or evidence.
- ScrollArtwork layers respond to scrolling and pointer movement, with CSS perspective on paper and film frames. Aru and Bóng use the actual project stills. No additional continuously rendered WebGL scene. Reduced motion disables the transforms.
- Home review: removed the arbitrary product offset; replaced lavender UpHub backing; moved 12× into the proof row; restored portrait facts and the scroll rail; stacked mobile section labels; removed arbitrary still offsets; made the name more legible. Assembly hero and its document-flow shrink remain.
- Removed the unused duplicate Homepage/HomeInteractions and extracted Assembly CSS before removing their old shared stylesheet. Original technical diagrams, media, chart qualification and interactive previews remain.
- The review's floating N is a development indicator; it is absent from the static production build.

## Asset production

Generated with the built-in image generator, then encoded as WebP at quality 88 without visual editing. Source images are 1536 × 1024. Total shipped artwork is about 477 KiB.

| Shipped asset | Used for |
|---|---|
| public/images/visuals/shared-care.webp | Nhà Mình: two homes connected by shared care |
| public/images/visuals/publishing-machine.webp | Terra and home: repeatable publishing systems |
| public/images/visuals/draft-to-clarity.webp | IELTS: revision and feedback |

### Reproduction prompt briefs

Shared care: Premium editorial 3D sculpture, two warm cutaway homes connected by one continuous coral ribbon bridge. A larger paper-white room and a smaller terracotta room, ceramic furniture, arches and a tiny cream pill pebble. Tactile clay, frosted glass, linen and paper; warm ivory negative space in the upper left; low three-quarter camera. No people, UI, words or medical claims. Stylized conceptual artwork.

Publishing: Premium mechanical paper sculpture. Ivory sheets travel through three forest-green open rectangular frames and become an aligned folio on a curved brushed-metal conveyor. Embossed empty layout blocks, tactile museum-quality materials, oblique perspective, soft light, deep-green cyclorama. No text, neon or robots. Stylized conceptual artwork.

Revision: Sculptural ivory manuscript loop, from crumpled drafts into a confident smooth ribbon. Blue rules and coral proof marks without readable text, a cobalt-glass magnifier, indigo background, visible paper fibers and frosted glass. Low three-quarter view. No screens, grades or logos. Premium conceptual editorial artwork.

## Verification

- Production build exports 18 routes; unit suite: 4 files / 23 tests.
- Browser verification scripts: check-preservation.cjs and check-art-direction.cjs; screenshots in artifacts/art-direction (ignored output).
- Preservation checks passed on all seven pages at 1440 and 390. Homepage checks passed including hover, tabs, hero shrink, themes, images, reduced motion and offscreen 3D.
- Product meta measurements: IELTS and UpHub both start at y=5555.47 and end at y=5718.72 at 1440px; the arbitrary baseline gap is gone.
- Art-direction pass covers every Video format at 1440 and 390, local artwork decoding, catalogue preservation, runtime errors, overflow and campaign keyboard activation. Screenshots are reviewed with network access because sandboxed YouTube requests fail.
- YouTube thumbnails/players require network access; local generated artwork does not.

No commit or deployment requested. Preserve the dirty working tree and previous technical/performance fixes when continuing.
