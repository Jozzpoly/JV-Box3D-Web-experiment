# AI project memory — JV Box3D Web

Updated: 2026-08-04
Status: `CANONICAL / READ_FIRST`
Owner: Jozz

## 1. Current mission

Build a serious JV Web Demonstrator that:

- runs on desktop and phone;
- has deliberately designed mobile controls;
- eventually drives over an optimized scan;
- can be shared through GitHub Pages without a custom server;
- uses truthful backend/parity labels;
- remains a useful future JES research surface.

Do not evolve a second product physics implementation in TypeScript.

Read:

```text
docs/PROJECT_STATE.md
docs/REFOUNDATION_LOOP_PL.md
docs/DEMONSTRATOR_VALIDATION_POLISH_LOOP_PL.md
docs/decisions/ADR-0003-native-jv-core-wasm.md
docs/decisions/ADR-0004-pages-ready-demonstrator.md
```

## 2. Active branch and proven base

Proven refoundation base:

```text
agent/jv-web-refoundation
f06853467408d6c633ca806d985062c634b3a666
```

Active branch:

```text
agent/jv-web-demonstrator-foundation
```

Do not merge, mark ready, change visibility or enable Pages without Jozz.

## 3. Validated reference runtime

Exact refoundation head passed locally:

```text
Node 24.16.0
npm 11.17.0
native receipt byte-exact
Markdown links PASS
TypeScript PASS
77/77 tests PASS
Vite build PASS
```

Earlier owner browser smoke confirmed physical driving.

Reference backend:

```text
id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
acceptsNewProductPhysics: false
```

## 4. Critical drive mismatch

Native JV:

```text
maxDriveSpeed unit = rad/s
motor target = ±maxDriveSpeed
throttle scales available torque
wheel spin drives torque taper
```

TypeScript fixture:

```text
maxDriveSpeed interpreted as m/s
target wheel speed = throttle * value / wheelRadius
chassis speed drives torque taper
```

Pinned values imply approximately:

```text
native target 40 rad/s
legacy TS target 77.8 rad/s at full throttle
```

Drive direction/liveness/determinism PASS did not prove native behavior.

Do not add product drivetrain, anti-roll, aero, tire or suspension mechanics to `legacy_ts_m6`.

## 5. Accepted architecture

```text
Box3D source + portable native JV Core
                    ↓
          one WebAssembly module
                    ↓
      stable C ABI + immutable snapshots
                    ↓
 TypeScript input/render/mobile/scene/UI host
```

ABI requires explicit unit suffixes, coordinate frames, opaque generational handles, stable `partId`, immutable snapshots, memory lifetime, structured errors and native/WASM traces.

First native compile set uses unchanged M5/M6 source plus a thin adapter. Obtain native/WASM POSITION baseline before structural refactor or native RATE work.

## 6. Two synchronized tracks

### Track A — demonstrator shell

Allowed on frozen `legacy_ts_m6`:

- portable package and Pages compatibility;
- Demo/Lab separation;
- loading/error UX;
- mobile shell and touch ownership;
- camera/reset;
- scene manifest and synthetic campus;
- render quality profiles;
- LAN phone testing.

No new product physics.

### Track B — physics authority

- Box3D + JV Core WASM;
- ABI and stable IDs;
- native/WASM parity corpus;
- backend swap;
- future Wheel Scope seam.

## 7. Demonstrator/public decision

Jozz decided that the repository will become public after a dedicated gate. This is not permission to change visibility immediately.

Required sequence:

```text
PUBLIC-READY PASS
→ explicit owner approval for exact head
→ manual repository visibility change
→ PAGES-PUBLISH PASS
→ manual Pages enablement
```

Current status:

```text
repository: PRIVATE
Pages: DISABLED
LICENSE: MISSING / DECISION PENDING
THIRD_PARTY_NOTICES.md: MISSING
current/history audit tool: PRESENT / NOT RUN
GitHub metadata audit: STARTED
public README: NOT READY
```

Public audit includes current tree, all reachable Git blobs/refs, PRs/comments/reviews, issues, Actions logs/artifacts, releases/packages, branch names, assets and licenses.

Historical PR #15 contains the now-known wrong `40 m/s` drive interpretation and needs a prominent superseded/erratum marker before public visibility.

## 8. Portable package foundation

Active branch contains:

- Vite relative base `./`;
- `.nojekyll`;
- deterministic file manifest with SHA-256;
- explicit `publicReady=false` and `publishedByBuild=false`;
- nested-path/integrity validator;
- adversarial package tests;
- non-publishing Windows gate;
- public current/history scanner;
- demonstrator validation and polish loop.

Validation status of this branch:

```text
source: PRESENT
static review: IN PROGRESS
full Node 24 gate: NOT EXECUTED
portable artifact receipt: NOT RECORDED
LAN/phone smoke: NOT EXECUTED
```

Use:

```text
tools/run-demonstrator-foundation-gate.ps1
```

Never claim this branch green before the local receipt.

## 9. Steering truth

Default:

```text
rackCenteringHertz = 0
uprightAssist = false
```

`RELEASE` disables hands-on target in the first fixed step. Wheels may remain turned at standstill.

RATE candidates remain unapproved:

```text
0.06 / 0.12 / 0.21 / 0.36 m/s
```

Measured reference behavior:

```text
stationary held excess: 0.000 mm
driving held excess:    <= 0.284 mm
post-RELEASE peak:       2.541–2.817 mm
contacts:                4
```

Do not force-clamp before native comparison.

## 10. Mobile truth

Mobile is another host/input surface, not another physics profile.

Initial research direction:

- landscape-first;
- relative RATE steering pad;
- touch-up = `RELEASE`, never hidden `POSITION(0)`;
- separate throttle and brake/reverse ownership;
- camera gestures own different pointers;
- touchcancel, blur, visibility and dispose release all commands;
- AUTO quality changes rendering only.

Owner feel on Jozz's real phone is mandatory.

## 11. Wheel and scan

```text
legacy_m6_split_sphere_sidewall
= regression baseline / fallback / failure reference
```

Future Wheel Scope belongs to native JV Core.

For scan integration keep separate:

```text
source scan
render mesh
collision mesh
scene manifest
```

Never treat a raw noisy photogrammetry mesh as the default collider. Audit ownership/licensing before any scan asset enters a public branch.

## 12. Workflow rules

- respond to Jozz in Polish;
- use GitHub connector and ordinary Git only;
- Git Diff Patcher Bridge is forbidden;
- do not shift routine repo work onto Jozz;
- always guide Jozz safely through local repo updates;
- never assume local paths; resolve repo root or use the exact path Jozz provided in the current task;
- no merge or ready transition without Jozz;
- no visibility or Pages change without Jozz;
- no Actions, self-modifying CI, cross-repo loops or repeated CI debugging;
- no owner-feel claim without Jozz;
- no parity claim from internal green tests;
- no hidden fallback or assist;
- no destructive deletion without recovery evidence and link audit;
- after web search, keep factual claims sourced.

## 13. Immediate sequence

```text
1 local demonstrator foundation gate
2 run public audit and classify findings
3 decide project LICENSE and exact third-party notices
4 mark historical PR corrections prominently
5 public README/default-branch consolidation
6 backend ID through trace/UI/receipt
7 Demo/Lab split
8 mobile input experiment
9 parallel native JV WASM spike
10 scene seam and synthetic campus
11 scan audit/conversion after local files arrive
12 phone owner gate
13 PUBLIC-READY decision
14 manual visibility change
15 PAGES-PUBLISH gate and manual enablement
```
