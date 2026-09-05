# Wheel mode5 RH0 — consolidated RQ harness design

Date: 2026-09-05
Status: **DESIGN BASELINE / IMPLEMENTATION NEXT WITHIN RH0**
Depends on:

- `docs/WHEEL_MODE5_RESEARCH_AUDIT_AND_FOUNDATION_HARDENING_2026-09-05.md`
- `docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json`
- `docs/evidence/WHEEL_MODE5_RH0_CANONICAL_REPLAY_CONTRACT_2026-09-05.json`

## 1. Problem being solved

The current donor-carrier RQ program repeatedly does the following:

1. recover the same pinned `box3d.js`;
2. recover/apply the same pinned native wheel donor patch;
3. generate the same E1 annular header;
4. apply the same E1 + E2a binding patches;
5. apply one or more scenario-specific Python scripts that textually mutate `bindings.cpp`;
6. rebuild all of Box3D.js;
7. execute one JS runner;
8. preserve one result artifact.

The physics questions were often well isolated, but the active apparatus now encodes scenario identity through **composition history**. RQ2b clones the already-generated RQ2a helper. RQ2c0a clones RQ0 after earlier patches. RQ2c0b then tried to rename another already-composed helper and failed because the expected occurrence count had changed from two to three.

That model has crossed its useful scale.

The hardening objective is not merely fewer files. It is:

> **make the active apparatus explicit enough that a reviewer can identify the complete physics composition and scenario difference without reconstructing a chain of textual mutations.**

## 2. Non-goals

RH0 consolidation does **not**:

- change accepted product `main`;
- change Box3D recycler semantics;
- invent new tire physics;
- solve full annular side/inner/bore contact;
- replace the current donor carrier with a product tire model;
- add camber, steering, suspension or load transfer;
- tune the local-axis guide;
- explain the RQ2 drive/brake asymmetry;
- delete historical workflows/patches;
- claim that replay agreement broadens the original evidence scope.

## 3. Migration principle: preserve first, improve second

Do **not** combine apparatus consolidation and physics generalization into one refactor.

The migration has two layers:

### Layer A — frozen canonical replay apparatus

Reproduce the existing RQ evidence with named frozen scenarios and no new physics freedom.

Purpose:

- prove that the new execution path preserves current evidence;
- remove dependence on multi-generation helper cloning;
- establish one place to inspect world/shape/contact/telemetry construction.

### Layer B — later bounded parameterization

Only after Layer A passes replay:

- expose selected scenario parameters;
- add the next physically justified orientation case;
- derive challenge/error budgets before new acceptance gates.

This ordering prevents a flexible new API from hiding an accidental change to the old apparatus.

## 4. Canonical composition boundary

The consolidated active RQ build should preserve only the minimum common native composition needed for donor outer-carrier dynamics:

1. pinned `box3d.js`:
   `2617a0ff763a60c9f17cee57c6ea72aab75a5077`;
2. pinned vendor Box3D:
   `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`;
3. pinned donor wheel implementation patch recovered from `Jozzpoly/Box3d_FunProject` using the existing exact donor diff boundary;
4. E1 annular header generation required by the current E1/E2a composition;
5. existing E1 binding patch;
6. existing E2a binding patch, including `e2aMakeOuterCarrier`;
7. **one new RH0 suite adapter**.

E2a2 forensic patches are explicitly outside the active replay composition.

Historical RQ0/RQ1/RQ2 scenario patch scripts become provenance/reference inputs, not active composition requirements once the new suite passes replay.

## 5. New C++ ownership model

### 5.1 Versioned suite module in this repository

Create a normal source artifact under a dedicated RH0 path, for example:

`tools/wheel-mode5/rh0/wheel-mode5-rq-suite.hpp`

It should contain the active donor-carrier scenario implementation as readable C++ rather than a Python string literal.

The workflow copies this file to the pinned `box3d.js/src/` working tree before compilation.

### 5.2 Small stable adapter patch only

Create one small script, for example:

`tools/wheel-mode5/rh0/patch-rq-suite-adapter.py`

Its allowed job is narrowly bounded:

- insert exactly one include for the suite immediately before the namespace closes, after E2a helpers exist;
- register the suite's explicit binding entry points;
- assert those anchors occur exactly once;
- make no scenario-specific physics edits.

