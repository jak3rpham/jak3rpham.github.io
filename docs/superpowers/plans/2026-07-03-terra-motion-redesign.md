# Terra.html Heavier-Motion Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (single file, sequential edits). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `terra.html` up to the same nav/hero/spotlight/magnetic motion baseline already validated on `index.html`, then add two new heavier, page-specific effects: a horizontal scroll-hijack through the "Systems I built" section's 4 process diagrams, and a drag/coverflow gallery for the "Recent page launches" screenshots.

**Architecture:** `terra.html` is a standalone HTML file sharing `index.html`'s color-token/component CSS but with its own accent hue and no shared build. Every task is a targeted CSS/markup/JS edit to this one file. GSAP + ScrollTrigger are added via the same CDN URLs already used on `index.html`.

**Tech Stack:** Vanilla HTML/CSS/JS, GSAP 3.12 + ScrollTrigger (CDN), pointer events for drag (no library).

**Spec:** `docs/superpowers/specs/2026-07-03-portfolio-redesign-design.md`, "Addendum (2026-07-03, v3): terra.html - heavier motion pass"

**Preview setup:** Reuse the existing `C:\Users\jaker\.claude\launch.json` config `portfolio-static` (serves `D:\code\jak3rpham.github.io` on port 8080 via `python -m http.server --directory`). `terra.html` is already reachable at `http://localhost:8080/terra.html` once that server is running - no new launch config needed.

**Ordering:** Run tasks 1 → 8 in order. Tasks 2-5 port already-validated `index.html` patterns (low risk). Tasks 6-7 are the new, heavier effects and carry the most risk - do them last, after the simpler ports are done and committed.

---

## Verification approach

No test framework (static site). Verify with `mcp__Claude_Preview` tools: start the server, reload after each edit, use `preview_eval` for DOM/CSS assertions, **take an actual `preview_screenshot` at every visual checkpoint and look at it** (the layout-fixes-v2 lesson: numbers matching expectations is necessary but not sufficient). Check `preview_console_logs` with `level:"error"` after every task.

---

### Task 1: GSAP CDN dependency

**Files:**
- Modify: `terra.html` (insert CDN scripts before the closing inline `<script>` tag)

- [ ] **Step 1: Add GSAP + ScrollTrigger CDN scripts**

Find (the line immediately before the inline `<script>` block, i.e. the closing `</footer>` and the script tag that follows):
```html
</footer>
<script>
```

Replace with:
```html
</footer>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script>
```

- [ ] **Step 2: Verify in the browser**

Call `mcp__Claude_Preview__preview_start` with `name: "portfolio-static"` if not already running. Navigate/reload to `http://localhost:8080/terra.html` (use `preview_eval` with `expression: "location.href='http://localhost:8080/terra.html'"` if the server's current tab is on a different page), then:
```js
({ gsap: typeof window.gsap, scrollTrigger: typeof window.ScrollTrigger })
```
Expected: `gsap` is `"object"`, `scrollTrigger` is `"function"` (matches what `index.html`'s GSAP load reported).

Check `preview_console_logs` `level:"error"` - expect none.

- [ ] **Step 3: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add terra.html
git commit -m "Add GSAP dependency to terra.html for the motion redesign pass"
```

---

### Task 2: Nav - magnetic pill bar (3 static links, no scroll-spy)

**Files:**
- Modify: `terra.html` (nav markup, `.nav-links` CSS, inline script)

`terra.html`'s nav has only 3 links, all page navigation (Home, external live site, CV download) - no in-page anchors, so this port skips the scroll-spy indicator from `index.html` and keeps just the magnetic-hover pill bar.

- [ ] **Step 1: Replace the nav markup**

Find:
```html
  <ul class="nav-links"><li><a href="index.html">Home</a></li><li><a href="https://terra-plat.vn" target="_blank">Live site ↗</a></li><li><a href="CV.pdf">↓ CV</a></li></ul>
```

Replace with:
```html
  <div class="pillbar" id="pillbar">
    <a href="index.html" class="pill">Home</a>
    <a href="https://terra-plat.vn" target="_blank" class="pill">Live site ↗</a>
    <a href="CV.pdf" class="pill pill-cv">↓ CV</a>
  </div>
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
.pill{position:relative;padding:.5rem 1rem;border-radius:999px;color:var(--sand);font-size:.7rem;transition:color .3s,transform .18s cubic-bezier(.23,1,.32,1);white-space:nowrap;will-change:transform}
.pill:hover{color:var(--cream)}
```

- [ ] **Step 3: Add magnetic-hover JS for the pills**

Find:
```js
const liveIO=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('live',e.isIntersecting)),{threshold:0});
document.querySelectorAll('.sec').forEach(s=>liveIO.observe(s));
```

Replace with:
```js
const liveIO=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('live',e.isIntersecting)),{threshold:0});
document.querySelectorAll('.sec').forEach(s=>liveIO.observe(s));

