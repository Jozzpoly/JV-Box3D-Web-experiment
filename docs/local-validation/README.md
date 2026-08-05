# Local validation operator guide

This directory defines the safe local workflow for R1 and R2. The harness is designed for Windows PowerShell 5.1 or PowerShell 7 and ordinary Git.

## Safety model

The harness:

- verifies the exact repository identity and origin;
- requires the exact Node and npm versions registered for the target;
- verifies that the harness, target registry and result schema are byte-exact with the active Git `HEAD`;
- creates a detached Git worktree and evidence directory outside the active repository;
- never switches the current branch;
- never runs `git reset`, `git clean`, force checkout, force ref update or force worktree removal;
- runs the gate already stored in the exact historical commit;
- captures raw output, source identity, before/after Git status and build artifact hashes;
- retains the validation worktree by default.

A dirty active repository does not block the harness because it is not modified. Its dirty state is recorded in the environment receipt.

## 1. Safely update local refs

Run these commands from the existing JV Web repository and inspect each result:

```powershell
git rev-parse --show-toplevel
git status -sb
git remote get-url origin
git fetch --prune origin
```

To use the control-plane branch for the first time:

```powershell
git switch --track -c agent/jv-refoundation-control-plane origin/agent/jv-refoundation-control-plane
```

When the local branch already exists:

```powershell
git switch agent/jv-refoundation-control-plane
git pull --ff-only
```

Do not merge historical implementation branches into this branch.

## 2. Validate the control plane

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\tools\local-validation\Test-JvWebControlPlane.ps1
```

This is a local read-only structural check. It does not install dependencies or execute project code.

## 3. Verify the exact toolchain

R1 and R2 currently require:

```text
Node v24.16.0
npm 11.17.0
```

The harness refuses approximate versions. A refusal is a preflight result, not a project failure.

Run a no-build preflight:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\tools\local-validation\Invoke-JvWebBaseline.ps1 `
  -Target R1 `
  -FetchMissingRef `
  -PreflightOnly
```

## 4. Execute R1

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\tools\local-validation\Invoke-JvWebBaseline.ps1 `
  -Target R1 `
  -FetchMissingRef
```

The only accepted R1 success classification is:

```text
BASELINE_REPRODUCED
```

Any other result remains neutral evidence and must not be patched inside the same run. `R1_GATE_DID_NOT_PASS` does not distinguish a project regression from an environmental blocker until the raw log is attributed.

## 5. Execute R2

After R1 is complete:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\tools\local-validation\Invoke-JvWebBaseline.ps1 `
  -Target R2 `
  -FetchMissingRef
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
