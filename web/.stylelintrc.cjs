module.exports = {
  extends: [
  "stylelint-config-standard",
  "stylelint-config-standard-scss",
  "stylelint-config-prettier-scss"
  ],
  plugins: ["stylelint-order"],
  rules: {
    "color-no-invalid-hex": true,
    "order/properties-alphabetical-order": true,
    "selector-class-pattern": [
      "^[a-z][a-z0-9\-]*$",
      {
        message: "Class selectors should be kebab-case",
      }
    ],
  },
  ignoreFiles: ["**/node_modules/**", "**/dist/**"],
};
