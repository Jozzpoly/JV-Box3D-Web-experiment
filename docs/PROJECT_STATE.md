# JV Box3D Web — kanoniczny stan projektu

Updated: 2026-08-04
Status: `CANONICAL CURRENT STATE`
Owner: Jozz

## 1. Cel produktu

JV Web ma stać się poważnym demonstratorem Jozz Vehicle:

- uruchamianym na desktopie i telefonie;
- posiadającym przemyślane sterowanie mobilne;
- docelowo pozwalającym jeździć po zoptymalizowanym skanie;
- łatwym do pokazania przez zwykły link GitHub Pages;
- bez własnego serwera i bez automatycznej publikacji;
- uczciwie odróżniającym reference backend od rzeczywistego native parity.

Repo ma docelowo stać się publiczne. Zmiana widoczności oraz włączenie Pages są dwiema osobnymi, ręcznymi decyzjami po odpowiednich gate’ach.

## 2. Architektura produktu

```text
native JV Core + Box3D WASM -> fizyka, blueprint compiler, telemetryka
TypeScript host             -> input, lifecycle, render, UI, mobile, sceny
portable static package     -> lokalny HTTP, LAN phone test, przyszłe Pages
```

Authority:

```text
decisions/ADR-0003-native-jv-core-wasm.md
decisions/ADR-0004-pages-ready-demonstrator.md
```

## 3. Aktywna linia

Zwalidowana baza:

```text
branch: agent/jv-web-refoundation
commit: f06853467408d6c633ca806d985062c634b3a666
```

Aktywna gałąź demonstratora:

```text
agent/jv-web-demonstrator-foundation
```

Jest bezpośrednio odgałęziona od zielonego refoundation headu. Nic nie jest scalane, oznaczane jako ready, upubliczniane ani publikowane bez Jozza.

## 4. Zwalidowany reference baseline

Na dokładnym refoundation headzie Jozz potwierdził lokalnie:

```text
Node 24.16.0
npm 11.17.0
native receipt byte-exact
Markdown links PASS
TypeScript PASS
77/77 tests PASS
Vite production build PASS
```

Wcześniejszy browser owner smoke potwierdził fizyczną jazdę.

Działający fixture posiada:

- deterministyczny fixed-step;
- timestamped steering i longitudinal input;
- transactional lifecycle;
- prawdziwy `box3d.js` WASM;
- receipt-derived M6 graph;
- 18 vehicle bodies / 29 joints / 9 shapes;
- fizyczny rack i tie-rody;
- `RELEASE | POSITION | RATE`;
- read-only WebGL observer;
- wheel-motor drive/reverse/coast/brake;
- dynamic rack-excursion matrix.

To są dowody liveness, determinizmu i internal consistency reference backendu. Nie są pełnym native parity ani zatwierdzeniem finalnego prowadzenia.

## 5. Krytyczna rozbieżność napędu

Native JV:

```text
maxDriveSpeed = wheel rev limit in rad/s
motor target = ±maxDriveSpeed
throttle scales available torque
wheel spin determines torque taper
```

TypeScript reference backend:

```text
maxDriveSpeed interpreted as linear m/s target
throttle scales target speed
target wheel speed = linear target / wheel radius
chassis speed determines torque taper
```

Dla przypiętych wartości legacy TS target przy pełnym gazie wynosi około `77.8 rad/s`, podczas gdy native target wynosi `40 rad/s`.

Wniosek:

```text
legacy_ts_m6 = deterministic and drivable reference fixture
native drive semantic parity = FAIL / NOT PRODUCT AUTHORITY
```

Nie dodawać nowych produktowych mechanizmów fizycznych M7, drivetrainu ani przyszłej opony do TypeScriptu.

## 6. Backend status

### `legacy_ts_m6`

```text
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
acceptsNewProductPhysics: false
```

Kontrakt istnieje w kodzie i ma focused test. World expose’uje backend identity. Trace/UI nadal wymagają jawnego pokazania tej prawdy.

### `native_jv_wasm`

```text
architecture: accepted
ABI v0: designed
minimal source set: audited
implementation: not started
```

Pierwszy spike użyje niezmienionych źródeł M5/M6 oraz cienkiego adaptera. Refactor natywnego core nastąpi dopiero pod ochroną parity trace.

## 7. Dwa zsynchronizowane tory

### Tor A — demonstrator

Może rozwijać na zamrożonym `legacy_ts_m6`:

- portable package;
- Demo/Lab separation;
- loading i failure UX;
- responsive/mobile shell;
- multi-touch ownership;
- kamera i reset;
- scene manifest;
- synthetic campus;
- quality profiles;
- lokalne testy LAN;
- Pages packaging.

Nie może dodawać ani stroić produktowej fizyki.

### Tor B — physics authority

- Box3D + JV Core w jednym WASM;
- C ABI z jednostkami;
- stable `partId`;
- immutable snapshot;
- native/WASM scenario comparison;
- backend swap;
- późniejszy Wheel Scope seam.

Oba tory spotykają się przez stabilny backend/snapshot contract.

## 8. Portable demonstrator foundation

Na aktywnej gałęzi są obecnie źródłowo przygotowane:

- Vite `base: "./"`;
- `.nojekyll`;
- deterministyczny `build-manifest.json` z SHA-256 plików;
- jawne `publicReady=false`, `pagesPublicationApproved=false` i `publishedByBuild=false`;
- validator root/nested paths, brakujących assetów, source maps i driftu bajtów;
- cztery syntetyczne testy przeciwne;
- lokalny demonstrator gate bez publikacji;
- current-tree i reachable-history public audit;
- osobna pętla walidacyjna i polishująca.

Stan tej gałęzi:

```text
source present
static review in progress
full Node 24 gate: NOT YET EXECUTED
portable artifact receipt: NOT YET RECORDED
LAN/phone smoke: NOT YET EXECUTED
```

Nie nazywać foundation zielonym przed lokalnym gate’em.

## 9. Public repository readiness

Decyzja produktowa:

```text
repository will become public after PUBLIC-READY PASS
```

Aktualnie:

```text
repository visibility: PRIVATE
Pages: DISABLED
LICENSE: MISSING / OWNER DECISION PENDING
THIRD_PARTY_NOTICES.md: MISSING
current/history local audit: IMPLEMENTED, NOT YET RUN
GitHub metadata audit: STARTED
public README: NOT READY
owner public approval: NOT YET GIVEN FOR A SPECIFIC HEAD
```

Public audit obejmuje:

- current tree;
- wszystkie osiągalne bloby i refy;
- PR bodies/comments/reviews;
- issues;
- Actions logs/artifacts;
- releases/packages;
- branch/tag names;
- prywatne/source scan assets;
- licencje kodu, zależności, modeli i skanu.

Wstępny audit dostępnych PR-ów nie ujawnił sekretu, ale wykazał historyczne twierdzenia wymagające prominentnego erratum. PR #15 w starym opisie interpretuje `maxDriveSpeed` jako `40 m/s`; przed publicznym repo musi zostać jawnie oznaczony jako superseded semantic error.

## 10. Model dystrybucji

Produktowy artefakt:

```text
portable multi-file static site
```

Docelowa publikacja:

```text
public source repo
+ osobna generated publishing branch
+ GitHub Pages: Deploy from a branch
```

Brak własnego deployment workflowa. Build lokalny nigdy nie publikuje.

Pojedynczy HTML pozostaje opcjonalnym małym eksperymentem, nie formatem skanu.

## 11. Mobile

Mobile jest osobnym host/input problemem, nie osobną fizyką.

Default badawczy:

- landscape-first;
- relative RATE steering pad;
- key-up/touch-up = `RELEASE`, nie `POSITION(0)`;
- oddzielny throttle i brake/reverse;
- camera gesture z własnym pointer ownership;
- blur, visibility, touchcancel i dispose zwalniają wszystkie aktywne komendy;
- AUTO quality zmienia render, nigdy fixed-step ani fizykę.

Owner feel na realnym telefonie jest obowiązkowy.

## 12. Skan

Skan źródłowy, render mesh i collision mesh są oddzielne.

Przed integracją lokalnych plików potrzebny będzie audit:

- formatów, jednostek i osi;
- liczby trójkątów;
- tekstur i UV;
- rozmiaru transferu i decoded memory;
- dziur/szumu;
- playable bounds;
- collision proxy;
- praw do publikacji source/render/collision assets.

Surowy noisy photogrammetry mesh nie jest domyślnym colliderem.

## 13. Sterowanie i rack — reference measurement

```text
stationary held RATE excess: 0.000 mm
driving held RATE excess:    <= 0.284 mm
post-RELEASE peak:            2.541–2.817 mm
contacts:                     4
```

Command clamp jest poprawny. Post-RELEASE mechanism nie został odizolowany. Force clamp pozostaje odrzucony bez native comparison.

## 14. Koło

```text
legacy_m6_split_sphere_sidewall
```

pozostaje regression baseline/failure reference, nie przyszłą oponą. Future Wheel Scope wchodzi wyłącznie przez native backend seam po nowym exact source receipt.

## 15. Workflow bezpieczeństwa

- brak merge bez Jozza;
- brak ready-for-review bez Jozza;
- brak automatycznej zmiany visibility;
- brak automatycznego Pages deploy;
- brak custom GitHub Actions;
- brak samomodyfikujących workflowów;
- brak cross-repo commit loop;
- brak Git Diff Patcher Bridge;
- lokalne audity zapisują wyniki w ignorowanym `.local-audit/`;
- publikowanie jest osobnym owner gate’em.

## 16. Następna sekwencja

```text
1. lokalny demonstrator foundation gate
2. uruchomienie public audit i klasyfikacja wyników
3. decyzja LICENSE + exact THIRD_PARTY_NOTICES
4. prominent errata/superseded status historycznych PR-ów
5. public README i default-branch consolidation plan
6. runtime backend identity przez trace/UI/receipt
7. Demo/Lab separation
8. mobile shell + touch ownership experiment
9. równolegle pierwszy native JV WASM parity spike
10. scene manifest + synthetic campus
11. audit i konwersja przesłanego skanu
12. phone owner gate
13. PUBLIC-READY owner approval
14. ręczna zmiana visibility
15. PAGES-PUBLISH gate i ręczne włączenie Pages
```
