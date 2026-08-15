# AI project memory — JV Web

Updated: 2026-08-15
Status: `ANALOG STEERING V1 DEVICE GATE / OWNER VALIDATION PENDING`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active product lane: `work/friends-r1-usability`;
- Camera Manual Rig V1 absorbed at `997c9a34ea429220dbdb4f5408a0ac37200bd712`;
- fullscreen source checkpoint: `checkpoint/fullscreen-v1-owner-validated-2026-08-15@db55501342feacfb0f82099d7f47afe3a9756143`;
- analog steering V1 source candidate: `d80d4636a1327c3aaf9e6689a95a7cb1d91f98b2`;
- public analog steering device-gate candidate: `release/friends-r1@b6b91cad54966944af47f31d11721d2695066992`;
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

Analog Steering V1 is implemented but **not owner-accepted yet**. Private source now has a timestamped `POSITION` steering timeline, pointer joystick adapter, deterministic RATE/POSITION arbitration and a mobile analog steering control while keeping vehicle mechanics unchanged. Releasing the joystick commands neutral `POSITION 0`; explicit digital RATE commands retain step priority. Scoped noncanonical timeline/adapter checks passed before publication, and the isolated Pages candidate `b6b91cad54966944af47f31d11721d2695066992` built successfully. The current gate is real phone/browser boot + driving feel, not more infrastructure.

The public joystick gate composes the accepted Camera 1B runtime and fullscreen overlay, injects the POSITION/joystick modules before the import map, and fails closed if expected runtime patch points do not match. It is still noncanonical owner-device evidence and must not be mistaken for the exact Node24/npm11/TypeScript7/Vite build.

Final rig/steering feedback/back-drive/handling remain open; JURE owns rig authoring. Do not treat joystick work as authority for final steering geometry or handling.

The remaining formal promotion boundary is canonical repo execution/build with Node 24.16.0, npm 11.13.x, lockfile dependencies, TypeScript 7, Vite and real `box3d.js@0.0.2` before promotion to `main` / ordinary Friends release.

## Next direction

1. owner/device test Analog Steering V1 on mobile, Offroad first and then JSPREV2 if the control behaves correctly;
2. separate joystick ergonomics/input mapping defects from temporary steering/handling defects;
3. iterate only the smallest demonstrated problem until analog steering is genuinely useful;
4. after that choose between camera persistence/HUD friction and additive dynamic camera assists;
5. broaden to gamepad or analog longitudinal input only after the first steering path proves useful.

Do not resume micro-optimizing current JSPREV2 by default. Do not start another large workflow/documentation campaign while the current owner-visible gate is unresolved.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. code/tests for the current slice
4. `docs/ARCHITECTURE.md` only for stable boundaries
5. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance is relevant
