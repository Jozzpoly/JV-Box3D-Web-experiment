# JV Web

JV Web is the browser demonstrator and research host for Jozz Vehicle. It combines deterministic input, real Box3D WebAssembly physics, mobile interaction, portable static packaging and an emerging scene system.

The repository is experimental, but it is expected to remain understandable, runnable and technically honest rather than becoming a collection of disconnected prototypes.

## Current demonstrator

The working browser build contains:

- deterministic fixed-step simulation;
- source-aware timestamped keyboard and Pointer Events input;
- simultaneous multi-touch steering and throttle/brake;
- real Box3D/WASM worlds and contacts;
- an 18-body M6 reference vehicle with physical suspension and rack steering;
- `RELEASE | POSITION | RATE` steering semantics;
- reference wheel-joint drive, reverse, coast and braking;
- a dependency-free WebGL observer;
- transactional startup, rollback, disposal and rebuild;
- a relative-path portable build for localhost, LAN and repository subpaths;
- receipt integrity validation that also works on ordinary LAN HTTP;
- explicit browser-runtime, backend and scene contracts.

Latest owner-validated mobile checkpoint:

```text
commit: 7204993a0640e6cff0baa719d849a0b4368c15aa
Node: 24.16.0
npm: 11.17.0
120/120 tests PASS
TypeScript PASS
third-party verification PASS
portable static/runtime-assets/privacy/network/HTTP validation PASS
npm audit: 0 vulnerabilities observed
localhost browser PASS
LAN desktop browser PASS
real phone browser PASS
Box3D + WebGL + keyboard + multi-touch observed working
publication NOT PERFORMED
```

The current branch contains a newer scene/backend hardening candidate that still needs a fresh local gate and short browser/phone smoke.

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

Keyboard, touch and future gamepad adapters feed the same semantic fixed-step timelines. They do not manipulate Box3D directly.

## Architecture truth

The current browser vehicle is a reference fixture:

```text
backend: legacy_ts_m6
product physics authority: false
native JV parity: NOT_PROVEN
command contract: v1
trace contract: v1
```

It is useful for browser, mobile, rendering, scene-host and regression work, but it is not a faithful port of native JV. One confirmed mismatch is drive semantics: native JV treats `maxDriveSpeed = 40` as a wheel motor limit in rad/s, while the TypeScript fixture historically interpreted it as a linear target.

The intended product architecture remains:

```text
Box3D source + native JV Core
              ↓
      one WebAssembly module
              ↓
 VehicleRuntimeBackend: native_jv_wasm
              ↓
 stable C ABI and immutable snapshots
              ↓
 TypeScript browser host, renderer, UI and scenes
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/decisions/ADR-0003-native-jv-core-wasm.md`](docs/decisions/ADR-0003-native-jv-core-wasm.md).

## Scene foundation

The default runtime now starts through a strict scene package:

```text
public/scenes/synthetic-flat-lab.scene.json
```

`ScenePackageV1` defines meters, axes, spawn, render source and collision source. The current backend accepts only the synthetic plane; GLB rendering and triangle-mesh collision are deliberately rejected until their loaders exist.

See [`docs/contracts/SCENE_PACKAGE_V1.md`](docs/contracts/SCENE_PACKAGE_V1.md).

## Repository map

```text
src/app/                     browser and vehicle hosts
src/input/                   keyboard, pointer and semantic timelines
src/runtime/                 browser capability and backend contracts
src/scene/                   scene package validation and loading
src/physics/                 typed Box3D boundary
src/vehicle/m6/              legacy reference vehicle fixture
src/render/                  diagnostic WebGL observer
public/receipts/             pinned runtime configuration
public/scenes/               portable scene manifests and future assets
tests/                       deterministic, real-WASM and contract tests
tools/                       local build and validation tools
docs/PROJECT_STATE.md        canonical current state
docs/ARCHITECTURE.md         active architectural boundaries
```

The remote branch surface contains only `main` plus one active development branch. Older pull requests are closed as historical context.

## Known limitations

- the current scene hardening slice still needs a fresh gate and smoke;
- no GLB renderer or triangle-mesh collision loader yet;
- no real scan package yet;
- initial camera pose still needs a separate correction;
- driving feel and RATE profiles are not approved product defaults;
- the legacy split-sphere wheel is a regression fixture, not the future tire;
- no native JV WASM backend yet;
- the current renderer is diagnostic rather than final art;
- the active experimental history should not be fast-forwarded wholesale to a presentation-ready `main`.

## License and assets

Third-party software notices are in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

JV Web itself does not yet grant a public reuse license. Until Jozz chooses one, viewing the source does not imply permission to redistribute it. Models, scans, textures, photographs and future scene assets are governed separately from source code.

## Project ownership

Jozz owns product direction, driving feel, visual acceptance, integration and publication decisions. Experimental results are not automatically adopted as product behavior.
