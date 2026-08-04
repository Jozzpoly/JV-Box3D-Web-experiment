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
current candidate commit: resolve with git rev-parse HEAD or the PR head SHA
```

All older pull requests are closed as historical. The remote branch surface contains only `main` and the active development branch.

The active branch is a long experimental descendant of `main`. Do not fast-forward its complete history into a future presentation-ready default branch. At publication time choose either:

```text
preferred: a clean public demonstrator repository/snapshot
alternative: an owner-reviewed squash integration
```

No integration, visibility or Pages decision has been made.

## What works

The current reference runtime provides:

- fixed-step simulation with bounded catch-up;
- timestamped steering and longitudinal input;
- real Box3D WebAssembly worlds and contacts;
- an 18-body M6 topology with physical suspension and rack linkage;
- `RELEASE | POSITION | RATE` steering;
- drive, reverse, coast and braking through wheel revolute-joint motors;
- copied immutable trace data for rendering;
- a dependency-free WebGL observer;
- transactional startup, disposal and rebuild;
- a portable relative-path static package.

## What this is not

```text
backend: legacy_ts_m6
role: browser reference fixture
native JV parity: not proven
product physics authority: false
```

The fixture is useful for browser-host development and mechanism experiments. It must not become a second independently evolving JV physics product.

One confirmed mismatch is drive semantics: native JV treats `maxDriveSpeed = 40` as a wheel motor limit in rad/s; the TypeScript fixture historically interpreted it as a linear target.

## Product direction

```text
native JV Core + Box3D source
              ↓
       one WASM module
              ↓
 stable C ABI + immutable snapshots
              ↓
 TypeScript input, render, UI and scene host
```

Native/WASM remains the long-term authority, but it is not the next immediate product milestone. First stabilize the browser host, mobile controls, scene contract and sharing path using the frozen reference fixture.

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
documentation links: PASS
third-party notices: PASS
Vite production bundle: PASS
portable static validation: PASS
portable manifest privacy: PASS
portable network policy: PASS
loopback HTTP at /: PASS
loopback HTTP at /JV-Box3D-Web-experiment/: PASS
publication: NOT PERFORMED
```

The bundle warning about the approximately 1.2 MiB JavaScript chunk is recorded but is not a current functional failure.

## Current mobile-control candidate

```text
exact head: resolve from Git/PR; do not hard-code a moving candidate SHA here
state: SOURCE PRESENT / STATIC SCOPE REVIEWED
local Node 24 gate: PENDING
browser observation: PENDING
real phone observation: PENDING
```

Changes since the green checkpoint are limited to:

- source-aware steering and longitudinal timelines;
- a Pointer Events vehicle-control adapter;
- browser-host lifecycle ownership;
- F4 pass-through without physics changes;
- five-button multi-touch UI;
- safe-area and responsive mobile layout;
- focused input, host and 320 px geometry tests;
- synchronized project documentation.

No file under `src/vehicle/`, `src/physics/` or the renderer was changed in this mobile slice.

## Mobile input semantics

```text
one pointerId -> one semantic control owner
one semantic control -> zero or more active sourceId values
```

Keyboard, touch and future gamepad sources may overlap without releasing one another. Pointer capture occurs before `pressed=true`; capture failure emits no command.

Lifecycle release is covered for:

- pointerup;
- pointercancel;
- lostpointercapture;
- blur;
- visibility hidden;
- pagehide;
- host disposal and rollback.

The first mobile layout provides:

```text
left cluster:  steer left / steer right
right cluster: brake / forward / reverse
canvas free area: orbit camera
```

The controls are source-present, not owner-approved. Their geometry, size and feel require a real phone gate.

## Deliberate limitations

- no approved steering-rate default;
- no final drivetrain model;
- legacy split-sphere wheel only;
- no native JV WASM backend;
- mobile controls not locally built or phone-validated on current head yet;
- no scene package or scan loader;
- diagnostic visuals only;
- no project reuse license selected yet;
- repository remains private and Pages remains disabled.

## Repository policy

Keep:

- current source and focused tests;
- exact dependencies and runtime receipt;
- short architecture/state/development documentation;
- evidence that changes engineering decisions.

Remove or close:

- obsolete experimental branches;
- phase-specific runners;
- duplicated reports and process ledgers;
- speculative frameworks that are not being implemented;
- archives kept only because they once existed.

Do not begin another broad cleanup cycle unless a concrete file or dependency obstructs active work.

## Corrected near-term development plan

### 1. Validate the mobile-control slice

Run the complete Node 24 gate on exact current head. Repair only demonstrated source/test/build failures.

### 2. Desktop browser smoke

Verify:

- Box3D startup;
- WebGL rendering;
- keyboard steering, forward, reverse and brake;
- pointer controls with a mouse or device emulation;
- requested inverted camera behavior;
- destroy/rebuild;
- no uncaught runtime errors.

### 3. Real phone gate

Validate over LAN:

- simultaneous steering and forward/reverse/brake;
- pointer cancel and lifecycle release;
- portrait and landscape layout;
- safe-area behavior;
- camera versus control ownership;
- access to the telemetry panel;
- performance and dropped time;
- Jozz control feel.

### 4. Polish the proven mobile UI

Change control geometry, opacity, labels and layout only from observed phone evidence. Do not add analog steering or assists merely because they appear more advanced.

### 5. Scene foundation

Only after mobile input is stable, implement a minimal scene package with explicit units, axes, spawn, render mesh and separate collision representation. Validate on a small synthetic scene before importing a real scan.

### 6. Sharing and publication

After mobile and scene validation:

- choose the project license;
- choose clean snapshot repository versus squash integration;
- create the presentation-ready source history;
- enable Pages only for an owner-accepted exact package.

### 7. Native WASM

Begin behavior-preserving native/WASM parity work after the browser host, input, scene and distribution seams are stable enough not to change underneath the port.

## Immediate work boundary

```text
ACTIVE NOW:
current-head Node/build validation
desktop browser smoke
real-phone mobile gate
focused mobile polish

WAITING:
scene package and synthetic scene
real scan import
publication history strategy
license

NOT ACTIVE YET:
native JV WASM port
final vehicle mechanics
Pages publication
```
