# JV Web — architecture

Updated: 2026-08-22
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

The source product supports Plac E2R, Offroad and the approved JSPREV2 scan. Owner Preview should preserve accepted capabilities unrelated to the active experiment. Heavy approved static data may be composed into Preview as an exact pinned artifact layer with explicit provenance instead of being copied into product source. A deliberate capability omission is an explicit scoped Preview gap recorded in `docs/PROJECT_STATE.md`, not the default delivery model.

## 2. World boundary

World data is independent from the vehicle runtime.

- Plac E2R / Offroad are built product-world inputs.
- JSPREV2 is an external scan package decoded into the `JvWorldData` scan contract.
- Product selection changes world/spawn behavior without redefining vehicle mechanics.
- Render and collision representations are semantically separate even when derived from the same scan source.

## 3. JSPREV2 transport and integrity

Public scan assets resolve relative to `document.baseURI`, so the same build works under a GitHub Pages project path when the scan payload is included.

Compressed HTTP `Content-Length` is not logical scan-file integrity. Runtime validates decoded payload/format: byte length, magic/version/tile/group descriptors, counts/triangle relationships, index range and finite numeric streams.

The source/release layer additionally pins exact approved pack identity and file hashes. When JSPREV2 is preserved into Owner Preview as a static artifact layer, Preview composition must pin an exact artifact commit and validate runtime files against the approved release receipt before deploy.

## 4. Scan decode and loading

Current scan loading uses normal browser caching and a bounded two-tile fetch/parse pipeline while preserving deterministic final tile order.

Finite validation and required group bounds are produced during parser work rather than by later full geometry rescans. Current collision representation remains a merged mesh from scan geometry.

All current scan render groups are installed at world creation. This is not streaming or world partitioning.

## 5. Scan rendering

The renderer remains WebGL1-compatible.

Index upload policy:

- use source Uint32 indices when `OES_element_index_uint` is available;
- otherwise use direct Uint16 where safe;
- larger groups retain the safe Uint16 chunk fallback.

Each scan group has bounds for conservative frustum culling. Shared scan matrices/pass-level WebGL state are reused across visible groups while per-group texture/color/buffer state stays explicit.

Textures are ordinary browser image textures. There is no geometric LOD, texture streaming/residency system or world partitioning. Those are future scaling tools, not current Friends requirements.

## 6. Frame/runtime boundary

Physics keeps a fixed 60 Hz step. Browser presentation is decoupled from fixed-step catch-up: one browser frame may execute multiple required simulation steps but presents at most once using final state.

Rich M6 trace/visual materialization is deferred to the final presented catch-up state rather than repeated for intermediate steps.

Telemetry distinguishes browser cadence, scene presentation, simulation steps, physics/trace/render/UI time and startup loading/setup phases. Telemetry is diagnostic evidence, not a substitute for Owner-visible/browser validation.

## 7. Mobile compositor boundary

On coarse-pointer/mobile layouts, live backdrop blur and heavy shadow effects over continuously changing WebGL are deliberately reduced. This is presentation/compositor policy; it does not change simulation, scan geometry or render scale.

Responsive UI/camera behavior may evolve independently from vehicle mechanics.

## 8. Vehicle/physics boundary

The current browser vehicle uses pinned `box3d.js@0.0.2` and the existing M6 Web implementation.

The coherent-front driving bridge is a useful product intermediate, not final rig/steering/handling architecture. Historical M5/M6 values, calibration outputs and convenience tests are evidence only for claims they directly prove.

Current procedural hardpoints, source-registration repairs and rack/steering bridges are consumer runtime geometry. Their existence in production source does not make them authored neutral rig truth.

Physics performance work must not silently reduce fixed-step rate, solver/substeps, collision semantics or vehicle complexity.

## 9. Owner vehicle visual boundary

Owner source meshes/contracts generate the browser visual package deterministically. Visual calibration must not silently retune physics, and physics convenience must not redefine authored asset semantics.

Visual representation and authored mechanical truth are separate. A visual package may render against provisional runtime mechanics until an explicit coherent authored rig replacement is validated.

## 10. JURE authoring and consumer boundary

