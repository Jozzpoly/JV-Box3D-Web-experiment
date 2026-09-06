# JV-Web — current project state

Updated: 2026-09-06
Owner: Jozz
Status: `BASELINE HARDENING / REPOSITORY CONSOLIDATION IN PROGRESS`

This is the single live current-state router for JV-Web. Git/current source, exact executed evidence and direct Owner judgement outrank this document.

## 1. Current boundary

JV-Web remains the browser product line for Jozz Vehicle and a practical R&D surface. It is not NextGen JV Lite.

The current stage is a bounded repository/baseline hardening campaign before opening another substantial R&D line. The campaign exists to restore one trustworthy execution baseline, reduce stale repository topology and make historical evidence immutable without keeping old work branches alive.

A separate spawn-landmark capture line became actively edited in parallel during this cleanup. Repository maintenance must not freeze, rewrite or delete that active branch merely to achieve a smaller branch count.

Do not use this maintenance stage to alter accepted vehicle behavior, reopen closed research, upgrade Box3D opportunistically or redesign the product.

## 2. Canonical product authority

Live source/documentation authority:

`Jozzpoly/JV-Box3D-Web-experiment/main`

Pre-maintenance audited head:

`42bc652c9051edb1581b5d539f012ac78d165a66`

Accepted executable/current-best product snapshot remains:

`529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`

Detailed Steering I1 baseline:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

Accepted Steering I1 facts include:

- Direct Rotation and Relative-X remain explicit touch steering choices;
- ordinary pointer/lifecycle release uses semantic `RELEASE`, not hidden return-to-zero;
- hands-off presentation follows physical rack state and re-grab anchors to that state;
- supported wheel ranges are 360/540/720/900/1080 degrees;
- 900 degrees is current default/current-best;
- artificial centering is not an Owner-facing product setting;
- useful natural physical self-return remains unresolved.

No spawn, visual-wheel or wheel-mode5 experiment is accepted product truth.

## 3. Owner Preview composition

Operational composition lane at this audit:

`preview/owner-control@afcde29ae3dbc6c490390eb56fa906eab7a428eb`

It pins exact sources rather than treating experiment branches as authority:

