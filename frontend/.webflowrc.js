module.exports = {
  host: "https://api.webflow.com",
  rootDir: "./devlink",
  siteId: process.env.WEBFLOW_SITE_ID,
  authToken: process.env.WEBFLOW_API_TOKEN, // An environment variable is recommended for this field.
  cssModules: true,
};
