# AI project memory — JV Web

Updated: 2026-08-05
Status: `READ FIRST`
Owner: Jozz

## Mission

Build a serious desktop/mobile browser demonstrator for Jozz Vehicle, support owner-authored vehicle and scene assets, and later replace reference physics with native JV Core + Box3D compiled into one WASM module.

Keep the repository compact, runnable and technically honest. Preserve durable contracts and exact evidence rather than every historical experiment.

## Active lines

```text
foundation:
  branch agent/jv-web-demonstrator-foundation
  PR #18 draft, direct to main

working tiny visual:
  branch agent/jv-tiny-unlit-pass
  PR #19 draft, based on foundation
  head f27b92d826e1192016873d8f341ac9ff80ad9ef8

architecture plan:
  branch agent/jv-real-vehicle-texture-scan-plan
  PR #20 draft, based on tiny visual
  head d75660889cdafc21622fb5a6c2d067745ce40193

current source implementation:
  branch agent/jv-lit-normal-foundation
  PR #21 draft, based on architecture plan
  head 554aa046c5089acc391c0220c628c9457ef25194
  exact repository gate pending on current head
```

Do not merge, mark Ready, change repository visibility, enable Pages or publish without Jozz. Do not fast-forward the long experimental history directly into public `main`; prefer an owner-reviewed squash or clean snapshot later.

Git Diff Patcher Bridge is forbidden. Use the GitHub connector and ordinary local Git only. Do not add custom GitHub Actions without explicit owner approval.

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

Deterministic tiny package:

```text
id: m6-tiny-rig-proof-v1
bytes: 2628
SHA-256: b243bf5ae6ed0b185885b6d341ab0a12fd377743408040e14226c1fecbb31281
nodes: 26
triangles: 24
geometry bytes: 336
```

### Owner browser evidence

Jozz confirmed on desktop and phone:

```text
tiny GLB proof visibly renders
controls work
destroy/rebuild works
visual modes work:
  tiny proof
  physics debug
  overlay
  hide both
```

The blue cubes and orange bars are the generated proof GLB itself, not a production car and not leftover debug geometry.

### Layer-control candidate

```text
commit: f27b92d826e1192016873d8f341ac9ff80ad9ef8
owner browser observation: PASS
fresh exact-head repository gate: PENDING
publication: NOT PERFORMED
```

Never attribute the green `30facdd…` result to `f27b92d…` or a descendant without a fresh exact-head gate.

### Lit-normal source candidate

Source-present on `agent/jv-lit-normal-foundation`:

- scale-relative inverse-transpose normal matrix with caller-owned scratch;
- complete finite matrix validation and full-frame preflight before the first draw;
- shared finite float-stream integrity for node matrices, POSITION, NORMAL and TEXCOORD_0;
- unit-normal validation with explicit tolerance;
- float integrity before CPU runtime publication and again before GPU allocation;
- shared `LIT_NORMAL_BASE_COLOR_V1` capability;
- deterministic normal-bearing 18 PART + 8 SEGMENT fixture;
- tapered segment geometry with oblique normals to expose incorrect non-uniform stretch handling;
- shared rigid lit-normal renderer;
- linear-space directional + ambient lighting;
- explicit linear-to-sRGB framebuffer encoding;
- double-sided back-face normal reversal;
- source-only vehicle adapter with visibility, first-frame receipt, abort and rollback.

First exact repository gate on `eecf99f74498649bf7a4e560d7d46b38eafb06f7`:

```text
Node/npm: 24.16.0 / 11.17.0
receipt: byte-exact
npm ci: PASS
vulnerabilities: 0
TypeScript 7: PASS
tests: 282/283 PASS
failure: test referenced nonexistent ownershipReceipt.bindingCount
docs/notices/Vite/portable/HTTP: NOT RUN after test failure
```

The production ownership receipt remained correct. Commit `cbff1af95aa1b909ea35bf7b02ca199da04d0472` replaced the invalid assertion with the real `boundRootCount`, `ownedNodeCount` and `ownedMeshNodeCount` contract, derived from M6 part and segment lists. Commit `554aa046c5089acc391c0220c628c9457ef25194` records this evidence boundary in project memory. No runtime, physics, asset or `main.ts` line changed in these two commits.

Validation performed outside the exact repository checkout:

```text
TypeScript 5.8 strict isolated normal-matrix compile: PASS
normal-matrix execution tests: PASS
shared float/capability core compile and execution: PASS
shared lit renderer strict compile and execution: PASS
vehicle lit-normal pass strict compile: PASS
```

These isolated checks do not replace a full exact-head gate on `554aa046c5089acc391c0220c628c9457ef25194`. The generated portable fixture and browser observation remain pending.

Not active yet:

```text
public lit-normal fixture generation
portable manifest entries
main.ts lit pass installation
lit visual UI mode
desktop/phone lit observation
embedded images
WebGL textures
owner vehicle model
static scan renderer
```

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
sealed CPU rigid asset
        ↓
float integrity + ownership + budget
        ↓
renderer capability gate
        ↓
transactional GPU resources
        ↓
vehicle draw plan
        ↓
shared rigid renderer
```

The model never drives physics and never stores `b3BodyId` or `b3JointId`.

Runtime channels:

```text
18 PART:
  chassis, rack
  wheel/knuckle/upper-arm/lower-arm × 4

