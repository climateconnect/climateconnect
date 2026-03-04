import axios from "axios";

import type { FeatureToggles, FeatureToggleEnvironment } from "./types/featureToggle";

const API_URL = process.env.API_URL || "http://127.0.0.1:8000";

/**
 * Detect the current environment based on hostname.
 * This is used to determine which feature toggles to fetch on the client side.
 */
export function detectEnvironment(): FeatureToggleEnvironment {
  if (typeof window === "undefined") {
    // Server-side: this should not be called on server
    // Use detectEnvironmentFromHeaders for SSR
    console.warn("detectEnvironment called on server - use detectEnvironmentFromHeaders");
    return "production";
  }

  const hostname = window.location.hostname;

  // Check for staging environments
  if (hostname.includes("slot2") || hostname.includes("staging")) {
    return "staging";
  }

  // Check for local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development";
  }

  // Default to production
  return "production";
}

/**
 * Detect environment from request headers (for SSR).
 * Uses the host header to determine the environment.
 */
export function detectEnvironmentFromHeaders(host: string | undefined): FeatureToggleEnvironment {
  if (!host) {
    return "production";
  }

  // Check for staging environments
  if (host.includes("slot2") || host.includes("staging")) {
    return "staging";
  }

  // Check for local development
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return "development";
  }

  return "production";
}

/**
 * Fetch all feature toggles for a specific environment (client-side).
 *
 * @param environment - The environment to fetch toggles for (production, staging, development)
 * @returns Promise resolving to a record of feature toggle names to boolean values
 */
export async function getFeatureToggles(
  environment: FeatureToggleEnvironment
): Promise<FeatureToggles> {
  try {
    const response = await axios.get<FeatureToggles>(`${API_URL}/api/feature_toggles/`, {
      params: { environment },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch feature toggles:", error);
    // Return empty object on error - callers should use fallback values
    return {};
  }
}

/**
 * Fetch all feature toggles for server-side rendering.
 * Uses the API_URL from environment variables.
 *
 * @param environment - The environment to fetch toggles for
 * @returns Promise resolving to a record of feature toggle names to boolean values
 */
export async function getFeatureTogglesServer(
  environment: FeatureToggleEnvironment
): Promise<FeatureToggles> {
  const url = `${API_URL}/api/feature_toggles/`;

  try {
    // Use fetch instead of axios for server-side (no need for axios config)
    const response = await fetch(`${url}?environment=${environment}`);
    if (!response.ok) {
      console.error("Failed to fetch feature toggles:", response.statusText);
      return {};
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch feature toggles:", error);
    return {};
  }
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
