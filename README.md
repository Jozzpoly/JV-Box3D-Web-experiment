# JV Web

JV Web is the desktop/mobile browser demonstrator and research host for Jozz Vehicle. It combines deterministic input, real Box3D WebAssembly physics, portable packaging, strict scene/asset contracts and an emerging full vehicle-visual pipeline.

The repository is experimental, but expected to remain understandable, runnable and technically honest.

## Working demonstrator

- deterministic fixed-step simulation;
- source-aware keyboard and Pointer Events input;
- simultaneous mobile steering and throttle/brake;
- real Box3D/WASM contacts;
- 18-body M6 reference vehicle with physical rack steering;
- `RELEASE | POSITION | RATE` steering;
- reference drive, reverse, coast and braking;
- dependency-free WebGL debug observer;
- transactional startup/disposal/rebuild;
- relative-path portable build for localhost, LAN and repository subpaths;
- strict receipt validation on secure contexts and ordinary LAN HTTP.

Exact logged mobile checkpoint:

```text
commit: 7204993a0640e6cff0baa719d849a0b4368c15aa
Node/npm: 24.16.0 / 11.17.0
120/120 tests PASS
TypeScript / docs / notices / portable build PASS
localhost + LAN desktop + real phone PASS
publication NOT PERFORMED
```

Jozz subsequently confirmed the newer runtime lines as LIVE with four contacts, all controls and destroy/rebuild working on desktop and phone. The exact current asset-pipeline head still requires its own fresh gate.

## Run

Requirements: Node 24, npm 11+.

```powershell
npm ci
npm run dev -- --host 0.0.0.0
```

Complete validation and portable package:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-demonstrator-foundation-gate.ps1"
```

Inspect a vehicle export:

```powershell
npm run inspect:vehicle-glb -- <model.glb> <vehicle.visual.json>
```

## Controls

```text
A / D or Left / Right   steering
W / Up                  forward
S / Down                reverse
Space                   brake
mouse/free-area drag     orbit camera
mouse wheel              zoom
mobile buttons           multi-touch vehicle controls
```

All device adapters feed semantic fixed-step timelines and never manipulate Box3D directly.

## Physics authority

```text
backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
product physics authority: false
native JV parity: NOT_PROVEN
accepts new product physics: false
command / trace / visual frame: v1
```

The fixture supports browser, mobile, asset and regression work but is not a faithful native JV port. Native `maxDriveSpeed = 40` is a wheel-motor rad/s limit; the TypeScript fixture historically uses linear-target semantics.

Target product physics:

```text
Box3D source + native JV Core
              ↓ one WASM module
VehicleRuntimeBackend: native_jv_wasm
              ↓
VehicleVisualFrameV1-compatible snapshots
              ↓
existing TypeScript asset/render/UI layers
```

## Vehicle visualization pipeline

```text
VehicleVisualFrameV1
        ↓
18 stable parts + 8 physical segments
        ↓
VehicleVisualPackageV1
        ↓
fetch / hash / GLB policy
        ↓
sealed CPU asset
        ↓
ownership + mobile budget
        ↓
draw plan
        ↓
transactional GPU buffers
```

The first rig is a rigid-node vehicle rig, not a character skeleton. The model contains no Box3D IDs and never drives physics.

Binding modes:

```text
PART
SEGMENT_STRETCH(referenceLengthMeters)
SEGMENT_ENDPOINT_AIM
```

The V1 GLB subset accepts triangles, 8/16-bit indices, POSITION and optional NORMAL/TEXCOORD_0. It currently rejects textures, external resources, unknown vertex attributes, skins, animations, morphs and extensions rather than silently discarding them.

Protective mobile geometry limits:

```text
512 nodes
512 primitives
300,000 triangles
64 materials
64 MiB decoded geometry
```

See [`docs/contracts/VEHICLE_VISUAL_PACKAGE_V1.md`](docs/contracts/VEHICLE_VISUAL_PACKAGE_V1.md).

## Deterministic tiny rig

Before dev/build the repository generates:

```text
public/vehicles/tiny/vehicle.visual.json
public/vehicles/tiny/models/m6-rig-proof.glb
```

It contains 18 part boxes and 8 segment rods using two shared meshes/materials. Both files are reproducible, byte-pinned, required portable runtime assets and validated together through the CPU pipeline.

The tiny asset is not drawn by `main.ts` yet. It exists so the first browser GLB proof does not depend on the final Jozz model.

## Scene and scan foundation

The working runtime starts through `public/scenes/synthetic-flat-lab.scene.json` and currently supports only a built-in ground plane.

A preliminary [`StaticSceneVisualPackageV1`](docs/contracts/STATIC_SCENE_VISUAL_PACKAGE_V1.md) pins static GLB bytes, `worldFromAsset`, local-origin radius and budgets. It will reuse the CPU/GPU mesh path but not vehicle bindings.

```text
photogrammetry render mesh ≠ collision mesh
```

Real scan rendering, textures, chunking/culling and triangle collision remain inactive until the tiny vehicle path is proven on phone.

## Repository map

```text
src/app/                     browser and vehicle hosts
src/input/                   device adapters and semantic timelines
src/runtime/                 backend and visual-frame contracts
src/scene/                   scene/static-scan contracts
src/physics/                 typed Box3D boundary
src/vehicle/m6/              reference vehicle and visual channels
src/visual/                  GLB, CPU, binding and draw-plan pipeline
src/render/                  debug observer and transactional GPU assets
public/                      generated/pinned runtime assets
_tests/ tests/               deterministic and adversarial gates
tools/                       build, packaging and asset inspection
docs/PROJECT_STATE.md        canonical current state
```

## Correct next order

```text
1 full gate on exact current PR head
2 unchanged debug-renderer desktop/LAN/phone smoke
3 load the tiny package in browser
4 compile live draw plans from VehicleVisualFrameV1
5 minimal shader/draw layer beside debug observer
6 prove 18 parts + 8 segments, rebuild/disposal and phone budget
7 owner-authored simple chassis + wheels
8 suspension links and coilovers
9 normals/base-colour lighting
10 embedded texture ownership and budgets
11 full body/interior/wheel model
12 first static scan visual fixture
```

The final owner model must not be the first asset testing load, transform math or GPU lifecycle.

## Known limitations

- current asset-pipeline head is not locally gated yet;
- tiny GLB is not drawn in the browser yet;
- no image/texture pipeline;
- no final vehicle or real scan package;
- initial camera pose still starts from the old side;
- driving feel/RATE profiles are not product-approved;
- legacy split-sphere wheel is a regression fixture, not the future tire;
- no native JV WASM backend;
- active experimental history should not be fast-forwarded wholesale to public `main`.

## License and ownership

Third-party notices are in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). JV Web does not yet grant a public reuse license. Models, scans, textures and photographs are governed separately from source code.

Jozz owns product direction, driving feel, visual acceptance, integration and publication decisions.
