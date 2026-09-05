# Wheel mode5 — current state and research roadmap

Updated: 2026-09-05
Owner: Jozz
Research branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Forensic closure input: `673dd16410d1ca98c0e909bd7421e7ca409273ad` (E2a2aj)
RQ0 evidence: `docs/WHEEL_MODE5_RQ0_STEADY_ROLLING_QUALIFICATION_2026-09-04.md`
RQ1 material-relevance closure: `docs/WHEEL_MODE5_Q1_MATERIAL_RELEVANCE_CLOSURE_2026-09-05.md`
RQ2a braking evidence: `docs/WHEEL_MODE5_RQ2A_BOUNDED_BRAKING_RESULT_2026-09-05.md`
RQ2b drive evidence: `docs/WHEEL_MODE5_RQ2B_BOUNDED_DRIVE_RESULT_2026-09-05.md`
Canonical product `main`: `5b28cc03d22264010680deb95a04abd04661bc22`

## 1. Current routing

This document is the research router for wheel-mode5. The experiment sequence itself is not the roadmap.

Current routing:

> E2a2 forensic descent closed by default -> RQ0 steady rolling qualified -> RQ1/Q1-A closed with no representative material recycler failure -> RQ2a/RQ2b bounded longitudinal traction qualified in both torque directions -> next bottleneck is a mechanically valid axle/mount representation before free camber/steer or load-transfer qualification.

Recycler micro-forensics reopen only if later representative evidence makes the known discrepancy materially relevant.

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

Within the tested laboratory transition regimes:

- actual recycled-manifold shortcut execution is required for the measured amplification;
- recycled separation reprojection is a necessary amplifier in both transformed-ground and true fixed-road causal tests;
- trusted fresh-shadow evidence measured a representative recycled-vs-fresh separation discrepancy around `0.118 mm` in the fixed-road `2 -> 1` transition;
- stale `baseSeparation` is not the dominant source in matched samples;
- E2a2aj showed that the reprojection residual is an ill-conditioned cancellation of larger frame/anchor terms, so absolute subterm magnitude is not valid causal attribution.

Do not generalize this into a claim that ordinary Box3D contact recycling is globally wrong.

### RQ0 — representative steady rolling baseline

Status: **CLOSED / QUALIFIED, SCOPED**.

Executed apparatus head:

`579bc2d2f3636f60437d98bf53f033bb69e0b020`

Workflow/job:

`33899570270 / 101110198854`

RQ0 qualified the donor outer-P75 `b3Wheel` carrier on a true flat static road with friction and a minimal planar axle guide implemented through motion locks.

At `1.0 m/s`, `mu=0.9`:

- `0` settled contact dropouts;
- `0` settled feature-set changes;
- point count `1 -> 1`;
- lateral `Vz = 0` under the intended axle lock;
- mean absolute rolling slip about `0.000093 mm/s`;
- max absolute rolling slip about `0.000417 mm/s`;
- essentially invariant `Vx` and spin;
- measured background about `0.675 mm` total Y range and `49 mm/s` max `|Vy|`.

The zero-spin positive control spun up through friction and converged to essentially no-slip rolling, proving that the apparatus exercises tangential contact.

The first completely free-3D RQ0 run remains historical-only apparatus evidence because the unmounted wheel tipped and moved laterally.

RQ0 is explicitly limited to donor **outer-P75 flat-road rolling**. The recovered full annular diagnostic surface is not the dynamic solver shape, and bore/inner/side semantics are not validated.

### RQ1 — representative geometry/contact challenge

Status: **CLOSED / Q1-A — NOT MATERIALLY RELEVANT IN THE TESTED REPRESENTATIVE ENVELOPE**.

Canonical closure:

`docs/WHEEL_MODE5_Q1_MATERIAL_RELEVANCE_CLOSURE_2026-09-05.md`

Primary RQ1 evidence is RQ1c:

`docs/WHEEL_MODE5_RQ1C_ROAD_NORMAL_TRANSITION_RESULT_2026-09-05.md`

The first tested road-normal kink that pinned `b3CreateHull` preserved as two real top faces was `30 µrad`. During rolling it produced one intended feature transition with:

- `0` contact dropouts;
- one expected feature-set change;
- point count `1 -> 1`;
- no material increase in vertical disturbance;
- no demonstrated grip or impulse pathology.

RQ1a/RQ1b remain apparatus provenance: the intended `20 µrad` ridge was merged into one averaged plane, while `30 µrad` was the first tested representable two-face ridge.

Supplemental RQ1d:

`docs/WHEEL_MODE5_RQ1D_SIGNED_CROSS_SLOPE_RESULT_2026-09-05.md`

