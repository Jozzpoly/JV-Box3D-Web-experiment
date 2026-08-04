import { defineConfig } from "vite";

export default defineConfig({
  // The same artifact must work from localhost, a nested LAN path and a
  // GitHub Pages project path without being rebuilt for a specific domain.
  base: "./",
  build: {
    sourcemap: false,
  },
});
