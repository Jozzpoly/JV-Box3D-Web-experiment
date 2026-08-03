# JV Box3D Web — kanoniczny stan projektu

Updated: 2026-08-04
Status: `CANONICAL ACTIVE STATE`

Pełny handoff:

```text
docs/HANDOFF_2026_08_04_PL.md
```

Nowszy checkpoint F5 znajduje się w `AI_PROJECT_MEMORY.md`, issue #12 i draft PR #13.

## 1. Linie projektu

| Linia | Rola | Status |
|---|---|---|
| `main` | minimalny root | bez implementacji |
| `agent/bootstrap-web-poc` / PR #1 | historyczny runnable prototype | kwarantanna, nie scalać |
| `agent/fundamental-audit-rebuild` / PR #2 | audyt i kontrakty | fundament dokumentacyjny |
| `agent/clean-browser-core` / PR #4 | F1 host/input | zakończone maszynowo, draft |
| `agent/typed-box3d-boundary` / PR #6 | F2 WASM/contact | zakończone maszynowo, draft |
| `agent/native-factory-receipt` / PR #9 | F3 config receipt | zakończone maszynowo, draft |
| `agent/current-m6-topology` / PR #11 | F4 current M6 graph | zakończone maszynowo, draft |
| `agent/physical-rate-steering` / PR #13 | F5 K2b RATE | source + matrix obecne, niewykonane |

Wszystkie warstwy są stacked i nie są zmergowane. Jozz zachowuje decyzję merge/review.

## 2. Zakończone checkpointy

```text
F1 484c865253603cdb3860cd517718f610e08d7e98
F2 2c20880932b125920b3c31dee278453d7dcba163
F4 1653e9821d884f2884db2dc53a2cfd9c7f9a9122
```

F3 jest reprezentowane przez PR #9; jego walidowany receipt wskazuje:

```text
native source: a740dec74f4243679c71a17eb59723ee0b42f8bb
native artifact: 78b0be923c52408495c4c7625f9b10ff7ae58db7
receipt blob: 6a5cb337a7d4707946835e83e036365130c52459
```

## 3. Poziom dowodu

### F1

```text
Node 24.16.0
npm 11.17.0
19/19 tests
npm ci / typecheck / build / browser dev host PASS
```

### F2

```text
26/26 tests
real Box3D contact/manifold
B0-B5 PASS
browser world generation 1 -> destroy/rebuild -> 2 PASS
```

### F3

```text
read-only run 30855702375
37/37 tests
strict receipt parser and negative tests PASS
build and Chrome PASS
rejected receipt starts zero physics resources
```

### F4

```text
read-only run 30858244976
46/46 tests
build and Chrome PASS
18 vehicle bodies / 29 joints / 9 shapes
four wheel contacts in generation 1 and 2
RELEASE actuator OFF
```

To nie są jeszcze owner feel ani pełna parity.

### F5

```text
source present
completion matrix present
current draft PR #13
machine execution: NOT YET PERFORMED
owner feel: NOT YET PERFORMED
```

Nie wolno przenosić wcześniejszych PASS F4 na obecny head F5.

## 4. Current M6 graph

F4 odtwarza minimalny aktualny M6 double-wishbone:

- chassis hull;
- 4 wheels;
- 4 shapeless knuckles;
- 8 shapeless control arms;
- shapeless rack;
- 4 spin joints;
- 8 arm hinges;
- 8 ball joints;
- 4 coilovers;
- 2 front tie rods;
- 2 rear fixed toe links;
- rack prismatic joint;
- unique negative collision group per instance;
- temporary `legacy_m6_split_sphere_sidewall` backend;
- one controller and full per-step trace.

Default mechanics remain:

```text
rackCenteringHertz = 0
uprightAssist = false
```

RELEASE disables spring/servo and leaves physical load-dependent rack friction.

## 5. Aktywne F5

```text
issue #12
PR #13 draft / DO NOT MERGE
branch agent/physical-rate-steering
```

Branch zawiera K2b:

- profile 0.06 / 0.12 / 0.21 / 0.36 m/s;
- target lead candidate 0.008 m;
- engage/reversal rebase do live rack;
- delta racka z command value × profile rate × fixedDt;
- clamp do travel i lead cap;
- spring/motor tylko hands-on;
- immediate RELEASE;
- trace mechanizmu;
- browser profile selector i telemetrykę;
- transactional rebuild po zmianie profilu.

Każdy profil ma `productDefaultApproved: false`. `0.21 m/s` nie jest zatwierdzonym defaultem.

Po odzyskaniu przerwanej rozmowy:

- potwierdzono, że czyste F3 i F4 były już ukończone;
- usunięto niedokończone wymagane pole trace bez producenta;
- dodano `tests/f5-rate-steering.test.mjs`;
- utworzono draft PR #13;
- nie uruchomiono żadnego workflowa i niczego nie zmergowano.

## 6. Macierz F5 jest zapisana, ale niezwalidowana

Nowy test source obejmuje:

- tapy 0.5/1/2/3/6 kroków;
- wszystkie cztery rate profiles;
- monotoniczność;
- left/right symmetry;
- exact sub-frame signed-time input;
- release/reversal rebase;
- frozen/blocked-rack lead cap;
- rack travel clamp;
- 15/30/60/120 FPS equivalence;
- irregular cadence i dropped gap;
- profile switch i destroy/rebuild lifecycle.

To jest `SOURCE_FACT`, nie `MEASURED_FACT`. Brakuje rzeczywistego wykonania zależności, typechecku, WASM tests, buildu i browser smoke.

## 7. Kwarantanna F3

Nieudany eksperyment zachowany jest na:

```text
agent/f3-regression-snapshot-2026-08-03@d583d3f
PR #8 CLOSED / QUARANTINED
```

Nie wznawiać samomodyfikującego workflowa ani automatycznej pętli cross-repo.

## 8. Nadrzędne reguły

- brak return-to-zero i centre hold;
- wheels may remain turned at standstill;
- brak speed/yaw/slip stabilizatora;
- brak ukrytych assistów;
- brak hardcoded vehicle defaults zamiast receipt;
- brak nowego tire backendu bez Wheel Scope evidence;
- brak owner/parity claim z samego CI;
- brak merge bez Jozza;
- `Git Diff Patcher Bridge` zabroniony.

## 9. Najbliższy ruch

```text
final source/test review
→ exactly one read-only npm ci/check/build/browser-smoke gate
→ fix only behavior actually falsified by that gate
→ Jozz owner test of all four profiles
→ behavior card and owner verdict
```

Nie zmieniać workflowów dla debugowania. Nie uruchamiać wielu runów. Nie zaczynać F6/mobile przed F5 machine gate i owner verdict.
