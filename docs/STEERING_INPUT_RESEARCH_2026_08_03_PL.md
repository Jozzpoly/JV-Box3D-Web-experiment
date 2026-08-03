# Precyzyjne sterowanie cyfrowe — program badawczy JV Web / JV / JES

Data: 2026-08-03

Status: `OWNER_NEED_RATIFIED / MECHANISM_NOT_SELECTED / IMPLEMENTATION_PENDING`

## 1. Problem właściciela

Jozz potwierdził, że wartościową częścią starego webowego eksperymentu była możliwość wykonywania bardzo krótkich „mignięć” klawiszem A/D, które dawały mały, precyzyjny skręt. Aktualne native JV mapuje klawiaturę bezpośrednio:

```text
A/D puszczone  -> steer = 0
A wciśnięte    -> steer = +1
D wciśnięte    -> steer = -1
```

`ComputeJozzVehicleM6RackAngle` przelicza `steer` bezpośrednio na pełny zakres kąta, a hands-on servo natychmiast otrzymuje target wynikający z tej wartości. Najkrótszy zarejestrowany klik uruchamia więc servo w stronę pełnego targetu. Przy wolnej jeździe po łuku drogi nawet pojedyncze kliknięcie może zmienić skręt o kilka lub kilkanaście stopni i uniemożliwić precyzyjne prowadzenie.

To nie jest błąd fizyki racka. To brak modelu kierowcy dla urządzenia cyfrowego, które ma tylko stany `-1 / 0 / +1`.

## 2. Co w starym modelu było wartościowe

`KeyboardDriverInputModel` ograniczał szybkość narastania komendy do domyślnie:

```text
steerRatePerSecond = 2.25
```

Przy stałym kroku 60 Hz pojedynczy krok zmieniał wartość maksymalnie o:

```text
2.25 / 60 = 0.0375 pełnego zakresu
```

Dzięki temu krótki nacisk nie przekazywał od razu `steer=1`, lecz małą część zakresu. Ta własność jest pożądana i zostaje odzyskana jako osobny problem badawczy.

## 3. Co w starym modelu było błędne

Po key-up stary model:

1. sam prowadził filtrowaną komendę w stronę zera z `releaseRatePerSecond=3.5`;
2. utrzymywał `steeringEngaged=true` podczas całego powrotu;
3. po dojściu do zera utrzymywał servo jeszcze `0.35 s`;
4. był wspierany przez test wymagający centre capture na postoju.

To nie było samo ograniczenie szybkości ruchu dłoni. Było aktywnym prowadzeniem racka do środka, również bez fizycznej siły casteru.

Werdykt:

```text
FINITE INPUT RATE          -> ODZYSKAĆ I ZBADAĆ
AUTOMATIC RETURN TO ZERO   -> ODRZUCONE
CENTRE HOLD TIMER          -> ODRZUCONE
STANDSTILL CENTRE GATE     -> ODRZUCONE
```

## 4. Granice uczciwego modelu

### Adapter urządzenia

Adapter klawiatury, ekranu dotykowego lub gamepada może czytać wyłącznie stan urządzenia i czas zdarzeń. Nie może czytać:

- yaw ani yaw rate;
- slip ani slip angle;
- kierunku jazdy;
- prędkości pojazdu jako ukrytego sterownika czułości;
- wheel contact/force;
- orientacji nadwozia;
- trajektorii drogi.

### Aktuator kierowcy

Jawny model hands-on może czytać własny stan mechanizmu kierowniczego:

- aktualne położenie racka;
- prędkość racka;
- limity racka;
- błąd między jawnym targetem kierowcy a rackiem.

To nie jest stabilizacja pojazdu. Jest lokalnym sprzężeniem aktuatora, analogicznym do serwa znającego pozycję napędzanego elementu. Każde takie użycie musi być widoczne w `steering_mode` i controller trace.

## 5. Kandydaci

### K0 — bezpośredni target pozycji

```text
A -> +1
D -> -1
release -> hands off
```

Status: `NATIVE_BASELINE / FAILS_OWNER_PRECISION_NEED`.

Zaleta: najprostsza i obecnie zgodna z native.

Wada: jedno kliknięcie od razu kieruje servo w stronę pełnego locka.

### K1 — ograniczona pozycja z automatycznym powrotem

```text
key down -> komenda narasta
key up   -> komenda wraca do 0 i nadal steruje rackiem
```

