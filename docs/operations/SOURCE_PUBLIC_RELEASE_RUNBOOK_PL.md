# JV Web — runbook upublicznienia źródła

Updated: 2026-08-04
Status: `ACTIVE RUNBOOK / NO VISIBILITY CHANGE AUTHORIZED`
Owner: Jozz

## 1. Cel i granica

Ten runbook prowadzi wyłącznie do:

```text
SOURCE_PUBLIC_READY_PASS
→ jawna zgoda Jozza
→ ręczna zmiana repozytorium private → public
```

Nie włącza GitHub Pages i nie publikuje grywalnego demonstratora.

```text
source public ≠ package ready ≠ phone accepted ≠ Pages published
```

## 2. Obecny stan integracji

Zmierzony checkpoint:

```text
base: main@5c64903d753f893adc42be90e0c3d8053a95a922
candidate: agent/jv-web-demonstrator-foundation
candidate ahead: 346 commits at the measured checkpoint
candidate behind: 0
merge base: exact main head
```

Wniosek:

- `main` był ścisłym przodkiem kandydata;
- nie było rozbieżnej pracy na `main`;
- po ponownym pomiarze exact final candidate może zostać przeniesiony na `main` przez fast-forward;
- merge commit, squash i ręczne składanie stacked PR-ów nie są potrzebne;
- exact head i ahead/behind muszą zostać zmierzone ponownie przed decyzją.

Nic nie jest teraz autoryzowane do przesunięcia `main`.

## 3. Publiczna powierzchnia refów

Zaobserwowano szesnaście zdalnych branchy:

```text
13 PR-backed branches
main
agent/f3-regression-snapshot-2026-08-03
agent/terrain-scan-integration
```

Dwa orphan refs są obecnie twardymi blockerami:

### F3 regression snapshot

```text
tip: d583d3f573300335446b1b1f99fdd8ce29d2e7df
self-modifying/write-capable workflow era
no PR
```

### Terrain scan integration

```text
tip: 9c4172fead575a85d4d47466a4b5194cc5612c57
136-commit separate terrain/asset line
local model/session bridge
custom workflow
no PR
```

Authority:

```text
docs/receipts/inventory/GITHUB_BRANCH_SURFACE_2026_08_04.md
```

Public-ref policy:

- 13 PR-backed branches i `origin/main` mają jawne klasyfikacje;
- oba orphan refs dają blocker;
- każdy nowy/nieznany remote branch daje blocker i jest redagowany w raporcie;
- każdy tag daje blocker, dopóki nie istnieje jawna release/tag policy;
- `origin/main` i exact remote candidate muszą istnieć;
- local HEAD musi równać się `origin/agent/jv-web-demonstrator-foundation`.

## 4. Globalne stop conditions

Nie zmieniaj visibility, gdy choć jedno jest prawdziwe:

```text
foundation gate nie jest zielony
public/history report ma blocker
review findings nie są sklasyfikowane
root project LICENSE nie został zatwierdzony
historyczna licencja PR #1 nie została sklasyfikowana
orphan public refs nadal istnieją bez zaakceptowanej polityki
private recovery bundle orphan refs nie istnieje albo nie jest zweryfikowany
nieznany remote branch albo tag istnieje
local HEAD różni się od origin candidate
main nie jest przodkiem exact candidate
candidate working tree nie jest clean
GitHub cloud/settings audit jest nieukończony
README/SECURITY/CONTRIBUTING/state nie są na exact candidate
prywatny lub niezatwierdzony asset jest osiągalny
raw log/artifact/release/package może zawierać prywatne dane
owner nie zatwierdził exact 40-character commit
Pages lub publishing branch został włączony przedwcześnie
```

## 5. Faza A — zamrożenie kandydata

1. Ustal exact branch i 40-znakowy commit.
2. Potwierdź clean working tree.
3. Wykonaj jawnie:

```powershell
git fetch origin --prune
```

4. Potwierdź local HEAD = `origin/agent/jv-web-demonstrator-foundation`.
5. Nie dodawaj funkcji po rozpoczęciu finalnego auditu.
6. Każda naprawa tworzy nowy candidate i resetuje wyniki zależne od commita.

Receipt:

```text
candidate branch
candidate commit
remote candidate commit
commit date
Node/npm versions
receipt blob
working tree status
```

## 6. Faza B — foundation/package gate

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
manifest source commit = exact candidate
publication fields remain false
working tree clean after gate
branch/HEAD unchanged
```

Foundation PASS nie nadaje source-public approval.

## 7. Faza C — lokalny Git/history/license/ref audit

Po świeżym `git fetch origin --prune` uruchom:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-demonstrator-audits.ps1"
```

Powstają ignorowane evidence:

