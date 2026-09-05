# Wheel mode5 — current state and research roadmap

Updated: 2026-09-05
Owner: Jozz
Research branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Forensic closure input: `673dd16410d1ca98c0e909bd7421e7ca409273ad` (E2a2aj)
RQ0 evidence: `docs/WHEEL_MODE5_RQ0_STEADY_ROLLING_QUALIFICATION_2026-09-04.md`
RQ1 material-relevance closure: `docs/WHEEL_MODE5_Q1_MATERIAL_RELEVANCE_CLOSURE_2026-09-05.md`
Canonical product `main`: `5b28cc03d22264010680deb95a04abd04661bc22`

## 1. Current routing

This document is the research router for wheel-mode5. The experiment sequence itself is not the roadmap.

The current routing is:

> E2a2 forensic descent is closed by default -> RQ0 steady rolling is qualified -> RQ1 representative material relevance closed as Q1-A in the tested envelope -> RQ2 representative wheel envelope is next -> reopen recycler micro-forensics only if later representative evidence makes the discrepancy materially relevant.

This research branch is not product authority, does not authorize a recycler patch, and does not authorize promotion to Owner Preview or `main`.

## 2. Authority split

### CURRENT ACCEPTED product truth

`Jozzpoly/JV-Box3D-Web-experiment/main`

Accepted source head remains:

`5b28cc03d22264010680deb95a04abd04661bc22`

Steering I1 and the accepted browser product remain protected. Wheel-mode5 has not been promoted into product truth.

### ACTIVE RESEARCH truth

Research branch:

`work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`

Research claims are authoritative only when tied to exact executed commits/checkpoints. Documentation commits after an experiment may advance the branch head without changing the executed physics source.

## 3. Established bounded evidence

### E2a2 — forensic mechanism evidence

Within its tested flat-support/fixed-road transition regimes:

- crossing speed alone does not explain the difficult transition;
- global warm start and carried normal impulse modulate but do not primarily explain it;
- actual recycled-manifold shortcut execution is required for the measured amplification;
- recycled separation reprojection is a necessary amplifier in both transformed-ground and true fixed-road causal tests;
- fresh-shadow evidence measured a representative recycled-vs-fresh separation discrepancy around `0.118 mm` in the trusted fixed-road `2 -> 1` transition;
- stale `baseSeparation` is not the dominant source in matched samples; the discrepancy is introduced overwhelmingly by reprojection/reference transformation;
- long-lived cache age is not required;
- E2a2aj showed that the reprojection residual is an ill-conditioned cancellation of much larger frame/anchor terms, so absolute subterm magnitude is not a valid causal attribution method.

Do not generalize this into a claim that ordinary Box3D contact recycling is globally wrong.

### RQ0 — representative steady rolling baseline

Status: **TRUSTED EXECUTED / BASELINE QUALIFIED, SCOPED**.

Final executed apparatus head:

`579bc2d2f3636f60437d98bf53f033bb69e0b020`

Workflow/job:

`33899570270 / 101110198854`

RQ0 established a frictional flat-road rolling baseline using the recovered donor dynamic outer-P75 `b3Wheel` shape with a minimal planar axle guide implemented through Box3D motion locks.

Primary matched rolling at `1.0 m/s`, `mu=0.9` produced:

- `0` settled contact dropouts;
- `0` settled feature-set changes;
- point-count range `1 -> 1`;
- lateral `Vz = 0` under the intended axle lock;
- mean absolute rolling slip about `0.000093 mm/s`;
- max absolute rolling slip about `0.000417 mm/s`;
- essentially invariant `Vx` and wheel spin over the measurement window;
- measured vertical background: about `0.675 mm` total Y range and max `|Vy|` about `49 mm/s`.

The zero-spin friction positive control spun up and converged to essentially no-slip rolling, demonstrating that the apparatus exercises tangential friction rather than merely preserving an inertially isolated initial state.

The first completely free-3D RQ0 run is historical-only apparatus evidence: it allowed the lone wheel to tip/move laterally and therefore was not a valid mounted-wheel baseline.

RQ0 is explicitly limited to donor **outer-P75 flat-road rolling**. The recovered full annular diagnostic surface is not the same thing as the dynamic solver shape, and bore/inner/side semantics are not validated by RQ0.

### RQ1 — controlled representative geometry/topology challenge

Status: **CLOSED / Q1-A — NOT MATERIALLY RELEVANT IN THE TESTED REPRESENTATIVE ENVELOPE**.

Canonical decision:

