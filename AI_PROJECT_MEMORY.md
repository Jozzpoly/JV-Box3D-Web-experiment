# AI project memory — JV Box3D Web

Updated: 2026-08-03
Status: `CANONICAL / READ_FIRST`

## 1. Purpose

Build a serious browser version of the current Jozz Vehicle research/runtime slice using Box3D WebAssembly without changing the soul of JV:

- no hidden artificial vehicle mechanics;
- physical behavior remains traceable to native JV or an explicitly approved experiment;
- owner feel and visual verdicts belong to Jozz;
- browser, desktop and mobile hosts must not silently change the physics profile;
- current work begins with M6/M7+ architecture, never historical M5.

## 2. Mandatory tool rule

`Git Diff Patcher Bridge` is categorically forbidden for this project.

Use:

- GitHub connector;
- normal Git commands given to Jozz only when local action is actually required;
- project CI only for justified product checks;
- manual forensic workflows only when their evidence must be refreshed.

Do not interrupt work by claiming that Git Diff Patcher Bridge is required.

## 3. Branch map

### `main`

Minimal repository root. It is not the working implementation.

### `agent/bootstrap-web-poc`

Historical, runnable browser prototype and draft PR #1.

Status:

```text
QUARANTINED IMPLEMENTATION EVIDENCE
DO NOT CONTINUE AS PRODUCT FOUNDATION
DO NOT MERGE WHOLESALE
```

Useful ideas may be reimplemented after proof. The branch contains rejected behavior, especially automatic steering return-to-zero and centre hold.

### `agent/fundamental-audit-rebuild`

Documentation, source receipts, errata and manual forensic workflows. Draft PR #2.

Status:

```text
FOUNDATION DOCUMENTATION
NO PRODUCT RUNTIME
SOURCE FOR CLEAN DEVELOPMENT DECISIONS
```

### `agent/clean-browser-core`

Clean development branch created from the consolidated audit line.

Status:

```text
ACTIVE IMPLEMENTATION DESTINATION
```

It must remain free from wholesale copies of PR #1. Recover behavior and small adapters only after classification and tests.

## 4. Source authority

### Native JV baseline

```text
repository: Jozzpoly/Box3d_FunProject
main commit: 959aefb78587ce60cf2b8eb03ff82797a4165142
```

Critical sources include:

- `samples/jozz_vehicle_m6_geometry.cpp`
- `samples/jozz_vehicle_m6_suspension_rig.cpp`
- `samples/jozz_vehicle_m6_config_io.cpp`
- `samples/jozz_vehicle_m6_rig_lab*.cpp`
- `samples/jozz_vehicle_m7_suspension_import.*`
- `samples/jozz_vehicle_m9_steering_rig_bench.*`
- `samples/validation/jozz_probes_*.cpp`
- `samples/jozz_vehicle_asset_*.cpp`
- `assets/contracts/*.asset.json`

### Current wheel research snapshot used by this audit

```text
branch: jozz-scan-terrain-f0
commit: 761bd3ef60992f7dec3bcdddf1945fdbc1cb0825
```

The branch name is historical. It contains the current Wheel Scope program and findings through F-31/F-32 at audit time.

### Local owner working tree

Jozz's local JV path:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\box3d
```

Browser experiment path:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JV-Box3D-Web-experiment\JV-Box3D-Web-experiment
```

GitHub state does not prove local uncommitted files. Ask for a local receipt only when the exact local state matters. Never assume a different path.

## 5. Document precedence

When documents conflict, use this order:

1. latest direct decision from Jozz;
2. this `AI_PROJECT_MEMORY.md`;
3. `docs/PROJECT_STATE.md`;
4. `docs/AUDIT_ERRATA_2026_08_03_PL.md`;
5. exact source receipts and focused subsystem documents;
6. earlier broad audit documents;
7. PR #1 documentation and its old `AI_PROJECT_MEMORY.md`.

The old memory on `agent/bootstrap-web-poc` is not canonical. It incorrectly treats steering centre return/hold as an accepted fix.

## 6. Non-negotiable mechanics policy

Default realistic steering:

```text
rackCenteringHertz = 0
uprightAssist = false
```

After driver release:

- hands-on steering actuator turns off immediately;
- no target moves toward zero;
- no centre-hold timer;
- physical rack friction remains;
- any return while rolling must come from geometry, contact, caster, linkage and inertia;
- wheels may remain turned at standstill.

Optional native assists may be supported later only as explicit, default-off features after owner approval.

## 7. Precise digital steering direction

Jozz confirmed that the useful part of the old web input was small steering nudges from short A/D taps.

Do not recover the old return-to-zero filter.

Current research candidate:

```text
SteeringCommand = RELEASE | POSITION | RATE
```

First experiment:

- `RATE` operates in rack-space;
- command rebases to live rack at hands-on edge;
- key/pointer release produces immediate `RELEASE`;
- explicit cap prevents target lead from accumulating while blocked;
- timestamped input events are consumed by fixed-step simulation;
- keyboard and touch generate the same semantic command trace;
- no yaw/slip/speed feedback in the device mapper.

