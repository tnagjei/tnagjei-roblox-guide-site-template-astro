import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const configText = fs.readFileSync(path.join(root, "src/data/config.ts"), "utf8");
const violations = [];

function extractString(source, key, fallback = "") {
  const match = source.match(new RegExp(`${key}:\\s*[\"']([^\"']*)[\"']`, "m"));
  return match?.[1] || fallback;
}

function extractArray(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`, "m"));
  if (!match) return [];
  return Array.from(match[1].matchAll(/[\"']([^\"']*)[\"']/g)).map((item) => item[1]);
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

function htmlForSlug(slug) {
  return slug === "" ? "index.html" : `${slug}/index.html`;
}

function pathForSlug(slug) {
  return slug === "" ? "/" : `/${slug}/`;
}

const siteDomain = extractString(configText, "siteDomain", "https://example.com").replace(/\/+$/g, "");
const completedCoreSlugs = extractArray(configText, "completedCoreSlugs");
const completedEnglishOnlySlugs = extractArray(configText, "completedEnglishOnlySlugs");
const systemSlugs = extractArray(configText, "systemSlugs");
const blockedSlugs = extractArray(configText, "blockedSlugs");
const sitemapExcludedSlugs = new Set([
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
const htmlExcludedSlugs = new Set(["guide", "updates", "scripts", "macros", "executor", "exploit", "th", "fil", "id"]);
const sitemapSlugs = Array.from(new Set([...completedCoreSlugs, ...completedEnglishOnlySlugs, ...systemSlugs])).filter(
  (slug) => !sitemapExcludedSlugs.has(slug)
);
const expectedHtmlSlugs = Array.from(
  new Set([...completedCoreSlugs, ...completedEnglishOnlySlugs, ...systemSlugs, "privacy", "terms"])
).filter((slug) => !htmlExcludedSlugs.has(slug));
const expectedHtml = new Set(expectedHtmlSlugs.map(htmlForSlug));
const required = ["sitemap.xml", "robots.txt", "llms.txt", "llms-full.txt", ...expectedHtml];

if (!fs.existsSync(distDir)) {
  violations.push("dist/ must exist after build");
}

for (const file of required) {
  if (!fs.existsSync(path.join(distDir, file))) {
    violations.push(`Missing dist/${file}`);
  }
}

const files = listFiles(distDir).map((file) => path.relative(distDir, file));
const htmlFiles = files.filter((file) => file.endsWith(".html"));

for (const html of htmlFiles) {
  if (!expectedHtml.has(html)) {
    violations.push(`Unexpected HTML output: dist/${html}`);
  }
}

const sitemapPath = path.join(distDir, "sitemap.xml");
const robotsPath = path.join(distDir, "robots.txt");
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
const robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, "utf8") : "";
const sitemapLocs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1]);

if (sitemapLocs.length !== sitemapSlugs.length) {
  violations.push(`sitemap URL count must equal completed and allowed system slug count ${sitemapSlugs.length}, got ${sitemapLocs.length}`);
}

for (const slug of sitemapSlugs) {
  const expectedUrl = `${siteDomain}${pathForSlug(slug)}`;
  if (!sitemapLocs.includes(expectedUrl)) {
    violations.push(`sitemap missing completed route: ${expectedUrl}`);
  }
}

for (const slug of ["about", "contact", "editorial-policy"]) {
  const expectedUrl = `${siteDomain}${pathForSlug(slug)}`;
  if (!sitemapLocs.includes(expectedUrl)) {
    violations.push(`sitemap missing system route: ${expectedUrl}`);
  }
}

for (const forbidden of [
  "/privacy/",
  "/terms/",
  "/zh-tw/",
  "/th/",
  "/fil/",
  "/id/",
  "/guide/",
  "/updates/",
  "/scripts/",
  "/macros/",
  "/executor/",
  "/exploit/"
]) {
  if (sitemap.includes(forbidden)) violations.push(`sitemap must not include ${forbidden}`);
}

for (const bot of ["Googlebot", "Bingbot", "AdsBot-Google"]) {
  if (!robots.includes(`User-agent: ${bot}`)) violations.push(`robots must include ${bot} rule`);
}

if (!robots.includes(`Sitemap: ${siteDomain}/sitemap.xml`)) {
  violations.push("robots must include sitemap URL using current siteDomain");
}

if (violations.length > 0) {
  console.error("Static export validation failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Static export validation passed.");
console.log(`Checked ${sitemapLocs.length} sitemap URL(s).`);
console.log(`Checked ${htmlFiles.length} HTML file(s).`);
