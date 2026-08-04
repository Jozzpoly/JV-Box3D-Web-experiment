# JV Web

JV Web is a browser-based vehicle-physics experiment built around Box3D WebAssembly. It is the current public-facing research host for Jozz Vehicle: a place to test deterministic input, vehicle topology, steering, drive, rendering and eventually a native JV physics core in the browser.

The project is experimental, but the repository is intended to remain understandable and runnable rather than becoming a collection of disconnected prototypes.

## Current prototype

The browser build currently contains:

- deterministic fixed-step simulation;
- timestamped keyboard input that preserves short taps;
- real Box3D/WASM worlds and contacts;
- an 18-body M6 reference vehicle with physical suspension and rack steering;
- `RELEASE | POSITION | RATE` steering semantics;
- wheel-joint drive, reverse, coast and braking;
- a dependency-free WebGL observer;
- rebuild and disposal without reloading the page;
- a relative-path portable build suitable for localhost, LAN and future GitHub Pages.

## Run locally

Requirements:

```text
Node 24
npm 11+
```

```powershell
npm ci
npm run dev
```

Production validation and portable build:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-demonstrator-foundation-gate.ps1"
```

Preview the generated package:

```powershell
npm run preview -- --host 0.0.0.0
```

## Controls

```text
A / D or Left / Right   steering
W / Up                  forward
S / Down                reverse
Space                   brake
mouse drag               orbit camera
mouse wheel              zoom
```

## Architecture truth

The current browser vehicle is explicitly a reference fixture:

```text
backend: legacy_ts_m6
product physics authority: false
native JV parity: not proven
```

It is useful for browser, input, rendering and experiment work, but it is not a faithful port of the native JV vehicle. One confirmed example is drive semantics: native JV treats `maxDriveSpeed = 40` as a wheel motor limit in rad/s, while the current TypeScript fixture historically interpreted it as a linear target.

The intended product architecture is:

```text
Box3D source + native JV Core
              ↓
      one WebAssembly module
              ↓
 stable C ABI and immutable snapshots
              ↓
 TypeScript browser host and renderer
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/decisions/ADR-0003-native-jv-core-wasm.md`](docs/decisions/ADR-0003-native-jv-core-wasm.md).

## Repository map

```text
src/                         browser host, input, Box3D boundary and M6 fixture
tests/                       deterministic and real-WASM tests
public/receipts/             pinned runtime configuration input
tools/                       local build and validation tools
docs/PROJECT_STATE.md        current state and next work
docs/DEVELOPMENT.md          development workflow
docs/HISTORY.md              compressed project history
docs/NATIVE_PORT_NOTES.md    native/WASM migration notes
```

## Known limitations

- driving feel and steering profiles are not approved product defaults;
- the legacy split-sphere wheel is a regression fixture, not the future tire;
- no native JV WASM backend yet;
- no mobile UI or real scan scene yet;
- the current renderer is diagnostic rather than final art;
- a fresh local gate is required after the current repository cleanup.

## License and assets

Third-party software notices are in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

JV Web itself does not yet grant a public reuse license. Until Jozz chooses one, viewing the source does not imply permission to redistribute it. Models, scans, textures, photographs and future scene assets are governed separately from source code.

## Project ownership

Jozz owns product direction, driving feel, visual acceptance and publication decisions. Contributions and technical review are welcome, but experimental results are not automatically adopted as product behavior.
