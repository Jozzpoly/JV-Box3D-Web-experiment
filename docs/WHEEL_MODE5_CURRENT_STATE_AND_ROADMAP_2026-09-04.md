# Wheel mode5 — current state and research roadmap

Updated: 2026-09-04
Owner: Jozz
Research branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Forensic closure input: `673dd16410d1ca98c0e909bd7421e7ca409273ad` (E2a2aj)
RQ0 evidence: `docs/WHEEL_MODE5_RQ0_STEADY_ROLLING_QUALIFICATION_2026-09-04.md`
Canonical product `main`: `5b28cc03d22264010680deb95a04abd04661bc22`

## 1. Current routing

This document is the research router for wheel-mode5. The experiment sequence itself is not the roadmap.

The current routing is:

> E2a2 forensic descent is closed by default -> RQ0 steady rolling is qualified -> RQ1 is the next frontier -> only reopen recycler micro-forensics if representative evidence makes the discrepancy materially relevant.

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

## 4. Historical-only evidence

Rejected apparatus attempts, superseded diagnostics, failed patch/build compositions and earlier mechanistic hypotheses remain provenance, not physics evidence unless a trusted later checkpoint explicitly depends on them.

This includes the free-3D RQ0 result and the failed first planar-lock composition attempt.

## 5. Still NOT VALIDATED

The program has not yet established:

- material effect of the E2a2 recycled/fresh discrepancy in representative topology-changing rolling;
- deliberate representative `1 <-> 2` or equivalent topology transitions;
- free camber/steer;
- drive/brake traction;
- suspension/chassis load transfer;
- irregular-road contact topology;
- side/inner/bore contacts;
- full annular dynamic contact semantics in arbitrary orientation;
- any production recycler mitigation;
- product integration or Owner acceptance of wheel-mode5.

## 6. Roadmap

### Stage RQ0 — representative steady rolling baseline

**Status: CLOSED / QUALIFIED, SCOPED.**

Canonical evidence:

`docs/WHEEL_MODE5_RQ0_STEADY_ROLLING_QUALIFICATION_2026-09-04.md`

Do not tune this baseline merely to reduce the remaining sub-millimeter vertical background. Use the measured RQ0 background as the reference for the next causal challenge.

### Stage RQ1 — one controlled representative topology challenge

**Status: NEXT / NOT YET EXECUTED.**

Question:

> When the qualified rolling contact is made to change geometry/topology in one controlled representative way, is there an additional material disturbance, and if so is it linked to the recycler mechanism discovered in E2a2?

Design rules:

- preserve the true fixed road and RQ0 provenance where possible;
- preserve nonzero friction and real rolling;
- change **one** geometric/contact condition at a time;
- compare disturbance against the measured RQ0 background, not against an imagined perfect zero-noise system;
- do not begin with recycler-off/freeze manipulation;
- first establish whether a material disturbance exists under normal behavior;
- add observational fresh-shadow telemetry only if it can remain non-perturbing;
- add a causal recycler/reprojection A/B only if needed to attribute an observed disturbance.

Candidate first challenges:

1. a small controlled relative-normal/camber sweep that preserves clean axle/road provenance; or
2. a simple bounded road-normal transition while keeping wheel mounting otherwise unchanged.

Selection should be made from live source based on causal cleanliness and minimum new assumptions, not on which challenge looks more dramatic.

Natural stop:

- one trustworthy topology challenge with a clear material-effect classification;
- do not automatically open mitigation or a second challenge in the same stage.

### Decision Gate Q1 — material relevance

After RQ1 classify:

**A. NOT MATERIALLY RELEVANT**

- preserve E2a2 as bounded engine evidence;
- stop recycler forensics;
- continue wheel qualification without a speculative engine patch.

**B. MATERIALLY RELEVANT AND CAUSALLY LINKED**

- reopen a narrow mechanism/mitigation lane;
- use comparative reference-state/delta diagnostics rather than absolute component magnitudes;
- require representative regression evidence before accepting any contact/recycler change.

**C. REPRESENTATIVE RIG INVALID / AMBIGUOUS**

- simplify or repair the rig;
- do not reinterpret ambiguous apparatus dynamics as engine truth.

### Stage RQ2 — representative wheel envelope

**Status: DEFERRED until Q1.**

Only then expand toward:

- braking and drive traction;
- free camber/steer;
- controlled load transfer;
- limited irregular-road contact;
- side/inner/bore exposure where mechanically relevant;
- bounded wheel/chassis coupling.

This remains qualification, not product integration.

### Stage PI0 — product integration decision

**Status: NOT AUTHORIZED.**

Only representative evidence strong enough to justify a product candidate may open PI0. A green research CI run is not product acceptance.

## 7. What is explicitly not next

Do not by default:

- reopen E2a2ak/reference-frame micro-forensics;
- patch Box3D recycler semantics;
- tune around the historical ~`0.12 mm` discrepancy before representative relevance is demonstrated;
- force fixed-road `1 -> 2` merely for matrix symmetry;
- add free camber, suspension, irregular road and drivetrain simultaneously;
- build a whole vehicle merely to test one contact question;
- promote wheel-mode5 to Owner Preview or `main`.

## 8. Evidence hierarchy for RQ1

1. exact live branch/head and dependency identities;
2. apparatus build/test validity;
3. preservation of the RQ0 baseline outside the one intentional challenge;
4. material rolling/contact behavior relative to RQ0 background;
5. non-perturbing diagnostic evidence where needed;
6. causal A/B only after an anomaly exists to explain;
7. Owner hands-on judgement only when there is a faithful experiential candidate worth testing.

## 9. Stop rules

Stop and re-ground when:

- a diagnostic changes the dynamics it claims to observe;
- more than one major geometric/contact variable changes in the first RQ1 challenge;
- a failed helper/build path is being treated as physics evidence;
- normal RQ0 background is being re-labelled as a new failure without a comparative increase;
- a laboratory causal control is being discussed as a production fix;
- research evidence is being confused with accepted product truth;
- further microscopic explanation cannot change the next project decision.

## 10. Fresh continuation routing

For wheel-mode5 continuation:

1. verify live `main` and research branch head;
2. read `AGENTS.md` and `docs/PROJECT_STATE.md` for authority split;
3. read this roadmap;
4. read `docs/WHEEL_MODE5_RQ0_STEADY_ROLLING_QUALIFICATION_2026-09-04.md` for the current baseline;
5. read `docs/WHEEL_MODE5_E2A2AJ_REPROJECTION_COMPONENT_DECOMPOSITION_2026-09-04.md` only when the recycler mechanism becomes relevant;
6. open older E2a2 documents only for specific claims/apparatus dependencies.

The next action is **design RQ1 from the qualified RQ0 baseline**, not continue recycler forensics and not integrate wheel-mode5 into the product.
