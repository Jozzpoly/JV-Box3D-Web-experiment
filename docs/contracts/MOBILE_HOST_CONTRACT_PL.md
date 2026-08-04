# JV Web — kontrakt hosta mobilnego

Updated: 2026-08-04
Status: `ACTIVE CONTRACT / IMPLEMENTATION NOT STARTED`
Owner: Jozz

## 1. Rola telefonu

Telefon jest:

- kolejnym hostem urządzeń wejściowych;
- profilem renderu;
- powierzchnią manualnego owner testu;
- konsumentem tego samego runtime backendu co desktop.

Telefon nie jest:

- osobną wersją fizyki;
- powodem do zmiany substeps/contact tuning;
- miejscem ukrytych assistów;
- pretekstem do połączenia inputu, UI, renderera i controllerów w workaround.

Podczas budowy Toru A może używać zamrożonego `legacy_ts_m6`, ale produktowym authority pozostaje przyszły native JV Core + Box3D WASM.

## 2. Jeden physics profile

Desktop i mobile używają tego samego jawnego physics receipt:

```text
runtime/core/engine identity
fixedDt
substeps
contact tuning
CCD policy
vehicle config hash
wheel backend id
mass/inertia
assist flags
```

Automatyczne różnice urządzeniowe należą wyłącznie do render profile i hosta inputu.

Niedozwolone:

```text
detected mobile
→ lower substeps
→ same physics identity
```

Zmiana physics profile wymaga osobnej nazwy, jawnej delty, nowych receipts i owner testu.

## 3. Device-independent commands

Mobile emituje te same komendy semantyczne co desktop:

```text
SteeringCommand RELEASE | POSITION | RATE
LongitudinalCommand throttle / brake
```

Pierwszy eksperyment sterowania mobilnego:

```text
relative RATE steering pad
pointer end/cancel -> RELEASE
```

Analogowe POSITION i gyroscope mogą powstać później jako nazwane, porównywane adaptery. Nie zastępują RATE po cichu.

Adapter nie czyta yaw, slip, wheel forces ani prędkości pojazdu jako ukrytej czułości.

Reverse/brake UX pozostaje decyzją eksperymentalną. Rozważane warianty muszą być nazwane, np.:

```text
separate reverse control
brake-then-reverse
vertical throttle/brake axis
```

Nie wolno ukryć automatycznej zmiany kierunku bez czytelnego stanu UI i owner testu.

## 4. Jeden model zdarzeń i jeden zegar

Implementacja używa Pointer Events, nie równoległych ścieżek Touch Events i Mouse Events.

Obowiązkowe:

- `pointerdown/move/up/cancel`;
- `gotpointercapture/lostpointercapture`;
- `pointerId` jako klucz ownership;
- `pointerType` wyłącznie jako informacja/profile UX, nie physics switch;
- `touch-action` jawnie ustawione per surface;
- brak globalnego blokowania scroll/zoom poza aktywną powierzchnią gry.

Timestamp komendy pochodzi z tego samego monotonicznego `now()` hosta co adapter klawiatury. Surowe `event.timeStamp` nie jest authority, dopóki osobny test nie udowodni zgodności time origin między wspieranymi przeglądarkami.

`getCoalescedEvents()` może zostać dodane po baseline. Nie wolno użyć go tylko na jednym urządzeniu bez trace equivalence.

## 5. Pointer ownership

Każdy `pointerId` ma dokładnie jednego właściciela od `pointerdown` do `up/cancel/lostcapture/dispose`.

```text
PointerRouter
  pointerId -> owner

owners
  STEERING_PAD
  THROTTLE
  BRAKE_REVERSE
  CAMERA_GESTURE
  UI_ACTION
```

Reguły:

1. Ownership przydziela wyłącznie `pointerdown`.
2. Pointer nie może przejść z control surface do kamery w połowie gestu.
3. Wyjście poza element nie zmienia właściciela.
4. Pointer capture jest best-effort transportem; router pozostaje authority także po błędzie capture.
5. Drugi pointer na single-pointer control jest jawnie odrzucany albo staje się no-op; nie sumuje komendy przypadkowo.
6. Kamera może posiadać grupę jednego lub dwóch pointerów, ale każdy pointer nadal ma osobny wpis ownership.
7. Gest kamery nie może przejąć pointera rozpoczętego na steering/throttle/brake.
8. Element usunięty z DOM lub rebuild hosta wymusza release wszystkich jego ownerships.

