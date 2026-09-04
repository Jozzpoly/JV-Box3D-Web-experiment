# Wheel mode5 — current state and research roadmap

Updated: 2026-09-04
Owner: Jozz
Research branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Roadmap input checkpoint: `673dd16410d1ca98c0e909bd7421e7ca409273ad` (E2a2aj forensic closure)
Canonical product `main` at roadmap refresh: `5b28cc03d22264010680deb95a04abd04661bc22`

## 1. Why this document exists

The wheel-mode5 branch now contains a large and useful evidence corpus, but the sequence of experiment documents is not itself a roadmap. This document is the current research router for wheel-mode5.

It does **not** make this branch product authority, does not promote any experimental Box3D/wheel changes to `main`, and does not authorize a recycler patch.

The core routing correction after E2a2 is:

> stop descending into recycler micro-forensics by default; move upward into representative wheel qualification and ask whether the laboratory discrepancy is materially relevant to actual wheel behavior.

## 2. Authority split

### CURRENT ACCEPTED product truth

`Jozzpoly/JV-Box3D-Web-experiment/main`

At this refresh the accepted source head remains:

`5b28cc03d22264010680deb95a04abd04661bc22`

Steering I1 and the accepted browser product remain protected. Wheel-mode5 research has not been promoted into product truth or Owner Preview.

### ACTIVE RESEARCH truth

Research branch:

`work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`

Latest durable research checkpoint entering this roadmap:

`673dd16410d1ca98c0e909bd7421e7ca409273ad`

The branch is evidence authority only for experiments actually executed on identified commits. It is not evidence that current product behavior changed.

## 3. What the wheel-mode5 program has established

### TRUSTED EXECUTED / bounded evidence

The program has progressed from wheel representability/contact probes into a controlled flat-support dynamic apparatus and then deep E2a2 transition forensics.

The strongest current bounded conclusions are:

- a native annular wheel representation can be recovered and exercised in the pinned Box3D.js research composition;
- the difficult transition behavior observed in the flat-support apparatus is not explained primarily by crossing speed alone, global warm start, or carried normal impulse;
- actual recycled-manifold shortcut execution is required for the measured amplification in the studied apparatus;
- recycled separation reprojection is a necessary amplifier in both transformed-ground and true fixed-road causal tests;
- a non-perturbing fresh-shadow diagnostic measured a representative recycled-vs-fresh separation discrepancy of roughly `0.118 mm` around the trusted fixed-road `2 -> 1` transition;
- stale `baseSeparation` is not the dominant source of that discrepancy in the representative matched samples; the discrepancy is introduced overwhelmingly by the reprojection/reference transformation;
- long-lived cache age is not required for the transition discrepancy;
- E2a2aj showed that the authoritative reprojection residual is an ill-conditioned cancellation of much larger frame/anchor terms, so absolute subterm magnitude is not a valid causal attribution method.

These conclusions are intentionally scoped to the tested rigs and must not be generalized into a claim that ordinary Box3D contact recycling is globally wrong.

### HISTORICAL-ONLY

Rejected apparatus attempts, superseded diagnostics, failed patch/build compositions, and earlier mechanistic hypotheses remain provenance. They are not physics evidence unless a later trusted checkpoint explicitly depends on them.

### NOT VALIDATED

The research has **not** yet demonstrated representative behavior for:

- intended annular wheel under ordinary frictional rolling;
- drive/brake traction;
- free camber/steer and load transfer;
- representative suspension/chassis coupling;
- irregular road contact topology;
- side/inner/bore contacts;
- fixed-road `1 -> 2` external validity;
- material product harm from the measured ~`0.12 mm` recycled/fresh separation discrepancy;
- any production mitigation or recycler modification.

## 4. Critical roadmap correction

Before E2a2 closure, the natural temptation was to keep asking increasingly microscopic questions about the recycler formula. E2a2aj changes the value calculation.

We know enough to identify a real bounded mechanism, but not enough to justify changing engine contact semantics. The unresolved subterm attribution is now less important than external relevance.

Therefore the next program must be **representative qualification first, mitigation later**.

A second correction: do not jump from the laboratory rig directly to a highly coupled full-vehicle test. That would add too many uncontrolled dimensions and make a negative or positive result hard to interpret.

The next work should increase realism one causal layer at a time.

## 5. Refreshed roadmap

### Stage RQ0 — representative steady rolling baseline

**Status: NEXT / planned, not yet executed.**

Question:

> Does intended annular wheel geometry with nonzero friction and actual rolling remain numerically/physically well-behaved on a truly fixed simple road before we deliberately challenge contact topology?

Minimum intended rig:

- true fixed road; no road `SetTransform` motion;
- intended annular wheel geometry rather than the flat P75 carrier proxy as the primary contact shape;
- dynamic wheel with controlled normal load;
- nonzero friction;
- bounded steady rolling/spin with no deliberately forced seam crossing;
- existing recycler/contact telemetry reused observationally where it can be added without perturbing dynamics.

