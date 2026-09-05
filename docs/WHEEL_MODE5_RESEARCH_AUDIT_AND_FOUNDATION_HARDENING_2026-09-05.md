# Wheel mode5 — retrospective research audit and foundation hardening

Date: 2026-09-05
Owner: Jozz
Review branch at entry: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Review cutoff head: `cdb0babf2165a7599a123079b46928dbd392c13f`
Canonical product `main`: `5b28cc03d22264010680deb95a04abd04661bc22`

Status: **RESEARCH AUDIT / ROUTING CORRECTION / RH0 HARDENING AUTHORIZED**

This document reviews the wheel-mode5 research program from the last accepted Owner hands-on product checkpoint through the current RQ2c0 frontier. It is deliberately retrospective. It does not promote research code to product truth and it does not authorize a new physics experiment until the hardening gate below is satisfied.

## 1. Review boundary: what happened after the last Owner test

The last current-best Owner hands-on baseline is:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

That checkpoint records Owner observation on 2026-08-31, consolidated 2026-09-01. Its acceptance was explicitly scoped:

- touch steering ownership/release/re-grab behavior improved materially;
- 900-degree Direct steering became current-best/default rather than final frozen ratio;
- artificial centering was rejected as an Owner-facing dependency;
- natural physical steering self-return/self-alignment remained unresolved;
- wheel/contact backend, drivetrain, suspension, rig geometry and handling were not changed or accepted by that slice.

No later wheel-mode5 result has received Owner hands-on acceptance. Everything reviewed below is therefore **laboratory R&D evidence**, not experiential product validation.

At the review cutoff, the wheel-mode5 research branch is `417` commits ahead of accepted `main`. That scale is itself relevant evidence: the research program has generated substantial knowledge, but also substantial apparatus and interpretation debt.

## 2. Executive verdict

### Direction: **KEEP, BUT CONSOLIDATE BEFORE CONTINUING**

The work is not a failed detour. It materially improved our understanding of:

- the recovered tire geometry and its provenance;
- the distinction between annular diagnostic geometry and the donor dynamic `b3Wheel` carrier;
- contact normal/witness semantics;
- a real bounded recycler/reprojection discrepancy;
- the lack of demonstrated material harm from that discrepancy in the first bounded rolling transition;
- flat-road rolling and sub-limit longitudinal traction of the donor outer-P75 carrier;
- why the existing world-axis angular locks are unsuitable for future tilted-wheel claims;
- a plausible local-axis angular guide (`b3ParallelJoint`) for laboratory continuation.

The strongest methodological feature has been the willingness to invalidate our own apparatus and interpretations instead of converting every green CI run into a physics claim. Examples include:

- free-3D RQ0 -> historical-only apparatus evidence;
- first planar-lock composition -> no physics interpretation;
- RQ1 20 µrad ridge -> apparatus-invalid after hull introspection;
- early RQ1d segment/vertex interpretation -> falsified by direct effective-profile inspection;
- RQ2c0a `acos(axis.z)` tilt reading -> instrument-invalid and rerun with a stable formulation;
- RQ2c0b 240 Hz attempt -> composition failure before build/runtime, therefore no 240 Hz physics result.

However, the research system itself is now the main quality risk. The branch contains a very large number of experiment-specific workflows, runners and text-patching scripts. The newest RQ2c0b attempt failed because the patch expected two occurrences of a cloned helper name but inherited three. This is not a Box3D or wheel failure. It is direct evidence that **apparatus composition has become too brittle to keep scaling by another dedicated patch/workflow per question**.

The next milestone is therefore not RQ2c1. It is **RH0 — Research Foundation Hardening**.

## 3. What survives the audit as trusted bounded evidence

### 3.1 Authority separation — STRONG / KEEP

Product authority remained protected throughout the research lane.

- accepted `main`: `5b28cc03d22264010680deb95a04abd04661bc22`;
- Owner Preview was not moved by wheel-mode5;
- research conclusions remained on explicit research branches;
- green laboratory runs were not promoted to Owner acceptance.

This is one of the strongest parts of the process and must remain unchanged.

### 3.2 E1 geometry/contact semantics — VALUABLE, BUT A SEPARATE LANE

E1b/E1c established an important distinction:

- the recovered annular boundary can be geometrically smooth/convergent while raw triangle-manifold normal selection is badly discontinuous in side/inner regimes;
- an analytic profile normal dramatically improves the side/inner normal continuity;
- that same analytic substitution is not universally correct on broad flat support, where the native pair normal is already stronger and witness ownership becomes the problem.

