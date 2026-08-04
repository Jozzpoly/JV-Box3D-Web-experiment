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
current candidate: resolve with git rev-parse HEAD or the PR head SHA
```

All older pull requests are closed as historical. The remote branch surface contains only `main` and the active development branch.

Do not fast-forward the complete experimental history into a presentation-ready public default branch. At publication time prefer a clean demonstrator repository/snapshot; an owner-reviewed squash is the secondary option.

No merge, visibility, license or Pages decision has been made.

## Latest owner-validated mobile checkpoint

```text
commit: 7204993a0640e6cff0baa719d849a0b4368c15aa
Node: 24.16.0
npm: 11.17.0
receipt: byte-exact
npm ci: PASS
npm audit: 0 vulnerabilities observed
TypeScript: PASS
tests: 120/120 PASS
documentation links: PASS
third-party verification: PASS
Vite production bundle: PASS
portable static validation: PASS
portable manifest privacy: PASS
portable network policy: PASS
portable HTTP at /: PASS
portable HTTP at /JV-Box3D-Web-experiment/: PASS
LAN HTTP without SubtleCrypto: PASS
localhost browser: PASS
LAN desktop browser: PASS
real phone browser: PASS
Box3D / WebGL / keyboard / multi-touch: observed working
publication: NOT PERFORMED
```

The approximately 1.2 MiB JavaScript chunk remains a recorded warning, not an observed functional failure.

## Current runtime

The working demonstrator provides:

- deterministic fixed-step simulation with bounded catch-up;
- source-aware timestamped keyboard and Pointer Events input;
- simultaneous steering and throttle/brake multi-touch;
- release on pointer cancel, lost capture, blur, hidden page, pagehide and disposal;
- real Box3D WebAssembly worlds and contacts;
- an 18-body M6 reference topology with physical suspension and rack linkage;
- `RELEASE | POSITION | RATE` steering;
- reference wheel-joint drive, reverse, coast and braking;
- immutable renderer-safe trace values;
- a dependency-free WebGL observer;
- transactional startup, rollback, disposal and rebuild;
- a relative-path portable package that works through localhost and ordinary LAN HTTP.

## Physics authority

```text
backend: legacy_ts_m6
role: browser reference fixture
product physics authority: false
native JV parity: NOT_PROVEN
command contract: v1
trace contract: v1
```

The backend identity is now a runtime-owned descriptor rather than documentation-only metadata. The legacy backend cannot elevate itself to product authority or proven native parity.

One confirmed mismatch remains: native JV treats `maxDriveSpeed = 40` as a wheel motor limit in rad/s; the TypeScript fixture historically interpreted it as a linear target.

Do not add final drivetrain, suspension, tire, aero or steering mechanics to the TypeScript fixture.

## Browser environment hardening

The runtime now reports:

- secure, loopback HTTP, LAN HTTP or other transport class;
- Web Crypto digest availability;
- local software SHA fallback availability;
- WebGL API and Pointer Events presence;
- touch-point count and coarse-pointer status;
- viewport dimensions and device-pixel ratio.

Receipt validation remains fail-closed. HTTPS/localhost may use Web Crypto; ordinary LAN HTTP uses the tested local SHA-1/SHA-256 fallback without disabling integrity checks.

## Scene foundation candidate

The current unvalidated hardening slice adds `ScenePackageV1` and a canonical synthetic scene:

```text
public/scenes/synthetic-flat-lab.scene.json
```

V1 defines only:

- scene identity and display name;
- meters as the unit;
- `+X` forward, `+Y` up, `+Z` right;
- spawn position and yaw;
- render source: `NONE | GLB`;
- collision source: `BUILTIN_GROUND_PLANE | TRIANGLE_MESH`;
- site-relative asset URLs and lowercase SHA-256 fields.

The application now loads and validates the scene package before starting physics. The current legacy backend accepts only:

```text
render = NONE
collision = BUILTIN_GROUND_PLANE at y=0
spawn yawRadians = 0
```

GLB rendering and triangle-mesh collision are described by the contract but deliberately rejected until their loaders exist.

The synthetic scene is a required portable runtime asset alongside the native receipt.

## Target architecture

```text
device adapters
      ↓
source-aware semantic timelines
      ↓
fixed-step browser host
      ↓
VehicleRuntimeBackend seam
      ↓
legacy_ts_m6 now / native_jv_wasm later
      ↓
immutable trace contract
      ↓
renderer, UI and scene host
```

Long-term product physics remains:

```text
native JV Core + Box3D source
              ↓
       one WASM module
              ↓
 stable C ABI + immutable snapshots
              ↓
 TypeScript browser host, renderer and scene system
```

## Current candidate boundary

```text
SOURCE PRESENT:
backend descriptor and host seam
browser runtime diagnostics
ScenePackageV1 validator and loader
synthetic scene manifest
scene-driven spawn
portable runtime-asset gate
focused contract tests

STILL PENDING:
fresh local Node 24 gate
exact desktop browser smoke after scene integration
exact phone smoke after scene integration
```

No current hardening change modifies vehicle physics, steering mechanics, drive mechanics, Box3D topology or mobile input feel.

## Deliberate limitations

- no approved steering-rate product default;
- no final drivetrain model;
- legacy split-sphere wheel only;
- no native JV WASM backend;
- no GLB renderer or triangle-mesh collision loader;
- no real scan package yet;
- diagnostic visuals only;
- initial camera orientation still needs a separate owner-validated correction;
- no project reuse license selected;
- repository remains private and Pages remains disabled.

## Next sequence

### 1. Validate the hardening slice

Run the complete Node 24 gate on the exact current head. Then perform a short desktop and phone smoke proving that the synthetic scene loads and the previous runtime remains unchanged.

### 2. Correct and validate the initial camera pose

Change only the initial yaw so the observer begins behind the vehicle. Preserve the already accepted drag directions.

### 3. Separate the demonstrator view from bootstrap

After another green checkpoint, extract HTML/telemetry bindings from `main.ts` without changing behavior. Do not combine this refactor with GLB or collision implementation.

### 4. Implement the synthetic scene host

Introduce a scene runtime that owns render and collision resources. First support the current built-in plane through the same interface that later accepts assets.

### 5. Add real scene assets incrementally

Order:

```text
small GLB render fixture
small collision fixture
spawn/alignment validation
mobile performance budget
real scan conversion and optimization
```

### 6. Publication and native WASM

Only after the mobile scene demonstrator is owner-accepted:

- choose license and clean public-history strategy;
- prepare the exact shareable package;
- enable Pages only with explicit owner approval;
- begin behavior-preserving native JV WASM parity work.
