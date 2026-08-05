import { defineConfig } from "vite";
import { localJsprev2ScanPlugin } from "./tools/vite/local-jsprev2-scan-plugin.mjs";

export default defineConfig({
  // The same artifact must work from localhost, a nested LAN path and a
  // GitHub Pages project path without being rebuilt for a specific domain.
  base: "./",
  plugins: [localJsprev2ScanPlugin()],
  build: {
    sourcemap: false,
  },
});
