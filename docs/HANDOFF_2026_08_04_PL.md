# Handoff dla kolejnego agenta — JV Box3D Web

Data: 2026-08-04
Status: `READ_FIRST / CANONICAL CHECKPOINT / NO MERGE AUTHORITY`

Ten dokument przechowuje stan pracy, decyzje, błędy, receipts i następny bezpieczny kierunek. Ma zapobiec utracie kontekstu rozmowy oraz powtórzeniu chaotycznej pętli workflowów.

## 1. Obowiązkowa kolejność czytania

1. `AI_PROJECT_MEMORY.md`
2. ten dokument
3. `docs/PROJECT_STATE.md`
4. issue #12 — F5 RATE steering
5. PR #11 — F4 current M6 topology
6. PR #9 — F3 native factory receipt
7. PR #6 — F2 typed Box3D boundary
8. PR #4 — F1 deterministic host/input
9. focused receipts i ADR-y wskazane poniżej

Nie zaczynaj od PR #1. PR #1 jest historycznym, skażonym prototypem.

## 2. Najważniejsze decyzje właściciela

Właściciel: Przemek / Jozz.

Niepodlegające reinterpretacji zasady:

- projekt ma zachować fizyczną duszę JV;
- brak ukrytych sztucznych mechanik;
- `rackCenteringHertz = 0` domyślnie;
- `uprightAssist = false` domyślnie;
- RELEASE oznacza natychmiastowe hands-off;
- po RELEASE nie ma targetu do zera, centre timera ani hostowej stabilizacji;
- koła mogą pozostać skręcone na postoju;
- samopowrót podczas ruchu ma pochodzić z geometrii, casteru, kontaktu i bezwładności;
- opcjonalne assisty mogą istnieć wyłącznie jawnie, domyślnie OFF i po akceptacji Jozza;
- owner feel i werdykt wizualny należą do Jozza;
- nie scalać żadnego PR bez decyzji Jozza;
- nie zrzucać zwykłej pracy repozytoryjnej na użytkownika;
- lokalnych komend żądać tylko wtedy, gdy potrzebny jest prawdziwy owner/browser test;
- `Git Diff Patcher Bridge` jest kategorycznie zabroniony.

## 3. Ścieżki lokalne Jozza

Native JV:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\box3d
```

Web:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JV-Box3D-Web-experiment\JV-Box3D-Web-experiment
```

Ostatni zweryfikowany stan lokalnego web repo podczas tej rozmowy:

```text
branch: agent/clean-browser-core
head: 484c865253603cdb3860cd517718f610e08d7e98
working tree: clean
Node: v24.16.0
npm: 11.17.0
```

W repo istniał stash bezpieczeństwa:

```text
stash@{0}: bootstrap generated files before clean browser core
```

Zawierał stare wygenerowane pliki/prototypowe artefakty. Nie wykonywać `stash pop` ani `stash drop` bez świadomej potrzeby odzysku. GitHub nie potwierdza, czy lokalny stan nie zmienił się później poza rozmową.

## 4. Aktualna mapa remote branchy i PR-ów

### Fundament/audyt

```text
agent/fundamental-audit-rebuild
2831d5335854293c9532f9ec8789feb9915e1c81
PR #2 — draft, dokumentacja fundamentu
```

### F1 — zakończone

```text
agent/clean-browser-core
484c865253603cdb3860cd517718f610e08d7e98
PR #4 — draft, nie scalać bez decyzji Jozza
issue #3 — zamknięte
```

### F2 — zakończone

```text
agent/typed-box3d-boundary
2c20880932b125920b3c31dee278453d7dcba163
PR #6 — draft
issue #5 — zakończone
```

### F3 — zakończona czysta implementacja

```text
agent/native-factory-receipt
PR #9 — draft
validated PR head: bf9a68c73ee8197746da98227bd09dee8e264146
F4 zostało utworzone z zatwierdzonego checkpointu F3: 52d5c42519d22421e53ced387daf137b5cf2ded1
issue #7 — F3
```

