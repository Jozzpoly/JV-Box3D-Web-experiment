# JV Web — current project state

Updated: 2026-08-10
Owner: Jozz
Status: `R0 PUBLISHED / R1 ACTIVE / V0 OWNER BASELINE OBSERVED / VISUAL RIG CORRECTION PREP`

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

## 2. Product goal

Build a motivating browser friend-demo that increasingly feels like Jozz's own game. Ordering follows executable evidence + owner observation rather than stale roadmaps.

Current campaign focus: make the owner vehicle visually/mechanically coherent through small owner-validated slices. Handling/stability tuning is temporarily deferred by owner decision.

## 3. Current product/world

```text
index.html
-> src/product-main.ts
-> M6ProductRenderer
-> product world / E2R-offroad
-> optional LOCAL_FULL JSPREV2 private scan path
```

The scan unexpectedly loaded successfully during V0. This is a useful current OWNER OBSERVED fact but not a reason to change the active car scope.

## 4. Reproducible owner-rig artifact

Current renderer loads the generated owner package:

```text
vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

The package is generated deterministically from repository-owned source glTF files, semantic contracts and the factory receipt. `public/vehicles/m6-owner-r3/` is generated/ignored.

Critical semantic contract still preserved by current source/tests: physical wheel spin center and authored `Socket_WheelMount` are distinct points.

## 5. V0 exact validation evidence

On 2026-08-10 the unchanged current owner-rig baseline was run on Jozz's Windows machine through the prepared validation launcher.

Canonical execution:

- Node 24.16.0 / npm 11.13.0;
- pinned dependencies installed;
- TypeScript typecheck PASS;
- owner rig regenerated at the exact identity above;
- 13 focused owner-rig/steering tests PASS;
- Vite 8.1.5 production build PASS;
- owner-rig identity reverified after build;
- local validation candidate launched and session closed normally.

Interpretation: reproducibility/internal contract PASS. This is not visual acceptance and is not a handling-quality gate.

## 6. Fresh owner-visible state — current authority

The current visual rig is broadly **not correct enough to polish locally around one steering bug**.

OWNER OBSERVED:

- chassis/body is roughly acceptable;
- suspension/wishbones are too far from the frame;
- damper/spring rigging is wrong and significant damper geometry intersects/enters wheels;
- cardans reach the hub/wheel region but miss the correct visible differential mating location;
- much of the suspension/upright/hub package between wishbones and wheel is buried inside wheels;
- wheel placement cannot yet be judged confidently because bad surrounding geometry obscures it;
- general vehicle/wishbone attitude is usable as a starting point, but ride height should ultimately be slightly higher.

The historical R4 observation that wheels were excellent and suspension almost excellent remains historical evidence only. Its session configuration (`owner_r4`, `Tire=0`) was not persisted, so the conflict with V0 must remain explicit and unresolved.

## 7. Dynamic state — serious but intentionally deferred

Jozz reports that driving feel, suspension stability and steering/controllability have strongly regressed compared with earlier playable experience.

Current focused steering tests still pass rack/constraint safety checks. Therefore automated safety consistency and owner feel are currently divergent evidence, not interchangeable verdicts.

Owner decision: **do not repair driving feel yet**. Finish visual rig coherence first, then reopen suspension/steering/vehicle-feel work as its own campaign.

## 8. Why current green tests are insufficient for geometry acceptance

Several focused tests validate that generated geometry/bindings match the current calibration model. They do not independently prove that the calibration model's target point is the correct visible mating point on the authored vehicle.

Examples:

- cardan endpoints can exactly match a geometry-derived differential-face calculation while still missing the visually correct differential output on the rendered chassis;
- wishbone vertices can exactly map to current M6 hardpoints while those hardpoints/relationships are visually too far from the authored frame;
- all 59 bindings can remain attached to live runtime parts while local axes, endpoint derivations or transforms remain visually wrong.

Required evidence separation:

```text
SOURCE/CONSISTENCY PASS
ARTIFACT REPRODUCIBLE
RUNTIME ATTACHED
OWNER VISUALLY CORRECT
OWNER FEEL ACCEPTED
```

These are separate gates.

## 9. Current generator dependency facts

R3 is a patch over the exact R2 package rather than a clean independent re-authoring.

Current generator separately calibrates:

- front wishbone geometry to current M6 hardpoints;
- front knuckle/upright pieces to current wheel/kingpin geometry;
- chassis-side front brackets;
- front dampers as chassis-to-lower-arm part pairs;
- rear wishbones/hub/chassis references;
- rear twin dampers as chassis-to-lower-arm pairs;
- cardans as chassis differential-output to knuckle/hub part pairs;
- wheels through the authored wheel-mount interface.

This separation is useful: future corrections can be bounded by mechanism instead of rewriting all 59 bindings.

## 10. Prepared visual-repair methodology — no implementation yet

The next work must proceed root-to-leaf because bad root relationships currently make downstream parts hard to judge.

Prepared dependency hypothesis:

```text
A. chassis <-> suspension/wishbone attachment skeleton
B. hub/upright package between wishbones and wheel
C. damper/spring rig
D. cardan visual endpoints
E. remaining local front/rear pieces
F. stance/ride height
G. whole-rig visual integration
H. later: handling/stability/steering feel
```

This is not a fixed roadmap. Before each implementation slice, inspect the exact source transform chain, define the smallest allowed blast radius, and change only one observable relationship/mechanism.

For symmetric mechanisms, prove the solve on one conceptual side/corner first when practical, then mirror deterministically rather than independently hand-tuning all four corners.

Each implementation cycle:

```text
one narrow visual question
-> exact source/current-state measurement
-> smallest correction
-> focused automated evidence
-> stable playable candidate
-> one focused Jozz verdict
-> record/freeze accepted scope
-> next question
```

Do not create a broad `fix suspension` or `fix owner rig` slice.

## 11. Physics/runtime authority

```text
backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Do not use the coming visual campaign as an excuse to retune TypeScript drivetrain/suspension/tire/steering behavior.

## 12. Public state

Public R0 remains immutable and published from `release/r0`. R1 publication resumes only after meaningful owner-visible progress is worth showing. Do not rebuild/replace R0 in place.

## 13. Current operational state

- branch cleanup complete; `main` is the only active authority;
- exact V0 artifact and Windows/browser execution are proven;
- fresh owner screenshots + description are the current visual authority;
- previous R4 visual acceptance is historical, not current;
- current visual rig requires systematic correction;
- dynamic feel/stability/steering regression is recorded but intentionally deferred;
- no product correction has yet been started after V0.

The next conversation step may begin implementation only after selecting one smallest dependency-root visual relationship and revalidating the live `main` tip.
