# JV Web — current architecture boundaries

Updated: 2026-08-26
Status: `CURRENT SYSTEM DESCRIPTION / FUTURE REPO + ARCHITECTURE OPEN`

This document describes useful facts and boundaries of the **current JV-Web implementation**. It is not a roadmap and does not select whether the next JV generation should continue this repository, radically rebuild it, use it as donor/control, or start clean elsewhere.

Current strategic routing lives in `docs/PROJECT_STATE.md`.

## 1. Product entry

```text
index.html
-> src/product-main.ts
-> product world selection / controls
-> runtime host + current M6 vehicle
-> current renderer / owner visual layer
```

The current product supports Plac E2R, Offroad and approved JSPREV2 plus accepted desktop/mobile interaction foundations.

These are real product/reference capabilities. They are not proof that the current implementation structure should be inherited unchanged.

## 2. World boundary

Current world/content data is conceptually separate from vehicle-mechanics semantics.

- Plac E2R / Offroad are built product-world inputs.
- JSPREV2 is decoded into the current world/scan contract.
- render and collision representations are semantically distinct even when derived from the same source.

Current scan loading/rendering is not proof of final large-world architecture. Streaming, partitioning and future world-authoring remain open.

## 3. Runtime/frame boundary

The current product uses a fixed-step simulation model with browser presentation separated from catch-up simulation. Telemetry distinguishes browser cadence, simulation work and presentation.

This separation is useful demonstrated technique. Exact classes, constants and host architecture remain challengeable.

## 4. Product input boundary

Device-specific controls feed normalized product input paths rather than directly owning current physics.

Demonstrated/reference behaviors include:

- Direct Rotation and Relative-X steering foundations;
- absolute-position analog pedals;
- independent throttle/brake ownership;
- steering + pedal multitouch;
- D/R pointer lifecycle;
- fail-closed input/lifecycle handling.

Future work may preserve, reimplement or deliberately supersede these semantics. Historical acceptance is evidence, not an architecture lock.

## 5. Current vehicle/runtime boundary

The current browser vehicle uses pinned `box3d.js@0.0.2` and TypeScript M6 code.

Important current fact:

`working current vehicle != final vehicle-physics architecture`.

Known challenge/reference surfaces include:

- `legacy_ts_m6` reference backend with product-physics authority false;
- Native/Web drivetrain semantic mismatch;
- procedural/general wishbone hardpoints;
- provisional front-left source-registered steering representation and current extra FL carrier bridge;
- temporary front-right symmetric steering bridge;
- provisional rack/full-lock mapping;
- `legacy_m6_split_sphere_sidewall` contact representation;
- M6-specific product/runtime coupling rather than a proven interchangeable backend.

These facts do not imply an in-place repair queue. A strategic review may recommend preserving, replacing or abandoning this implementation boundary.

## 6. Authored truth vs runtime representation

Prior cross-project evidence strongly supports keeping authored/neutral mechanical truth conceptually separate from runtime representation/dynamics.

Portable authored truth may include:

- element/role identity;
- owner-local frames;
- relation endpoints and semantics;
- neutral geometry;
- source/provenance.

Runtime owns choices such as:

- body/joint/collider identity;
- mass/inertia/collision policy;
- contact/tire model;
- motors/forces/damping;
- solver state;
- controls/telemetry/render integration.

A one-to-one authored-element -> runtime-body/collider mapping is **not** assumed.

A claimed coherent mechanism should not mix mutually incompatible geometry authorities merely for convenience.

These are evidence-backed constraints, not a commitment to JURE, the current neutral type, a particular runtime, or a particular repository.

## 7. Mechanical relation evidence

High-confidence prior evidence includes:

- distinct M6 roles for chassis / upper arm / lower arm / knuckle-upright / wheel plus steering relation;
- relation endpoints may require independent owner-local frame truth;
- authoring terminology such as `carrier` does not justify inventing an additional physical M6 body;
- exact outboard physical mating remains Owner-open;
- visual convenience ownership/calibration is not mechanical authority.

The earlier `FRONT-CORNER-AUTHORITY-ISOLATION-01` selection is preserved in `docs/FIRST_FALSIFIER.md` as **prior orchestrator analysis**. Under the current strategic reset it is not a binding first implementation stage.

## 8. JURE / authoring boundary

JURE is a useful optional donor/tool for provenance-backed neutral authoring, inspection and correction. It demonstrated owner-local frames, neutral relations, deterministic persistence/relink and safe-inspection behavior.

That evidence does not freeze:

- JURE as the final authoring application;
- JURE `RigDocument` as a JV runtime schema;
- a JURE-specific dependency;
- the future lowering/consumer architecture.

Equivalent future authored truth may come from another explicit provenance-backed producer.

## 9. Neutral comparison seam

The current repo contains a small consumer-side neutral representation useful for comparison/diagnostics.

It is not authority for a future serialized schema, future authoring application or final lowering architecture. Do not expand it speculatively.

## 10. Visual boundary

Current owner-source meshes/contracts and `VehicleVisualFrameV1`-style binding provide useful evidence that many moving real roots can follow runtime state.

But:

`visual calibration != mechanical authority`.

A future strategy may preserve the binding technique while replacing calibration, mappings, renderer or the entire runtime representation.

## 11. Renderer / camera / UI

The current renderer is a functioning Web implementation and useful compatibility/performance reference, not a next-generation architecture requirement.

Camera Manual Rig V1, Fullscreen V1 and accepted responsive/mobile UI behavior are proven product/reference capital. UI work does not silently authorize physics changes, and physics redesign does not require preserving every current UI implementation detail.

## 12. Source / Preview / Friends boundary

```text
JV-Web source main
  current source/product authority

preview/owner-control
  operational exact-executable + approved-static-layer pointer

JV-Box3D-Web-Public/main
  accepted Friends artifact authority
```

Preview does not grant source/release acceptance. Friends promotion is separate from source acceptance.

## 13. Strategic openness

The next Codex phase is a read-only strategic cold takeover.

The following remain open until that review is accepted:

- continue/polish current repo vs radical rebuild vs clean start/new repo;
- future vehicle authority/runtime technology;
- migration strategy and first falsifier;
- final tire/contact, steering-return and drivetrain architecture;
- final rig/mating/ontology/granularity;
- JURE/other authoring tool and lowering/schema;
- renderer and large-world architecture;
- one app vs cooperating tools;
- broader machine/flight architecture.

Prior A1/A2/M1/C0 and first-falsifier work should be read later as challengeable analysis, not as an exhaustive menu or current command.

## 14. Architecture discipline

- live source/evidence/Owner judgement outrank historical labels;
- current product value and permanent implementation architecture are different questions;
- replacing proven behavior deliberately is allowed; pretending no evidence existed is not;
- donors are evidence sources, not automatic foundations;
- do not create a universal platform, generic framework or new repository before a real strategic decision earns it;
- tests protect demonstrated invariants, not every provisional bridge forever;
- tooling/environment failure is not automatically product/architecture failure;
- documentation describes the current state; Git preserves historical expeditions.
