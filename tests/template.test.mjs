import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const requiredFiles = [
  "astro.config.mjs",
  "src/pages/index.astro",
  "src/layouts/SiteLayout.astro",
  "scripts/generate-seo-files.mjs"
];

test("required Astro template files exist", () => {
  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(file), true, `${file} should exist`);
  }
});
