# JV Web — indeks dokumentów

Updated: 2026-08-04
Status: `CANONICAL INDEX`

## 1. Read first

Czytaj tylko w tej kolejności:

1. `../AI_PROJECT_MEMORY.md`
2. `PROJECT_STATE.md`
3. `REFOUNDATION_LOOP_PL.md`
4. `decisions/ADR-0003-native-jv-core-wasm.md`
5. właściwy kontrakt subsystemu albo receipt

Nie czytaj całego `docs/` przed pracą. Archiwum służy do odpowiedzi na konkretne pytanie historyczne.

## 2. Aktywny stan i proces

| Dokument | Rola |
|---|---|
| `PROJECT_STATE.md` | bieżąca prawda o produkcie, dowodach i otwartych problemach |
| `REFOUNDATION_LOOP_PL.md` | rekurencyjna pętla małych, falsyfikowalnych iteracji |
| `DOCUMENT_CLEANUP_MANIFEST_2026_08_04_PL.md` | wykonany zakres cleanupu, ryzyka i następne bramki |
| `NO_ARTIFICIAL_MECHANICS_CONTRACT_PL.md` | konstytucja jednej fizyki, jawnych eksperymentów i assistów |

## 3. Decyzje

| Dokument | Status |
|---|---|
| `decisions/ADR-0001-subframe-rate-integration.md` | accepted |
| `decisions/ADR-0002-pinned-box3d-runtime.md` | accepted for `legacy_ts_m6` reference backend |
| `decisions/ADR-0003-native-jv-core-wasm.md` | accepted architecture authority |

ADR-0003 ma pierwszeństwo tam, gdzie wcześniejsze dokumenty zakładały dalsze ręczne portowanie mechaniki M6/M7 do TypeScriptu.

## 4. Kontrakty subsystemów

| Dokument | Rola |
|---|---|
| `contracts/STEERING_COMMAND_CONTRACT_PL.md` | `RELEASE | POSITION | RATE`, timestamped timeline, K2b i owner gate |
| `contracts/WHEEL_BACKEND_CONTRACT_PL.md` | WheelSpec, native contact backend seam, observer, legacy baseline i Wheel Scope transfer gates |
| `contracts/MOBILE_HOST_CONTRACT_PL.md` | jeden physics profile, multi-touch ownership, render profile i mobile gates |
| `contracts/NATIVE_WASM_ABI_V0_PL.md` | versioned C ABI, jednostki, pamięć, stable part IDs, snapshot i parity trace |

## 5. Aktywne badanie

| Dokument | Pytanie |
|---|---|
| `research/NATIVE_CORE_SOURCE_SET_AUDIT_2026_08_04_PL.md` | najmniejszy behavior-preserving M6 source set dla native/WASM spike |

Wniosek source-set auditu:

```text
najpierw niezmienione M5 + M6 geometry + M6 runtime + Box3D
opakowane cienkim adapterem
→ baseline native/WASM
→ dopiero refactor zależności
```

## 6. Receipts

Kanoniczny indeks:

```text
receipts/INDEX.md
```

Struktura:

```text
receipts/source/
receipts/runtime/
receipts/runtime/history/
receipts/inventory/
../../public/receipts/
```

Najświeższy zwalidowany reference runtime:

```text
receipts/runtime/REFERENCE_RUNTIME_BASELINE_2026_08_04.md
```

## 7. Operacje

| Dokument/narzędzie | Rola |
|---|---|
| `operations/REFOUNDATION_LOCAL_GATE_PL.md` | znaczenie i obsługa lokalnej bramki |
| `../tools/run-refoundation-gate.ps1` | jeden bezpieczny Windows gate |
| `../tools/check-doc-links.mjs` | lokalny audit linków Markdown |

## 8. Archiwum

Broad audits, dawne roadmapy, handoffy, kwarantanny i zakończone runbooki nie są bieżącą instrukcją.

Indeksy:

```text
archive/REMOVED_FROM_ACTIVE_TREE_2026_08_04.md
archive/STEERING_RESEARCH_2026_08_03_INDEX.md
archive/WHEEL_RESEARCH_2026_08_03_INDEX.md
archive/MOBILE_HOST_AUDIT_2026_08_03_INDEX.md
archive/QUARANTINE_AND_F1_OPERATIONS_2026_08_03_INDEX.md
```

## 9. Statusy dokumentów

```text
CANONICAL_CURRENT
CONTRACT_DECISION
RECEIPT_EVIDENCE
ACTIVE_RESEARCH
ARCHIVE_EVIDENCE
DELETE_CANDIDATE
```

## 10. Reguła nowych dokumentów

Nowy plik powstaje tylko jako:

- ADR;
- trwały kontrakt subsystemu;
- surowy receipt;
- focused research z jednym pytaniem i stop condition;
- kanoniczny state/process;
- indeksowane archiwum z unikalną historią.

Nie tworzyć kolejnych broad audits ani session handoffów, jeżeli informację można skompresować do `AI_PROJECT_MEMORY.md`, `PROJECT_STATE.md`, istniejącego ADR/contractu albo receiptu.
