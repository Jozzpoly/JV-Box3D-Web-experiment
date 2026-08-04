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
```

All older pull requests are closed as historical. The remote branch surface now contains only `main` and the active development branch.

The active branch is a long experimental descendant of `main`. Do not fast-forward its entire 410-commit history into a future presentation-ready default branch. At publication time choose either:

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

This evidence does **not** yet prove exact current-head execution in a real desktop browser or phone.

## Deliberate limitations

- no approved steering-rate default;
- no final drivetrain model;
- legacy split-sphere wheel only;
- no native JV WASM backend;
- no dedicated mobile controls;
- no phone lifecycle/performance validation;
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

### 1. Browser truth

Run the exact current build in a real desktop browser and verify:

- Box3D startup;
- WebGL rendering;
- steering, forward, reverse and brake;
- inverted camera behavior already requested by Jozz;
- destroy/rebuild;
- no uncaught runtime errors.

### 2. Multi-source input foundation

Before adding touch controls, make timeline state source-aware. Keyboard, touch and future gamepad inputs must not release one another when overlapping on the same semantic control.

### 3. Mobile control host

Implement Pointer Events controls that:

- feed the existing fixed-step timelines;
- allow steering and throttle/brake simultaneously;
- assign one pointer to one control owner;
- release safely on up, cancel, lost capture, blur, hidden page, pagehide and disposal;
- do not allow camera input to steal control pointers;
- do not modify physics or render cadence.

### 4. Real phone gate

Validate landscape/portrait layout, browser gestures, lifecycle, multi-touch, performance and driving feel over LAN on a real phone.

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
source-aware timelines
mobile pointer controls
compact responsive UI
focused tests

WAITING FOR OWNER/RUNTIME VALIDATION:
desktop browser smoke
real phone smoke
control feel
publication history strategy
license

NOT ACTIVE YET:
real scan import
native JV WASM port
final vehicle mechanics
Pages publication
```
