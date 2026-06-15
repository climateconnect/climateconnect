// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.FRONTEND_SENTRY_DSN,
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,
  // Enable logs to be sent to Sentry
  enableLogs: false,
  enabled: process.env.NODE_ENV === "production",

  // GDPR data minimisation — disable all automatic data collection.
  // sendDefaultPii is deprecated (removed in v11), use dataCollection instead.
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [], // Prevents capturing outgoing request bodies
    queryParams: true, // Keep query params — useful for debugging (hub slugs, page numbers)
  },

  // GDPR data minimisation — defense in depth.
  // Strip request bodies and headers that may contain PII before the
  // event leaves the browser. This catches data that dataCollection
  // might miss through custom error contexts or breadcrumbs.
  beforeSend(event) {
    if (event.request) {
      delete event.request.data;
      delete event.request.headers;
      delete event.request.cookies;
    }
    delete event.user;
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
