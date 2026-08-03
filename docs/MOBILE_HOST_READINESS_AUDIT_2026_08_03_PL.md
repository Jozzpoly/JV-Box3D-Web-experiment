# Audyt gotowości mobilnego hosta JV Web

Data: 2026-08-03

Status: `OWNER_DIRECTION_CAPTURED / CURRENT_POC_NOT_MOBILE_READY / PHYSICS_PROFILE_MUST_REMAIN_EXPLICIT / NO_IMPLEMENTATION`

## 1. Kierunek właściciela

Jozz chce niedługo uruchomić i prowadzić JV Web na telefonie. Mobilny test jest kuszącym i wartościowym celem, ale nie może:

- zamrozić solidnego portu browserowego;
- wymusić uproszczonej fizyki jako architektury;
- zmienić koła, substeps albo contact tuning po cichu;
- zepchnąć desktopowy/debugowy host do roli drugorzędnej;
- połączyć input, UI, renderer i vehicle controller w jeden mobilny workaround.

Telefon jest kolejnym hostem urządzeń wejściowych i profilem renderu dla tego samego jawnego physics fixture.

## 2. Obecny PoC — co już pomaga

- poprawny meta viewport;
- pełnoekranowy canvas;
- `PointerEvent` w kamerze zamiast wyłącznie mouse events;
- podstawowa obsługa `pointercancel` kamery;
- resize canvas/camera;
- DPR ograniczony do maksymalnie 2;
- fixed-step 60 Hz / 4 substeps niezależny od render FPS;
- browser-hosted WASM bez natywnych zależności systemowych;
- relative asset base `./`.

To wystarcza, aby techniczny boot na części telefonów był prawdopodobny. Nie wystarcza do kontrolowanego testu prowadzenia.

## 3. Krytyczny blocker: startup wykonuje pełny zestaw sond

Przed utworzeniem właściwego świata i pokazaniem gry `main.ts` uruchamia synchronicznie wszystkie webowe sondy.

Dokładna liczba world steps:

```text
straight               120 settle + 300 drive                  = 420
steering impact        120 settle + 120 impact + 300 drive     = 540
handling pulse         120 + 150 + 18 + 210                    = 498
low-speed stationary   120 + 36 + 72 + 90                     = 318
low-speed creep        120 + 60 + 36 + 72 + 90                = 378
--------------------------------------------------------------------
total                                                           2154
```

Przy 4 substeps:

```text
2154 * 4 = 8616 solver substeps przed uruchomieniem gry
```

Problemy:

- blokowanie głównego wątku przed pierwszym użytecznym frame;
- wielokrotne budowanie i niszczenie całego pojazdu;
- słaby startup na telefonie;
- sondy są częściowo skażone starym modelem inputu;
- test produktu wykonywany jest przy każdym zwykłym uruchomieniu;
- brak progress/yield powoduje wrażenie zawieszenia strony;
- wynik lokalnej sondy nie powinien blokować manualnego eksperymentu, jeśli sama sonda nie jest owner-ratyfikowaną gate.

Polityka czystego hosta:

```text
production/manual host
  B0/B1 minimalny WASM + contract startup check
  tworzy jeden właściwy świat

CI/dev diagnostics route
  pełne deterministic probes
  osobny raport i fixture

optional in-app diagnostics
  uruchamiane jawnie
  poza active vehicle world
  z progress/cancel
```

## 4. Bundle i transfer

Ostatni build PR #1 wygenerował:

```text
main JS chunk: 1,745.15 kB
main JS gzip:    519.67 kB
source map:    5,834.39 kB
```

Vite zgłosił chunk większy niż 500 kB. Powodem jest między innymi `box3d.js/inline`, który umieszcza WASM w JS, oraz brak code splittingu.

To nie jest automatyczny blocker telefonu, ale obecna forma ma wady:

- JS parser musi przetworzyć duży moduł przed startem;
- WASM nie jest osobnym cache'owalnym zasobem;
- trudniej mierzyć osobno download/decode/compile;
- aplikacja, diagnostyka i runtime są w jednym chunku;
- source map nie powinien być domyślnym produkcyjnym ciężarem publikacji.

Kandydaci do późniejszego pomiaru:

### Inline WASM

Zalety:

- najprostsze statyczne wdrożenie;
- brak problemu MIME/path dla `.wasm`;
- jednoplikowy runtime chunk.

Wady:

- duży JS;
- słabsza niezależna cache'owalność;
- większy koszt parsowania modułu.

### External WASM

Zalety:

- osobny cache i pomiar;
- potencjalne streaming instantiation;
- lżejszy główny JS.

Wady:

- wymaga poprawnego static hosting/MIME/path;
- nowa granica deploymentu;
- trzeba potwierdzić wsparcie dokładnego bindingu.

Nie wybierać bez pomiaru na docelowym telefonie i desktopie.

## 5. Render — obecny koszt

### Stały profil wysokiej jakości

Obecny renderer zawsze ustawia:

- antialiasing;
- DPR do 2;
- PCF soft shadows;
- shadow map 2048×2048;
- cienie na wielu dynamicznych i statycznych obiektach;
- fog;
- pełne światło kierunkowe i hemisferyczne;
- `frustumCulled=false` dla wszystkich skinned meshes.

Nie istnieje render capability/profile contract.

### Świat proceduralny

Obecny world tworzy co najmniej:

```text
147 bumper capsule shapes
401 rock hull shapes
1 duża plate shape
3 InstancedMesh rock visuals
147 osobnych bumper meshes
zone guides i grid
opcjonalny scan mesh
```

Bumper i rock visuals mają włączone cast/receive shadows. Dla pierwszego testu mobilnego jest to nieuzasadnione obciążenie startowe.

### Diagnostyka zawieszenia

Renderer tworzy wiele dynamicznych segmentów i w każdej klatce:

- oblicza live endpoints;
- tworzy nowe `THREE.Vector3` w helperach;
- aktualizuje pozycję, quaternion i scale każdego segmentu;
- utrzymuje cienie również dla debug geometry.

Na desktopowym narzędziu badawczym może to być użyteczne. Na pierwszym telefonicznym drive test powinno być profilem opcjonalnym.

## 6. Physics profile nie jest quality profile

Najnowsze findings kół F-15/F-16/F-31/F-32 pokazują, że:

- substeps zmieniają zbieżność redundantnych więzów kontaktowych;
- efektywny contact hertz zależy od substeps;
- 4 kontra 32 substeps może zmienić wynik mechaniczny, nie tylko koszt;
- liczba shapes i substeps działają razem.

Dlatego niedozwolone jest:

```text
telefon wykryty
→ substeps 4 -> 1 lub 2
→ ten sam fixture/status
```

Rozdział:

```text
PhysicsProfile
  gravity
  fixedDt
  substeps
  contact tuning
  CCD
  backend koła
  config hash

RenderProfile
  DPR
  antialias
  shadows
  shadow map
  fog
  debug visuals
  scan visual
  texture quality
  HUD cadence
```

Telefon może automatycznie dostać inny `RenderProfile`. Inny `PhysicsProfile` wymaga osobnej nazwy, receiptów i owner testu.

## 7. Minimalny pierwszy mobile fixture

Pierwszy manualny test na telefonie powinien używać dokładnie tego samego jawnego physics fixture co desktopowy clean slice:

```text
gravity = -10
fixedDt = 1/60
substeps = 4
contact = 30 / 10 / 3
continuous = false
M6 double wishbone fixture
rackCenteringHertz = 0
uprightAssist = false
legacy wheel backend jawnie nazwany
```

Zakres świata:

- płaska płyta lub bardzo mały nazwany test course;
- bez skanu;
- bez setek rock shapes;
- bez full campus;
- bez front-rig preflight assetu, jeżeli nie jest renderowany;
- body/wheel visuals opcjonalnie po basic boot;
- debug rig OFF domyślnie;
- brak pełnych probe suites przy starcie.

To nie jest uproszczona fizyka auta. To mniejszy świat i mniejsza warstwa wizualna.

## 8. Touch input architecture

Telefon wymaga kilku równoczesnych pointerów:

- steering left/right;
- throttle/reverse/brake;
- ewentualnie kamera;
- możliwy restart/menu.

Obecna kamera posiada jeden `pointerId` i przechwytuje LPM/touch na całym canvasie. Bez jawnego ownershipu będzie walczyć z przyciskami jazdy.

Minimalna architektura:

```text
PointerRouter
  pointerId -> owner

owners:
  STEER_LEFT
  STEER_RIGHT
  THROTTLE
  REVERSE
  BRAKE
  CAMERA
  UI
```

Każdy pointer ma jednego właściciela od `pointerdown` do `up/cancel`. Kamera nie może przejąć pointera rozpoczynającego się na control surface.

### Steering buttons

Touch left/right powinien emitować ten sam:

```text
SteeringCommand RATE(-1..1)
```

co klawiatura. Dzięki temu precyzyjne mignięcia i dłuższe przytrzymanie mają tę samą semantykę na PC i telefonie.