RQ1d introduced signed `+/-10 µrad` road-normal axial components while the effective support feature remained the same. All cases retained zero dropouts, zero feature changes and effectively neutral/symmetric response.

RQ1d also corrected the carrier model: donor `b3MakeWheelProfile` reduces the recovered outer carrier to a three-point crowned convex profile whose flat support is the central vertex.

### RQ2a — bounded braking traction

Status: **TRUSTED EXECUTED / QUALIFIED IN TESTED SUB-LIMIT ENVELOPE**.

Canonical evidence:

`docs/WHEEL_MODE5_RQ2A_BOUNDED_BRAKING_RESULT_2026-09-05.md`

Executed source / workflow / job:

`2212efa95a8ef0b20933308ec9010031c5a3f002 / 33956379091 / 101280360165`

A `0.20 * mu*m*g*R` braking pulse for `0.5 s` changed only applied torque relative to RQ0. It reduced Vx by about `0.5886 m/s` (~`1.177 m/s^2`) while translation and spin remained coordinated to a `~5.7e-8 m/s` rolling-constraint delta residual.

During the pulse:

- `0` dropouts;
- `0` feature changes;
- point count `1..1`;
- max slip about `0.0489 mm/s`;
- no normal-impulse spike or material vertical disturbance.

Do not extrapolate this to near-limit braking, lockup or a complete traction curve.

### RQ2b — bounded drive traction

Status: **TRUSTED EXECUTED / QUALIFIED IN TESTED SUB-LIMIT ENVELOPE**.

Canonical evidence:

`docs/WHEEL_MODE5_RQ2B_BOUNDED_DRIVE_RESULT_2026-09-05.md`

Executed source / workflow / job:

`2c582311c97deb184cad5862df468ce86a7188c2 / 33957949201 / 101284575791`

RQ2b cloned the RQ2a apparatus and reversed only torque direction. A `0.20 * mu*m*g*R` drive pulse for `0.5 s` increased Vx by about `0.5876 m/s` (~`1.175 m/s^2`).

During the pulse:

- `0` dropouts;
- `0` feature changes;
- point count `1..1`;
- mean slip about `0.309 mm/s`;
- max slip about `3.678 mm/s` (~`0.37%` of the initial `1 m/s` speed);
- Y range about `0.0709 mm` and max `|Vy|` about `14.56 mm/s`, both within the qualified RQ0 background envelope;
- mean normal impulse essentially unchanged; max impulse modestly higher without contact loss or manifold churn.

Drive is not numerically symmetric with braking. At pulse end it retains about `2.924 mm/s` of overspin-style rolling mismatch, which ordinary friction relaxes after torque removal; final slip returns to about `0.000238 mm/s`.

This sign asymmetry is retained as a measured characteristic. It is not currently a material representative failure and is not a reason to reopen E2a2 forensics. Do not descend into its microscopic cause unless later decisions depend on it.

## 4. Decision boundary after RQ1/RQ2 longitudinal traction

Decision Gate Q1 remains **Q1-A**.

Operational consequences remain:

- recycler micro-forensics stay closed;
- no production recycler mitigation is authorized;
- do not increase RQ1 severity merely to provoke an anomaly;
- do not run larger torque sweeps merely for matrix completeness;
- continue outward toward more representative mounting/contact conditions.

RQ2a/RQ2b establish only bounded sub-limit longitudinal traction for the laboratory outer-P75/planar-axle apparatus. They do not make the apparatus a product wheel rig.

## 5. Historical-only / apparatus-invalid evidence

Keep as provenance, not current physics authority:

- free-3D RQ0 unmounted-wheel run;
- failed first planar-lock composition;
- first `20 µrad` RQ1 road-kink run whose intended ridge was merged;
- early RQ1d segment-to-vertex interpretation falsified by direct effective-profile inspection.

Do not erase these failures; they explain why later apparatus claims are trustworthy.

## 6. Still NOT VALIDATED

The program has not established:

- full native annular dynamic contact semantics;
- near-limit braking/drive traction, lockup or sustained wheelspin;
- a mechanically representative axle/mount replacing world-axis angular locks;
- free camber/steer;
- suspension/chassis load transfer;
- limited irregular-road envelope beyond RQ1's small road-face transition;
- realistic lateral tire-force behavior;
- side/inner/bore contacts;
- arbitrary-orientation annular contact;
- any production recycler mitigation;
- product integration or Owner acceptance of wheel-mode5.

## 7. Roadmap

### Stage RQ0 — steady rolling baseline

**CLOSED / QUALIFIED, SCOPED.**

