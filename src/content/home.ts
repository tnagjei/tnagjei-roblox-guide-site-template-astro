import { siteConfig } from "../data/config";

export const wikiLinks = [
  { title: "Codes", slug: "codes", description: "Track official and community-reported code status without inventing active rewards." },
  { title: "Tier List", slug: "tier-list", description: "Compare community-reported rankings without presenting them as official." },
  { title: "Classes", slug: "classes", description: "Map reported class roles and evidence status." },
  { title: "Weapons", slug: "weapons", description: "Organize reported weapons without fake stats, DPS, or rarity claims." },
  { title: "Value List", slug: "value-list", description: "Record reported value priority without fabricating trading prices or odds." }
];

export const homeContent = {
  title: `${siteConfig.siteName} | Roblox Wiki Hub`,
  description: `${siteConfig.siteName} is an evidence-first Roblox wiki hub template for codes, tier lists, classes, weapons, and value tracking.`,
  hero: {
    eyebrow: "Roblox wiki hub template",
    title: `${siteConfig.gameName} Wiki Hub`,
    lede: "Launch a fast Roblox guide hub with clear evidence boundaries. Community-reported information is labeled as unverified until official, Roblox API, or in-game proof exists.",
    primaryAction: "Open Roblox page"
  },
  quickFacts: [
    { label: "Evidence policy", value: "Verified / community-reported / pending" },
    { label: "Default language", value: "English" },
    { label: "Click depth", value: "Core wiki pages stay within three clicks" }
  ],
  trendingSearches: [
    `${siteConfig.gameName} codes`,
    `${siteConfig.gameName} tier list`,
    `${siteConfig.gameName} classes`,
    `${siteConfig.gameName} weapons`,
    `${siteConfig.gameName} value list`
  ],
  wikiLinks,
  guideMap: [
    { step: "1", title: "Start from the hub", body: "The homepage is the pillar page and links directly to every completed cluster page." },
    { step: "2", title: "Move through clusters", body: "Each cluster page links back to the hub and to related cluster pages." },
    { step: "3", title: "Keep evidence labels visible", body: "Pages enter sitemap only after completedCoreSlugs includes them and evidence boundaries are present." }
  ],
  faq: [
    { q: "Are community-reported codes verified?", a: "No. They are research signals until independently confirmed." },
    { q: "Can the wiki hub add more pages?", a: "Yes, but every public cluster page must stay linked from the hub and remain within three clicks." }
  ]
};