- accepted root: `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`;
- wheel-mode5 A/B/C/D: `d52aa3776e022649af21cddc6d9dcfae3bac42f9`;
- spawn A/B/C: `77fcd0b5aec2cb1cb1acc92a616f611d18a3b38b`;
- visual-wheel A/B/C: `08b43ac0a40be79be5f89a58582d7107e9e5ae06`;
- accepted JSPREV2: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`.

Preview is composition/publishing infrastructure, not product source authority.

## 4. Active, closed and unpromoted evidence

### Active spawn-landmark capture

Live workspace:

`work/spawn-landmark-capture-2026-09-06`

Classification:

`ACTIVE / UNPROMOTED / PRESERVE DURING CLEANUP`

This branch was created from the spawn-calibration line and advanced during the repository cleanup itself. Current commits add a bounded landmark-capture helper/UI plus tests, and explicitly narrow capture to `scan-cal-a/b/c` rather than ordinary `scan` startup.

Its head is intentionally **not frozen in the cleanup manifest** because another active execution lane is editing it concurrently. Cleanup may assert that the branch still exists, but must not move, delete or force-with-lease it. Re-ground its live head before any future work or promotion decision.

### Wheel mode5

Research closure head:

`c26e6c610815a0286a0139c2ff50a0a03b040e02`

Classification:

`RQ2C_ORIENTATION_HOLD / CLOSED`

The zero-degree actual-support rolling-slip gate failed at max witness slip `0.034093857 mm/s` against `0.002 mm/s` (`17.0469x`). Planned +/-3.5 degree yaw was therefore not executed. Do not resume this sequence for completeness or tune the apparatus to force PASS.

The branch is historical evidence, not an active R&D mandate. Repository cleanup intends to preserve this entire corpus through an immutable archive tag and remove the live research branch ref.

### Spawn calibration

Latest sealed experiment head:

`77fcd0b5aec2cb1cb1acc92a616f611d18a3b38b`

Classification:

`PARTIAL / OWNER_CALIBRATION_READY / NOT PROMOTABLE`

The three candidates are geometry-supported calibration points, not proved roads or accepted start locations. The exact head is currently pinned by Owner Preview and is also the base of the newer active landmark-capture workspace. Cleanup intends to archive this exact calibration head immutably and remove its older work branch refs without touching the newer active capture branch.

### Visual wheel width

Experiment head:

`08b43ac0a40be79be5f89a58582d7107e9e5ae06`

Classification:

`READY FOR OWNER JUDGEMENT / VISUAL ONLY / UNPROMOTED`

Variants change visual axial width only (`0.4375 / 0.36 / 0.32 m`); physics/contact/radius/wheel centers/rig authority remain unchanged. Cleanup intends to archive the exact Preview source and remove the work branch ref.

## 5. Baseline hardening campaign

Maintenance lane:

`maintenance/repo-baseline-hardening-2026-09-06`

Safety/audit receipt:

`docs/REPO_BASELINE_CLEANUP_2026-09-06.md`

### Test reconciliation

The last broad validation run executed `523` tests: `516` passed and `7` failed. Full logs plus current source/tests now establish all seven failures as stale or formatting-brittle assertions conflicting with already accepted Steering I1 semantics, not evidence of a new runtime regression.

The maintenance lane changes only five test files to reconcile:

- accepted 900-degree range (`90/450 = 0.2`, not the old `90/120 = 0.75`);
- semantic `RELEASE` on cancel/lost-capture/fullscreen lifecycle;
- canonical range values sourced from `JV_STEERING_WHEEL_RANGE_DEGREES`;
- formatting-robust media-query contract matching.

No runtime `src/` file is changed by this reconciliation.

**Fresh exact-head execution is still required.** Do not call the maintenance baseline green until `npm ci`, full test/check and portable build validation pass on the exact candidate head.

### Dependency posture

`box3d.js@0.0.2` is deliberately frozen as the accepted reproducibility baseline. Upstream 0.1.x introduces breaking binding/API changes; migration is separate compatibility research, not cleanup.

The current build-tool lock contains dev-only `nanoid@3.3.17` and the last clean install reported one HIGH advisory. Intended repair is the minimum patched 3.x (`3.3.18`) with deterministic lock regeneration under the pinned Node/npm toolchain. Do not use broad `npm audit fix --force` or opportunistic dependency upgrades.

This dependency repair is not yet closed because package-lock integrity must be generated and tested in a real checkout.

## 6. Repository topology target

Historical work should no longer require permanent branch refs.

Target rule:

`branch = active workspace`

`archive tag + exact SHA + evidence = history`

The repository already used this model successfully in the 2026-08-16 cleanup.

After fresh validation, promotion, archive-tag creation and branch cleanup, the expected live branch set for the current concurrent state is:

- `main`;
- `preview/owner-control`;
- `work/spawn-landmark-capture-2026-09-06` while that bounded line remains genuinely active.

Once the capture line is closed/promoted/sealed, the idle repository may return to only `main` + `preview/owner-control`.

New work/research branches should be created only for real active changes and removed after promotion/closure once unique history is safely retained.

Exact pre-cleanup branch classification and planned archive refs are recorded in `docs/REPO_BASELINE_CLEANUP_2026-09-06.md`.

## 7. Documentation authority

Use this hierarchy for fresh continuation:

1. live Git and exact executed evidence;
2. `AGENTS.md` — stable operating rules;
3. this `docs/PROJECT_STATE.md` — current routing and boundaries;
4. focused evidence/baseline documents only when the current question requires them.

`README.md` is project identity/setup, not live state authority.

`docs/HANDOFF.md` is a compact continuation entry point and must not maintain a competing copy of current state.

`AI_PROJECT_MEMORY.md` is retained only as a compatibility pointer and must not become another mutable state ledger.

## 8. Next frontier after maintenance closure

Do not open another substantial R&D branch solely because baseline hardening closes. First re-ground the active spawn-landmark-capture line and current Owner priority.

If no newer Owner need supersedes it, the next major candidate frontier remains:

**Wheel Representation R0 — asset / visual / physics coherence.**

The first design boundary must distinguish:

`AUTHORED HINT -> VALIDATED VISUAL CALIBRATION -> ACCEPTED PHYSICS REPRESENTATION`

The owner wheel asset markers remain `physicsAuthority:false`; do not silently promote authored visual markers into final physics authority. Accepted mode3 terrain rolling contact remains the sphere-based legacy split backend until a separate experiment produces evidence strong enough to change it.

Native analytic wheel profile capability and `core-torus64` recovery are separate hypotheses/provenance lines and must not be conflated.

## 9. Do not do by default

- do not restart the 2026-08-26 cold takeover;
- do not reopen RQ2C/yaw/solver micro-forensics by sequence inertia;
- do not promote spawn/visual-wheel/wheel-mode5 experiments without the missing Owner/product evidence;
- do not alter or delete the active `work/spawn-landmark-capture-2026-09-06` branch during repository cleanup;
- do not change runtime steering semantics while reconciling old tests;
- do not upgrade `box3d.js` during housekeeping;
- do not modify GitHub Actions without explicit Owner approval;
- do not delete a unique historical branch before its intended archive tag resolves to the exact audited commit;
- do not claim a green baseline before fresh exact-head execution.

## 10. Immediate continuation

1. complete repository documentation consolidation on the maintenance lane;
2. perform fresh local exact-head validation and deterministic nanoid lock repair;
3. if validation is green, promote the bounded maintenance result to `main`;
4. create and verify the archive tags from the cleanup manifest;
5. delete only obsolete branch refs with the fail-closed cleanup script while preserving the active capture branch untouched;
6. re-ground the resulting minimal repository and the live capture head;
7. continue from current Owner priority rather than automatically opening another parallel branch.
