import { defineConfig } from "vite";
import { finalJsprev2VitePlugin } from "./tools/product/final-jsprev2-vite-plugin.mjs";

export default defineConfig({
  // The same artifact must work from localhost, a nested LAN path and a
  // GitHub Pages project path without being rebuilt for a specific domain.
  base: "./",
  plugins: [finalJsprev2VitePlugin()],
  build: {
    sourcemap: false,
  },
});
