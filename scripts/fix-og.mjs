// Next's opengraph-image convention emits an EXTENSIONLESS file (out/opengraph-image)
// and references it as `/opengraph-image?<hash>`. GitHub Pages types files by extension,
// so that ships as application/octet-stream and Facebook/LinkedIn/Slack scrapers drop it.
//
// This renames each generated card to .png and rewrites the references in the emitted HTML.
import { readdir, rename, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = "out";

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const files = await walk(OUT);

const cards = files.filter((f) => f.endsWith("opengraph-image"));
for (const f of cards) await rename(f, `${f}.png`);

let patched = 0;
for (const f of files.filter((f) => f.endsWith(".html"))) {
  const src = await readFile(f, "utf8");
  // /opengraph-image?hash  ->  /opengraph-image.png
  const next = src.replace(/(opengraph-image)\?[a-z0-9]+/gi, "$1.png");
  if (next !== src) {
    await writeFile(f, next);
    patched++;
  }
}

console.log(`og: renamed ${cards.length} card(s), patched ${patched} html file(s)`);
