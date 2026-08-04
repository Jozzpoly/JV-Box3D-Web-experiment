# JV Web — indeks receiptów

Updated: 2026-08-04
Status: `CANONICAL EVIDENCE INDEX`

Receipts are immutable evidence records. A later interpretation does not rewrite an earlier measurement; it creates a new receipt or a clearly marked superseding record.

## Source evidence

| Receipt | Scope |
|---|---|
| `source/NATIVE_JV_SOURCE_2026_08_03.md` | pinned native JV audit input and critical source blobs |
| `source/BOX3D_JS_DEPENDENCY_2026_08_03.md` | exact published `box3d.js@0.0.2` artifact, binding and upstream engine identity |
| `source/BOX3D_ENGINE_DELTA_2026_08_03.md` | source delta between upstream engine used by npm and the pinned JV fork |
| `../../public/receipts/jv_m6_factory_receipt.json` | byte-pinned native factory configuration consumed by the reference backend |

## Runtime evidence

| Receipt | Scope |
|---|---|
| `runtime/F2_NODE24_VALIDATION.md` | F2 Node/toolchain, tests and browser validation |
| `runtime/F2_BROWSER_SMOKE.json` | machine-readable F2 browser generation/rebuild receipt |
| `runtime/REFERENCE_RUNTIME_BASELINE_2026_08_04.md` | reference runtime, browser liveness, steering matrix and semantic drive verdict |
| `runtime/history/F5_MINIMAL_DRIVE_ATTEMPT_1_2026_08_04.md` | incomplete 70/71 attempt that exposed stale-clock disposal behavior |

Demonstrator-foundation gates are preserved as falsification evidence, not rewritten as green receipts:

```text
67067c5d46fc...
81/81 PASS + bundle PASS
portable FAIL on root-absolute receipt URL

2f14d109980c...
109 tests: 108 PASS / 1 public-report sanitizer FAIL
foundation gate stopped before package validation
```

A new full demonstrator receipt may be created only after the current exact head passes the complete local foundation gate.

## Inventory evidence

| Receipt | Scope |
|---|---|
| `inventory/REPOSITORY_INVENTORY_2026_08_03.md` | byte-level public repository snapshots and explicit coverage limits |
| `inventory/GITHUB_CLOUD_SURFACE_2026_08_04.md` | PR/issue/workflow/artifact/repository metadata inventory; exact artifact ZIP byte review |
| `inventory/GITHUB_ACTIONS_LOG_REVIEW_2026_08_04.md` | raw log review for source-audit, F3 and F4; unresolved manual F2/cache/all-runs scope |
| `inventory/GITHUB_BRANCH_SURFACE_2026_08_04.md` | all 16 visible branches; 13 PR-backed, main, and two orphan public-ref blockers |

Cloud facts currently pinned:

```text
artifact 8856776966
ZIP SHA-256 1e6d198dcdb9b9bde45cd6a5142b28d47c7ff96473c99e74880aee5c5918f884
unsafe paths 0
symlinks 0
secret findings 0
JV/Jozz/local-owner data observed 0

raw logs reviewed
91694046725 source audit
91826090330 F3
91834173347 F4
```

Branch-surface facts:

```text
16 visible branches
13 PR-backed branches
main
orphan blocker: agent/f3-regression-snapshot-2026-08-03
orphan blocker: agent/terrain-scan-integration
unclassified public tags allowed: 0
```

The two orphan refs have source-level recovery tooling but **no recovery artifact has been created yet**.

## Local source-public evidence

Generated locally and intentionally ignored:

```text
.local-audit/public-readiness.json
.local-audit/license-inventory.json
.local-audit/public-review-classifications.json
.local-audit/source-public-integration.json
```

Meaning:

- `public-readiness.json` records sanitized current/history/ref/path findings and exact public-ref policy for one commit;
- `license-inventory.json` separates root project license, notices and nested vendor licenses;
- `public-review-classifications.json` requires an explicit disposition for every sanitized review finding;
- `source-public-integration.json` records the nonmutating `origin/main` merge-base/ahead/behind proof.

Optional private recovery evidence, not yet generated:

```text
.local-audit/jv-web-orphan-public-refs-2026-08-04.bundle
.local-audit/orphan-public-refs-archive.json
```

Creation requires explicit execution of:

```text
npm run archive:orphan-refs
```

The archive tool verifies exact bundle heads, bytes and SHA-256 and records `remoteRefsDeleted=false`. It does not authorize or perform ref deletion.

These files do not become committed receipts automatically. Before any committed summary:

1. source commit must match the exact candidate;
2. local HEAD must match the remote candidate after fresh fetch;
3. blockers must be remediated, not waived;
4. every review finding must be classified;
5. ledger rationales must not copy private identifiers;
6. orphan recovery must be separately verified before any owner-approved ref change;
7. owner decisions and manual GitHub UI findings must be added separately.

## Evidence interpretation rules

```text
SOURCE_FACT                   exact source bytes or semantics
MEASURED_FACT                 named runtime or repository measurement
MECHANISM_FALSIFICATION       test distinguishing competing mechanisms
INTERNAL_CONSISTENCY          implementation agrees with its own contract
LIVENESS_SMOKE                runtime starts and progresses
PORTABLE_STATIC_PASS          file/path/hash/compliance contract
LOOPBACK_HTTP_PASS            exact bytes under root and project subpath
DESKTOP_BROWSER_PASS          real browser execution without uncaught errors
LAN_PHONE_PASS                real phone interaction/performance evidence
SCENARIO_EQUIVALENCE          named scenarios compared under a stated tolerance
VISUAL_OBSERVATION            observed render/UI behavior
OWNER_VALIDATED               Jozz issued the manual verdict
PRIVATE_REF_RECOVERY_PASS     exact orphan refs recoverable from a verified private bundle
PUBLIC_REF_POLICY_PASS        zero blocked orphan/unknown/tag refs and exact remote candidate
SOURCE_PUBLIC_READY_PASS      source/history/license/cloud/default branch accepted
DEMONSTRATOR_PACKAGE_READY    exact portable package and desktop browser accepted
PAGES_PUBLISH_READY_PASS      phone/package/release branch accepted for publication
PAGES_HTTPS_PASS              exact package works from the real Pages URL
```

A green internal test is not automatically native parity, mobile readiness, source-public readiness, Pages readiness or owner acceptance.

## Freshness

Every receipt is valid only for its pinned source/toolchain/config scope. Before reuse:

1. compare exact source identities;
2. review changed blobs, ABI, ref or contract fields;
3. preserve the older receipt;
4. create a new delta/measurement record;
5. do not silently update dates, hashes or verdicts in historical evidence.
