# JV Web — indeks dokumentów i statusów

Updated: 2026-08-03
Status: `CANONICAL INDEX`

Ten indeks zapobiega traktowaniu wszystkich raportów jako równorzędnych. Najpierw czyta się dokumenty kanoniczne, później focused receipts. Dokumenty historyczne pozostają jako ślad audytu, ale ich wnioski mogą być skorygowane przez errata.

## 1. Dokumenty obowiązkowe — czytać w tej kolejności

1. `../AI_PROJECT_MEMORY.md`
   - pamięć operacyjna, branche, źródła, zakazy i aktywny kierunek;
   - aktualizować po każdej istotnej decyzji lub zmianie etapu.

2. `PROJECT_STATE.md`
   - krótki kanoniczny stan, zakres pierwszego milestone'u i granice odpowiedzialności.

3. `AUDIT_ERRATA_2026_08_03_PL.md`
   - koryguje wcześniejsze zbyt mocne lub błędne wnioski;
   - ma pierwszeństwo przed wszystkimi broad audit docs.

4. `IMPLEMENTATION_ROADMAP.md`
   - etapy, bramki i kolejność clean development.

5. `NO_ARTIFICIAL_MECHANICS_CONTRACT_PL.md`
   - zasady realistycznego defaultu i jawnej semantyki kierownicy.

## 2. Focused design contracts

### Sterowanie

- `STEERING_INPUT_RESEARCH_2026_08_03_PL.md`
- `STEERING_TAP_EXPERIMENT_MATRIX_2026_08_03_PL.md`

Status:

```text
OWNER NEED CONFIRMED
EXPERIMENT DESIGNED
NO CLEAN RUNTIME RESULT YET
```

### Koło

- `CURRENT_JV_WHEEL_PROGRAM_RECEIPT_2026_08_03_PL.md`
- `WHEEL_ADOPTION_SEAM_2026_08_03_PL.md`
- `LEGACY_M6_WHEEL_FIXTURE_AUDIT_2026_08_03_PL.md`

Status:

```text
LEGACY FIXTURE CLASSIFIED
FUTURE SEAM DESIGNED
NO BACKEND SELECTED
```

### Mobilka

- `MOBILE_HOST_READINESS_AUDIT_2026_08_03_PL.md`

Status:

```text
HOST/INPUT/RENDER REQUIREMENTS IDENTIFIED
NO TOUCH IMPLEMENTATION YET
```

### Binding i solver

- `BOX3D_JS_DEPENDENCY_RECEIPT_2026_08_03.md`
- `BOX3D_ENGINE_DELTA_RECEIPT_2026_08_03.md`
- `BOX3D_JS_BINDING_SEMANTICS_AUDIT_2026_08_03.md`

Status:

```text
ARTIFACT AND SOURCE IDENTITY PINNED
CORE ENGINE DELTA CLASSIFIED
BODY/JOINT/CONTACT RUNTIME EQUIVALENCE NOT YET PROVEN
```

### Native config, assets i validator

- `CONFIG_AND_SESSION_SOURCE_AUDIT_2026_08_03_PL.md`
- `NATIVE_VALIDATION_AND_ASSET_AUTHORITY_AUDIT_2026_08_03_PL.md`
- `NATIVE_JV_SOURCE_RECEIPT_2026_08_03.md`

Status:

```text
SOURCE LAYERS CLASSIFIED
GENERATED FACTORY/CONFIG RECEIPT STILL NEEDED
```

## 3. Broad supporting audits

Te dokumenty zawierają wartościowe szczegóły, ale nie są samodzielnym źródłem najnowszej decyzji:

- `FUNDAMENTAL_AUDIT_2026_08_03_PL.md`
- `PHYSICS_DELTA_AUDIT_2026_08_03_PL.md`
- `DEEP_HOST_ASSET_VALIDATION_AUDIT_2026_08_03_PL.md`
- `CROSS_PROJECT_AUTHORITY_MAP_2026_08_03_PL.md`
- `EVIDENCE_MATRIX_2026_08_03_PL.md`

Zawsze czytać razem z `AUDIT_ERRATA_2026_08_03_PL.md`.

## 4. Historyczne klasyfikacje i inventory

- `PR1_FILE_CLASSIFICATION_2026_08_03_PL.md`
  - pass-1 status każdego pliku PR #1;
  - status może wymagać korekty przez późniejszy focused audit.

- `REPOSITORY_INVENTORY_RECEIPT_2026_08_03.md`
  - byte-level inventory przypiętych publicznych drzew;
  - nie jest dowodem semantycznej lektury ani poprawności.

## 5. Dokumenty na skażonym branchu PR #1

Dokumenty takie jak:

- stare `AI_PROJECT_MEMORY.md`;
- `docs/WEB_CONVERSION_FOUNDATION.md`;
- `docs/PORTING_NOTES.md`;
- body PR #1;

mają status:

```text
HISTORICAL IMPLEMENTATION EVIDENCE
NOT CANONICAL
```

Szczególnie nie wolno odzyskiwać z nich jako zaakceptowanej decyzji:

- return-to-zero;
- centre hold;
- centre-capture CI gate;
- broad parity claims.

## 6. Zasady tworzenia nowych dokumentów

Nowy dokument powstaje tylko, gdy spełnia jeden z warunków:

- dokładny source/runtime receipt;
- nowa decyzja Jozza;
- osobny kontrakt subsystemu;
- formalna errata;
- milestone plan lub wynik wykonanej walidacji.

Nie tworzyć kolejnego broad audit reportu, jeżeli informację można dopisać do:

- `AI_PROJECT_MEMORY.md`;
- `PROJECT_STATE.md`;
- istniejącego focused contractu;
- `AUDIT_ERRATA_2026_08_03_PL.md`.

## 7. Statusy dokumentów

Każdy istotny dokument powinien mieć jeden z jawnych statusów:

```text
CANONICAL
SOURCE_RECEIPT
DESIGN_CANDIDATE
EXPERIMENT_DESIGN
MEASURED_RESULT
OWNER_DECISION
SUPPORTING_AUDIT
HISTORICAL_EVIDENCE
SUPERSEDED
```

Nie używać samego słowa `final`, jeśli istnieją otwarte runtime lub owner gates.

## 8. Aktualizacja indeksu

Indeks aktualizować, gdy:

- dokument zostaje superseded;
- powstaje nowy canonical contract;
- zaczyna się nowy milestone;
- owner wydaje decyzję zmieniającą kolejność lub zakres;
- source snapshot zostaje odświeżony.