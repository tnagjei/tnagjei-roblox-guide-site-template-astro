import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const violations = [];

const requiredFiles = [
  "astro.config.mjs",
  "package.json",
  "src/data/config.ts",
  "src/data/game.ts",
  "src/content/home.ts",
  "src/pages/index.astro",
  "src/pages/privacy.astro",
  "src/pages/terms.astro",
  "src/layouts/SiteLayout.astro",
  "scripts/generate-seo-files.mjs",
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
  "vercel.json"
];

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
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
  if (packageJson.scripts?.build !== "astro build && node scripts/generate-seo-files.mjs") {
    violations.push("build script must be: astro build && node scripts/generate-seo-files.mjs");
  }
  if (!packageJson.scripts?.check?.includes("validate:static-export")) {
    violations.push("check script must include validate:static-export");
  }
}

if (exists("astro.config.mjs")) {
  const astroConfig = read("astro.config.mjs");
  if (!astroConfig.includes('output: "static"')) violations.push("astro.config.mjs must use output static");
  if (!astroConfig.includes('trailingSlash: "always"')) violations.push("astro.config.mjs must use trailingSlash always");
}

if (exists("public/icon.svg") && !read("public/icon.svg").includes("<svg")) {
  violations.push("public/icon.svg must be a real SVG file");
}

if (exists("public/hero-placeholder.svg") && !read("public/hero-placeholder.svg").includes("<svg")) {
  violations.push("public/hero-placeholder.svg must be a real SVG file");
}

const forbiddenContent = [
  "Wizard Alchemy",
  "Build A Ring Farm",
  "Noob Tower Defense",
  "next/image",
  "getServerSideProps",
  "runtime =",
  "middleware"
];

const scannedFiles = [
  "src/data/config.ts",
  "src/data/game.ts",
  "src/content/home.ts",
  "src/pages/index.astro",
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
