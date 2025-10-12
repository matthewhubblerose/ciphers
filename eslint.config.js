import js from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,

  // Global ignores
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".astro/**",
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
    ],
  },

  // Custom rules
  {
    rules: {
      // Allow unused vars that start with underscore
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Relax some rules for educational code
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Astro-specific overrides
  {
    files: ["**/*.astro"],
    rules: {
      // Astro components can have unused props passed for composition
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
