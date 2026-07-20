import { getLocalePrefix } from "./apiOperations";
import { appendQueryParam } from "./urlOperations";

export interface AppHrefOptions {
  /** When true, the `?hub=` parameter is never appended (Category B). */
  leaveHub?: boolean;
  /** Active hub slug. Falls back to the empty string (no hub active). */
  hubUrl?: string;
  /** Locale used to compute the locale prefix. Only applied to relative hrefs. */
  locale?: string;
}

const isAbsoluteUrl = (href: string): boolean => /^(https?:)?\/\//i.test(href);

/**
 * Strip an optional leading locale prefix (e.g. `/de/hubs/erlangen` ->
 * `/hubs/erlangen`). English carries no prefix, so the only segment that can
 * appear here is a known locale (`en`, `de`).
 */
const stripLocalePrefix = (path: string): string => {
  const match = path.match(/^\/(en|de)(\/.*)?$/);
  if (match) {
    return match[2] ?? "/";
  }
  return path;
};

/**
 * A "hub route" conveys the hub in its path, so a `?hub=` query parameter is
 * redundant. Covers both the dedicated landing page (`/hubs/<slug>`) and the
 * sub-hub browse page (`/hubs/<slug>/<subHub>/browse`).
 */
const isHubRoute = (path: string): boolean => /^\/hubs\/[^/]+/.test(path);

const hrefHasQueryParam = (href: string, key: string): boolean => {
  try {
    const url = new URL(href, "http://localhost.invalid");
    return url.searchParams.has(key);
  } catch {
    return false;
  }
};

/**
 * Build a final href that (a) carries the locale prefix for relative paths and
 * (b) appends `?hub=<slug>` when a hub is active and the destination does not
 * already convey the hub.
 *
 * All query/fragment/encoding construction is delegated to the shared URI
 * utility (`appendQueryParam`), so the result is always well-formed. This is
 * the function form of the `<AppLink>` component.
 *
 * `appHref` leaves absolute/external URLs untouched and never appends `?hub=`
 * when: `leaveHub` is set, no hub is active, the destination is a hub route
 * (`/hubs/...`), or a `?hub=` is already present.
 */
export const appHref = (href: string, options?: AppHrefOptions): string => {
  if (!href || isAbsoluteUrl(href)) {
    return href;
  }

  const { leaveHub = false, hubUrl, locale } = options ?? {};

  // 1. Locale prefix — only for relative paths, never double-applied.
  let result = href;
  if (locale) {
    const prefix = getLocalePrefix(locale);
    if (prefix && !result.startsWith(prefix)) {
      result = `${prefix}${result}`;
    }
  }

  // 2. Decide whether `?hub=` should be appended.
  const slug = hubUrl ?? "";
  if (leaveHub || !slug) {
    return result;
  }

  // The hub is already in the URL when the (locale-stripped) path is a hub route.
  if (isHubRoute(stripLocalePrefix(result))) {
    return result;
  }

  // A `?hub=` is already present — never append a second one.
  if (hrefHasQueryParam(result, "hub")) {
    return result;
  }

  return appendQueryParam(result, "hub", slug);
};
