# Wheel mode5 — E2a2k-r2 convex causal result — 2026-09-03

## Status

**EXECUTED EXPERIMENTAL EVIDENCE — causal mechanism confirmed.**

This document is not product acceptance and does not authorize a generic solver change.
`main`, Owner Preview and accepted product state remain untouched.

## Question

Does the spin-dependent matched-sphere support pathology come specifically from the rotational-anchor term used by the active wide convex contact solver when predicting separation across a `World_Step`?

Pinned solver expression in `b3SolveContacts_Convex`:

```c
b3Vec3W rsA = b3RotateVectorW( bA.dq, rA );
b3Vec3W rsB = b3RotateVectorW( bB.dq, rB );
b3Vec3W ds = b3AddVW( dp, b3SubVW( rsB, rsA ) );
b3FloatW s = b3AddW( b3DotW( c->normal, ds ), cp->baseSeparations );
```

E2a2k-r2 keeps the same manifold, normal mass, velocity path, impulse application, shape, mass/inertia, friction=0, gravity, timestep and rollout. The counterfactual build changes only the wide convex separation-prediction line to:

```c
b3Vec3W ds = b3AddVW( dp, b3SubVW( rB, rA ) );
```

This deliberately removes the rotational-anchor contribution from separation prediction. It is a causal diagnostic only, not a proposed production fix.

## Provenance

- repository branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
- workflow source head: `5ed8737d03a0e4ab074f1c0361ebf7bee2dc4d34`
- workflow: `.github/workflows/wheel-mode5-e2a2k-r2-counterfactual-convex-solver.yml`
- run: `33792066852`
- job: `100770780997`
- Box3D.js: `2617a0ff763a60c9f17cee57c6ea72aab75a5077`
- pinned Box3D vendor: `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`
- donor wheel patch reconstructed from `Jozzpoly/Box3d_FunProject` diff `77a67132...241fe10a`
- matched-sphere runner: existing E2a2i/E2a2k apparatus
- rollout: 2 s, friction=0, same mass/inertia as the flat P75 carrier, spin magnitude 40 rad/s, X/Y/Z axis controls, substeps 1 and 4.

## Important correction to E2a2k

The first E2a2k workflow patched the scalar / mesh separation expression:

```c
b3Vec3 ds = ...
```

but the matched sphere ↔ ground convex contact is solved by the separate wide/SIMD `b3SolveContacts_Convex` path. Its bit-identical baseline/counterfactual result is therefore **INVALID AS A CAUSAL INTERVENTION**. It does not count as evidence against the fixed-anchor hypothesis.

E2a2k-r2 independently located and modified the active wide expression shown above.

## Baseline reproduction

Pinned solver reproduces the E2a2i axis-selective pathology.

### substeps = 1

- X tangent spin:
  - `totalImpulseRatio40to0 = 16.5443591471`
  - `finalYDelta = -2.145707607 mm`
  - `finalVyDelta = -1.270666003 m/s`
- Y contact-normal spin:
  - impulse ratio = `1`
  - `finalYDelta = 0`
  - `finalVyDelta = 0`
- Z tangent spin: same result as X.

### substeps = 4

- X tangent spin:
  - `totalImpulseRatio40to0 = 1.75026984594`
  - `finalImpulseRatio40to0 = 0`
  - `finalYDelta = -1.232087612 mm`
  - `finalVyDelta = -0.0306562521 m/s`
- Y contact-normal spin:
  - impulse ratio = `1`
  - `finalYDelta = 0`
  - `finalVyDelta = 0`
- Z tangent spin: same result as X.

There were no feature or contact-id changes in these controls.

## Counterfactual result

After removing only the rotational-anchor contribution from the active wide convex separation prediction:

### substeps = 1

For X, Y and Z spin axes:

- `totalImpulseRatio40to0 = 1`
- `finalImpulseRatio40to0 ≈ 1.00000009636`
- `finalYDelta = 0`
- `finalVyDelta = 0`
- `featureChanges40 = 0`
- `contactIdChanges40 = 0`

All three spin40 runs end at the same support state:

- `finalY = 0.5454419255 m`
- `finalVy = 0`
- `totalImpulseMean = 0.01932922006`
- `finalImpulseMean = 0.00966527406`

### substeps = 4

For X, Y and Z spin axes:

- `totalImpulseRatio40to0 = 1`
- `finalImpulseRatio40to0 = 1`
- `finalYDelta = 0`
- `finalVyDelta = 0`
- `featureChanges40 = 0`
- `contactIdChanges40 = 0`

All three spin40 runs end at:

- `finalY = 0.5454419851 m`
- `finalVy = 0`
- `totalImpulseMean = 0.01932389662`
- `finalImpulseMean = 0.002416318282`

## Combined causal chain

The evidence now forms a coherent chain:

1. **E2a2i** — a rotationally symmetric matched sphere is invariant when spun around the contact normal but pathological when spun around either tangent axis.
2. **E2a2j** — the solver-visible rotational contribution for tangent-axis spin numerically matches `R * (1 - cos(theta))` to about `0.1–0.2 µm`, while normal-axis spin contributes zero.
3. **E2a2h** — refreshing collision/anchors four times more often reduces, but does not remove, the error; cadence is a modifier, not the full cause.
4. **E2a2k-r2** — removing only the rotational-anchor term from the active wide convex separation prediction removes the axis-selective pathology completely.

### Verdict

**The fixed material-anchor rotation used by convex sub-step separation prediction is causally responsible for the demonstrated spin-dependent support pathology in the rotationally symmetric matched-sphere control.**

This is stronger than correlation and stronger than source inspection alone.

## What this does NOT establish

Not validated:

- globally removing anchor rotation from Box3D contact separation;
- changing generic sphere/capsule/hull semantics;
- wheel-specific production behavior;
- combined wheel spin + steer/camber motion;
- finite obstacle, side, bore or inner-surface contacts;
- frictional rolling behavior;
- full vehicle integration or Owner acceptance.

The E2a2k-r2 counterfactual is intentionally too broad to ship. Generic rigid bodies need ordinary rotational anchor motion.

## Next bounded frontier

The real wheel shape has a much narrower symmetry contract than the sphere:

- `b3_wheelShape` is rotationally symmetric around its own local `wheel.axis`;
- pure twist around that axis should not alter geometric separation;
- steer/camber/non-axis rotation must continue to alter geometry normally;
- actual angular velocity and contact impulse application must remain physical.

The next falsifier should therefore test a **wheel-specific symmetry-aware separation transform** that removes only the axial-twist component from geometric anchor rotation, while preserving all non-symmetry rotation.

It must include controls proving that:

1. spin about `wheel.axis` no longer manufactures support motion;
2. non-axis rotation still changes support as expected;
3. sphere and ordinary convex contacts are unchanged;
4. no generic solver behavior is silently disabled.

Do not promote this to product or Preview before those controls pass.
