# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `MOBILE DRIVING CONTROLS / SOURCE CANDIDATE IMPLEMENTED / CANONICAL + RENDERED GATES PENDING`

## 1. Authority

```text
accepted private authority: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active work lane: work/mobile-driving-controls
active source candidate: work/mobile-driving-controls@f56be8c85ea2b26533eee89c050b1b55cf21ec4b
implementation base / grounding closure: b453462cb9a0cbd28aadad500016d9be70e6756d
clean product runtime under grounding: e04539c5132cd67c17bcfad86b2c9ae39c07ab51
public Friends branch: release/friends-r1@fa00f4c3a3c19f1319302bc1728f9cf6490ce462
immutable public fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

`main` and public Friends were not changed by the mobile-driving implementation session. Only `work/mobile-driving-controls` is active ahead of the grounding closure. Historical V3/V3.1/rebuild refs are donor evidence only.

Git/current source, reproducible execution evidence and direct owner observation outrank this file.

## 2. Protected product foundation

Preserve unless explicitly changed:

- Plac E2R, Offroad, owner vehicle and full approved JSPREV2;
- owner-validated A53 performance foundation for the tested Chrome/render-1x case;
- Camera Manual Rig V1;
- Fullscreen V1 mobile + desktop;
- Steering V2 semantics: one-thumb X-only `POSITION [-1,+1]` and normal pointer release/cancel self-centering through `POSITION 0`;
- keyboard/digital priority while active;
- recoverable mobile Debug;
- temporary approximately +/-35-degree JV-Web steering bridge.

Final rig/steering geometry and final handling remain outside this mobile-controls slice and stay compatible with the JURE authoring boundary.

## 3. Mobile driving source candidate now implemented

The target remains `docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md`.

Implemented on the active lane:

### Deterministic analog longitudinal input

- timestamped analog throttle and brake events extend the existing `LongitudinalInputTimeline`;
- digital keyboard demand remains authoritative while held and analog demand resumes afterwards;
- simultaneous throttle + brake input remains representable;
- current M6 physical brake-priority behavior was not changed.

### Analog pedal + D/R adapter

- independent throttle/brake pointer ownership;
- relative upward thumb travel from pointer-down maps to `0..1`;
- origin and travel geometry are frozen at pointer-down;
- second pointers cannot steal an already-owned pedal;
- capture failure is fail-closed;
- pointerup/cancel/lost capture/blur/hidden/pagehide/dispose release continuous demand;
- orientation/fullscreen structural changes fail closed for held continuous controls;
- compact `D/R` remains stateful across ordinary lifecycle releases;
- `D<->R` is intentionally allowed under held throttle and at any speed; held throttle is re-signed at the same logical timestamp.

### Steering V2 hardening

- X-only mapping/dead-zone and `POSITION 0` self-centering are preserved;
- steering hitbox geometry is read once at pointer-down and frozen for the active drag;
- presentation/layout changes therefore cannot alter steering under a stationary finger;
- orientation/fullscreen structural changes self-center the active gesture.

### Presentation boundary

`src/mobile-driving-ui.ts` is presentation-only. It does not produce physics commands.

- every host generation has explicit presentation identity;
- a new generation synchronously resets HUD state to steering 0 / throttle 0 / brake 0 / D before old-host disposal;
- stale callbacks from older generations are ignored;
- continuous pointer-driven visual updates are coalesced to at most one `requestAnimationFrame` commit;
- command-linked wheel/pedal indication has no multi-frame value easing.

### Mechanical mobile HUD

- stable outer touch geometry;
- shallow panoramic projected steering wheel with asymmetric spokes/index and rotating inner rotor;
- BRAKE left / THROTTLE right;
- mechanical pedal faces inside fixed acquisition wells;
- active pedal may lift/grow and its inactive peer may recede; both remain active visually when both inputs are held;
- compact D/R selector below the pedals;
- landscape and short-landscape layouts respect safe areas;
- no new mobile backdrop blur/filter-heavy presentation path.

Normal typed private source is used throughout. No compiled `main.js` text surgery, `replaceOnce()` delivery harness or alternate experimental runtime was introduced.

## 4. Validation evidence

### Executed noncanonical focused gate

Environment available in this chat runtime:

- Node 22.16.0;
- npm 10.9.2;
- TypeScript 5.8.3.

An isolated executable slice containing the active input/presentation implementations compiled successfully with TS 5.8.3.

Executed focused behavior tests: **21/21 PASS** covering:

- generation-safe synchronous reset and stale-generation rejection;
- multiple presentation changes -> one RAF commit with the latest state;
- simultaneous pedal presentation;
- analog pedal mapping and release;
- D->R under held throttle with same-timestamp re-sign;
- independent throttle + brake multitouch;
- non-stealing pointer ownership;
- pointer-capture failure fail-closed;
- lost capture / visibility release;
- V2 X mapping/dead-zone;
- ordinary steering release -> `POSITION 0`;
- frozen steering geometry after pointer-down;
- steering capture failure fail-closed;
- blur/dispose cleanup;
- orientation change releasing analog demand while preserving R;
- fullscreen change self-centering steering.

Historical donor tests and host contract tests are also present in the branch, but this document does not claim they were executed canonically in this runtime.

### Source/diff boundary

Relative to `b453462c...`, the active lane changes only:

- `index.html`;
- browser/vehicle host input wiring;
- longitudinal/input adapter source;
- `main.ts` mobile integration;
- mobile-driving presentation/CSS;
- focused tests.

No M6 physics implementation, renderer, camera, scan loader/data, network transport, dependencies or vehicle rig source was changed.

### Rendered gate

Rendered proof is still **PENDING**. A local headless Chromium synthetic attempt did not produce a reliable frame because Chromium stalled on the chat container's headless/DBus environment. Do not reinterpret that environment failure as product failure or rendered PASS.

### Canonical gate

Still required before promotion/publication:

- Node 24.16.0;
- npm 11.13.x;
- repository lockfile dependencies;
- TypeScript 7.0.2 / Vite 8.1.5;
- real `box3d.js@0.0.2` coverage;
- `npm run check`;
- Friends/portable build validation;
- exact source/artifact/rollback identity.

Private GitHub Actions currently provide no run/status for the active head. Do not invent CI proof or create workaround workflows merely to bypass the account Actions boundary.

## 5. Security boundary

Scoped diff review following the Codex Security diff-review discipline found no confirmed security vulnerability in the current mobile-controls delta:

- no credentials or private URLs/data;
- no new network origin or fetch path;
- no new dependency;
- no browser permission request;
- no `eval`/dynamic code execution;
- no new persistent storage/cookie path;
- input remains routed through normalized/timestamped product input rather than calling M6 physics directly;
- viewport/lifecycle loss fails closed for continuous demand.

This is a scoped source/diff review, not a formal full-repository Codex Security scan execution.

## 6. Next boundary

Do **not** restart M1, restore old V3/V3.1, return to Camera, or redesign the input architecture again.

The next work is execution/validation of the already-built candidate:

1. obtain a canonical checkout/toolchain and run repository check/build;
2. fix only concrete failures exposed by that gate;
3. run rendered browser smoke on the built product;
4. if healthy, produce a normal Friends artifact from exact private source and publish to the moving `release/friends-r1` line with rollback intact;
5. owner drives the candidate on Galaxy A53 in normal Chrome/fullscreen and judges wheel and pedals independently;
6. apply local visual/feel polish from real device evidence;
7. portrait adaptation follows after landscape owner validation.

If canonical execution remains the only blocker, keep this branch intact as the source candidate. Do not replace build validation with another compiled-runtime patch harness.
