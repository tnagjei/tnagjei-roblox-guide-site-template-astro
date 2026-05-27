import fs from "node:fs";
import path from "node:path";

const distDir = path.join(process.cwd(), "dist");
const required = [
  "index.html",
  "privacy/index.html",
  "terms/index.html",
  "sitemap.xml",
  "robots.txt",
  "llms.txt",
  "llms-full.txt"
];

const allowedHtml = new Set([
  "index.html",
  "privacy/index.html",
  "terms/index.html"
]);

const violations = [];

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

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
  if (!allowedHtml.has(html)) {
    violations.push(`Unexpected HTML output: dist/${html}`);
  }
}

const sitemap = fs.existsSync(path.join(distDir, "sitemap.xml")) ? fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf8") : "";
const robots = fs.existsSync(path.join(distDir, "robots.txt")) ? fs.readFileSync(path.join(distDir, "robots.txt"), "utf8") : "";

const sitemapLocs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1]);

if (sitemapLocs.length !== 1) {
  violations.push(`sitemap must contain exactly 1 URL by default, got ${sitemapLocs.length}`);
}

if (sitemap.includes("/privacy/")) violations.push("sitemap must not include /privacy/");
if (sitemap.includes("/terms/")) violations.push("sitemap must not include /terms/");
if (sitemap.includes("/codes/")) violations.push("sitemap must not include unfinished /codes/");
if (sitemap.includes("/zh-tw/")) violations.push("sitemap must not include unfinished /zh-tw/");

if (!robots.includes("User-agent: Googlebot")) violations.push("robots must include Googlebot rule");
if (!robots.includes("User-agent: Bingbot")) violations.push("robots must include Bingbot rule");
if (!robots.includes("User-agent: AdsBot-Google")) violations.push("robots must include AdsBot-Google rule");
if (!robots.includes("Sitemap: https://example.com/sitemap.xml")) violations.push("robots must include absolute sitemap URL");

if (violations.length > 0) {
  console.error("Static export validation failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Static export validation passed.");
console.log(`Checked ${sitemapLocs.length} sitemap URL(s).`);
console.log(`Checked ${htmlFiles.length} HTML file(s).`);
