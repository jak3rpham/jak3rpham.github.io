# Vitalité portfolio showcase — 2026-09-26

User approved a visual-first redesign of the existing portfolio case study. Preserve the model hero, demo, screenshots and next-project link; remove the long five-chapter essay and operational accordions.

## Implementation
- `components/stories/VitaliteStory.tsx`: concise overview, expanding homepage screenshot, asymmetric desktop/mobile catalogue, interactive grey/white screenshot comparison, keyboard-accessible 96-frame CGI scrubber, demo CTA and cart image.
- `components/stories/VitaliteShowcase.module.css`: page-scoped layout and type scale, mobile layout and reduced-motion fallback.
- Existing assets reused. Hero remains high-priority; below-fold images lazy-load. Sequence frames requested as selected, rather than downloading all 96 on entry. No video payload added. LCP was not benchmarked.
- CGI and demo/payment limitations remain visibly labelled. Production storefront unchanged.

## Browser verification
- Preview: `http://localhost:8001/vitalite.html?showcase=final` (query bypasses the previously cached HTML).
- Desktop 1440×900 and mobile 390×844 inspected. No horizontal overflow.
- White/grey swatches change the active screenshot and pressed state.
- Sequence End key selects frame 96, loaded at natural width 2560; ArrowRight selects frame 2 on mobile.
- CTA contrast corrected after visual review. No browser console errors observed.
- Approximately 195 rendered words including shared navigation/footer.
- Build/typecheck passed. Targeted lint: no errors after replacing the root anchor with Next Link; native image optimization warnings retained for the existing WebP/static-export workflow.

No deployment or commit requested. Unrelated untracked homepage videos/stills left untouched.

## Palette update — 2026-09-27
Approved charcoal #111111, paper #F3F2EE and silver #B8BABD applied. Page-scoped root tokens neutralize shared navigation/footer; only the decorative FlowGround is desaturated, not brand imagery. Fresh build/typecheck passed. Desktop and 390px mobile visually inspected, including catalogue and footer; no horizontal overflow. Preview restarted at localhost:8001. Full-homepage/About material expansion remains pending (see Vitalité project's PORTFOLIO-MATERIAL-AUDIT.md).

## Expanded showcase — 2026-09-27
- Added complete homepage preview with section jumps, The Moments collection and film, asymmetric lifestyle gallery, front/back product toggle, original About sequence preview, identity/type/palette board, mobile pairing and supporting page previews.
- Neutral charcoal/paper/silver presentation retained; supplied photography retains original colours.
- Fixed iframe readiness: interactive documents become visible without waiting for every external resource. Disabled previews are inert until interaction is enabled.
- Validation: production build and TypeScript passed; git diff --check passed. Browser checked desktop 1440x900 and mobile 390x844. Homepage gallery jump, About Fit jump, product back view, and Contact preview verified visually. No broken main-document images or horizontal overflow observed on mobile.
- Native lazy iframe loading; campaign film preload=none. About uses its original 96-frame sequence. No performance benchmark claimed. Static demo is not live checkout/payment verification.
- Preview: http://localhost:8001/vitalite.html?showcase=expanded

## Homepage integration — approved 2026-09-27
- Added a Vitalité feature after Nhà Mình within Selected Work: campaign image, neutral charcoal/paper treatment, overlapping storefront screenshot, concise role/context and links to the approved case study.
- Added Vitalité to the home section rail. Existing projects and homepage motion retained.
- Production build + TypeScript passed. git diff --check passed. Browser verified at 1440x900 and 390x844; both new images decoded, no mobile horizontal overflow, Explore Vitalité opens /vitalite.html successfully.
- Local preview only; no commit or deployment performed.
