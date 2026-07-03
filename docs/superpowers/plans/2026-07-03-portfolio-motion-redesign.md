# Portfolio Motion Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Why executing-plans and not subagent-driven-development:** every task edits the same single file (`index.html`). There is no meaningful file-level parallelism here, and dispatching parallel subagents against one file risks overlapping edits. Run inline, sequentially, in file order.

**Goal:** Upgrade `index.html`'s motion layer and detail polish (nav, hero, cards, Terra case study, CTAs) to the Apple-physics-based system validated in the browser-mockup brainstorming session, while keeping the existing forest-dark color system, fonts, and information architecture unchanged.

**Architecture:** Single static HTML file, no build step. All CSS lives in the existing `<style>` block (lines ~11-340), all JS lives in the existing inline `<script>` block near the end of the file (lines ~591-649). Every task is a targeted edit to one or both of those blocks, plus in a few cases small markup changes in `<body>`. GSAP + ScrollTrigger are added via CDN `<script>` tags (no npm/build step, consistent with the site's current zero-dependency stack) solely for the Terra sticky-stack effect.

**Tech Stack:** Vanilla HTML/CSS/JS, GSAP 3.12 + ScrollTrigger (CDN), Python's `http.server` for local preview (already available on this machine: Python 3.14.4).

**Design doc:** `docs/superpowers/specs/2026-07-03-portfolio-redesign-design.md`

**Ordering:** Tasks must run in order 1 → 8. Several tasks anchor their edits on a comment or class inserted by the previous task (e.g. Task 6 finds the `// spotlight-border tracking...` comment that Task 5 creates; Task 7 finds the `// magnetic pull for primary CTAs` comment that Task 6 creates). Running out of order will make an `Edit` step fail to find its anchor text.

**Reconciling the design doc with the real code:** the design doc's "ambient blob" line assumed the current site's blob was a dominant animated shape. Having now read the actual CSS, `.blobimg`'s `morphimg` keyframe is defined but never applied (dead code — there's no `animation` property referencing it), and the per-section `.m-aurora`/`.m-radar`/etc. motifs are already blurred (70px) and slow (26s). So no separate "tone down the blob" task is needed — Task 8's corner-radius unification is the only polish item still required from that line.

---

## Verification approach (read before starting)

This is a static site with no test framework and no build step, so "tests" here means: load the page in a real browser via the `mcp__Claude_Preview` tools and assert on actual DOM/CSS/behavior, exactly like the brainstorming session's interactive mockups. Each task's verification step tells you:
1. The exact `mcp__Claude_Preview__preview_eval` JS expression to run (or a screenshot/console check).
2. The exact expected result.

Before Task 2's verification (and every task after), make sure a preview server is running:
- Call `mcp__Claude_Preview__preview_start` with `name: "portfolio-static"` (config already created in `.claude/launch.json`, Task 1).
- The page serves at whatever URL the tool returns (root `/` maps to `index.html`).
- If you edit a file, the browser needs a reload: use `mcp__Claude_Preview__preview_eval` with `expression: "location.reload()"` before re-checking, or just re-run `preview_eval`/`preview_screenshot` (some checks don't need reload if you re-navigate).

Always check `mcp__Claude_Preview__preview_console_logs` with `level: "error"` after each task's verification — zero errors is part of "done."

---

### Task 1: Preview server config + GSAP dependency

**Files:**
- Create: `.claude/launch.json` (already created — confirm it matches below)
- Modify: `index.html:589-591` (insert CDN scripts before the main inline `<script>`)

- [ ] **Step 1: Confirm `.claude/launch.json` exists with this content**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "portfolio-static",
      "runtimeExecutable": "python",
      "runtimeArgs": ["-m", "http.server", "8080"],
      "port": 8080
    }
  ]
}
```

If missing, create it at `D:\code\jak3rpham.github.io\.claude\launch.json` with the exact content above.

- [ ] **Step 2: Add GSAP + ScrollTrigger CDN scripts to `index.html`**

Find this exact text (currently lines 589-591):

```html
<div class="lb" id="lb"><div class="lb-inner"><button class="lb-close" id="lbClose">✕ Close</button><iframe id="lbFrame" src="" allow="autoplay; encrypted-media" allowfullscreen></iframe></div></div>

<script>
```

Replace with:

```html
<div class="lb" id="lb"><div class="lb-inner"><button class="lb-close" id="lbClose">✕ Close</button><iframe id="lbFrame" src="" allow="autoplay; encrypted-media" allowfullscreen></iframe></div></div>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script>
```

- [ ] **Step 3: Start the preview server and verify GSAP loads**

Call `mcp__Claude_Preview__preview_start` with `name: "portfolio-static"`.

Then call `mcp__Claude_Preview__preview_eval` with:
```js
({ gsap: typeof window.gsap, scrollTrigger: typeof window.ScrollTrigger })
```
Expected: `{"gsap":"function","scrollTrigger":"function"}`

Then call `mcp__Claude_Preview__preview_console_logs` with `level: "error"`. Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add .claude/launch.json index.html
git commit -m "Add preview server config and GSAP dependency for motion redesign"
```

