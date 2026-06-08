import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const wikiFiles = [
  "src/pages/codes.astro",
  "src/pages/tier-list.astro",
  "src/pages/classes.astro",
  "src/pages/weapons.astro",
  "src/pages/value-list.astro"
];

const wikiSlugs = ["codes", "tier-list", "classes", "weapons", "value-list"];

const requiredFiles = [
  "astro.config.mjs",
  "src/data/reported-guides.ts",
  "src/content/system-pages.ts",
  "src/lib/navigation.ts",
  "src/lib/analytics.ts",
  "src/components/TrackedLink.astro",
  "src/components/CopyButton.astro",
  "src/components/ToolEventTracker.astro",
  "src/components/RelatedGuides.astro",
  "docs/ANALYTICS_EVENTS.md",
  "src/pages/index.astro",
  "src/pages/about.astro",
  "src/pages/contact.astro",
  "src/pages/editorial-policy.astro",
  "src/pages/privacy.astro",
  "src/pages/terms.astro",
  "src/layouts/SiteLayout.astro",
  "src/components/Header.astro",
  "scripts/generate-favicons.mjs",
  "scripts/generate-seo-files.mjs",
  "scripts/validate-static-export.mjs",
  "scripts/init-new-site.mjs",
  "public/icon.svg",
  "public/hero-placeholder.svg",
  ...wikiFiles
];

test("required Astro wiki hub template files exist", () => {
  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(file), true, `${file} should exist`);
  }
});

test("package scripts include favicon generation, initialization, and validation chain", () => {
  const packageJson = JSON.parse(read("package.json"));

  assert.ok(packageJson.scripts.build.includes("generate-favicons.mjs"));
  assert.equal(packageJson.scripts["init:new-site"], "node scripts/init-new-site.mjs");
  assert.ok(packageJson.scripts.check.includes("audit:new-site"));
  assert.ok(packageJson.scripts.check.includes("validate:static-export"));
});

test("template defaults to wiki-hub launch mode", () => {
  const config = read("src/data/config.ts");

  assert.ok(config.includes('launchMode: "wiki-hub"'));
  assert.ok(config.includes('completedLocales: ["en"]'));
  assert.ok(config.includes('availableLocales: ["en", "th", "fil", "id"]'));
  assert.ok(config.includes('completedCoreSlugs: ["", "codes", "tier-list", "classes", "weapons", "value-list"]'));
  assert.ok(config.includes('navigationSlugs: ["", "codes", "tier-list", "classes", "weapons", "value-list"]'));
  assert.ok(config.includes('iconTheme: "default"'));
  assert.ok(config.includes('brandColor: "#17241f"'));
  assert.ok(config.includes('accentColor: "#facc15"'));
  assert.ok(config.includes("completedEnglishOnlySlugs: []"));
  assert.ok(config.includes('systemSlugs: ["about", "contact", "editorial-policy"]'));
  assert.ok(config.includes("publisher:"));
  assert.ok(config.includes("systemPages:"));
});

test("navigation exposes wiki hub links and language candidates", () => {
  const navigation = read("src/lib/navigation.ts");
  const header = read("src/components/Header.astro");

  for (const label of ["Codes", "Tier List", "Classes", "Weapons", "Value List", "English", "Thai", "Filipino", "Indonesian"]) {
    assert.ok(navigation.includes(label), `navigation must include ${label}`);
  }

  for (const removed of ["Guide", "Updates"]) {
    assert.equal(navigation.includes(removed), false, `navigation must not include ${removed}`);
  }

  assert.ok(header.includes("getMainNavItems"));
  assert.ok(header.includes("getAvailableLocales"));
  assert.ok(header.includes("Language"));
});

test("pillar page links directly to every cluster page", () => {
  const index = read("src/pages/index.astro");
  const home = read("src/content/home.ts");

  assert.ok(index.includes("completedGuideLinks"));
  assert.ok(index.includes("Core guide entrances"));

  for (const slug of wikiSlugs) {
    assert.ok(home.includes(`slug: "${slug}"`), `home wikiLinks must include ${slug}`);
  }
});

test("cluster pages link back to hub and related cluster pages", () => {
  const related = read("src/components/RelatedGuides.astro");

  assert.ok(related.includes('href="/"'));
  assert.ok(related.includes("three-click rule"));
  assert.ok(related.includes("wikiLinks"));

  for (const slug of wikiSlugs) {
    const page = read(`src/pages/${slug}.astro`);
    assert.ok(page.includes("RelatedGuides"), `${slug} must include RelatedGuides`);
    assert.ok(page.includes(`currentSlug="${slug}"`), `${slug} must pass currentSlug`);
  }
});

