import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "src/data/config.ts");
const gamePath = path.join(root, "src/data/game.ts");
const violations = [];
const warnings = [];
const wikiHubSlugs = ["", "codes", "tier-list", "classes", "weapons", "value-list"];
const systemSlugs = ["about", "contact", "editorial-policy"];
const expectedLocales = ["en", "th", "fil", "id"];
const requiredSystemFiles = [
  "src/content/system-pages.ts",
  "src/pages/about.astro",
  "src/pages/contact.astro",
  "src/pages/editorial-policy.astro",
  "src/pages/privacy.astro",
  "src/pages/terms.astro"
];
const forbiddenDefaultPages = [
  "src/pages/guide.astro",
  "src/pages/updates.astro",
  "src/pages/scripts.astro",
  "src/pages/macros.astro",
  "src/pages/executor.astro",
  "src/pages/exploit.astro",
  "src/pages/th.astro",
  "src/pages/fil.astro",
  "src/pages/id.astro"
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function isTemplateRepository() {
  try {
    const packageJson = JSON.parse(read("package.json"));
    return packageJson.name === "roblox-guide-site-template-astro";
  } catch {
    return false;
  }
}

function reportLaunchIssue(message) {
  if (isTemplateRepository()) {
    warnings.push(`${message} (allowed in template repository only)`);
  } else {
    violations.push(message);
  }
}

function extractString(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*["']([^"']*)["']`, "m"));
  return match?.[1] || "";
}

function extractArray(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`, "m"));
  if (!match) return [];
  return Array.from(match[1].matchAll(/["']([^"']*)["']/g)).map((item) => item[1]);
}

function validateAsset(label, value) {
  if (!value) {
    violations.push(`${label} must be configured`);
    return;
  }

  if (value.startsWith("https://")) return;
  if (!value.startsWith("/")) {
    violations.push(`${label} must be a public absolute path or https URL`);
    return;
  }

  const publicPath = path.join(root, "public", value.replace(/^\/+/, ""));
  if (!fs.existsSync(publicPath)) {
    violations.push(`${label} points to missing public asset: ${value}`);
  }
}