---

### Task 2: Nav — magnetic pill nav with scroll-spy indicator

**Files:**
- Modify: `index.html` (nav markup ~line 346-349, `.nav-links` CSS ~line 39-40, mobile media query ~line 219, inline script)

- [ ] **Step 1: Replace the nav markup**

Find:
```html
<nav>
  <a href="#hero" class="nav-logo">Tatsuki&nbsp;<b>達樹</b></a>
  <ul class="nav-links"><li><a href="#about">About</a></li><li><a href="#terra">Work</a></li><li><a href="video.html">Video</a></li><li><a href="#contact">Contact</a></li><li><a href="CV.pdf">↓ CV</a></li></ul>
</nav>
```

Replace with:
```html
<nav>
  <a href="#hero" class="nav-logo">Tatsuki&nbsp;<b>達樹</b></a>
  <div class="pillbar" id="pillbar">
    <span class="pill-indicator" id="pillInd"></span>
    <a href="#about" class="pill" data-sec="about">About</a>
    <a href="#terra" class="pill" data-sec="terra">Work</a>
    <a href="video.html" class="pill">Video</a>
    <a href="#contact" class="pill" data-sec="contact">Contact</a>
    <a href="CV.pdf" class="pill pill-cv">↓ CV</a>
  </div>
</nav>
```

- [ ] **Step 2: Replace `.nav-links` CSS with `.pillbar`/`.pill` CSS**

Find:
```css
.nav-links{display:flex;gap:1.6rem;list-style:none}
.nav-links a{color:var(--sand);transition:color .3s}.nav-links a:hover{color:var(--cream)}
```

Replace with:
```css
.pillbar{position:relative;display:flex;gap:2px;padding:4px;border-radius:999px;background:var(--panel);border:1px solid var(--panel-bd);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.pill{position:relative;z-index:2;padding:.5rem 1rem;border-radius:999px;color:var(--sand);font-size:.7rem;transition:color .3s,transform .18s cubic-bezier(.23,1,.32,1);white-space:nowrap;will-change:transform}
.pill:hover{color:var(--cream)}
.pill.pill-active{color:var(--bg)}
.pill-indicator{position:absolute;z-index:1;top:4px;left:4px;height:calc(100% - 8px);width:0;border-radius:999px;background:var(--forest);transition:transform .45s cubic-bezier(.16,1,.3,1),width .45s cubic-bezier(.16,1,.3,1);opacity:0}
.pill-indicator.on{opacity:1}
```

- [ ] **Step 3: Update the mobile nav-hide rule**

Find (currently on the `@media(max-width:560px)` line, ~219):
```css
@media(max-width:560px){body{font-size:16px}.vgrid{grid-template-columns:1fr}.vcard.feat{grid-column:auto}.nav-links{display:none}}
```

Replace with:
```css
@media(max-width:560px){body{font-size:16px}.vgrid{grid-template-columns:1fr}.vcard.feat{grid-column:auto}.pillbar{display:none}}
```

- [ ] **Step 4: Add scroll-spy + magnetic JS**

Find this exact block (in the inline `<script>`, right after the "run each section's liquid only while in view" block):
```js
// run each section's liquid only while in view
const liveIO=new IntersectionObserver(es=>{es.forEach(e=>e.target.classList.toggle('live',e.isIntersecting));},{threshold:0});
document.querySelectorAll('.sec').forEach(s=>liveIO.observe(s));
```

Replace with:
```js
// run each section's liquid only while in view
const liveIO=new IntersectionObserver(es=>{es.forEach(e=>e.target.classList.toggle('live',e.isIntersecting));},{threshold:0});
document.querySelectorAll('.sec').forEach(s=>liveIO.observe(s));

// magnetic pill nav + scroll-spy indicator
const pillbar=document.getElementById('pillbar'),pillInd=document.getElementById('pillInd');
const pills=[...document.querySelectorAll('.pill[data-sec]')];
function moveIndicator(pill){
  if(!pill)return;
  const barRect=pillbar.getBoundingClientRect(),pillRect=pill.getBoundingClientRect();
  pillInd.style.width=pillRect.width+'px';
  pillInd.style.transform='translateX('+(pillRect.left-barRect.left-4)+'px)';
  pillInd.classList.add('on');
  pills.forEach(p=>p.classList.toggle('pill-active',p===pill));
}
const navSecs=['about','terra','contact'].map(id=>document.getElementById(id)).filter(Boolean);
const navIO=new IntersectionObserver(es=>{
  es.forEach(e=>{if(e.isIntersecting){const p=pills.find(p=>p.dataset.sec===e.target.id);if(p)moveIndicator(p);}});
},{rootMargin:'-40% 0px -55% 0px'});
navSecs.forEach(s=>navIO.observe(s));
if(matchMedia('(hover:hover) and (pointer:fine)').matches)pills.forEach(pill=>{
  pill.addEventListener('mousemove',e=>{
    const r=pill.getBoundingClientRect();
    const mx=(e.clientX-(r.left+r.width/2))*0.3,my=(e.clientY-(r.top+r.height/2))*0.3;
    pill.style.transform='translate('+mx+'px,'+my+'px)';
  });
  pill.addEventListener('mouseleave',()=>{pill.style.transform='translate(0,0)';});
});
```

