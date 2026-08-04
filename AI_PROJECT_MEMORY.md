# AI project memory — JV Web

Updated: 2026-08-04
Status: `READ FIRST`
Owner: Jozz

## Mission

Build a serious browser demonstrator for Jozz Vehicle that can later run the same native vehicle core on desktop and WebAssembly, support mobile controls and drive through prepared real-world scenes.

The repository should remain compact, readable and technically honest. Preserve durable knowledge, not every experimental branch or process artifact.

## Active line

```text
branch: agent/jv-web-demonstrator-foundation
PR: #18, direct to main, draft
older PRs: closed as historical
```

Do not merge, mark Ready, change repository visibility or enable Pages without Jozz.

Jozz has explicitly authorized deletion of obsolete branches and files. Keep only material with real continuing value; do not turn the repository into an archive museum.

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

## Validation boundary

Last complete local run on an earlier head:

```text
Node 24.16.0
npm 11.17.0
109 tests: 108 PASS / 1 report-sanitizer FAIL
```

The sanitizer case was corrected afterward, but the current simplified head still needs a fresh full local gate. Never claim current PASS before that execution.

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
- keep progress updates concrete during long work.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DEVELOPMENT.md`
4. `docs/contracts/STEERING_COMMAND_CONTRACT_PL.md`
5. `docs/decisions/ADR-0003-native-jv-core-wasm.md`

## Immediate sequence

```text
1 simplify repository and active PR surface
2 run fresh Node 24 gate
3 inspect browser behavior and package
4 prune obsolete remote branches
5 decide project license before public visibility
6 fast-forward main only after Jozz accepts exact candidate
7 keep Pages disabled until the demonstrator is substantially stronger
```
