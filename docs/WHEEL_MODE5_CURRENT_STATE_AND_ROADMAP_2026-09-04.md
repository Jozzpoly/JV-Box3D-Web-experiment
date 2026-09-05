# Wheel mode5 — current state and research roadmap

Updated: 2026-09-05  
Owner: Jozz

Accepted product authority:

`main@5b28cc03d22264010680deb95a04abd04661bc22`

Research branch:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

Archival ancestor:

`work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`

Current closure:

`docs/WHEEL_MODE5_RQ2C4F_SOURCE_OWNERSHIP_CLOSURE_2026-09-05.md`

## 1. Current route

**RH0 is closed. The first post-RH0 orientation line reached a truthful zero-degree HOLD and routine micro-forensics are closed.**

The intended route was:

> hardened RH0 -> product-grounded yaw challenge -> qualify fully-free/local-guide 0-degree control -> only then execute `+3.5/-3.5 degree` yaw -> stop and classify.

The 0-degree control never passed the frozen actual-support rolling-slip gate. RQ2C3/RQ2C4 then repaired/localized the apparatus far enough to show that the residual is real rather than a heading-guide or support-witness bookkeeping artifact. RQ2C4F plus source review reached the useful causal boundary.

Therefore the route stops before yaw. Do not continue the matrix merely for completeness.

## 2. Evidence lanes remain separate

### Annular Contact Semantics

Full tire boundary and future side/inner/bore normal/witness/manifold semantics. Dynamic full-annular semantics remain open.

### Donor Outer-Carrier Dynamics

Recovered donor `b3Wheel` outer-P75 carrier used for bounded rolling/contact/traction/mount-orientation research. This lane does not validate full annular side/inner/bore behavior.

## 3. Retained pre-orientation evidence

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

A real `30 µrad` road-face transition produced one expected feature switch without material disturbance above matched control. Q1-A applies only to the tested bounded laboratory rolling-transition envelope.

### RQ2a / RQ2b

Bounded braking and drive qualified in the aligned flat-road apparatus. Retain the drive/brake sign-asymmetry as a sentinel; it is not current RQ2C4F causality because the orientation apparatus applies no drive/brake torque.

## 4. RH0 foundation

RH0.1–RH0.6 passed. The explicit RH0 suite is the hardened donor-carrier replay base; historical RQ patch chains remain provenance and must not be extended.

Canonical replay:

`16cdbc5946da76ace72ce9e3d11874baca8bf2e4 / 33963938554 / 101300561492`

Artifact `9968834538` reproduced canonical RQ0/RQ1c/RQ2a/RQ2b metrics essentially bit-for-bit.

## 5. Frozen orientation challenge

Grounding:

`docs/WHEEL_MODE5_RH0_5_ORIENTATION_CHALLENGE_AND_ERROR_BUDGET_2026-09-05.md`

Accepted `main` established steering around `+Y`, wheel spin around knuckle-local `Z`, and current temporary driving full lock of `35°`.

Frozen challenge:

`0° / +3.5° / -3.5°`

`3.5°` is 10% of the current `35°` driving full-lock scale.

Frozen research-instrument budgets:

- max settled axle-axis error `<= 0.035°`;
- max settled velocity-heading error `<= 0.035°`;
- actual-support rolling-slip gate `<= 0.002 mm/s`.

The historical 120 Hz guide error (`0.008525°`) is inside the challenge-derived angular budget. The failed historical `<100 µrad` gate is not a reason to reopen a stiffness sweep.

## 6. Zero-degree apparatus path

### RQ2C3 — direct local-axis scalar guide

The direct one-axis topology removed the helper-body carrier's millimetre-scale positional wandering, but soft guide relaxation still failed heading/slip gates.

Trusted source:

`09712c613218f5b6bb40927673f714fd364f2bdf / 33968208611 / 101311971290`

The helper-body chain remains closed.

### RQ2C4 — engine-native hard relax

Trusted source:

`13dfe885f8d949a25fa057f0cd47c7d86b95d817 / 33968699659 / 101313264377`

Hard-relax semantics made translational/heading control effectively exact:

- max heading error `1.33403e-8°`;
- max cross-heading speed `2.32831e-7 mm/s`;
- max cross-track `0.00683569 mm`;
- max plane separation `0.00380223 mm`.