Obowiązkowy scenariusz:

```text
finger A holds throttle
finger B steers
finger C moves camera
all three retain independent ownership
```

## 6. Semantyka relative RATE pad

Pierwszy pad nie jest joystickiem automatycznie wracającym do `POSITION(0)`.

Minimalny kontrakt:

```text
pointerdown -> hands-on steering session
horizontal relative displacement/velocity -> signed RATE input
clamp -> [-1, +1]
pointerup/cancel/lostcapture -> RELEASE in same timestamped timeline
```

Do eksperymentu należą jawne parametry:

- deadzone w pikselach albo znormalizowanej szerokości;
- mapping displacement/velocity -> signed RATE fraction;
- recenter reference point tylko dla geometrii gestu, nie dla rack targetu;
- visual hands-on indicator;
- opcjonalny haptic tick po owner approval.

Pad nie zna rack position jako ukrytego powodu do centrowania. Fizyczny rack może pozostać skręcony po RELEASE.

## 7. Lifecycle bezpieczeństwa wejścia

Wszystkie aktywne ownerships i komendy kończą:

- `pointerup`;
- `pointercancel`;
- `lostpointercapture`;
- `blur`;
- `visibilitychange` do hidden;
- `pagehide`;
- orientation/layout rebuild;
- disposal control surface;
- runtime rebuild;
- fatal renderer/runtime error.

Release timestamp jest clampowany co najmniej do zużytego kursora timeline, tak jak naprawione adaptery desktopowe.

Nie może pozostać gaz lub hands-on po przełączeniu aplikacji, overlayu systemowym, rozmowie telefonicznej, zmianie orientacji ani utracie capture.

## 8. Browser gesture policy

- steering/throttle/brake surfaces: `touch-action: none`;
- camera viewport: jawna polityka, np. `touch-action: none` podczas gry;
- menu/scrollable overlays: zachowują normalny scroll;
- `preventDefault()` tylko tam, gdzie listener i kontrakt naprawdę tego wymagają;
- brak podwójnego tap-to-zoom na aktywnych controls;
- pinch camera nie może powodować page zoom;
- viewport meta i CSS nie są używane do wyłączania dostępności poza trybem gry.

## 9. Render profile

Physics i rendering pozostają osobnymi kontraktami.

Profile kandydackie:

```text
DESKTOP_DIAGNOSTIC
MOBILE_LOW
MOBILE_MEDIUM
MOBILE_HIGH
AUTO
```

Render profile może zmieniać:

- DPR cap;
- antialias;
- shadows;
- debug geometry;
- scan visual LOD;
- texture quality;
- HUD cadence;
- postprocessing.

Nie zmienia:

- fixedDt/substeps;
- contact tuning;
- wheel backend;
- mass/geometry;
- input command semantics;
- physics clock.

AUTO zmienia tylko rendering na podstawie pomiaru. Nie może zmienić physics profile ani backendu.

Pierwszy baseline mobilny:

```text
small synthetic scene
primitive vehicle observer
shadows OFF
scan OFF
compact Demo HUD
Lab telemetry collapsed
```

DPR cap i pozostałe liczby zostaną przypięte dopiero po real-device baseline.

## 10. Layout, safe areas i tryby

Pierwsza wspierana orientacja: landscape-first.

Wymagane:

- `env(safe-area-inset-*)`;
- controls niezakryte przez notch/system bars;
- minimalny rozmiar touch targets zapisany po teście urządzeń;
- Demo Mode bez debug clutter;
- Lab Mode rozwijany i niekolidujący z controls;
- reset dostępny, ale odporny na przypadkowy tap;
- orientation change daje kontrolowany layout rebuild i release inputu;
- portrait pokazuje czytelny fallback/instrukcję, dopóki nie otrzyma własnego owner-approved layoutu.

