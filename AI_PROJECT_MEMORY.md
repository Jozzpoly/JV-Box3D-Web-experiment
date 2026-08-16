# AI project memory — JV Web

Updated: 2026-08-16
Status: `FOUNDATION CLEANUP / PRODUCT IMPLEMENTATION PAUSED`

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
- Steering Control V2: one-thumb X-only analog `POSITION [-1,+1]`, release-to-neutral, usable placement and recoverable mobile Debug;
- temporary JV-Web wheel steering range of approximately +/-35 degrees.

Final rig geometry, Ackermann/tie-rod authority, steering feedback/back-drive and final handling remain open. JURE owns final rig authoring. The 35-degree bridge is a product intermediate, not rig truth.

## Mobile driving target

The exact recovered target is in:

`docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md`

Key direction:

- keep V2 steering input semantics but present them as a shallow, wide steering-wheel arc/ellipse that rotates for automotive feedback;
- visual active-state growth must never move/resize the hitbox used to calculate steering;
- independent analog throttle and brake use relative upward thumb travel from pointer-down (`0..1`), with origin/travel frozen at pointer-down;
- active pedal may grow/lift and its neighbor may shrink/dim, presentation only;
- steering/pedals must support independent multitouch ownership;
- use a compact `D/R` state selector; owner explicitly allows D<->R under throttle and at any speed for now;
- UI and command state for direction must have one authority;
- preserve keyboard/digital fallback unless product evidence justifies changing arbitration.

## V3 classification

V3/V3.1 is **historical donor evidence, not current product authority**.

The public failure `Driving V3 pedal reset: expected source fragment not found` was a brittle compiled-runtime patch-harness failure. Do not repeat `replaceOnce()` or text surgery against built `main.js`.

Useful donor points remain in Git:

- `db61b661...` analog foundation;
- `e651209f...` presentation;
- `c0b3ed22...` short-landscape hardening;
- `8736a2b6...` later post-rollback rebuild tip.

Reuse selectively only after source-level review. Do not restore any donor wholesale.

## Current workflow rule

Cleanup first, product implementation second.

During cleanup:

1. keep one active lane;
2. normalize docs and branch authority around the clean base;
3. prune stale refs after history is safely retained;
4. validate the foundation before advancing `main`;
5. remove the cleanup lane after promotion.

After cleanup, resume mobile controls as small normal-source vertical slices. Experimental owner-device builds must come from typed private source through the normal build pipeline, not a second patched runtime.

Private GitHub Actions are currently blocked by billing/spending limits; do not create workaround workflows. This does not change product authority.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. `docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md` when working on controls
4. source/tests for the current slice
5. `docs/ARCHITECTURE.md` only for stable boundaries
6. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance is relevant
