# Macierz eksperymentu krótkich tapów kierownicy

Data: 2026-08-03

Status: `EXPERIMENT_DESIGN / NO_RUNTIME_RESULT / OWNER_FEEL_REQUIRED`

Powiązany kontrakt: `STEERING_INPUT_RESEARCH_2026_08_03_PL.md`.

## 1. Factory geometry użyta do liczb bazowych

Źródło:

```text
Box3d_FunProject@761bd3ef60992f7dec3bcdddf1945fdbc1cb0825
JozzVehicleM6DefaultConfig
ComputeJozzVehicleM6RackStroke
```

Wartości:

```text
wheelbase              2.50 m
trackHalfWidth         1.05 m
rackHalfWidth          0.45 m
steeringArmBack        0.17 m
kingpinOffset          0.14 m
ackermannFraction      0.60
maxSteeringAngle       32°
rackTravel             około 0.080744 m
```

`rackTravel` jest nieliniową funkcją kąta, nie prostym mnożnikiem 32°.

Przykładowe targety dla lewego wewnętrznego koła przy factory geometry:

| Nominalny kąt | Rack stroke |
|---:|---:|
| 1.2° | około 3.55 mm |
| 2° | około 5.90 mm |
| 4° | około 11.74 mm |
| 8° | około 23.17 mm |
| 16° | około 44.79 mm |
| 32° | około 80.74 mm |

To są geometryczne targety, nie gwarantowany live ruch pod obciążeniem.

## 2. Co robił stary limiter

```text
steerRatePerSecond = 2.25
fixedDt = 1/60
```

Jednokrokowy wzrost normalized command:

```text
2.25 / 60 = 0.0375
```

Przy liniowym mapowaniu normalized command → angle:

```text
0.0375 * 32° = 1.2°
```

Factory rack target dla 1.2° wynosi około:

```text
3.55 mm
```

Bez limitera native A/D kieruje servo natychmiast do około:

```text
80.74 mm
```

Różnica pierwszego targetu jest więc około 22.7×.

To wyjaśnia realną wartość krótkich mignięć. Nie dowodzi, że `2.25/s` jest optymalne.

## 3. Dlaczego rate należy definiować w rack-space

Kandydat K2b powinien używać jawnej:

```text
rackRateMetersPerSecond
```

zamiast normalized angle rate jako wewnętrznej prawdy.

Powody:

- fizyczny aktuator działa na racku;
- stroke↔angle jest nieliniowe;
- różna geometria lub max steer nie powinna cicho zmieniać prędkości fizycznego aktuatora;
- łatwiej ograniczyć accumulated target error w metrach;
- trace jest bezpośrednio porównywalny z prędkością racka i servo capem.

UI może pokazywać przybliżone °/s w bieżącym punkcie, ale config eksperymentu zapisuje m/s oraz geometry receipt.

## 4. Kandydaci rack rate

Pierwszy sweep nie stroi jeszcze produktu. Ma znaleźć użyteczny przedział.

```text
0.06 m/s
0.12 m/s
0.21 m/s  — około starego pierwszego kroku: 3.5 mm / 1/60 s
0.36 m/s
```

Dla jednego idealnego fixed step dają target delta:

| Rack rate | Delta na 1/60 s |
|---:|---:|
| 0.06 m/s | 1.00 mm |
| 0.12 m/s | 2.00 mm |
| 0.21 m/s | 3.50 mm |
| 0.36 m/s | 6.00 mm |

Przy factory geometry, blisko środka, odpowiada to w przybliżeniu coraz większym tapom około ułamka do kilku stopni. Dokładny live wynik jest mierzony, nie zakładany.

## 5. Długości tapów

Każdy rate jest testowany dla jawnego event timeline:

```text
0.5 fixed step equivalent  — sub-frame accumulated hold
1 fixed step              — 16.67 ms
2 fixed steps             — 33.33 ms
3 fixed steps             — 50.00 ms
6 fixed steps             — 100.00 ms
```

`0.5 step` nie może być reprezentowane przez zwykłe polling/latch bez jawnej polityki. Służy do porównania event timeline z one-step latch.

## 6. Stany pojazdu

Każdy tap jest wykonywany w czterech nazwanych fixture:

### T0 — wheel airborne / no contact

Cel:

- sprawdzić czystą odpowiedź aktuatora i linkage;
- oddzielić servo/rack geometry od parking torque.

### T1 — rest on flat ground

Cel:

- parking torque;
- target-error cap;
- natychmiastowy RELEASE;
- brak auto-centering.

### T2 — slow rolling road curve

```text
forward speed target: mały, jawny zakres ustalony w scenariuszu
```

Cel:

- przypadek właściciela: seria drobnych korekt na łagodnym łuku;
- caster/contact back-drive po release.

### T3 — medium-speed straight

Cel:

- sprawdzić, czy identyczny rate nie staje się niebezpiecznie gwałtowny;
- bez automatycznej speed sensitivity.

