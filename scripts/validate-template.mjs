import fs from "node:fs";

const requiredFiles = [
  "astro.config.mjs",
  "package.json",
  "src/pages/index.astro",
  "scripts/generate-seo-files.mjs"
];

const missing = requiredFiles.filter((file) => !fs.existsSync(file));

if (missing.length > 0) {
  console.error("Missing required template files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("Template validation passed.");
