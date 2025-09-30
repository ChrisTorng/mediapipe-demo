const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./tests/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Noto Sans TC'", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          primary: "rgb(var(--color-brand-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-brand-secondary) / <alpha-value>)",
        },
        surface: {
          base: "rgb(var(--color-surface-base) / <alpha-value>)",
          elevated: "rgb(var(--color-surface-elevated) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          inverted: "rgb(var(--color-text-inverted) / <alpha-value>)",
        },
        focus: "rgb(var(--color-focus-ring) / <alpha-value>)",
      },
      boxShadow: {
        focus: "0 0 0 3px rgba(var(--color-focus-ring) / 0.35)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