The suite header is textually included after `e2aMakeOuterCarrier` is defined in the same translation unit, so it can reuse that helper without turning the historical E2a code into another patch target.

The adapter must not clone or rewrite complete scenario functions.

## 6. Frozen scenario API

Layer A should expose **named canonical scenarios**, not arbitrary user-controlled floats.

Recommended internal identifiers:

- `RQ0_MATCHED`
- `RQ0_ZERO_SPIN_POSITIVE_CONTROL`
- `RQ1C_FLAT_CONTROL`
- `RQ1C_30URAD`
- `RQ2_ZERO_TORQUE_CONTROL`
- `RQ2A_BRAKE20`
- `RQ2B_DRIVE20`

A stable numeric enum may exist at the C++ boundary, but JS should map it to human-readable names and reject unknown values.

Suggested binding surface:

`rh0RunOuterP75CanonicalScenario( int scenarioId )`

The canonical replay scenarios hard-code the original evidence conditions:

- `1 m/s` initial speed;
- `mu = 0.9`;
- original world step/substep counts;
- original start position/road construction per scenario family;
- original settle and pulse windows;
- original 30 µrad road geometry;
- original `0.20 * mu*m*g*R`, `0.5 s` braking/drive demand;
- original aligned planar angular/linear guide for these frozen legacy scenarios.

This is intentional. The frozen API exists to reproduce evidence, not to be the final experimental API.

## 7. Internal code structure

Avoid one 1000-line switch statement. Split responsibilities inside the suite module while preserving execution order:

### A. `RqScenarioConfig`

Immutable scenario description:

- road mode (`box_flat`, `long_hull_flat`, `long_hull_kink`);
- road angle;
- initial X;
- matched-spin vs zero-spin;
- torque mode (`none`, `brake`, `drive`);
- demand fraction;
- total steps;
- settle step;
- pulse start/end;
- telemetry windows.

### B. common world/wheel construction

One implementation for:

- E2a outer-carrier recovery;
- support radius;
- world definition;
- material properties;
- aligned planar guide required by the frozen suite;
- wheel body/shape creation;
- validation of body/shape/contact presence.

Road creation branches only by explicit `road mode`.

### C. common contact sample

Define a small internal structure containing at least:

- contact count;
- manifold point count;
- total normal impulse;
- sorted unique feature IDs;
- first available manifold normal.

One sampling function should replace repeated contact-tree traversal across RQ0/RQ1/RQ2.

### D. common kinematic sample

At each needed step:

- position;
- linear velocity;
- angular velocity;
- rolling slip using the same support radius convention.

### E. scenario-specific aggregation

Preserve only the metrics actually needed by the replay contract and future comparison.

- RQ0: settled rolling/positive-control response;
- RQ1c: road geometry provenance + near-transition normal/topology window;
- RQ2: pulse-window traction metrics + pre/post kinematics.

This is preferable to maintaining three independent copies of world/contact traversal.

## 8. Result schema

The new JS runner should write one artifact:

`rh0-canonical-rq-replay-result.json`

Recommended shape:

- `method`
- exact dependency/provenance block;
- exact executed source SHA;
- scenario result map keyed by canonical scenario ID;
- derived cross-scenario comparisons;
- replay validator result/version.

Continuous fields should use explicit unit-bearing names at the JS/result layer, e.g.:

- `settledYRangeMm`
- `settledMaxAbsVyMmPerS`
- `postMeanNormalXMicroRad`
- `rollingConstraintDeltaResidualMmPerS`

Do not rely on readers remembering whether a raw C++ field was meters or millimeters.

## 9. Replay validation

The canonical reference/tolerance contract is:

`docs/evidence/WHEEL_MODE5_RH0_CANONICAL_REPLAY_CONTRACT_2026-09-05.json`

A reusable validator should consume the new result JSON and the contract.

Validation rules:

- exact discrete topology/contact gates where declared;
- numeric min/max envelopes for continuous metrics;
- cross-scenario sentinel evaluation;
- explicit failure report showing scenario, metric, observed value and gate;
- no automatic updating of reference values after a failure.

