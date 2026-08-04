# AI project memory — JV Web

Updated: 2026-08-04
Status: `READ FIRST`
Owner: Jozz

## Mission

Build a serious desktop/mobile browser demonstrator for Jozz Vehicle, support owner-authored vehicle and scene assets, and later replace reference physics with native JV Core + Box3D compiled into one WASM module.

Keep the repository compact, runnable and technically honest. Preserve durable contracts and evidence, not every historical experiment.

## Active line

```text
branch: agent/jv-web-demonstrator-foundation
PR: #18, direct to main, draft
remote branches: main + active branch only
exact candidate: git rev-parse HEAD or PR head SHA
```

Do not merge, mark Ready, change visibility or enable Pages without Jozz. Do not fast-forward the long experimental history into public `main`; prefer a clean snapshot repo or owner-reviewed squash later.

Git Diff Patcher Bridge is forbidden. Use GitHub connector and ordinary Git only. No custom Actions without explicit owner request.

## Evidence boundary

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

### Newer owner observation

Jozz later confirmed LIVE, four contacts, visible vehicle, every drive control and destroy/rebuild in desktop and mobile browsers. Treat this as manual evidence, not a fresh gate for the current visual-asset head.

### Historical failed gate

At `49e9eec…`, TypeScript passed and 161/162 tests passed. The only failure was a stale backend-object expectation after intended descriptor consolidation. It is fixed with an identity assertion against the shared frozen descriptor.

The exact current PR head still requires a complete local gate. Never claim the new CPU/GPU asset pipeline is green before that log.

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
- dependency-free WebGL debug observer;
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
rigid draw plan
        ↓
transactional GPU buffers
```

The model never drives physics and never stores `b3BodyId`/`b3JointId`.

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

Wheel ownership:

```text
tire + rim + rotating disc → wheel
a fixed caliper/upright    → knuckle
```

Coilover ownership:

```text
whole spring/rod → stretch
upper body       → START endpoint aim
lower shaft      → END endpoint aim
```

### GLB V1 subset

Require:

- one embedded BIN buffer;
- metre/JV axes;
- exact SHA-256 and byte length;
- aligned bufferViews/accessors;
- triangles with 8/16-bit indices;
- POSITION, optional NORMAL and TEXCOORD_0 only;
- finite POSITION min/max;
- unique, root, identity bound nodes;
- package-relative URLs.

Reject:

- images/textures until their own GPU/memory path exists;
- external URI;
- unknown vertex attributes;
- skins, animation, morph targets and sparse accessors;
- non-triangle primitives, GLB extensions and 32-bit indices;
- empty channels, unowned mesh nodes and byte/hash drift.

### Mobile geometry budget V1

```text
nodes:          512
primitives:     512
triangles:      300,000
materials:      64
geometry bytes: 64 MiB
```

Raise limits only from real-phone evidence.

### Deterministic proof asset

Generated before dev/build and ignored as reproducible output:

```text
public/vehicles/tiny/vehicle.visual.json
public/vehicles/tiny/models/m6-rig-proof.glb
```

It contains 18 small part boxes and 8 one-metre segment rods using two shared meshes/materials. The portable manifest requires both, and the portable vehicle gate checks manifest ↔ GLB bytes ↔ CPU ownership.

### Tools

```text
npm run inspect:vehicle-glb -- <model.glb> <vehicle.visual.json>
```

Reports bytes, feature policy, ownership, decoded counts and geometry budget.

## Preliminary scan direction

`StaticSceneVisualPackageV1` is source-present but not active. It pins metre/JV axes, GLB bytes, `worldFromAsset`, local-origin radius and CPU budgets.

Reuse the vehicle CPU/GPU mesh path. Do not reuse vehicle bindings. Keep visual scan and collision separate. Real scan import waits until tiny vehicle rendering is proven on phone.

Read `docs/contracts/STATIC_SCENE_VISUAL_PACKAGE_V1.md`.

## Immediate sequence

```text
1 full local gate on exact current PR head
2 unchanged debug-renderer desktop/LAN/phone smoke
3 browser-load generated tiny vehicle package
4 compile draw plan from live VehicleVisualFrameV1
5 minimal shader/draw layer beside debug observer
6 prove 18 parts + 8 segments, disposal/rebuild and phone performance
7 owner-authored simple chassis + four wheels
8 knuckles, arms, links and two-piece coilovers
9 normals/base-colour lighting
10 embedded texture ownership + texture budgets
11 full vehicle model
12 first static scan visual fixture
```

The full owner model must not be the first asset testing load, transforms or GPU lifecycle.

## Working rules

- communicate with Jozz in Polish;
- distinguish source presence, automated PASS, browser observation and owner acceptance;
- no hidden physics assists or automatic centering;
- no destructive local reset/clean/stash unless explicitly necessary;
- preserve exact receipt and dependency identities;
- give one safe pasteable command for owner validation;
- keep progress updates concrete;
- do not rebuild documentation bureaucracy.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/contracts/VEHICLE_VISUAL_PACKAGE_V1.md`
3. `docs/contracts/STATIC_SCENE_VISUAL_PACKAGE_V1.md`
4. `docs/ARCHITECTURE.md`
5. `docs/contracts/SCENE_PACKAGE_V1.md`
6. `docs/decisions/ADR-0003-native-jv-core-wasm.md`

## Immediate boundary

```text
SOURCE PRESENT / GATE PENDING:
visual transform math
transactional package loader
strict CPU decoder/seal/ownership/budgets
generic draw plan
transactional GPU buffer asset
deterministic portable tiny rig
preliminary static scan contract

NOT YET ACTIVE IN BROWSER:
tiny GLB load/render
GLB shader/material layer
textures
real scan
```
