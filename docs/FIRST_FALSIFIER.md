# JV-Web — first next-generation falsifier

Updated: 2026-08-26
Owner: Jozz
Gate: `7 — FIRST NEXT-GENERATION FALSIFIER SELECTION`
Status: `SELECTED / IMPLEMENTATION NOT YET AUTHORIZED / PRE-CODEX`
Selected falsifier: `FRONT-CORNER-AUTHORITY-ISOLATION-01`
Runtime/product baseline: `Jozzpoly/JV-Box3D-Web-experiment@2f50c6a994978942b432b45e99d3ce42f49261e9`

This document records the Gate 7 selection. It selects **one experiment**, not the permanent vehicle architecture. Product/runtime implementation remains deferred until the later pre-Codex responsibility, source-close and cold-takeover gates are complete.

Authority order remains:

`live Git/current files -> executed evidence -> direct scoped Owner/device evidence -> current docs -> historical plans/conversation memory`

Use `docs/ARCHITECTURE_HYPOTHESES.md` for the Gate 6 architecture/migration comparison and `docs/PROJECT_STATE.md` for current routing.

## 1. Selection verdict

Gate 7 selects:

**`FRONT-CORNER-AUTHORITY-ISOLATION-01`**

Classification:

**`M1 STRUCTURAL FALSIFIER / CONTROL-EQUIVALENCE PROBE / NOT PRODUCT-MECHANICS ACCEPTANCE`**

The selected question is:

> Can the current front-left M6 corner's physical construction and ownership be isolated behind one explicit owned-unit boundary inside the existing browser Box3D world, while preserving the exact current control behavior and without moving unrelated browser/product/world authority into that unit?

The experiment deliberately uses the current front-left implementation as a **control specimen**. It does not claim that the current front-left geometry, extra physical carrier bridge, provisional steering law, legacy split wheel, exact outboard mating or visual calibration are correct future mechanics.

## 2. Why this falsifier was selected

Gate 7 compared the Gate 6 candidate families by:

- architecture information gain;
- direct Owner/product relevance;
- causal blast radius;
- reversibility and rollback quality;
- dependence on Owner-open truth;
- deterministic machine-evidence quality;
- risk of mainly testing tooling/implementation stamina;
- premature architecture commitment required merely to run the experiment.

### C0 — local longitudinal semantic A/B

Strengths:

- lowest implementation blast radius;
- direct Owner relevance: current low-power and brake-dominance pressure;
- explicit current Native/Web `maxDriveSpeed` semantic mismatch;
- deterministic drive traces/tests already exist.

Why it is not first:

- architecture information gain is only medium;
- a successful local correction may improve a backend that explicitly remains `REFERENCE_BROWSER_FIXTURE`, `productPhysicsAuthority:false`, `nativeParity:NOT_PROVEN`, `acceptsNewProductPhysics:false`;
- it does little to discriminate A1 vs A2 or test whether a bounded next-generation mechanical migration is structurally possible.

C0 remains a valuable cheap control/later product slice. It is not rejected.

### A1 — Web-native capability slice

Strengths:

- high architecture information gain;
- close to current product/tooling/evidence loops;
- can keep Native as donor rather than executable authority.

Why it is not first:

- it already requires selecting and implementing a new mechanical behavior;
- without first understanding the migration/ownership boundary, a capability slice can become a mini-rewrite whose result mixes mechanical quality with integration coupling;
- a clean M1 result can make a later A1 test narrower and more causally legible.

A1 remains a serious architecture hypothesis.

### A2 — native-derived compiled vehicle core

Strengths:

- high potential architecture information gain;
- can preserve more executable donor semantics and expose a broader engine surface when truly needed.

Why it is not first:

- no active native-derived JV vehicle WASM implementation or build path exists in current JV-Web;
- the current Box3D solver already runs through a WebAssembly binding, so the missing work is a new vehicle-core build/ABI/world integration boundary rather than simply obtaining WASM physics;
- a first A2 spike risks measuring Emscripten/build/ABI/world-integration effort more than vehicle architecture;
- it forces the largest premature infrastructure commitment merely to ask the first question.

A2 remains open and becomes more relevant if later evidence exposes a real browser-binding or Web-native capability ceiling.

### M1 — coherent-subsystem migration/isolation

Why it wins the first slot:

- high branching information value: both PASS and FAIL materially change subsequent architecture work;
- low-to-medium causal blast radius when constrained to structural extraction/equivalence;
- high rollback quality;
- no dependency on unresolved final outboard mating;
- existing M6 corner trace/state surfaces and deterministic topology tests provide strong control evidence;
- current source is coupled enough that isolation is not trivially guaranteed, so the probe can genuinely fail;
- it tests whether the project's preferred small-slice migration loop is mechanically honest before any new product physics is written.

## 3. Source facts that make the probe falsifiable

At the selected runtime baseline:

- `M6CornerRuntime` / `M6CornerTrace` already expose a corner-level runtime/observation surface;
- `createM6VehicleRuntime(...)` nevertheless constructs chassis, rack and every corner in one coupled builder path;
- front-left construction combines source-registered hardpoints, a current extra suspension-carrier bridge, upper/lower arms, coilover, steering representation, legacy wheel/contact and spin-joint ownership;
- current front-left source tests distinguish suspension-side #6 from steerable #8/WheelCenter and explicitly keep the current rack mapping provisional;
- current topology/world tests already prove deterministic create/step/trace/dispose behavior;
- current product host is M6-specific, so the falsifier must not pretend that an interchangeable backend architecture already exists.

The apparent corner-level surface is therefore useful evidence but **not proof** of an authority boundary. That gap is exactly what this falsifier tests.

## 4. Exact experiment boundary

The implementation must begin from the exact current runtime/product behavior represented by the selected baseline. Documentation-only descendants do not change that runtime baseline.

The probe is allowed to create an explicit front-left control-unit construction/ownership boundary inside `src/vehicle/m6/` and focused tests needed to exercise it.

The intended external inputs are only pre-existing cross-unit authorities required by the current control specimen, such as:

- Box3D module / world identity;
- chassis body authority;
- rack authority where the current control path genuinely references it;
- existing M6 config and spawn/rest information;
- collision-group allocation/context;
- explicit corner identity/provenance.

The unit may return the current corner runtime/state plus explicit owned body/joint/shape identities or teardown ownership needed by the enclosing vehicle runtime. Exact API shape is implementation detail and is **not frozen by this document**.

The essential ownership rule is stronger than a file move:

> The enclosing M6 builder must no longer independently derive or construct front-left internals that the selected unit claims to own.

A parent that still computes front-left internal hardpoints, creates its bodies/joints/shapes, or must consume private internal geometry in order to preserve behavior has not demonstrated the selected boundary.

## 5. Explicitly out of scope

This falsifier must **not**:

- change product physics intentionally;
- select A1 or A2 as the permanent authority architecture;
- implement a new generic backend/plugin framework;
- add a native/Emscripten vehicle-core toolchain;
- change throttle/brake/drivetrain semantics;
- change steering input modes or tuning;
- solve natural steering return/contact;
- switch the product to Mode5 or select a final tire/contact architecture;
- remove or reinterpret the current extra FL carrier as part of this control-equivalence probe;
- promote that carrier to future mechanical truth;
- solve or guess final upper/lower outboard mating;
- freeze JURE, `RigDocument`, the current neutral schema or a JURE->Web lowering format;
- change visual assets/calibration except where a no-change trace equivalence test must observe them;
- redesign world loading, renderer, camera, fullscreen, mobile UI or input lifecycle;
- promote anything to Owner Preview/Public.

The current extra FL carrier, provisional rack/steering behavior and legacy split wheel may remain *inside the extracted control specimen only* so the experiment can preserve exact behavior. Their presence is evidence/history, not inheritance authority.

## 6. PASS semantics

`PASS` requires all of the following:

1. **Owned construction boundary** — front-left bodies/joints/shapes and its current internal hardpoint/anchor derivation are created inside one explicit unit boundary rather than partly in the enclosing vehicle builder.
2. **Explicit external authority** — cross-unit inputs such as chassis/rack/world/config are passed explicitly; the unit does not reach into unrelated product/UI/visual/global state.
3. **No hidden geometry leakage** — the enclosing builder/controller does not need private front-left geometry or duplicated hardpoint authority merely to keep the control working.
4. **Control equivalence** — existing neutral, positive/negative steering, suspension, drive+steer, topology, visual-trace and teardown evidence remains within its existing semantics/tolerances. No intended product-behavior delta is accepted as part of PASS.
5. **Determinism preserved** — repeated command sequences remain deterministic to the existing test precision where that precision is already asserted.
6. **Rollback remains clean** — the change is structurally bounded and can be reverted without undoing unrelated product work.
7. **No framework tax** — the probe does not require a generic backend/plugin/ontology layer or broad F4/browser-host rewrite.

PASS means only:

> **front-corner structural isolation is viable enough to continue M1-style evidence gathering at this granularity.**

PASS does **not** prove:

- the current FL mechanics are correct;
- the extra carrier is acceptable future topology;
- current mating coordinates are final;
- current steering/contact/drivetrain is good;
- A1 is the final architecture;
- A2 is unnecessary;
- the same boundary is correct for every corner or future machine.

## 7. FAIL semantics

`FAIL` is the correct result if one or more of the following is intrinsic to the attempted front-corner boundary:

- the enclosing builder must continue owning or recomputing front-left internal geometry/relations;
- a supposedly isolated corner requires duplicated chassis/rack/world physical authority rather than explicit cross-unit references;
- preserving the current behavior requires leaking private front-left hardpoints/representation details back into unrelated layers;
- extraction forces changes across unrelated input, world, renderer, UI or publication systems;
- preserving control behavior requires a large adapter/framework layer whose purpose is mainly to hide the old coupling;
- the corner cannot own a coherent create/trace/teardown lifecycle without effectively rebuilding a materially larger vehicle authority unit.