### Analog touch steering

Może później emitować `POSITION`, ale nie jest potrzebne do pierwszego mobile drive testu.

### Multi-touch

Test obowiązkowy:

```text
trzymaj throttle jednym palcem
wykonuj steer taps drugim
kamera nie przejmuje żadnego z tych pointerów
```

## 9. Touch lifecycle i bezpieczeństwo wejścia

Obowiązkowe zdarzenia kończące aktywne komendy:

- `pointerup`;
- `pointercancel`;
- `lostpointercapture`;
- `blur`;
- `visibilitychange` do hidden;
- `pagehide`;
- usunięcie/dispose control surface.

CSS dla obszaru prowadzenia musi jawnie ustawić właściwe `touch-action`, aby przeglądarka nie interpretowała gestu jako scroll/zoom podczas jazdy.

Nie wolno pozostawić:

- zablokowanego gazu po przełączeniu aplikacji;
- skrętu po przychodzącym telefonie/notification overlay;
- pointer ownership po zmianie orientacji;
- key/pointer listenerów po restart/reload fixture.

## 10. Fixed-step input timeline

Obecny host:

1. odczytuje bieżący keyboard state raz na render frame;
2. używa tej samej wartości dla wszystkich catch-up steps.

Skutki:

- tap może zostać zgubiony między klatkami;
- świeży key-down może zostać użyty również dla kilku zaległych kroków symulacji;
- długość komendy zależy od render frame pacing;
- na telefonie efekt będzie bardziej widoczny.

Czysty host przechowuje timestamped device events albo jawny accumulated hold budget i konsumuje je dla kolejnych fixed steps.

Warunek:

```text
ten sam event timeline
+ ten sam physics profile
→ ten sam sequence SteeringCommand
niezależnie od render FPS
```

## 11. UI i safe areas

Obecny HUD:

- jest stałym panelem w lewym górnym rogu;
- może zasłonić znaczną część małego ekranu;
- nie uwzględnia notch/safe-area;
- zawiera instrukcje wyłącznie klawiatury/myszy;
- aktualizuje duży `innerHTML` co 0.2 s.

Pierwszy mobile layout:

- mały status chip;
- rozwijana diagnostyka;
- sterowanie w bezpiecznych dolnych strefach;
- `env(safe-area-inset-*)`;
- landscape i portrait bez wymuszenia orientation lock;
- HUD cadence ograniczona;
- tekst debug nie może leżeć nad control surface;
- control sizes testowane fizycznie palcem, nie tylko CSS screenshotem.

Nie budować od razu PWA, offline cache ani pełnego menu. To nie są blokery pierwszego testu fizyki na telefonie.

## 12. Scan i pamięć

Obecny scan path:

```text
GLTF collision buffers
→ THREE geometry
→ JS number[] positions/indices
→ Float32Array/Uint32Array
→ C++ std::vector copies w bindingu
→ Box3D mesh
```

To tworzy kilka jednoczesnych reprezentacji dużej geometrii. Dodatkowe problemy:

- brak limitu liczby wierzchołków/triangles;
- brak walidacji finite values;
- brak kontroli indeksów i degeneracji;
- binding wymusza welding i nie wystawia edge identification;
- visual scan jest dodawany do sceny przed potwierdzeniem collision mesh;
- w razie późniejszej porażki collidera visual może pozostać jako fałszywa powierzchnia;
- catch-all klasyfikuje invalid asset jako brak opcjonalnego skanu;
- brak pełnego disposal visual geometry/material/texture.

Scan pozostaje poza pierwszym mobile gate. Jego mobilny test wymaga osobnego memory/preflight receipt.

## 13. Front-rig preflight

Przed startem stary host ładuje:

```text
OneSided_Steering_Suspension_Rig.gltf
one_sided_steering_suspension.asset.json
```

Następnie właściwy renderer nie używa tego GLTF do rysowania zawieszenia; renderuje prymitywne diagnostic segments. Preflight sprawdza głównie:

- obecność nazw;
- duplikaty nazw;
- liczbę skinned meshes;
- lokalnie override'owany ownership drift.

Nie sprawdza pełnych transformów, osi, bind pose ani zgodności z live bodies.

Werdykt:

```text
nie ładować ciężkiego assetu przy zwykłym starcie,
jeżeli runtime go nie konsumuje.
```

Preflight należy przenieść do asset validation/CI albo rzeczywiście wykorzystać asset w rendererze po upstream fixie kontraktu.

## 14. Resource lifecycle