This supports a regime-aware annular contact model, but **no dynamic solver has yet validated full annular side/inner/bore semantics**.

Audit correction: wheel-mode5 currently contains two related but non-identical research lanes that must no longer be mentally merged:

1. **Annular Contact Semantics lane** — E1-style full tire boundary, side/inner/bore semantics, native/dynamic manifold problem;
2. **Donor Outer-Carrier Dynamics lane** — E2a/RQ0+ `b3Wheel` outer-P75 carrier used for bounded rolling/traction/contact experiments.

The second lane can teach us about rolling apparatus and solver behavior, but it cannot validate the first lane's annular contact semantics.

### 3.3 E2a2 recycler forensics — TRUSTED, SUFFICIENTLY CLOSED

The E2a2 chain localized a real laboratory mechanism:

- actual recycler shortcut participation matters;
- recycled separation reprojection is a necessary amplifier in the tested transformed-ground and fixed-road regimes;
- trusted shadow evidence measured roughly `0.118 mm` recycled-vs-fresh separation discrepancy around the fixed-road transition;
- stale `baseSeparation` was not the dominant discrepancy;
- E2a2aj showed that reprojection is an ill-conditioned residual of much larger cancelling frame/anchor terms, invalidating naive absolute-component causal attribution.

Audit verdict: **the stop decision was correct**. In hindsight, the chain was already long and expensive, but it eventually imposed the correct boundary: no E2a2ak/reference-frame descent without representative material harm.

Do not reopen this lane merely because an unrelated later test is imperfect.

### 3.4 RQ0 steady rolling — KEEP, SCOPED

RQ0 is a useful laboratory baseline for the donor outer-P75 carrier:

- true static flat road;
- frictional coupling actually exercised by a zero-spin positive control;
- `0` settled dropout;
- `0` feature churn;
- point count `1..1`;
- essentially invariant longitudinal speed/spin;
- microscopic rolling slip;
- measured vertical background retained rather than tuned away.

The correction from a free 3D wheel to a planar axle guide was methodologically sound for the question being asked.

Audit limitation: the world-axis angular locks make RQ0 **an aligned planar laboratory baseline**, not a representative wheel mount. This was later recognized correctly and motivates RQ2c0.

### 3.5 RQ1 / Q1-A — KEEP OPERATIONALLY, NARROW THE LANGUAGE

RQ1c executed one real road-face/contact-feature transition at the first tested hull-preserved ridge (`30 µrad`) and found no material disturbance beyond RQ0 background. RQ1d added signed `+/-10 µrad` relative-normal change while retaining the same effective support feature and remained effectively neutral/symmetric.

The operational decision remains valid:

> do not reopen recycler micro-forensics because the first bounded rolling topology challenge did not demonstrate material harm.

Audit correction: **"representative" must not silently grow in meaning**. A `30 µrad` road-normal kink is useful because it is the first clean representable topology transition in the pinned hull apparatus, not because we demonstrated it spans real-world road irregularity or the future vehicle's mechanically important envelope.

Q1-A therefore means:

> no material recycler/contact pathology was demonstrated in the tested **bounded laboratory rolling-transition envelope**.

It does not mean rough-road/topology risk is globally retired. Larger physically justified irregular-road cases may be tested later for their own product relevance, without treating them as an attempt to "make Q1 fail".

### 3.6 RQ2a braking — KEEP, SCOPED

RQ2a is strong bounded evidence that the RQ0 apparatus can transmit a meaningful sub-limit braking demand through ordinary friction without contact dropout/churn or material vertical disturbance.

Important scope remains:

- `0.20 * mu*m*g*R` is a transparent scaling convention, not a demonstrated traction limit;
- no lockup, ABS-like regime, load transfer or full braking curve was tested.

No correction to the main physics classification is required.

### 3.7 RQ2b drive — KEEP, BUT PROMOTE ASYMMETRY TO A SENTINEL

RQ2b likewise transmitted bounded drive demand with:

- `0` dropout;
- `0` feature churn;
- stable final return to near-zero rolling slip after torque removal.

The drive response is nevertheless materially different numerically from braking inside the same simple apparatus:

- braking max pulse slip: about `0.0489 mm/s`;
- drive max pulse slip: about `3.678 mm/s`;
- drive end-of-pulse rolling mismatch: about `2.924 mm/s`, later relaxed by ordinary friction.

