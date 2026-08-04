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
current exact candidate: git rev-parse HEAD or PR head SHA
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

The uploaded terminal log is for this commit. The software SHA fallback is required for strict receipt validation on ordinary LAN HTTP.

### Newer owner runtime observation

After scene/runtime hardening Jozz confirmed LIVE, 4 contacts, vehicle visible, all drive controls and destroy/rebuild working. Treat this as manual runtime evidence; the attached log still identifies `7204993…`.

### Current candidate

Vehicle model/rig source is present and statically reviewed but has **not** passed a fresh local gate. Never claim it is compiled or working before the owner gate.

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

Reject in V1:

- external resources;
- negative scale;
- missing/duplicate bound nodes;
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
1 fresh local gate on current visual-rig source
2 tiny generated renderable GLB + strict package fixture
3 transactional fetch/hash/GLB CPU parse
4 minimal mesh renderer beside unchanged debug observer
5 drive all 18 rigid parts and 8 segments from visual frame
6 prove rebuild/disposal and phone budget
7 owner-authored simple chassis + four wheels
8 knuckles, arms, tie rods and two-piece coilovers
9 full body/interior/wheel asset
10 optional LOD/compression only from measured need
```

The final Jozz model must never be the first loader/GPU lifecycle test.

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
strict GLB package and byte gate
real Box3D visual-frame integration
local GLB inspector
focused positive/negative tests

PENDING:
TypeScript/test/build gate
browser regression smoke

AFTER GREEN:
tiny runtime GLB fixture and CPU parser
then minimal rendering
```
