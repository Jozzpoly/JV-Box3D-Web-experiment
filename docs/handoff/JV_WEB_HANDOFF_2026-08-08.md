# JV Web — controlled conversation handoff

Date: 2026-08-08
Owner: Jozz
Purpose: transfer the project into a fresh conversation without either losing critical intent or treating old reasoning as unquestionable truth.

## 0. How to use this document

This is a handoff map, not an implementation order carved in stone.

A fresh agent must:

1. re-read the repository and verify all refs before acting;
2. separate exact repository/runtime facts from working hypotheses;
3. challenge the plan against current code and owner intent;
4. preserve the published R0 baseline;
5. optimize for visible, motivating product progress without sacrificing reproducibility or hiding failures;
6. ask Jozz only for information/assets that cannot be recovered from repository/history/files.

Do not continue from this file mechanically.

## 1. Campaign scope — owner correction

For the current campaign, the active core is JV Web, not native JV.

```text
Jozzpoly/JV-Box3D-Web-experiment
  = active private JV-WEB core / development laboratory

Jozzpoly/JV-Box3D-Web-Public
  = controlled demonstrator artifact / GitHub Pages surface

Jozzpoly/Box3d_FunProject
  = native JV, maintained by another agent and intentionally frozen for this campaign
```

Native JV may be inspected as a source of already-existing mechanisms and knowledge, especially `b3Wheel`, but this agent must not advance or reorganize native JV unless Jozz explicitly changes scope.

JV-Web is allowed to move ahead of native JV in presentation, browser UX, configuration, camera, quality-of-life systems and demo polish. The long-term architectural aspiration remains that future native JV work can be ported to Web simply, but that must not slow the current demonstrator unnecessarily.

## 2. What success means for this campaign

The current public R0 proves delivery, but it is not the desired end of the JV-Web experiment.

Before Jozz considers this Web experiment complete, the public demonstrator should contain most of the following, subject to owner feel and discoveries during implementation:

- Jozz's own vehicle model, as well integrated and visually polished as practical;
- a substantially better racing-game-style chase camera;
- desktop orbit/zoom and mobile two-finger pinch zoom;
- a simple usable JSPREV2 scan path, recovered from the previously working desktop implementation and made acceptable on phone if practical;
- teleportation between useful world fragments/locations;
- vehicle presets;
- a browser-native vehicle settings panel;
- selectable FWD / RWD / AWD;
- a clearly defined drivetrain/shaft locking capability after its exact mechanical meaning is established;
- useful QoL features discovered through actual play;
- a UI rebuilt around the Web experience rather than inherited diagnostic layout;
- port of native JV's newer smooth `b3Wheel` / "prawdziwy kolider koła" into the Web Box3D runtime before final campaign closure, if the technical spike confirms a sane path.

The order is deliberately adaptive. Owner feel during actual play may move camera, visual, scan, drivetrain, wheel or UI work earlier/later.

Social-media readiness is a later benefit, not a current design constraint. The immediate audience is primarily Jozz and friends.

## 3. Exact published R0 baseline — DO NOT REWRITE IN PLACE

Private R0 source:

```text
repo:   Jozzpoly/JV-Box3D-Web-experiment
commit: 5ba6cc406b8c1541e29cd1ae59ffed78a7509284
tree:   08314a0182a38bbcd106e984dde73e737a1a13e7
```

Validated candidate ZIP SHA-256:

```text
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2
```

Public release:

```text
repo:       Jozzpoly/JV-Box3D-Web-Public
release/r0: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree:       f1c5c9a971208d89da05143f10913891a58b3b70
rollback:   401068f5734c841d43907b71484bc03a2396c604
```

Pages:

```text
https://jozzpoly.github.io/JV-Box3D-Web-Public/
source: release/r0 /(root)
HTTPS: enforced
```

R0 proof:

- exact Windows source gate PASS;
- 290/290 tests;
- two byte-identical 14-file public builds;
- project-path Edge PASS;
- exact fast-forward promotion;
- fresh public clone reproduced exact tree;
- live HTTPS Edge PASS;
- zero public scan requests;
- Jozz manually confirmed live desktop and real-phone usability, vehicle drive/steer/brake and portrait/landscape layouts.

R0 is a regression reference and rollback, not the branch to keep editing.

## 4. Active private development line

As of this handoff preparation, the active branch before the handoff checkpoint was:

```text
development/jv-web-r1
parent tip: fd1a7b439849ffba503f6a5ed58794f546fbd852
```

A fresh agent must resolve the actual current tip again; this handoff itself is expected to advance it with documentation only.

The branch already contains the R0 release foundation plus an R1-F0 audit of the vehicle visual stack.

## 5. Current product/runtime facts

### 5.1 Public/current vehicle

The live vehicle is still rendered procedurally (box chassis, cylinder wheels and diagnostic rig primitives).

The current physics backend is:

```text
legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

This is acceptable as the current Web demonstrator foundation; do not pretend it is proven native-JV parity.

### 5.2 Existing dormant vehicle-visual pipeline

The active source already has substantial infrastructure:

- `M6TraceFrame.visualFrame` / `VehicleVisualFrameV1` produced from live mechanics;
- 18 part + 8 segment current M6 visual frame;
- `VehicleVisualPackageV1` / `M6_FULL_RIG_V1` bindings;
- GLB fetch/hash/policy/CPU decode;
- GPU geometry-buffer ownership;
- binding-to-world transform resolution;
- deterministic tiny full-rig fixture.

The missing product bridge is live GLB draw integration in the running M6 renderer plus later texture/material runtime support.

Important uncertainty: `M6_FULL_RIG_V1` is a useful current proof contract, but it is not sacred future ABI. Revalidate before expanding it significantly.

### 5.3 Current Box3D Web runtime

The active browser runtime is pinned to:

```text
box3d.js@0.0.2
binding commit: 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine commit:  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
variant: inline-single-threaded
```

Its current boundary exposes ordinary Box3D primitives/joints/mesh APIs but not native JV's `b3Wheel` API.

Therefore the desired "prawdziwy kolider koła / nowe, najgładsze" is not a UI toggle. It likely requires a controlled Web/Emscripten Box3D build containing the selected native `b3Wheel` delta plus JS/TS binding exports and a pinned runtime receipt.

Do an early technical spike so this risk is known; do not automatically make the full port the first implementation task.

### 5.4 Drivetrain

Current M6 config already has `allWheelDrive: boolean`.

Current drive logic means:

```text
false -> rear two corners driven
true  -> all four corners driven
```

A clean FWD/RWD/AWD enum is therefore a plausible bounded extension, but must still be implemented/tested rather than assumed.

The exact meaning of Jozz's requested "blokowanie wałów" remains unresolved. Do not invent a fake differential/shaft lock. Resolve the intended mechanical semantics before implementing that control.

## 6. Preserved salvage sources — inspect, do not wholesale merge

### 6.1 Scan / map product line

```text
product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580
```

Important earlier hardening point:

```text
106312083875b5aa94cf1f9fc986ac3c26888aa5
```

This line previously integrated one world containing:

- accepted Web vehicle;
- E2R/offroad map;
- private JSPREV2 render;
- JSPREV2 Box3D collision;
- map/scan spawn selection;
- shared camera/WebGL world;
- exact-pack validation and ownership rules.

The branch tip `c8e0bf...` additionally repaired scan UV/view semantics including `UNPACK_FLIP_Y_WEBGL=0`, NEAREST/LINEAR control and grid/view controls.

Known limitation: this path was demonstrated on desktop browser; phone scan performance/correctness was not established as a finished product property. Recover the known-working desktop path first, then measure phone bottlenecks before optimizing.

Do not publish private JSPREV2 bytes accidentally. R0 deliberately excluded them.

### 6.2 Owner vehicle candidate

```text
candidate/jv-web-owner-vehicle-visual-r1@796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Useful salvage:

- Blockbench/glTF inspection;
- owner chassis calibration;
- marker-driven wheel calibration;
- deterministic owner package generation;
- embedded PNG pixel textures;
- NEAREST / CLAMP_TO_EDGE expectations;
- OPAQUE/MASK and alpha-cutoff handling in generated assets;
- concept of five real owner channels (chassis + four wheels) with diagnostic placeholders elsewhere.

Do not wholesale merge this branch. Its live renderer remained procedural and the texture-producing toolchain outran the active runtime decoder/GPU draw support.

Critical uncertainty: this audit confirms tooling, but does NOT prove that Jozz's final source model files are safely versioned in the repository. A fresh agent must locate/revalidate the actual source assets before owner-model integration. Ask Jozz only if repository/File Library/history cannot recover them.

## 7. Working plan — intentionally provisional

This is the current shape of the campaign, not a mandatory milestone chain.

### R1-A — handoff/reconciliation + three short risk/salvage checks

Keep it short. No foundation marathon.

- reconcile current docs with owner-corrected campaign scope;
- resolve exact current refs;
- inspect exact owner-model salvage paths/assets;
- inspect exact scan salvage paths;
- perform a bounded `b3Wheel` Web-build feasibility spike/design so its risk is known early.

Then stop planning and implement visible product value.

### R1-B — "this is my car"

Internal technical sequence may be:

1. tiny GLB live draw proof;
2. immediately replace with Jozz chassis + four wheels;
3. correct scale/orientation/pivots/poses;
4. add pixel textures/alpha as soon as geometry/pose is trustworthy;
5. build a proper chase-camera subsystem alongside the real car, not as late polish;
6. desktop orbit/zoom and mobile pinch zoom;
7. Jozz drives it and decides whether the visual/camera feel is good enough before moving on.

Tiny GLB is a diagnostic step, not a user-facing milestone.

### R1-C — "this is my world"

- recover known-working JSPREV2 desktop integration selectively;
- preserve E2R/offroad;
- introduce a real in-app world-location/teleport system instead of treating location choice as page reload navigation;
- prove desktop first;
- then test real phone;
- optimize only the demonstrated bottleneck (render, collision, startup, texture/GPU memory, etc.).

