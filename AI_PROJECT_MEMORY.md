# AI project memory — JV Web

Updated: 2026-08-08
Status: `R0 PUBLISHED / R1 ACTIVE / HANDOFF DRAFT V4 TAKEOVER LAYER UNDER REVIEW`
Owner: Jozz

This is a short navigation memory, not the mandatory cold-start document. Current Git/evidence always wins. Fresh agents should read `AGENTS.md` and `docs/handoff/JV_WEB_TAKEOVER_BRIEF_2026-08-08.md` first, then use this file only when broader state is useful.

## Scope

```text
ACTIVE CORE
Jozzpoly/JV-Box3D-Web-experiment
development/jv-web-r1

PUBLIC FRIEND-DEMO
Jozzpoly/JV-Box3D-Web-Public
release/r0
https://jozzpoly.github.io/JV-Box3D-Web-Public/

NATIVE JV
Jozzpoly/Box3d_FunProject
READ-ONLY for this campaign; maintained by another agent
```

## Owner goal

Finish a motivating browser friend-demo that increasingly feels like Jozz's own game. Social-media polish is later and must not slow the current campaign.

Desired capabilities, adaptively ordered by actual play/feel:

- real Jozz chassis + wheels;
- much better racing-game chase camera;
- desktop orbit/zoom + phone pinch zoom;
- usable JSPREV2 scan + phone assessment;
- fast in-app location/teleport switching;
- vehicle presets/settings;
- FWD/RWD/AWD;
- mechanically defined drivetrain/shaft lock;
- useful QoL;
- rebuilt Web/mobile UI;
- selected newer native `b3Wheel` port if feasible.

Do not execute a fixed roadmap mechanically.

## Closed R0

```text
private source:
5ba6cc406b8c1541e29cd1ae59ffed78a7509284

public release/r0:
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree f1c5c9a971208d89da05143f10913891a58b3b70
rollback/main 401068f5734c841d43907b71484bc03a2396c604
```

R0 is published and owner-accepted on desktop + real phone. Keep frozen as regression/rollback baseline.

## Current first-slice hypothesis

The current cold-takeover recommendation is **REAL CAR V1**, not combined `CAR + CAMERA`:

```text
exact Nadwozie.gltf
+ four exact Offroad_Big_Wheels.gltf channels
+ minimum real pixel texture/MASK runtime
+ live authored-GLB draw bridge
+ current physics/world/camera unchanged
```

Why: exact assets/calibration/tooling are available, current visual gap is bounded and immediately owner-visible, while scan is resource-blocked and b3Wheel is a deeper engine/binding risk.

This is a hypothesis to revalidate against current Git, not a permanent milestone contract.

The tiny full-rig fixture is a diagnostic fallback only if a direct real-asset failure cannot be localized between package/import and live draw code.

## Current visual facts

- live vehicle is still procedural (`M6WorldRenderer` box chassis + cylinder wheels);
- `M6TraceFrame.visualFrame`, GLB decode/policy, GPU geometry ownership and binding transforms already exist;
- missing core = live authored-GLB draw bridge + production pixel material/texture support;
- current camera is embedded in `src/render/m6-world-renderer.ts` and already owns yaw/pitch/distance + pointer orbit/zoom;
- camera should currently follow the first real-car visual checkpoint as a separate owner-feel slice so visual and camera feedback remain attributable.

Exact owner assets:

```text
Nadwozie.gltf
SHA-256 45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8
historical start: yaw -90°, chassis-local (0,-0.60,0)

Offroad_Big_Wheels.gltf
SHA-256 1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617
contains mount/spin/radius/width markers
```

Frozen owner tooling candidate:

```text
candidate/jv-web-owner-vehicle-visual-r1
796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Selective salvage only.

## Current scan truth

Strongest historical desktop proof:

```text
product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580
exact Windows gate PASS
owner observed corrected rendering/filter/grid + working collision
```

Important current-R1 continuity:

- root `index.html` still launches `product-main.ts`;
- `product-main.ts` still configures `loadLocalFullProductWorld`;
- `local-full-product-world.ts` still loads JSPREV2;
- `vite.config.ts` still installs the dev-only JSPREV2 plugin;
- key scan/view-policy blobs survived c8e0 byte-for-byte;
- location choices still use links/query params, causing page/world rebuild rather than fast in-app teleport.

Therefore scan work is **not broad old-branch recovery**. First locate the exact pack and revalidate current LOCAL_FULL behavior.

Historical full pack:

```text
source-preview-aee5242a20848294
```

Its current accessible location is not established in the handoff environment. The supplied native ZIP contains only a cooked `.b3mesh` cache, not the textured Web pack.

Public-scan boundary:

```text
local dev scan working != GitHub Pages scan delivery solved
```

The current Vite scan plugin is `serve`-only and reads local files through `JOZZ_SCAN_PREVIEW_PACK`. Future public scan inclusion needs an explicit artifact/hosting design after the real pack is recovered/measured.

## Current mechanics/runtime facts

```text
backend legacy_ts_m6
role REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority false
nativeParity NOT_PROVEN
```

Current drive:

```text
allWheelDrive=false → RWD
allWheelDrive=true  → AWD
```

FWD is not implemented. Exact requested shaft-lock semantics remain unresolved.

Current Web Box3D is pinned `box3d.js@0.0.2` and exposes no native `b3Wheel` API. The handoff resource pack contains exact recovered source surfaces for `B3X-WHEEL-001` + `B3X-WHEEL-SOFT-002`; compare with the then-current read-only native state before a real port.

Treat b3Wheel as a bounded secondary feasibility spike unless evidence shows it must block the main owner-visible work.

## Validation/process

Private R1 work uses focused validation by default. Jozz should be involved only when real visual/feel/device observation matters. Full reproducibility/promotion ceremony belongs to public release candidates, not every private commit.

Never force-push. Do not use custom GitHub Actions by default. Do not confuse harness/operator failure with product failure. Do not wholesale-merge old candidate branches.

## Current opportunity lanes — not phases

```text
CAR VISUAL
CAMERA / MOBILE VIEW
WORLD / SCAN / TELEPORT
VEHICLE CONFIG / PRESETS / DRIVETRAIN
TRUE WHEEL feasibility/port
UI / QoL / friend-demo publication
```

Choose one main owner-visible slice at a time; at most one short risk spike in parallel when it prevents future waste.

## Read next

Cold start:

1. `AGENTS.md`
2. `docs/handoff/JV_WEB_TAKEOVER_BRIEF_2026-08-08.md`
3. attached resource pack `00_START_HERE.md`, `02_RESOURCE_MAP.md`, `09_COLD_AGENT_TAKEOVER_CHECKLIST.md` if available
4. exact source for the first revalidated question

Deeper reference only when needed:

- `docs/PROJECT_STATE.md`
- `docs/handoff/JV_WEB_HANDOFF_2026-08-08.md`
- `docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md`