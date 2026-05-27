import fs from "node:fs";

const required = [
  "dist/index.html",
  "dist/privacy/index.html",
  "dist/terms/index.html"
];

const missing = required.filter((file) => !fs.existsSync(file));

if (missing.length > 0) {
  console.error("Static export validation failed:");
  for (const file of missing) {
    console.error(`- Missing ${file}`);
  }
  process.exit(1);
}

console.log("Static export validation passed.");
