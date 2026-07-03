# Portfolio Layout Fixes v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (single file, sequential edits - see the ordering note below). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the four concrete problems the owner flagged after seeing the first motion-redesign pass live: the Terra live-site frame reads as tiny/squat, the sticky-stack transition is illegible (layers competing instead of one clearly reading as "in front"), the Bong Vespera ad mockup is disproportionately large, and the Selected Work section repeats the same image+text layout three times in a row.

**Architecture:** Same single-file static site (`index.html`), no build step. Each task is a targeted CSS/markup/JS edit. No new dependencies (GSAP is already loaded from the first pass).

**Tech Stack:** Vanilla HTML/CSS/JS, GSAP 3.12 + ScrollTrigger (already present), Python `http.server` preview (config at `C:\Users\jaker\.claude\launch.json`, name `portfolio-static`).

**Design doc:** `docs/superpowers/specs/2026-07-03-portfolio-redesign-design.md`, section "Addendum (2026-07-03, v2)"

**Ordering:** Run tasks 1 → 4 in order. They touch different regions of `index.html` (Terra section, Terra section, Bong Vespera section, Work section) so there's less cross-task anchor dependency than the first pass, but still edit the same file - run sequentially, not in parallel subagents.

---

## Verification approach

Same as the first pass: no test framework, so verification means loading the page via `mcp__Claude_Preview` tools and checking real DOM/CSS/screenshots. Start the server with `mcp__Claude_Preview__preview_start` (`name: "portfolio-static"`) before Task 1's verification. Reload after each edit. Check `preview_console_logs` with `level:"error"` after every task - zero errors expected. **This time, also take an actual screenshot at each visual checkpoint and look at it** - the first pass's bug (illegible stack, tiny frame, oversized mockup) slipped through because verification checked JS values but not visual legibility. Numbers matching expectations is necessary but not sufficient - look at the picture.

---

### Task 1: Terra live-site frame - moderate, capped width instead of full-bleed

**Root cause:** `.shot-win{height:380px}` is a fixed pixel height, but `.shot` has no width constraint, so inside the new `.stack-card-scroll` flex wrapper (added in the first pass) it stretches to the full container width - a 380px-tall frame at ~1200px+ width renders as a squat letterboxed strip.

**Files:**
- Modify: `index.html` (CSS: `.shot-win` height + hover/keyframe calc, new `.stack-card-scroll .shot` width cap, dead `.terra-2col` rule removal)

- [ ] **Step 1: Remove the dead `.terra-2col` rule (leftover from the first pass, no longer used anywhere in the markup)**

Find:
```css
.terra-2col{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:start;margin-bottom:1.6rem}
.work-feat{display:grid;grid-template-columns:1fr 1fr;gap:2.2rem;align-items:center;padding:1.4rem 0}
```

Replace with:
```css
.work-feat{display:grid;grid-template-columns:1fr 1fr;gap:2.2rem;align-items:center;padding:1.4rem 0}
```

- [ ] **Step 2: Increase the frame height moderately and cap its width so it stops stretching full-bleed**

Find:
```css
.shot{border:1px solid var(--panel-bd);border-radius:14px;overflow:hidden;background:#18211A;transition:transform .35s var(--ease),border-color .35s;margin-bottom:1.8rem}
.shot:hover{border-color:var(--forest);transform:translateY(-4px)}
.shot-bar{display:flex;align-items:center;gap:.4rem;padding:.6rem 1rem;background:rgba(0,0,0,.3);border-bottom:1px solid var(--rule)}
.shot-win{position:relative;height:380px;overflow:hidden}
.shot-win img{position:absolute;top:0;left:0;width:100%;display:block;transition:transform 6s ease}
.shot:hover .shot-win img{transform:translateY(calc(380px - 100%))}
```

Replace with:
```css
.shot{border:1px solid var(--panel-bd);border-radius:14px;overflow:hidden;background:#18211A;transition:transform .35s var(--ease),border-color .35s;margin-bottom:1.8rem}
.shot:hover{border-color:var(--forest);transform:translateY(-4px)}
.shot-bar{display:flex;align-items:center;gap:.4rem;padding:.6rem 1rem;background:rgba(0,0,0,.3);border-bottom:1px solid var(--rule)}
.shot-win{position:relative;height:460px;overflow:hidden}
.shot-win img{position:absolute;top:0;left:0;width:100%;display:block;transition:transform 6s ease}
.shot:hover .shot-win img{transform:translateY(calc(460px - 100%))}
/* moderate, centered frame inside the Terra sticky-stack - not full-bleed */
.stack-card-scroll .shot{width:100%;max-width:640px;margin:0 auto 1.8rem}
```