JURE is the intended Owner-facing authoring system for rig elements, frames, provenance, neutral mechanical relations and representation intent. JV Web is a consumer/falsifier of those authored outputs.

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

Cross-project evidence has falsified a dangerous shortcut: the current procedural M6 wishbone and exact/JURE-authored wishbone are not rigid-congruent. A consumer experiment must not replace one authored hardpoint/relation while silently retaining incompatible procedural shape around it.

A JURE-authored neutral mechanism replaces a coherent mechanical unit. The exact minimum unit is intentionally not frozen while JURE still proves its multi-relation export shape.

### 10.2 Future consumer seam

First real JURE -> JV-Web integration is data-first and isolated:

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

Do not assume identity placement or guess unit conversion, handedness, basis or frame meaning. Fail closed when data is ambiguous or incomplete. Use `jure/<specific-purpose>` for the first isolated consumer experiment.

### 10.3 Schema timing

This repository intentionally does not freeze a concrete JURE JSON schema yet. Durable requirements live in `docs/contracts/JURE_CONSUMER_BOUNDARY.md`; an executable schema belongs only after an exact JURE fragment is frozen and independently validated by the consumer.

## 11. Experience, camera and input boundary

Manual camera calibration is user-owned presentation state. Automatic driving assists may derive additive camera response but must not silently rewrite manual orbit, pan, distance or saved calibration.

Camera gesture ownership stays in the renderer/UI path. Terrain/obstacle camera avoidance requires an explicit environment-query/probe boundary; do not infer authoritative collision/ground state from visual data merely to make a camera effect work.

Vehicle controls stay on the timestamped product-input path. Device-specific controls must not call M6 physics directly.

Current steering source foundation exposes two Owner-facing interaction models — `DIRECT_ROTATION` and `RELATIVE_X` — that both emit through the normalized steering `POSITION` path. `X_POSITION` remains internal regression/reference only. Steering and longitudinal source ownership remain independent so simultaneous steering/pedal controls coexist. Final gesture tuning is presentation/input work and must not be conflated with steering physics.

Current analog throttle/brake uses the normalized longitudinal path. Future pedal experiments should extend this boundary rather than bypass it.

Immersive/fullscreen behavior, HUD composition and user settings are presentation/capability layers and do not become vehicle-mechanics authority.

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

Product changes originate in normal typed source. Owner Preview deploys one exact committed executable source for rapid device/R&D evidence and may compose explicitly approved immutable static layers whose repository/commit/receipt provenance is pinned separately. A successful Preview does not itself grant product or release acceptance, and preserved static data does not become source authority.

Preview V2 currently preserves the approved JSPREV2 scan from exact Friends/Public anchor `a325c279cfe63a0607dba33c3c635a1716e09f8f` while executable identity is independently pinned by `preview/owner.json`. After the 2026-08-22 steering integration close, the executable may point directly at accepted source `main` or a later scoped experiment; it is no longer conceptually tied to a special steering candidate.

Accepted Friends publication is a separate artifact/release step from accepted source. The current Friends artifact still uses the older `cd7f5f89...` executable basis and has not yet been promoted from the dual-mode steering source foundation.

A code-only Friends release may carry forward the exact already-published scan; a scan-changing release must explicitly pin and validate the new approved scan input.

Historical release/work/checkpoint branch names are archaeology rather than authority. Current rollback/provenance uses exact commits and live authority documented in `docs/PROJECT_STATE.md` / `docs/HANDOFF.md`.

## 13. Architecture principles

- Owner-visible behavior and exact source/runtime evidence outrank historical naming;
- source, Owner Preview deployment, accepted Friends artifact, authored data, visual representation and physics are separate layers;
- Owner Preview preserves accepted capabilities unrelated to the active experiment unless omission is explicit/scoped;
- preserved Preview static data has separate exact provenance and never becomes executable/source authority;
- source acceptance does not automatically imply Friends/Public promotion;
- JURE authors neutral rig truth; JV Web consumes it and owns runtime dynamics;
- do not create partial hybrids between incompatible authored and procedural mechanism geometry;
- tests protect real invariants, not provisional equations or incidental counts;
- simple product bridges may exist but stay labeled temporary;
- measure before adding scaling architecture;
- documentation describes current truth; Git preserves expeditions and superseded designs.
