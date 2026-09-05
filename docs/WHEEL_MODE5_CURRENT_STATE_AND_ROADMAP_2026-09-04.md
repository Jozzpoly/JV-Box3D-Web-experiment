# Wheel mode5 — current state and research roadmap

Updated: 2026-09-05  
Owner: Jozz

Accepted product authority:

`main@5b28cc03d22264010680deb95a04abd04661bc22`

Closing discovery branch:

`work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`

Chosen continuation branch:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

Canonical evidence ledger:

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

RH0 closure:

`docs/WHEEL_MODE5_RH0_CLOSURE_2026-09-05.md`

## 1. Current route

**RH0 Research Foundation Hardening is closed.**

The next active research question is a bounded post-RH0 orientation/mount qualification. Do not return to the abandoned `120 -> 240 Hz until PASS` sequence.

Current route:

> Steering I1 remains last Owner hands-on product truth -> scoped wheel-mode5 evidence through RQ2c0a -> RH0 hardened evidence and apparatus -> product-grounded yaw challenge/error budget defined -> branch cutover -> execute one `0/+3.5/-3.5°` rotated-heading qualification -> stop and classify.

## 2. Evidence lanes remain separate

### Annular Contact Semantics

Full tire boundary and future side/inner/bore normal/witness/manifold semantics. Dynamic full-annular semantics remain open.

### Donor Outer-Carrier Dynamics

Recovered donor `b3Wheel` outer-P75 carrier used for bounded rolling/contact/traction/mount-orientation research. This lane does not validate full annular side/inner/bore behavior.

## 3. Current trusted donor-carrier evidence

### Recycler/E2a2

A bounded recycler/reprojection discrepancy is real; trusted shadow evidence measured about `0.118 mm` recycled-vs-fresh separation in the studied difficult transition. Recycler micro-forensics remain closed unless later representative material evidence makes them decision-relevant.

### RQ0

Aligned flat-road rolling qualified within scope:

- zero dropout/churn;
- point count `1..1`;
- microscopic rolling slip;
- zero-spin positive control proves tangential friction coupling.

The historical world-axis planar guide is not a representative non-world-aligned mount.

### RQ1 / Q1-A

A real `30 µrad` road-face transition produced one expected feature switch without material disturbance above matched control. Q1-A applies only to the tested **bounded laboratory rolling-transition envelope**.

### RQ2a / RQ2b

Bounded braking and drive qualified in the aligned flat-road apparatus.

Retained sentinel:

- braking max slip ≈ `0.0488758 mm/s`;
- drive max slip ≈ `3.67820 mm/s`;
- drive/brake ratio ≈ `75.256x`;
- drive end-pulse mismatch ≈ `2.92418 mm/s`, then relaxes.

## 4. RQ2c0 historical boundary

Corrected 120 Hz local-axis `b3ParallelJoint` evidence:

`3af93f9efab3ce84a51aaaf2e49265d82062d561 / 33958566941 / 101286243228`

Measured max guide-axis error:

`148.785 µrad = 0.008525°`.

That run truthfully failed its predeclared `<100 µrad` gate. The old gate was later found not to be derived from product/challenge geometry, so it must not drive a stiffness campaign.

The attempted 240 Hz follow-up never executed physics. It is apparatus-invalid provenance, not a 240 Hz physical result.

## 5. RH0 closure state

All RH0 gates are complete:

- **RH0.1 evidence ledger — PASS**
- **RH0.2 invariant validation — PASS**
- **RH0.3 explicit active harness — PASS**
- **RH0.4 frozen replay/provenance cutover — PASS**
- **RH0.5 challenge-derived orientation/error budget — PASS**
- **RH0.6 continuation branch decision — PASS**

Active apparatus after cutover:

- `tools/wheel-mode5/rh0/wheel-mode5-rq-suite.hpp`
- `tools/wheel-mode5/rh0/patch-rq-suite-adapter.py`
- `tools/wheel-mode5/rh0/wheel-mode5-rh0-canonical-rq-replay.mjs`
- `.github/workflows/wheel-mode5-rh0-canonical-rq-replay.yml`

Explicit-suite replay:

`16cdbc5946da76ace72ce9e3d11874baca8bf2e4 / 33963938554 / 101300561492`

Artifact `9968834538` reproduced canonical RQ0/RQ1c/RQ2a/RQ2b metrics essentially bit-for-bit. Historical RQ patch chains remain provenance and must not be extended.

## 6. Product-grounded next orientation qualification