At `1 m/s` and the tested sub-limit demand, this is still small in absolute terms and is not evidence of a contact-stability failure. The earlier decision not to reopen recycler forensics remains correct.

Audit correction: do not let the asymmetry disappear into prose. It becomes a **sentinel metric** for future apparatus changes. If a new mount, orientation or load case amplifies this sign asymmetry materially, it may become decision-relevant even if the current case is benign.

## 4. RQ2c0 audit: where the current frontier needs correction

### 4.1 The problem diagnosis was correct

World-axis angular X/Y locks are unsuitable for a tilted wheel because legitimate spin components may no longer align with world Z. The move toward a local-axis constraint is therefore justified.

Pinned Box3D inspection found `b3ParallelJoint`, whose solver constrains relative local-Z orientation using angular impulses without adding a translational anchor constraint. That makes it a strong **local-axis laboratory angular guide** candidate.

### 4.2 Terminology correction: not yet a "mechanically representative mount"

The current RQ2c0a challenge still retains a world linear-Z lock and attaches wheel orientation to a static reference body. This is intentionally synthetic.

It is therefore too strong to call it a mechanically representative axle/mount. Until a real carrier/chassis relation is introduced, use:

> **local-axis angular guide / mount-feasibility apparatus**

This is sufficient to test whether we can stop relying on angular world-axis locks. It is not yet product suspension/axle evidence.

### 4.3 120 Hz result: feasibility supported, arbitrary acceptance threshold unresolved

Corrected RQ2c0a measured:

- `0` dropout;
- `0` feature changes;
- point count `1..1`;
- Y range within about `2%` of RQ0;
- mean normal impulse within about `1%`;
- max slip about `0.0347 mm/s`;
- max axle-axis tilt `148.785 µrad` = `0.008525°`.

It failed the predeclared `<100 µrad` gate. That historical gate result remains factual and must not be rewritten after seeing the answer.

However, audit finds that the **100 µrad limit itself was not derived from a product requirement, intended camber/steer challenge amplitude, or a measured contact-sensitivity budget**. It was a laboratory cleanliness threshold.

Therefore:

- preserve `120 Hz -> 148.785 µrad -> historical gate FAIL`;
- do **not** conclude that `148.785 µrad` is mechanically unacceptable in general;
- do **not** tune stiffness upward merely until the old arbitrary threshold turns green;
- define the next orientation challenge and its measurement/error budget first, then judge whether guide compliance is negligible relative to the effect being measured.

### 4.4 RQ2c0b 240 Hz: APPARATUS-INVALID / NO PHYSICS RESULT

The already-started 240 Hz follow-up is now closed as apparatus provenance:

- source: `cdb0babf2165a7599a123079b46928dbd392c13f`;
- workflow/job: `33958792392 / 101286854234`;
- donor recovery succeeded;
- composition stopped before Box3D build/runtime;
- failure: `RQ2c0b expected function+binding occurrences=2, got 3`;
- no result JSON existed because physics never executed.

Classification:

> **APPARATUS-INVALID / COMPOSITION FAILURE / NO 240 HZ PHYSICS EVIDENCE**

Do not immediately repair and rerun it. The failure is useful evidence for RH0 apparatus consolidation.

## 5. Process audit

### What worked unusually well

1. **Authority discipline** — research never silently became product truth.
2. **Exact provenance** — pinned Box3D.js/vendor/donor identities are routinely recorded.
3. **Causal isolation** — later RQ experiments usually change one intentional dimension.
4. **Matched controls** — especially RQ0/RQ1/RQ2.
5. **Failure classification** — build, apparatus, instrument and physics failures are kept distinct.
6. **Correction of interpretation** — several early intuitions were explicitly falsified rather than rationalized.
7. **Stop decisions improved over time** — E2a2 eventually stopped; RQ1 did not escalate merely to provoke failure; RQ2 did not become an arbitrary torque sweep.
8. **Absolute scale over ratio theater** — denominator-sensitive slip ratios were interpreted using physical absolute magnitudes.

### What now needs repair

#### A. Experiment-specific infrastructure proliferation

The research branch is `417` commits ahead of accepted `main` and contains a large family of one-off workflows, runners and patch scripts.

Risk:

- canonical apparatus becomes hard to identify;
- composition order becomes implicit knowledge;
- text anchors drift;
- a new probe can inherit hidden historical diagnostics;
- reviewing physics increasingly requires reviewing orchestration archaeology first.

