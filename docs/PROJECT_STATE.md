# JV Web — current project state

Updated: 2026-08-10
Owner: Jozz
Status: `R0 PUBLISHED / R1 ACTIVE / V0 OWNER BASELINE OBSERVED / VISUAL RECOVERY PREPARED / PRODUCT CORRECTION NOT STARTED`

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

Resolve exact tips live before every write. Historical/salvage refs are not ordinary takeover inputs.

## 2. Current campaign

Build a motivating browser friend-demo that increasingly feels like Jozz's own game. Current focus is narrower: recover the owner vehicle's visual/mechanical presentation through small owner-validated interfaces.

Handling/stability/steering-feel tuning is explicitly deferred until visual recovery closes.

Durable recovery execution contract: `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md`.

## 3. Current product/world

```text
index.html
-> src/product-main.ts
-> M6ProductRenderer
-> product world / E2R-offroad
-> optional LOCAL_FULL JSPREV2 private scan path
```

The scan unexpectedly loaded successfully during V0. This is useful OWNER OBSERVED evidence but not a reason to open the scan lane now.

## 4. Reproducible owner-rig artifact

```text
vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

The package is deterministic from repository-owned source glTF files, semantic contracts and factory receipt. Physical wheel spin center and authored `Socket_WheelMount` remain intentionally distinct.

## 5. V0 exact validation evidence

On 2026-08-10 the unchanged owner-rig baseline ran on Jozz's Windows machine through the prepared validation launcher.

Canonical execution: exact Node 24.16.0 / npm 11.13.0, pinned dependency install, TypeScript typecheck PASS, exact owner artifact regeneration/reverification, 13 focused tests PASS, Vite 8.1.5 production build PASS and normal local validation session.

Interpretation: E0/E1 reproducibility/internal-consistency evidence. This is not visual acceptance and not handling-quality evidence.

## 6. Current owner-visible state

The rig is broadly not correct enough to polish around one local steering bug.

OWNER OBSERVED:

- chassis/body roughly acceptable;
- suspension/wishbones too far from frame;
- damper/spring rigging wrong and significant geometry intersects/enters wheels;
- cardans miss the correct visible differential mating location;
- much suspension/upright/hub geometry is buried inside wheels;
- wheel placement cannot yet be judged confidently because surrounding bad geometry obscures it;
- general vehicle/wishbone attitude is a usable starting point but final ride height should be slightly higher.

Historical R4 claims that wheels were excellent and suspension almost excellent remain historical only; exact session state was never persisted.

## 7. Dynamic state — deferred

Jozz reports severe regression of driving feel, suspension stability and steering/controllability compared with earlier playable experience.

Focused rack/constraint tests still pass. Treat this as evidence divergence: automated safety consistency is not owner feel.

Owner decision: do not repair dynamics now. Reopen that as a separate campaign after visual closure.

## 8. Evidence model for recovery

```text
E0 identity/reproducibility
E1 local calibration consistency
E2 cross-asset mating truth
E3 runtime kinematic coherence
E4 owner visual acceptance
E5 owner handling/feel acceptance — later
```

Several existing tests prove E1 against the same calibration model used by the generator. V0 demonstrates why E1 cannot substitute for E2/E4.

## 9. Generator/dependency facts

R3 patches the exact R2 package rather than independently re-authoring every part. It separately handles front/rear wishbones, knuckle/hub/chassis references, dampers, cardans and wheel interface. This makes bounded mechanism-level recovery possible.

The dependency root is currently treated as chassis/corner attachment authority, not steering pivot. Downstream hub, damper and cardan judgments depend on a coherent chassis-to-wheel skeleton.

## 10. Preparation findings

A new measurement-only interface audit is now available:

```text
npm run inspect:owner-rig-interfaces
```

It regenerates the exact rig, compares authored whole-rig placement with current physical targets, measures proximity to rendered chassis geometry and groups all 59 real bindings. Its classification is `MEASUREMENT_ONLY_NOT_ACCEPTANCE`; it deliberately does not freeze current bad distances.

Representative symmetric V0 deltas:

```text
upper hinge authored placement -> current target ~0.216 m
lower hinge authored placement -> current target ~0.155 m
damper upper authored placement -> current target ~0.529 m
front authored steering socket -> current physical steering arm ~0.222 m
```

Nearest-surface measurements further support investigating chassis-side mount authority first, especially damper upper placement. They do not prove authored placement is final.

Cardan current pair endpoints equal authored placed socket points in this audit, yet V0 still shows differential-side visual mismatch. Therefore endpoint consistency alone is insufficient; rendered mating face/pivot/orientation must be checked later.

## 11. Native selective prior art

Current native JV has relevant read-only evidence:

- native and Web share the chassis base visual transform;
- native lands authored suspension `WheelCenter` on wheel `Socket_WheelMount` before splitting visual roles;
- native separates chassis/lower-arm/knuckle visual ownership;
- native wishbones draw between live endpoints;
- native steering rod uses real rack center because rack-end placement created a short stub;
- native diagnostics visualize live hardpoints, kingpin, coilover and rack/steering relations.

This prior art should be checked mechanism-by-mechanism before inventing new mappings. It does not authorize wholesale native port or parity claims.

## 12. Prepared execution order

The stable execution contract defines the dependency stages:

```text
P0 preparation/measurement — complete
S1 chassis <-> suspension attachment authority
S2 corner landing / kinematic body roles
S3 wishbones
S4 upright / hub / wheel
S5 dampers / springs
S6 steering rods
S7 cardans
S8 stance
S9 whole-rig visual integration
D0 later handling/stability recovery
```

This is a dependency model, not a rigid roadmap. Skip stages proven correct and split stages further whenever attribution benefits.

Each product slice must ask one narrow visible question, define allowed bindings/mechanisms, run focused evidence, produce a stable candidate, obtain one owner verdict and freeze accepted scope before the next mechanism.

## 13. Tooling road

T0 interface audit exists now. T1 visual category/corner isolation, T2 physical/reference overlay, T3 fixed validation views, T4 reusable owner-candidate launcher and T5 accepted-interface regression gates are designed but intentionally lazy: implement each only when a selected slice needs it.

V0 proved the self-contained Windows launcher pattern. Future owner candidates should reuse/formalize it so Jozz validates appearance rather than technical setup.

## 14. Physics/runtime authority

```text
backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Do not use visual recovery to retune TypeScript drivetrain/suspension/tire/steering behavior.

## 15. Public state

Public R0 remains immutable on `release/r0`. R1 publication resumes only after meaningful owner-visible progress is worth showing. Do not rebuild/replace R0 in place.

## 16. Current operational state

- branch/documentation cleanup complete;
- `main` only active source authority;
- exact V0 artifact and canonical Windows/browser execution proven;
- fresh owner screenshots/description are current visual authority;
- recovery dependency plan and evidence taxonomy defined;
- measurement-only interface audit implemented;
- native selective prior art identified;
- no owner-rig product correction started after V0;
- dynamic feel/stability/steering regression recorded and deferred.

Next product work begins only when Jozz explicitly opens implementation. The first step is not an asset patch: discriminate the authority/cause for one S1 chassis-to-wishbone attachment relationship, then make the minimum correction.
