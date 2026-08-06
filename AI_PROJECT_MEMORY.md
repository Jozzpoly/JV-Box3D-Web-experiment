# AI project memory — JV Web

Updated: 2026-08-06
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
R0-B0 single/two-run toolchain operators SOURCE-PRESENT / AUXILIARY-TESTED
R0-B exact toolchain                     NOT PROVEN
R0-C public product mode                 NOT STARTED
R0-D reproducible public artifact        NOT STARTED
R0-E desktop/phone proof                 NOT STARTED
R0-F Pages publication                   NOT AUTHORIZED
R0-G default branch normalization        NOT AUTHORIZED
R1 owner chassis/four wheels             FROZEN UNTIL R0
```

R0-A may change only operational and state documentation. It must not alter runtime source, physics, controls, camera, map, scan, assets or packaging.

## Evidence boundary

Current auxiliary R0-B0 validation with Node 22.16.0 / TypeScript 5.8.3 reached:

```text
typecheck: PASS
tests: 278/278 PASS
document links: 16/16 PASS
same-OS preflight: 2/2 identical / canonical false
```

The exact third-party/toolchain gate is intentionally not claimed under TypeScript 5.8. Exact Node 24.16.0, accepted npm, TypeScript 7.0.2, Vite 8.1.5, clean `npm ci`, portable build, browser and phone proof remain required.

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
4. `docs/BRANCH_ROLES.md`
5. exact source and tests for the current R0 stage
