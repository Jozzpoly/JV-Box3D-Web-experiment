# JV Box3D Web — kanoniczny stan projektu

Updated: 2026-08-04
Status: `CANONICAL CURRENT STATE`
Owner: Jozz

## 1. Produkt i cel

JV Web ma być przeglądarkowym hostem tego samego mechanicznego systemu Jozz Vehicle, a nie niezależną grą imitującą natywne zachowanie.

Docelowy podział odpowiedzialności:

```text
native JV Core + Box3D WASM -> fizyka, blueprint compiler, telemetryka
TypeScript host             -> input, lifecycle, render, UI, eksperymenty
```

Decyzja architektoniczna: `docs/decisions/ADR-0003-native-jv-core-wasm.md`.

## 2. Bieżąca gałąź

```text
agent/jv-web-refoundation
```

Punkt startowy:

```text
agent/f5-dynamic-steering-validation
0d938e402f618ae34e0d959a9862d97c2f88a926
```

Refoundation jest odseparowane od wszystkich historycznych stacked PR-ów. Nic nie jest scalane ani oznaczane jako ready bez Jozza.

## 3. Co realnie działa

Na zwalidowanym headzie bezpośrednio poprzedzającym refoundation potwierdzono lokalnie:

```text
Node 24.16.0
npm 11.17.0
TypeScript PASS
75/75 tests PASS
Vite production build PASS
browser startup and physical drive PASS
```

Działający reference runtime posiada:

- deterministyczny fixed-step;
- timestamped steering input;
- timestamped forward/reverse/brake input;
- transactional lifecycle i restart świata;
- prawdziwy `box3d.js` WASM;
- receipt-derived M6 double-wishbone graph;
- 18 vehicle bodies / 29 joints / 9 shapes;
- fizyczny rack i tie-rody;
- `RELEASE | POSITION | RATE`;
- profile RATE `0.06 / 0.12 / 0.21 / 0.36 m/s`;
- cztery kontakty koła–teren w zwalidowanych scenariuszach;
- read-only WebGL observer;
- fizyczne wheel-motor drive, reverse, coast i brake;
- dynamiczną macierz rack excursion.

To są wyniki mechanicznego liveness, determinism i internal consistency. Nie są pełnym native parity ani owner approval całego prowadzenia.

## 4. Krytyczna rozbieżność napędu

Receipt zawiera:

```text
maxDriveSpeed = 40
maxDriveTorque = 320
wheelRadius = 0.514062464
```

Natywne JV definiuje `maxDriveSpeed` jako wheel motor rev limit w `rad/s`.

Obecny TypeScript backend interpretuje tę samą wartość jako liniowy target w `m/s`, następnie oblicza:

```text
targetWheelAngularSpeed = targetLinearSpeed / wheelRadius
```

oraz wyznacza torque taper z prędkości chassis, podczas gdy native korzysta z rzeczywistego spin speed danego koła.

Konsekwencja:

```text
native full-throttle target ≈ 40 rad/s
legacy TS full-throttle target ≈ 77.8 rad/s
```

Przy częściowym gazie semantyka również się różni: native utrzymuje rev target i skaluje moment, legacy TS skaluje także prędkość docelową.

Wniosek:

```text
legacy_ts_m6 is deterministic and drivable
legacy_ts_m6 native drive parity = FAIL / NOT PRODUCT AUTHORITY
```

Nie rozwijać dalej produktu fizycznego przez ręczne dopisywanie kolejnych mechanizmów M7 w TypeScripcie.

## 5. Dynamiczny rack excursion — aktualna interpretacja

Macierz na realnym WASM zmierzyła:

```text
stationary held RATE peak excess: 0.000 mm
driving held RATE peak excess:    <= 0.284 mm
post-RELEASE peak excess:         2.541–2.817 mm
minimum terrain contacts:         4
```

To obala hipotezę, że commanded RATE target wychodzi poza natywny rack travel podczas aktywnego sterowania.

Obecny status:

