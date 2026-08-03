# Audyt delty fizycznej: native JV ↔ skażony web PoC

Status: `PASS_1 / CONFIRMED_DELTAS_AND_OPEN_EQUIVALENCE_TESTS`

Porównywane źródła:

```text
native JV:
Jozzpoly/Box3d_FunProject
commit 959aefb78587ce60cf2b8eb03ff82797a4165142

web evidence:
Jozzpoly/JV-Box3D-Web-experiment
branch agent/bootstrap-web-poc
```

Ten dokument nie twierdzi jeszcze pełnego line-by-line parity audit. Rozdziela fakty potwierdzone od pytań wymagających pomiaru.

## Legenda

- `CONFIRMED_FATAL` — zmienia zachowanie i łamie owner-ratyfikowaną regułę.
- `CONFIRMED_DELTA` — implementacje są różne; skutek może wymagać dalszego pomiaru.
- `ALIGNED_BASELINE` — odczytane wartości/warunki odpowiadają sobie dla wskazanego snapshotu.
- `OPEN_EQUIVALENCE` — dwie implementacje mogą być równoważne, lecz brak niezależnego dowodu.
- `PRODUCT_BOUNDARY` — legacy runtime może być wierny, ale nie jest zatwierdzonym przyszłym kierunkiem produktu.
- `NOT_PROVABLE_YET` — brakuje source/dependency receipt.

## 1. Sterowanie i rack

### D-STEER-01 — hostowe centrowanie po key-up

Status: `CONFIRMED_FATAL`.

Native:

```text
A/D aktywne  -> input.steer = +/-1
A/D zwolnione -> input.steer = 0
handsOn = abs(input.steer) > deadzone
```

Web:

```text
A/D zwolnione
→ KeyboardDriverInputModel prowadzi filtered steer do zera
→ utrzymuje steeringEngaged=true
→ po dojściu do zera trzyma servo jeszcze 0.35 s
```

Skutek: aktywna siła prowadzi rack do środka również na postoju. Jest to sztuczny self-centering.

Werdykt: usunąć cały mechanizm oraz testy, które wymagają centre capture na postoju.

### D-STEER-02 — skażona bramka produktu

Status: `CONFIRMED_FATAL`.

`main.ts` uznaje factory za gotowe tylko wtedy, gdy `lowSpeedSteering.stable` przechodzi. Sonda wymaga:

```text
rackFractionAtServoRelease < 0.1
oraz na postoju finalRackFraction < 0.1
```

CI nagradza więc zachowanie sprzeczne z native realistic defaultem.

### D-STEER-03 — dwa kontrolery pojazdu

Status: `CONFIRMED_FATAL`.

`M6WebRig.update()` i `M6ParityController.update()` implementują ten sam zakres odpowiedzialności niezależnie.

Potwierdzone różnice starego kontrolera `M6WebRig.update()`:

- flat `rackFrictionBase`, bez load-dependent term i stiction;
- brak opcjonalnej gałęzi `rackCenteringHertz`;
- napędza wszystkie koła niezależnie od `allWheelDrive`;
- ma własną kopię rack stroke, ARB, aero i drive torque;
- main go obecnie nie wywołuje, ale publiczna metoda pozostaje aktywną pułapką.

Werdykt: topology-only rig + jeden kontroler.

### D-STEER-04 — opcjonalny centering assist nie jest kopią native

Status: `CONFIRMED_DELTA / DEFAULT_PATH_OFF`.

Native przy `rackCenteringHertz > 0`:

- weak spring do targetu 0;
- damping 1;
- motor force cap `20 N`;
- pełne static/load-dependent friction nie jest stosowane w tej gałęzi.

Web przy `rackCenteringHertz > 0`:

- włącza weak spring do targetu 0;
- następnie nadal wylicza load-dependent friction/stiction i ustawia ten cap jako max motor force.

Default obu snapshotów wynosi 0, więc delta nie dotyka poprawnego realistic defaultu. Clean slice odrzuca aktywny assist jako unsupported do czasu osobnej decyzji właściciela.

### D-STEER-05 — static toe timing

Status: `OPEN_EQUIVALENCE`.

Native tworzy front tie-rod/rear toe-link od razu z długością policzoną przez `SteeringArmWithToe`.

Web builder tworzy joint z długością bez toe, a `M6ParityController` zmienia ją natychmiast po zbudowaniu pojazdu, przed pierwszym widocznym world stepem.

Może to być równoważne przy obecnej kolejności konstrukcji, ale:

- poprawność zależy od obowiązkowego utworzenia kontrolera;
- drugi kontroler/builder sam nie niesie kompletnego kontraktu;
- brak native/web initial-joint receipt.

