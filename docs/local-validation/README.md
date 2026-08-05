# Local validation operator guide

This directory defines the safe local workflow for R1 and R2. The harness targets Windows PowerShell 5.1 and PowerShell 7 on Windows.

## Operator rule

Run one command at a time. Do not concatenate commands and do not split an `if`/`else` block across separate submissions. This guide intentionally uses only linear one-line commands.

## Safety model

The harness:

- verifies the exact repository identity and origin;
- requires the exact Node and npm versions registered for the target;
- verifies that the tracked harness files match the active Git `HEAD` using Git's normal clean filters, so Windows CRLF checkout policy does not create a false mismatch;
- creates a detached Git worktree and evidence directory outside the active repository;
- never switches the current branch;
- never runs `git reset`, `git clean`, forced checkout, forced ref update or forced worktree removal;
- runs the gate already stored in the exact historical commit;
- captures raw output, source identity, before/after Git status and build artifact hashes;
- retains the validation worktree by default.

A dirty active repository does not block the harness because it is not modified. Its dirty state is recorded in the environment receipt. Structural checks inspect tracked files only; untracked `node_modules`, build output and historical residue are not traversed.

## 1. Update the existing control-plane branch

Run from the JV Web repository:

```powershell
git fetch --prune origin
```

```powershell
git switch agent/jv-refoundation-control-plane
```

```powershell
git pull --ff-only
```

```powershell
git rev-parse HEAD
```

Do not merge historical implementation branches into this branch.

For a first checkout on another machine, use this one command after `git fetch --prune origin`:

```powershell
git switch --track -c agent/jv-refoundation-control-plane origin/agent/jv-refoundation-control-plane
```

## 2. Parse the PowerShell harness before executing it

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebPowerShellSyntax.ps1
```

Expected result:

```text
JV WEB POWERSHELL SYNTAX CHECK: PASS
```

This bootstrap check uses the parser built into the PowerShell engine on the operator machine. It executes no project code and runs no Git mutation.

## 3. Validate the control plane

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebControlPlane.ps1
```

This read-only structural check does not install dependencies or execute project code. It checks tracked control-plane files, JSON, tracked PowerShell files, tracked Markdown links and the no-Actions boundary.

## 4. Verify the exact toolchain

R1 and R2 currently require:

```text
Node v24.16.0
npm 11.17.0
```

The harness refuses approximate versions. A refusal is a preflight result, not a project failure.

Run a no-build preflight:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Invoke-JvWebBaseline.ps1 -Target R1 -FetchMissingRef -PreflightOnly
```

## 5. Execute R1

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Invoke-JvWebBaseline.ps1 -Target R1 -FetchMissingRef
```

The only accepted R1 success classification is:

```text
BASELINE_REPRODUCED
```

Any other result remains neutral evidence and must not be patched inside the same run. `R1_GATE_DID_NOT_PASS` does not distinguish a project regression from an environmental blocker until the raw log is attributed.

## 6. Execute R2

Only after R1 evidence is preserved:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Invoke-JvWebBaseline.ps1 -Target R2 -FetchMissingRef
```

R2 measures the quarantined head. `R2_GATE_DID_NOT_PASS` is intentionally neutral until the raw log is attributed; it must not be converted into a repair run.

## Output location

The harness rejects a `ValidationRoot` inside the repository. By default, all generated material is stored beside it:

```text
<parent of repository>\_JV_WEB_LOCAL_VALIDATION\
  evidence\
  worktrees\
```

Each run produces an evidence directory and ZIP archive. See [`EVIDENCE_BUNDLE.md`](EVIDENCE_BUNDLE.md).

## Worktree retention

The harness always retains the detached worktree for inspection and never removes or cleans it automatically. After the evidence has been reviewed, removal is a separate explicit operator action using ordinary `git worktree remove` without `--force`.

## R3

PR #1 is intentionally not automated by this baseline harness. It lacks a trustworthy historical dependency lock and requires explicit native-source and asset pinning. Follow the R3 controls in [`../refoundation/RECOVERY_PLAN.md`](../refoundation/RECOVERY_PLAN.md).
