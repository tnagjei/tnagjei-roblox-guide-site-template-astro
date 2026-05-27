const warnings = [
  "Replace placeholder siteName before launch",
  "Replace placeholder domain before launch",
  "Verify sitemap.xml before launch"
];

console.log("New site audit checklist:");
console.log("- npm run check");
console.log("- Verify dist/sitemap.xml");
console.log("- Verify dist/robots.txt");
console.log("\nWarnings:");

for (const warning of warnings) {
  console.log(`- ${warning}`);
}
