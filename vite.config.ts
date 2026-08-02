import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      'three/addons/geometries/CapsuleGeometry.js': fileURLToPath(
        new URL('./src/render/capsule-geometry.ts', import.meta.url),
      ),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