// magnetic pill nav
if(matchMedia('(hover:hover) and (pointer:fine)').matches)document.querySelectorAll('.pill').forEach(pill=>{
  pill.addEventListener('mousemove',e=>{
    const r=pill.getBoundingClientRect();
    const mx=(e.clientX-(r.left+r.width/2))*0.3,my=(e.clientY-(r.top+r.height/2))*0.3;
    pill.style.transform='translate('+mx+'px,'+my+'px)';
  });
  pill.addEventListener('mouseleave',()=>{pill.style.transform='translate(0,0)';});
});
```

- [ ] **Step 4: Verify in the browser**

Reload, then:
```js
(() => {
  const pill = document.querySelector('.pill');
  const r = pill.getBoundingClientRect();
  pill.dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + r.width * 0.8, clientY: r.top + r.height * 0.8, bubbles: true }));
  const during = pill.style.transform;
  pill.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
  const after = pill.style.transform;
  return { during, after };
})()
```
Expected: `during` is a non-zero `translate(...)`, `after` is `"translate(0,0)"`.

Take a `preview_screenshot` of the nav area and confirm it visually matches `index.html`'s pill-nav look (just with 3 pills instead of 5).

Check `preview_console_logs` `level:"error"` - expect none.

- [ ] **Step 5: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add terra.html
git commit -m "Port magnetic pill nav to terra.html"
```

---

### Task 3: Hero - parallax depth + scramble-on-hover name

**Files:**
- Modify: `terra.html` (hero markup `id` attribute, inline script)

`terra.html`'s hero uses `.hero-main` (name/tagline/telemetry) and `.shot.hero-shot` (a browser-frame screenshot) instead of `index.html`'s portrait photo - same two-layer depth treatment applies, just swapping the second layer's selector.

- [ ] **Step 1: Add an id to the hero name for the scramble effect**

Find:
```html
    <h1 class="hname">terra<span class="ac">-plat.vn</span></h1>
```

Replace with:
```html
    <h1 class="hname" id="hname">terra<span class="ac">-plat.vn</span></h1>
```

- [ ] **Step 2: Add parallax + scramble JS**

