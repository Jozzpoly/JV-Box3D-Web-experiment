# JV Box3D Web Experiment

Private proof-of-concept repository for running a focused slice of Jozz Vehicle in a browser.

## Current repository mode

This repository is in **refoundation and recovery mode**. The minimal `main` branch is intentionally not the product implementation. Historical implementation branches contain valuable work, but none is currently accepted wholesale as the canonical product line.

Read in this order:

1. [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md)
2. [`docs/refoundation/README.md`](docs/refoundation/README.md)
3. [`docs/refoundation/VALIDATED_STATE.md`](docs/refoundation/VALIDATED_STATE.md)
4. [`docs/refoundation/RECOVERY_PLAN.md`](docs/refoundation/RECOVERY_PLAN.md)
5. [`docs/refoundation/EVIDENCE_STANDARD.md`](docs/refoundation/EVIDENCE_STANDARD.md)
6. [`docs/local-validation/README.md`](docs/local-validation/README.md)

## Local validation

R1 and R2 use an isolated PowerShell harness that creates detached worktrees outside the active repository and captures exact evidence bundles.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\tools\local-validation\Test-JvWebControlPlane.ps1
```

The harness never switches the active branch and never runs `git reset`, `git clean` or force removal.

No historical branch, PR body, handoff package or AI summary is authoritative by itself. Exact commits and evidence bundles are authoritative only for the scope they actually prove.
