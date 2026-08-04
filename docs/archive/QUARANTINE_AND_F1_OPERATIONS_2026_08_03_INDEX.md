# Quarantine and F1 operations archive index — 2026-08-03

Status: `ARCHIVE INDEX`

Source checkpoint:

```text
commit 0d938e402f618ae34e0d959a9862d97c2f88a926
```

| Source file | Blob SHA | Historical role | Current replacement |
|---|---|---|---|
| `docs/PR1_FILE_CLASSIFICATION_2026_08_03_PL.md` | `9d4009a19ba7aa9db162d7db95ce9fe8baef9cd0` | pass-1 classification of all 34 files in quarantined PR #1 | PR #1 remains the evidence; durable rules live in current ADRs/contracts |
| `docs/operations/F1_LOCAL_RUNBOOK_PL.md` | `dd51cc8f719f148c108f6129638366a992e6934d` | one-time recovery from bootstrap branch and Node/lockfile validation for F1 | `docs/operations/REFOUNDATION_LOCAL_GATE_PL.md` and `tools/run-refoundation-gate.ps1` |

Recover with:

```powershell
git show 0d938e402f618ae34e0d959a9862d97c2f88a926:<path>
```

The PR #1 file classification is not deleted from Git history because it documents why selected old mechanisms were rejected. It is removed from the active tree because clean F1–F5 already reimplemented or rejected those paths, and the file-by-file list no longer governs current architecture.

The F1 runbook is removed because it contains branch-recovery and lockfile-generation instructions specific to a completed stage. Reusing it now would switch to the wrong branch and misclassify the current runtime.
