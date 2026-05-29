import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const wikiFiles = [
  "src/pages/codes.astro",
  "src/pages/tier-list.astro",
  "src/pages/classes.astro",
  "src/pages/weapons.astro",
  "src/pages/value-list.astro"
];

const requiredFiles = [
  "astro.config.mjs",
  "src/data/reported-guides.ts",
  "src/pages/index.astro",
  "src/pages/privacy.astro",
  "src/pages/terms.astro",
  "src/layouts/SiteLayout.astro",
  "scripts/generate-favicons.mjs",
  "scripts/generate-seo-files.mjs",
  "scripts/validate-static-export.mjs",
  "scripts/init-new-site.mjs",
  "public/icon.svg",
  "public/hero-placeholder.svg",
  ...wikiFiles
];

test("required Astro wiki hub template files exist", () => {
  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(file), true, `${file} should exist`);
  }
});

test("package scripts include favicon generation, initialization, and validation chain", () => {
  const packageJson = JSON.parse(read("package.json"));

  assert.ok(packageJson.scripts.build.includes("generate-favicons.mjs"));
  assert.equal(packageJson.scripts["init:new-site"], "node scripts/init-new-site.mjs");
  assert.ok(packageJson.scripts.check.includes("audit:new-site"));
  assert.ok(packageJson.scripts.check.includes("validate:static-export"));
});

test("template defaults to wiki-hub launch mode", () => {
  const config = read("src/data/config.ts");

  assert.ok(config.includes('launchMode: "wiki-hub"'));
  assert.ok(config.includes('completedLocales: ["en"]'));
  assert.ok(config.includes('completedCoreSlugs: ["", "codes", "tier-list", "classes", "weapons", "value-list"]'));
  assert.ok(config.includes("completedEnglishOnlySlugs: []"));
});

test("init-new-site supports minimal and wiki-hub launch modes", () => {
  const script = read("scripts/init-new-site.mjs");

  assert.ok(script.includes("--launch-mode minimal"));
  assert.ok(script.includes("--launch-mode wiki-hub"));
  assert.ok(script.includes("removeWikiPagesForMinimal"));
  assert.ok(script.includes("completedCoreSlugs"));
});

test("system pages are noindex and not sitemap routes", () => {
  const privacy = read("src/pages/privacy.astro");
  const terms = read("src/pages/terms.astro");
  const generator = read("scripts/generate-seo-files.mjs");

  assert.ok(privacy.includes("noindex"));
  assert.ok(terms.includes("noindex"));
  assert.equal(generator.includes("/privacy/"), false);
  assert.equal(generator.includes("/terms/"), false);
});

test("completed slugs drive sitemap and static export validation", () => {
  const generator = read("scripts/generate-seo-files.mjs");
  const validator = read("scripts/validate-static-export.mjs");

  assert.ok(generator.includes("completedCoreSlugs"));
  assert.ok(generator.includes("completedEnglishOnlySlugs"));
  assert.ok(validator.includes("completedCoreSlugs"));
  assert.ok(validator.includes("sitemap URL count must equal completed slug count"));
});

test("unsafe script and exploit pages are blocked by default", () => {
  for (const file of ["src/pages/scripts.astro", "src/pages/macros.astro", "src/pages/executor.astro", "src/pages/exploit.astro"]) {
    assert.equal(fs.existsSync(file), false, `${file} must not exist by default`);
  }

  const config = read("src/data/config.ts");
  for (const slug of ["scripts", "macros", "executor", "exploit"]) {
    assert.ok(config.includes(slug), `blockedSlugs must include ${slug}`);
  }
});

test("active codes are not verified by default", () => {
  const game = read("src/data/game.ts");
  const reported = read("src/data/reported-guides.ts");
  const codesPage = read("src/pages/codes.astro");

  assert.ok(game.includes("verifiedActiveCodes: []"));
  assert.ok(reported.includes("community-reported"));
  assert.ok(reported.includes("not independently verified"));
  assert.ok(codesPage.includes("Community-reported"));
  assert.equal(reported.includes("verifiedActiveCodes"), false);
});

test("init-new-site documents required arguments and optional Roblox metadata", () => {
  const script = read("scripts/init-new-site.mjs");

  for (const flag of ["--site-name", "--game-name", "--domain", "--contact-email", "--roblox-url", "--universe-id", "--root-place-id", "--max-players", "--official-title", "--genre"]) {
    assert.ok(script.includes(flag), `init script must mention ${flag}`);
  }

  assert.ok(script.includes("astro.config.mjs"));
  assert.ok(script.includes("packageJson.name"));
  assert.ok(script.includes("src/data/config.ts"));
  assert.ok(script.includes("src/data/game.ts"));
  assert.ok(script.includes("src/content/home.ts"));
});
