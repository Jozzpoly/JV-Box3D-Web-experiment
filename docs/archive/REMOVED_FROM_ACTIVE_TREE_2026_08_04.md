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

## Pierwsza seria redukcji

| Dawna ścieżka | Blob SHA | Powód usunięcia | Aktualny następca |
|---|---|---|---|
| `docs/HANDOFF_2026_08_04_PL.md` | `b94ccc5b6f9a9b73d7191e20765704966de22f57` | 562-liniowy session handoff dublował pamięć, state, PR-y i stare liczniki | `AI_PROJECT_MEMORY.md`, `docs/PROJECT_STATE.md` |
| `docs/IMPLEMENTATION_ROADMAP.md` | `b058e53e220d2a4fdfbc9081a3ea8fbb8a645f1a` | roadmap zakładał dalszy ręczny clean port M6/M7 i został fundamentalnie zastąpiony przez native-core WASM direction | `docs/decisions/ADR-0003-native-jv-core-wasm.md`, `docs/PROJECT_STATE.md` |
| `docs/AUDIT_ERRATA_2026_08_03_PL.md` | `a8b609388b2f4e0a009d1d59a02e5a9eafbcde25` | errata korygowała broad audits, które przestają być aktywnymi instrukcjami; trwałe korekty zostały skompresowane do state/ADR/manifestu | `docs/PROJECT_STATE.md`, `docs/DOCUMENT_CLEANUP_MANIFEST_2026_08_04_PL.md` |
| `docs/EVIDENCE_MATRIX_2026_08_03_PL.md` | `81f963c2d0d27d56d67beb34cbd6a08da65a3fc2` | poziomy dowodu i zasada non-claims są już częścią kanonicznej pętli; tabela stanu była przestarzała | `docs/REFOUNDATION_LOOP_PL.md`, `docs/PROJECT_STATE.md` |

## Kontrola przed usunięciem

Dla tej serii wykonano:

- odtworzenie bieżącego stanu i dowodów w `PROJECT_STATE.md`;
- zapis nowego procesu w `REFOUNDATION_LOOP_PL.md`;
- zapis decyzji WASM w ADR-0003;
- skrócenie `README.md`, `DOCUMENT_INDEX.md` i `AI_PROJECT_MEMORY.md`;
- przypięcie źródłowego commita i blob SHA każdego usuwanego pliku.

## Następne serie

Kolejne pliki będą trafiały do jednej z dwóch grup:

1. **indexed removal** — całkowicie zastąpione, bez potrzeby łatwego bieżącego przeglądania;
2. **physical archive** — nadal wartościowe do badań, ale nieaktywne operacyjnie.

Każda seria musi najpierw naprawić aktywne linki i wyekstrahować unikalną trwałą wiedzę.
