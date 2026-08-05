# Candidate R1 — renderer host foundation

## Identity

```text
PR: #23
base branch: agent/jv-web-playable-runtime
base commit: d6aa218064c2653f918cf7956d2fcd20a940caf3
candidate branch: candidate/jv-web-render-host-r1
candidate commit: e263e3e05ea21e74585d74829136e3defbd67813
status: DRAFT / VALIDATION PENDING / DO NOT MERGE
```

## Purpose

Validate the smallest useful renderer-foundation recovery slice against the owner-accepted playable baseline.

The candidate adds a renderer-owned scene-pass boundary, explicit capability validation and failure isolation. It does not install a new vehicle renderer or change the intended visible result.

## One-command validation

Run from the control-plane checkout:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\candidate-validation\Launch-JvWebRenderHostR1.ps1
```

The operator:

1. requires exact Node `v24.16.0` and npm `11.17.0`;
2. verifies the remote candidate still points to exact `e263e3e…`;
3. creates or safely reuses a short external named-branch worktree;
4. leaves the active control-plane checkout untouched;
5. runs the candidate's complete historical repository gate;
6. preserves the complete gate log;
7. rechecks branch, commit and cleanliness after the gate;
8. writes a candidate receipt with owner observation still pending;
9. starts the candidate on `http://localhost:5174` only after gate PASS.

Default workspace:

```text
%LOCALAPPDATA%\JV-Web-Candidates\render-host-r1\
```

The accepted baseline may remain on:

```text
http://localhost:5173
```

This provides direct side-by-side comparison without moving or patching the baseline.

## Required owner comparison

After Candidate R1 starts, compare it with the accepted baseline:

```text
rendered host and debug vehicle
4 contacts after startup
steering
forward/reverse/brake
destroy/rebuild
camera orbit and zoom
several minutes of stability
fatal browser-console errors
```

Expected visible result: unchanged.

## Acceptance vocabulary

Automated gate success establishes only:

```text
SOURCE/PACKAGE GATE PASS
```

Browser startup establishes:

```text
RUNTIME OBSERVED
```

Only Jozz's explicit comparison establishes:

```text
OWNER ACCEPTED — RENDER HOST R1
```

No promotion or next recovery slice begins before all required layers are recorded.

## Failure handling

Do not rerun an unchanged failed command.

The operator reports one exact full log path. Preserve the terminal output and that log. Existing candidate worktrees or directories are never deleted automatically; unexpected paths are skipped and a fresh suffix is used.

Forbidden responses to a failure:

```text
git reset --hard
git clean
forced worktree removal
force-push
manual patching inside the measured worktree
```