### F4 — zakończone maszynowo, bez owner feel

```text
agent/current-m6-topology
1653e9821d884f2884db2dc53a2cfd9c7f9a9122
PR #11 — draft, implementation complete, do not merge without Jozz review
```

### F5 — aktywne WIP

```text
agent/physical-rate-steering
stacked on F4@1653e9821d884f2884db2dc53a2cfd9c7f9a9122
issue #12 — open
```

W chwili przygotowania handoffu branch F5 był 10 commitów przed F4 i zmieniał 8 plików źródłowych/testowych. Nie było jeszcze finalnego PR ani kompletnej bramki F5.

## 5. Kwarantanna nieudanej próby F3

Pierwsza próba web F3 wpadła w niebezpieczną pętlę:

- samomodyfikujący workflow;
- powtarzane zmiany triggerów;
- automatyczne commity między repozytoriami;
- kolejne runy zamiast stabilnej pracy źródłowej;
- unresolved TypeScript failures;
- przeciążenie rozmowy i utrata kontroli nad stanem.

Pełny snapshot jest zachowany:

```text
agent/f3-regression-snapshot-2026-08-03
d583d3f573300335446b1b1f99fdd8ce29d2e7df
PR #8 — CLOSED / QUARANTINED / DO NOT MERGE
```

Nie kontynuować tej historii ani workflowa. Czysta F3 została później zbudowana osobno i jest w PR #9.

## 6. Native receipt checkpoint

Repo:

```text
Jozzpoly/Box3d_FunProject
branch: agent/web-factory-receipt
PR #18 — closed paused checkpoint, not merged
artifact checkpoint: 78b0be923c52408495c4c7625f9b10ff7ae58db7
native source commit recorded in receipt: a740dec74f4243679c71a17eb59723ee0b42f8bb
receipt Git blob: 6a5cb337a7d4707946835e83e036365130c52459
```

Generator:

- osobny target C++20;
- używa istniejącego `SaveJozzVehicleM6Config` / `JozzFieldDesc`;
- 76 serializowanych pól z typami descriptorów;
- oddziela serialized / derived / runtime-only;
- zapisuje solver profile, topology/features, assist state i provenance assetów;
- odrzuca sanitizer changes, fallbacki, aktywne assisty i unsupported topology.

Ważna poprawka: typów nie wolno inferować z JSON value (`250` nie oznacza automatycznie `int`). Typy pochodzą z natywnego `JozzFieldDesc`.

## 7. F1 — dokładnie wykonane

F1 zbudowało czysty host bez Box3D:

- strict TypeScript/Vite shell;
- Node major 24;
- dokładne dependency versions i commitowany lockfile;
- transactional resource ownership;
- rollback nieudanego startupu;
- restart hosta bez reloadu;
- bounded fixed-step clock;
- jawne dropped-time intervals;
- timestamped steering timeline;
- `SteeringCommand = RELEASE | POSITION | RATE`;
- proporcjonalna signed-time integration sub-frame taps;
- deterministic event ordering;
- focus/blur/visibility/pagehide release;
- dwa fizyczne klawisze jednej strony nie zwalniają się przedwcześnie;
- ADR-0001 dla sub-frame RATE integration.

Walidacja właściciela:

```text
Node 24.16.0
npm 11.17.0
npm ci PASS
strict typecheck PASS
19/19 tests PASS
production build PASS
browser dev host PASS
working tree clean
```

Polityka tapu:

```text
RATE value = signed active time / fixed-step time
```

To rozstrzyga próbkowanie wejścia, nie finalną fizyczną prędkość racka.

## 8. F2 — dokładnie wykonane

F2 dodało prawdziwy Box3D/WASM boundary:

