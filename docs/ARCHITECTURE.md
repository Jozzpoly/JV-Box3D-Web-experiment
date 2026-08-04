# JV Web architecture

## Goal

JV Web is a deterministic browser host for vehicle research, mobile interaction, owner-authored vehicle/scene assets and eventually native JV physics compiled with Box3D into one WASM module.

The architecture separates device input, physics authority, immutable observation, asset validation, CPU mesh ownership, renderer capabilities, GPU resources and scenes.

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
renderer-owned WebGL context
          ↓
debug observer + optional owned render passes
```

The visible browser still uses the debug observer. The generated tiny GLB is packaged but not installed or drawn by `main.ts` yet.

The vehicle asset foundation is proven at exact commit `d6aa218064c2653f918cf7956d2fcd20a940caf3` with TypeScript, 218 tests, documentation, notices, Vite and all portable root/subpath checks passing. The later render-pass preparation remains an exact-head candidate requiring its own gate.

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
GLB V1 transport policy
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

## GLB transport policy versus renderer capability

The GLB transport/CPU layer may accept and preserve:

- one embedded BIN buffer;
- aligned bufferViews/accessors;
- `TRIANGLES`;
- unsigned 8/16-bit indices;
- FLOAT-VEC3 POSITION with min/max;
- optional NORMAL and TEXCOORD_0;
- base-colour material factors and `doubleSided`;
- package-relative URLs.

It rejects external resources, images/textures, unknown vertex attributes, skins, animations, morph targets, sparse accessors, extensions, 32-bit indices, invalid root ownership and byte/hash drift.

Transport support does **not** grant a shader permission to ignore a stream. Every renderer validates a named capability before any GPU allocation.

The first browser draw profile is:

```text
UNLIT_POSITION_BASE_COLOR_V1
accepts: POSITION, baseColorFactor, doubleSided
rejects: NORMAL, TEXCOORD_0
```

NORMAL remains rejected by this profile until a lighting shader consumes it. TEXCOORD_0 remains rejected until image decode, sampler/texture ownership and a texture-memory budget exist. Later renderers introduce new explicit capability IDs rather than silently widening the first profile.

See [`contracts/VEHICLE_VISUAL_PACKAGE_V1.md`](contracts/VEHICLE_VISUAL_PACKAGE_V1.md).

## Shared CPU mesh pipeline

```text
GLB bytes
  ↓
container/transport validation
  ↓
rigid CPU decoder
  ↓
sealed CPU asset
  ↓
ownership and budget receipts
  ↓
renderer-specific capability receipt
```

The decoder copies positions, optional normals/UVs and 8/16-bit indices into owned `ArrayBuffer`-backed typed arrays, parses the material subset, validates node hierarchy and rejects cycles or invalid references.

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
renderer capability validation
        ↓
transactional WebGL buffer allocation/upload
        ↓
complete RigidMeshGpuAssetV1 or no asset
```

POSITION, optional NORMAL/UV and index buffers are owned as one resource. Allocation or upload failure rolls back in reverse order. Disposal is idempotent.

`VehicleVisualRenderResourceV1` combines network load, CPU receipts, a pre-GPU renderer validator and GPU ownership transactionally. It does not create a shader or install itself into the live renderer.

## Renderer-owned WebGL pass boundary

`M6DebugRenderer` remains the sole owner of the canvas WebGL context, camera and `viewProjection`. Additional drawing is installed through an owned pass host rather than by requesting a second context or exposing mutable renderer internals.

```text
M6DebugRenderer frame
  ├─ grid/origin
  ├─ BEFORE_DEBUG_VEHICLE passes
  ├─ debug vehicle, unless explicitly hidden
  └─ AFTER_DEBUG_VEHICLE passes
```

Each pass receives:

```text
the same WebGLRenderingContext
the same viewProjection for the frame
the live immutable M6TraceFrame
```

Lifecycle rules:

- async installation receives an `AbortSignal`;
- a pass resolving after shutdown is disposed and never published;
- unknown phases fail closed;
- one failing pass is removed without stopping the debug observer or healthy passes;
- pass disposal is reverse-order and idempotent;
- context loss aborts pending work and disposes installed passes;
- the debug renderer restores its required WebGL state after external passes;
- debug shader, program and mesh construction is transactional as well.

The pass seam is source-present but inactive: `main.ts` currently installs no GLB pass.

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

Required runtime assets include:

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

After the exact render-pass preparation head passes its gate and unchanged desktop/mobile smoke:

```text
1 implement one unlit tiny-vehicle pass through installRenderPass()
2 load the generated package on the renderer-owned context
3 validate UNLIT_POSITION_BASE_COLOR_V1 before GPU allocation
4 compile live draw plans from trace.visualFrame
5 prove all 18 parts and 8 segments
6 prove pass fallback, destroy/rebuild, context lifecycle and phone performance
7 then import owner-authored simple chassis and wheels
```

Do not combine the first browser draw proof with normals, textures, the final vehicle, scan collision or native WASM.
