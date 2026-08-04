# JV Web — kanoniczny stan projektu

Updated: 2026-08-04
Status: `CANONICAL CURRENT STATE`
Owner: Jozz

## 1. Cel

JV Web ma stać się poważnym demonstratorem Jozz Vehicle:

- uruchamianym na desktopie i telefonie;
- posiadającym przemyślane sterowanie mobilne;
- docelowo pozwalającym jeździć po przygotowanym skanie;
- łatwym do udostępnienia przez GitHub Pages;
- niewymagającym własnego serwera ani własnego cloud CI;
- uczciwie odróżniającym reference fixture, native parity i owner acceptance.

Upublicznienie źródła i publikacja gry przez Pages są oddzielnymi decyzjami i bramkami.

## 2. Aktywna linia

```text
base:   agent/jv-web-refoundation@f06853467408d6c633ca806d985062c634b3a666
active: agent/jv-web-demonstrator-foundation
PR:     #18 draft / do not merge / do not publish
```

Dokument nie zapisuje szybko starzejącego się bieżącego HEAD. Ustal go przez:

```text
git rev-parse HEAD
```

Niczego nie scalać, nie oznaczać Ready, nie zmieniać `main`, visibility ani Pages bez jawnej decyzji Jozza.

## 3. Granica dowodów

Zielona baza refoundation:

```text
f06853467408d6c633ca806d985062c634b3a666
Node 24.16.0
npm 11.17.0
77/77 tests PASS
TypeScript PASS
Vite build PASS
```

Pierwszy demonstrator gate:

```text
67067c5d46fc9ed45481a731efae4b3adf8d4ad8
81/81 tests PASS
TypeScript PASS
Vite bundle PASS
portable validation FAIL
```

Prawidłowo wykryty problem:

```text
/receipts/jv_m6_factory_receipt.json
```

Naprawiono na:

```text
./receipts/jv_m6_factory_receipt.json
```

i przypięto test regresyjny.

Najnowszy lokalnie wykonany foundation gate:

```text
2f14d109980c99b844d80b80a080327e1fb4d900
Node 24.16.0
npm 11.17.0
receipt byte-exact
npm ci PASS
0 vulnerabilities
Markdown links PASS
TypeScript PASS
109 tests: 108 PASS / 1 FAIL
```

Jedyny FAIL:

```text
public readiness report redacts privacy identifiers inside blocker paths
```

Skaner wykrył e-mail w sensitive path, ale finalny raport pozostawił jedną kopię wartości. Gate zatrzymał się przed bundle/package validation. Żaden test fizyki ani browser runtime nie zawiódł.

Minimalna poprawka finalnego sanitizatora oraz wiele dalszych public-readiness wzmocnień są obecne na nowszym headzie, ale **nie zostały jeszcze lokalnie wykonane**. Nie podawać nowej liczby testów ani PASS przed świeżym Node 24 gate.

## 4. Architektura produktu

```text
native JV Core + Box3D WASM -> product physics authority
TypeScript host             -> input, lifecycle, render, UI, mobile, scenes
portable static package     -> localhost, LAN, future Pages
```

Authority:

```text
docs/decisions/ADR-0003-native-jv-core-wasm.md
docs/decisions/ADR-0004-pages-ready-demonstrator.md
```

Reference backend:

```text
id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
acceptsNewProductPhysics: false
```

Krytyczna rozbieżność:

```text
native maxDriveSpeed = 40 rad/s wheel rev limit
legacy TS             = 40 m/s linear target interpreted through radius
```

Nie dodawać do legacy TS nowych mechanizmów drivetrainu, steeringu, zawieszenia, aero, contact ani przyszłej opony.

## 5. Trzy oddzielne bramki

### SOURCE-PUBLIC-READY

Odpowiada wyłącznie, czy repo, source, historia i powierzchnia GitHuba mogą stać się publiczne.

Wymaga:

- intended clean default branch;
- jawnego root project `LICENSE` albo owner-approved rights strategy;
- exact `THIRD_PARTY_NOTICES.md`;
- current/dirty/history/ref/path scan;
- reachable-license inventory;
- sklasyfikowanych wszystkich review findings;
- GitHub PR/issues/reviews/logs/artifacts/releases/packages/settings audit;
- public README, SECURITY, CONTRIBUTING, state/history/asset policy/runbook;
- asset/source rights classification;
- owner approval exact candidate.

### DEMONSTRATOR-PACKAGE-READY

Wymaga:

- foundation gate PASS;
- portable static/privacy/network/compliance PASS;
- loopback root/subpath HTTP PASS;
- desktop browser package smoke;
- exact artifact receipt.

### PAGES-PUBLISH-READY

Wymaga:

- public source repo;
- package ready;
- real mobile pointer/lifecycle/performance PASS;
- owner mobile acceptance;
- release-only publishing branch;
- rollback/unpublish plan;
- owner approval exact package.

