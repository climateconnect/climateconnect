import type { IncomingMessage } from "http";

import type { FeatureToggles } from "./types/featureToggle";
import { detectEnvironmentFromRequest } from "../../public/lib/environmentOperations";
import type { CcEnvironment } from "../../public/lib/environmentOperations";

const API_URL = process.env.API_URL || "http://127.0.0.1:8000";

/**
 * Fetch all feature toggles for a specific environment.
 * Works both client-side and server-side (Node.js 18+).
 *
 * @param environment - The environment to fetch toggles for (production, staging, development)
 * @returns Promise resolving to a record of feature toggle names to boolean values
 */
export async function getFeatureToggles(environment: CcEnvironment): Promise<FeatureToggles> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${API_URL}/api/feature_toggles/?environment=${environment}`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error("Failed to fetch feature toggles:", response.statusText);
      return {};
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch feature toggles:", error);
    // Return empty object on error - callers should use fallback values
    return {};
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Convenience helper for use inside `getServerSideProps`.
 *
 * Reads the environment from the middleware-injected request header and fetches
 * the corresponding feature toggles. Pages that need feature toggles during SSR
 * should call this instead of adding logic to _app.getInitialProps.
 *
 * @example
 * ```ts
 * export const getServerSideProps: GetServerSideProps = async ({ req }) => {
 *   const { featureToggles, environment } = await getFeatureTogglesFromRequest(req);
 *   return { props: { featureToggles, environment } };
 * };
 * ```
 */
export async function getFeatureTogglesFromRequest(
  req: IncomingMessage | undefined
): Promise<{
  featureToggles: FeatureToggles;
  environment: CcEnvironment;
}> {
  const environment = detectEnvironmentFromRequest(req);
  const featureToggles = await getFeatureToggles(environment);
  return { featureToggles, environment };
}

/**
 * Check if a specific feature is enabled.
 *
 * @param featureName - The name of the feature toggle
 * @param toggles - The feature toggles object
 * @param fallback - The fallback value if the toggle is not found (default: false)
 * @returns True if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(
  featureName: string,
  toggles: FeatureToggles,
  fallback: boolean = false
): boolean {
  if (toggles && featureName in toggles) {
    return toggles[featureName];
  }
  return fallback;
}
