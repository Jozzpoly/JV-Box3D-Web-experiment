# JV Web — architecture map

Updated: 2026-08-13
Status: **CURRENT R1 BOUNDARIES / PROVISIONAL VEHICLE MECHANICS EXPLICIT**

This document describes current system boundaries. It does not declare temporary steering or rig choices to be final architecture; active task state lives in `docs/HANDOFF.md`.

## 1. Product/runtime entry

```text
index.html
-> src/product-main.ts
-> product world + controls
-> M6ProductRenderer
-> M6WorldRenderer
```

`M6ProductRenderer` loads the generated owner-vehicle visual package. `M6WorldRenderer` owns WebGL rendering, camera state/input and vehicle visualization.

## 2. World boundary

The product world combines browser vehicle physics with E2R/offroad world data and optional private JSPREV2 scan data.

Private scan delivery is a dev-only/local path and remains separate from any future public Pages asset decision.

## 3. Physics boundary

Current browser backend remains a Web/reference vehicle implementation, not a declaration that historical native M5/M6 topology is authoritative.

Mechanism-specific native/recovery evidence can inform Web work after direct revalidation. Native JV remains read only in this campaign.

## 4. Current front-corner state

Owner-accepted semantics are narrower than the implementation:

```text
#6 Socket_ChassisMount_b -> suspension-side / non-steering source role
#8 Socket_WheelCenter   -> separate steerable source role relative to #6
wheel                   -> steering orientation + independent spin
steering center         -> accepted source-derived WheelCenter position
```

Current FL realizes those DOFs using a provisional carrier/steerable-body split. That topology is **not** accepted as future JV architecture.

`R1-DRIVE-BRIDGE-01` is also explicitly temporary: the historical FR physical steering link is removed and FR receives the same provisional rack->angle command as FL. This fixes the proven mixed-mechanism driving defect but intentionally provides no physical contact->rack back-drive/self-align.

Do not infer final steering mechanism, final FR topology, caster/KPI/trail or rack geometry from the bridge.

## 5. Deferred rig/mating boundary

Current wishbone<->knuckle visuals do not have trustworthy authored mating frames through articulation; FL lower placement is not accepted.

Do not repair this by visual offsets or by tuning physics hardpoints to make the current mesh assembly look joined. A future owner-facing rig/workbench should author the actual mating points/frames.

## 6. Physics -> visual boundary

Runtime vehicle state exposes part transforms; the owner-vehicle layer maps semantic source meshes onto them. Segment/part-pair deformation remains useful for visual attachment, but visual calibration must not silently become physics authority.

Current generated owner package remains deterministic at:

```text
real bindings: 59
GLB bytes: 829936
SHA-256: 1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc
```

The temporary bridge does not change those visual bytes.

## 7. Owner vehicle source / authority boundary

Tracked inputs include:

```text
assets/owner-vehicle/source/*.gltf
assets/owner-vehicle/contracts/*.asset.json
public/receipts/jv_m6_factory_receipt.json
```

These files do **not** share one authority level.

- authored glTF markers/rigid geometry author what they explicitly contain;
- current owner checkpoints govern accepted semantics/behavior;
- secondary JSON contracts/receipts/calibration reports are derived or historical evidence and must be revalidated when they conflict;
- legacy R3 calibration helpers remain compatibility/reproducibility machinery, not current steering truth.

The front semantic contract is v3: #6 `suspensionSide`, #8 and #7 outboard `steerableMember`; rack-side #7 geometry/coupling is not authored and remains an engineering decision.

## 8. Wheel interface invariant

The physical wheel spin center and authored `Socket_WheelMount` are distinct semantic points. Do not collapse them merely because both participate in wheel packaging.

## 9. Steering research boundary

Reproduced physical research shows that a coherent bilateral mechanism can recover active left/right symmetry, but current spatial tie-rod experiments remain coupled to unresolved rack/suspension hardpoints and produce material bump-steer.

No numeric caster/KPI/trail/scrub/rack-anchor setting is architecture. Current bounded research asks whether a bilateral rack-translation <-> steering-coordinate constraint can be expressed without guessed spatial mating geometry or hidden centering.

## 10. Camera/input ownership

Camera state and pointer camera controls live in the renderer path. Vehicle input and camera gestures must not steal ownership from each other.

RATE steering `RELEASE` means stop commanding rack motion. The temporary bridge does not add hidden recentering.

## 11. Scene/package contracts

Durable public contracts live under `docs/contracts/`. Contract changes should be explicit and tested. Tests should protect invariants and externally meaningful behavior, not incidental implementation counts or provisional steering equations.

## 12. Public artifact boundary

Private source and public release remain separate repositories. Published R0 is immutable historical proof. Future R1 publication must use a new explicit artifact/version and separately decide what scan resources may be public.

## 13. Architecture principles

- owner evidence and exact authored semantics outrank historical rig labels;
- authoring asset, visual model, physics prefab and contact model are separate layers;
- source-derived facts must be distinguished from engineering hypotheses;
- generated artifacts remain reproducible;
- visual corrections do not silently retune physics;
- temporary product bridges remain explicitly temporary;
- tests protect accepted invariants rather than freezing experimental implementation;
- unresolved rig debt is exposed, not masked.