Status: `REJECTED`.

To właśnie skażony model. Dobra czułość nie legalizuje sztucznego centrowania.

### K2 — rate command, natychmiastowe hands off

```text
A/D wciśnięte -> kierowca nadaje ograniczoną prędkość ruchu racka/kierownicy
A/D puszczone  -> aktywny aktuator natychmiast się zwalnia
```

Status: `LEAD_CANDIDATE`.

Jedno mignięcie daje małe przemieszczenie proporcjonalne do czasu nacisku. Po zwolnieniu:

- spring/servo hands-on są wyłączone;
- nie istnieje target do środka;
- dalszy ruch racka wynika z mechaniki, kontaktu i tarcia.

Dwa możliwe warianty implementacyjne:

#### K2a — target o jeden krok przed aktualnym rackiem

```text
target = rackTranslation + direction * rackRate * dt
```

Zaleta: brak utrzymywanego stanu i brak starego targetu przy ponownym naciśnięciu.

Ryzyko: mały błąd targetu może dawać zbyt słaby ruch pod obciążeniem; zachowanie zależy od steering spring/servo gain.

#### K2b — jawny commanded rack position

Na początku hands-on:

```text
commandedRack = currentRackTranslation
```

Podczas trzymania:

```text
commandedRack += direction * rackRate * dt
```

Po key-up command traci aktywność. Przy następnym naciśnięciu jest ponownie bazowany na aktualnym racku.

Zaleta: kierowca kontynuuje ruch mimo chwilowego oporu, ale nigdy nie wraca automatycznie do środka.

Ryzyko: wymaga dokładnego edge/lifecycle contractu i limitu narastającego błędu, aby servo nie magazynowało ogromnego targetu podczas zablokowania.

K2b jest obecnie najbardziej obiecującym kandydatem do pierwszego eksperymentu.

### K3 — inkrementalny target z utrzymaniem hands-on

```text
A/D zmienia persistent target
key-up zachowuje target i nadal trzyma kierownicę
osobna akcja zwalnia kierownicę do hands off
```

Status: `SECONDARY_EXPERIMENT`.

Zaleta: łatwe utrzymanie małego kąta na długim łuku drogi.

Wada: zwykłe puszczenie A/D nie pozwala casterowi back-drive'ować racka. Wymaga nowej, czytelnej akcji `release steering` albo jawnego trybu użytkownika. Nie może wejść jako ukryty default.

### K4 — czułość zależna od prędkości auta

Status: `NOT_IN_INITIAL_SCOPE`.

Może być użytecznym opcjonalnym assistem, ale czyta stan pojazdu i zmienia mapowanie zależnie od prędkości. Nie jest potrzebne, aby rozwiązać podstawowy problem mignięć klawiszem. Najpierw badamy czysty rate command niezależny od pojazdu.

## 6. Kontrakt wejścia

Warstwy nie mogą być zlane w jedno `DriveInput`:

```text
RawDeviceEvents
  keyboard / pointer / gamepad

DeviceIntent
  drive axis
  steer direction / analog value
  brake
  restart / camera
  event timing and active pointers

DriverSteeringCommand
  RELEASE
  POSITION(normalized)
  RATE(normalizedRate)

VehicleController
  realizuje jawny aktuator hands-on albo hands-off
  nie wie, czy komenda pochodzi z klawiatury, telefonu czy gamepada
```

Minimalny typ semantyczny:

```text
SteeringCommand =
  { mode: RELEASE }
  { mode: POSITION, value: -1..1 }
  { mode: RATE, value: -1..1 }
```

Nie wolno ponownie użyć niejasnej flagi `steeringEngaged?`, która pozwala dowolnemu filtrowi utrzymać servo przy wartości bliskiej zera.

## 7. Bardzo krótkie kliknięcia i zegar zdarzeń

Polling samego zestawu aktualnie wciśniętych klawiszy może zgubić kliknięcie, jeżeli `keydown` i `keyup` wystąpią pomiędzy dwoma fixed steps.

Dlatego input host musi jawnie wybrać jedną z polityk:

### Event timeline

Zapisuje timestamp każdego press/release i odtwarza stan dla kolejnych fixed steps. Najdokładniejsze, ale wymaga synchronizacji zegara DOM z zegarem symulacji.

### Accumulated hold time

