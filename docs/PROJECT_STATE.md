# JV Web — current project state

Updated: 2026-08-08
Status: `R0 PUBLISHED PASS / OWNER ACCEPTED / R1 ACTIVE / HANDOFF DRAFT V4 TAKEOVER LAYER UNDER REVIEW`
Owner: Jozz

## 1. Current authority and campaign scope

```text
Private active core:
Jozzpoly/JV-Box3D-Web-experiment
development/jv-web-r1

Public friend-demo:
Jozzpoly/JV-Box3D-Web-Public
release/r0

Native JV:
Jozzpoly/Box3d_FunProject
READ-ONLY for this campaign; maintained by another agent
```

Resolve current refs before every operation.

Cold-start orchestration: `docs/handoff/JV_WEB_TAKEOVER_BRIEF_2026-08-08.md`
Current operating contract: `AGENTS.md`
Detailed current state: this file
Full handoff CORE: `docs/handoff/JV_WEB_HANDOFF_2026-08-08.md`
Exact resource map: `docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md`

Fresh agents should not load all of those before touching source. Read `AGENTS.md` + the takeover brief first, then retrieve deeper state/evidence only when the selected question requires it.

## 2. Published R0 baseline

```text
private R0 source:
5ba6cc406b8c1541e29cd1ae59ffed78a7509284
tree 08314a0182a38bbcd106e984dde73e737a1a13e7

validated candidate ZIP SHA-256:
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

public release/r0:
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree f1c5c9a971208d89da05143f10913891a58b3b70

rollback/main:
401068f5734c841d43907b71484bc03a2396c604

Pages:
https://jozzpoly.github.io/JV-Box3D-Web-Public/
```

R0 classification:

```text
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER ACCEPTED
PUBLISHED
```

R0 is closed. It remains the regression/rollback reference and must not be edited in place.

## 3. Current campaign target

JV-Web is being developed as a motivating friend-demo that increasingly feels like a real piece of Jozz's own game.

Desired closure includes most of:

- Jozz's own vehicle model, visually polished as practical;
- better racing-game chase camera;
- desktop orbit/zoom and phone pinch zoom;
- usable JSPREV2 scan and real-phone assessment;
- fast location/teleport switching;
- vehicle presets and Web-native settings state/panel;
- FWD/RWD/AWD;
- mechanically defined drivetrain/shaft locking;
- useful QoL discovered through play;
- rebuilt Web/mobile UI;
- selected native `b3Wheel` port if feasibility is sane.

Social-media optimization is deferred. Ordering is intentionally adaptive and may change after actual play.

## 4. Current private product entry and world

Current private root entry:

```text
index.html
→ /src/product-main.ts
```

Current private product still configures:

```text
loadLocalFullProductWorld
→ loadLocalJsprev2Scan()
→ createProductWorld(scan)
```

E2R/offroad is part of the product world. JSPREV2 is optional depending on an exact local pack being selected.

Current Vite dev config installs `finalJsprev2VitePlugin()`. The plugin is `serve`-only and reads:

```text
JOZZ_SCAN_PREVIEW_PACK
```

then serves private runtime endpoints under `/__jv_scan__/`.

If no pack is selected, car + E2R can run without scan.

This means scan work is no longer correctly described as a broad historical recovery task. The first current-R1 question is whether the existing LOCAL_FULL path still reproduces the known c8e0 desktop behavior once the exact pack is available.

## 5. Current scan/location truth

Strongest preserved historical desktop baseline:

```text
product/jv-web-car-map-scan
c8e0bf24748b0a790a1c0039b1be801eef266580
tree 3e241761784edd2a2fb6ab18095c25ea0e737185
```

Exact historical evidence:

```text
Node 24.16.0
npm 11.17.0
full foundation/build/portable gate PASS
source/package/asset gate PASS
7 tiles / 25 groups / 25 textures / 1,775,775 triangles
foundation gate log SHA-256:
3f2c35503fe4cbc3fb2340f93612fe2677ce3d92388eb4c107ba1decd635e68b
```

Historical owner observation tied to that run:

- scan displayed correctly;
- pixel smoothing OFF by default and toggleable;
- grid OFF by default and toggleable;
- vehicle collision correct.

