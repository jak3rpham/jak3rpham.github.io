// node render.mjs                       -> out/reel-video.mp4 (60 fps, 180° shutter motion blur)
// node render.mjs --stills 1.2,3.5,...  -> audit/still-<t>.png
// node render.mjs --sub 1 --fps 30      -> quick draft
// v2: node render.mjs --page reel2.html --serve --to 30 --out out/reel2-video.mp4
//   --serve loads the page over a local HTTP server (WebGL cannot take textures from file://).
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, writeFileSync, readFile } from "node:fs";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("../node_modules/playwright-core");
const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const fps = +arg("fps", 60), sub = +arg("sub", 4), from = +arg("from", 0), to = +arg("to", 20);
const out = arg("out", join(here, "out", "reel-video.mp4"));
const stills = arg("stills", "");
const pageFile = arg("page", "reel.html"), serve = process.argv.includes("--serve");

let url = pathToFileURL(join(here, pageFile)).href, server;
if (serve) {
  const root = join(here, ".."), types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png" };
  server = createServer((req, res) => {
    const p = normalize(join(root, decodeURIComponent(req.url.split("?")[0])));
    if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
    readFile(p, (err, data) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { "Content-Type": types[extname(p)] || "application/octet-stream" }); res.end(data); });
  });
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  url = `http://127.0.0.1:${server.address().port}/showreel/${pageFile}`;
}
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--allow-file-access-from-files", "--force-color-profile=srgb", "--hide-scrollbars"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on("console", m => { if (m.type() !== "log") console.log("[page]", m.text()); });
page.on("pageerror", e => console.log("[page error]", e.message));
await page.goto(url);
const info = await page.evaluate(() => window.ready);
console.log("ready", JSON.stringify(info));
const cdp = await page.context().newCDPSession(page);
const shot = async () => Buffer.from((await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true })).data, "base64");

if (stills) {
  mkdirSync(join(here, "audit"), { recursive: true });
  for (const t of stills.split(",").map(Number)) {
    const a = Date.now(); await page.evaluate(t => window.seek(t), t);
    const b = Date.now(); writeFileSync(join(here, "audit", `${arg("prefix", "still")}-${t.toFixed(3)}.png`), await shot());
    if (process.argv.includes("--time")) console.log(`t=${t} seek ${b - a}ms shot ${Date.now() - b}ms`);
  }
  await browser.close();
  process.exit(0);
}

mkdirSync(dirname(out), { recursive: true });
// tmix output n averages inputs n-sub+1..n, so keep every sub-th output starting at sub-1.
const vf = sub > 1 ? ["-vf", `tmix=frames=${sub},select=eq(mod(n\\,${sub})\\,${sub - 1}),setpts=N/(${fps}*TB)`] : [];
const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(fps * sub), "-i", "-", ...vf,
  "-r", String(fps), "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
const frames = Math.round((to - from) * fps), t0 = Date.now();
for (let f = 0; f < frames; f++) {
  for (let j = 0; j < sub; j++) {
    // Sub-frames open on the frame time and span half an interval (a 180° shutter), so a cut
    // placed on a frame boundary never bleeds into the frame before it.
    const t = from + f / fps + j / sub * (.5 / fps);
    await Promise.race([page.evaluate(t => window.seek(t), t), new Promise((_, no) => setTimeout(() => no(new Error(`seek(${t.toFixed(4)}) hung`)), 60000))]);
    if (!ff.stdin.write(await shot())) await new Promise(r => ff.stdin.once("drain", r));
  }
  if (f % 60 === 0) console.log(`frame ${f}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
ff.stdin.end();
await new Promise(r => ff.on("close", r));
await browser.close();
server?.close();
console.log("wrote", out, `${((Date.now() - t0) / 1000).toFixed(0)}s`);
