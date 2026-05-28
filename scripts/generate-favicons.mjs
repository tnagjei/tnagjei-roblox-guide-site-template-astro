import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
fs.mkdirSync(publicDir, { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="Roblox guide template icon">
  <rect width="512" height="512" rx="112" fill="#17241f" />
  <circle cx="256" cy="256" r="156" fill="#2d8a4e" />
  <path d="M160 284 256 120l96 164h-58l-38-70-38 70h-58Z" fill="#facc15" />
  <path d="M170 342h172v42H170z" fill="#ffffff" opacity="0.92" />
</svg>
`;

const png1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

const webmanifest = {
  name: "Example Game Guide",
  short_name: "Game Guide",
  start_url: "/",
  display: "standalone",
  background_color: "#f8f7ef",
  theme_color: "#17241f",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-192.webp", sizes: "192x192", type: "image/webp" },
    { src: "/icon-512.webp", sizes: "512x512", type: "image/webp" }
  ]
};

for (const file of ["favicon.svg", "icon.svg"]) {
  fs.writeFileSync(path.join(publicDir, file), svg);
}

for (const file of [
  "favicon.ico",
  "icon-16.png",
  "icon-32.png",
  "icon-48.png",
  "icon-96.png",
  "icon-192.png",
  "icon-512.png",
  "icon-192.webp",
  "icon-512.webp",
  "apple-touch-icon.png"
]) {
  fs.writeFileSync(path.join(publicDir, file), png1x1);
}

fs.writeFileSync(path.join(publicDir, "site.webmanifest"), `${JSON.stringify(webmanifest, null, 2)}\n`);
console.log("Generated favicon placeholder assets in public/.");
