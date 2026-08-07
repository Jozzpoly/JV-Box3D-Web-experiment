# JV Web — current project state

Updated: 2026-08-07
Status: `CONTROLLED REPAIR R0-B PIN CANDIDATE / WINDOWS BASELINE ACCEPTED / NO PRODUCT BEHAVIOR CHANGE`
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

The recorded owner verdict for the product line states:

```text
scan displays correctly
pixel smoothing is disabled and can be enabled
grid is disabled and can be enabled
vehicle collision works correctly
```

This is `OWNER OBSERVED`. It does not prove a current clean build, public artifact or Pages deployment.

### Exact Windows R0-B baseline

The exact `f1c0ffe5ebc6b22cd6e3f435bab8529ca50fb67f` source tree passed two independent clean Windows 11 x64 gates with:

```text
Node:       24.16.0
npm:        11.13.0
TypeScript: 7.0.2
Vite:       8.1.5
tests:      281/281 PASS in each run
artifacts:  14 files / byte-identical
evidence:   independent 119/119 audit PASS
```

This is accepted baseline evidence for `f1c0ffe...` only. The current toolchain-pinning commit changes package metadata and therefore requires the same two-run Windows gate before it inherits PASS. Linux is outside the R0 release guarantee and is not a release gate. See [`repair/R0B_WINDOWS_EVIDENCE_2026-08-07.md`](repair/R0B_WINDOWS_EVIDENCE_2026-08-07.md).

## 3. What is not proven

```text
post-pin current-tip Windows gate:            NOT YET RUN
MAP_ONLY_R0 import/request isolation:         NOT PROVEN
byte-reproducible public artifact:            NOT PROVEN
public target-path behavior:                  NOT PROVEN
public zero-scan-request runtime:             NOT PROVEN
desktop exact-artifact browser receipt:       NOT PROVEN
real-phone exact-artifact receipt:            NOT PROVEN
GitHub Pages publication:                     NOT PERFORMED
native JV parity:                             NOT PROVEN
```

## 4. Current controlled campaign

R0 exists to create a truthful and reproducible map-only release lane without changing the product behavior.

```text
R0-A1 initial authority checkpoint                   COMPLETE at 63bbff...
R0-A2 remote/local Gate 0 correction                 COMPLETE AT fb16cb5...
R0-A3 default-main landing guard                     COMPLETE at main@b48c506...
R0-B0 single/two-run toolchain operators             COMPLETE / EXACT WINDOWS BASELINE USED
R0-B1 Windows baseline at f1c0ffe                    ACCEPTED / 119-CHECK AUDIT
R0-B2 exact toolchain pin                            SOURCE-PRESENT / WINDOWS REVALIDATION REQUIRED
R0-C0 map-only architecture                          DEFINED / RUNTIME NOT STARTED
R0-C shared local/public product configuration       NOT STARTED
R0-D hardened portable public artifact               NOT STARTED
R0-E desktop and real-phone validation               NOT STARTED
R0-F owner Pages decision and publication            NOT AUTHORIZED
R0-G default-branch normalization                    NOT AUTHORIZED
R1 real owner chassis and four wheels                FROZEN UNTIL R0
```

R0 may not change physics, controls, camera, map, terrain, JSPREV2 parsing/collision or owner-vehicle rendering.

## 5. Product-reachability boundary

A reproducible static import scan of the exact product tree used `src/product-main.ts` as the entrypoint and resolved relative TypeScript imports, exports and dynamic imports (`.js` references mapped to `.ts`). Result:

```text
TypeScript files:                  72
reachable from product-main.ts:    51
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

## 6. Candidate and history classification

- `00e1c8...`: do not use as a release base. Its release work is stacked on three unaccepted owner-vehicle commits and has no complete release proof.
- `candidate/jv-web-owner-vehicle-visual-r1@796b050...`: frozen/broken/salvage-only. It generates texture/material features that the product runtime does not decode, upload or render end-to-end.
- refoundation, render-host, tiny-unlit and lit-normal lines: historical evidence and selective salvage only.
- no historical branch may be merged wholesale into R0.

See [`BRANCH_ROLES.md`](BRANCH_ROLES.md).

## 7. R0-A closure

The authority checkpoint is complete because:

- `AGENTS.md`, `README.md`, `AI_PROJECT_MEMORY.md`, this file and `BRANCH_ROLES.md` agree on exact `c8e0bf...`;
- no active-state text points to PR #18 or another historical PR;
- the scan is described as active in the full local product, not future source-only work;
- source, automated, browser and owner evidence are separated;
- all Markdown links pass;
- the commit changes no runtime, test, package, build or asset file.

## 8. Next allowed step

Re-run the exact two-worktree Windows gate on the toolchain-pinning commit. Require Node 24.16.0, npm 11.13.0, TypeScript 7.0.2, Vite 8.1.5, clean source before/after, unchanged lockfile and byte-identical artifacts. Do not begin runtime refactoring until that exact commit passes.

After the post-pin PASS, begin only slice C0 from [`repair/R0C_MAP_ONLY_ARCHITECTURE.md`](repair/R0C_MAP_ONLY_ARCHITECTURE.md): characterization tests that freeze current local-full behavior. A public mode must be structural; the current map path still reaches `product-world.ts`, which statically imports and invokes the local JSPREV2 loader. Hiding a control or tolerating a scan 404 is not an acceptable release boundary.
