// GitHub Pages serves static files only — there is no server to issue a 301. The export
// writes out/terra.html, so /terra resolves but /terra/ hits the 404 page. Pages already
// prefers the .html over the same-named directory (out/terra/ exists for RSC payloads and
// /terra still serves terra.html), so dropping an index.html into that directory makes the
// trailing-slash form resolve without shadowing the canonical one.
//
// The stub is noindex and carries the canonical, so search engines keep attributing the
// page to the slashless URL.
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const OUT = "out";
const SITE = "https://jak3rpham.github.io";
// index.html is the root and has no slashless form; 404.html is served, never linked;
// _not-found is Next's internal route and is not a destination anyone can type.
const SKIP = new Set(["index.html", "404.html", "_not-found.html"]);

const stub = (route) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting to ${route}</title>
<link rel="canonical" href="${SITE}${route}">
<meta name="robots" content="noindex,follow">
<meta http-equiv="refresh" content="0; url=${route}">
<script>location.replace(${JSON.stringify(route)} + location.search + location.hash);</script>
</head>
<body><p>Redirecting to <a href="${route}">${SITE}${route}</a>.</p></body>
</html>
`;

const entries = await readdir(OUT, { withFileTypes: true });
const routes = entries
  .filter((e) => e.isFile() && e.name.endsWith(".html") && !SKIP.has(e.name))
  .map((e) => "/" + e.name.slice(0, -".html".length));

for (const route of routes) {
  const dir = join(OUT, route.slice(1));
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), stub(route), "utf8");
}

console.log(`slash redirects: ${routes.length} stub(s) -> ${routes.join(", ")}`);
