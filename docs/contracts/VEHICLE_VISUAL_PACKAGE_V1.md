# JV Web — VehicleVisualPackageV1

Updated: 2026-08-04
Status: `ACTIVE AUTHORING CONTRACT`
Owner: Jozz

## Purpose

`VehicleVisualPackageV1` connects an owner-authored self-contained GLB to immutable vehicle physics snapshots without exposing Box3D IDs or baking physics as animation.

```text
Box3D/native JV state
        ↓
VehicleVisualFrameV1
        ↓
stable partId / segmentId
        ↓
VehicleVisualPackageV1 bindings
        ↓
sealed CPU mesh asset
        ↓
transactional GPU asset
        ↓
rigid draw plan
```

The visual model never drives physics. The renderer only reads the latest immutable frame.

## Coordinate system

```text
units:   meter
forward: +X
up:      +Y
right:   +Z
left:    -Z
```

Blender/Blockbench export must arrive in this runtime convention. Apply object location, rotation and scale before export. Negative scale and hidden mirror transforms are rejected. Create left/right geometry explicitly or apply the mirror before export.

## Rig type

V1 is a **rigid-part node rig**, not a character skeleton.

Use separate GLB nodes for physically independent parts. Do not bake wheel spin, steering or suspension animation. Skinned meshes, morph targets and deformable tires are outside V1. A future tire backend may add deformation without changing rigid suspension identities.

## Runtime channels

### Rigid parts — 18

```text
m6.chassis
m6.rack

m6.fl.wheel
m6.fl.knuckle
m6.fl.upper-arm
m6.fl.lower-arm

m6.fr.wheel
m6.fr.knuckle
m6.fr.upper-arm
m6.fr.lower-arm

m6.rl.wheel
m6.rl.knuckle
m6.rl.upper-arm
m6.rl.lower-arm

m6.rr.wheel
m6.rr.knuckle
m6.rr.upper-arm
m6.rr.lower-arm
```

Corner convention:

```text
fl = front-left  (+X, -Z)
fr = front-right (+X, +Z)
rl = rear-left   (-X, -Z)
rr = rear-right  (-X, +Z)
```

### Physical segments — 8

```text
m6.fl.coilover
m6.fr.coilover
m6.rl.coilover
m6.rr.coilover

m6.fl.steering-link
m6.fr.steering-link
m6.rl.steering-link
m6.rr.steering-link
```

Each segment contains exact world-space start/end anchors and measured length from the real joint geometry.

## Binding modes

### `PART`

Copies a rigid world transform. Multiple visual roots may follow one physical source.

```text
body shell + interior + chassis details → m6.chassis
tire + rim + rotating brake disc       → m6.fl.wheel
knuckle + fixed brake caliper          → m6.fl.knuckle
```

### `SEGMENT_STRETCH`

Aims the declared authored axis from segment start to end, places the node at the midpoint and scales only that axis.

Every stretch binding must declare:

```json
{
  "kind": "SEGMENT_STRETCH",
  "segmentId": "m6.fl.coilover",
  "axis": "+Y",
  "referenceLengthMeters": 0.42
}
```

`referenceLengthMeters` is the actual authored end-to-end length of the mesh before runtime stretch. It removes any hidden assumption that all rods or springs are one metre long.

V1 uses deterministic shortest-arc rotation. Rotation around the segment axis is intentionally not supplied by physics, so stretch geometry must be rotationally symmetric around its declared axis. Use this mode for rods, tie links and springs—not for a visibly asymmetric part whose roll matters.

### `SEGMENT_ENDPOINT_AIM`

Places a rigid node at one endpoint and aims its declared local axis at the opposite endpoint.

```text
upper damper body → START, aim +Y
lower shaft       → END,   aim -Y
```

The component keeps its authored length. Only endpoint position and aim are driven.

## Transform composition

The executable order is:

```text
worldFromNode = worldFromRuntimeSource × localFromSource
```

For a segment, `worldFromRuntimeSource` already contains midpoint/endpoint placement, shortest-arc aim and optional stretch. `localFromSource` is then applied in that source frame.

Do not compensate for unapplied GLB root transforms with `localFromSource`. Bound roots must be identity roots. Corrections are for explicit art-to-physics alignment only.

## Bound-node ownership

Every node named directly by a binding must be an independent GLB root:

```text
parent:      none
matrix:      absent
translation: absent or [0, 0, 0]
rotation:    absent or [0, 0, 0, 1]
scale:       absent or [1, 1, 1]
```

A bound root may own unbound descendants with static sub-geometry. Each bound root must contain at least one renderable mesh node. Every mesh node in the vehicle GLB must belong to exactly one bound root.

Rejected ownership states:

- empty wheel/arm/link channel;
- mesh outside every binding root;
- two binding roots sharing a descendant;
- one GLB node bound twice.

## Required pivots and axes

### Chassis

```text
source: m6.chassis
pivot:  physics chassis body frame
```

### Wheel

```text
source: m6.<corner>.wheel
pivot:  axle centre
spin axis: local +Y
```