RQ2c0b is the newest concrete failure from this pattern.

#### B. String-based C++ cloning/patching has crossed its useful scale

For a bounded recovery spike, text patching was efficient. For a continuing research platform, repeatedly cloning rendered C++ helpers by string anchors is too brittle.

Future scenario differences should be expressed as parameters/configuration in one explicit canonical harness where possible, not another script that rewrites an already-rewritten helper.

#### C. Canonical evidence is distributed across too many documents

Individual checkpoints are often strong, but recovering current truth requires knowing which of many similarly named E2a2/RQ files superseded which others.

We need a small machine-readable ledger mapping:

`question -> status -> exact executed source -> run/job/artifact -> canonical result -> scope -> superseded/invalid evidence -> reopen trigger`.

#### D. Reproducibility is mostly implicit

The simulator/harness appears deterministic and exact versions are pinned, but most scientific conclusions rely on one canonical execution per condition. For strong sentinels and future harness refactors, we need a minimal reproducibility check rather than assuming deterministic replay from architecture.

This does **not** justify repeated statistical runs of every deterministic experiment. It justifies verifying that the consolidated harness reproduces the small canonical suite.

#### E. Error budgets are not yet tied tightly enough to decision scale

RQ2c0's 100 µrad gate demonstrates the problem. A predeclared threshold is better than post-hoc threshold moving, but predeclaration alone does not make a threshold physically meaningful.

Future gates should state why the measurement error/compliance is small enough relative to the challenged physical effect.

#### F. Product relevance must stay visible

The last Owner hands-on acceptance still says natural physical self-return/self-alignment is unresolved. The wheel-mode5 program has not yet tested caster/KPI/trail/self-aligning torque or produced a faithful Owner-facing wheel/contact candidate.

That is not a reason to stop foundational contact research. It is a reason to keep a visible bridge:

> laboratory knowledge must eventually reduce a real product uncertainty or enable a faithful candidate.

Do not allow another hundreds-of-commits forensic descent without an explicit product/research decision it can change.

## 6. RH0 — Research Foundation Hardening

**RH0 is now the active milestone before any new wheel physics challenge.**

### RH0.1 — canonical evidence ledger

Create one compact machine-readable ledger and keep this audit as the human interpretation layer.

The ledger must record at minimum:

- last Owner hands-on baseline;
- E1 annular-semantic status;
- E2a2 forensic closure;
- RQ0;
- RQ1c/RQ1d and Q1-A;
- RQ2a/RQ2b;
- RQ2c0a instrument-invalid first measurement and corrected 120 Hz result;
- RQ2c0b apparatus-invalid 240 Hz attempt.

### RH0.2 — canonicalize evidence status vocabulary

Use a small explicit vocabulary instead of prose-only status inference:

- `OWNER_ACCEPTED_SCOPED`
- `TRUSTED_EXECUTED_SCOPED`
- `TRUSTED_DIAGNOSTIC`
- `RESEARCH_DECISION`
- `INSTRUMENT_INVALID`
- `APPARATUS_INVALID`
- `HISTORICAL_ONLY`
- `OPEN_NOT_VALIDATED`

A green workflow is never itself a status.

### RH0.3 — consolidate the active apparatus

Before RQ2 continues:

1. stop creating a new full workflow for each tiny parameter change;
2. identify the **minimum current canonical composition** needed for RQ0/RQ1/RQ2 donor-carrier work;
3. move scenario differences toward explicit configuration/parameters;
4. create one reusable research execution path for the active RQ family;
5. retain historical workflows for provenance initially — do not mass-delete them during the same refactor;
6. prove the new path by reproducing frozen canonical scenarios before trusting new science from it.

Natural target scenarios for the first consolidated regression suite:

- RQ0 matched rolling + zero-spin positive control;
- RQ1c 30 µrad road-normal transition;
- RQ2a braking pulse;
- RQ2b drive pulse and its sign-asymmetry sentinel.

RQ1d may remain a secondary regression if it is cheap; E2a2 forensics should not be dragged into the everyday active harness.

### RH0.4 — reproducibility / non-drift gate

The consolidated harness must demonstrate that it preserves the accepted bounded evidence, not merely compile.

For each canonical scenario, compare at least:

- contact dropout count;
- feature changes / point-count range where relevant;
- Vx/spin response;
- rolling slip scale;
- vertical background scale;
- normal impulse scale;
- challenge-specific metric (RQ1 transition normal, RQ2 torque response).

