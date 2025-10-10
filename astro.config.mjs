import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://matthewhubblerose.github.io",
  base: "/cipher-challenge",
  integrations: [mdx(), preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
