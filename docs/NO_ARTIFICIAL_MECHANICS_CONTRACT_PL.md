# Kontrakt braku sztucznych mechanik — JV Web

Status: `OWNER_RULE_CAPTURED / PRECISE_DIGITAL_STEERING_RATIFIED_AS_RESEARCH_NEED / IMPLEMENTATION_PENDING`

Rewizja 2026-08-03: Jozz potwierdził, że finite-rate keyboard steering ze starego PoC dawał wartościową możliwość bardzo małych korekt krótkimi kliknięciami. Odzyskujemy ograniczoną szybkość ruchu komendy, ale nie odzyskujemy automatycznego powrotu do zera ani centre-hold. Szczegóły: `STEERING_INPUT_RESEARCH_2026_08_03_PL.md`.

## 1. Reguła nadrzędna

W realistycznym domyślnym JV Web każda siła, moment, constraint, target, tłumienie albo korekta wpływająca na pojazd musi spełnić jeden z warunków:

1. jest wiernym portem jawnego mechanizmu aktualnego native JV na przypiętym commicie;
2. jest koniecznym adapterem API, który zachowuje tę samą semantykę i ma niezależny test;
3. jest eksperymentem/assistem jawnie zatwierdzonym przez Jozza, wyłączonym domyślnie i widocznym w configu, HUD oraz receipcie;
4. jest jawnym modelem aktuatora kierowcy, który przekłada ograniczenia urządzenia wejściowego na hands-on force/position/rate bez odczytywania stanu jazdy i bez generowania stabilizacji pojazdu.

Brak spełnienia któregokolwiek warunku oznacza zakaz w ścieżce produktu.

## 2. Realistyczny default kierownicy

Dla `rackCenteringHertz == 0`:

- aktywna komenda kierowcy może sterować rackiem przez zatwierdzony hands-on actuator;
- zwolnienie sterowania w trybie `RELEASE` oznacza brak aktywnej komendy kierowcy;
- rack spring/servo hands-on zostają zwolnione;
- pozostaje wyłącznie zatwierdzone fizyczne tarcie racka;
- przy postoju caster nie ma wejściowej siły kontaktowej zdolnej wycentrować koła;
- koła mogą pozostać skręcone;
- podczas toczenia kontakt opony, caster trail, geometria zwrotnicy, tie-rody, rack, bezwładność i tarcie mogą fizycznie zmienić skręt.

Host nie może po `RELEASE`:

- prowadzić targetu do zera;
- utrzymywać hands-on lub równoważnej flagi;
- używać timera centre hold;
- ustawiać target translation na zero;
- dodawać prędkości racka w stronę środka;
- odczytywać yaw/slip/speed i generować korektę;
- uznawać końcowego wycentrowania na postoju za warunek PASS.

## 3. Jawne assisty native JV

### `rackCenteringHertz > 0`

Klasyfikacja: `OPTIONAL_ARCADE_ASSIST / DEFAULT_OFF`.

Native opisuje go jako słabą sprężynę do środka działającą również na postoju. Nie należy do realistycznego defaultu.

Polityka odbudowy webowej:

- nie implementować w pierwszym czystym vertical slice;
- import configu z wartością większą od zera kończy się jawnym `UNSUPPORTED_OPTIONAL_ASSIST`, dopóki Jozz osobno nie zatwierdzi wsparcia;
- ewentualna przyszła implementacja musi być dokładnym portem native, domyślnie wyłączonym, wyraźnie oznaczonym i osobno testowanym.

### `uprightAssist == true`

Klasyfikacja: `OPTIONAL_RESCUE_ASSIST / DEFAULT_OFF`.

Jest world-anchored keep-upright helperem, nie uczciwym mechanizmem zawieszenia.

Polityka taka sama: brak wsparcia w pierwszym czystym slice i fail-closed przy imporcie aktywnej wartości.

## 4. Mechanizmy uznane za fizyczne kandydaty

Poniższe mechanizmy mają jawny odpowiednik w przypiętym native JV, lecz nadal wymagają line-by-line port receipt:

- caster i kingpin geometry;
- physical rack body + prismatic joint;
- rigid tie rods;
- load-dependent Coulomb rack friction i stiction ratio;
- steering actuator wyłącznie w jawnym trybie hands-on;
- wheel contact i friction;
- coilovers;
- arm/ball-joint/hinge limits;
- anti-roll force couple;
- torque-based drive;
- brake/coast torque;
- quadratic aero drag;
- legacy split sphere/sidewall fixture, wyłącznie jako stary baseline, nie future wheel architecture.

Samo występowanie w native nie zwalnia z dowodu, że web nie zmienił znaków, osi, kolejności, capów lub warunków aktywacji.

## 5. Semantyka wejścia

Minimalna semantyka nie może już być jednym niejasnym polem `steer` plus opcjonalne `steeringEngaged`.

