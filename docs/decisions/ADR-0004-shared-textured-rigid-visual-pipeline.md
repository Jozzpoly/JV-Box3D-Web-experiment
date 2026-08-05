# ADR-0004 — Shared textured rigid visual pipeline

Date: 2026-08-05
Status: `ACCEPTED FOR IMPLEMENTATION / NOT YET ACTIVE`
Owner: Jozz

## Context

JV Web now proves that one renderer-owned WebGL context can load and draw a complete 18-part + 8-segment vehicle GLB through an isolated render pass. The visible `m6-tiny-rig-proof-v1` remains deterministic test geometry rather than a production vehicle model.

The next product need is a real owner-authored vehicle with normals, lighting and embedded textures. A later need is a photogrammetry scan. Both require the same low-level image, texture, material and GPU ownership machinery, but they do not share runtime transform semantics.

## Decision

Build one shared **textured rigid visual core** and two separate consumers.

```text
embedded GLB bytes
        ↓
container / policy / integrity
        ↓
rigid geometry + hierarchy decode
        ↓
embedded image descriptors
        ↓
async image decode ownership
        ↓
transactional geometry + texture GPU resources
        ↓
renderer capability profile
        ↓
vehicle draw plan OR static-scene draw plan
```

### Shared core

The vehicle and static scan pipelines will share:

- one self-contained GLB with one embedded BIN chunk;
- `POSITION`, `NORMAL` and `TEXCOORD_0` decoding;
- embedded image byte-range validation;
- PNG/JPEG image decode behind an injectable browser boundary;
- sampler and texture validation;
- base-colour material resolution;
- decoded-image and estimated GPU texture memory accounting;
- transactional WebGL buffer/texture allocation;
- reverse-order, idempotent disposal;
- root/subpath URL portability;
- deterministic fixtures and failure-injection tests.

### Separate consumers

Vehicle rendering keeps:

- `VehicleVisualPackageV1` binding ownership;
- 18 `PART` transforms and 8 segment channels;
- `PART`, `SEGMENT_STRETCH` and `SEGMENT_ENDPOINT_AIM` draw semantics;
- vehicle-specific full-rig coverage and platform budgets.

Static-scene rendering receives:

- active glTF scene-root selection;
- static hierarchy world-matrix compilation;
- one explicit `worldFromAsset` transform;
- local-origin radius validation;
- scan-specific geometry and texture budgets;
- later culling/chunk/LOD boundaries.

Vehicle bindings must never be reused for a scan. A scan render mesh must never become collision implicitly.

## Renderer capability sequence

Capabilities are additive and fail closed:

```text
UNLIT_POSITION_BASE_COLOR_V1
        ↓
LIT_NORMAL_BASE_COLOR_V1
        ↓
LIT_NORMAL_BASE_COLOR_TEXTURE_V1
```

A renderer must reject unsupported streams or material features before GPU publication. The existing unlit proof remains a fallback/diagnostic capability and is not expanded into the production shader.

### `LIT_NORMAL_BASE_COLOR_V1`

Requires:

- `POSITION`;
- `NORMAL` for every rendered primitive;
- opaque base-colour factor;
- correct inverse-transpose normal matrices under non-uniform segment stretch;
- one deterministic directional light plus ambient term;
- double-sided normal handling.

It deliberately excludes textures so geometry, pivots, hierarchy, normals and lighting can be validated independently.

### `LIT_NORMAL_BASE_COLOR_TEXTURE_V1`

Adds:

- `TEXCOORD_0` where a base-colour texture is referenced;
- embedded PNG/JPEG images only;
- one base-colour texture per material;
- explicit sampler subset;
- deterministic UV-orientation fixture;
- texture memory budgets;
- complete late-abort and rollback ownership.

It initially excludes:

- external images;
- KTX2/BasisU and all glTF extensions;
- normal, metallic-roughness, occlusion and emissive textures;
- alpha blending/masking;
- multiple UV sets and texture transforms;
- environment maps, shadows and post-processing.

These exclusions prevent a first vehicle import from becoming an uncontrolled PBR-engine rewrite.

## Texture ownership boundary

Geometry buffers and texture objects remain separate owned resources composed by a render resource. Image decode is asynchronous and may complete after cancellation; late decoded images must be closed/discarded and must never publish a partial GPU asset.

Required accounting distinguishes:

```text
compressed embedded image bytes
CPU decoded RGBA-equivalent bytes
gpu base-level bytes
estimated mip-chain bytes
```

Compressed file size is never accepted as a proxy for runtime memory.

## Normal transform boundary

`worldFromNode` may contain non-uniform scale from segment stretch. Lighting therefore cannot transform normals with the model matrix directly. Every draw command must receive or derive a finite inverse-transpose 3×3 normal matrix. Singular or near-singular transforms fail closed.

## Scan foundation

`StaticSceneVisualPackageV1` remains inactive while the shared material/texture core is implemented. Before the first real scan, its executable boundary must add:

- active scene-root ownership;
- primitive and geometry-byte budgets;
- image count, dimension and decoded/GPU texture-byte budgets;
- transformed local-origin radius validation;
- one small deterministic textured static-scene fixture;
- one small owner scan crop before any large scan.

Chunking, streaming and LOD are not hidden inside the first single-asset scan implementation. A scan that exceeds the first mobile-safe package limits must wait for an explicit spatial-cell contract.

## Authoring boundary

The first owner vehicle is not the first asset used to debug normals or textures. The required order is:

1. deterministic lit-normal fixture;
2. deterministic embedded-texture fixture with orientation markers;
3. owner vehicle geometry/normals smoke export;
4. owner vehicle textured export;
5. full vehicle acceptance;
6. deterministic static-scene textured fixture;
7. small owner scan crop.

## Consequences

Benefits:

- one parser/image/texture ownership path serves vehicle and scan;
- vehicle transform semantics remain clean;
- scan collision remains independent;
- failures are attributable to geometry, lighting, texture or authoring rather than mixed together;
- mobile budgets are enforced before large owner assets become runtime dependencies.

Costs:

- two intermediate fixtures are required before the full vehicle;
- the first material model is intentionally narrower than glTF PBR;
- a large scan waits for chunking/LOD instead of entering as one uncontrolled GLB.