- exact `box3d.js@0.0.2` i lockfile;
- jeden typed boundary dla bezpośrednich binding calls;
- audited package/binding/engine identity;
- shared WASM module między rebuildami świata;
- jawny compatibility registry dla native-inline `b3MulQuat`;
- B0–B5: identity, exports, defs/round-trips, ownership, mass equivalence, prawdziwy contact/manifold;
- fixed `(0,-10,0)`, 1/60, 4 substeps, continuous OFF dla fixture;
- real sphere-ground contact;
- runtime fault cleanup;
- destroy/rebuild bez reloadu.

Receipts:

```text
docs/receipts/F2_NODE24_VALIDATION.md
docs/receipts/F2_BROWSER_SMOKE.json
validated source: 8c86c94762a79f444f425b61fa82ca07e649bbd8
```

Wyniki:

```text
26/26 tests PASS
npm ci / typecheck / build PASS
Chrome generation 1: contact + B0-B5 PASS
world destroy/rebuild
generation 2: contact + B0-B5 PASS
runtime exceptions 0
console errors 0
```

## 9. F3 — dokładnie wykonane

Czysta F3 konsumuje statyczny, przypięty native receipt:

- receipt jako static repository input;
- exact source/artifact/blob pins;
- `unknown -> NativeFactorySnapshot` runtime validation;
- schema v1;
- 76/76 fields i exact leaf set;
- descriptor types;
- canonical payload SHA-256;
- double-wishbone front/rear i wheel mode 3 jawne;
- rack-centering i upright assists wymagane OFF;
- asset/travel/trailing-arm fallbacki odrzucane;
- wheel radius, width, rack travel, dead point i solver profile pochodzą z receipt;
- effective field-to-mechanism report;
- Box3D nie startuje, gdy receipt jest odrzucony;
- positive i negative parser tests;
- rejected receipt tworzy zero physics resources.

Walidacja:

```text
read-only run: 30855702375
Node 24.16.0
37/37 tests PASS
production build PASS
headless Chrome PASS
native receipt a740dec7 verified before Box3D startup
real contact + generation 1 -> 2 rebuild PASS
B0-B5 PASS obu generacjach
runtime exceptions 0
console errors 0
```

F3 nie buduje pojazdu i nie jest parity claim.

## 10. F4 — dokładnie wykonane

F4 odtwarza aktualny minimalny M6 double-wishbone graph:

```text
vehicle bodies: 18
vehicle joints: 29
vehicle shapes: 9
corners: 4
```

World ma dodatkowo ground body/shape, dlatego jeden pojazd raportuje counters 19 bodies / 10 shapes / 29 joints.

Implementacja:

- chassis hull z receipt dimensions i CG offset;
- 4 koła;
- 4 shapeless knuckles;
- 8 shapeless upper/lower arms;
- shapeless rack;
- 4 wheel spin joints;
- 8 arm hinges;
- 8 spherical ball joints;
- 4 coilovers z spring/damping/min/max travel;
- 2 front rigid tie rods;
- 2 rear fixed toe links;
- rack prismatic joint;
- explicit mass/inertia dla shapeless bodies;
- unique negative collision group per vehicle (`CollisionGroupAllocator`, domyślnie od -1000);
- exact temporary backend `legacy_m6_split_sphere_sidewall`;
- jedna klasa `M6VehicleController` posiada wszystkie steering actuators i trace;
- POSITION prowadzi fizyczny rack;
- RELEASE wyłącza spring i servo, pozostawia load-dependent friction;
- RATE w F4 było `RATE_RESERVED`;
- deterministic per-fixed-step trace;
- transactional destroy/rebuild.

F4 controller RELEASE friction:

- rack-axis jest wyprowadzony z chassis rotation;
- transverse tie-rod load jest sumowany z dwóch przednich linków;
- friction cap = `stiction * (rackFrictionBase + rackFrictionLoadCoeff * transverseLoad)`;
- stiction ratio 1.4 przy `abs(rackSpeed) < 0.01`, inaczej 1;
- nie ma centering targetu.

