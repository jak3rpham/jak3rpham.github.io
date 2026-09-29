"use strict";
// Every frame is a pure function of t (seconds). The renderer calls seek(t) and screenshots,
// so nothing here may depend on wall-clock time or on a previous frame.

const W = 1920, H = 1080, FPS = 60, DUR = 20;
const P = p => "../public/" + p;

// ---------------------------------------------------------------- palette (from the site)
const C = {
  ink: "#0b0d0b", cream: "#f1f3ea", lime: "#c0e686", limeSoft: "#bfd89e",
  sage: "#eef0e6", tink: "#14170f", forest: "#1e6e42", forestDeep: "#123f27", stamp: "#c9f49b", mutedSage: "#c6d0b7",
  peachA: "#ffe3c9", peachB: "#ebae90", brownInk: "#352c24", terracotta: "#b7472c", coral: "#ff5f3d",
  black: "#0d0d0d", bone: "#f3f2ee", silver: "#b8babd", pink: "#e2405f",
  ieltsBg: "#f3ebdd", amber: "#b35f1a", uphub: "#ec6a22", uphubInk: "#10331d", court: "#1d6b4c", mint: "#c9f0d8",
  night: "#050505", gold: "#e9a54b",
  jade: "#0e2a27", mist: "#a9d6c8", jadeLight: "#9fd3c2", bcream: "#efe6c8", leaf: "#d2381f",
};

// ---------------------------------------------------------------- math
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, d) => clamp((t - a) / d);
const E = {
  lin: x => x,
  outCubic: x => 1 - (1 - x) ** 3, inCubic: x => x ** 3,
  inOutCubic: x => x < .5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2,
  outQuart: x => 1 - (1 - x) ** 4, inQuart: x => x ** 4,
  inOutQuart: x => x < .5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2,
  outExpo: x => x >= 1 ? 1 : 1 - 2 ** (-10 * x), inExpo: x => x <= 0 ? 0 : 2 ** (10 * x - 10),
  inOutExpo: x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? 2 ** (20 * x - 10) / 2 : (2 - 2 ** (-20 * x + 10)) / 2,
  inBack: x => 2.70158 * x ** 3 - 1.70158 * x ** 2,
};
/** Damped spring from 0 to 1, t seconds after release. f = frequency (Hz), z = damping ratio. */
function spring(t, f = 2, z = .45) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e = E.inOutCubic] = keys[i], [t0, v0] = keys[i - 1];
    if (t <= t1) return lerp(v0, v1, e((t - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
}
function hash(n) {
  n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4);
  n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return n >>> 0;
}
function rng(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let q = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q;
    return ((q ^ (q >>> 14)) >>> 0) / 4294967296;
  };
}
const bezier = (a, b, c, k) => lerp(lerp(a, b, k), lerp(b, c, k), k);

