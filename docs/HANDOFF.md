# JV Web — current handoff

Updated: 2026-08-10
Purpose: rolling continuation note. Replace stale content instead of appending history.

## Authority

```text
Private repo: Jozzpoly/JV-Box3D-Web-experiment
Active branch: main
(resolve live tip before every write)

Public repo: Jozzpoly/JV-Box3D-Web-Public
Frozen Pages branch: release/r0

Native reference: Jozzpoly/Box3d_FunProject
read-only for this campaign
```

Current owner-rig artifact remains reproducible:

```text
id: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

## V0 — current owner-visible truth

Canonical Windows validation passed exact Node/npm, dependency install, typecheck, deterministic generation, 13 focused tests and Vite production build. This proves reproducibility/internal consistency, not visual correctness.

Fresh OWNER OBSERVED state:

- chassis/body roughly acceptable;
- suspension/wishbones too far from the frame;
- damper/spring rigging wrong and substantial geometry enters wheels;
- cardans reach the hub region but do not visually mate at the correct differential location;
- upright/hub/suspension package is buried in wheels, so wheel placement is not yet judgeable with confidence;
- eventual stance should be slightly higher;
- driving feel, suspension stability and steering feel are strongly regressed but deliberately deferred;
- scan unexpectedly loads successfully, but scan work remains outside the active car lane.

Earlier R4 observations are HISTORICAL OWNER OBSERVED, not current visual authority.

## Preparation phase — COMPLETE

The visual recovery campaign has been decomposed and a durable execution contract now lives at:

`docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md`

Core rule: work interface-first and root-to-leaf, one observable relationship at a time. Do not use a downstream adjustment to hide an unresolved upstream relationship.

Evidence layers are separated:

```text
E0 identity/reproducibility
E1 local calibration consistency
E2 cross-asset mating truth
E3 runtime kinematic coherence
E4 owner visual acceptance
E5 owner handling/feel acceptance — later
```

A major V0 lesson is that several existing tests prove E1 while the visible result fails E2/E4.

## Prepared measurement tool

`npm run inspect:owner-rig-interfaces`

The new audit is `MEASUREMENT_ONLY_NOT_ACCEPTANCE`. It regenerates the exact owner artifact, groups all 59 real bindings and compares authored whole-rig placement with current physical targets and rendered-chassis proximity.

Representative V0 measurements:

```text
front upper hinge authored->current ~0.216 m
front lower hinge authored->current ~0.155 m
front damper upper authored->current ~0.529 m
rear upper hinge authored->current ~0.216 m
rear lower hinge authored->current ~0.155 m
rear damper upper authored->current ~0.529 m
front authored steering socket -> current steering arm ~0.222 m
```

These numbers support investigating attachment authority first but are not acceptance thresholds.

The cardan audit also shows current R3 pair endpoints equal the authored placed cardan socket points while the owner still sees a differential-side visual miss. Therefore future cardan work must validate rendered mating faces/pivots/orientation, not only endpoint coordinates.

## Native selective prior art

Before inventing a mapping for a mechanism, inspect current native JV selectively.

Already recovered:

- Web/native share the chassis base visual transform;
- native corner placement lands authored suspension `WheelCenter` on wheel `Socket_WheelMount` before splitting roles;
- native visual suspension distinguishes chassis/lower-arm/knuckle roles;
- native wishbones use live endpoint-to-endpoint drawing;
- native steering rod uses real rack center because rack-end placement created a short stub;
- native diagnostics visualize hardpoints, kingpin, coilover and steering/rack relationships.

Do not wholesale port native code or claim parity from this prior art.

## Tooling road

T0 interface audit is implemented now. T1 visual category/corner isolation, T2 physical/reference overlay, T3 fixed validation views, T4 reusable owner-candidate launcher and T5 accepted-interface regression gates are designed in the campaign document and must be implemented lazily only when the selected slice needs them.

V0 already proved the self-contained Windows launcher pattern; reuse/formalize it for owner checkpoints instead of asking Jozz to debug setup manually.

## Product boundary

No owner-rig product correction was made during this planning/preparation phase.

Do not tune handling, suspension stability, steering feel, tires, drivetrain, scan, camera or UI while beginning visual recovery.

Do not begin with `fix suspension` or `fix all wishbones`.

## Next implementation gate

Wait for Jozz to explicitly open implementation.

Then begin under S1 with the smallest evidence-producing question: establish authority and actual spatial relationship for **one chassis-to-wishbone attachment interface**. Use the interface audit and native selective evidence to discriminate whether the issue is physical hardpoint authority, visual mapping, source placement or a combination.

Only after the cause is discriminated may a product correction be created. The first owner candidate must ask one narrow visual question and leave unrelated mechanisms frozen.
