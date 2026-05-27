import fs from "node:fs";
import path from "node:path";

const domain = "https://example.com";
const routes = ["/"];

const publicDir = path.join(process.cwd(), "public");
fs.mkdirSync(publicDir, { recursive: true });

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${domain}${route}</loc></url>`).join("\n")}\n</urlset>`;

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${domain}/sitemap.xml\n`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);

console.log(`Generated ${routes.length} sitemap route(s).`);
