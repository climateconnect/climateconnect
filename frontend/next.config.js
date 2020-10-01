const pick = require("lodash/pick");

// Google Cloud has us define environment variables in app.yaml. However, these
// environment variables are not available at build time, only at runtime. To
// get around this, we read the variables from app.yaml here.
//
// This is a bit of a hack but is fairly straightforward. If we change our
// production build setup, we should revisit this code.
let environmentVariableSource;
if (process.env.IS_BUILDING_ON_GOOGLE_CLOUD) {
  const yaml = require("js-yaml");
  const fs = require("fs");
  const path = require("path");

  const appDotYamlPath = path.join(__dirname, "app.yaml");
  const appDotYamlContents = fs.readFileSync(appDotYamlPath, "utf8");
  const appDotYaml = yaml.safeLoad(appDotYamlContents);

  environmentVariableSource = appDotYaml.env_variables;
} else {
  require("dotenv").config();
  environmentVariableSource = process.env;
}

module.exports = {
  env: pick(environmentVariableSource, ["PRE_LAUNCH", "API_URL", "ENVIRONMENT", "SOCKET_URL"]),
  exportPathMap: async function(defaultPathMap) {
    if (process.env.PRE_LAUNCH)
      return {
        "/": { page: "/" },
        "/zoom": { page: "/zoom" },
        "/stream": { page: "/stream" },
        "/support": { page: "/support" }
      };
    else return defaultPathMap;
  }
};