Yet legacy max slip remained about `0.03469 mm/s`.

### RQ2C4D — actual support witness

Trusted source:

`8a65846ff4e2a41a096221e5908f3899f694461b / 33969662893 / 101315812890`

Actual support witness:

- mean abs `0.008013017 mm/s`;
- max abs `0.034093857 mm/s`.

The actual witness retains `98.2818%` of the legacy maximum, falsifying fixed-radius bookkeeping as the primary cause.

### RQ2C4E — angular decomposition

Trusted source:

`14b500c7f174c7107316fd9b31ef92b74964f501 / 33971215026 / 101319952137`

At peak witness:

- witness `+0.034093857 mm/s`;
- rolling pair (`COM translation + pure current-axle spin`) `+0.034570694 mm/s`;
- non-spin/nutation `-0.000464480 mm/s`.

The peak blocker is therefore overwhelmingly within incomplete cancellation of COM translation and pure current-axle spin.

### RQ2C4F — closure localization

Executed source / run / job:

`a7d3389edf6c51664d5615d657e879109b161420 / 33973506632 / 101326068112`

Trusted result head:

`5ffe5e0f206fc4d7f345ae4f66c7c086ab392ebc`

Artifact `9971633765`.

The initialized rolling pair is exactly closed. At peak rolling-pair residual:

- rolling pair `+0.034570694 mm/s`;
- COM tangential drift `+0.004529953 mm/s`;
- axle-spin-rate contribution `+0.030174406 mm/s`;
- geometric lever contribution `-0.000109348 mm/s`.

Spin-rate evolution contributes about `87.3%` of the peak rolling-pair magnitude. The actual-support gate remains failed by `17.0469x`.

## 7. Source-ownership closure

Exact pinned source review established:

- RQ2C4 applies no drive/brake torque;
- angular damping is zero by default and not overridden;
- rolling resistance is zero in the scenario;
- the base ParallelJoint leaves local-Z twist free;
- the scalar guide's direct angular lever impulses are perpendicular to its guide axis at exact alignment;
- contact tangential friction explicitly updates angular velocity through `invI * cross(r, P)` and is the unique obvious first-order direct axle-torque path in the aligned rolling geometry;
- finite orientation error, inverse-inertia coupling, joint warm-start/solve/relax and discrete gyroscopic integration mean the exact floating-point `Delta omega_A` budget is not proven to be contact-only.

Classification:

`RQ2C4F_SOURCE_OWNERSHIP_PARTIAL_CONTACT_FRICTION_DIRECT`

The current post-step harness cannot close the internal four-substep per-system angular budget. A transient solver accumulator could do so, but that information cannot change the immediate decision while the 0-degree gate already fails and no product integration is being decided.

Per the project operating contract, **do not open that diagnostic merely for completeness**.

## 8. Final orientation-line classification

- RH0 foundation — **PASS / CLOSED**;
- zero-degree heading/guide control — **apparatus behavior qualified**;
- zero-degree actual-support rolling-slip gate — **FAIL**;
- RQ2C4F localization — **TRUSTED_DIAGNOSTIC**;
- exact solver ownership budget — **PARTIAL / not closed**;
- `+3.5/-3.5 degree` yaw — **NOT EXECUTED / NOT VALIDATED**;
- product acceptance/integration — **NOT AUTHORIZED**.

This is a valid research outcome. The orientation line did not qualify, but it did identify where the blocker lives well enough to avoid blind continuation.

## 9. Explicitly not next

Do not automatically:

- build the solver-level ownership accumulator;
- execute `+3.5/-3.5 degree` yaw;
- rerun 240 Hz or sweep stiffness;
- relax/redefine the `0.002 mm/s` gate;
- add drive/brake torque, lateral slip demand, suspension/load transfer or camber to this closed line;
- reopen recycler forensics;
- resurrect the helper-body carrier;
- promote wheel-mode5 to product `main` or Owner Preview.

Reopen exact ownership only if a later project decision depends on salvaging this direct-guide qualification, or representative vehicle evidence makes the residual materially consequential.

## 10. Current next action

> **No automatic next wheel-mode5 micro-experiment. Preserve the trusted evidence, refresh/consolidate current documentation/provenance, then re-ground at the broader JV-Web level and choose the next work from current Owner priorities.**