`docs/WHEEL_MODE5_Q1_MATERIAL_RELEVANCE_CLOSURE_2026-09-05.md`

Primary RQ1 evidence is RQ1c:

`docs/WHEEL_MODE5_RQ1C_ROAD_NORMAL_TRANSITION_RESULT_2026-09-05.md`

RQ1c used the first road-normal kink that pinned `b3CreateHull` actually preserved as two top faces: `30 µrad`. It produced the intended single feature transition while rolling, with:

- `0` contact dropouts;
- one expected feature-set change at the road-face transition;
- point count remaining `1 -> 1`;
- no material increase in vertical disturbance relative to its matched flat control;
- no demonstrated grip/impulse pathology.

RQ1a/RQ1b are apparatus provenance: they established that an attempted `20 µrad` kink was merged by the hull builder and that `30 µrad` was the first tested representable two-face case.

Supplemental RQ1d evidence:

`docs/WHEEL_MODE5_RQ1D_SIGNED_CROSS_SLOPE_RESULT_2026-09-05.md`

RQ1d kept the effective donor support feature fixed while introducing signed `+/-10 µrad` road-normal axial components. All three cases had zero dropouts, zero feature changes and effectively neutral/symmetric rolling response at this scale.

RQ1d also corrected the carrier model: donor `b3MakeWheelProfile` reduces the recovered outer carrier to a three-point crowned convex profile whose flat support is the central vertex, not a broad plateau support segment.

### Decision Gate Q1

Classification: **A — NOT MATERIALLY RELEVANT IN THE TESTED REPRESENTATIVE ENVELOPE**.

This means the known E2a2 recycled/fresh discrepancy has not been shown to be materially harmful in the first representative rolling topology challenge.

It does **not** erase or falsify E2a2 mechanism evidence, and it does not prove global recycler correctness.

Routing consequence:

- recycler micro-forensics stay closed;
- no production recycler mitigation is authorized;
- do not increase RQ1 challenge severity merely to provoke an anomaly;
- continue outward into representative wheel qualification.

## 4. Historical-only / apparatus-invalid evidence

Rejected apparatus attempts, superseded diagnostics, failed patch/build compositions and earlier mechanistic hypotheses remain provenance, not physics evidence unless a trusted later checkpoint explicitly depends on them.

This includes:

- the free-3D RQ0 result;
- the failed first planar-lock composition attempt;
- the first `20 µrad` RQ1 road-kink run whose intended kink was merged into one plane;
- the early RQ1d segment-to-vertex interpretation that was falsified by direct inspection of the effective three-point donor carrier.

Do not erase these failures; they explain why later apparatus claims are trustworthy.

## 5. Still NOT VALIDATED

The program has not yet established:

- full native annular dynamic contact semantics;
- braking and drive traction;
- free camber/steer;
- suspension/chassis load transfer;
- limited irregular-road envelope beyond the small RQ1 road-face transition;
- realistic lateral tire-force behavior;
- side/inner/bore contacts;
- arbitrary-orientation annular contact;
- any production recycler mitigation;
- product integration or Owner acceptance of wheel-mode5.

The Q1 material-relevance conclusion is scoped to the executed representative envelope; later qualitatively different representative failures may still justify reopening narrow recycler attribution.

## 6. Roadmap

### Stage RQ0 — representative steady rolling baseline

**Status: CLOSED / QUALIFIED, SCOPED.**

Canonical evidence:

`docs/WHEEL_MODE5_RQ0_STEADY_ROLLING_QUALIFICATION_2026-09-04.md`

Do not tune this baseline merely to reduce the remaining sub-millimeter vertical background. Treat it as measured background for later qualification.

### Stage RQ1 — one controlled representative topology challenge

**Status: CLOSED.**

Canonical closure:

`docs/WHEEL_MODE5_Q1_MATERIAL_RELEVANCE_CLOSURE_2026-09-05.md`

RQ1 satisfied its natural stop with one trustworthy real feature transition and a material-effect classification. Do not reopen RQ1 merely for matrix completeness.

### Decision Gate Q1 — material relevance

**Status: CLOSED / Q1-A.**

**A. NOT MATERIALLY RELEVANT IN TESTED ENVELOPE — SELECTED.**

- preserve E2a2 as bounded engine evidence;
- keep recycler forensics closed;
- continue wheel qualification without a speculative engine patch.

The other branches remain conceptual contingencies if later representative evidence changes the decision:

**B. MATERIALLY RELEVANT AND CAUSALLY LINKED**