W odbudowie prawidłowa długość powstaje w builderze, tak jak w native.

## 2. Konfiguracja i topologia

### D-CONFIG-01 — niepełny schema webowy

Status: `CONFIRMED_FATAL_FOR_GENERAL_SESSION_IMPORT`.

Web `M6RigConfig` nie reprezentuje między innymi:

- `frontRigType`;
- `rearRigType`;
- `trailingArm` geometry;
- pełnego `wheelEnvelope` mode/sides/layers/category contract;
- `ackermannGeometry` dla struta;
- `strutCasterDeg`.

Web zawsze buduje:

```text
front double wishbone
rear double wishbone
split sphere/sidewall
physical rack
```

Native tworzy topologię zależną od configu.

### D-CONFIG-02 — silent reinterpretation

Status: `CONFIRMED_FATAL`.

Jeśli lokalna sesja używa innego rigu lub envelope, loader tylko dodaje warning, lecz uruchamia inną topologię. HTTP error, invalid JSON albo sanitizer exception również kończą się factory fallbackiem.

Werdykt: fail closed. Brak sesji może jawnie wybrać pinned factory fixture. Sesja obecna, lecz invalid/unsupported, nie może stać się innym samochodem.

### D-CONFIG-03 — ręczna trzecia lista pól

Status: `CONFIRMED_DELTA / DRIFT_RISK`.

Native `jozz_vehicle_m6_config_io.cpp` używa jednej typowanej ordered field table do writer+reader. Web utrzymuje osobno:

- TypeScript interface;
- `SCALAR_FIELDS`;
- `BOOLEAN_FIELDS`;
- `WISHBONE_FIELDS`;
- ręczny sanitizer.

Webowy sanitizer pokrywa tylko część native P6 checks. Nie ma structural cross-field validation, pełnych mass limits, dead-point clamp, visual key validation ani kompletnej semantyki rig/envelope.

Werdykt: native-generated schema/receipt, nie kolejna ręczna synchronizacja.

### D-CONFIG-04 — `rackTravel`

Status: `ALIGNED_BASELINE_WITH_ARCHITECTURE_PROBLEM`.

Oba projekty traktują `rackTravel` jako derived z geometrii i max steer. Web recompute wykonuje constructor/controller. Native deliberate omission from serialized config jest poprawnym wzorem.

Problem weba: wzór jest skopiowany w kilku plikach i testach. Potrzebne jedno źródło adaptera + golden receipt.

## 3. Świat i solver

### D-WORLD-01 — grawitacja

Status: `CONFIRMED_DELTA`.

Native:

```text
b3DefaultWorldDef().gravity.y = -10.0
Sample::CreateWorld nie nadpisuje gravity
```

Web app i probe worlds:

```text
gravity.y = -9.81
```

Skutek: inne static loads, settle pose, preload response, joint/contact forces, ARB i rack friction load term. Wszystkie dotychczasowe webowe liczby sond są liczbami dla innego pola grawitacyjnego.

### D-WORLD-02 — step profile

Status: `ALIGNED_DEFAULT / NOT_FULL_SESSION_PARITY`.

```text
native SampleContext default: 60 Hz, 4 substeps
web fixed profile:           60 Hz, 4 substeps
```

Native host pozwala zmieniać hertz/substeps niezależnie od vehicle session. Web importuje tylko session config i nie rejestruje host solver settings.

W świetle aktualnego programu kół `F-15/F-16` substeps nie są neutralnym detalem dokładności: mogą zmieniać efektywną sztywność/relaksację kontaktu. Czysty build musi posiadać jawny solver-profile receipt.

### D-WORLD-03 — contact tuning

Status: `ALIGNED_BASELINE`.

Oba snapshoty używają:

```text
contactHertz = 30
contactDampingRatio = 10
contactSpeed = 3
```

Native pozwala tuningować te wartości w labie; web je pinuje. To jest poprawne tylko jako nazwany pinned fixture.

### D-WORLD-04 — continuous collision

Status: `ALIGNED_BASELINE`.

Native M6 lab wyłącza CCD dla vehicle world; web również ustawia `enableContinuous=false`.

### D-WORLD-05 — spawn

Status: `CONFIRMED_DELTA`.

Native próbuje wysokość terenu pod środkiem i czterema punktami footprintu, bierze maksimum i dodaje clearance.

Web używa:

```text
restDrop + wheelRadius + 0.08
```

na globalnym `(0,0,0)` bez footprint terrain sampling. Na płaskim probe ground może być wystarczające; na skanie/stoku nie odtwarza native spawn contract.

