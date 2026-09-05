# Wheel mode5 RQ2C1 — local translational carrier design

Date: 2026-09-05

Status: **PREDECLARED APPARATUS DESIGN / NO RQ2C1 PHYSICS EXECUTED**

This design follows the executed RQ2C0 fully-free `0°` falsifier. It is not a production suspension proposal. Its purpose is to supply exactly the missing laboratory translational guidance without restoring world-axis authority or hiding the RQ2C0 failure.

## 1. Evidence forcing this move

Executed RQ2C0 (`8deae32ff31ed6229b3add1837dae7f6d4ef685f / 33965636922 / 101305157701`) established:

- contact topology remained stable: zero dropout/churn, point count `1..1`;
- vertical dynamics remained inside the frozen RQ0 envelope;
- the unchanged 120 Hz ParallelJoint held axle orientation to `0.005921°`, well inside the `0.035°` challenge-derived budget;
- the fully-free wheel developed `0.858248°` max heading error, `14.9805 mm/s` cross-heading speed and `3.7923 mm` cross-track excursion;
- the `±3.5°` yaw pair therefore remained correctly unexecuted.

The next apparatus must constrain only the missing local cross-heading translation.

## 2. Pinned Box3D joint semantics

Pinned vendor source:

`erincatto/box3d@8441b4a06d6d09dcfb0b0f704df4d847d1437b92`

Relevant native semantics:

- `b3PrismaticJoint`: point-to-line translation; one allowed local translation axis; relative body rotation is constrained;
- `b3SphericalJoint`: fixes one point on body B to one point on body A while allowing rotation about that point;
- `b3ParallelJoint`: constrains the angle between body-local Z axes through a spring; this is the already-tested 120 Hz angular guide;
- `b3WheelJoint`: supplies a useful suspension/spin abstraction but also solves its own point-to-line and angular collinearity constraints, so using it here would make it ambiguous whether orientation PASS came from the existing ParallelJoint or from the WheelJoint.

Therefore RQ2C1 does **not** use WheelJoint as a hidden replacement angular mount.

## 3. Selected topology

For test yaw `theta`, derive from the same target quaternion as before:

- heading `H = rotate(q_yaw(theta), +X)`;
- vertical `Y = world +Y`;
- axle/cross-heading `A = rotate(q_yaw(theta), +Z)`.

Construct:

`static guide root`

`  -> H-prismatic sled`

`      -> Y-prismatic carrier`

`          -> spherical center joint -> wheel`

and retain in parallel:

`Y-carrier -> 120 Hz ParallelJoint -> wheel`

### DOF accounting

The first prismatic permits only translation along `H`.

The second prismatic permits only translation along `Y` relative to the sled.

Together, the carrier center can move in the `H-Y` plane but cannot translate along `A`.

The spherical joint makes the wheel center coincide with that carrier center while leaving wheel rotation available.

The unchanged ParallelJoint aligns carrier/wheel local Z axes softly at 120 Hz. Rotation about the shared local Z axle remains free, so wheel spin remains available.

Net intended wheel DOF for this laboratory:

- `H` translation — free;
- `Y` translation — free;
- `A` translation — constrained mechanically in the yaw-rotated local frame;
- axle spin — free;
- axle-axis tilt error — controlled only by the existing 120 Hz ParallelJoint.

No world-axis motion lock is used.

## 4. Auxiliary-body mass budget

A real multibody guide requires finite translational solver mass. Choosing an arbitrary kilogram value would inject an ungrounded scale into the experiment.

Instead obtain the donor wheel's actual `b3MassData.mass` **after its wheel shape is created** and derive a bounded instrumentation budget from it.

Predeclared helper-body budget:

- total auxiliary translational mass = **1.0% of donor wheel mass**;
- H sled mass = **0.5% of donor wheel mass**;
- Y carrier mass = **0.5% of donor wheel mass**.

Reasoning:

- this establishes a 100:1 wheel/guide translational-mass separation scale;
- it is defined before observing RQ2C1 behavior;
- it is relative to the actual donor carrier rather than a guessed absolute mass;
- the total auxiliary inertia is deliberately small but finite for solver conditioning.

Both helper bodies:

- have no collision shapes;
- use `gravityScale = 0` so they do not add artificial gravitational load to the tire contact;
- use zero rotational inertia because their orientation is guide-frame authority, not a physical free rotational body;
- start at the wheel center with the same target yaw frame.

If this mass separation itself proves numerically invalid, classify the apparatus and revisit the carrier architecture. Do **not** sweep helper mass until PASS.

## 5. Joint configuration

### H prismatic

- body A: static guide root;
- body B: H sled;
- local joint X axis maps to target heading `H` through the root target-yaw rotation;
- no spring;
- no motor;
- no translation limits.

### Y prismatic

- body A: H sled;
- body B: Y carrier;
- joint-frame local X is rotated onto body-local `+Y`, which remains world vertical under yaw about Y;
- no spring;
- no motor;
- no translation limits.

### Spherical center joint

- body A: Y carrier;
- body B: donor wheel;
- both anchors at body center;
- rotational spring/limits disabled;
- the joint supplies translation coupling only at the center and should therefore not create a lever-arm torque.

### Angular guide

- body A: Y carrier;
- body B: donor wheel;
- same `b3ParallelJoint` semantics as RQ2C0;
- `120 Hz`;
- damping ratio `1.0`;
- `maxTorque = FLT_MAX`.

No 240 Hz candidate is introduced.

## 6. RQ2C1 ordering and gates

First run **only `0°`** with this carrier.

Reuse the existing RQ2C/RH0.5 gates unchanged:

- contact dropouts `0`;
- feature-set changes `0`;
- point count `1..1`;
- settled Y range `0.50..0.90 mm`;
- settled max `|Vy|` `35..65 mm/s`;
- settled max rotated slip `<=0.002 mm/s`;
- max axle-axis error `<=0.035°`;
- max heading error `<=0.035°`.

Add carrier-specific diagnostics, not extra post-hoc PASS gates:

- donor wheel mass;
- sled/carrier masses and ratios;
- H-prismatic translation;
- Y-prismatic translation;
- max wheel-center error relative to carrier center;
- max cross-heading speed and cross-track excursion;
- spherical/Parallel joint validity.

Only if 0° passes all unchanged gates may the exact same carrier execute `+3.5° / -3.5°`.

## 7. Failure routing

- If cross-heading/heading is fixed but RQ0 vertical/slip dynamics materially fail, investigate carrier inertia/constraint coupling as apparatus behavior; do not blame the tire automatically.
- If axis error exceeds `0.035°`, only then does angular-guide stiffness become decision-relevant again.
- If 0° passes, execute the predeclared symmetric yaw pair without retuning carrier mass, joint topology or 120 Hz stiffness.
- If the carrier cannot pass 0° without tuning a free parameter, stop and redesign the guide rather than search a parameter sweep.

## 8. Meaning of PASS

A 0° PASS would establish only that this mechanically local carrier can replace the old world-linear lock while preserving the already-qualified straight-rolling laboratory behavior.

A later symmetric yaw PASS would establish bounded mount/orientation feasibility outside world cardinal axes.

Neither result would validate production suspension geometry, lateral tire force, steer-under-load handling, full annular side/inner/bore contact, or final JV wheel architecture.
