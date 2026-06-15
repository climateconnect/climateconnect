// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.FRONTEND_SENTRY_DSN,
  // Only enable Sentry in production
  enabled: process.env.NODE_ENV === "production",

  // Enable logs to be sent to Sentry
  enableLogs: false,
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.2,

  // GDPR data minimisation — disable identity/cookie collection.
  // sendDefaultPii is deprecated (removed in v11), use dataCollection instead.
  //
  // httpBodies are KEPT: the Next.js server only handles SSR data fetching
  // from the Django API (public page data) and does not receive direct
  // user form submissions — those go browser → Django API directly.
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    queryParams: false,
  },
});
