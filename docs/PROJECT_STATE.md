# JV-Web — current project state

Updated: 2026-09-09
Owner: Jozz
Status: `BASELINE HARDENING / REPOSITORY CONSOLIDATION IN PROGRESS`

This is the single live current-state router for JV-Web. Git/current source, exact executed evidence and direct Owner judgement outrank this document.

## 1. Current boundary

JV-Web remains the browser product line for Jozz Vehicle and a practical R&D surface. It is not NextGen JV Lite.

The current stage is a bounded repository/baseline hardening campaign before another substantial R&D line. The campaign exists to restore one trustworthy execution baseline, reduce stale repository topology and make historical evidence immutable without keeping old work branches alive.

The spawn-landmark capture line has stopped changing and is now the exact unpromoted source used by Owner Preview. Repository maintenance must preserve that specimen rather than reinterpret it as accepted product truth or delete it merely to minimize branch count.

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

`preview/owner-control@a87cca7c9b933a8e7174ef1add5d3d9073294333`

It pins exact sources rather than treating experiment branches as authority:

- accepted root: `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`;
- wheel-mode5 A/B/C/D: `d52aa3776e022649af21cddc6d9dcfae3bac42f9`;
- spawn A/B/C + read-only landmark capture: `c2481f911af45c73489f5b77f022206a9cf4a8cd`;
- visual-wheel A/B/C: `08b43ac0a40be79be5f89a58582d7107e9e5ae06`;
- accepted JSPREV2: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`.

Owner Preview run `34031462564` qualified `preview/owner-control@a87cca7...` successfully on 2026-09-06. Preview remains composition/publishing infrastructure, not product source authority.

## 4. Active, closed and unpromoted evidence

### Spawn-landmark capture Owner specimen

Live workspace:

`work/spawn-landmark-capture-2026-09-06@c2481f911af45c73489f5b77f022206a9cf4a8cd`

Classification:

`STABLE / UNPROMOTED / OWNER-PREVIEW SPECIMEN / PRESERVE DURING CLEANUP`

This line extends the sealed spawn-calibration source by seven commits. It adds bounded read-only landmark capture, compact UI and focused tests and keeps the feature scoped to `scan-cal-a/b/c` rather than ordinary startup.

It has not advanced since 2026-09-06 11:51Z and is now the exact source pinned by Owner Preview. Cleanup must therefore freeze and verify this exact SHA as a retained ref, archive the exact Preview specimen for provenance, and must not move or delete the live branch. Any future head change requires re-grounding before cleanup or promotion.

### Wheel mode5

Research closure head:

`c26e6c610815a0286a0139c2ff50a0a03b040e02`

Classification:

`RQ2C_ORIENTATION_HOLD / CLOSED`

The zero-degree actual-support rolling-slip gate failed at max witness slip `0.034093857 mm/s` against `0.002 mm/s` (`17.0469x`). Planned +/-3.5 degree yaw was therefore not executed. Do not resume this sequence for completeness or tune the apparatus to force PASS.

The branch is historical evidence, not an active R&D mandate. Repository cleanup intends to preserve this corpus through an immutable archive tag and remove the live research branch ref.

### Spawn calibration predecessor

Sealed predecessor head:

`77fcd0b5aec2cb1cb1acc92a616f611d18a3b38b`

Classification:

`PARTIAL / OWNER_CALIBRATION_READY / SUPERSEDED AS PREVIEW SOURCE`

The three candidates remain geometry-supported calibration points, not proved roads or accepted start locations. The newer `c2481f91...` specimen is a direct seven-commit descendant and is the current Owner Preview source. Cleanup may remove older spawn-calibration branch refs once the exact predecessor and current specimen are immutably anchored.

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

The 2026-09-05 broad validation run executed `523` tests: `516` passed and `7` failed. Re-audit on 2026-09-09 confirmed that the five maintenance test-file changes preserve assertions while reconciling stale expectations with accepted Steering I1 semantics:

- accepted 900-degree range (`90/450 = 0.2`, not the old `90/120 = 0.75`);
- exact semantic `RELEASE` on cancel/lost-capture/fullscreen lifecycle;
- canonical range values sourced from `JV_STEERING_WHEEL_RANGE_DEGREES` and consumed by the UI;
- formatting-robust media-query matching without changing the query or lifecycle assertions.

No runtime `src/` file is changed by this reconciliation.

**Fresh exact-head execution is still required.** Do not call the maintenance baseline green until lock reconciliation, `npm ci`, HIGH-level audit and full `npm run build` pass on the exact candidate head with a clean tracked tree.

### Dependency posture

`box3d.js@0.0.2` remains deliberately frozen as the accepted reproducibility baseline. Upstream migration is separate compatibility research, not cleanup.

The build-tool lock contains dev-only `nanoid@3.3.17` while its dependency range permits a patched 3.x. Re-audit also found that root `package-lock.json` metadata predates later `package.json` engine/toolchain tightening. Therefore cleanup must **not** hand-edit three nanoid fields or assume a three-line lock diff.

The intended repair is npm-owned lock reconciliation under the pinned Node/npm toolchain, followed by a semantic diff audit that permits only truthful root metadata synchronization plus `nanoid` moving to exactly `3.3.18`. No direct dependency, Box3D version or unrelated transitive package version may change.

## 6. Repository topology target

Historical work should no longer require permanent branch refs.

Target rule:

`branch = active/reviewable workspace`

`archive tag + exact SHA + evidence = history`

After fresh validation, preservation, promotion and branch cleanup, the expected live branch set for the currently known state is:

- `main`;
- `preview/owner-control`;
- `work/spawn-landmark-capture-2026-09-06` while the unpromoted Owner specimen remains useful.

A later explicit closure/promotion may reduce the idle repository to `main` + `preview/owner-control`, but branch count is not itself a deletion criterion.

New work/research branches should be created only for real active changes and removed after promotion/closure once unique history is safely retained.

Exact pre-cleanup classification and archive refs are recorded in `docs/REPO_BASELINE_CLEANUP_2026-09-06.md`.

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

Do not open another substantial R&D branch solely because baseline hardening closes. First re-ground the preserved spawn specimen and current Owner priority.

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
- do not alter or delete `work/spawn-landmark-capture-2026-09-06` during repository cleanup;
- do not change runtime steering semantics while reconciling old tests;
- do not hand-edit lockfile integrity or run broad `npm audit fix --force`;
- do not upgrade `box3d.js` during housekeeping;
- do not modify GitHub Actions without explicit Owner approval;
- do not delete a unique historical branch before its intended archive tag resolves to the exact audited commit;
- do not claim a green baseline before fresh exact-head execution.

## 10. Immediate continuation

Use three separated gates:

1. **Gate 1 — local preparation and validation only:** fresh clone, exact-ref verification, npm-owned lock reconciliation, semantic diff audit, local candidate commit, `npm ci`, HIGH-level audit and full build. No remote mutation.
2. **Gate 2 — preservation and promotion:** only after Gate 1 review, push the validated maintenance candidate, create/verify archive and rollback tags, then fast-forward `main`. No historical branch deletion in this gate.
3. **Gate 3 — ref cleanup only:** after live re-verification, delete only the audited obsolete refs in one atomic exact-lease transaction; preserve any new or unreviewed ref untouched.

After cleanup, re-ground the minimal repository and continue from current Owner priority rather than automatically opening another parallel branch.
