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
exact candidate: resolve with git rev-parse HEAD or the PR head SHA
```

Only `main` and the active development branch remain remotely. Do not fast-forward the long experimental history into a presentation-ready public default branch. Prefer a clean demonstrator snapshot/repository or an owner-reviewed squash later.

No merge, Ready, visibility, license or Pages decision has been made.

## Proven runtime evidence

### Exact logged mobile checkpoint

```text
commit: 7204993a0640e6cff0baa719d849a0b4368c15aa
Node/npm: 24.16.0 / 11.17.0
receipt: byte-exact
TypeScript: PASS
tests: 120/120 PASS
docs/notices/portable root+subpath HTTP: PASS
LAN HTTP without SubtleCrypto: PASS
localhost + LAN desktop + real phone: PASS
Box3D / WebGL / keyboard / multi-touch: observed working
publication: NOT PERFORMED
```

### Newer owner observations

Jozz subsequently confirmed the scene/runtime and visual-frame lines in desktop and mobile browsers:

```text
LIVE
4 CONTACTS
vehicle visible
DRIVE / LEFT / RIGHT / BRAKE / REVERSE working
destroy and rebuild working
```

This is owner-observed runtime evidence, not a fresh terminal gate for the current asset-pipeline head.

### Historical visual-rig gate attempt

At `49e9eec729101d11635a0dab05184ae1f97dd660` TypeScript passed and 161/162 tests passed. The sole failure was a stale expected backend object after intentional descriptor consolidation. The corrected test now asserts identity with the one shared frozen descriptor. A newer full gate is still required.

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

## Vehicle visualization foundation candidate

The exact current PR head is a **source candidate pending a fresh gate**. It does not replace the visible debug renderer yet.

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

Rigid transforms come from real post-step bodies. Segment endpoints come from the exact joint anchors.

### Executable authoring contract

`VehicleVisualPackageV1` binds GLB roots through:

```text
PART
SEGMENT_STRETCH
SEGMENT_ENDPOINT_AIM
```

`SEGMENT_STRETCH` has an explicit authored baseline between `0.001` and `10` metres. Stretch roots must use identity `localFromSource`; this prevents shear and ambiguous physical endpoints. Runtime composition is fixed as:

```text
worldFromNode = worldFromRuntimeSource × localFromSource
```

Shortest-arc segment aim is deterministic. Stretch meshes must be rotationally symmetric because physical segment roll is not supplied in V1.

### Strict GLB subset

Before CPU/GPU publication the pipeline requires:

- exact byte length and SHA-256;
- one self-contained GLB v2 and one embedded BIN buffer;
- aligned bufferViews/accessors;
- `TRIANGLES` with 8/16-bit indices;
- `POSITION`, optional `NORMAL`, optional `TEXCOORD_0` only;
- finite POSITION min/max;
- independent identity bound roots;
- rendered material fields limited to `baseColorFactor` and `doubleSided`;
- no external URI, image, texture, skin, animation, morph, sparse accessor or extension;
- no silently ignored vertex or material fields.

Textures are intentionally rejected until image decode, sampler/texture ownership and mobile texture-memory budgets exist. Metallic/roughness and other PBR fields remain rejected until the shader actually preserves and renders them.

### CPU pipeline

```text
manifest + package-relative URL
→ fetch with AbortSignal
→ byte/hash gate
→ GLB policy
→ CPU decode
→ sealed ownership graph + owned typed arrays
→ complete binding ownership
→ mobile geometry budget
→ draw plan
```

The ownership graph and name index expose no mutation path. Decoded typed arrays are owned by the asset and passed to the transactional GPU upload path; they are not described as deeply immutable bytes.

Every bound root must own at least one renderable mesh descendant, and every mesh node must belong to exactly one binding root.

Platform budget V1:

```text
nodes:          512
primitives:     512
triangles:      300,000
materials:      64
geometry bytes: 64 MiB
```

### GPU ownership

The source candidate can transactionally allocate position, optional normal/UV and index buffers. Any allocation/upload failure rolls back all earlier buffers. Disposal is reverse-order and idempotent.

No shader or draw integration has been added to the working debug renderer yet.

### Deterministic tiny runtime asset

Generated before dev/build:

```text
public/vehicles/tiny/vehicle.visual.json
public/vehicles/tiny/models/m6-rig-proof.glb
```

The proof asset contains 18 part boxes and 8 segment rods, two shared meshes and two base-colour materials. It is ignored as reproducible build output, regenerated deterministically and required by the portable manifest.

The portable vehicle gate validates the packaged manifest against the packaged GLB bytes, CPU decode, ownership and exact proof counts.

### Inspection tool

```powershell
npm run inspect:vehicle-glb -- <model.glb> <vehicle.visual.json>
```

It reports GLB structure, strict feature policy, ownership, nodes/primitives/triangles/materials and decoded geometry bytes.

## Preliminary scan preparation

`StaticSceneVisualPackageV1` is source-present but not active in runtime. It defines:

- metre/JV axes;
- exact static GLB bytes;
- explicit `worldFromAsset`;
- scene-local origin and maximum radius;
- nodes/triangles/materials budgets.

The scan will reuse the GLB CPU/GPU pipeline, but not vehicle bindings. Visual scan and collision remain separate assets. Real scan import, texture pipeline, culling/chunking and triangle collision are not active.

See `docs/contracts/STATIC_SCENE_VISUAL_PACKAGE_V1.md`.

## Deliberate limitations

- current CPU/GPU asset-pipeline head has not passed a fresh local gate;
- tiny GLB is generated and packaged but not yet loaded or drawn by `main.ts`;
- no shader/material draw layer for GLB yet;
- no texture/image pipeline;
- no final Jozz vehicle model or manifest;
- no deformable tire visual contract;
- no real scan import or scene collision mesh;
- initial camera pose still starts on the old side;
- no native JV WASM backend;
- repository remains private and Pages disabled.

## Correct next sequence

```text
1 full Node 24 gate on exact current PR head
2 repair only demonstrated failures
3 unchanged desktop/LAN/phone debug-renderer smoke
4 load tiny vehicle package in browser transactionally
5 compile a draw plan from live VehicleVisualFrameV1
6 add a minimal shader/draw layer beside the debug observer
7 prove all 18 parts + 8 segments visually
8 destroy/rebuild/context lifecycle and phone performance
9 add normals and simple base-colour lighting
10 import owner-authored simple chassis + four wheels
11 add knuckles, arms, steering links and two-piece coilovers
12 implement embedded texture ownership and budgets
13 integrate full body/interior/wheel model
14 only then activate the first scan visual fixture
```

The final owner model must not be the first asset testing load, transform math, GPU ownership or disposal.

## Long-term architecture

```text
input → fixed-step commands → VehicleRuntimeBackend
                              ↓
                    VehicleVisualFrameV1
                              ↓
                    VehicleVisualPackageV1
                              ↓
        sealed ownership graph → draw plan → GPU asset

static scene package → same CPU/GPU mesh path
native_jv_wasm later → same visual frame contract
```