Find (immediately after the hero canvas's IntersectionObserver/visibilitychange setup, before the "run each section's liquid" line):
```js
new IntersectionObserver(es=>es.forEach(e=>{const w=vis;vis=e.isIntersecting&&!document.hidden;if(vis&&!w&&!reduce)requestAnimationFrame(frame);}),{threshold:0}).observe(hero);
document.addEventListener('visibilitychange',()=>{const w=vis;vis=!document.hidden;if(vis&&!w&&!reduce)requestAnimationFrame(frame);});
```

Replace with:
```js
new IntersectionObserver(es=>es.forEach(e=>{const w=vis;vis=e.isIntersecting&&!document.hidden;if(vis&&!w&&!reduce)requestAnimationFrame(frame);}),{threshold:0}).observe(hero);
document.addEventListener('visibilitychange',()=>{const w=vis;vis=!document.hidden;if(vis&&!w&&!reduce)requestAnimationFrame(frame);});

// hero parallax depth (spring-lerp toward cursor, not raw mouse-lock)
['.hero-main','.hero-shot'].forEach(sel=>{
  const el=document.querySelector(sel);
  if(el)el.addEventListener('animationend',()=>{el.style.opacity='1';el.style.animation='none';el.style.transform='none';},{once:true});
});
const pxTargets=[{el:document.querySelector('.hero-main'),depth:4},{el:document.querySelector('.hero-shot'),depth:12}];
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

Reload, then:
```js
(() => {
  const hero = document.getElementById('hero');
  const r = hero.getBoundingClientRect();
  const ev = new MouseEvent('mousemove', { clientX: r.left + r.width * 0.9, clientY: r.top + r.height * 0.9, bubbles: true });
  hero.dispatchEvent(ev);
  return new Promise(res => setTimeout(() => {
    res({
      mainTransform: document.querySelector('.hero-main').style.transform,
      shotTransform: document.querySelector('.hero-shot').style.transform
    });
  }, 600));
})()
```
Expected: both are non-empty `translate(...)` strings, `hero-shot`'s magnitude larger than `hero-main`'s (depth 12 vs 4).

- [ ] **Step 4: Verify scramble in the browser**

```js
(() => {
  const el = document.getElementById('hname');
  const before = el.textContent;
  el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  return new Promise(res => setTimeout(() => res({ before, mid: el.textContent }), 80));
})()
```
Expected: `mid` differs from `before`. Then wait ~1s and re-check `document.getElementById('hname').textContent` - expected back to `"terra-plat.vn"`.

Take a `preview_screenshot` of the hero and visually confirm it reads correctly (name + tagline + telemetry + hero-shot frame all visible, matching `index.html`'s hero-fixed-opacity-bug check from the first pass - this file has the same `animationend` pattern, so the same bug class is possible here; the fix in Step 2 already sets `opacity:'1'` before clearing `animation`, so this should not regress, but confirm visually anyway).

Check `preview_console_logs` `level:"error"` - expect none.

- [ ] **Step 5: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add terra.html
git commit -m "Add hero parallax depth and scramble-on-hover name to terra.html"
```

---

### Task 4: Spotlight-border on panel/shot cards

**Files:**
- Modify: `terra.html` (CSS, inline script)

- [ ] **Step 1: Add spotlight-border CSS**

Find:
```css
.panel{background:var(--panel);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--panel-bd);border-radius:18px;padding:1.8rem 1.9rem;position:relative;overflow:hidden}
```

Replace with:
```css
.panel{background:var(--panel);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--panel-bd);border-radius:18px;padding:1.8rem 1.9rem;position:relative;overflow:hidden}

/* spotlight-border: hover-tracked light on case-study/project cards (ported from index.html) */
.panel,.shot{position:relative;--sx:50%;--sy:50%}
.panel::before,.shot::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;z-index:5;background:radial-gradient(240px circle at var(--sx) var(--sy),rgba(237,160,85,.85),rgba(205,178,140,.08) 60%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity .3s ease}
.panel:hover::before,.shot:hover::before{opacity:1}
@media(prefers-reduced-motion:reduce){.panel::before,.shot::before{display:none}}
```

Note the spotlight color uses terra.html's own accent (`rgba(237,160,85,...)`, its amber) rather than index.html's forest green, matching this page's per-page accent identity.

- [ ] **Step 2: Add the spotlight-tracking JS**

Find:
```js
if(matchMedia('(hover: none)').matches){
  const sio=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('scrolling',e.isIntersecting)),{threshold:.35});
  document.querySelectorAll('.shot-scroll').forEach(s=>sio.observe(s));
}
```

Replace with:
```js
if(matchMedia('(hover: none)').matches){
  const sio=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('scrolling',e.isIntersecting)),{threshold:.35});
  document.querySelectorAll('.shot-scroll').forEach(s=>sio.observe(s));
}

// spotlight-border tracking for panel/shot cards
if(!reduce)document.querySelectorAll('.panel,.shot').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    card.style.setProperty('--sx',(e.clientX-r.left)+'px');
    card.style.setProperty('--sy',(e.clientY-r.top)+'px');
  });
});
```

- [ ] **Step 3: Verify in the browser**

Reload, then:
```js
(() => {
  const card = document.querySelector('.panel');
  const r = card.getBoundingClientRect();
  card.dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + 20, clientY: r.top + 15, bubbles: true }));
  return { sx: card.style.getPropertyValue('--sx'), sy: card.style.getPropertyValue('--sy') };
})()
```
Expected: `sx: "20px"`, `sy: "15px"`.

Check `preview_console_logs` `level:"error"` - expect none.

- [ ] **Step 4: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add terra.html
git commit -m "Add spotlight-border hover tracking to terra.html panel/shot cards"
```

---

### Task 5: Magnetic CTA on the closing "Visit terra-plat.vn" button

**Files:**
- Modify: `terra.html` (CTA markup, CSS, inline script)

- [ ] **Step 1: Tag the primary closing CTA with `.magnetic`**

Find:
```html
    <div class="ctas fu" style="margin-top:2rem"><a href="https://terra-plat.vn" target="_blank" class="btn-fill">Visit terra-plat.vn ↗</a><a href="index.html" class="btn-line">← Back to all work</a></div>
```

Replace with:
```html
    <div class="ctas fu" style="margin-top:2rem"><a href="https://terra-plat.vn" target="_blank" class="btn-fill magnetic">Visit terra-plat.vn ↗</a><a href="index.html" class="btn-line">← Back to all work</a></div>
```

- [ ] **Step 2: Add `.magnetic` transition CSS**

Find:
```css
.foundation{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem}
```

Replace with:
```css
.foundation{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem}
.magnetic{transition:transform .3s cubic-bezier(.23,1,.32,1)}
```

- [ ] **Step 3: Add magnetic-pull JS**

Find:
```js
// spotlight-border tracking for panel/shot cards
```

Replace with:
```js
// magnetic pull for primary CTA
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

// spotlight-border tracking for panel/shot cards
```

- [ ] **Step 4: Verify in the browser**

Reload, then:
```js
(() => {
  const btn = document.querySelector('.magnetic');
  const r = btn.getBoundingClientRect();
  btn.dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + r.width * 0.8, clientY: r.top + r.height * 0.8, bubbles: true }));
  const during = btn.style.transform;
  btn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
  const after = btn.style.transform;
  return { during, after };
})()
```
Expected: `during` non-zero `translate(...)`, `after` is `"translate(0,0)"`.

Check `preview_console_logs` `level:"error"` - expect none.

- [ ] **Step 5: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add terra.html
git commit -m "Add magnetic pull to terra.html closing CTA"
```

---

### Task 6: Systems I built - horizontal scroll-hijack

**Files:**
- Modify: `terra.html` (Systems section markup: wrap the 4 `.sysrow` blocks; CSS; inline script)

