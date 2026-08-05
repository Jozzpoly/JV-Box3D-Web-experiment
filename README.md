# JV Box3D Web Experiment

Private proof-of-concept repository for running a focused slice of Jozz Vehicle in a browser.

## Current repository mode

This repository is in **playable recovery plus refoundation mode**. The immediate operational goal is to restore a known-good browser runtime while preserving the control plane and all later experimental work for evidence-based recovery.

The minimal `main` branch is intentionally not the product implementation. No historical implementation branch is accepted wholesale as the canonical product line.

Read in this order:

1. [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md)
2. [`docs/playable-recovery/README.md`](docs/playable-recovery/README.md)
3. [`docs/refoundation/README.md`](docs/refoundation/README.md)
4. [`docs/refoundation/VALIDATED_STATE.md`](docs/refoundation/VALIDATED_STATE.md)
5. [`docs/refoundation/RECOVERY_PLAN.md`](docs/refoundation/RECOVERY_PLAN.md)
6. [`docs/refoundation/EVIDENCE_STANDARD.md`](docs/refoundation/EVIDENCE_STANDARD.md)
7. [`docs/local-validation/README.md`](docs/local-validation/README.md)

## Restore the playable runtime

The pinned recovery runtime is `agent/jv-web-playable-runtime` at exact commit `d6aa218064c2653f918cf7956d2fcd20a940caf3`.

From the control-plane checkout, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Launch-JvWebPlayable.ps1
```

The compatibility launcher prepares an attached local-only worktree at the exact commit, then transfers execution to the full recovery operator. This preserves compatibility with the historical gate, which requires a named branch, while leaving the active control-plane checkout untouched. The complete gate must pass before Vite starts. See [`docs/playable-recovery/README.md`](docs/playable-recovery/README.md).

## Control-plane validation

Before executing recovery or historical validation scripts on Windows, parse them with the installed PowerShell engine:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebPowerShellSyntax.ps1
```

Then run the tracked structural checker:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebControlPlane.ps1
```

No historical branch, PR body, handoff package or AI summary is authoritative by itself. Exact commits, raw gate output, evidence receipts and owner observation are authoritative only for the scope they actually prove.
