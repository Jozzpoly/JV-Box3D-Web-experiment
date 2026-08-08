# JV Web architecture

Updated: 2026-08-08
Status: **CURRENT R1 ARCHITECTURE MAP / friend-demo campaign**

## 1. Architectural goal for the current campaign

JV-Web is the active private browser/game demonstrator. It owns browser/mobile input, fixed-step host/lifecycle, rendering, Web-facing configuration/UX, private scene presentation and public artifact production.

Native JV is read-only for this campaign. It remains a source of authored assets, semantics and selected existing mechanisms such as `b3Wheel`, but full native→WASM convergence is deferred.

Public R0 is a frozen map-only artifact/rollback baseline. Current R1 work happens in the private repo and may include local/private JSPREV2.

## 2. Current execution path

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
M6 trace + VehicleVisualFrameV1
          ↓
M6ProductRenderer / M6WorldRenderer
          ↓
procedural vehicle + product world
```

The browser mechanics backend remains a reference fixture:

```text
backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
acceptsNewProductPhysics: false
```

It may support friend-demo features, browser lifecycle, rendering and product configuration. It must not silently become authority for new final vehicle physics.

## 3. Input and fixed-step ownership

Device adapters emit semantic commands rather than manipulating physics directly.

```text
SteeringCommand = RELEASE | POSITION | RATE
LongitudinalCommand = throttle + brake
```

Keyboard/touch sources are independently owned so one device source does not incorrectly release another. The browser host owns fixed-step scheduling, dropped-time policy, lifecycle release, rebuild and input→physics→observation ordering.

Future camera gestures must coexist with touch driving ownership. One-finger orbit/two-finger pinch must not steal an active vehicle-control pointer.

## 4. Vehicle observation boundary

Current trace already exposes a read-only visual frame:

```text
physics/runtime
  ↓
VehicleVisualFrameV1
```

Current proof topology contains:

```text
18 rigid part transforms
  chassis, rack
  wheel/knuckle/upper-arm/lower-arm × 4

8 segment channels
  coilover × 4
  steering-link × 4
```

The renderer therefore does not need transient Box3D body/joint IDs.

This isolation is a useful invariant. `M6_FULL_RIG_V1` is the current proof topology, not a declaration of the final general native↔Web ABI.

## 5. Current vehicle rendering boundary

### Live path

`M6WorldRenderer` still draws procedural primitives:

- box chassis;
- cylinder wheels;
- diagnostic rig/front/link geometry.

It also owns the current camera state (`yaw`, `pitch`, `distance`) and pointer camera controls.

### Dormant authored-vehicle stack

Current source already contains:

```text
VehicleVisualPackageV1
→ package URL/hash validation
→ GLB container/runtime policy
→ rigid CPU decode
→ CPU ownership/budget checks
→ GPU geometry buffers
→ semantic binding/world transforms
→ generic draw-plan support
```

Missing product bridge:

```text
VehicleVisualRenderResourceV1
+ trace.visualFrame
+ node/mesh draw plan
→ actual live vehicle draw calls
```

Production pixel materials/textures are also incomplete.

The deterministic tiny vehicle fixture is useful as a seam diagnostic. It is not the product target.

## 6. Owner-authored vehicle assets

Exact source assets are now known and indexed in the handoff/resource pack:

```text
Nadwozie.gltf
Offroad_Big_Wheels.gltf
```

Their source data, historical placement and semantic wheel markers should be used as evidence when integrating visuals.

Authored mesh/markers are **visual/source evidence**, not hidden physics authority. A marker may describe visual mounting or a measured hint; it must not silently rewrite mechanics unless a separate contract explicitly makes it authoritative.

## 7. Product world / private scan boundary

This section supersedes the older synthetic-only description.

### Current private entry

The root private `index.html` launches:

```text
/src/product-main.ts
```

`product-main.ts` currently configures:

```text
loadLocalFullProductWorld
  → loadLocalJsprev2Scan()
  → createProductWorld(scan)