```text
.local-audit/public-readiness.json
.local-audit/license-inventory.json
.local-audit/public-review-classifications.json
.local-audit/source-public-integration.json
```

Sprawdź:

- każdy `sourceCommit` = exact candidate;
- local HEAD = remote candidate;
- `origin/main` i candidate relation są aktualne;
- public contracts count;
- blocked orphan/unknown/tag counts;
- raport nie zawiera surowych sekretów ani prywatnych identyfikatorów;
- każdy blocker ma rozwiązanie, nie waiver;
- każdy review finding ma klasyfikację i uzasadnienie;
- duże/unscanned obiekty zostały ręcznie otwarte albo odrzucone;
- root project license i nested vendor licenses są rozdzielone.

Raportów nie commituj przed klasyfikacją i ponownym sprawdzeniem redakcji.

## 8. Faza D — review-classification ledger

Template zaczyna każdy finding jako:

```text
PENDING
```

Dopuszczalne końcowe stany:

```text
ACCEPTED
  rationale >= 20 chars
  reviewedBy
  UTC reviewedAtUtc

REMEDIATE
  blokuje visibility do czasu naprawy i nowego raportu
```

Uruchomienie walidatora:

```powershell
npm run audit:public:review-check
```

Fail przy:

- PENDING;
- REMEDIATE;
- brakującym/starym/duplikowanym finding ID;
- innym source commit;
- zmodyfikowanym embedded finding;
- rationale zawierającym token, prywatny e-mail lub lokalną ścieżkę.

## 9. Faza E — decyzja licencyjna

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
2. uruchom foundation i wszystkie audyty ponownie;
3. zapisz SHA-256 licencji;
4. potwierdź, że root project license jest rozpoznany oddzielnie od notices/vendor licenses;
5. sprawdź GitHub license detection po integracji na default branch;
6. nie utożsamiaj licencji kodu z assetami.

## 10. Faza F — prywatne archiwum orphan refs

Dopiero po zielonym foundation gate i świeżym fetchu uruchom świadomie:

```powershell
npm run archive:orphan-refs
```

Powstają wyłącznie w ignorowanym `.local-audit/`:

```text
jv-web-orphan-public-refs-2026-08-04.bundle
orphan-public-refs-archive.json
```

Wymagane:

- clean tree;
- output już ignorowany przez Git;
- exact oba remote-tracking refs;
- brak nadpisania istniejącego bundla;
- `git bundle verify` PASS;
- exact list-heads dla obu refów;
- source refs niezmienione;
- bytes i SHA-256 zapisane;
- `remoteRefsDeleted=false`.

Następnie Jozz powinien zweryfikować recoverability w osobnym pustym katalogu lub prywatnym archive repo.

Narzędzie **nie usuwa** remote refów.

## 11. Faza G — decyzja o orphan refs

Opcje:

```text
A. zachować publicznie
   → wymaga oddzielnego full-history/workflow/license/asset/privacy acceptance

B. przenieść do osobnego prywatnego archive repo
   → preferowane dla terrain line

C. zachować zweryfikowany prywatny bundle i usunąć dwa remote refs
   → preferowane minimalne public-surface rozwiązanie
```

Żadna opcja nie jest wykonywana automatycznie.

Po jawnej decyzji Jozza i ewentualnym usunięciu wyłącznie tych refów:

```powershell
git fetch origin --prune
```

Następnie powtórz:

- public/history/ref audit;
- review ledger;
- license inventory;
- integration proof.

Expected ref result przed SOURCE-PUBLIC PASS:

```text
blockedOrphanBranches = 0
unknownRemoteBranches = 0
unclassifiedTags = 0
HEAD = origin candidate
```

## 12. Faza H — public asset audit

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

Prywatna praca trafia do:

```text
.local-assets/
.local-scans/
.private-work/
```

Katalogi są ignorowane, ale nie mogą być implicit build inputem.

Terrain orphan ref wymaga osobnego 136-commit asset/rights verdictu tylko wtedy, gdy ma pozostać publiczny.

## 13. Faza I — GitHub collaboration audit

Authority:

```text
docs/PUBLIC_COLLABORATION_HISTORY.md
docs/receipts/inventory/GITHUB_BRANCH_SURFACE_2026_08_04.md
```

Wymagane:

- wszystkie 13 PR bodies/comments przejrzane;
- issues #3/#5/#7/#10/#12 przejrzane;
- PR #1/#8 quarantined;
- PR #15 ma prominentne erratum;
- current authority wskazuje #17/#18;
- wszystkie 16 zaobserwowanych branchy mają disposition;
- Jozz wybiera politykę open/close dla superseded drafts;
- żaden PR nie jest scalany dla estetyki historii.

