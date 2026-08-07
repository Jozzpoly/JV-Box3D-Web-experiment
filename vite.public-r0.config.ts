import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const mapOnlyEntry = fileURLToPath(
  new URL("./map-only-r0.html", import.meta.url),
);

export default defineConfig({
  base: "./",
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: mapOnlyEntry,
    },
  },
});
