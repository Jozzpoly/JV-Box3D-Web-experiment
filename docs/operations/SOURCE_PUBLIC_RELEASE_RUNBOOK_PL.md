# JV Web — runbook upublicznienia źródła

Updated: 2026-08-04
Status: `ACTIVE RUNBOOK / NO VISIBILITY CHANGE AUTHORIZED`
Owner: Jozz

## 1. Cel i granica

Ten runbook prowadzi wyłącznie do:

```text
SOURCE_PUBLIC_READY_PASS
→ jawna zgoda Jozza
→ ręczna zmiana repozytorium z private na public
```

Nie włącza GitHub Pages i nie publikuje grywalnego demonstratora.

```text
source public ≠ package ready ≠ phone accepted ≠ Pages published
```

## 2. Obecny stan integracji

GitHub compare:

```text
base: main@5c64903d753f893adc42be90e0c3d8053a95a922
candidate: agent/jv-web-demonstrator-foundation
status: ahead
candidate ahead: 346 commits at measured checkpoint
candidate behind: 0
merge base: exact main head
```

Wniosek:

- `main` jest ścisłym przodkiem kandydata;
- nie ma rozbieżnych commitów na `main`;
- po ponownym pomiarze exact final candidate może zostać przeniesiony na `main` przez fast-forward;
- merge commit, squash i ręczne składanie stacked PR-ów nie są potrzebne;
- liczba commitów i exact head muszą zostać zmierzone ponownie tuż przed decyzją.

Nic nie jest teraz autoryzowane do przesunięcia `main`.

## 3. Globalne stop conditions

Nie zmieniaj visibility, gdy choć jedno jest prawdziwe:

```text
foundation gate nie jest zielony
public/history report ma blocker
review findings nie są sklasyfikowane
root project LICENSE nie został zatwierdzony
historyczna licencja PR #1 nie została sklasyfikowana
main nie jest przodkiem exact candidate
candidate working tree nie jest clean
GitHub cloud/settings audit jest nieukończony
README/SECURITY/CONTRIBUTING/state nie są na exact candidate
prywatny lub niezatwierdzony asset jest osiągalny
raw log/artifact/release/package może zawierać prywatne dane
owner nie zatwierdził exact 40-character commit
Pages lub publishing branch został włączony przedwcześnie
```

## 4. Faza A — zamrożenie kandydata

1. Ustal exact branch i 40-znakowy commit.
2. Potwierdź clean working tree.
3. `git fetch origin --prune`.
4. Potwierdź, że lokalny HEAD = `origin/agent/jv-web-demonstrator-foundation`.
5. Nie dodawaj nowych funkcji po rozpoczęciu finalnego auditu.
6. Każda naprawa tworzy nowy candidate i resetuje wyniki zależne od commita.

Receipt:

```text
candidate branch
candidate commit
commit date
Node/npm versions
receipt blob
working tree status
```

## 5. Faza B — source/package foundation gate

Uruchom:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-demonstrator-foundation-gate.ps1"
```

Wymagane:

```text
npm ci PASS
0 vulnerabilities w obserwowanym npm audit
Markdown links PASS
TypeScript PASS
all tests PASS
third-party verification PASS
Vite bundle PASS
portable static PASS
manifest privacy PASS
network policy PASS
loopback root/subpath HTTP PASS
working tree clean after gate
```

Foundation PASS nie nadaje source-public approval.

## 6. Faza C — lokalny Git/history/license audit

Uruchom report-only:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-demonstrator-audits.ps1"
```

Powstają ignorowane raporty:

```text
.local-audit/public-readiness.json
.local-audit/license-inventory.json
```

Sprawdź:

- `sourceCommit` = exact candidate;
- raport nie zawiera surowych sekretów ani prywatnych identyfikatorów;
- każdy blocker ma rozwiązanie, nie waiver;
- każdy review finding ma klasyfikację i uzasadnienie;
- duże/unscanned obiekty zostały ręcznie otwarte albo odrzucone;
- refy/tagi/commit metadata zostały objęte auditem;
- root project license i nested vendor licenses są rozdzielone.

Raportów nie commituj przed klasyfikacją i ponownym sprawdzeniem redakcji.

## 7. Faza D — decyzja licencyjna

Przeczytaj:

```text
docs/decisions/ADR-0005-project-license.md
```

Jozz zatwierdza:

```text
license strategy
exact copyright-holder text
exact year/range
asset exclusions
native-source exclusions
trademark/project-name statement
```

Następnie:

1. dodaj exact root `LICENSE` albo owner-approved rights notice;
2. uruchom foundation i license audit ponownie;
3. zapisz SHA-256 licencji;
4. sprawdź GitHub license detection po integracji na public/default branch;
5. nie utożsamiaj licencji kodu z assetami.

## 8. Faza E — public asset audit

Przeczytaj:

```text
docs/PUBLIC_ASSET_RIGHTS_POLICY.md
```

Sprawdź obecne i historyczne:

- modele;
- tekstury;
- zdjęcia/video;
- skany;
- fonty;
- audio;
- logo/liveries;
- lokalne URL/path metadata;
- EXIF/GPS/personal data;
- third-party redistribution rights.

Lokalna praca prywatna trafia wyłącznie do:

```text
.local-assets/
.local-scans/
.private-work/
```

