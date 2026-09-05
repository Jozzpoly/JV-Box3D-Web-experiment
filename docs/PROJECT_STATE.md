# JV-Web — current project state

Updated: 2026-09-05  
Owner: Jozz

## 1. Product authority

Accepted source/product authority remains:

`Jozzpoly/JV-Box3D-Web-experiment/main@5b28cc03d22264010680deb95a04abd04661bc22`

Last Owner hands-on/current-best remains Steering I1:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

Observed 2026-08-31; consolidated 2026-09-01.

No wheel-mode5 laboratory result is product acceptance or promotion. Owner Preview remains publication/composition infrastructure only.

## 2. Wheel-mode5 branch transition

Closing discovery branch:

`work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`

Chosen hardened continuation branch:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

The new branch must be created from the exact RH0 closing head. The old E2a-named branch then becomes an archival research ancestor and should not receive further active experiments.

Canonical wheel router:

`docs/WHEEL_MODE5_CURRENT_STATE_AND_ROADMAP_2026-09-04.md`

Machine-readable evidence:

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

RH0 closure:

`docs/WHEEL_MODE5_RH0_CLOSURE_2026-09-05.md`

## 3. Evidence model

Keep separate:

- **Annular Contact Semantics** — full tire boundary and future side/inner/bore contact/manifold semantics;
- **Donor Outer-Carrier Dynamics** — recovered donor outer-P75 `b3Wheel` carrier used for bounded dynamic research.

Outer-carrier evidence does not validate full annular side/inner/bore behavior.

## 4. Current bounded findings

### Recycler/E2a2

A bounded recycler/reprojection discrepancy is real; trusted shadow evidence measured about `0.118 mm` recycled-vs-fresh separation in the studied difficult transition. Recycler micro-forensics remain closed unless later representative material evidence makes them decision-relevant.

### RQ0

Aligned flat-road rolling qualified within scope with zero dropout/churn, point count `1..1`, microscopic slip and a real friction positive control.

### RQ1 / Q1-A

A real `30 µrad` road-face transition produced one expected feature switch without material disturbance above matched control. Q1-A is limited to the tested **bounded laboratory rolling-transition envelope**.

### RQ2a / RQ2b

Bounded braking and drive qualified in the aligned flat-road apparatus.

Retained sign-asymmetry sentinel:

- brake max slip ≈ `0.0488758 mm/s`;
- drive max slip ≈ `3.67820 mm/s`;
- ratio ≈ `75.256x`;
- drive end-pulse mismatch ≈ `2.92418 mm/s`, then relaxes.

### RQ2c0a 120 Hz

Corrected local-axis mount run measured max guide-axis error:

`148.785 µrad = 0.008525°`.

It truthfully failed its historical predeclared `<100 µrad` gate. That gate was not derived from product/challenge geometry and is no longer the routing target.

The 240 Hz follow-up never executed physics and remains apparatus-invalid provenance.

## 5. RH0 Research Foundation Hardening

**Status: CLOSED.**

All gates passed:

- RH0.1 evidence ledger — PASS;
- RH0.2 invariant validation — PASS;
- RH0.3 explicit active harness — PASS;
- RH0.4 frozen replay/provenance cutover — PASS;
- RH0.5 physically grounded orientation/error budget — PASS;
- RH0.6 continuation branch decision — PASS.

Pre-closure foundation validation after apparatus cutover:

`33964189804` — SUCCESS.

Active donor-carrier apparatus:

- `tools/wheel-mode5/rh0/wheel-mode5-rq-suite.hpp`
- `tools/wheel-mode5/rh0/patch-rq-suite-adapter.py`
- `tools/wheel-mode5/rh0/wheel-mode5-rh0-canonical-rq-replay.mjs`
- `.github/workflows/wheel-mode5-rh0-canonical-rq-replay.yml`

Explicit suite replay:

`16cdbc5946da76ace72ce9e3d11874baca8bf2e4 / 33963938554 / 101300561492`