### D-WORLD-06 — catch-up policy

Status: `CONFIRMED_WEB_HOST_POLICY / NEEDS_EFFECT_TEST`.

Web wykonuje maksymalnie 5 fixed steps na render frame, a przy dalszym backlogu zeruje accumulator. Native sample host wykonuje jeden simulation step per host frame zgodnie z ustawionym hertz/pause loop.

Ta różnica może powodować utratę czasu symulacji przy lag spike. Nie jest sztuczną mechaniką pojazdu, ale musi być jawna i testowana jako host scheduling policy.

## 4. Koło i filtry kolizji

### D-WHEEL-01 — legacy split envelope

Status: `ALIGNED_WITH_NATIVE_LEGACY_BASELINE / PRODUCT_BOUNDARY`.

Web poprawnie ustawia sidewall density na 0, tak jak native. Hipoteza o podwójnej masie została po odczycie kodu wycofana i nie jest findingiem.

Jednocześnie aktualny program kół na `jozz-scan-terrain-f0` ma owner decision `F-04/N-01/N-02`: przełączanie natury koła przez kategorię powierzchni jest produktowo odrzucone.

Werdykt:

- split envelope może istnieć jako nazwany legacy M6 fixture;
- nie może być przedstawiany jako przyszły fundament opony JV.

### D-WHEEL-02 — sidewall rolling resistance

Status: `CONFIRMED_DELTA / NEEDS_CONTACT_TEST`.

Native kopiuje pełny `shapeDef` do `sidewallDef`, następnie zmienia mask i density=0. Sidewall dziedziczy więc `wheelRollingResistance`.

Web tworzy nowy default sidewall shapeDef i nie ustawia `baseMaterial.rollingResistance`, więc pozostaje 0.

Dotyczy kontaktu sidewalla z non-terrain obiektami. Potrzebny test kontaktu ściana/krawędź/prop; nie wolno zgadywać wpływu.

### D-WHEEL-03 — category bits

Status: `CONFIRMED_DELTA / NEEDS_FILTER_TRUTH_TABLE`.

Native pozostawia wheel shape `categoryBits` z `b3DefaultShapeDef` (wszystkie default bits), zmieniając maski rolling/sidewall.

Web ustawia obu shapes `categoryBits = OBJECT_CATEGORY`.

Przy obecnych world masks część kontaktów może pozostać taka sama, ale semantyka nie jest identyczna. Potrzebny pełny truth-table dla terrain, object, vehicle-self, scan i future material categories.

### D-WHEEL-04 — masa legacy wheel

Status: `ALIGNED_FORMULA / FUTURE_ARCHITECTURE_REJECTS_DERIVATION`.

Dla split fixture masa pochodzi wyłącznie ze sfery o density `wheelDensity`; cylinder ma density 0 w obu implementacjach.

Aktualny program kół wymaga jednak w przyszłym systemie jawnej mass/inertia niezależnej od W2 collider representation. Legacy fixture nie może dyktować WheelSpec.

## 5. Bryły, jointy i geometria

### D-GEOM-01 — chassis hull construction

Status: `OPEN_EQUIVALENCE`.

Native używa `b3MakeOffsetBoxHull(hx,hy,hz,{0,-cgOffset,0})`.

Web tworzy osiem punktów offset boxa i wywołuje `b3CreateHull`.

Powierzchnia powinna opisywać ten sam box, lecz brak receipt dla:

- wyliczonego centroidu;
- mass/inertia tensor;
- hull topology/order;
- dokładności wartości WASM.

Nie nazywać błędem bez pomiaru; w clean port użyć najbliższego jawnego API albo golden mass-data test.

### D-GEOM-02 — wishbone mechanism

Status: `CANDIDATE_ALIGNED / FULL_RECEIPT_PENDING`.

Potwierdzone wspólne elementy:

- shapeless explicit-mass knuckle;
- shapeless explicit-mass control arms;
- hinge axes/anti-fold limits;
- spherical cone/twist limits;
- kingpin frame;
- twist fence `maxSteer+10°` front / `15°` rear;
- coilover design length, preload and travel;
- rigid tie rods/toe links;
- wheel spin revolute.

Nie ma jeszcze kompletnego numeric/ID/frame receipt dla każdej local frame. Status nie jest `parity`.

### D-GEOM-03 — zero-vector normalization fallback

Status: `CONFIRMED_DEFENSIVE_DELTA / RISK`.

Web `normalize()` zwraca globalne `+Y` dla wektora o zerowej długości. Native sanitizer ma odrzucać/naprawiać strukturalnie degenerujące configi przed builderem.

