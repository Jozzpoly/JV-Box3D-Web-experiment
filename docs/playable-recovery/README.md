# Playable JV Web recovery

This path restores and repeatedly runs a known-good browser runtime without switching, resetting or modifying the active control-plane worktree.

## Pinned runtime

```text
branch: agent/jv-web-playable-runtime
commit: d6aa218064c2653f918cf7956d2fcd20a940caf3
```

Evidence associated with this checkpoint includes the complete historical gate, 218/218 tests, portable-package checks and owner browser observation. The runtime remains the `legacy_ts_m6` reference fixture. It is not native-JV parity and not final product physics.

## Normal repeated launch

After one successful recovery receipt, use:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Run-JvWebPlayable.ps1
```

[`Run-JvWebPlayable.ps1`](../../tools/playable-recovery/Run-JvWebPlayable.ps1):

1. loads the newest successful recovery receipt;
2. verifies its schema, gate result and exact source commit;
3. verifies the recorded worktree still exists, is attached, exact and clean;
4. verifies Node/npm and installed Vite;
5. starts the development server without repeating `npm ci`, tests or production build.

This is the normal owner workflow for repeated testing.

## First recovery or deliberate revalidation

Run from the existing control-plane checkout:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Launch-JvWebPlayable.ps1
```

[`Launch-JvWebPlayable.ps1`](../../tools/playable-recovery/Launch-JvWebPlayable.ps1) is the compatibility bootstrap. It:

1. verifies or creates a short exact worktree under `%LOCALAPPDATA%\JV-Web-Playable`;
2. reuses the already-created `runtime-d6aa218` worktree when it is exact and clean;
3. attaches a detached worktree to a local, non-published branch pointing to the same exact commit;
4. never switches the active control-plane worktree;
5. never resets, cleans, deletes or force-moves user material;
6. transfers execution to the internal recovery operator.

The inner operator verifies the byte-pinned native receipt, runs the checkpoint's complete historical gate, preserves the full gate log, writes a successful receipt and starts Vite only after PASS.

Default external locations:

```text
%LOCALAPPDATA%\JV-Web-Playable\runtime-d6aa218\
%LOCALAPPDATA%\JV-Web-Playable\evidence\
```

## Recorded recovery incidents

### Deep Windows path

The first operator attempted to create a worktree beside the deeply nested source repository. The corrected workspace is under `%LOCALAPPDATA%` and enables Git long-path handling only for worktree checkout.

### Detached historical gate

The short-path checkout succeeded at exact `d6aa218…`, but the historical gate assumed a named branch:

```powershell
$sourceBranch = (git branch --show-current).Trim()
```

A detached worktree returns no branch text, causing `.Trim()` to fail before `npm ci`. The compatibility bootstrap attaches the exact clean worktree to a local-only branch before running the unchanged historical gate. This changes no source file and preserves the exact commit.

These incidents are retained as regression knowledge. They are not additional owner steps.

## Other recovery modes

Validate without starting the server:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Launch-JvWebPlayable.ps1 -ValidateOnly
```

Use a custom external location:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Launch-JvWebPlayable.ps1 -WorkspaceRoot C:\JVW
```

Keep the PowerShell window open while playing. Press `Ctrl+C` to stop Vite.

## Preservation and forward development

Playable recovery is not a rollback of project history.

```text
d6aa218… -> 4ace291… : 21 preserved commits
d6aa218… -> 26c5022… : 83 preserved commits
```

The later renderer, tiny-GLB, lit-normal, asset and packaging work remains reachable on its existing branches and commits. It will be recovered in reviewable slices onto a validated product candidate. No historical branch is deleted, rewritten or merged wholesale.
