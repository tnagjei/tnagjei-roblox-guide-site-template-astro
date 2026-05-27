import fs from "node:fs";
import path from "node:path";

const domain = "https://example.com";
const routes = ["/"];
const outDir = path.join(process.cwd(), "dist");

if (!fs.existsSync(outDir)) {
  console.error("dist/ does not exist. Run astro build before generating SEO files.");
  process.exit(1);
}

function absoluteUrl(route) {
  return `${domain.replace(/\/+$/g, "")}${route.startsWith("/") ? route : `/${route}`}`;
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .map((route) => `  <url>\n    <loc>${absoluteUrl(route)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${route === "/" ? "1" : "0.8"}</priority>\n  </url>`)
  .join("\n")}\n</urlset>\n`;

const robots = [
  "User-agent: *",
  "Allow: /",
  "",
  "User-agent: Googlebot",
  "Allow: /",
  "",
  "User-agent: Bingbot",
  "Allow: /",
  "",
  "User-agent: AdsBot-Google",
  "Allow: /",
  "",
  `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
  ""
].join("\n");

const llms = [
  "# Example Game Guide",
  "",
  "> Astro + Cloudflare Pages Roblox guide template.",
  "",
  "## Public routes",
  `- Home: ${absoluteUrl("/")}`,
  "",
  "## Template policy",
  "- Do not publish active codes without official or in-game proof.",
  "- Privacy and terms pages are system pages and are not listed in sitemap.",
  ""
].join("\n");

const llmsFull = [
  llms,
  "## Static export",
  "- Build output directory: dist",
  "- Deployment target: Cloudflare Pages",
  "- Default public sitemap route count: 1",
  ""
].join("\n");

fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(outDir, "robots.txt"), robots);
fs.writeFileSync(path.join(outDir, "llms.txt"), llms);
fs.writeFileSync(path.join(outDir, "llms-full.txt"), llmsFull);

console.log(`Generated ${routes.length} sitemap route(s).`);
console.log("Generated sitemap.xml, robots.txt, llms.txt, and llms-full.txt in dist/.");
