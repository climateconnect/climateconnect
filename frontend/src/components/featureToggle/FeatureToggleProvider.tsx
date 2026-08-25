import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

import { getFeatureToggles, isFeatureEnabled } from "../../hooks/featureToggles";
import {
  detectEnvironment,
  CcEnvironment,
  CcEnvironments,
} from "../../../public/lib/environmentOperations";
import { FeatureToggles } from "../../hooks/types/featureToggle";

export type FeatureToggleContextType = {
  toggles: FeatureToggles;
  // eslint-disable-next-line no-unused-vars
  isEnabled: (_feature: string, _fallback?: boolean) => boolean;
  isLoading: boolean;
  error: Error | null;
  environment: CcEnvironment;
};

const initialState = {
  toggles: {},
  // eslint-disable-next-line no-unused-vars
  isEnabled: (_feature: string, _fallback?: boolean): boolean => false,
  isLoading: true,
  error: null,
  environment: CcEnvironments.Production,
} as FeatureToggleContextType;

export const FeatureToggleContext = createContext<FeatureToggleContextType>(initialState);

export type FeatureToggleProviderProps = {
  children: ReactNode;
  // Optional initial toggles for server-side rendering
  initialToggles?: FeatureToggles;
  // Optional environment override (for testing or SSR)
  environment?: CcEnvironment;
};

export function FeatureToggleProvider({
  children,
  initialToggles,
  environment: environmentOverride,
}: FeatureToggleProviderProps) {
  // Determine environment at startup
  const [environment, setEnvironment] = useState<CcEnvironment>(
    () =>
      environmentOverride ||
      (typeof window !== "undefined" ? detectEnvironment() : CcEnvironments.Production)
  );

  const [toggles, setToggles] = useState<FeatureToggles>(() => initialToggles || {});
  const [isLoading, setIsLoading] = useState<boolean>(() => !initialToggles);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If we already have initial toggles, skip fetching
    if (initialToggles) {
      return;
    }

    // Determine environment (if not already set)
    const env = environmentOverride || detectEnvironment();
    setEnvironment(env);

    // Fetch toggles for the determined environment
    const fetchToggles = async () => {
      try {
        setIsLoading(true);
        const fetchedToggles = await getFeatureToggles(env);
        setToggles(fetchedToggles);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch feature toggles:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchToggles();
  }, [environmentOverride, initialToggles]);

  // Check if a feature is enabled
  const isEnabled = (feature: string, fallback: boolean = false): boolean => {
    return isFeatureEnabled(feature, toggles, fallback);
  };

  const value = {
    toggles,
    isEnabled,
    isLoading,
    error,
    environment,
  };

  return <FeatureToggleContext.Provider value={value}>{children}</FeatureToggleContext.Provider>;
}

/**
 * Hook to access feature toggles in components.
 *
 * @example
 * ```tsx
 * const { isEnabled, isLoading } = useFeatureToggles();
 *
 * if (isEnabled('NEW_DASHBOARD')) {
 *   return <NewDashboard />;
 * }
 * ```
 */
export function useFeatureToggles() {
  const context = useContext(FeatureToggleContext);
  if (!context) {
    throw new Error("useFeatureToggles must be used within a FeatureToggleProvider");
  }
  return context;
}
