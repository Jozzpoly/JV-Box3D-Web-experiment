# AI project memory — JV Web

Updated: 2026-08-16
Status: `MOBILE DRIVING V3.1 SOURCE CANDIDATE / DEVICE GATE REBUILD`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active product lane: `work/friends-r1-usability`;
- current active V3.1 candidate: `c0b3ed2223a451cdacfd79f179efd2b88be7434f`;
- Camera Manual Rig V1 absorption: `997c9a34ea429220dbdb4f5408a0ac37200bd712`;
- fullscreen source checkpoint: `checkpoint/fullscreen-v1-owner-validated-2026-08-15@db55501342feacfb0f82099d7f47afe3a9756143`;
- Analog Steering V1 source: `d80d4636a1327c3aaf9e6689a95a7cb1d91f98b2`;
- Steering Control V2 UX/debug source: `b9dd4f98ecee192af3302150c95542c772033949`;
- temporary 35-degree drive bridge: `d6c646b65a0d57306e138175209c0f652bdbfbda`;
- public Steering V2 owner-device proof: `release/friends-r1@2acd652f68d57497c8ce8886b2875789a70f4be3`;
- superseded failed public Mobile Driving V3 gate: `release/friends-r1@e94ab696d05b4a976a2673a69e40d5ddffea94d7`;
- owner-tested performance code: `checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c`;
- public A53 performance proof: `checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0`;
- public Camera 1B device proof: `release/friends-r1@4768abedaa67b7505ca963a0836879e42590b67d`;
- public fullscreen proof: `checkpoint/pages-fullscreen-v1-owner-validated-2026-08-15@8fe52a73554273fa710d2be2fdaf3a144d9056ba`;
- public known-good Friends rollback: `checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable R0 fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Only the lane named in `docs/PROJECT_STATE.md` is active ahead of `main`. Other old `work/*`, `candidate/*`, `repair/*` and `checkpoint/*` refs are historical/evidence unless explicitly reactivated.

## Current truth

Plac E2R, Offroad, the owner vehicle and full JSPREV2 scan form the working browser foundation. Performance foundation v1 is owner-validated on Galaxy A53 / normal Chrome for the current full textured JSPREV2 at render scale 1x and culling ON. Camera Manual Rig V1 and Fullscreen V1 are owner-accepted usability foundations.

Analog touch steering is a proven product direction. Steering Control V2 is owner-accepted as a **mobile control foundation with design still open**. Preserve its X-only `POSITION` semantics, neutral/release behavior, usable placement, 35-degree temporary product range and recoverable mobile Debug.

### Mobile Driving V3.1 candidate

The first public V3 gate at `e94ab696...` failed before pedal runtime with `Driving V3 pedal reset: expected source fragment not found`. Classify that result as a **public text-patch harness failure**, not as evidence against analog pedals or the steering concept. Do not repair that gate by adding more compiled-runtime `replaceOnce()` surgery.

After that failure, V3.1 was moved into normal typed private source on the active work lane as three small commits:

1. `db61b6610428032e17676583dc36cf84d44e84d1` — analog throttle/brake events integrated into the existing deterministic `LongitudinalInputTimeline`; pointer pedal gestures; live D/R direction switching;
2. `e651209f3e67439ed1ffeafedeb1c0f919208020` — `MobileDrivingV3Ui`, panoramic rotating steering-wheel presentation, analog pedal feedback and stable outer hitbox design;
3. `c0b3ed2223a451cdacfd79f179efd2b88be7434f` — V3 short-landscape authority over the legacy three-button `!important` layout.

This is **source absorption into the experimental work lane**, not owner acceptance and not promotion to `main`.

Current V3.1 interaction intent:

- steering keeps the proven one-thumb X-only normalized `POSITION [-1,+1]` gesture and temporary 35-degree full-lock bridge;
- the shallow panoramic wheel visual rotates for automotive/mechanical feedback without changing steering gesture geometry;
- throttle and brake are independent analog pedals controlled by relative upward thumb travel from the pointer-down origin;
- pedal travel geometry is frozen at pointer-down; active-pedal growth and neighbor shrink are presentation only;
- D/R is a state selector. **Owner decision: allow D↔R switching while throttle is active and regardless of speed for now.** Do not insert neutral, throttle-release or speed-lock safety rules unless device testing later demonstrates a real need;
- throttle and brake may coexist; do not add artificial interlocks without evidence.

Recovered noncanonical evidence for the exact V3.1 input blobs: focused analog/pointer suite `22/22 PASS` plus TypeScript 5.8 compile PASS. Exact local/Git blob identity was rechecked for the longitudinal timeline, pointer adapter, V3 UI and V3 CSS. This does not satisfy the canonical Node24/npm11/TS7/Vite gate.

Rendered Chromium proof is currently **environment-blocked** in the agent container: two headless attempts timed out before DOM output. Do not classify this as a product failure and do not spend repeated iterations repairing the container browser.

The next public device gate must be rebuilt from the V3.1 source candidate and should avoid runtime text surgery on compiled product modules. Prefer complete verified source modules/static gate files with explicit SHA identity and fail-closed contracts. The old `driving-v3-test/` remains failure evidence only.

Final rig geometry, Ackermann/tie-rod authority, steering feedback/back-drive and final handling remain open; JURE owns rig authoring. The temporary 35-degree bridge is a JV-Web product range only.

The remaining formal promotion boundary is canonical repo execution/build with Node 24.16.0, npm 11.13.x, lockfile dependencies, TypeScript 7, Vite and real `box3d.js@0.0.2` before promotion to `main` / ordinary Friends release.

## Next direction

1. validate the exact `c0b3ed22...` V3.1 candidate as far as the available environment permits; do not reopen old V3 patch surgery;
2. rebuild one isolated public V3.1 owner-device gate from the typed source candidate, with exact source/module identity and the accepted V2/Camera/fullscreen/35-degree basis preserved;
3. owner tests real mobile Chrome: steering precision/recapture, analog throttle/brake modulation, simultaneous steer+pedal, D/R under throttle, portrait/landscape ergonomics and visual feedback;
4. classify steering, pedals and D/R independently — one may pass while another needs iteration;
5. only after the driving-control language stabilizes, polish response curves/haptics and then return to additive dynamic camera assists.

Do not resume current-JSPREV2 micro-optimization by default. Do not broaden the 35-degree bridge into final steering/rig claims. Do not sacrifice proven input semantics merely to make a control animation look more automotive.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. code/tests for the current slice
4. `docs/ARCHITECTURE.md` only for stable boundaries
5. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance is relevant