### Stage RQ1 — representative geometry/contact challenge

**CLOSED / Q1-A.**

### Stage RQ2 — representative wheel envelope

**ACTIVE.**

Completed bounded dimensions:

- **RQ2a braking traction — QUALIFIED, sub-limit/scoped**;
- **RQ2b drive traction — QUALIFIED, sub-limit/scoped**.

Further torque severity is not the highest-value next dimension.

### RQ2c0 — mechanically valid axle/mount feasibility + equivalence

**Status: NEXT.**

Question:

> What is the smallest mechanically valid mounting constraint that preserves legitimate wheel spin and axle orientation without relying on world-axis angular locks, and can it reproduce the qualified flat-road RQ0 baseline before any camber/steer freedom is introduced?

Why this is now the bottleneck:

- the current locks are intentionally laboratory-specific;
- tilting the wheel while retaining world-axis angular X/Y locks can suppress legitimate spin components;
- free camber/steer or load-transfer evidence is not trustworthy until mounting semantics are valid;
- building a full suspension or whole vehicle would add unnecessary variables before the mount itself is qualified.

Design rules:

- inspect live/pinned Box3D joint/constraint capabilities and relevant donor usage before choosing architecture;
- prefer the minimum axle/carrier construction that constrains non-spin rotation without deleting the true axle spin DOF;
- do not introduce suspension compliance, steering actuation and camber simultaneously;
- first run **zero-camber flat-road equivalence** against RQ0 using the new mount;
- compare contact continuity, point/feature stability, slip, Vx/spin preservation and vertical background to RQ0;
- if equivalence fails, repair/understand mounting apparatus before interpreting it as wheel/contact failure;
- only after equivalence may a later RQ2c experiment introduce one controlled orientation DOF.

Natural stop:

- one mechanically coherent mount candidate;
- one trusted flat-road equivalence classification;
- no full suspension/vehicle integration in the same step.

### Later RQ2 candidates

After a mount is qualified, candidates include:

- controlled free camber or steer, one DOF at a time;
- controlled load transfer;
- limited irregular-road contact;
- bounded wheel/chassis coupling;
- side/inner/bore exposure only after a dynamic representation valid for those surfaces exists.

### Stage PI0 — product integration decision

**NOT AUTHORIZED.**

A green research run is not product acceptance. PI0 opens only when the research representation is strong enough to justify a faithful product candidate and appropriate Owner/representative evidence.

## 8. What is explicitly not next

Do not by default:

- reopen E2a2ak/reference-frame micro-forensics;
- patch Box3D recycler semantics;
- explain the RQ2b sign asymmetry microscopically without a decision-relevant failure;
- increase braking/drive torque until something fails;
- retain world-axis angular locks in a tilted-wheel claim;
- introduce camber + steer + suspension + irregular road together;
- force the effective donor profile across its large support switches merely to manufacture topology changes;
- use the filled donor carrier to validate bore/inner/side surfaces;
- build a whole vehicle merely to qualify the mount;
- promote wheel-mode5 to Owner Preview or `main`.

## 9. Evidence and stop discipline

Evidence hierarchy for active RQ2:

1. exact live branch/head and dependency identities;
2. apparatus build/test validity;
3. preservation of inherited baseline outside the one intentional change;
4. physically meaningful response to that change;
5. material disturbance relative to qualified background;
6. non-perturbing diagnostics only where needed;
7. recycler causal A/B only after a material anomaly exists;
8. Owner hands-on judgement only for a faithful experiential candidate.

Stop/re-ground when:

- a diagnostic changes the dynamics it claims to observe;
- more than one major mechanical/contact variable changes in a bounded experiment;
- a helper/build failure is being treated as physics evidence;
- expected traction response is mislabeled as instability;
- ordinary RQ0 background is relabeled as a new failure without comparative increase;
- a laboratory result is being promoted to product truth;
- microscopic explanation cannot change the next project decision.

## 10. Fresh continuation routing

For wheel-mode5 continuation:

1. verify live `main` and active research branch separately;
2. read `AGENTS.md` and `docs/PROJECT_STATE.md` for authority boundaries;
3. read this roadmap;
4. read RQ2a/RQ2b checkpoints when longitudinal-traction evidence is relevant;
5. inherit RQ0 apparatus only as needed for mount-equivalence comparison;
6. read Q1/E2a2 evidence only if a later representative anomaly makes recycler attribution relevant.

**Current next action: RQ2c0 mechanically-valid axle/mount feasibility and flat-road equivalence.** Do not return to RQ1/recycler forensics, do not run larger traction sweeps by default, and do not integrate wheel-mode5 into the product yet.
