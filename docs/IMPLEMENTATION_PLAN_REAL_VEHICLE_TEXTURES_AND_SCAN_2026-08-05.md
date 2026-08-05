# Implementation plan — real vehicle, textures and scan foundation

Date: 2026-08-05
Status: `PREPARATION CANDIDATE / NO RUNTIME CHANGES`
Owner: Jozz
Branch: `agent/jv-real-vehicle-texture-scan-plan`

## Goal

Reach a real owner-authored M6 visual model with correct rigid-part motion, normals, simple lighting and embedded base-colour textures, while building the reusable low-level image/texture/material path required by the first small photogrammetry scan.

This plan deliberately does not promise full PBR, a full-world scan or production publication. It creates an attributable sequence where geometry, transforms, lighting, texture decode, GPU ownership, authoring and phone cost are proven separately.

## Starting evidence

### Proven

- one renderer-owned WebGL context;
- isolated render-pass lifecycle and fallback;
- deterministic 18 `PART` + 8 `SEGMENT` visual frame;
- strict vehicle bindings and ownership;
- embedded GLB geometry transport;
- `POSITION`, optional `NORMAL` and optional `TEXCOORD_0` CPU decode;
- transactional geometry-buffer GPU allocation;
- tiny unlit GLB visible on desktop and phone;
- independent tiny-proof/debug/overlay/hidden layer controls.

### Present but incomplete

- `StaticSceneVisualPackageV1` schema and CPU budgets;
- static `worldFromAsset` and local-origin policy;
- shared node hierarchy decoder;
- vehicle inspector.

### Not implemented

- lit shader and normal matrices;
- image descriptors and embedded image extraction;
- image decode ownership;
- WebGL textures and samplers;
- base-colour texture materials;
- texture memory budgets;
- production vehicle GLB;
- static-scene loader/draw plan/pass;
- scan culling, chunks, LOD or collision.

## Non-negotiable architecture

1. The owner model never drives physics.
2. The current TypeScript M6 remains a non-authoritative reference fixture.
3. The unlit proof pass stays a diagnostic fallback; production lighting is a separate pass/capability.
4. Vehicle and scan share geometry/image/texture/material ownership, not binding semantics.
5. Scan visual geometry and collision are separate packages.
6. Every new renderer capability fails closed before partial GPU publication.
7. Large assets are blocked by decoded runtime budgets, not judged from compressed file size.
8. No full owner model or scan is used as the first fixture for a new subsystem.

## Milestone sequence

## M0 — close the current layer-control candidate

Entry:

- exact head `f27b92d826e1192016873d8f341ac9ff80ad9ef8`;
- owner confirmed the four visual modes behave correctly in browser.

Required:

- full local repository gate on the exact head;
- desktop and phone confirmation recorded in PR #19;
- no merge, Ready state or publication yet.

Exit evidence:

```text
exact head
Node/npm
all tests
portable build
root/subpath HTTP
owner desktop observation
owner phone observation
```

No material/texture runtime code is stacked before this boundary is green.

## M1 — deterministic lit-normal capability

Purpose: prove real surface shading before image work.

Implement:

- `LIT_NORMAL_BASE_COLOR_V1` capability gate;
- require `NORMAL` on every rendered primitive;
- inverse-transpose 3×3 normal matrix for every draw;
- determinant/finite validation;
- one directional light and one ambient term;
- double-sided back-face normal correction;
- separate lit vehicle render pass and program lifecycle;
- deterministic normal-bearing rig fixture.

Tests:

- missing `NORMAL` rejected before GPU allocation;
- malformed/non-finite normals rejected by decode or capability boundary;
- non-uniform segment stretch produces finite correct normal matrices;
- singular transform fails closed;
- shader/program/resource rollback;
- 26 draws before first-frame receipt;
- pass failure restores configured debug fallback.

Browser fixture:

- deliberately asymmetric lighting;
- visibly different face brightness;
- front/back and segment-stretch inspection;
- desktop, then phone.

Exit:

- no textures accepted;
- owner confirms geometry, pivots, steering, wheel spin and suspension remain readable under lighting.

## M2 — embedded image and material transport

Purpose: introduce texture data without drawing it yet.

Extend the shared GLB CPU model with:

- embedded `images[]` using `bufferView` + `mimeType` only;
- `samplers[]`;
- `textures[]`;
- material `baseColorTexture` reference with `texCoord = 0` only;
- exact byte-range and MIME validation;
- no external image URI;
- no glTF extensions;
- no non-base-colour texture slots.

Create an injectable decoder boundary:

```text
encoded image bytes + MIME
        ↓
DecodedImageV1(width, height, close/upload source)
```

Production browser implementation may use browser image decode. Tests use deterministic fake decoded images and do not depend on Node canvas packages.

Required abort semantics:

- already-aborted load performs no decode;
- abort during decode publishes no CPU/GPU resource;
- a late decoded image is closed/discarded;
- one failed image prevents the complete resource from publishing.

Exit:

- CPU receipts report image count, compressed bytes, dimensions and decoded RGBA-equivalent bytes;
- still no textured draw.

## M3 — transactional GPU texture ownership

Implement a texture resource separate from geometry buffers:

```text
RigidMeshGpuAssetV1
RigidTextureGpuAssetV1
        ↓
composed textured render resource
```

Requirements:

- one `WebGLTexture` per glTF texture identity, not per primitive;
- explicit sampler mapping;
- deterministic pixel-store state;
- complete rollback on allocation/upload/mipmap error;
- reverse-order idempotent disposal;
- restore WebGL bindings/state after upload;
- device `MAX_TEXTURE_SIZE` validation;
- runtime memory receipt.

Initial material subset:

```text
baseColorFactor
baseColorTexture
opaque rendering
doubleSided
TEXCOORD_0
```

Initial exclusions:

```text
alpha BLEND/MASK
normal maps
metallic-roughness maps
occlusion/emissive maps
texture transforms
multiple UV sets
KTX2/BasisU
```

### Provisional vehicle texture ceilings

These are conservative implementation ceilings, not quality targets:

```text
images:                    4
textures:                  4
samplers:                  4
maximum single dimension:  2048 px
decoded RGBA-equivalent:   32 MiB total
estimated GPU + mip chain: 48 MiB total
```

Any change requires real-phone evidence. The inspector reports both compressed and runtime estimates.

Exit:

- texture resource can be created/disposed independently;
- no production vehicle is required yet.

## M4 — deterministic textured lighting fixture

Implement `LIT_NORMAL_BASE_COLOR_TEXTURE_V1`.

Fixture requirements:

- tiny embedded PNG or JPEG;
- obvious four-corner orientation labels/colours;
- known UV seams;
- at least one factor-only and one textured material;
- at least one double-sided primitive;
- deterministic bytes and package receipt.

Tests:

- UV orientation cannot silently flip;
- missing `TEXCOORD_0` for a textured primitive fails closed;
- invalid image/texture/sampler/material index fails closed;
- texture upload failure rolls back textures and geometry;
- first-frame receipt occurs only after complete texture publication and complete draw;
- hidden pass issues zero draws and no receipt;
- phone budget receipt is stable.

Browser acceptance:

- orientation marks are correct on desktop and phone;
- no black texture, white fallback or intermittent first frame;
- destroy/rebuild does not re-fetch/re-upload a renderer-owned vehicle resource;
- layer controls continue to work.

## M5 — owner vehicle authoring preflight

Do not begin with the final high-detail export. Use two owner exports.

### Export A — geometry and normals smoke

Contains:

- complete required 18 part + 8 segment ownership;
- correct pivots and applied transforms;
- representative body shell, wheels and suspension shapes;
- `POSITION` + `NORMAL`;
- base-colour factors only;
- no textures.

Purpose:

- isolate node names, ownership, transforms, axes, pivots, normals and triangle splitting.

### Export B — textured candidate

Adds:

- `TEXCOORD_0`;
- embedded base-colour PNG/JPEG;
- supported samplers;
- same node/binding identities as Export A.