Walidacja:

```text
read-only run: 30858244976
Node 24.16.0
46/46 tests PASS
production build PASS
headless Chrome PASS
18 / 29 / 9 topology PASS
legacy backend PASS
generation 1: four contacts, RELEASE, actuator OFF
full destroy/rebuild
generation 2: four contacts, RELEASE, actuator OFF
runtime exceptions 0
console errors 0
```

F4 non-claims:

- brak drive/brake;
- brak finalnego RATE;
- brak new tire backend;
- brak Three.js/GLTF vehicle visuals;
- brak mobile;
- brak campus/scan;
- brak owner feel/parity claim.

## 11. F5 — aktualny stan WIP

Issue:

```text
#12 [F5] Physical rack-space RATE steering experiment
```

Branch jest 10 commitów przed F4. Zmienione obecnie:

```text
src/app/f4-vehicle-host.ts
src/main.ts
src/physics/box3d-boundary.ts
src/vehicle/m6/m6-topology-contract.ts
src/vehicle/m6/m6-topology-world.ts
src/vehicle/m6/m6-vehicle-controller.ts
src/vehicle/m6/rate-steering-profile.ts
tests/m6-topology-world.test.mjs
```

### Profile

```text
precision_0_06  = 0.06 m/s
low_0_12        = 0.12 m/s
reference_0_21  = 0.21 m/s
high_0_36       = 0.36 m/s
max target lead = 0.008 m dla wszystkich profili
```

Każdy profil ma `productDefaultApproved: false`.

`reference_0_21` jest tylko initial UI profile / historical-reference starting point. Nie jest zaakceptowanym defaultem produktu.

### Obecna mechanika K2b

Dla `RATE` z niezerową wartością:

1. przy pierwszym hands-on: `commandedRack = liveRack`, edge `ENGAGE`;
2. przy zmianie znaku: rebase do `liveRack`, edge `REVERSE`;
3. delta na krok:

```text
command.value * rackRateMetersPerSecond * fixedDt
```

4. commanded target jest clampowany do:

```text
[-rackTravel, +rackTravel]
intersection
[liveRack - maxTargetLead, liveRack + maxTargetLead]
```

5. spring i motor są włączane jako hands-on actuator;
6. motor speed = `rackServoSpeedGain * targetError`, clampowany do `rackServoMaxSpeed`;
7. max motor force = native receipt `rackServoForce`.

Dla `RELEASE` albo `RATE value == 0`:

- rate state jest czyszczony;
- spring OFF;
- motor speed 0;
- target/commanded rack w trace = null;
- max motor force zostaje użyty tylko jako fizyczny friction cap;
- actuator OFF;
- brak targetu do środka.

POSITION pozostaje bezpośrednim baseline targetem racka.

### Obecny trace F5

Trace zawiera:

- profile ID;
- rack rate m/s;
- max target lead;
- handsOn;
- edge `NONE | ENGAGE | REVERSE`;
- commanded rack;
- live rack;
- target error;
- spring enabled;
- target translation;
- requested motor speed;
- motor force cap;
- rack friction base;
- rack friction load term;
- stary pełny F4 trace chassis/rack/corners/contacts.

### UI

Browser UI już:

- pokazuje cztery profile;
- restartuje eksperyment przy zmianie profilu;
- pokazuje commanded/live rack, edge, target error, spring/motor/force i friction;
- jawnie opisuje, że profile są kandydatami, nie product defaults.

### Obecne testy

Istnieje tylko podstawowy test, że:

- POSITION porusza rack;
- RELEASE wyłącza spring/actuator i nie centruje;
- RATE włącza K2b;
- edge przy pierwszym kroku to ENGAGE;
- target lead nie przekracza 0.008 m.

To nie kończy F5.

## 12. Brakujące bramki F5

Następny agent ma najpierw dokończyć testy, nie uruchamiać CI na częściowym kodzie.

