# Wheel mode5 E2a2j — separation decomposition result

Date: 2026-09-03

## Authority

Experimental evidence only. No accepted product, `main`, or Owner Preview authority is changed.

E2a2j workflow source head:

- `1838aeda439ca6866f8194590c485e61c22fc051`

Workflow execution:

- run `33790211330`
- job `100764714410`
- conclusion: success

Pinned native stack remains:

- `isaac-mason/box3d.js@2617a0ff763a60c9f17cee57c6ea72aab75a5077`
- vendor `erincatto/box3d@8441b4a06d6d09dcfb0b0f704df4d847d1437b92`
- bounded B3X-WHEEL-001 donor patch

## Question

E2a2i showed that a matched native sphere is invariant under spin about the ground-contact normal Y, but produces the dynamic support pathology under equal-magnitude tangent-axis spins X and Z.

The pinned contact solver evaluates current separation using stored manifold anchors rotated by body delta rotation while holding the manifold normal fixed over a `World_Step`.

E2a2j asks whether the actual separation error can be reconstructed directly from that equation and whether the rotational term matches the geometric rise of a material bottom point on a sphere:

```text
R * (1 - cos(theta))
```

## Method

E2a2j does not modify Box3D collision or solver semantics.

It uses public manifold data and body transforms to reconstruct, after one `World_Step`:

```text
s_end = s_prepared
      + dot(dpB - dpA, n)
      + dot((R_B rB - rB) - (R_A rA - rA), n)
```

Setup:

- matched native sphere;
- support radius `R ≈ 0.545510769 m`;
- immediate touching;
- horizontal ground;
- friction 0;
- restitution 0;
- no motion locks;
- `dt = 1/240 s`;
- spin magnitude `40 rad/s`;
- X tangent, Y contact-normal, Z tangent;
- substeps 1 and 4.

Sanity checks confirmed:

- initial rotation is identity;
- one native sphere contact point;
- contact normal is exactly +Y in this shape ordering;
- sphere is contact shape B;
- sphere anchor is exactly the bottom radial vector `[0, -R, 0]` within the diagnostic precision;
- anchor magnitude matches the support radius.

## Executed result — substeps 1

Observed sphere rotation over the world step:

- approximately `9.527155°`.

Tangent X/Z spin:

- measured rotational separation contribution: `+7.524311543 mm`;
- analytic `R * (1 - cos(theta))`: `+7.524095476 mm`;
- difference: `+0.216067 µm`;
- X and Z rotational contributions: exactly equal in the diagnostic output;
- reconstructed end separation: `+7.515430450 mm`;
- final normal impulse: `0`;
- final vertical velocity: approximately `-0.0408750 m/s`.

Contact-normal Y spin:

- measured rotational separation contribution: `0`;
- analytic rotational contribution: `0`;
- reconstructed end separation: approximately `-0.008881092 mm`;
- final normal impulse: `0.009665273`;
- final vertical velocity: approximately zero.

Spin0 baseline has the same non-rotational separation as Y spin.

## Executed result — substeps 4

Observed sphere rotation over the world step:

- approximately `9.547859°`.

Tangent X/Z spin:

- measured rotational separation contribution: `+7.556855679 mm`;
- analytic `R * (1 - cos(theta))`: `+7.556740660 mm`;
- difference: `+0.115018 µm`;
- X and Z rotational contributions: exactly equal;
- reconstructed end separation: `+7.458984852 mm`;
- final normal impulse: `0`.

Contact-normal Y spin:

- rotational contribution: `0`;
- reconstructed end separation: approximately `-0.007987022 mm`;
- final normal impulse: `0.002416318`.

## Classification

### TRUSTED EXECUTED EVIDENCE

The artificial positive separation under tangent spin is numerically accounted for by rotation of the stored material bottom anchor.

The measured rotational term agrees with the independent sphere geometry prediction to substantially below one micrometre:

- substeps 1 error: about `0.216 µm`;
- substeps 4 error: about `0.115 µm`.

The axis control is exact in the expected direction:

- tangent X/Z: millimetres of artificial positive separation;
- contact-normal Y: zero rotational separation term.

The resulting impulse behavior changes at the same split:

- X/Z final normal impulse goes to zero;
- Y retains the support impulse.

### SOURCE-LEVEL EVIDENCE

Pinned vendor `contact_solver.c` stores manifold anchors and evaluates separation from body translation plus rotated stored anchors while the contact normal remains fixed over the world step.

Current upstream Box3D `main` inspected on 2026-09-03 still uses the same fixed-anchor separation form in the relevant solver path. This does not establish that upstream considers the behavior a bug; it only shows that there is no obvious already-landed semantic replacement in current `main`.

### MECHANISTIC INFERENCE

The E2a2i axis split plus E2a2j decomposition strongly supports the following mechanism:

1. narrow phase chooses the current geometric bottom point;
2. solver stores it as a body-relative/material anchor for the world step;
3. tangent spin rotates that material point away from the geometric bottom;
4. the solver interprets the material-point rise as positive normal separation;
5. the support constraint weakens or disappears even though the sphere/wheel's true axisymmetric support geometry has not separated from the ground.

For an axisymmetric wheel, pure axle spin has the same invariance problem: the geometric support surface is unchanged by spin about the wheel symmetry axis, while a material contact point rotates around the tire.

## What is NOT validated

E2a2j does not validate:

- a production solver modification;
- a generic Box3D fix;
- a wheel-specific swing/twist decomposition;
- ignoring rotation for arbitrary contacts;
- full annular dynamic wheel behavior;
- frictional rolling;
- inner/side contact dynamics;
- vehicle integration;
- Owner acceptance.

## Next bounded falsifier

Run a counterfactual diagnostic solver A/B on the matched sphere:

- A: exact pinned solver separation semantics;
- B: diagnostic-only separation calculation with the rotational-anchor contribution removed while leaving velocity/impulse application unchanged.

Prediction:

- baseline A reproduces E2a2i;
- counterfactual B makes tangent X/Z support invariant like Y.

This is an intervention test of causal necessity, **not** a proposed production fix. If confirmed, the next design problem becomes narrower: how to preserve legitimate attitude-induced support changes while removing only symmetry-axis spin from the wheel's separation kinematics.
