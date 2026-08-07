# JV Web — R0 work order — CLOSED

Updated: 2026-08-07
Owner: Jozz
Status: `COMPLETE / PUBLISHED PASS`

This document is retained as the closure record for the R0 repair/release campaign. It is no longer the active development work order.

## Closed result

```text
private source commit:
  5ba6cc406b8c1541e29cd1ae59ffed78a7509284

private source tree:
  08314a0182a38bbcd106e984dde73e737a1a13e7

validated candidate ZIP SHA-256:
  f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

public release:
  Jozzpoly/JV-Box3D-Web-Public
  release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
  tree f1c5c9a971208d89da05143f10913891a58b3b70

Pages:
  https://jozzpoly.github.io/JV-Box3D-Web-Public/
```

Canonical closure details:
[`R0_PUBLISHED_BASELINE_2026-08-07.md`](R0_PUBLISHED_BASELINE_2026-08-07.md).

## Stage closure

| Stage | Final state |
|---|---|
| R0-A repository authority | COMPLETE |
| R0-B Windows/toolchain line | COMPLETE PASS |
| R0-C MAP_ONLY_R0 architecture | COMPLETE PASS |
| C0-CHAR | COMPLETE PASS |
| C1 scan-free world service | COMPLETE |
| C2 MAP_ONLY_R0 entry | COMPLETE PASS |
| R0-D reproducible public artifact | COMPLETE PASS |
| R0-E runtime validation | COMPLETE: automated desktop + owner live desktop/phone |
| R0-F public artifact + Pages | PUBLISHED PASS |
| R0-G default-branch normalization | DEFERRED; not required for R0 |

## R0 invariants that remain valuable after closure

- public artifacts must be structural map/public profiles, not network monkey-patches;
- no private JSPREV2 bytes/requests may enter a public release accidentally;
- exact source/toolchain/artifact hashes and rollback must remain known;
- publication must promote already-validated bytes rather than rebuild them in the public repository;
- owner manual validation and automated evidence must remain distinct evidence classes.

## Frozen R0

Do not modify the published R0 artifact in place.

`release/r0@c3e33e3...` is now a reference and rollback baseline. A future public release must use a new commit/artifact identity and new evidence.

## Successes of the R0 campaign

R0 established, for the first time in this project, a complete chain from private source through reproducible build to a public desktop/mobile URL. This release infrastructure is now a reusable capability and should not dominate normal product development.

## Lessons from the campaign

1. Synthetic browser automation must not become a gate for unrelated source changes.
2. Harness/operator bugs must be distinguished from product failures using raw evidence.
3. A gate should test the change it owns.
4. Preflight the operator itself before involving the owner.
5. Prefer one meaningful end-to-end gate over many overlapping retries.
6. Once a release baseline is proven, freeze it and move product work to a new development lane.

## Post-R0 direction

The active development plan moves to `development/jv-web-r1`.

The first post-R0 foundation task should be a vehicle/visual architecture audit, not another publication exercise. See [`../PROJECT_STATE.md`](../PROJECT_STATE.md).
