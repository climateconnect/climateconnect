require("dotenv").config();

const withCSS = require("@zeit/next-css");
module.exports = withCSS({
  cssModules: true,
  env: {
    PRE_LAUNCH: process.env.PRE_LAUNCH
  }
});
