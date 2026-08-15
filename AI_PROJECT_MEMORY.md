# AI project memory — JV Web

Updated: 2026-08-16
Status: `MOBILE DRIVING V3 DEVICE GATE / OWNER VALIDATION PENDING`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active product lane: `work/friends-r1-usability`;
- current private lane before V3 source absorption: `d768a82efd7d57d94bbaef98fc16fcced1160287`;
- Camera Manual Rig V1 absorption: `997c9a34ea429220dbdb4f5408a0ac37200bd712`;
- fullscreen source checkpoint: `checkpoint/fullscreen-v1-owner-validated-2026-08-15@db55501342feacfb0f82099d7f47afe3a9756143`;
- Analog Steering V1 source: `d80d4636a1327c3aaf9e6689a95a7cb1d91f98b2`;
- Steering Control V2 UX/debug source: `b9dd4f98ecee192af3302150c95542c772033949`;
- temporary 35-degree drive bridge: `d6c646b65a0d57306e138175209c0f652bdbfbda`;
- public Steering V2 owner-device proof: `release/friends-r1@2acd652f68d57497c8ce8886b2875789a70f4be3`;
- current public Mobile Driving V3 candidate: `release/friends-r1@fba33f2e3f51228773ce96e49f03d9f4f12b0a83`;
- owner-tested performance code: `checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c`;
- public A53 performance proof: `checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0`;
- public Camera 1B device proof: `release/friends-r1@4768abedaa67b7505ca963a0836879e42590b67d`;
- public fullscreen proof: `checkpoint/pages-fullscreen-v1-owner-validated-2026-08-15@8fe52a73554273fa710d2be2fdaf3a144d9056ba`;
- public known-good Friends rollback: `checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable R0 fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Only the lane named in `docs/PROJECT_STATE.md` is active ahead of `main`. Other old `work/*`, `candidate/*`, `repair/*` and `checkpoint/*` refs are historical/evidence unless explicitly reactivated.

## Current truth

Plac E2R, Offroad, the owner vehicle and full JSPREV2 scan form the working browser foundation. Performance foundation v1 is owner-validated on Galaxy A53 / normal Chrome for the current full textured JSPREV2 at render scale 1x and culling ON. Camera Manual Rig V1 and Fullscreen V1 are owner-accepted usability foundations.

Analog touch steering is a proven product direction. Steering Control V2 is owner-accepted as a **mobile control foundation with design still open**. Preserve its proven X-only `POSITION` semantics, neutral/release behavior, usable placement, 35-degree temporary product range and recoverable mobile Debug while exploring better control language.

The current owner-visible experiment is **Mobile Driving V3** and exists only as a noncanonical public device gate until owner validation. It deliberately combines two experiments while keeping physics/rig authority unchanged:

- steering: the same X-only `POSITION` gesture as V2, but a shallow panoramic steering-wheel arc rotates as visual/mechanical feedback instead of presenting a generic slider/rack;
- longitudinal: independent analog throttle and brake pedals, each 0..1, controlled by relative upward thumb travel;
- pedal gesture geometry is frozen at pointer-down, so active-pedal enlargement and neighbor shrink cannot feed back into the command value;
- the existing binary longitudinal path remains a fallback and wins when it has explicit demand;
- reverse remains the existing binary control in this slice. A D/R selector is deferred because direction changes under throttle/brake deserve their own semantics and safety gate.

Do **not** absorb V3 into private source or declare it owner-accepted until real phone/browser driving demonstrates that it beats the V2 baseline. If accepted, reconstruct/absorb the exact tested analog timeline, pedal adapter, host wiring and visual control layer as small commits rather than treating the public harness as source authority.

Final rig geometry, Ackermann/tie-rod authority, steering feedback/back-drive and final handling remain open; JURE owns rig authoring. The temporary 35-degree bridge is a JV-Web product range only.

The remaining formal promotion boundary is canonical repo execution/build with Node 24.16.0, npm 11.13.x, lockfile dependencies, TypeScript 7, Vite and real `box3d.js@0.0.2` before promotion to `main` / ordinary Friends release.

## Next direction

1. owner/device test Mobile Driving V3 on normal mobile Chrome, Offroad first;
2. compare the panoramic wheel-arc directly against Steering V2 for one-thumb precision, full-lock access, recapture, occlusion and portrait/landscape ergonomics;
3. test throttle and brake modulation at small/medium/full values, simultaneous steering + pedal use, release-to-zero and visual growth/shrink feedback;
4. classify steering and pedal results separately — one may be accepted while the other needs another iteration;
5. only after the pedal interaction is good, design D/R direction selection and any throttle/brake response curves or haptics;
6. after mobile control language stabilizes, revisit dynamic camera assists as an additive layer over the accepted manual camera.

Do not resume current-JSPREV2 micro-optimization by default. Do not broaden the 35-degree bridge into final steering/rig claims. Do not sacrifice proven input semantics merely to make a control animation look more automotive.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. code/tests for the current slice
4. `docs/ARCHITECTURE.md` only for stable boundaries
5. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance is relevant
