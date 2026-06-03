# Roblox Guide Site Template Astro

Astro + Cloudflare Pages Roblox wiki hub template.

This repository is a lightweight static-site template for new Roblox guide sites. It uses static output and deploys to Cloudflare Pages with `dist/`.

## Default navigation

The default navigation is configuration-driven:

```text
Home
Codes
Tier List
Classes
Weapons
Value List
Language
```

Language candidates are:

```text
English
Thai
Filipino
Indonesian
```

Only English is completed by default. Thai, Filipino, and Indonesian are language candidates only. They must not generate pages or enter sitemap until localized content is completed.

## Launch modes

### minimal

Publishes only:

```text
/
/privacy/
/terms/
```

### wiki-hub

Publishes:

```text
/
/codes/
/tier-list/
/classes/
/weapons/
/value-list/
/privacy/
/terms/
```

Privacy and terms are exported but excluded from sitemap.

## Evidence policy

Use three labels:

```text
verified
community-reported
pending
```

Verified content requires official Roblox page, Roblox public API, official channel, or in-game proof.

Community-reported content is only a research signal and must not be presented as verified.

Do not invent active codes, rewards, class stats, weapon stats, rankings, value rows, or official claims.

## GA4 event tracking

This template includes a minimal GA4 event helper for reusable event tracking.

Default template event names:

```text
copy_action
outbound_link_click
tool_input_change
tool_result_view
related_guide_click
```

Reusable files:

```text
src/lib/analytics.ts
src/components/TrackedLink.astro
src/components/CopyButton.astro
src/components/ToolEventTracker.astro
docs/ANALYTICS_EVENTS.md
```

Privacy rule: do not send email addresses, usernames, IP addresses, phone numbers, passwords, account data, or raw private user input to GA4.

The helper only sends real events in production. In local development it uses `console.debug`. If `window.gtag` does not exist, no error is thrown.

## Static SEO files

The build generates English-named static files:

```text
sitemap.xml
robots.txt
llms.txt
llms-full.txt
```

These files are written to `dist/` during `npm run build`.

## Create a new site

### Minimal launch

```bash
npm install
npm run init:new-site -- \
  --site-name "Example Game Guide" \
  --game-name "Example Game" \
  --domain "https://example.com" \
  --contact-email "admin@example.com" \
  --roblox-url "https://www.roblox.com/games/123/example" \
  --launch-mode minimal
```

### Wiki hub launch

```bash
npm install
npm run init:new-site -- \
  --site-name "Example Game Guide" \
  --game-name "Example Game" \
  --domain "https://example.com" \
  --contact-email "admin@example.com" \
  --roblox-url "https://www.roblox.com/games/123/example" \
  --launch-mode wiki-hub
```

Optional arguments:

```text
--primary-keyword "Example Game guide"
--creator-name "Example Creator"
--universe-id "123456"
--root-place-id "123456"
--max-players "12"
--official-title "Example Game"
--genre "Adventure"
```

The initialization script updates:

```text
src/data/config.ts
src/data/game.ts
src/content/home.ts
astro.config.mjs
package.json name
```

## Required checks

Run before deployment:

```bash
npm run validate:template
npm test
npm run build
npm run validate:static-export
npm run check
```

## Cloudflare Pages

Use these settings:

```text
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Node.js version: 20 or 22
```
