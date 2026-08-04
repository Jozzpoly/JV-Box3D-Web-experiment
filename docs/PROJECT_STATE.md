# JV Web — kanoniczny stan projektu

Updated: 2026-08-04
Status: `CANONICAL CURRENT STATE`
Owner: Jozz

## 1. Cel produktu

JV Web ma stać się poważnym demonstratorem Jozz Vehicle:

- uruchamianym na desktopie i telefonie;
- posiadającym przemyślane sterowanie mobilne;
- docelowo pozwalającym jeździć po przygotowanym skanie;
- łatwym do pokazania przez zwykły link GitHub Pages;
- niewymagającym własnego serwera ani własnego cloud CI;
- uczciwie odróżniającym browser fixture od rzeczywistego native parity.

Repo ma docelowo stać się publiczne. Zmiana widoczności repo i włączenie Pages są dwiema osobnymi decyzjami Jozza.

## 2. Architektura

```text
native JV Core + Box3D WASM -> product physics authority
TypeScript host             -> input, lifecycle, render, UI, mobile, scenes
portable static package     -> localhost, LAN phone test, future Pages
```

Authority:

```text
decisions/ADR-0003-native-jv-core-wasm.md
decisions/ADR-0004-pages-ready-demonstrator.md
```

Nie rozwijać drugiej produktowej fizyki w TypeScripcie.

## 3. Aktywna linia

Zielona baza refoundation:

```text
agent/jv-web-refoundation
f06853467408d6c633ca806d985062c634b3a666
77/77 tests PASS
```

Aktywna gałąź demonstratora:

```text
agent/jv-web-demonstrator-foundation
current recorded head: f41b89bb4e83e438011286ee168db923f8a1be7f
PR #18: DRAFT / DO NOT MERGE / DO NOT PUBLISH
```

Nic nie jest scalane, oznaczane jako ready, upubliczniane ani publikowane bez Jozza.

## 4. Pierwszy demonstrator gate — prawidłowa falsyfikacja

Jozz wykonał lokalnie gate na:

```text
67067c5d46fc9ed45481a731efae4b3adf8d4ad8
Node 24.16.0
npm 11.17.0
receipt byte-exact
```

Wynik:

```text
npm ci: PASS
0 vulnerabilities
Markdown links: PASS
TypeScript: PASS
tests: 81/81 PASS
Vite bundle: PASS
portable validation: FAIL
```

Jedyny błąd artefaktu:

```text
/receipts/jv_m6_factory_receipt.json
```

był zakotwiczony w root domeny i zepsułby GitHub Pages pod ścieżką repo. Validator poprawnie zatrzymał paczkę.

Naprawiono źródło i dodano regresję:

```text
./receipts/jv_m6_factory_receipt.json
```

Nowszy head zawiera dalsze wzmocnienia i **nie jest jeszcze lokalnie zwalidowany**.

## 5. Reference backend

```text
id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
acceptsNewProductPhysics: false
```

Fixture jest drivable i deterministyczny, ale nie jest wiernym portem native JV.

Krytyczna rozbieżność:

```text
native maxDriveSpeed = 40 rad/s wheel rev limit
legacy TS             = 40 m/s linear target interpreted through radius
```

Native throttle skaluje moment i używa wheel spin do taperu. Legacy TS skaluje także target speed i używa chassis speed.

Nie dodawać do legacy TS nowych mechanizmów drivetrainu, anti-roll, aero, zawieszenia ani przyszłej opony.

## 6. Dwa zsynchronizowane tory

### Tor A — demonstrator

Dozwolone na zamrożonym fixture:

- portable package;
- Demo/Lab separation;
- loading/failure UX;
- responsive mobile shell;
- multi-touch ownership;
- kamera i reset;
- scene manifest;
- synthetic campus;
- quality profiles;
- LAN i phone smoke;
- Pages packaging.

### Tor B — physics authority