Telefon nie blokuje uczciwego upublicznienia niedokończonego źródła, ale blokuje publikację gry jako gotowego mobilnego demonstratora.

## 6. Portable artifact

```text
index.html
assets/
receipts/
THIRD_PARTY_NOTICES.md
build-manifest.json
.nojekyll
```

Generator wymaga clean source i zapisuje:

- exact 40-character commit;
- fingerprinted source ref, bez branch name;
- backend identity;
- runtime/compliance files;
- bytes i SHA-256 każdego payload file;
- publication state pozostający false/dormant.

Bramki odrzucają:

- root-absolute/escaping/missing paths;
- nested CSS failures;
- hidden remote HTML/CSS resources;
- source maps, symlinki i unexpected output;
- payload/hash drift;
- raw branch/private metadata;
- unknown manifest fields;
- brak receipt/notice;
- self-granted native parity/product authority/public/Pages approval.

Loopback HTTP smoke pobiera exact entrypoint i każdy payload spod:

```text
/
/JV-Box3D-Web-experiment/
```

Foundation runner przypina branch i exact commit od początku do końca, sprawdza clean tree po buildzie i potwierdza source commit w manifeście. Build nie publikuje.

## 7. Public-history audit

Warstwy:

- current index i dirty/untracked state;
- all-reachable Git blobs;
- commit i annotated-tag metadata;
- heads/remotes/tags;
- current/historical path identifiers;
- sensitive filenames i token/key patterns;
- symlinki bez podążania poza repo;
- gitlink blocker;
- duże/unscanned blobs;
- finalna rekurencyjna sanitizacja całego raportu.

Raport nie powinien przechowywać wartości sekretu, prywatnego e-maila ani lokalnej ścieżki. Refy i sensitive identifiers są fingerprintowane.

Exact bezpieczny `.npmrc` może zostać zaakceptowany wyłącznie jako current blob z treścią:

```text
engine-strict=true
save-exact=true
```

Jakikolwiek content drift lub historyczny `.npmrc` pozostaje blockerem.

## 8. Wymagana publiczna powierzchnia

Audit wymaga dziewięciu śledzonych kontraktów:

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

Obecnych jest osiem. Brakuje wyłącznie root `LICENSE`, świadomie oczekującego na decyzję Jozza.

## 9. Review-classification ledger

`audit:public:report` może mieć zero blockerów i nadal posiadać review findings. Dlatego powstaje ignorowany lokalny ledger:

```text
.local-audit/public-review-classifications.json
```

Każdy exact finding otrzymuje:

```text
PENDING
ACCEPTED + rationale + reviewedBy + UTC timestamp
REMEDIATE
```

Finalna klasyfikacja odrzuca:

- missing/stale/duplicate finding IDs;
- PENDING;
- REMEDIATE;
- krótkie rationale;
- rationale zawierające token, prywatny e-mail lub lokalną ścieżkę;
- ledger przypięty do innego source commit.

Przeniesiona klasyfikacja identycznego finding ID daje warning i wymaga ponownego potwierdzenia semantyki.

## 10. Licencje

`THIRD_PARTY_NOTICES.md` obejmuje exact:

```text
box3d.js@0.0.2 / MIT
embedded Box3D 8441b4a... / MIT
Vite 8.1.5 / MIT
TypeScript 7.0.2 / Apache-2.0
```

Verifier sprawdza installed versions/licenses, exact hash runtime license oraz pełne teksty MIT wrappera i osadzonego Box3D. Notice trafia do `dist/` i file-table SHA-256.

Reachable inventory rozdziela:

```text
root LICENSE/COPYING       -> PROJECT_LICENSE
THIRD_PARTY_NOTICES        -> THIRD_PARTY_NOTICE
vendor/.../LICENSE         -> THIRD_PARTY_LICENSE
```

Nested vendor license nigdy nie spełnia project-license requirement.

Historyczny fakt:

```text
PR #1 / agent/bootstrap-web-poc
MIT License
Copyright (c) 2026 Jozz Vehicle contributors
```

Decyzja przygotowana w:

```text
docs/decisions/ADR-0005-project-license.md
```

Preliminary recommendation to MIT, ale żadna licencja nie została wybrana ani dodana. Jozz musi zatwierdzić strategię, exact holder text i rok.

## 11. GitHub collaboration surface

Kanoniczna mapa:

```text
docs/PUBLIC_COLLABORATION_HISTORY.md
```

Zaobserwowano:

```text
13 PR records
12 open drafts
1 closed quarantine (#8)
0 merged
issues #3, #5, #7, #10, #12
```

Bodies i dostępne top-level comments wszystkich 13 PR-ów oraz komentarze pięciu issues zostały przejrzane. Nie zaobserwowano credentiali, Jozz-local path ani private owner e-mail.

