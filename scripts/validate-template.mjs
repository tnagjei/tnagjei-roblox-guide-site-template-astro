import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const violations = [];
const wikiHubSlugs = ["", "codes", "guide", "tier-list", "classes", "updates"];
const expectedLocales = ["en", "th", "fil", "id"];

const requiredFiles = [
  "astro.config.mjs",
  "package.json",
  "src/data/config.ts",
  "src/data/game.ts",
  "src/data/reported-guides.ts",
  "src/content/home.ts",
  "src/lib/navigation.ts",
  "src/pages/index.astro",
  "src/pages/privacy.astro",
  "src/pages/terms.astro",
  "src/pages/codes.astro",
  "src/pages/guide.astro",
  "src/pages/tier-list.astro",
  "src/pages/classes.astro",
  "src/pages/updates.astro",
  "src/layouts/SiteLayout.astro",
  "src/components/Header.astro",
  "scripts/generate-favicons.mjs",
  "scripts/generate-seo-files.mjs",
  "scripts/init-new-site.mjs",
  "scripts/audit-new-site.mjs",
  "scripts/validate-static-export.mjs",
  "public/icon.svg",
  "public/hero-placeholder.svg"
];

const forbiddenPaths = [
  "next.config.js",
  "next.config.mjs",
  "app",
  "pages/api",
  "middleware.ts",
  "middleware.js",
  "vercel.json",
  "src/pages/scripts.astro",
  "src/pages/macros.astro",
  "src/pages/executor.astro",
  "src/pages/exploit.astro",
  "src/pages/weapons.astro",
  "src/pages/value-list.astro",
  "src/pages/th.astro",
  "src/pages/fil.astro",
  "src/pages/id.astro"
];

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function extractArray(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`, "m"));
  if (!match) return [];
  return Array.from(match[1].matchAll(/["']([^"']*)["']/g)).map((item) => item[1]);
}

function extractString(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*["']([^"']*)["']`, "m"));
  return match?.[1] || "";
}

for (const file of requiredFiles) {
  if (!exists(file)) violations.push(`Missing required file: ${file}`);
}

for (const file of forbiddenPaths) {
  if (exists(file)) violations.push(`Forbidden Astro template path exists: ${file}`);
}

if (exists("package.json")) {
  const packageJson = JSON.parse(read("package.json"));
  if (!packageJson.dependencies?.astro) violations.push("package.json must depend on astro");
  if (packageJson.dependencies?.next) violations.push("Astro template must not depend on next");
  if (packageJson.scripts?.build !== "node scripts/generate-favicons.mjs && astro build && node scripts/generate-seo-files.mjs") {
    violations.push("build script must generate favicons, run astro build, and generate static SEO files");
  }
  if (!packageJson.scripts?.check?.includes("validate:static-export")) violations.push("check script must include validate:static-export");
  if (packageJson.scripts?.["init:new-site"] !== "node scripts/init-new-site.mjs") violations.push("package.json must expose init:new-site");
}

if (exists("astro.config.mjs")) {
  const astroConfig = read("astro.config.mjs");
  if (!astroConfig.includes('output: "static"')) violations.push("astro.config.mjs must use output static");
  if (!astroConfig.includes('trailingSlash: "always"')) violations.push("astro.config.mjs must use trailingSlash always");
}

if (exists("src/data/config.ts")) {
  const config = read("src/data/config.ts");
  const launchMode = extractString(config, "launchMode");
  const coreSlugs = extractArray(config, "coreSlugs");
  const completedCoreSlugs = extractArray(config, "completedCoreSlugs");
  const navigationSlugs = extractArray(config, "navigationSlugs");
  const availableLocales = extractArray(config, "availableLocales");
  const completedLocales = extractArray(config, "completedLocales");
  const blockedSlugs = extractArray(config, "blockedSlugs");

  if (launchMode !== "wiki-hub") violations.push("template default launchMode must be wiki-hub");
  if (completedCoreSlugs.join(",") !== wikiHubSlugs.join(",")) violations.push("template default completedCoreSlugs must match P4 common nav slugs");
  if (navigationSlugs.join(",") !== wikiHubSlugs.join(",")) violations.push("navigationSlugs must match P4 common nav slugs");
  if (!completedCoreSlugs.every((slug) => coreSlugs.includes(slug))) violations.push("completedCoreSlugs must be a subset of coreSlugs");
  if (availableLocales.join(",") !== expectedLocales.join(",")) violations.push("availableLocales must be en, th, fil, id");
  if (completedLocales.join(",") !== "en") violations.push("completedLocales must default to en only");
  if (!["scripts", "macros", "executor", "exploit"].every((slug) => blockedSlugs.includes(slug))) {
    violations.push("blockedSlugs must include scripts, macros, executor, exploit");
  }
}

if (exists("src/lib/navigation.ts")) {
  const nav = read("src/lib/navigation.ts");
  for (const label of ["Codes", "Guide", "Tier List", "Classes", "Updates", "English", "Thai", "Filipino", "Indonesian"]) {
    if (!nav.includes(label)) violations.push(`navigation must include ${label}`);
  }
}

if (exists("src/data/game.ts")) {
  const game = read("src/data/game.ts");
  if (!game.includes("verifiedActiveCodes: []")) violations.push("verifiedActiveCodes must default to empty array");
  if (!game.includes("communityReportedCodes: []")) violations.push("communityReportedCodes must default to empty array");
}

if (exists("src/data/reported-guides.ts")) {
  const reported = read("src/data/reported-guides.ts");
  if (reported.includes("verifiedActiveCodes")) violations.push("reported guide data must not define verified active codes");
  if (!reported.includes("community-reported")) violations.push("reported guide data must label community-reported content");
  if (!reported.includes("not independently verified")) violations.push("reported guide data must state not independently verified");
}

if (exists("public/icon.svg") && !read("public/icon.svg").includes("<svg")) violations.push("public/icon.svg must be a real SVG file");
if (exists("public/hero-placeholder.svg") && !read("public/hero-placeholder.svg").includes("<svg")) violations.push("public/hero-placeholder.svg must be a real SVG file");

const forbiddenContent = [
  "Wizard Alchemy",
  "Build A Ring Farm",
  "Noob Tower Defense",
  "next/image",
  "getServerSideProps",
  "runtime ="
];

const scannedFiles = [
  "src/data/config.ts",
  "src/data/game.ts",
  "src/data/reported-guides.ts",
  "src/content/home.ts",
  "src/lib/navigation.ts",
  "src/pages/index.astro",
  "src/pages/codes.astro",
  "src/pages/guide.astro",
  "src/pages/tier-list.astro",
  "src/pages/classes.astro",
  "src/pages/updates.astro",
  "README.md"
];

for (const file of scannedFiles) {
  if (!exists(file)) continue;
  const text = read(file);
  for (const needle of forbiddenContent) {
    if (text.includes(needle)) violations.push(`Forbidden content '${needle}' found in ${file}`);
  }
}

if (violations.length > 0) {
  console.error("Template validation failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Template validation passed.");
