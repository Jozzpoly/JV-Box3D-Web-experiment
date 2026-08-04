# JV Web architecture

## Goal

JV Web is a browser host for deterministic vehicle research, mobile interaction, owner-authored vehicle/scene assets and eventually the same native JV physics used outside the browser.

The architecture separates device input, physics authority, immutable observation, visual assets and scene resources.

## Current execution path

```text
keyboard + Pointer Events
          ↓
source-aware timestamped semantic timelines
          ↓
fixed-step browser host
          ↓
VehicleRuntimeBackend
          ↓
legacy_ts_m6 reference vehicle
          ↓
M6 trace v1 + VehicleVisualFrameV1
          ↓
debug WebGL observer / future GLB vehicle renderer / telemetry UI
```

Before physics starts:

```text
browser capability report
scene package fetch + strict validation
backend scene-support gate
native receipt integrity validation
Box3D boundary load
```

## Input and fixed-step ownership

Device adapters emit semantic commands rather than manipulating physics directly.

```text
SteeringCommand = RELEASE | POSITION | RATE
LongitudinalCommand = throttle + brake
```

Timestamped events are integrated over fixed-step intervals. State is source-aware, so keyboard, touch and future gamepad sources do not release one another accidentally.

The browser host owns frame scheduling, dropped-time policy, lifecycle release, rollback, disposal and the ordering of input → actuator → physics → observation. Renderer cadence never becomes physics cadence.

## Browser environment boundary

The runtime reports transport and capabilities without allocating diagnostic GPU resources:

- secure context, loopback HTTP, LAN HTTP or other transport;
- Web Crypto and tested software SHA fallback;
- WebGL API and Pointer Events;
- touch/coarse-pointer and viewport information.

Receipt integrity remains fail-closed on ordinary LAN HTTP.

## Scene boundary

`ScenePackageV1` declares identity, meters, axes, spawn, render source and collision source.

```text
forward: +X
up:      +Y
right:   +Z
```

The default synthetic scene is loaded before physics. The current backend accepts only no render asset and a built-in ground plane at `y=0`. GLB and triangle-mesh variants fail backend support until real loaders exist.

See [`contracts/SCENE_PACKAGE_V1.md`](contracts/SCENE_PACKAGE_V1.md).

## Physics boundary

Direct Box3D calls and transient IDs remain inside the physics layer. Rendering receives immutable plain data only.

Current backend:

```text
id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
acceptsNewProductPhysics: false
commandContractVersion: 1
traceContractVersion: 1
visualFrameContractVersion: 1
```

One concrete descriptor is shared by the M6 world and browser host. The legacy fixture may support browser/asset work, but must not independently acquire final drivetrain, suspension, tire, aero or steering behavior.

## Vehicle visual boundary

The vehicle model is not coupled to Box3D IDs.

```text
Box3D/native state
        ↓
VehicleVisualFrameV1
        ↓
stable partId / segmentId
        ↓
VehicleVisualPackageV1 bindings
        ↓
self-contained GLB rigid nodes
```

### Visual frame

M6 currently emits:

```text
18 rigid transforms:
  chassis, rack
  wheel/knuckle/upper-arm/lower-arm × 4

8 exact segments:
  coilover × 4
  steering-link × 4
```

Rigid transforms are copied from real bodies after each step. Segment endpoints are reconstructed from the exact local anchors used to create the physical joints.

No `b3BodyId` or `b3JointId` crosses this boundary.

Legacy chassis/rack/wheel trace fields temporarily coexist for debug-renderer compatibility. Their removal requires an explicit trace-v2 migration after the renderer consumes visual frame v1.

### Visual package

`VehicleVisualPackageV1` maps GLB node names to stable runtime sources using:

```text
PART
SEGMENT_STRETCH
SEGMENT_ENDPOINT_AIM
```

The first rig is a rigid-node vehicle rig, not a character skeleton. Skins, animation-driven physics and morph-target tire deformation are outside V1.

Before any parser or GPU allocation, the GLB byte gate validates package hash/length, GLB v2 structure, embedded triangle geometry, accessor ranges, node ownership and the V1 feature policy.

See [`contracts/VEHICLE_VISUAL_PACKAGE_V1.md`](contracts/VEHICLE_VISUAL_PACKAGE_V1.md).

## Wheel ownership

```text
tire + rim + rotating disc → wheel part transform
knuckle + fixed caliper    → knuckle part transform
```

The wheel transform already contains suspension motion, steering and spin. Future deformable tires require a separate explicit deformation contract; they must not change the stable rigid wheel identity silently.

## Portable build

The static package uses site-relative paths and explicit runtime assets. It can run from localhost, LAN HTTP or a repository subpath without publishing itself.

Current required runtime assets:

```text
receipts/jv_m6_factory_receipt.json
scenes/synthetic-flat-lab.scene.json
```

A vehicle GLB and its visual-package JSON will join this list only after the tiny runtime fixture passes load, render, rebuild, disposal and phone gates.

## Target product architecture

```text
Box3D source + portable native JV Core + stable C ABI
                         ↓
              one WebAssembly module
                         ↓
          VehicleRuntimeBackend: native_jv_wasm
                         ↓
         VehicleVisualFrameV1-compatible snapshots
                         ↓
        existing TypeScript assets, renderer, UI and scenes
```

One module avoids sharing Box3D world memory and transient handles across unrelated WASM modules. Stable `partId` remains independent from native runtime IDs.

## Native parity

A fixture test proves only self-consistency. Native parity requires the native executable and WASM build to run the same scenario corpus and produce comparable mechanism/trajectory snapshots.

The visual frame contract should remain backend-neutral so replacing `legacy_ts_m6` does not require reauthoring the model.

## Next structural change

After the current visual-rig source passes its complete gate:

```text
1 generate one tiny valid GLB + package runtime fixture
2 load and parse it transactionally without replacing the debug renderer
3 render rigid nodes from VehicleVisualFrameV1
4 prove rebuild/disposal and phone performance
5 only then import Jozz-authored vehicle assets
```

Do not combine the first GLB proof with final model complexity, scene collision or native WASM work.