Cichy +Y może zbudować inny mechanizm zamiast odrzucić invalid geometry. W clean builderze degeneracja jest błędem kontraktu.

## 6. Napęd, ARB i aero

### D-DRIVE-01 — aktywna ścieżka controller candidate

Status: `CANDIDATE_ALIGNED / FULL_RECEIPT_PENDING`.

`M6ParityController` zawiera warunki odpowiadające native:

- AWD lub rear-driven selection;
- torque taper względem relative wheel/carrier spin;
- brake/coast torque;
- ARB couple z equal/opposite chassis reactions;
- quadratic chassis aero drag.

Potrzebne są testy znaków, osi, force points i energii. Zielony drive probe nie jest wystarczający, bo używa tego samego skopiowanego kodu jako system under test.

### D-DRIVE-02 — stary drugi kontroler

Status: `CONFIRMED_DELTA`.

`M6WebRig.update()` napędza każdy corner przy throttle, ignorując `allWheelDrive`. To kolejny dowód, że duplikat musi zostać usunięty, nie pozostawiony jako nieużywany helper.

## 7. Diagnostyka i testy

### D-TEST-01 — shared mistake

Status: `CONFIRMED_VALIDATION_GAP`.

Web builder, controller, probes i oczekiwania są napisane w tym samym repo na podstawie tych samych ręcznych kopii. Ten sam znak, wzór lub brak pola może przejść wszystkie testy.

Potrzebne niezależne native receipts/golden traces, przynajmniej dla:

- factory config hash;
- hardpoints per corner;
- rack travel/dead point;
- initial body mass/inertia;
- joint frames/limits/lengths;
- raw hands-on/hands-off controller trace;
- straight/P1 scenario setup and metrics.

### D-TEST-02 — probe gravity and host

Status: `CONFIRMED_DELTA`.

Probe worlds również ustawiają `-9.81`, więc zielone liczby nie porównują się bezpośrednio z native default `-10`.

### D-DIAG-01 — idealized arm lines

Status: `CONFIRMED_DIAGNOSTIC_RISK`.

Renderer rysuje diagnostic arms jako odcinki między idealnym chassis hardpointem i live knuckle pointem. Nie przedstawia pełnego transformu rzeczywistego arm body.

Mechaniczny rozjazd body/hinge/ball joint może zostać wizualnie wygładzony. Clean diagnostics muszą pokazywać actual body pose oraz constraint error.

## 8. Granica silnika WASM

### D-ENGINE-01 — brak source identity paczki

Status: `NOT_PROVABLE_YET / BLOCKER`.

Repo deklaruje:

```text
box3d.js = 0.0.2
```

ale nie zawiera:

- `package-lock.json`;
- tarball integrity;
- repository URL/commit receipt;
- upstream Box3D SHA skompilowanego do WASM;
- porównania z forkiem `Box3d_FunProject@959aefb`.

`b3GetVersion() == 0.1.0` dowodzi wersji API, nie identyczności source/solver.

Werdykt: clean bootstrap musi albo zbudować binding z przypiętego źródła, albo wygenerować pełny dependency/source receipt i jawnie sklasyfikować różnice engine fork ↔ npm WASM.

### D-ENGINE-02 — export surface check

Status: `VALUABLE_BUT_NOT_SOURCE_PARITY`.

Test 60 wywołań chroni przed `undefined export`, lecz nie sprawdza semantycznej zgodności implementacji ani sygnatur wszystkich struktur. Zachować jako jedną z bramek, nie jako dowód tego samego silnika.

## 9. Priorytet napraw

1. Usunąć artificial centering oraz skażone testy.
2. Ustalić/pinować źródło WASM Box3D.
3. Wygenerować native config + sanitizer receipt.
4. Zbudować topology-only rig i jeden controller.
5. Ujednolicić gravity/solver profile w nazwanym fixture.
6. Dodać negative controller-trace test hands-off at rest.
7. Dodać native/web mass/joint/hardpoint receipts.
8. Dopiero później portować render/asset/world.

## 10. Werdykt pierwszego passu

Dotychczasowy web nie jest wiarygodnym parity proof. Nawet pomijając zakazane centrowanie:

- używa innej grawitacji;
- nie odtwarza pełnego config/topology contractu;
- może cicho zmienić sesję w inny samochód;
- nie posiada source identity WASM engine;
- waliduje się głównie własnymi kopiami.

Jednocześnie znaczna część wishbone buildera, native-style controller mechanisms i WASM startup infrastructure jest wartościowym materiałem referencyjnym. Każdy taki fragment musi zostać odzyskany przez receipt i niezależny test, nie przez przeniesienie całego pliku.