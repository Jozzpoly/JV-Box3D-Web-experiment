# JV Box3D Web Experiment

Private proof-of-concept repository for running a focused slice of Jozz Vehicle in a browser.

## Current repository mode

The playable browser baseline has been restored and freshly owner-accepted on desktop. The project is now in **controlled foundation recovery and product-candidate validation**.

The minimal `main` branch is intentionally not the product implementation. No historical implementation branch is accepted wholesale as the canonical product line.

Read in this order:

1. [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md)
2. [`docs/operations/OPERATING_MODEL.md`](docs/operations/OPERATING_MODEL.md)
3. [`docs/operations/PLAYABLE_BASELINE_2026-08-05.md`](docs/operations/PLAYABLE_BASELINE_2026-08-05.md)
4. [`docs/recovery/SALVAGE_MAP_2026-08-05.md`](docs/recovery/SALVAGE_MAP_2026-08-05.md)
5. [`docs/candidate-validation/RENDER_HOST_R1.md`](docs/candidate-validation/RENDER_HOST_R1.md)
6. [`docs/playable-recovery/README.md`](docs/playable-recovery/README.md)
7. [`docs/refoundation/EVIDENCE_STANDARD.md`](docs/refoundation/EVIDENCE_STANDARD.md)
8. [`docs/local-validation/README.md`](docs/local-validation/README.md)

## Current candidate — renderer host R1

```text
PR: #23
base: agent/jv-web-playable-runtime@d6aa218064c2653f918cf7956d2fcd20a940caf3
candidate: candidate/jv-web-render-host-r1@e263e3e05ea21e74585d74829136e3defbd67813
status: DRAFT / VALIDATION PENDING / DO NOT MERGE
```

Validate the exact candidate through one guarded command:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\candidate-validation\Launch-JvWebRenderHostR1.ps1
```

Candidate R1 uses port `5174`; the accepted baseline may remain on port `5173` for direct comparison. It adds renderer ownership and failure-isolation foundations but intentionally activates no GLB, model, material or texture path.

## Normal playable baseline launch

After one successful recovery receipt, start the already validated baseline without repeating the full gate:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Run-JvWebPlayable.ps1
```

## First recovery or deliberate baseline revalidation

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
