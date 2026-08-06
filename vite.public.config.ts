import { defineConfig } from "vite";

export default defineConfig({
  root: "public-release",
  publicDir: "../public",
  base: "./",
  build: {
    outDir: "../dist-public",
    emptyOutDir: true,
    sourcemap: false,
  },
});
