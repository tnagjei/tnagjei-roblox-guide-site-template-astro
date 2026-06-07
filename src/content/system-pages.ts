import { siteConfig } from "../data/config";
import { gameData } from "../data/game";

export const systemPageContent = {
  about: {
    title: `About ${siteConfig.siteName}`,
    description: `Learn what ${siteConfig.siteName} is, how it handles Roblox guide information, and how evidence boundaries work.`,
    sections: [
      {
        heading: "What this site is",
        body: `${siteConfig.siteName} is an independent fan guide for ${siteConfig.gameName}. It is built to help players find structured information about codes, tier lists, classes, weapons, and value-list research without presenting unverified claims as facts.`
      },
      {
        heading: "Independent fan guide disclaimer",
        body: `${siteConfig.siteName} is not affiliated with Roblox Corporation or the developers of ${siteConfig.gameName}. Roblox trademarks, platform assets, and game assets belong to their respective owners.`
      },
      {
        heading: "How we handle game information",
        body: `The site separates verified information from community-reported and pending information. Official Roblox pages, public Roblox data, official channels, and in-game checks are treated as stronger evidence than third-party pages or player discussions.`
      },
      {
        heading: "Source and evidence boundaries",
        body: `Active codes, rewards, value rows, weapon stats, rankings, and official claims should not be published as verified unless supporting evidence exists. Community-reported information must stay clearly labeled.`
      },
      {
        heading: "Contact",
        body: `For corrections, source evidence, copyright questions, or general feedback, contact ${siteConfig.contactEmail}. ${siteConfig.publisher.responseTime}`
      }
    ]
  },
  contact: {
    title: "Contact",
    description: `Contact ${siteConfig.siteName} for corrections, evidence submissions, copyright issues, or general feedback.`,
    sections: [
      {
        heading: "General contact",
        body: `You can contact the publisher at ${siteConfig.contactEmail}. ${siteConfig.publisher.responseTime}`
      },
      {
        heading: "Corrections and source evidence",
        body: `Send corrections with source context when possible, such as an official Roblox page, official channel, public Roblox data, or a clear in-game check. Third-party guide pages are treated as research signals, not verified proof.`
      },
      {
        heading: "Copyright or takedown requests",
        body: `For copyright, trademark, or takedown concerns, include the affected URL, your relationship to the content owner, and enough detail for review.`
      },
      {
        heading: "What not to send",
        body: `Do not send Roblox passwords, private account details, recovery codes, personal identity documents, or payment information. This site does not handle Roblox account support.`
      }
    ]
  },
  editorialPolicy: {
    title: "Editorial Policy",
    description: `Editorial policy for ${siteConfig.siteName}, including evidence labels, corrections, and Roblox guide boundaries.`,
    sections: [
      {
        heading: "Evidence labels",
        body: `This site uses three labels: verified, community-reported, and pending. Verified means the information is supported by official Roblox pages, public Roblox data, official channels, or direct in-game checks.`
      },
      {
        heading: "Codes and rewards",
        body: `Active codes and rewards must not be marked as verified unless official or in-game evidence supports them. Community-reported codes can be tracked only as unverified research signals.`
      },
      {
        heading: "Tier lists and values",
        body: `Tier lists, weapon pages, and value-list pages should explain whether information is verified, community-reported, or pending. The template must not invent trading values, DPS, crate odds, or official rankings.`
      },
      {
        heading: "Unsafe content boundary",
        body: `The site does not support exploit executors, account-risk tools, unsafe downloads, password collection, or instructions that put player accounts at risk.`
      },
      {
        heading: "Corrections",
        body: `Corrections are reviewed through the contact email: ${siteConfig.contactEmail}. The goal is to improve accuracy without overstating certainty.`
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    description: `Privacy policy for ${siteConfig.siteName}.`,
    sections: [
      {
        heading: "Information boundaries",
        body: `${siteConfig.siteName} does not require Roblox passwords, private Roblox account details, identity documents, payment details, or account recovery information.`
      },
      {
        heading: "Analytics and advertising",
        body: `A deployed site may use Google Analytics 4, Google AdSense, or other configured services. These services may use cookies, device identifiers, browser information, IP-derived location signals, and usage events to measure traffic or serve ads.`
      },
      {
        heading: "Cookies and third-party services",
        body: `Cookies and similar technologies may be used by analytics, advertising, hosting, or security providers. Review configured scripts before launch and keep this policy aligned with the services used on the site.`
      },
      {
        heading: "Children privacy boundary",
        body: `This site is a general Roblox guide site and does not knowingly request personal information from children. Users should not submit private account details or personal contact information through this site.`
      },
      {
        heading: "User choices",
        body: `Users can manage cookies through browser settings. Some third-party services may provide their own privacy controls or opt-out tools.`
      },
      {
        heading: "Contact",
        body: `For privacy questions, contact ${siteConfig.contactEmail}.`
      }
    ]
  },
  terms: {
    title: "Terms of Use",
    description: `Terms of use for ${siteConfig.siteName}.`,
    sections: [
      {
        heading: "Independent fan guide",
        body: `${siteConfig.siteName} is an independent fan guide. It is not affiliated with Roblox Corporation or the developers of ${siteConfig.gameName}. Roblox trademarks and game assets belong to their respective owners.`
      },
      {
        heading: "Guide content accuracy",
        body: `The site aims to separate verified information from community-reported and pending information. Game information can change, and no page should present unsupported claims as official facts.`
      },
      {
        heading: "External links",
        body: `The site may link to Roblox pages, official channels, or external resources. External websites have their own terms, privacy practices, and content policies.`
      },
      {
        heading: "Safety boundary",
        body: `This template does not support exploit executors, unsafe downloads, account-risk behavior, or requests for private Roblox account credentials.`
      },
      {
        heading: "Contact",
        body: `For questions about these terms, contact ${siteConfig.contactEmail}.`
      }
    ]
  }
};
