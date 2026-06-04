import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const publicDir = path.join(root, "public");
const configPath = path.join(root, "src/data/config.ts");
fs.mkdirSync(publicDir, { recursive: true });

function readConfigValue(source, key, fallback) {
  const match = source.match(new RegExp(`${key}:\\s*["']([^"']*)["']`, "m"));
  return match?.[1] || fallback;
}

function normalizeHex(value, fallback) {
  const trimmed = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toLowerCase() : fallback;
}

function gameInitials(name) {
  const words = String(name || "Game")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "GG";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function themeShape(theme, accentColor) {
  const shapes = {
    magic: `<path d="M256 96 288 214 408 214 310 284 348 400 256 330 164 400 202 284 104 214 224 214Z" fill="${accentColor}" />`,
    farm: `<path d="M118 330h276v78H118z" fill="${accentColor}" /><path d="M142 330 256 204l114 126H142Z" fill="${accentColor}" opacity="0.86" /><circle cx="256" cy="190" r="42" fill="#ffffff" opacity="0.8" />`,
    anime: `<path d="M256 112c88 0 160 64 160 144s-72 144-160 144S96 336 96 256s72-144 160-144Z" fill="${accentColor}" /><path d="M170 248c42-70 130-70 172 0-44-26-128-26-172 0Z" fill="#ffffff" opacity="0.86" />`,
    combat: `<path d="M150 386 350 126l38 38-200 260-38-38Z" fill="${accentColor}" /><path d="M124 166l38-38 226 226-38 38L124 166Z" fill="#ffffff" opacity="0.82" />`,
    racing: `<path d="M100 282c44-84 268-84 312 0v88H100v-88Z" fill="${accentColor}" /><circle cx="172" cy="372" r="36" fill="#ffffff" /><circle cx="340" cy="372" r="36" fill="#ffffff" />`,
    simulator: `<rect x="128" y="132" width="256" height="256" rx="46" fill="${accentColor}" /><circle cx="256" cy="260" r="82" fill="#ffffff" opacity="0.84" /><path d="M256 190v70l54 36" stroke="#17241f" stroke-width="34" stroke-linecap="round" fill="none" />`,
    default: `<path d="M160 284 256 120l96 164h-58l-38-70-38 70h-58Z" fill="${accentColor}" /><path d="M170 342h172v42H170z" fill="#ffffff" opacity="0.92" />`
  };

  return shapes[theme] || shapes.default;
}

function buildSvg({ siteName, gameName, theme, brandColor, accentColor }) {
  const initials = gameInitials(gameName);
  const safeTitle = `${siteName} icon`.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${safeTitle}">
  <rect width="512" height="512" rx="112" fill="${brandColor}" />
  <circle cx="256" cy="256" r="170" fill="#ffffff" opacity="0.08" />
  ${themeShape(theme, accentColor)}
  <rect x="154" y="360" width="204" height="70" rx="35" fill="${brandColor}" opacity="0.88" />
  <text x="256" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="800" fill="#ffffff">${initials}</text>
</svg>
`;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createPng(size, brandColor, accentColor) {
  const [br, bg, bb] = hexToRgb(brandColor);
  const [ar, ag, ab] = hexToRgb(accentColor);
  const raw = Buffer.alloc((size * 4 + 1) * size);

  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x += 1) {
      const dx = x - size / 2;
      const dy = y - size / 2;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const insideAccent = radius < size * 0.32;
      const offset = rowStart + 1 + x * 4;
      raw[offset] = insideAccent ? ar : br;
      raw[offset + 1] = insideAccent ? ag : bg;
      raw[offset + 2] = insideAccent ? ab : bb;
      raw[offset + 3] = 255;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([signature, pngChunk("IHDR", ihdr), pngChunk("IDAT", idat), pngChunk("IEND", Buffer.alloc(0))]);
}

const configSource = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf8") : "";
const siteName = readConfigValue(configSource, "siteName", "Example Game Guide");
const gameName = readConfigValue(configSource, "gameName", "Example Roblox Game");
const iconTheme = readConfigValue(configSource, "iconTheme", "default");
const brandColor = normalizeHex(readConfigValue(configSource, "brandColor", "#17241f"), "#17241f");
const accentColor = normalizeHex(readConfigValue(configSource, "accentColor", "#facc15"), "#facc15");

const svg = buildSvg({ siteName, gameName, theme: iconTheme, brandColor, accentColor });
const webmanifest = {
  name: siteName,
  short_name: gameName.slice(0, 24),
  start_url: "/",
  display: "standalone",
  background_color: brandColor,
  theme_color: brandColor,
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

for (const size of [16, 32, 48, 96, 192, 512]) {
  fs.writeFileSync(path.join(publicDir, `icon-${size}.png`), createPng(size, brandColor, accentColor));
}

fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), createPng(180, brandColor, accentColor));
fs.writeFileSync(path.join(publicDir, "favicon.ico"), createPng(32, brandColor, accentColor));
fs.writeFileSync(path.join(publicDir, "icon-192.webp"), createPng(192, brandColor, accentColor));
fs.writeFileSync(path.join(publicDir, "icon-512.webp"), createPng(512, brandColor, accentColor));
fs.writeFileSync(path.join(publicDir, "site.webmanifest"), `${JSON.stringify(webmanifest, null, 2)}\n`);

console.log(`Generated themed favicon assets in public/ using iconTheme=${iconTheme}.`);
