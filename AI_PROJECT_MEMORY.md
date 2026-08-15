# AI project memory — JV Web

Updated: 2026-08-15
Status: `PERFORMANCE FOUNDATION V1 CLOSED / MOBILE USABILITY NEXT`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- next active product lane: `work/friends-r1-usability`;
- closed performance source checkpoint: `checkpoint/perf-foundation-v1-closed-2026-08-15`;
- owner-tested performance code checkpoint: `checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c`;
- public A53 proof: `checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0`;
- public rollback: `checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable R0 fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Only the lane named in `docs/PROJECT_STATE.md` is active ahead of `main`. Other old `work/*`, `candidate/*`, `repair/*` and `checkpoint/*` refs are historical/evidence unless explicitly reactivated.

## Current truth

Plac E2R, Offroad, the current owner vehicle and full JSPREV2 scan form the working Friends browser foundation. Final rig/steering/handling remain later work; JURE owns rig authoring.

Performance foundation v1 is owner-validated on Galaxy A53 in normal Chrome for the current full textured JSPREV2 at render scale 1x and culling ON. Settled samples reached 60 scene presents/s at 16.7 ms average / 16.8 ms p95. Do not generalize this to cold-cache timing, 2x scale, other phones or future larger/multiple scans.

The remaining formal boundary is canonical repo execution/build with Node 24.16.0, npm 11.13.x, lockfile dependencies, TypeScript 7, Vite and real `box3d.js@0.0.2` before promotion to `main` / ordinary Friends release.

## Next direction

Do not resume micro-optimizing current JSPREV2 by default. The next owner-visible phase is mobile usability: camera/framing, touch controls, steering/joystick interaction and responsive UX without changing vehicle mechanics.

Future performance scaling, when evidence requires it, should prefer separate collision representation, texture scheduling/residency, safe world-data lifetime reduction and a better VAW/JSPREV3 asset representation before LOD/world partitioning.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. code/tests for the current slice
4. `docs/ARCHITECTURE.md` only for stable boundaries
5. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance is relevant
