// Extracts the moving footage the reel quotes into still sequences, so the renderer can draw
// any frame synchronously instead of seeking a <video>.
//   node prep.mjs            -> v1 clips into cache/<id>/
//   node prep.mjs --set v2   -> v2 segments into cache/v2/<id>/ (30 fps, optional in-point, length, crop)
//   node prep.mjs --set v3   -> v3 footage into cache/v3/<id>/
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, "..", "public");
const set = process.argv.includes("--set") ? process.argv[process.argv.indexOf("--set") + 1] : "v1";
const v1 = [
  { id: "builder", src: "images/home/builder-motion.mp4", w: 1920 },
  { id: "bong", src: "images/vng-demo/motion/motion-kf3-to-kf5-seedance.mp4", w: 720 },
  { id: "vitalite", src: "vitalite/demo/theme/video/hero-1280.mp4", w: 1280 },
  { id: "nhasync", src: "videos/nha-minh/01_Dual_Screen_Realtime_Sync_RealUI_1080p.mp4", w: 1920 },
];
// v2: footage/ holds the owner's own YouTube uploads. crop is ffmpeg w:h:x:y in source pixels.
const F = f => join(here, "footage", f);
const noSubs = "1600:900:160:0", scope = "1458:820:231:130";
const v2 = [
  { id: "nha-sync", src: "videos/nha-minh/01_Dual_Screen_Realtime_Sync_RealUI_1080p.mp4", t: 2.5, w: 1600 },
  { id: "nha-voice", src: "videos/nha-minh/03_App_BaMe_Chau_Bi_AI_Voice_RealUI_1080p.mp4", t: 3, w: 1280 },
  { id: "nha-vital", src: "videos/nha-minh/05_Dashboard_Con_Vital_Line_Chart_RealUI_1080p.mp4", t: 3, w: 1280 },
  { id: "bong-motion", src: "images/vng-demo/motion/motion-kf3-to-kf5-seedance.mp4", w: 600, crop: "600:828:60:52" },
  { id: "mrbrown-drink", abs: F("mrbrown.mp4"), ss: 55.0, t: 1.4, w: 1920 },
  { id: "mrbrown-can", abs: F("mrbrown.mp4"), ss: 70.0, t: 1.4, w: 1920, crop: noSubs },
  { id: "mrbrown-toast", abs: F("mrbrown.mp4"), ss: 65.8, t: 1.0, w: 1280 },
  { id: "aris-pack", abs: F("arisaqua.mp4"), ss: 110.6, t: 1.4, w: 1920, crop: noSubs },
  { id: "aris-profile", abs: F("arisaqua.mp4"), ss: 16.3, t: 1.0, w: 1280 },
  { id: "aris-pink", abs: F("arisaqua.mp4"), ss: 94.8, t: 1.0, w: 1280, crop: noSubs },
  { id: "yl-night", abs: F("younglions23.mp4"), ss: 52.8, t: 1.0, w: 1280, crop: noSubs },
  { id: "yl-hand", abs: F("younglions23.mp4"), ss: 41.2, t: 1.0, w: 1280, crop: noSubs },
  { id: "loa-walk", abs: F("letsonair.mp4"), ss: 317.5, t: 1.0, w: 1280, crop: scope },
  { id: "loa-city", abs: F("letsonair.mp4"), ss: 297.5, t: 1.0, w: 1280, crop: scope },
  { id: "isbe-group", abs: F("isbe.mp4"), ss: 59.5, t: 1.0, w: 1280 },
  { id: "isbe-dance", abs: F("isbe.mp4"), ss: 206.0, t: 1.0, w: 1280 },
  { id: "mdh-walk", abs: F("miendathua.mp4"), ss: 100.5, t: 1.0, w: 1280, crop: "1458:820:231:98" },
  { id: "mdh-reach", abs: F("miendathua.mp4"), ss: 106.5, t: 1.0, w: 1280, crop: "1458:820:231:98" },
  { id: "hn-wave", abs: F("hoanien.mp4"), ss: 65.0, t: 1.0, w: 1280 },
  { id: "hn-stage", abs: F("hoanien.mp4"), ss: 14.5, t: 1.0, w: 1280 },
];
// v3: native 1920 x 1080, no crop and no scale; in-points verified on a 0.5 s scan, all subtitle-free.
const v3 = [
  { id: "vb-aris-sil", abs: F("arisaqua.mp4"), ss: 10.6, t: 1.0, w: 1920 },
  { id: "vb-mb-drink", abs: F("mrbrown.mp4"), ss: 55.9, t: 1.0, w: 1920 },
  { id: "vb-aris-close", abs: F("arisaqua.mp4"), ss: 16.0, t: 1.0, w: 1920 },
  { id: "vb-mb-cheers", abs: F("mrbrown.mp4"), ss: 66.9, t: 1.0, w: 1920 },
  // The projector grid and film strip: nine filmed works at once, at 960 px (a tile never spans more).
  ...[["g-mb-drink", "mrbrown.mp4", 55.2], ["g-mb-cheers", "mrbrown.mp4", 65.6], ["g-aris-sil", "arisaqua.mp4", 10.4], ["g-aris-close", "arisaqua.mp4", 15.8],
    ["g-yl-night", "younglions23.mp4", 52.8], ["g-isbe", "isbe.mp4", 206.0], ["g-hn", "hoanien.mp4", 14.5]].map(([id, f, ss]) => ({ id, abs: F(f), ss, t: 2.4, w: 960 })),
  { id: "g-loa", abs: F("letsonair.mp4"), ss: 297.5, t: 2.4, w: 960, crop: "1458:820:231:130" },
  { id: "g-mdh", abs: F("miendathua.mp4"), ss: 100.5, t: 2.4, w: 960, crop: "1458:820:231:98" },
  // Aru Otoko: the MV's lyric-free opening for the big set, the raw generations for the small ones.
  { id: "aru-mv", abs: F("aru/erqSvIsXUpI.mp4"), ss: 3.5, t: 7.4, w: 1280 },
  ...["3okAVLvxFUU", "W-Eqt_nPQSM", "JJWwjYu7i4w", "A3qdznRUKxU", "U9DaTljXRAY", "1fYJUNl1hgc"].map((y, i) => ({ id: "aru-g" + i, abs: F(`aru/${y}.mp4`), ss: 1.0, t: 2.4, w: 850 })),
  // Bóng Vespera: the multi-frame story, "Ai" watermark cropped.
  { id: "bong-mf", src: "images/vng-demo/motion/motion-multiframes-experimental.mp4", w: 600, crop: "600:828:60:52" },
  // Vitalité's hero film, only its two calm stretches (the glitch between them strobes).
  { id: "vit-sky", src: "vitalite/demo/theme/video/hero-1280.mp4", ss: 0.1, t: 1.0, w: 1280 },
  { id: "vit-tee", src: "vitalite/demo/theme/video/hero-1280.mp4", ss: 5.1, t: 2.5, w: 1280 },
  { id: "nha-sync", src: "videos/nha-minh/01_Dual_Screen_Realtime_Sync_RealUI_1080p.mp4", ss: 0.5, t: 4.0, w: 1280 },
];
const clips = set === "v3" ? v3 : set === "v2" ? v2 : v1;

for (const c of clips) {
  const out = set === "v1" ? join(here, "cache", c.id) : join(here, "cache", set, c.id);
  if (existsSync(out) && readdirSync(out).length) { console.log(`skip ${c.id}`); continue; }
  mkdirSync(out, { recursive: true });
  const vf = [c.crop && `crop=${c.crop}`, `scale=${c.w}:-2`].filter(Boolean).join(",");
  const timing = [...(c.ss != null ? ["-ss", String(c.ss)] : []), "-i", c.abs || join(pub, c.src), ...(c.t ? ["-t", String(c.t)] : [])];
  execFileSync("ffmpeg", ["-v", "error", ...timing, "-vf", vf, ...(set !== "v1" ? ["-r", "30"] : []), "-q:v", "2", join(out, "%04d.jpg")]);
  console.log(`${c.id}: ${readdirSync(out).length} frames`);
}