Note: this references `matchMedia('(hover:hover)...')` directly rather than the `reduce` const, because magnetic hover-follow is a touch/mouse distinction (per taste-skill 6.B), not a motion-sensitivity one — it's gated separately from the `prefers-reduced-motion` checks used elsewhere.

- [ ] **Step 5: Verify nav in the browser**

Reload (`preview_eval` with `location.reload()`), then run:
```js
(() => {
  const about = document.getElementById('about');
  about.scrollIntoView();
  return new Promise(r => setTimeout(() => {
    const pill = document.querySelector('.pill[data-sec="about"]');
    const ind = document.getElementById('pillInd');
    r({ pillActive: pill.classList.contains('pill-active'), indicatorOn: ind.classList.contains('on'), indWidth: ind.style.width, pillWidth: pill.getBoundingClientRect().width + 'px' });
  }, 300));
})()
```
Expected: `pillActive: true`, `indicatorOn: true`, and `indWidth` roughly equal to `pillWidth` (within a few px — confirms the offset bug from the earlier prototype is fixed, since width/position now come from `getBoundingClientRect()` deltas instead of `offsetLeft` stacked on a pre-set `left`).

Also check `mcp__Claude_Preview__preview_console_logs` with `level: "error"` — expect none.

- [ ] **Step 6: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add index.html
git commit -m "Redesign nav as magnetic pill bar with scroll-spy indicator"
```

---

### Task 3: Hero — parallax depth + scramble-on-hover name

**Files:**
- Modify: `index.html` (hero markup ~line 358, inline script)

- [ ] **Step 1: Add an id to the hero name for the scramble effect**

Find:
```html
<h1 class="hname">Pham Ngoc <span class="ac">Thanh</span></h1>
```

Replace with:
```html
<h1 class="hname" id="hname">Pham Ngoc <span class="ac">Thanh</span></h1>
```

- [ ] **Step 2: Add parallax + scramble JS**

Find this exact block (immediately after the hero canvas `frame()` IntersectionObserver setup, before the "run each section's liquid" comment):
```js
const heroIO=new IntersectionObserver(es=>{es.forEach(e=>{const was=vis;vis=e.isIntersecting&&!document.hidden;if(vis&&!was&&!reduce)requestAnimationFrame(frame);});},{threshold:0});
heroIO.observe(hero);
document.addEventListener('visibilitychange',()=>{const was=vis;vis=!document.hidden;if(vis&&!was&&!reduce)requestAnimationFrame(frame);});
```

Replace with:
```js
const heroIO=new IntersectionObserver(es=>{es.forEach(e=>{const was=vis;vis=e.isIntersecting&&!document.hidden;if(vis&&!was&&!reduce)requestAnimationFrame(frame);});},{threshold:0});
heroIO.observe(hero);
document.addEventListener('visibilitychange',()=>{const was=vis;vis=!document.hidden;if(vis&&!was&&!reduce)requestAnimationFrame(frame);});

// hero parallax depth (spring-lerp toward cursor, not raw mouse-lock)
['.hero-main','.hero-portrait'].forEach(sel=>{
  const el=document.querySelector(sel);
  if(el)el.addEventListener('animationend',()=>{el.style.animation='none';},{once:true});
});
const pxTargets=[{el:document.querySelector('.hero-main'),depth:4},{el:document.querySelector('.hero-portrait'),depth:14}];
let pxTX=0,pxTY=0,pxCX=0,pxCY=0;
if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  hero.addEventListener('mousemove',e=>{
    const r=hero.getBoundingClientRect();
    pxTX=((e.clientX-r.left)/r.width-0.5);
    pxTY=((e.clientY-r.top)/r.height-0.5);
  });
  hero.addEventListener('mouseleave',()=>{pxTX=0;pxTY=0;});
  (function pxLoop(){
    pxCX+=(pxTX-pxCX)*0.08;pxCY+=(pxTY-pxCY)*0.08;
    pxTargets.forEach(({el,depth})=>{if(el)el.style.transform='translate('+(pxCX*depth)+'px,'+(pxCY*depth)+'px)';});
    requestAnimationFrame(pxLoop);
  })();
}