// ---------------------------------------------------------------- DOM
function h(tag, cls, parent, css, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (css) Object.assign(e.style, css);
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
function box(parent, x, y, w, hh, css) {
  return h("div", "abs", parent, Object.assign({ left: x + "px", top: y + "px", width: w + "px", height: hh + "px" }, css));
}
function tf(e, o = {}) {
  const { x = 0, y = 0, s = 1, sx = s, sy = s, r = 0, rx = 0, ry = 0, p = 0 } = o;
  e.style.transform = `${p ? `perspective(${p}px) ` : ""}translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotateX(${rx}deg) rotateY(${ry.toFixed(2)}deg) rotate(${r.toFixed(3)}deg) scale(${sx.toFixed(4)},${sy.toFixed(4)})`;
  if (o.o !== undefined) e.style.opacity = clamp(o.o);
  if (o.blur !== undefined) e.style.filter = o.blur > .15 ? `blur(${o.blur.toFixed(2)}px)` : "none";
}
const vis = (e, on) => { e.style.visibility = on ? "visible" : "hidden"; };

/** Text split into masked pieces (words, or characters when byChar) that can rise into place. */
function line(parent, text, css, byChar = false) {
  const el = h("div", "disp abs", parent, css);
  const parts = [];
  const tokens = byChar ? [...text] : text.split(" ");
  tokens.forEach((w, i) => {
    if (w === " ") { el.appendChild(document.createTextNode(" ")); return; }
    const m = h("span", "mask", el);
    parts.push(h("span", "", m, null, w));
    if (!byChar && i < tokens.length - 1) el.appendChild(document.createTextNode(" "));
  });
  return { el, parts };
}
function rise(parts, t, start, stag = .06, dur = .55, tilt = 8, ease = E.outExpo) {
  parts.forEach((p, i) => {
    const k = ease(prog(t, start + i * stag, dur));
    p.style.transform = `translateY(${((1 - k) * 115).toFixed(2)}%) rotate(${((1 - k) * tilt).toFixed(2)}deg)`;
  });
}
function sink(parts, t, start, stag = .025, dur = .3) {
  parts.forEach((p, i) => {
    const k = E.inCubic(prog(t, start + i * stag, dur));
    if (k > 0) p.style.transform = `translateY(${(-k * 115).toFixed(2)}%)`;
  });
}
const GLY = "ABCDEFGHKMNPRSTUVXZ0123456789/#+";
function scramble(el, text, t, start, dur = .45) {
  if (t < start) { el.textContent = ""; return; }
  const n = text.length, done = Math.floor(prog(t, start, dur) * n), fr = Math.floor(t * 30);
  let s = "";
  for (let i = 0; i < n; i++) {
    const c = text[i];
    if (i < done || c === " ") s += c;
    else if (i < done + 7) s += GLY[hash(i * 131 + fr * 17) % GLY.length];
  }
  el.textContent = s;
}

// ---------------------------------------------------------------- media
const IMG = {}, loads = [];
let COLLECT = false;
const need = new Set();
function img(src) {
  if (!IMG[src]) {
    const i = new Image();
    i.src = src;
    IMG[src] = i;
    loads.push(i.decode().catch(() => console.warn("missing " + src)));
  }
  return IMG[src];
}
function pic(parent, src, css) { img(src); const e = h("img", "abs", parent, css); e.src = src; return e; }
/** A numbered frame sequence; only frames a dry run actually touches get loaded. */
function seq(pattern, count, fps) {
  return {
    at(sec) {
      const i = clamp(Math.floor(sec * fps), 0, count - 1);
      const src = pattern.replace("%", String(i + 1).padStart(4, "0"));
      if (COLLECT) { need.add(src); return null; }
      return IMG[src] || null;
    },
  };
}
function canvas(parent, w, hh, css) {
  const c = h("canvas", "abs", parent, css);
  c.width = w; c.height = hh; c.style.width = w + "px"; c.style.height = hh + "px";
  return c.getContext("2d");
}
function cover(ctx, im, o = {}) {
  if (!im || !im.naturalWidth) return;
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  const [sx, sy, sw, sh] = o.crop || [0, 0, im.naturalWidth, im.naturalHeight];
  const sc = Math.max(cw / sw, ch / sh) * (o.s || 1);
  const dw = sw * sc, dh = sh * sc;
  ctx.drawImage(im, sx, sy, sw, sh, (cw - dw) / 2 + (o.x || 0), (ch - dh) * (o.ay ?? .5) + (o.y || 0), dw, dh);
}
const HEART = "M50 88C22 66 2 50 2 28 2 13 13 3 27 3c10 0 18 5 23 13C55 8 63 3 73 3c14 0 25 10 25 25 0 22-20 38-48 60z";
function heart(parent, size, color) {
  const e = h("div", "abs", parent, { width: size + "px", height: size * .92 + "px" });
  e.innerHTML = `<svg viewBox="0 0 100 92" width="100%" height="100%"><path d="${HEART}" fill="${color}"/></svg>`;
  return e;
}

// ---------------------------------------------------------------- stage
const stage = document.getElementById("stage");
const world = box(stage, 0, 0, W, H, { overflow: "hidden" });
const scenes = [];
function scene(start, end, z, build) {
  const root = h("div", "scene", world, { zIndex: z });
  const s = { start, end, root };
  s.draw = build(root);
  scenes.push(s);
}

// ================================================================ 0 · HERO  (0 – 2.0)
scene(0, 2.0, 50, root => {
  const frame = box(root, 0, 0, W, H, { background: C.ink, overflow: "hidden", transformOrigin: "50% 30%" });
  const ctx = canvas(frame, W, H);
  const builder = seq("cache/builder/%.jpg", 144, 24);
  box(frame, 0, 0, W, H, { background: "linear-gradient(90deg,#0b0d0bf5 0%,#0b0d0bb8 40%,transparent 72%),linear-gradient(0deg,#0b0d0bd9,transparent 45%)" });
  const glow = box(frame, 510, 90, 900, 900, { borderRadius: "50%", background: "radial-gradient(circle,#c0e68638,transparent 62%)" });
  const rings = [0, 1, 2].map(() => box(frame, 0, 0, 10, 10, { border: `2px solid ${C.lime}`, borderRadius: "50%" }));
  const bar = box(frame, 0, 539, W, 2, { background: C.lime });
  const dot = box(frame, 938, 518, 44, 44, { background: C.lime, borderRadius: "50%" });
  const name = h("div", "disp abs", frame, { left: "140px", top: "112px", fontSize: "40px", color: C.cream, letterSpacing: "-.04em" });
  const city = h("div", "mono abs", frame, { left: "142px", top: "170px", color: C.limeSoft });
  const l1 = line(frame, "Ideas into", { left: "128px", top: "360px", fontSize: "225px", color: C.cream });
  const l2 = line(frame, "actual things", { left: "128px", top: "590px", fontSize: "225px", color: C.lime });
  const period = h("span", "", l2.el, { display: "inline-block", width: ".15em", height: ".15em", borderRadius: "50%", background: C.lime, marginLeft: ".05em" });

  return t => {
    ctx.clearRect(0, 0, W, H);
    const ck = E.outCubic(prog(t, .8, .8));
    if (t > .8) {
      ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1);
      cover(ctx, builder.at(t - .8 + .8), { s: lerp(1.2, 1.05, ck), x: -230 });
      ctx.restore();
    }
    ctx.canvas.style.opacity = ck;

    const pop = t < .5 ? spring(t - .02, 2.6, .38) : 1 - E.inBack(prog(t, .5, .16));
    tf(dot, { s: Math.max(0, pop), o: t < .66 ? 1 : 0 });
    rings.forEach((r, i) => {
      const q = prog(t, .04 + i * .1, .75), d = lerp(10, 1000, E.outExpo(q));
      Object.assign(r.style, { left: 960 - d / 2 + "px", top: 540 - d / 2 + "px", width: d + "px", height: d + "px", opacity: q > 0 ? (1 - q) * .85 : 0 });
    });
    const bk = t < .5 ? E.outExpo(prog(t, .1, .4)) : 1 - E.inExpo(prog(t, .5, .18));
    tf(bar, { sx: bk, o: bk > .001 ? 1 : 0 });
    glow.style.opacity = t < .5 ? E.outCubic(prog(t, 0, .3)) : 1 - prog(t, .5, .35);

    rise(l1.parts, t, .5, .25, .6);
    rise(l2.parts, t, 1.0, .25, .6);
    tf(period, { s: Math.max(0, spring(t - 1.5, 2.8, .35)) });
    scramble(name, "Pham Ngoc Thanh / Tatsuki", t, .9, .5);
    scramble(city, "Ho Chi Minh City", t, 1.0, .4);

    // The site's own hero move (scale + radius), then a whip up into chapter one.
    const p = E.inOutCubic(prog(t, 1.55, .3)), w = E.inQuart(prog(t, 1.8, .2));
    tf(frame, { s: 1 - .09 * p, y: -1260 * w });
    frame.style.borderRadius = 40 * p + "px";
    frame.style.filter = w > .05 && w < 1 ? `blur(${(Math.sin(w * Math.PI) * 10).toFixed(1)}px)` : "none";
  };
});

