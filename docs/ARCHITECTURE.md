# JV Web — architecture

Updated: 2026-08-16
Status: `CURRENT STABLE BOUNDARIES`

This document describes stable system boundaries. It is not a roadmap, branch ledger or mechanical-history archive.

## 1. Product entry

```text
index.html
-> src/product-main.ts
-> product world selection / product controls
-> runtime host + M6 product renderer
-> world renderer + owner vehicle layer
```

The browser product currently exposes Plac E2R, Offroad and the approved JSPREV2 scan.

## 2. World boundary

World data is independent from the vehicle runtime.

- Plac E2R / Offroad are built product-world inputs.
- JSPREV2 is an external scan package decoded into the `JvWorldData` scan contract.
- Product selection changes world/spawn behavior without redefining vehicle mechanics.
- Render and collision representations are semantically separate even when derived from the same scan source.

## 3. JSPREV2 transport and integrity

Public scan assets resolve relative to `document.baseURI`, so the same build works under the GitHub Pages project path.

Compressed HTTP `Content-Length` is not logical scan-file integrity. Runtime validates the decoded payload/format: byte length, magic/version/tile/group descriptors, counts/triangle relationships, index range and finite numeric streams.

The source/release layer additionally pins the exact approved pack identity and file hashes.

## 4. Scan decode and loading

Current scan loading uses normal browser caching and a bounded two-tile fetch/parse pipeline while preserving deterministic final tile order.

During decode, finite validation and required group bounds are produced in the parser pass rather than by later full geometry rescans. The current collision representation is still assembled as a merged mesh from scan geometry.

All current scan render groups are installed into the renderer at world creation. This is not streaming or world partitioning.

## 5. Scan rendering

The renderer remains WebGL1-compatible.

Index upload policy:

- when `OES_element_index_uint` is available, scan groups use their source Uint32 index stream directly;
- without the extension, groups fitting the 16-bit vertex range use direct Uint16 indices;
- larger groups retain the safe Uint16 chunk fallback.

Each scan group has bounds used for conservative frustum culling. Shared scan matrices and pass-level WebGL state are reused across visible groups while per-group texture/color/buffer state remains explicit.

Current textures are ordinary browser image textures. They load asynchronously and become resident for the current world; texture streaming/compression/residency management is not implemented.

There is no geometric LOD or world partitioning. Those are future scaling tools, not requirements for the current Friends scan.

## 6. Frame/runtime boundary

Physics keeps a fixed 60 Hz step. Browser presentation is decoupled from fixed-step catch-up: a browser frame may execute multiple required simulation steps, but it presents at most once using the final state.

Rich M6 trace/visual materialization is deferred to the final presented catch-up state rather than repeated for intermediate steps.

Runtime telemetry distinguishes browser cadence, scene-presentation cadence, simulation-step count, physics time, trace-capture time and render/UI time. Startup telemetry separately covers world loading, scan-loader phases, synchronous WebGL setup/submission, Box3D boundary/world creation and texture readiness/upload calls.

Telemetry is diagnostic evidence, not a substitute for owner-visible/browser validation.

## 7. Mobile compositor boundary

On coarse-pointer/mobile layouts, live backdrop blur and heavy shadow effects over the continuously changing WebGL surface are deliberately reduced. This is a presentation/compositor policy; it does not change simulation, scan geometry or render scale.

Responsive UI/camera behavior may continue to evolve independently from vehicle mechanics.

## 8. Vehicle/physics boundary

The current browser vehicle uses pinned `box3d.js@0.0.2` and the existing M6 Web implementation.

The coherent-front driving bridge is a useful product intermediate, not final rig/steering/handling architecture. Historical M5/M6 values, calibration outputs and convenience tests are evidence only for the claims they directly prove.

Physics performance work must not silently reduce fixed-step rate, solver/substeps, collision semantics or vehicle complexity.

## 9. Owner vehicle visual boundary

Owner source meshes/contracts generate the browser visual package deterministically. Visual calibration must not silently retune physics, and physics convenience must not redefine authored asset semantics.

## 10. JURE authoring boundary

JURE is the intended owner-facing authoring system for rig elements, frames, mating points and later broader JV/VAW authoring needs.

JV Web should eventually consume explicit JURE-authored outputs through a small adapter/contract. It should not maintain a parallel rig editor or repair uncertain authored geometry with accumulating ad-hoc offsets.

## 11. Experience, camera and input boundary

Manual camera calibration is user-owned presentation state. Automatic driving assists may derive additive camera response, but must not silently rewrite the user's manual orbit, pan, distance or saved calibration. Reset may intentionally return to the current viewport default; future presets should persist explicit user settings rather than transient assist state.

Camera gesture ownership stays in the renderer/UI path. Terrain/obstacle camera avoidance requires an explicit environment-query/probe boundary; do not infer authoritative collision or ground state from visual data just to make a camera effect work.

Vehicle controls stay on the timestamped product-input path. Device-specific controls must not call M6 physics directly. Current analog steering uses the existing `RELEASE` / `RATE` / `POSITION` command model, and analog throttle/brake use the normalized longitudinal path. Steering and longitudinal source ownership remain independent so simultaneous controls can coexist. Future input experiments should extend these boundaries rather than bypass them.

Immersive/fullscreen behavior, HUD composition and user settings are presentation/capability layers. They may change how JV is operated or displayed without becoming vehicle-mechanics authority.

## 12. Private source vs public artifact

```text
Jozzpoly/JV-Box3D-Web-experiment
  source / development / accepted private main

Jozzpoly/JV-Box3D-Web-Public
  generated public artifacts / GitHub Pages
```

`release/r0` stays immutable. `release/friends-r1` is the moving Friends line. A code-only Friends release may carry forward the exact already-published scan; a scan-changing release must explicitly pin the new approved scan input.

## 13. Architecture principles

- owner-visible behavior and exact source/runtime evidence outrank historical naming;
- source, authored data, visual representation, physics and release artifact are separate layers;
- JURE authors rig truth; JV Web consumes it later;
- tests protect real invariants, not provisional equations or incidental counts;
- simple product bridges may exist, but stay labeled temporary;
- measure before adding scaling architecture;
- documentation describes current truth; Git preserves expeditions and superseded designs.