8 SEGMENT:
  coilover × 4
  steering-link × 4
```

Binding modes:

```text
PART
SEGMENT_STRETCH
SEGMENT_ENDPOINT_AIM
```

Executable composition:

```text
worldFromNode = worldFromRuntimeSource × localFromSource
```

Every stretch source declares `referenceLengthMeters`. Stretch geometry must be rotationally symmetric because V1 does not provide roll around the segment axis.

Ownership examples:

```text
tire + rim + rotating disc → wheel
fixed caliper/upright      → knuckle
whole spring/rod           → stretch
upper damper body          → START endpoint aim
lower damper shaft         → END endpoint aim
```

## GLB and material capability sequence

Shared geometry transport accepts:

- one embedded BIN buffer;
- metre/JV axes;
- exact SHA-256 and byte length;
- aligned bufferViews/accessors;
- triangles with 8/16-bit indices;
- POSITION, optional NORMAL and TEXCOORD_0;
- finite decoded float streams;
- unique root identity bound nodes;
- package-relative URLs.

Current renderer profiles:

```text
UNLIT_POSITION_BASE_COLOR_V1
  POSITION only
  baseColorFactor + doubleSided
  rejects NORMAL and TEXCOORD_0

LIT_NORMAL_BASE_COLOR_V1
  POSITION + unit NORMAL
  opaque baseColorFactor + doubleSided
  rejects TEXCOORD_0
  inverse-transpose normal matrix
  linear lighting + sRGB output encoding

LIT_NORMAL_BASE_COLOR_TEXTURE_V1
  planned, not implemented
```

No renderer may silently ignore a vertex stream or material feature it does not implement.

Current geometry ceilings:

```text
nodes:          512
primitives:     512
triangles:      300,000
materials:      64
geometry bytes: 64 MiB
```

Raise limits only from real-phone evidence.

## Colour and future texture policy

Vehicle and scan share one texture interpretation:

```text
baseColorFactor RGB: linear
baseColorTexture RGB: sRGB encoded → decode to linear
baseColorTexture alpha: linear
lighting: linear
canvas output: encode linear RGB to sRGB
```

Required decode/upload semantics:

```text
imageOrientation: none
premultiplyAlpha: none
colorSpaceConversion: none
UNPACK_FLIP_Y_WEBGL = false
UNPACK_PREMULTIPLY_ALPHA_WEBGL = false
UNPACK_COLORSPACE_CONVERSION_WEBGL = NONE
```

Pixel-store state must be restored transactionally.

Initial WebGL1 NPOT policy:

```text
accept NPOT only with CLAMP_TO_EDGE on S/T,
NEAREST or LINEAR minification,
and no mipmaps.
Reject repeat, mirrored repeat or mipmapped NPOT.
Never silently resize.
```

See `docs/decisions/ADR-0005-gltf-color-and-texture-upload-policy.md`.

## Shared vehicle/scan boundary

Vehicle and scan share:

- rigid GLB geometry decode;
- float integrity;
- embedded image descriptors and decode boundary;
- sampler/texture/material policy;
- decoded/GPU memory accounting;
- transactional WebGL ownership;
- shared rigid renderers.

They do not share transform semantics:

```text
vehicle → 18 PART + 8 SEGMENT bindings and live draw plan
scan    → active glTF scene roots, static hierarchy and worldFromAsset
```

A scan render mesh is never collision implicitly. The first owner scan is a small local-origin crop. Large scans wait for an explicit chunk/culling/LOD decision based on measured evidence.

## Immediate sequence

```text
1 run full exact-head gate on 554aa046c5089acc391c0220c628c9457ef25194
2 keep source-only if the gate fails; make the smallest correction
3 generate lit-normal public fixture without changing tiny fixture bytes
4 extend portable asset/path/HTTP validation
5 run another exact-head gate
6 add explicit lit-normal visual mode through existing pass host
7 preserve debug fallback and all existing visual modes
8 run another exact-head gate
9 desktop browser observation
10 phone browser observation
11 only then begin embedded image/material CPU transport
```

No image/texture code enters before the lit-normal slice is green. The owner vehicle and scan are not the first fixtures for any new subsystem.

## Working rules

- communicate with Jozz in Polish;
- distinguish source presence, isolated checks, exact automated PASS, browser observation and owner acceptance;
- no hidden physics assists or automatic centering;
- no destructive local reset/clean/stash;
- preserve exact receipt and dependency identities;
- give one safe pasteable command for owner validation;
- keep progress updates concrete;
- no GitHub Actions without explicit approval;
- no GDP;
- no merge, Ready state or publication without explicit owner approval.

## Read next

1. `docs/IMPLEMENTATION_PLAN_REAL_VEHICLE_TEXTURES_AND_SCAN_2026-08-05.md`
2. `docs/decisions/ADR-0004-shared-textured-rigid-visual-pipeline.md`
3. `docs/decisions/ADR-0005-gltf-color-and-texture-upload-policy.md`
4. `docs/contracts/VEHICLE_VISUAL_PACKAGE_V1.md`
5. `docs/contracts/STATIC_SCENE_VISUAL_PACKAGE_V1.md`
6. `docs/ARCHITECTURE.md`
7. `docs/PROJECT_STATE.md`
8. `docs/decisions/ADR-0003-native-jv-core-wasm.md`
