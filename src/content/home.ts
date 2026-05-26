import { siteConfig } from "../data/config";

export const homeContent = {
  title: `${siteConfig.siteName} | Roblox Game Guide`,
  description: `${siteConfig.siteName} is a source-aware Roblox guide template for Cloudflare Pages and Astro.`,
  hero: {
    eyebrow: "Source-aware Roblox guide",
    title: `${siteConfig.gameName} Guide`,
    lede: "Replace this placeholder with verified game information from the Roblox page, official channels, and in-game checks. Do not invent codes, rewards, unit stats, values, or official claims.",
    primaryAction: "Open Roblox page"
  },
  cards: [
    { title: "Evidence first", body: "Publish verified facts separately from pending claims." },
    { title: "Minimal launch", body: "Start with the homepage, privacy page, and terms page only." },
    { title: "Cloudflare-ready", body: "Build static files to dist/ and deploy with Cloudflare Pages." }
  ],
  faq: [
    { q: "Is this an official website?", a: "No. This is an independent fan guide template unless official ownership is verified." },
    { q: "Can I publish active codes immediately?", a: "No. Active codes require official or in-game proof." }
  ]
};
