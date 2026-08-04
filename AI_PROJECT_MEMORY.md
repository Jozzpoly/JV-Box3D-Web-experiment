# AI project memory — JV Web

Updated: 2026-08-04
Status: `READ FIRST`
Owner: Jozz

## Mission

Build a serious browser demonstrator for Jozz Vehicle that runs on desktop and phone, uses deliberate mobile controls, supports owner-authored vehicle/scene assets and later replaces the reference physics with native JV Core + Box3D compiled into one WebAssembly module.

Keep the repository compact, readable and technically honest. Preserve durable contracts and evidence, not every historical experiment.

## Active line

```text
branch: agent/jv-web-demonstrator-foundation
PR: #18, direct to main, draft
remote branches: main + active branch only
exact gate target: resolve from git rev-parse HEAD or PR head SHA
code hardening checkpoint before documentation sync: 9429008a76ae6e9c62e534f2cee3443c4769d264
```

Do not merge, mark Ready, change visibility or enable Pages without Jozz. Do not fast-forward the long experimental history into a presentation-ready public main; prefer a clean public snapshot repo or owner-reviewed squash later.

Git Diff Patcher Bridge is forbidden. Use GitHub connector and ordinary Git only. No custom Actions without explicit owner request.

## Evidence boundary

### Exact logged + owner-validated checkpoint

```text
commit: 7204993a0640e6cff0baa719d849a0b4368c15aa
Node/npm: 24.16.0 / 11.17.0
receipt: byte-exact
TypeScript: PASS
tests: 120/120 PASS
docs/notices/build/portable root+subpath HTTP: PASS
LAN HTTP without SubtleCrypto: PASS
localhost + LAN desktop + real phone: PASS
Box3D / WebGL / keyboard / multi-touch: observed working
publication: NOT PERFORMED
```

The software SHA fallback is required for strict receipt validation on ordinary LAN HTTP.

### Newer owner runtime observation

After scene/runtime hardening Jozz confirmed LIVE, 4 contacts, vehicle visible, all drive controls and destroy/rebuild working. Treat this as manual runtime evidence.

### Visual-rig gate attempt

At `49e9eec729101d11635a0dab05184ae1f97dd660`:

```text
Node/npm: 24.16.0 / 11.17.0
receipt: byte-exact
TypeScript: PASS
tests: 161/162 PASS
```

The only failure was a stale `f4-backend-contract` expectation that compared the host backend with the older descriptor shape. Runtime exposed the intended consolidated descriptor. Build correctly stopped after the failed test.

The stale test is fixed by asserting object identity with the one shared frozen backend descriptor. The exact current PR head additionally hardens runtime immutability, GLB mobile policy and manifest-relative URL resolution. It still requires a fresh complete owner gate; never claim it is green before that log.

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

There is one concrete legacy descriptor shared across runtime and M6 modules. Confirmed mismatch:

```text
native maxDriveSpeed = 40 rad/s wheel limit
legacy TypeScript     = chassis-linear target semantics
```

Do not add final drivetrain, suspension, tire, aero or steering mechanics to the TypeScript fixture.

## Existing browser foundation

- deterministic fixed-step host;
- source-aware keyboard and multi-touch Pointer Events input;
- fail-safe lifecycle release and transactional rebuild;
- real Box3D/WASM contacts;
- 18-body / 29-joint / 9-shape M6 fixture;
- physical rack `RELEASE | POSITION | RATE` steering;
- reference drive/brake/reverse;
- dependency-free WebGL debug observer;
- portable relative-path build;
- browser transport/capability report;
- strict `ScenePackageV1` and synthetic scene-driven spawn.

## Vehicle visual architecture

### Do not use a character rig as the physics foundation

V1 is a rigid-part GLB node rig:

```text
physics/native snapshot
        ↓
VehicleVisualFrameV1
        ↓
stable partId / segmentId
        ↓
VehicleVisualPackageV1
        ↓
GLB nodes
```

GLB nodes never store or depend on `b3BodyId`/`b3JointId`. The visual model is read-only and never drives physics.

### Runtime channels

M6 visual frame provides exactly:

```text
18 PART transforms:
  chassis, rack
  wheel/knuckle/upper-arm/lower-arm × 4

8 SEGMENT channels:
  coilover × 4
  steering-link × 4
```

Transforms come from real Box3D bodies. Segment endpoints come from the exact local anchors used to build the joints.

