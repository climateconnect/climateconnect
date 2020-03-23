require("dotenv").config();

const withCSS = require("@zeit/next-css");
module.exports = withCSS({
  cssModules: true,
  env: {
    PRE_LAUNCH: process.env.PRE_LAUNCH
  },
  exportPathMap: async function(defaultPathMap) {
    if (process.env.PRE_LAUNCH)
      return {
        "/": { page: "/" }
      };
    else return defaultPathMap;
  }
});
