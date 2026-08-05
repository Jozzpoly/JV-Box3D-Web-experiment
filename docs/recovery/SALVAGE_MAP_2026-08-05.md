# JV Web salvage map — 2026-08-05

## Purpose

Recover the valuable post-baseline work without promoting the historical 83-commit stack wholesale and without mutating the frozen owner-accepted baseline.

## Frozen baseline

```text
branch: agent/jv-web-playable-runtime
commit: d6aa218064c2653f918cf7956d2fcd20a940caf3
status: full historical gate + fresh desktop owner acceptance
```

The baseline remains the rollback and comparison reference. It is not a development branch.

## Recovery rule

Each recovery slice must:

1. start from an explicitly accepted base;
2. answer one technical question;
3. preserve exact historical source attribution;
4. exclude unrelated visible features;
5. pass the complete local gate on the exact candidate head;
6. preserve source identity during the gate;
7. receive separate owner observation;
8. remain draft and unmerged until accepted.

## R1 — renderer host foundation

```text
branch: candidate/jv-web-render-host-r1
PR: #23
base: d6aa218064c2653f918cf7956d2fcd20a940caf3
head: e263e3e05ea21e74585d74829136e3defbd67813
commits: 12
status: VALIDATION PENDING
```

Technical question:

> Can the renderer-owned scene-pass boundary and its lifecycle/failure protections be recovered without changing the visible behavior of the accepted baseline?

Included historical sequence:

```text
a0973bd  render: add owned scene render-pass host
60eafd4  render: define fail-closed unlit vehicle capability
53f244f  render: validate pass capability before GPU allocation
5a87333  test(render): prove scene pass lifecycle and isolation
1897a4f  test(render): keep first vehicle shader capability honest
9b83526  test(render): reject unsupported runtime before GPU allocation
3eb0f3a  render: prepare debug renderer for owned scene passes
eff2c95  test(render): integrate owned passes with the debug canvas
d97eee6  render: harden scene pass failure reporting
de9fb4f  test(render): reject invalid phases and reporter faults
0ec985a  render: minimize scene-pass integration diff
e263e3e  fix(render): restore exact vector subtraction
```

Exact product-file scope:

```text
src/render/m6-debug-renderer.ts
src/render/m6-scene-render-pass.ts
src/render/vehicle-visual-render-resource.ts
src/render/vehicle-visual-unlit-capability.ts
```

No `main.ts` activation, GLB draw pass, model, material, texture, physics or packaging change.

The final commit is mandatory: it replaces a malformed Z subtraction expression with exact `a.z - b.z` camera math.

Validation entry point:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\candidate-validation\Launch-JvWebRenderHostR1.ps1
```

Candidate uses port `5174`; the accepted baseline may remain on `5173` for side-by-side comparison.

## R2 — transactional GPU startup and camera isolation

Candidate source range after R1:

```text
8a8dc554  render: make debug GPU construction transactional
cf3aece9  test(render): prove transactional debug GPU startup
d83b642e  render: isolate pass camera matrices
5fda7bc4  test(render): prove camera matrix isolation between passes
```

Supporting documentation commits may be rewritten against the current operating model rather than copied verbatim.

Required behavior:

- partial shader/program/mesh initialization releases all earlier GPU resources;
- pass camera matrices cannot mutate the renderer or another pass;
- visible baseline behavior remains unchanged;
- no asset renderer is activated.

R2 is not created until R1 is accepted.

## R3 — deterministic tiny unlit draw proof

Recover only after R2:

- one explicit unlit vehicle pass;
- renderer-owned WebGL context only;
- `UNLIT_POSITION_BASE_COLOR_V1` capability enforced before GPU allocation;
- deterministic tiny fixture only;
- unchanged debug renderer remains available as fallback;
- no normals, lighting, textures or final vehicle.

Likely historical source areas:

```text
src/render/vehicle-visual-unlit-pass.ts
related capability, loader and pass tests
minimal main.ts installation only after the pass is independently proven
```

Do not copy the entire later `main.ts` diff.

## R4 — owner-authored untextured vehicle

After the tiny pass is accepted:

- real owner-authored body and four wheels;
- explicit package/axis/scale/origin contract;
- immutable runtime transforms only;
- load failure leaves the accepted debug observer usable;
- destroy/rebuild and camera behavior preserved;
- desktop owner acceptance, then phone/LAN acceptance.

Do not combine this with textures or lighting migration.

## R5 — lit-normal renderer

Historical source areas:

```text
src/render/normal-matrix.ts
src/render/rigid-lit-normal-capability.ts
src/render/rigid-lit-normal-renderer.ts
src/render/vehicle-visual-lit-normal-pass.ts
src/visual/rigid-float-stream-integrity.ts
focused tests for each boundary
```

Required prior conditions:

- R3 and R4 accepted;
- normal streams are present in a real inspected asset;
- exact normal-matrix and float-integrity tests pass;
- unlit/debug fallback remains operational.

Do not interpret source-present lit-normal code as a validated renderer.

## R6 — generated fixture and portable packaging recovery

Historical source areas:

```text
tools/generated-public-staging.mjs
tools/generated-vehicle-visual-fixture-catalog.mjs
tools/write-vehicle-visual-fixtures.mjs
portable validators and manifest writers
vite.config.ts changes
```

This slice must be designed around the accepted runtime and current operator model. Historical packaging changes are not copied wholesale because the quarantined head has a known source-gate failure class.

## R7 — textures and material policy

Only after the untextured real vehicle and lit-normal path are accepted:

- explicit image decode ownership;
- texture/sampler lifecycle;
- color-space policy;
- GPU texture-memory budget;
- material fallback;
- mobile evidence.

Relevant historical design sources include ADR-0004 and ADR-0005, but design text is not implementation evidence.

## R8 — scene and scan rendering

- visual and collision assets remain separate;
- real scan evidence, not only synthetic fixtures;
- origin/radius/chunking/culling policy;
- memory and mobile performance budgets;
- no collision inference from rendered triangles without an explicit accepted collision pipeline.

## R9 — native JV Core WASM

- one native JV Core + Box3D module;
- stable C ABI, units and axes;
- immutable copied observation snapshots;
- native/browser scenario corpus;
- trajectory and mechanism telemetry comparison;
- `legacy_ts_m6` is replaced only after parity acceptance.

## Rejected recovery strategies

```text
REJECT: merge or fast-forward the 83-commit historical stack wholesale
REJECT: treat 4ace291… or 26c5022… as an accepted product head
REJECT: activate real assets before renderer ownership and fallback are accepted
REJECT: combine renderer, textures, packaging, physics and scan work in one PR
REJECT: project baseline PASS or owner acceptance onto a newer commit
REJECT: use GitHub Actions for routine validation without explicit owner approval
```

## Current next decision

Validate R1 at exact `e263e3e…`. No R2 branch or visible asset work begins until R1 has:

```text
SOURCE/PACKAGE GATE PASS
RUNTIME OBSERVED
OWNER ACCEPTED — unchanged desktop baseline behavior
```
