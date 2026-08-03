# JV Box3D Web — clean implementation roadmap

Updated: 2026-08-03
Status: `CANONICAL EXECUTION PLAN`

## Zasada prowadzenia prac

Każdy etap ma mały zakres, jawne wejście, mierzalne wyjście i warunek zatrzymania. Nie rozwijamy jednocześnie fizyki, assetów, świata, mobilki i nowego koła.

Kolejny etap nie zaczyna się dlatego, że poprzedni „wygląda obiecująco”. Zaczyna się po przejściu jego bramek albo po jawnym zaakceptowaniu ograniczenia przez Jozza.

---

# F0 — konsolidacja fundamentu

## Cel

Usunąć ryzyko powrotu do skażonych decyzji i ustalić jedną aktywną linię rozwoju.

## Zakres

- kanoniczne `AI_PROJECT_MEMORY.md`;
- `PROJECT_STATE.md`;
- `DOCUMENT_INDEX.md`;
- ten roadmap;
- aktualizacja README i PR #2;
- utworzenie `agent/clean-browser-core`;
- forensic workflows manual-only;
- brak product code.

## Bramka F0

- następny agent wie, który branch jest aktywny;
- stara pamięć PR #1 jest jawnie niekanoniczna;
- artificial centering jest jawnie odrzucone;
- przyszłe koło i mobilka mają granice, ale nie są implementowane;
- dokumenty mają precedencję i errata;
- clean branch wskazuje na pełny skonsolidowany fundament.

---

# F1 — clean host i deterministyczne wejście

## Cel

Zbudować najmniejszy kompilowalny host browserowy bez Box3D vehicle code, który prawidłowo zarządza czasem, inputem i lifecycle.

## Zakres

### Project shell

- przypięte wersje Node/npm dependencies;
- commitowany `package-lock.json`;
- `npm ci` jako jedyna ścieżka CI;
- strict TypeScript;
- Vite tylko jako host/build tool;
- mała, jawna struktura katalogów.

### Lifecycle

- jeden `AppLifecycle`/`DisposableStack`;
- transakcyjny startup;
- jawne dispose inputu, renderera i animation frame;
- failure przed commit active state sprząta wszystkie zasoby;
- test build/destroy/rebuild bez reload strony.

### Fixed-step clock

- render time oddzielony od simulation time;
- jawny `fixedDt`;
- limit catch-up i raport dropped time;
- zero zależności control laws od render delta.

### Input timeline

- timestamped key/pointer events;
- obsługa sub-frame press/release;
- `blur`, `visibilitychange`, `pagehide`, `pointercancel` kończą aktywne wejścia;
- klawiatura generuje semantic intent;
- `SteeringCommand = RELEASE | POSITION | RATE`;
- brak importu stanu pojazdu do device adaptera.

## Testy F1

- identyczny event log daje identyczny command trace przy 15/30/60/120 FPS i lag spikes;
- sub-frame tap nie znika bez jawnej polityki;
- release jest widoczny w pierwszym następnym fixed step;
- focus loss zeruje aktywne komendy;
- listener/resource counts wracają do baseline po dispose;
- zwykły startup nie uruchamia physics probes.

## Bramka F1

Host buduje się i przechodzi testy bez Box3D oraz bez vehicle-specific wyjątków.

---

# F2 — typed Box3D/WASM boundary i minimalny świat

## Cel

Udowodnić dokładny runtime boundary przed budową pojazdu.

## Zakres

### Artifact identity

- `box3d.js@0.0.2` przypięte lockfile;
- runtime report zawiera package/binding/engine identity;
- compatibility shims mają jedno źródło i niezależne golden tests.

### Typed adapter

- branded IDs zamiast szerokiego `any`;
- jawne creation/destruction ownership;
- wrapper capability report;
- BigInt filters i nested structs testowane sentinel values;
- errors nie są zamieniane w silent fallback.

### Minimalny physics profile

```text
gravity = -10
fixedDt = 1/60
substeps = 4
fresh engine contact defaults read back and recorded
continuous = false
```

Profile ma nazwę i hash. Renderer/mobile nie może go zmieniać.

### Minimalny fixture

- jedna statyczna płyta;
- jedno proste dynamiczne body;
- realny contact test;
- create/destroy cycle;
- brak kampusu, skanu i pojazdu.