## 14. Faza J — GitHub Actions/cloud/settings audit

Receipts:

```text
docs/receipts/inventory/GITHUB_CLOUD_SURFACE_2026_08_04.md
docs/receipts/inventory/GITHUB_ACTIONS_LOG_REVIEW_2026_08_04.md
```

Sprawdź API i ręcznie w UI:

### Actions

- wszystkie workflow runs;
- F2 manual-dispatch raw log;
- artifacts i expiry;
- Actions caches;
- repository/org variables i secrets bez kopiowania wartości;
- environments/protection;
- aktywne custom workflows;
- historyczne write-capable workflows nie są aktywną instrukcją.

### Releases

- draft/published releases;
- attached assets;
- source archives;
- release notes;
- prywatne nazwy/ścieżki/screenshoty.

### Packages

- npm/container/other packages;
- visibility;
- provenance;
- linked repositories;
- stale/private versions.

### Security/settings

- deploy keys;
- webhooks;
- GitHub Apps;
- collaborators;
- branch rulesets/protection;
- private vulnerability reporting;
- Dependabot alerts/updates;
- code/secret scanning settings;
- issue/discussion/wiki settings;
- Pages pozostaje disabled.

Zapisuj tylko powierzchnię, stan i owner verdict — nigdy wartość secretu.

## 15. Faza K — public landing surface

Exact candidate musi zawierać dziewięć publicznych kontraktów:

```text
README.md
LICENSE
THIRD_PARTY_NOTICES.md
SECURITY.md
CONTRIBUTING.md
docs/PROJECT_STATE.md
docs/PUBLIC_COLLABORATION_HISTORY.md
docs/PUBLIC_ASSET_RIGHTS_POLICY.md
docs/operations/SOURCE_PUBLIC_RELEASE_RUNBOOK_PL.md
```

README jawnie opisuje:

- repo/source status;
- Pages disabled;
- mobile/scan unfinished;
- `legacy_ts_m6` non-authoritative;
- native parity not proven;
- current license i asset exclusions;
- security reporting;
- history/ref classification.

## 16. Faza L — finalny default-branch proof

Wymagane:

```text
origin/main exact commit
candidate exact commit
candidate behind = 0
merge base = exact current origin/main
main has no owner work absent from candidate
candidate HEAD = validated/audited/approved remote candidate
working tree clean
```

Preferred integration:

```text
fast-forward main to exact candidate
```

Forbidden bez nowego review:

```text
force update
squash receipts/history
merge commit changing tree identity
manual cherry-pick set
changing default branch to an experimental ref
```

## 17. Faza M — owner approval receipt

Finalny raport zawiera:

```text
candidate commit
foundation result/test count
public/history/ref blockers = 0
review findings/classifications
license identity/hash
asset-rights result
cloud/settings checklist
orphan bundle identity/hash and ref disposition
main fast-forward proof
historical PR policy
known public limitations
```

Jozz zatwierdza jawnie:

1. exact candidate commit;
2. exact LICENSE bytes;
3. orphan-ref disposition;
4. fast-forward `main`;
5. politykę historycznych PR-ów;
6. visibility private → public;
7. Pages pozostające disabled.

Ogólne „wygląda dobrze” nie jest approval exact candidate.

## 18. Faza N — integracja i visibility

Dopiero po zgodzie:

1. wykonaj zatwierdzone ref cleanup/archive actions;
2. fetch/prune i finalne audyty;
3. fast-forward `main` do exact candidate;
4. potwierdź remote `main` SHA i default branch;
5. finalny public landing diff/read;
6. ręcznie zmień visibility private → public;
7. nie włączaj Pages;
8. otwórz repo w niezalogowanym/private-browser kontekście;
9. sprawdź README, LICENSE detection, Security, branches/tags/PR/issues i brak prywatnych assetów;
10. zapisz `SOURCE_PUBLIC_RELEASE_RECEIPT`.

## 19. Immediate post-public checks

- clone public URL do nowego pustego katalogu;
- run clean foundation gate;
- inspect visible branches/tags/PRs/issues;
- enable/test private vulnerability reporting;
- verify repository search for forbidden identifiers;
- confirm Releases/Packages/Actions surfaces;
- verify Pages disabled;
- revoke/rotate any newly discovered secret immediately;
- revert visibility if critical exposure is found.

## 20. Pages pozostaje osobne

Po source publication nadal wymagane:

```text
DEMONSTRATOR_PACKAGE_READY_PASS
mobile pointer/lifecycle PASS
LAN phone PASS
owner mobile acceptance
release-only publishing branch PASS
PAGES_PUBLISH_READY_PASS
```

Dopiero wtedy Jozz może manualnie włączyć Pages.
