# Owner vehicle visual R1 — source ingestion boundary

Status: **IMPORTER IMPLEMENTED / SYNTHETIC GATE 9/9 PASS / REAL OWNER SOURCE RUN PENDING / RUNTIME ACTIVATION NOT AUTHORIZED**

## Base and scope

- base product: `product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580`;
- candidate: `candidate/jv-web-owner-vehicle-visual-r1`;
- native source authority: `Jozzpoly/Box3d_FunProject@33722127777248b3dcb228fb47f7de2fad847036`;
- historical visual calibration authority: `891c7561142b601f62ea76b68b0f55f8fababc6c`;
- chassis source Git blob: `a25cb0ef61d342ce476c9ef26a3b24188bace047`;
- wheel source Git blob: `c13c77a8e5552175ee8266b2da33a54691f1dae9`;
- physical-dimension receipt Git blob: `6a5cb337a7d4707946835e83e036365130c52459`;
- exact R1 inputs: `assets/source/Nadwozie.gltf` and `assets/source/Offroad_Big_Wheels.gltf`;
- physics, collision, steering, drive, world rendering and teleport behaviour are out of scope.

## Why conversion is required

The Blockbench exports are glTF 2.0 documents with an embedded binary buffer,
skinning attributes and embedded texture data. The current browser vehicle
contract intentionally accepts only rigid, byte-pinned GLB assets. The source
files therefore cannot be connected by weakening the runtime gate.

R1 converts only an explicitly verified authored bind pose into the existing
rigid GLB boundary. Before flattening any skinned mesh it proves:

```text
jointWorld × inverseBindMatrix ≈ meshWorld
```

for every declared joint. It also validates joint indices, normalized weight
sums, accessor counts and the exact pairing of `JOINTS_0` with `WEIGHTS_0`.
Skinning is never silently ignored.

The conversion preserves:

- the historically owner-tested chassis correction: scale `0.35`, yaw `-90°`
  around Y and vertical offset `-0.60 m`;
- the physical wheel marker contract recovered from the historical renderer;
- current receipt dimensions: radius `0.514062464 m`, width `0.4375 m`;
- active-scene node transforms;
- triangle geometry and Uint16-safe indices;
- normals and UV coordinates;
- material base-colour factors and double-sided flags;
- the real owner chassis mesh;
- one real owner wheel source mesh reused by all four physical wheel channels.

The source texture is detected and reported, but is not claimed as rendered.
Vehicle texture decoding, GPU ownership and sampling remain a separate boundary.

## Fail-closed rules

The importer rejects:

- any exporter other than the exact supported Blockbench 5.1.4 glTF exporter;
- external or multiple binary buffers;
- multiple scenes, inactive nodes, cycles and multiple parents;
- animations, cameras, extensions, morph targets and mesh weights;
- `matrix` combined with TRS;
- sparse, misaligned or out-of-range accessors;
- attributes outside `POSITION`, `NORMAL`, `TEXCOORD_0`, `JOINTS_0`,
  `WEIGHTS_0`;
- missing normals or UV coordinates;
- non-triangle primitives and index counts not divisible by three;
- missing or duplicated wheel centre/radius/width/socket markers;
- wheel centre, mount-axis or requested-dimension drift above `1e-5 m`;
- missing, duplicate or out-of-scene skin joints;
- inverse-bind count drift and bind-pose drift;
- malformed skin weights and joint references;
- non-finite transforms, singular normal matrices and geometry outside the
  mobile Uint16 boundary.

## R1 output

The explicit command is intentionally not part of `dev`, `build` or the portable
package:

```powershell
npm run generate:owner-vehicle-r1 -- --source-root <exact assets/source path>
```

It writes under `public/vehicles/m6-owner-r1/`:

- `models/m6-owner-rigid-r1.glb`;
- `m6-owner-rigid-r1.visual.json`;
- `m6-owner-rigid-r1.report.json`.

The visual package covers the complete existing `M6_FULL_RIG_V1` contract.
Five channels use real owner geometry: chassis and four wheels. The remaining
21 suspension, rack and segment channels deliberately retain small diagnostic
geometry until their source mapping is implemented and reviewed.

## Evidence boundary

Current demonstrated evidence:

- Node syntax gate: PASS;
- deterministic synthetic importer tests: 9/9 PASS;
- complete 26-binding output on synthetic skinned sources: PASS;
- malformed bind pose, skin count, animation, attribute and topology rejection:
  PASS.

Not yet demonstrated:

- execution against the exact two owner source files;
- generated GLB/package validation through the repository's existing full gate;
- scale, axes, origin and wheel-orientation correctness in the browser;
- vehicle texture rendering;
- replacement of the current debug renderer.

## Acceptance ladder

1. exact local run against the two owner source files;
2. output validation through existing GLB/package/CPU/GPU gates;
3. one renderer integration on the candidate only;
4. owner visual review of axes, scale, offsets, wheel orientation and motion;
5. texture ownership and rendering;
6. real suspension, steering links and Cardan assets;
7. removal or optionalization of the remaining debug geometry;
8. owner promotion decision.

The accepted product checkpoint remains `c8e0bf24748b0a790a1c0039b1be801eef266580`.
No merge, Ready transition or product-branch replacement is authorized by this
document.
