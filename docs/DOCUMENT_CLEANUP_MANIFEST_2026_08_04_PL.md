# JV Web — manifest refoundation i porządkowania

Updated: 2026-08-04
Status: `ACTIVE EXECUTION CHECKPOINT`
Branch: `agent/jv-web-refoundation`
Base: `agent/f5-dynamic-steering-validation@0d938e402f618ae34e0d959a9862d97c2f88a926`

## 1. Cel

Zmniejszać liczbę aktywnych źródeł prawdy, zachowując:

- odtwarzalność dowodów;
- znane failure modes;
- aktualne decyzje Jozza;
- możliwość rozwoju native JV Core, Wheel Scope i JES;
- małe, odwracalne kroki.

Nie optymalizujemy liczby plików dla samej liczby. Usuwamy sprzeczną narrację i przypadkową władzę historycznych dokumentów.

## 2. Role dokumentów

```text
CANONICAL_CURRENT
CONTRACT_DECISION
RECEIPT_EVIDENCE
ACTIVE_RESEARCH
ARCHIVE_EVIDENCE
DELETE_CANDIDATE
```

Archiwizacja nie zatwierdza dawnych wniosków. Indexed removal zachowuje pełną treść w przypiętej historii Gita.

## 3. Aktualny read-first chain

1. `../AI_PROJECT_MEMORY.md`
2. `PROJECT_STATE.md`
3. `REFOUNDATION_LOOP_PL.md`
4. `decisions/ADR-0003-native-jv-core-wasm.md`
5. właściwy kontrakt lub receipt

Warunek maksymalnie pięciu pozycji jest spełniony.

## 4. Wykonane

### C0 — bezpieczeństwo

```text
DONE
```

- osobna gałąź refoundation;
- historyczne stacked PR-y nietknięte;
- brak merge i ready transition;
- brak uruchomionych Actions;
- brak automatycznego cross-repo work.

### C1 — aktywny front dokumentacji

```text
DONE
```

Przepisano:

- `README.md`;
- `AI_PROJECT_MEMORY.md`;
- `PROJECT_STATE.md`;
- `DOCUMENT_INDEX.md`.

Usunięto sprzeczne twierdzenia, że aktywny jest F1 albo że F5 nie otrzymało lokalnego gate’u.

### C2 — własność fizyki

```text
DONE / IMPLEMENTATION PENDING
```

- ADR-0003 wybiera native JV Core + Box3D jako jeden moduł WASM;
- TypeScript host zachowuje input/lifecycle/render/UI;
- obecny backend ma ID `legacy_ts_m6`;
- kontrakt zapisuje `productPhysicsAuthority=false` i `nativeParity=NOT_PROVEN`;
- znany mismatch `maxDriveSpeed` jest testowany jako jawna właściwość backendu.

### C3 — redukcja broad documentation

```text
DONE FOR FIRST CORPUS
```

Z aktywnego drzewa usunięto, zachowując exact blob/checkpoint:

- session handoff;
- starą roadmapę;
- erratę i evidence matrix;
- siedem broad audits;
- dwa raporty sterowania;
- trzy dokumenty koła;
- mobile readiness audit;
- PR #1 file classification;
- F1 recovery runbook.

Źródła odzysku znajdują się w `docs/archive/`.

### C4 — kontrakty subsystemów

```text
DONE FOR CURRENT SCOPE
```

Aktywne:

- `contracts/STEERING_COMMAND_CONTRACT_PL.md`;
- `contracts/WHEEL_BACKEND_CONTRACT_PL.md`;
- `contracts/MOBILE_HOST_CONTRACT_PL.md`;
- `NO_ARTIFICIAL_MECHANICS_CONTRACT_PL.md`.

### C5 — workflow i operacje

```text
DONE / LOCAL GATE NOT YET EXECUTED ON THIS BRANCH
```

Usunięto sześć jednorazowych workflowów, w tym historyczny F2 z `contents: write`.

Dodano:

- `tools/check-doc-links.mjs`;
- `npm run check:docs`;
- `tools/run-refoundation-gate.ps1`;
- `operations/REFOUNDATION_LOCAL_GATE_PL.md`.

Link checker przeszedł test składni i syntetyczne scenariusze pass/fail. Nie wykonano jeszcze pełnego auditu świeżego drzewa ani pełnego `npm run check` na branchu refoundation.

## 5. Aktualne źródła prawdy

