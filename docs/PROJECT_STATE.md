# JV-Web — current project state

Updated: 2026-09-09
Owner: Jozz
Status: `NORMAL PRODUCT ITERATION / REPOSITORY BASELINE HARDENING CLOSED`

This is the single live current-state router for JV-Web. Live Git/current files, exact executed evidence and direct scoped Owner judgement outrank this document.

## 1. Current boundary

The 2026-09-06 repository/baseline hardening campaign is **closed**. Do not restart it merely because a new chat or executor exists.

The campaign established a validated technical baseline, preserved unique history behind immutable tags, promoted the validated candidate to `main`, and removed the audited stale branch topology without changing accepted runtime behavior.

Final known live branch topology after independent post-prune verification:

- `main` — source + canonical documentation authority;
- `preview/owner-control@a87cca7c9b933a8e7174ef1add5d3d9073294333` — exact-source Owner Preview composition infrastructure;
- `work/spawn-landmark-capture-2026-09-06@c2481f911af45c73489f5b77f022206a9cf4a8cd` — stable unpromoted Owner Preview specimen.

At closure there were no additional branch refs, no open PRs and no repository rulesets. Branch count is not itself authority: future legitimate work branches are allowed when they represent real active work.

## 2. Canonical product and validated baseline

Live source/documentation authority is always resolved from:

`Jozzpoly/JV-Box3D-Web-experiment/main`

The exact **validated technical baseline parent** produced by the cleanup campaign is:

`02ef5d6b4f2b1b62cfc87c7f122c492b0a7dde36`

Gate 4 is documentation-only closure on top of that validated source; it does not change runtime, dependencies or tests.

The accepted executable/current-best product snapshot remains Steering I1:

`529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`

Detailed baseline:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

Accepted Steering I1 truth includes:

- Direct Rotation and Relative-X remain explicit touch steering choices;
- ordinary pointer/lifecycle release uses semantic `RELEASE`, not hidden return-to-zero;
- hands-off presentation follows physical rack state and re-grab anchors to that state;
- supported wheel ranges are 360/540/720/900/1080 degrees;
- 900 degrees is current default/current-best;
- artificial centering is not an Owner-facing product setting;
- useful natural physical self-return remains unresolved.

The cleanup campaign did **not** accept spawn, visual-wheel or wheel-mode5 experiments as product truth.

## 3. Gate 1 executed evidence

The exact candidate later promoted to `main` was validated from a fresh checkout under:

- Node `24.16.0`;
- supported npm 11 line (`11.17.0` in the executed run, repository contract `>=11.13.0 <12`);
- `box3d.js@0.0.2` unchanged.

Executed evidence on `02ef5d6...`:

- focused regression set: `17/17 PASS`;
- full test suite: `522/522 PASS`;
- `npm ci`: PASS;
- `npm audit --audit-level=high`: `0 vulnerabilities`;
- full `npm run build`: PASS, including typecheck, docs audit, third-party audit and portable validation;
- tracked tree clean after validation.

The npm-owned lock reconciliation moved dev-only `nanoid` from `3.3.17` to `3.3.18`, synchronized truthful root engine metadata, preserved `box3d.js@0.0.2`, and retained a hard canonical lock SHA-256 contract.

A green build proves reproducibility of the exact tested source. It does not by itself prove Owner/product acceptance of unresolved experiments.

## 4. Preservation and repository cleanup result

The one-time execution receipt is:

`docs/REPO_BASELINE_CLEANUP_2026-09-06.md`

Preservation namespace:

`archive/jv-web-repo-cleanup-2026-09-06/*`

A rollback anchor preserves pre-cleanup main:

`rollback/main-before-repo-baseline-cleanup-2026-09-06` -> `42bc652c9051edb1581b5d539f012ac78d165a66`

Gate 2 preserved and independently verified exact archive targets before promoting the validated candidate.

Gate 3 then re-proved all deletion classifications and executed one atomic exact-lease prune transaction:

- `37/37` audited obsolete branch refs deleted;
- `3/3` retained branch refs unchanged;
- preservation tags re-verified after deletion;
- no unknown/new branch refs were present at final readback.

Historical work is therefore retained by exact commits/evidence/archive tags rather than stale live branch refs.

## 5. Owner Preview composition and retained specimen

Operational Preview lane:

`preview/owner-control@a87cca7c9b933a8e7174ef1add5d3d9073294333`

It pins:

- accepted root: `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`;
- wheel-mode5 A/B/C/D: `d52aa3776e022649af21cddc6d9dcfae3bac42f9`;
- spawn A/B/C + read-only landmark capture: `c2481f911af45c73489f5b77f022206a9cf4a8cd`;
- visual-wheel A/B/C: `08b43ac0a40be79be5f89a58582d7107e9e5ae06`;
- accepted JSPREV2: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`.

Owner Preview remains composition/publishing infrastructure, not product source authority.

The retained spawn branch is classified:

`STABLE / UNPROMOTED / OWNER-PREVIEW SPECIMEN`

It is intentionally still live because Owner judgement remains useful. Cleanup closure is not permission to promote or delete it.

## 6. Closed/unpromoted evidence

### Wheel mode5

Exact archived research head:

`archive/jv-web-repo-cleanup-2026-09-06/research/wheel-mode5-rq2c-hold` -> `c26e6c610815a0286a0139c2ff50a0a03b040e02`

Classification:

`RQ2C_ORIENTATION_HOLD / CLOSED`

The zero-degree actual-support rolling-slip gate failed at max witness slip `0.034093857 mm/s` against `0.002 mm/s` (`17.0469x`). Planned +/-3.5 degree yaw was therefore not executed. Do not resume this sequence for completeness or tune it to manufacture PASS.

### Visual wheel width

Exact archived experiment source:

`archive/jv-web-repo-cleanup-2026-09-06/experiment/visual-wheel-profile-owner` -> `08b43ac0a40be79be5f89a58582d7107e9e5ae06`

Classification:

`READY FOR OWNER JUDGEMENT / VISUAL ONLY / UNPROMOTED`

The variants change visual axial width only (`0.4375 / 0.36 / 0.32 m`); physics/contact/radius/wheel centers/rig authority remain unchanged.

### Spawn predecessor

The sealed predecessor is preserved at:

`archive/jv-web-repo-cleanup-2026-09-06/experiment/spawn-landmark-calibration-mobile-ui` -> `77fcd0b5aec2cb1cb1acc92a616f611d18a3b38b`

It remains evidence/provenance, not a live workspace.

## 7. Current open questions and next frontier

Repository cleanup no longer controls the schedule.

Before opening another substantial branch, re-ground the current Owner priority and the retained spawn specimen. Do not create work merely because the repository is now clean.

Open product/research questions include:

- useful natural physical steering self-return;
- Owner judgement on the retained spawn calibration/capture specimen;
- Owner judgement on visual wheel width variants;
- broader vehicle handling/mechanical fidelity questions not resolved by Steering I1.

If no newer Owner need supersedes it, the next major candidate frontier remains:

**Wheel Representation R0 — asset / visual / physics coherence.**

Its first design boundary must distinguish:

`AUTHORED HINT -> VALIDATED VISUAL CALIBRATION -> ACCEPTED PHYSICS REPRESENTATION`

Owner wheel asset markers remain `physicsAuthority:false`; do not silently promote authored visual markers into final physics authority. Accepted mode3 terrain rolling contact remains the sphere-based legacy split backend until separate evidence justifies change.

## 8. Documentation authority

Use this reading order for fresh continuation:

1. live Git and exact executed evidence;
2. `AGENTS.md` — stable operating rules;
3. this `docs/PROJECT_STATE.md` — current routing and boundaries;
4. focused baseline/evidence documents only when the current question requires them.

`README.md` is project identity/setup, not live state authority.

`docs/HANDOFF.md` is a compact continuation entry point and must not maintain a competing copy of current state.

`AI_PROJECT_MEMORY.md` is a compatibility pointer, not another mutable state ledger.

The cleanup receipt is historical execution evidence after closure; it must not become a second current-state router.

## 9. Do not do by default

- do not restart the 2026-08-26 cold takeover or the 2026-09-06 cleanup campaign;
- do not reopen RQ2C/yaw/solver micro-forensics by sequence inertia;
- do not promote spawn/visual-wheel/wheel-mode5 experiments without missing Owner/product evidence;
- do not change runtime steering semantics merely because old historical evidence differs;
- do not upgrade `box3d.js` as routine housekeeping;
- do not modify GitHub Actions without explicit Owner approval;
- do not recreate stale historical branches merely because archive tags now hold their history;
- do not confuse a clean repository topology with mechanical/product completeness.

## 10. Immediate continuation

The cleanup campaign is closed.

Normal continuation is now:

`re-ground Owner priority -> choose smallest valuable product/R&D slice -> execute -> validate -> Owner judgement`

If the retained spawn specimen is still the most immediate Owner-facing uncertainty, inspect/test that line first. Otherwise follow the current Owner need rather than the historical cleanup or research sequence.
