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

Jozz explicitly authorized removal of obsolete branches and files. Fourteen obsolete remote branches were removed after a green local gate. Keep only material with continuing engineering value; do not rebuild an archive museum.

The active branch remains a long experimental descendant of `main`. Do not fast-forward that complete history into a presentation-ready public default branch. At publication time prefer a clean demonstrator repository/snapshot; an owner-reviewed squash is the secondary option.

## Physics authority

```text
legacy_ts_m6 = browser reference fixture
productPhysicsAuthority = false
nativeParity = NOT_PROVEN
```

Product physics belongs in native JV Core compiled together with Box3D into one WASM module. Do not add new product drivetrain, suspension, tire, aero or steering mechanics to the TypeScript fixture.

Confirmed semantic mismatch:

```text
native maxDriveSpeed = 40 rad/s wheel motor limit
legacy TypeScript     = historically treated as linear target
```

## Steering rules

```text
SteeringCommand = RELEASE | POSITION | RATE
RELEASE = hands off in the first fixed step
```

No hidden return-to-centre, centre hold, upright stabilization or speed-sensitive steering in the default path. Optional assists must be explicit and disabled by default.

## Last green foundation checkpoint

```text
commit: db7768ebc5d191d96c7ff0022572093c00549453
Node: 24.16.0
npm: 11.17.0
receipt: byte-exact
npm ci: PASS
npm audit: 0 vulnerabilities observed
TypeScript: PASS
tests: 96/96 PASS
docs links: PASS
third-party verification: PASS
Vite bundle: PASS
portable static/privacy/network/root+subpath HTTP: PASS
publication: NOT PERFORMED
```

## Current mobile-control candidate

```text
exact head: resolve from Git/PR; never hard-code a moving candidate SHA in tracked memory
state: SOURCE PRESENT / STATIC SCOPE REVIEWED
local Node 24 gate: PENDING
browser observation: PENDING
real phone observation: PENDING
```

The mobile slice adds:

- source-aware steering and longitudinal timelines;
- owned Pointer Events controls;
- simultaneous steering + drive/brake multi-touch;
- source-scoped lifecycle release;
- browser-host ownership and F4 pass-through;
- a five-button responsive safe-area UI;
- focused overlap/capture/cancel/rollback/disposal tests;
- a source-level 320 px geometry contract.

No vehicle, physics or renderer mechanics were changed from the green checkpoint.

## Multi-source input requirement

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

## Corrected near-term direction

```text
1 run fresh Node 24 gate on the exact mobile-control head
2 perform exact desktop browser smoke
3 validate mobile controls on a real phone over LAN
4 polish control geometry and layout from observed evidence
5 implement a minimal scene package on a synthetic scene
6 import and optimize the real scan
7 choose license and clean public-history strategy
8 publish only an owner-accepted exact package
9 begin native JV WASM parity after host/input/scene seams stabilize
```

Native WASM is the long-term authority, not the immediate next milestone. The current reference fixture is sufficient to develop mobile input, UI, camera, scene packaging and distribution without growing its vehicle mechanics.

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
3. `docs/DEVELOPMENT.md`
4. `docs/contracts/STEERING_COMMAND_CONTRACT_PL.md`
5. `docs/decisions/ADR-0003-native-jv-core-wasm.md`

## Immediate sequence

```text
A local gate on exact current head
B repair only demonstrated failures
C desktop browser smoke
D real phone multi-touch/lifecycle/layout gate
E focused mobile polish
F synthetic scene foundation
```
