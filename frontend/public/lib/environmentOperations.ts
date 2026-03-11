import type { IncomingMessage } from "http";
import Cookies from "universal-cookie";

/**
 * The name of the cookie and header used to communicate the detected runtime environment
 * to server-side code (getServerSideProps) and client-side code.
 *
 * Because the same build artifact is deployed to the staging slot first and then swapped
 * to production, build-time environment variables cannot distinguish staging from production.
 * Instead, we detect the environment at runtime from the request host header.
 */
export const CC_ENVIRONMENT_COOKIE = "cc-environment";
export const CC_ENVIRONMENT_HEADER = "x-cc-environment";

export type CcEnvironment = "production" | "staging" | "development";

const VALID_ENVIRONMENTS: CcEnvironment[] = ["production", "staging", "development"];

export function isValidEnvironment(value: string): value is CcEnvironment {
  return (VALID_ENVIRONMENTS as string[]).includes(value);
}

export function detectEnvironmentFromHost(host: string | null): CcEnvironment {
  if (!host) return "production";
  if (host.includes("slot2") || host.includes("staging")) return "staging";
  if (host.includes("localhost") || host.includes("127.0.0.1")) return "development";
  return "production";
}

/**
 * Detect the current environment at runtime (client-side).
 *
 * Priority order:
 * 1. The `cc-environment` cookie set by Next.js middleware (most reliable, works after first request)
 * 2. Hostname-based detection (fallback for the very first render before cookie is set)
 *
 * Note: We cannot use build-time env vars (ENVIRONMENT) to distinguish staging from production
 * because the same build artifact is deployed to the staging slot first and then swapped to
 * production. The middleware reads the request host header and sets the cookie on every request.
 */
export function detectEnvironment(): CcEnvironment {
  // 1. Read the cookie set by middleware (available after first request)
  if (typeof document !== "undefined") {
    const value = new Cookies().get<string>(CC_ENVIRONMENT_COOKIE);
    if (value && isValidEnvironment(value)) {
      return value;
    }
  }

  // 2. Fallback: hostname-based detection (client-side only)
  if (typeof window !== "undefined") {
    return detectEnvironmentFromHost(window.location.hostname);
  }

  return "production";
}

/**
 * Detect environment from a Next.js / Node.js IncomingMessage (for getServerSideProps).
 *
 * Reads the `x-cc-environment` header set by middleware first, then falls back to
 * host-based detection.
 */
export function detectEnvironmentFromRequest(req: IncomingMessage | undefined): CcEnvironment {
  if (!req) return "production";

  // Prefer the header set by middleware
  const headerValue = req.headers[CC_ENVIRONMENT_HEADER];
  if (headerValue) {
    const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    if (isValidEnvironment(value)) {
      return value;
    }
  }

  // Fallback: derive from host header
  const host = req.headers.host;
  return detectEnvironmentFromHost(host ?? null);
}
