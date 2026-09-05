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

## 2. Wheel-mode5 research state

Research branch:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

Archival research ancestor:

`work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`

Canonical router/history:

`docs/WHEEL_MODE5_CURRENT_STATE_AND_ROADMAP_2026-09-04.md`

Active research pointer:

`docs/evidence/WHEEL_MODE5_ACTIVE_RESEARCH_POINTER_2026-09-05.json`

Current closure record:

`docs/WHEEL_MODE5_RQ2C4F_SOURCE_OWNERSHIP_CLOSURE_2026-09-05.md`

Machine-readable evidence ledger:

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

The ledger predates the final RQ2C4F/source-ownership closure and is explicitly marked for refresh by the active pointer. Until refreshed, the closure record + active pointer are newer authority for this final research frontier.

## 3. Current wheel-mode5 verdict

**Routine RQ2C orientation micro-forensics are closed at a truthful HOLD.**

This is not a successful yaw qualification.

Current classification:

- RH0 Research Foundation Hardening — **CLOSED / trusted**;
- direct local-axis guide topology — retained as research apparatus;
- RQ2C4 hard-relax heading/plane control — effectively exact within the executed 0-degree apparatus;
- 0-degree actual-support rolling-slip qualification — **FAIL**;
- RQ2C4D actual support witness — trusted;
- RQ2C4E angular decomposition — trusted;
- RQ2C4F rolling-pair closure localization — trusted;
- source-level causal ownership — **PARTIAL**;
- `+3.5°/-3.5°` yaw equivalence — **NOT EXECUTED / NOT VALIDATED**;
- wheel-mode5 product integration — **NOT AUTHORIZED**.

Do not automatically resume the RQ2C micro-probe chain from a fresh chat.

## 4. Retained bounded evidence

### RH0 foundation

RH0.1–RH0.6 passed. The explicit RH0 suite remains the hardened donor-carrier replay foundation; historical scenario-specific patch chains are provenance only.

Canonical suite replay:

`16cdbc5946da76ace72ce9e3d11874baca8bf2e4 / 33963938554 / 101300561492`

Artifact `9968834538` reproduced canonical RQ0/RQ1c/RQ2a/RQ2b behavior essentially bit-for-bit.

### Recycler/E2a2

A bounded recycler/reprojection discrepancy is real; trusted shadow evidence measured about `0.118 mm` recycled-vs-fresh separation in the studied difficult transition. Recycler micro-forensics remain closed unless later representative material evidence makes them decision-relevant.

### RQ0 / RQ1 / RQ2a / RQ2b

Aligned flat-road rolling, one bounded road-normal transition, bounded braking and bounded drive qualified within their laboratory scopes.

Retain the historical RQ2 drive/brake sign-asymmetry as a sentinel. It is **not** the explanation for the current RQ2C4F residual: the RQ2C3/RQ2C4 orientation apparatus applies no drive/brake torque.

### RQ2c0a 120 Hz

Corrected local-axis mount run measured max guide-axis error:

`148.785 µrad = 0.008525°`.

It truthfully failed its historical `<100 µrad` gate. That old gate was not product/challenge-derived and is no longer the routing target. The attempted 240 Hz follow-up never executed physics and remains apparatus-invalid provenance.

## 5. Zero-degree qualification chain

### RQ2C3 — direct local-axis scalar guide

The direct one-axis topology removed the helper-body carrier's millimetre-scale positional wandering, but the soft guide failed the frozen heading/slip qualification.

Trusted source:

`09712c613218f5b6bb40927673f714fd364f2bdf / 33968208611 / 101311971290`

### RQ2C4 — hard relax

Hard-relax semantics made the direct guide effectively exact in heading/plane control:

- max heading error `1.33403e-8°`;
- max cross-heading speed `2.32831e-7 mm/s`;
- max cross-track `0.00683569 mm`;
- max plane separation `0.00380223 mm`.

Legacy max slip remained about `0.03469 mm/s`.

Trusted source:

`13dfe885f8d949a25fa057f0cd47c7d86b95d817 / 33968699659 / 101313264377`

### RQ2C4D — actual support witness

Trusted source:

`8a65846ff4e2a41a096221e5908f3899f694461b / 33969662893 / 101315812890`

Actual geometric support point:

- mean absolute witness slip `0.008013017 mm/s`;
- max absolute witness slip `0.034093857 mm/s`.

The witness retains `98.2818%` of the legacy maximum, so fixed-radius approximation is not the primary blocker.

### RQ2C4E — angular decomposition

Trusted source:

