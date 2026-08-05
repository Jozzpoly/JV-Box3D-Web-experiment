# AI project memory — JV Web

Updated: 2026-08-05  
Status: `READ FIRST / PLAYABLE RECOVERY + REFOUNDATION`  
Owner: Jozz

## Mission

Build a serious desktop/mobile browser demonstrator for Jozz Vehicle, with owner-authored vehicle and scene assets, while preserving a path to real native JV mechanics.

Keep the repository runnable and technically honest. Preserve strong contracts, evidence and valuable implementation work without treating a long experimental branch as automatically canonical.

## Current operating model

Two tracks are active and must not be conflated.

### Track A — restore a playable runtime now

```text
branch:
  agent/jv-web-playable-runtime

exact commit:
  d6aa218064c2653f918cf7956d2fcd20a940caf3

role:
  pinned known-good browser runtime

known evidence:
  full historical repository gate
  218/218 tests
  TypeScript/docs/notices/portable checks
  owner desktop and phone confirmation
  visible debug vehicle and controls
  destroy/rebuild
  real Box3D/WASM contacts
```

Launch only through:

```text
tools/playable-recovery/Start-JvWebPlayable.ps1
```

The operator creates an external detached worktree, re-runs the checkpoint's own full gate, writes a local receipt and starts Vite only after PASS. It must not switch, reset or patch the active control-plane worktree.

### Track B — recover and improve the long-term foundation

```text
canonical control base:
  main
  5c64903d753f893adc42be90e0c3d8053a95a922

control plane:
  agent/jv-refoundation-control-plane

post-playable renderer preparation:
  4ace291a65c36e512b611cdb71e247b538955179
  21 commits after d6aa218…

quarantined implementation head:
  agent/jv-lit-normal-foundation
  26c5022f8dfd33b8c5f80d0900d239a4d80966ea
  83 commits after d6aa218…
  status: SOURCE-CONFIRMED RED / exact local rerun pending

historical lit-normal green claim:
  dcec0a7b5938b5d07cf5fdff8f81afd9db89e4ec
  status: historical evidence only until rerun with raw logs

historical real-vehicle forensic checkpoint:
  891c7561142b601f62ea76b68b0f55f8fababc6c
  status: useful source, not exactly reproducible from the web commit alone
```

The 21- and 83-commit continuations are preserved in Git. Playable recovery is not permission to delete, rewrite or discard them. Recover later work as bounded modules with exact source attribution, tests and owner validation.

Do not continue product work directly on PR #21. Do not fast-forward the historical implementation stack into `main`.

## Sources of truth

1. **Native physics and authored native asset authority**  
   `Jozzpoly/Box3d_FunProject`, pinned to an exact commit for every experiment.

2. **Playable browser reference runtime**  
   `agent/jv-web-playable-runtime@d6aa218…` until a newer candidate passes the same or stronger gates and owner observation.

3. **Future browser product implementation**  
   A clean JV Web product branch accepted through recovery gates and owner review.

4. **Claims about behavior**  
   Exact evidence tied to one source commit, dependency lock, native commit and relevant asset hashes.

5. **This file**  
   Navigation and current operating state only. It is never proof by itself.

## Validated architectural boundaries

```text
TypeScript / browser:
  lifecycle
  fixed-step scheduling
  timestamped input
  UI and experiments
  persistence
  rendering
  immutable runtime snapshot consumption

native JV Core + Box3D, one future WASM module:
  product physics authority
  blueprint compilation
  bodies, joints and wheel/contact backend
  steering, drivetrain, brakes, aero and future tyre work
  stable semantic part mapping
  native/WASM parity traces
```

`legacy_ts_m6` is a browser research fixture. It is not product physics authority and must not receive final mechanics.

The product must have one scene/camera/render-context owner. A Three.js hybrid remains a leading renderer hypothesis, not an accepted final decision.

## Immediate sequence

1. Run the PowerShell syntax bootstrap and structural checker on the current control-plane head.
2. Execute the playable recovery operator for exact `d6aa218…`.
3. Record automated gate output and owner desktop observation.
4. Restore phone/LAN observation if needed for the next decision.
5. Freeze the resulting receipt as the operational baseline.
6. Build a per-module salvage map for the 83 later commits.
7. Recover the smallest high-value slice, beginning with renderer ownership protections before visible asset expansion.
8. Require exact automated and owner validation after each recovered slice.
9. Keep R1/R2 historical audit as a parallel evidence task; it must not block restoring a playable runtime.
10. Select a clean product snapshot only after the recovered runtime is demonstrably stronger than `d6aa218…`.

## Non-negotiable rules

- Git Diff Patcher Bridge is forbidden.
- No merge, Ready transition, visibility change, Pages publication or new Actions without Jozz.
- No `PASS`, `GREEN`, `PARITY`, `REPRODUCED` or `PRODUCTION-READY` claim without the evidence required by `EVIDENCE_STANDARD.md`.
- Plans and synthetic fixtures do not prove user-visible product behavior.
- Owner observation is recorded separately from automated tests.
- A changed source commit, dependency lock, native commit or relevant asset hash expires the previous exact-head claim.
- Keep active workstreams small, attributable and reversible.
- Never delete or rewrite preserved historical branches merely because a stable runtime is restored.
- Never use `git reset --hard`, `git clean`, force-push or forced worktree removal in recovery workflows.
- Playable worktrees are execution surfaces, not repair branches.