T3 nie służy do wyboru speed-dependent assistu. Mierzy ograniczenie jednego stałego modelu.

## 7. Trace każdego przebiegu

Per fixed step:

```text
time
raw event interval
render frame ID
physics step ID
SteeringCommand mode/value
handsOn edge
commandedRack
liveRackTranslation
liveRackSpeed
targetError
spring enabled/hertz
target translation
motor speed
motor force cap
rack friction base/load term
left/right steering angle
left/right contact state
forward speed
yaw rate — telemetry only, never input to mapper
```

Yaw/speed/contact nie mogą wpływać na device mapper ani rate. Są tylko wynikiem do oceny scenariusza.

## 8. Negatywne limity K2b

### Target-error cap

Jeżeli live rack jest zablokowany parking torque albo przeszkodą, `commandedRack` nie może uciekać dowolnie daleko.

Kandydat:

```text
abs(commandedRack - liveRack) <= explicitMaxLead
```

`explicitMaxLead` jest osobnym parametrem eksperymentu i musi być dużo mniejszy niż pełny rack travel. Nie może po odblokowaniu wywołać ukrytego skoku.

### Rebase on hands-on edge

Po przejściu `RELEASE -> RATE`:

```text
commandedRack = liveRack
```

Nie odzyskujemy targetu z poprzedniej sesji nacisku.

### Release

W pierwszym kroku po końcu event interval:

```text
mode = RELEASE
handsOn = false
spring = false
brak targetu do środka
```

### Direction reversal

Przy A→D:

- nowa rate działa od bieżącego live rack/ograniczonego leadu;
- brak teleportu targetu przez zero;
- brak ukrytego centre phase.

## 9. Metryki

### Command metrics

```text
requested rack delta
peak target lead
czas hands-on
lost/sub-frame event count
```

### Mechanism metrics

```text
actual rack delta at release
actual rack delta 100/250/500 ms after release
left/right wheel angle at release
left/right angle asymmetry
peak rack force
```

### Precision metrics

```text
minimum repeatable nonzero nudge
standard deviation repeated identical taps
monotonicity tap duration → rack/angle change
left/right symmetry
render-FPS invariance
```

### Physical release metrics

```text
spring/servo off on first release step
post-release movement with vehicle stationary
post-release movement while rolling
```

Nie wymagamy, aby stationary rack pozostał bitowo nieruchomy. Wymagamy braku aktywnego targetu do centrum.

## 10. Render-FPS matrix

Ten sam timestamped event log jest odtwarzany przy render cadence:

```text
15 FPS
30 FPS
60 FPS
120 FPS
nieregularny pattern z lag spikes
```

Physics dt pozostaje `1/60`, 4 substeps.

Expected:

```text
identyczny SteeringCommand sequence
identyczny physics trace w ramach ustalonej deterministyczności hosta
```

Stary polling-per-render-frame nie spełnia tego warunku.

## 11. Desktop i mobile equivalence

Klawiatura i dwa touch buttons produkują ten sam event/intent format:

```text
RATE_LEFT press/release
RATE_RIGHT press/release
```

Test porównuje:

- identyczne event timestamps;
- identyczny command trace;
- identyczny physics trace;
- różny pointer/key provenance wyłącznie w diagnostyce.

Dzięki temu mobilka nie dostaje osobnego modelu fizyki ani innej czułości z ukrytego device detection.

## 12. Owner test course

Automatyka wybiera bezpieczny zakres kandydatów. Jozz wykonuje:

1. pojedyncze tapy na postoju;
2. serię 3–10 tapów przy wolnej jeździe;
3. utrzymanie łagodnego łuku drogi;
4. korektę przeciwną;
5. puszczenie i obserwację casteru;
6. ten sam scenariusz klawiaturą i telefonem;
7. porównanie z bezpośrednim native `±1` baseline;
8. ocenę, czy model daje kontrolę, a nie tylko wolniejszy chaos.

Owner verdict zapisuje:

```text
rate candidate
input timeline policy
target lead cap
accepted / rejected
why
surface/speed/context
```

## 13. Transfer do JV i JES

Po owner verdict web eksportuje behavior card, nie bibliotekę:

```text
SteeringCommand semantics
rack rate
lead cap
rebase/release policy
event timeline policy
fixture receipt
automated measurements
owner verdict
known failures
```

Native JV i JES implementują własny adapter zgodny z kartą. Wspólne jest zachowanie, nie zależność kodowa.

## 14. Aktualny werdykt

Stary `2.25/s` jest uzasadnionym punktem odniesienia, ponieważ zmniejszał pierwszy target około 22.7×. Nie jest jednak zatwierdzonym parametrem.

Pierwszy uczciwy eksperyment bada rack-rate w metrach na sekundę, timestamped events i natychmiastowy RELEASE. Nie zawiera auto-return, centre hold ani speed-dependent assistu.