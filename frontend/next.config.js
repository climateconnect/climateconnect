const pick = require("lodash/pick");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

require("dotenv").config();

module.exports = withBundleAnalyzer({
  // Disable ESLint during build - it's already run separately in CI
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Read set variables from `.env` file
  //For CUSTOM_HUB_URLS use a string of urls split by commas, e.g. CUSTOM_HUB_URLS=url1,url2,url3
  env: pick(process.env, [
    "API_HOST",
    "API_URL",
    "BASE_URL",
    "BASE_URL_HOST",
    "CUSTOM_HUB_URLS",
    "DONATION_CAMPAIGN_RUNNING",
    "ENABLE_LEGACY_LOCATION_FORMAT",
    "ENVIRONMENT",
    "GOOGLE_ANALYTICS_CODE",
    "LATEST_NEWSLETTER_LINK",
    "LOCATION_HUBS",
    "LETS_ENCRYPT_FILE_CONTENT",
    "SOCKET_URL",
    "WEBFLOW_API_TOKEN",
    "WEBFLOW_SITE_ID",
    "SENTRY_DSN",
    "SENTRY_AUTH_TOKEN",
  ]),
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "en",
  },
  exportPathMap: async function (defaultPathMap) {
    return defaultPathMap;
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/browse",
        has: [
          {
            type: "cookie",
            key: "auth_token",
          },
        ],
        permanent: false,
      },
      {
        source: "/spenden",
        destination: "/de/donate",
        permanent: true,
      },
      {
        source: "/spendenwald",
        destination: "/de/donate",
        // disabled redirect to donorforest for now
        // as the donorforest is not up to date
        // destination: "/de/donorforest",
        permanent: true,
      },
      {
        source: "/klimakuechen-erlangen",
        destination: "/de/projects/klimakuechen?hub=erlangen",
        permanent: true,
      },
      {
        source: "/blog/weihnachten",
        destination: "/post/es-ist-weihnachtszeit-auf-climate-connect",
        permanent: true,
      },
      {
        source: "/klimapuzzle",
        destination: "/de/projects/workshop-klimapuzzle?hub=marburg",
        permanent: true,
      },
      {
        source: "/hubs/prio1",
        destination: "/hubs/prio1/browse",
        permanent: false,
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
});

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "climate-connect-gug-haftungsbe",
  project: "climate-connect-frontend",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
