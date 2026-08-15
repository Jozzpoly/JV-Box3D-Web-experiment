# AI project memory — JV Web

Updated: 2026-08-15
Status: `CAMERA 1B OWNER-VALIDATED / PRIVATE ABSORPTION NEXT`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active product lane: `work/friends-r1-usability`;
- current private lane source before Camera 1B absorption: `dc8eab1ef3a24dcaab4b8fdff61da020c2518d5e` (Camera 1A);
- closed performance source checkpoint: `checkpoint/perf-foundation-v1-closed-2026-08-15`;
- owner-tested performance code checkpoint: `checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c`;
- public A53 proof: `checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0`;
- public Camera 1B owner-device gate: `release/friends-r1@4768abedaa67b7505ca963a0836879e42590b67d`;
- public known-good rollback: `checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable R0 fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Only the lane named in `docs/PROJECT_STATE.md` is active ahead of `main`. Other old `work/*`, `candidate/*`, `repair/*` and `checkpoint/*` refs are historical/evidence unless explicitly reactivated.

## Current truth

Plac E2R, Offroad, the current owner vehicle and full JSPREV2 scan form the working Friends browser foundation. Final rig/steering/handling remain later work; JURE owns rig authoring.

Performance foundation v1 is owner-validated on Galaxy A53 in normal Chrome for the current full textured JSPREV2 at render scale 1x and culling ON. Settled samples reached 60 scene presents/s at 16.7 ms average / 16.8 ms p95. Do not generalize this to cold-cache timing, 2x scale, other phones or future larger/multiple scans.

Camera 1A is the current private source baseline. Camera 1B was then tested successfully by the owner through the noncanonical public device gate after Recovery V3. The owner confirmed that focus/navigation around scan details became materially easier and that inspection/jumping between areas was no longer a fight with the camera. Camera 1B is therefore owner-validated for that interaction scope, but it is **not yet absorbed into the private active source**.

The Camera 1B public gate preserves the exact tested runtime patch identity (`fcc82118d607bed941b487d1f8222d291882c8f5ea51b600ade5b8ee04f1be78`, three camera runtime modules) over private base `dc8eab1...`. Treat the public gate as device evidence, not source authority or a canonical Friends release.

The remaining formal promotion boundary is canonical repo execution/build with Node 24.16.0, npm 11.13.x, lockfile dependencies, TypeScript 7, Vite and real `box3d.js@0.0.2` before promotion to `main` / ordinary Friends release.

## Next direction

First finish Camera 1B exact recovery/identity checking and absorb only the owner-tested camera slice into `work/friends-r1-usability`. Do not start another broad feature campaign before that boundary is cemented.

After Camera 1B is absorbed and rendered integration is healthy, continue mobile usability as small owner-visible slices. Candidate order: camera persistence/presets, immersive/fullscreen capability, fresh HUD/settings review, then touch/steering/joystick UX. Advanced automatic camera assists come later and must remain additive to manual user calibration.

Do not resume micro-optimizing current JSPREV2 by default. Future performance scaling, when evidence requires it, should prefer separate collision representation, texture scheduling/residency, safe world-data lifetime reduction and a better VAW/JSPREV3 asset representation before LOD/world partitioning.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. code/tests for the current slice
4. `docs/ARCHITECTURE.md` only for stable boundaries
5. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance is relevant