**Current markup shape** (paraphrased - the real file has this on very long single lines): inside `<section id="systems">` there's a `.sec-inner` containing `sec-head`, a `slead` paragraph, then 4 sibling divs in this exact sequence: `<div class="sysrow fu" data-d="1">...</div>`, `<div class="sysrow rev fu" data-d="1">...</div>`, `<div class="sysrow fu" data-d="1">...</div>`, `<div class="sysrow rev fu" data-d="1">...</div>` (each containing a `.systxt` + `.sysfig` pair), followed by `.stack-h` and `.foundation` pills.

- [ ] **Step 1: Wrap the 4 `.sysrow` blocks in a horizontal-pan track, and drop the `rev` alternation**

Find the exact opening tag of the first sysrow block:
```html
    <div class="sysrow fu" data-d="1"><div class="systxt"><div class="sys-n">// WordPress plugin</div>
```

Replace with:
```html
    <div class="sys-pan-wrap" id="sysPanWrap"><div class="sys-pan-track" id="sysPanTrack">
    <div class="sysrow sys-panel fu" data-d="1"><div class="systxt"><div class="sys-n">// WordPress plugin</div>
```

Find each of the three remaining sysrow opening tags and remove the `rev` class (the `rev` alternation doesn't apply to a horizontal filmstrip - all four should read as parallel slides, not a zigzag). Find:
```html
</div></div><div class="sysrow rev fu" data-d="1"><div class="systxt"><div class="sys-n">// WPCode + AI</div>
```

Replace with:
```html
</div></div><div class="sysrow sys-panel fu" data-d="1"><div class="systxt"><div class="sys-n">// WPCode + AI</div>
```

Find:
```html
</div></div><div class="sysrow fu" data-d="1"><div class="systxt"><div class="sys-n">// Data layer</div>
```

Replace with:
```html
</div></div><div class="sysrow sys-panel fu" data-d="1"><div class="systxt"><div class="sys-n">// Data layer</div>
```

Find:
```html
</div></div><div class="sysrow rev fu" data-d="1"><div class="systxt"><div class="sys-n">// Lead gen</div>
```

Replace with:
```html
</div></div><div class="sysrow sys-panel fu" data-d="1"><div class="systxt"><div class="sys-n">// Lead gen</div>
```

- [ ] **Step 2: Close the new wrapper divs after the fourth sysrow, before `.stack-h`**

Find:
```html
    <div class="stack-h fu" style="margin-top:1.6rem">// Plus the foundation</div>
```

Replace with:
```html
    </div></div>
    <div class="stack-h fu" style="margin-top:1.6rem">// Plus the foundation</div>
```

- [ ] **Step 3: Add CSS for the pan wrap/track/panel and rewire the diagram-animation gate from section-wide `.live` to per-panel `.panel-active`**

Find:
```css
.sysrow{display:grid;grid-template-columns:1.05fr 1fr;gap:2.2rem;align-items:center;padding:2.2rem 0;border-top:1px solid var(--rule)}
.sysrow:first-of-type{border-top:none;padding-top:.6rem}
.sysrow.rev .systxt{order:2}.sysrow.rev .sysfig{order:1}
```

Replace with:
```css
.sysrow{display:grid;grid-template-columns:1.05fr 1fr;gap:2.2rem;align-items:center;padding:2.2rem 0;border-top:1px solid var(--rule)}
.sysrow:first-of-type{border-top:none;padding-top:.6rem}
.sysrow.rev .systxt{order:2}.sysrow.rev .sysfig{order:1}
.sys-pan-wrap{position:relative;overflow:hidden}
.sys-pan-track{display:flex;align-items:center;gap:3rem;height:78vh}
.sysrow.sys-panel{flex:0 0 min(78vw,860px);border-top:none;padding:1.5rem 0}
@media(max-width:820px){.sys-pan-wrap{overflow:visible;height:auto}.sys-pan-track{display:block;height:auto;gap:0}.sysrow.sys-panel{width:100%;flex:none;border-top:1px solid var(--rule)}.sysrow.sys-panel:first-child{border-top:none}}
```

Find:
```css
.sec.live .fig-flow,.sec.live .fig-halo,.sec.live .fig-bar{animation-play-state:running}
```

Replace with:
```css
.sys-panel.panel-active .fig-flow,.sys-panel.panel-active .fig-halo,.sys-panel.panel-active .fig-bar{animation-play-state:running}
```

- [ ] **Step 4: Add the horizontal-pan GSAP JS (desktop) with an IntersectionObserver fallback (mobile/no-GSAP/reduced-motion)**

Find:
```js
// magnetic pull for primary CTA
```

Replace with:
```js
// systems horizontal scroll-hijack (desktop) / per-panel visibility fallback (mobile, reduced-motion, no GSAP)
(function(){
  const panels=[...document.querySelectorAll('.sys-panel')];
  if(!panels.length)return;
  if(window.gsap&&window.ScrollTrigger&&!reduce&&window.innerWidth>=820){
    gsap.registerPlugin(ScrollTrigger);
    const wrap=document.getElementById('sysPanWrap'),track=document.getElementById('sysPanTrack');
    function updateActivePanel(){
      const centerX=window.innerWidth/2;
      let closest=null,closestDist=Infinity;
      panels.forEach(p=>{
        const r=p.getBoundingClientRect();
        const d=Math.abs((r.left+r.width/2)-centerX);
        if(d<closestDist){closestDist=d;closest=p;}
      });
      panels.forEach(p=>p.classList.toggle('panel-active',p===closest));
    }
    const distance=track.scrollWidth-window.innerWidth;
    gsap.to(track,{x:-distance,ease:'none',scrollTrigger:{trigger:wrap,start:'top top',end:'+='+distance,pin:true,scrub:1,invalidateOnRefresh:true,onUpdate:updateActivePanel}});
    updateActivePanel();
  }else{
    const panIO=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('panel-active',e.isIntersecting)),{threshold:.4});
    panels.forEach(p=>panIO.observe(p));
  }
})();

// magnetic pull for primary CTA
```

- [ ] **Step 5: Verify desktop behavior in the browser**

Call `mcp__Claude_Preview__preview_resize` with `width:1280,height:800`, reload, then:
```js
(() => {
  document.getElementById('sysPanWrap').scrollIntoView();
  return new Promise(r => setTimeout(() => r({ pinCount: window.ScrollTrigger ? ScrollTrigger.getAll().length : -1 }), 300));
})()
```
Expected: `pinCount` is `1` or more (the pin ScrollTrigger instance exists).

Then confirm the pan actually moves and the active panel switches:
```js
(() => {
  const track = document.getElementById('sysPanTrack');
  const before = getComputedStyle(track).transform;
  window.scrollBy(0, 600);
  return new Promise(r => setTimeout(() => {
    const after = getComputedStyle(track).transform;
    const active = document.querySelector('.sys-panel.panel-active .sys-t')?.textContent;
    r({ before, after, activePanelTitle: active });
  }, 300));
})()
```
Expected: `before !== after` (track actually translated), `activePanelTitle` is a non-empty string naming one of the 4 systems ("Page Publisher", "HR Column Publisher", "Marketing data hub", or "Whitepaper + CRM hub").

Take a `preview_screenshot` mid-pan and visually confirm: one system's text+diagram fills the viewport, the diagram's dash/halo/bar animations are visibly running (not frozen), and the layout doesn't look broken (no overlapping/clipped text).

- [ ] **Step 6: Verify mobile fallback**

Call `mcp__Claude_Preview__preview_resize` with `preset: "mobile"`, reload (fresh load at mobile width, not just a resize-after-load, so the `window.innerWidth>=820` gate is evaluated correctly), then:
```js
(() => {
  document.getElementById('sysPanWrap').scrollIntoView();
  return { pinCount: window.ScrollTrigger ? ScrollTrigger.getAll().length : -1, innerWidth: window.innerWidth };
})()
```
Expected: `pinCount: 0` (no pin created on mobile - the 4 systems just stack normally), `innerWidth: 375`.

Take a `preview_screenshot` and confirm the 4 systems stack vertically, readable, no horizontal overflow. Resize back to `width:1280,height:800` before continuing.

Check `preview_console_logs` `level:"error"` - expect none.

- [ ] **Step 7: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add terra.html
git commit -m "Add horizontal scroll-hijack through Systems I built, replacing the 4x repeated zigzag"
```

---

### Task 7: Recent page launches - drag/coverflow gallery

**Files:**
- Modify: `terra.html` (page-launches section markup: wrap the 4 `.shot.shot-scroll` cards; CSS; inline script)

**Current markup shape:** `.shots-grid` directly contains 4 sibling `<div class="shot shot-scroll">...</div>` cards.

- [ ] **Step 1: Wrap the 4 cards in a drag track, rename the container**

Find:
```html
    <div class="shots-grid fu" data-d="1">
      <div class="shot shot-scroll"><div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn/en/hr-outsourcing-services-in-vietnam</span></div><div class="shot-win"><div class="shot-ph">full-page screenshot</div><span class="shot-hint">hover to scroll ↓</span><img src="images/terra-outsourcing-preview.webp" alt="HR Outsourcing Services" loading="lazy" onerror="this.style.display='none'"></div><div class="shot-cap"><div><div class="st">HR Outsourcing Services</div><div class="sk">Service page · EN</div></div><a class="shot-link" href="https://terra-plat.vn/en/hr-outsourcing-services-in-vietnam" target="_blank">Live ↗</a></div></div>
      <div class="shot shot-scroll"><div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn/en/hr-compliance-consulting-vietnam</span></div><div class="shot-win"><div class="shot-ph">full-page screenshot</div><span class="shot-hint">hover to scroll ↓</span><img src="images/terra-compliance-preview.webp" alt="HR Compliance Consulting" loading="lazy" onerror="this.style.display='none'"></div><div class="shot-cap"><div><div class="st">HR Compliance Consulting</div><div class="sk">Service page · EN</div></div><a class="shot-link" href="https://terra-plat.vn/en/hr-compliance-consulting-vietnam" target="_blank">Live ↗</a></div></div>
      <div class="shot shot-scroll"><div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn/en/terra-hr-system</span></div><div class="shot-win"><div class="shot-ph">full-page screenshot</div><span class="shot-hint">hover to scroll ↓</span><img src="images/terra-hrsystem-preview.webp" alt="terra HR System" loading="lazy" onerror="this.style.display='none'"></div><div class="shot-cap"><div><div class="st">terra HR System</div><div class="sk">Product page · EN</div></div><a class="shot-link" href="https://terra-plat.vn/en/terra-hr-system" target="_blank">Live ↗</a></div></div>
      <div class="shot shot-scroll"><div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn/vi/cau-chuyen-khach-hang</span></div><div class="shot-win"><div class="shot-ph">full-page screenshot</div><span class="shot-hint">hover to scroll ↓</span><img src="images/terra-customers-preview.webp" alt="Câu chuyện khách hàng" loading="lazy" onerror="this.style.display='none'"></div><div class="shot-cap"><div><div class="st">Câu chuyện khách hàng</div><div class="sk">Case study hub · VI</div></div><a class="shot-link" href="https://terra-plat.vn/vi/cau-chuyen-khach-hang" target="_blank">Live ↗</a></div></div>
    </div>
```

Replace with:
```html
    <div class="cf-wrap fu" data-d="1" id="cfWrap"><div class="cf-track" id="cfTrack">
      <div class="cf-card"><div class="shot shot-scroll"><div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn/en/hr-outsourcing-services-in-vietnam</span></div><div class="shot-win"><div class="shot-ph">full-page screenshot</div><span class="shot-hint">hover to scroll ↓</span><img src="images/terra-outsourcing-preview.webp" alt="HR Outsourcing Services" loading="lazy" onerror="this.style.display='none'"></div><div class="shot-cap"><div><div class="st">HR Outsourcing Services</div><div class="sk">Service page · EN</div></div><a class="shot-link" href="https://terra-plat.vn/en/hr-outsourcing-services-in-vietnam" target="_blank">Live ↗</a></div></div></div>
      <div class="cf-card"><div class="shot shot-scroll"><div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn/en/hr-compliance-consulting-vietnam</span></div><div class="shot-win"><div class="shot-ph">full-page screenshot</div><span class="shot-hint">hover to scroll ↓</span><img src="images/terra-compliance-preview.webp" alt="HR Compliance Consulting" loading="lazy" onerror="this.style.display='none'"></div><div class="shot-cap"><div><div class="st">HR Compliance Consulting</div><div class="sk">Service page · EN</div></div><a class="shot-link" href="https://terra-plat.vn/en/hr-compliance-consulting-vietnam" target="_blank">Live ↗</a></div></div></div>
      <div class="cf-card"><div class="shot shot-scroll"><div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn/en/terra-hr-system</span></div><div class="shot-win"><div class="shot-ph">full-page screenshot</div><span class="shot-hint">hover to scroll ↓</span><img src="images/terra-hrsystem-preview.webp" alt="terra HR System" loading="lazy" onerror="this.style.display='none'"></div><div class="shot-cap"><div><div class="st">terra HR System</div><div class="sk">Product page · EN</div></div><a class="shot-link" href="https://terra-plat.vn/en/terra-hr-system" target="_blank">Live ↗</a></div></div></div>
      <div class="cf-card"><div class="shot shot-scroll"><div class="shot-bar"><span class="mock-d"></span><span class="mock-d"></span><span class="mock-d"></span><span class="mock-url">terra-plat.vn/vi/cau-chuyen-khach-hang</span></div><div class="shot-win"><div class="shot-ph">full-page screenshot</div><span class="shot-hint">hover to scroll ↓</span><img src="images/terra-customers-preview.webp" alt="Câu chuyện khách hàng" loading="lazy" onerror="this.style.display='none'"></div><div class="shot-cap"><div><div class="st">Câu chuyện khách hàng</div><div class="sk">Case study hub · VI</div></div><a class="shot-link" href="https://terra-plat.vn/vi/cau-chuyen-khach-hang" target="_blank">Live ↗</a></div></div></div>
    </div></div>
```

- [ ] **Step 2: Add coverflow CSS, and the mobile fallback (plain stacked list, matching the old `.shots-grid` single-column behavior)**

Find:
```css
.shots-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.4rem}
```

Replace with:
```css
.shots-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.4rem}
.cf-wrap{position:relative;overflow:hidden;padding:1.5rem 0;perspective:1400px;cursor:grab}
.cf-wrap.dragging{cursor:grabbing}
.cf-track{display:flex;gap:2rem;will-change:transform;transform-style:preserve-3d;touch-action:pan-y}
.cf-card{flex:0 0 min(70vw,520px);transition:transform .4s var(--ease),opacity .4s var(--ease)}
.cf-card:not(.cf-active){pointer-events:none}
@media(max-width:820px){.cf-wrap{overflow:visible;cursor:auto;perspective:none}.cf-track{display:block;gap:0}.cf-card{width:100%;flex:none;transform:none!important;opacity:1!important;margin-bottom:1.4rem;pointer-events:auto!important}}
```

- [ ] **Step 3: Add the drag/coverflow JS (desktop) - gated so it only initializes above the 820px tablet breakpoint**

Find:
```js
// systems horizontal scroll-hijack (desktop) / per-panel visibility fallback (mobile, reduced-motion, no GSAP)
```

Replace with:
```js
// recent page launches: drag/coverflow gallery (desktop/tablet only, >=820px)
(function(){
  const wrap=document.getElementById('cfWrap'),track=document.getElementById('cfTrack');
  if(!wrap||!track||window.innerWidth<820)return;
  const cards=[...track.querySelectorAll('.cf-card')];
  let current=0,tx=0,targetTx=0,dragging=false,startX=0,startTx=0;
  function cardOffset(i){const c=cards[i];return c.offsetLeft+c.offsetWidth/2-wrap.clientWidth/2;}
  function render(){
    cards.forEach((c,i)=>{
      const delta=i-current;
      c.classList.toggle('cf-active',delta===0);
      c.style.transform='scale('+(delta===0?1:0.86)+') rotateY('+(delta*-18)+'deg)';
      c.style.opacity=delta===0?'1':'0.55';
    });
  }
  function goTo(i){current=Math.max(0,Math.min(cards.length-1,i));targetTx=-cardOffset(current);render();}
  (function loop(){tx+=(targetTx-tx)*0.15;track.style.transform='translateX('+tx+'px)';requestAnimationFrame(loop);})();
  wrap.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;startTx=tx;wrap.classList.add('dragging');wrap.setPointerCapture(e.pointerId);});
  wrap.addEventListener('pointermove',e=>{if(!dragging)return;tx=startTx+(e.clientX-startX);targetTx=tx;});
  wrap.addEventListener('pointerup',e=>{
    if(!dragging)return;dragging=false;wrap.classList.remove('dragging');
    const moved=e.clientX-startX;
    if(Math.abs(moved)>40)goTo(current+(moved<0?1:-1));else goTo(current);
  });
  wrap.addEventListener('wheel',e=>{
    if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){e.preventDefault();if(e.deltaX>10)goTo(current+1);else if(e.deltaX<-10)goTo(current-1);}
  },{passive:false});
  goTo(0);
  addEventListener('resize',()=>{if(window.innerWidth>=820)goTo(current);});
})();

