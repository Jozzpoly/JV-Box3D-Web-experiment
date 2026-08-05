# Recovery plan

The project now has two coordinated objectives:

1. restore a trustworthy playable browser runtime immediately;
2. recover and improve the long-term foundation without discarding later work.

Ordinary product development remains blocked until each new product candidate passes the relevant control and architecture gates. Playable recovery itself is allowed because it uses a pinned historical checkpoint in a separate worktree.

## P0 — playable operational recovery

Goal: give Jozz a working JV Web runtime without changing the active control-plane checkout.

Pinned target:

```text
branch: agent/jv-web-playable-runtime
commit: d6aa218064c2653f918cf7956d2fcd20a940caf3
```

Required procedure:

1. exact Node `v24.16.0` and npm 11.x;
2. external detached worktree;
3. exact commit and byte-pinned receipt verification;
4. execute the target's own full historical gate;
5. preserve a local machine-readable recovery receipt;
6. start Vite only after gate PASS;
7. owner desktop observation;
8. phone/LAN observation when required by the next decision.

Canonical invocation:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Start-JvWebPlayable.ps1
```

Acceptance does not establish native parity or product-physics authority. It establishes an operational browser baseline.

## Preservation boundary

Playable recovery does not roll back repository history.

```text
d6aa218… -> 4ace291… : 21 preserved commits
d6aa218… -> 26c5022… : 83 preserved commits
```

The later renderer, tiny-GLB, lit-normal, asset and packaging work remains source material. Recover it by module and evidence, never by blindly promoting the whole stack.

## R0 — control plane

Goal: establish one clean place for current state, evidence vocabulary and branch rules.

Pass criteria:

- this refoundation documentation exists on a clean branch from `main`;
- no implementation branch is declared canonical;
- every historical claim is classified by evidence level;
- the PowerShell syntax bootstrap passes in the operator's installed engine;
- the local control-plane structural check passes.

Syntax bootstrap:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebPowerShellSyntax.ps1
```

Tracked control-plane check:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebControlPlane.ps1
```

## R1 — historical green baseline audit

Target: `dcec0a7b5938b5d07cf5fdff8f81afd9db89e4ec`.

R1 is an evidence-recovery task. It no longer blocks P0 playable recovery.

Procedure:

1. detached exact checkout;
2. declared historical Node/npm versions;
3. clean working tree;
4. `npm ci`;
5. full repository gate;
6. raw logs and artifact hashes;
7. no source changes during the run.

Preflight:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Invoke-JvWebBaseline.ps1 -Target R1 -FetchMissingRef -PreflightOnly
```

Canonical local invocation:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Invoke-JvWebBaseline.ps1 -Target R1 -FetchMissingRef
```

Outcome:

- `BASELINE_REPRODUCED`, or
- an attributable failure report.

Do not repair this branch during the baseline run.

## R2 — quarantined current head audit

Target: `26c5022f8dfd33b8c5f80d0900d239a4d80966ea`.

Run the same environment and evidence format as R1. Capture every failure before changing anything.

Canonical local invocation:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Invoke-JvWebBaseline.ps1 -Target R2 -FetchMissingRef
```

Then classify each post-`dcec0a7…` change:

- general reusable protection;
- renderer-host protection;
- asset-pipeline value;
- custom-renderer-specific;
- synthetic-fixture-only;
- build coupling;
- reject.

## R3 — PR #1 forensic recovery

Target web commit: `891c7561142b601f62ea76b68b0f55f8fababc6c`.

Required controls:

- pin one native JV commit;
- disable local native auto-detection;
- disable local session import;
- record dependency resolution because no reliable historical lock is present;
- hash every synchronized asset;
- distinguish historical owner evidence from the new forensic run.

R3 is intentionally not executed by the R1/R2 baseline harness.

Deliverable: a per-module salvage map, especially for:

- wheel marker contract;
- `SkeletonUtils.clone`;
- body and wheel loading;
- camera;
- disposal;
- failure fallback.

## R4 — recovered renderer candidate

Question: can the strongest reusable renderer ownership and failure-isolation protections be recovered onto the playable baseline without regressing its current behavior?

First candidate scope:

- one scene/camera/render-context owner;
- transactional pass installation and disposal;
- late async completion rejection;
- pass failure isolation;
- context-loss behavior;
- unchanged debug observer and physics;
- no real-model or texture dependency yet.

Only after that slice passes automated gates and owner observation should the tiny GLB or Three.js spike be reconsidered.

## R5 — real-car renderer spike

Question: can one accepted renderer owner render the real owner-authored vehicle through the deterministic host without reintroducing old coupling?

Minimum scope:

- real body;
- four real wheels;
- transforms only from immutable `VehicleVisualFrameV1`;
- no persistent `b3BodyId` or `b3JointId` in render state;
- pinned package and asset hashes;
- validation before scene publication;
- abort and late-load disposal;
- load failure that leaves the debug observer usable;
- destroy/rebuild;
- context-loss behavior;
- desktop and phone observation.

## R6 — clean product candidate

Only after the recovered renderer and real-car spike:

- select a clean base;
- transfer approved modules in reviewable commits;
- create one canonical product branch;
- replace conflicting AI memories;
- mark old PRs superseded only after evidence is preserved.

## R7 — scan vertical slice

After the real vehicle is stable:

- visual/collision asset separation;
- explicit axes, scale and origin;
- GLB inspection and memory policy;
- real scan, not only synthetic fixtures;
- desktop and phone evidence.

## R8 — native JV Core WASM

- smallest portable native core;
- stable C ABI with units and coordinate frames;
- copied immutable snapshots;
- native and browser scenario corpus;
- trajectory and mechanism telemetry comparison;
- replace `legacy_ts_m6` only after parity acceptance.
