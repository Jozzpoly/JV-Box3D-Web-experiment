# JV Web — current project state

Updated: 2026-08-04
Status: `CANONICAL CURRENT STATE`
Owner: Jozz

## Active integration

```text
branch: agent/jv-web-demonstrator-foundation
PR: #18
base: main
state: draft / not merged
exact candidate: resolve with git rev-parse HEAD or PR head SHA
```

Only `main` and the active development branch remain remotely. Do not fast-forward the long experimental history into a presentation-ready public default branch. Prefer a clean demonstrator snapshot/repository or an owner-reviewed squash later.

No merge, Ready, visibility, license or Pages decision has been made.

## Exact green foundation checkpoint

The vehicle-asset foundation is proven at:

```text
commit: d6aa218064c2653f918cf7956d2fcd20a940caf3
Node/npm: 24.16.0 / 11.17.0
receipt: byte-exact
npm ci: PASS
vulnerabilities: 0
TypeScript: PASS
tests: 218/218 PASS
documentation links: PASS
third-party notices: PASS
Vite bundle: PASS
portable static/runtime/vehicle/path/privacy/network/HTTP: PASS
root + /JV-Box3D-Web-experiment/ HTTP: PASS
publication: NOT PERFORMED
```

Generated proof asset:

```text
manifest + GLB: deterministic
GLB bytes: 2628
SHA-256: b243bf5ae6ed0b185885b6d341ab0a12fd377743408040e14226c1fecbb31281
nodes: 26
triangles: 24
geometry bytes: 336
```

Known non-blocking bundle warnings:

```text
box3d.js imports browser-externalized node:module
largest JS chunk: about 1.22 MiB / 391 KiB gzip
```

After this exact gate Jozz confirmed that the desktop browser and phone demonstrator work correctly, including the visible vehicle, controls and destroy/rebuild. Tiny GLB was packaged but not yet drawn.

## Existing demonstrator

- deterministic fixed-step simulation with bounded catch-up;
- source-aware keyboard and Pointer Events input;
- simultaneous mobile steering and throttle/brake;
- lifecycle-safe release and transactional rebuild;
- real Box3D/WASM worlds and contacts;
- 18-body M6 reference topology with physical rack linkage;
- `RELEASE | POSITION | RATE` steering;
- reference drive, reverse, coast and brake;
- dependency-free WebGL debug observer;
- relative-path portable package for localhost, LAN and repository subpaths.

## Physics authority

```text
backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
acceptsNewProductPhysics: false
command contract: v1
trace contract: v1
visual frame contract: v1
```

The native/legacy drive semantic mismatch remains explicit. Do not add final drivetrain, suspension, tire, aero or steering mechanics to the TypeScript fixture.

## Vehicle visualization foundation

### Runtime frame

`VehicleVisualFrameV1` contains no Box3D IDs and supplies:

```text
18 rigid transforms:
  chassis, rack
  wheel/knuckle/upper-arm/lower-arm × 4

8 exact segments:
  coilover × 4
  steering-link × 4
```

Rigid transforms come from real post-step bodies. Segment endpoints come from exact joint anchors.

### Authoring and transform contract

`VehicleVisualPackageV1` binds independent GLB roots through:

```text
PART
SEGMENT_STRETCH
SEGMENT_ENDPOINT_AIM
```

`SEGMENT_STRETCH` has an explicit authored baseline and identity correction. Runtime composition is fixed as:

```text
worldFromNode = worldFromRuntimeSource × localFromSource
```

Every bound root owns at least one renderable mesh descendant, and every mesh node belongs to exactly one binding root.

### Transport and ownership pipeline

```text
manifest + package-relative URL
→ fetch with AbortSignal
→ byte/hash gate
→ GLB feature/material policy
→ CPU decode
→ sealed ownership graph + owned typed arrays
→ binding ownership
→ mobile geometry budget
→ renderer capability validation
→ transactional GPU buffers
→ live rigid draw plan
```