// systems horizontal scroll-hijack (desktop) / per-panel visibility fallback (mobile, reduced-motion, no GSAP)
```

- [ ] **Step 4: Verify desktop drag/coverflow in the browser**

Reload at `width:1280,height:800`, then:
```js
(() => {
  document.getElementById('cfWrap').scrollIntoView();
  return new Promise(r => setTimeout(() => {
    const active = document.querySelector('.cf-card.cf-active');
    r({ activeIndex: [...document.querySelectorAll('.cf-card')].indexOf(active) });
  }, 300));
})()
```
Expected: `activeIndex: 0` (first card starts active/centered).

Simulate a drag to the next card:
```js
(() => {
  const wrap = document.getElementById('cfWrap');
  const r = wrap.getBoundingClientRect();
  const down = new PointerEvent('pointerdown', { clientX: r.left + r.width * 0.7, bubbles: true, pointerId: 1 });
  const move = new PointerEvent('pointermove', { clientX: r.left + r.width * 0.7 - 200, bubbles: true, pointerId: 1 });
  const up = new PointerEvent('pointerup', { clientX: r.left + r.width * 0.7 - 200, bubbles: true, pointerId: 1 });
  wrap.dispatchEvent(down); wrap.dispatchEvent(move); wrap.dispatchEvent(up);
  return new Promise(res => setTimeout(() => {
    const active = document.querySelector('.cf-card.cf-active');
    res({ activeIndex: [...document.querySelectorAll('.cf-card')].indexOf(active) });
  }, 600));
})()
```
Expected: `activeIndex: 1` (dragged left by more than the 40px threshold, advanced to the next card).

Take a `preview_screenshot` and visually confirm: the active/center card is upright and largest, the side cards are visibly smaller/rotated/dimmer, and it reads as a coverflow gallery, not a broken grid.

- [ ] **Step 5: Verify mobile fallback**

Resize (fresh load) to `mobile` preset, reload, then:
```js
(() => {
  document.getElementById('cfWrap').scrollIntoView();
  const cards = [...document.querySelectorAll('.cf-card')];
  return { count: cards.length, widths: cards.map(c => Math.round(c.getBoundingClientRect().width)), bodyScrollWidth: document.body.scrollWidth };
})()
```
Expected: all 4 `widths` roughly equal to the viewport width (375, stacked full-width), `bodyScrollWidth: 375` (no horizontal overflow from the un-rotated fallback).

Take a `preview_screenshot` and confirm the 4 cards stack vertically and read normally. Resize back to `width:1280,height:800` before continuing.

Check `preview_console_logs` `level:"error"` - expect none.

- [ ] **Step 6: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add terra.html
git commit -m "Add drag/coverflow gallery for Recent page launches, replacing the static 2x2 grid"
```