Gromadzi rzeczywisty czas aktywności kierunku i konsumuje go w fixed steps jako budżet ruchu. Dobre dla rate command, ale musi poprawnie obsłużyć przeciwne kierunki i focus loss.

### One-step latch

Każdy prawidłowy press jest widoczny przez co najmniej jeden fixed step, nawet jeśli release nastąpił wcześniej. Najprostsze i daje minimalny nudge, ale sztucznie kwantuje najkrótsze impulsy.

Pierwszy eksperyment powinien porównać `event timeline` z `one-step latch`. Nie wolno zakładać, że obecny `Set<string>` poprawnie reprezentuje wszystkie szybkie mignięcia.

## 8. Testy automatyczne

### INPUT-E1 — one-frame tap

Dla 60 Hz dokładnie jeden aktywny krok musi wywołać małą, ograniczoną komendę, a nie pełny lock.

### INPUT-E2 — sub-frame press/release

Press i release pomiędzy dwoma render frames nie mogą zostać cicho zgubione bez jawnej polityki.

### INPUT-E3 — release is release

W pierwszym kroku po key-up:

```text
steering mode = RELEASE
spring hands-on = OFF
brak targetu do środka
brak centre timer
```

### INPUT-E4 — frame-rate independence

Ten sam chronologiczny zapis zdarzeń przy różnych render FPS musi dać ten sam ciąg komend fixed-step.

### INPUT-E5 — reversal

A→D nie może przeskakiwać przez środek ani magazynować starego targetu. Wynik ma zależeć od jawnej rate i czasu nacisku.

### INPUT-E6 — focus/pointer cancel

`blur`, `visibilitychange`, `pointercancel` i utrata capture muszą kończyć wszystkie aktywne komendy. Żaden klawisz ani dotyk nie może pozostać „wciśnięty”.

### INPUT-E7 — no vehicle-state stabilizer

Device adapter nie może importować ani otrzymywać yaw, slip, vehicle speed, body orientation ani wheel forces.

## 9. Testy fizyczne

### STEER-P1 — nudge at rest

Krótki tap zmienia rack o małą wartość. Po release servo jest off, a rack nie jest prowadzony do zera.

### STEER-P2 — repeated road-curve nudges

Seria krótkich tapów przy małej prędkości pozwala stopniowo osiągnąć i korygować mały skręt bez skoków o wiele stopni.

### STEER-P3 — rolling caster

Po nudge i release pojazd toczy się. Ewentualna zmiana racka pochodzi z caster/contact, nie z input adaptera.

### STEER-P4 — loaded steering

Na postoju i pod obciążeniem rate command nie może tworzyć narastającego, nieograniczonego targetu ani ukrytego impulsu po odblokowaniu.

### STEER-P5 — left/right symmetry

Ta sama sekwencja czasowa A i D powinna dać symetryczne komendy oraz porównywalny ruch mechanizmu w symetrycznym fixture.

## 10. Owner feel test

Automatyzacja nie ustala finalnej rate ani feelu.

Jozz ocenia przynajmniej:

- pojedyncze bardzo krótkie tapy;
- wielokrotne tapy na łagodnym łuku;
- korektę w drugą stronę;
- postój;
- wolne toczenie;
- szybszą jazdę;
- odzyskanie fizycznego casteru po release;
- klawiaturę i dotykowe przyciski rate steering.

Dopiero po takim teście ustawienie może zostać przeniesione do native JV.

## 11. Relacja JV Web → JV → JES

Nie tworzymy dziś wspólnej biblioteki kodu.

Transfer odbywa się jako behavior card:

```text
problem
jawna semantyka komendy
wariant mechanizmu
parametry
negatywne testy
owner verdict
znane porażki
```

Kolejność:

1. web implementuje odwracalny eksperyment na poprawnym physics fixture;
2. Jozz testuje feel;
3. zatwierdzony model zostaje zaimplementowany osobno w native JV;
4. JES może później wykorzystać ten sam behavior card we własnym systemie wejścia, bez zależności kodowej od JV.

## 12. Decyzja pierwszego eksperymentu

Pierwszy clean experiment po odbudowie podstawowego fixture:

```text
K2b commanded rack rate
+ natychmiastowe RELEASE po key-up
+ rebase do live rack przy hands-on edge
+ event timeline albo jawny one-step latch
+ brak speed dependence
+ brak auto-return
+ pełny controller trace
```

To jest kierunek badania, nie jeszcze zatwierdzony produktowy default.