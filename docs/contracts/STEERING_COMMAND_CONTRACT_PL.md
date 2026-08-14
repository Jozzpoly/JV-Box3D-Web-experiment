# JV — kontrakt semantyczny sterowania kierownicą

Updated: 2026-08-14
Status: `ACTIVE CURRENT SEMANTICS / FINAL FEEL NOT APPROVED`
Owner: Jozz

## 1. Typ komendy

```text
SteeringCommand =
  RELEASE
  POSITION(value -1..1)
  RATE(value -1..1)
```

Controller nie rozpoznaje urządzenia. Klawiatura, touch i gamepad produkują ten sam semantyczny timeline.

## 2. POSITION

```text
value * physical rack travel
```

Rola:

- bezpośredni jawny hands-on target pozycji;
- użyteczny mechanizm referencyjny;
- nie rozwiązuje potrzeby bardzo krótkich, precyzyjnych tapów klawiaturą.

## 3. RATE — bieżący mechanizm referencyjny

RATE działa w fizycznym rack-space:

```text
rackRateMetersPerSecond
```

Nie w normalized angle rate i nie w stopniach na sekundę.

Na `RELEASE -> RATE`:

```text
commandedRack = liveRack
```

Podczas kroku:

```text
commandedRack += commandValue * rackRateMetersPerSecond * fixedDt
```

Target jest ograniczony przez:

```text
physical rack travel
liveRack ± maxTargetLeadMeters
```

Przy zmianie znaku RATE commanded target jest ponownie bazowany na live racku. Stary target nie może zostać odzyskany ani przeskoczyć przez środek.

## 4. RELEASE

W pierwszym fixed stepie po końcu aktywnego interval:

```text
mode = RELEASE
handsOn = false
spring/servo target = OFF
motor request = 0
commandedRack = inactive
```

Pozostają wyłącznie fizyczne mechanizmy:

- rack friction;
- caster/contact;
- linkage forces;
- inertia;
- ewentualne jawne assisty, jeżeli są osobno włączone.

W defaultzie:

```text
rackCenteringHertz = 0
uprightAssist = false
```

Koła mogą pozostać skręcone na postoju.

## 5. Odrzucone zachowania

```text
automatic return-to-zero
centre hold timer
standstill centre-capture gate
ukryta speed sensitivity
yaw/slip feedback w mapperze
persistent target po zwykłym key-up
```

## 6. Timeline urządzenia

Wybrana polityka:

```text
timestamped event timeline
+ signed active time / fixed-step interval
```

Sub-frame tap jest zachowany proporcjonalnie. Nie jest sztucznie wydłużany do jednego pełnego kroku i nie może zostać zgubiony tylko dlatego, że keydown/keyup wystąpiły pomiędzy render frames.

Każdy adapter dostarcza stabilny `sourceId`. Aktywny stan strony nie jest jednym globalnym booleanem, lecz zbiorem aktywnych źródeł:

```text
LEFT  = Set<sourceId>
RIGHT = Set<sourceId>
```

Konsekwencje:

- puszczenie touch nie może anulować nadal trzymanej klawiatury;
- puszczenie jednego klawisza nie może anulować drugiego klawisza mapowanego na tę samą stronę;
- `RELEASE_ALL(sourceId)` usuwa wyłącznie stan należący do danego źródła;
- globalne zdarzenie lifecycle zwalnia wszystko dlatego, że każdy aktywny adapter zwalnia własne źródła, a nie dlatego, że jeden adapter kasuje cudzy stan.

Wymagania:

- deterministyczne same-timestamp ordering;
- poprawna zmiana kierunku;
- konsumowanie inputu także podczas dropped intervals;
- `blur`, `visibilitychange`, `pagehide`, `pointercancel`, utrata capture i disposal kończą własne aktywne komendy adaptera;
- timestamp eventu jest ograniczony co najmniej do już skonsumowanego kursora timeline;
- identyczny timestamped event log daje identyczny command trace przy 15/30/60/120 FPS i nieregularnym render cadence.

## 7. Pointer ownership

Dla sterowania dotykowego:

```text
one pointerId -> one semantic control owner
```

Różne pointery mogą równolegle posiadać skręt oraz gaz/hamulec. Jeden pointer nie może przejąć dwóch kontrolek.

Control target przejmuje pointer capture przed wysłaniem pierwszego `pressed=true`. Jeżeli capture się nie powiedzie, adapter nie emituje komendy. Dzięki temu failure nie może pozostawić zaciętego gazu lub skrętu.

`pointerup`, `pointercancel` i `lostpointercapture` zwalniają tylko źródło danego pointera. Kontrolki są oddzielnymi elementami ponad canvasem, więc kamera nie przejmuje pointera należącego do sterowania pojazdem.

## 8. Granica wiedzy adaptera

Device adapter może znać:

- typ zdarzenia;
- kierunek/axis urządzenia;
- timestamp;
- `sourceId`;
- pointer/key ownership;
- focus/visibility lifecycle.

Nie może znać:

- yaw/yaw rate;
- slip/slip angle;
- prędkości pojazdu jako ukrytej czułości;
- wheel forces/contact;
- orientacji chassis;
- przebiegu drogi.

Lokalny actuator może znać rack translation/speed, travel i własny target error. Każde użycie jest widoczne w trace.

## 9. Bieżące profile referencyjne

```text
0.06 m/s -> 1.0 mm na idealny krok 1/60 s
0.12 m/s -> 2.0 mm
0.21 m/s -> 3.5 mm
0.36 m/s -> 6.0 mm
```

Każdy profil:

```text
productDefaultApproved = false
```

`0.21 m/s` jest bieżącym punktem referencyjnym, nie zatwierdzonym finalnym feelingiem.

Bieżący limit lead:

```text
maxTargetLeadMeters = 0.008
```

## 10. Granica akceptacji

Automatyzacja może walidować semantykę komend, timeline, lifecycle i deterministyczność, ale nie wybiera finalnego feelingu kierownicy.

Obecny browserowy mechanizm jest użytecznym referencyjnym zachowaniem JV Web. Nie ustanawia finalnej geometrii rigu, steering back-drive/self-align ani finalnego handlingu. Te elementy pozostają poza tym kontraktem i powinny być rozstrzygane dopiero na lepszych danych geometrycznych/autorskich.
