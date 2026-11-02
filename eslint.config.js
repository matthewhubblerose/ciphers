import js from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,

  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".astro/**",
      "test-results/**",
      "playwright-report/**",
      "artifacts/**",
    ],
  },

  {
    files: ["scripts/**/*.js", "playwright.config.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