Transport accepts POSITION plus optional NORMAL/TEXCOORD_0. A renderer is not allowed to ignore transported streams silently.

The first unlit capability therefore accepts only:

```text
POSITION
baseColorFactor
doubleSided
```

and rejects NORMAL/TEXCOORD_0 before GPU allocation. A later lighting/texture renderer must introduce a new explicit capability profile.

### Mobile geometry budget V1

```text
nodes:          512
primitives:     512
triangles:      300,000
materials:      64
geometry bytes: 64 MiB
```

### Deterministic tiny asset

Generated before dev/build:

```text
public/vehicles/tiny/vehicle.visual.json
public/vehicles/tiny/models/m6-rig-proof.glb
```

It contains 18 part boxes and 8 segment rods using two shared meshes and two base-colour materials. It remains the first browser draw proof; the final owner model must not test the pipeline first.

## Post-gate renderer preparation

The current branch after `d6aa218…` adds a controlled seam without activating GLB drawing in `main.ts`:

```text
M6DebugRenderer owns the only WebGL context
       ↓
owned render-pass host
       ↓
BEFORE_DEBUG_VEHICLE / AFTER_DEBUG_VEHICLE phases
       ↓
shared viewProjection + live M6TraceFrame
```

Lifecycle guarantees:

- async pass installation receives an `AbortSignal`;
- a pass resolving after renderer shutdown is disposed and never published;
- one failing pass is removed without killing the debug observer;
- installed passes dispose in reverse order;
- context loss and renderer disposal abort pending work;
- the debug WebGL baseline is restored between pass phases;
- the debug vehicle can later be hidden while preserving the same camera and grid.

`VehicleVisualRenderResourceV1` now accepts a runtime capability validator before any GPU allocation.

This preparation is **source-present but requires a fresh exact-head gate and unchanged browser/mobile smoke**. The green evidence at `d6aa218…` must not be projected onto a newer commit.

## Preliminary scan preparation

`StaticSceneVisualPackageV1` is source-present but inactive. It defines metre/JV axes, exact static GLB bytes, `worldFromAsset`, a scene-local origin/radius and budgets.

The scan will reuse the GLB CPU/GPU pipeline, but not vehicle bindings. Visual scan and collision remain separate assets. Real scan import, texture pipeline, culling/chunking and triangle collision are inactive.

## Deliberate limitations

- current render-pass preparation head has not passed a fresh local gate;
- `main.ts` does not install a vehicle GLB pass yet;
- tiny GLB is not yet drawn in the browser;
- no GLB shader/program implementation yet;
- no normals/lighting capability;
- no texture/image ownership path;
- no final Jozz vehicle model;
- no real scan import or scene collision mesh;
- initial camera pose still starts on the old side;
- no native JV WASM backend;
- repository remains private and Pages disabled.

## Correct next sequence

```text
1 full Node 24 gate on the exact current preparation head
2 unchanged desktop/LAN/phone debug-renderer smoke
3 implement one unlit tiny-vehicle render pass through installRenderPass()
4 load the generated package transactionally
5 validate UNLIT_POSITION_BASE_COLOR_V1 before GPU allocation
6 compile draw plans from trace.visualFrame
7 prove all 18 parts + 8 segments visually
8 prove pass failure fallback, context loss, destroy/rebuild and phone performance
9 import owner-authored simple chassis + four wheels
10 introduce normals + simple lighting as a new capability
11 add suspension/steering parts
12 implement embedded texture ownership and texture budgets
13 integrate the full model
14 activate the first static scan visual fixture
```

## Long-term architecture

```text
input → fixed-step commands → VehicleRuntimeBackend
                              ↓
                    VehicleVisualFrameV1
                              ↓
                    VehicleVisualPackageV1
                              ↓
       sealed CPU graph → capability gate → GPU resource
                              ↓
                   renderer-owned pass host

static scene package → same CPU/GPU mesh path
native_jv_wasm later → same visual frame contract
```