test("init-new-site supports minimal, wiki-hub, and themed icon options", () => {
  const script = read("scripts/init-new-site.mjs");

  assert.ok(script.includes("--launch-mode minimal"));
  assert.ok(script.includes("--launch-mode wiki-hub"));
  assert.ok(script.includes("--icon-theme"));
  assert.ok(script.includes("--brand-color"));
  assert.ok(script.includes("--accent-color"));
  assert.ok(script.includes("magic"));
  assert.ok(script.includes("farm"));
  assert.ok(script.includes("combat"));
  assert.ok(script.includes("completedCoreSlugs"));
  assert.ok(script.includes('systemSlugs: ["about", "contact", "editorial-policy"]'));
  assert.ok(script.includes("publisher:"));
  assert.ok(script.includes("systemPages:"));
  assert.ok(script.includes('availableLocales: ["en", "th", "fil", "id"]'));
});

test("themed favicon generator reads config and creates required assets", () => {
  const script = read("scripts/generate-favicons.mjs");

  for (const value of ["iconTheme", "brandColor", "accentColor", "gameInitials", "site.webmanifest", "favicon.svg", "icon-512.png", "apple-touch-icon.png"]) {
    assert.ok(script.includes(value), `generate-favicons must include ${value}`);
  }

  for (const theme of ["default", "magic", "farm", "anime", "combat", "racing", "simulator"]) {
    assert.ok(script.includes(theme), `generate-favicons must support ${theme}`);
  }
});

test("system pages are noindex and not sitemap routes", () => {
  const privacy = read("src/pages/privacy.astro");
  const terms = read("src/pages/terms.astro");
  const generator = read("scripts/generate-seo-files.mjs");

  assert.ok(privacy.includes("noindex"));
  assert.ok(terms.includes("noindex"));
  assert.ok(privacy.includes("systemPageContent"));
  assert.ok(terms.includes("systemPageContent"));
  assert.equal(generator.includes("/privacy/"), false);
  assert.equal(generator.includes("/terms/"), false);
});

test("AdSense readiness system pages exist and are wired through content", () => {
  const systemPages = read("src/content/system-pages.ts");

  for (const key of ["about", "contact", "editorialPolicy", "privacy", "terms"]) {
    assert.ok(systemPages.includes(`${key}:`), `systemPageContent must include ${key}`);
  }

  for (const file of ["src/pages/about.astro", "src/pages/contact.astro", "src/pages/editorial-policy.astro", "src/pages/privacy.astro", "src/pages/terms.astro"]) {
    assert.ok(read(file).includes("systemPageContent"), `${file} must read systemPageContent`);
  }
});

test("footer links to AdSense readiness pages", () => {
  const footer = read("src/components/Footer.astro");

  for (const fragment of ['href="/about/"', 'href="/contact/"', 'href="/privacy/"', 'href="/terms/"', 'href="/editorial-policy/"']) {
    assert.ok(footer.includes(fragment), `Footer must include ${fragment}`);
  }

  for (const label of ["About", "Contact", "Privacy", "Terms", "Editorial Policy"]) {
    assert.ok(footer.includes(`>${label}<`), `Footer must include ${label}`);
  }
});

test("system page content avoids unsafe placeholders and fake certainty", () => {
  const systemPages = read("src/content/system-pages.ts");

  for (const forbidden of ["Your Company Name", "Lorem ipsum", "TODO", "TBD", "Coming soon", "Replace this"]) {
    assert.equal(systemPages.includes(forbidden), false, `system pages must not include ${forbidden}`);
  }

  for (const phrase of ["Roblox passwords", "payment information", "identity documents"]) {
    assert.ok(systemPages.includes(phrase), `system pages must mention ${phrase}`);
  }

  for (const label of ["verified", "community-reported", "pending"]) {
    assert.ok(systemPages.includes(label), `editorial policy must mention ${label}`);
  }
});

test("completed and allowed system slugs drive sitemap and static export validation", () => {
  const generator = read("scripts/generate-seo-files.mjs");
  const validator = read("scripts/validate-static-export.mjs");

  assert.ok(generator.includes("completedCoreSlugs"));
  assert.ok(generator.includes("completedEnglishOnlySlugs"));
  assert.ok(generator.includes("systemSlugs"));
  assert.ok(validator.includes("completedCoreSlugs"));
  assert.ok(validator.includes("systemSlugs"));
  assert.ok(validator.includes("sitemap URL count must equal completed and allowed system slug count"));
  assert.ok(validator.includes('"privacy", "terms"'));
});

test("allowed system pages enter sitemap and forbidden routes stay excluded", () => {
  const generator = read("scripts/generate-seo-files.mjs");
  const validator = read("scripts/validate-static-export.mjs");

  for (const slug of ["about", "contact", "editorial-policy"]) {
    assert.ok(validator.includes(slug), `${slug} must be required in sitemap validation`);
  }

  for (const slug of ["privacy", "terms", "guide", "updates", "scripts", "macros", "executor", "exploit", "th", "fil", "id"]) {
    assert.ok(generator.includes(`"${slug}"`), `generator must explicitly exclude ${slug}`);
    assert.ok(validator.includes(`/${slug}/`), `validator must reject ${slug} sitemap output`);
  }
});

