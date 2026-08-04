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
exact gate target: resolve with git rev-parse HEAD or the PR head SHA
code hardening checkpoint: 9429008a76ae6e9c62e534f2cee3443c4769d264
```

Only `main` and the active development branch remain remotely. Older PRs are closed as historical context.

Do not fast-forward the complete experimental history into a presentation-ready public default branch. At publication time prefer a clean demonstrator repository/snapshot; an owner-reviewed squash is the secondary option.

No merge, visibility, license or Pages decision has been made.

## Evidence checkpoints

### Logged and owner-validated mobile checkpoint

```text
commit: 7204993a0640e6cff0baa719d849a0b4368c15aa
Node: 24.16.0
npm: 11.17.0
receipt: byte-exact
npm ci / audit: PASS / 0 vulnerabilities observed
TypeScript: PASS
tests: 120/120 PASS
documentation and notices: PASS
Vite portable bundle: PASS
portable static/privacy/network/root+subpath HTTP: PASS
LAN HTTP without SubtleCrypto: PASS
localhost desktop: PASS
LAN desktop: PASS
real phone: PASS
Box3D / WebGL / keyboard / multi-touch: observed working
publication: NOT PERFORMED
```

The earlier attached terminal log belongs to this commit. The approximately 1.2 MiB JavaScript chunk remains a warning, not an observed functional failure.

### Scene/runtime owner smoke

After the scene/runtime hardening slice Jozz confirmed:

```text
LIVE
4 CONTACTS
vehicle visible
DRIVE / LEFT / RIGHT / BRAKE / REVERSE working
destroy and rebuild working
```

This is owner-observed runtime evidence.

### Visual-rig gate attempt

The exact local run at:

```text
commit: 49e9eec729101d11635a0dab05184ae1f97dd660
Node/npm: 24.16.0 / 11.17.0
receipt: byte-exact
TypeScript: PASS
tests: 161/162 PASS
```

failed only because `tests/f4-backend-contract.test.mjs` still expected the older, smaller backend object after descriptor consolidation. The actual host exposed the intended shared descriptor containing role, authority, parity, known mismatches and visual-frame contract version. The portable build was correctly not started after the failed test gate.

The stale expectation has been replaced with an identity assertion against the one shared frozen backend descriptor. The current PR head also hardens runtime immutability, mobile GLB policy and package-relative asset resolution. A fresh complete gate is still required.

## Current runtime

The demonstrator provides:

- deterministic fixed-step simulation with bounded catch-up;
- source-aware keyboard and Pointer Events timelines;
- simultaneous steering and throttle/brake multi-touch;
- safe lifecycle release and transactional rebuild;
- real Box3D WebAssembly worlds and contacts;
- an 18-body M6 reference topology with suspension and physical rack linkage;
- `RELEASE | POSITION | RATE` steering;
- reference drive, reverse, coast and braking;
- a dependency-free WebGL debug observer;
- a relative-path portable package working through localhost and ordinary LAN HTTP.

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

There is one concrete legacy backend descriptor shared by the M6 world and browser host. The confirmed drive mismatch remains recorded: native JV treats `maxDriveSpeed = 40` as a wheel motor rad/s limit; the TypeScript fixture historically interprets it as a linear target.

Do not add final drivetrain, suspension, tire, aero or steering mechanics to the TypeScript fixture.

## Scene foundation

`ScenePackageV1` defines:

```text
units: meter
forward: +X
up: +Y
right: +Z
spawn: position + yaw
render: NONE | GLB
collision: BUILTIN_GROUND_PLANE | TRIANGLE_MESH
```

Canonical scene:

```text
public/scenes/synthetic-flat-lab.scene.json
```

The legacy backend currently accepts only the built-in plane at `y=0`, no render asset and zero spawn yaw. Unsupported features fail closed. The synthetic scene is a required portable runtime asset beside the native receipt.

## Vehicle model and rigid-rig foundation candidate

The current **unvalidated** PR head prepares model, rig, wheel and suspension assets without loading the final model yet.

### Runtime visual frame

`VehicleVisualFrameV1` contains no Box3D IDs. The M6 fixture emits:

```text
18 rigid part transforms:
  chassis
  rack
  4 wheels
  4 knuckles
  4 upper arms
  4 lower arms