- Box3D + JV Core w jednym WASM;
- C ABI z jednostkami;
- stable `partId`;
- immutable snapshots;
- native/WASM scenario comparison;
- backend swap;
- późniejszy Wheel Scope backend seam.

Oba tory spotykają się przez stabilny backend/snapshot contract.

## 7. Portable package — obecny kontrakt

Artefakt:

```text
index.html
assets/
receipts/
THIRD_PARTY_NOTICES.md
build-manifest.json
.nojekyll
```

Generator wymaga czystego source tree i zapisuje:

- exact commit;
- clean-source status;
- backend identity;
- runtime assets;
- compliance files;
- rozmiar i SHA-256 każdego pliku;
- `publicReady=false`;
- `pagesPublicationApproved=false`;
- `publishedByBuild=false`.

Validator odrzuca:

- root-absolute runtime paths;
- brakujące HTML/CSS/runtime assets;
- nested CSS errors;
- source maps;
- symlinki/nietypowe wpisy;
- payload drift;
- unsafe/escaping paths;
- brak notice’a;
- fałszywe parity/product authority;
- samodzielne nadanie public/Pages approval.

Dodatkowy loopback HTTP smoke:

```text
/
/JV-Box3D-Web-experiment/
```

pobiera każdy plik z manifestu i porównuje jego bytes/SHA-256. Nie publikuje i nie zastępuje browser/phone smoke.

## 8. Testy dodane po pierwszym gate

Źródłowo obecne, lokalnie jeszcze niewykonane na bieżącym headzie:

- relative receipt URL;
- manifest truth/authority/publication challenges;
- runtime/compliance asset contract;
- real temporary Git history audit;
- secret removed from current tree but retained in history;
- dirty working tree;
- indexed symlink without following it;
- token-like branch name detection and report redaction;
- annotated tag metadata scanning;
- reachable-license inventory;
- root/nested-path HTTP byte smoke.

Aktualna liczba testów jest nieznana do następnego Node 24 gate’u.

## 9. Public-readiness audit

Repo nadal:

```text
visibility: PRIVATE
Pages: DISABLED
```

Zaimplementowany audit skanuje:

- current index blobs;
- dirty/untracked state jako blocker;
- wszystkie lokalnie osiągalne Git blobs;
- commit/tag metadata;
- heads/remotes/tags;
- sensitive filenames;
- token/key patterns;
- privacy-review patterns;
- duże historyczne bloby;
- symlinki i gitlinks;
- brak wymaganych public contracts.

Raport nie zapisuje wartości sekretów. Nazwy refów są skanowane w pamięci, lecz w JSON trafia wyłącznie namespace i fingerprint.

Audit jest narzędziem redukcji ryzyka, nie matematycznym dowodem braku każdego sekretu.

## 10. GitHub cloud-surface audit

Sprawdzono dotąd:

- wszystkie widoczne bodies/comments głównych stacked PR-ów;
- open i closed milestone issues;
- formal reviews i inline review threads na PR #1, #15, #17 i #18.

Nie znaleziono formalnych reviews ani inline threads na tych PR-ach. Nie zauważono oczywistego sekretu w dostępnych bodies/comments.

Wykryte problemy prezentacyjne:

- PR #15 miał błędne `40 m/s`; dodano prominentne erratum;
- issue #12 otrzymało status historycznego RATE eksperymentu;
- stare issues linkują do dokumentów, które obecnie są archiwalne;
- PR #1 pozostaje kwarantannowym prototypem.

Nadal wymagają audytu:

- wszystkie stare workflow logs i artifacts;
- releases;
- packages;
- wszystkie pozostałe issue comments;
- ostateczna klasyfikacja branchy/tagów po lokalnym audit report.

## 11. Licencje

`THIRD_PARTY_NOTICES.md` istnieje i zawiera exact provenance/licencje:

```text
box3d.js@0.0.2 / binding 2617a0f... / MIT
embedded Box3D 8441b4a... / MIT
Vite 8.1.5 / MIT
TypeScript 7.0.2 / Apache-2.0
```