A FAIL at this granularity does **not** prove that M1 is impossible everywhere. It means:

> **front-corner granularity is not a trustworthy low-blast migration boundary in the current runtime.**

The next decision may then test a wider coherent unit (for example front-axle/rack scope) or increase the weight of a broader A1/A2 authority boundary. The result must not be converted automatically into an A2 selection.

## 8. INCONCLUSIVE semantics

Use `INCONCLUSIVE`, not FAIL, when the experiment cannot answer the architecture question because of an unrelated execution problem, for example:

- the exact baseline cannot be reproduced because the required canonical environment or source is unavailable;
- an unrelated tooling/test infrastructure failure prevents comparison before the boundary itself is exercised;
- live source changes underneath the experiment and invalidates the assumed baseline.

An inconclusive tooling incident is not product/mechanical evidence.

## 9. Validation ladder for the later implementation

The later executor must use validation proportional to this runtime-structural blast radius.

### Before the first product-source change

1. Re-resolve live repo/ref and confirm the selected experiment still applies.
2. Confirm runtime/product files are still byte/semantically descended from the selected baseline or explicitly account for any intervening changes.
3. Run/capture focused baseline controls before refactoring, using the repository-declared canonical toolchain.

High-value existing controls include:

- `tests/m6-topology-world.test.mjs`;
- `tests/owner-vehicle-s2-front-corner.test.mjs`;
- `tests/m6-visual-trace.test.mjs`;
- `tests/m6-dynamic-steering-validation.test.mjs`;
- `tests/m6-drive.test.mjs` where drive/spin ownership is affected;
- `tests/f4-backend-contract.test.mjs` for the existing host/backend boundary.

The executor may narrow/extend this set only according to the actual diff.

### Structural RED

Add the smallest focused test/evidence that demonstrates the intended isolated unit cannot be instantiated/owned through the selected boundary on the pre-change source. Avoid brittle source-text assertions when runtime ownership evidence can test the contract directly.

### GREEN / causal evidence

After extraction:

- focused unit/ownership test PASS;
- existing relevant M6/S2/trace tests PASS without loosening their meaning to accommodate the refactor;
- deterministic trace comparison/control remains stable;
- topology/teardown ownership remains complete;
- diff audit confirms no unrelated product behavior change.

### Candidate close

Because this is a production vehicle-runtime structural change even though behavior should remain identical:

- run repository-declared typecheck/checks appropriate to the changed runtime;
- run the focused causal suites above;
- run the normal canonical build at the material slice close;
- obtain a faithful clean-source browser smoke/render proving the vehicle/world still starts and the existing control path operates.

Owner device/feel judgement is **not required merely to approve a no-behavior structural extraction**. If any visible/feel behavior changes, that is a regression or a scope change requiring separate evidence, not a reason to ask the Owner to bless the falsifier.

Do not promote the experiment to Owner Preview/Public merely to validate structural isolation.

## 10. Protected baseline

Outside the declared front-left structural runtime scope, preserve:

- current browser/product shell;
- worlds and JSPREV2 behavior;
- Camera Manual Rig and Fullscreen;
- Direct Rotation + Relative-X steering input foundations;
- absolute throttle/brake semantics and multitouch ownership;
- D/R pointer lifecycle;
- fail-closed input behavior;
- accepted mobile composition/A53 resource baseline;
- visual asset/package identity;
- Preview/Public provenance rules;
- Native and JURE donor states.

## 11. How the result routes the next architecture work

### If PASS

- M1 remains viable at front-corner granularity;
- the next mechanical capability falsifier can use the isolated boundary rather than rebuilding the whole product host;
- A1 becomes cheaper to test, but is **not selected automatically**;
- A2 remains open and should be revisited only if a later capability test exposes a real Web/browser execution ceiling or stronger native-derived value.

### If FAIL

- do not patch around the failure with more adapters;
- record exactly which authority/coupling made the corner non-coherent;
- compare a wider coherent unit against broader A1/A2 authority boundaries;
- keep the current legacy runtime as the control specimen until a replacement has causal evidence.

### If INCONCLUSIVE

- fix/re-ground only the execution blocker necessary to answer the selected question;
- do not reinterpret tooling failure as evidence for A1, A2 or M1.

## 12. Gate 7 non-decisions

Gate 7 deliberately does not decide:

- Web-native vs native-derived compiled final vehicle authority;
- exact future front mechanical topology/coordinates;
- exact outboard mating;
- final wheel/contact model;
- steering-return solution;
- final drivetrain semantics/tuning;
- JURE permanence or lowering format;
- renderer/world-streaming architecture;
- universal machine/component ontology.

## 13. Gate 7 exit verdict

`FRONT-CORNER-AUTHORITY-ISOLATION-01` is the selected first next-generation falsifier because it currently provides the best combination of:

**architecture information gain + bounded blast radius + reversibility + deterministic evidence + independence from unresolved Owner mating truth.**

The selection is intentionally conservative about what PASS can prove and aggressive about what counts as hidden coupling.

**Gate 7 selects the experiment. It does not authorize implementation yet.**