`106312083875b5aa94cf1f9fc986ac3c26888aa5` remains the pre-fix causal baseline.

### Current-R1 continuity

Several important scan pieces survive directly in current R1, including:

```text
src/scene/jsprev2-scan.ts
src/scene/local-full-product-world.ts
src/product-main.ts
src/render/jv-product-view-settings.ts
src/render/jv-scan-webgl-policy.ts
vite.config.ts + dev scan plugin
```

Key scan/view-policy blobs are byte-identical to c8e0.

### Location-switch debt

Current `product-controls.ts` represents map/scan choices as links with different `jvSpawn` query parameters. That navigation restarts the page/product, so historical owner observation of roughly one-to-several-second world switching is unsurprising.

Future teleport should preserve reliable location/spawn semantics while attempting in-app vehicle reposition/reset rather than full page/world reconstruction.

## 6. Scan asset availability and public boundary

Historical exact runtime pack:

```text
source-preview-aee5242a20848294
```

Historical path:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JS_Photogrametry\repo\build\scan_pipeline\previews\source-preview-aee5242a20848294
```

Its current accessible location is not established in the handoff environment.

The supplied native ZIP contains only a cooked collision cache:

```text
build/scan_cache/source-preview-aee5242a20848294_w1e1m0f0.b3mesh
73,156,192 bytes
SHA-256 7a862e5928414bf0ed75d63b2f3b1c1ce2da0285dd12bab515d6c0532173431c
```

Do not treat `.b3mesh` as Web render data.

Historical triangle counts disagree (`1,770,391` native document vs `1,775,775` exact Web gate); remeasure the actual pack when recovered.

Important public boundary:

```text
LOCAL_FULL dev scan working
!=
GitHub Pages scan delivery solved
```

The current scan plugin reads local filesystem assets only during Vite dev serve. A future public friend-demo containing scan requires an explicit packaged/hosted asset solution after the actual pack is recovered and measured.

## 7. Current vehicle visual state

Live path remains procedural:

```text
M6DebugRenderer
→ M6ProductRenderer
→ M6WorldRenderer
→ box chassis + cylinder wheels + diagnostics
```

Already present:

```text
M6TraceFrame.visualFrame                     PRESENT
semantic vehicle visual frame               PRESENT
M6_FULL_RIG_V1 proof bindings                PRESENT
GLB hash/policy/CPU decode                   PRESENT
GPU geometry upload                          PRESENT
binding→world transforms                     PRESENT
deterministic tiny full-rig fixture          PRESENT
live authored GLB draw integration           MISSING
production pixel texture/material runtime    MISSING
```

The current cold-takeover first-slice hypothesis is **REAL CAR V1**:

```text
exact real chassis
+ four exact real wheels
+ minimum authored pixel material/texture support
+ live authored-GLB draw bridge
+ current physics/world/camera unchanged
```

This is a scheduling hypothesis, not an architectural contract. It currently wins because its exact resources and salvage tooling are available, its missing runtime seam is bounded, and the result is immediately owner-visible.

The tiny full-rig fixture is a diagnostic fallback only. Do not make it an obligatory product milestone when the exact owner source can be integrated directly and failures remain attributable.

## 8. Recovered owner assets

Chassis:

```text
Jozzpoly/Box3d_FunProject
assets/source/Nadwozie.gltf
SHA-256 45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8
Git blob a25cb0ef61d342ce476c9ef26a3b24188bace047
```

Historical start point:

```text
model 3.28m × 2.73m × 1.23m
wheelbase 2.50m
track 2.10m
yaw -90°
chassis-local (0, -0.60, 0)
```

Wheel:

```text
assets/source/Offroad_Big_Wheels.gltf
SHA-256 1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617
Git blob c13c77a8e5552175ee8266b2da33a54691f1dae9
```

Contains embedded PNG plus semantic mount/spin/radius/width markers.

The handoff resource pack physically includes these exact source assets and audits.

Frozen owner-tooling candidate:

```text
candidate/jv-web-owner-vehicle-visual-r1@796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Selective salvage only; never wholesale merge. It already demonstrates deterministic owner-source packaging/calibration ideas and the authored material subset including base-color texture, MASK cutoff, double-sided materials and pixel sampler/wrap policy.