Grounding document:

`docs/WHEEL_MODE5_RH0_5_ORIENTATION_CHALLENGE_AND_ERROR_BUDGET_2026-09-05.md`

Accepted `main` establishes:

- native `maxSteeringAngleDegrees = 32`;
- current JV-Web temporary driving full lock = `35°`;
- source-registered FL steering axis = `+Y` through wheel center;
- wheel spin axis = knuckle-local `Z`.

The first non-world-aligned challenge is therefore steering yaw, not arbitrary camber.

### Frozen orientation set

`0° / +3.5° / -3.5°`

`3.5°` is exactly 10% of the current `35°` driving full-lock scale.

### Challenge-derived apparatus budget

Intentional angle:

`3.5° = 0.0610865 rad`

Maximum settled angular-guide error:

`0.035° = 610.865 µrad`

Maximum settled velocity-heading error:

`0.035°`

This is a 100:1 intentional-angle/instrument-error separation criterion for this experiment, not a product suspension tolerance.

The previous 120 Hz guide error (`0.008525°`) is about `0.244%` of the challenge and about `4.11x` inside this new budget. Therefore carry **120 Hz / damping 1.0 unchanged** into the first post-RH0 run.

## 7. Exact next experiment

The next stage is **rotated-heading RQ0 equivalence**, not a lateral tire-force test.

For yaw `theta`:

- rotate wheel body by `theta` around world `Y`;
- derive rolling heading `H` by rotating `+X` with the same quaternion;
- derive axle axis `A` by rotating `+Z` with the same quaternion;
- initial `V = 1 m/s * H`;
- initial `W = -(1/R) * A`;
- evaluate rolling slip as `dot(V,H) + R*dot(W,A)`.

### Critical apparatus change

Remove the remaining world `linearZ` lock. It is invalid once legitimate heading has a world-Z component.

Do not immediately replace it with another world-axis constraint. Keep only the static orientation reference + local-axis `b3ParallelJoint` and allow translation to be fully free.

Required ordering:

1. execute fully translational-free `0°` control;
2. if it fails through cross-heading drift, classify apparatus-invalid and design a mechanically local translational guide;
3. only if `0°` qualifies, interpret `+3.5° / -3.5°`;
4. stop after classification.

### Gates

For each valid case:

- contact dropouts `0`;
- feature changes `0`;
- point count `1..1`;
- RQ0-like Y range `0.50..0.90 mm`;
- max `|Vy|` `35..65 mm/s`;
- rotated-frame max rolling slip `<=0.002 mm/s`;
- axle-axis error `<=0.035°`;
- velocity-heading error `<=0.035°`.

Use stable `atan2` diagnostics, not the invalidated small-angle `acos` approach.

## 8. Failure routing

- `0°` free-translation control fails -> **APPARATUS_INVALID**, translational mount question opens.
- angular error exceeds `0.035°` -> angular guide is insufficient for this challenge; only then does a stiffer/different guide become decision-relevant.
- heading error exceeds `0.035°` while angular guide passes -> free translation is insufficient; design a local translational carrier rather than restoring a world lock.
- contact/rolling fails while mount and heading gates pass -> genuine outer-carrier evidence worth reproducing/localizing.
- `+/-3.5°` differ materially -> investigate possible world-axis/sign asymmetry before increasing severity.

## 9. Continuation branch decision

The E2a-named discovery branch closes as an archival research ancestor after final foundation validation.

Create and use:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

from the exact RH0 closing head.

This branch boundary is semantic/provenance hardening. It intentionally preserves Git ancestry and the pinned E1/E2a dependencies rather than rebuilding a guessed subset from `main`.

## 10. Explicitly not next

Do not:

- rerun 240 Hz merely to satisfy the historical 100 µrad gate;
- introduce a stiffness sweep;
- add drive/brake torque to the orientation qualification;
- test lateral slip-angle force in the same stage;
- add suspension/chassis/load transfer;
- open camber or rough-road severity simultaneously;
- reopen recycler forensics;
- extend historical scenario-specific patch chains;
- promote wheel-mode5 to product `main` or Owner Preview.

## 11. Product boundary

Accepted product authority remains `main@5b28cc03d22264010680deb95a04abd04661bc22` and Steering I1 remains the last Owner hands-on product acceptance.

Current next action:

> **Finish branch cutover, then execute exactly one bounded 120 Hz fully-free `0/+3.5/-3.5°` rotated-heading mount qualification through the explicit suite.**
