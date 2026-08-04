# JV Web — kontrakt hosta mobilnego

Updated: 2026-08-04
Status: `ACTIVE CONTRACT / IMPLEMENTATION NOT STARTED`
Owner: Jozz

## 1. Rola telefonu

Telefon jest:

- kolejnym hostem urządzeń wejściowych;
- profilem renderu;
- powierzchnią manualnego owner testu;
- konsumentem tego samego native JV Core + Box3D WASM.

Telefon nie jest:

- osobną wersją fizyki;
- powodem do zmiany koła, substeps lub contact tuning;
- miejscem ukrytych assistów;
- pretekstem do połączenia inputu, UI, renderera i controllerów w jeden workaround.

## 2. Jeden physics profile

Desktop i mobile używają tego samego jawnego physics receipt:

```text
native core and engine identity
fixedDt
substeps
contact tuning
CCD/continuous policy
vehicle config hash
wheel backend id
mass/inertia
assist flags
```

Automatycznie dozwolone różnice urządzeniowe należą wyłącznie do `RenderProfile` i hosta inputu.

Zmiana physics profile wymaga:

- osobnej nazwy;
- jawnej delty;
- nowych native/WASM receipts;
- owner testu;
- zakazu przedstawiania jej jako ten sam fixture.

Szczególnie niedozwolone:

```text
detected mobile device
→ lower substeps
→ same physics identity
```

Substeps wpływają na zbieżność, efektywny contact response i wyniki Wheel Scope, nie tylko CPU.

## 3. Stan fundamentu

Clean browser line już posiada:

- timestamped fixed-step input;
- render-FPS-independent command timeline;
- transactional startup/disposal;
- restart świata bez page reload;
- brak pełnej probe suite przy ordinary startup;
- real WASM world;
- read-only renderer boundary;
- keyboard lifecycle release;
- mały płaski fixture zamiast pełnego campus/scan.

Te problemy starego PR #1 są historyczne, nie aktywnymi blockerami architektury.

Nadal brak:

- touch control surface;
- multi-pointer ownership;
- mobile render profiles;
- safe-area layout;
- real-device performance receipt;
- context-loss recovery test;
- deployment measurement dla przyszłego custom WASM;
- owner mobile drive verdict.

## 4. Device-independent input

Touch buttons emitują ten sam semantyczny typ co klawiatura:

```text
SteeringCommand RELEASE | POSITION | RATE
LongitudinalCommand throttle / brake
```

Pierwszy mobile steering używa RATE dla lewo/prawo. Analog touch POSITION może zostać dodany później jako osobny adapter.

Kontrakt sterowania:

```text
docs/contracts/STEERING_COMMAND_CONTRACT_PL.md
```

Adapter nie zna yaw, slip, wheel forces ani prędkości pojazdu jako ukrytej czułości.

## 5. Pointer ownership

Każdy `pointerId` ma jednego właściciela od `pointerdown` do `up/cancel/lostcapture`.

```text
PointerRouter
  pointerId -> owner

owners
  STEER_LEFT
  STEER_RIGHT
  THROTTLE
  REVERSE
  BRAKE
  CAMERA
  UI
```

Kamera nie może przejąć pointera rozpoczętego na control surface.

Obowiązkowy scenariusz:

```text
hold throttle with finger A
perform steering taps with finger B
camera owns neither pointer
```

## 6. Lifecycle bezpieczeństwa wejścia

Wszystkie aktywne komendy kończą:

- `pointerup`;
- `pointercancel`;
- `lostpointercapture`;
- `blur`;
- `visibilitychange` do hidden;
- `pagehide`;
- disposal control surface;
- runtime rebuild.

Nie może pozostać gaz lub skręt po przełączeniu aplikacji, overlayu systemowym, zmianie orientacji ani utracie capture.

Control surface ma jawne `touch-action`, aby przeglądarka nie interpretowała prowadzenia jako scroll/zoom.

## 7. Render profile

Physics i render pozostają osobnymi kontraktami.

Przykładowe profile:

```text
DESKTOP_DIAGNOSTIC
MOBILE_LOW_VISUAL
```

