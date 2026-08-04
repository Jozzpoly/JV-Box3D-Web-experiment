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
| `../../public/receipts/jv_m6_factory_receipt.json` | byte-pinned native factory configuration artifact consumed by the reference backend |

## Runtime evidence

| Receipt | Scope |
|---|---|
| `runtime/F2_NODE24_VALIDATION.md` | F2 Node/toolchain, tests and browser validation |
| `runtime/F2_BROWSER_SMOKE.json` | machine-readable F2 browser generation/rebuild receipt |
| `runtime/REFERENCE_RUNTIME_BASELINE_2026_08_04.md` | 75/75 reference runtime, build/browser liveness, dynamic rack matrix and later semantic drive verdict |
| `runtime/history/F5_MINIMAL_DRIVE_ATTEMPT_1_2026_08_04.md` | incomplete 70/71 attempt that exposed stale-clock disposal behavior |

## Inventory evidence

| Receipt | Scope |
|---|---|
| `inventory/REPOSITORY_INVENTORY_2026_08_03.md` | byte-level public repository snapshots and explicit coverage limits |

## Evidence interpretation rules

```text
SOURCE_FACT           source bytes or source semantics at an exact identity
MEASURED_FACT         named runtime measurement
MECHANISM_FALSIFICATION test that distinguishes competing mechanisms
INTERNAL_CONSISTENCY  implementation agrees with its own contract
LIVENESS_SMOKE        runtime starts and progresses
SCENARIO_EQUIVALENCE  two named scenarios compared under a stated tolerance
VISUAL_OBSERVATION    observed render/UI behavior
OWNER_VALIDATED       Jozz issued the manual verdict
```

A green internal test is not automatically native parity or owner validation.

## Freshness

Every receipt is valid only for its pinned source/toolchain/config scope. Before reuse:

1. compare exact source identities;
2. review changed blobs or ABI fields;
3. preserve the older receipt;
4. create a new delta/measurement record;
5. do not silently update dates or hashes in historical evidence.
