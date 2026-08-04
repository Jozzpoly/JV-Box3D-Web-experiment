# JV Web — indeks dokumentów

Updated: 2026-08-04
Status: `CANONICAL INDEX`

## 1. Read first

Czytaj w tej kolejności:

1. `../AI_PROJECT_MEMORY.md`
2. `PROJECT_STATE.md`
3. `REFOUNDATION_LOOP_PL.md`
4. `DEMONSTRATOR_VALIDATION_POLISH_LOOP_PL.md`
5. właściwy ADR, kontrakt, runbook albo receipt

Nie czytaj całego `docs/` przed pracą. Archiwum służy do odpowiedzi na konkretne pytanie historyczne.

## 2. Aktywny stan i publiczna powierzchnia

| Dokument | Rola |
|---|---|
| `PROJECT_STATE.md` | bieżąca prawda o produkcie, dowodach i blockerach |
| `DEMONSTRATOR_VALIDATION_POLISH_LOOP_PL.md` | oddzielne source/package/mobile/parity/scene/Pages gates |
| `PUBLIC_COLLABORATION_HISTORY.md` | klasyfikacja wszystkich 13 PR-ów i pięciu milestone issues |
| `PUBLIC_ASSET_RIGHTS_POLICY.md` | default-deny prawa do modeli, skanów, fotografii, tekstur, fontów, audio i scen |
| `../README.md` | przyszła publiczna landing surface |
| `../SECURITY.md` | bezpieczne zgłaszanie podatności |
| `../CONTRIBUTING.md` | wkłady, physics boundary, dependencies i asset rules |
| `../THIRD_PARTY_NOTICES.md` | exact software dependencies; nie jest licencją JV ani assetów |

## 3. Decyzje

| Dokument | Status |
|---|---|
| `decisions/ADR-0001-subframe-rate-integration.md` | accepted |
| `decisions/ADR-0002-pinned-box3d-runtime.md` | accepted for `legacy_ts_m6` reference backend |
| `decisions/ADR-0003-native-jv-core-wasm.md` | accepted physics authority |
| `decisions/ADR-0004-pages-ready-demonstrator.md` | accepted source-public/package/Pages separation |
| `decisions/ADR-0005-project-license.md` | proposed; explicit Jozz decision required |

ADR-0003 ma pierwszeństwo nad rozwijaniem drugiej produktowej fizyki w TypeScripcie.

ADR-0004 ma pierwszeństwo nad jednym spłaszczonym `PUBLIC-READY`, automatycznym deploymentem i jednym wielkim HTML-em jako założonym formatem produktu.

ADR-0005 nie wybiera licencji. Nie dodawać `LICENSE` bez decyzji Jozza.

## 4. Kontrakty subsystemów

| Dokument | Rola |
|---|---|
| `contracts/STEERING_COMMAND_CONTRACT_PL.md` | `RELEASE | POSITION | RATE`, timestamped timeline i owner gate |
| `contracts/WHEEL_BACKEND_CONTRACT_PL.md` | WheelSpec, native contact seam i legacy baseline |
| `contracts/MOBILE_HOST_CONTRACT_PL.md` | Pointer Events, ownership, lifecycle i phone gates |
| `contracts/SCENE_PACKAGE_CONTRACT_PL.md` | units/axes, render/collision separation, manifest, rights i scan gates |
| `contracts/NATIVE_WASM_ABI_V0_PL.md` | C ABI, units, memory, stable IDs, snapshot i parity trace |

## 5. Aktywne badanie

| Dokument | Pytanie |
|---|---|
| `research/NATIVE_CORE_SOURCE_SET_AUDIT_2026_08_04_PL.md` | minimalny behavior-preserving native/WASM M6 source set |

```text
unchanged M5 + M6 geometry/runtime + Box3D + thin adapter
→ native/WASM baseline
→ dopiero structural refactor
```

## 6. Receipts

Kanoniczny indeks:

```text
receipts/INDEX.md
```

Kluczowe:

```text
receipts/runtime/REFERENCE_RUNTIME_BASELINE_2026_08_04.md
receipts/inventory/GITHUB_CLOUD_SURFACE_2026_08_04.md
receipts/inventory/GITHUB_ACTIONS_LOG_REVIEW_2026_08_04.md
```

Latest local demonstrator evidence remains:

```text
2f14d109980c...
109 tests: 108 PASS / 1 sanitizer FAIL
```

Nowszy head zawiera poprawkę i dalsze gates, ale czeka na świeże wykonanie.

## 7. Operacje — foundation/package

| Narzędzie | Rola |
|---|---|
| `../tools/run-demonstrator-foundation-gate.ps1` | exact-commit Node/test/compliance/portable gate; never publishes |
| `../tools/check-doc-links.mjs` | local Markdown link audit |
| `../tools/verify-third-party-notices.mjs` | installed versions/licenses and exact runtime notices |
| `../tools/write-portable-build-manifest.mjs` | clean-source manifest, fingerprinted ref and SHA-256 table |
| `../tools/validate-portable-build.mjs` | paths/assets/hash/authority/publication contract |
| `../tools/validate-portable-manifest-policy.mjs` | exact schema, no unknown/private fields |
| `../tools/validate-portable-network-policy.mjs` | no hidden remote HTML/CSS runtime resources |
| `../tools/validate-portable-http.mjs` | exact root/project-subpath loopback bytes |

`dist/` jest generowany i ignorowany. Build nie zawiera publish/deploy/Pages path.

## 8. Operacje — source-public audit

| Narzędzie | Rola |
|---|---|
| `../tools/run-demonstrator-audits.ps1` | one-command report-only public/license/review-ledger generation |
| `../tools/audit-public-readiness.mjs` | strict albo explicit `--report-only` CLI |
| `../tools/public-readiness-lib.mjs` | current/history Git object scanner |
| `../tools/public-readiness-identifiers.mjs` | ref/path/current-branch identifier scan |
| `../tools/public-readiness-report.mjs` | merge findings, public contracts, safe-file policy i final sanitizer |
| `../tools/public-contracts-lib.mjs` | exact nine-file public landing contract |
| `../tools/public-known-safe-files.mjs` | exact credential-free current `.npmrc` exception only |
| `../tools/audit-reachable-licenses.mjs` | strict/report-only license inventory CLI |
| `../tools/license-inventory-lib.mjs` | root project vs notice vs nested vendor licenses |
| `../tools/write-public-review-ledger.mjs` | generate ignored PENDING classification ledger |
| `../tools/validate-public-review-ledger.mjs` | reject pending/stale/remediate/private rationale |
| `../tools/public-review-ledger-lib.mjs` | stable sanitized finding identities and validation |

Lokalne, ignorowane evidence:

```text
.local-audit/public-readiness.json
.local-audit/license-inventory.json
.local-audit/public-review-classifications.json
```

## 9. Source-public release

Runbook:

```text
operations/SOURCE_PUBLIC_RELEASE_RUNBOOK_PL.md
```

Obejmuje:

- freeze exact candidate;
- foundation gate;
- local history/license reports;
- review classification;
- Jozz license decision;
- asset-rights audit;
- GitHub Actions/releases/packages/settings manual audit;
- exact `main` fast-forward proof;
- explicit owner approval receipt;
- manual visibility change;
- immediate anonymous/public clone verification;
- Pages pozostające disabled.

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

## 11. Reguła nowych dokumentów

Nowy plik powstaje tylko jako:

- ADR;
- trwały kontrakt;
- immutable receipt;
- focused research z jednym pytaniem/stop condition;
- kanoniczny state/process;
- public policy/runbook;
- indeksowane archiwum z unikalną historią.

Nie tworzyć broad session handoffów, jeżeli informację można skompresować do pamięci, state, ADR, contractu, runbooka albo receiptu.