## 9. Camera/mobile view state

The current camera is embedded in `M6WorldRenderer` and already owns yaw/pitch/distance plus pointer orbit/zoom. Touch driving already owns pointer interactions through the existing input adapter.

Camera remains a high-value owner-visible lane, but the current recommendation is to evaluate it **after** REAL CAR V1 as a separate slice. This keeps visual placement/material feedback separate from chase-camera feel and gesture ownership feedback.

Future camera work should evolve the existing renderer/input path rather than create an unrelated parallel camera.

## 10. Current physics/runtime / drivetrain

```text
runtimeBackend.id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Current Web Box3D:

```text
box3d.js@0.0.2
binding 2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine  8441b4a06d6d09dcfb0b0f704df4d847d1437b92
inline-single-threaded
```

Current drive:

```text
allWheelDrive=false → RWD
allWheelDrive=true  → AWD
```

FWD is not implemented. Exact requested shaft-lock semantics remain unresolved and must not be guessed.

Current Web binding has no native `b3Wheel` API.

The handoff resource pack contains exact recovered native source surfaces for:

```text
B3X-WHEEL-001      collider/contact integration
B3X-WHEEL-SOFT-002 wheel-only normal softness
```

Before an actual port, compare this frozen source with the then-current read-only native state to ensure the intended newest accepted wheel variant is selected.

## 11. Current work model — opportunity lanes, not phases

The project no longer uses a rigid `A→B→C→D→E→F` roadmap.

Current opportunity lanes:

### CAR VISUAL

Current first-slice hypothesis: REAL CAR V1 using exact owner assets, minimum required authored pixel materials and the existing camera/physics/world. Tiny fixture only as diagnostic fallback.

### CAMERA / MOBILE VIEW

Probable next owner-feel slice after the real-car visual checkpoint. Evolve current `M6WorldRenderer` camera and preserve touch-driving pointer ownership.

### WORLD / SCAN / TELEPORT

Current code distance is small, but decisive revalidation is blocked until the exact full textured pack is available. Once recovered, run current LOCAL_FULL first, then improve in-app location switching and measure a real phone. Optimize only observed bottlenecks.

### VEHICLE CONFIG / PRESETS / DRIVETRAIN

Define Web vehicle config semantics before polished UI. Add bounded friend-demo semantics such as presets/FWD/RWD/AWD without misrepresenting the reference fixture as native parity. Later implement the lock mechanism only after its mechanics are precisely defined.

### TRUE WHEEL

Treat as a short secondary feasibility spike unless evidence shows it must block visible work. Answer exact native source delta, Emscripten/build, JS/TS export and focused-test questions. Port existing mechanism; no new tire R&D.

### UI / QoL / PUBLIC DEMO

Build final Web/mobile interface around real capabilities, then publish meaningful owner-visible checkpoints rather than every technical slice.

Scheduling rule: one main owner-visible slice at a time; at most one short risk spike in parallel.

## 12. Validation/workflow

Private R1 uses focused validation by default. Jozz should only need to intervene when real visual/feel/device observation matters. Full artifact/reproducibility/live Pages discipline is reserved for actual public release candidates.

No force push. No custom GitHub Actions by default. Distinguish product failure from harness/operator failure. Do not rerun historical gates simply to prove old evidence again.

## 13. Current open questions

- current accessible location of full textured JSPREV2 pack;
- actual pack size/count after recovery and phone performance;
- public scan packaging/hosting strategy;
- native-vs-Web historical triangle discrepancy;
- relation of old P1B bundle to later JSPREV2 preview;
- exact shaft-lock semantics;
- exact Web/Emscripten/binding cost of selected `b3Wheel`;
- exact then-current native wheel revision to target at port time;
- final camera behavior after playtesting;
- final UI hierarchy;
- whether real authored-asset integration reveals a reason to revise any current visual contract.

## 14. Handoff status

Current handoff is **DRAFT V4 takeover layer under review**, not final.

A fresh agent should be able to begin with `AGENTS.md` + `JV_WEB_TAKEOVER_BRIEF_2026-08-08.md`, challenge the current first-slice hypothesis from current source/resources, and load this detailed state only when it needs deeper evidence.