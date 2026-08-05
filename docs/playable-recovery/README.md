# Playable JV Web recovery

This path restores a known-good browser runtime without switching, resetting or modifying the active control-plane worktree.

## Pinned runtime

```text
branch: agent/jv-web-playable-runtime
commit: d6aa218064c2653f918cf7956d2fcd20a940caf3
```

Evidence already associated with this checkpoint:

- exact local dependency install and full repository gate;
- 218/218 tests;
- TypeScript, documentation, third-party and portable-package checks;
- desktop and phone owner confirmation;
- visible debug vehicle, controls and destroy/rebuild;
- real Box3D/WASM contacts.

The runtime remains the `legacy_ts_m6` reference fixture. It is a playable browser foundation, not native-JV parity and not final product physics.

## Canonical one-command launch

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
6. transfers execution to [`Start-JvWebPlayable.ps1`](../../tools/playable-recovery/Start-JvWebPlayable.ps1).

The inner operator then verifies the byte-pinned native receipt, runs the checkpoint's complete historical gate, preserves the full gate log and starts Vite at `http://localhost:5173` only after PASS.

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

Any earlier partial long-path directory is left untouched and is not required for launch.

## Other modes

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

The later renderer, tiny-GLB, lit-normal, asset and packaging work remains reachable on its existing branches and commits. It will be recovered in reviewable slices onto a freshly validated playable base. No historical branch is deleted, rewritten or merged wholesale.

Acceptance order after launch:

1. owner smoke: desktop controls, visible vehicle, contacts, drive/brake, destroy/rebuild;
2. optional phone/LAN smoke;
3. preserve the recovery receipt and owner observation;
4. recover later modules one bounded slice at a time;
5. run exact automated and owner validation after every slice.
