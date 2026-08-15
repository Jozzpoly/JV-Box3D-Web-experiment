# AI project memory — JV Web

Updated: 2026-08-15
Status: `FRIENDS R1 / PERFORMANCE FOUNDATION V1 OWNER-VALIDATED / CANONICAL PROMOTION PENDING`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it. Read `docs/PROJECT_STATE.md` for the current technical boundary and `docs/OWNER_CHECKPOINTS.md` for scoped owner acceptance.

## Current authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- active private performance lane: `work/friends-r1-live-perf`;
- owner-validated performance source checkpoint: `checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c`;
- isolated public A53 scan proof: `checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0`;
- immutable known-good Friends rollback: `checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable R0 fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

## Durable product truth

Plac E2R, Offroad, the current owner vehicle and the full JSPREV2 scan are a real Friends browser product foundation. Final rig/steering/handling remain later work; JURE owns rig authoring rather than JV-Web growing a temporary rig editor.

Current stress scan: 7 tiles, 25 groups/textures, 1,409,687 vertices, 5,327,325 indices and 1,775,775 triangles. Do not silently reduce scan content or fixed-step physics quality for mobile performance.

## Performance foundation v1

The active private source now contains the owner-tested low/medium-cost foundation:

- conservative scan-group culling plus shared scan matrices/state reuse;
- fixed 60 Hz physics catch-up with at most one browser-frame presentation;
- rich M6 trace/visual snapshot only for the final presented catch-up state;
- direct Uint32 scan indices when WebGL1 supports them, with safe Uint16 direct/chunk fallback;
- parser-pass finite validation and scan bounds, avoiding redundant full geometry traversals;
- normal browser caching plus bounded two-way tile loading;
- hidden Debug work suppression;
- mobile/coarse-pointer UI without live backdrop blur/heavy shadows over the WebGL canvas;
- telemetry separating browser cadence, presentation cadence, physics, trace, render/UI, scan loading and texture readiness/upload.

Owner A53 Chrome evidence at render scale 1x and culling ON:

- Offroad: stable 60 present/s, 16.7 ms average, p95 16.8 ms after sustained use;
- full textured JSPREV2: after settling, stable 60 present/s, 16.7 ms average, p95 16.8 ms with 19/25 scan groups visible;
- tested warm/cache scan run: `world 1337 ms`, `tiles 1127 ms` including `parse 268 ms`, `merge 53 ms`; all 25 textures became ready shortly after geometry, with 776.2 ms cumulative synchronous texture-upload call time.

Do not generalize those numbers to cold cache, 2x render scale, other phones, larger/multiple scans or future asset formats.

## Current decision

Stop micro-optimizing the present JSPREV2 merely because more optimizations are possible. Performance foundation v1 has reached its product goal for the current 1x A53 stress case. Preserve the remaining scaling work for evidence-backed future needs:

1. dedicated simplified collision representation / VAW-JSPREV3 collision export;
2. bounded or prioritized texture decode/upload/residency;
3. restart-safe `JvWorldData` lifetime reduction;
4. compact GPU-friendly/spatial asset representation;
5. LOD/world partitioning only when larger worlds justify it.

After formal promotion, the next owner-visible product phase should focus on mobile camera and touch/steering UX. Rig/JURE and final handling remain separate later phases.

## Formal promotion boundary

The A53 device proof used the isolated noncanonical native-ESM device gate with exact `box3d.js@0.0.2`. The source has strong scoped tests and real device evidence, but canonical Node 24.16.0 / npm 11.13.x / TypeScript 7 / Vite execution and the normal Friends artifact build are still required before promotion to `main` and replacement of the ordinary public Friends release.
