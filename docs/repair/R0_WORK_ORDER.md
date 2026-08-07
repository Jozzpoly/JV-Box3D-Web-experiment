# JV Web — active R0 repair work order

Updated: 2026-08-07
Owner: Jozz
Mode: controlled repair toward a static browser release

This is the active work order for `repair/jv-web-release-r0`. It records scope and gates; it is not proof that a gate passed.

## Fixed base and rollback

```text
preserved product branch: product/jv-web-car-map-scan
preserved product commit: c8e0bf24748b0a790a1c0039b1be801eef266580
preserved product tree:   3e241761784edd2a2fb6ab18095c25ea0e737185
repair branch:            repair/jv-web-release-r0
rollback target:          exact preserved product commit
last validated predecessor: e33b226c45005016daa2775226680c3b4db6a724
predecessor tree:           91215f5da39c0a770688f2ad082e5bf5998adb7e
```

The repair branch must remain a linear descendant of the preserved product commit. Do not merge historical or candidate branches into it.

## Frozen product behavior during R0

R0 must not change:

- M6 physics, contacts or tuning;
- keyboard or touch vehicle controls;
- camera behavior;
- E2R terrain, stones or bumpers;
- JSPREV2 parsing, rendering or collision behavior in the local full product;
- owner-vehicle rendering or source assets.

## Stage state

| Stage | State | Exit evidence |
|---|---|---|
| R0-A1 initial authority | Complete at `63bbff...` | one documentation-only commit from `c8e0bf...` |
| R0-A2 Gate 0 correction | Complete at `fb16cb5...` | remote/local gates separated; documents agree |
| R0-A3 default-main landing guard | Complete at `main@b48c506...` | fresh repo landing points to dynamic repair ref and fixed product rollback |
| R0-B0 toolchain operators | Complete | fail-closed single-run plus two-run Windows orchestration |
| R0-B1 historical Windows baseline | Accepted at `f1c0ffe...` | historical repository receipt |
| R0-B2 canonical toolchain pin + revalidation | Complete PASS at `e33b226...` only | external v4 evidence, 285/285 ×2, 18 doc links, identical 14-file artifacts |
| R0-C0-ARCH map-only architecture | Defined | [`R0C_MAP_ONLY_ARCHITECTURE.md`](R0C_MAP_ONLY_ARCHITECTURE.md) |
| C0-CHAR lifecycle characterization | Source-present / revalidation required | exact current-tip two-worktree Windows PASS |
| C1 scan-free world service + LOCAL_FULL provider | Not started | Windows gate + LOCAL_FULL browser regression |
| C2 dedicated MAP_ONLY_R0 entry | Not started | Windows gate + zero-scan static/import/request proof |
| R0-D public artifact | Not started | reproducible allowlisted payload and hardened manifest |
| R0-E runtime validation | Not started | desktop and real-phone receipts for exact artifact |
| R0-F public repository / Pages | Target initialized; artifact not present | exact promotion to `Jozzpoly/JV-Box3D-Web-Public@release/r0`, owner approval and rollback proof |
| R0-G default branch | Not authorized | owner-reviewed final repository model |
| R1 real chassis/four wheels | Frozen | begins only from accepted release-capable R0 |

## R0-B evidence boundary

The last validated predecessor is exactly:

```text
commit: e33b226c45005016daa2775226680c3b4db6a724
tree:   91215f5da39c0a770688f2ad082e5bf5998adb7e
Windows 11 x64
Node 24.16.0 / npm 11.13.0 / TypeScript 7.0.2 / Vite 8.1.5
285/285 tests in each run
18 documentation links
14-file byte-identical LOCAL_FULL portable artifacts
external evidence ZIP SHA-256:
65a98e8175541207c63f21b32d93b4403e3c1b46157289e5c6edeb3d65636a3e
```

This is `SOURCE-GATE PASS + same-OS ARTIFACT-GATE PASS` for that predecessor only. It is not browser, MAP_ONLY_R0, owner or publication evidence. Linux is outside the guarantee and is not a release gate. [`R0B_WINDOWS_EVIDENCE_2026-08-07.md`](R0B_WINDOWS_EVIDENCE_2026-08-07.md) remains intentionally historical for the earlier `f1c0ffe...` campaign.

## C0-CHAR scope and exit

C0-CHAR may change only:

```text
tests/**
AGENTS.md
README.md
AI_PROJECT_MEMORY.md
docs/PROJECT_STATE.md
docs/repair/R0_WORK_ORDER.md
```

Do not change `src/`, Vite/build, package-lock, assets, physics, controls, camera, terrain or scan parsing/collision. Existing coverage for E2R behavior, missing-pack map availability, scan-spawn fail-closed, nearest/grid defaults, local map+scan controls and M6 E2R drive/contact must not be duplicated.

The missing characterization is limited to the product-world singleton/load promise, one scan-index request per successful lifecycle, exact subscriber world identity, restart reuse of the module singleton and host/renderer wiring to that service. If exact renderer↔host runtime identity requires a production seam, defer that seam to C1.

The C0-CHAR tip containing this file is not validated merely because its parent passed. Before C1, run a fresh exact two-worktree Windows gate on its exact commit/tree and require clean source before/after, unchanged lockfile and byte-identical artifacts.

## R0-C minimum architecture

The public mode must be structural, not a fetch monkey-patch:

```text
LOCAL_FULL  = E2R + optional local JSPREV2 capability
MAP_ONLY_R0 = E2R only; scan capability absent
```

Follow [`R0C_MAP_ONLY_ARCHITECTURE.md`](R0C_MAP_ONLY_ARCHITECTURE.md). C1 makes the world service scan-free and moves the static JSPREV2 dependency behind a LOCAL_FULL-only provider. C2 adds the dedicated MAP_ONLY_R0 entry and capability-driven controls. Public mode must neither import/use the scan loader as its world provider nor request `/__jv_scan__/`.

## Public repository target

The artifact destination is defined in [`PUBLIC_REPOSITORY_CONTRACT.md`](PUBLIC_REPOSITORY_CONTRACT.md). `Jozzpoly/JV-Box3D-Web-Public@main` is the publication control plane and `release/r0` is reserved for the accepted artifact. Neither branch currently contains the application, and Pages has not been enabled by this campaign.

## R0-D minimum artifact model

Extend the existing portable system with an explicit `MAP_ONLY_R0` profile. Use a positive payload allowlist. Do not include private scan bytes, inactive tiny-vehicle proof assets, sourcemaps or unexplained external network dependencies.

The final manifest must bind the artifact to source commit/tree/date, lock SHA, exact toolchain, release profile, expected Pages base path and a sorted file hash table. Static HTML/CSS/JS inspection and browser network capture are separate required gates.

## Stop conditions

Stop on identity drift, dirty source, lock drift, source mutation, unknown deletion, non-reproducible output, scan request in public mode, evidence mismatch, unsupported PASS or any required gate bypass.
