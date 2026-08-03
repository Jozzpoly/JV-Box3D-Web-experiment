# JV web conversion foundation

This document defines the architectural boundary for converting more of Jozz Vehicle to the browser without turning the proof of concept into an independent, silently diverging game.

## Source-of-truth rule

Native JV remains authoritative for:

- vehicle topology and hardpoint geometry;
- physics tuning and saved sessions;
- model registry keys and visual offsets;
- campus/obstacle contracts;
- authored glTF socket, marker and bone names.

The web project may adapt those contracts to browser APIs, but it must not invent replacement values merely because they look plausible.

## Runtime layers

```text
native JV working tree / committed JV main
                 │
                 ▼
        bridge + contract generation
        ├─ current-session.json
        ├─ synchronized glTF assets
        └─ jv-asset-manifest.json
                 │
        ┌────────┴─────────┐
        ▼                  ▼
Box3D WASM boundary    visual contract adapters
box3d-runtime.ts       socket/marker/bone → body/joint
        │                  │
        └────────┬─────────┘
                 ▼
          browser host/game loop
                 │
                 ▼
     probes + Chrome runtime validation
```

## Non-negotiable invariants

### Physics

- Physics dimensions are expressed in metres and never derived from arbitrary render bounds.
- Fixed simulation step remains `1/60 s` with an explicit substep count.
- Native Box3D calls may only cross through exports verified against the instantiated `box3d.js` module or through an explicit named compatibility shim.
- Keyboard/controller ergonomics remain outside the raw vehicle mechanism. Input filtering may not read yaw, slip, tire force or other hidden vehicle-state feedback.

### Configuration

- The local native session is preferred when available; factory/`uliczny` is an explicit fallback, not an assumed current vehicle.
- Unsupported rig types or wheel-envelope modes are reported, never silently interpreted as double wishbone/split envelope.
- Derived values such as rack travel are recomputed from imported geometry rather than trusted as stale serialized data.

### Visual assets

- A visual model is attached through named sockets, markers and bones, not by visual trial-and-error.
- Skinned glTF hierarchies must be cloned with independent skeletons; recursive `Object3D.clone(true)` is forbidden for repeated skinned vehicle parts.
- Every dynamic visual root must be validated against its corresponding Box3D body/joint.
- Fallback primitives remain available, but a failed real-asset contract is visible in the HUD and fails browser CI where the asset is required.
- Visual meshes never become physics colliders implicitly.

### Terrain

- Photogrammetry render geometry and collision geometry are separate assets.
- The collision mesh is cleaned, reduced and validated before entering Box3D.
- Scan mesh testing must explicitly evaluate internal-edge/ghost-contact behaviour before deciding whether `box3d.js` needs an `identifyEdges` binding extension.

## Current contract status

### Complete enough for owner testing

- M6/M7 four-corner double-wishbone physics topology.
- Rack/tie-rod mechanism, static toe rest lengths and load-dependent friction.
- Local session detection and import.
- `rama_rurowa` identity, native scale/yaw and session offset.
- `Offroad_Big_Wheels.gltf` marker contract:
  - `Socket_WheelMount`;
  - `Marker_TireRadiusOuter`;
  - `Marker_TireWidthLeft`;
  - `Marker_TireWidthRight`.
- Independent skeleton cloning for all four wheel instances.
- Wheel-root to Box3D-body attachment validation.
- Central Test Campus data contracts and deterministic rock islands.

### Synchronized but not fully bound

- `OneSided_Steering_Suspension_Rig.gltf`.
- `One_Sided_wheel_mount.gltf`.
- `Asset_Dumper.gltf`.

These assets must be split/bound by their native socket and bone ownership. Attaching the entire front rig to one body is forbidden because native JV distributes it across chassis, lower arm and knuckle.

### Still provisional

- Body visual calibration is registry/session driven but not yet a general marker-based body contract.
- TypeScript mirrors of native config structures are hand-maintained.
- Several Box3D IDs and the module boundary still use `any`.
- Scan asset ingestion exists, but serious collider preparation and contact validation are pending.

## Validation gates

A change is not considered safe merely because Vite builds.

Required gates currently include:

1. strict TypeScript compilation;
2. scan of every `b3.*` source call against real WASM exports;
3. Node/WASM physics smoke simulation;
4. deterministic M6 straight-line and steering-impact probes;
5. keyboard-driver handling diagnostic;
6. production build in real headless Chrome;
7. visible-error, canvas and telemetry checks;
8. wheel marker dimensions, four independent skeletons and zero root/body attachment error.

Future visual adapters should add their own measurable contract reports to the same browser gate.

## Recommended conversion sequence

1. Finish front suspension visual ownership per native bones/sockets.
2. Finish rear mount and telescoping damper binding.
3. Generate the web config schema/field map from the native field table rather than maintaining two manual lists.
4. Replace generic `any` Box3D IDs with branded TypeScript ID types and a typed runtime facade.
5. Convert the real board/yard visual assets while preserving procedural physics contracts.
6. Add the cleaned scan visual/collision pair and wheel-contact diagnostics.
7. Only after the single-car vertical slice is stable, evaluate reusable vehicle selection, replay and editor workflows.

The goal is not to freeze the current implementation. The goal is to ensure every later conversion step has an explicit source, adapter, invariant and regression gate.