// text scramble on hero name hover (one signature moment, hover-triggered only, never on load)
const scrambleChars='!<>-_\\/[]{}=+*^?#';
function scrambleText(el,finalHTML,plainTarget){
  let frame=0;
  const queue=[...plainTarget].map(ch=>({to:ch,start:Math.floor(Math.random()*8),end:Math.floor(Math.random()*8)+10,char:''}));
  (function update(){
    let out='',done=0;
    queue.forEach(q=>{
      if(frame>=q.end){done++;out+=q.to;}
      else if(frame>=q.start){if(q.to===' ')q.char=' ';else if(!q.char||Math.random()<0.28)q.char=scrambleChars[Math.floor(Math.random()*scrambleChars.length)];out+=q.char;}
      else out+=' ';
    });
    el.textContent=out;
    if(done<queue.length){frame++;requestAnimationFrame(update);}else{el.innerHTML=finalHTML;}
  })();
}
const hnameEl=document.getElementById('hname');
if(hnameEl&&!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  const finalHTML=hnameEl.innerHTML,plainTarget=hnameEl.textContent;
  let scrambling=false;
  hnameEl.addEventListener('mouseenter',()=>{if(scrambling)return;scrambling=true;scrambleText(hnameEl,finalHTML,plainTarget);setTimeout(()=>{scrambling=false;},900);});
}
```

- [ ] **Step 3: Verify parallax in the browser**

Reload, then run:
```js
(() => {
  const hero = document.getElementById('hero');
  const r = hero.getBoundingClientRect();
  const ev = new MouseEvent('mousemove', { clientX: r.left + r.width * 0.9, clientY: r.top + r.height * 0.9, bubbles: true });
  hero.dispatchEvent(ev);
  return new Promise(res => setTimeout(() => {
    res({
      mainTransform: document.querySelector('.hero-main').style.transform,
      portraitTransform: document.querySelector('.hero-portrait').style.transform
    });
  }, 600));
})()
```
Expected: both are non-empty `translate(...)` strings, and the portrait's translate values are noticeably larger in magnitude than the hero-main's (portrait depth 14 vs main depth 4) — confirms layered depth, not a single flat parallax.

- [ ] **Step 4: Verify scramble in the browser**

```js
(() => {
  const el = document.getElementById('hname');
  const before = el.textContent;
  el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  return new Promise(res => setTimeout(() => {
    res({ before, mid: el.textContent });
  }, 80));
})()
```
Expected: `mid` differs from `before` (mid-scramble state). Then wait ~1s and re-check `document.getElementById('hname').textContent` — expected back to `"Pham Ngoc Thanh"` (final state restored via `innerHTML=finalHTML`).

Check `preview_console_logs` `level:"error"` — expect none.

- [ ] **Step 5: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add index.html
git commit -m "Add hero parallax depth and scramble-on-hover name effect"
```

---

### Task 4: Remove marquee, add stagger-reveal stat strip

**Files:**
- Modify: `index.html` (marquee markup ~line 376, `.marquee` CSS ~line 82-86, inline script)

- [ ] **Step 1: Remove the marquee CSS**

Find:
```css
/* marquee */
.marquee{position:relative;z-index:4;overflow:hidden;border-block:1px solid var(--rule);padding:1rem 0;white-space:nowrap;background:rgba(20,13,7,.4)}
.marquee-t{display:inline-block;animation:scroll 30s linear infinite;font-family:'DM Mono',monospace;font-size:.82rem;letter-spacing:.18em;text-transform:uppercase;color:var(--sand)}
.marquee-t span{margin:0 1.5rem}.marquee-t b{color:var(--amber);font-weight:500}
@keyframes scroll{to{transform:translateX(-50%)}}
```

Replace with:
```css
/* stat strip (replaces marquee - taste-skill rule: max one marquee per page, this one read as filler) */
.stat-strip{position:relative;z-index:4;display:flex;flex-wrap:wrap;gap:.5rem 2.2rem;justify-content:center;padding:1.3rem var(--pad);border-block:1px solid var(--rule);background:rgba(20,13,7,.4)}
.ss-item{font-family:'DM Mono',monospace;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--sand);opacity:0;transform:translateY(10px);transition:opacity .6s var(--ease),transform .6s var(--ease)}
.stat-strip.vis .ss-item{opacity:1;transform:none}
.ss-item:nth-child(1){transition-delay:0ms}.ss-item:nth-child(2){transition-delay:60ms}.ss-item:nth-child(3){transition-delay:120ms}.ss-item:nth-child(4){transition-delay:180ms}
.ss-item b{color:var(--amber);font-weight:500}
```

- [ ] **Step 2: Replace the marquee markup with the stat strip**

Find:
```html
<div class="marquee"><div class="marquee-t" id="mq"><span><b>Technical SEO</b></span><span>12× Organic Growth</span><span><b>31.4M Impressions</b></span><span>978 Keywords Top 10</span><span><b>B2B SaaS Marketing</b></span><span>Video Production</span><span><b>Top 1 TVC × 2</b></span><span>AI-Augmented Workflows</span></div></div>
```

Replace with:
```html
<div class="stat-strip" id="statStrip" data-reveal-group>
  <div class="ss-item"><b>Technical SEO</b></div>
  <div class="ss-item"><b>12× Organic Growth</b></div>
  <div class="ss-item"><b>31.4M Impressions</b></div>
  <div class="ss-item"><b>978 Keywords Top 10</b></div>
</div>
```

- [ ] **Step 3: Remove the marquee-duplication JS line**

