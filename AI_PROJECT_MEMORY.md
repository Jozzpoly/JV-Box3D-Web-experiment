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
exact candidate: git rev-parse HEAD or PR head SHA
```

Do not merge, mark Ready, change visibility or enable Pages without Jozz. Do not fast-forward the long experimental history into public `main`; prefer a clean snapshot repository or owner-reviewed squash later.

Git Diff Patcher Bridge is forbidden. Use the GitHub connector and ordinary Git only. Do not add custom Actions without explicit owner approval.

## Evidence boundary

### Exact green vehicle-asset foundation checkpoint

```text
commit: d6aa218064c2653f918cf7956d2fcd20a940caf3
Node/npm: 24.16.0 / 11.17.0
receipt: byte-exact
npm ci: PASS
vulnerabilities: 0
TypeScript: PASS
tests: 218/218 PASS
docs links: PASS
third-party notices: PASS
Vite production build: PASS
portable static/runtime/vehicle/path/privacy/network/HTTP: PASS
root + repository-subpath HTTP: PASS
publication: NOT PERFORMED
```

The generated tiny package at this checkpoint was:

```text
2628 bytes
SHA-256 b243bf5ae6ed0b185885b6d341ab0a12fd377743408040e14226c1fecbb31281
26 nodes
24 triangles
336 decoded geometry bytes
```

Non-blocking bundle warnings remain:

```text
box3d.js imports browser-externalized node:module
main bundle is about 1.22 MiB / 391 KiB gzip
```

### Owner browser evidence for the same checkpoint

Jozz confirmed desktop and phone operation after the full gate:

```text
browser works
mobile works
vehicle visible
controls work
destroy/rebuild works
```

Treat this as manual owner evidence. Tiny GLB was packaged but still not drawn.

### Current post-gate preparation candidate

After `d6aa218…`, the branch adds a source-only renderer preparation:

```text
one existing WebGL context remains authoritative
owned BEFORE_DEBUG_VEHICLE / AFTER_DEBUG_VEHICLE render passes
async installation tied to AbortSignal
a late pass is disposed after renderer shutdown
one pass failure is isolated from the debug observer
reverse-order, idempotent pass disposal
debug vehicle visibility can be switched without replacing camera/grid
shared WebGL baseline is restored between passes
```

The first unlit draw capability is explicitly narrower than the transport decoder:

```text
accepted by unlit renderer: POSITION + baseColorFactor + doubleSided
rejected before GPU allocation: NORMAL, TEXCOORD_0
```

The CPU decoder may still transport optional NORMAL/TEXCOORD_0 for later renderers. No renderer may silently ignore them; each draw implementation must validate its own capability before GPU publication.

The exact current post-gate head requires a fresh local gate and unchanged browser/mobile smoke. Never attribute the `d6aa218…` green result to a newer head.

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
renderer-specific capability gate
        ↓
transactional GPU buffers
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

### GLB transport subset

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
- non-triangle primitives, extensions and 32-bit indices;
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

`StaticSceneVisualPackageV1` is source-present but inactive. It pins metre/JV axes, GLB bytes, `worldFromAsset`, local-origin radius and CPU budgets.

Reuse the vehicle CPU/GPU mesh path. Do not reuse vehicle bindings. Keep visual scan and collision separate. Real scan import waits until tiny vehicle rendering is proven on phone.

## Immediate sequence

```text
1 full local gate on the exact post-gate preparation head
2 unchanged debug-renderer desktop/LAN/phone smoke
3 implement one unlit tiny-vehicle render pass through installRenderPass()
4 validate unlit capability before GPU allocation
5 build live draw plans from trace.visualFrame
6 prove all 18 parts + 8 segments, pass failure fallback and context lifecycle
7 prove destroy/rebuild and phone performance
8 owner-authored simple chassis + four wheels
9 normals + simple base-colour lighting with a new capability profile
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
2. `docs/ARCHITECTURE.md`
3. `docs/contracts/VEHICLE_VISUAL_PACKAGE_V1.md`
4. `docs/contracts/STATIC_SCENE_VISUAL_PACKAGE_V1.md`
5. `docs/contracts/SCENE_PACKAGE_V1.md`
6. `docs/decisions/ADR-0003-native-jv-core-wasm.md`

## Immediate boundary

```text
GREEN AT d6aa218…:
vehicle visual CPU/GPU foundation
218 tests
portable tiny package
unchanged desktop/mobile debug runtime

SOURCE PRESENT / FRESH GATE PENDING:
shared WebGL render-pass host
pass lifecycle/error isolation
unlit capability gate
pre-GPU runtime validation hook

NOT YET ACTIVE IN BROWSER:
tiny GLB load/render
GLB shader/material draw code
normals/lighting
textures
real scan
```
