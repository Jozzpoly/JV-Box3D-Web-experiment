# AI project memory — JV Web

Updated: 2026-08-07
Status: `NAVIGATION ONLY — VERIFY EVERY CLAIM`
Owner: Jozz

This file is a compact map for a fresh agent. It is not a test receipt and must never override Git, source code, raw logs or owner validation tied to an exact build.

## Gate 0

Read `AGENTS.md`. Use Gate 0-R for connector-only repository work and Gate 0-L before every local edit, build, test or artifact claim.

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
preserved product branch: product/jv-web-car-map-scan
preserved product commit: c8e0bf24748b0a790a1c0039b1be801eef266580
preserved product tree:   3e241761784edd2a2fb6ab18095c25ea0e737185
controlled repair branch: repair/jv-web-release-r0
repair base:              exact c8e0bf...
repair tip:               verify current GitHub ref before every operation
last validated architectural predecessor: c1b7894476dc4da26eec45033b92042919aff1ae
predecessor tree:           db9eadf45f75784314d62ae8caf1db528e1de622
```

`main` is a minimal historical default branch with a navigation-only guard. Fetch its current tip; do not begin product work from it.

## Current owner need

The shortest current product direction is:

```text
stable playable browser link
+ current M6 behavior
+ E2R/offroad map
+ desktop and mobile controls
+ later: real chassis and four real wheels
```

The private local JSPREV2 scan remains part of the full local product. The first public R0 is map-only until scan rights, size and hosting are decided separately.

## Strongest preserved behavior

Source is present for the current M6, map/offroad, optional local scan, collision, keyboard/touch controls, camera, texture-filter toggle and grid toggle.

Recorded owner observation for the product line:

```text
scan displays correctly
pixel smoothing disabled by default and toggleable
grid disabled by default and toggleable
vehicle collision works correctly
```

Classification: `OWNER OBSERVED`, not a current exact release gate.

## Current campaign

```text
R0-A1 initial authority checkpoint       COMPLETE at 63bbff...
R0-A2 remote/local guard correction      COMPLETE AT fb16cb5...
R0-A3 default-main landing guard         COMPLETE at main@b48c506...
R0-B Windows/toolchain line              COMPLETE PASS at e33b226...
R0-C0-ARCH map-only architecture         DEFINED
C0-CHAR singleton/lifecycle tests        COMPLETE PASS at 746dda0...
C1 scan-free world service               COMPLETE FOR C2 PROGRESSION
C2 dedicated MAP_ONLY_R0 entry           SOURCE-PRESENT / REVALIDATION REQUIRED
R0-D reproducible public artifact        NOT STARTED
R0-E desktop/phone proof                 NOT STARTED
R0-F Pages publication                   NOT AUTHORIZED
R0-G default branch normalization        NOT AUTHORIZED
R1 owner chassis/four wheels             FROZEN UNTIL R0
```

R0-A may change only operational and state documentation. C0-CHAR may change only characterization tests plus the five status documents named by the handoff. It must not alter runtime source, physics, controls, camera, map, scan, assets, package-lock or build configuration.

## Evidence boundary

The last validated predecessor `746dda0b09aeb0906412ef8a2d110a6f3fa83561` / `db9eadf45f75784314d62ae8caf1db528e1de622` passed two independent clean Windows 11 x64 gates with:

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

C1 `c1b7894476dc4da26eec45033b92042919aff1ae` / `22d0734d78d6dacd3d81d46b980423ed9480f3e8` then passed its own two-run Windows source/artifact gate: 288/288 tests in each run, 18 documentation links, unchanged lockfile and byte-identical 14-file LOCAL_FULL artifacts. Evidence ZIP SHA-256: `0eea31c7ebfbe34c3495049c67afafb65595c3ce77b449982d252b4a67e65a56`. A bounded Edge run on the same tip proved a real Running/LIVE map world, WebGL, four contacts and expected LOCAL_FULL controls; the v3 harness stopped only at synthetic keyboard injection. Browser evidence ZIP SHA-256: `c2348b69a855b1867812ede6b39f3a1d2ed6d00a9c91f585b4a82a255a709c81`. This closes C1 for architectural progression to C2, but it is not R0-E real-input, phone, owner or publication evidence.

`docs/repair/R0B_WINDOWS_EVIDENCE_2026-08-07.md` intentionally remains the historical repository receipt index for the earlier `f1c0ffe...` campaign and must not be rewritten as a later-stage receipt.

## Current C2 source boundary

C1 made `src/scene/product-world.ts` scan-free and moved JSPREV2 behind `src/scene/local-full-product-world.ts`. C2 adds a dedicated `MAP_ONLY_R0` entry and capability-driven controls. The public TypeScript import closure excludes `jsprev2-scan.ts`, the LOCAL_FULL provider, `product-spawn.ts` and the LOCAL_FULL product entry; it contains no `/__jv_scan__/` endpoint, `jvSpawn=scan`, scan control label or scan loader call. LOCAL_FULL keeps its existing map/scan controls. C2 does not change physics, input, camera, E2R terrain, scan parsing/collision, Vite/build, package-lock or assets and requires its own exact Windows gate.

## Source that is not active product behavior

A static import audit of `src/product-main.ts` found 21 TypeScript files not reachable from the product entrypoint. This includes the generic GLB/vehicle-visual CPU/GPU pipeline and static-scene package foundation.

Classification:

```text
SOURCE-PRESENT
AUTOMATED CONTRACT TESTS MAY EXIST
NOT PRODUCT-REACHABLE
NOT BROWSER-PROVEN
```

See `docs/PROJECT_STATE.md` for the exact file list.

## Candidate boundaries

```text
00e1c8a3b0f2cf1fd16383f49461dd64512594eb
  DO NOT USE AS RELEASE BASE
  release work is stacked on unaccepted owner-vehicle commits

candidate/jv-web-owner-vehicle-visual-r1
796b050b4b90a2383803cab13f9dcd3aeca5f97f
  FROZEN / BROKEN / SALVAGE ONLY
  no proven runtime texture decode/upload/render integration

historical refoundation, render-host, tiny and lit-normal branches
  EVIDENCE OR SELECTIVE SALVAGE ONLY
  never merge wholesale into the product
```

No current PR is an authority. Verify the current GitHub state rather than trusting a stored PR number.

## Stop conditions

Stop when identity differs, source is dirty, lockfile drifts, build changes source, artifact is non-reproducible, public mode requests the scan, evidence identity mismatches or a gate must be bypassed.

## Read next

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. `docs/repair/R0_WORK_ORDER.md`
4. `docs/repair/R0B_WINDOWS_EVIDENCE_2026-08-07.md`
5. `docs/repair/R0C_MAP_ONLY_ARCHITECTURE.md`
6. `docs/BRANCH_ROLES.md`
7. exact source and tests for the current R0 stage