Find:
```js
// marquee seamless
const mq=document.getElementById('mq');mq.innerHTML+=mq.innerHTML;

```

Replace with (empty — delete the block):
```js

```

- [ ] **Step 4: Extend the reveal observer to include the stat strip**

Find:
```js
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');runCount(e.target);io.unobserve(e.target);}});},{threshold:.15});
document.querySelectorAll('.fu').forEach(el=>io.observe(el));
```

Replace with:
```js
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');runCount(e.target);io.unobserve(e.target);}});},{threshold:.15});
document.querySelectorAll('.fu,[data-reveal-group]').forEach(el=>io.observe(el));
```

- [ ] **Step 5: Verify in the browser**

Reload, then:
```js
document.querySelector('.marquee') === null
```
Expected: `true` (marquee fully gone).

Then scroll and check reveal:
```js
(() => {
  document.getElementById('statStrip').scrollIntoView();
  return new Promise(r => setTimeout(() => r(document.getElementById('statStrip').classList.contains('vis')), 400));
})()
```
Expected: `true`.

Check `preview_console_logs` `level:"error"` — expect none (specifically, no "Cannot read properties of null (reading 'innerHTML')" from the old `mq` reference).

- [ ] **Step 6: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add index.html
git commit -m "Remove marquee ticker, replace with stagger-reveal stat strip"
```

---

### Task 5: Spotlight-border tracking for case-study/project cards

**Files:**
- Modify: `index.html` (CSS additions, inline script)

- [ ] **Step 1: Add spotlight-border CSS**

Find:
```css
.panel{background:var(--panel);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--panel-bd);border-radius:18px;padding:1.8rem 1.9rem;position:relative;overflow:hidden}
```

Replace with:
```css
.panel{background:var(--panel);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--panel-bd);border-radius:18px;padding:1.8rem 1.9rem;position:relative;overflow:hidden}

/* spotlight-border: hover-tracked light on case-study/project cards */
.shot,.panel.feature-screen,.mock,.stack-card{position:relative;--sx:50%;--sy:50%}
.shot::before,.panel.feature-screen::before,.mock::before,.stack-card::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;z-index:5;background:radial-gradient(240px circle at var(--sx) var(--sy),rgba(143,212,158,.85),rgba(180,205,160,.08) 60%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity .3s ease}
.shot:hover::before,.panel.feature-screen:hover::before,.mock:hover::before,.stack-card:hover::before{opacity:1}
@media(prefers-reduced-motion:reduce){.shot::before,.panel.feature-screen::before,.mock::before,.stack-card::before{display:none}}
```

- [ ] **Step 2: Add the spotlight-tracking JS**

Find:
```js
// video lightbox
```

Replace with:
```js
// spotlight-border tracking for case-study/project cards
if(!reduce)document.querySelectorAll('.shot,.panel.feature-screen,.mock,.stack-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    card.style.setProperty('--sx',(e.clientX-r.left)+'px');
    card.style.setProperty('--sy',(e.clientY-r.top)+'px');
  });
});

// video lightbox
```

- [ ] **Step 3: Verify in the browser**

Reload, then:
```js
(() => {
  const card = document.querySelector('.stack-card');
  const r = card.getBoundingClientRect();
  card.dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + 20, clientY: r.top + 15, bubbles: true }));
  return { sx: card.style.getPropertyValue('--sx'), sy: card.style.getPropertyValue('--sy') };
})()
```
Expected: `sx: "20px"`, `sy: "15px"`.

Check `preview_console_logs` `level:"error"` — expect none.

- [ ] **Step 4: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add index.html
git commit -m "Add spotlight-border hover tracking to case-study and project cards"
```

---

### Task 6: Magnetic primary CTAs

**Files:**
- Modify: `index.html` (`.float-cv` markup, contact CTA markup, CSS, inline script)

- [ ] **Step 1: Tag the two primary CTAs with `.magnetic`**

Find:
```html
<a href="mailto:pnthanh.work@gmail.com" class="btn-fill">Send an email →</a><a href="CV.pdf" class="btn-line">Download CV ↓</a>
```

Replace with:
```html
<a href="mailto:pnthanh.work@gmail.com" class="btn-fill magnetic">Send an email →</a><a href="CV.pdf" class="btn-line">Download CV ↓</a>
```

Find:
```html
<a href="CV.pdf" class="float-cv"><span>↓</span> CV</a>
```

Replace with:
```html
<a href="CV.pdf" class="float-cv magnetic"><span>↓</span> CV</a>
```

- [ ] **Step 2: Add `.magnetic` transition CSS**

Find:
```css
.float-cv:hover{background:var(--forest);transform:translateY(-2px)}
```

Replace with:
```css
.float-cv:hover{background:var(--forest);transform:translateY(-2px)}
.magnetic{transition:transform .3s cubic-bezier(.23,1,.32,1)}
```

- [ ] **Step 3: Add magnetic-pull JS**

Find:
```js
// spotlight-border tracking for case-study/project cards
```

