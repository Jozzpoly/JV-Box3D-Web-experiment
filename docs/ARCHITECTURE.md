# JV Web — architecture

Updated: 2026-08-26
Status: `CURRENT STABLE BOUNDARIES / FUTURE ARCHITECTURE NOT FROZEN`

This document describes boundaries that are useful and currently stable. It is not a roadmap and does not freeze the next-generation runtime, renderer, authoring application, schema or vehicle ontology.

## 1. Product entry

```text
index.html
-> src/product-main.ts
-> product world selection / product controls
-> runtime host + current M6 product renderer
-> world renderer + owner vehicle layer
```

The current product supports Plac E2R, Offroad and approved JSPREV2. Owner Preview should preserve accepted capabilities unrelated to the active experiment unless an omission is deliberate, explicit and scoped.

## 2. World boundary

World data is independent from vehicle runtime semantics.

- Plac E2R / Offroad are built product-world inputs.
- JSPREV2 is an external scan package decoded into the current `JvWorldData` scan contract.
- Product world selection changes world/spawn behavior without redefining vehicle mechanics.
- Render and collision representations are semantically separate even when derived from the same scan source.

Current scan loading/rendering is not proof of final large-world architecture. There is no current geometric LOD, streaming/residency system or world partitioning. Those remain future evidence-driven questions.

## 3. Runtime/frame boundary

Current physics uses a fixed 60 Hz simulation step. Browser presentation is decoupled from catch-up: one browser frame may execute multiple simulation steps but presents at most once using final state.

Telemetry separates browser cadence, presentation, simulation steps and major cost surfaces. Telemetry is diagnostic evidence, not Owner acceptance.

Physics-performance work must not silently reduce simulation quality or semantics merely to improve presentation metrics.

## 4. Product input boundary

Device-specific controls emit through product input paths; they do not call current vehicle physics directly.

Current steering interaction exposes `DIRECT_ROTATION` and `RELATIVE_X`, both feeding normalized steering position semantics. Longitudinal controls use the normalized analog path. Steering and throttle/brake ownership remain independent so simultaneous input works.

These interaction behaviors are protected product capital. Their current internal implementation is not declared permanent architecture.

## 5. Current vehicle/runtime boundary

The current browser vehicle uses pinned `box3d.js@0.0.2` and a TypeScript M6 implementation.

Important authority rule:

`working current vehicle != final vehicle-physics architecture`.

Current recipient challenge surfaces include:

- `legacy_ts_m6` reference backend with product physics authority explicitly false;
- Native/Web drivetrain semantic mismatch;
- procedural/general wishbone hardpoints;
- provisional front-left source-registered steering geometry;
- temporary front-right symmetric steering bridge;
- provisional rack/full-lock mapping;
- `legacy_m6_split_sphere_sidewall` contact representation.

These may be replaced deliberately after a next-generation falsifier is selected. They are not an automatic cleanup queue.

## 6. Authored neutral truth vs runtime representation

High-confidence cross-project constraint:

**authored/neutral mechanical truth and runtime representation are separate layers**.

Portable authored truth may include:

- element/role identity;
- owner-local frames;
- relation endpoints and semantics;
- neutral geometry;
- source/provenance;
- representation intent when explicitly authored.

Runtime owns decisions such as:

- Box3D/body/joint identity;
- mass/inertia/collision policy;
- contact/tire model;
- damping/springs/motors/force laws;
- solver/runtime state;
- controls and telemetry;
- browser rendering integration.

A one-to-one authored-element -> runtime-body mapping is **not** assumed.

A coherent mechanical unit must not mix mutually incompatible geometry authorities. Cross-project evidence already falsified the shortcut of replacing one authored hardpoint while retaining incompatible procedural companion geometry.

## 7. Mechanical relation boundary

Current high-confidence constraints include:

- real front roles: chassis / upper arm / lower arm / knuckle-upright / wheel plus rack-knuckle steering relation;
- no additional physical carrier body should be invented merely because an authoring representation uses `carrier` terminology;
- relation endpoints have independent owner-local frame truth;
- exact outboard physical mating remains Owner-open until explicitly judged;
- stale visual parenting or common surrogate ownership is not mechanical authority.

