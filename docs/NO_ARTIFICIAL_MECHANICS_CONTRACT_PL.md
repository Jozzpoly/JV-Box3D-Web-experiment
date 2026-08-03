# Kontrakt braku sztucznych mechanik — JV Web

Status: `OWNER_RULE_CAPTURED / IMPLEMENTATION_PENDING`

## 1. Reguła nadrzędna

W realistycznym domyślnym JV Web każda siła, moment, constraint, target, tłumienie albo korekta wpływająca na pojazd musi spełnić jeden z warunków:

1. jest wiernym portem jawnego mechanizmu aktualnego native JV na przypiętym commicie;
2. jest koniecznym adapterem API, który zachowuje tę samą semantykę i ma niezależny test;
3. jest eksperymentem/assistem jawnie zatwierdzonym przez Jozza, wyłączonym domyślnie i widocznym w configu, HUD oraz receipcie.

Brak spełnienia któregokolwiek warunku oznacza zakaz w ścieżce produktu.

## 2. Realistyczny default kierownicy

Dla `rackCenteringHertz == 0`:

- aktywne A/D może sterować rackiem przez zatwierdzony hands-on servo;
- zwolnienie A/D oznacza brak aktywnej komendy kierowcy;
- rack spring/servo zostają zwolnione;
- pozostaje wyłącznie zatwierdzone fizyczne tarcie racka;
- przy postoju caster nie ma wejściowej siły kontaktowej zdolnej wycentrować koła;
- koła mogą pozostać skręcone;
- podczas toczenia kontakt opony, caster trail, geometria zwrotnicy, tie-rody, rack, bezwładność i tarcie mogą fizycznie zmienić skręt.

Host nie może po key-up:

- prowadzić targetu do zera;
- utrzymywać `handsOn` lub równoważnej flagi;
- używać timera centre hold;
- ustawiać target translation na zero;
- dodawać prędkości racka w stronę środka;
- odczytywać rack/yaw/slip/speed i generować korektę;
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
- steering servo wyłącznie hands-on;
- wheel contact i friction;
- coilovers;
- arm/ball-joint/hinge limits;
- anti-roll force couple;
- torque-based drive;
- brake/coast torque;
- quadratic aero drag;
- split sphere/sidewall collision envelope.

Samo występowanie w native nie zwalnia z dowodu, że web nie zmienił znaków, osi, kolejności, capów lub warunków aktywacji.

## 5. Semantyka wejścia klawiaturowego

Pierwszy czysty slice używa semantyki minimalnej zgodnej z native:

```text
A/D aktywne  -> jawna komenda steer
A/D zwolnione -> steer = 0 / hands off
```

Nie ma automatycznego powrotu wirtualnej kierownicy.

Finite-rate input może wrócić wyłącznie jako osobny eksperyment po decyzji Jozza. Musi wtedy odpowiedzieć na pytania:

- co dokładnie reprezentuje wartość po puszczeniu klawisza;
- czy key-up oznacza hands off, hold, czy ręczne prowadzenie do środka;
- jak użytkownik jawnie wydaje każde z tych poleceń;
- czy model nie czyta stanu pojazdu;
- czy default pozostaje zgodny z native;
- czy poprawa ergonomii nie zmienia mechaniki samochodu.

## 6. Testy obowiązkowe

### `NO_ARTIFICIAL_CENTERING_AT_REST`

Warunki:

- `rackCenteringHertz = 0`;
- `uprightAssist = false`;
- pojazd stoi na płaskim podłożu;
- rack zostaje fizycznie/aktywną komendą ustawiony poza środkiem;
- wejście przechodzi w hands off;
- brak ruchu postępowego.

Test nie wymaga, aby rack zachował idealnie identyczną liczbę — solver, sprężystość i relaksacja mogą dać drobny ruch. Test sprawdza przyczynę:

- rack spring disabled;
- servo target/motor nie generuje ruchu ku centrum;
- max motor force odpowiada wyłącznie modelowi tarcia;
- brak hostowego timer/target;
- brak aktywnej siły zależnej od znaku położenia racka.

### `PHYSICAL_CASTER_RETURN_REQUIRES_ROLLING`

Ten sam stan początkowy, lecz po hands off pojazd zaczyna toczyć się do przodu. Obserwujemy, czy geometria/contact może back-drive'ować rack. Wynik jest pomiarem mechanizmu, nie wymogiem idealnego zera.

### `OPTIONAL_ASSISTS_DEFAULT_OFF`

Factory config, pinned preset i czysty web runtime muszą potwierdzić:

```text
rackCenteringHertz == 0
uprightAssist == false
```

### `NO_HIDDEN_STATE_FEEDBACK`

Statyczny scan i testy modułowe odrzucają zależność input mappingu od:

- yaw/yaw rate;
- slip/slip angle;
- rack translation/speed/force;
- wheel contact/force;
- vehicle speed;
- travel direction;
- body orientation.

Wyjątki wymagają osobnej, owner-ratyfikowanej mechaniki i nie mogą wejść jako ergonomia hosta.

## 7. Controller trace zamiast zgadywania

Jeden kontroler pojazdu emituje neutralny trace każdej klatki:

```text
steering_mode
input_steer
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

## 8. Warunek dokumentacyjny

Żaden dokument, HUD ani PR nie może użyć określeń `realistic`, `parity`, `physical` albo `owner validated` bez wskazania:

- źródła i SHA;
- aktywnego configu;
- dokładnego mechanizmu;
- testu automatycznego lub owner receipt;
- znanych różnic.

`Build PASS`, `WASM starts` i `Chrome renders` są dowodami infrastruktury, nie prawdziwości fizyki ani feelu.