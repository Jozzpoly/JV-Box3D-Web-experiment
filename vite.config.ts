import { defineConfig } from "vite";

export default defineConfig({
  // predev and prebuild:bundle rebuild this ignored staging tree from the
  // tracked public sources plus deterministic generated vehicle fixtures.
  publicDir: ".local-assets/public",
  // The same artifact must work from localhost, a nested LAN path and a
  // GitHub Pages project path without being rebuilt for a specific domain.
  base: "./",
  build: {
    sourcemap: false,
  },
});