`Front Mechanical Unit 01` is a leading future falsifier candidate, **not a selected implementation stage**.

## 8. JURE / authoring boundary

JURE is the current strongest optional donor/tool for provenance-backed neutral rig authoring, inspection and correction. It has demonstrated useful capabilities: owner-local frames, neutral revolute/spherical relations, deterministic Save/Open/relink, diagnostics, correction and Undo/Redo.

This evidence does **not** freeze:

- JURE as the permanent/final authoring application;
- JURE `RigDocument` as a JV-Web runtime/consumer schema;
- a JURE-specific product dependency;
- the future lowering/consumer architecture.

Any future authoring source used by JV-Web must preserve the proven authority principles: explicit provenance, deterministic identity, explicit units/basis, owner-local relation truth, no hidden coordinate guessing and separation from runtime dynamics.

`docs/contracts/JURE_CONSUMER_BOUNDARY.md` records these durable constraints while keeping tool/schema choice open.

## 9. Current neutral comparison seam

JV `main` contains a small engine-neutral representation used to project/compare current Web geometry and produce deterministic diagnostic receipts.

It is useful as:

- a comparison seam;
- an evidence/diagnostic surface;
- a way to keep Box3D/runtime policy out of neutral geometry checks.

It is **not** authority for the future serialized schema or proof of final lowering architecture.

Do not expand it speculatively. Extend or replace only when a selected real fragment demonstrates missing information.

## 10. Owner vehicle visual boundary

Owner source meshes/contracts generate the current browser visual package deterministically.

`VehicleVisualFrameV1` and current binding primitives provide useful separation between live runtime motion and rendering/binding. R3 proves that many moving real roots can follow current runtime state.

But:

`visual calibration != mechanical authority`.

A future mechanical rewrite may preserve useful binding techniques while replacing current calibration, mappings or runtime source geometry.

## 11. Renderer boundary

The current renderer is a functioning Web product implementation and a useful performance/compatibility baseline. It is not frozen as next-generation renderer architecture.

Renderer changes must be justified by product/evidence needs, not by architectural fashion. Large-world pressure may later challenge current loading/rendering assumptions, but current car work must not build speculative world infrastructure first.

## 12. Camera/UI capability boundary

Manual camera calibration is user-owned presentation state. Automatic camera effects may be additive but must not silently overwrite manual orbit/pan/distance calibration.

Responsive UI/camera presentation may evolve independently from vehicle mechanics. UI polish is not permission to change drivetrain, rig, physics or input semantics.

## 13. Source / Preview / Friends boundary

```text
JV-Web source main
  accepted source/product authority

preview/owner-control
  operational exact-executable + approved-static-layer pointer
  R&D/device evidence surface

JV-Box3D-Web-Public/main
  accepted Friends artifact authority
```

Preview does not grant source/release acceptance. Preserved static layers keep separate exact provenance. Friends promotion is a separate decision from source acceptance.

## 14. Next-generation architecture timing

Current pre-Codex work is not an architecture freeze.

Before selecting fundamental implementation:

1. finish JV-Web Technology-Capital / Recipient Map V2;
2. preserve Owner Truth + Negative Knowledge;
3. pressure-test inheritance against broader machine/world ambitions;
4. update the inheritance matrix;
5. generate competing architecture hypotheses;
6. select the first falsifier by information gain + product value.

A JURE -> Web lowering/schema choice belongs to that later design challenge. Pre-Codex preparation freezes evidence, constraints, provenance and unknowns, not a premature consumer architecture.

## 15. Architecture principles

- live source/evidence/Owner judgement outrank names and historical labels;
- protected product behavior and permanent implementation architecture are different concepts;
- source, Preview, Friends artifact, authored truth, visual representation and runtime physics remain separate authority layers;
- relation-local authored truth must not be replaced by convenience parenting;
- do not build partial hybrids from incompatible geometry authorities;
- do not make JURE or another tool mandatory without demonstrated need;
- do not design a universal vehicle/machine platform before real second cases justify generalization;
- tests protect real invariants; provisional equations/bridges may be intentionally replaced by stronger evidence;
- measure before adding scaling architecture;
- documentation describes current truth; Git preserves historical expeditions.
