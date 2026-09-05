# Wheel mode5 — current state and research roadmap

Updated: 2026-09-05
Owner: Jozz
Research branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Canonical product `main`: `5b28cc03d22264010680deb95a04abd04661bc22`
Canonical evidence ledger: `docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`
Retrospective audit: `docs/WHEEL_MODE5_RESEARCH_AUDIT_AND_FOUNDATION_HARDENING_2026-09-05.md`

## 1. Current routing

This file is the canonical human router for wheel-mode5. The experiment sequence is not the roadmap.

Current route:

> last Owner hands-on = Steering I1 -> wheel-mode5 laboratory R&D -> E1 annular contact-semantics evidence + E2a2 bounded recycler forensics -> RQ0 qualified planar rolling -> RQ1/Q1-A bounded laboratory closure -> RQ2a/RQ2b bounded longitudinal traction -> RQ2c0 local-axis-guide feasibility -> **RH0 Research Foundation Hardening now blocks new physics**.

Do not repair RQ2c0b or start a new camber/steer/load experiment before RH0 exit criteria are satisfied.

Recycler micro-forensics remain closed by default. Product `main` and Owner Preview remain outside this research lane.

## 2. Authority boundary

### CURRENT ACCEPTED product truth

`Jozzpoly/JV-Box3D-Web-experiment/main`

Accepted head:

`5b28cc03d22264010680deb95a04abd04661bc22`

The last current-best Owner hands-on acceptance is Steering I1, observed 2026-08-31 and consolidated 2026-09-01:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

Its scope is steering control/interaction. It explicitly does **not** accept wheel-mode5 contact physics, drivetrain, suspension, final rig or handling. Natural physical steering self-return/self-alignment remains unresolved.

### ACTIVE RESEARCH truth

Research claims are authoritative only when tied to exact executed sources and classified evidence. A green workflow by itself is never an evidence status.

Canonical machine-readable classification:

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

Validator:

`tools/wheel-mode5-evidence-ledger-validate.mjs`

## 3. Two research lanes — do not conflate them

### Lane A — Annular Contact Semantics

E1-style work concerns the recovered full tire boundary and the semantics required for a future native annular contact/manifold implementation.

Trusted diagnostic evidence includes:

- annular boundary/onset geometry can become smooth/convergent with tessellation;
- raw selected triangle-manifold normals are not viable direct side/inner dynamic semantics;
- profile-derived analytic normals strongly improve the demonstrated side/inner case;
- a universal analytic-normal substitution is also wrong: broad flat support already has a strong native pair normal while witness/manifold ownership becomes the unstable quantity.

Still open:

- dynamic native annular manifold semantics;
- stable broad-support torque-arm/witness ownership;
- side/inner/bore dynamic solver behavior.

### Lane B — Donor Outer-Carrier Dynamics

E2a/RQ0+ uses the recovered donor `b3Wheel` outer-P75 dynamic carrier for bounded rolling/contact/traction questions.

This lane is useful for dynamic apparatus qualification but **cannot validate Lane A's side/inner/bore semantics**.

The effective donor carrier is a three-point crowned convex profile after `b3MakeWheelProfile` reduction.

## 4. Trusted bounded evidence

### E2a2 — recycler/reprojection mechanism

Status: **TRUSTED DIAGNOSTIC / FORENSIC DESCENT CLOSED BY DEFAULT**.

Forensic closure:

`docs/WHEEL_MODE5_E2A2AJ_REPROJECTION_COMPONENT_DECOMPOSITION_2026-09-04.md`

Within the tested laboratory fixed-road/transformed-ground regimes:

- actual recycler shortcut participation is required for the measured amplification;
- recycled separation reprojection is a necessary amplifier;
- trusted shadow evidence measured about `0.118 mm` recycled-vs-fresh separation discrepancy around the fixed-road transition;
- stale `baseSeparation` is not the dominant discrepancy;
- the reprojection residual is an ill-conditioned cancellation of much larger frame/anchor terms, so absolute component magnitude is not valid causal attribution.

