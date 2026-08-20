# JV Web — architecture

Updated: 2026-08-20
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

The source product supports Plac E2R, Offroad and the approved JSPREV2 scan. The accepted Friends artifact includes those worlds. Owner Preview should preserve accepted capabilities unrelated to the active experiment. Heavy approved static data may be composed into Preview as an exact pinned artifact layer with explicit provenance instead of being copied into product source. A deliberate capability omission is an explicit scoped Preview gap recorded in `docs/PROJECT_STATE.md`, not the default delivery model.

## 2. World boundary

World data is independent from the vehicle runtime.

- Plac E2R / Offroad are built product-world inputs.
- JSPREV2 is an external scan package decoded into the `JvWorldData` scan contract.
- Product selection changes world/spawn behavior without redefining vehicle mechanics.
- Render and collision representations are semantically separate even when derived from the same scan source.

## 3. JSPREV2 transport and integrity

Public scan assets resolve relative to `document.baseURI`, so the same build works under a GitHub Pages project path when the scan payload is included.

Compressed HTTP `Content-Length` is not logical scan-file integrity. Runtime validates the decoded payload/format: byte length, magic/version/tile/group descriptors, counts/triangle relationships, index range and finite numeric streams.

The source/release layer additionally pins the exact approved pack identity and file hashes. When JSPREV2 is preserved into Owner Preview as a static artifact layer, the Preview composition must pin an exact artifact commit and validate the runtime files against the approved release receipt before deploy.

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

Telemetry is diagnostic evidence, not a substitute for Owner-visible/browser validation.

## 7. Mobile compositor boundary

On coarse-pointer/mobile layouts, live backdrop blur and heavy shadow effects over the continuously changing WebGL surface are deliberately reduced. This is a presentation/compositor policy; it does not change simulation, scan geometry or render scale.

Responsive UI/camera behavior may continue to evolve independently from vehicle mechanics.

## 8. Vehicle/physics boundary

The current browser vehicle uses pinned `box3d.js@0.0.2` and the existing M6 Web implementation.

The coherent-front driving bridge is a useful product intermediate, not final rig/steering/handling architecture. Historical M5/M6 values, calibration outputs and convenience tests are evidence only for the claims they directly prove.

Current procedural `m6WishboneHardpoints(...)`, source-registration repairs and rack/steering bridges are consumer runtime geometry. Their existence in production source does not make them authored neutral rig truth.

Physics performance work must not silently reduce fixed-step rate, solver/substeps, collision semantics or vehicle complexity.

## 9. Owner vehicle visual boundary

Owner source meshes/contracts generate the browser visual package deterministically. Visual calibration must not silently retune physics, and physics convenience must not redefine authored asset semantics.

Visual representation and authored mechanical truth are separate. A visual package may continue to render against provisional runtime mechanics until an explicit coherent authored rig replacement is validated.

## 10. JURE authoring and consumer boundary

JURE is the intended owner-facing authoring system for rig elements, frames, provenance, neutral mechanical relations and representation intent. JV Web is a consumer/falsifier of those authored outputs.

Authority split:

```text
JURE
  authored neutral elements / frames / relations / representation intent
  source provenance and deterministic consumer-facing authored data

JV Web
  strict consumer parsing and placement validation
  Box3D/runtime identities and topology
  masses / inertia / damping / motors / force laws / solver/runtime policy
  controls, rendering integration, telemetry and release behavior
```

JURE must not absorb Box3D/native consumer dynamics merely to make JV-Web integration convenient. JV-Web must not invent authored hardpoints/frames merely to make current visuals fit.

### 10.1 Coherent replacement rule

Cross-project evidence has already falsified a dangerous shortcut: the current procedural M6 wishbone and the exact/JURE-authored wishbone are not rigid-congruent. Therefore a consumer experiment must not replace one JURE hardpoint or relation while silently retaining an incompatible procedural shape around it.

A JURE-authored neutral mechanism replaces a **coherent mechanical unit**. The exact minimum unit is not hard-coded here while JURE is still proving its multi-relation export shape.

### 10.2 Future consumer seam

The first real JURE -> JV-Web integration is data-first and isolated from accepted product/release state:

```text
frozen/versioned JURE consumer fragment
-> exact fixture/source identity
-> strict independent parse
-> version / units / basis / provenance checks
-> explicit placement/transform validation
-> neutral geometry coherence checks
-> dry mapping into a consumer-neutral intermediate
-> only then isolated Box3D/runtime substitution experiment
```

Do not assume identity placement. Do not guess unit conversion, handedness, basis or frame meaning from screenshots/names. Fail closed when data is ambiguous or incomplete.

Create the first consumer experiment on `jure/<specific-purpose>`, and keep accepted `main`, Owner Preview pointer and accepted Friends artifact unchanged in that first slice unless later evidence explicitly expands the scope.

### 10.3 Schema timing

This repository intentionally does **not** freeze a concrete JURE JSON schema yet. JURE is currently proving Owner-operability of a coherent double-wishbone neutral shape and the eventual multi-relation consumer fragment. Freezing the parser before that boundary is stable would turn a current experiment into permanent coupling.

The durable requirements live in `docs/contracts/JURE_CONSUMER_BOUNDARY.md`. The concrete executable schema should be added only when an exact JURE fragment is frozen and independently validated by the consumer.

## 11. Experience, camera and input boundary

Manual camera calibration is user-owned presentation state. Automatic driving assists may derive additive camera response, but must not silently rewrite the user's manual orbit, pan, distance or saved calibration. Reset may intentionally return to the current viewport default; future presets should persist explicit user settings rather than transient assist state.

Camera gesture ownership stays in the renderer/UI path. Terrain/obstacle camera avoidance requires an explicit environment-query/probe boundary; do not infer authoritative collision or ground state from visual data just to make a camera effect work.

Vehicle controls stay on the timestamped product-input path. Device-specific controls must not call M6 physics directly. Current analog steering uses the existing `RELEASE` / `RATE` / `POSITION` command model, and analog throttle/brake use the normalized longitudinal path. Steering and longitudinal source ownership remain independent so simultaneous controls can coexist. Future input experiments should extend these boundaries rather than bypass them.

Immersive/fullscreen behavior, HUD composition and user settings are presentation/capability layers. They may change how JV is operated or displayed without becoming vehicle-mechanics authority.

## 12. Source, Owner Preview and Friends artifact boundary

```text
Jozzpoly/JV-Box3D-Web-experiment
  public source / development / accepted main

preview/owner-control
  operational exact-executable + approved-static-layer composition pointer
  Owner Preview Pages workflow
  R&D/testing surface, not source or release acceptance authority

Jozzpoly/JV-Box3D-Web-Public
  accepted Friends artifacts / release main
  artifact authority, not source authority
```

Product changes originate in normal typed source. Owner Preview deploys an exact committed executable source candidate for rapid device/R&D evidence and may compose explicitly approved immutable static layers whose repository/commit/receipt provenance is pinned separately. A successful Preview does not itself grant product or release acceptance, and a preserved static layer does not become source authority.

Current Preview V2 uses this model to preserve the approved JSPREV2 scan from exact Friends/Public anchor `a325c279cfe63a0607dba33c3c635a1716e09f8f` while the executable remains the active steering candidate. The composition records executable and static provenance separately and validates scan bytes before deploy.

Accepted Friends publication remains a separate artifact/release step from accepted source.

Historical `release/*` branch names, when present in older history or documentation, are archaeology rather than current release authority. Current rollback and provenance use exact commits and live authority documented in `docs/PROJECT_STATE.md` / `docs/HANDOFF.md`.

A code-only Friends release may carry forward the exact already-published scan; a scan-changing release must explicitly pin and validate the new approved scan input.

## 13. Architecture principles

- Owner-visible behavior and exact source/runtime evidence outrank historical naming;
- source, Owner Preview deployment, accepted Friends artifact, authored data, visual representation and physics are separate layers;
- Owner Preview preserves accepted capabilities unrelated to the active experiment unless an omission is explicit and scoped;
- preserved Preview static data has separate exact provenance and never becomes executable/source authority;
- JURE authors neutral rig truth; JV Web consumes it and owns runtime dynamics;
- do not create partial hybrids between incompatible authored and procedural mechanism geometry;
- tests protect real invariants, not provisional equations or incidental counts;
- simple product bridges may exist, but stay labeled temporary;
- measure before adding scaling architecture;
- documentation describes current truth; Git preserves expeditions and superseded designs.
