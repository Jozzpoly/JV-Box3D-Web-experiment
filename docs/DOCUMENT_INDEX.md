# JV Web — indeks dokumentów

Updated: 2026-08-04
Status: `CANONICAL INDEX`

## 1. Read first

Czytaj tylko w tej kolejności:

1. `../AI_PROJECT_MEMORY.md`
2. `PROJECT_STATE.md`
3. `REFOUNDATION_LOOP_PL.md`
4. `DEMONSTRATOR_VALIDATION_POLISH_LOOP_PL.md`
5. właściwy ADR, kontrakt subsystemu albo receipt

Nie czytaj całego `docs/` przed pracą. Archiwum służy do odpowiedzi na konkretne pytanie historyczne.

## 2. Aktywny stan i proces

| Dokument | Rola |
|---|---|
| `PROJECT_STATE.md` | bieżąca prawda o produkcie, dowodach i otwartych problemach |
| `REFOUNDATION_LOOP_PL.md` | rekurencyjna pętla małych, falsyfikowalnych iteracji |
| `DEMONSTRATOR_VALIDATION_POLISH_LOOP_PL.md` | drabina dowodów, stop conditions, mobile/scan/Pages gates i kolejność polishu |
| `DOCUMENT_CLEANUP_MANIFEST_2026_08_04_PL.md` | wykonany zakres cleanupu, ryzyka i pozostałe bramki |
| `NO_ARTIFICIAL_MECHANICS_CONTRACT_PL.md` | konstytucja jednej fizyki, jawnych eksperymentów i assistów |
| `../THIRD_PARTY_NOTICES.md` | exact zależności runtime/tooling; nie jest licencją kodu ani assetów JV |

## 3. Decyzje

| Dokument | Status |
|---|---|
| `decisions/ADR-0001-subframe-rate-integration.md` | accepted |
| `decisions/ADR-0002-pinned-box3d-runtime.md` | accepted for `legacy_ts_m6` reference backend |
| `decisions/ADR-0003-native-jv-core-wasm.md` | accepted physics architecture authority |
| `decisions/ADR-0004-pages-ready-demonstrator.md` | accepted distribution/publication authority |

ADR-0003 ma pierwszeństwo nad dawnym ręcznym portowaniem mechaniki M6/M7 do TypeScriptu.

ADR-0004 ma pierwszeństwo nad pojedynczym-HTML jako formatem produktu, automatycznym deploymentem i publikacją bez public-readiness gate.

## 4. Kontrakty subsystemów

| Dokument | Rola |
|---|---|
| `contracts/STEERING_COMMAND_CONTRACT_PL.md` | `RELEASE | POSITION | RATE`, timestamped timeline, K2b i owner gate |
| `contracts/WHEEL_BACKEND_CONTRACT_PL.md` | WheelSpec, native contact seam, observer, legacy baseline i Wheel Scope transfer gates |
| `contracts/MOBILE_HOST_CONTRACT_PL.md` | jeden physics profile, multi-touch ownership, render profile i mobile gates |
| `contracts/NATIVE_WASM_ABI_V0_PL.md` | versioned C ABI, jednostki, pamięć, stable part IDs, snapshot i parity trace |

## 5. Aktywne badanie

| Dokument | Pytanie |
|---|---|
| `research/NATIVE_CORE_SOURCE_SET_AUDIT_2026_08_04_PL.md` | najmniejszy behavior-preserving M6 source set dla native/WASM spike |

Wniosek:

```text
niezmienione M5 + M6 geometry + M6 runtime + Box3D
+ cienki adapter
→ native/WASM baseline
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

Najświeższy pełny zielony reference runtime:

```text
receipts/runtime/REFERENCE_RUNTIME_BASELINE_2026_08_04.md
```

Pierwszy demonstrator gate jest zapisany jako użyteczna falsyfikacja na PR #18: `81/81` i bundle PASS, portable FAIL dla root-absolute receipt URL. Nowszy head czeka na ponowny gate.

## 7. Operacje — zwykła walidacja

| Dokument/narzędzie | Rola |
|---|---|
| `operations/REFOUNDATION_LOCAL_GATE_PL.md` | znaczenie historycznego refoundation gate |
| `../tools/run-refoundation-gate.ps1` | Windows gate zielonego checkpointu refoundation |
| `../tools/run-demonstrator-foundation-gate.ps1` | bieżący Node/test/portable gate bez publikacji |
| `../tools/check-doc-links.mjs` | lokalny audit linków Markdown |
| `../tools/verify-third-party-notices.mjs` | exact installed versions/licenses kontra notice |

## 8. Operacje — portable artifact

| Narzędzie | Rola |
|---|---|
| `../tools/write-portable-build-manifest.mjs` | clean-source manifest, exact commit, fingerprint refu i SHA-256 payloadu |
| `../tools/validate-portable-build.mjs` | statyczne ścieżki, assets, compliance, authority i integralność |
| `../tools/validate-portable-manifest-policy.mjs` | zakaz ujawniania nazwy źródłowego brancha |
| `../tools/validate-portable-http.mjs` | loopback HTTP root/project-subpath i exact bytes |
| `../tools/portable-build-lib.mjs` | wspólny statyczny validator |
| `../tools/portable-http-smoke-lib.mjs` | niepublikujący loopback server/smoke |

`dist/` jest generowany i ignorowany. Build nie ma funkcji publikowania.

## 9. Operacje — public readiness i licencje

| Narzędzie | Rola |
|---|---|
| `../tools/audit-public-readiness.mjs` | bezpieczny CLI zapisujący lokalny raport |
| `../tools/public-readiness-lib.mjs` | current/history Git object scanner |
| `../tools/public-readiness-identifiers.mjs` | path/branch identifier findings z redakcją |
| `../tools/public-readiness-report.mjs` | końcowa rekurencyjna sanitizacja całego raportu |
| `../tools/audit-reachable-licenses.mjs` | reachable `LICENSE/LICENCE/COPYING/NOTICE` inventory |
| `../tools/license-inventory-lib.mjs` | exact blob/hash/license classification |

Lokalne, ignorowane raporty:

```text
.local-audit/public-readiness.json
.local-audit/license-inventory.json
```

Nie zastępują manualnego auditu PR-ów, issues, Actions logs/artifacts, releases i packages.

## 10. Archiwum

Broad audits, dawne roadmapy, handoffy, kwarantanny i zakończone runbooki nie są bieżącą instrukcją.

Indeksy:

```text
archive/REMOVED_FROM_ACTIVE_TREE_2026_08_04.md
archive/STEERING_RESEARCH_2026_08_03_INDEX.md
archive/WHEEL_RESEARCH_2026_08_03_INDEX.md
archive/MOBILE_HOST_AUDIT_2026_08_03_INDEX.md
archive/QUARANTINE_AND_F1_OPERATIONS_2026_08_03_INDEX.md
```

## 11. Statusy dokumentów

```text
CANONICAL_CURRENT
CONTRACT_DECISION
RECEIPT_EVIDENCE
ACTIVE_RESEARCH
ARCHIVE_EVIDENCE
DELETE_CANDIDATE
```

## 12. Reguła nowych dokumentów

Nowy plik powstaje tylko jako:

- ADR;
- trwały kontrakt subsystemu;
- surowy receipt;
- focused research z jednym pytaniem i stop condition;
- kanoniczny state/process;
- indeksowane archiwum z unikalną historią.

Nie tworzyć kolejnych broad audits ani session handoffów, jeżeli informację można skompresować do `AI_PROJECT_MEMORY.md`, `PROJECT_STATE.md`, istniejącego ADR/contractu albo receiptu.