- [ ] **Step 3: Fix the pre-existing 360px/380px mismatch in the scroll-reveal keyframe (was already wrong before this plan, now doubly wrong since the height changed to 460px)**

Find:
```css
@keyframes shotscroll{from{transform:translateY(0)}to{transform:translateY(calc(360px - 100%))}}
```

Replace with:
```css
@keyframes shotscroll{from{transform:translateY(0)}to{transform:translateY(calc(460px - 100%))}}
```

- [ ] **Step 4: Verify in the browser**

Reload, then:
```js
(() => {
  document.getElementById('terraStack').scrollIntoView();
  const shot = document.querySelector('#terraStack .shot');
  const win = document.querySelector('#terraStack .shot-win');
  const cs = getComputedStyle(shot);
  return new Promise(r => setTimeout(() => r({
    shotMaxWidth: cs.maxWidth,
    shotWidthPx: shot.getBoundingClientRect().width,
    winHeightPx: win.getBoundingClientRect().height
  }), 300));
})()
```
Expected: `shotMaxWidth: "640px"`, `shotWidthPx` at or below 640 (and centered - not spanning the full section width), `winHeightPx` at or near 460.

Take a `mcp__Claude_Preview__preview_screenshot` at this scroll position and actually look at it: the frame should read as a moderate, centered browser window - clearly smaller than the full section width, not edge-to-edge, not a thin letterboxed strip.

Check `preview_console_logs` `level:"error"` - expect none.

- [ ] **Step 5: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add index.html
git commit -m "Cap Terra live-site frame to a moderate centered width, fix squat proportions"
```

---

### Task 2: Sticky-stack legibility - clear front/back separation

**Root cause:** the outgoing card only dims to `opacity:.55, scale:.92` - not enough separation, so it visually competes with the incoming card instead of clearly reading as "behind."

**Calibration from feedback:** don't hide the receding card completely (a little peek-through is fine and looks nice), but the front/active card must be unambiguously the one that reads clearly. So: dim the outgoing card further and add a touch of blur, and give every stack card a persistent drop shadow so whichever one is at full opacity/scale reads as elevated/in-front by contrast.

**Files:**
- Modify: `index.html` (CSS: shared card shadow; JS: GSAP tween values)

- [ ] **Step 1: Add a persistent shadow to every stack card, so the full-opacity one always reads as "in front" relative to the dimmed one behind it**

Find:
```css
.terra-stack{position:relative}
.stack-card-scroll{min-height:56vh;display:flex;align-items:center;justify-content:center;padding:1.4rem 0}
```

Replace with:
```css
.terra-stack{position:relative}
.stack-card-scroll{min-height:56vh;display:flex;align-items:center;justify-content:center;padding:1.4rem 0}
.stack-card-scroll>*{box-shadow:0 26px 60px rgba(0,0,0,.45)}
```

- [ ] **Step 2: Calibrate the GSAP dim/scale/blur on the outgoing card**

Find:
```js
    gsap.to(card,{scale:0.92,opacity:0.55,ease:'none',scrollTrigger:{trigger:stackCards[i+1],start:'top bottom',end:'top top',scrub:true}});
```

Replace with:
```js
    gsap.to(card,{scale:0.9,opacity:0.4,filter:'blur(2px)',ease:'none',scrollTrigger:{trigger:stackCards[i+1],start:'top bottom',end:'top top',scrub:true}});