---

### Task 8: The numbers - KPI stagger reveal, and final full-page pass

**Files:**
- Modify: `terra.html` (KPI CSS)

- [ ] **Step 1: Move the `.fu` reveal from the grid wrapper onto each `.kpi` cell, and add cascading delays**

Confirmed via `grep`: `.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2.2rem}` (3 columns, 6 cells wrap into 2 rows), and the markup is `<div class="kpi-grid fu">` wrapping 6 plain `<div class="kpi">` cells - so today the whole grid fades in as one block. Move `.fu` onto each cell instead so they cascade individually.

Find:
```css
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2.2rem}
```

Replace with:
```css
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2.2rem}
.kpi-grid .kpi:nth-child(1){transition-delay:0ms}
.kpi-grid .kpi:nth-child(2){transition-delay:60ms}
.kpi-grid .kpi:nth-child(3){transition-delay:120ms}
.kpi-grid .kpi:nth-child(4){transition-delay:180ms}
.kpi-grid .kpi:nth-child(5){transition-delay:240ms}
.kpi-grid .kpi:nth-child(6){transition-delay:300ms}
```

Find:
```html
    <div class="kpi-grid fu">
      <div class="kpi"><div class="kpi-n">175 → 2,137</div><div class="kpi-l">Daily clicks</div><div class="kpi-sub">launch to peak</div></div>
      <div class="kpi"><div class="kpi-n"><span data-count="12.2" data-dec="1">0</span>×</div><div class="kpi-l">Growth multiplier</div><div class="kpi-sub">predominantly organic</div></div>
      <div class="kpi"><div class="kpi-n"><span data-count="449965">0</span></div><div class="kpi-l">Total clicks</div><div class="kpi-sub">17 months</div></div>
      <div class="kpi"><div class="kpi-n"><span data-count="31.4" data-dec="1">0</span>M</div><div class="kpi-l">Impressions</div><div class="kpi-sub">Google Search</div></div>
      <div class="kpi"><div class="kpi-n"><span data-count="978">0</span></div><div class="kpi-l">Keywords Top 10</div><div class="kpi-sub">Google ranking</div></div>
      <div class="kpi"><div class="kpi-n">55 → 90</div><div class="kpi-l">Site health</div><div class="kpi-sub">Semrush</div></div>
    </div>
```