Replace with:
```js
// magnetic pull for primary CTAs
if(matchMedia('(hover:hover) and (pointer:fine)').matches)document.querySelectorAll('.magnetic').forEach(btn=>{
  btn.addEventListener('mousemove',e=>{
    const r=btn.getBoundingClientRect();
    const mx=(e.clientX-(r.left+r.width/2))*0.3,my=(e.clientY-(r.top+r.height/2))*0.3;
    btn.style.transition='none';
    btn.style.transform='translate('+mx+'px,'+my+'px)';
  });
  btn.addEventListener('mouseleave',()=>{
    btn.style.transition='transform .3s cubic-bezier(.23,1,.32,1)';
    btn.style.transform='translate(0,0)';
  });
});

// spotlight-border tracking for case-study/project cards
```

- [ ] **Step 4: Verify in the browser**

Reload, then:
```js
(() => {
  const btn = document.querySelector('.float-cv');
  const r = btn.getBoundingClientRect();
  btn.dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + r.width * 0.8, clientY: r.top + r.height * 0.8, bubbles: true }));
  const during = btn.style.transform;
  btn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
  const after = btn.style.transform;
  return { during, after };
})()
```
Expected: `during` is a non-zero `translate(...)`, `after` is `"translate(0,0)"`.

Check `preview_console_logs` `level:"error"` — expect none.

- [ ] **Step 5: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add index.html
git commit -m "Add magnetic pull to primary CTA buttons"
```

---

### Task 7: Terra case study — GSAP sticky-stack storytelling

**Files:**
- Modify: `index.html` (Terra section markup, CSS, inline script)

- [ ] **Step 1: Restructure the Terra proof-points into a stack**

Find (the `.terra-2col` block plus the `.feat-tel` stat bar that currently opens `.terra-foot`):
```html
    <div class="terra-2col fu" data-d="1"><div class="shot shot-scroll">
      <div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn · live site</span></div>
      <div class="shot-win"><div class="shot-ph">terra-plat.vn · full page</div><span class="shot-hint">hover to scroll ↓</span><img src="images/terra-outsourcing-preview.webp" alt="terra-plat.vn" loading="lazy" onerror="this.style.display='none'"></div>
    </div>
    <div class="panel feature-screen">
      <div class="mock-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn · Google Search Console</span></div>
      <div class="screen-body">
        <svg class="gchart" viewBox="0 0 600 170" preserveAspectRatio="none">
          <defs><linearGradient id="gareaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#79B488" stop-opacity=".3"/><stop offset="1" stop-color="#79B488" stop-opacity="0"/></linearGradient></defs>
          <path class="garea" d="M0.0,138.0 L46.2,129.9 L92.3,124.4 L138.5,133.8 L184.6,137.0 L230.8,129.2 L276.9,60.8 L323.1,29.7 L369.2,103.7 L415.4,97.7 L461.5,55.1 L507.7,31.3 L553.8,88.7 L600.0,12.0 L600,170 L0,170 Z"/>
          <path class="gline" d="M0.0,138.0 L46.2,129.9 L92.3,124.4 L138.5,133.8 L184.6,137.0 L230.8,129.2 L276.9,60.8 L323.1,29.7 L369.2,103.7 L415.4,97.7 L461.5,55.1 L507.7,31.3 L553.8,88.7 L600.0,12.0"/>
          <circle class="gdot" cx="600" cy="12" r="5"/>
        </svg>
        <div class="gcap">Organic clicks/day · Feb 2025 → Mar 2026 peak · 2,137/day (12× launch)</div>
      </div>
    </div></div>
    <div class="terra-foot fu" data-d="1">
      <div class="feat-tel">
        <div class="tc"><div class="tc-n"><span data-count="12">0</span>×</div><div class="tc-l">Organic growth</div></div>
        <div class="tc"><div class="tc-n"><span data-count="978">0</span></div><div class="tc-l">Keywords top 10</div></div>
        <div class="tc"><div class="tc-n"><span data-count="31.4" data-dec="1">0</span>M</div><div class="tc-l">Impressions</div></div>
        <div class="tc"><div class="tc-n">55→90</div><div class="tc-l">Site health</div></div>
      </div>
      <div class="terra-cols">
        <ul class="bullets">
          <li><strong>Built the publishing tooling:</strong> custom WordPress plugins that turn a one-hour manual workflow into a single click, so a non-technical team ships SEO-ready content on its own.</li>
          <li><strong>Built the marketing data layer:</strong> automated pipelines feeding GSC, GA4, and PageSpeed into live dashboards and weekly reports.</li>
          <li><strong>Owned full-funnel growth:</strong> technical SEO, content architecture, and paid coordination, in EN and VI, for FDI buyers.</li>
        </ul>
        <div>
          <div class="pills"><span class="pill">B2B SaaS</span><span class="pill">FDI Targeting</span><span class="pill">EN / VI</span></div>
          <div class="ctas"><a href="terra.html" class="btn-fill">Full case study →</a><a href="https://terra-plat.vn" target="_blank" class="btn-line">Live site ↗</a></div>
        </div>
      </div>
    </div>
