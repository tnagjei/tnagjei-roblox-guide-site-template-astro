import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);

function parseArgs(items) {
  const result = {};
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = items[i + 1];
    if (!next || next.startsWith("--")) {
      result[key] = "true";
    } else {
      result[key] = next;
      i += 1;
    }
  }
  return result;
}

function usage() {
  return `Usage:\n  npm run init:new-site -- --site-name "Example Guide" --game-name "Example Game" --domain "https://example.com" --contact-email "admin@example.com" --roblox-url "https://www.roblox.com/games/123/example"\n\nRequired:\n  --site-name\n  --game-name\n  --domain\n  --contact-email\n  --roblox-url\n\nOptional:\n  --primary-keyword\n  --creator-name\n`;
}

function assertRequired(options, key) {
  if (!options[key] || options[key].trim() === "") {
    throw new Error(`Missing required argument: --${key}`);
  }
}

function assertHttpsUrl(label, value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`${label} must start with https://`);
  }
  return parsed.toString().replace(/\/+$/g, "");
}

function assertEmail(value) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
    throw new Error("--contact-email must be a valid email address");
  }
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), `${content.trim()}\n`);
}

function escapeTemplate(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

const options = parseArgs(args);

if (options.help === "true") {
  console.log(usage());
  process.exit(0);
}

try {
  for (const key of ["site-name", "game-name", "domain", "contact-email", "roblox-url"]) {
    assertRequired(options, key);
  }

  const siteName = options["site-name"].trim();
  const gameName = options["game-name"].trim();
  const siteDomain = assertHttpsUrl("--domain", options.domain.trim());
  const contactEmail = options["contact-email"].trim();
  const robloxUrl = assertHttpsUrl("--roblox-url", options["roblox-url"].trim());
  const primaryKeyword = (options["primary-keyword"] || `${gameName} guide`).trim();
  const creatorName = (options["creator-name"] || "Unknown creator").trim();

  assertEmail(contactEmail);

  write(
    "src/data/config.ts",
    `export const siteConfig = {
  siteName: "${siteName}",
  gameName: "${gameName}",
  siteDomain: "${siteDomain}",
  contactEmail: "${contactEmail}",
  primaryKeyword: "${primaryKeyword}",
  defaultLocale: "en",
  completedLocales: ["en"],
  coreSlugs: ["", "codes", "tier-list", "updates", "beginners-guide", "units"],
  completedCoreSlugs: [""],
  englishOnlySlugs: ["scripts", "value-list", "macros", "discord"],
  completedEnglishOnlySlugs: [],
  analytics: {
    googleAnalyticsId: "",
    adsenseClient: "",
    clarityId: "",
    thirdPartyAdScripts: []
  },
  assets: {
    icon: "/icon.svg",
    hero: "/hero-placeholder.svg"
  }
};`
  );

  write(
    "src/data/game.ts",
    `export const gameData = {
  robloxUrl: "${robloxUrl}",
  creatorName: "${creatorName}",
  universeId: null,
  sourceConfidence: [
    { label: "Roblox game page", level: "pending" },
    { label: "Official social links", level: "pending" },
    { label: "In-game checks", level: "pending" }
  ],
  codes: {
    verifiedActiveCodes: [],
    pendingCodes: [],
    communityReportedCodes: [],
    officialStatus: "No verified official codes yet",
    verificationPolicy: "Do not publish active codes without official or in-game proof."
  }
};`
  );

  write(
    "src/content/home.ts",
    `import { siteConfig } from "../data/config";

export const homeContent = {
  title: \`${escapeTemplate(siteName)} | Roblox Game Guide\`,
  description: \`${escapeTemplate(siteName)} is an evidence-first guide for ${escapeTemplate(gameName)} on Roblox.\`,
  hero: {
    eyebrow: "Independent Roblox guide",
    title: \`${escapeTemplate(gameName)} Guide\`,
    lede: "This site starts with verified source boundaries. Add codes, value lists, unit stats, and strategy pages only after evidence checks pass.",
    primaryAction: "Open Roblox page"
  },
  cards: [
    { title: "Evidence first", body: "Separate verified facts from pending claims before publishing guide pages." },
    { title: "Minimal launch", body: "Start with the homepage, privacy page, and terms page only." },
    { title: "Cloudflare-ready", body: "Build static files to dist/ and deploy with Cloudflare Pages." }
  ],
  faq: [
    { q: "Is this an official website?", a: "No. This is an independent fan guide unless official ownership is verified." },
    { q: "Can I publish active codes immediately?", a: "No. Active codes require official or in-game proof." }
  ]
};`
  );

  console.log("New Astro Roblox guide site initialized.");
  console.log(`- Site: ${siteName}`);
  console.log(`- Game: ${gameName}`);
  console.log(`- Domain: ${siteDomain}`);
  console.log("Next: run npm run check");
} catch (error) {
  console.error("init:new-site failed:");
  console.error(`- ${error.message}`);
  console.error(usage());
  process.exit(1);
}