Replace with:
```html
    <div class="kpi-grid">
      <div class="kpi fu"><div class="kpi-n">175 → 2,137</div><div class="kpi-l">Daily clicks</div><div class="kpi-sub">launch to peak</div></div>
      <div class="kpi fu"><div class="kpi-n"><span data-count="12.2" data-dec="1">0</span>×</div><div class="kpi-l">Growth multiplier</div><div class="kpi-sub">predominantly organic</div></div>
      <div class="kpi fu"><div class="kpi-n"><span data-count="449965">0</span></div><div class="kpi-l">Total clicks</div><div class="kpi-sub">17 months</div></div>
      <div class="kpi fu"><div class="kpi-n"><span data-count="31.4" data-dec="1">0</span>M</div><div class="kpi-l">Impressions</div><div class="kpi-sub">Google Search</div></div>
      <div class="kpi fu"><div class="kpi-n"><span data-count="978">0</span></div><div class="kpi-l">Keywords Top 10</div><div class="kpi-sub">Google ranking</div></div>
      <div class="kpi fu"><div class="kpi-n">55 → 90</div><div class="kpi-l">Site health</div><div class="kpi-sub">Semrush</div></div>
    </div>
```

This works with zero JS changes: the existing observer (`document.querySelectorAll('.fu').forEach(el=>io.observe(el))`) now finds 6 individual `.kpi.fu` elements instead of 1 wrapper, and the count-up numbers (`runCount`, keyed off `[data-count]` inside whichever element gets `.vis`) still fire correctly since `runCount` queries `s.querySelectorAll('[data-count]')` on the intersecting element.

- [ ] **Step 2: Verify in the browser**

Reload, then:
```js
(() => {
  document.getElementById('results').scrollIntoView();
  return new Promise(r => setTimeout(() => {
    const kpis = [...document.querySelectorAll('.kpi')];
    r(kpis.map(k => getComputedStyle(k).opacity));
  }, 500));
})()
```
Expected: all `"1"` after settling (they should all have revealed by 500ms given the small stagger delays), but take a `preview_screenshot` during the scroll-in (e.g. right as the section enters view, before the 500ms wait) to visually confirm they cascade rather than all snapping in simultaneously.

Check `preview_console_logs` `level:"error"` - expect none.

- [ ] **Step 3: Commit**

```bash
cd "D:\code\jak3rpham.github.io"
git add terra.html
git commit -m "Add stagger reveal to terra.html KPI grid"
```

- [ ] **Step 4: Final full-page pass**

Reload at desktop width, screenshot hero, Context & role, Systems (mid-pan), Recent page launches (coverflow), The numbers, footer. Resize to mobile, repeat. Confirm across both: no console errors, no horizontal overflow, all 8 tasks' effects visually present and legible (not just numerically correct - this is the standing lesson from the `index.html` v2 round).
