# JV Web R1 — Full Owner Rig R2

Status: **CANDIDATE — static/runtime validated; owner visual calibration still required**.

This document freezes the intent and evidence boundary for the vehicle visual milestone that follows playable Pages candidate `81c9677e12a331953101eb2531ca8ab013a985f9`.

## Goal

Use every currently recovered owner vehicle asset on the existing live M6/Box3D topology without inventing replacement physics. The visual rig follows the already-published `VehicleVisualFrameV1` parts and segments; it must not control body, joint, wheel, steering, suspension, or drivetrain state.

## Source authority

Private source assets are committed under `assets/owner-vehicle/` and treated as byte-pinned inputs. Windows line-ending conversion is disabled for these inputs.

| Input | SHA-256 |
| --- | --- |
| `Nadwozie.gltf` | `45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8` |
| `Offroad_Big_Wheels.gltf` | `1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617` |
| `OneSided_Steering_Suspension_Rig.gltf` | `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750` |
| `One_Sided_wheel_mount.gltf` | `374e54eb420f0b3e31bba0d749fdf1cf942db2389361dde1313d7a6b29e77ec2` |
| `Asset_Dumper.gltf` | `eca8770078d9df4ed6d7649473fa35d57501c3951232ffe8d91429a6f1f67118` |
| `Cardan_shaft.gltf` | `16f4eab46d526c273f434e109331586df2cd7e3ab0792a4dfbd21d7ed4ef0860` |

Semantic contracts are also byte-pinned, including the wheel contract. The generated R2 report records the exact source and contract hashes used.

## Rig mapping

The recovered suspension/damper/cardan glTFs are skinned Blockbench sources, but every triangle is wholly owned by one joint. R2 therefore flattens them once into rigid pieces; there is no runtime skinning.

- chassis → live `m6.chassis` part;
- four wheels → their four independent live wheel parts;
- front/rear upper and lower wishbones → their four independent upper/lower-arm bodies;
- uprights/hubs → the corresponding live knuckle bodies;
- chassis-side suspension brackets → live chassis;
- four dampers → live `m6.*.coilover` endpoints;
- front steering rods and rear toe-link visuals → live `m6.*.steering-link` endpoints;
- four cardan shafts → visual-only chassis↔knuckle endpoint pairs.

No new Box3D body, joint, motor, constraint, torque path, steering state, or suspension state is introduced by R2.

### Front upright semantic decision

`Socket_ChassisMount_b` is deliberately bound to the **knuckle**, despite its misleading authored name. The recovered semantic contract explicitly identifies it as upright/knuckle geometry and warns not to classify it from the name substring. Older native visual experiments sometimes parented equivalent geometry to the lower arm as a practical workaround; R2 follows the explicit current contract and the current Web topology, which exposes a real knuckle body.

### Dampers

Damper visuals are three pieces: upper endpoint, stretch section, lower endpoint. Their live endpoints come from the real M6 coilover visual segment. This preserves physical travel. The precise authored overlap/telescoping appearance remains an **owner visual-validation item**; the current implementation does not claim that the cosmetic overlap has already been perfected.

### Rear links

The available front steering-rod mesh is reused as a rear **toe-link visual** on the real rear steering-link segment. This does not imply rear steering; it is only a visual representation of the existing rear distance-link physics.

### Cardans

Cardans are explicitly `VISUAL_ONLY_PART_PAIR_NO_TORQUE_TRANSFER`. Their endpoints are computed from a chassis-local drive socket and a knuckle-local hub socket. The front and rear rest lengths are independently derived from the recovered suspension assets and current M6 geometry; R2 does not clone one axle offset onto the other.

## Generated artifact

Expected deterministic output:

- package id: `m6-owner-full-rig-r2`;
- GLB: `829076` bytes;
- GLB SHA-256: `5b6421cb9991adff4a467b559ec2b69e25ea1667bd7cfee1e189d3d94cd116b3`;
- bindings: 54 total / 53 real;
- one hidden diagnostic root: rack coverage only;
- meshes: 51;
- primitives: 55;
- triangles: 4776;
- images/textures: 3 / 3;
- geometry budget: 751440 bytes;
- decoded texture budget: 294912 bytes;
- maximum texture dimension: 256.

The public Pages artifact contains only generated runtime assets, not private owner source glTF/contracts and not private JSPREV2 scan data.

## Evidence before owner visual validation

Demonstrated locally on the full R2 candidate:

- exact source→GLB determinism;
- strict package, GLB, ownership, texture and mobile/WebGL budget gates;
- exact full M6 visual-channel coverage;
- 53 real draw commands and no diagnostic root in the owner draw path;
- live `M6TopologyWorld` integration: all 53 real commands resolve both after settling and after steering/drive, remain spatially attached to the physical vehicle, and moving front suspension/cardan/coilover/link commands follow live physics;
- full supplemental regression suite passes.

Not yet demonstrated until the owner browser checkpoint:

- final cosmetic alignment of every front/rear bracket and upright;
- right-side mirrored winding/culling in the real WebGL frame;
- visually correct damper overlap through compression/rebound;
- visually convincing cardan endpoint overlap and angle through steering/suspension travel;
- absence of subtle clipping with the owner chassis/wheels across real driving motion.

These visual items are release gates for promoting R2 to the friend-facing Pages preview. They must not be rewritten as proven merely because static/tests pass.
