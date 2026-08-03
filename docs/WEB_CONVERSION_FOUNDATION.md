# JV web conversion foundation

This document defines the architectural boundary for converting more of Jozz Vehicle to the browser without turning the proof of concept into an independent, silently diverging game.

## Source-of-truth rule

Native JV remains authoritative for:

- vehicle topology and hardpoint geometry;
- physics tuning and saved sessions;
- model registry keys and visual offsets;
- campus/obstacle contracts;
- authored glTF socket, marker and bone names;
- the current runtime ownership of visual parts when an older asset JSON conflicts with later native integration code.

The web project may adapt those contracts to browser APIs, but it must not invent replacement values merely because they look plausible.

## Runtime layers

```text
native JV working tree / committed JV main
                 │
                 ▼
        bridge + contract generation
        ├─ current-session.json
        ├─ synchronized glTF assets
        ├─ synchronized native asset JSON
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
- Keyboard/controller ergonomics remain outside the raw vehicle mechanism. Input filtering may not read yaw, slip, tyre force, rack force or other hidden vehicle-state feedback.
- A numerical steering value near zero is not sufficient to infer that the driver has released the steering wheel. Driver engagement is a separate host-input state.

### Configuration

- The local native session is preferred when available; factory/`uliczny` is an explicit fallback, not an assumed current vehicle.
- Unsupported rig types or wheel-envelope modes are reported, never silently interpreted as double wishbone/split envelope.
- Derived values such as rack travel are recomputed from imported geometry rather than trusted as stale serialized data.

### Visual assets

- A visual model is attached through named sockets, markers and bones, not by visual trial-and-error.
- Skinned glTF hierarchies must be cloned with independent skeletons; recursive `Object3D.clone(true)` is forbidden for repeated skinned vehicle parts.
- Every dynamic visual root and every internal authored centre used by the adapter must be validated against its corresponding Box3D body/joint.
- A mounting socket is not assumed to be the geometric or physical centre of its asset. The wheel contract explicitly separates the tyre centre from the inboard hub face.
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
  - `Marker_TireWidthLeft` and `Marker_TireWidthRight` define the physical tyre centre and width;
  - `Marker_TireRadiusOuter` defines the radius perpendicular to the authored axle;
  - `Socket_WheelMount` remains a separate inboard hub-face offset.
- Independent skeleton cloning for all four wheel instances.
- Wheel-root, physical tyre-centre and mount-axis validation against Box3D wheel bodies.
- Finite-rate keyboard steering with explicit steering engagement and a fixed centre-capture interval.
- Stationary and creeping rack-cycle probes that distinguish servo response from later hands-off mechanics.
- Central Test Campus data contracts and deterministic rock islands.

### Front steering-rig preflight complete; live binding pending

The bridge synchronizes and validates both:

- `OneSided_Steering_Suspension_Rig.gltf`;
- `one_sided_steering_suspension.asset.json`.

All 13 required sockets, axes and visual-part nodes are checked before Vite starts. Runtime Chrome preflight also checks the asset id, contract version, skin and node uniqueness.

The native sources contain a known historical semantic drift for `Socket_ChassisMount_b`:

1. the isolated M9 contract JSON still says `ridesBody: knuckle`;
2. later M9 work separated it from `WheelCenter` and made it ride a non-steering carrier;
3. current M6 has no carrier body, so `jozz_vehicle_m6_rig_lab_steering_visual.cpp` maps that role to `lowerArm`.

The web bridge therefore uses the topology-neutral role `nonSteeringCarrier`, currently resolved to `lowerArm` for M6. The JSON remains useful for authored names and positions, but its stale body label is not silently treated as current runtime authority.

The actual skinned parts are not rendered live yet. Attaching the entire model to one body remains forbidden.

### Synchronized but not fully bound

- `One_Sided_wheel_mount.gltf`.
- `Asset_Dumper.gltf`.

These assets must be split/bound by their native socket and bone ownership.

### Still provisional

- Body visual calibration is registry/session driven but not yet a general marker-based body contract.
- TypeScript mirrors of native config structures are hand-maintained.
- Several Box3D IDs and the module boundary still use `any`.
- Scan asset ingestion exists, but serious collider preparation and contact validation are pending.

## Steering host versus physical mechanism

The raw M6 steering mechanism and the web keyboard host have separate tests.

Raw parity probe:

- lateral wheel impact may push the rack to its limit at rest;
- after rolling forward hands-off, physical caster/tie-rod/rack mechanics must recover it without scripted counter-steer.

Web input probes:

- binary A/D commands are converted to finite steering-wheel motion;
- after key release, the driver remains explicitly engaged while returning to zero and for a fixed `0.35 s` centre hold;
- the hold reads no speed, yaw, slip, rack position or force;
- servo release is accepted only when the rack is within 10% of centre;
- a watchdog counts frames where an active servo has meaningful target error but practically no rack speed.

This prevents static rack friction from interpreting a near-zero filtered command as an immediate hands-off state and catching the rack before centre.

## Validation gates

A change is not considered safe merely because Vite builds.

Required gates currently include:

1. strict TypeScript compilation;
2. scan of every `b3.*` source call against real WASM exports;
3. Node/WASM physics smoke simulation;
4. deterministic M6 straight-line and steering-impact probes;
5. keyboard-driver handling and low-speed centre-capture probes;
6. production build in real headless Chrome;
7. visible-error, canvas and telemetry checks;
8. wheel marker dimensions, four independent skeletons, zero root/body error and zero physical-centre error;
9. front-rig native JSON + GLTF preflight with 13/13 unique required nodes and recognized ownership lineage.

Future visual adapters must add their own measurable contract reports to the same browser gate.

## Recommended conversion sequence

1. Build the live front-rig adapter from the validated role map:
   - chassis-owned rigid parts;
   - `nonSteeringCarrier` parts on current M6 `lowerArm`;
   - knuckle-owned parts;
   - chassis-to-carrier wishbone stretches;
   - rack-to-knuckle steering rod;
   - chassis-to-lower-arm telescoping damper.
2. Finish rear mount and telescoping damper binding.
3. Generate the web config schema/field map from the native field table rather than maintaining two manual lists.
4. Replace generic `any` Box3D IDs with branded TypeScript ID types and a typed runtime facade.
5. Convert the real board/yard visual assets while preserving procedural physics contracts.
6. Add the cleaned scan visual/collision pair and wheel-contact diagnostics.
7. Only after the single-car vertical slice is stable, evaluate reusable vehicle selection, replay and editor workflows.

The goal is not to freeze the current implementation. The goal is to ensure every later conversion step has an explicit source, adapter, invariant and regression gate.