// ================================================================ 1 · TERRA  (2.0 – 5.5)
scene(1.5, 5.62, 40, root => {
  root.style.background = C.sage;
  const base = box(root, 0, 0, W, H);
  const dots = box(base, -80, -80, W + 160, H + 160, { backgroundImage: "radial-gradient(#1e6e4226 2px,transparent 2.6px)", backgroundSize: "40px 40px" });
  const eyeL = h("div", "mono abs", base, { left: "140px", top: "118px", color: C.forest });
  const eyeR = h("div", "mono abs", base, { left: "auto", right: "140px", top: "118px", color: C.forest });
  const h1 = line(base, "One brand.", { left: "128px", top: "178px", fontSize: "132px", color: C.tink });
  const h2 = line(base, "Many moving parts.", { left: "128px", top: "310px", fontSize: "132px", color: C.forest });

  const br = box(base, 850, 490, 930, 540, { borderRadius: "12px", overflow: "hidden", background: "#fff", boxShadow: "0 40px 90px #29322550", transformOrigin: "50% 100%" });
  box(br, 0, 0, 930, 46, { background: "#fcfcf6", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", fontFamily: "DM Mono", fontSize: "16px", color: "#66735c" })
    .innerHTML = '<span style="letter-spacing:5px;color:#c3c9b8">●●●</span><span>terra-plat.vn</span><span>↗</span>';
  const view = box(br, 0, 46, 930, 494, { overflow: "hidden" });
  const longshot = pic(view, P("images/terra-outsourcing-preview.webp"), { width: "930px" });

  const soc = box(base, 150, 572, 620, 368, { background: "#f5f4ea", padding: "10px", borderRadius: "6px", boxShadow: "0 30px 70px #17210f45" });
  pic(soc, P("images/terra-social/02-law-update-econtract-vi.webp"), { position: "static", width: "600px", height: "338px", objectFit: "cover", display: "block" });

  const stamp = box(base, 1600, 360, 250, 250, { borderRadius: "50%", background: C.stamp, color: "#1a3022", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 40px #1a302230" });
  const stN = h("div", "disp", stamp, { fontSize: "104px", letterSpacing: "-.07em", lineHeight: ".9" });
  h("div", "mono", stamp, { fontSize: "15px", letterSpacing: ".08em", marginTop: "6px" }, "organic growth");

  // proof panel
  const panel = box(root, 0, 0, W, H, { background: C.forestDeep, color: C.cream });
  const pEye = h("div", "mono abs", panel, { left: "140px", top: "118px", color: C.stamp });
  const big = h("div", "disp abs", panel, { left: "128px", top: "232px", fontSize: "210px", letterSpacing: "-.035em" });
  const bigL = h("div", "abs", panel, { left: "140px", top: "470px", fontSize: "32px", color: C.mutedSage, letterSpacing: "-.02em" }, "search impressions");
  const kw = h("div", "disp abs", panel, { left: "128px", top: "590px", fontSize: "150px", letterSpacing: "-.035em" });
  const kwL = h("div", "abs", panel, { left: "140px", top: "760px", fontSize: "32px", color: C.mutedSage, letterSpacing: "-.02em" }, "keywords in the top 10");
  const cx0 = 800, cy0 = 250, cw = 980, chh = 520;
  const top = box(panel, cx0, 196, cw, 30, { display: "flex", justifyContent: "space-between", fontSize: "22px", color: C.cream });
  top.innerHTML = "<span>Organic search trajectory</span><span style='color:#c9f49b'>22 months ↗</span>";
  const chart = "M0,162.2 L37.5,155.7 L75,148.4 L112.5,136.3 L150,131.7 L187.5,140.4 L225,144.5 L262.5,135.5 L300,63.5 L337.5,35 L375,108.7 L412.5,104.5 L450,57.5 L487.5,32.3 L525,100.1 L562.5,12 L600,128.2";
  // The site's 600x180 chart, rescaled into pixels so dash length and head position agree.
  const px = chart.replace(/([\d.]+),([\d.]+)/g, (_, x, y) => `${(x * cw / 600).toFixed(1)},${(y * chh / 180).toFixed(1)}`);
  const svg = h("div", "abs", panel, { left: cx0 + "px", top: cy0 + "px", width: cw + "px", height: chh + "px" });
  svg.innerHTML = `<svg width="${cw}" height="${chh}" style="overflow:visible">
    <defs><linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9f49b" stop-opacity=".45"/><stop offset="1" stop-color="#c9f49b" stop-opacity="0"/></linearGradient>
    <clipPath id="gc"><rect id="gcr" x="-10" y="-40" width="0" height="${chh + 80}"/></clipPath></defs>
    ${[0, .25, .5, .75, 1].map(f => `<line x1="0" x2="${cw}" y1="${f * chh}" y2="${f * chh}" stroke="#f1f3ea" stroke-opacity=".12"/>`).join("")}
    <path d="${px} L${cw},${chh} L0,${chh} Z" fill="url(#gf)" clip-path="url(#gc)"/>
    <path id="gl" d="${px}" fill="none" stroke="#c9f49b" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  const gl = svg.querySelector("#gl"), gcr = svg.querySelector("#gcr");
  const halo = box(panel, 0, 0, 90, 90, { borderRadius: "50%", background: "radial-gradient(circle,#c9f49b66,transparent 65%)" });
  const head = box(panel, 0, 0, 26, 26, { borderRadius: "50%", background: C.stamp });
  const health = h("div", "abs", panel, { left: cx0 + "px", top: "800px", fontSize: "32px", color: C.cream, letterSpacing: "-.02em" });
  const src = h("div", "mono abs", panel, { left: cx0 + "px", top: "852px", fontSize: "16px", color: "#8fb59a" }, "Monthly organic clicks · Search Console · Dec 2024 – Apr 2026");
  let len = 0;

  return t => {
    tf(dots, { x: -((t * 30) % 40), y: -((t * 18) % 40) });
    scramble(eyeL, "01 / The work behind the growth", t, 2.0, .45);
    scramble(eyeR, "terra · 2024 — 2026", t, 2.05, .4);
    rise(h1.parts, t, 2.0, .07, .6);
    rise(h2.parts, t, 2.14, .07, .6);

    const bk = spring(t - 2.12, 1.5, .55);
    tf(br, { y: (1 - bk) * 780, r: lerp(-16, -3, bk), o: t > 2.1 ? 1 : 0 });
    longshot.style.transform = `translateY(${(-1900 * E.inOutCubic(prog(t, 2.5, 3))).toFixed(1)}px)`;
    const sk = spring(t - 2.5, 1.7, .5);
    tf(soc, { x: (1 - sk) * -950, r: lerp(-25, -5, sk), o: t > 2.48 ? 1 : 0 });
    const stk = spring(t - 3.0, 2.2, .4);
    tf(stamp, { s: Math.max(0, stk), r: 12 + (t - 3) * 25 });
    stN.textContent = Math.round(lerp(1, 12, E.outCubic(prog(t, 3.0, .45)))) + "×";

    const pk = E.inOutQuart(prog(t, 3.4, .3));
    panel.style.clipPath = `inset(${((1 - pk) * 100).toFixed(2)}% 0 0 0)`;
    vis(panel, pk > 0);
    tf(base, { y: -140 * pk });
    if (pk <= 0) return;
    scramble(pEye, "From launch to momentum", t, 3.6, .4);
    big.textContent = (lerp(0, 31.4, E.outCubic(prog(t, 3.6, .75)))).toFixed(1) + "M";
    kw.textContent = Math.round(lerp(0, 978, E.outCubic(prog(t, 3.75, .7))));
    tf(bigL, { y: 20 * (1 - E.outExpo(prog(t, 3.65, .5))), o: prog(t, 3.65, .2) });
    tf(kwL, { y: 20 * (1 - E.outExpo(prog(t, 3.8, .5))), o: prog(t, 3.8, .2) });
    tf(top, { o: prog(t, 3.6, .25) });
    const dk = E.inOutCubic(prog(t, 3.62, 1.05));
    if (!len) { len = gl.getTotalLength(); gl.setAttribute("stroke-dasharray", `${len} ${len + 10}`); }
    gl.setAttribute("stroke-dashoffset", (len * (1 - dk)).toFixed(2));
    const pt = gl.getPointAtLength(len * dk);
    gcr.setAttribute("width", (pt.x + 10).toFixed(2));
    const hx = cx0 + pt.x, hy = cy0 + pt.y;
    // At the end the head turns peach and swells: it is the next chapter's iris.
    const grow = E.inCubic(prog(t, 5.02, .25));
    const hs = (dk > 0 ? 1 : 0) * (1 + .25 * Math.sin(t * 12) * (1 - grow) + grow * 2.2);
    tf(head, { x: hx - 13, y: hy - 13, s: hs });
    head.style.background = grow > 0 ? C.peachB : C.stamp;
    tf(halo, { x: hx - 45, y: hy - 45, s: hs, o: dk > 0 ? 1 : 0 });
    health.innerHTML = `Site health <b style="font-weight:500;color:#c9f49b">${Math.round(lerp(55, 90, E.outCubic(prog(t, 4.3, .45))))}</b> <span style="opacity:.6">/ from 55</span>`;
    tf(health, { o: prog(t, 4.25, .2) });
    tf(src, { o: prog(t, 4.4, .3) * .9 });
  };
});

// ================================================================ 2 · NHÀ MÌNH  (5.5 – 8.0)
scene(5.22, 8.0, 45, root => {
  root.style.background = `radial-gradient(ellipse at 62% 30%,${C.peachA},${C.peachB} 82%)`;
  const inner = box(root, 0, 0, W, H, { transformOrigin: "1134px 538px" });
  const eye = h("div", "mono abs", inner, { left: "140px", top: "118px", color: C.terracotta });
  const hA = line(inner, "A little closer.", { left: "128px", top: "178px", fontSize: "124px", color: C.brownInk });
  const hB = line(inner, "Even from afar.", { left: "128px", top: "306px", fontSize: "124px", color: C.terracotta });

  const dash = box(inner, 880, 440, 956, 545, { borderRadius: "18px", border: "8px solid #fff9f2", overflow: "hidden", background: "#fff", boxShadow: "0 40px 80px #753d2540", transformOrigin: "0% 50%" });
  const dctx = canvas(dash, 940, 529);
  const sync = seq("cache/nhasync/%.jpg", 120, 30);

  const phone = box(inner, 300, 520, 238, 490, { borderRadius: "40px", background: "#fff", padding: "10px", boxShadow: "0 30px 60px #753d2545" });
  pic(phone, P("images/nha-minh/07-app-bame-hom-nay.png"), { position: "static", width: "218px", display: "block", borderRadius: "30px" });
  const touch = box(inner, 0, 0, 58, 58, { borderRadius: "50%", background: "#ffffffb0", border: "2px solid #fff", boxShadow: "0 6px 16px #753d2540" });
  const ripple = box(inner, 0, 0, 10, 10, { borderRadius: "50%", border: `3px solid ${C.coral}` });
  const burst = Array.from({ length: 8 }, () => heart(inner, 30, C.coral));
  const trail = Array.from({ length: 9 }, () => box(inner, 0, 0, 14, 14, { borderRadius: "50%", background: C.coral }));
  const toast = box(inner, 1090, 492, 420, 92, { borderRadius: "60px", background: "#fff", boxShadow: "0 24px 50px #753d2540", display: "flex", alignItems: "center", paddingLeft: "92px", fontFamily: "'Be Vietnam Pro'", fontWeight: 600, fontSize: "36px", color: C.brownInk, transformOrigin: "46px 46px" });
  toast.textContent = "Báo con: ổn";
  const pulse = box(inner, 0, 0, 10, 10, { borderRadius: "50%", border: `3px solid ${C.coral}` });
  const fly = heart(inner, 84, C.coral);

  const tapAt = r => { // button centre on the rotated phone
    const a = r * Math.PI / 180, ox = 0, oy = 134;
    return [419 + ox * Math.cos(a) - oy * Math.sin(a), 765 + ox * Math.sin(a) + oy * Math.cos(a)];
  };
  const dock = [1136, 538];
  const ring = (e, x, y, q, max) => {
    const d = lerp(10, max, E.outExpo(q));
    Object.assign(e.style, { left: x - d / 2 + "px", top: y - d / 2 + "px", width: d + "px", height: d + "px", opacity: q > 0 && q < 1 ? 1 - q : 0 });
  };

  return t => {
    const ir = kf(t, [[5.22, 0], [5.6, 2150, E.inOutQuart]]);
    root.style.clipPath = t < 5.6 ? `circle(${ir.toFixed(1)}px at 1780px 620px)` : "none";
    tf(inner, { s: 1 + .35 * E.inCubic(prog(t, 7.5, .5)) });

    scramble(eye, "Nhà Mình / Family care · 2026", t, 5.5, .45);
    rise(hA.parts, t, 5.5, .06, .6);
    rise(hB.parts, t, 5.68, .06, .6);

    const dk = E.outExpo(prog(t, 5.62, .7));
    tf(dash, { p: 1800, x: (1 - dk) * 1000, ry: lerp(-40, -9, dk), y: Math.sin(t * 2.4) * 6 - 10 * Math.sin(Math.PI * prog(t, 7.1, .3)) });
    dctx.clearRect(0, 0, 940, 529);
    cover(dctx, sync.at(Math.max(0, t - 5.62)));

    const pk = spring(t - 6.0, 1.8, .5), press = 1 - .035 * Math.sin(Math.PI * prog(t, 6.46, .2));
    const pr = lerp(14, -4, pk);
    tf(phone, { y: (1 - pk) * 720, r: pr, s: press, o: t > 5.98 ? 1 : 0 });
    const [bx, by] = tapAt(pr);

    const tk = E.outCubic(prog(t, 6.22, .26));
    const ts = t < 6.46 ? 1 : lerp(.78, 1, E.outCubic(prog(t, 6.5, .2)));
    tf(touch, { x: lerp(700, bx, tk) - 29, y: lerp(1060, by, tk) - 29, s: ts, o: t < 6.2 ? 0 : 1 - prog(t, 6.62, .15) });
    ring(ripple, bx, by, prog(t, 6.5, .5), 260);

    burst.forEach((b, i) => {
      const q = prog(t, 6.52, .55), a = i / 8 * Math.PI * 2 - Math.PI / 2, d = 150 * E.outExpo(q);
      tf(b, { x: bx - 15 + Math.cos(a) * d, y: by - 14 + Math.sin(a) * d, s: lerp(1, .3, q), r: a * 20, o: q > 0 && q < 1 ? 1 - q * q : 0 });
    });
    const fk = prog(t, 6.58, .55), fe = E.inOutCubic(fk);
    const at = k => [bezier(bx, 760, dock[0], k), bezier(by, 150, dock[1], k)];
    trail.forEach((d, i) => {
      const k = E.inOutCubic(clamp(fk - (i + 1) * .035)), [x, y] = at(k);
      tf(d, { x: x - 7, y: y - 7, s: 1 - i / 10, o: fk > 0 && fk < 1 && k > 0 ? .75 - i * .07 : 0 });
    });
    const [fx, fy] = at(fe);
    const fs = t < 6.58 ? 0 : fk < 1 ? kf(fk, [[0, .35], [.5, 1.35, E.outCubic], [1, .5, E.inOutCubic]]) : .5 + .06 * Math.sin((t - 7.13) * 14) * Math.exp(-(t - 7.13) * 3);
    tf(fly, { x: fx - 42, y: fy - 39, s: fs, r: lerp(-20, 0, fe) });

    const ok = spring(t - 7.08, 2.2, .45);
    tf(toast, { s: Math.max(0, ok), o: t > 7.08 ? 1 : 0 });
    ring(pulse, dock[0], dock[1], prog(t, 7.13, .6), 520);
  };
});

// ================================================================ 3 · VITALITÉ  (8.0 – 10.5)
scene(7.5, 10.62, 46, root => {
  const heartMask = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 92'><path d='${HEART}'/></svg>")`;
  // A · campaign
  const A = box(root, 0, 0, W, H, { background: C.black, overflow: "hidden" });
  const hero = pic(A, P("images/vitalite/hero.webp"), { width: W + "px", height: H + "px", objectFit: "cover", transformOrigin: "50% 38%" });
  box(A, 0, 0, W, H, { background: "linear-gradient(0deg,#0d0d0de6 0%,#0d0d0d55 38%,transparent 60%)" });
  const vt = line(A, "VITALITÉ.", { left: "84px", top: "470px", fontSize: "300px", fontWeight: 700, letterSpacing: "-.06em", color: C.bone }, true);
  const vs = line(A, "Streetwear. On screen.", { left: "98px", top: "935px", fontSize: "44px", color: C.bone, letterSpacing: "-.03em" });

  // B/C · the storefront
  const B = box(root, 0, 0, W, H, { background: C.bone, overflow: "hidden" });
  const outline = h("div", "disp abs", B, { left: "0px", top: "8px", fontSize: "400px", fontWeight: 700, letterSpacing: "-.05em", color: "transparent", WebkitTextStroke: "2px #111" }, "VITALITÉ VITALITÉ VITALITÉ");
  const marquee = h("div", "disp abs", B, { left: "0px", top: "860px", fontSize: "230px", fontWeight: 700, letterSpacing: "-.05em", color: C.pink }, "STREETWEAR — STREETWEAR — STREETWEAR —");
  const brw = box(B, 300, 176, 1150, 724, { background: "#fff", border: "1px solid #0002", boxShadow: "0 30px 80px #0004", overflow: "hidden", transformOrigin: "50% 50%" });
  box(brw, 0, 0, 1150, 34, { background: "#242424", color: C.bone, fontFamily: "DM Mono", fontSize: "13px", letterSpacing: ".12em", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" })
    .innerHTML = "<span>● ● ●</span><span>THE STOREFRONT</span><span>↗</span>";
  const scr = box(brw, 0, 34, 1150, 690, { overflow: "hidden" });
  const pages = ["home-grid", "pdp-grey", "pdp-white"].map(n => pic(scr, P(`images/vitalite/${n}.webp`), { width: "1150px" }));
  const ph = box(B, 1420, 300, 320, 646, { borderRadius: "40px", background: "#111", padding: "10px", overflow: "hidden", boxShadow: "0 30px 60px #0005" });
  const phv = box(ph, 10, 10, 300, 626, { borderRadius: "30px", overflow: "hidden" });
  pic(phv, P("images/vitalite/shop-mobile.webp"), { width: "300px" });

  // D · the storefront's own film
  const D = box(root, 0, 0, W, H, { background: "#000", overflow: "hidden" });
  const dctx = canvas(D, W, H);
  const film = seq("cache/vitalite/%.jpg", 192, 24);
  const st = line(D, "ON SCREEN.", { left: "84px", top: "380px", fontSize: "300px", fontWeight: 700, letterSpacing: "-.06em", color: "#111" }, true);
  const stSub = h("div", "mono abs", D, { left: "96px", top: "720px", color: "#111", fontSize: "24px" });

  return t => {
    if (t < 8.0) {
      const S = kf(t, [[7.5, 0], [8.0, 9000, E.inExpo]]);
      const m = `${(1136 - S / 2).toFixed(1)}px ${(538 - S * .46).toFixed(1)}px / ${S.toFixed(1)}px ${(S * .92).toFixed(1)}px no-repeat`;
      root.style.webkitMask = heartMask + " " + m;
      root.style.mask = heartMask + " " + m;
    } else { root.style.webkitMask = "none"; root.style.mask = "none"; }

    vis(A, t < 9.0); vis(B, t >= 9.0 && t < 10.0); vis(D, t >= 10.0);
    if (t < 9.0) {
      tf(hero, { s: lerp(1.2, 1.03, E.outCubic(prog(t, 7.5, 1.5))) });
      rise(vt.parts, t, 7.98, .035, .6, 0);
      tf(vt.el, { x: -(t - 8) * 26 });
      rise(vs.parts, t, 8.45, .05, .5);
    } else if (t < 10.0) {
      tf(outline, { x: -(t - 9) * 520 - 40 });
      tf(marquee, { x: (t - 9) * 420 - 900 });
      const bk = E.outExpo(prog(t, 8.99, .45));
      tf(brw, { x: (1 - bk) * 1500, r: lerp(-9, -3, bk), blur: 22 * (1 - bk) ** 3 });
      pages.forEach((pg, i) => {
        const at = [9.0, 9.5, 9.75][i], nx = [9.5, 9.75, 99][i];
        const k = i === 0 ? 1 : E.outExpo(prog(t, at, .22));
        const out = E.inCubic(prog(t, nx, .2));
        tf(pg, { y: (1 - k) * 700 - out * 160, s: 1 + .03 * (t - at), o: t >= at - .001 ? 1 : 0 });
        pg.style.zIndex = i;
      });
      const pk = spring(t - 9.12, 1.8, .5);
      tf(ph, { y: (1 - pk) * 760, r: lerp(14, 4, pk) });
    } else {
      dctx.clearRect(0, 0, W, H);
      cover(dctx, film.at(t - 10.0 + .15), { s: lerp(1.1, 1.0, prog(t, 10, .6)) });
      rise(st.parts, t, 10.0, .025, .45, 0);
      scramble(stSub, "Vitalité / Design & development", t, 10.02, .22);
    }
  };
});

// ================================================================ 4 · IELTS / UPHUB / BADMINTON  (10.5 – 12.0)
scene(10.28, 12.02, 47, root => {
  const panels = [
    { at: 10.5, bg: C.ieltsBg, ink: C.brownInk, colors: [C.brownInk, C.amber], title: ["IELTS", "Studio"], tag: "Learning, made more personal", src: "images/ielts-preview.webp", idx: "IELTS Studio · live demo" },
    { at: 11.0, bg: C.uphub, ink: C.uphubInk, colors: [C.uphubInk], title: ["UpHub"], tag: "A clearer digital front door", src: "images/uphub.webp", idx: "UpHub · client work", dir: 1 },
    { at: 11.5, bg: C.court, ink: C.mint, colors: [C.mint, "#ffffff"], title: ["Badminton", "Club"], tag: "Less organising. More playing.", src: "images/badminton-preview.webp", idx: "Badminton Club · live", dir: -1 },
  ].map(p => {
    const el = box(root, 0, 0, W, H, { background: p.bg, overflow: "hidden" });
    const idx = h("div", "mono abs", el, { left: "140px", top: "250px", color: p.ink });
    const lines = p.title.map((w, i) => line(el, w, { left: "128px", top: 300 + i * 172 + (p.title.length === 1 ? 86 : 0) + "px", fontSize: "176px", color: p.colors[i] }));
    const tag = line(el, p.tag, { left: "136px", top: "690px", fontSize: "38px", color: p.ink, letterSpacing: "-.03em" });
    const card = box(el, 920, 250, 900, 520, { borderRadius: "14px", overflow: "hidden", background: "#fff", boxShadow: "0 40px 90px #00000045", transformOrigin: "0% 50%" });
    const im = pic(card, P(p.src), { width: "900px", height: "520px", objectFit: "cover", objectPosition: "top" });
    return Object.assign(p, { el, idx0: p.idx, idx, lines, tag, card, im });
  });
  const slats = Array.from({ length: 8 }, (_, i) => box(root, 0, i * 135, W, 136, { background: C.ieltsBg }));

  return t => {
    slats.forEach((s, i) => {
      const k = E.outExpo(prog(t, 10.28 + i * .022, .24));
      tf(s, { x: (i % 2 ? 1 : -1) * (1 - k) * W });
      vis(s, t < 10.56);
    });
    panels.forEach((p, n) => {
      vis(p.el, t >= (n === 0 ? 10.5 : p.at));
      if (n > 0) {
        const k = E.outExpo(prog(t, p.at, .28)), sl = 320;
        const x0 = p.dir > 0 ? lerp(W + sl, 0, k) : lerp(-sl, W, k);
        p.el.style.clipPath = p.dir > 0
          ? `polygon(${x0}px 0,${W}px 0,${W}px ${H}px,${x0 - sl}px ${H}px)`
          : `polygon(0 0,${x0 + sl}px 0,${x0}px ${H}px,0 ${H}px)`;
      }
      scramble(p.idx, p.idx0, t, p.at + .02, .25);
      p.lines.forEach((l, i) => rise(l.parts, t, p.at + .02 + i * .06, .05, .45));
      rise(p.tag.parts, t, p.at + .1, .025, .4);
      const ck = E.outExpo(prog(t, p.at - .02, .55));
      tf(p.card, { p: 2000, x: (1 - ck) * 520, ry: lerp(-70, -8, ck), y: -12 * Math.sin((t - p.at) * 3) });
      tf(p.im, { s: 1 + .05 * (t - p.at) });
    });
  };
});

// ================================================================ 5 · ARU OTOKO  (12.0 – 15.0)
scene(11.85, 15.02, 48, root => {
  const filmL = box(root, 0, 0, W, H, { background: "#000" });
  const ctx = canvas(filmL, W, H, { filter: "contrast(1.08) saturate(1.06)" });
  box(filmL, 0, 0, W, H, { background: "radial-gradient(ellipse at 50% 50%,transparent 55%,#000000b0 100%),linear-gradient(0deg,#000000c0 12%,transparent 42%)" });
  const flash = box(filmL, 0, 0, W, H, { background: "#fff" });
  const burn = box(filmL, 0, 0, W, H, { background: "radial-gradient(circle at 50% 60%,#fff6e0,#ffd08a 55%,#e9a54b)" });
  const kanji = h("div", "abs", filmL, { left: "1600px", top: "210px", writingMode: "vertical-rl", fontFamily: "'Noto Serif JP'", fontWeight: 700, fontSize: "124px", color: C.cream, letterSpacing: ".08em", textShadow: "0 4px 30px #0008" });
  const kchars = [..."或る男"].map(c => h("span", "", kanji, { display: "inline-block" }, c));
  const title = line(filmL, "Aru Otoko", { left: "128px", top: "700px", fontSize: "120px", color: C.cream });
  const credit = h("div", "mono abs", filmL, { left: "140px", top: "838px", color: C.gold });
  const sub = line(filmL, "I direct what they become.", { left: "0px", top: "800px", width: W + "px", textAlign: "center", fontSize: "58px", color: C.cream, letterSpacing: "-.03em", textShadow: "0 3px 20px #000c" });
  const barT = box(root, 0, 0, W, 0, { background: "#000" });
  const barB = box(root, 0, 0, W, 0, { background: "#000" });
  const shotL = h("div", "mono abs", root, { left: "auto", right: "60px", top: "40px", color: C.gold, fontSize: "16px", letterSpacing: ".14em" });
  const walk = seq(P("images/aru-otoko/frames/s00/%.webp"), 151, 24);
  const still = n => img(P(`images/aru-otoko/stills/${n}.webp`));
  const shots = [
    { at: 12.0, seq: walk, f0: 1.6, s0: 1.12, s1: 1.03 },
    { at: 12.5, im: still("s03-crossing"), s0: 1.18, s1: 1.06, x0: 40, x1: -30 },
    { at: 13.0, im: still("s05-rooftop"), s0: 1.02, s1: 1.14, x0: -50, x1: 40 },
    { at: 13.5, im: still("s07-closeup"), s0: 1.16, s1: 1.04 },
    { at: 14.0, im: still("s08-skyline"), s0: 1.04, s1: 1.14, x0: 60, x1: -40 },
    { at: 14.25, im: still("s06-vending"), s0: 1.1, s1: 1.18 },
    { at: 14.5, im: still("s10-burning"), s0: 1.0, s1: 1.5, e: E.inCubic, shake: true },
  ];

  return t => {
    const bh = kf(t, [[11.85, 0], [12.0, 541, E.inQuart], [12.06, 541], [12.4, 138, E.outExpo]]);
    Object.assign(barT.style, { height: bh + "px" });
    Object.assign(barB.style, { top: H - bh + "px", height: bh + "px" });
    vis(filmL, t >= 12.0);
    vis(shotL, t >= 12.0);
    if (t < 12.0) return;

    const i = shots.findLastIndex(s => t >= s.at), s = shots[i];
    const end = shots[i + 1] ? shots[i + 1].at : 15.0, k = prog(t, s.at, end - s.at);
    const sc = lerp(s.s0, s.s1, (s.e || E.outCubic)(k));
    let sx = lerp(s.x0 || 0, s.x1 || 0, E.inOutCubic(k)), sy = 0;
    if (s.shake) { const a = 22 * E.inCubic(k), f = Math.floor(t * 60); sx += ((hash(f) % 200) / 100 - 1) * a; sy += ((hash(f + 7) % 200) / 100 - 1) * a; }
    ctx.clearRect(0, 0, W, H);
    cover(ctx, s.seq ? s.seq.at(t - s.at + s.f0) : s.im, { s: sc, x: sx, y: sy });
    flash.style.opacity = i > 0 && i < 6 ? .28 * (1 - prog(t, s.at, .1)) : 0;
    burn.style.opacity = E.inCubic(prog(t, 14.72, .28));
    shotL.textContent = `Shot ${String(i + 1).padStart(2, "0")} / 07   ·   Aru Otoko`;

    kchars.forEach((c, j) => {
      const q = E.outCubic(prog(t, 12.2 + j * .12, .5)), out = prog(t, 14.35, .2);
      tf(c, { y: (1 - q) * 40, o: q * (1 - out), blur: (1 - q) * 14 });
    });
    rise(title.parts, t, 12.3, .08, .6);
    sink(title.parts, t, 13.38);
    scramble(credit, "Creative direction · Editing", t, 12.45, .4);
    tf(credit, { o: 1 - prog(t, 13.38, .15) });
    rise(sub.parts, t, 13.5, .05, .5);
    sink(sub.parts, t, 14.25, .015, .18);
  };
});

// ================================================================ 6 · BÓNG VESPERA  (15.0 – 17.0)
scene(14.98, 17.12, 49, root => {
  root.style.background = "linear-gradient(180deg,#0e2a27,#1a423c 58%,#0b1f1d)";
  const fogs = [[-300, 520, 1700, 640, .55], [600, 120, 1600, 600, .35], [-200, 820, 2200, 520, .5]].map(([x, y, w, hh, o]) =>
    box(root, x, y, w, hh, { background: "radial-gradient(ellipse at center,#b4dcd259,transparent 62%)", opacity: o }));
  const orbs = [[1180, 330], [1245, 395]].map(([x, y]) => box(root, x, y, 34, 34, { borderRadius: "50%", background: "radial-gradient(circle,#fff6dd,#ffd9a0aa 35%,transparent 70%)" }));
  const eye = h("div", "mono abs", root, { left: "140px", top: "330px", color: C.mist });
  const l1 = line(root, "Bóng", { left: "128px", top: "372px", fontSize: "210px", color: C.bcream });
  const l2 = line(root, "Vespera.", { left: "128px", top: "574px", fontSize: "210px", color: C.jadeLight });
  const cred = h("div", "mono abs", root, { left: "140px", top: "830px", color: C.mist });
  const poster = box(root, 960, 140, 520, 780, { boxShadow: "0 40px 90px #00000070", overflow: "hidden" });
  pic(poster, P("images/vng-demo/final/ad-mockup-final.webp"), { width: "520px", height: "780px", objectFit: "cover" });
  const clip = box(root, 1330, 300, 480, 640, { borderRadius: "10px", overflow: "hidden", boxShadow: "0 40px 90px #00000080", border: "6px solid #efe6c8" });
  const cctx = canvas(clip, 468, 628);
  const motion = seq("cache/bong/%.jpg", 152, 30);
  const r = rng(7);
  const leaves = Array.from({ length: 34 }, () => {
    const d = { x: r() * W, y: r() * H * 1.4 - 380, v: 110 + r() * 170, a: 20 + r() * 50, f: .8 + r() * 1.6, ph: r() * 6.3, rs: (r() - .5) * 500, sz: .6 + r() * .9 };
    d.el = box(root, 0, 0, 24, 13, { borderRadius: "0 100% 0 100%", background: r() > .4 ? C.leaf : "#ef6a3a" });
    return d;
  });
  const white = box(root, 0, 0, W, H, { background: "radial-gradient(circle at 50% 60%,#fff6e0,#ffe6bf)" });

  return t => {
    const lt = t - 15;
    white.style.opacity = 1 - E.outCubic(prog(t, 15.0, .4));
    fogs.forEach((f, i) => tf(f, { x: lt * (i % 2 ? -60 : 70), s: 1 + lt * .05 }));
    orbs.forEach((o, i) => tf(o, { s: 1 + .35 * Math.sin(lt * 5 + i * 2), o: .9 }));
    scramble(eye, "From a visual world to a moving one", t, 15.2, .5);
    rise(l1.parts, t, 15.25, .1, .7);
    rise(l2.parts, t, 15.4, .1, .7);
    scramble(cred, "Art direction · Image-making · Motion", t, 15.6, .45);
    const pk = spring(t - 15.05, 1.4, .6);
    tf(poster, { y: (1 - pk) * 900 - lt * 18, r: lerp(-16, -6, pk) });
    const ck = spring(t - 15.25, 1.5, .55);
    tf(clip, { y: (1 - ck) * 900 - lt * 30, r: lerp(14, 5, ck) });
    cctx.clearRect(0, 0, 468, 628);
    cover(cctx, motion.at(Math.max(0, t - 15.1) + .3), { crop: [60, 52, 660, 880] });
    leaves.forEach(d => {
      const y = d.y + lt * d.v, x = d.x + Math.sin(lt * d.f + d.ph) * d.a;
      tf(d.el, { x, y, r: d.ph * 57 + lt * d.rs, s: d.sz, o: .9 });
    });
  };
});

// ================================================================ 7 · SIGN-OFF  (17.0 – 20.0)
scene(16.66, 20.01, 60, root => {
  const ink = box(root, 0, 0, W, H, { background: C.ink, overflow: "hidden" });
  const orb = box(ink, 0, 0, 1500, 1500, { borderRadius: "50%", background: "radial-gradient(circle,#c0e6862e,transparent 60%)" });
  const grid = box(ink, 0, 0, W, H, { backgroundImage: "linear-gradient(#f1f3ea0d 1px,transparent 1px),linear-gradient(90deg,#f1f3ea0d 1px,transparent 1px)", backgroundSize: "120px 120px" });
  const n1 = line(ink, "Pham Ngoc Thanh", { left: "128px", top: "268px", fontSize: "196px", color: C.cream }, true);
  const n2 = line(ink, "Tatsuki", { left: "128px", top: "470px", fontSize: "196px", color: C.lime }, true);
  const dot = h("span", "", n2.el, { display: "inline-block", width: ".15em", height: ".15em", borderRadius: "50%", background: C.lime, marginLeft: ".05em" });
  const rings = [0, 1].map(() => box(ink, 0, 0, 10, 10, { border: `2px solid ${C.lime}`, borderRadius: "50%" }));
  const rule = box(ink, 140, 772, 1640, 1, { background: "#f1f3ea40", transformOrigin: "0 0" });
  const tag = h("div", "mono abs", ink, { left: "140px", top: "800px", color: C.cream, fontSize: "26px" });
  const url = line(ink, "jak3rpham.github.io ↗", { left: "auto", right: "140px", top: "792px", fontSize: "46px", color: C.lime, letterSpacing: "-.03em" });
  const stripes = [C.lime, C.forest, C.peachB, C.bone, C.amber, C.uphub, C.gold, "#3f8f80"].map((c, i) => box(root, i * 240, 0, 241, H, { background: c }));
  const fade = box(root, 0, 0, W, H, { background: "#000" });

  return t => {
    stripes.forEach((s, i) => {
      const a = E.inOutQuart(prog(t, 16.66 + i * .025, .26)), b = E.inOutQuart(prog(t, 17.1 + i * .03, .3));
      tf(s, { y: (1 - a) * H - b * H });
    });
    vis(ink, t >= 17.0);
    tf(orb, { x: 900 + Math.sin(t * .8) * 160 - 750, y: 420 + Math.cos(t * .6) * 90 - 750 });
    tf(grid, { x: -((t * 14) % 120) });
    rise(n1.parts, t, 17.2, .02, .6, 6);
    rise(n2.parts, t, 17.34, .025, .6, 6);
    tf(dot, { s: Math.max(0, spring(t - 17.5, 2.8, .35)) });
    const dr = dot.getBoundingClientRect();
    rings.forEach((r, i) => {
      const q = prog(t, 17.5 + i * .12, .8), d = lerp(10, 700, E.outExpo(q));
      const cx = dr.left + dr.width / 2, cy = dr.top + dr.height / 2;
      Object.assign(r.style, { left: cx - d / 2 + "px", top: cy - d / 2 + "px", width: d + "px", height: d + "px", opacity: q > 0 && q < 1 ? (1 - q) * .8 : 0 });
    });
    tf(rule, { sx: E.inOutCubic(prog(t, 17.6, .6)) });
    scramble(tag, "Growth · Products · Creative", t, 17.75, .5);
    rise(url.parts, t, 18.0, .05, .6);
    fade.style.opacity = E.inOutCubic(prog(t, 19.5, .45));
  };
});

// ================================================================ HUD + grain
const hud = box(stage, 0, 0, W, H, { zIndex: 90, pointerEvents: "none" });
const hudTL = h("div", "mono abs", hud, { left: "60px", top: "40px", fontSize: "16px", letterSpacing: ".14em" });
const hudTR = h("div", "mono abs", hud, { left: "auto", right: "60px", top: "40px", fontSize: "16px", letterSpacing: ".14em" });
const hudBL = h("div", "mono abs", hud, { left: "60px", top: "1010px", fontSize: "16px", letterSpacing: ".14em" });
const hudBR = box(hud, 1800, 1016, 60, 12, { display: "flex", gap: "6px" });
const beats = [0, 1, 2, 3].map(() => h("span", "", hudBR, { width: "10px", height: "10px", border: "1.5px solid currentColor", display: "block" }));
const chapters = [
  [2.0, "01 — terra", C.forest], [5.5, "02 — Nhà Mình", C.terracotta], [8.0, "03 — Vitalité", C.bone], [9.0, "03 — Vitalité", "#111"],
  [10.0, "03 — Vitalité", "#111"], [10.5, "04 — IELTS Studio", C.brownInk], [11.0, "05 — UpHub", C.uphubInk], [11.5, "06 — Badminton Club", C.mint],
  [12.0, "07 — Aru Otoko", C.gold], [15.0, "08 — Bóng Vespera", C.mist],
];
function drawHud(t) {
  const on = t >= 2.0 && t < 17.0;
  hud.style.display = on ? "" : "none";
  if (!on) return;
  const c = chapters.findLast(ch => t >= ch[0]);
  hud.style.color = c[2];
  hudTL.textContent = "Tatsuki — Reel ’26";
  const first = chapters.find(ch => ch[1] === c[1]);
  scramble(hudTR, c[1], t, first[0], .3);
  const f = Math.floor(t * FPS + 1e-6);
  hudBL.textContent = `TC 00:00:${String(Math.floor(f / FPS)).padStart(2, "0")}:${String(f % FPS).padStart(2, "0")}`;
  const b = Math.floor(t / .5 + 1e-6) % 4;
  beats.forEach((e, i) => { e.style.background = i === b ? "currentColor" : "transparent"; });
  vis(hudTR, !(t >= 12 && t < 15)); // the film chapter carries its own slate
}
const grain = box(stage, 0, 0, W, H, { zIndex: 95, pointerEvents: "none", mixBlendMode: "overlay" });
(() => {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d"), d = g.createImageData(256, 256), r = rng(3);
  for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0);
  grain.style.backgroundImage = `url(${c.toDataURL()})`;
})();
function drawGrain(t) {
  const f = Math.floor(t * FPS + 1e-6);
  grain.style.backgroundPosition = `${hash(f) % 256}px ${hash(f + 99) % 256}px`;
  grain.style.opacity = t >= 12 && t < 15 ? .2 : t >= 15 && t < 17 ? .14 : .08;
}
/** A small push on every beat of the groove, so the frame breathes with the track. */
function drawPump(t) {
  const groove = (t >= 2 && t < 12) || (t >= 15 && t < 17);
  const ph = (t + 1e-6) % .5;
  tf(world, { s: groove ? 1 + .006 * Math.exp(-ph * 14) : 1 });
}

window.seek = t => {
  for (const s of scenes) {
    const on = t >= s.start && t < s.end;
    s.root.style.display = on ? "" : "none";
    if (on) s.draw(t);
  }
  drawHud(t); drawGrain(t); drawPump(t);
};
window.ready = (async () => {
  await document.fonts.ready;
  await Promise.all([
    ['500 100px "Bricolage Grotesque"', "AaÉÓàìổ"], ['700 100px "Bricolage Grotesque"', "VITALÉ"],
    ['400 20px "DM Mono"', "AÉ0"], ['700 100px "Noto Serif JP"', "或る男"], ['600 30px "Be Vietnam Pro"', "Báo con: ổn"],
  ].map(([f, s]) => document.fonts.load(f, s)));
  COLLECT = true;
  for (let f = 0; f < DUR * FPS; f++) window.seek(f / FPS);
  COLLECT = false;
  need.forEach(src => img(src));
  await Promise.all(loads);
  window.seek(0);
  return { images: Object.keys(IMG).length, missing: Object.values(IMG).filter(i => !i.naturalWidth).map(i => i.src) };
})();
