# Wheel mode5 RQ0 — steady rolling qualification

Date: 2026-09-04
Research branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Roadmap input: `docs/WHEEL_MODE5_CURRENT_STATE_AND_ROADMAP_2026-09-04.md`
Final executed apparatus head: `579bc2d2f3636f60437d98bf53f033bb69e0b020`
Successful workflow: `33899570270`
Successful job: `101110198854`
Result artifact: `9947127766` (`wheel-mode5-rq0-steady-rolling-result`)
Artifact digest: `sha256:4f430a0a89e49a67859d16468d73e76e6702d9d539120040d2ecfab468ff65de`
Canonical product `main` entering RQ0: `5b28cc03d22264010680deb95a04abd04661bc22`

## 1. Question

RQ0 deliberately moved one level up from E2a2 recycler micro-forensics.

The bounded question was:

> Can the recovered donor dynamic outer-P75 wheel profile sustain a trustworthy frictional steady-rolling baseline on a truly fixed flat road, before any deliberate contact-topology challenge is introduced?

This is a qualification baseline, not a product integration test and not a recycler test.

## 2. Scope correction discovered during apparatus design

Repository audit found two different historical "annular/torus" surfaces that must not be conflated:

- the old CORE dynamic oracle assembles a torus-like reference from many ordinary capsule shapes;
- E1 recovered a full annular diagnostic narrow-phase surface, but that closed annular mesh is not itself the dynamic solver wheel shape;
- E2a recovered the donor `b3Wheel` dynamic shape and constructs the intended **outer P75 rolling support profile** through the real donor wheel path.

RQ0 therefore uses the donor dynamic outer-P75 `b3Wheel` shape. Its evidence is explicitly limited to **outer-profile flat-road rolling**. Bore/inner/side contact semantics remain unvalidated.

## 3. Final apparatus

Final RQ0 uses:

- pinned Box3D.js `2617a0ff763a60c9f17cee57c6ea72aab75a5077`;
- pinned vendor Box3D `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`;
- recovered donor wheel patch from `Jozzpoly/Box3d_FunProject`;
- true static flat road; ground transform writes: `0`;
- gravity `9.81 m/s^2`;
- friction `mu = 0.9` on wheel and road;
- no drive or brake torque;
- initial longitudinal speed `1.0 m/s`;
- primary arm initialized at kinematic no-slip spin `omega_z = -v/R`;
- 960 outer steps at `1/240 s`, 4 solver substeps;
- telemetry window beginning at step 240;
- contact recycling left at normal engine behavior; no recycler/reprojection manipulation and no shadow manifold;
- no deliberately forced topology transition.

### Planar axle apparatus correction

The first executable RQ0 apparatus left the wheel as a completely free 3D rigid body. That is not a representative mounted-wheel baseline: it allowed lateral translation and wheel tilt with no hub/axle constraint.

The corrected apparatus uses Box3D body `motionLocks` to implement an ideal planar axle guide:

- lock translation Z;
- lock rotation X;
- lock rotation Y;
- leave translation X/Y dynamic;
- leave wheel spin about Z dynamic.

This does not teleport the body or rewrite transforms between steps, and it does not alter contact/recycler semantics. It adds only the minimum mounting constraint needed to stop a single free wheel from falling/tipping sideways.

## 4. Historical-only apparatus results

### Free-3D RQ0 run — HISTORICAL-ONLY / INVALID REPRESENTATIVE BASELINE

Workflow `33899089712` on head `836d7b758bd6db03cfb4f090bda3617bd66d613c` built and executed successfully, and was useful because it falsified the assumption that a free wheel was an adequate baseline.

Representative primary metrics were:

- settled contact dropouts: `0`;
- feature-set changes: `16`;
- Y range: `9.192 mm`;
- max `|Vy|`: `141.75 mm/s`;
- max `|Vz|`: `931.15 mm/s`;
- final `Vx`: `0.4543 m/s` from nominal `1.0 m/s`;
- final `omega_z`: `-0.8642 rad/s` from nominal about `-1.8331 rad/s`.

This is not accepted wheel-mode5 physics evidence. It primarily demonstrates an apparatus defect: a lone unconstrained 3D wheel is free to tip and move sideways.

A subsequent planar-lock attempt on workflow `33899441969` stopped during patch composition before build/runtime because the patch anchor matched inherited E2a code as well as RQ0. That run is **HISTORICAL-ONLY apparatus provenance**. The anchor was narrowed; no physics interpretation is attached to the failed composition.

## 5. Final planar RQ0 result

