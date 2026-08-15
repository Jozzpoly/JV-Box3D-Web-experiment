# AI project memory — JV Web

Updated: 2026-08-15
Status: `CAMERA MANUAL RIG V1 CLOSED / USABILITY CONTINUES`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active product lane: `work/friends-r1-usability`;
- Camera Manual Rig V1 absorbed on the active lane at `997c9a34ea429220dbdb4f5408a0ac37200bd712` before the closure-doc update;
- closed performance source checkpoint: `checkpoint/perf-foundation-v1-closed-2026-08-15`;
- owner-tested performance code: `checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c`;
- public A53 performance proof: `checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0`;
- public Camera 1B device proof: `release/friends-r1@4768abedaa67b7505ca963a0836879e42590b67d`;
- public known-good rollback: `checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable R0 fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Only the lane named in `docs/PROJECT_STATE.md` is active ahead of `main`. Other old `work/*`, `candidate/*`, `repair/*` and `checkpoint/*` refs are historical/evidence unless explicitly reactivated.

## Current truth

Plac E2R, Offroad, the current owner vehicle and full JSPREV2 scan form the working browser foundation. Final rig/steering/handling remain later work; JURE owns rig authoring.

Performance foundation v1 is owner-validated on Galaxy A53 in normal Chrome for the current full textured JSPREV2 at render scale 1x and culling ON. Do not generalize that result to cold-cache timing, 2x scale, other phones or future larger/multiple scans.

Camera Manual Rig V1 is now private source, not only a Pages experiment. It provides responsive reset/framing, wide-range distance and clipping, manual orbit, vehicle-local focus pan, touch pinch+pan, desktop pan and wheel zoom. The owner accepted the manual camera foundation after testing close/interior and far/aerial views across phone portrait/landscape and desktop; Messenger WebView evidence is supplemental.

The public Camera gate remains device evidence rather than a canonical Friends release. The tested Camera runtime patch identity is `fcc82118d607bed941b487d1f8222d291882c8f5ea51b600ade5b8ee04f1be78` over Camera 1A base `dc8eab1...`.

The remaining formal promotion boundary is canonical repo execution/build with Node 24.16.0, npm 11.13.x, lockfile dependencies, TypeScript 7, Vite and real `box3d.js@0.0.2` before promotion to `main` / ordinary Friends release.

## Next direction

Continue with small owner-visible usability slices. Current candidate order:

1. camera persistence/presets;
2. immersive/fullscreen capability;
3. fresh HUD/settings review using current screenshots/build;
4. touch-control ergonomics and analog input foundation;
5. steering/joystick interaction;
6. advanced speed/turn/terrain/obstacle camera assists, remaining additive to manual user calibration.

Do not resume micro-optimizing current JSPREV2 by default. Future performance scaling should be triggered by evidence and should prefer separate collision representation, texture scheduling/residency, safe world-data lifetime reduction and better VAW/JSPREV3 asset representation before LOD/world partitioning.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. code/tests for the current slice
4. `docs/ARCHITECTURE.md` only for stable boundaries
5. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance is relevant