8 exact physical segments:
  4 coilovers
  4 steering links
```

Segment endpoints come from the exact local anchors used to create the Box3D joints. Arm/knuckle/wheel transforms are copied from their real bodies after each step.

Legacy trace fields remain temporarily for the debug renderer. `visualFrame` is the new model/WASM seam; removal of duplicate trace-v1 fields requires an explicit future trace-v2 migration.

Frame indexes now expose real read-only views without runtime `set`, `delete` or `clear` methods.

### Asset package

`VehicleVisualPackageV1` defines one self-contained GLB with:

- meters and the JV axis convention;
- exact SHA-256 and byte length;
- stable `partId` / `segmentId` bindings;
- `PART`, `SEGMENT_STRETCH` and `SEGMENT_ENDPOINT_AIM` modes;
- positive explicit correction transforms;
- complete `M6_FULL_RIG_V1` coverage.

V1 deliberately uses a rigid-node rig rather than a skinned character rig. Skins, animation-driven physics, morph targets, external resources and negative scale are rejected.

### GLB byte and runtime gate

Before future parsing or GPU upload the asset gate checks:

- GLB v2 magic, chunks and declared length;
- exact package bytes and SHA-256;
- exactly one embedded BIN buffer;
- bufferView/accessor ranges and alignment;
- real FLOAT-VEC3 triangle geometry;
- 8-bit or 16-bit index accessors for WebGL1 portability;
- unique bound node names;
- bound nodes are independent roots with applied identity transforms;
- no external URI, skin, animation, morph, sparse accessor or extension;
- all required bound nodes present.

Asset URLs resolve relative to the visual-package manifest directory and preserve the same relation at the site root and repository subpath.

A dependency-free local inspector is available as:

```text
npm run inspect:vehicle-glb -- <model.glb> [vehicle.visual.json]
```

Authoring rules are in `docs/contracts/VEHICLE_VISUAL_PACKAGE_V1.md`.

## Deliberate limitations

- the exact current PR head has not passed its fresh Node/build gate;
- no GLB model is loaded by the browser yet;
- no GPU mesh/material/texture loader yet;
- no final Jozz vehicle asset or visual package manifest yet;
- no deformable tire contract;
- no scene triangle-mesh collision loader;
- initial camera orientation still starts on the old side;
- no native JV WASM backend;
- no project reuse license;
- repository remains private and Pages disabled.

## Correct next sequence

```text
1 resolve and validate the exact current PR head with the complete Node 24 gate
2 repair only demonstrated compile/test/build failures
3 perform a short unchanged debug-renderer smoke if the gate is green
4 create one tiny generated GLB + package as a real portable runtime fixture
5 implement transactional GLB byte load and CPU parse
6 define and test transform composition, including SEGMENT_STRETCH baseline semantics
7 render tiny rigid nodes beside the unchanged debug renderer
8 drive all 18 parts and 8 segments from VehicleVisualFrameV1
9 validate disposal/rebuild and phone performance
10 import the first owner-authored chassis + four-wheel asset
11 add knuckles, arms, steering links and two-piece coilovers
12 only then integrate the full body/interior/wheel model
```

The final vehicle asset must not be the first file that tests the loader, node binding, transform math or GPU lifecycle.

## Long-term architecture

```text
device input
    ↓
semantic fixed-step commands
    ↓
VehicleRuntimeBackend
    ↓
legacy_ts_m6 now / native_jv_wasm later
    ↓
VehicleVisualFrameV1
    ↓
VehicleVisualPackageV1 bindings
    ↓
GLB rigid nodes / renderer
```

Native JV Core + Box3D compiled into one WASM module remains the future product physics authority. The same visual frame contract should let the browser replace the reference backend without reauthoring the vehicle model.
