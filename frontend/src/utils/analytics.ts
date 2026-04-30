import ReactGA from "react-ga4";

/**
 * Fire a GA4 custom event for auth funnel tracking.
 * Safely no-ops during SSR or when GA4 is not initialized (no cookie consent / ad blocker).
 *
 * @param eventName - GA4 custom event name (must match allowlist if using backend proxy)
 * @param params - Event parameters (must NOT contain PII such as email or names)
 * @param gaInstance - ReactGA instance from UserContext (may be undefined)
 */
export const trackAuthEvent = (
  eventName: string,
  params: Record<string, string | number | boolean | undefined>,
  gaInstance?: typeof ReactGA
) => {
  if (typeof window === "undefined") return;
  if (!gaInstance) return;

  // Strip undefined values so GA4 receives clean params
  const cleanParams: Record<string, string | number | boolean> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanParams[key] = value;
    }
  });

  gaInstance.event(eventName, cleanParams);
};
