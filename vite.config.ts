import { defineConfig } from "vite";
import { buildIdentityVitePlugin } from "./tools/product/build-identity-vite-plugin.mjs";
import { finalJsprev2VitePlugin } from "./tools/product/final-jsprev2-vite-plugin.mjs";

export default defineConfig({
  // The same artifact must work from localhost, a nested LAN path and a
  // GitHub Pages project path without being rebuilt for a specific domain.
  base: "./",
  plugins: [buildIdentityVitePlugin(), finalJsprev2VitePlugin()],
  build: {
    sourcemap: false,
  },
});