```

Replace with:
```html
    <div class="terra-stack fu" data-d="1" id="terraStack">
      <div class="stack-card-scroll"><div class="shot shot-scroll">
        <div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn · live site</span></div>
        <div class="shot-win"><div class="shot-ph">terra-plat.vn · full page</div><span class="shot-hint">hover to scroll ↓</span><img src="images/terra-outsourcing-preview.webp" alt="terra-plat.vn" loading="lazy" onerror="this.style.display='none'"></div>
      </div></div>
      <div class="stack-card-scroll"><div class="panel feature-screen">
        <div class="mock-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn · Google Search Console</span></div>
        <div class="screen-body">
          <svg class="gchart" viewBox="0 0 600 170" preserveAspectRatio="none">
            <defs><linearGradient id="gareaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#79B488" stop-opacity=".3"/><stop offset="1" stop-color="#79B488" stop-opacity="0"/></linearGradient></defs>
            <path class="garea" d="M0.0,138.0 L46.2,129.9 L92.3,124.4 L138.5,133.8 L184.6,137.0 L230.8,129.2 L276.9,60.8 L323.1,29.7 L369.2,103.7 L415.4,97.7 L461.5,55.1 L507.7,31.3 L553.8,88.7 L600.0,12.0 L600,170 L0,170 Z"/>
            <path class="gline" d="M0.0,138.0 L46.2,129.9 L92.3,124.4 L138.5,133.8 L184.6,137.0 L230.8,129.2 L276.9,60.8 L323.1,29.7 L369.2,103.7 L415.4,97.7 L461.5,55.1 L507.7,31.3 L553.8,88.7 L600.0,12.0"/>
            <circle class="gdot" cx="600" cy="12" r="5"/>
          </svg>
          <div class="gcap">Organic clicks/day · Feb 2025 → Mar 2026 peak · 2,137/day (12× launch)</div>
        </div>
      </div></div>
      <div class="stack-card-scroll"><div class="feat-tel">
        <div class="tc"><div class="tc-n"><span data-count="12">0</span>×</div><div class="tc-l">Organic growth</div></div>
        <div class="tc"><div class="tc-n"><span data-count="978">0</span></div><div class="tc-l">Keywords top 10</div></div>
        <div class="tc"><div class="tc-n"><span data-count="31.4" data-dec="1">0</span>M</div><div class="tc-l">Impressions</div></div>
        <div class="tc"><div class="tc-n">55→90</div><div class="tc-l">Site health</div></div>
      </div></div>
    </div>
    <div class="terra-cols fu" data-d="1">
      <ul class="bullets">
        <li><strong>Built the publishing tooling:</strong> custom WordPress plugins that turn a one-hour manual workflow into a single click, so a non-technical team ships SEO-ready content on its own.</li>
        <li><strong>Built the marketing data layer:</strong> automated pipelines feeding GSC, GA4, and PageSpeed into live dashboards and weekly reports.</li>
        <li><strong>Owned full-funnel growth:</strong> technical SEO, content architecture, and paid coordination, in EN and VI, for FDI buyers.</li>
      </ul>
      <div>
        <div class="pills"><span class="pill">B2B SaaS</span><span class="pill">FDI Targeting</span><span class="pill">EN / VI</span></div>
        <div class="ctas"><a href="terra.html" class="btn-fill">Full case study →</a><a href="https://terra-plat.vn" target="_blank" class="btn-line">Live site ↗</a></div>
      </div>
    </div>
```

- [ ] **Step 2: Add stack-layout CSS**

Find:
```css
.terra-cols{display:grid;grid-template-columns:1.4fr 1fr;gap:clamp(1.5rem,4vw,3rem);align-items:start}
```

Replace with:
```css
.terra-cols{display:grid;grid-template-columns:1.4fr 1fr;gap:clamp(1.5rem,4vw,3rem);align-items:start;margin-top:2rem}
.terra-stack{position:relative}
.stack-card-scroll{min-height:56vh;display:flex;align-items:center;justify-content:center;padding:1.4rem 0}
@media(max-width:900px){.stack-card-scroll{min-height:auto}}
```

- [ ] **Step 3: Add the GSAP sticky-stack JS**

Find:
```js
// magnetic pull for primary CTAs
```

Replace with:
```js
// terra case-study sticky-stack storytelling (GSAP ScrollTrigger)
if(window.gsap&&window.ScrollTrigger&&!reduce&&window.innerWidth>=768){
  gsap.registerPlugin(ScrollTrigger);
  const stackCards=gsap.utils.toArray('#terraStack .stack-card-scroll');
  stackCards.forEach((card,i)=>{
    if(i===stackCards.length-1)return;
    ScrollTrigger.create({trigger:card,start:'top top',endTrigger:stackCards[stackCards.length-1],end:'top top',pin:true,pinSpacing:false});
    gsap.to(card,{scale:0.92,opacity:0.55,ease:'none',scrollTrigger:{trigger:stackCards[i+1],start:'top bottom',end:'top top',scrub:true}});
  });
}