`14b500c7f174c7107316fd9b31ef92b74964f501 / 33971215026 / 101319952137`

At peak actual witness:

- witness `+0.034093857 mm/s`;
- rolling pair (`COM translation + pure current-axle spin`) `+0.034570694 mm/s`;
- non-spin/nutation `-0.000464480 mm/s`.

The maximum blocker is therefore primarily inside incomplete cancellation of COM translation and pure current-axle spin. This is kinematic localization, not causal solver attribution.

### RQ2C4F — rolling-pair closure localization

Trusted result head:

`5ffe5e0f206fc4d7f345ae4f66c7c086ab392ebc`

Executed source / run / job:

`a7d3389edf6c51664d5615d657e879109b161420 / 33973506632 / 101326068112`

Artifact `9971633765`, digest:

`sha256:e0e32986831498022e0f05ae1bae039d3c6e48e136b335f90a3c4a588ff48c4a`

The initialized rolling pair is exactly closed. At the peak rolling-pair residual:

- rolling pair `+0.034570694 mm/s`;
- COM tangential drift `+0.004529953 mm/s`;
- axle-spin-rate contribution `+0.030174406 mm/s`;
- geometric lever contribution `-0.000109348 mm/s`.

The spin-rate term contributes about `87.3%` of that peak rolling-pair magnitude. The frozen actual-support witness remains `17.0469x` above the `0.002 mm/s` gate.

## 6. Source-ownership closure

Source review of the exact pinned solver/apparatus established:

- there is no drive/brake torque in RQ2C3/RQ2C4;
- default angular damping is zero and not overridden;
- rolling resistance is zero in this scenario;
- the base ParallelJoint leaves local-Z twist free;
- the scalar local-Z guide's direct angular lever impulses are perpendicular to its guide axis at exact alignment;
- pinned contact tangential friction explicitly changes angular velocity through `invI * cross(r, P)` and is the unique obvious **first-order direct axial-torque path** in the aligned flat-road apparatus;
- finite orientation error, inverse-inertia coupling, joint warm-start/solve/relax and discrete gyroscopic integration prevent an honest claim that every non-contact contribution to `dot(omega, actualAxle)` is numerically zero.

The existing post-step harness does not close a per-substep/per-subsystem `Delta omega_A` budget. Exact numerical causal ownership would require new transient solver-level instrumentation.

Classification:

`RQ2C4F_SOURCE_OWNERSHIP_PARTIAL_CONTACT_FRICTION_DIRECT`

That remaining instrumentation is **not opened by default** because it cannot currently change the project decision. This is the intended bounded stop, not a causal PASS.

## 7. Frozen orientation target remains historical/open evidence

The intended first yaw challenge remains:

`0° / +3.5° / -3.5°`

with challenge-derived research-instrument budgets:

- max settled axle-axis error `<= 0.035°`;
- max settled velocity-heading error `<= 0.035°`;
- actual-support rolling-slip gate `<= 0.002 mm/s`.

The 0-degree control fails the slip gate, so yaw remains locked. Do not run the pair merely to finish the planned matrix.

## 8. Still not validated

- `+3.5°/-3.5°` orientation equivalence;
- exact numerical per-subsystem ownership of the RQ2C4F spin-rate drift;
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

## 9. Do not automatically continue

Do not, merely because this branch exists:

- build the solver-level ownership diagnostic;
- run `+3.5°/-3.5°` yaw while the 0-degree gate fails;
- rerun 240 Hz or open a stiffness sweep;
- tune contact/solver parameters to force a PASS;
- relax/redefine the `0.002 mm/s` gate;
- add torque, lateral slip demand, suspension/load transfer or camber to this closed micro-line;
- reopen recycler forensics;
- resurrect the helper-body carrier;
- promote wheel-mode5 to `main` or Owner Preview.

Reopen exact spin-ownership forensics only if a later decision depends on salvaging this direct-guide qualification, or representative vehicle evidence makes the residual materially consequential.

## 10. Current project boundary / next move

> **Steering I1 remains accepted product truth. Wheel-mode5 RH0 is closed and the RQ2C orientation micro-line is now closed at a zero-degree HOLD: the real support-witness gate fails by 17.0469x, RQ2C4F localizes the dominant term to axle-spin-rate evolution, and source review identifies contact tangential friction as the first-order direct axial-torque path without claiming a closed numerical solver budget. Yaw and product promotion remain unauthorized. Do not continue microscopic wheel forensics by inertia; re-ground at the broader JV-Web level and choose the next work from current Owner priorities.**
