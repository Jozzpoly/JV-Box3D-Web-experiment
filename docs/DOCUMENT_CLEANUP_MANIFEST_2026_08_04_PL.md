# JV Web — manifest porządkowania dokumentacji

Updated: 2026-08-04
Status: `ACTIVE CLEANUP MANIFEST`
Branch: `agent/jv-web-refoundation`

## 1. Zasada klasyfikacji

Każdy dokument otrzymuje dokładnie jedną rolę:

```text
CANONICAL_CURRENT   — potrzebny do rozpoczęcia bieżącej pracy
CONTRACT_DECISION   — trwały kontrakt lub ADR
RECEIPT_EVIDENCE    — surowy dowód wykonania, źródła albo artefaktu
ACTIVE_RESEARCH     — otwarty program badawczy z jasnym pytaniem
ARCHIVE_EVIDENCE    — wartościowy historycznie, nieaktywny operacyjnie
DELETE_CANDIDATE    — brak unikalnej wartości poza historią Gita
```

Archiwizacja nie oznacza akceptacji dawnych wniosków. Oznacza zachowanie śladu bez pozwalania mu sterować bieżącym projektem.

## 2. Docelowy aktywny łańcuch wejściowy

Maksymalnie pięć pozycji:

1. `AI_PROJECT_MEMORY.md` — krótki operacyjny checkpoint;
2. `docs/PROJECT_STATE.md` — prawda o bieżącym produkcie i dowodach;
3. `docs/REFOUNDATION_LOOP_PL.md` — proces pracy;
4. `docs/decisions/ADR-0003-native-jv-core-wasm.md` — docelowa własność fizyki;
5. właściwy kontrakt subsystemu lub ostatni receipt.

`README.md` jest wejściem dla człowieka, lecz nie drugim magazynem stanu.

## 3. Klasyfikacja istniejących plików

### Root

| Plik | Klasyfikacja | Działanie |
|---|---|---|
| `README.md` | `CANONICAL_CURRENT` | przepisać jako krótki front door; usunąć stary status F1 |
| `AI_PROJECT_MEMORY.md` | `CANONICAL_CURRENT` | skompresować; stan doprowadzić do refoundation i 75/75 |

### Kanoniczny stan i proces

| Plik | Klasyfikacja | Działanie |
|---|---|---|
| `docs/PROJECT_STATE.md` | `CANONICAL_CURRENT` | przepisać; usunąć twierdzenie, że F5 nie wykonano |
| `docs/DOCUMENT_INDEX.md` | `CANONICAL_CURRENT` | zastąpić krótkim indeksem aktywne/receipts/archive |
| `docs/REFOUNDATION_LOOP_PL.md` | `CANONICAL_CURRENT` | zachować |
| `docs/IMPLEMENTATION_ROADMAP.md` | `ARCHIVE_EVIDENCE` | wyekstrahować aktualny kierunek WASM, resztę zarchiwizować |
| `docs/HANDOFF_2026_08_04_PL.md` | `ARCHIVE_EVIDENCE` | przenieść do `docs/archive/handoffs/`; nie czytać domyślnie |

### Trwałe kontrakty i decyzje

| Plik | Klasyfikacja | Działanie |
|---|---|---|
| `docs/NO_ARTIFICIAL_MECHANICS_CONTRACT_PL.md` | `CONTRACT_DECISION` | zachować, skrócić duplikaty stanu |
| `docs/decisions/ADR-0001-subframe-rate-integration.md` | `CONTRACT_DECISION` | zachować |
| `docs/decisions/ADR-0002-pinned-box3d-runtime.md` | `CONTRACT_DECISION` | zachować |
| `docs/WHEEL_ADOPTION_SEAM_2026_08_03_PL.md` | `ACTIVE_RESEARCH` | przemianować później na stabilny kontrakt bez daty |
| `docs/STEERING_INPUT_RESEARCH_2026_08_03_PL.md` | `ACTIVE_RESEARCH` | skompresować do kontraktu RATE/POSITION/RELEASE |
| `docs/STEERING_TAP_EXPERIMENT_MATRIX_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | wynikowe reguły do kontraktu, macierz do archiwum |
| `docs/MOBILE_HOST_READINESS_AUDIT_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | zachować jako przyszłe wymagania, poza aktywnym frontem |