Primary outcomes are material behavior, not reproducing the old laboratory `dVy` number:

- bounded energy/velocity drift;
- absence/presence of visible or measured jitter;
- stable contact persistence/topology under steady rolling;
- plausible normal/tangential impulse behavior;
- absence/presence of abrupt grip discontinuity.

Natural stop:

- one validated steady-rolling baseline plus the minimum controls required to know whether an observed anomaly belongs to the apparatus;
- do not immediately tune the wheel or recycler if the baseline is poor.

### Stage RQ1 — one controlled representative topology challenge

**Status: PLANNED only if RQ0 is trustworthy.**

Question:

> When a representative rolling annular contact is made to change topology in one controlled way, does the recycler-associated discrepancy create a materially observable disturbance?

Introduce **one** challenge, not a bundle. Candidate first challenges include a small bounded camber/relative-normal sweep or a simple road-normal transition. Selection should be based on the cleanest causal apparatus after RQ0.

Compare at minimum:

- normal recycler behavior;
- an observational fresh-shadow diagnostic if it remains non-perturbing;
- a causal recycler/reprojection control only if needed to decide whether an observed material disturbance is recycler-linked.

Do not use a recycler-off/freeze arm as a proposed production solution. It is a laboratory causal control.

### Decision Gate Q1 — material relevance

After RQ1 classify the discovered recycler discrepancy:

**A. NOT MATERIALLY RELEVANT in representative rolling**

Then:

- stop recycler forensics;
- preserve E2a2 as bounded engine evidence;
- continue wheel qualification/integration without a speculative engine patch.

**B. MATERIALLY RELEVANT and causally linked**

Then:

- reopen a narrowly scoped mechanism/mitigation lane;
- use reference-state/delta decomposition or a similarly comparative diagnostic, not absolute component magnitude;
- require representative regression evidence before accepting any contact-recycler change.

**C. REPRESENTATIVE RIG INVALID / AMBIGUOUS**

Then repair or simplify the rig; do not interpret ambiguous dynamics as engine truth.

### Stage RQ2 — representative wheel envelope

**Status: DEFERRED until Q1.**

Expand only after the first relevance decision:

- braking and drive traction;
- free camber/steer;
- controlled load transfer;
- limited irregular-road contact;
- side/inner/bore-contact exposure where mechanically relevant;
- bounded wheel/chassis coupling.

This is qualification, not product integration.

### Stage PI0 — product integration decision

**Status: NOT AUTHORIZED.**

Only after representative wheel evidence is good enough should the project decide whether wheel-mode5 deserves a product candidate branch, what current product surfaces it replaces, and what Owner Preview validation is required.

No research branch should be fast-forwarded to `main` merely because its laboratory tests pass.

## 6. What is explicitly not next

Do not by default:

- open E2a2ak and continue frame-term micro-forensics;
- patch Box3D recycler semantics;
- tune around the ~`0.12 mm` discrepancy before representative relevance is known;
- force fixed-road `1 -> 2` just to complete a symmetric laboratory matrix;
- combine annular geometry, friction, camber, suspension, irregular road and drivetrain into one first test;
- turn the experiment into a whole-vehicle rewrite;
- promote wheel-mode5 to Owner Preview or `main` without a separate product decision.

Any of these may become justified by later evidence; none is justified merely by unfinished curiosity.

## 7. Evidence hierarchy for the next stage

For RQ0/RQ1 use:

1. exact live branch/head and reconstructed dependency identities;
2. build/test validity of the apparatus;
3. non-perturbation checks for diagnostics;
4. material rolling/contact behavior;
5. causal A/B only when an anomaly needs attribution;
6. Owner hands-on evidence only after there is a faithful candidate worth feeling.

The Owner should not be asked to judge a laboratory seam metric that has no demonstrated experiential consequence.

## 8. Stop rules

Stop and re-ground when:

- a diagnostic changes the dynamics it claims to observe;
- the first representative rig introduces more than one major uncontrolled variable at once;
- a failed helper/build path is being mistaken for physics evidence;
- a laboratory causal control starts being discussed as a production fix without representative evidence;
- research branch evidence is being confused with accepted product truth;
- further microscopic explanation is not capable of changing the next project decision.

## 9. Fresh continuation routing

If continuing wheel-mode5 from this branch:

1. verify live `main` and this research branch head;
2. read `AGENTS.md` and `docs/PROJECT_STATE.md` for product authority;
3. read this roadmap;
4. read `docs/WHEEL_MODE5_E2A2AJ_REPROJECTION_COMPONENT_DECOMPOSITION_2026-09-04.md` as the forensic closure boundary;
5. read older E2a2 documents only when a specific claim or apparatus dependency requires them;
6. design RQ0 from live source rather than mechanically cloning the last seam experiment.

The intended next action is **planning and then executing RQ0**, not reopening the closed forensic descent.