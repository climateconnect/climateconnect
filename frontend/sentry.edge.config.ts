// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // dsn:
  //   "https://808726a04f634c30bb650e1a710114d9@o4503980001918976.ingest.us.sentry.io/4504959466274816",
  dsn: process.env.FRONTEND_SENTRY_DSN,
  // Only enable Sentry in production
  enabled: process.env.NODE_ENV === "production",

  // Enable logs to be sent to Sentry
  enableLogs: false,
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