### Authoring checklist

```text
units: meter
forward/up/right: +X/+Y/+Z
object transforms applied
bound roots are independent identity roots
no negative scale or unapplied mirrors
wheel pivot at axle centre
wheel spin local +Y
rack length local +Z
stretch geometry rotationally symmetric
one embedded BIN buffer
embedded PNG/JPEG only
UV set 0 only
triangles
8/16-bit indices; split large primitives
no skin/animation/morph/extensions
```

The runtime package contains the `.glb` and `vehicle.visual.json`. Source `.blend`, Blockbench or texture-working files remain authoring sources, not runtime dependencies.

Inspector improvements before handoff:

- image/texture/sampler inventory;
- dimensions and memory estimates;
- material-to-texture mapping;
- per-binding owned nodes/meshes/primitives/triangles;
- missing normals/UVs by primitive;
- platform budget result;
- clean copy-paste binding skeleton from node names.

## M6 — real vehicle integration

Integration order:

1. Export A through lit-normal pass.
2. Correct pivots/bindings without changing physics.
3. Export B through textured pass.
4. Measure desktop and phone.
5. Only then replace temporary low-detail pieces with final art.

Acceptance matrix:

- body shell follows chassis exactly;
- wheels steer/spin/suspend without orbiting their pivots;
- calipers remain with knuckles;
- arms follow correct physical bodies;
- rack travels along the correct axis;
- coilovers and steering links aim/stretch without shear;
- texture orientation and material assignment are correct;
- no duplicate overlay unless explicitly selected;
- destroy/rebuild preserves visuals;
- no texture/resource growth over repeated rebuilds;
- phone input and frame pacing remain usable.

## M7 — executable static-scene foundation

Only after M4 is green, activate the scan-specific edge using the shared textured core.

Required changes:

- parse glTF `scene` and `scenes` explicitly;
- select only active scene roots;
- compile static hierarchy matrices once;
- compose `worldFromAsset × worldFromHierarchyNode`;
- generate a static draw plan independent of vehicle bindings;
- validate transformed bounds against `maxRadiusMeters`;
- add static render resource/pass lifecycle;
- expose independent scene-visual visibility/error state.

Revise the inactive static-scene budget boundary to include:

```text
maxNodes
maxPrimitives
maxTriangles
maxMaterials
maxGeometryBytes
maxImages
maxTextures
maxTextureDimension
maxDecodedTextureBytes
maxEstimatedGpuTextureBytes
```

The manifest carries package-specific limits, but code also enforces conservative platform ceilings so a manifest cannot authorize an unsafe package by itself.

## M8 — first scan fixture and first owner scan crop

### Deterministic fixture

- small static textured GLB;
- hierarchy with more than one level;
- non-identity `worldFromAsset`;
- obvious UV orientation;
- known local radius;
- no collision.

### Owner scan crop

Use a deliberately small crop, not a full environment:

```text
single local-origin GLB
embedded textures
bounded triangle and texture memory
visual only
separate simple existing terrain collision
```

Validate:

- origin/scale/orientation;
- texture orientation;
- camera visibility and depth interaction with vehicle;
- disposal/reload;
- desktop and phone memory/frame pacing.

Do not proceed to a large scan until a measured need determines whether the next contract is spatial cells, LOD, mesh simplification or texture-atlas reduction.

## Explicitly deferred

- native JV Core physics migration;
- tire deformation;
- skeletal animation;
- full glTF metallic-roughness PBR;
- normal maps and tangent generation;
- transparency sorting;
- shadow maps;
- environment lighting;
- texture compression extensions;
- scan streaming/LOD/cells;
- scan-derived collision;
- public release or Pages.

## Immediate next implementation slice

After M0 exact-head gate:

```text
A. normal-matrix pure math + tests
B. LIT_NORMAL_BASE_COLOR_V1 capability gate
C. deterministic normal-bearing fixture
D. source-only lit pass
E. exact repository gate
F. desktop browser
G. phone browser
```

No image or texture code enters before this slice is green.