Do not generalize this into global Box3D recycler incorrectness. Do not open E2a2ak without later representative material harm.

### RQ0 — steady rolling

Status: **TRUSTED EXECUTED / QUALIFIED, SCOPED**.

Canonical evidence:

`docs/WHEEL_MODE5_RQ0_STEADY_ROLLING_QUALIFICATION_2026-09-04.md`

Executed source / run / job:

`579bc2d2f3636f60437d98bf53f033bb69e0b020 / 33899570270 / 101110198854`

At `1 m/s`, `mu=0.9`, true flat static road, aligned planar guide:

- `0` settled contact dropouts;
- `0` feature changes;
- point count `1..1`;
- microscopic rolling slip;
- essentially invariant Vx/spin;
- measured background about `0.675 mm` Y range and `49 mm/s` max `|Vy|`;
- zero-spin positive control proves tangential friction coupling.

Important limitation: the world-axis angular locks make this an aligned planar laboratory baseline, not a tilted-wheel mount.

### RQ1 / Q1-A — bounded laboratory rolling transition

Status: **RESEARCH DECISION / CLOSED IN TESTED BOUNDED ENVELOPE**.

Canonical decision:

`docs/WHEEL_MODE5_Q1_MATERIAL_RELEVANCE_CLOSURE_2026-09-05.md`

RQ1c:

- first tested hull-preserved two-face road-normal ridge: `30 µrad`;
- one intended contact-feature transition;
- `0` dropout;
- point count `1..1`;
- no material disturbance beyond matched RQ0 background.

RQ1d:

- signed `0/+10/-10 µrad` cross-slope;
- same effective support feature;
- `0` dropout/churn;
- effectively neutral/symmetric response.

Audit language correction:

> Q1-A means no material recycler/contact pathology was demonstrated in the tested **bounded laboratory rolling-transition envelope**.

It does not retire physically justified rough-road or broader topology questions forever.

### RQ2a — bounded braking

Status: **TRUSTED EXECUTED / QUALIFIED, SUB-LIMIT SCOPED**.

`docs/WHEEL_MODE5_RQ2A_BOUNDED_BRAKING_RESULT_2026-09-05.md`

`2212efa95a8ef0b20933308ec9010031c5a3f002 / 33956379091 / 101280360165`

At `0.20 * mu*m*g*R` for `0.5 s`:

- `0` dropout/churn;
- point count `1..1`;
- Vx reduction about `0.5886 m/s`;
- translation/spin residual about `5.7e-8 m/s`;
- max slip about `0.0489 mm/s`;
- no material vertical/normal-impulse pathology.

No lockup, traction limit, ABS-like regime or load transfer is implied.

### RQ2b — bounded drive

Status: **TRUSTED EXECUTED / QUALIFIED, SUB-LIMIT SCOPED**.

`docs/WHEEL_MODE5_RQ2B_BOUNDED_DRIVE_RESULT_2026-09-05.md`

`2c582311c97deb184cad5862df468ce86a7188c2 / 33957949201 / 101284575791`

At the matched drive pulse:

- `0` dropout/churn;
- point count `1..1`;
- Vx gain about `0.5876 m/s`;
- max slip about `3.678 mm/s`;
- end-pulse rolling mismatch about `2.924 mm/s`;
- ordinary friction relaxes final slip back to about `0.000238 mm/s`.

The braking/drive difference is **not currently a material stability failure**, but is now a canonical regression sentinel. Do not let future harness refactors silently erase or normalize it away.

## 5. RQ2c0 — local-axis angular-guide feasibility

The diagnosis remains valid: world-axis angular X/Y locks cannot support trustworthy tilted-wheel claims because legitimate axle spin may no longer align with world Z.

Pinned Box3D `b3ParallelJoint` is a useful bounded candidate because it constrains relative local-Z orientation through angular impulses without adding a translational anchor constraint.

Terminology correction after audit:

