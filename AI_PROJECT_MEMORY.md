# AI project memory — JV Web

Updated: 2026-08-16
Status: `FOUNDATION CLEANUP / PRE-IMPLEMENTATION GROUNDING COMPLETE / CANONICAL GATE PENDING`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private authority: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active cleanup lane: `work/foundation-cleanup`;
- clean product base for this transaction: `e04539c5132cd67c17bcfad86b2c9ae39c07ab51`;
- current public Friends: `release/friends-r1@fa00f4c3a3c19f1319302bc1728f9cf6490ce462`;
- that public tree is equivalent to owner-tested Steering V2 `2acd652f68d57497c8ce8886b2875789a70f4be3`;
- immutable public fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Only the lane named in `docs/PROJECT_STATE.md` is active ahead of `main`. Other `work/*`, `candidate/*`, `repair/*`, `noop-*` and `checkpoint/*` refs are historical/evidence unless explicitly reactivated.

## Protected product truth

The clean base contains the owner-accepted foundations that cleanup must preserve:

- Friends browser product with Plac E2R, Offroad, owner vehicle and full approved JSPREV2 on desktop/phone;
- A53 performance foundation v1 for the tested render-1x/culling-ON case;
- Camera Manual Rig V1;
- Fullscreen V1 mobile + desktop;
- Steering Control V2: one-thumb X-only analog `POSITION [-1,+1]`, pointer lift/cancel neutralizes to **`POSITION 0`** (self-centering) rather than changing normal touch behavior to semantic `RELEASE`, usable placement and recoverable mobile Debug;
- keyboard/digital steering keeps its existing priority while active;
- temporary JV-Web wheel steering range of approximately +/-35 degrees.

Final rig geometry, Ackermann/tie-rod authority, steering feedback/back-drive and final handling remain open. JURE owns final rig authoring. The 35-degree bridge is a product intermediate, not rig truth.

## Mobile driving target

The exact recovered target is in:

`docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md`

Key direction:

- keep V2 steering input semantics but present them as a shallow, wide projected steering-wheel mechanism that rotates for automotive feedback;
- visual active-state growth must never move/resize the hitbox used to calculate steering;
- independent analog throttle and brake use relative upward thumb travel from pointer-down (`0..1`), with origin/travel frozen at pointer-down;
- active pedal may grow/lift and its neighbor may shrink/dim, presentation only;
- steering/pedals must support independent multitouch ownership;
- use a compact `D/R` state selector; owner explicitly allows D<->R under throttle and at any speed for now;
- UI and command state for direction must have one input-layer authority;
- preserve simultaneous throttle+brake input even though current M6 drive physics remains brake-priority when both are non-zero;
- preserve keyboard/digital fallback unless product evidence justifies changing arbitration.

Grounding refinements for implementation:

- product entry is `product-main.ts -> await import("./main.js") -> installProductControls()`; driving input/HUD belongs to normal `main`/host/input source, not `product-controls` or a second entrypoint;
- input timelines receive real pointer events, but presentation should coalesce continuous HUD writes to at most one `requestAnimationFrame`; command-coupled wheel/pedal motion should not be hidden behind multi-frame CSS easing;
- presentation callbacks must be generation-scoped so disposal of a stale async host cannot overwrite a newer HUD state;
- on restart, detach/disable the old presentation sink before disposing the old host, then bind a fresh neutral mobile state (`steering 0`, `throttle 0`, `brake 0`, `D`) to the new generation;
- ordinary layout motion is handled by frozen gesture geometry; structural viewport/orientation/fullscreen transitions may deliberately fail closed for continuous gestures rather than remap a held command silently.

## V3 classification

V3/V3.1 is **historical donor evidence, not current product authority**.

The public failure `Driving V3 pedal reset: expected source fragment not found` was a brittle compiled-runtime patch-harness failure. Do not repeat `replaceOnce()` or text surgery against built `main.js`.

Useful donor points remain in Git:

- `db61b661...` analog foundation;
- `e651209f...` presentation;
- `c0b3ed22...` short-landscape hardening;
- `8736a2b6...` later post-rollback rebuild tip.

The later rebuild's separated `PointerAnalogDriveAdapter` and its lifecycle tests are useful donor mechanisms (frozen pedal geometry, source-specific release, multitouch ownership, fail-closed capture, D/R re-sign under held throttle). Reuse selectively after source-level review; do not restore the donor host/UI stack wholesale.

## Current workflow rule

Cleanup/grounding first, product implementation second.

During the remaining cleanup boundary:

1. keep one active lane;
2. preserve the now-locked mobile-driving target and evidence;
3. close the canonical toolchain gate when the required environment is available;
4. advance `main` only after that promotion gate;
5. retire the cleanup lane and stale historical branch names.

After cleanup, resume mobile controls on one ordinary work lane through small normal-source slices. Do not create per-version V3/V4 runtime branches. Experimental owner-device builds must come from typed private source through the normal build pipeline, not a second patched runtime.

Private GitHub Actions are currently blocked by billing/spending limits; do not create workaround workflows. This does not change product authority and must not stop source-level implementation/validation that does not require canonical release proof.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. `docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md` when working on controls
4. source/tests for the current slice
5. `docs/ARCHITECTURE.md` only for stable boundaries
6. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance is relevant