The wheel transform already includes suspension motion, steering and spin.

### Knuckle

```text
source: m6.<corner>.knuckle
pivot:  wheel/knuckle body origin
```

Calipers and other non-rotating upright details follow this source.

### Upper/lower control arms

```text
source: m6.<corner>.upper-arm / lower-arm
pivot:  physical arm body frame at the inboard hinge midpoint
```

### Rack

```text
source: m6.rack
length axis: local +Z
```

### Segment geometry

For stretch nodes, place the pivot at the segment midpoint and author the declared axis along the part length. For endpoint-aim nodes, place the pivot at the selected endpoint.

## Recommended node names

```text
JV_Chassis
JV_BodyShell
JV_Interior
JV_Rack

JV_Wheel_FL
JV_Tire_FL
JV_Rim_FL
JV_BrakeDisc_FL
JV_Knuckle_FL
JV_BrakeCaliper_FL
JV_UpperArm_FL
JV_LowerArm_FL
JV_SteeringLink_FL
JV_CoiloverSpring_FL
JV_CoiloverBody_FL
JV_CoiloverShaft_FL
```

Repeat `_FR`, `_RL`, `_RR` for other corners. Node names are mapped explicitly by the package, but predictable naming makes review and replacement safer.

## Executable GLB V1 subset

```text
format: one self-contained .glb
buffer: exactly one embedded BIN buffer
asset URL: clean path relative to the package manifest directory
integrity: exact SHA-256 and byteLength
units: metres
bound roots: independent, applied identity transforms
node names: unique
bufferView offset/stride: 4-byte aligned
accessors: aligned to component size
primitive mode: TRIANGLES
indices: unsigned 8-bit or 16-bit only
vertex attributes: POSITION, optional NORMAL, optional TEXCOORD_0
POSITION: FLOAT VEC3 with finite min/max
materials: baseColorFactor subset
```

V1 currently rejects:

- images and textures;
- external URI;
- `COLOR_0`, tangents, joints, weights or unknown attributes;
- skins and animation clips;
- morph targets and sparse accessors;
- non-triangle primitives;
- GLB extensions;
- 32-bit indices;
- zero/negative node scale.

Images/textures are rejected—not silently ignored—until image decode, sampler/texture GPU ownership and mobile memory budgets exist.

The 8/16-bit index rule is deliberate for WebGL1 portability. Larger geometry must be split into multiple primitives rather than depending on a device extension.

## Asset path example

```text
manifest: vehicles/m6/vehicle.visual.json
asset:    models/m6.glb
result:   vehicles/m6/models/m6.glb
```

The relationship remains identical at site root and repository subpath.

## Platform budget V1

Before GPU allocation the decoded vehicle must stay within:

```text
nodes:          512
primitives:     512
triangles:      300,000
materials:      64
geometry bytes: 64 MiB
```

These are protective mobile limits, not a quality target. They are changed only after measured phone evidence. Texture memory will receive a separate budget when textures are implemented.

## Full-rig coverage

`M6_FULL_RIG_V1` requires at least one binding for every 18 rigid part and every 8 physical segment. Additional decorative roots may follow an existing source, but every mesh remains owned by exactly one binding root.

## Local inspection

Run before handing an export to the runtime:

```powershell
npm run inspect:vehicle-glb -- <model.glb> <vehicle.visual.json>
```

The inspector reports:

- bytes and SHA-256;
- GLB structure and unsupported features;
- strict manifest result;
- bound roots and owned mesh nodes;
- decoded nodes/primitives/triangles/materials;
- decoded geometry bytes and budget result.

## Deterministic proof asset

The repository generates, rather than hand-commits:

```text
public/vehicles/tiny/vehicle.visual.json
public/vehicles/tiny/models/m6-rig-proof.glb
```

The tiny asset contains:

```text
18 small rigid-part boxes
8 one-metre segment rods
2 shared meshes
2 base-colour materials
26 bound roots
```

It is generated before dev/build, byte-pinned inside its manifest and required by the portable package. It is the first asset for browser/GPU lifecycle proof; the final Jozz model must not be the first file testing the loader.

## Model decomposition

```text
chassis source
  body shell
  bumpers
  interior
  lights
  static drivetrain details

wheel source
  tire
  rim
  rotating hub/disc

knuckle source
  upright
  caliper
  non-rotating hub carrier

arm source
  rigid wishbone mesh

segment source
  tie rod
  spring
  damper body/shaft
```

Doors, steering wheel, gauges, lights and cosmetic animation require a later presentation-state contract. They must not be overloaded onto suspension part IDs.

## Implementation order

```text
1 deterministic tiny GLB + strict package
2 CPU decode, ownership, budgets and draw-plan tests
3 transactional GPU buffer ownership
4 tiny browser rendering beside the debug observer
5 phone performance and disposal/rebuild proof
6 owner-authored simple chassis + four wheels
7 knuckles, arms, steering links and two-piece coilovers
8 normals and material shading
9 embedded texture pipeline with separate memory budgets
10 full body/interior/wheel asset
11 optional LOD/compression only from measured need
```
