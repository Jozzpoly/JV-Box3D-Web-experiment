# AI project memory — JV Web

Updated: 2026-08-08
Status: `R0 PUBLISHED / R1 ACTIVE / HANDOFF READY`
Owner: Jozz

This is a compact navigation map for a fresh agent. It never overrides Git, exact source, raw evidence or owner validation.

## Current campaign truth

```text
ACTIVE CORE:
  Jozzpoly/JV-Box3D-Web-experiment
  branch: development/jv-web-r1

PUBLIC DEMO:
  Jozzpoly/JV-Box3D-Web-Public
  release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
  tree f1c5c9a971208d89da05143f10913891a58b3b70
  Pages: https://jozzpoly.github.io/JV-Box3D-Web-Public/

NATIVE JV:
  Jozzpoly/Box3d_FunProject
  maintained by another agent and intentionally frozen for this Web-demo campaign
```

For this campaign JV-Web is the practical core. Native JV is only a source of existing mechanisms/knowledge to inspect or selectively port when needed (especially `b3Wheel`). Do not advance native JV unless Jozz explicitly changes scope.

## Closed R0

Private source:

```text
5ba6cc406b8c1541e29cd1ae59ffed78a7509284
tree 08314a0182a38bbcd106e984dde73e737a1a13e7
```

Validated candidate ZIP SHA-256:

```text
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2
```

Public:

```text
release/r0 c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree       f1c5c9a971208d89da05143f10913891a58b3b70
rollback   401068f5734c841d43907b71484bc03a2396c604
```

R0 proved exact Windows source/artifact reproducibility, project-path/live Edge, exact public promotion, Pages, zero public scan requests and owner manual use on desktop + real phone.

Do not rewrite R0 bytes in place.

## Owner's current campaign goal

Before JV-Web is considered complete, the friend-demo should contain most of:

- Jozz's own polished vehicle model;
- substantially better racing-game-style chase camera;
- desktop orbit/zoom + phone pinch zoom;
- recovered simple JSPREV2 scan path, acceptable on phone if practical;
- teleportation between world locations;
- vehicle presets;
- browser-native vehicle settings panel;
- FWD / RWD / AWD;
- properly defined drivetrain/shaft locking;
- useful QoL;
- UI rebuilt around Web/mobile;
- native JV's newer smooth `b3Wheel` / "prawdziwy kolider koła" ported into the Web Box3D runtime before campaign closure if the technical path is sane.

Order is adaptive. Jozz's live feel during actual play is an explicit priority signal. Social-media polish is later and must not slow the current friend-demo.

## Current runtime facts

Live vehicle rendering is still procedural:

```text
M6DebugRenderer -> M6ProductRenderer -> M6WorldRenderer
box chassis + cylinder wheels + diagnostic rig primitives
```

Dormant visual foundation already exists:

- `M6TraceFrame.visualFrame`;
- current 18-part + 8-segment frame;
- `VehicleVisualPackageV1` / `M6_FULL_RIG_V1`;
- GLB hash/policy/decoder/runtime loader;
- GPU geometry ownership;
- binding->world transform resolver;
- deterministic tiny full-rig fixture.

Missing: live GLB draw integration and later texture/material runtime support.

`M6_FULL_RIG_V1` is useful current proof topology, not sacred final ABI.

Current backend:

```text
legacy_ts_m6
REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Current Box3D Web runtime:

```text
box3d.js@0.0.2
binding 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
inline-single-threaded
```

Its active binding/boundary does not expose native `b3Wheel`, so the true-wheel feature requires a controlled Web engine/binding port rather than a simple config toggle.

Current drivetrain uses `allWheelDrive: boolean`: false=rear 2 driven, true=all 4. FWD/RWD/AWD is a plausible bounded extension. The requested shaft/drivetrain locking semantics are still unresolved and must not be guessed.

## Preserved salvage sources

Scan:

```text
product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580
important earlier hardening: 106312083875b5aa94cf1f9fc986ac3c26888aa5
```

It previously integrated vehicle + E2R/offroad + private JSPREV2 render/collision in one desktop browser world. Tip repaired UV/filter/view behavior. Phone scan performance remains unproven as a finished property.

Owner visual tooling:

```text
candidate/jv-web-owner-vehicle-visual-r1@796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Selective salvage only: Blockbench/glTF inspection, chassis/wheel calibration, deterministic package generation, embedded PNG pixel textures, NEAREST/CLAMP_TO_EDGE, OPAQUE/MASK alpha handling.

Do not wholesale merge. Candidate renderer stayed procedural and texture generation outran runtime draw support.

The actual authoritative source model files have NOT yet been proven by this audit to be safely versioned in the repo. Locate/revalidate them before owner-model integration; ask Jozz only if repository/history/File Library cannot recover them.

## Adaptive plan

```text
R1-A  short reconciliation + exact owner/scan/b3Wheel risk checks
R1-B  real car + materially better chase camera
R1-C  recovered scan + world teleport + phone measurement
R1-D  config model + presets + FWD/RWD/AWD + defined lock semantics
R1-E  true b3Wheel Web runtime
R1-F  Web/mobile UI rebuild
R1-G  QoL / friend-demo polish / closure
```

This is provisional. Reorder based on actual play, evidence and discovered risk.

Tiny GLB is an internal diagnostic step on the shortest path to Jozz's real car, not a meaningful user milestone by itself.

## Process constraints that matter

- minimize Jozz's manual intervention;
- when Windows operators are needed, prefer isolated disposable workspaces in Downloads;
- do not use or modify existing local JV-Web folders unless explicitly necessary;
- no GitHub Actions for this workflow;
- no force pushes;
- preserve exact public artifact provenance and rollback;
- distinguish product failure from harness failure;
- validate the stage that actually changed;
- do not send Jozz through known-broken gates;
- do not let release engineering consume product development again;
- public releases should correspond to owner-visible value, not every internal step.

## Read first in a fresh conversation

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. `docs/handoff/JV_WEB_HANDOFF_2026-08-08.md`
4. `docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md`
5. `docs/r1/R1_F0_VEHICLE_FOUNDATION_AUDIT.md`
6. `docs/BRANCH_ROLES.md`
7. exact source files relevant to the first revalidated implementation slice

## First-session protocol

Do not implement immediately.

Freshly verify both repo refs and Pages; inspect the active renderer/visual/input/camera/config path; inspect scan and owner candidate only for exact salvage questions; inspect native JV only enough to bound the `b3Wheel` Web port; list facts/contradictions/unknowns; revalidate the adaptive plan with Jozz's current priorities; then define the smallest next owner-visible implementation slice.

Likely next product direction: live visual path toward Jozz's real car plus an early bounded `b3Wheel` feasibility check. Treat this as a hypothesis to revalidate, not an inherited command.
