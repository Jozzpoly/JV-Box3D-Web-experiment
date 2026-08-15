# AI project memory — JV Web

Updated: 2026-08-16
Status: `MOBILE DRIVING FEEL / STEERING V3 EXPLORATION`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active product lane: `work/friends-r1-usability`;
- Camera Manual Rig V1 absorbed at `997c9a34ea429220dbdb4f5408a0ac37200bd712`;
- fullscreen source checkpoint: `checkpoint/fullscreen-v1-owner-validated-2026-08-15@db55501342feacfb0f82099d7f47afe3a9756143`;
- Analog Steering V1 source: `d80d4636a1327c3aaf9e6689a95a7cb1d91f98b2`;
- public Analog Steering V1 device proof: `release/friends-r1@b6b91cad54966944af47f31d11721d2695066992`;
- Steering Control V2 UX/debug source: `b9dd4f98ecee192af3302150c95542c772033949`;
- temporary 35-degree drive bridge: `d6c646b65a0d57306e138175209c0f652bdbfbda`;
- public Steering V2 + 35-degree owner-device proof: `release/friends-r1@2acd652f68d57497c8ce8886b2875789a70f4be3`;
- Steering V2 owner checkpoint: `docs/OWNER_CHECKPOINTS.md` section `STEERING-CONTROL-V2`;
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

Analog touch steering is now a proven product direction. V1 established the functional `POSITION` path; V2 fixed the major mobile presentation/placement problems and the Debug escape problem. The owner tested V2 on phone in portrait and landscape, reported that steering works and is materially better than V1, and explicitly wants to continue refining touch driving. The owner also noted that mobile driving may become more pleasant than keyboard driving.

Steering Control V2 is therefore **accepted as a mobile control foundation, not as final design**. Its horizontal rack metaphor, placement and X-only input path may be replaced by a better steering-wheel/yoke/hybrid interaction as long as the new experiment preserves the proven precision, safe one-dimensional touch ownership, neutral behavior and mobile ergonomics.

The temporary steering-range bridge maps native full rack travel to approximately +/-35 degrees while leaving the pinned receipt and native rack travel untouched. It remains a JV-Web product bridge only; final rig geometry, Ackermann/tie-rod authority, steering feedback/back-drive and final handling remain open, with JURE owning rig authoring.

The next product problem is no longer merely "make analog steering work". It is **make mobile driving deliberately enjoyable**: steering control language, thumb ergonomics, visual/mechanical feedback, sensitivity, self-centering expectations, haptics where available, and later coherent analog longitudinal control.

Do not automatically turn a visual steering wheel into direct angular finger tracing. A phone steering control must be judged by sustained driving ergonomics, one-thumb reach, precision around center, full-lock access, ability to release/recapture without jumps, occlusion, portrait/landscape fit and whether the visual feedback accurately represents the actual command.

The remaining formal promotion boundary is canonical repo execution/build with Node 24.16.0, npm 11.13.x, lockfile dependencies, TypeScript 7, Vite and real `box3d.js@0.0.2` before promotion to `main` / ordinary Friends release.

## Next direction

1. preserve Steering V2 as the known-good comparison baseline;
2. explore multiple steering-control concepts before replacing it, prioritizing a rack-to-wheel hybrid, a compact yoke/rotary-feedback control and one deliberately different precision-first concept;
3. keep the proven `POSITION` semantics initially so visual/ergonomic experiments do not become simultaneous mechanics experiments;
4. evaluate concepts against portrait + landscape thumb reach, center precision, full-lock speed, release/recapture behavior, screen occlusion and whether feedback feels automotive rather than like a generic slider;
5. only after a steering interaction clearly beats V2 should it become a new device gate;
6. then design analog longitudinal input as a coherent throttle/brake/direction system with meaningful command feedback rather than independent generic buttons;
7. dynamic camera assists remain later and additive to the accepted manual camera.

Do not resume micro-optimizing current JSPREV2 by default. Do not broaden the 35-degree bridge into final steering/rig claims. Do not sacrifice the proven one-dimensional touch semantics merely to make a steering-wheel graphic rotate.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. code/tests for the current slice
4. `docs/ARCHITECTURE.md` only for stable boundaries
5. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance is relevant
