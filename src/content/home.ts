import { siteConfig } from "../data/config";

export const wikiLinks = [
  { title: "Codes", slug: "codes", description: "Track official and community-reported code status without inventing active rewards." },
  { title: "Guide", slug: "guide", description: "Map beginner steps, core loop notes, and verified gameplay routes." },
  { title: "Tier List", slug: "tier-list", description: "Compare community-reported rankings without presenting them as official." },
  { title: "Classes", slug: "classes", description: "Map reported class roles and evidence status." },
  { title: "Updates", slug: "updates", description: "Separate official updates from community-reported observations." }
];

export const homeContent = {
  title: `${siteConfig.siteName} | Roblox Wiki Hub`,
  description: `${siteConfig.siteName} is an evidence-first Roblox wiki hub template for codes, guide, tier list, classes, and updates.`,
  hero: {
    eyebrow: "Roblox wiki hub template",
    title: `${siteConfig.gameName} Wiki Hub`,
    lede: "Launch a fast Roblox guide hub with clear evidence boundaries. Community-reported information is labeled as unverified until official, Roblox API, or in-game proof exists.",
    primaryAction: "Open Roblox page"
  },
  quickFacts: [
    { label: "Evidence policy", value: "Verified / community-reported / pending" },
    { label: "Default language", value: "English" },
    { label: "Language candidates", value: "English, Thai, Filipino, Indonesian" }
  ],
  trendingSearches: [
    `${siteConfig.gameName} codes`,
    `${siteConfig.gameName} guide`,
    `${siteConfig.gameName} tier list`,
    `${siteConfig.gameName} classes`,
    `${siteConfig.gameName} updates`
  ],
  wikiLinks,
  guideMap: [
    { step: "1", title: "Collect sources", body: "Start from the Roblox page, official channels, public API data, and in-game checks." },
    { step: "2", title: "Label evidence", body: "Separate verified facts from community-reported and pending notes." },
    { step: "3", title: "Publish only completed pages", body: "Pages enter sitemap only after completedCoreSlugs includes them." }
  ],
  faq: [
    { q: "Are community-reported codes verified?", a: "No. They are research signals until independently confirmed." },
    { q: "Can this template publish translated pages immediately?", a: "No. A locale enters sitemap only after completedLocales includes it and localized content is ready." }
  ]
};
