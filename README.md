# JV Web

JV Web is the browser demonstrator and research host for Jozz Vehicle. It combines deterministic input, real Box3D WebAssembly physics, mobile interaction, portable packaging, scene contracts and an emerging vehicle-model pipeline.

The repository is experimental, but it is expected to remain understandable, runnable and technically honest rather than becoming a collection of disconnected prototypes.

## Current demonstrator

The working browser build contains:

- deterministic fixed-step simulation;
- source-aware keyboard and Pointer Events input;
- simultaneous multi-touch steering and throttle/brake;
- real Box3D/WASM worlds and contacts;
- an 18-body M6 reference vehicle with suspension and physical rack steering;
- `RELEASE | POSITION | RATE` steering;
- reference drive, reverse, coast and braking;
- a dependency-free WebGL debug observer;
- transactional startup, rollback, disposal and rebuild;
- a relative-path portable build for localhost, LAN and repository subpaths;
- strict receipt integrity on secure contexts and ordinary LAN HTTP;
- explicit browser, backend, scene and vehicle-visual contracts.

Latest exact logged and owner-validated mobile checkpoint:

```text
commit: 7204993a0640e6cff0baa719d849a0b4368c15aa
Node/npm: 24.16.0 / 11.17.0
120/120 tests PASS
TypeScript / docs / notices / portable build PASS
npm audit: 0 vulnerabilities observed
localhost + LAN desktop + real phone PASS
Box3D + WebGL + keyboard + multi-touch observed working
publication NOT PERFORMED
```

Jozz also confirmed the newer scene/runtime path as LIVE with four contacts, all drive controls and destroy/rebuild working. The uploaded terminal log still identifies `7204993…`; the current vehicle visual-rig source needs its own fresh gate.

## Run locally

Requirements:

```text
Node 24
npm 11+
```

```powershell
npm ci
npm run dev -- --host 0.0.0.0
```

Complete validation and portable build:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-demonstrator-foundation-gate.ps1"
```

Preview the generated package:

```powershell
npm run preview -- --host 0.0.0.0 --port 4173 --strictPort
```

Inspect a future vehicle GLB locally:

```powershell
npm run inspect:vehicle-glb -- <model.glb> [vehicle.visual.json]
```

## Controls

```text
A / D or Left / Right   steering
W / Up                  forward
S / Down                reverse
Space                   brake
mouse or free-area drag orbit camera
mouse wheel              zoom
mobile buttons           multi-touch drive controls
```

All device adapters feed the same semantic fixed-step timelines and never manipulate Box3D directly.

## Architecture truth

The current vehicle is a reference fixture:

```text
backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
product physics authority: false
native JV parity: NOT_PROVEN
accepts new product physics: false
command contract: v1
trace contract: v1
visual frame contract: v1
```

It is useful for browser, mobile, asset and regression work, but is not a faithful native JV port. Native `maxDriveSpeed = 40` means a wheel-motor rad/s limit; the TypeScript fixture historically treats it as a linear target.

Target product architecture:

```text
Box3D source + native JV Core
              ↓
      one WebAssembly module
              ↓
 VehicleRuntimeBackend: native_jv_wasm
              ↓
 VehicleVisualFrameV1-compatible snapshots
              ↓
 TypeScript assets, renderer, UI and scenes
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/decisions/ADR-0003-native-jv-core-wasm.md`](docs/decisions/ADR-0003-native-jv-core-wasm.md).

## Scene foundation

The runtime starts through:

```text
public/scenes/synthetic-flat-lab.scene.json
```

`ScenePackageV1` defines meters, axes, spawn, render source and collision source. The current backend accepts only the synthetic plane; GLB scene rendering and triangle collision remain fail-closed until implemented.

See [`docs/contracts/SCENE_PACKAGE_V1.md`](docs/contracts/SCENE_PACKAGE_V1.md).

## Vehicle model and rig foundation

The current source candidate prepares the model pipeline without loading a final model yet.

```text
physics state
    ↓
VehicleVisualFrameV1
    ↓
18 stable rigid parts + 8 physical segments
    ↓
VehicleVisualPackageV1
    ↓
self-contained GLB nodes
```

M6 visual channels cover chassis, rack, four wheels, four knuckles, eight control arms, four coilovers and four steering links. Body transforms come from real Box3D bodies; segment endpoints use the exact physical joint anchors.

The first rig is a rigid-node vehicle rig, not a skinned character rig. Tire/rim/rotating disc follow the wheel; upright and fixed caliper follow the knuckle. Deformable tires remain a separate future contract.

Before future GPU upload the GLB gate verifies exact bytes, SHA-256, GLB v2 structure, buffer/accessor ranges, triangle geometry, node ownership and a strict no-skins/no-animation/no-morph/no-external-resource V1 policy.

See [`docs/contracts/VEHICLE_VISUAL_PACKAGE_V1.md`](docs/contracts/VEHICLE_VISUAL_PACKAGE_V1.md).

## Repository map

```text
src/app/                     browser and vehicle hosts
src/assets/                  shared portable asset policy
src/input/                   device adapters and semantic timelines
src/runtime/                 capabilities, backend and visual-frame contracts
src/scene/                   scene package validation
src/physics/                 typed Box3D boundary
src/vehicle/m6/              reference vehicle and stable visual channels
src/visual/                  GLB/package/asset validation
src/render/                  diagnostic WebGL observer
public/receipts/             pinned runtime configuration
public/scenes/               portable scene manifests
tests/                       deterministic, WASM and asset-contract tests
tools/                       build gates and GLB inspection
docs/PROJECT_STATE.md        canonical current state
```

## Correct model implementation order

```text
1 green gate for the current visual-rig source
2 tiny generated GLB + package runtime fixture
3 transactional CPU load/parse
4 minimal rigid-node rendering beside the debug observer
5 rebuild/disposal and phone performance
6 simple owner-authored chassis + wheels
7 suspension, steering links and coilovers
8 full body/interior/wheel asset
```

The final Jozz model must not be the first file testing the loader or GPU lifecycle.

## Known limitations

- current visual-rig source has not passed its fresh local gate;
- no browser GLB loader or model renderer yet;
- no final vehicle asset or package manifest yet;
- no triangle-mesh scene collision or real scan package;
- initial camera pose still starts from the old side;
- driving feel and RATE profiles are not product-approved;
- legacy split-sphere wheel is a physics regression fixture, not the future tire;
- no native JV WASM backend;
- active experimental history should not be fast-forwarded wholesale to a public main.

## License and ownership

Third-party notices are in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

JV Web does not yet grant a public reuse license. Models, scans, textures and photographs are governed separately from source code.

Jozz owns product direction, driving feel, visual acceptance, integration and publication decisions. Experimental results are not automatically adopted as product behavior.