Artifact `9968834538` reproduced canonical RQ0/RQ1c/RQ2a/RQ2b behavior essentially bit-for-bit. Historical scenario-specific RQ patch chains remain provenance only.

## 6. Next research stage — bounded orientation/mount qualification

Grounding:

`docs/WHEEL_MODE5_RH0_5_ORIENTATION_CHALLENGE_AND_ERROR_BUDGET_2026-09-05.md`

Accepted `main` provides the scale and mechanism:

- current native max steering = `32°`;
- current JV-Web driving full lock = `35°`;
- source-registered FL steering axis = `+Y` through wheel center;
- wheel spin axis = knuckle-local `Z`.

First challenge:

`0° / +3.5° / -3.5°`

where `3.5°` is 10% of current `35°` driving full lock.

Challenge-derived research-instrument budget:

- max settled axle-axis error `<= 0.035° = 610.865 µrad`;
- max settled velocity-heading error `<= 0.035°`.

The prior 120 Hz error (`0.008525°`) is about `0.244%` of the intentional challenge and about `4.11x` inside this budget, so **120 Hz / damping 1.0 carries forward unchanged**. There is no current reason for a pre-emptive 240 Hz run.

## 7. Exact next apparatus change

The orientation experiment is rotated-heading RQ0 equivalence, not yet a lateral tire-force test.

For yaw `theta`, rotate the wheel body, rolling heading, axle axis, linear velocity and angular velocity consistently. Compute rolling slip in that rotated frame.

Critically:

- remove the remaining world `linearZ` lock;
- do not replace it with another world-axis constraint;
- retain only the static reference + local-axis `b3ParallelJoint` angular guide;
- allow wheel translation to be fully free.

Required ordering:

1. fully free `0°` control;
2. if it fails through cross-heading drift, classify apparatus-invalid and solve the local translational-mount problem;
3. only if 0° qualifies, interpret `+3.5° / -3.5°`;
4. stop after classification.

Initial gates per valid case:

- contact dropout `0`;
- feature changes `0`;
- point count `1..1`;
- Y range `0.50..0.90 mm`;
- max `|Vy|` `35..65 mm/s`;
- rotated-frame max slip `<=0.002 mm/s`;
- axle-axis error `<=0.035°`;
- velocity-heading error `<=0.035°`.

Use stable `atan2` diagnostics, not the invalidated `acos` small-angle telemetry.

## 8. Still not validated

- dynamic full-annular contact/manifold semantics;
- side/inner/bore solver behavior;
- representative lateral tire-force behavior;
- steer-under-load handling;
- camber thrust;
- suspension/chassis load transfer;
- near-limit traction/lockup/wheelspin;
- broad rough-road topology;
- production axle/suspension architecture;
- wheel-mode5 product integration and Owner acceptance.

## 9. Explicitly not next

Do not:

- rerun 240 Hz to satisfy the old 100 µrad gate;
- tune angular stiffness before the new challenge fails its derived budget;
- add torque, lateral slip demand, suspension/load transfer or camber in the same orientation qualification;
- reopen recycler forensics;
- extend historical RQ patch chains;
- promote wheel-mode5 to `main` or Owner Preview.

## 10. Fresh continuation

For wheel-mode5 research:

1. verify accepted `main` separately;
2. verify the hardened continuation branch;
3. read `AGENTS.md`, this file, the wheel router and RH0 closure;
4. validate the evidence ledger if changing evidence status;
5. use the explicit RH0 suite as the only active donor-carrier extension point;
6. execute exactly the bounded `0/+3.5/-3.5°` rotated-heading mount qualification;
7. stop and classify before expanding scope.

Current boundary:

> **Steering I1 remains accepted product truth. RH0 is closed. The next work is one bounded, product-grounded, 120 Hz rotated-heading mount qualification on a hardened continuation branch; no product promotion is authorized.**