Lokalny check porównuje notice z rzeczywiście zainstalowanymi pakietami i exact hash pliku `box3d.js/LICENSE`.

Projektowy `LICENSE` na aktualnym HEAD nadal nie istnieje i wymaga decyzji Jozza.

Krytyczny historyczny fakt:

```text
agent/bootstrap-web-poc / PR #1
LICENSE = MIT
Copyright (c) 2026 Jozz Vehicle contributors
```

Powstał reachable-license inventory, który raportuje wszystkie osiągalne `LICENSE/LICENCE/COPYING/NOTICE`, ich blob/hash, wykryty typ i obecność na HEAD. Publiczna decyzja musi być spójna z historycznym MIT albo wymagać osobnej strategii ref/history cleanup.

## 12. Default branch blocker

GitHub default branch nadal jest `main`.

Aktualny `main` posiada jedynie krótki prywatny PoC README i nie zawiera refoundation/demonstratora. Repo nie może zostać upublicznione w tym stanie.

Przed PUBLIC-READY potrzebna jest jawna decyzja integracyjna:

```text
current public candidate
→ reviewed integration into intended default branch
→ exact owner approval
→ dopiero visibility change
```

Nie zmieniać default branch ani nie scalać bez Jozza.

## 13. Public README

README na aktywnej gałęzi został przepisany jako uczciwa powierzchnia przyszłego publicznego repo. Opisuje:

- demonstrator desktop/phone/scan;
- non-authoritative backend;
- portable artifact;
- brak aktywnego Pages;
- dwa tory rozwoju;
- mobile/scene direction;
- pending project license.

Nie jest jeszcze publiczny i nie znajduje się na `main`.

## 14. Mobile i scene seam

Mobile jest host/input problemem, nie osobną fizyką.

Inwarianty:

- landscape-first;
- relative RATE pad jako pierwszy eksperyment;
- touch-up = `RELEASE`, nie `POSITION(0)`;
- exclusive pointer ownership;
- throttle/brake/reverse/camera nie kradną pointerów;
- `touchcancel`, blur, visibility i dispose zwalniają input;
- quality profile zmienia render, nigdy fixed-step ani fizykę.

Skan wymaga oddzielnych reprezentacji:

```text
source scan
render mesh / LOD
simplified collision mesh
scene manifest + spawn/bounds metadata
```

Surowy photogrammetry mesh nie jest domyślnym colliderem.

## 15. Reference steering measurement

```text
stationary held RATE excess: 0.000 mm
driving held RATE excess:    <= 0.284 mm
post-RELEASE peak:            2.541–2.817 mm
contacts:                     4
```

Command clamp PASS. Post-RELEASE mechanism nie został odizolowany. Force clamp odrzucony bez native comparison.

## 16. Workflow bezpieczeństwa

- brak merge/ready bez Jozza;
- brak visibility/Pages change bez Jozza;
- brak custom GitHub Actions;
- Pages może później użyć wyłącznie nieuniknionego systemowego deploymentu;
- brak self-modifying CI;
- brak cross-repo commit loop;
- Git Diff Patcher Bridge zakazany;
- lokalne audity zapisują tylko do ignorowanego `.local-audit/`;
- build nie ma funkcji publikowania.

## 17. Następne bramki

```text
1. statyczny review bieżącego PR #18
2. pełny lokalny demonstrator gate na nowym headzie
3. audit:public + klasyfikacja JSON
4. audit:licenses + decyzja Jozza o projekcie LICENSE
5. dokończenie GitHub logs/artifacts/releases/packages audit
6. default-branch integration plan
7. backend identity przez trace/UI/receipt
8. Demo/Lab split
9. mobile input ownership prototype
10. równolegle native JV WASM parity spike
11. scene manifest + synthetic campus
12. scan audit/conversion po otrzymaniu plików
13. phone owner gate
14. PUBLIC-READY owner approval
15. manual visibility change
16. PAGES-PUBLISH gate i manualne Pages enable
```