# JV-Web — handoff

Updated: 2026-09-05
Owner: Jozz

Use this file for an actual handoff/continuation. A new chat is not by itself a new takeover campaign.

## 1. Current mode

JV-Web has deliberately separate truth layers:

- **accepted product/source authority:** `Jozzpoly/JV-Box3D-Web-experiment/main@5b28cc03d22264010680deb95a04abd04661bc22`;
- **retained wheel-mode5 research evidence:** `research/wheel-mode5-rq2c-orientation-2026-09-05`, currently closed at `RQ2C_ORIENTATION_HOLD`;
- **unpromoted post-wheel product calibration:** `work/spawn-landmark-calibration-2026-09-05`, a bounded spawn-location investigation that is not accepted product truth.

Do not treat either non-main branch as accepted product source. Do not treat the wheel HOLD stage as an active instruction to continue the RQ2C experiment sequence. Do not treat the spawn calibration branch as a selected road spawn or as promotion-ready.

The 2026-08-26 strategic cold-takeover campaign remains historical. JV-Web is a standalone browser product/R&D surface, separate from NextGen JV.

## 2. Fresh continuation order

Always resolve live Git first because exact heads may have moved.

Then read:

1. `AGENTS.md`;
2. `docs/PROJECT_STATE.md`;
3. if current spawn-location work is relevant: resolve `work/spawn-landmark-calibration-2026-09-05` live and read `docs/SPAWN_LANDMARK_CALIBRATION_2026-09-05.md` there;
4. if wheel-mode5 is relevant: `docs/evidence/WHEEL_MODE5_ACTIVE_RESEARCH_POINTER_2026-09-05.json`;
5. if wheel-mode5 is relevant: `docs/WHEEL_MODE5_CURRENT_STATE_AND_ROADMAP_2026-09-04.md`;
6. if exact current wheel closure matters: `docs/WHEEL_MODE5_RQ2C4F_SOURCE_OWNERSHIP_CLOSURE_2026-09-05.md`;
7. use `docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json` for exact wheel evidence/provenance;
8. older wheel/E2a2/RQ/RH0 documents only for a specific claim or apparatus dependency;
9. if product steering is involved: `docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md` and `docs/contracts/STEERING_COMMAND_CONTRACT_PL.md`.

Do not reconstruct or replay the entire research sequence unless newer live evidence conflicts with the current router.

## 3. Accepted product truth

Accepted `main` remains:

`5b28cc03d22264010680deb95a04abd04661bc22`

Steering I1 remains the accepted current-best baseline:

- touch release uses semantic `RELEASE` rather than hidden return-to-zero;
- hands-off graphical steering follows the physical rack;
- new grabs re-anchor to live rack position;
- 900 degrees is the current default/current-best, not permanently frozen;
- artificial centering is not an accepted Owner-facing product dependency;
- useful natural physical self-return remains unresolved.

No wheel-mode5 research change and no spawn-calibration candidate has been promoted into accepted product truth or canonical Owner Preview.

## 4. Wheel-mode5 research progression now retained as evidence

The old E2a2 recycler-forensics descent is closed bounded history. It established a real recycler/reprojection discrepancy in the studied transition, including roughly `0.118 mm` recycled-vs-fresh separation in trusted shadow evidence. This does not establish a global Box3D recycler bug or current product failure.

The project subsequently executed the representative RQ line:

- RQ0 aligned steady rolling — qualified within scope;
- RQ1 bounded road-normal transition — qualified within scope;
- RQ2a braking and RQ2b drive — qualified within scope, with drive/brake sign-asymmetry retained as a sentinel;
- RH0 Research Foundation Hardening — closed/pass;
- RQ2C orientation qualification — stopped at the zero-degree control before yaw.

Therefore any handoff text saying "RQ0 is next" is historical and must not be followed.

## 5. Current RQ2C closure

The intended yaw challenge remains historical/open evidence:

`0° / +3.5° / -3.5°`

with frozen research-instrument budgets:

- max settled axle-axis error `<= 0.035°`;
- max settled velocity-heading error `<= 0.035°`;
- actual-support rolling-slip gate `<= 0.002 mm/s`.

The zero-degree actual-support witness fails the slip gate:

- max witness slip `0.034093857 mm/s`;
- gate exceedance `17.0469x`.

RQ2C4 hard-relax made heading/plane control effectively exact, so the remaining blocker is not ordinary guide drift.

RQ2C4D showed the real support witness retains about `98.28%` of the legacy residual, so fixed-radius bookkeeping is not the primary cause.

RQ2C4E localized the peak primarily to the rolling pair rather than non-spin/nutation.

RQ2C4F localized the peak rolling-pair residual `0.034570694 mm/s` into:

- COM tangential drift `+0.004529953 mm/s`;
- axle-spin-rate contribution `+0.030174406 mm/s`;
- geometric-lever contribution `-0.000109348 mm/s`.

The axle-spin-rate term contributes about `87.3%` of the peak rolling-pair magnitude.

## 6. Source-ownership boundary

Source review of the exact pinned apparatus/solver established contact tangential friction as the unique obvious **first-order direct axial-torque path** in the aligned rolling geometry.