PWA, offline cache i fullscreen nie są warunkiem pierwszego mobile gate. Fullscreen jest opcjonalny i musi mieć wyjście.

## 11. Bundle/WASM deployment

Current `box3d.js/inline` jest reference backendem. Docelowy native JV Core + Box3D WASM wymaga pomiaru:

```text
JS bytes/parse
WASM fetch/decode/compile/instantiate
cache behavior
first useful frame
MIME/path requirements
memory growth
context loss/rebuild
source-map publication policy
```

Inline vs external WASM wybieramy na podstawie realnego telefonu i desktopu, nie z góry.

## 12. Świat i assety

Pierwszy mobile gate używa nazwanej synthetic scene:

- mały teren testowy;
- bez pełnego campus/scan;
- bez nieużywanych asset preflightów;
- primitive observer;
- art assets dopiero po basic boot.

Mniejszy świat/render nie oznacza uproszczonej fizyki auta.

Skan używa osobnego scene package contract i memory/preflight receipt obejmującego:

- peak copies/heap;
- vertex/index limits;
- finite/index/degenerate checks;
- render/collision transactional ownership;
- disposal;
- context-loss behavior;
- public asset rights.

## 13. Performance telemetry

Minimalny receipt sesji:

```text
runtime/core/engine build id
device/browser string (informational)
viewport/safe areas/effective DPR
render profile id
physics profile hash
WASM init ms
asset load ms
world build ms
first useful frame ms
physics p50/p95/max
render p50/p95/max
catch-up/drop count
input event -> fixed-step latency
body/joint/contact counters
WebGL context-loss events
heap/WASM memory when available
orientation/background transitions
```

Samo FPS nie jest wynikiem. 60 FPS z dropped physics time nie jest równoważne 30 FPS z poprawnym fixed-step.

## 14. Gates

### M0 — compatibility

- page loads;
- WebGL albo czytelny fallback;
- WASM instantiates;
- runtime identity accepted;
- rejected config tworzy zero physics resources.

### M1 — minimal boot/layout

- synthetic scene;
- first useful frame;
- landscape/portrait fallback;
- safe areas;
- failure cleanup;
- no heavy diagnostics at startup.

### M2 — pointer ownership

- steering pad;
- throttle;
- brake/reverse candidate;
- simultaneous three-pointer scenario;
- cancel/lostcapture/visibility release;
- camera isolation;
- deterministic timestamped command trace.

### M3 — owner drive

- Jozz prowadzi na realnym telefonie;
- ocenia precyzję, zmęczenie, czytelność i przypadkowe aktywacje;
- wynik przypięty do dokładnego commita/layoutu/urządzenia.

### M4 — performance

- cold/warm load;
- 1/5/15 minute session;
- background/resume;
- thermal degradation;
- named render profile receipt;
- brak physics identity drift.

### M5 — native parity subset

- ten sam semantic input trace;
- ten sam physics profile;
- native desktop/WASM comparison;
- brak device-dependent forces.

### M6 — scene/scan

Dopiero po scene contract, memory audit i collision proxy validation.

## 15. Testy przeciwne

- dwa pointery na throttle nie mogą podwoić gazu;
- pointer rozpoczęty na padzie nie może sterować kamerą po wyjściu poza pad;
- `pointercancel` i `lostpointercapture` nie pozostawiają komendy;
- orientation change w trakcie trzech dotknięć kończy wszystkie ownerships;
- background/resume nie wznawia starego gazu;
- usunięcie DOM control surface daje release;
- camera pinch nie zmienia steering timeline;
- AUTO render quality nie zmienia żadnego physics receipt field;
- surowe `event.timeStamp` nie może wejść do timeline bez testu time-origin.

## 16. Stop conditions

Mobile nie jest gotowe, dopóki:

- router nie ma testów wielopointerowych i lifecycle;
- stuck input pozostaje możliwy;
- physics identity różni się od desktopu bez nowej nazwy;
- real-device receipt nie istnieje;
- render profile nie mieści budżetu;
- owner odrzuca feel/ergonomię;
- błąd jest maskowany assistem, reloadem albo wyłączeniem testu.
