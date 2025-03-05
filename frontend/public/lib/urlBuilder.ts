import { getLocalePrefix } from "./apiOperations";

export type PathType = "allHubs" | "hubHomePage" | "hubBrowse";

export interface HubUrlOptions {
  hubUrlSlug?: string;
  locale?: string;
  queryParams?: string;
  hash?: string;
  includeBaseUrl?: boolean;
  pathType?: PathType;
}

export function buildHubUrl({
  hubUrlSlug = "",
  locale = "",
  queryParams = "",
  hash = "",
  includeBaseUrl = false,
  pathType = "allHubs",
}: HubUrlOptions = {}): string {
  // Ensure query params start with ? if not empty
  const formattedQueryParams = queryParams
    ? queryParams.startsWith("?")
      ? queryParams
      : `?${queryParams}`
    : "";

  const localePrefix = locale ? `${getLocalePrefix(locale)}` : "";

  const basePaths: Record<PathType, string> = {
    allHubs: `${localePrefix}/hubs`,
    hubHomePage: `${localePrefix}/hubs/${hubUrlSlug}`,
    hubBrowse: `${localePrefix}/hubs/${hubUrlSlug}/browse`,
  };

  // Use the base path, defaulting to all hubs if an invalid path type is provided
  const basePath = basePaths[pathType] || basePaths.allHubs;

  // Conditionally add base URL
  const baseUrl = includeBaseUrl && process.env.BASE_URL ? process.env.BASE_URL : "";

  // Construct the final URL
  return `${baseUrl}${basePath}${formattedQueryParams}${hash ? `#${hash}` : ""}`;
}
