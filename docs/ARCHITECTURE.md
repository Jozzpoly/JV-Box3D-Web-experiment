# JV Web — architecture map

Updated: 2026-08-10
Status: **CURRENT R1 ARCHITECTURE**

This document describes stable architectural boundaries, not the current task queue. Scheduling lives in `docs/HANDOFF.md`.

## 1. Product/runtime entry

```text
index.html
-> src/product-main.ts
-> configure product world + controls
-> M6ProductRenderer
-> M6WorldRenderer
```

`M6ProductRenderer` subscribes to the product world and loads the generated owner-vehicle visual package. `M6WorldRenderer` owns WebGL rendering, camera state/input and vehicle visualization.

## 2. World boundary

The product world combines the browser vehicle with E2R/offroad world data and optional private JSPREV2 scan data.

```text
LOCAL_FULL private dev
  -> loadLocalProductWorld
  -> optional loadLocalJsprev2Scan
  -> product world
```

Private scan delivery uses a dev-only Vite plugin and local filesystem pack selection. That mechanism is intentionally separate from any later public Pages asset design.

## 3. Physics authority

Current runtime backend:

```text
legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

The browser fixture is valuable for deterministic integration and friend-demo work. It must not silently become a second authoritative native physics product.

Long-term native/WASM reasoning is documented separately in `docs/NATIVE_PORT_NOTES.md` and ADR-0003.

## 4. M6 topology

Current M6 physical topology separates:

- chassis;
- upper/lower suspension-arm bodies;
- knuckle/upright bodies;
- spherical arm-to-knuckle constraints;
- rack body and rack prismatic motion;
- rack-to-knuckle steering-link constraints;
- wheel bodies with knuckle-to-wheel spin revolutes.

This is important for steering diagnosis: a visible wrong pivot does not by itself prove that the physical topology needs a new carrier hierarchy.

## 5. Physics -> visual boundary

The runtime exposes vehicle visual frames/part transforms. The owner-vehicle layer maps semantic package bindings onto those physical parts.

The visual package contract supports rigid part attachment and segment/part-pair deformation for components such as dampers, steering links and cardans.

Keep visual calibration separate from physics authority wherever possible so source-asset corrections do not mutate vehicle mechanics accidentally.

## 6. Owner vehicle source pipeline

Source authority:

```text
assets/owner-vehicle/source/*.gltf
assets/owner-vehicle/contracts/*.asset.json
public/receipts/jv_m6_factory_receipt.json
```

Generator path:

```text
Blockbench glTF inspection
-> semantic reference extraction
-> R2/R3 calibration helpers
-> m6-owner-full-rig-r3 package
-> generated visual JSON/report/GLB
-> live owner vehicle loader
```

Current generated package is deterministic: 59 real bindings, GLB SHA-256 `57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a`.

## 7. Wheel interface invariant

The physical wheel spin center and authored `Socket_WheelMount` are different semantic points.

`Socket_WheelMount` is the authored visual mounting-face endpoint and must not be collapsed into the physical wheel center merely because both participate in wheel placement.

Current R3 tests protect this distinction through steering/spin motion.

## 8. Front suspension calibration caveat

Front authored source currently provides an upper outboard reference but no independent lower-outboard marker used by the R3 calibration. The calibration infers lower outboard from a parallel-upright assumption.

Treat this as calibration provenance, not as automatically correct geometry. Live steering truth must decide whether the physical constraint axis is coherent and whether only visual mapping needs correction.

## 9. Camera/input ownership

Camera state (yaw/pitch/distance/chase behavior) and pointer camera controls live in the renderer path. Vehicle control pointers and camera gestures must not steal ownership from each other.

Camera work should normally remain a separate owner-feel slice from vehicle geometry work.

## 10. Scene/package contracts

Durable public contracts live under `docs/contracts/`:

- scene package;
- static scene visual package;
- steering command contract;
- vehicle visual package.

Implementations may evolve, but contract changes should be explicit and tested.

## 11. Public artifact boundary

Private source and public release are separate repositories.

Published R0 is immutable historical proof. Current R1 source should not carry R0-specific release machinery merely to preserve history; exact historical commits and the public artifact are the reproduction authority.

Future R1 Pages publication uses a new versioned artifact and must explicitly decide what, if any, scan resources are public.

## 12. Architecture principles

- fixed-step/lifecycle ownership stays explicit;
- device input does not become physics authority;
- source asset semantics are explicit contracts, not inferred from mesh bounds when authored markers exist;
- generated artifacts are reproducible from tracked source;
- visual corrections should not silently retune physics;
- old branches are salvage sources only when a current question explicitly needs them;
- owner-visible acceptance is recorded separately from automated test success.
