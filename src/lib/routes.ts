import { siteConfig } from "../data/config";

export const systemRoutes = [
  { path: "/privacy/", htmlFile: "privacy/index.html", label: "Privacy" },
  { path: "/terms/", htmlFile: "terms/index.html", label: "Terms" }
];

export function completedRoutes() {
  return [
    ...siteConfig.completedCoreSlugs.map((slug) => ({
      slug,
      path: slug ? `/${slug}/` : "/",
      htmlFile: slug ? `${slug}/index.html` : "index.html",
      label: slug || "Home"
    })),
    ...siteConfig.completedEnglishOnlySlugs.map((slug) => ({
      slug,
      path: `/${slug}/`,
      htmlFile: `${slug}/index.html`,
      label: slug
    }))
  ];
}

export function absoluteUrl(pathname: string) {
  const base = siteConfig.siteDomain.replace(/\/+$/g, "");
  const route = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${route}`;
}