### R1-D — vehicle sandbox/configuration

First define one Web vehicle configuration model with clear application semantics (`LIVE`, `REBUILD_VEHICLE`, `REBUILD_WORLD` or equivalent), then build UI on top of it.

Target functions:

- presets;
- FWD/RWD/AWD;
- steering/drive/suspension settings chosen for actual usefulness;
- exact drivetrain/shaft-lock function once semantics are resolved;
- local owner preset persistence if it proves useful.

Do not start by exposing every existing numeric field as a slider.

### R1-E — true `b3Wheel` Web runtime

After the early feasibility spike, integrate the selected native wheel implementation as a pinned Web Box3D runtime/binding delta.

Goal is a faithful port of an existing native mechanism, not a new Web-only tire research program.

Keep a clearly identified legacy wheel backend during migration if that makes comparison/rollback easier.

### R1-F — UI rebuild

Rebuild the interface after the real feature/state model is clearer.

Design for browser/mobile product use, not native ImGui parity:

- driving HUD;
- camera/quick actions;
- map/teleport;
- preset;
- vehicle settings drawer/sheet;
- optional diagnostics, not diagnostics dominating the screen.

### R1-G — QoL / friend-demo polish / campaign closure

Derive QoL from actual repeated play: reset/respawn, camera reset, fullscreen, loading state, error state, remembered choices, hide diagnostics, etc.

Publish only owner-visible checkpoints. Do not turn every private technical commit into a Pages release.

Possible public checkpoints:

```text
Preview 1: real car + materially better camera
Preview 2: + scan/world teleport
Demo:      + useful configuration/drivetrain + b3Wheel + new UI/QoL
```

Actual ordering may change with owner feel and discoveries.

## 8. What the fresh conversation MUST revalidate before coding

Do not assume these are already settled:

1. actual current `development/jv-web-r1` tip and clean branch identity;
2. public R0 refs/Pages still unchanged;
3. exact current runtime/test state after this docs-only handoff;
4. whether `M6_FULL_RIG_V1` remains the best immediate live-render proof contract;
5. exact source assets for Jozz's chassis/wheels and their current authoritative versions;
6. smallest safe salvage diff from owner candidate;
7. smallest safe salvage diff from scan branch;
8. `b3Wheel` Web/Emscripten/binding feasibility and what native files/commits are actually required;
9. mobile gesture/input arbitration for pinch/orbit vs simultaneous drive controls;
10. desired semantics of drivetrain/shaft locking;
11. which vehicle settings/presets are actually valuable enough for the first demo;
12. whether the current broad R1-B→G order still matches Jozz's feel after the first real implementation slice.

## 9. Context we intentionally do NOT carry forward as active work

A fresh agent should not spend time reconstructing every R0 gate failure, PowerShell wrapper bug or old branch chronology unless diagnosing a matching regression.

Historical lessons to retain instead:

- distinguish product failure from harness failure;
- validate the stage that actually changed;
- do not send Jozz through known-broken gates;
- minimize user intervention;
- use disposable isolated workspaces, preferably Downloads when a Windows operator is needed;
- do not touch Jozz's existing local JV-Web folders unless explicitly necessary;
- no GitHub Actions for this workflow;
- avoid force pushes;
- preserve exact artifacts/provenance for public promotion;
- do not let release engineering consume product development again.

The long R0 chronology remains recoverable from Git and `docs/repair/`; it does not need to live in working memory.

## 10. Evidence classes to keep distinct

Use precise language:

- `SOURCE-PRESENT` — code exists;
- `TESTED` — automated check passed;
- `RUNTIME OBSERVED` — actual browser/runtime behavior observed;
- `OWNER ACCEPTED` — Jozz manually judged/used it;
- `PUBLISHED` — exact public artifact is live.

A green synthetic test is not a substitute for phone feel, visual correctness or actual scan performance.

## 11. Recommended first session in the new conversation

The fresh agent should NOT start by implementing immediately.

Suggested first session:

1. fetch current refs from both JV-Web repos;
2. read `AGENTS.md`, `AI_PROJECT_MEMORY.md`, `docs/PROJECT_STATE.md`, this handoff, R0 baseline and R1-F0 audit;
3. inspect current code around renderer/visual runtime/input/camera/config;
4. inspect `product/jv-web-car-map-scan` and `candidate/jv-web-owner-vehicle-visual-r1` only for the exact salvage questions;
5. inspect native JV only enough to bound `b3Wheel` Web port — do not work on native JV;
6. explicitly list: proven facts / contradictions / unknowns / changed assumptions;
7. revalidate the adaptive plan with Jozz's current priorities;
8. define the smallest next implementation slice that produces owner-visible progress without creating a new architectural trap;
9. only then implement.

The likely next implementation remains the live visual path toward Jozz's real car, with the `b3Wheel` feasibility question bounded early, but this is a hypothesis to revalidate — not an order inherited from this chat.