`MOBILE_LOW_VISUAL` może zmieniać:

- DPR cap;
- antialias;
- shadows i shadow-map size;
- fog;
- debug geometry;
- scan visual;
- texture quality;
- HUD cadence;
- liczbę wizualnych detali.

Nie zmienia:

- fixedDt/substeps;
- contact tuning;
- wheel backend;
- mass data;
- vehicle geometry/tuning;
- steering semantics.

Pierwszy kandydat mobilny:

```text
DPR 1.0–1.25 po pomiarze
shadows OFF
fog optional OFF
debug rig OFF
scan OFF
small flat fixture
compact HUD
```

## 8. UI i safe areas

Pierwszy layout:

- mały status chip;
- diagnostyka rozwijana, nie stale zasłaniająca ekran;
- control surfaces w dolnych bezpiecznych strefach;
- `env(safe-area-inset-*)`;
- landscape i portrait bez wymuszonego locka;
- fizycznie używalne rozmiary przycisków;
- brak tekstu debug nad control surface.

PWA, offline cache i pełne menu nie są blockerem pierwszego testu.

## 9. Bundle i WASM deployment

Published `box3d.js/inline` jest reference backendem. Docelowy native JV Core + Box3D WASM wymaga ponownego pomiaru:

```text
JS bytes and parse time
WASM bytes
fetch/decode/compile/instantiate time
cache behavior
first useful frame
hosting MIME/path requirements
source-map publication policy
```

Inline vs external WASM nie jest wybierane z góry. Decyzję opiera się na realnym telefonie i desktopie.

## 10. Świat i assety

Pierwszy mobile gate używa małego, nazwanego fixture:

- płaski teren lub minimalny test course;
- bez pełnego campus;
- bez scan;
- bez nieużywanych asset preflightów;
- primitive vehicle observer jako pierwszy poziom;
- art assets ładowane dopiero po basic boot.

Mniejszy świat i render nie oznaczają uproszczonej fizyki auta.

Scan wymaga osobnego memory/preflight receipt obejmującego:

- peak copies i heap;
- vertex/index limits;
- finite/index/degenerate validation;
- collider/visual transactional ownership;
- disposal;
- binding options;
- context-loss behavior.

## 11. Performance telemetry

Minimalny receipt sesji:

```text
runtime/core/engine build id
device/browser string (informational)
viewport and effective DPR
render profile id
physics profile hash
WASM init ms
asset load ms
world build ms
first useful frame ms
physics p50/p95/max
render p50/p95/max
catch-up/drop count
input-event -> fixed-step latency
body/joint/contact counters
WebGL context-loss events
heap when available
```

Samo FPS nie jest wynikiem. 60 FPS z dropped physics time nie jest równoważne 30 FPS z poprawnym fixed-step.

## 12. Gates

### M0 — compatibility

- page loads;
- WebGL context or explicit fallback;
- WASM instantiates;
- ABI/runtime identity accepted;
- rejected config creates no physics resources.

### M1 — minimal boot

- one small fixture;
- first useful frame;
- resize/orientation;
- full failure cleanup;
- no heavy diagnostics at startup.

### M2 — touch drive

- throttle/reverse/brake;
- simultaneous throttle + RATE steering;
- pointer ownership;
- cancel/visibility release;
- camera isolation.

### M3 — parity subset

- identical timestamped semantic input;
- identical physics profile;
- native desktop and WASM trace comparison;
- no device-dependent forces.

### M4 — visuals

- lazy body/wheel assets;
- stable part-role binding;
- render budget;
- explicit visual fallback.

### M5 — campus/scan

Dopiero po osobnym memory, mesh i contact audit.

## 13. Stop conditions

Mobile nie jest „gotowe”, dopóki:

- Jozz nie może realnie prowadzić wielodotykiem;
- focus/cancel nie pozostawia komend;
- physics identity jest taka sama jak desktop;
- real-device receipt istnieje;
- render profile mieści budżet bez zmiany mechaniki;
- owner test odróżnia sterowanie, render i fizykę.
