# AI project memory — JV Web

Updated: 2026-08-04
Status: `READ FIRST`
Owner: Jozz

## Mission

Build a serious browser demonstrator for Jozz Vehicle that runs on desktop and phone, uses deliberately designed mobile controls, drives through prepared real-world scenes and later replaces the reference physics with the same native JV core compiled to WebAssembly.

The repository must remain compact, readable and technically honest. Preserve durable knowledge, not every experimental branch or process artifact.

## Active line

```text
branch: agent/jv-web-demonstrator-foundation
PR: #18, direct to main, draft
remote branches: main + active branch only
older PRs: closed as historical
current exact candidate: resolve with git rev-parse HEAD or the PR head SHA
```

Do not merge, mark Ready, change repository visibility or enable Pages without Jozz.

Jozz authorized removal of obsolete branches and files. Fourteen obsolete remote branches were removed after a green local gate. Keep only material with continuing engineering value; do not rebuild an archive museum.

The active branch is a long experimental descendant of `main`. Do not fast-forward that complete history into a presentation-ready public default branch. At publication time prefer a clean demonstrator repository/snapshot; an owner-reviewed squash is the secondary option.

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
docs links: PASS
third-party verification: PASS
Vite bundle: PASS
portable static/privacy/network/root+subpath HTTP: PASS
LAN HTTP without SubtleCrypto: PASS
localhost browser: PASS
LAN desktop browser: PASS
real phone browser: PASS
Box3D / WebGL / keyboard / multi-touch: observed working
publication: NOT PERFORMED
```

The software SHA-1/SHA-256 fallback preserves receipt integrity on ordinary LAN HTTP where `crypto.subtle` is unavailable. Do not remove it or replace it with disabled validation.

## Physics authority

```text
backend: legacy_ts_m6
role: browser reference fixture
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
commandContractVersion: 1
traceContractVersion: 1
```

The backend identity is now represented by a runtime descriptor and exposed by `F4VehicleHost`.

Product physics belongs in native JV Core compiled together with Box3D into one WASM module. Do not add final drivetrain, suspension, tire, aero or steering mechanics to the TypeScript fixture.

Confirmed semantic mismatch:

```text
native maxDriveSpeed = 40 rad/s wheel motor limit
legacy TypeScript     = historically treated as linear target
```

## Steering and input rules

```text
SteeringCommand = RELEASE | POSITION | RATE
RELEASE = hands off in the first fixed step
```

No hidden return-to-centre, centre hold, upright stabilization or speed-sensitive steering in the default path. Optional assists must be explicit and disabled by default.

Each physical input stream has a stable `sourceId`. Semantic state is a set of active sources per side/control, not one global boolean.

```text
one pointerId -> one semantic control owner
```

Pointer controls must:

- use Pointer Events;
- allow simultaneous steering and drive/brake;
- capture before emitting `pressed=true`;
- fail closed when capture is unavailable;
- release on pointerup, pointercancel, lostpointercapture, blur, visibility hidden, pagehide and disposal;
- use timestamps clamped to the consumed timeline cursor;
- never manipulate physics or Box3D directly;
- never let camera handling steal an owned control pointer.

## Current hardening candidate

The current branch contains source that has not yet received its fresh local gate after the validated `7204993…` checkpoint.

Added boundaries:

```text
VehicleRuntimeBackend descriptor/seam
browser transport and capability report
ScenePackageV1 strict validator and loader
canonical synthetic scene manifest
scene-driven vehicle spawn
portable required-runtime-asset contract
focused backend/runtime/scene tests
```

No hardening change modifies vehicle physics, steering mechanics, drive mechanics, Box3D topology, input feel or renderer mechanics.

## ScenePackageV1 rules

Canonical scene:

```text
public/scenes/synthetic-flat-lab.scene.json
```

Coordinate contract:

```text
units: meter
forward: +X
up: +Y
right: +Z
```

V1 describes:

- scene identity;
- spawn position and yaw;
- render source: `NONE | GLB`;
- collision source: `BUILTIN_GROUND_PLANE | TRIANGLE_MESH`;
- clean site-relative asset URLs;
- lowercase SHA-256 fields for external scene assets.

The current `legacy_ts_m6` backend accepts only:

```text
render = NONE
collision = BUILTIN_GROUND_PLANE at y=0
spawn yawRadians = 0
```

GLB rendering and triangle-mesh collision are schema-ready but intentionally fail backend support until their loaders exist.

The portable runtime assets must include:

```text
receipts/jv_m6_factory_receipt.json
scenes/synthetic-flat-lab.scene.json
```

## Browser runtime report

The demonstrator reports:

- secure, loopback HTTP, LAN HTTP or other transport;
- Web Crypto digest availability;
- software SHA fallback availability;
- WebGL API and Pointer Events presence;
- touch/coarse-pointer state;
- viewport and device-pixel ratio.

This report is diagnostic. Actual renderer construction still determines whether WebGL starts.

## Corrected near-term sequence

```text
1 run fresh Node 24 gate on the exact hardening head
2 perform short desktop + phone smoke through the synthetic scene
3 correct only the initial camera yaw; preserve accepted drag directions
4 extract DOM/view bindings from main.ts without behavior changes
5 create a scene runtime that owns render and collision resources
6 validate a tiny GLB render fixture
7 validate a tiny collision fixture
8 convert and optimize the real scan
9 choose license and clean public-history strategy
10 publish only an owner-accepted exact package
11 begin native JV WASM parity after host/input/scene seams stabilize
```

Native WASM is the long-term physics authority, not the immediate next milestone.

## Working rules

- communicate with Jozz in Polish;
- use GitHub connector and ordinary Git only;
- Git Diff Patcher Bridge is forbidden;
- prefer one active branch and one active PR;
- close/delete obsolete branches after useful knowledge is compressed;
- no custom GitHub Actions unless Jozz explicitly asks;
- no destructive local reset/clean/stash without explicit need;
- preserve exact runtime configuration and dependency identities;
- distinguish source presence, automated tests, browser observation and owner acceptance;
- provide one safe pasteable local command when user validation becomes necessary;
- keep progress updates concrete during long work.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/ARCHITECTURE.md`
3. `docs/contracts/SCENE_PACKAGE_V1.md`
4. `docs/contracts/STEERING_COMMAND_CONTRACT_PL.md`
5. `docs/DEVELOPMENT.md`
6. `docs/decisions/ADR-0003-native-jv-core-wasm.md`

## Immediate boundary

```text
SOURCE PRESENT:
backend/runtime/scene contracts
synthetic scene startup
portable scene asset gate
focused tests

PENDING:
fresh local gate
desktop smoke
phone smoke

AFTER GREEN:
initial camera yaw
main.ts view/bootstrap extraction
scene runtime ownership
```