- reopen a narrow mechanism/mitigation lane;
- use comparative reference-state/delta diagnostics rather than absolute component magnitudes;
- require representative regression evidence before accepting any contact/recycler change.

**C. REPRESENTATIVE RIG INVALID / AMBIGUOUS**

- simplify or repair the rig;
- do not reinterpret ambiguous apparatus dynamics as engine truth.

### Stage RQ2 — representative wheel envelope

**Status: NEXT.**

RQ2 should widen the representative envelope one causal dimension at a time. Candidate dimensions include:

- braking traction;
- drive traction;
- controlled free camber/steer with a mechanically valid axle/mounting constraint;
- controlled load transfer;
- limited irregular-road contact;
- later, side/inner/bore exposure only where the dynamic representation is mechanically valid for those surfaces;
- bounded wheel/chassis coupling.

#### RQ2 design rules

- inherit RQ0/RQ1 provenance where the new question permits;
- change one primary causal dimension per experiment;
- do not use the filled/convex donor carrier to claim bore/inner/side correctness;
- do not retain world-axis angular locks in a tilted-wheel experiment if they would remove legitimate spin components;
- compare ordinary disturbances against the qualified RQ0 background;
- treat physically expected acceleration/slip under applied torque or geometry as signal, not automatically as pathology;
- only reopen E2a2/recycler attribution if a material representative anomaly appears;
- no product promotion from laboratory qualification alone.

#### First RQ2 selection principle

Prefer the smallest experiment that expands mechanical relevance without adding new mounting geometry. A flat-road **braking or drive-traction** probe derived directly from RQ0 is therefore a stronger first candidate than free camber, suspension or irregular road, because it exercises the existing tangential contact under controlled nonzero demand while preserving wheel/road geometry and axle provenance.

Select braking versus drive from live API/source based on causal cleanliness; do not implement both simultaneously merely for symmetry.

### Stage PI0 — product integration decision

**Status: NOT AUTHORIZED.**

Only representative evidence strong enough to justify a product candidate may open PI0. A green research CI run is not product acceptance.

## 7. What is explicitly not next

Do not by default:

- reopen E2a2ak/reference-frame micro-forensics;
- patch Box3D recycler semantics;
- tune around the historical ~`0.12 mm` discrepancy;
- continue RQ1 by increasing road kink/cross-slope until something fails;
- force the effective donor profile across a `6.46°` or `25°` support switch merely to manufacture a topology transition;
- add free camber, suspension, irregular road and drivetrain simultaneously;
- use the filled donor carrier to validate bore/inner/side surfaces;
- build a whole vehicle merely to test one contact question;
- promote wheel-mode5 to Owner Preview or `main`.

## 8. Evidence hierarchy for RQ2

1. exact live branch/head and dependency identities;
2. apparatus build/test validity;
3. preservation of the inherited RQ0/RQ1 baseline outside the one intentional new demand;
4. physically meaningful response to that demand;
5. material disturbance relative to the qualified background;
6. non-perturbing diagnostic evidence where needed;
7. causal recycler A/B only after an anomaly exists to explain;
8. Owner hands-on judgement only when there is a faithful experiential candidate worth testing.

## 9. Stop rules

Stop and re-ground when:

- a diagnostic changes the dynamics it claims to observe;
- more than one major mechanical/contact variable changes in a bounded experiment;
- a failed helper/build path is being treated as physics evidence;
- physically expected braking/drive response is being mislabeled as instability;
- normal RQ0 background is being re-labelled as a new failure without a comparative increase;
- a laboratory causal control is being discussed as a production fix;
- research evidence is being confused with accepted product truth;
- further microscopic explanation cannot change the next project decision.

## 10. Fresh continuation routing

For wheel-mode5 continuation:

1. verify live `main` and the active research branch separately;
2. read `AGENTS.md` and `docs/PROJECT_STATE.md` for authority split;
3. read this roadmap;
4. read `docs/WHEEL_MODE5_Q1_MATERIAL_RELEVANCE_CLOSURE_2026-09-05.md`;
5. read `docs/WHEEL_MODE5_RQ0_STEADY_ROLLING_QUALIFICATION_2026-09-04.md` when inheriting the rolling apparatus;
6. read E2a2aj or older E2a2 documents only if a later representative anomaly makes recycler attribution relevant.

The next action is **select and execute the first bounded RQ2 representative-envelope experiment**, not continue RQ1 or recycler forensics and not integrate wheel-mode5 into the product.
