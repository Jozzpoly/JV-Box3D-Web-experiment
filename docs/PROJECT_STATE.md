# JV Web — accepted project state

Updated: 2026-08-11
Owner: Jozz
Status: `R0 PUBLISHED / R1 ACTIVE / S1 FL UPPER INTEGRATED / S2-R WHEEL-SIDE TOPOLOGY RECONSTRUCTION ACTIVE`

## Product boundary

```text
private product authority: Jozzpoly/JV-Box3D-Web-experiment main
integrated S1 product: 67d66ed412342fee5445b2901d85a663a084bf4e
product tree: f2e1836800719cc9cc7007631568c41e45471450
public R0: Jozzpoly/JV-Box3D-Web-Public release/r0 @ c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
native JV: Jozzpoly/Box3d_FunProject — read-only reference for current reconstruction
```

S1 FL upper static placement and real neutral live articulation remain OWNER ACCEPTED and integrated. Preserve them unless new evidence directly falsifies a specific accepted assumption.

## Current owner falsifier

The S2 technical role map and first S2 owner presentation incorrectly grouped the wheel-side mechanism as one `knuckle/upright-side` member.

Jozz rejected that interpretation and supplied annotated source-rig views showing a fundamental split:

- **yellow:** a suspension-side member tied to the wishbones and static with respect to steering;
- **red:** a separate steerable/rotating member that connects the first member toward the wheel;
- **blue:** the relative steering-axis position/center shown in two projections.

These two knuckle members must be rigged separately. Native/core JV already implements this conceptual split and must be used as read-only technical evidence.

This falsifies the previous one-knuckle semantic conclusion even though that conclusion was internally consistent with the current Web code and runtime. Technical self-consistency is therefore not enough for this mechanism.

## Current task — S2-R

Before any FL lower/upright/hub/steering repair, reconstruct the exact two-stage wheel-side topology from:

1. direct owner correction and annotated views;
2. actual authored `OneSided_Steering_Suspension_Rig` geometry/hierarchy/pivots;
3. native JV implementation/topology.

The reconstruction must distinguish at minimum:

```text
suspension-side carrier
↕ suspension articulation via wishbones
steerable carrier
↻ steering DOF relative to suspension-side carrier
wheel/spin member(s)
↻ wheel-spin DOF distinct from steering
```

Exact mesh/node membership, exact 3D steering axis and whether Web repair requires visual topology changes, physics topology changes, or both remain UNKNOWN until S2-R evidence is returned and owner-reviewed.

No product patch is authorized in S2-R.

## Reclassified old S2 evidence

Still useful:

- source hierarchy observations;
- differential-motion measurements;
- stale cardan-audit finding;
- ~0.222 m authored steering-socket/current physical-arm mismatch;
- ~6.263 mm worst observed lower-ball shared-joint residual;
- `#12` lower-outboard reference was inferred rather than authored.

Not durable as truth:

- any conclusion that `Socket_ChassisMount_b`, `Socket_WheelCenter`, `Socket_SteeringRod`, `Socket_CardanHub` or surrounding wheel-side meshes all belong to one knuckle/upright member.

They must be reclassified under the reconstructed multi-member topology.

## Near-term direction

Do not proceed to S3/FL lower merely because the previous technical S2 was green.

```text
S2-R reconstruct split + axis
-> owner semantic validation
-> separate bounded production implementation of accepted split
-> owner visual/live validation through iterations
-> only then resume downstream wishbone/upright/hub/wheel recovery
```

This split is an upstream dependency for steering, wheel-side packaging and likely several later bindings. Do not conceal it with geometry offsets or downstream tuning.

Handling/stability/steering feel remain deferred until visual/mechanical recovery closes.
