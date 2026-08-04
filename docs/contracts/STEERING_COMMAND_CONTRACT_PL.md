# JV — kontrakt semantyczny sterowania kierownicą

Updated: 2026-08-04
Status: `ACTIVE CONTRACT`
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

- bezpośredni baseline natywnego sterowania;
- jawny hands-on target pozycji;
- nie rozwiązuje potrzeby bardzo krótkich, precyzyjnych tapów klawiaturą.

## 3. RATE — aktywny eksperyment K2b

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

Wymagania:

- deterministyczne same-timestamp ordering;
- poprawna zmiana kierunku;
- konsumowanie inputu także podczas dropped intervals;
- `blur`, `visibilitychange`, `pointercancel`, utrata capture i disposal kończą aktywne komendy;
- identyczny timestamped event log daje identyczny command trace przy 15/30/60/120 FPS i nieregularnym render cadence.

## 7. Granica wiedzy adaptera

Device adapter może znać:

- typ zdarzenia;
- kierunek/axis urządzenia;
- timestamp;
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

## 8. Profile badawcze

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

`0.21 m/s` jest historycznym punktem odniesienia, nie zatwierdzonym defaultem.

Aktualny lead candidate:

```text
maxTargetLeadMeters = 0.008
```

## 9. Dowód istniejący

Automatyczna macierz obejmuje:

- tapy `0.5 / 1 / 2 / 3 / 6` step equivalents;
- wszystkie cztery rates;
- monotoniczność;
- sub-frame signed-time mapping;
- engage/reversal rebase;
- immediate release;
- rack travel clamp;
- frozen/blocked-rack lead cap;
- left/right symmetry;
- 15/30/60/120 FPS;
- irregular cadence i dropped gaps;
- profile switch i lifecycle rebuild.

Dynamiczny pomiar na reference backendzie:

```text
stationary held excess: 0.000 mm
driving held excess:    <= 0.284 mm
post-RELEASE peak:       2.541–2.817 mm
contacts:                4
```

Post-RELEASE peak jest obserwacją, nie zatwierdzonym defektem do force-clampowania.

## 10. Owner gate

Automatyzacja nie wybiera finalnego feelu. Jozz ocenia:

- pojedyncze tapy;
- serię drobnych korekt;
- łagodny łuk;
- zmianę kierunku;
- postój i toczenie;
- szybszą jazdę;
- fizyczny ruch po RELEASE;
- klawiaturę i touch przy identycznym timeline.

## 11. Native/WASM direction

Dawna koncepcja osobnego transferu behavior card do kolejnej implementacji została zastąpiona przez ADR-0003.

Docelowo RATE/POSITION/RELEASE należą do wspólnego native JV Core kompilowanego do desktop i WASM. Browser host dostarcza timestamped semantic command, ale nie implementuje drugiego fizycznego aktuatora.
