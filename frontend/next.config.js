const pick = require("lodash/pick");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

require("dotenv").config();

module.exports = withBundleAnalyzer({
  // Read set variables from `.env` file
  env: pick(process.env, [
    "API_HOST",
    "API_URL",
    "BASE_URL",
    "BASE_URL_HOST",
    "DONATION_CAMPAIGN_RUNNING",
    "ENABLE_LEGACY_LOCATION_FORMAT",
    "ENVIRONMENT",
    "GOOGLE_ANALYTICS_CODE",
    "LATEST_NEWSLETTER_LINK",
    "LETS_ENCRYPT_FILE_CONTENT",
    "SOCKET_URL",
    "WEBFLOW_API_TOKEN",
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
        destination: "/de/donorforest",
        permanent: true,
      },
      {
        source: "/klimakuechen-erlangen",
        destination: "/de/projects/klimakuechen?hubPage=erlangen",
        permanent: true,
      },
      {
        source: "/blog/weihnachten",
        destination: "/post/es-ist-weihnachtszeit-auf-climate-connect",
        permanent: true,
      },
    ];
  },
  webpack(config) {
    // Add SVG loader
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
});
