# JV Web — current project state

Updated: 2026-08-10
Owner: Jozz
Status: `R0 PUBLISHED / R1 ACTIVE / REAL OWNER RIG LIVE / OWNER BASELINE REVALIDATION NEXT`

This is the single detailed current-state document. Do not append historical work logs here.

## 1. Authority and scope

```text
Private source: Jozzpoly/JV-Box3D-Web-experiment
Active authority branch: main
Frozen history-retention ref: archive/pre-cleanup-2026-08-10

Public artifact repo: Jozzpoly/JV-Box3D-Web-Public
Published baseline: release/r0

Native JV: Jozzpoly/Box3d_FunProject
Role in this campaign: read-only reference
```

Resolve exact tips live before every write. The 2026-08-10 cleanup merged the accepted R1 development lineage into default `main`, so fresh agents and long-running work now share one source authority. The archive ref is not a development base and should not be inspected without a concrete historical/salvage question.

## 2. Product goal

Build a motivating browser friend-demo that increasingly feels like Jozz's own game. High-value lanes include vehicle visual/mechanical presentation, camera/mobile UX, world/scan/teleport, settings/drivetrain semantics, QoL/UI and later public Pages polish.

Ordering is adaptive and should follow evidence + owner feel rather than a fixed roadmap.

## 3. Current product entry/world

```text
index.html
-> src/product-main.ts
-> M6ProductRenderer
-> product world / E2R-offroad
-> optional LOCAL_FULL JSPREV2 in private dev
```

If an exact private scan pack is selected through `JOZZ_SCAN_PREVIEW_PACK`, the Vite dev plugin serves private scan bytes to the runtime. No pack is required for car + E2R/offroad.

Public scan delivery remains a separate future packaging/hosting/privacy decision.

## 4. Current vehicle visual state

The real owner vehicle is no longer a dormant proposal.

Current renderer loads:

```text
vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json
```

The artifact is generated deterministically from repository-owned source glTF files, semantic contracts and the factory receipt.

Current reproduced package identity:

```text
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

`public/vehicles/m6-owner-r3/` is generated/ignored. Checked-in `m6-owner-r2` remains a legacy deterministic test fixture, not the live product package.

## 5. Owner vehicle source authority

Current source assets:

```text
assets/owner-vehicle/source/Nadwozie.gltf
assets/owner-vehicle/source/Offroad_Big_Wheels.gltf
assets/owner-vehicle/source/OneSided_Steering_Suspension_Rig.gltf
assets/owner-vehicle/source/One_Sided_wheel_mount.gltf
assets/owner-vehicle/source/Asset_Dumper.gltf
assets/owner-vehicle/source/Cardan_shaft.gltf
```

Semantic contracts live in `assets/owner-vehicle/contracts/`.

Critical current contract: physical wheel spin center and authored `Socket_WheelMount` are different points. The current R3 package/test surface protects this distinction.

## 6. Current owner-rig decision point

Historical R4 observation says wheel placement was excellent and suspension packaging was close, while front steering/upright pivot still looked wrong, front steering rods looked too short and overall stance was slightly wide/low.

Technically, current physical topology already has separate chassis, upper/lower arms, knuckle, rack, steering-link constraint and wheel spin body. Current front visual calibration also still derives a lower-outboard point from a parallel-upright inference, and current steering tests still do not measure the decisive live anchor/kingpin/rotation-axis relationship.

Those facts prepare a useful steering investigation but do **not** authorize immediate correction. Jozz explicitly requested a fresh owner validation of the untouched current rig first, because the previous handoff sequence was interrupted and visually observed state should be re-established before planning new implementation.

Next action is therefore `V0 Owner Baseline Revalidation` as specified in `docs/HANDOFF.md`: **no product geometry or physics correction before the owner report**.

## 7. Owner-observed baseline

R4 is the currently protected historical owner-visible baseline. Jozz judged wheel placement excellent and suspension packaging close, but the front steering pivot still wrong and steering rods too short. Overall stance remained slightly wide/low.

Exact checkpoint classification is in `docs/OWNER_CHECKPOINTS.md`.

Important limitation: `owner_r4` / `Tire=0` are not currently encoded exact source presets. V0 exists partly to replace reliance on that interrupted-session description with a fresh observation of the reproducible current product baseline.

## 8. Camera/mobile

Current renderer owns chase/orbit/zoom behavior and desktop/mobile controls. Camera is not part of the owner-rig correction scope unless it materially blocks rig evaluation.

Future camera/mobile work should remain separately attributable so owner feedback on vehicle geometry is not mixed with camera feel.

## 9. Scan/world

Strongest historical scan proof is preserved in `docs/baselines/SCAN_C8E0_2026-08-05.md` and the unique `product/jv-web-car-map-scan` lineage.

Current source still contains LOCAL_FULL scan wiring. Therefore later scan work begins with current-path revalidation using the exact pack, not wholesale branch recovery.

Location switching still deserves a future in-app teleport/QoL pass rather than page/world rebuilds where practical.

## 10. Physics/runtime authority

```text
backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Current Web Box3D dependency remains `box3d.js@0.0.2`. A later bounded `b3Wheel` port is allowed only as an explicit feasibility/port slice; full native/WASM authority migration remains a separate long-term program.

## 11. Public state

Public R0 remains immutable and published from `release/r0`. Exact baseline evidence lives in `docs/baselines/R0_PUBLISHED_2026-08-07.md`.

R1 public preview tooling exists, but public promotion should resume only when a meaningful owner-visible slice is worth showing. R0 must not be rebuilt/replaced in place.

## 12. Validation model

- Tier 1: focused private slice checks + smallest relevant browser smoke.
- Tier 2: stable exact owner feel/visual/device candidate after automation.
- Tier 3: reproducible public release artifact + rollback + live Pages smoke.

Source/test proof never implies owner visual acceptance. Owner acceptance never implies native parity.

## 13. Current work decomposition

First establish the current owner-visible truth. Do not start by "fixing all 59 bindings":

```text
V0 unchanged current-rig owner revalidation
-> owner description of actual present state
-> record fresh checkpoint / protected and rejected observations

then choose one smallest technical lane only:
F0 front steering truth, if steering pivot remains first priority
F1 upright/kingpin, only if F0 evidence selects it
F2 steering rods, separately
F3+ upper/lower arm, damper, stance only if fresh evidence says they still need work
rear mechanisms one at a time only after front closure
I0 whole-rig integration without redesign
```

The sequence after V0 is conditional, not a mandatory roadmap. Accepted parts become protected scope. See `docs/OWNER_CHECKPOINTS.md`.

## 14. Current operational state

- remote branch cleanup is complete: 6 refs remain, including one frozen pre-cleanup archive ref;
- `main` is the only active source authority;
- the deterministic owner artifact has been regenerated in the orchestrator lab at 829944 bytes / 59 real bindings / exact SHA above;
- a Windows owner-validation launcher has been prepared to obtain exact Node 24.16.0 / npm 11.13.0, run focused checks, build and launch the unchanged current rig;
- canonical Windows/browser V0 execution and fresh owner observation are still pending until Jozz runs that candidate;
- `owner_r4`/`Tire=0` session state is not a persisted preset;
- F0 live steering truth remains technically outstanding but is intentionally deferred until after V0 owner feedback.

No additional broad handoff archaeology or branch archaeology is required before V0.
