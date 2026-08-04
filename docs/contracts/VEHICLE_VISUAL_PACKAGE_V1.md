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
GLB nodes
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

Blender/Blockbench export must arrive in this runtime convention. Apply object location, rotation and scale before export. Package bindings allow explicit positive correction transforms, but they are not a substitute for an inconsistent source scene.

Negative scale and hidden mirror transforms are rejected. Create left/right geometry explicitly or apply the mirror before export.

## Rig type

The first vehicle rig is a **rigid-part node rig**, not a character skeleton.

Use separate GLB nodes for physically independent parts. Do not bake wheel spin, steering or suspension animation. Do not make physics depend on armatures, skin weights or animation clips.

Skinned meshes, morph targets and deformable tires are outside V1. A future tire backend may add a separate deformation contract without changing rigid suspension identities.

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

Copies a rigid world transform. Multiple nodes may follow one source.

Examples:

```text
body shell + interior + chassis details → m6.chassis
tire + rim + rotating brake disc       → m6.fl.wheel
knuckle + non-rotating brake caliper    → m6.fl.knuckle
```

### `SEGMENT_STRETCH`

Aims the declared local axis from segment start to end and scales that axis to the measured length.

Use for:

- steering rods;
- spring/whole coilover debug mesh;
- simple driveshafts after a future segment channel exists.

### `SEGMENT_ENDPOINT_AIM`

Places a rigid node at one endpoint and aims its declared local axis at the opposite endpoint.

Use two nodes for a telescoping coilover:

```text
upper damper body → START, aim +Y
lower shaft       → END,   aim -Y
```

The geometry length of endpoint components remains authored in the GLB. Only position and aim are driven.

## Recommended node names

Node names are mapped explicitly by the package, but this canonical convention makes review and replacement predictable:

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

Repeat `_FR`, `_RL`, `_RR` for the other corners.

Every bound node name must be unique in the GLB. One node cannot be controlled by two bindings. Several nodes may intentionally follow the same runtime source.

## Bound-node ownership

Every node named directly by a binding must be an independent GLB root node with applied transforms:

```text
parent:      none
matrix:      absent
translation: absent or [0, 0, 0]
rotation:    absent or [0, 0, 0, 1]
scale:       absent or [1, 1, 1]
```

`localFromSource` is the only explicit correction between the runtime source frame and a bound visual root. This prevents parent transforms, authoring transforms and runtime transforms from being applied twice.

A bound root may own unbound descendant nodes containing static sub-geometry. A descendant cannot also be bound to another runtime source in V1.

## Required pivots and axes

### Chassis

```text
source: m6.chassis
pivot:  physics chassis body frame
```

The body shell may be offset through `localFromSource`. Do not move the physics body to fit the art model.

### Wheel

```text
source: m6.<corner>.wheel
pivot:  axle center
spin axis: local +Y
```

The complete wheel transform already includes suspension motion, steering and spin.

### Knuckle

```text
source: m6.<corner>.knuckle
pivot:  wheel/knuckle body origin
```

Calipers and non-rotating hub/upright details should follow this source.

### Upper/lower control arms

```text
source: m6.<corner>.upper-arm / lower-arm
pivot:  physical arm body frame at the inboard hinge midpoint
```

The runtime provides full body transforms. Do not reconstruct arm motion from hinge angles in the renderer.

### Rack

```text
source: m6.rack
length axis: local +Z
```

### Segment geometry

Author the node’s declared aim/stretch axis along its length. Keep the pivot at the endpoint for endpoint-aim nodes, or at the segment midpoint for stretch nodes.

## GLB package requirements

```text
format: self-contained .glb
buffers: exactly one embedded BIN buffer
external textures: forbidden for V1
asset URL: clean path relative to the package manifest directory
integrity: exact SHA-256
size: exact byteLength
units: meters
bound-node transforms: applied / identity
node names: unique
bufferView offsets and strides: 4-byte aligned
accessors: aligned to component size
indices: unsigned 8-bit or 16-bit only
animations: not used for physics-driven parts
```

The 8/16-bit index rule is deliberate for the first WebGL1 mobile renderer. Large geometry must be split into multiple primitives rather than silently depending on a device extension for 32-bit indices.

The asset URL is resolved relative to the manifest, not directly relative to the page. Example:

```text
manifest: vehicles/m6/vehicle.visual.json
asset:    models/m6.glb
result:   vehicles/m6/models/m6.glb
```

This relation remains identical at the site root and under a repository subpath.

The runtime verifies file bytes before parsing the GLB. A changed model requires an updated hash and byte length.

## Full-rig coverage

`M6_FULL_RIG_V1` requires at least one binding for all 18 rigid parts and all 8 segments. Additional decorative nodes may follow an existing source.

Fail-closed examples:

- missing rear lower arm;
- unknown `partId`;
- duplicate bound node;
- parented bound node;
- non-identity transform or matrix on a bound node;
- negative scale correction;
- non-normalized correction quaternion;
- multiple embedded buffers;
- misaligned bufferView/accessor data;
- 32-bit index accessor;
- `.gltf` with external resources;
- absolute/CDN/local-file URL;
- asset byte/hash mismatch.

## Model decomposition recommendation

Keep visual ownership separate from physics ownership:

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

Doors, steering wheel, gauges, lights and cosmetic animation may later use a separate presentation-state contract. They must not be overloaded onto suspension part IDs.

## First asset implementation order

```text
1 tiny generated GLB fixture proving node lookup and transforms
2 chassis + four simple wheel meshes
3 knuckles and wishbones
4 steering links and two-piece coilovers
5 full Jozz-authored body/interior/wheels
6 mobile triangle/material/texture budget
7 optional LOD/package v2 only from measured need
```

Do not begin with the final heavy vehicle model. The tiny fixture must first prove asset integrity, node ownership, transform math, rebuild and disposal.