Reference documents:

- `docs/STEERING_INPUT_RESEARCH_2026_08_03_PL.md`
- `docs/STEERING_TAP_EXPERIMENT_MATRIX_2026_08_03_PL.md`

The old `2.25/s` normalized rate is a useful reference, not an accepted final parameter.

## 8. Wheel direction

Legacy M6 split wheel canonical ID:

```text
legacy_m6_split_sphere_sidewall
```

It is allowed only for reconstruction/regression. It is not the future tire architecture.

Important finding:

- Central Test Campus plate, rocks and bumpers are all `TERRAIN`;
- the legacy split therefore uses the rolling sphere on the main rocks and bumpers;
- changing categories to force the cylinder would preserve the rejected category-switched nature of the tire.

Clean architecture prepares only the durable seam:

```text
W1 WheelSpecSnapshot + explicit mass/inertia
W2 replaceable WheelContactBackend
neutral WheelContactObserver / WheelContactSet
W4 visual binding independent from W2
W3 future tire law absent until justified
```

No backend winner is selected. Do not port provisional Wheel Scope candidates into the vehicle runtime.

## 9. Mobile direction

Mobile is a near-term host target, not a separate physics version.

Allowed mobile changes:

- touch adapter;
- pointer ownership;
- low visual profile;
- lower DPR/shadows/debug visuals;
- smaller test world;
- reduced HUD cost.

Not allowed without a separate named physics receipt:

- fewer substeps;
- different contact tuning;
- different wheel backend;
- different mass data;
- device-dependent artificial steering forces.

First mobile test follows the clean input/host boundary and uses the same fixed-step command trace as desktop.

## 10. Confirmed problems in PR #1

Do not reintroduce:

- automatic steering return-to-zero;
- `0.35 s` centre hold;
- tests requiring centre capture at standstill;
- polling one input snapshot per render frame for all catch-up physics steps;
- two divergent vehicle controllers;
- silent fallback from invalid/unsupported session to another vehicle;
- web-only sanitization that changes native steering limits;
- hardcoded wheel dimensions presented as authored truth;
- full probe suite during ordinary app startup;
- moving asset refs without content provenance;
- non-transactional asset synchronization;
- one fixed negative collision group shared by every future vehicle instance;
- treating startup/build/Chrome smoke as owner feel or parity proof.

## 11. Valuable concepts recoverable after proof

Candidates, not automatic code copies:

- explicit WASM boundary and exact compatibility shims;
- four-corner double-wishbone multi-body topology;
- shapeless rack/arms with explicit mass data;
- physical tie rods and rack;
- torque drive, brake/coast, ARB and aero;
- `SkeletonUtils.clone` for independent skinned wheel instances;
- authored wheel marker concept;
- contextual M6/M9 visual binding roles;
- orbit/zoom camera;
- deterministic campus data after generated receipt;
- headless startup smoke at the correct evidence level.

## 12. Evidence levels

Use precise labels:

```text
SOURCE_FACT
MEASURED_FACT
MECHANISM_FALSIFICATION
INTERNAL_CONSISTENCY
LIVENESS_SMOKE
SCENARIO_EQUIVALENCE
VISUAL_OBSERVATION
OWNER_VALIDATED
```

Do not flatten these into one `PASS`.

`Build PASS`, `WASM starts` and `Chrome renders` are infrastructure evidence only.

## 13. Active implementation sequence

1. Consolidated foundation documents and branch structure.
2. Clean browser host with transactional lifecycle and fixed-step event timeline.
3. Typed runtime/config boundary and pinned minimal world profile.
4. Minimal M6 topology with one controller and full trace.
5. Precise RATE steering experiment on desktop.
6. Jozz owner test and behavior card for JV/JES.
7. Touch adapter and low visual mobile profile using the same physics trace.
8. Minimal future-wheel seam with legacy backend named explicitly.
9. Real visual bindings one corner at a time with image/owner gates.
10. Campus and scan only after their separate contracts and performance/contact receipts.

Detailed gates are in `docs/IMPLEMENTATION_ROADMAP.md`.

## 14. Current non-goals

Do not currently implement:

- backward compatibility for abandoned web prototypes;
- full campus and scan in the first clean slice;
- PWA/offline/mobile product shell;
- speculative tire temperature/wear/damage framework;
- a new tire backend without Wheel Scope evidence;
- real front/rear rig visuals before one-corner contextual binding proof;
- multi-vehicle gameplay before unique runtime collision groups exist;
- broad refactors of native JV unrelated to a proven browser blocker.

## 15. Work discipline

For substantial changes:

- read this file first;
- work from exact current branch/source refs;
- update this file after important decisions or state changes;
- keep commits small and named by evidence/behavior;
- send Jozz brief progress checkpoints during long work;
- do not claim local runtime success without Jozz or a real runtime receipt;
- do not rerun forensic workflows merely because documentation changed.