Use exact equality only where deterministic emitted values are expected and stable. Else use declared tolerances tied to measurement significance.

RQ2b drive/brake asymmetry becomes an explicit regression sentinel rather than a forgotten observation.

### RH0.5 — challenge-derived error budgets

Before returning to local-axis orientation work:

1. decide the next physical question first;
2. select a bounded challenge amplitude from actual JV/donor geometry or another defensible product scale;
3. define how much mount-axis error/compliance can be tolerated before it contaminates that measurement;
4. only then judge whether 120 Hz is already adequate, whether a stiffer guide is needed, or whether `ParallelJoint` is the wrong apparatus.

The historical `<100 µrad` gate remains in the RQ2c0a record but is **not** the canonical product acceptance criterion.

### RH0.6 — branch hygiene / continuation boundary

The current research branch should be treated increasingly as an **evidence archive**, not as a forever-growing universal lab.

After the consolidated apparatus reproduces the minimum canonical suite, decide whether to:

- continue on a dedicated hardened RQ branch, or
- create a clean research continuation from accepted `main` plus only the minimal canonical wheel-mode5 apparatus and evidence pointers.

Do not perform a large destructive cleanup of historical files before the canonical replacement exists and reproduces the required evidence.

## 7. Post-RH0 physics routing

Only after RH0 passes:

### First question

Resume RQ2c as **local-axis orientation feasibility**, not as stiffness tuning.

A likely next family is one controlled wheel orientation DOF (camber or steer), but its exact amplitude should come from actual rig/product geometry and the intended causal question, not a convenient tiny angle.

### Then

Advance one dimension at a time toward:

- orientation-sensitive rolling/contact;
- lateral/relative-normal behavior;
- controlled load transfer;
- wheel/carrier/chassis coupling;
- irregular-road cases selected for product relevance;
- eventual integration with the annular-contact-semantics lane when side/inner/bore behavior becomes necessary.

### Product relevance gate

Before a large new forensic branch opens, state explicitly which product uncertainty the research can change. Examples include:

- contact geometry required to remove legacy sphere-like wheel behavior;
- steering self-alignment foundations;
- stable wheel behavior under camber/steer/load transfer;
- faithful rough-road behavior.

When a faithful experiential candidate finally exists, return to an Owner Preview and hands-on judgement. Do not ask the Owner to judge low-level laboratory telemetry before that point.

## 8. Current canonical state after audit

### CURRENT ACCEPTED

- Steering I1 product baseline on `main`.
- No wheel-mode5 product promotion.

### TRUSTED / SCOPED RESEARCH

- E1 annular boundary/contact-semantic diagnostics;
- E2a2 bounded recycler/reprojection mechanism and forensic closure;
- RQ0 donor outer-P75 planar flat-road rolling;
- RQ1c bounded road-face transition;
- RQ1d same-feature signed cross-slope probe;
- Q1-A operational closure in the bounded laboratory envelope;
- RQ2a bounded braking;
- RQ2b bounded drive, with sign asymmetry retained as sentinel;
- RQ2c0a 120 Hz local-axis-guide feasibility/contact-equivalence evidence plus historical 100 µrad gate fail.

### INVALID / NO PHYSICS CLAIM

- RQ2c0a original zero-tilt `acos` measurement: `INSTRUMENT_INVALID`;
- RQ2c0b 240 Hz attempt at `cdb0babf...`: `APPARATUS_INVALID`, composition failed before build/runtime.

### OPEN

- full annular dynamic contact semantics;
- mount/orientation error budget tied to a real challenge;
- free camber/steer;
- load transfer and chassis coupling;
- rough-road/lateral envelope;
- traction limits;
- self-aligning steering mechanism;
- wheel-mode5 product value and Owner acceptance.

## 9. Immediate next action

**Do not repair RQ2c0b yet.**

Execute RH0 in this order:

1. create canonical evidence ledger;
2. add a lightweight validator for ledger/status/provenance invariants;
3. update the project router so fresh agents stop at RH0 rather than automatically continuing RQ2c0 stiffness work;
4. design the minimum consolidated active RQ harness;
5. reproduce the canonical RQ suite;
6. only then choose the next physical orientation challenge and its error budget.

This is the current-best route to raise scientific confidence while reducing future Owner attention cost and avoiding another apparatus-archeology spiral.
