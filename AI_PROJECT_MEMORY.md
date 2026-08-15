# AI project memory — JV Web

Updated: 2026-08-15
Status: `STEERING CONTROL V2 + 35 DEG DEVICE GATE / OWNER VALIDATION PENDING`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active product lane: `work/friends-r1-usability`;
- Camera Manual Rig V1 absorbed at `997c9a34ea429220dbdb4f5408a0ac37200bd712`;
- fullscreen source checkpoint: `checkpoint/fullscreen-v1-owner-validated-2026-08-15@db55501342feacfb0f82099d7f47afe3a9756143`;
- Analog Steering V1 source: `d80d4636a1327c3aaf9e6689a95a7cb1d91f98b2`;
- public Analog Steering V1 device proof: `release/friends-r1@b6b91cad54966944af47f31d11721d2695066992`;
- Steering Control V2 UX/debug candidate: `b9dd4f98ecee192af3302150c95542c772033949`;
- temporary 35-degree drive bridge candidate: `d6c646b65a0d57306e138175209c0f652bdbfbda`;
- public Steering V2 + 35-degree device gate: `release/friends-r1@2acd652f68d57497c8ce8886b2875789a70f4be3`;
- owner-tested performance code: `checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c`;
- public A53 performance proof: `checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0`;
- public Camera 1B device proof: `release/friends-r1@4768abedaa67b7505ca963a0836879e42590b67d`;
- public fullscreen proof: `checkpoint/pages-fullscreen-v1-owner-validated-2026-08-15@8fe52a73554273fa710d2be2fdaf3a144d9056ba`;
- public known-good rollback: `checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable R0 fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Only the lane named in `docs/PROJECT_STATE.md` is active ahead of `main`. Other old `work/*`, `candidate/*`, `repair/*` and `checkpoint/*` refs are historical/evidence unless explicitly reactivated.

## Current truth

Plac E2R, Offroad, the current owner vehicle and full JSPREV2 scan form the working browser foundation. Performance foundation v1 is owner-validated on Galaxy A53 / normal Chrome for the current full textured JSPREV2 at render scale 1x and culling ON; do not generalize it to other devices/scales/world sizes.

Camera Manual Rig V1 and Fullscreen V1 are owner-accepted usability foundations. Future automatic camera assists must remain additive to manual calibration.

Analog Steering V1 has now passed a **narrow owner functional verdict** on mobile: the owner reported that driving is materially better and that the control action itself behaves appropriately. This does **not** accept the V1 circular visual design, placement or Friends-ready ergonomics. The screenshots also exposed two concrete V1 UI defects: hidden LEFT/RIGHT compatibility targets were resurrected by author CSS, and mobile Debug could become difficult or impossible to exit in portrait.

Steering Control V2 addresses those experience defects without changing the proven X-only POSITION input semantics. It replaces the circular visual language with a horizontal mechanical rack control, adds extra edge inset, forces hidden legacy targets out of render/hit-test, and keeps the Debug action rail above the mobile debug overlay so the same Debug button remains an exit path.

The owner also identified the current wheel lock as roughly 15 degrees and required at least 35 degrees. Recalculation from the pinned receipt and current provisional rack geometry gives approximately +14.01 / -14.47 degrees at native full rack travel. The private temporary drive bridge now preserves that source-derived curve but normalizes its amplitude to at least +/-35 degrees at full rack travel. The pinned receipt, native rack travel and JURE/final-rig authority are unchanged.

The current public gate composes the already working Analog Steering V1/Camera1B/fullscreen runtime with only Steering Control V2 CSS and the temporary 35-degree controller scaling. It is noncanonical device evidence. GitHub Pages built the exact public candidate `2acd652f68d57497c8ce8886b2875789a70f4be3`; runtime/device acceptance is still pending.

Final rig geometry, Ackermann/tie-rod authority, steering feedback/back-drive and final handling remain open; JURE owns rig authoring. The 35-degree bridge is a temporary JV-Web product range, not final geometry authority.

The remaining formal promotion boundary is canonical repo execution/build with Node 24.16.0, npm 11.13.x, lockfile dependencies, TypeScript 7, Vite and real `box3d.js@0.0.2` before promotion to `main` / ordinary Friends release.

## Next direction

1. owner/device test Steering Control V2 + 35-degree gate on mobile, portrait and landscape, Offroad first;
2. validate the new rack layout, removal of visible LEFT/RIGHT controls, Debug open/close path and visibly larger steering lock;
3. if the steering slice is accepted, record the durable owner checkpoint and then design analog longitudinal control as its own product slice;
4. analog longitudinal work should treat throttle/brake/reverse as a coherent driving-control problem with analog throttle and meaningful visual feedback, not as three independent generic buttons;
5. dynamic camera assists remain later and additive to the accepted manual camera.

Do not resume micro-optimizing current JSPREV2 by default. Do not broaden the 35-degree bridge into final steering/rig claims.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. code/tests for the current slice
4. `docs/ARCHITECTURE.md` only for stable boundaries
5. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance is relevant
