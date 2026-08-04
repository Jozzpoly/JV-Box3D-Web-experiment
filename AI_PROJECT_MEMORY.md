# AI project memory — JV Web

Updated: 2026-08-04
Status: `READ FIRST`
Owner: Jozz

## Mission

Build a serious browser demonstrator for Jozz Vehicle that can run on desktop and phone, use deliberately designed mobile controls, drive through prepared real-world scenes and later replace the reference physics with the same native JV core compiled to WebAssembly.

The repository must remain compact, readable and technically honest. Preserve durable knowledge, not every experimental branch or process artifact.

## Active line

```text
branch: agent/jv-web-demonstrator-foundation
PR: #18, direct to main, draft
remote branches: main + active branch only
older PRs: closed as historical
```

Do not merge, mark Ready, change repository visibility or enable Pages without Jozz.

Jozz explicitly authorized removal of obsolete branches and files. Fourteen obsolete remote branches were removed after a green local gate. Keep only material with continuing engineering value; do not rebuild an archive museum.

The active branch remains a 410-commit experimental descendant of `main`. Do not fast-forward that whole history into a presentation-ready public default branch. At publication time prefer a clean demonstrator repository/snapshot; an owner-reviewed squash is the secondary option.

## Current implementation

- deterministic fixed-step browser host;
- timestamped steering and longitudinal input;
- real Box3D/WASM contacts;
- current M6 reference topology;
- physical rack steering;
- minimal wheel-motor drive and braking;
- read-only WebGL observer;
- portable relative-path build.

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

## Validated foundation checkpoint

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

This is source/test/package evidence. Exact current-head desktop-browser and real-phone execution remain separate manual gates.

## Corrected near-term direction

```text
1 keep documentation synchronized with measured truth
2 perform exact desktop browser smoke
3 make semantic timelines source-aware
4 implement mobile Pointer Events controls on the same timelines
5 validate multi-touch/lifecycle/layout on a real phone over LAN
6 implement a minimal scene package on a synthetic scene
7 import and optimize the real scan
8 choose license and clean public-history strategy
9 publish only an owner-accepted exact package
10 begin native JV WASM parity after host/input/scene seams stabilize
```

Native WASM is the long-term authority, not the immediate next milestone. The current reference fixture is sufficient to develop mobile input, UI, camera, scene packaging and distribution without growing its vehicle mechanics.

## Multi-source input requirement

Current timelines historically stored one boolean per semantic control even though events carry `sourceId`. Before touch is added, timelines must track active sources per side/control so that overlapping keyboard, touch and future gamepad inputs cannot release one another.

Pointer controls must:

- use Pointer Events;
- allow simultaneous steering and drive/brake;
- assign one pointer to one control owner;
- release on pointerup, pointercancel, lostpointercapture, blur, visibility hidden, pagehide and dispose;
- use safe timestamps clamped to the consumed timeline cursor;
- never manipulate physics or Box3D directly;
- never let camera handling steal an owned control pointer.

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

## Immediate implementation sequence

```text
A source-aware steering and longitudinal timelines
B adversarial overlap tests across input sources
C pointer-control adapter with strict lifecycle ownership
D host integration without physics changes
E compact mobile control overlay and responsive layout
F fresh local gate
G desktop browser + real phone validation
```
