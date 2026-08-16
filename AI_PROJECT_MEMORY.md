# AI project memory — JV Web

Updated: 2026-08-16
Status: `MOBILE DRIVING CONTROLS SOURCE CANDIDATE IMPLEMENTED / CANONICAL + RENDERED GATES PENDING`

This file is a router only. Git/current source, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private authority: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active work lane: `work/mobile-driving-controls`;
- mobile-driving source candidate runtime checkpoint: `f56be8c85ea2b26533eee89c050b1b55cf21ec4b`;
- grounding/implementation base: `b453462cb9a0cbd28aadad500016d9be70e6756d`;
- clean product runtime under that grounding: `e04539c5132cd67c17bcfad86b2c9ae39c07ab51`;
- current public Friends: `release/friends-r1@fa00f4c3a3c19f1319302bc1728f9cf6490ce462`;
- immutable public fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Only the lane named in `docs/PROJECT_STATE.md` is active ahead of `main`. Historical `work/*`, V3/V3.1/rebuild, candidate/repair/checkpoint refs are evidence/donors unless explicitly reactivated.

## Protected product truth

Preserve:

- Plac E2R, Offroad, owner vehicle and approved JSPREV2;
- accepted A53 performance foundation for the tested Chrome/render-1x case;
- Camera Manual Rig V1;
- Fullscreen V1 mobile + desktop;
- Steering V2 X-only `POSITION [-1,+1]`, ordinary touch release/cancel -> `POSITION 0` self-centering;
- keyboard/digital priority while active;
- recoverable mobile Debug;
- temporary approximately +/-35-degree JV-Web steering bridge.

Final rig/steering/handling remain separate and compatible with the JURE authoring boundary.

## Mobile driving candidate now exists

Do not restart the architecture or return to Camera/V3 recovery.

Implemented in normal typed source:

- analog throttle/brake events in the existing deterministic longitudinal timeline;
- separated `PointerAnalogDriveAdapter` with frozen gesture geometry, independent multitouch ownership, non-stealing, fail-closed capture and lifecycle cleanup;
- permissive stateful D/R with same-timestamp re-sign of held throttle;
- steering V2 geometry frozen from pointer-down without changing V2 mapping or `POSITION 0` behavior;
- orientation/fullscreen structural changes fail closed for held continuous controls;
- generation-scoped `MobileDrivingUi` presentation with synchronous neutral reset and stale-callback rejection;
- pointer-frequency state changes coalesced to at most one RAF DOM/CSS commit;
- mechanical panoramic wheel, BRAKE-left/THROTTLE-right pedals and compact D/R selector;
- no compiled-runtime text surgery or alternate patch harness.

Exact product behavior target remains `docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md`.

## Evidence

Available chat runtime is noncanonical Node 22.16.0 / npm 10.9.2 / TS 5.8.3.

An isolated executable slice of the active input/presentation implementation compiles and **21/21 focused behavior tests PASS**, covering generation races, RAF coalescing, analog pedal behavior, D/R under throttle, multitouch/ownership, capture/lifecycle failures, V2 steering parity/frozen geometry and orientation/fullscreen fail-closed behavior.

No canonical CI/status exists for the current private head. Rendered Chromium proof is also pending because the local headless Chromium environment stalled before producing a reliable frame.

Scoped Codex-Security-style diff review found no confirmed security vulnerability; this was not a formal full-repository Codex Security scan.

## Next action

1. obtain canonical Node24/npm11/TS7/Vite8/real Box3D execution for the active branch;
2. run repository check + Friends/portable build;
3. fix only concrete failures;
4. run rendered browser smoke;
5. publish a normal exact Friends artifact only after build proof;
6. owner drives landscape candidate on Galaxy A53 and gives wheel/pedal feel feedback;
7. polish locally, then adapt portrait.

Do not replace the missing build/browser proof with another `replaceOnce()`/compiled-main harness.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. `docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md`
4. source/tests for the active gate
5. `docs/ARCHITECTURE.md` only when stable boundaries are needed