Runtime frame indexes expose no `set`, `delete` or `clear` mutators; do not replace them with a type-only `ReadonlyMap` over a mutable Map.

Wheel ownership:

```text
tire + rim + rotating disc → m6.<corner>.wheel
knuckle + fixed caliper    → m6.<corner>.knuckle
```

Coilover ownership:

```text
whole spring/rod → SEGMENT_STRETCH
upper body       → START endpoint aim
lower shaft      → END endpoint aim
```

### Asset package

`VehicleVisualPackageV1` requires:

- one self-contained `.glb`;
- meters, +X forward, +Y up, +Z right;
- exact SHA-256 and byteLength;
- unique binding IDs and node names;
- positive correction transforms;
- complete `M6_FULL_RIG_V1` coverage;
- binding modes `PART`, `SEGMENT_STRETCH`, `SEGMENT_ENDPOINT_AIM`.

### Executable GLB V1 policy

Before GPU use require:

```text
exactly one embedded BIN buffer
4-byte aligned bufferView offsets/strides
accessors aligned to component size
TRIANGLES only
8-bit or 16-bit indices only
bound nodes are independent roots
bound node matrix absent
bound node TRS identity/applied
asset URL resolved relative to package manifest directory
```

A bound root may own unbound static descendants. A descendant cannot itself be bound to another runtime source in V1.

Reject in V1:

- external resources;
- multiple embedded buffers;
- negative scale;
- missing/duplicate/parented bound nodes;
- non-identity bound transforms;
- 32-bit indices;
- skins;
- animations for physics parts;
- morph targets;
- sparse accessors;
- non-triangle primitives;
- unsupported GLB extensions;
- byte/hash drift.

Authoring contract: `docs/contracts/VEHICLE_VISUAL_PACKAGE_V1.md`.

Local inspection command:

```text
npm run inspect:vehicle-glb -- <model.glb> [vehicle.visual.json]
```

## Model implementation sequence

```text
1 fresh local gate on the exact current PR head
2 unchanged debug-renderer browser smoke
3 tiny generated GLB + strict package as a portable runtime fixture
4 transactional fetch/hash/CPU parse
5 define and test transform composition and SEGMENT_STRETCH baseline semantics
6 minimal mesh renderer beside unchanged debug observer
7 drive all 18 rigid parts and 8 segments from visual frame
8 prove rebuild/disposal and phone budget
9 owner-authored simple chassis + four wheels
10 knuckles, arms, tie rods and two-piece coilovers
11 full body/interior/wheel asset
12 optional LOD/compression only from measured need
```

The final Jozz model must never be the first loader/transform/GPU lifecycle test.

## Scene and native direction

`ScenePackageV1` remains strict. Current backend supports only the synthetic built-in plane. Real GLB scene and triangle collision loaders come after the vehicle tiny-fixture path is stable.

Long-term product physics:

```text
native JV Core + Box3D
        ↓ one WASM module
stable C ABI + immutable snapshots
        ↓
VehicleVisualFrameV1
        ↓
existing TypeScript renderer/assets/UI
```

## Working rules

- communicate with Jozz in Polish;
- distinguish source presence, automated PASS, browser observation and owner acceptance;
- no hidden physics assists or automatic steering centering;
- no destructive local reset/clean/stash unless explicitly necessary;
- preserve exact receipt and dependency identities;
- use one safe pasteable local command for owner validation;
- keep progress updates concrete;
- do not rebuild documentation bureaucracy.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/contracts/VEHICLE_VISUAL_PACKAGE_V1.md`
3. `docs/ARCHITECTURE.md`
4. `docs/contracts/SCENE_PACKAGE_V1.md`
5. `docs/contracts/STEERING_COMMAND_CONTRACT_PL.md`
6. `docs/decisions/ADR-0003-native-jv-core-wasm.md`

## Immediate boundary

```text
SOURCE PRESENT:
visual frame v1
M6 stable part/segment identities
strict GLB package, byte gate and mobile runtime policy
real Box3D visual-frame integration
manifest-relative vehicle asset URL resolver
local GLB inspector
focused positive/negative tests

PENDING:
fresh TypeScript/test/build gate on exact current PR head
browser regression smoke

AFTER GREEN:
tiny portable runtime GLB fixture and CPU parser
then transform math and minimal rendering
```