// magnetic pull for primary CTAs
```

- [ ] **Step 4: Verify in the browser (desktop width)**

Call `mcp__Claude_Preview__preview_resize` with `preset: "desktop"`, reload, then:
```js
(() => {
  const stack = document.getElementById('terraStack');
  stack.scrollIntoView();
  return new Promise(r => setTimeout(() => {
    const cards = [...document.querySelectorAll('#terraStack .stack-card-scroll')];
    r(cards.map(c => c.getBoundingClientRect().top));
  }, 300));
})()
```
Note the first card's `top`. Then scroll down further:
```js
(() => { window.scrollBy(0, 400); return new Promise(r => setTimeout(() => r(document.querySelector('#terraStack .stack-card-scroll').getBoundingClientRect().top), 300)); })()
```
Expected: the first card's `top` stays pinned near `0` across the extra scroll (within a couple px) while `document.documentElement.scrollTop` (or `window.scrollY`) has increased — confirms the pin is active, not just a normal scroll-past.

- [ ] **Step 5: Verify mobile fallback (no pin, normal stack)**

Call `mcp__Claude_Preview__preview_resize` with `preset: "mobile"`, reload, then:
```js
(() => {
  const stack = document.getElementById('terraStack');
  const before = window.scrollY;
  stack.scrollIntoView();
  return new Promise(r => setTimeout(() => r({ pinned: window.ScrollTrigger ? ScrollTrigger.getAll().length : 0 }), 300));
})()
```
Expected: on a viewport under 768px, no `ScrollTrigger` pin instances got created for the stack (the `window.innerWidth>=768` guard in Step 3 prevents it), so the three cards just render as a normal vertical stack with no pinning.

Check `preview_console_logs` `level:"error"` — expect none. Resize back to `desktop` before continuing.

- [ ] **Step 6: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add index.html
git commit -m "Add GSAP sticky-stack storytelling to Terra case study section"
```

---

### Task 8: Cross-cutting polish — corner-radius consistency, grain opacity

**Files:**
- Modify: `index.html` (CSS only)

- [ ] **Step 1: Unify card corner-radius to 14px**

Find:
```css
.blobimg{position:absolute;inset:0;overflow:hidden;border-radius:16px;border:1px solid var(--panel-bd);box-shadow:0 22px 60px rgba(0,0,0,.4),0 0 55px rgba(120,200,140,.16)}
```

Replace with:
```css
.blobimg{position:absolute;inset:0;overflow:hidden;border-radius:14px;border:1px solid var(--panel-bd);box-shadow:0 22px 60px rgba(0,0,0,.4),0 0 55px rgba(120,200,140,.16)}
```

Find:
```css
.panel{background:var(--panel);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--panel-bd);border-radius:18px;padding:1.8rem 1.9rem;position:relative;overflow:hidden}
```

Replace with:
```css
.panel{background:var(--panel);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--panel-bd);border-radius:14px;padding:1.8rem 1.9rem;position:relative;overflow:hidden}
```

- [ ] **Step 2: Reduce grain opacity so it reads as ambient texture, not a visible effect**

Find:
```css
.grain{position:fixed;inset:0;z-index:60;pointer-events:none;opacity:.045;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:160px}
```

Replace with:
```css
.grain{position:fixed;inset:0;z-index:60;pointer-events:none;opacity:.022;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:160px}
```

- [ ] **Step 3: Verify in the browser**

Reload, then:
```js
(() => {
  const cs = s => getComputedStyle(document.querySelector(s));
  return {
    blobimgRadius: cs('.blobimg').borderRadius,
    panelRadius: cs('.panel').borderRadius,
    grainOpacity: cs('.grain').opacity
  };
})()
```
Expected: `blobimgRadius` and `panelRadius` both `"14px"`, `grainOpacity` `"0.022"`.

Take a `mcp__Claude_Preview__preview_screenshot` and visually confirm the grain is barely perceptible and the hero/portrait/panel corners read as one consistent radius.

Check `preview_console_logs` `level:"error"` — expect none.

- [ ] **Step 4: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add index.html
git commit -m "Unify card corner-radius and tone down grain overlay opacity"
```

---

## Final full-page pass (after Task 8)

- [ ] Reload the full page at desktop width, scroll top to bottom once with `preview_screenshot` at hero, about, terra, bong, work, video, contact.
- [ ] Resize to `mobile` preset, repeat the scroll-through, confirm no horizontal overflow and the Terra stack degrades to plain stacked cards.
- [ ] Call `preview_eval` with `matchMedia('(prefers-reduced-motion: reduce)').matches` forced (or use OS-level emulation if the tool supports it) and re-check that parallax/scramble/magnetic/sticky-stack all no-op gracefully — at minimum, re-confirm each effect's `!reduce` / `window.innerWidth>=768` guards are present in the shipped code (grep the file for `if(!reduce` and `if(window.gsap`).
- [ ] Final `preview_console_logs` with `level:"error"` across the whole session — zero errors.
