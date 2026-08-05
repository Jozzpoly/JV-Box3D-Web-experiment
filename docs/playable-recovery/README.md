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

## One-command launch

Run from the existing control-plane checkout:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Start-JvWebPlayable.ps1
```

The operator [`Start-JvWebPlayable.ps1`](../../tools/playable-recovery/Start-JvWebPlayable.ps1):

1. verifies repository identity, exact Node `v24.16.0` and npm 11.x;
2. fetches the pinned runtime branch;
3. uses a short per-user workspace under `%LOCALAPPDATA%\JV-Web-Playable`;
4. enables Git long-path handling only for the worktree checkout command;
5. creates or reuses an external detached worktree at the exact commit;
6. skips incomplete or unexpected candidate directories without deleting them;
7. preserves the complete Git checkout log and tries the next untouched candidate path;
8. verifies the byte-pinned native receipt;
9. runs the checkpoint's own complete `run-demonstrator-foundation-gate.ps1`;
10. preserves the complete gate log and writes a machine-readable local receipt;
11. starts Vite on `http://localhost:5173` and exposes the LAN address.

Default external locations:

```text
%LOCALAPPDATA%\JV-Web-Playable\runtime-d6aa218\
%LOCALAPPDATA%\JV-Web-Playable\evidence\
```

The earlier failed operator attempted to create a worktree beside the deeply nested repository. Any partial directory from that attempt is left untouched. The corrected operator does not depend on it and does not require manual cleanup.

Keep the PowerShell window open while playing. Press `Ctrl+C` to stop Vite.

To validate without starting the server:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Start-JvWebPlayable.ps1 -ValidateOnly
```

A custom external location can be supplied explicitly:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Start-JvWebPlayable.ps1 -WorkspaceRoot C:\JVW
```

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
