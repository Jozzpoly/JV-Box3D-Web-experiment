# Steering I1 — current-best baseline

Date: 2026-09-01
Owner: Jozz
Status: CURRENT-BEST / SCOPED OWNER ACCEPTANCE

This baseline records the steering-input/presentation result reached on 2026-08-31 and consolidated on 2026-09-01. It is intentionally narrower than a claim that steering physics is finished.

## FACT

- Direct Rotation and Relative-X remain explicit touch steering interaction modes.
- Pointer release defaults to semantic `RELEASE`: touch input relinquishes steering ownership instead of commanding a hidden return to zero.
- While touch steering is hands-off, the on-screen steering wheel presentation follows the live physical rack state.
- A new Direct/Relative-X grab re-anchors to the current normalized physical rack position, preventing command/presentation offset after physics moves the steering.
- Touch wheel range is explicit and configurable with 360/540/720/900/1080 degree presets.
- The current default is 900 degrees total wheel travel.
- Wheel-range choice is stored in `sessionStorage`; invalid/stale payloads fall back safely.
- Artificial centering is not an Owner-facing product setting. The adapter keeps an explicit artificial-centering path only as an internal/control specimen for tests and comparison.
- No vehicle topology, wheel/contact backend, drivetrain, rig geometry, scan geometry or steering-return physics was changed by this slice.

## EXECUTED EVIDENCE

The exact Owner Preview candidate used for acceptance passed the canonical Owner Preview pipeline, including:

- exact source checkout;
- canonical Node/npm setup;
- dependency install;
- TypeScript typecheck;
- portable build and validation/test suite;
- build-identity verification;
- composition with the unchanged accepted JSPREV2 static layer;
- executable-layer unchanged check;
- GitHub Pages deployment.

The post-feedback consolidation audit removed the unneeded Owner-facing artificial assist while preserving default natural `RELEASE`. It also found and restored two explanatory F4 comment blocks that had been accidentally dropped by full-file replacements; runtime behavior in those locations had not changed. The corrected source passed canonical source/build validation before documentation consolidation.

## OWNER-OBSERVED

On the Owner Preview, with 900-degree Direct steering:

- hands-off wheel/rack synchronization behaved correctly;
- release -> physics changes steering -> re-grab did not create the previous wheel/wheel-angle offset or jump;
- the driving feel was reported as substantially better than before and better than expected;
- the previous excessive-sensitivity problem was no longer the dominant issue;
- 900 degrees is currently being learned/used rather than compared against the other presets.

Owner did not use artificial centering and does not want to depend on it.

## NOT VALIDATED / NOT FROZEN

- 900 degrees is **current-best/default**, not a final permanently approved steering ratio.
- 360/540/720/1080 presets are available and machine-covered but have not been Owner-compared for feel.
- Changing range during an already-active steering gesture is not an accepted interaction contract; avoid treating that edge as validated until it matters.
- Desktop session persistence has supporting Owner observation; mobile persistence was not separately Owner-validated in this checkpoint.
- The Owner could not perform a broad whole-product regression pass during this checkpoint. Acceptance is scoped to the steering behaviors actually exercised plus canonical automated/build evidence.
- Natural physical steering self-return/self-alignment remains unresolved. The current mechanism provides essentially no useful natural steering-wheel return under the tested conditions.
- This baseline does not authorize a fake spring/servo/automatic centering substitute for missing physical self-return.

## CURRENT PRODUCT TRUTH

For ordinary touch driving:

`active touch -> POSITION ownership -> pointer release -> RELEASE -> physical rack is truth -> next grab re-anchors to physical rack`

The graphical steering wheel is therefore a control while held and a presentation of physical steering state while released.

## NEXT RESEARCH PRESSURE

A future R2 steering-mechanics investigation may ask why the current geometry/contact/constraint system produces little or no natural self-return and what physically justified changes would improve it. That is a separate research slice and must not be smuggled into UI/input polish.

No next implementation is selected by this baseline.