```text
command clamp: PASS
held physical compliance: measured, small
post-RELEASE transient/residual: measured, mechanism not yet isolated
force-clamp fix: REJECTED WITHOUT NATIVE COMPARISON
```

Nie stroić ani nie clampować racka tylko po to, aby wyzerować tę liczbę. Najpierw potrzebne są mechanizm-specific trace i porównanie native/WASM.

## 6. Backend status

### `legacy_ts_m6`

Obecny kod w `src/vehicle/m6/`.

Rola:

- reference implementation;
- browser integration fixture;
- input/lifecycle/render development;
- A/B baseline;
- known-failure reproduction.

Nie jest:

- źródłem prawdy mechaniki produktu;
- pełnym M7;
- miejscem przyszłej opony;
- dowodem native parity.

### `native_jv_wasm`

Status:

```text
architecture accepted
implementation not started
```

Najmniejszy milestone:

```text
same JV Core + same Box3D source
→ native executable
→ one WASM module
→ create/input/step/snapshot
→ one settle+drive scenario
→ quantized native/WASM comparison
```

## 7. Koło

Aktywny reference backend:

```text
legacy_m6_split_sphere_sidewall
```

Rola:

```text
regression baseline / fallback / negative-result reference
```

Nie jest przyszłą architekturą opony.

Nowy backend ma wejść przez natywny, wymienny seam Wheel Scope/JV Core. Deformacja, ciśnienie, tread, shoulders, sidewalls, bead i rim muszą należeć do jednego współdzielonego systemu stanu, nawet jeśli są modelowane warstwowo.

## 8. Dokumentacja

Problem zastany:

- około 11,5 tys. linii dokumentacji;
- wiele broad audits z 2026-08-03;
- kilka równoległych opisów aktualnego stanu;
- README nadal opisywał F1 jako aktywny etap;
- PROJECT_STATE twierdził, że F5 nie wykonano;
- handoff i memory dublowały branche, wyniki i zakazy.

Aktywny program:

- `docs/REFOUNDATION_LOOP_PL.md`;
- `docs/DOCUMENT_CLEANUP_MANIFEST_2026_08_04_PL.md`.

Docelowy read-first chain ma najwyżej pięć pozycji. Broad audits, handoffy i kwarantanny trafiają do indeksowanego archiwum.

## 9. Workflow i bezpieczeństwo

- brak merge bez Jozza;
- brak ready-for-review bez Jozza;
- brak Actions w refoundation;
- brak samomodyfikujących workflowów;
- brak cross-repo commit loop;
- brak Git Diff Patcher Bridge;
- historyczne PR-y i branche pozostają nietknięte;
- każda destrukcyjna redukcja dokumentacji musi być odwracalna z historii Gita i poprzedzona ekstrakcją wiedzy.

## 10. Najbliższa sekwencja

```text
C1  skompresować aktywny front dokumentacji
C2  zarchiwizować broad audits i handoffy
C3  usunąć sprzeczne aktywne linki i stare workflowy jednorazowe
C4  nazwać backend legacy_ts_m6 w kodzie i telemetryce
C5  dodać unit/semantic contract dla drive fields
C6  zaprojektować versioned native ABI z jednostkami
C7  zbudować minimalny native JV Core + Box3D WASM spike
C8  uruchomić native/WASM parity scenarios
C9  podmienić backend dopiero po dowodzie
```

## 11. Obecne otwarte pytania

1. Jaki najmniejszy zestaw plików natywnego JV można wydzielić z `samples/` bez hosta Sokol/ImGui?
2. Czy bit-identical trajectory hash jest osiągalny native/WASM, czy potrzebna będzie tolerowana kwantyzowana equivalence?
3. Jak versionować ABI i snapshot bez uzależniania przeglądarki od `b3BodyId`?
4. Jak połączyć RATE mapper z natywnym rackiem bez tworzenia trzeciej implementacji dla mobile?
5. Które elementy najnowszego Wheel Scope istnieją tylko lokalnie i wymagają osobnego, przypiętego source receipt?