## Testy F2

- export presence;
- definition round-trip;
- vector/quaternion golden values;
- body mass data set/read behavior;
- material/filter truth table;
- real contact po wystarczającej liczbie kroków;
- przynajmniej jeden prosty joint fixture;
- resources wracają do baseline po destroy.

## Bramka F2

Runtime jest nazwany `B0–B4 verified subset`, nie parity. Każde API potrzebne F3 ma test.

---

# F3 — native-generated config/factory receipt

## Cel

Usunąć trzeci ręczny mirror konfiguracji między native i webem.

## Zakres

Native/export tooling generuje machine-readable artifact:

```text
source commit/blob identities
schema version
serialized fields
runtime-only fields
derived fields
feature/topology support
factory values
sanitized values
solver profile
asset source/contract/audit hashes
resolved wheel dimensions
fallback-used flags
```

Web:

- waliduje dokładną wersję;
- odrzuca unknown/unsupported feature;
- nie clampa własnymi progami;
- tworzy effective-config report field→mechanism;
- nie fallbackuje z invalid session do innego auta.

## Testy F3

- native writer/reader/generator używa jednego field source;
- empty fixture odtwarza factory baseline;
- invalid/unsupported fixture zatrzymuje start;
- derived `rackTravel` odpowiada receiptowi;
- wheel radius/width nie pochodzą z hardcode TypeScript;
- optional assists default OFF.

## Bramka F3

Minimalny fixture może być zbudowany bez ręcznego przepisywania wartości z C++ do TypeScript.

---

# F4 — minimalna topologia M6 i jeden controller

## Cel

Zbudować niezbędny aktualny pojazd bez świata produktu i bez realnych visual assetów.

## Zakres

### Rig

- chassis;
- cztery wheel bodies;
- aktualny double-wishbone graph w minimalnym potrzebnym zakresie;
- physical rack i tie-rody;
- explicit mass data dla shapeless bodies;
- unique negative collision group per vehicle instance;
- topology object nie steruje pojazdem.

### Controller

Jedyny właściciel:

- steering actuator/hands-off friction;
- drive/brake/coast;
- AWD routing;
- ARB;
- aero.

Controller emituje per-step trace. Watchdog i tests tylko go konsumują.

### Renderer

- proste debug primitives;
- actual body poses i axes;
- żadnych idealized links udających live state;
- brak GLTF.

## Testy F4

- body/joint count i identity;
- mass/inertia receipt;
- local/world joint frames;
- static pose i constraint error;
- rack limits/stroke;
- left/right symmetry;
- filter group isolation dwóch instancji w małym test fixture;
- no artificial centering at rest;
- rolling caster scenario jako pomiar, nie zero-target gate;
- build/destroy cycles.

## Bramka F4

Pojazd stoi i porusza się na minimalnej płycie, a każde aktywne sterowanie jest widoczne w trace. Brak claimu o owner feelu.

---

# F5 — eksperyment precyzyjnego RATE steering

## Cel

Rozwiązać rzeczywisty problem Jozza: małe korekty na łagodnym łuku bez sztucznego centrowania.

## Kandydat

```text
K2b commanded rack rate
```

- rebase `commandedRack = liveRack` przy hands-on edge;
- rack-space rate;
- explicit target-lead cap;
- key-up = natychmiastowy `RELEASE`;
- brak speed dependence;
- brak centre phase.

## Sweep początkowy

```text
0.06 m/s
0.12 m/s
0.21 m/s
0.36 m/s
```

## Automatyczne testy

- tap lengths 0.5/1/2/3/6 steps;
- stationary, airborne, slow rolling, medium speed;
- monotonicity;
- repeatability;
- left/right symmetry;
- render-FPS independence;
- target lead under blocked rack;
- release trace.

## Owner test

Jozz ocenia:

- pojedyncze mignięcia;
- serię korekt na łagodnym łuku;
- zmianę kierunku;
- postój i toczenie;
- klawiaturę;
- brak wrażenia ukrytego auto-centeringu.

## Bramka F5

Powstaje behavior card z accepted/rejected variantem. Dopiero wtedy model może być przenoszony osobno do native JV i JES.

---

# F6 — pierwszy test mobilny

