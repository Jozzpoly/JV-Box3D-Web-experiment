# AI project memory — JV Web

Updated: 2026-08-05
Status: `READ FIRST`
Owner: Jozz

## Mission

Build a serious desktop/mobile browser demonstrator for Jozz Vehicle, support owner-authored vehicle and scene assets, and later replace reference physics with native JV Core + Box3D compiled into one WASM module.

Keep the repository compact, runnable and technically honest. Preserve durable contracts and evidence, not every historical experiment.

## Active lines

```text
foundation branch: agent/jv-web-demonstrator-foundation
foundation PR:     #18, draft, direct to main

active visual branch: agent/jv-tiny-unlit-pass
active visual PR:     #19, draft, based on foundation branch

planning branch: agent/jv-real-vehicle-texture-scan-plan
planning base:   f27b92d826e1192016873d8f341ac9ff80ad9ef8
```

Do not merge, mark Ready, change visibility or enable Pages without Jozz. Do not fast-forward the long experimental history into public `main`; prefer an owner-reviewed squash or clean snapshot later.

Git Diff Patcher Bridge is forbidden. Use the GitHub connector and ordinary Git only. Do not add custom Actions without explicit owner approval.

## Evidence boundary

### Exact green tiny-GLB activation checkpoint

```text
commit: 30facdd08c2b0e486cb4a942e93f933a0ae09ef1
Node/npm: 24.16.0 / 11.17.0
receipt: byte-exact
npm ci: PASS
vulnerabilities: 0
TypeScript: PASS
tests: 245/245 PASS
docs links: PASS
third-party notices: PASS
Vite production build: PASS
portable static/runtime/vehicle/path/privacy/network/HTTP: PASS
root + repository-subpath HTTP: PASS
publication: NOT PERFORMED
```

The deterministic package is:

```text
id: m6-tiny-rig-proof-v1
2628 bytes
SHA-256 b243bf5ae6ed0b185885b6d341ab0a12fd377743408040e14226c1fecbb31281
26 nodes
24 triangles
336 decoded geometry bytes
```

Non-blocking bundle warnings remain:

```text
box3d.js imports browser-externalized node:module
main bundle is about 1.27 MiB / 406 KiB gzip
```

### Owner browser evidence

Jozz confirmed on desktop and phone:

```text
tiny GLB proof visibly renders
controls work
destroy/rebuild works
four visual modes work:
  tiny proof
  physics debug
  overlay
  hide both
```

The blue cubes and orange bars are the generated proof GLB itself, not an imported production car and not leftover debug geometry.

### Current layer-control candidate

```text
commit: f27b92d826e1192016873d8f341ac9ff80ad9ef8
owner browser observation: PASS
fresh exact-head repository gate: PENDING
publication: NOT PERFORMED
```

Never attribute the green `30facdd…` gate to `f27b92d…` until a full exact-head local gate is recorded.

### Current planning candidate

`agent/jv-real-vehicle-texture-scan-plan` is documentation/preparation only. It adds:

- `ADR-0004-shared-textured-rigid-visual-pipeline.md`;
- `IMPLEMENTATION_PLAN_REAL_VEHICLE_TEXTURES_AND_SCAN_2026-08-05.md`;
- this updated memory.

It changes no runtime source, physics, asset bytes or publication state.

## Physics authority

```text
backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
acceptsNewProductPhysics: false
commandContractVersion: 1
traceContractVersion: 1
visualFrameContractVersion: 1
```

Confirmed mismatch:

```text
native maxDriveSpeed = 40 rad/s wheel limit
legacy TypeScript     = chassis-linear target semantics
```

Do not add final drivetrain, suspension, tire, aero or steering mechanics to the TypeScript fixture.

## Working browser foundation

- deterministic fixed-step host;
- source-aware keyboard and multi-touch Pointer Events;
- lifecycle-safe release and transactional rebuild;
- real Box3D/WASM contacts;
- 18-body / 29-joint / 9-shape M6 reference fixture;
- physical rack `RELEASE | POSITION | RATE` steering;
- reference drive/brake/reverse;
- dependency-free WebGL observer;
- one renderer-owned WebGL context with isolated passes;
- portable relative-path build;
- strict receipt/scene/browser/backend contracts.

## Vehicle visual architecture

```text
VehicleVisualFrameV1
        ↓
VehicleVisualPackageV1
        ↓
fetch / hash / GLB policy
        ↓
sealed CPU mesh asset
        ↓
ownership + mobile budget
        ↓
renderer-specific capability gate
        ↓
transactional GPU resources
        ↓
rigid draw plan on the renderer-owned WebGL context
```

The model never drives physics and never stores `b3BodyId` or `b3JointId`.

### Runtime channels

```text
18 PART transforms:
  chassis, rack
  wheel/knuckle/upper-arm/lower-arm × 4

8 SEGMENT channels:
  coilover × 4
  steering-link × 4
```

Rigid transforms come from real post-step bodies. Segment endpoints come from exact joint anchors.

### Binding semantics

```text
PART
SEGMENT_STRETCH
SEGMENT_ENDPOINT_AIM
```

Every stretch source has explicit `referenceLengthMeters`.

```text
worldFromNode = worldFromRuntimeSource × localFromSource
```

Segment aim uses deterministic shortest-arc rotation. Stretch meshes must be rotationally symmetric because V1 does not provide roll around the physical segment axis.

### Ownership

Every bound GLB node is an independent identity root. Each bound root must own at least one mesh descendant. Every mesh node belongs to exactly one binding root.

```text
tire + rim + rotating disc → wheel
fixed caliper/upright      → knuckle
whole spring/rod           → stretch
upper damper body          → START endpoint aim
lower damper shaft         → END endpoint aim
```