```text
SteeringCommand =
  RELEASE
  POSITION(-1..1)
  RATE(-1..1)
```

### `RELEASE`

- hands off natychmiast;
- brak targetu do środka;
- brak aktywnego steering spring/servo;
- pozostaje fizyczne tarcie i back-drive.

### `POSITION`

Jawny target kierowcy, odpowiedni między innymi dla analogowej osi lub dotykowego steru pozycyjnego. To hands-on command, nie self-centering.

### `RATE`

Jawna ograniczona szybkość ruchu kierownicy/racka, przeznaczona przede wszystkim dla klawiatury i dotykowych przycisków. Krótki press daje mały nudge. Key-up przechodzi do `RELEASE`, nie do `POSITION(0)`.

Pierwszy kandydat badawczy to rate command bazowany na live rack przy rozpoczęciu hands-on. Może czytać położenie własnego aktuatora, ale nie może czytać stanu jazdy.

## 6. Dozwolone i zakazane sprzężenie

### Zakazane w adapterze urządzenia i ergonomii

- yaw/yaw rate;
- slip/slip angle;
- wheel contact/force;
- vehicle speed jako ukryty regulator czułości;
- travel direction;
- body orientation;
- trajektoria drogi;
- target wynikający z tego, gdzie „powinien” jechać pojazd.

### Dozwolone w jawnym aktuatorze kierowcy

- rack translation;
- rack speed;
- rack limits;
- actuator target error;
- motor/spring force cap;
- edge hands-on/hands-off.

Warunek: dane służą wyłącznie realizacji jawnej komendy `POSITION` lub `RATE`. Nie mogą zmieniać kierunku albo wartości komendy na podstawie ruchu pojazdu.

## 7. Testy obowiązkowe

### `NO_ARTIFICIAL_CENTERING_AT_REST`

Warunki:

- `rackCenteringHertz = 0`;
- `uprightAssist = false`;
- pojazd stoi na płaskim podłożu;
- rack zostaje fizycznie/aktywną komendą ustawiony poza środkiem;
- wejście przechodzi w `RELEASE`;
- brak ruchu postępowego.

Test nie wymaga, aby rack zachował idealnie identyczną liczbę — solver, sprężystość i relaksacja mogą dać drobny ruch. Test sprawdza przyczynę:

- hands-on spring disabled;
- servo target/motor nie generuje ruchu ku centrum;
- max motor force odpowiada wyłącznie modelowi tarcia;
- brak hostowego timer/target;
- brak aktywnej siły zależnej od znaku położenia racka.

### `PHYSICAL_CASTER_RETURN_REQUIRES_ROLLING`

Ten sam stan początkowy, lecz po `RELEASE` pojazd zaczyna toczyć się do przodu. Obserwujemy, czy geometria/contact może back-drive'ować rack. Wynik jest pomiarem mechanizmu, nie wymogiem idealnego zera.

### `DIGITAL_NUDGE_IS_BOUNDED`

Jednokrokowy i krótkotrwały `RATE` musi dać małą, ograniczoną zmianę komendy/racka, nie target pełnego locka.

### `RELEASE_AFTER_NUDGE`

Pierwszy fixed step po zakończeniu tapu musi mieć hands-on OFF. Brak fazy return-to-zero i centre hold.

### `OPTIONAL_ASSISTS_DEFAULT_OFF`

Factory config, pinned preset i czysty web runtime muszą potwierdzić:

```text
rackCenteringHertz == 0
uprightAssist == false
```

### `NO_HIDDEN_DRIVING_STATE_FEEDBACK`

Statyczny scan i testy modułowe odrzucają zależność device adaptera lub rate mappera od yaw, slip, vehicle speed, travel direction, body orientation i wheel forces. Aktuator może czytać wyłącznie własny rack state zgodnie z §6.

## 8. Controller trace zamiast zgadywania

Jeden kontroler pojazdu emituje neutralny trace każdej klatki:

```text
steering_mode
raw_device_intent
commanded_position_or_rate
hands_on
spring_enabled
spring_hertz
target_translation
motor_speed
motor_force_cap
rack_translation
rack_speed
friction_base
friction_load_term
optional_assists_active
```

Watchdog i testy konsumują ten trace. Nie odtwarzają logiki kontrolera po raz drugi.

## 9. Warunek dokumentacyjny

Żaden dokument, HUD ani PR nie może użyć określeń `realistic`, `parity`, `physical` albo `owner validated` bez wskazania:

- źródła i SHA;
- aktywnego configu;
- dokładnego mechanizmu;
- testu automatycznego lub owner receipt;
- znanych różnic.

`Build PASS`, `WASM starts` i `Chrome renders` są dowodami infrastruktury, nie prawdziwości fizyki ani feelu.