# JV Web — current project state

Updated: 2026-08-07
Status: `C2 SOURCE-PRESENT / EXACT WINDOWS + MAP_ONLY_R0 ISOLATION REVALIDATION REQUIRED`
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

last validated architectural predecessor:
  c1b7894476dc4da26eec45033b92042919aff1ae
  tree 22d0734d78d6dacd3d81d46b980423ed9480f3e8

current C2 tip:
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

C1 `c1b7894476dc4da26eec45033b92042919aff1ae` / `22d0734d78d6dacd3d81d46b980423ed9480f3e8` passed its own exact two-worktree Windows source/artifact gate: 288/288 tests in each run, 18 documentation links, unchanged lockfile and byte-identical 14-file LOCAL_FULL artifacts. Source/artifact evidence SHA-256: `0eea31c7ebfbe34c3495049c67afafb65595c3ce77b449982d252b4a67e65a56`. Bounded Edge evidence on the same tip reached a Running/LIVE WebGL map world with four contacts and expected LOCAL_FULL controls; v3 then blocked only at synthetic keyboard injection (`c2348b69a855b1867812ede6b39f3a1d2ed6d00a9c91f585b4a82a255a709c81`). This is sufficient to progress the world-provider refactor into C2, but does not claim R0-E physical keyboard, phone, owner or final exact-artifact browser acceptance. The historical repository file [`repair/R0B_WINDOWS_EVIDENCE_2026-08-07.md`](repair/R0B_WINDOWS_EVIDENCE_2026-08-07.md) remains an earlier-campaign index.

## 3. What is not proven

```text
C1 exact-tip Windows source/artifact gate:      PASS
C1 bounded Edge map smoke:                      RUNTIME OBSERVED / SYNTHETIC KEYBOARD HARNESS BLOCKED
MAP_ONLY_R0 import/request isolation:           SOURCE-PRESENT / EXACT C2 GATE REQUIRED
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
C1 scan-free world service + LOCAL_FULL provider     COMPLETE FOR C2 PROGRESSION
C2 dedicated MAP_ONLY_R0 entry                       SOURCE-PRESENT / REVALIDATION REQUIRED
R0-D hardened portable public artifact               NOT STARTED
R0-E desktop and real-phone validation               NOT STARTED
R0-F owner Pages decision and publication            NOT AUTHORIZED
R0-G default-branch normalization                    NOT AUTHORIZED
R1 real owner chassis and four wheels                FROZEN UNTIL R0
```

R0 may not change physics, controls, camera, map, terrain, JSPREV2 parsing/collision or owner-vehicle rendering.

## 5. C1 closure and C2 boundary

C0-CHAR is closed at `746dda0b09aeb0906412ef8a2d110a6f3fa83561` / `db9eadf45f75784314d62ae8caf1db528e1de622` by the exact Windows evidence above. It freezes the singleton/lifecycle behavior needed for the dependency split.

C1 changes only the capability boundary:

- `src/scene/product-world.ts` becomes scan-free and owns the configured loader, singleton promise, current world and subscribers;
- `src/scene/local-full-product-world.ts` owns the static JSPREV2 dependency and builds the LOCAL_FULL world;
- `src/product-main.ts` configures LOCAL_FULL before importing `main.ts`;
- `F4VehicleHost` and `M6ProductRenderer` continue to use `product-world` and remain scan-loader-free;
- profile replacement fails closed; repeated configuration with the exact same loader is idempotent;
- physics, controls, camera, E2R, JSPREV2 parsing/render/collision, assets, package-lock and build configuration remain unchanged.

C1 is closed for architectural progression by its exact Windows source/artifact PASS plus bounded Edge Running/LIVE smoke. The synthetic-keyboard automation failure is retained as a harness limitation and is not promoted to R0-E evidence. C2 must now prove the dedicated public entry is structurally scan-free and preserves the accepted map runtime.

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

Run one exact Windows C2 gate on the current tip with Node 24.16.0, npm 11.13.0, TypeScript 7.0.2 and Vite 8.1.5. It must require clean source before/after, unchanged lockfile, the new MAP_ONLY_R0 characterization tests, a static import-closure proof with no local scan provider/request boundary, and a bounded map-only Edge smoke. If that passes, proceed directly to the public build-profile/manifest slice; do not add another C1 retry.