Final result artifact from head `579bc2d2f3636f60437d98bf53f033bb69e0b020`:

### Primary matched-rolling arm

| Metric | Result |
|---|---:|
| support radius | `0.545510769 m` |
| nominal omega | `-1.833144380 rad/s` |
| first contact | step `0` |
| first solver normal impulse | step `3` |
| settled contact dropouts | **`0`** |
| settled feature-set changes | **`0`** |
| contact point count | **`1 -> 1`** |
| lateral max `|Vz|` | **`0`** |
| settled Y range | `0.674605 mm` |
| settled max `|Vy|` | `48.943 mm/s` |
| mean absolute rolling slip | **`0.0000933 mm/s`** |
| max absolute rolling slip | **`0.000417 mm/s`** |
| `Vx` range | `0.999999642 -> 0.999999940 m/s` |
| omega range | `-1.833144307 -> -1.833143234 rad/s` |
| measurement-window `delta Vx` | **`0` at emitted precision** |
| measurement-window `delta omega` | **`0` at emitted precision** |
| final `Vx` | `0.999999762 m/s` |
| final omega | `-1.833143711 rad/s` |
| final slip | `0.000119 mm/s` |
| normal impulse mean | `0.0359299` |
| normal impulse std | `0.0121721` |

The important result is not numerical perfection of every contact quantity. It is that, once the missing axle DOFs are constrained, the intended outer-P75 dynamic wheel maintains essentially exact longitudinal no-slip rolling over the bounded window with no contact dropout and no topology/feature change.

The remaining vertical micro-motion is a measured background of this baseline: about `0.675 mm` total Y range with instantaneous `|Vy|` up to about `49 mm/s`. It is not currently assigned to the custom wheel, recycler, or generic solver. Because it does not produce contact loss, topology changes, longitudinal drift, or measurable rolling-slip growth in RQ0, it is retained as a baseline quantity rather than opening another mechanism campaign.

### Zero-spin friction positive control

The control starts at the same `1.0 m/s`, `mu=0.9`, but with `omega_z = 0`.

It converged to approximately:

- final `Vx = 0.66666657 m/s`;
- final `omega_z = -1.22209585 rad/s`;
- final slip `~0.000119 mm/s`;
- settled contact dropouts `0`.

This demonstrates that the apparatus really exercises tangential frictional coupling. The primary arm's no-slip behavior is not merely an inertially isolated wheel whose friction path never becomes active.

## 6. Interpretation and challenge

### Supported

Within this tightly scoped planar flat-road regime:

- the recovered donor dynamic outer-P75 wheel can sustain stable frictional rolling;
- the corrected apparatus is capable of transferring tangential momentum through friction;
- steady rolling does not itself require a forced recycler/topology manipulation;
- the large lateral/free-body pathology from the first run was an apparatus error, not evidence against wheel-mode5;
- there is now a quantitative background against which a later controlled topology challenge can be compared.

Status: **TRUSTED EXECUTED / RQ0 BASELINE QUALIFIED, SCOPED**.

### Not supported

RQ0 does **not** validate:

- bore/inner/side wheel contacts;
- full annular contact semantics in arbitrary orientation;
- free camber or steering;
- suspension/chassis load transfer;
- drive or braking torque;
- rough/irregular road;
- deliberate `1 <-> 2` topology transitions;
- whether the E2a2 recycled/fresh separation discrepancy is materially harmful in representative rolling;
- any recycler patch or product mitigation;
- product integration or Owner Preview acceptance.

## 7. Stop decision

RQ0 is closed at this boundary.

A generic cylinder/sphere comparison was considered after observing the remaining vertical micro-motion. It is not added now because the current project decision does not depend on attributing sub-millimeter vertical solver motion to a specific shape family. RQ0 already provides the measured background needed for the next causal comparison. Adding another shape family would broaden scope without changing the immediate decision.

Do not tune the wheel, contact hertz, friction, recycler, or support radius to make the baseline numerically prettier.

## 8. Next frontier

Proceed to **RQ1: one controlled representative topology challenge**.

RQ1 should change one geometric/contact condition at a time and compare any additional disturbance against this RQ0 background. The first challenge should be selected for causal cleanliness, not maximal realism. A small controlled camber/relative-normal challenge or a simple road-normal transition remain candidates; choose one after inspecting which can preserve the planar baseline's provenance and observability with the fewest new assumptions.

Do not reopen E2a2 recycler micro-forensics unless RQ1 first demonstrates material representative harm and a causal link worth explaining.

No product promotion is authorized by RQ0.
