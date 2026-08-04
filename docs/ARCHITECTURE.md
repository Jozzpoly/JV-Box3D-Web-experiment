# JV Web architecture

## Goal

JV Web is a deterministic browser host for vehicle research, mobile interaction, owner-authored vehicle/scene assets and eventually native JV physics compiled with Box3D into one WASM module.

The architecture separates device input, physics authority, immutable observation, asset validation, CPU mesh ownership, GPU resources and scenes.

## Current execution path

```text
keyboard + Pointer Events
          ↓
source-aware semantic timelines
          ↓
fixed-step browser host
          ↓
VehicleRuntimeBackend
          ↓
legacy_ts_m6 reference vehicle
          ↓
M6 trace v1 + VehicleVisualFrameV1
          ↓
debug WebGL observer + telemetry UI
```

The working browser still uses the debug observer. The new GLB path is source-present but waits for its full gate and browser integration.

Before physics starts:

```text
browser capability report
scene package fetch + validation
backend scene-support gate
native receipt integrity
Box3D boundary load
```

## Input and fixed-step ownership

Device adapters emit semantic commands rather than manipulating physics.

```text
SteeringCommand = RELEASE | POSITION | RATE
LongitudinalCommand = throttle + brake
```

Events are integrated over fixed-step intervals. Source ownership prevents keyboard, touch and future gamepad input from releasing one another. The browser host owns scheduling, dropped-time policy, lifecycle release, rollback and input → physics → observation ordering.

## Browser environment boundary

The runtime reports transport and capabilities without allocating diagnostic GPU resources. Receipt integrity remains fail-closed on LAN HTTP through the tested software digest fallback.

## Physics boundary

Direct Box3D calls and transient IDs stay inside the physics layer.

```text
backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
acceptsNewProductPhysics: false
command/trace/visual-frame contracts: v1
```

One descriptor is shared by M6 and browser boundaries. The reference fixture may support host, asset and regression work, but must not independently acquire final product mechanics.

## Vehicle observation boundary

```text
Box3D/native state
        ↓
VehicleVisualFrameV1
```

The frame contains no Box3D handles and supplies:

```text
18 rigid transforms:
  chassis, rack
  wheel/knuckle/upper-arm/lower-arm × 4

8 segment channels:
  coilover × 4
  steering-link × 4
```

Rigid transforms come from real post-step bodies. Segment endpoints come from the exact local joint anchors. Legacy trace fields temporarily remain for the debug renderer; removing them requires trace v2.

## Vehicle asset boundary

```text
VehicleVisualPackageV1
        ↓
package-relative GLB URL
        ↓
exact byte/hash gate
        ↓
GLB V1 feature policy
```

Bindings:

```text
PART
SEGMENT_STRETCH(referenceLengthMeters)
SEGMENT_ENDPOINT_AIM
```

Transform order:

```text
worldFromNode = worldFromRuntimeSource × localFromSource
```

Segment aim uses deterministic shortest-arc rotation. V1 stretch geometry is axially symmetric because segment roll is undefined.

Bound nodes are independent identity roots. Every bound root owns at least one mesh descendant and every mesh node belongs to exactly one binding root.

## GLB V1 policy

The first mobile subset accepts:

- one embedded BIN buffer;
- aligned bufferViews/accessors;
- `TRIANGLES`;
- unsigned 8/16-bit indices;
- FLOAT-VEC3 POSITION with min/max;
- optional NORMAL and TEXCOORD_0;
- base-colour material factors;
- package-relative URLs.

It rejects external resources, images/textures, unknown vertex attributes, skins, animations, morph targets, sparse accessors, extensions, 32-bit indices, invalid root ownership and byte/hash drift.

Textures are a later explicit subsystem with image decode, sampler/texture GPU ownership and mobile memory budgets.

See [`contracts/VEHICLE_VISUAL_PACKAGE_V1.md`](contracts/VEHICLE_VISUAL_PACKAGE_V1.md).

## Shared CPU mesh pipeline