```

- [ ] **Step 3: Verify in the browser**

Reload at desktop width (1280x800 via `mcp__Claude_Preview__preview_resize`), then:
```js
(() => {
  document.getElementById('terraStack').scrollIntoView();
  return new Promise(r => setTimeout(() => r(window.scrollY), 200));
})()
```
Note the `scrollY`, then scroll roughly halfway into the first transition zone (use the same technique as the first pass: read `ScrollTrigger.getAll()` start/end values and scroll to the midpoint of the second entry - the scrub tween - via `window.scrollTo`), then:
```js
(() => {
  const cards = [...document.querySelectorAll('#terraStack .stack-card-scroll')];
  const first = cards[0].querySelector(':scope > *');
  return { opacity: getComputedStyle(first).opacity, filter: getComputedStyle(first).filter, transform: getComputedStyle(first).transform };
})()
```
Expected: `opacity` around `"0.4"` (partway through the scrub it will be between 1 and 0.4), `filter` includes `blur(`, `transform` shows a scale below 1.

Take a `preview_screenshot` at this scroll position and actually look at it: the outgoing card should read as clearly receded (dim, soft, blurred) while the incoming card is fully sharp and sits visually in front (helped by the new shadow). This is the check that was skipped last time - confirm it looks right, not just that the numbers are right.

Check `preview_console_logs` `level:"error"` - expect none (GSAP's `filter` animation runs through its CSS plugin, no separate import needed, but confirm nothing broke).

- [ ] **Step 4: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add index.html
git commit -m "Calibrate Terra sticky-stack fade so the front card reads clearly"
```

---

### Task 3: Bong Vespera ad mockup - cap to a moderate size

**Root cause:** `.mock-body{aspect-ratio:2/3}` (portrait) sits in a `1fr 1.2fr` grid column next to a short 4-line stat block - the portrait image stretches to fill the full column width, making it far taller than its sibling.

**Files:**
- Modify: `index.html` (CSS: cap `.mock` width when inside `.bong-foot`)

- [ ] **Step 1: Add a width cap so the mockup reads as a moderate card, not a full-column-height image**

Find:
```css
.bong-foot{display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(1.5rem,4vw,3rem);align-items:center}
```

Replace with:
```css
.bong-foot{display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(1.5rem,4vw,3rem);align-items:center}
.bong-foot .mock{max-width:300px;margin-left:auto}
@media(max-width:900px){.bong-foot .mock{max-width:100%;margin-left:0}}
```

- [ ] **Step 2: Verify in the browser**

Reload, then:
```js
(() => {
  document.getElementById('bong').scrollIntoView();
  const mock = document.querySelector('.bong-foot .mock');
  return new Promise(r => setTimeout(() => r({
    widthPx: mock.getBoundingClientRect().width,
    heightPx: mock.getBoundingClientRect().height
  }), 300));
})()
```
Expected: `widthPx` at or below 300, `heightPx` proportionally `widthPx * 1.5` (2:3 aspect ratio) - so around 450px, moderate rather than filling the whole section height.

Take a `preview_screenshot` and confirm visually: the mockup should look like a reasonably sized card next to the stat block, not a tall banner dominating the section, and not a thumbnail-sized sliver either.

Check `preview_console_logs` `level:"error"` - expect none.

- [ ] **Step 3: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add index.html
git commit -m "Cap Bong Vespera ad mockup to a moderate size instead of full column height"
```

---

### Task 4: Selected Work - one featured project + two compact cards

**Root cause:** `uphub.vn`, `Badminton Payment Splitter`, and `IELTS Studio` all use the identical `.work-feat` image-left/text-right split, three times in a row - the taste-skill's section-layout-repetition rule flags 3+ consecutive identical layouts, and it's a direct cause of the page feeling unchanged.

**Files:**
- Modify: `index.html` (CSS: new `.work-feat-hero` and `.work-compact-row`/`.work-compact-card` rules; markup: restructure the three project entries)

- [ ] **Step 1: Add CSS for the featured-hero and compact-card layout families**

Find:
```css
.wf-img .shot{margin-bottom:0}
.wf-shotwin{aspect-ratio:16/9;overflow:hidden;background:#1c2419}
.wf-shotwin img{width:100%;height:100%;object-fit:cover;object-position:top}
```

Replace with:
```css
.wf-img .shot{margin-bottom:0}
.wf-shotwin{aspect-ratio:16/9;overflow:hidden;background:#1c2419}
.wf-shotwin img{width:100%;height:100%;object-fit:cover;object-position:top}

/* featured hero card (replaces one of the three identical work-feat splits) */
.work-feat-hero{margin-bottom:2.4rem}
.wf-hero-shotwin{aspect-ratio:21/9;overflow:hidden;background:#1c2419;border-radius:14px 14px 0 0}
.wf-hero-shotwin img{width:100%;height:100%;object-fit:cover;object-position:top}
.wf-hero-meta{display:flex;justify-content:space-between;gap:2rem;flex-wrap:wrap;padding-top:1.5rem}
.wf-hero-right{max-width:52ch}

/* compact card grid (replaces the other two identical work-feat splits) */
.work-compact-row{display:grid;grid-template-columns:1fr 1fr;gap:1.6rem;margin-bottom:1rem}
.work-compact-card .wf-shotwin{aspect-ratio:16/10;margin-bottom:1rem;border-radius:14px}
@media(max-width:820px){.wf-hero-meta{flex-direction:column}.work-compact-row{grid-template-columns:1fr}}
```

- [ ] **Step 2: Restructure the three project entries**

Find:
```html
      <div class="work-feat fu" data-d="1"><div class="wf-txt"><span class="idx-n">01</span><div class="idx-t">uphub.vn</div><div class="idx-tags">SEO Consulting · Freelance 2024 · EN / VI</div><p class="idx-desc">Metadata audit and rebuild across 18 bilingual variants, keyword gap analysis, H1 and slug restructuring, 301 redirect mapping with zero indexed traffic loss.</p><a class="idx-link" href="https://uphub.vn" target="_blank">Visit ↗</a></div><div class="wf-img"><div class="shot"><div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">uphub.vn</span></div><div class="wf-shotwin"><img src="images/uphub.webp" alt="uphub.vn" loading="lazy" onerror="this.style.display='none'"></div></div></div></div>
      <div class="work-feat fu" data-d="1">
  <div class="wf-txt">
    <span class="idx-n">02</span>
    <div class="idx-t">Badminton Payment Splitter</div>
    <div class="idx-tags">AI-directed build + Supabase · 2026</div>
    <p class="idx-desc">Solved a recurring group-payment friction point — built a live PWA that auto-generates a VietQR code per member and tracks payment status in real time. Designed a bank-webhook auto-reconciliation flow to remove manual confirmation entirely.</p>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap">
      <a class="idx-link" href="https://badminton-app-weld.vercel.app/" target="_blank">Live ↗</a>
      <a class="idx-link" href="https://github.com/jak3rpham/badminton-app" target="_blank">Code ↗</a>
    </div>
  </div>
  <div class="wf-img">
    <div class="shot">
      <div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">badminton-app-weld.vercel.app</span></div>
      <div class="wf-shotwin"><img src="images/badminton-preview.webp" alt="Badminton Payment Splitter" loading="lazy" onerror="this.style.display='none'"></div>
    </div>
  </div>
</div>

<div class="work-feat fu" data-d="1">
  <div class="wf-txt">
    <span class="idx-n">03</span>
    <div class="idx-t">IELTS Studio</div>
    <div class="idx-tags">AI-directed build + Claude API · 2026</div>
    <p class="idx-desc">Built a full-stack IELTS practice platform with server-side AI grading for Writing tasks, multi-user auth, and a graceful-degradation design so the app runs safely with or without a configured database.</p>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap">
      <a class="idx-link" href="https://ielts-test-kohl.vercel.app/" target="_blank">Live ↗</a>
      <a class="idx-link" href="https://github.com/jak3rpham/Ielts-Test" target="_blank">Code ↗</a>
    </div>
  </div>
  <div class="wf-img">
    <div class="shot">
      <div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">ielts-test-kohl.vercel.app</span></div>
      <div class="wf-shotwin"><img src="images/ielts-preview.webp" alt="IELTS Studio" loading="lazy" onerror="this.style.display='none'"></div>
    </div>
  </div>
</div>
```

Replace with:
```html
      <div class="work-feat-hero shot fu" data-d="1">
        <div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">uphub.vn</span></div>
        <div class="wf-hero-shotwin"><img src="images/uphub.webp" alt="uphub.vn" loading="lazy" onerror="this.style.display='none'"></div>
        <div class="wf-hero-meta">
          <div class="wf-hero-left"><span class="idx-n">01</span><div class="idx-t">uphub.vn</div><div class="idx-tags">SEO Consulting · Freelance 2024 · EN / VI</div></div>
          <div class="wf-hero-right"><p class="idx-desc">Metadata audit and rebuild across 18 bilingual variants, keyword gap analysis, H1 and slug restructuring, 301 redirect mapping with zero indexed traffic loss.</p><a class="idx-link" href="https://uphub.vn" target="_blank">Visit ↗</a></div>
        </div>
      </div>
      <div class="work-compact-row fu" data-d="1">
        <div class="work-compact-card shot">
          <div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">badminton-app-weld.vercel.app</span></div>
          <div class="wf-shotwin"><img src="images/badminton-preview.webp" alt="Badminton Payment Splitter" loading="lazy" onerror="this.style.display='none'"></div>
          <span class="idx-n">02</span><div class="idx-t">Badminton Payment Splitter</div><div class="idx-tags">AI-directed build + Supabase · 2026</div>
          <p class="idx-desc">Solved a recurring group-payment friction point - built a live PWA that auto-generates a VietQR code per member and tracks payment status in real time.</p>
          <div style="display:flex;gap:.6rem;flex-wrap:wrap">
            <a class="idx-link" href="https://badminton-app-weld.vercel.app/" target="_blank">Live ↗</a>
            <a class="idx-link" href="https://github.com/jak3rpham/badminton-app" target="_blank">Code ↗</a>
          </div>
        </div>
        <div class="work-compact-card shot">
          <div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">ielts-test-kohl.vercel.app</span></div>
          <div class="wf-shotwin"><img src="images/ielts-preview.webp" alt="IELTS Studio" loading="lazy" onerror="this.style.display='none'"></div>
          <span class="idx-n">03</span><div class="idx-t">IELTS Studio</div><div class="idx-tags">AI-directed build + Claude API · 2026</div>
          <p class="idx-desc">Built a full-stack IELTS practice platform with server-side AI grading for Writing tasks, multi-user auth, and graceful degradation with or without a configured database.</p>
          <div style="display:flex;gap:.6rem;flex-wrap:wrap">
            <a class="idx-link" href="https://ielts-test-kohl.vercel.app/" target="_blank">Live ↗</a>
            <a class="idx-link" href="https://github.com/jak3rpham/Ielts-Test" target="_blank">Code ↗</a>
          </div>
        </div>
      </div>
```

Note: `work-feat-hero` and `.work-compact-card` both also carry the `.shot` class, so they automatically pick up the spotlight-border hover effect from the first pass (the `.shot` selector in the spotlight-border CSS and the `document.querySelectorAll('.shot,...')` JS both already match by class name, no further wiring needed).

- [ ] **Step 3: Verify in the browser**

Reload, then:
```js
(() => {
  document.getElementById('work').scrollIntoView();
  const hero = document.querySelector('.work-feat-hero');
  const compactCards = document.querySelectorAll('.work-compact-card');
  return {
    heroExists: !!hero,
    heroWidth: hero.getBoundingClientRect().width,
    compactCount: compactCards.length,
    oldWorkFeatCount: document.querySelectorAll('.work-feat').length
  };
})()
```
Expected: `heroExists: true`, `heroWidth` close to the section's full content width (it's the featured one), `compactCount: 2`, `oldWorkFeatCount: 0` (the old identical-split class is gone from the Work section - `.work-feat` CSS rule itself can stay since nothing references removing it, but no elements use it here anymore).

Take a `preview_screenshot` scrolled to the Work section and confirm visually: one large featured banner-style card followed by two side-by-side compact cards - visually distinct from the split-image-text pattern used elsewhere on the page (about, terra, bong vespera).

Hover-test the spotlight-border still works:
```js
(() => {
  const card = document.querySelector('.work-compact-card');
  const r = card.getBoundingClientRect();
  card.dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + 15, clientY: r.top + 10, bubbles: true }));
  return { sx: card.style.getPropertyValue('--sx'), sy: card.style.getPropertyValue('--sy') };
})()
```
Expected: `sx: "15px"`, `sy: "10px"` - spotlight tracking still applies because the markup in Step 2 gives both `.work-feat-hero` and `.work-compact-card` the combined classes (`work-feat-hero shot` and `work-compact-card shot`), so they match the existing `.shot` spotlight-border CSS and `mousemove` listener with no further wiring needed.

Check `preview_console_logs` `level:"error"` - expect none.

- [ ] **Step 4: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add index.html
git commit -m "Restructure Selected Work: one featured project, two compact cards"
```

---

## Final full-page pass

- [ ] Reload the full page at desktop width (1280x800), screenshot the Terra section mid-scroll-transition and the Work section - visually confirm both read clearly (not just check numbers).
- [ ] Resize to `mobile` preset, screenshot Terra and Work sections again - confirm the compact-card grid collapses to one column and the hero banner doesn't overflow.
- [ ] Final `preview_console_logs` with `level:"error"` - zero errors.
- [ ] Re-read this plan's four "Root cause" statements against the final rendered page and confirm each one is actually resolved, not just that the code changed.
