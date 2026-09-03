# Wheel mode5 E2a2i — fixed-anchor mechanism checkpoint

Date: 2026-09-03

## Scope and authority

This document is an experimental R&D checkpoint. It does **not** change accepted product authority, `main`, Owner Preview, or any shipping wheel representation.

Current experimental branch before this checkpoint:

- `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
- E2a2i source/workflow head: `feefa7d4d98ffdda94215c2e7c3dc002f8e55945`

Canonical accepted product remains outside this branch.

## Exact native provenance

The E2 dynamic diagnostics rebuild Box3D.js from:

- `isaac-mason/box3d.js@2617a0ff763a60c9f17cee57c6ea72aab75a5077`
- vendor Box3D submodule `erincatto/box3d@8441b4a06d6d09dcfb0b0f704df4d847d1437b92`

They then apply the bounded `B3X-WHEEL-001` donor diff only to:

- `include/box3d/box3d.h`
- `include/box3d/collision.h`
- `include/box3d/types.h`
- `src/CMakeLists.txt`
- `src/contact.c`
- `src/mesh_contact.c`
- `src/physics_world.c`
- `src/shape.c`
- `src/shape.h`
- `src/wheel_shape.c`

Therefore generic sphere geometry and `src/contact_solver.c` in these tests are the pinned vendor implementation unless explicitly instrumented by a later experiment.

## Trusted executed evidence before E2a2h/E2a2i

The dynamic spin symptom had already survived the following controls:

- warm starting on/off;
- contact recycling on/off;
- speculative 10 mm pre-contact start versus immediate touching;
- `allowFastRotation` on/off at 40 rad/s;
- original motion locks, translation-only locks, and no locks;
- replacement of the custom P75 wheel contact geometry with a native sphere while restoring the exact P75 carrier mass/inertia.

The symptom also decreases strongly as the outer `World_Step` becomes smaller, which established a step-angle dependence but did not identify a unique mechanism.

These controls falsified the simple explanations that the observed dynamic spin pathology is caused by P75 wheel geometry, the custom wheel manifold, warm starting, contact recycling, speculative initialization, fast-rotation clamping, or the attitude-isolation motion locks.

## E2a2h — narrow-phase refresh cadence

Workflow:

- `.github/workflows/wheel-mode5-e2a2h-narrow-phase-refresh.yml`
- run `33788782978`
- job `100759978059`
- conclusion: success

Question:

Compare the same matched native sphere, same 2 s physical duration, `friction=0`, immediate touching, no motion locks, and four solve slices per nominal 1/240 s interval as either:

1. `1 × b3World_Step(1/240, 4)`, or
2. `4 × b3World_Step(1/960, 1)`.

The second case refreshes narrow phase/contact anchors four times as often while preserving the total physical interval and solve-slice count.

The `substeps=1` identity control was exact: both code paths reduce to the same `World_Step(dt, 1)` and produced the same result.

### E2a2h result

For `spin=40 rad/s`, `substeps=4`:

| quantity | 1× `Step(1/240,4)` | 4× `Step(1/960,1)` |
| --- | ---: | ---: |
| contact refresh angle | 9.549297° | 2.387324° |
| spin40 − spin0 final Y | -1.232087612 mm | -0.405013561 mm |
| spin40 − spin0 final Vy | -0.030656252 m/s | -0.018401276 m/s |
| final normal impulse, spin40 | 0 | 0 |

The final-Y error magnitude fell to `0.328721397×` the baseline and the final-Vy error magnitude to `0.600245467×`.

### E2a2h classification

**TRUSTED EXECUTED EVIDENCE:** increasing narrow-phase/contact-anchor refresh frequency strongly reduces the spin error.

**NOT demonstrated:** refresh cadence alone does not eliminate the pathology. The final normal impulse for tangent spin still falls to zero. Therefore narrow-phase cadence is a contributor, not a complete explanation.

## Exact solver semantics relevant to E2a2i

Pinned vendor `src/contact_solver.c` contains `#define FIXED_ANCHORS 1`, but the relevant active solver path does not expose a useful alternate compile-time branch for a clean on/off A/B test.

The prepared constraint stores manifold anchors as material/body-relative vectors:

- `cp->rA = mp->anchorA`
- `cp->rB = mp->anchorB`

and forms a base separation from the original manifold state.

During solving, current separation is evaluated using body delta rotation applied to those stored anchors while the manifold normal remains fixed over the `World_Step`:

```text
ds = dp + rotate(dqB, rB) - rotate(dqA, rA)
s  = dot(ds, normal) + baseSeparation
```

For an axisymmetric sphere resting on a horizontal plane, the geometric bottom support point is independent of sphere orientation. A particular material point selected as the bottom anchor is not: tangent-axis spin rotates that material anchor away from the geometric bottom, whereas spin around the contact normal leaves it unchanged.

This source reading motivated E2a2i. It is source-level evidence, not by itself proof of causal dominance.

## E2a2i — spin-axis falsifier

Workflow:

- `.github/workflows/wheel-mode5-e2a2i-spin-axis.yml`
- source/workflow head `feefa7d4d98ffdda94215c2e7c3dc002f8e55945`
- run `33789279135`
- job `100761635233`
- conclusion: success

Setup:

- matched native sphere with exact P75 carrier mass/inertia;
- sphere radius equal to P75 carrier support radius, approximately `0.545510769 m`;
- immediate touching;
- `friction=0`, restitution 0;
- no motion locks;
- `|omega| = 40 rad/s`;
- `dt = 1/240 s`;
- spin axis X, Y, or Z;
- X and Z are tangent to the horizontal contact plane;
- Y is the contact normal.

Prediction made before execution:

> If rotation of a fixed material contact anchor is responsible for the support error, tangent X/Z spin should reproduce the pathology while Y/contact-normal spin should remain equivalent to spin0 because the bottom anchor is invariant under rotation about Y.

### E2a2i result — substeps 1

| axis | final Y delta vs spin0 | final Vy delta | total impulse ratio spin40/spin0 |
| --- | ---: | ---: | ---: |
| X tangent | -2.145707607 mm | -1.270666003 m/s | 16.544359147 |
| Y contact normal | **0** | **0** | **1** |
| Z tangent | -2.145707607 mm | -1.270666003 m/s | 16.544359147 |

For Y spin, final impulse / gravity slice remained approximately 1 and final impulse ratio was approximately 1.000000096.

### E2a2i result — substeps 4

| axis | final Y delta vs spin0 | final Vy delta | total impulse ratio spin40/spin0 | final normal impulse ratio |
| --- | ---: | ---: | ---: | ---: |
| X tangent | -1.232087612 mm | -0.030656252 m/s | 1.750269846 | 0 |
| Y contact normal | **0** | **0** | **1** | **1** |
| Z tangent | -1.232087612 mm | -0.030656252 m/s | 1.750269846 | 0 |

There were no contact dropouts, feature-set changes, or contact-ID changes that explain the axis split.

### E2a2i classification

**TRUSTED EXECUTED EVIDENCE:** the spin pathology is conditional on whether rotation carries the selected material contact anchor away from the geometric support direction.

The native sphere is isotropic and frictionless, so the physical ground support should not depend on spin axis. Nevertheless:

- contact-normal spin Y is exactly invariant;
- both tangent spins X and Z produce the same pathology;
- X and Z are numerically symmetric;
- this holds for both substeps 1 and 4.

This result matches the pinned solver's fixed material-anchor separation semantics much more specifically than a generic `dt` or substep correlation.

## Mechanistic inference

The current strongest explanation is:

1. narrow phase chooses a contact point/anchor for the geometric support at the start of a `World_Step`;
2. the contact solver treats that anchor as body-relative/material for the duration of the step;
3. tangent spin rotates that material anchor away from the instantaneous geometric support point while the contact normal remains fixed;
4. this creates an artificial normal-separation/normal-velocity contribution for a shape whose true support geometry is rotationally invariant;
5. more frequent narrow-phase refresh reduces the duration/angle over which the stale material anchor is carried, explaining the E2a2h convergence trend.

For a sphere of radius `R` and a bottom anchor rotated through tangent-axis angle `theta`, the purely geometric vertical rise of that material anchor is analytically:

```text
R * (1 - cos(theta))
```

At `R ≈ 0.54551 m` and `theta ≈ 9.549°` this is several millimetres, easily large compared with contact tolerances. This formula is presently an **analytic inference**, not yet a directly instrumented solver decomposition.

## Falsified or strongly disfavored causes

For this observed dynamic symptom, current evidence falsifies or strongly disfavours:

- custom P75 wheel geometry as the root cause;
- wheel-specific manifold semantics as the root cause;
- E1 broad-support winner/ownership switching as the root cause;
- warm start;
- contact recycling;
- speculative pre-contact initialization;
- `allowFastRotation` at the tested speed;
- motion locks;
- a simple claim that solver substeps alone create the problem.

## What remains NOT VALIDATED

This checkpoint does **not** validate:

- a production fix;
- that Box3D upstream classifies this behavior as a bug rather than an accepted approximation;
- whether a generic solver intervention is desirable or safe;
- a wheel-specific geometric-anchor contract;
- dynamic full annular P75 tire behavior;
- localized inner/side contact dynamics;
- rolling/friction behavior;
- vehicle integration;
- Owner acceptance.

## Next bounded question

Before changing solver or wheel manifold semantics, perform a read-only separation-decomposition experiment on the matched sphere.

For tangent X/Z spin and Y control, instrument the exact normal separation terms used by the solver and compare:

- initial/base separation;
- translational contribution `dot(dp, n)`;
- rotational-anchor contribution `dot(rotate(dq,r)-r, n)`;
- resulting solver separation;
- analytic sphere prediction `R * (1 - cos(theta))`.

The goal is not another broad dynamic rollout. The goal is to close the source → geometry → executed-value causal trace. Only after that gate should an intervention spike be designed.