- PR #1 i #8 pozostają quarantined;
- PR #15 ma prominentne drive-unit erratum;
- #17 jest architecture authority;
- #18 jest aktywnym demonstrator/source-public candidate;
- polityka pozostawienia/zamykania superseded drafts wymaga decyzji Jozza, ale nie jest security blockerem.

## 12. GitHub Actions/cloud surface

Receipts:

```text
docs/receipts/inventory/GITHUB_CLOUD_SURFACE_2026_08_04.md
docs/receipts/inventory/GITHUB_ACTIONS_LOG_REVIEW_2026_08_04.md
```

Artifact `8856776966` został pobrany i byte-reviewed:

```text
ZIP SHA-256: 1e6d198dcdb9b9bde45cd6a5142b28d47c7ff96473c99e74880aee5c5918f884
size: 7,872,623 B
entries: 499
unsafe paths: 0
symlinks: 0
duplicates: 0
secret findings: 0
JV/Jozz/local-path findings: 0
```

Raw logs reviewed:

```text
job 91694046725 / source audit
job 91826090330 / F3
job 91834173347 / F4
```

Token/auth values były maskowane `***`; standardowe hosted-runner paths only; nie zaobserwowano owner-private data. F3/F4 używały npm cache około 24 MB, który nadal wymaga manualnego Actions cache UI review.

F2 write-capable workflow source i generated receipt commit są znane, ale exact manual-dispatch run/job nie został odzyskany przez connector. Jego raw log wymaga manualnego UI lookup.

Nadal manualnie sprawdzić:

- exhaustive all workflow runs;
- F2 raw log;
- Actions caches;
- releases/assets;
- packages;
- secrets/variables/environments;
- deploy keys/webhooks/apps/collaborators;
- rulesets/protection;
- vulnerability reporting/Dependabot/security settings;
- Pages pozostaje disabled.

## 13. `main` i strategia integracji

Zmierzony checkpoint:

```text
main@5c64903d753f893adc42be90e0c3d8053a95a922
candidate ahead: 346 commits
candidate behind: 0
merge base: exact main
```

`main` był ścisłym przodkiem kandydata. Po finalnym remeasure, pełnym gate/audit i zgodzie Jozza preferowana integracja to exact fast-forward, bez merge commita, squasha receipts ani force update.

Nie wykonano żadnej zmiany `main` ani default branch.

## 14. Publiczne polityki

Obecne:

```text
README.md
SECURITY.md
CONTRIBUTING.md
docs/PUBLIC_COLLABORATION_HISTORY.md
docs/PUBLIC_ASSET_RIGHTS_POLICY.md
docs/operations/SOURCE_PUBLIC_RELEASE_RUNBOOK_PL.md
```

Prywatne asset/scan workspaces są zarezerwowane i ignorowane:

```text
.local-assets/
.local-scans/
.private-work/
```

Asset policy jest default-deny. Kodowa licencja nie licencjonuje automatycznie modeli, skanów, fotografii, tekstur, fontów, audio, logo ani native JV assets.

## 15. Mobile i scena

Mobile contract:

```text
docs/contracts/MOBILE_HOST_CONTRACT_PL.md
```

- Pointer Events;
- one pointer -> one owner;
- relative RATE pad first;
- up/cancel/lostcapture/background -> semantic RELEASE;
- camera nie kradnie control pointerów;
- render quality nie zmienia physics;
- real-device owner gate.

Scene contract:

```text
docs/contracts/SCENE_PACKAGE_CONTRACT_PL.md
```

```text
source scan
render mesh / LOD
simplified collision mesh
scene manifest + spawn/bounds/rights metadata
```

Parser/loader i mobile implementation świadomie czekają na zielony foundation checkpoint.

## 16. Bezpieczeństwo procesu

- brak merge/Ready/default/visibility/Pages bez Jozza;
- brak custom Actions;
- brak self-modifying CI i cross-repo loops;
- Git Diff Patcher Bridge zakazany;
- brak destrukcyjnego reset/clean/stash bez decyzji;
- lokalne raporty pozostają w ignorowanym `.local-audit/`;
- package scripts nie zawierają publish/deploy/pages ani ukrytych popularnych deploy commands;
- foundation i audit runners przypinają exact source identity;
- build nigdy nie publikuje.

## 17. Następna sekwencja

```text
1. fresh Node 24 foundation gate on current head
2. report-only public/history + license audits
3. generate review-classification ledger
4. classify every blocker and review finding
5. Jozz chooses exact project-license strategy/text
6. add exact root LICENSE and rerun all dependent gates
7. finish manual GitHub UI audit: F2 logs/caches/releases/packages/settings
8. remeasure main -> candidate fast-forward proof
9. prepare exact owner-approval receipt
10. owner-approved fast-forward main
11. owner-approved private -> public
12. immediate anonymous/public clone verification
13. keep Pages disabled
14. later Demo/Lab, mobile, native WASM and scene tracks
15. PAGES-PUBLISH-READY only after phone/package owner gates
```
