# AI project memory — JV Web

Updated: 2026-08-05  
Status: `READ FIRST / PLAYABLE BASELINE RESTORED`  
Owner: Jozz

## Mission

Build a serious desktop/mobile browser demonstrator for Jozz Vehicle, with owner-authored vehicle and scene assets, while preserving a path to real native JV mechanics.

Keep the project continuously runnable. Improve it through small, attributable and reversible slices with evidence appropriate to every claim.

## Current exact operational baseline

```text
repository:
  Jozzpoly/JV-Box3D-Web-experiment

frozen playable branch:
  agent/jv-web-playable-runtime

frozen playable commit:
  d6aa218064c2653f918cf7956d2fcd20a940caf3

toolchain used by owner:
  Node 24.16.0
  npm 11.17.0

role:
  known-good browser reference runtime
  legacy_ts_m6
  not product physics authority
  native JV parity not proven
```

Fresh owner-machine recovery on 2026-08-05 reached a live browser runtime after the full historical gate. Visual evidence shows the F5 drive observer, debug vehicle, telemetry, generation 1 and four contacts. Evidence details and screenshot hash are recorded in [`docs/operations/PLAYABLE_BASELINE_2026-08-05.md`](docs/operations/PLAYABLE_BASELINE_2026-08-05.md).

Do not patch the frozen playable commit or use its worktree for product development.

## Canonical owner workflow

### Normal repeated launch

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Run-JvWebPlayable.ps1
```

This requires a successful recovery receipt and exact clean checkpoint. It starts Vite without repeating dependency installation, tests or production build.

### First recovery or deliberate revalidation

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Launch-JvWebPlayable.ps1
```

This prepares the exact attached worktree, runs the checkpoint's complete historical gate, writes a receipt and starts Vite only after PASS.

`Start-JvWebPlayable.ps1` is an internal recovery helper, not the normal owner entry point.

### Control-plane validation

After any operator change:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebPowerShellSyntax.ps1
```

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebControlPlane.ps1
```

The complete operating rules are in [`docs/operations/OPERATING_MODEL.md`](docs/operations/OPERATING_MODEL.md).

## Branch roles

```text
main
  minimal control base; not current product implementation

agent/jv-refoundation-control-plane
  operating rules, evidence records and safe local operators

agent/jv-web-playable-runtime @ d6aa218…
  frozen playable recovery reference

future product-candidate branches
  one bounded development slice each

agent/jv-lit-normal-foundation @ 26c5022…
  quarantined historical implementation source
  83 commits after d6aa218…
  not accepted wholesale
```

Important preserved checkpoints:

```text
4ace291a65c36e512b611cdb71e247b538955179
  renderer preparation; 21 commits after d6aa218…

dcec0a7b5938b5d07cf5fdff8f81afd9db89e4ec
  historical lit-normal green claim; exact rerun evidence still separate

891c7561142b601f62ea76b68b0f55f8fababc6c
  historical real-vehicle forensic source
```

The later work remains in Git and must be recovered by module with source attribution. Never fast-forward the whole historical stack into `main` or treat PR #21 as the active product branch.

## Sources of truth

1. **Native physics and authored native asset authority**  
   `Jozzpoly/Box3d_FunProject`, pinned to an exact commit for every experiment.

2. **Current playable browser reference**  
   `agent/jv-web-playable-runtime@d6aa218…` plus its successful local receipt and owner observation.

3. **Future product implementation**  
   A separate candidate accepted through source, package, runtime and owner gates.

4. **Behavioral claims**  
   Exact source commit, dependency lock, relevant asset/native hashes, raw logs and scoped owner observation.

5. **This file**  
   Navigation and current state only; never proof by itself.

## Architectural boundary

```text
TypeScript / browser:
  lifecycle
  fixed-step scheduling
  timestamped input
  UI and experiments
  persistence
  rendering
  immutable runtime snapshot consumption

native JV Core + Box3D in one future WASM module:
  product physics authority
  blueprint compilation
  bodies, joints and wheel/contact backend
  steering, drivetrain, brakes, aero and future tyre work
  stable semantic part mapping
  native/WASM parity traces
```

`legacy_ts_m6` remains a browser research fixture. Do not add final vehicle mechanics to it.

The product must have one scene/camera/render-context owner. Three.js remains a leading renderer hypothesis, not yet an accepted final decision.

## Acceptance model

Every candidate progresses independently through:

```text
IDENTITY → SOURCE → PACKAGE → RUNTIME → OWNER → PROMOTION
```

Passing one layer never implies the next. Use scoped terms such as `SOURCE PASS`, `PACKAGE PASS`, `RUNTIME OBSERVED` and `OWNER ACCEPTED`.

## Immediate development sequence

1. Complete a short fresh owner smoke of steering, drive/brake and destroy/rebuild on the restored baseline.
2. Preserve the exact local receipt and owner result as the operational baseline.
3. Build a per-module salvage map for the 83 later commits.
4. Create one clean product-candidate branch from an explicitly chosen validated base.
5. Recover renderer ownership, lifecycle and failure-isolation protections first.
6. Revalidate source, package, browser and owner behavior.
7. Add the tiny deterministic visual proof.
8. Add the real owner-authored vehicle model.
9. Add materials/textures only after geometry and lifecycle remain stable.
10. Continue toward scene/scan rendering and later native JV Core WASM parity.

R1/R2 historical audits remain evidence work and must not block playable product progress.

## Terminal-loop prevention

- Never repeat an unchanged failed command.
- Every rerun requires a code/configuration change or new evidence.
- Stop at the first unattributed failure.
- Preserve the complete relevant log and identify one exact next action.
- Do not make Jozz manually clean, reset or reconstruct operator-created worktrees.
- Normal play must not repeat the full recovery gate.
- Keep owner commands few, stable and documented.

## Non-negotiable rules

- Git Diff Patcher Bridge is forbidden.
- No merge, Ready transition, visibility change, Pages publication or new Actions without Jozz.
- No `PASS`, `GREEN`, `PARITY`, `REPRODUCED` or `PRODUCTION-READY` claim without matching evidence.
- Owner observation is separate from automated tests.
- A changed source commit, dependency lock, native commit or relevant asset hash expires the previous exact-head claim.
- Never delete or rewrite preserved historical branches merely because the baseline is restored.
- Never use `git reset --hard`, `git clean`, force-push or forced worktree removal in recovery workflows.
- Keep active workstreams small, attributable and reversible.