Do not overclaim this result. The existing post-step harness does not close a per-substep/per-subsystem `Delta omega_A` budget. Finite orientation error, inverse-inertia coupling, joint warm-start/solve/relax and gyroscopic integration mean exact numerical causal ownership remains partial without new transient solver-level instrumentation.

Current classification:

`RQ2C4F_SOURCE_OWNERSHIP_PARTIAL_CONTACT_FRICTION_DIRECT`

That instrumentation is deliberately **not opened by default** because it cannot currently change the project decision.

## 7. Current decision / stop boundary

Routine RQ2C orientation micro-forensics are closed at a truthful HOLD.

- RH0 foundation — **PASS / CLOSED**;
- zero-degree heading/guide behavior — **qualified within apparatus**;
- zero-degree actual-support rolling-slip gate — **FAIL**;
- RQ2C4D/E/F diagnostics — **trusted within scope**;
- exact solver ownership budget — **PARTIAL / not closed**;
- `+3.5°/-3.5°` yaw — **NOT EXECUTED / NOT VALIDATED**;
- wheel-mode5 product integration — **NOT AUTHORIZED**.

This is a valid negative/partial research outcome. Do not execute yaw merely to complete the planned matrix.

## 8. Post-wheel spawn-location audit

A broader product re-ground after closing RQ2C selected the Owner-reported poor spawn location as a bounded product problem worth investigating before reopening steering or wheel micro-forensics.

The work is isolated on:

`work/spawn-landmark-calibration-2026-09-05`

Closure/state record at the time of this handoff:

`docs/SPAWN_LANDMARK_CALIBRATION_2026-09-05.md`

Important retained findings:

- the earlier interpretation that ordinary Owner Preview spawned via `scanCenterSpawn()` was falsified by exact source `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`; default startup used `map` / `world.spawn`;
- accepted `world.spawn = { x: 0, y: 1.2, z: 0 }`, while the accepted JSPREV2 world transform starts around `z = 320`, so the stronger problem interpretation is spatial/semantic placement relative to the scan playground, not proven scan-center collision failure;
- accepted JSPREV2 metadata contains no semantic road/start landmark;
- two different geometry methods find several large stable flat regions, but neither can label one as a road;
- three spatially separated crosscheck-passing candidates exist only as opt-in `scan-cal-a/b/c` targets on the work branch;
- focused spawn tests and TypeScript typecheck pass;
- the observed full-suite red gate consists of seven pre-existing steering/mobile-UI assertions whose relevant source/test blobs are identical to accepted `main`;
- because that baseline `npm run check` stopped before `build:portable`, the candidate portable build remains **UNVERIFIED**.

Current spawn classification:

`PARTIAL / OWNER_CALIBRATION_READY / NOT_PROMOTABLE`

Do not call A/B/C roads, choose one algorithmically, weaken the existing canonical Owner Preview pinning, or promote this branch before a qualified candidate build and a bounded Owner semantic comparison.

## 9. Still open / not validated

Wheel/research:

- `+3.5°/-3.5°` orientation equivalence;
- exact numerical per-subsystem ownership of the RQ2C4F spin-rate drift;
- dynamic full-annular side/inner/bore contact/manifold semantics;
- representative lateral tire-force behavior;
- steer-under-load handling;
- camber thrust;
- suspension/chassis load transfer;
- near-limit traction/lockup/wheelspin;
- broad rough-road topology;
- production axle/suspension architecture;
- wheel-mode5 product integration and Owner acceptance;
- useful natural physical steering self-return.

Product/spawn:

- whether calibration A, B or C is visibly a useful Owner start location;
- whether any candidate is actually on/near the desired road;
- portable-build qualification of the spawn candidate branch;
- any decision to promote a selected spawn into accepted product `main`.

## 10. Git / Preview discipline

- `main` remains accepted product source authority.
- The RQ2C research branch owns only its executed scoped research evidence and routing docs.
- The spawn work branch owns only its bounded calibration analysis/candidates; it is not accepted product truth.
- `preview/owner-control` remains exact-source composition infrastructure, not authority.
- Do not fast-forward either non-main branch into `main` without a separate product-integration decision and representative validation.
- Before any write, re-fetch repo/ref/head.

## 11. Things a new agent must not infer

Do not infer that:

- RQ0 is still next;
- E2a2 should continue alphabetically;
- the current HOLD should automatically reopen RQ2C micro-forensics;
- solver-level spin ownership must be closed for completeness;
- `+3.5°/-3.5°` yaw should run despite the failed zero-degree gate;
- stiffness/contact parameters or the `0.002 mm/s` gate should be tuned to obtain a PASS;
- wheel-mode5 is accepted for product `main` or Owner Preview;
- the spawn calibration branch has selected or proved a road start;
- the seven full-suite steering/UI failures were caused by the spawn slice;
- the spawn candidate portable build passed;
- 900-degree steering or current M6 architecture is final forever;
- a new chat requires another broad takeover campaign.

## 12. Current router

> **Protect accepted `main`. Preserve the trusted wheel-mode5 evidence and keep RQ2C closed at zero-degree HOLD. Preserve the separate spawn-calibration evidence as PARTIAL / OWNER_CALIBRATION_READY / NOT_PROMOTABLE; if that product need is resumed, qualify the candidate build and use bounded Owner A/B/C semantic judgement rather than adding more heuristics. Do not choose future work by historical sequence inertia.**