Wymagana macierz:

- tapy odpowiadające 0.5, 1, 2, 3 i 6 fixed steps;
- wszystkie profile 0.06 / 0.12 / 0.21 / 0.36 m/s;
- monotoniczność commanded-rack delta względem rate i tap duration;
- dokładna signed-time wartość z F1 dla sub-frame tapu;
- immediate RELEASE w pierwszym fixed step;
- `RELEASE -> RATE` rebase do live rack;
- direction reversal rebase;
- left/right symmetry;
- physical rack travel clamp;
- blocked-rack fixture potwierdzający lead cap i brak akumulacji stored target;
- ta sama timestamped timeline przez 15/30/60/120 FPS;
- irregular cadence i dropped gap;
- profile switch/rebuild;
- destroy/rebuild lifecycle;
- trace kompletności;
- brak centering actuator po RELEASE.

Dopiero potem:

```text
npm ci
npm run check
npm run build
jedna read-only browser smoke
```

Workflow, jeśli powstanie, ma być manual-only i read-only. Bez automatycznego commitowania receipts, bez cross-repo sync, bez samomodyfikacji.

## 13. Ryzyka i punkty wymagające krytycznej weryfikacji

- `0.008 m` lead cap jest parametrem eksperymentalnym, nie owner-approved.
- `0.21 m/s` nie jest zatwierdzonym defaultem.
- Sam fakt, że target delta jest poprawna, nie dowodzi dobrego feelu.
- Spring+motor są aktywne wyłącznie hands-on, ale ich fizyczny response musi zostać zmierzony, nie założony.
- Nie zmieniać friction modelu przy okazji F5 bez osobnego dowodu.
- Nie dodawać speed sensitivity, yaw/slip feedback ani stabilizatora.
- Nie przywracać starego normalized return filter z PR #1.
- Nie interpretować browser smoke jako owner feel.
- Nie przechodzić do mobile F6 przed maszynowym F5 i owner verdictem.

## 14. Narzędzia i workflow discipline

Po poprzednim błędzie obowiązuje:

- jeden aktywny etap naraz;
- implementacja źródłowa przed CI;
- brak komentowania każdego mikrokroku w rozmowie;
- krótkie checkpointy tylko przy znaczącym postępie;
- brak samomodyfikujących workflowów;
- brak workflowów commitujących kod;
- brak kolejnych runów bez source change i uzasadnienia;
- nie używać Actions do zwykłego debugowania TypeScript;
- manual forensic workflows uruchamiać tylko po zmianie źródła dowodu;
- zachować stacked PR-y jako drafty;
- nie scalać bez Jozza.

## 15. Następny bezpieczny ruch

1. Sprawdź aktualny HEAD `agent/physical-rate-steering` i diff względem `1653e982`.
2. Przeczytaj issue #12 i obecny controller/profile/UI.
3. Nie zmieniaj parametrów 0.008/0.21 przed testami; traktuj je jako candidates.
4. Dodaj izolowaną, pełną macierz testów F5.
5. Napraw tylko błędy ujawnione przez testy.
6. Wykonaj lokalny/static test pass.
7. Dopiero na gotowym kodzie dodaj jeden manual-only read-only validation workflow albo uruchom istniejący odpowiednik.
8. Otwórz draft PR F5 dopiero po pełnym machine PASS.
9. Poproś Jozza o owner test dopiero wtedy, gdy app jest realnie gotowa do oceny profili.

## 16. Evidence vocabulary

Używaj precyzyjnych etykiet:

```text
SOURCE_FACT
MEASURED_FACT
MECHANISM_FALSIFICATION
INTERNAL_CONSISTENCY
LIVENESS_SMOKE
SCENARIO_EQUIVALENCE
VISUAL_OBSERVATION
OWNER_VALIDATED
```

Build/test/browser PASS nie jest OWNER_VALIDATED ani physics parity.