### Current GLB transport subset

Require:

- one embedded BIN buffer;
- metre/JV axes;
- exact SHA-256 and byte length;
- aligned bufferViews/accessors;
- triangles with 8/16-bit indices;
- `POSITION`, optional `NORMAL` and `TEXCOORD_0` only;
- finite POSITION min/max;
- unique, root, identity bound nodes;
- package-relative URLs.

Reject until their own capability exists:

- images/textures;
- external URI;
- unknown vertex attributes;
- skins, animation, morph targets and sparse accessors;
- non-triangle primitives, extensions and 32-bit indices;
- empty channels, unowned mesh nodes and byte/hash drift.

### Current geometry budget

```text
nodes:          512
primitives:     512
triangles:      300,000
materials:      64
geometry bytes: 64 MiB
```

Raise limits only from real-phone evidence.

### Current renderer capability

```text
UNLIT_POSITION_BASE_COLOR_V1
accepted: POSITION + baseColorFactor + doubleSided
rejected before GPU allocation: NORMAL, TEXCOORD_0
```

The CPU decoder already transports optional `NORMAL` and `TEXCOORD_0`. No renderer may silently ignore a stream or material feature it does not implement.

## Textured rigid visual decision

Vehicle and scan will share:

- embedded image descriptors and byte validation;
- browser image decode boundary;
- sampler/texture/material subset;
- decoded and estimated GPU texture budgets;
- transactional WebGL texture ownership;
- deterministic image/UV fixtures.

They will not share transform semantics:

```text
vehicle → 18 PART + 8 SEGMENT binding draw plan
scan    → active glTF scene roots + static hierarchy + worldFromAsset
```

Capability sequence:

```text
UNLIT_POSITION_BASE_COLOR_V1
LIT_NORMAL_BASE_COLOR_V1
LIT_NORMAL_BASE_COLOR_TEXTURE_V1
```

The production lighting pass is separate from the unlit proof pass.

Initial texture subset:

```text
embedded PNG/JPEG
baseColorFactor
baseColorTexture
TEXCOORD_0
opaque
doubleSided
```

Initially excluded:

```text
external images
KTX2/BasisU/extensions
normal/metallic/roughness/occlusion/emissive maps
alpha BLEND/MASK
multiple UV sets
texture transforms
shadows/environment/post-processing
```

Provisional first vehicle texture ceilings:

```text
images/textures/samplers: 4 each
single dimension:          2048 px
decoded RGBA-equivalent:   32 MiB total
estimated GPU+mips:        48 MiB total
```

These values are implementation guards and require phone evidence before being raised.

## Preliminary scan direction

`StaticSceneVisualPackageV1` is source-present but inactive. It already pins metre/JV axes, GLB bytes, `worldFromAsset`, local-origin radius and basic CPU budgets.

Before activation it must add executable support for:

- active glTF scene-root selection;
- static hierarchy world matrices;
- primitive and geometry-byte budgets;
- image/texture dimension and memory budgets;
- transformed local-radius validation;
- static draw plan and render pass;
- deterministic textured scene fixture.

Reuse the shared rigid geometry/image/texture core. Do not reuse vehicle bindings. Keep scan visual and collision separate.

The first owner scan must be a small local-origin crop. A large scan waits for an explicit culling/chunk/LOD decision based on measured phone evidence.

## Immediate sequence

```text
0 full exact-head gate for f27b92d… and record PR #19 evidence
1 normal-matrix pure math + tests
2 LIT_NORMAL_BASE_COLOR_V1 capability gate
3 deterministic normal-bearing fixture
4 source-only lit vehicle pass
5 exact repository gate
6 desktop then phone lit-fixture validation
7 embedded image/material CPU transport
8 transactional GPU texture ownership + budgets
9 deterministic UV-orientation textured fixture
10 owner geometry/normals smoke export
11 owner textured vehicle export
12 full vehicle acceptance
13 executable static-scene hierarchy/draw plan
14 deterministic textured static-scene fixture
15 small owner scan crop
```

No image/texture code enters before the lit-normal slice is green. The full owner model and scan are not the first fixtures for any new subsystem.

## Working rules

- communicate with Jozz in Polish;
- distinguish source presence, automated PASS, browser observation and owner acceptance;
- no hidden physics assists or automatic centering;
- no destructive local reset/clean/stash;
- preserve exact receipt and dependency identities;
- give one safe pasteable command for owner validation;
- keep progress updates concrete;
- do not rebuild documentation bureaucracy;
- no GitHub Actions without explicit approval;
- no GDP.

## Read next

1. `docs/IMPLEMENTATION_PLAN_REAL_VEHICLE_TEXTURES_AND_SCAN_2026-08-05.md`
2. `docs/decisions/ADR-0004-shared-textured-rigid-visual-pipeline.md`
3. `docs/contracts/VEHICLE_VISUAL_PACKAGE_V1.md`
4. `docs/contracts/STATIC_SCENE_VISUAL_PACKAGE_V1.md`
5. `docs/ARCHITECTURE.md`
6. `docs/PROJECT_STATE.md`
7. `docs/decisions/ADR-0003-native-jv-core-wasm.md`

## Immediate boundary

```text
GREEN AT 30facdd…:
tiny GLB activation
245 tests
portable package and HTTP

OWNER-OBSERVED / FRESH GATE PENDING AT f27b92d…:
visual layer selector
proof/debug/overlay/hidden
same result on desktop and phone

PLANNED / NOT IMPLEMENTED:
normal matrices
lighting
embedded images
texture GPU ownership
real vehicle model
active static scan rendering
```
