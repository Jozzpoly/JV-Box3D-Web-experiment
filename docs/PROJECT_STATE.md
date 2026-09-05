# JV-Web — current project state

Updated: 2026-09-05
Owner: Jozz

## 1. Current routing

JV-Web remains a browser product/R&D surface with a strict split between accepted product truth and active research evidence.

- accepted product/source authority: `Jozzpoly/JV-Box3D-Web-experiment/main`;
- active wheel-mode5 evidence branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`;
- wheel-mode5 laboratory results are not product promotion.

The 2026-08-26 strategic cold-takeover campaign remains historical and closed. JV-Web is not NextGen JV Lite and does not need to inherit NextGen architecture.

Default loop remains:

`real need / uncertainty -> smallest informative research or change -> validation matched to causal blast radius -> faithful evidence -> Owner judgement when experiential -> next iteration`

The active wheel research has reached a consolidation boundary: **RH0 Research Foundation Hardening blocks new wheel physics until the evidence and apparatus foundation is hardened.**

## 2. Product authority

### CURRENT ACCEPTED source

`main`

Verified current accepted head:

`5b28cc03d22264010680deb95a04abd04661bc22`

### Last current-best Owner hands-on

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

Owner observation: 2026-08-31; consolidation: 2026-09-01.

Accepted/scoped product truth includes:

- Direct Rotation and Relative-X as explicit touch steering choices;
- semantic `RELEASE` instead of hidden return-to-zero;
- hands-off graphical steering following the live physical rack;
- re-grab from the current physical rack position;
- configurable 360/540/720/900/1080 degree ranges;
- 900 degrees as current-best/default Owner-used range, not permanently frozen;
- no Owner-facing artificial-centering dependency.

Still open from that Owner checkpoint:

- natural physical steering self-return/self-alignment;
- final steering/handling geometry;
- wheel/contact backend;
- drivetrain;
- suspension;
- final rig and handling.

No later wheel-mode5 research has received Owner hands-on acceptance.

### Owner Preview

`preview/owner-control` remains publication/composition infrastructure only and was verified during the current continuation at:

`a6a6ed9e6d5ac62fe10be13cf81f1931b3370895`

It is not source authority and has not been moved by wheel-mode5 research.

## 3. Current wheel-mode5 sources of truth

Human research router:

`docs/WHEEL_MODE5_CURRENT_STATE_AND_ROADMAP_2026-09-04.md`

Retrospective audit / routing correction:

`docs/WHEEL_MODE5_RESEARCH_AUDIT_AND_FOUNDATION_HARDENING_2026-09-05.md`

Machine-readable evidence ledger:

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

RH0 non-drift replay contract:

`docs/evidence/WHEEL_MODE5_RH0_CANONICAL_REPLAY_CONTRACT_2026-09-05.json`

Consolidated-harness design:

`docs/WHEEL_MODE5_RH0_CONSOLIDATED_RQ_HARNESS_DESIGN_2026-09-05.md`

Latest migration-oracle result:

`docs/WHEEL_MODE5_RH0_LEGACY_COMPOSITION_REPLAY_RESULT_2026-09-05.md`

Static validators:

- `tools/wheel-mode5-evidence-ledger-validate.mjs`
- `tools/wheel-mode5-rh0-replay-contract-validate.mjs`

Fresh agents should use these before descending into historical experiment documents.

## 4. Wheel-mode5 research model after audit

Do not treat wheel-mode5 as one homogeneous geometry implementation.

### Annular Contact Semantics lane

Concerns the recovered full tire boundary and future native manifold semantics, including side/inner/bore behavior.

Current trusted diagnostic direction:

- annular boundary location can be smooth/convergent;
- raw triangle-selected side/inner normal is not a viable direct dynamic semantic;
- profile-derived analytic normal strongly improves the side/inner control;
- a universal analytic-normal replacement is also false because broad flat support favors the native pair normal and exposes witness ownership instead.

Dynamic full-annular semantics remain open.

### Donor Outer-Carrier Dynamics lane

Uses the recovered donor `b3Wheel` outer-P75 carrier for bounded dynamic qualification.

This lane has produced RQ0/RQ1/RQ2 evidence, but cannot establish full annular side/inner/bore correctness.

The donor carrier reduces to a three-point crowned convex profile.

## 5. Current trusted bounded evidence

### E2a2 recycler forensics

A real bounded recycled-manifold/reprojection discrepancy was localized. Separation reprojection is a necessary amplifier in the tested difficult transitions; trusted shadow evidence measured about `0.118 mm` recycled-vs-fresh separation discrepancy; absolute component magnitude cannot cleanly assign the residual cause because the reprojection is an ill-conditioned cancellation.

Forensic descent is **closed by default**. No production recycler patch is authorized.

### RQ0

Qualified donor outer-P75 flat-road rolling with aligned planar guide:

- zero settled dropout/churn;
- point count `1..1`;
- microscopic rolling slip;
- essentially invariant Vx/spin;
- friction positive control demonstrates real tangential coupling.

This is not a representative tilted-wheel mount.

### RQ1 / Q1-A

RQ1c crossed one real `30 µrad` road-face/contact-feature transition without material disturbance beyond RQ0 background. RQ1d added a `0/+10/-10 µrad` signed relative-normal perturbation with the same effective support feature and likewise remained neutral.

Correct scope after audit:

> Q1-A closes recycler escalation only in the tested **bounded laboratory rolling-transition envelope**.

It does not declare broad rough-road/topology risk solved.

### RQ2a braking

Bounded `0.20 * mu*m*g*R`, `0.5 s` braking qualified in the aligned flat-road apparatus with zero dropout/churn and essentially exact translation-spin coordination.

### RQ2b drive

Matched bounded drive qualified with zero dropout/churn and stable post-pulse return to near-zero slip.

Important retained sentinel:

- braking max pulse slip ~`0.0489 mm/s`;
- drive max pulse slip ~`3.678 mm/s`;
- drive end-pulse rolling mismatch ~`2.924 mm/s`, subsequently relaxed.

This is not currently a material stability failure but must survive future harness refactors as an explicit regression sentinel.

## 6. RQ2c0 status after audit

World-axis angular X/Y locks are unsuitable for trustworthy tilted-wheel claims. A pinned `b3ParallelJoint` local-axis angular guide is a promising bounded laboratory replacement because it constrains relative local-Z orientation without tying translation to an anchor.

Do **not** call the current construct a representative axle/suspension. It still uses:

- static orientation reference;
- world linear-Z guide.

### RQ2c0a 120 Hz

Corrected run:

`3af93f9efab3ce84a51aaaf2e49265d82062d561 / 33958566941 / 101286243228`

Contact/rolling equivalence was supportive. Corrected max guide-axis tilt was:

`148.785 µrad = 0.008525°`.

The historical predeclared `<100 µrad` gate therefore failed. Preserve that historical result, but the audit determined that `100 µrad` was not derived from a product or future challenge error budget and must not become a canonical mechanical acceptance threshold.

The earlier `acos(axis.z)` zero-tilt result is `INSTRUMENT_INVALID`.

### RQ2c0b 240 Hz attempt

`cdb0babf2165a7599a123079b46928dbd392c13f / 33958792392 / 101286854234`

Status:

**APPARATUS_INVALID / NO PHYSICS RESULT**.

Composition failed before Box3D build/runtime:

`RQ2c0b expected function+binding occurrences=2, got 3`

Do not repair/rerun this during RH0.

## 7. Why the project is hardening now

At the retrospective audit cutoff, the research branch was `417` commits ahead of accepted `main` and carried a large number of experiment-specific workflows, JS runners and text-patching scripts.

The research produced real knowledge, but the apparatus itself has become a growing source of risk and Owner-attention cost:

- current truth is distributed across many checkpoints;
- helper clone/patch order is brittle;
- fresh agents must reconstruct orchestration history before interpreting physics;
- RQ2c0b demonstrates a real composition failure caused by this pattern.

The correct response is **consolidation before expansion**.

## 8. ACTIVE MILESTONE — RH0 Research Foundation Hardening

Status: **ACTIVE / BLOCKS NEW WHEEL PHYSICS**.

### RH0.1 — evidence ledger — PASS

Canonical machine-readable ledger exists with exact source/run/job/artifact/status/scope/reopen provenance:

`docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`

### RH0.2 — evidence/replay invariant validation — PASS

The lightweight foundation gate validates:

- evidence status/provenance invariants;
- bounded Q1 language;
- RQ2b sign-asymmetry retention;
- RQ2c0 invalid/superseded classifications;
- replay-contract structure and dependency pins.

Latest post-oracle foundation run:

`33960067816 / 101290295069` — **SUCCESS**.

### RH0 migration oracle — PASS

Before rewriting active apparatus, all frozen canonical legacy helpers were composed into one pinned build/process and replayed against one contract:

source / run / job:

`f38b82195b2032cba49815f79770ecf8e8abce2a / 33959870475 / 101289762819`

artifact:

`9967602295`

Result: **PASS**.

The bridge replay preserved the defining canonical signals, including:

- RQ0 stable matched rolling and friction positive control;
- RQ1c exactly two represented top faces, one intended feature transition and `0 -> -29.997 µrad` normal shift;
- RQ2a max pulse slip about `0.0488758 mm/s` and near-zero rolling residual;
- RQ2b max pulse slip about `3.67820 mm/s`, end-pulse mismatch about `2.92418 mm/s`, final relaxation to near-zero slip;
- RQ2 drive/brake max-slip asymmetry ~`75.26x`.

This is a **migration/non-drift oracle**, not new physics qualification and not the desired final active architecture.

### RH0.3 — consolidate active RQ apparatus — NEXT

Design baseline:

`docs/WHEEL_MODE5_RH0_CONSOLIDATED_RQ_HARNESS_DESIGN_2026-09-05.md`

The next implementation should replace the pattern of one new full workflow + helper clone/string patch per tiny scenario with:

- one readable, versioned active RQ suite module;
- one small stable adapter into the pinned Box3D.js binding translation unit;
- frozen named canonical scenarios first;
- one build/run path and one result schema;
- validation against the exact same replay contract and bridge oracle.

Do not mass-delete historical workflows yet; they remain provenance until the explicit replacement reproduces the evidence.

### RH0.4 — explicit-suite frozen replay — BLOCKED ON RH0.3

The new explicit suite must reproduce:

- RQ0 matched rolling + friction positive control;
- RQ1c 30 µrad transition;
- RQ2a bounded braking;
- RQ2b bounded drive + sign-asymmetry sentinel.

A replay failure is first a harness non-drift failure, not a new physics discovery.

### RH0.5 — next challenge / error budget — BLOCKED ON EXPLICIT HARNESS

Only after the explicit harness is stable:

- choose the next orientation question from actual JV/donor/product geometry;
- define a challenge amplitude;
- define permissible guide compliance relative to that amplitude/effect;
- then judge whether 120 Hz is adequate, a stiffer guide is justified, or another constraint is needed.

No `120 -> 240 -> ... until PASS` stiffness campaign is authorized.

### RH0.6 — continuation branch decision

After explicit canonical replay succeeds, decide whether the current long research branch remains mainly an evidence archive and active work moves to a hardened continuation branch or a clean research branch based on `main` plus only minimal canonical apparatus/evidence pointers.

## 9. RH0 exit criteria

All must be true:

1. ledger and validator pass — **PASS**;
2. project state/router point to RH0 — **PASS**;
3. one explicit reusable active RQ execution path exists — **OPEN**;
4. explicit consolidated harness reproduces frozen RQ0/RQ1c/RQ2a/RQ2b within declared tolerances — **OPEN**;
5. RQ2b sign-asymmetry sentinel survives the explicit refactor — **OPEN; bridge oracle proves the reference**;
6. next orientation challenge and its error budget are physically justified — **OPEN / deliberately deferred until harness hardening**.

## 10. Broader product pressures remain open

Wheel-mode5 is a research priority, not the whole product roadmap.

Still legitimate future product slices include:

- natural steering self-return/self-alignment;
- steering/handling geometry;
- camera and controls;
- UI/presentation;
- world/scan experience;
- performance;
- drivetrain/brake balance.

Do not opportunistically mix these into RH0 apparatus hardening. Conversely, do not allow wheel-mode5 to become an endless lab detached from product uncertainty: a large new forensic lane should state which product decision it can change.

## 11. What not to do next

- Do not restart the old strategic cold takeover.
- Do not promote wheel-mode5 to `main` or Owner Preview.
- Do not patch Box3D recycler semantics without later representative material relevance.
- Do not repair/rerun RQ2c0b yet.
- Do not tune guide stiffness until an arbitrary historical threshold passes.
- Do not start camber/steer/load-transfer physics before RH0.
- Do not use donor outer-P75 evidence as full annular validation.
- Do not delete the historical research apparatus before a canonical replacement reproduces the evidence.
- Do not mistake the successful legacy bridge for completion of harness consolidation.
- Do not ask the Owner to judge low-level telemetry before a faithful experiential candidate exists.

## 12. Fresh continuation

For normal product work:

1. verify live `main`;
2. read `AGENTS.md`;
3. read this file;
4. inspect only product source/tests relevant to the requested slice.

For wheel-mode5 research:

1. verify live `main` and research branch separately;
2. read `AGENTS.md` and this file;
3. read `docs/WHEEL_MODE5_CURRENT_STATE_AND_ROADMAP_2026-09-04.md`;
4. read `docs/WHEEL_MODE5_RESEARCH_AUDIT_AND_FOUNDATION_HARDENING_2026-09-05.md`;
5. validate `docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json` and the replay contract;
6. use `docs/WHEEL_MODE5_RH0_LEGACY_COMPOSITION_REPLAY_RESULT_2026-09-05.md` as the migration A-side;
7. continue **RH0.3 explicit consolidated harness**, not RQ2c0 physics;
8. open historical experiment docs only as directed by the ledger/router.

Current milestone boundary: **Steering I1 remains the last Owner hands-on product baseline; wheel-mode5 has strong but scoped laboratory evidence through RQ2c0a; RQ2c0b has no physics result; RH0 ledger/replay foundation and legacy migration oracle are PASS; explicit consolidated RQ harness + replay and challenge-derived orientation error budget remain before new physics; no product promotion authorized.**
