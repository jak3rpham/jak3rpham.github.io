# Creative Workbench homepage

Status: superseded after user review. The simplified homepage was rejected. The current homepage restores the original visual chapters, shrinking hero, graphs, interactive previews and horizontal project scroll, retains Terra-first ordering, and replaces image sequences with an immersive native 3D hero. Do not use the reduced section list below as the current brief.

## Positioning

Pham Ngoc Thanh / Tatsuki directs AI, connects disciplines, and delivers work across growth, products, and creative production. Recruiters across these disciplines should understand his range. Do not lead with software engineering, coding expertise, or an AI-only job title. Terra is former employment and the first, most substantial case.

## Experience

Reference: https://www.sharplink.com/. Borrow the visual hierarchy of a substantial dimensional hero object, concise copy, cinematic media, and spacious sections. Create original geometry and styling rather than copying its branding or assets.

1. Hero: name, concise positioning, selected-work link, and one interactive chrome/mint 3D assembly. Normal page scroll, with restrained scroll rotation and pointer response. The whole opening fits approximately one desktop viewport.
2. Selected work: Terra first, spanning the width and showing the breadth of growth, content, automation and website work. Keep its existing evidence and case-study route. Follow with Nha Minh and IELTS Studio, with Badminton and UpHub in a compact additional-work index.
3. Creative: large film poster with intentional click-to-play video, plus Aru and Bong case-study links and the existing film archive.
4. About: real portrait and brief description of directing tools, making decisions and owning the result. Present disciplines in plain language, not a wall of technologies.
5. Contact: direct email, existing professional/social links, and location.

## Visual and motion system

Warm paper, near-black ink, restrained pale green accents, expressive large typography using existing fonts. One continuous base palette, with media introducing contrast. Hairlines, square editorial labels, deliberately varied project proportions. Native OGL 3D with analytic studio reflections, no asset sequence. Freeze when offscreen, hidden, paused, or reduced motion. Keep a designed CSS fallback if WebGL fails. Pointer movement affects the sculpture without capturing touch scrolling. Focus states and a pause control remain available.

## Architecture

Keep Next.js static export, Tailwind and existing dependencies. Replace the homepage composition with focused homepage components and scoped CSS. A route-aware site chrome wrapper retains original navigation, smooth-scroll and preloader on inner pages while homepage receives its own compact navigation and native scrolling. Do not remove existing case studies or media. Page metadata must reflect broad positioning.

## Acceptance

- Terra precedes AI products and creative work in DOM and visual order.
- No homepage frame sequence requests, no automatic YouTube iframe load.
- One WebGL canvas at most, rendering stops offscreen and honors reduced motion.
- Test desktop and mobile overflow, navigation, case-study links, video opening/closing and keyboard controls.
- Compare the page length with the prior 14,844px desktop baseline at 1440x900; target under 8,000px.
- Production build and existing test suite pass. Dev/headless timing is diagnostic, not a claim about production Core Web Vitals.
- Deliver a local reviewable homepage; publication is outside this trial's scope.
