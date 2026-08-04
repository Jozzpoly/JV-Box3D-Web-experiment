# JV Web — indeks dokumentów

Updated: 2026-08-04
Status: `CANONICAL INDEX`

## 1. Read first

Czytaj tylko w tej kolejności:

1. `../AI_PROJECT_MEMORY.md`
2. `PROJECT_STATE.md`
3. `REFOUNDATION_LOOP_PL.md`
4. `decisions/ADR-0003-native-jv-core-wasm.md`
5. właściwy kontrakt subsystemu lub ostatni receipt

Nie czytaj całego `docs/` przed pracą. Archiwum służy do odpowiedzi na konkretne pytanie historyczne.

## 2. Aktywne dokumenty kanoniczne

| Dokument | Rola |
|---|---|
| `PROJECT_STATE.md` | bieżąca prawda o produkcie, dowodach i otwartych problemach |
| `REFOUNDATION_LOOP_PL.md` | sposób prowadzenia małych, falsyfikowalnych iteracji |
| `DOCUMENT_CLEANUP_MANIFEST_2026_08_04_PL.md` | migracja obecnego korpusu dokumentacji |
| `NO_ARTIFICIAL_MECHANICS_CONTRACT_PL.md` | mechanika realistycznego defaultu i jawne assisty |

## 3. Decyzje

| Dokument | Status |
|---|---|
| `decisions/ADR-0001-subframe-rate-integration.md` | accepted |
| `decisions/ADR-0002-pinned-box3d-runtime.md` | accepted for reference backend |
| `decisions/ADR-0003-native-jv-core-wasm.md` | accepted for refoundation |

ADR-0003 ma pierwszeństwo tam, gdzie wcześniejsze dokumenty zakładały dalsze ręczne portowanie mechaniki M6/M7 do TypeScriptu.

## 4. Aktywne kontrakty subsystemów

| Dokument | Rola |
|---|---|
| `contracts/STEERING_COMMAND_CONTRACT_PL.md` | semantyka `RELEASE | POSITION | RATE`, timestamped timeline, K2b i owner gate |
| `contracts/WHEEL_BACKEND_CONTRACT_PL.md` | WheelSpec, native contact backend seam, observer, legacy baseline i Wheel Scope transfer gates |
| `contracts/MOBILE_HOST_CONTRACT_PL.md` | jeden physics profile, multi-touch ownership, render profiles i mobile gates |

## 5. Receipts

Receipts przechowują dowód, nie plan i nie opinię.

Obecnie:

```text
docs/receipts/F2_BROWSER_SMOKE.json
docs/receipts/F2_NODE24_VALIDATION.md
docs/F5_MINIMAL_DRIVE_LOCAL_GATE_2026-08-04.md
public/receipts/jv_m6_factory_receipt.json
```

Docelowa struktura:

```text
docs/receipts/source/
docs/receipts/runtime/
docs/receipts/inventory/
```

## 6. Archiwum

Broad audits, dawne roadmapy, handoffy, kwarantanny i inventory nie są bieżącą instrukcją.

Indeksy:

```text
archive/REMOVED_FROM_ACTIVE_TREE_2026_08_04.md
archive/STEERING_RESEARCH_2026_08_03_INDEX.md
archive/WHEEL_RESEARCH_2026_08_03_INDEX.md
archive/MOBILE_HOST_AUDIT_2026_08_03_INDEX.md
```

Pełna klasyfikacja i kolejność migracji:

```text
DOCUMENT_CLEANUP_MANIFEST_2026_08_04_PL.md
```

## 7. Statusy

Każdy aktywny dokument używa jednej roli:

```text
CANONICAL_CURRENT
CONTRACT_DECISION
RECEIPT_EVIDENCE
ACTIVE_RESEARCH
ARCHIVE_EVIDENCE
DELETE_CANDIDATE
```

## 8. Reguła nowych dokumentów

Nowy plik powstaje tylko jako:

- ADR;
- trwały kontrakt subsystemu;
- surowy receipt;
- kanoniczny state/process;
- indeksowane archiwum z unikalną historią.

Nie tworzyć kolejnych broad audits ani session handoffów, jeżeli informację można skompresować do `AI_PROJECT_MEMORY.md`, `PROJECT_STATE.md`, istniejącego ADR albo receiptu.
