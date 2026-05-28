import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "src/data/config.ts");
const gamePath = path.join(root, "src/data/game.ts");
const violations = [];
const warnings = [];
const wikiHubSlugs = ["", "codes", "tier-list", "classes", "weapons", "value-list"];

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
  const completedLocales = extractArray(config, "completedLocales");
  const coreSlugs = extractArray(config, "coreSlugs");
  const completedCoreSlugs = extractArray(config, "completedCoreSlugs");
  const completedEnglishOnlySlugs = extractArray(config, "completedEnglishOnlySlugs");
  const blockedSlugs = extractArray(config, "blockedSlugs");
  const icon = extractString(config, "icon");
  const hero = extractString(config, "hero");

  if (siteName === "Example Game Guide") reportLaunchIssue("siteName must be replaced before launch");
  if (gameName === "Example Roblox Game") reportLaunchIssue("gameName must be replaced before launch");
  if (siteDomain === "https://example.com") reportLaunchIssue("siteDomain must be replaced before launch");
  if (contactEmail === "example@example.com") reportLaunchIssue("contactEmail must be replaced before launch");
  if (primaryKeyword === "Example Roblox Game guide") reportLaunchIssue("primaryKeyword must be replaced before launch");
  if (!siteDomain.startsWith("https://")) violations.push("siteDomain must start with https://");
  if (completedLocales.join(",") !== "en") violations.push("completedLocales must be [en] by default");
  if (!["minimal", "wiki-hub"].includes(launchMode)) violations.push("launchMode must be minimal or wiki-hub");
  if (!completedCoreSlugs.every((slug) => coreSlugs.includes(slug))) violations.push("completedCoreSlugs must be a subset of coreSlugs");
  if (completedEnglishOnlySlugs.length !== 0) violations.push("completedEnglishOnlySlugs must be empty by default");
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