| Rola | Plik |
|---|---|
| stan produktu | `PROJECT_STATE.md` |
| proces iteracji | `REFOUNDATION_LOOP_PL.md` |
| własność native/WASM | `decisions/ADR-0003-native-jv-core-wasm.md` |
| sterowanie | `contracts/STEERING_COMMAND_CONTRACT_PL.md` |
| koło | `contracts/WHEEL_BACKEND_CONTRACT_PL.md` |
| mobile | `contracts/MOBILE_HOST_CONTRACT_PL.md` |
| zakaz sztucznych defaultów | `NO_ARTIFICIAL_MECHANICS_CONTRACT_PL.md` |
| lokalny gate | `operations/REFOUNDATION_LOCAL_GATE_PL.md` |
| archive recovery | `archive/*.md` |

`README.md` jest front door, a nie dodatkowym magazynem szczegółowego stanu.

## 6. Pozostałe prace dokumentacyjne

### D1 — receipts

```text
OPEN
```

Uporządkować pod:

```text
receipts/source/
receipts/runtime/
receipts/inventory/
```

Receipts pozostają łatwo dostępne. Nie stosować indexed removal do surowego dowodu, jeżeli przeniesienie pliku jest praktyczne.

### D2 — pełny link audit

```text
OPEN / TOOL READY
```

Po lokalnym pullu wykonać:

```text
npm run check:docs
```

Naprawić wszystkie odwołania do usuniętych ścieżek przed uznaniem dokumentacji za czystą.

### D3 — kontrakt sztucznych mechanik

```text
REVIEW NEEDED
```

Sprawdzić, czy `NO_ARTIFICIAL_MECHANICS_CONTRACT_PL.md` nadal posiada unikalną rolę wobec steering contractu i ADR-0003. Jeśli tylko duplikuje, skompresować; nie usuwać ochrony przed regressions.

### D4 — nazwy historycznych narzędzi

```text
OPEN
```

`run-f5-*`, `smoke-f2-*`, `smoke-f4-*` są nadal użytecznymi reproduktorami, ale ich nazwy mogą sugerować aktywne etapy. Najpierw sklasyfikować każdy jako current fixture, archive tool albo delete candidate.

## 7. Pozostałe prace kodowe

### K1 — jawna tożsamość w runtime trace/UI

```text
OPEN
```

Przenieść `legacy_ts_m6` przez:

```text
world
→ trace
→ browser telemetry
→ receipts
```

Usunąć user-facing sformułowania sugerujące „native drive”. Nie zmieniać mechaniki w tym samym kroku.

### K2 — kontrakt jednostek

```text
OPEN
```

Każde pole przyszłego ABI zapisuje:

```text
name
type
unit
coordinate frame
range/domain
semantic meaning
source authority
```

### K3 — native core source set

```text
OPEN
```

W natywnym repo wyznaczyć najmniejszy zestaw bez Sokol/ImGui:

- Box3D;
- geometry/config;
- vehicle build/update;
- blueprint/stable part IDs;
- headless snapshot/hash.

### K4 — minimalny WASM spike

```text
OPEN
```

```text
same native core + same Box3D
→ native executable
→ WASM module
→ create/input/step/snapshot
→ settle+drive comparison
```

### K5 — parity harness

```text
OPEN
```

Nie wystarczy direction/liveness. Porównywać quantized trajectory oraz telemetrykę mechanizmu.

## 8. Bieżące ryzyka

1. Nowy branch nie ma jeszcze pełnego lokalnego gate’u.
2. Świeże linki nie zostały sprawdzone na całym checkoutcie.
3. `legacy_ts_m6` identity nie jest jeszcze widoczne w UI/trace.
4. Receipts nadal są częściowo w root `docs/`.
5. Published `box3d.js` pozostaje reference boundary; custom WASM build jeszcze nie istnieje.
6. Najnowszy Wheel Scope może istnieć tylko lokalnie i wymaga nowego exact source receipt.
7. Zbyt szybkie rozpoczęcie ABI bez source-set audit stworzyłoby pustą abstrakcję zamiast przenośnego core.

## 9. Metryki checkpointu

Na podstawie aktualnego compare z `main`:

```text
read-first length:                  5
active subsystem contracts:        4
accepted ADRs:                     3
archive index files:               5
active GitHub workflows:           0
known product-physics authorities: 1 planned (native core), 0 implemented
reference backends named:          1 (legacy_ts_m6)
new branch validation:             pending
native/WASM parity scenarios:      0
```

## 10. Następna bezpieczna kolejność

```text
D1 organize receipts
→ D3 review no-artificial contract
→ K1 expose backend identity in trace/UI
→ local refoundation gate
→ K2 unit-semantic ABI contract
→ K3 native source-set audit
→ K4 minimal native/WASM spike
→ K5 parity harness
```

Nie zaczynać nowej fizyki koła, drivetrainu, kampusu ani mobile UI przed wykonaniem tych fundamentów.
