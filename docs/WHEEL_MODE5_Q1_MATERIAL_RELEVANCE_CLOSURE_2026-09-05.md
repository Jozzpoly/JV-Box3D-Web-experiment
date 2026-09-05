# Wheel mode5 — Decision Gate Q1 material-relevance closure

Date: 2026-09-05
Owner: Jozz
Research branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`

Status: **TRUSTED RESEARCH DECISION / Q1-A — NOT MATERIALLY RELEVANT IN THE TESTED REPRESENTATIVE ENVELOPE**

This closure is research routing only. It does not change accepted product `main`, Owner Preview, or production Box3D/recycler semantics.

## 1. Question being closed

RQ1 asked:

> When the qualified RQ0 rolling contact is made to change geometry/topology in one controlled representative way, is there an additional material disturbance, and if so is it linked to the recycler/reprojection mechanism discovered during E2a2?

The roadmap required one trustworthy topology challenge and a material-effect classification before deciding whether recycler micro-forensics should reopen.

## 2. Baseline authority

RQ0 canonical qualification:

`docs/WHEEL_MODE5_RQ0_STEADY_ROLLING_QUALIFICATION_2026-09-04.md`

Final executed RQ0 apparatus:

`579bc2d2f3636f60437d98bf53f033bb69e0b020`

RQ0 established the scoped donor outer-P75, fixed-road, frictional 1 m/s rolling baseline with the planar axle guide.

Reference background included approximately:

- `0` settled contact dropouts;
- `0` feature-set changes;
- point count `1 -> 1`;
- Y range about `0.675 mm`;
- max `|Vy|` about `49 mm/s`;
- mean rolling slip about `0.000093 mm/s`;
- max rolling slip about `0.000417 mm/s`.

That measured background, rather than an imagined zero-noise wheel, is the comparison basis for Q1.

## 3. Primary RQ1 topology challenge — RQ1c

Canonical result:

`docs/WHEEL_MODE5_RQ1C_ROAD_NORMAL_TRANSITION_RESULT_2026-09-05.md`

Executed source:

`eac9f5ebf2d748b8a6ddc7e78037ffe3101accd3`

Workflow/job:

`33954685040 / 101275730043`

RQ1c used the first longitudinal road-normal kink that the pinned `b3CreateHull` actually preserved as two top faces: `30 µrad`.

The apparatus preserved the qualified rolling wheel, friction, planar axle guide and one fixed static road hull while introducing one real face/feature transition.

Executed evidence:

- the challenge hull contained two real top planes with normals corresponding to `0` and `30 µrad`;
- the runtime contact normal changed from approximately `0` to `-29.997 µrad`;
- `0` contact dropouts;
- exactly `1` feature-set change around the intended transition;
- point count remained `1 -> 1`;
- near-transition Y range matched the flat control;
- max `|Vy|` did not increase relative to the matched control;
- max rolling slip remained sub-micrometre-per-second scale;
- no material impulse spike or grip discontinuity was demonstrated.

The small final `Vx`/spin difference was consistent in scale and direction with the real longitudinal grade introduced after the road-normal change and is not evidence of contact pathology.

### Apparatus provenance retained

The first `20 µrad` attempt is **APPARATUS-INVALID**, not physics evidence: pinned `b3CreateHull` merged the intended kink into one approximately `10 µrad` plane.

RQ1a/RQ1b then independently established the representation boundary:

- `0..25 µrad` -> one merged top plane;
- `30 µrad` -> first tested case preserving two top planes.

This is why RQ1c, not the failed `20 µrad` attempt, is the primary Q1 representative topology evidence.

## 4. Supplemental orthogonal challenge — RQ1d

Canonical result:

`docs/WHEEL_MODE5_RQ1D_SIGNED_CROSS_SLOPE_RESULT_2026-09-05.md`

Executed source:

`10bdaf41f18f6c5560f7db52437d9917108471fd`

Workflow/job:

`33955901494 / 101279082268`

RQ1d was not needed to satisfy the roadmap's single-topology-challenge stop rule, but it provides useful orthogonal evidence.

It rotated only the static road transversely by `0 / +10 / -10 µrad`, preserving the same effective donor support vertex and avoiding longitudinal grade acceleration.

Executed evidence:

- all three cases retained effective support feature index `1`;
- actual manifold normal Z followed the signed road rotation;
- `0` contact dropouts in all cases;
- `0` feature-set changes in all cases;
- point count remained `1 -> 1`;
- Y-range changes were only about `0.01–0.02%` relative to flat;
- max rolling slip was unchanged;
- signed `+/-` responses were effectively symmetric at the measured scale.

RQ1d also corrected an apparatus-model assumption: the effective donor dynamic carrier is a three-point crowned convex profile, not the wider unreduced P75 plateau model. The failed earlier RQ1d assertions are preserved as apparatus-interpretation evidence, not dynamic failures.

## 5. Decision Gate Q1 classification

The correct roadmap branch is:

### **Q1-A — NOT MATERIALLY RELEVANT IN THE TESTED REPRESENTATIVE ENVELOPE**

Reason:

- RQ1c introduced a genuine representative road-face/contact-feature transition under normal recycler behavior;
- no additional material rolling/contact disturbance was measured relative to the qualified RQ0 background;
- therefore there is no representative anomaly here that needs recycler/reprojection attribution or mitigation;
- RQ1d independently showed that a small signed relative-normal perturbation is also neutral when support identity is unchanged.

This does **not** mean the E2a2 recycler/reprojection discrepancy was false. E2a2 remains strong bounded mechanism evidence for the laboratory regimes in which it was measured.

It means the project has not demonstrated that this discrepancy is materially harmful in the first representative rolling topology challenge.

## 6. Routing consequence

Effective immediately for this research lane:

- keep E2a2 recycler micro-forensics **closed by default**;
- do not patch production recycler semantics;
- do not tune around the historical approximately `0.12 mm` recycled/fresh discrepancy;
- do not continue RQ1 by increasing road kink or bank angle merely to provoke a failure;
- preserve RQ0/RQ1 evidence as the reference envelope;
- advance to **RQ2 — representative wheel envelope**.

RQ2 should expand one causal dimension at a time rather than bundle drivetrain, camber, suspension and irregular road together.

## 7. What remains NOT VALIDATED

Q1-A is deliberately narrow. It does not establish:

- global correctness of Box3D contact recycling;
- full native annular dynamic contact semantics;
- bore/inner/side contacts;
- free camber or steer;
- large bank angles or profile-support topology crossings;
- braking or drive traction;
- suspension/chassis load transfer;
- irregular-road envelope;
- lateral tire-force realism;
- wheel-mode5 product suitability;
- Owner acceptance.

## 8. Product authority remains unchanged

Canonical accepted product source remains:

`Jozzpoly/JV-Box3D-Web-experiment/main`

at:

`5b28cc03d22264010680deb95a04abd04661bc22`

No RQ0/RQ1 research code or conclusion is promoted to `main` or Owner Preview by this closure.
