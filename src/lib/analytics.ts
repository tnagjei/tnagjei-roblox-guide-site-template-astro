export const analyticsEventNames = {
  copyAction: "copy_action",
  outboundLinkClick: "outbound_link_click",
  toolInputChange: "tool_input_change",
  toolResultView: "tool_result_view",
  relatedGuideClick: "related_guide_click"
} as const;

export type AnalyticsEventName =
  | (typeof analyticsEventNames)[keyof typeof analyticsEventNames]
  | (string & {});

export type AnalyticsParamKey =
  | "page_path"
  | "event_source"
  | "item_type"
  | "item_name"
  | "link_url"
  | "tool_name"
  | "field_name";

export type AnalyticsParams = Partial<Record<AnalyticsParamKey, string | number | boolean | null | undefined>>;

type GtagFunction = (command: "event", eventName: string, params?: Record<string, string | number | boolean>) => void;

declare global {
  interface Window {
    gtag?: GtagFunction;
  }
}

const allowedParamKeys = new Set<AnalyticsParamKey>([
  "page_path",
  "event_source",
  "item_type",
  "item_name",
  "link_url",
  "tool_name",
  "field_name"
]);

const privacyPatterns = [
  /@/,
  /password/i,
  /passwd/i,
  /secret/i,
  /token/i,
  /phone/i,
  /email/i,
  /username/i,
  /user_name/i,
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/
];

function isProduction() {
  return import.meta.env.PROD;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function sanitizeValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number" || typeof value === "boolean") return value;

  const normalized = value.trim().slice(0, 160);
  if (privacyPatterns.some((pattern) => pattern.test(normalized))) return undefined;
  return normalized;
}

function sanitizeParams(params: AnalyticsParams = {}) {
  const output: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (!allowedParamKeys.has(key as AnalyticsParamKey)) continue;
    const sanitized = sanitizeValue(value);
    if (sanitized !== undefined) output[key] = sanitized;
  }

  if (!output.page_path && isBrowser()) {
    output.page_path = window.location.pathname;
  }

  return output;
}

export function trackEvent(eventName: AnalyticsEventName, params: AnalyticsParams = {}) {
  if (!isBrowser()) return;

  const sanitizedParams = sanitizeParams(params);

  if (!isProduction()) {
    console.debug("[analytics:event]", eventName, sanitizedParams);
    return;
  }

  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, sanitizedParams);
}

export function trackCopyEvent(params: AnalyticsParams = {}, eventName: AnalyticsEventName = analyticsEventNames.copyAction) {
  trackEvent(eventName, params);
}

export function trackOutboundClick(params: AnalyticsParams = {}, eventName: AnalyticsEventName = analyticsEventNames.outboundLinkClick) {
  trackEvent(eventName, params);
}

export function trackToolInputChange(params: AnalyticsParams = {}, eventName: AnalyticsEventName = analyticsEventNames.toolInputChange) {
  trackEvent(eventName, params);
}

export function trackToolResultView(params: AnalyticsParams = {}, eventName: AnalyticsEventName = analyticsEventNames.toolResultView) {
  trackEvent(eventName, params);
}

export function debounce<T extends (...args: never[]) => void>(callback: T, delayMs = 1000) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delayMs);
  };
}
