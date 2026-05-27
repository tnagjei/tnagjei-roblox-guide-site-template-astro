import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const requiredFiles = [
  "astro.config.mjs",
  "src/pages/index.astro",
  "src/pages/privacy.astro",
  "src/pages/terms.astro",
  "src/layouts/SiteLayout.astro",
  "scripts/generate-seo-files.mjs",
  "scripts/validate-static-export.mjs",
  "public/icon.svg",
  "public/hero-placeholder.svg"
];

test("required Astro template files exist", () => {
  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(file), true, `${file} should exist`);
  }
});

test("template defaults expose only homepage as completed public route", () => {
  const config = read("src/data/config.ts");

  assert.ok(config.includes('completedLocales: ["en"]'));
  assert.ok(config.includes('completedCoreSlugs: [""]'));
  assert.ok(config.includes("completedEnglishOnlySlugs: []"));
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

test("static export validator checks sitemap and robots files", () => {
  const validator = read("scripts/validate-static-export.mjs");

  assert.ok(validator.includes("dist/sitemap.xml") || validator.includes("sitemap.xml"));
  assert.ok(validator.includes("dist/robots.txt") || validator.includes("robots.txt"));
  assert.ok(validator.includes("Googlebot"));
  assert.ok(validator.includes("Bingbot"));
  assert.ok(validator.includes("AdsBot-Google"));
});