if (!fs.existsSync(configPath)) {
  violations.push("Missing src/data/config.ts");
} else {
  const config = fs.readFileSync(configPath, "utf8");
  const siteName = extractString(config, "siteName");
  const gameName = extractString(config, "gameName");
  const siteDomain = extractString(config, "siteDomain");
  const contactEmail = extractString(config, "contactEmail");
  const primaryKeyword = extractString(config, "primaryKeyword");
  const launchMode = extractString(config, "launchMode");
  const availableLocales = extractArray(config, "availableLocales");
  const completedLocales = extractArray(config, "completedLocales");
  const coreSlugs = extractArray(config, "coreSlugs");
  const completedCoreSlugs = extractArray(config, "completedCoreSlugs");
  const completedEnglishOnlySlugs = extractArray(config, "completedEnglishOnlySlugs");
  const navigationSlugs = extractArray(config, "navigationSlugs");
  const blockedSlugs = extractArray(config, "blockedSlugs");
  const configuredSystemSlugs = extractArray(config, "systemSlugs");
  const publisherDisplayName = extractString(config, "displayName");
  const icon = extractString(config, "icon");
  const hero = extractString(config, "hero");

  if (siteName === "Example Game Guide") reportLaunchIssue("siteName must be replaced before launch");
  if (gameName === "Example Roblox Game") reportLaunchIssue("gameName must be replaced before launch");
  if (siteDomain === "https://example.com") reportLaunchIssue("siteDomain must be replaced before launch");
  if (contactEmail === "example@example.com") reportLaunchIssue("contactEmail must be replaced before launch");
  if (publisherDisplayName === "Example Publisher") reportLaunchIssue("publisher.displayName must be replaced before launch");
  if (primaryKeyword === "Example Roblox Game guide") reportLaunchIssue("primaryKeyword must be replaced before launch");
  if (!siteDomain.startsWith("https://")) violations.push("siteDomain must start with https://");
  if (availableLocales.join(",") !== expectedLocales.join(",")) violations.push("availableLocales must be en, th, fil, id");
  if (completedLocales.join(",") !== "en") violations.push("completedLocales must default to en only");
  if (!["minimal", "wiki-hub"].includes(launchMode)) violations.push("launchMode must be minimal or wiki-hub");
  if (!completedCoreSlugs.every((slug) => coreSlugs.includes(slug))) violations.push("completedCoreSlugs must be a subset of coreSlugs");
  if (completedEnglishOnlySlugs.length !== 0) violations.push("completedEnglishOnlySlugs must be empty by default");
  if (!navigationSlugs.every((slug) => coreSlugs.includes(slug))) violations.push("navigationSlugs must be a subset of coreSlugs");
  if (!navigationSlugs.every((slug) => wikiHubSlugs.includes(slug))) violations.push("navigationSlugs must use the wiki hub slugs only");
  if (configuredSystemSlugs.join(",") !== systemSlugs.join(",")) {
    violations.push("systemSlugs must be about, contact, and editorial-policy");
  }
  if (configuredSystemSlugs.includes("privacy") || configuredSystemSlugs.includes("terms")) {
    violations.push("privacy and terms must not be listed in systemSlugs");
  }
  for (const flag of ["about: true", "contact: true", "privacy: true", "terms: true", "editorialPolicy: true"]) {
    if (!config.includes(flag)) violations.push(`systemPages must include ${flag}`);
  }
  if (!["scripts", "macros", "executor", "exploit"].every((slug) => blockedSlugs.includes(slug))) {
    violations.push("blockedSlugs must include scripts, macros, executor, and exploit");
  }
  if (launchMode === "minimal" && completedCoreSlugs.join(",") !== "") violations.push("minimal mode must complete homepage only");
  if (launchMode === "wiki-hub" && completedCoreSlugs.join(",") !== wikiHubSlugs.join(",")) {
    violations.push("wiki-hub mode must complete homepage, codes, tier-list, classes, weapons, and value-list");
  }
  validateAsset("assets.icon", icon);
  validateAsset("assets.hero", hero);
}

for (const file of requiredSystemFiles) {
  if (!fs.existsSync(path.join(root, file))) violations.push(`Missing required system page file: ${file}`);
}

for (const file of forbiddenDefaultPages) {
  if (fs.existsSync(path.join(root, file))) violations.push(`Forbidden default page exists: ${file}`);
}

if (fs.existsSync(path.join(root, "src/components/Footer.astro"))) {
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

if (fs.existsSync(path.join(root, "src/content/system-pages.ts"))) {
  const systemPages = read("src/content/system-pages.ts");
  for (const key of ["about", "contact", "editorialPolicy", "privacy", "terms"]) {
    if (!systemPages.includes(`${key}:`)) violations.push(`systemPageContent must include ${key}`);
  }
  for (const forbidden of ["Your Company Name", "Lorem ipsum", "TODO", "TBD", "Coming soon", "Replace this"]) {
    if (systemPages.includes(forbidden)) violations.push(`system-pages content must not contain ${forbidden}`);
  }
}

if (fs.existsSync(gamePath)) {
  const game = fs.readFileSync(gamePath, "utf8");
  if (!game.includes("verifiedActiveCodes: []")) violations.push("verifiedActiveCodes must default to an empty array");
  if (!game.includes("communityReportedCodes: []")) violations.push("communityReportedCodes must default to an empty array");
}

console.log("New site audit checklist:");
console.log("- npm run check");
console.log("- Verify dist/sitemap.xml");
console.log("- Verify dist/robots.txt");

if (warnings.length > 0) {
  console.warn("\nNew site audit warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (violations.length > 0) {
  console.error("\nNew site audit failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("\nNew site audit passed.");