```

`createProductWorld()` always provides E2R/offroad and may additionally attach a scan.

### Current local scan delivery

`vite.config.ts` installs `finalJsprev2VitePlugin()`.

The plugin is development-server-only (`apply: "serve"`) and reads the exact local pack selected through:

```text
JOZZ_SCAN_PREVIEW_PACK
```

It exposes private runtime endpoints:

```text
/__jv_scan__/index.json
/__jv_scan__/asset/<id>
```

If the environment variable is absent, the private product can still run car + E2R without scan.

### Historical proof vs current proof

The strongest preserved desktop scan evidence is:

```text
product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580
```

It has exact Windows gate evidence plus historical owner observation of corrected rendering/filter/grid and working collision.

Several key c8e0 scan blobs survived byte-for-byte into current R1, including `jsprev2-scan.ts`, product view settings and WebGL scan policy. Current R1 also still contains LOCAL_FULL loader/product-main wiring.

Therefore scan work should start by **revalidating the current path with the exact pack**, not by assuming the whole old branch must be recovered.

### Location switching / teleport debt

Current product controls represent map/scan locations as links with different `jvSpawn` query parameters. That causes page navigation and therefore a full startup/world reconstruction.

Historical owner observation identified roughly one-to-several-second switching cost.

Future teleport work should evolve this into in-app vehicle/location repositioning where lifecycle ownership permits, while preserving clear spawn semantics and safe vehicle state reset.

## 8. Public scan boundary

Public R0 deliberately excludes JSPREV2 and uses the separate `map-only-r0.html` / public build profile.

Current private scan delivery is **not deployable to GitHub Pages as-is**, because the Vite plugin reads a local filesystem pack only during dev serving.

A future public scan demo therefore needs an explicit delivery design after the real pack is recovered/measured. Possible implementation details must be decided from actual pack size/device behavior, but the boundary is fixed:

```text
local PRIVATE scan working
≠
public Pages scan artifact solved
```

Do not accidentally leak private scan bytes into a public build. Do not redesign hosting before the actual pack is available and measured.

## 9. Scene and collision separation

The useful existing principle remains:

```text
visual/render representation
≠
collision representation
```

E2R and JSPREV2 can provide their own render/collision data. Future phone optimization may choose different render/collision budgets without forcing one mesh to serve both roles.

`ScenePackageV1` remains the startup contract consumed by the mechanics host. Current scan spawn selection rewrites the scene spawn at private product startup after the world/scan is loaded.

## 10. Camera boundary

The current camera is embedded in `M6WorldRenderer`.

Before creating a new subsystem, inspect/evolve this implementation and its lifecycle. A likely future separation is:

```text
vehicle/camera target state
+ orbit/chase input state
+ camera tuning
→ view transform
```

Desired product behavior includes chase following, tunable distance/height/look-ahead, desktop orbit/zoom and phone pinch zoom. Exact constants and smoothing belong to playtesting rather than this architecture document.

## 11. Vehicle configuration / drivetrain boundary

Current M6 uses:

```text
allWheelDrive = false → RWD
allWheelDrive = true  → AWD
```

A Web config model should precede a polished settings panel. FWD/RWD/AWD can become a semantic enum/selection rather than UI-specific toggles.

The requested drivetrain/shaft lock is not yet semantically defined. Do not implement a button with guessed physics.

Native presets may inform state semantics, but native UI/layout is not the Web UI contract.

## 12. Box3D / true wheel boundary

Current Web runtime uses pinned `box3d.js@0.0.2` and does not expose native JV's newer `b3Wheel` API.

The current campaign may perform a bounded port of an already-existing wheel mechanism if feasible:

```text
pinned native wheel delta
→ Web/Emscripten Box3D build
→ minimal JS/TS exports
→ focused tests
→ selectable/rollback-able Web wheel backend
```

This does not activate full native JV→WASM parity work and must not become new tire R&D.

## 13. Public build boundary

R0 public artifact remains immutable.

Current repository deliberately separates:

```text
private index.html / LOCAL_FULL-capable development
map-only-r0.html / scan-free public R0 profile
```

Later public friend-demo versions should be new versioned artifacts. They may include additional capabilities only after an explicit public-asset decision and owner acceptance.

## 14. Current architectural priorities

No fixed `1→2→3` roadmap is declared here.

Current high-value opportunity lanes are:

- authored car + live visual/material path;
- chase camera + mobile gestures;
- current LOCAL_FULL scan revalidation, faster location switching and phone measurement;
- vehicle config/presets/drivetrain;
- bounded `b3Wheel` feasibility/port;
- final Web/mobile UI and QoL.

Choose one main owner-visible slice at a time. Use small technical seam proofs only when they answer a concrete uncertainty. See `docs/PROJECT_STATE.md` and the controlled handoff for current scheduling context.