> call the current construct a **local-axis angular guide / mount-feasibility apparatus**, not a mechanically representative axle/mount.

It still retains a world linear-Z guide and static orientation reference.

### RQ2c0a — 120 Hz

Corrected executed source / run / job:

`3af93f9efab3ce84a51aaaf2e49265d82062d561 / 33958566941 / 101286243228`

Canonical result:

`docs/WHEEL_MODE5_RQ2C0A_PARALLEL_MOUNT_120_RESULT_2026-09-05.md`

Result:

- contact continuity/equivalence is supportive;
- `0` dropout/churn, point count `1..1`;
- Y/impulse scales remain close to RQ0;
- max slip about `0.0347 mm/s`;
- corrected max axis tilt `148.785 µrad = 0.008525°`.

Historical predeclared `<100 µrad` gate therefore failed.

Audit correction:

- preserve that historical gate result;
- **do not** promote `100 µrad` to product/mechanical truth;
- it was not derived from a future challenge amplitude or product error budget;
- do not tune joint stiffness upward merely until that arbitrary laboratory threshold becomes green.

Original `acos(axis.z)` zero-tilt result remains `INSTRUMENT_INVALID`.

### RQ2c0b — attempted 240 Hz

Source / run / job:

`cdb0babf2165a7599a123079b46928dbd392c13f / 33958792392 / 101286854234`

Status:

**APPARATUS_INVALID / COMPOSITION FAILURE / NO PHYSICS RESULT**.

The patch stopped before Box3D build/runtime:

`RQ2c0b expected function+binding occurrences=2, got 3`

Do not call this a 240 Hz physics FAIL and do not repair/rerun it before RH0 exit.

## 6. Why RH0 exists now

At the retrospective audit cutoff, this research branch was `417` commits ahead of accepted `main` and contained a large family of experiment-specific workflows, JS runners and string-based C++ patch/composition scripts.

That infrastructure was productive during discovery, but is now itself a scientific risk:

- composition order is increasingly implicit;
- text anchors drift as helpers are cloned/repatched;
- fresh continuation requires apparatus archaeology;
- new tests can accidentally inherit stale diagnostics;
- green CI becomes harder to interpret because orchestration complexity grows faster than the physics question.

RQ2c0b's composition failure is direct evidence of this scaling limit.

The response is **consolidation, not destructive cleanup and not more experiments**.

## 7. RH0 — Research Foundation Hardening

Status: **ACTIVE / BLOCKS NEW PHYSICS**.

### RH0.1 — canonical evidence ledger

Machine-readable ledger:

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

It records:

- last Owner hands-on baseline;
- lane separation;
- exact executed source/run/job/artifact provenance;
- canonical evidence status;
- invalid/superseded apparatus;
- reopen triggers;
- RQ2 sign-asymmetry sentinel;
- current RH0 exit criteria.

### RH0.2 — evidence-status validation

Validator:

`tools/wheel-mode5-evidence-ledger-validate.mjs`

Canonical vocabulary:

- `OWNER_ACCEPTED_SCOPED`
- `TRUSTED_EXECUTED_SCOPED`
- `TRUSTED_DIAGNOSTIC`
- `RESEARCH_DECISION`
- `INSTRUMENT_INVALID`
- `APPARATUS_INVALID`
- `HISTORICAL_ONLY`
- `OPEN_NOT_VALIDATED`

The validator must fail on important overclaim regressions such as treating RQ2c0b as executed physics or losing the bounded Q1 language.

### RH0.3 — consolidate active donor-carrier apparatus

Next implementation task after ledger/router validation:

1. inventory the minimum patch/composition actually required by current RQ0/RQ1/RQ2;
2. define one explicit canonical active composition;
3. express scenario differences as configuration/parameters rather than another helper clone/string patch where practical;
4. provide one reusable active research execution path;
5. retain historical workflows/scripts for provenance until replacement evidence exists;
6. do not drag E2a2 micro-forensics into the normal active harness.