## Cel

Uruchomić ten sam clean fixture na telefonie bez zamrażania portu pod mobilkę.

## Zakres

- pointer router z jednym ownerem per pointer;
- touch throttle/brake/reverse;
- dwa touch buttons emitujące ten sam `RATE` co klawiatura;
- camera pointer nie przejmuje controls;
- pełne cancel/focus lifecycle;
- safe areas;
- low visual render profile;
- ten sam physics profile i config hash.

## Render profile

Dozwolone:

- shadows OFF;
- debug visuals OFF;
- DPR cap;
- minimalny świat;
- rzadszy HUD.

Niedozwolone:

- mniej substeps;
- inne koło;
- inne mass data;
- device-dependent steering law.

## Testy F6

- throttle + steering multi-touch;
- pointer cancel;
- przełączenie aplikacji;
- obrót ekranu;
- desktop/mobile semantic command equivalence;
- real-device timing telemetry;
- Jozz manual drive test.

---

# F7 — minimalny wheel adoption seam

## Cel

Odłączyć dane/mass/visuals od historycznej sfery, nie wybierając jeszcze nowej opony.

## Zakres

- `WheelSpecSnapshot`;
- explicit mass/inertia;
- `WheelContactBackend` lifecycle;
- capability report;
- neutralny `WheelContactObserver`;
- `WheelContactSet` i aggregate metrics;
- W4 niezależne od W2;
- tylko `legacy_m6_split_sphere_sidewall` jako pierwszy fixture;
- W3 = stock Box3D contact only.

## Testy F7

- mass invariance przy wymianie W2;
- one wheel body identity;
- backend lifecycle;
- one nature across surfaces;
- capability honesty;
- observer contact/manifold trace;
- visual independence.

## Bramka F7

Nowy Wheel Scope backend może później wejść przez seam bez zmiany vehicle controller/input/render ownership. Nie ma jeszcze zwycięzcy opony.

---

# F8 — prawdziwe visual assety

## Kolejność

1. jeden narożnik M9-like isolated visual bench w browserze;
2. contextual M6 binding;
3. screenshot/owner visual gate;
4. cztery narożniki;
5. wheel body orientation i side-aware future contract;
6. body visual authored contract;
7. rear mount/damper;
8. performance/lifecycle.

Nie przyklejać całego rigu do jednego body. Node/skin count nie jest dowodem integracji.

---

# F9 — campus

## Warunki wejścia

- generated layout receipt z native;
- jawne materials/categories;
- legacy wheel limitation opisana;
- performance profile;
- brak ręcznej duplikacji specs.

Campus nie jest gate'em clean M6 core.

---

# F10 — scan

## Warunki wejścia

- osobny visual/collider/calibration authority map;
- present-invalid odróżnione od absent;
- mesh memory preflight;
- external GLTF dependency handling;
- finite/index/degenerate validation;
- jawne binding mesh options;
- internal-edge/contact experiment;
- transakcyjny visual+collider commit;
- mobile poza pierwszym scan gate.

---

# Zasady commitów i PR

## Commity

- małe i subsystemowe;
- nazwa opisuje zachowanie albo receipt;
- bez mieszania refactoru, fizyki i UI;
- każdy eksperyment ma wyłącznik lub osobny route;
- checkpoint po istotnym przejściu bramki.

## PR-y

- PR #1 pozostaje kwarantanną;
- PR #2 przechowuje fundament dokumentacyjny;
- clean implementation jest rozwijana na `agent/clean-browser-core`;
- pierwszy implementation PR powstaje po realnej różnicy względem fundamentu;
- nie ogłaszać ready for review przed build/test receipt i jasną listą non-claims.

# Kryterium sukcesu projektu

Nie jest nim liczba przeniesionych plików ani podobny screenshot.

Sukces oznacza, że:

- browser uruchamia ten sam nazwany eksperyment;
- źródła configu, assetów i solvera są przypięte;
- mechanizmy są jawne i falsyfikowalne;
- input jest precyzyjny bez ukrytej stabilizacji;
- telefon używa tej samej fizyki;
- nowe koło może wejść bez przebudowy całego pojazdu;
- Jozz może prowadzić, obserwować i rozwijać eksperyment bez walki z nieczytelnym fundamentem.