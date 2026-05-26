import { siteConfig } from "../data/config";

export function absoluteAssetUrl(value: string) {
  if (value.startsWith("https://")) return value;
  return `${siteConfig.siteDomain.replace(/\/+$/g, "")}${value.startsWith("/") ? value : `/${value}`}`;
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
