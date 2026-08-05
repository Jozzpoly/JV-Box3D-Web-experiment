# AI project memory — JV Web

Updated: 2026-08-05  
Status: `READ FIRST / CONTROL PLANE`  
Owner: Jozz

## Mission

Build a serious desktop/mobile browser demonstrator for Jozz Vehicle, with owner-authored vehicle and scene assets, while preserving a path to the real native JV mechanics.

## Current operating mode

The project is in **refoundation and evidence recovery**, not ordinary feature development.

```text
canonical control base:
  main
  5c64903d753f893adc42be90e0c3d8053a95a922

quarantined implementation head:
  agent/jv-lit-normal-foundation
  26c5022f8dfd33b8c5f80d0900d239a4d80966ea
  status: SOURCE-CONFIRMED RED / exact local rerun pending

historical lit-normal green claim:
  dcec0a7b5938b5d07cf5fdff8f81afd9db89e4ec
  status: historical evidence only until rerun with raw logs

historical real-vehicle forensic checkpoint:
  891c7561142b601f62ea76b68b0f55f8fababc6c
  status: useful source, not exactly reproducible from the web commit alone
```

Do not continue product work directly on PR #21. Do not fast-forward the historical implementation stack into `main`.

## Sources of truth

1. **Native physics and authored native asset authority**  
   `Jozzpoly/Box3d_FunProject`, pinned to an exact commit for every experiment.

2. **Browser host and rendering implementation**  
   A future clean JV Web product branch accepted through the recovery gates.

3. **Claims about behavior**  
   Exact evidence bundles tied to one source commit, dependency lock, native commit and asset hashes.

4. **This file**  
   Navigation and current operating state only. It is never proof by itself.

## Validated architectural boundaries

```text
TypeScript / browser:
  lifecycle
  fixed-step scheduling
  timestamped input
  UI and experiments
  persistence
  rendering
  immutable runtime snapshot consumption

native JV Core + Box3D, one future WASM module:
  product physics authority
  blueprint compilation
  bodies, joints and wheel/contact backend
  steering, drivetrain, brakes, aero and future tyre work
  stable semantic part mapping
  native/WASM parity traces
```

`legacy_ts_m6` is a browser research fixture. It is not product physics authority and must not receive final mechanics.

The product must have one scene/camera/render-context owner. A Three.js hybrid is the leading renderer hypothesis, not yet an accepted final decision.

## Local validation operator path

Before executing any validation harness on Windows, run:

```text
tools/local-validation/Test-JvWebPowerShellSyntax.ps1
```

Then run the tracked-only structural checker:

```text
tools/local-validation/Test-JvWebControlPlane.ps1
```

R1 and R2 must be executed through:

```text
tools/local-validation/Invoke-JvWebBaseline.ps1
```

The target registry is:

```text
tools/local-validation/validation-targets.json
```

The harness uses a detached external worktree, exact Node/npm versions and evidence bundles defined in `docs/local-validation/`. It must not patch a target during the measurement run.

The active worktree may contain untracked historical build residue. Validation must inspect tracked control-plane files only and must not traverse, delete, reset or silently ignore unknown user material. Operator commands must be linear, one command at a time; do not provide an `if` and `else` as separately executable snippets.

## Known validation correction

Control-plane commit `4b449d7651a5424b894f24c75ac58e3a6ea848b0` contained a Windows PowerShell 5.1 parser error in `Test-JvWebControlPlane.ps1` and additional Windows-path/CRLF/tracked-file weaknesses found during owner validation. It is superseded by the next correction commit and must not be used as evidence that the control-plane checker passed.

## Immediate sequence

1. Preserve this control plane on a clean branch from `main`.
2. Parse the local PowerShell harness with the operator's installed PowerShell engine.
3. Validate the tracked control-plane files locally.
4. Re-run exact R1 `dcec0a7…` and capture the complete evidence bundle.
5. Re-run exact R2 `26c5022…` without repair and capture every failure.
6. Perform a pinned forensic run of PR #1.
7. Build the smallest real-car Three.js spike on the deterministic current host.
8. Choose a clean product snapshot only after the spike and owner observation.

## Non-negotiable rules

- Git Diff Patcher Bridge is forbidden.
- No merge, Ready transition, visibility change, Pages publication or new Actions without Jozz.
- No `PASS`, `GREEN`, `PARITY`, `REPRODUCED` or `PRODUCTION-READY` claim without the evidence required by `EVIDENCE_STANDARD.md`.
- Plans and synthetic fixtures do not prove user-visible product behavior.
- Owner observation is recorded separately from automated tests.
- A changed source commit, dependency lock, native commit or relevant asset hash expires the previous exact-head claim.
- Keep active workstreams small, attributable and reversible.
- R1/R2 measurement worktrees are not repair branches.
- Never use `git reset --hard`, `git clean`, force-push or forced worktree removal in the local validation workflow.