Te katalogi są ignorowane, ale nadal nie mogą być inputem publicznego buildu przez implicit directory scan.

## 9. Faza F — GitHub collaboration audit

Kanoniczna mapa:

```text
docs/PUBLIC_COLLABORATION_HISTORY.md
```

Wymagane:

- wszystkie 13 PR bodies/comments przejrzane;
- issues #3/#5/#7/#10/#12 przejrzane;
- PR #1 i #8 wyraźnie quarantined;
- PR #15 ma prominentne erratum;
- current authority wskazuje #17/#18;
- Jozz wybiera politykę open/close dla superseded drafts;
- żaden PR nie jest scalany tylko dla estetyki historii.

## 10. Faza G — GitHub Actions/cloud audit

Receipt:

```text
docs/receipts/inventory/GITHUB_CLOUD_SURFACE_2026_08_04.md
```

Sprawdź przez API i ręcznie w UI:

### Actions

- wszystkie workflow runs;
- raw logs;
- artifacts i ich expiry;
- Actions caches;
- repository/org variables;
- repository/org secrets;
- environments i protection rules;
- czy aktywna gałąź zawiera jakikolwiek custom workflow;
- czy historyczny write-capable workflow nie jest aktywną instrukcją.

### Releases

- draft/published releases;
- attached assets;
- source archives;
- release notes;
- prywatne nazwy, ścieżki i screenshoty.

### Packages

- npm/container/other packages;
- visibility;
- provenance;
- linked repositories;
- stale/private package versions.

### Security/settings

- deploy keys;
- webhooks;
- GitHub Apps;
- collaborators;
- branch rulesets/protection;
- private vulnerability reporting;
- Dependabot alerts/updates;
- code scanning/secret scanning settings;
- issue/discussion/wiki settings;
- Pages remains disabled.

Nie kopiuj wartości secretów do receiptów. Zapisuj tylko nazwę powierzchni, stan i owner verdict.

## 11. Faza H — public landing surface

Exact candidate musi zawierać:

```text
README.md
LICENSE or owner-approved rights notice
THIRD_PARTY_NOTICES.md
SECURITY.md
CONTRIBUTING.md
AI_PROJECT_MEMORY.md
docs/PROJECT_STATE.md
docs/PUBLIC_COLLABORATION_HISTORY.md
docs/PUBLIC_ASSET_RIGHTS_POLICY.md
```

README musi jawnie mówić:

- repo/source status;
- Pages disabled;
- mobile/scan not finished;
- `legacy_ts_m6` non-authoritative;
- native parity not proven;
- current license and asset exclusions;
- where to report security issues;
- where historical PRs are classified.

## 12. Faza I — finalny default-branch proof

Powtórz porównanie:

```text
main..exact-candidate
```

Wymagane:

```text
candidate behind_by = 0
merge base = exact current main
main has no owner work not present in candidate
candidate HEAD = validated/audited/approved commit
```

Preferred integration:

```text
fast-forward main to exact candidate
```

Forbidden without a new review:

```text
force update
squash of receipts/history
merge commit changing tree identity
manual cherry-pick set
changing default branch to an unvalidated experimental ref
```

## 13. Faza J — owner approval receipt

Przed jakąkolwiek zmianą Jozz otrzymuje jeden finalny raport:

```text
candidate commit
foundation result/test count
public/history blockers = 0
review findings and classifications
license identity/hash
asset-rights result
cloud/settings checklist result
main fast-forward proof
open PR policy
known public limitations
```

Jozz odpowiada jawnie, że zatwierdza:

1. exact candidate commit;
2. exact LICENSE bytes;
3. fast-forward `main`;
4. wybraną politykę historycznych PR-ów;
5. zmianę visibility na public;
6. pozostawienie Pages disabled.

Brak odpowiedzi lub ogólne „wygląda dobrze” nie jest approval exact candidate.

## 14. Faza K — integracja i visibility

Dopiero po zgodzie:

1. fast-forward `main` do exact candidate;
2. potwierdź remote `main` SHA;
3. potwierdź default branch = `main`;
4. wykonaj finalny public landing diff/read;
5. ręcznie zmień visibility private → public;
6. nie włączaj Pages;
7. natychmiast otwórz repo w niezalogowanym/private-browser kontekście;
8. sprawdź README, LICENSE detection, Security policy, PR/issues i brak prywatnych assetów;
9. zapisz `SOURCE_PUBLIC_RELEASE_RECEIPT`.

## 15. Immediate post-public checks

- clone public URL into a new empty directory;
- run the clean foundation gate from that clone;
- inspect visible branches/tags/PRs/issues;
- test private vulnerability reporting after enabling it;
- verify repository search does not expose forbidden identifiers;
- confirm Releases/Packages/Actions surfaces;
- verify Pages remains disabled;
- rotate/revoke any secret discovered after visibility immediately;
- revert visibility if a critical exposure is found and continue incident cleanup.

## 16. Pages remains separate

After source publication the project still requires:

```text
DEMONSTRATOR_PACKAGE_READY_PASS
mobile pointer/lifecycle PASS
LAN phone PASS
owner mobile acceptance
release-only publishing branch PASS
PAGES_PUBLISH_READY_PASS
```

Only then may Jozz enable Pages manually.
