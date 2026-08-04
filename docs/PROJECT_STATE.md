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

All older pull requests are closed as historical. They are not required integration steps.

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

Initial native/WASM work should preserve the current native behavior before any large refactor. See `docs/NATIVE_PORT_NOTES.md`.

## Validation truth

Last complete local gate on an earlier head:

```text
Node 24.16.0
npm 11.17.0
109 tests total
108 PASS
1 report-sanitizer FAIL
```

The failing sanitizer case was corrected afterward. The current simplified candidate has not yet received a fresh full gate, production package verification or new browser observation.

Do not claim current PASS until Jozz runs:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-demonstrator-foundation-gate.ps1"
```

## Deliberate limitations

- no approved steering-rate default;
- no final drivetrain model;
- legacy split-sphere wheel only;
- no native JV WASM backend;
- no mobile controls;
- no scan scene loader;
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
- speculative contracts that are not being implemented;
- archives kept only because they once existed.

## Next work

```text
1 run fresh Node 24 gate on the simplified head
2 repair any real code/test/build regressions
3 perform browser drive/steering/camera smoke
4 prune obsolete remote branches
5 decide project license before visibility changes
6 fast-forward main after exact owner acceptance
7 continue native WASM, mobile and scene work from the clean foundation
```
