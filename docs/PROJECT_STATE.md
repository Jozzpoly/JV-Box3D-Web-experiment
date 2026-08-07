# JV Web — current project state

Updated: 2026-08-07
Status: `C1 SOURCE-PRESENT / WINDOWS REVALIDATION + LOCAL_FULL BROWSER REGRESSION REQUIRED`
Owner: Jozz

## 1. Exact identity

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
visibility: private
default branch: main
main navigation guard: b48c50699a7c257b6d9cc00995ee8b20600ef8fe

preserved product branch:
  product/jv-web-car-map-scan

preserved product commit:
  c8e0bf24748b0a790a1c0039b1be801eef266580

preserved product tree:
  3e241761784edd2a2fb6ab18095c25ea0e737185

controlled repair branch:
  repair/jv-web-release-r0

repair base:
  exact preserved product commit above

last validated predecessor:
  746dda0b09aeb0906412ef8a2d110a6f3fa83561
  tree db9eadf45f75784314d62ae8caf1db528e1de622

current C1 tip:
  this commit; exact SHA/tree must be read from GitHub
  SOURCE-PRESENT / REVALIDATION REQUIRED
```

The default `main` branch contains only a minimal historical project root plus a navigation guard. It is not the product implementation. Default-branch normalization is deferred until a release-capable line passes exact build, browser and owner gates.

## 2. Current product truth

### Source-confirmed

The exact preserved product tree contains:

- real Box3D/WASM M6 reference physics and contacts;
- physical rack steering plus drive, reverse, coast and braking;
- deterministic keyboard and mobile Pointer Events input;
- WebGL observer, orbit/zoom camera and destroy/rebuild lifecycle;
- E2R/offroad terrain with stones and bumpers;
- optional local JSPREV2 visual data and triangle collision;
- map/scan spawn selection in the local product;
- nearest/linear texture-filter controls;
- grid disabled by default and toggleable;
- relative Vite base and portable-build infrastructure.

### Owner-observed

The recorded owner verdict for the product line states that:

```text
scan displays correctly
pixel smoothing is disabled and can be enabled
grid is disabled and can be enabled
vehicle collision works correctly
```

This is `OWNER OBSERVED`. It does not prove a current clean build, public artifact or Pages deployment.

### Exact Windows C0-CHAR predecessor

The exact `746dda0b09aeb0906412ef8a2d110a6f3fa83561` / `db9eadf45f75784314d62ae8caf1db528e1de622` C0-CHAR predecessor passed two independent clean Windows 11 x64 gates with:

```text
Node:       24.16.0
npm:        11.13.0
TypeScript: 7.0.2
Vite:       8.1.5
tests:      287/287 PASS in each run
doc links:  18
artifacts:  14 files / byte-identical
cleanup:    both disposable worktrees removed
```

External evidence ZIP SHA-256:

```text
f1e6b385cca9e80517c57e8c5680fd5f794a0f6a1d1337bc61b304d356520a80
```

Classification: `SOURCE-GATE PASS + same-OS ARTIFACT-GATE PASS` for exact C0-CHAR and its LOCAL_FULL portable baseline only. Browser/runtime, MAP_ONLY_R0, owner acceptance and publication remain unproven. Linux is outside the R0 release guarantee and is not a release gate.

The current C1 tip changes only the world-service dependency boundary plus tests/status documentation. It does not inherit C0 PASS and requires its own exact two-worktree Windows gate plus LOCAL_FULL browser regression before C2. The historical repository file [`repair/R0B_WINDOWS_EVIDENCE_2026-08-07.md`](repair/R0B_WINDOWS_EVIDENCE_2026-08-07.md) remains an index for the earlier R0-B campaign.

## 3. What is not proven

```text
current C1 exact-tip Windows gate:              NOT YET RUN
LOCAL_FULL exact-tip browser regression:          NOT YET RUN
MAP_ONLY_R0 import/request isolation:           NOT PROVEN
byte-reproducible public artifact:              NOT PROVEN
public target-path behavior:                    NOT PROVEN
public zero-scan-request runtime:               NOT PROVEN
desktop exact-artifact browser receipt:         NOT PROVEN
real-phone exact-artifact receipt:              NOT PROVEN
GitHub Pages publication:                       NOT PERFORMED
native JV parity:                               NOT PROVEN
```

## 4. Current controlled campaign

R0 exists to create a truthful and reproducible map-only release lane without changing the product behavior.

```text
R0-A1 initial authority checkpoint                   COMPLETE at 63bbff...
R0-A2 remote/local Gate 0 correction                 COMPLETE AT fb16cb5...
R0-A3 default-main landing guard                     COMPLETE at main@b48c506...
R0-B0 single/two-run toolchain operators             COMPLETE / EXACT WINDOWS BASELINE USED
R0-B1 historical Windows baseline at f1c0ffe         ACCEPTED / HISTORICAL REPOSITORY RECEIPT
R0-B2 canonical toolchain pin + exact revalidation   COMPLETE PASS at e33b226... only
R0-C0-ARCH map-only architecture                     DEFINED / RUNTIME NOT CHANGED
C0-CHAR current lifecycle characterization           COMPLETE PASS at 746dda0...
C1 scan-free world service + LOCAL_FULL provider     SOURCE-PRESENT / REVALIDATION REQUIRED
C2 dedicated MAP_ONLY_R0 entry                       NOT STARTED
R0-D hardened portable public artifact               NOT STARTED
R0-E desktop and real-phone validation               NOT STARTED
R0-F owner Pages decision and publication            NOT AUTHORIZED
R0-G default-branch normalization                    NOT AUTHORIZED
R1 real owner chassis and four wheels                FROZEN UNTIL R0
```

R0 may not change physics, controls, camera, map, terrain, JSPREV2 parsing/collision or owner-vehicle rendering.

## 5. C0-CHAR closure and C1 boundary

C0-CHAR is closed at `746dda0b09aeb0906412ef8a2d110a6f3fa83561` / `db9eadf45f75784314d62ae8caf1db528e1de622` by the exact Windows evidence above. It freezes the singleton/lifecycle behavior needed for the dependency split.

C1 changes only the capability boundary:

- `src/scene/product-world.ts` becomes scan-free and owns the configured loader, singleton promise, current world and subscribers;
- `src/scene/local-full-product-world.ts` owns the static JSPREV2 dependency and builds the LOCAL_FULL world;
- `src/product-main.ts` configures LOCAL_FULL before importing `main.ts`;
- `F4VehicleHost` and `M6ProductRenderer` continue to use `product-world` and remain scan-loader-free;
- profile replacement fails closed; repeated configuration with the exact same loader is idempotent;
- physics, controls, camera, E2R, JSPREV2 parsing/render/collision, assets, package-lock and build configuration remain unchanged.

C1 is not complete merely because the source exists. Its exact commit/tree requires the same two-worktree Windows source/artifact gate and a LOCAL_FULL browser regression before C2.

## 6. Product-reachability boundary

A reproducible static import scan of the exact product tree used `src/product-main.ts` as the entrypoint and resolved relative TypeScript imports, exports and dynamic imports (`.js` references mapped to `.ts`). Result:

```text
TypeScript files:                  73
reachable from product-main.ts:    52
not reachable from product-main.ts:21
unresolved relative code imports:  0
non-code import:                   src/main.ts -> ./style.css
```

Files classified as `SOURCE-PRESENT / NOT PRODUCT-REACHABLE`:

```text
src/app/f2-contact-host.ts
src/app/f3-validated-host.ts
src/assets/asset-contract.ts
src/render/rigid-mesh-gpu-asset.ts
src/render/vehicle-visual-render-resource.ts
src/scene/static-scene-visual-package.ts
src/visual/glb-container.ts
src/visual/glb-material-policy-v1.ts
src/visual/glb-rigid-array-buffer-contract.ts
src/visual/glb-rigid-mesh-decoder.ts
src/visual/glb-runtime-policy-v1.ts
src/visual/rigid-cpu-asset-seal.ts
src/visual/rigid-mesh-draw-plan.ts
src/visual/vehicle-visual-asset-gate.ts
src/visual/vehicle-visual-binding-policy.ts
src/visual/vehicle-visual-budget.ts
src/visual/vehicle-visual-cpu-gate.ts
src/visual/vehicle-visual-package.ts
src/visual/vehicle-visual-runtime-loader.ts
src/visual/vehicle-visual-transform.ts
src/visual/vehicle-visual-url.ts
```

This classification does not mean the files are worthless or defective. It means their source/tests cannot be presented as proof of current product runtime behavior.

## 7. Candidate and history classification

- `00e1c8...`: do not use as a release base. Its release work is stacked on three unaccepted owner-vehicle commits and has no complete release proof.
- `candidate/jv-web-owner-vehicle-visual-r1@796b050...`: frozen/broken/salvage-only. It generates texture/material features that the product runtime does not decode, upload or render end-to-end.
- refoundation, render-host, tiny-unlit and lit-normal lines: historical evidence and selective salvage only.
- no historical branch may be merged wholesale into R0.

See [`BRANCH_ROLES.md`](BRANCH_ROLES.md).

## 8. Next allowed step

Run the exact two-worktree Windows gate on the current C1 tip with Node 24.16.0, npm 11.13.0, TypeScript 7.0.2 and Vite 8.1.5. Require clean source before/after, unchanged lockfile and byte-identical artifacts. Then perform a bounded LOCAL_FULL browser regression proving that map/scan startup, controls, renderer/world publication and restart still behave as before.

Do not begin C2 until both C1 exit gates close. C2 may then add only the dedicated MAP_ONLY_R0 entry and capability-driven controls from [`repair/R0C_MAP_ONLY_ARCHITECTURE.md`](repair/R0C_MAP_ONLY_ARCHITECTURE.md).
