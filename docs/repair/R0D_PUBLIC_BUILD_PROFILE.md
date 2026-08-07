# R0-D public MAP_ONLY_R0 build profile

Status: `SOURCE CANDIDATE / COMBINED PRE-PUBLIC WINDOWS GATE REQUIRED`

This stage intentionally combines the earlier D0/D1 split into one bounded release-preparation step.

The public build must:

- use `map-only-r0.html` / `src/map-only-r0-main.ts` as its only application entry;
- use a dedicated Vite config with `base: "./"` and no JSPREV2 dev plugin;
- disable automatic `public/` copying;
- copy only `.nojekyll`, the pinned factory receipt, the synthetic scene, and the two generated tiny-vehicle visual files;
- emit a root `index.html` suitable for `Jozzpoly/JV-Box3D-Web-Public/`;
- write the existing portable manifest and pass the existing static/runtime/privacy/network/HTTP validators;
- reject `/__jv_scan__/`, `jvSpawn=scan`, `Skan JSPREV2` and `loadLocalJsprev2Scan` in public text payloads;
- remain a candidate until exact Windows reproducibility and exact-artifact browser evidence pass.

The public repository and GitHub Pages remain untouched by this source commit.