Potwierdzone braki starego PoC:

- `KeyboardInput` rejestruje anonimowe window listeners i nie ma `dispose`;
- `RenderContext.dispose` nie przechodzi po scenie i nie niszczy geometry/material/texture;
- `createRigVisuals` nie zwraca własnego dispose handle;
- scan visual nie jest jawnie usuwany przy collision failure;
- dynamic segment resources nie mają pełnej polityki własności;
- startup failure po częściowej alokacji nie ma jednego transakcyjnego cleanup stack;
- restart polega na `window.location.reload`, maskując część leaków zamiast testować lifecycle;
- `requestAnimationFrame` nie jest anulowany ID-em, choć disposed guard ogranicza dalszą pracę.

Na telefonie leak po restartach i ponownych assetach szybciej stanie się krytyczny.

Potrzebny jest `DisposableStack`/resource owner po stronie hosta:

```text
runtime
world
world resources
vehicle
visuals
input adapters
camera
render context
HUD subscriptions
animation frame
```

Startup commit jest atomowy: dopóki wszystkie wymagane elementy nie przejdą, nie stają się active app state.

## 15. Profile renderu

Kandydat pierwszego `MOBILE_LOW_VISUAL`:

```text
DPR cap            1.0 lub 1.25 po pomiarze
antialias           OFF lub measured
shadows             OFF
fog                 optional OFF
debug rig           OFF
scan visual         OFF
campus props        minimal fixture
body visual         optional
wheel visual        optional after primitive boot
HUD cadence         low
texture filtering   measured
```

Desktopowy profil badawczy pozostaje osobny:

```text
DESKTOP_DIAGNOSTIC
```

Nie wolno nazywać mobile low visual „low physics”.

## 16. Performance telemetry

Minimalny raport sesji mobilnej:

```text
device/browser string (informacyjnie)
viewport CSS pixels
DPR requested/effective
render profile
physics profile hash
bundle/runtime version
WASM init ms
asset load ms
world build ms
first useful frame ms
physics step p50/p95/max
render p50/p95/max
catch-up/drop count
body/joint/contact count
JS heap, jeżeli API dostępne
WebGL context loss events
input event -> fixed-step latency
```

Nie używać samego FPS jako kryterium. 60 FPS z gubieniem physics time albo 30 FPS z innym substep profilem nie jest porównaniem.

## 17. Mobile test gates

### M0 — static compatibility

- page loads;
- WebGL renderer powstaje;
- WASM instantiates;
- required exports exist;
- no unsupported/invalid config fallback.

### M1 — minimal boot

- jeden small fixture;
- first useful frame bez pełnych probes;
- primitive vehicle visible;
- poprawny resize/rotation;
- pełny cleanup przy failure.

### M2 — touch drive

- throttle + steering multi-touch;
- brake;
- precise RATE taps;
- pointer cancel/visibility release;
- kamera nie konfliktuje z controls.

### M3 — physics parity subset

- ten sam event trace desktop/mobile;
- ten sam physics profile;
- native/web receipts w uzgodnionym zakresie;
- brak urządzeniowo zależnych sił.

### M4 — real visuals

- body/wheels lazy load;
- orientation/marker/skeleton contracts;
- render profile mieści budżet;
- fallback jest jawny.

### M5 — campus/scan

Dopiero po osobnym memory/mesh/contact audit.

## 18. Kolejność prac, która nie zamraża portu

1. Clean browser core: config, runtime, topology, controller, receipts.
2. Device-independent `SteeringCommand` i fixed-step event timeline.
3. Minimalny desktop host z tym samym API.
4. Mobile touch adapter i low visual profile.
5. Manualny test telefonu na małym fixture.
6. Dopiero potem rozwijanie mobile UI, visuals i campus.
7. Scan osobnym torem.

W ten sposób każda poprawa mobilki testuje czysty port zamiast narzucać mu architekturę.

## 19. Aktualny werdykt

Stary PoC może prawdopodobnie wyświetlić canvas na telefonie, ale nie jest uczciwie mobile-ready:

- brak touch driving;
- brak multi-pointer ownership;
- input zależny od render frame;
- ogromny startup probe workload;
- stały ciężki render profile;
- setki przeszkód w pierwszym świecie;
- brak pełnego lifecycle/disposal;
- ciężkie i częściowo nieużywane preflight assety;
- scan path o dużym peak memory;
- brak pomiarów na prawdziwym telefonie.

Mobilka jest realistycznym krótkoterminowym celem po clean host/input boundary. Nie jest powodem do obniżenia prawdziwości portu.