import { getLocalePrefix } from "./apiOperations";

interface HubUrlOptions {
  hubUrlSlug?: string;
  locale?: string;
  queryParams?: string;
  hash?: string;
  includeBaseUrl?: boolean;
  pathType?: 'allHubs' | 'hubHomePage' | 'hubBrowse';
}

export function buildHubUrl({
  hubUrlSlug= "",
  locale = "",
  queryParams = "",
  hash = "",
  includeBaseUrl = false,
  pathType = 'allHubs'
}: HubUrlOptions = {}) {

  let basePath;
  switch (pathType) {
    case 'allHubs':
      // All hubs page
      basePath = `${locale ? `${getLocalePrefix(locale)}` : ""}/hubs`;
      break;
    case 'hubHomePage':
      // Hub home page
      basePath = `${locale ? `${getLocalePrefix(locale)}` : ""}/hubs/${hubUrlSlug}`;
      break;
    case 'hubBrowse':
      // Hub browse page
      basePath = `${locale ? `${getLocalePrefix(locale)}` : ""}/hubs/${hubUrlSlug}/browse`;
      break;
    default:
      basePath = `${locale ? `${getLocalePrefix(locale)}` : ""}/hubs`;
  }
  
  // Add base URL if specified
  const baseUrl = includeBaseUrl && process.env.BASE_URL ? process.env.BASE_URL : "";
  
  return `${baseUrl}${basePath}${queryParams}${hash ? `#${hash}` : ""}`;
}
