# JV Box3D Web Experiment

Private proof-of-concept repository for running a focused slice of Jozz Vehicle in a browser.

## Current repository mode

The playable browser baseline has been restored. The project is now in **controlled foundation recovery and product-candidate development**.

The minimal `main` branch is intentionally not the product implementation. No historical implementation branch is accepted wholesale as the canonical product line.

Read in this order:

1. [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md)
2. [`docs/operations/OPERATING_MODEL.md`](docs/operations/OPERATING_MODEL.md)
3. [`docs/operations/PLAYABLE_BASELINE_2026-08-05.md`](docs/operations/PLAYABLE_BASELINE_2026-08-05.md)
4. [`docs/playable-recovery/README.md`](docs/playable-recovery/README.md)
5. [`docs/refoundation/README.md`](docs/refoundation/README.md)
6. [`docs/refoundation/VALIDATED_STATE.md`](docs/refoundation/VALIDATED_STATE.md)
7. [`docs/refoundation/RECOVERY_PLAN.md`](docs/refoundation/RECOVERY_PLAN.md)
8. [`docs/refoundation/EVIDENCE_STANDARD.md`](docs/refoundation/EVIDENCE_STANDARD.md)
9. [`docs/local-validation/README.md`](docs/local-validation/README.md)

## Normal playable launch

After one successful recovery receipt, start the already validated baseline without repeating the full gate:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Run-JvWebPlayable.ps1
```

## First recovery or deliberate revalidation

The pinned recovery runtime is `agent/jv-web-playable-runtime` at exact commit `d6aa218064c2653f918cf7956d2fcd20a940caf3`.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Launch-JvWebPlayable.ps1
```

The compatibility launcher prepares an attached local-only worktree at the exact commit, then transfers execution to the full recovery operator. The complete gate must pass before a new receipt is written and Vite starts. See [`docs/playable-recovery/README.md`](docs/playable-recovery/README.md).

## Control-plane validation

After changing any recovery or validation operator, parse all tracked PowerShell scripts with the installed engine:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebPowerShellSyntax.ps1
```

Then run the tracked structural checker:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebControlPlane.ps1
```

No historical branch, PR body, handoff package or AI summary is authoritative by itself. Exact commits, raw gate output, evidence receipts and owner observation are authoritative only for the scope they actually prove.