A failed replay is **HARNESS NON-DRIFT FAIL**, not immediately a physics discovery.

Investigate whether the consolidation changed construction, timing, observation or units before interpreting a new physical effect.

## 10. RQ2 sign-asymmetry sentinel

The current braking/drive transient difference must survive the refactor until evidence demonstrates why it should change.

Frozen reference:

- braking max pulse slip ~`0.0489 mm/s`;
- drive max pulse slip ~`3.678 mm/s`;
- drive/brake max-slip ratio ~`75x`;
- drive end-pulse rolling mismatch ~`2.924 mm/s`;
- drive final slip returns near zero.

The replay contract intentionally preserves an envelope for this characteristic.

A new harness that makes drive and braking suddenly numerically symmetric is **not automatically better**. It is evidence that something changed and must be understood before the new apparatus is trusted.

## 11. Workflow architecture

Create one heavy workflow for the active donor-carrier replay, for example:

`.github/workflows/wheel-mode5-rh0-canonical-rq-replay.yml`

One job should:

1. checkout;
2. setup pinned Node/pnpm/Emscripten;
3. recover pinned Box3D.js + donor patch once;
4. generate E1 header once;
5. apply E1 + E2a once;
6. copy/include the RH0 suite once;
7. build/test Box3D.js once;
8. execute all frozen canonical scenarios in one runner;
9. validate the combined result against the replay contract;
10. preserve one result artifact even on validation failure where possible.

This replaces **active repeated build orchestration**, not historical provenance.

The lightweight `wheel-mode5-research-foundation.yml` remains separate and cheap for static evidence/contract validation.

## 12. Migration sequence

### RH0.3A — implementation skeleton

- create suite module;
- create one small adapter patch;
- create one runner;
- create one replay-result validator;
- create one heavy replay workflow.

No historical workflow deletion.

### RH0.3B — first canonical replay

Run the frozen suite.

Expected classifications:

- `REPLAY_PASS`: all canonical gates satisfied;
- `REPLAY_FAIL`: one or more metrics drifted materially;
- `APPARATUS_INVALID`: build/composition/result schema failed before valid replay.

Do not repair a replay fail by widening gates until it turns green.

### RH0.3C — reconcile any drift

If drift exists:

1. identify whether construction order, road representation, timing, feature comparison, units or demand application changed;
2. restore semantic equivalence where possible;
3. if an unavoidable consolidation change exposes a genuinely better-defined measurement, document and independently decide whether the canonical reference should be superseded.

### RH0.4 — provenance cutover

Only after replay passes:

- mark the consolidated path as active canonical apparatus;
- mark old RQ0/RQ1/RQ2 workflows as historical provenance in the ledger/router;
- do not delete them yet;
- record exact consolidated harness source/run/artifact.

### RH0.5 — bounded parameterization

After provenance cutover, introduce a separate parameterized experiment API while retaining the frozen replay scenarios as regression fixtures.

New physics uses the parameterized API; every relevant change still runs frozen replay first.

## 13. Next orientation work after RH0

Do not choose an orientation angle just because the apparatus can accept one.

First recover a physically defensible scale from current JV/donor rig geometry and the actual product question, for example:

- static wheel alignment in the recovered rig;
- likely steering axis / camber range;
- current suspension geometry;
- scale at which a contact-normal or support-feature change becomes relevant to handling/self-alignment.

Then define:

- challenge amplitude;
- expected physical signal;
- maximum guide/compliance/error budget that keeps apparatus error clearly below that signal.

Only after this comparison should the project decide whether the observed `148.785 µrad` at 120 Hz is already negligible, whether a stiffer local-axis guide is justified, or whether the guide architecture itself should change.

## 14. Success condition

The consolidated harness is successful when a fresh reviewer can answer all of these without reconstructing experiment history:

1. Which exact native dependencies are running?
2. Which wheel representation is being tested?
3. Which scenario differs from which control, and by what single intentional mechanical input?
4. Which metrics define non-drift?
5. Which current characteristics are intentionally preserved as sentinels?
6. Which evidence lane does the result belong to?
7. Does a green result mean harness replay, bounded research qualification, or Owner/product acceptance?

If those answers are explicit, RH0 has materially raised the quality of the research platform rather than merely reorganizing files.
