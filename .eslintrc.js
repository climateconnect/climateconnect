module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {
    "prefer-const": "error",
    "react/prop-types": "off",
    "react/self-closing-comp": "error",
    "react/prefer-stateless-function": "error"
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};