### Receipts i surowe dowody

| Plik | Klasyfikacja | Działanie |
|---|---|---|
| `docs/BOX3D_ENGINE_DELTA_RECEIPT_2026_08_03.md` | `RECEIPT_EVIDENCE` | przenieść do `docs/receipts/source/` |
| `docs/BOX3D_JS_DEPENDENCY_RECEIPT_2026_08_03.md` | `RECEIPT_EVIDENCE` | przenieść do `docs/receipts/source/` |
| `docs/NATIVE_JV_SOURCE_RECEIPT_2026_08_03.md` | `RECEIPT_EVIDENCE` | przenieść do `docs/receipts/source/` |
| `docs/REPOSITORY_INVENTORY_RECEIPT_2026_08_03.md` | `RECEIPT_EVIDENCE` | przenieść do `docs/receipts/inventory/` |
| `docs/EVIDENCE_MATRIX_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | zarchiwizować; poziomy dowodu są już w pętli |
| `docs/F5_MINIMAL_DRIVE_LOCAL_GATE_2026-08-04.md` | `RECEIPT_EVIDENCE` | przenieść do `docs/receipts/runtime/` i dopisać semantic mismatch |
| `docs/receipts/F2_BROWSER_SMOKE.json` | `RECEIPT_EVIDENCE` | zachować |
| `docs/receipts/F2_NODE24_VALIDATION.md` | `RECEIPT_EVIDENCE` | zachować |

### Broad audits — zachować wyłącznie jako archiwum

| Plik | Klasyfikacja | Powód |
|---|---|---|
| `docs/FUNDAMENTAL_AUDIT_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | szeroki snapshot sprzed implementacji F1–F5 |
| `docs/PHYSICS_DELTA_AUDIT_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | część wniosków zastąpiona przez realny runtime i nowy audyt semantyki napędu |
| `docs/DEEP_HOST_ASSET_VALIDATION_AUDIT_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | wartościowa archeologia, zbyt szeroka jako instrukcja |
| `docs/CROSS_PROJECT_AUTHORITY_MAP_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | źródła i branche już zmieniły rolę |
| `docs/NATIVE_VALIDATION_AND_ASSET_AUTHORITY_AUDIT_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | receipt generator istnieje; dokument nie jest bieżącą granicą |
| `docs/CONFIG_AND_SESSION_SOURCE_AUDIT_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | przed-WASM analiza; trwałe reguły należy przenieść do ABI/kontraktu |
| `docs/BOX3D_JS_BINDING_SEMANTICS_AUDIT_2026_08_03.md` | `ARCHIVE_EVIDENCE` | zachować do pracy nad custom WASM, nie czytać domyślnie |
| `docs/AUDIT_ERRATA_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | errata do dokumentów, które same opuszczają aktywny front |

### Koło i historyczny backend

