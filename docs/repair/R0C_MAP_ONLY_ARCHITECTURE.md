# R0-C structural MAP_ONLY_R0 architecture

Status: `VALIDATED IMPLEMENTATION CONTRACT / RUNTIME NOT YET CHANGED`

Goal: produce a truthful static JV Web artifact for the GitHub Pages project path `/JV-Box3D-Web-Public/` while preserving the accepted local full product and excluding the private JSPREV2 capability from the public import graph, runtime requests and payload.

## Why a UI-only change is rejected

The current map selection is not structurally map-only:

- `src/app/f4-vehicle-host.ts` loads `loadProductWorld()` by default;
- `src/render/m6-product-renderer.ts` subscribes to the same product-world singleton;
- `src/scene/product-world.ts` statically imports `jsprev2-scan.ts`;
- `loadProductWorld()` calls `loadLocalJsprev2Scan()` even when the selected spawn is the E2R map;
- the local scan loader requests `/__jv_scan__/index.json`.

Therefore hiding the scan button, forcing `jvSpawn=map`, tolerating a 404, intercepting `fetch`, or deleting scan bytes after bundling does not satisfy R0-C.

## Required profiles

```text
LOCAL_FULL
  entry: local product entry
  world: E2R + optional local JSPREV2
  scan capability: present
  scan controls: present
  texture-filter control: present when meaningful
  Vite scan middleware: serve-only, opt-in local pack

MAP_ONLY_R0
  entry: dedicated public entry
  world: E2R only
  scan capability: absent
  scan controls: absent
  texture-filter control: absent unless a visible map texture effect is proven
  Vite scan middleware: absent
  target base path: /JV-Box3D-Web-Public/
```

Both profiles must keep the same accepted M6 physics, input timelines, camera, restart lifecycle, E2R geometry and grid default.

## Module boundary

The implementation must split capability from state:

1. `product-world.ts` becomes scan-free. It owns `createProductWorld`, the configured world loader, one shared load promise and world subscribers.
2. A local-only module owns the static dependency on `jsprev2-scan.ts` and provides the `LOCAL_FULL` loader.
3. A dedicated public entry configures an E2R-only loader before importing the existing application host.
4. The renderer and `F4VehicleHost` consume the configured world service; neither may import a scan loader.
5. Local and public controls are capability-driven. The public UI must not offer an impossible scan target or an inert scan-texture control.

The public entry's static TypeScript import closure must exclude at least:

```text
src/scene/jsprev2-scan.ts
local-only world provider
local full product entry
```

## Build boundary

`MAP_ONLY_R0` requires an explicit build profile, not environment-dependent deletion:

- a deterministic Vite mode or dedicated config selects the public entry;
- the local JSPREV2 dev plugin is not installed for that profile;
- the profile uses a positive static-asset allowlist or a dedicated public directory;
- the tiny vehicle proof fixture is not generated or copied;
- source maps remain disabled;
- output is built for the project path `/JV-Box3D-Web-Public/` and also validated from a nested local path;
- the artifact is never rebuilt in the public repository.

Relative asset URLs may be used when they are proven under the target project path. The release manifest must record the target path explicitly so path portability is evidence, not assumption.

## Characterization before refactor

The first R0-C code commit must add tests that freeze current accepted behavior before moving dependencies:

- E2R world geometry, spawn and deterministic seeds remain unchanged;
- local full mode requests the scan index at most once and shares one world promise;
- a missing local scan preserves map availability;
- scan spawn still fails closed when the exact pack is absent;
- renderer and physics receive the same published world instance;
- restart does not switch profile or duplicate world loading;
- grid defaults to disabled and remains toggleable;
- local texture filtering keeps nearest as the default;
- map-only profile exposes only valid controls.

These tests are not permission to change physics, controls, camera, terrain, scan parsing/collision or vehicle rendering.

## Public artifact contract

The `MAP_ONLY_R0` manifest must bind:

- exact source commit and tree;
- exact Windows toolchain;
- package-lock SHA-256 and normalized dependency evidence;
- profile `MAP_ONLY_R0`;
- target path `/JV-Box3D-Web-Public/`;
- sorted file table with bytes and SHA-256;
- required runtime assets and third-party notices;
- publication state that cannot self-approve.

Branch name must not affect artifact bytes or release identity. Absolute local paths, private scan identities, user information and unreviewed environment fields are prohibited.

## Network and browser gates

Static validation must inspect HTML, CSS and built JavaScript. It must reject the private scan boundary and unexplained remote runtime dependencies. Static text inspection is not a substitute for runtime capture.

Build Web Apps validation will use Browser/IAB when available and Playwright otherwise. The required flow is:

```text
project-path URL loads
-> first meaningful WebGL screen renders
-> no framework/error overlay
-> console has no unexplained errors
-> no /__jv_scan__/ request
-> keyboard controls change vehicle state
-> touch controls change vehicle state at mobile viewport
-> grid toggle changes rendered state
-> destroy/rebuild returns to a running world
```

Desktop Edge/Chromium and one mobile-sized viewport are required before owner testing. Final R0-E additionally requires a real-phone receipt tied to the exact artifact hash.

## Implementation slices

```text
C0 characterization tests only
C1 scan-free world service + local-only provider
C2 dedicated MAP_ONLY_R0 entry and capability-driven controls
D0 dedicated public build profile and positive asset allowlist
D1 release manifest plus HTML/CSS/JS static policy
E0 exact-artifact desktop browser and request capture
E1 exact-artifact real-phone validation
F0 byte-for-byte promotion to public release/r0
F1 owner-authorized GitHub Pages activation
```

Each slice must be a linear commit with a bounded diff. Stop on behavior drift, scan reachability, source/lock mutation, non-reproducible output, unexplained network traffic, browser errors or evidence identity mismatch.

## Explicit non-goals for R0

- no redesign or marketing wrapper;
- no physics, steering, drive, camera or terrain tuning;
- no owner chassis/four-wheel visual integration;
- no private scan publication;
- no GitHub Actions build workflow;
- no default-branch normalization;
- no performance rewrite unless browser/phone evidence proves it necessary.
