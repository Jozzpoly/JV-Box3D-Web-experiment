# Wheel research archive index — 2026-08-03

Status: `ARCHIVE INDEX`
Superseded by: `docs/contracts/WHEEL_BACKEND_CONTRACT_PL.md`

## Source checkpoint

The archived wheel documents describe a pinned public snapshot:

```text
repository: Jozzpoly/Box3d_FunProject
branch: jozz-scan-terrain-f0
commit: 761bd3ef60992f7dec3bcdddf1945fdbc1cb0825
```

They were present in JV Web at the validated checkpoint:

```text
commit 0d938e402f618ae34e0d959a9862d97c2f88a926
```

## Archived sources

| Source file | Blob SHA | Historical role |
|---|---|---|
| `docs/WHEEL_ADOPTION_SEAM_2026_08_03_PL.md` | `e1e80b4ad9caeafe2cd810cd896c7b6a16857c16` | first W1/W2/W3/W4 seam, capability model, observer and lifecycle proposal |
| `docs/LEGACY_M6_WHEEL_FIXTURE_AUDIT_2026_08_03_PL.md` | `5ff37976053f3f277736cebd04c236a0bfe06d84` | effective split-sphere/sidewall filter behavior, campus limitations and legacy-only tests |
| `docs/CURRENT_JV_WHEEL_PROGRAM_RECEIPT_2026_08_03_PL.md` | `4a386bcd37f6fa8855473fa2a6e74f507bbc16be` | pinned Wheel Scope snapshot, F-31/F-32 measurements and owner decisions known on 2026-08-03 |

Recover a source with:

```powershell
git show 0d938e402f618ae34e0d959a9862d97c2f88a926:<path>
```

## Important freshness boundary

The pinned snapshot is not assumed to represent the latest local Wheel Scope work. Later work may exist only on another branch or in Jozz's local repository.

Before any new wheel backend is designed or promoted, create a new exact source receipt containing at minimum:

```text
repository and branch
commit SHA
working-tree status
critical document/blob hashes
current experiment lineage
open findings and failure modes
owner decisions newer than 2026-08-03
```

## Durable knowledge extracted

The active contract retains:

- one nature of the wheel across all surfaces;
- explicit mass/inertia independent of contact representation;
- W1/W2/W3/W4 responsibility boundaries;
- a native replaceable contact backend seam;
- neutral multi-manifold observer data;
- capability honesty and fail-closed behavior;
- `legacy_m6_split_sphere_sidewall` only as a regression baseline;
- bounded interpretation of F-31/F-32;
- mobile profiles may not silently change physics;
- deformation and pressure belong to the future system foundation;
- owner feel remains the product gate.
