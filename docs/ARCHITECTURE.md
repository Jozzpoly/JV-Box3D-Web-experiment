# JV Web — architecture

Updated: 2026-08-14
Status: `FRIENDS R1 CURRENT BOUNDARIES`

This document describes stable boundaries, not a roadmap and not a mechanical-history archive.

## 1. Product entry

```text
index.html
-> src/product-main.ts
-> product world selection / product controls
-> runtime host + M6 product renderer
-> world renderer + owner vehicle layer
```

The browser product exposes three current start surfaces: Plac E2R, Offroad and the approved JSPREV2 scan.

## 2. World boundary

World data is independent from the vehicle runtime.

- Plac E2R / Offroad are built product world inputs.
- JSPREV2 is an external scan package converted to the `JvWorldData` scan contract.
- Product selection changes spawn/world behavior without redefining vehicle mechanics.

The public Friends scan is a supported release input, not private dev-only functionality.

## 3. JSPREV2 transport and integrity

Public scan assets resolve relative to `document.baseURI` so the same build works under the GitHub Pages project path.

The browser may receive compressed HTTP representations. Therefore transport `Content-Length` is not logical scan-file integrity.

Runtime integrity is checked on the decoded body and format:

- actual `ArrayBuffer.byteLength` must match the indexed logical bytes;
- JSPREV2 magic/version/tile id/group descriptors must match;
- vertex/index counts and triangle relationships must agree;
- indices must remain inside their vertex streams;
- numeric streams must remain finite.

The source/release layer additionally pins the exact approved pack identity and file hashes.

## 4. Scan rendering boundary

The current world renderer is WebGL1-compatible. Large indexed meshes are split to `Uint16` chunks before GPU upload.

Current Friends behavior is intentionally simple:

- all scan render groups are uploaded when the world renderer is created;
- all scan groups are drawn every frame;
- textures are ordinary RGBA image textures with nearest/linear filtering;
- no scan frustum/tile culling, mipmap pipeline, texture compression, streaming or geometric LOD is implemented yet.

This simplicity is accepted for the first Friends baseline. Future optimization should measure CPU/GPU/memory costs first and preserve desktop quality while improving phone behavior.

## 5. Scan collision boundary

The JSPREV2 loader exposes render groups and a collision representation separately. The current loader builds a merged collision mesh after parsing the groups.

Render and collision are semantically distinct even when derived from the same source. Future optimization may change representation/storage, but must not silently change driveable geometry without an explicit product/owner gate.

## 6. Vehicle/physics boundary

The current browser vehicle uses `box3d.js@0.0.2` and the existing M6 Web implementation.

The current coherent-front driving bridge is a product baseline, not final vehicle architecture. It intentionally leaves final steering feedback/back-drive and rig geometry open.

Historical M5/M6 values, secondary contracts, generated calibration and test expectations are evidence only for the exact claims they prove. They do not become whole-vehicle authority.

## 7. Owner vehicle visual boundary

Owner source meshes/contracts generate the current browser visual package. Visual package generation remains deterministic.

Current public/owner visual identity:

```text
real bindings: 59
GLB bytes: 829936
SHA-256: 1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc
```

Visual calibration must not silently retune physics. Likewise physics convenience must not redefine authored asset semantics.

## 8. JURE authoring boundary

JURE is the intended owner-facing authoring system for rig elements, frames, mating points and later broader JV/VAW authoring needs.

JV Web should eventually consume explicit JURE-authored outputs through a small adapter/contract. It should not maintain a parallel rig editor or keep fixing uncertain mating with ad-hoc offsets.

Until that integration exists, unresolved lower wishbone/mating and final spatial steering geometry remain explicit debt.

## 9. Camera/input boundary

Camera state/input belongs to the renderer/UI path; vehicle drive/steer/brake input belongs to the vehicle/product input path. They must not steal gesture/key ownership from each other.

Current desktop camera is usable. Phone portrait/landscape framing is known product UX debt and may be changed without redefining vehicle mechanics.

## 10. Private source vs public artifact

```text
Jozzpoly/JV-Box3D-Web-experiment
  source / development / accepted private main

Jozzpoly/JV-Box3D-Web-Public
  generated public artifacts / Pages
```

`release/r0` stays immutable. `release/friends-r1` is the live Friends line.

A code-only Friends hotfix may carry forward the exact already-published scan. A scan-changing release must explicitly pin the new approved scan input and reproduce the public artifact.

## 11. Architecture principles

- owner-visible behavior and exact source/runtime evidence outrank historical naming;
- source, authored data, visual representation, physics and release artifact are separate layers;
- JURE authors rig truth; JV Web consumes it later;
- tests protect real invariants, not provisional equations or incidental counts;
- simple product bridges may exist, but stay labeled temporary;
- measure performance before adding architecture;
- documentation describes current truth rather than preserving every expedition.