### RH0.4 — frozen canonical replay suite

The consolidated harness must reproduce, before it is trusted for new physics:

- RQ0 matched rolling + zero-spin friction positive control;
- RQ1c 30 µrad transition;
- RQ2a bounded braking;
- RQ2b bounded drive plus longitudinal sign-asymmetry sentinel.

RQ1d may be included as a cheap secondary regression if it does not complicate the canonical harness.

Compare at least:

- contact dropout;
- feature/point-count behavior;
- Vx/spin response;
- rolling-slip scale;
- vertical background;
- normal-impulse scale;
- challenge-specific signal.

Use exact equality only where deterministic emitted values warrant it; otherwise declare non-drift tolerances tied to measurement significance.

### RH0.5 — challenge-derived error budget

Before resuming orientation work:

1. define the next physical question;
2. obtain a defensible orientation scale from actual JV/donor geometry or product need;
3. define how much angular-guide compliance can be tolerated relative to the physical effect;
4. only then decide whether 120 Hz is already adequate, whether a stiffer guide is justified, or whether `ParallelJoint` is the wrong apparatus.

No stiffness sweep exists as a milestone.

### RH0.6 — continuation/branch hygiene

Treat the current long research branch increasingly as an evidence archive.

After the consolidated harness reproduces the frozen suite, decide between:

- a dedicated hardened continuation branch; or
- a clean research continuation from accepted `main` plus only the minimum canonical wheel-mode5 apparatus/evidence pointers.

Do not mass-delete historical workflows before the replacement exists and is proven non-drifting.

## 8. RH0 exit gate

RH0 closes only when all are true:

1. evidence ledger and validator pass;
2. current router/project state point to RH0, not automatic RQ2c0 continuation;
3. active RQ apparatus has one explicit reusable execution path;
4. frozen RQ0/RQ1c/RQ2a/RQ2b suite is reproduced within declared tolerances;
5. RQ2b sign-asymmetry sentinel survives the refactor;
6. next orientation challenge and its error budget are justified from a physical/product scale.

Until then, no new wheel physics claim should be generated merely to keep the experiment chain moving.

## 9. Post-RH0 physics direction

If RH0 passes, resume RQ2c as **local-axis orientation feasibility**, one controlled DOF at a time.

Likely later dimensions:

- controlled camber or steer;
- orientation-sensitive/lateral contact response;
- controlled load transfer;
- wheel/carrier/chassis coupling;
- physically selected irregular-road cases;
- eventual bridge to Lane A annular semantics when side/inner/bore exposure becomes necessary.

A larger forensic branch should state which product uncertainty it can change before it begins.

When wheel/contact work becomes faithful and experiential, return to Owner Preview and hands-on judgement. Do not ask Owner to validate low-level lab metrics for their own sake.

## 10. What is explicitly not next

Do not by default:

- repair/rerun RQ2c0b 240 Hz;
- tune `ParallelJoint` until a historical arbitrary threshold passes;
- open new camber/steer/load physics before RH0;
- reopen E2a2 recycler micro-forensics;
- increase torque or road severity just to make something fail;
- call donor outer-carrier evidence full annular validation;
- call the current static-reference guide a representative suspension/axle;
- promote wheel-mode5 to Owner Preview or `main`;
- delete historical evidence infrastructure before its canonical replacement is proven.

## 11. Fresh continuation routing

For active wheel-mode5 continuation:

1. verify live `main` and research branch separately;
2. read `AGENTS.md` and `docs/PROJECT_STATE.md`;
3. read this file;
4. read `docs/WHEEL_MODE5_RESEARCH_AUDIT_AND_FOUNDATION_HARDENING_2026-09-05.md`;
5. validate `docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`;
6. continue **RH0**, not RQ2c0 physics;
7. reopen older individual evidence only when the ledger/router says it is necessary.

**Current next action: finish RH0 evidence/router grounding, then design and validate the minimum consolidated RQ harness. No new physics is authorized before that foundation is proven.**