```text
GLB bytes
  ↓
container/policy validation
  ↓
rigid CPU decoder
  ↓
sealed immutable CPU asset
  ↓
ownership and budget receipts
```

The decoder copies positions, optional normals/UVs and 8/16-bit indices into owned typed arrays, parses a minimal material subset, validates node hierarchy and rejects cycles or invalid references.

A seal step prevents callers—including `forEach` callbacks—from reaching a mutable internal node-name map.

Vehicle budget V1:

```text
nodes:          512
primitives:     512
triangles:      300,000
materials:      64
geometry bytes: 64 MiB
```

## Transform and draw-plan boundary

```text
VehicleVisualFrameV1 + bindings
              ↓
resolved root matrices
              ↓
generic rigid hierarchy walker
              ↓
meshIndex + worldFromNode draw commands
```

The generic draw-plan builder knows meshes and hierarchy, not Box3D, `partId` or steering. A future static scan supplies static root matrices to the same walker.

## GPU resource boundary

```text
sealed CPU asset
        ↓
transactional WebGL buffer allocation/upload
        ↓
complete RigidMeshGpuAssetV1 or no asset
```

POSITION, optional NORMAL/UV and index buffers are owned as one resource. Allocation or upload failure rolls back in reverse order. Disposal is idempotent.

`VehicleVisualRenderResourceV1` combines network load, CPU receipts and GPU ownership transactionally. It does not yet create shaders or draw into the current observer.

## Deterministic tiny proof

Before dev/build, the repository generates:

```text
public/vehicles/tiny/vehicle.visual.json
public/vehicles/tiny/models/m6-rig-proof.glb
```

The GLB has 18 part boxes and 8 segment rods using two shared meshes/materials. Generated files are ignored, reproducible and formal portable runtime assets.

Portable validation checks manifest ↔ GLB bytes ↔ policy ↔ CPU ownership ↔ budget. The final owner model never becomes the first test of this pipeline.

## Scene boundary

`ScenePackageV1` declares spawn, render source and collision source. Current runtime supports only the synthetic ground plane.

`StaticSceneVisualPackageV1` preliminarily defines a pinned static GLB, `worldFromAsset`, local-origin radius and budgets. It will reuse the CPU/GPU mesh pipeline but not vehicle bindings.

```text
photogrammetry render mesh ≠ collision mesh
```

Scan visual import, texture/culling/chunking and triangle collision remain inactive.

See [`contracts/SCENE_PACKAGE_V1.md`](contracts/SCENE_PACKAGE_V1.md) and [`contracts/STATIC_SCENE_VISUAL_PACKAGE_V1.md`](contracts/STATIC_SCENE_VISUAL_PACKAGE_V1.md).

## Portable build

Required runtime assets now include:

```text
receipts/jv_m6_factory_receipt.json
scenes/synthetic-flat-lab.scene.json
vehicles/tiny/vehicle.visual.json
vehicles/tiny/models/m6-rig-proof.glb
```

The static package uses site-relative paths and can run from localhost, LAN or repository subpaths without publishing itself.

## Target product architecture

```text
Box3D source + native JV Core + stable C ABI
                         ↓
              one WebAssembly module
                         ↓
          VehicleRuntimeBackend: native_jv_wasm
                         ↓
         VehicleVisualFrameV1-compatible snapshots
                         ↓
       existing TypeScript asset / CPU / GPU / UI layers
```

Stable visual IDs remain independent from native runtime handles. Native parity requires shared scenario evidence, not fixture self-consistency.

## Next structural change

After the current source passes its exact gate:

```text
1 load the generated tiny package in the browser
2 compile live draw plans from VehicleVisualFrameV1
3 add a minimal GLB shader/draw layer beside the debug observer
4 prove all 18 parts and 8 segments
5 prove destroy/rebuild and phone performance
6 then import owner-authored simple chassis and wheels
```

Do not combine the first browser draw proof with textures, the final vehicle, scan collision or native WASM.
