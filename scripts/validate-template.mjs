import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const violations = [];
const wikiHubSlugs = ["", "codes", "tier-list", "classes", "weapons", "value-list"];
const expectedLocales = ["en", "th", "fil", "id"];
const allowedIconThemes = ["default", "magic", "farm", "anime", "combat", "racing", "simulator"];

const requiredFiles = [
  "astro.config.mjs",
  "package.json",
  "src/data/config.ts",
  "src/data/game.ts",
  "src/data/reported-guides.ts",
  "src/content/home.ts",
  "src/content/system-pages.ts",
  "src/lib/navigation.ts",
  "src/lib/analytics.ts",
  "src/pages/index.astro",
  "src/pages/about.astro",
  "src/pages/contact.astro",
  "src/pages/editorial-policy.astro",
  "src/pages/privacy.astro",
  "src/pages/terms.astro",
  "src/pages/codes.astro",
  "src/pages/tier-list.astro",
  "src/pages/classes.astro",
  "src/pages/weapons.astro",
  "src/pages/value-list.astro",
  "src/layouts/SiteLayout.astro",
  "src/components/Header.astro",
  "src/components/TrackedLink.astro",
  "src/components/CopyButton.astro",
  "src/components/ToolEventTracker.astro",
  "docs/ANALYTICS_EVENTS.md",
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
  "src/pages/guide.astro",
  "src/pages/updates.astro",
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
  const systemSlugs = extractArray(config, "systemSlugs");
  const iconTheme = extractString(config, "iconTheme");
  const brandColor = extractString(config, "brandColor");
  const accentColor = extractString(config, "accentColor");

  if (launchMode !== "wiki-hub") violations.push("template default launchMode must be wiki-hub");
  if (completedCoreSlugs.join(",") !== wikiHubSlugs.join(",")) violations.push("template default completedCoreSlugs must match wiki hub slugs");
  if (navigationSlugs.join(",") !== wikiHubSlugs.join(",")) violations.push("navigationSlugs must match wiki hub slugs");
  if (!completedCoreSlugs.every((slug) => coreSlugs.includes(slug))) violations.push("completedCoreSlugs must be a subset of coreSlugs");
  if (availableLocales.join(",") !== expectedLocales.join(",")) violations.push("availableLocales must be en, th, fil, id");
  if (completedLocales.join(",") !== "en") violations.push("completedLocales must default to en only");
  if (systemSlugs.join(",") !== "about,contact,editorial-policy") {
    violations.push("systemSlugs must be about, contact, and editorial-policy");
  }
  if (systemSlugs.includes("privacy") || systemSlugs.includes("terms")) {
    violations.push("systemSlugs must not include privacy or terms");
  }
  if (!config.includes("publisher:")) violations.push("config must include publisher settings");
  for (const flag of ["about: true", "contact: true", "privacy: true", "terms: true", "editorialPolicy: true"]) {
    if (!config.includes(flag)) violations.push(`systemPages must include ${flag}`);
  }
  if (!["scripts", "macros", "executor", "exploit"].every((slug) => blockedSlugs.includes(slug))) {
    violations.push("blockedSlugs must include scripts, macros, executor, exploit");
  }
  if (!allowedIconThemes.includes(iconTheme)) violations.push("assets.iconTheme must be a supported theme");
  if (!/^#[0-9a-fA-F]{6}$/.test(brandColor)) violations.push("assets.brandColor must be a hex color");
  if (!/^#[0-9a-fA-F]{6}$/.test(accentColor)) violations.push("assets.accentColor must be a hex color");
}

if (exists("src/content/system-pages.ts")) {
  const systemPages = read("src/content/system-pages.ts");
  for (const key of ["about", "contact", "editorialPolicy", "privacy", "terms"]) {
    if (!systemPages.includes(`${key}:`)) violations.push(`systemPageContent must include ${key}`);
  }
  for (const forbidden of ["Your Company Name", "Lorem ipsum", "TODO", "TBD", "Coming soon", "Replace this"]) {
    if (systemPages.includes(forbidden)) violations.push(`systemPageContent must not contain ${forbidden}`);
  }
}

for (const file of ["src/pages/about.astro", "src/pages/contact.astro", "src/pages/editorial-policy.astro", "src/pages/privacy.astro", "src/pages/terms.astro"]) {
  if (exists(file) && !read(file).includes("systemPageContent")) {
    violations.push(`${file} must read systemPageContent`);
  }
}

for (const file of ["src/pages/privacy.astro", "src/pages/terms.astro"]) {
  if (exists(file) && !read(file).includes("noindex")) {
    violations.push(`${file} must remain noindex`);
  }
}

if (exists("src/components/Footer.astro")) {
  const footer = read("src/components/Footer.astro");
  for (const [label, href] of [
    ["About", "/about/"],
    ["Contact", "/contact/"],
    ["Privacy", "/privacy/"],
    ["Terms", "/terms/"],
    ["Editorial Policy", "/editorial-policy/"]
  ]) {
    if (!footer.includes(`href="${href}"`) || !footer.includes(`>${label}<`)) {
      violations.push(`Footer must include ${label} link to ${href}`);
    }
  }
}

if (exists("src/lib/navigation.ts")) {
  const nav = read("src/lib/navigation.ts");
  for (const label of ["Codes", "Tier List", "Classes", "Weapons", "Value List", "English", "Thai", "Filipino", "Indonesian"]) {
    if (!nav.includes(label)) violations.push(`navigation must include ${label}`);
  }
  for (const label of ["Guide", "Updates"]) {
    if (nav.includes(label)) violations.push(`navigation must not include ${label}`);
  }
}

if (exists("src/data/game.ts")) {
  const game = read("src/data/game.ts");
  if (!game.includes("verifiedActiveCodes: []")) violations.push("verifiedActiveCodes must default to empty array");
  if (!game.includes("communityReportedCodes: []")) violations.push("communityReportedCodes must default to empty array");
}

if (exists("scripts/generate-favicons.mjs")) {
  const faviconScript = read("scripts/generate-favicons.mjs");
  for (const theme of allowedIconThemes) {
    if (!faviconScript.includes(theme)) violations.push(`generate-favicons must support icon theme ${theme}`);
  }
  if (!faviconScript.includes("site.webmanifest")) violations.push("generate-favicons must generate site.webmanifest");
  if (!faviconScript.includes("icon-512.png")) violations.push("generate-favicons must generate icon-512.png");
}

if (exists("src/data/reported-guides.ts")) {
  const reported = read("src/data/reported-guides.ts");
  if (reported.includes("verifiedActiveCodes")) violations.push("reported guide data must not define verified active codes");
  if (!reported.includes("community-reported")) violations.push("reported guide data must label community-reported content");
  if (!reported.includes("not independently verified")) violations.push("reported guide data must state not independently verified");
}

if (exists("src/lib/analytics.ts")) {
  const analytics = read("src/lib/analytics.ts");
  for (const fn of ["trackEvent", "trackCopyEvent", "trackOutboundClick", "trackToolInputChange", "trackToolResultView"]) {
    if (!analytics.includes(fn)) violations.push(`analytics helper must include ${fn}`);
  }
}

if (exists("scripts/generate-seo-files.mjs")) {
  const generator = read("scripts/generate-seo-files.mjs");
  if (!generator.includes("systemSlugs")) violations.push("generate-seo-files must include allowed systemSlugs");
  if (!generator.includes("excludedSitemapSlugs")) {
    violations.push("generate-seo-files must exclude privacy, terms, unsafe, locale, and legacy slugs");
  }
}

if (exists("scripts/validate-static-export.mjs")) {
  const validator = read("scripts/validate-static-export.mjs");
  if (!validator.includes("systemSlugs")) violations.push("validate-static-export must check allowed systemSlugs");
  for (const forbidden of ["/privacy/", "/terms/", "/guide/", "/updates/", "/scripts/", "/macros/", "/executor/", "/exploit/", "/th/", "/fil/", "/id/"]) {
    if (!validator.includes(forbidden)) violations.push(`validate-static-export must reject ${forbidden} in sitemap`);
  }
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
  "src/content/system-pages.ts",
  "src/lib/navigation.ts",
  "src/lib/analytics.ts",
  "src/components/Footer.astro",
  "src/pages/index.astro",
  "src/pages/about.astro",
  "src/pages/contact.astro",
  "src/pages/editorial-policy.astro",
  "src/pages/privacy.astro",
  "src/pages/terms.astro",
  "src/pages/codes.astro",
  "src/pages/tier-list.astro",
  "src/pages/classes.astro",
  "src/pages/weapons.astro",
  "src/pages/value-list.astro",
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
