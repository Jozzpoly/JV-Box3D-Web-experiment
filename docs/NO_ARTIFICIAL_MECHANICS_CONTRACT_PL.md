# JV/JES — konstytucja braku ukrytych mechanik

Updated: 2026-08-04
Status: `ACTIVE OWNER CONTRACT`
Owner: Jozz

## 1. Reguła nadrzędna

Każda siła, moment, constraint, target, tłumienie, korekta albo automatyczna decyzja wpływająca na pojazd musi należeć do jednej jawnej kategorii:

1. **native mechanism** — pochodzi z przypiętego JV Core i ma source/parity receipt;
2. **semantic adapter** — zachowuje tę samą mechanikę przy zmianie hosta/API i ma falsyfikujący test;
3. **named experiment** — posiada ID, hipotezę, trace, wynik i brak automatycznego promotion;
4. **optional assist** — zatwierdzony przez Jozza, domyślnie OFF, widoczny w configu/HUD/receipcie;
5. **driver actuator** — realizuje jawną komendę kierowcy bez stabilizowania pojazdu na podstawie stanu jazdy.

Mechanizm niespełniający żadnej kategorii jest zakazany w produkcie.

## 2. Jedno źródło fizyki

Docelowo mechanika należy do:

```text
Box3D + native JV Core
```

kompilowanych razem do desktop i WASM.

TypeScript host nie może rozwijać drugiego drivetrainu, tire law, anti-roll, aero, steering actuator albo systemu stabilizacji.

Obecny `legacy_ts_m6` jest nazwanym fixture’em referencyjnym, nie product authority.

## 3. Realistyczny default

```text
rackCenteringHertz = 0
uprightAssist = false
```

Po `RELEASE`:

- hands-on spring/servo jest wyłączone w pierwszym fixed stepie;
- nie istnieje target do zera;
- nie istnieje centre timer/hold;
- pozostaje fizyczne tarcie, geometria, kontakt i bezwładność;
- koła mogą pozostać skręcone na postoju;
- podczas toczenia caster/contact/linkage mogą back-drive’ować rack.

Szczegółowy kontrakt `RELEASE | POSITION | RATE`:

```text
contracts/STEERING_COMMAND_CONTRACT_PL.md
```

## 4. Optional assists

### Rack centering

```text
rackCenteringHertz > 0
classification: OPTIONAL_ARCADE_ASSIST
product default: OFF
```

### Upright helper

```text
uprightAssist = true
classification: OPTIONAL_RESCUE_ASSIST
product default: OFF
```

Dopóki dany assist nie jest wspierany przez bieżący runtime:

- aktywna wartość jest odrzucana fail-closed;
- runtime nie zeruje jej po cichu;
- nie używa zastępczego mechanizmu;
- receipt wskazuje `UNSUPPORTED_OPTIONAL_ASSIST`.

Przyszłe wsparcie wymaga dokładnego native mechanism receipt i osobnego owner verdictu.

## 5. Mechanizmy fizyczne nadal wymagają dowodu

Występowanie w native nie jest automatycznym dowodem poprawnej implementacji w innym buildzie.

Dotyczy między innymi:

- caster/kingpin geometry;
- physical rack + tie-rods;
- load-dependent rack friction;
- coilovers i suspension limits;
- anti-roll couples;
- torque-based drive;
- brake/coast torque;
- aero drag;
- wheel/contact backend.

Każdy port/build porównuje:

- znaki i osie;
- jednostki;
- warunki aktywacji;
- kolejność update;
- caps/limits;
- solver profile;
- source/toolchain identity.

Green liveness test nie wystarcza. Błąd `maxDriveSpeed` pokazał, że ta sama liczba może oznaczać inny mechanizm.

## 6. Zakazane hidden feedback

Device adapter, ergonomic mapper i host nie mogą używać do ukrytej korekty:

```text
yaw / yaw rate
slip / slip angle
vehicle speed
travel direction
body orientation
wheel contact/forces
road trajectory
```

Lokalny actuator może znać własny:

```text
rack translation/speed
limits
target error
force cap
hands-on edge
```

wyłącznie do realizacji jawnej `POSITION` albo `RATE`.

## 7. Koło

`legacy_m6_split_sphere_sidewall` jest:

```text
regression baseline / fallback / failure reference
```

Nie jest przyszłą fizyczną oponą.

Nowy system koła podlega:

```text
contracts/WHEEL_BACKEND_CONTRACT_PL.md
```

Kategorie powierzchni nie mogą przełączać opony między różnymi naturami collidera. Mass/inertia nie mogą zależeć przypadkowo od liczby shapes backendu.

## 8. Trace jako źródło obserwacji

Controller/runtime emituje neutralny trace. Watchdog i testy go konsumują; nie rekonstruują logiki kontrolera drugi raz.

Minimalne pola dla mechanizmu sterowania/napędu:

```text
runtime backend ID and authority
command mode/value
handsOn
spring/motor state
target and live actuator state
force/torque caps
friction/load terms
assist flags
drive mode
wheel target and measured spin
units and coordinate frames
```

Trace nie jest approval. Jest dowodem, jaki mechanizm działał.

## 9. Obowiązkowe negatywne testy

### No artificial centering at rest

Przy assists OFF po RELEASE testuje przyczynę:

- spring/servo OFF;
- brak targetu do środka;
- motor cap wyłącznie fizycznego tarcia;
- brak force zależnej od znaku racka;
- brak host timer/feedback.

Nie wymaga idealnie niezmiennej liczby racka; solver compliance może dać mały ruch.

### Release after nudge

Pierwszy fixed step po końcu tapu ma hands-on OFF.

### Optional assists default OFF

Factory config, runtime config i receipt potwierdzają wartości defaultu.

### No hidden driving-state feedback

Static/module boundary test odrzuca stan jazdy w device adapterze i mapperze RATE.

### Semantic units

Schema/ABI test odrzuca anonimowe pola typu `speed` albo `rate` bez jednostki i znaczenia.

### No silent fallback

Rejected backend/config nie tworzy świata zastępczego ani legacy vehicle bez jawnej decyzji.

## 10. Słownik dowodu

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

Nie wolno spłaszczać tych poziomów do jednego `PASS`.

## 11. Reguła języka projektu

Określenia:

```text
realistic
native parity
physical tire
owner validated
product default
```

wymagają wskazania:

- source/runtime identity;
- aktywnego configu/backendu;
- mechanizmu;
- właściwego poziomu dowodu;
- znanych różnic.

`Build PASS`, `WASM starts`, `four contacts` i `Chrome renders` nie są same w sobie dowodem prawdziwości mechaniki ani feelu.
