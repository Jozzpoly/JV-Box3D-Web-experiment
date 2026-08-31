# JV — kontrakt semantyczny sterowania kierownicą

Updated: 2026-09-01
Status: `ACTIVE CURRENT SEMANTICS / FINAL PHYSICAL SELF-RETURN AND FINAL RANGE NOT APPROVED`
Owner: Jozz

## 1. Typ komendy

```text
SteeringCommand =
  RELEASE
  POSITION(value -1..1)
  RATE(value -1..1)
```

Controller nie rozpoznaje urządzenia. Klawiatura, touch i przyszły gamepad produkują semantyczny timeline zamiast przekazywać device-specific zachowanie do mechaniki pojazdu.

## 2. POSITION

```text
value * physical rack travel
```

Rola:

- bezpośredni jawny hands-on target pozycji;
- aktualny mechanizm touch Direct Rotation / Relative-X;
- użyteczny mechanizm referencyjny;
- nie ustanawia finalnego steering ratio ani fizycznego self-return.

Dla Direct Rotation / Relative-X obowiązuje obecnie:

```text
pointer down -> POSITION ownership
pointer move -> POSITION update
pointer release -> RELEASE
```

Zwykłe puszczenie touch **nie** wysyła `POSITION(0)`.

## 3. Touch steering: physical rack jako truth podczas hands-off

Po `RELEASE` ekranowa kierownica nie może zachować ostatniej pozycji palca jako niezależnej prawdy.

Bieżący kontrakt:

```text
physicalPosition = clamp(liveRack / physicalRackTravel, -1, 1)
```

Gdy touch nie posiada kierownicy:

```text
steering UI position = physicalPosition
```

Nowy grab Direct Rotation / Relative-X zaczyna od tego samego `physicalPosition`.

Dzięki temu sekwencja:

```text
skręt ręką
-> RELEASE
-> świat / kontakt / mechanika zmienia rack
-> ponowny grab
```

nie może tworzyć osobnego offsetu `UI steering != physical steering` ani skoku wynikającego wyłącznie ze starego stanu urządzenia.

Podczas aktywnego grabu live rack może być obserwowany jako najnowszy stan fizyczny, ale nie nadpisuje aktywnego ruchu palca w prezentacji. Po oddaniu ownership physical rack ponownie staje się prawdą prezentacji.

## 4. Touch steering range

Zakres graficznej/manipulacyjnej kierownicy jest jawnym parametrem input/presentation, nie siłą fizycznego centrowania.

Bieżące presety:

```text
360 / 540 / 720 / 900 / 1080 degrees total wheel travel
```

Bieżący default/current-best:

```text
900 degrees total
```

To oznacza ±450° od środka.

Wartość 900° jest obecnie Owner-used i wyraźnie poprawiła feel, ale **nie jest finalnym permanentnie zatwierdzonym ratio**. Pozostałe presety są kandydatami do późniejszego porównania.

Wybrany zakres jest przechowywany w `sessionStorage`. Persistence jest QoL; odmowa storage przez przeglądarkę nie może zablokować sterowania.

Zakres dla aktywnego gestu jest zamrażany na początku grabu. Dynamiczna zmiana ustawienia podczas już trwającego gestu nie jest obecnie zaakceptowanym kontraktem interakcji i nie należy jej traktować jako zwalidowanego use-case'u.

## 5. RATE — bieżący mechanizm referencyjny

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

RATE pozostaje osobnym referencyjnym kontraktem i nie definiuje feelu Direct Rotation.

## 6. RELEASE

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
- ewentualne **jawne** eksperymentalne assisty używane jako control specimen.

W product defaultzie:

```text
rackCenteringHertz = 0
uprightAssist = false
artificial touch centering = OFF / not Owner-facing
```

Koła mogą pozostać skręcone na postoju.

Brak użytecznego naturalnego self-return w obecnym rigu jest otwartym problemem mechanicznym. Nie zmienia semantyki `RELEASE`.

## 7. Odrzucone zachowania jako ukryty product default

```text
automatic return-to-zero
centre hold timer
standstill centre-capture gate
ukryta speed sensitivity
yaw/slip feedback w mapperze
persistent target po zwykłym key-up / pointer-up
oddzielny zamrożony UI steering state po RELEASE
```

Jawny sztuczny centering może istnieć w testach jako control specimen. Nie jest akceptowanym substytutem fizycznego self-return i nie jest Owner-facing ustawieniem bieżącego produktu.

## 8. Timeline urządzenia

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

## 9. Pointer ownership

Dla sterowania dotykowego:

```text
one pointerId -> one semantic control owner
```

Różne pointery mogą równolegle posiadać skręt oraz gaz/hamulec. Jeden pointer nie może przejąć dwóch kontrolek.

Control target przejmuje pointer capture przed wysłaniem pierwszej komendy ownership. Jeżeli capture się nie powiedzie, adapter nie emituje komendy. Dzięki temu failure nie może pozostawić zaciętego gazu lub skrętu.

`pointerup`, `pointercancel` i `lostpointercapture` zwalniają tylko źródło danego pointera. Kontrolki są oddzielnymi elementami ponad canvasem, więc kamera nie przejmuje pointera należącego do sterowania pojazdem.

## 10. Granica wiedzy adaptera

Device adapter może znać:

- typ zdarzenia;
- kierunek/axis urządzenia;
- timestamp;
- `sourceId`;
- pointer/key ownership;
- focus/visibility lifecycle;
- jawny zakres manipulacji kierownicy;
- jawny physical resting position przekazany przez product/runtime boundary dla bezskokowego re-grab.

Nie może samodzielnie wyprowadzać ukrytej korekty z:

- yaw/yaw rate;
- slip/slip angle;
- prędkości pojazdu jako ukrytej czułości;
- wheel forces/contact;
- orientacji chassis;
- przebiegu drogi.

Lokalny actuator może znać rack translation/speed, travel i własny target error. Każde użycie jest widoczne w trace.

Physical rack może być przekazany do warstwy presentation/input jako **jawny resting-state source**, nie jako ukryta stabilizacja handlingu.

## 11. Bieżące profile RATE referencyjne

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

`0.21 m/s` jest punktem referencyjnym RATE, nie zatwierdzonym finalnym feelingiem Direct Rotation.

Bieżący limit lead:

```text
maxTargetLeadMeters = 0.008
```

## 12. Granica akceptacji

Automatyzacja może walidować:

- semantykę komend;
- timeline/lifecycle;
- ownership;
- deterministyczność;
- zakres/persistence;
- re-anchor do live rack;
- brak starego UI/physics offsetu na poziomie kontraktu.

Automatyzacja nie wybiera finalnego feelingu kierownicy ani nie dowodzi fizycznego self-return.

Scoped Owner evidence z 2026-08-31 potwierdza, że aktualny 900° Direct feel jest znacznie lepszy, hands-off UI/rack sync działa, a re-grab po fizycznej zmianie racka nie tworzy poprzedniego offsetu. Nie zatwierdza to wszystkich zakresów ani finalnej mechaniki.

Bieżący browserowy mechanizm jest current-best JV-Web input/presentation. Nie ustanawia finalnej geometrii rigu, steering back-drive/self-align, tire/contact modelu ani finalnego handlingu.
