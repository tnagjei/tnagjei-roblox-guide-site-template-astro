export const evidenceNotice = {
  title: "Evidence boundaries",
  body: "This template separates verified evidence from community-reported and pending information. Third-party pages are research signals only. Do not present active codes, class tiers, weapon stats, or value rows as verified unless official, Roblox API, or in-game proof exists.",
  verifiedLabel: "Verified: official Roblox page, Roblox public API, official channel, or in-game proof.",
  communityReportedLabel: "Community-reported, not independently verified.",
  pendingLabel: "Pending: not enough evidence yet."
};

export const competitorSources = [
  {
    label: "Competitor wiki or guide page",
    url: "",
    evidenceLevel: "community-reported",
    note: "Research signal only. Do not copy claims without independent verification."
  }
];

export const reportedCodeRows = [
  {
    code: "PLACEHOLDER-CODE",
    reward: "Unknown reward",
    status: "community-reported",
    sourceLabel: "Community-reported, not independently verified",
    lastChecked: "pending"
  }
];

export const reportedClassTiers = [
  {
    tier: "S",
    items: ["Placeholder class"],
    status: "community-reported",
    sourceLabel: "Community-reported, not independently verified"
  }
];

export const reportedClasses = [
  {
    name: "Placeholder class",
    role: "Unknown role",
    status: "community-reported",
    sourceLabel: "Community-reported, not independently verified",
    note: "Replace only after in-game or official evidence review."
  }
];

export const reportedWeapons = [
  {
    name: "Placeholder weapon",
    category: "Unknown category",
    status: "community-reported",
    sourceLabel: "Community-reported, not independently verified",
    note: "No verified damage, DPS, rarity, or drop data by default."
  }
];

export const reportedValueRows = [
  {
    item: "Placeholder item",
    priority: "Research only",
    status: "community-reported",
    sourceLabel: "Community-reported, not independently verified",
    note: "Do not present as verified trading value, DPS, crate odds, or market price."
  }
];
