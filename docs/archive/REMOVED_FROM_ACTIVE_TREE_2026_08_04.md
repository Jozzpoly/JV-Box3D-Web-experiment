# JV Web — pliki usunięte z aktywnego drzewa podczas refoundation

Updated: 2026-08-04
Status: `ARCHIVE INDEX`

## Zasada

Pełna treść plików z tej listy pozostaje w historii Gita. Punktem odzyskania jest zwalidowany checkpoint bezpośrednio poprzedzający refoundation:

```text
commit 0d938e402f618ae34e0d959a9862d97c2f88a926
branch agent/f5-dynamic-steering-validation
```

Odzyskanie pojedynczego pliku:

```powershell
git show 0d938e402f618ae34e0d959a9862d97c2f88a926:<ścieżka>
```

Usunięcie z aktywnego drzewa nie oznacza, że dokument nigdy nie miał wartości. Oznacza, że został zastąpiony krótszym, aktualnym źródłem prawdy i nie powinien być domyślnie czytany przez kolejnych agentów.

## Pierwsza seria redukcji — aktywny front i stare sterowanie planem

| Dawna ścieżka | Blob SHA | Powód usunięcia | Aktualny następca |
|---|---|---|---|
| `docs/HANDOFF_2026_08_04_PL.md` | `b94ccc5b6f9a9b73d7191e20765704966de22f57` | 562-liniowy session handoff dublował pamięć, state, PR-y i stare liczniki | `AI_PROJECT_MEMORY.md`, `docs/PROJECT_STATE.md` |
| `docs/IMPLEMENTATION_ROADMAP.md` | `b058e53e220d2a4fdfbc9081a3ea8fbb8a645f1a` | roadmap zakładał dalszy ręczny clean port M6/M7 i został fundamentalnie zastąpiony przez native-core WASM direction | `docs/decisions/ADR-0003-native-jv-core-wasm.md`, `docs/PROJECT_STATE.md` |
| `docs/AUDIT_ERRATA_2026_08_03_PL.md` | `a8b609388b2f4e0a009d1d59a02e5a9eafbcde25` | errata korygowała broad audits, które przestają być aktywnymi instrukcjami; trwałe korekty zostały skompresowane do state/ADR/manifestu | `docs/PROJECT_STATE.md`, `docs/DOCUMENT_CLEANUP_MANIFEST_2026_08_04_PL.md` |
| `docs/EVIDENCE_MATRIX_2026_08_03_PL.md` | `81f963c2d0d27d56d67beb34cbd6a08da65a3fc2` | poziomy dowodu i zasada non-claims są już częścią kanonicznej pętli; tabela stanu była przestarzała | `docs/REFOUNDATION_LOOP_PL.md`, `docs/PROJECT_STATE.md` |

## Druga seria redukcji — broad audits sprzed działającego clean runtime

| Dawna ścieżka | Blob SHA | Powód usunięcia | Aktualny następca / miejsce odzyskania wiedzy |
|---|---|---|---|
| `docs/FUNDAMENTAL_AUDIT_2026_08_03_PL.md` | `1d93c43a360121d103f5642bdf80b74a375fbe8e` | audyt poprzedzał clean runtime F1–F5 i miał status `IN_PROGRESS` | historia Gita; `PROJECT_STATE.md` dla bieżącej prawdy |
| `docs/PHYSICS_DELTA_AUDIT_2026_08_03_PL.md` | `04e6fdabb8a842a01d9bfb231e9eea49f4af6436` | porównywał native głównie ze skażonym PR #1, nie z aktualnym reference backendem | ADR-0003 i przyszły native/WASM parity harness |
| `docs/DEEP_HOST_ASSET_VALIDATION_AUDIT_2026_08_03_PL.md` | `e6a174e6e372956504d3b4549d6c312d1c123468` | 708-liniowa archeologia została częściowo zweryfikowana lub zastąpiona przez realne F1–F5 | historia Gita; focused contracts/receipts |
| `docs/CROSS_PROJECT_AUTHORITY_MAP_2026_08_03_PL.md` | `699354209fb97c1e82c04839e6ae899647e0c902` | snapshot granic JV/VAW/JES sprzed późniejszych decyzji i Wheel Scope | `PROJECT_STATE.md`, ADR-0003, bieżące decyzje Jozza |
| `docs/NATIVE_VALIDATION_AND_ASSET_AUTHORITY_AUDIT_2026_08_03_PL.md` | `991a567b94a00df0fceab617646746b11b8792fc` | przed-receipt analiza źródeł; nie jest aktualnym ABI ani parity contractem | native receipt + przyszły ABI/source receipt |
| `docs/CONFIG_AND_SESSION_SOURCE_AUDIT_2026_08_03_PL.md` | `c67afc0067007954b2f9a780e20322ba5447211c` | analiza poprzedzała działający receipt i ujawniony problem jednostek; nie może sterować nowym ABI | ADR-0003 i przyszły unit-semantic ABI contract |
| `docs/BOX3D_JS_BINDING_SEMANTICS_AUDIT_2026_08_03.md` | `7337718b18bcde12521715f33092ac560b4a4ecf` | dotyczy published `box3d.js` jako głównej granicy; po ADR-0003 pozostaje historią reference backendu | historia Gita; ADR-0002 dla pinning reference backendu |

## Kontrola przed usunięciem

Przed pierwszą i drugą serią wykonano:

- odtworzenie bieżącego stanu i dowodów w `PROJECT_STATE.md`;
- zapis nowego procesu w `REFOUNDATION_LOOP_PL.md`;
- zapis decyzji WASM w ADR-0003;
- skrócenie `README.md`, `DOCUMENT_INDEX.md` i `AI_PROJECT_MEMORY.md`;
- przypięcie źródłowego commita i blob SHA każdego usuwanego pliku;
- utworzenie jawnego kontraktu `legacy_ts_m6`, który zapisuje najważniejszą nową rozbieżność semantyczną;
- pozostawienie source receipts i focused contracts poza tą serią redukcji.

## Link audit

Świeża gałąź nie jest wiarygodnie indeksowana przez GitHub code search. Pełny link audit pozostaje obowiązkowym gate’em przed końcową redukcją. Aktywny `README.md`, `AI_PROJECT_MEMORY.md`, `PROJECT_STATE.md` i `DOCUMENT_INDEX.md` nie wskazują usuniętych plików.

Pozostałe odwołania w broad audits nie blokują tej serii, ponieważ same broad audits są usuwane jako jedna warstwa.

## Następne serie

Kolejne pliki będą trafiały do jednej z dwóch grup:

1. **indexed removal** — całkowicie zastąpione, bez potrzeby łatwego bieżącego przeglądania;
2. **physical archive** — nadal wartościowe do badań, ale nieaktywne operacyjnie.

Każda seria musi najpierw naprawić aktywne linki i wyekstrahować unikalną trwałą wiedzę.
