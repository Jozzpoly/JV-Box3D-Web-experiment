# JV Web — active R0 repair work order

Updated: 2026-08-06
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
| R0-B0 toolchain operators | Source-present / auxiliary-tested | single-run fail-closed plus two-run same-OS orchestration; canonical Node 24 pending |
| R0-B exact toolchain | Not proven | clean Linux and Windows receipts |
| R0-C map-only product mode | Not started | structural zero-scan mode with behavior characterization |
| R0-D public artifact | Not started | reproducible allowlisted payload and hardened manifest |
| R0-E runtime validation | Not started | desktop and real-phone receipts for exact artifact |
| R0-F public repository / Pages | Target initialized; artifact not present | exact promotion to `Jozzpoly/JV-Box3D-Web-Public@release/r0`, owner approval and rollback proof |
| R0-G default branch | Not authorized | owner-reviewed final repository model |
| R1 real chassis/four wheels | Frozen | begins only from accepted release-capable R0 |

## R0-B sequence

Do not pin a package manager before evidence.

1. Use the guarded single-run operator in [`R0B_TOOLCHAIN_OPERATOR.md`](R0B_TOOLCHAIN_OPERATOR.md) through the two-run orchestrator in [`R0B_SAME_OS_CANDIDATE.md`](R0B_SAME_OS_CANDIDATE.md).
2. Verify official Node `24.16.0` and its bundled npm `11.13.0` by signed/checksummed release data.
3. Run the first canonical candidate on Linux and Windows from clean disposable checkouts.
4. Run npm `11.17.0` as a forensic comparator only.
5. Require the receipts to record the normalized logical dependency graph and selected TypeScript/Rolldown native bindings; expand the comparison matrix only if the comparator changes the lock, dependency graph, source gate or artifact.
6. Commit exact toolchain constraints only after the evidence is reviewed.

Do not compare raw cross-platform `node_modules` directories. Compare lockfile cleanliness, logical package versions, expected native platform bindings, source results and artifact semantics. Same-OS repeated builds must be byte-identical; cross-platform byte identity is measured before it is made mandatory.

## R0-C minimum architecture

The public mode must be structural, not a fetch monkey-patch:

```text
LOCAL_FULL  = E2R + optional local JSPREV2 capability
MAP_ONLY_R0 = E2R only; scan capability absent
```

Before refactoring, add behavior-characterization tests. Public mode must neither import/use the scan loader as its world provider nor request `/__jv_scan__/`.

## Public repository target

The artifact destination is defined in [`PUBLIC_REPOSITORY_CONTRACT.md`](PUBLIC_REPOSITORY_CONTRACT.md). `Jozzpoly/JV-Box3D-Web-Public@main` is the publication control plane and `release/r0` is reserved for the accepted artifact. Neither branch currently contains the application, and Pages has not been enabled by this campaign.

## R0-D minimum artifact model

Extend the existing portable system with an explicit `MAP_ONLY_R0` profile. Use a positive payload allowlist. Do not include private scan bytes, inactive tiny-vehicle proof assets, sourcemaps or unexplained external network dependencies.

The final manifest must bind the artifact to source commit/tree/date, lock SHA, exact toolchain, release profile, expected Pages base path and a sorted file hash table. Static HTML/CSS/JS inspection and browser network capture are separate required gates.

## Stop conditions

Stop on identity drift, dirty source, lock drift, source mutation, unknown deletion, non-reproducible output, scan request in public mode, evidence mismatch, unsupported PASS or any required gate bypass.