test("unsafe pages and removed legacy pages are not generated", () => {
  for (const file of [
    "src/pages/scripts.astro",
    "src/pages/macros.astro",
    "src/pages/executor.astro",
    "src/pages/exploit.astro",
    "src/pages/guide.astro",
    "src/pages/updates.astro"
  ]) {
    assert.equal(fs.existsSync(file), false, `${file} must not exist by default`);
  }

  const config = read("src/data/config.ts");
  for (const slug of ["scripts", "macros", "executor", "exploit"]) {
    assert.ok(config.includes(slug), `blockedSlugs must include ${slug}`);
  }
});

test("unfinished locales are candidates but not generated by default", () => {
  for (const file of ["src/pages/th.astro", "src/pages/fil.astro", "src/pages/id.astro"]) {
    assert.equal(fs.existsSync(file), false, `${file} must not exist until locale is completed`);
  }

  const config = read("src/data/config.ts");
  assert.ok(config.includes('availableLocales: ["en", "th", "fil", "id"]'));
  assert.ok(config.includes('completedLocales: ["en"]'));
});

test("active codes are not verified by default", () => {
  const game = read("src/data/game.ts");
  const reported = read("src/data/reported-guides.ts");
  const codesPage = read("src/pages/codes.astro");

  assert.ok(game.includes("verifiedActiveCodes: []"));
  assert.ok(reported.includes("community-reported"));
  assert.ok(reported.includes("not independently verified"));
  assert.ok(codesPage.includes("Community-reported"));
  assert.equal(reported.includes("verifiedActiveCodes"), false);
});

test("init-new-site documents required arguments and optional Roblox metadata", () => {
  const script = read("scripts/init-new-site.mjs");

  for (const flag of ["--site-name", "--game-name", "--domain", "--contact-email", "--roblox-url", "--universe-id", "--root-place-id", "--max-players", "--official-title", "--genre"]) {
    assert.ok(script.includes(flag), `init script must mention ${flag}`);
  }

  assert.ok(script.includes("astro.config.mjs"));
  assert.ok(script.includes("packageJson.name"));
  assert.ok(script.includes("src/data/config.ts"));
  assert.ok(script.includes("src/data/game.ts"));
  assert.ok(script.includes("src/content/home.ts"));
});

test("GA4 analytics helper exposes safe default events and wrappers", () => {
  const analytics = read("src/lib/analytics.ts");

  for (const name of ["copy_action", "outbound_link_click", "tool_input_change", "tool_result_view", "related_guide_click"]) {
    assert.ok(analytics.includes(name), `analytics helper must include ${name}`);
  }

  for (const fn of ["trackEvent", "trackCopyEvent", "trackOutboundClick", "trackToolInputChange", "trackToolResultView", "debounce"]) {
    assert.ok(analytics.includes(`function ${fn}`), `analytics helper must export ${fn}`);
  }

  assert.ok(analytics.includes("import.meta.env.PROD"));
  assert.ok(analytics.includes("typeof window"));
  assert.ok(analytics.includes("window.gtag"));
  assert.ok(analytics.includes("console.debug"));
});

test("GA4 analytics blocks unsupported and private-looking parameters", () => {
  const analytics = read("src/lib/analytics.ts");

  for (const key of ["page_path", "event_source", "item_type", "item_name", "link_url", "tool_name", "field_name"]) {
    assert.ok(analytics.includes(key), `analytics params must support ${key}`);
  }

  for (const forbidden of ["password", "phone", "email", "username", "token", "secret"]) {
    assert.ok(analytics.includes(forbidden), `analytics helper must guard ${forbidden}`);
  }
});

test("tracked components use default analytics events without blocking behavior", () => {
  const trackedLink = read("src/components/TrackedLink.astro");
  const copyButton = read("src/components/CopyButton.astro");
  const toolTracker = read("src/components/ToolEventTracker.astro");
  const docs = read("docs/ANALYTICS_EVENTS.md");

  assert.ok(trackedLink.includes("outbound_link_click"));
  assert.ok(trackedLink.includes("noopener noreferrer"));
  assert.ok(copyButton.includes("copy_action"));
  assert.ok(copyButton.includes("navigator.clipboard.writeText"));
  assert.ok(toolTracker.includes("tool_input_change"));
  assert.ok(toolTracker.includes("tool_result_view"));
  assert.ok(toolTracker.includes("debounceMs = 1000"));
  assert.ok(docs.includes("GA4"));
  assert.ok(docs.includes("Reports > Engagement > Events"));
});
