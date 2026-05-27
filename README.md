# Roblox Guide Site Template Astro

Astro + Cloudflare Pages Roblox guide template.

This repository is a lightweight static-site template for new Roblox guide sites. It is not a Next.js template and does not use Vercel runtime features.

## Features

- Astro static output
- Cloudflare Pages ready
- Minimal default public surface
- Default public pages: `/`, `/privacy/`, `/terms/`
- Static sitemap.xml generation
- Static robots.txt generation
- Static llms.txt and llms-full.txt generation
- SEO-safe placeholder defaults
- Evidence-first Roblox guide workflow
- New-site initialization script
- GitHub Actions check on push and pull request

## Create a new site

After creating a repository from this template, run:

```bash
npm install
npm run init:new-site -- \
  --site-name "Example Game Guide" \
  --game-name "Example Game" \
  --domain "https://example.com" \
  --contact-email "admin@example.com" \
  --roblox-url "https://www.roblox.com/games/123/example"
```

Optional arguments:

```text
--primary-keyword "Example Game guide"
--creator-name "Example Creator"
```

The initialization script updates:

```text
src/data/config.ts
src/data/game.ts
src/content/home.ts
```

Then run:

```bash
npm run check
```

## New site required edits

Edit these files first:

```text
src/data/config.ts
src/data/game.ts
src/content/home.ts
public/icon.svg
public/hero-placeholder.svg
```

Required replacements before launch:

```text
siteName
gameName
siteDomain
contactEmail
primaryKeyword
Roblox official URL
homepage title
homepage description
icon asset
hero asset
```

Do not publish active codes, rewards, value data, official claims, or Discord links without source evidence.

## Local development

```bash
npm install
npm run dev
```

## Validation

Run before every commit and deployment:

```bash
npm run check
```

Expanded command chain:

```text
npm run audit:new-site
npm run validate:template
npm test
npm run build
npm run validate:static-export
```

## Default SEO surface

The default template only exposes the homepage in sitemap:

```text
/
```

System pages are exported but not listed in sitemap:

```text
/privacy/
/terms/
```

The default build must produce:

```text
dist/index.html
dist/privacy/index.html
dist/terms/index.html
dist/sitemap.xml
dist/robots.txt
dist/llms.txt
dist/llms-full.txt
```

## Cloudflare Pages

Use these settings:

```text
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Node.js version: 20 or 22
```

Do not use:

```text
next build
next start
Vercel runtime
Cloudflare Workers
Cloudflare Functions
```

## Launch checklist

1. Run `npm run init:new-site` with real game data.
2. Replace icon and hero assets.
3. Verify homepage metadata.
4. Verify `dist/sitemap.xml` contains only completed public pages.
5. Verify `dist/robots.txt` does not block Googlebot, Bingbot, or AdsBot-Google.
6. Run `npm run check`.
7. Deploy to Cloudflare Pages.
8. Test `/`, `/privacy/`, `/terms/`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`.
