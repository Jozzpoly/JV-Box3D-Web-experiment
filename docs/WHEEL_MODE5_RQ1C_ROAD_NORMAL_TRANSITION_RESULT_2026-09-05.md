# Wheel mode5 RQ1c — first representable road-normal transition

Date: 2026-09-05
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
RQ1c source: `eac9f5ebf2d748b8a6ddc7e78037ffe3101accd3`
Workflow run: `33954685040`
Job: `101275730043`
Artifact: `wheel-mode5-rq1c-road-normal-transition-result` (`9965978749`)

## Scope

RQ1c is the first executed representative topology/contact-geometry challenge after the scoped RQ0 steady-rolling qualification.

It deliberately preserves the RQ0 carrier and operating regime:

- pinned `box3d.js` `2617a0ff763a60c9f17cee57c6ea72aab75a5077`;
- pinned vendor Box3D `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`;
- donor dynamic outer-P75 `b3Wheel` carrier;
- true static road body;
- friction `mu = 0.9`;
- matched `1 m/s` rolling spin;
- planar axle guide: linear Z and angular X/Y locked;
- standard engine contact/recycling behavior;
- no E2a2 diagnostic solver patches and no recycler manipulation.

The intended change is only a local road-normal/face transition in one static convex road hull.

## Apparatus recovery: RQ1 -> RQ1a -> RQ1b

### RQ1 20 urad attempt — APPARATUS-INVALID

The first RQ1 attempt requested a flat-to-`20 urad` ridge. The pinned build succeeded, but runtime contact normal was approximately `-10 urad` both before and after `x=0`, so the challenge validity gate failed.

This was **not** a wheel/contact physics failure.

### RQ1a — executed hull introspection

RQ1a inspected the generated `b3HullData` before shape creation without changing simulation behavior.

Flat control:

- `faceCount = 6`;
- `topPlaneCount = 1`;
- top-plane `nx = 0`.

Requested `20 urad` challenge:

- `faceCount = 6`;
- `topPlaneCount = 1`;
- top-plane `nx ~= +10 urad`;
- runtime contact normal ~= `-10 urad` both before and after the intended ridge.

Therefore pinned `b3CreateHull` had reduced the intended two-face ridge into one averaged plane.

### RQ1b — executed representation-resolution sweep

RQ1b built the same road point set without a world or solver for the predeclared angles:

`0, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 300, 500 urad`.

Result:

- `0..25 urad`: one top plane, with normal approximately half the requested angle;
- **`30 urad`: first two-plane hull**, `faceCount = 7`, `vertexCount = 10`, top-plane normals `nx = 0` and `nx ~= 30 urad`;
- every tested angle above `30 urad` also preserved the two faces.

Thus `30 urad` is the **first representable candidate in the predeclared sweep**, not a value tuned to produce a desired dynamic result.

## RQ1c executed apparatus

RQ1c reran the original dynamic challenge at exactly `30 urad` with an embedded geometry validity gate.

Challenge geometry was confirmed live:

- `roadTopPlaneCount = 2`;
- `roadTopPlaneNormalXMin = 0`;
- `roadTopPlaneNormalXMax ~= 29.999999 urad`;
- runtime contact `preMeanNormalX = 0`;
- runtime contact `postMeanNormalX ~= -29.997167 urad`.

The wheel therefore genuinely crossed from the flat face to the sloped face.

## In-run flat control

The matched control used the same generic long-hull road construction with zero slope. It is the immediate comparator for RQ1c; it should not be substituted for the canonical RQ0 box-road metrics.

- contact dropouts: `0`;
- feature-set changes: `0`;
- point count: `1 -> 1`;
- settled Y range: `0.916600 mm`;
- max `|Vy|`: `48.953407 mm/s`;
- max `|Vz|`: `0`;
- max rolling slip: `0.000298 mm/s`;
- near-crossing Y range: `0.636160 mm`;
- near-crossing max `|Vy|`: `48.953407 mm/s`;
- pre/post mean normal X: `0 / 0`;
- measurement Vx drift: `+0.0000596 mm/s`;
- measurement omega drift: `-1.19e-7 rad/s`.

## RQ1c challenge result

The real `30 urad` face-normal transition produced:

- contact dropouts: **`0`**;
- feature-set changes: **`1`**, occurring in the near-transition window;
- point count: **`1 -> 1`**;
- settled Y range: `0.885010 mm`;
- max `|Vy|`: `48.953407 mm/s`;
- max `|Vz|`: `0`;
- max rolling slip: `0.000954 mm/s`;
- near-crossing Y range: **`0.636160 mm`**, exactly the same emitted value as control;
- near-crossing max `|Vy|`: **`48.953407 mm/s`**, same as control;
- near max normal impulse: `0.0932581` vs control `0.0943266`;
- contact-normal shift: `0 -> -29.997167 urad`;
- final Vx: `1.000436187 m/s`;
- final omega Z: `-1.833944201 rad/s`;
- final slip: `-0.000119 mm/s`;
- measurement Vx change: `+0.436485 mm/s`;
- measurement omega change: `-0.000800371 rad/s`.

Relative to the in-run control:

- Y-range ratio: `0.9655`;
- max-|Vy| ratio: `1.0`;
- near Y-range ratio: `1.0`;
- near max-|Vy| ratio: `1.0`;
- max-slip ratio: `3.2`, but absolute slip remains below `0.001 mm/s`;
- contact-dropout delta: `0`;
- feature-change delta: `+1`.

## Interpretation

### TRUSTED EXECUTED / NO MATERIAL CONTACT-STABILITY FAILURE OBSERVED IN THIS BOUNDED CHALLENGE

RQ1c establishes that the qualified outer-P75 rolling carrier can traverse the smallest road-normal ridge that this generic long-hull representation preserved in the predeclared sweep without:

- losing contact;
- increasing the measured vertical-jitter envelope above its matched flat control;
- increasing the near-transition Y excursion;
- introducing a multi-point topology instability;
- producing material rolling slip.

The one feature-set transition is expected from crossing between the two road faces and did not coincide with a material vertical disturbance in the measured envelope.

The small longitudinal/spin change on the downhill face should **not** currently be classified as a contact pathology. A `30 urad` downhill grade has a physical tangential gravity component of order `g * theta ~= 2.94e-4 m/s^2`; over roughly two seconds on the sloped side this predicts a sub-mm/s speed change of the same order as the observed `+0.436 mm/s`. This is a consistency inference, not an exact executed decomposition of the measured acceleration.

The `3.2x` slip ratio is also not material by itself because the absolute challenge maximum is only about `0.000954 mm/s`.

## What this does NOT justify

RQ1c does **not** justify reopening E2a2 recycler/contact forensics. The representative challenge did not show the material instability that would warrant attribution work.

It also does not validate:

- larger or sharper terrain normal transitions;
- free camber or steering dynamics;
- changing wheel-axis/road-normal alignment;
- frictional side/inner/bore contacts;
- full annular native wheel geometry;
- rough terrain, edge strikes or multi-shape road seams;
- product integration or Owner acceptance.

## Natural next move

Do not simply increase the same downhill angle as the next RQ1 step: that increasingly mixes contact robustness with genuine grade acceleration while preserving essentially the same one-point face-switch topology.

The next bounded RQ1 challenge should probe a **different contact condition**, preferably a small controlled wheel-axis / road-normal misalignment while preserving the RQ0 road, speed, friction and as much axle-guide provenance as possible. First perform a source/API feasibility check so that a fixed relative-normal/camber challenge does not accidentally introduce free mounting dynamics or change multiple degrees of freedom at once.
