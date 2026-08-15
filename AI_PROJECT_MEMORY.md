# AI project memory — JV Web

Updated: 2026-08-15
Status: `FULLSCREEN V1 CLOSED / ANALOG STEERING NEXT`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active product lane: `work/friends-r1-usability`;
- Camera Manual Rig V1 absorbed at `997c9a34ea429220dbdb4f5408a0ac37200bd712`;
- fullscreen source checkpoint: `checkpoint/fullscreen-v1-owner-validated-2026-08-15@db55501342feacfb0f82099d7f47afe3a9756143`;
- owner-tested performance code: `checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c`;
- public A53 performance proof: `checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0`;
- public Camera 1B device proof: `release/friends-r1@4768abedaa67b7505ca963a0836879e42590b67d`;
- public fullscreen proof: `checkpoint/pages-fullscreen-v1-owner-validated-2026-08-15@8fe52a73554273fa710d2be2fdaf3a144d9056ba`;
- public known-good rollback: `checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable R0 fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Only the lane named in `docs/PROJECT_STATE.md` is active ahead of `main`. Other old `work/*`, `candidate/*`, `repair/*` and `checkpoint/*` refs are historical/evidence unless explicitly reactivated.

## Current truth

Plac E2R, Offroad, the current owner vehicle and full JSPREV2 scan form the working browser foundation. Performance foundation v1 is owner-validated on Galaxy A53 / normal Chrome for the current full textured JSPREV2 at render scale 1x and culling ON; do not generalize it to other devices/scales/world sizes.

Camera Manual Rig V1 is private source and owner-accepted as the manual navigation/inspection foundation. It provides responsive reset/framing, wide-range distance/clipping, orbit, vehicle-local focus pan, touch pinch+pan, desktop pan and wheel zoom. Future automatic assists must remain additive to manual calibration.

Fullscreen V1 is owner-validated on mobile Chrome and desktop through the isolated Pages gate. Enter/exit state worked correctly and several minutes of driving after transitions exposed no observed control/camera regression. The public proof is noncanonical device evidence, not ordinary Friends release promotion.

Current steering input is still predominantly digital at the device layer, but the mechanics contract already supports normalized `POSITION` steering in addition to `RATE`. The M6 controller maps `POSITION [-1,1]` to a rack target. The next product slice is therefore analog steering input + mobile joystick ergonomics while preserving fixed-step event ordering, source ownership and fail-safe release behavior.

Final rig/steering feedback/back-drive/handling remain open; JURE owns rig authoring. Do not treat joystick work as authority for final steering geometry or handling.

The remaining formal promotion boundary is canonical repo execution/build with Node 24.16.0, npm 11.13.x, lockfile dependencies, TypeScript 7, Vite and real `box3d.js@0.0.2` before promotion to `main` / ordinary Friends release.

## Next direction

1. analog steering input foundation and mobile joystick;
2. owner/device feel validation that separates input ergonomics from steering/handling debt;
3. then choose the next small usability slice from camera persistence/HUD friction or additive dynamic camera assists;
4. expand to broader analog/gamepad/longitudinal input only after the first steering path proves useful.

Do not resume micro-optimizing current JSPREV2 by default.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. code/tests for the current slice
4. `docs/ARCHITECTURE.md` only for stable boundaries
5. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance is relevant
