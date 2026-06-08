import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const configText = fs.readFileSync(path.join(root, "src/data/config.ts"), "utf8");
const gameText = fs.readFileSync(path.join(root, "src/data/game.ts"), "utf8");

function extractString(source, key, fallback = "") {
  const match = source.match(new RegExp(`${key}:\\s*["']([^"']*)["']`, "m"));
  return match?.[1] || fallback;
}

function extractArray(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`, "m"));
  if (!match) return [];
  return Array.from(match[1].matchAll(/["']([^"']*)["']/g)).map((item) => item[1]);
}

function cleanBaseUrl(value) {
  return value.replace(/\/+$/g, "");
}

function absoluteUrl(baseUrl, routePath) {
  const normalizedPath = routePath.startsWith("/") ? routePath : `/${routePath}`;
  return `${cleanBaseUrl(baseUrl)}${normalizedPath}`;
}

function routePath(slug) {
  return slug ? `/${slug}/` : "/";
}

const siteName = extractString(configText, "siteName", "Example Game Guide");
const gameName = extractString(configText, "gameName", "Example Roblox Game");
const siteDomain = extractString(configText, "siteDomain", "https://example.com");
const primaryKeyword = extractString(configText, "primaryKeyword", "Example Roblox Game guide");
const launchMode = extractString(configText, "launchMode", "minimal");
const completedLocales = extractArray(configText, "completedLocales");
const completedCoreSlugs = extractArray(configText, "completedCoreSlugs");
const completedEnglishOnlySlugs = extractArray(configText, "completedEnglishOnlySlugs");
const systemSlugs = extractArray(configText, "systemSlugs");
const blockedSlugs = extractArray(configText, "blockedSlugs");
const robloxUrl = extractString(gameText, "robloxUrl", "https://www.roblox.com/");
const excludedSitemapSlugs = new Set([
  "privacy",
  "terms",
  "guide",
  "updates",
  "scripts",
  "macros",
  "executor",
  "exploit",
  "th",
  "fil",
  "id",
  ...blockedSlugs
]);

const routes = Array.from(new Set([...completedCoreSlugs, ...completedEnglishOnlySlugs, ...systemSlugs]))
  .filter((slug) => !excludedSitemapSlugs.has(slug))
  .map((slug) => ({ slug, path: routePath(slug) }));

if (!fs.existsSync(distDir)) {
  throw new Error("dist/ does not exist. Run astro build before generating SEO files.");
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .map((route) => `  <url>\n    <loc>${absoluteUrl(siteDomain, route.path)}</loc>\n    <changefreq>${route.slug === "" ? "daily" : "weekly"}</changefreq>\n    <priority>${route.slug === "" ? "1" : "0.8"}</priority>\n  </url>`)
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
  `Sitemap: ${absoluteUrl(siteDomain, "/sitemap.xml")}`,
  ""
].join("\n");

const llms = [
  `# ${siteName}`,
  "",
  `> ${siteName} is an Astro and Cloudflare Pages Roblox guide template.`,
  "",
  "## Public routes",
  ...routes.map((route) => `- ${absoluteUrl(siteDomain, route.path)}`),
  "",
  "## Source policy",
  "Do not publish active codes, rewards, values, or official claims without source evidence.",
  "Third-party pages are community-reported research signals only.",
  ""
].join("\n");

const llmsFull = [
  llms,
  "## Template configuration",
  `- Game: ${gameName}`,
  `- Primary keyword: ${primaryKeyword}`,
  `- Launch mode: ${launchMode}`,
  `- Completed locales: ${completedLocales.join(", ")}`,
  `- Completed core slugs: ${completedCoreSlugs.join(", ")}`,
  `- Roblox URL: ${robloxUrl}`,
  ""
].join("\n");

fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(distDir, "robots.txt"), robots);
fs.writeFileSync(path.join(distDir, "llms.txt"), llms);
fs.writeFileSync(path.join(distDir, "llms-full.txt"), llmsFull);

console.log(`Generated ${routes.length} sitemap route(s).`);
console.log("Generated static SEO files in dist/.");
