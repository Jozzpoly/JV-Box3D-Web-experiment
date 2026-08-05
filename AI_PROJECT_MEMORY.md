# AI project memory — JV Web

Updated: 2026-08-05  
Status: `READ FIRST / BASELINE ACCEPTED / CANDIDATE R1 VALIDATION PENDING`  
Owner: Jozz

## Mission

Build a serious desktop/mobile browser demonstrator for Jozz Vehicle with owner-authored vehicle and scene assets, while preserving a path to real native JV mechanics.

Keep the project continuously runnable. Improve it through small, attributable and reversible slices with evidence appropriate to every claim.

## Accepted playable baseline

```text
repository:
  Jozzpoly/JV-Box3D-Web-experiment

frozen branch:
  agent/jv-web-playable-runtime

frozen commit:
  d6aa218064c2653f918cf7956d2fcd20a940caf3

toolchain:
  Node 24.16.0
  npm 11.17.0

role:
  known-good browser reference runtime
  legacy_ts_m6
  not product physics authority
  native JV parity not proven
```

Fresh owner-machine recovery passed the full historical gate and reached a live browser runtime. Jozz then confirmed on the exact desktop checkpoint:

```text
steering: works
drive/brake: works
destroy/rebuild: works
camera: works
stability: works
```

Evidence and screenshot hash are recorded in [`docs/operations/PLAYABLE_BASELINE_2026-08-05.md`](docs/operations/PLAYABLE_BASELINE_2026-08-05.md).

Do not patch the frozen baseline commit or use its worktree for development.

## Current recovery candidate

```text
PR:
  #23 — draft / do not merge

base:
  agent/jv-web-playable-runtime
  d6aa218064c2653f918cf7956d2fcd20a940caf3

candidate:
  candidate/jv-web-render-host-r1
  e263e3e05ea21e74585d74829136e3defbd67813

historical range:
  first 12 commits after d6aa218…

status:
  VALIDATION PENDING
```

Technical question:

> Can the renderer-owned scene-pass boundary and its lifecycle/failure protections be recovered without changing the visible behavior of the accepted baseline?

Included product files:

```text
src/render/m6-debug-renderer.ts
src/render/m6-scene-render-pass.ts
src/render/vehicle-visual-render-resource.ts
src/render/vehicle-visual-unlit-capability.ts
```

The candidate also includes focused tests. It does not change `main.ts`, physics, assets, GLB activation, materials, textures, lighting or packaging.

The final candidate commit fixes malformed camera-vector subtraction and is required.

Canonical validation command:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\candidate-validation\Launch-JvWebRenderHostR1.ps1
```

Candidate uses port `5174`; the accepted baseline may remain on `5173` for direct comparison.

Full scope and acceptance criteria:

- [`docs/candidate-validation/RENDER_HOST_R1.md`](docs/candidate-validation/RENDER_HOST_R1.md)
- [`docs/recovery/SALVAGE_MAP_2026-08-05.md`](docs/recovery/SALVAGE_MAP_2026-08-05.md)

## Canonical owner workflow

### Normal baseline launch

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Run-JvWebPlayable.ps1
```

### Deliberate baseline revalidation

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Launch-JvWebPlayable.ps1
```

### Current candidate validation

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\candidate-validation\Launch-JvWebRenderHostR1.ps1
```

### Control-plane validation after operator changes

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebPowerShellSyntax.ps1
```

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebControlPlane.ps1
```

Internal helper scripts are not alternative owner workflows.

## Branch roles

```text
main
  minimal control base; not current product implementation

agent/jv-refoundation-control-plane
  operating rules, evidence records and safe local operators

agent/jv-web-playable-runtime @ d6aa218…
  frozen accepted recovery reference

candidate/jv-web-render-host-r1 @ e263e3e…
  current bounded candidate; validation pending

agent/jv-lit-normal-foundation @ 26c5022…
  quarantined historical source; 83 commits after baseline
  never promote wholesale
```

Important historical checkpoints:

```text
4ace291a65c36e512b611cdb71e247b538955179
  renderer preparation; 21 commits after baseline

dcec0a7b5938b5d07cf5fdff8f81afd9db89e4ec
  historical lit-normal green claim; exact evidence remains separate

891c7561142b601f62ea76b68b0f55f8fababc6c
  historical real-vehicle forensic source
```

## Planned recovery order

```text
R1 renderer host boundary and failure isolation
R2 transactional GPU startup and camera-matrix isolation
R3 deterministic tiny unlit draw proof
R4 owner-authored untextured vehicle
R5 lit-normal renderer
R6 generated fixture and portable packaging recovery
R7 textures and material policy
R8 scene and scan rendering
R9 native JV Core WASM parity
```

No later slice begins until the current candidate passes its required automated and owner layers.

## Sources of truth

1. **Native physics and authored native asset authority**  
   `Jozzpoly/Box3d_FunProject`, pinned to an exact commit for every experiment.

2. **Accepted browser reference**  
   `agent/jv-web-playable-runtime@d6aa218…` plus its receipt and owner acceptance.

3. **Current product candidate**  
   `candidate/jv-web-render-host-r1@e263e3e…`, not accepted until exact validation.

4. **Behavioral claims**  
   Exact source commit, dependency lock, relevant hashes, raw logs and scoped owner observation.

5. **This file**  
   Navigation and current state only; never proof by itself.

## Architectural boundary

```text
TypeScript / browser:
  lifecycle
  fixed-step scheduling
  timestamped input
  UI and experiments
  persistence
  rendering
  immutable runtime snapshot consumption

native JV Core + Box3D in one future WASM module:
  product physics authority
  blueprint compilation
  bodies, joints and wheel/contact backend
  steering, drivetrain, brakes, aero and future tyre work
  stable semantic part mapping
  native/WASM parity traces
```

`legacy_ts_m6` remains a browser research fixture. Do not add final vehicle mechanics to it.

The product must have one scene/camera/render-context owner. Three.js remains a leading renderer hypothesis, not an accepted final decision.

## Acceptance model

Every candidate progresses independently through:

```text
IDENTITY → SOURCE → PACKAGE → RUNTIME → OWNER → PROMOTION
```

Passing one layer never implies the next. Use scoped terms such as `SOURCE/PACKAGE GATE PASS`, `RUNTIME OBSERVED` and `OWNER ACCEPTED`.

## Current next decision

Validate exact Candidate R1. Required before any R2 work:

```text
complete local gate PASS
source identity preserved
browser starts on port 5174
no fatal console error
steering unchanged
drive/brake unchanged
destroy/rebuild unchanged
camera unchanged
stability unchanged
explicit owner acceptance
```

## Terminal-loop prevention

- Never repeat an unchanged failed command.
- Every rerun requires a code/configuration change or genuinely new evidence.
- Stop at the first unattributed failure.
- Preserve the one complete relevant log and identify one exact next action.
- Do not make Jozz manually clean, reset or reconstruct operator-created worktrees.
- Normal play must not repeat the full recovery gate.
- Keep owner commands few, stable and documented.

## Non-negotiable rules

- Git Diff Patcher Bridge is forbidden.
- No merge, Ready transition, visibility change, Pages publication or new Actions without Jozz.
- No `PASS`, `GREEN`, `PARITY`, `REPRODUCED` or `PRODUCTION-READY` claim without matching evidence.
- Owner observation is separate from automated tests.
- A changed source commit, dependency lock, native commit or relevant asset hash expires the previous exact-head claim.
- Never delete or rewrite preserved historical branches.
- Never use `git reset --hard`, `git clean`, force-push or forced worktree removal in recovery workflows.
- Keep active workstreams small, attributable and reversible.