| Plik | Klasyfikacja | Działanie |
|---|---|---|
| `docs/CURRENT_JV_WHEEL_PROGRAM_RECEIPT_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | snapshot jest niepełny wobec późniejszego Wheel Scope; zachować z ostrzeżeniem |
| `docs/LEGACY_M6_WHEEL_FIXTURE_AUDIT_2026_08_03_PL.md` | `CONTRACT_DECISION` | skrócić do roli baseline/fallback; szczegóły zarchiwizować |

### Historia odbudowy i kwarantanny

| Plik | Klasyfikacja | Działanie |
|---|---|---|
| `docs/PR1_FILE_CLASSIFICATION_2026_08_03_PL.md` | `ARCHIVE_EVIDENCE` | przenieść do `docs/archive/quarantine/pr1/` |
| `docs/operations/F1_LOCAL_RUNBOOK_PL.md` | `ARCHIVE_EVIDENCE` | zastąpić jednym aktualnym skryptem/runbookiem |

## 4. Workflows

Obecne workflowy są manual-only, ale nadal zwiększają powierzchnię poznawczą i ryzyko przypadkowego użycia.

| Workflow | Klasyfikacja | Działanie |
|---|---|---|
| `audit-all-repository-inventory.yml` | `ARCHIVE_EVIDENCE` | usunąć po zapisaniu wyniku; odtworzenie możliwe z historii Gita |
| `audit-box3d-engine-delta.yml` | `ARCHIVE_EVIDENCE` | usunąć po potwierdzeniu receipt |
| `audit-box3d-js-source.yml` | `ARCHIVE_EVIDENCE` | usunąć po potwierdzeniu receipt |
| `f2-lock-and-validate.yml` | `ARCHIVE_EVIDENCE` | zastąpić lokalnym gate; nie jest bieżącym produktem |
| `f3-validate.yml` | `ARCHIVE_EVIDENCE` | usunąć po przeniesieniu receiptu |
| `f4-validate.yml` | `ARCHIVE_EVIDENCE` | usunąć po wprowadzeniu jednego aktualnego gate |

Docelowo `.github/workflows/` pozostaje puste albo zawiera wyłącznie jeden jawnie zatwierdzony, ręczny gate. Żaden workflow nie będzie tworzony w ramach tej fazy bez decyzji Jozza.

## 5. Kandydaci do usunięcia

Na tym etapie żaden dokument źródłowy nie jest jeszcze kasowany bez ekstrakcji. Pierwsi kandydaci po archiwizacji i link audicie:

1. `docs/EVIDENCE_MATRIX_2026_08_03_PL.md` — definicje poziomów są już w kanonicznej pętli;
2. `docs/AUDIT_ERRATA_2026_08_03_PL.md` — po przeniesieniu wszystkich dokumentów, które koryguje;
3. stare workflowy audytowe — ich wartością są zapisane receipts, nie wykonywalny YAML;
4. przestarzały F1 runbook — po powstaniu jednego aktualnego runbooka;
5. duplikaty branch/status opisów w README, state, memory i handoff.

Kasowanie następuje dopiero, gdy:

- unikalna trwała wiedza została przeniesiona;
- `git` zachowuje pełną historię;
- żaden aktywny link nie wskazuje pliku;
- usunięcie nie utrudnia reprodukcji znanego failure mode.

## 6. Kolejność wykonania

### C0 — bezpieczeństwo

- osobna gałąź `agent/jv-web-refoundation`;
- brak zmian na historycznych PR-ach;
- brak merge;
- brak Actions.

### C1 — nowy front door

- naprawić `README.md`;
- przepisać `PROJECT_STATE.md`;
- skrócić `AI_PROJECT_MEMORY.md`;
- przepisać `DOCUMENT_INDEX.md`.

### C2 — decyzja o rdzeniu

- dodać ADR native JV Core + Box3D jako jeden WASM;
- oznaczyć TypeScript M6 jako legacy reference backend;
- zapisać semantic mismatch `maxDriveSpeed`.

### C3 — fizyczna reorganizacja

- utworzyć `docs/archive/2026-08-foundation-audit/`;
- przenieść broad audits;
- utworzyć `docs/archive/handoffs/` i `docs/archive/quarantine/`;
- uporządkować `docs/receipts/`.

### C4 — link audit

- wyszukać stare ścieżki;
- naprawić odwołania;
- sprawdzić, czy aktywne dokumenty nie cytują archiwum jako bieżącej decyzji.

### C5 — redukcja workflowów i runbooków

- zachować wynik, usunąć narzędzia jednorazowe;
- stworzyć jeden aktualny local gate po ustaleniu backendu.

### C6 — code refoundation

- interfejs `VehicleRuntimeBackend`;
- jawna nazwa `legacy_ts_m6`;
- native/WASM spike;
- ABI z jednostkami i stable part IDs;
- parity harness;
- dopiero potem rozwój fizyki i Wheel Scope.

## 7. Metryki postępu

Po każdej większej iteracji zapisać:

```text
active docs count
archive docs count
read-first length
contradictory current-status claims
open source-of-truth duplications
workflows count
tests count and evidence level
native/WASM parity scenarios
```

Celem nie jest minimalna liczba plików. Celem jest minimalna liczba **aktywnych źródeł prawdy** przy zachowaniu pełnej, czytelnej pamięci projektu.
