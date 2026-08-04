# Mobile host audit archive index — 2026-08-03

Status: `ARCHIVE INDEX`
Superseded by: `docs/contracts/MOBILE_HOST_CONTRACT_PL.md`

Archived source:

| Source file | Blob SHA | Historical role |
|---|---|---|
| `docs/MOBILE_HOST_READINESS_AUDIT_2026_08_03_PL.md` | `847be17dddff7222909cca369c64ab805575f594` | audit of the quarantined PR #1 mobile path, rendering cost, startup probes, pointer ownership and physics/render profile separation |

Source checkpoint:

```text
commit 0d938e402f618ae34e0d959a9862d97c2f88a926
```

Recover with:

```powershell
git show 0d938e402f618ae34e0d959a9862d97c2f88a926:docs/MOBILE_HOST_READINESS_AUDIT_2026_08_03_PL.md
```

The old audit mixed durable mobile constraints with defects of the quarantined prototype. The active contract preserves the durable constraints and records that the clean F1–F5 host has already resolved startup probe execution, render-frame input polling, reload-only restart and basic lifecycle ownership.
