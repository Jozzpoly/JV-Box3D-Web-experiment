# Audyt natywnego walidatora i autorytetu assetów

Data: 2026-08-03

Status: `SEMANTIC_PASS / SELECTED_SOURCE_PATHS / NO_BLANKET_VALIDATOR_AUTHORITY`

Źródło główne:

```text
Jozzpoly/Box3d_FunProject
jozz-scan-terrain-f0@761bd3ef60992f7dec3bcdddf1945fdbc1cb0825
```

Cel: ustalić, które native testy i asset pipelines mogą być źródłem receipts dla clean weba, a które są tylko diagnostyką, historycznym smoke albo wspólnym modelem mogącym przepuścić ten sam błąd.

---

## 1. Walidator nie jest jednym poziomem dowodu

`jozz_vehicle_validation` agreguje w jednym końcowym wyniku:

- M5 historyczne smoke i wheel-shape experiment;
- M6 suspension/envelope;
- M7 landing/hands-off/drive/trailing-arm;
- P1–P6 steering/config/stress;
- preset determinism;
- map layout;
- asset metadata i sidecar contracts.

Zbiorcze `OK` oznacza wyłącznie, że wszystkie zarejestrowane bool checks zwróciły true. Nie oznacza automatycznie:

- bieżącego owner-approved produktu;
- identycznego poziomu dojrzałości każdego probe;
- poprawności wydrukowanych liczb nieobjętych assertion;
- visual correctness;
- feel correctness;
- że każdy probe używa niezależnego expected modelu;
- że wszystkie aktualne branche i local sessions zostały odtworzone.

`README_FOR_AGENTS.md` samo ostrzega, że zielony końcowy wynik nie zastępuje czytania wydrukowanych liczb.

## 2. Wartościowe probe patterns do odzysku

### V-PATTERN-01 — test falsyfikacyjny mechanicznej ścieżki

`RunM7HandsOffAlignProbe` porównuje:

```text
free rack
frozen rack przez absurdalnie duże friction
```

Jeżeli kontra pochodzi mechanicznie przez contact→knuckle→tie rods→rack, zamrożenie racka musi zabić efekt. Scripted steer ponad fizyką przetrwałby.

Status: `HIGH_VALUE_MECHANISM_FALSIFICATION`.

Ograniczenia:

- scenariusz jest sztucznie inicjalizowany przez obrót prędkości wszystkich bodies;
- próg nie jest owner feel verdictem;
- nadal używa tego samego runtime buildera.

Dobre zastosowanie webowe: native/exported scenario + controller/contact trace, nie ręczne przepisanie oczekiwań.

### V-PATTERN-02 — assist OFF kontra ON

`RunP4CenteringAssistProbe` jawnie przypina:

```text
rackCenteringHertz = 0
→ brak centrowania przy postoju

rackCenteringHertz = 12
→ opt-in assist centruje przy postoju
```

Status: `HIGH_VALUE_NEGATIVE_INVARIANT`.

Ten probe bezpośrednio obala stare webowe centre-capture.

### V-PATTERN-03 — derived stale-value regression

P2 zmienia steering geometry i wymaga, aby recompute zmienił `rackTravel`.

Status: `VALUABLE_DERIVED_DEPENDENCY_TEST`.

Ograniczenie: expected value nadal pochodzi z tego samego helpera. Potrzebny osobny geometry receipt albo niezależny numeric fixture.

### V-PATTERN-04 — measured mass guard

P6 mierzy live body mass i porównuje z analityczną masą samej sfery. Przypina density=0 sidewalla i obala hipotezę o podwójnej masie.

Status: `HIGH_VALUE_MEASURED_GUARD`.

### V-PATTERN-05 — broken config sanitize + build

P6 tworzy konfigurację z:

- zerowym ramieniem;
- ujemną gęstością;
- unsafe max steer/Ackermann;
- NaN travel.

Następnie wymaga:

- sanitizer zgłasza zmianę;
- dead-point fence jest respektowany;
- sanitized fixture buduje się i pozostaje finite.

Status: `VALUABLE_FAIL_CLOSED_DIRECTION`, choć obecny sanitizer naprawia część danych zamiast odrzucać całą sesję. Web import policy może być bardziej rygorystyczna i nadal używać native sanitization jako migracji, nie cichego loadu.

### V-PATTERN-06 — deterministic preset overlay

Preset ma być:

```text
factory baseline + preset keys
```

nie:

```text
current mutated config + preset keys
```

Status: `HIGH_VALUE_AUTHORED_TRUTH_RULE`.

## 3. Ograniczenia helperów i wspólnego modelu

### `IsM6VehicleStateValid`

Sprawdza:

- chassis position;
- chassis linear velocity;
- pozycję czterech wheel bodies.

Nie sprawdza bezpośrednio:

- rack;
- knuckles;
- upper/lower arms;
- trailing arms;
- body rotations i angular velocities wszystkich bodies;
- joint IDs/frames;
- reaction forces;
- constraint error;
- mass/inertia;
- contacts;
- shape counts;
- teleportu pojedynczego arm body przy poprawnej pozycji koła.

Nazwa `vehicle state valid` jest więc szersza niż faktyczny zakres.

Clean web powinien używać bardziej precyzyjnych nazw:

```text
CHASSIS_AND_WHEEL_POSES_FINITE
ALL_RIG_BODIES_FINITE
JOINT_TOPOLOGY_VALID
CONSTRAINT_ERROR_WITHIN_BOUND
```

### Shared expected helpers

Kilka probe porównuje runtime z wartością wyliczoną tym samym helperem, na przykład:

- Ackermann targets;
- rack stroke;
- dead point;
- geometry-based fences.

Chroni to przed zapomnieniem recompute lub wiring error, ale nie przed błędem we wspólnym wzorze.

Status:

```text
INTERNAL_CONSISTENCY
not
INDEPENDENT_PHYSICS_TRUTH
```

### Szerokie liveness thresholds

Przykłady klas progów:

- roughly straight;
- finite;
- upright above a loose dot threshold;
- camber/rear steer below broad damage bounds;
- no huge teleport;
- reaches some speed.

Są sensowne jako explosion/regression tripwires. Nie dowodzą subtelnego feelu ani parytetu.

## 4. Ground/contact bias native validatora

`CreateM6SmokeGround()` zawsze:

- wyłącza continuous collision;
- tworzy duże płaskie podłoże;
- przypisuje `JOZZ_M6_TERRAIN_CATEGORY`.

Legacy split wheel na takim groundzie używa wyłącznie rolling sphere.

Konsekwencje:

- większość steering/landing/drive/config probe nie ćwiczy sidewalla;
- płaski ground nie testuje mesh/internal edges;
- nie testuje ścian, props ani vehicle-to-vehicle;
- nie testuje jednej natury koła na różnych powierzchniach;
- nie może być źródłem dowodu przyszłego wheel backendu.

Potrzebne osobne contact fixture families zamiast jednego smoke ground.

## 5. Manipulacje stanu w probe

Native probes czasami bezpośrednio:

- nadają wheel body velocity;
- obracają velocity wszystkich bodies;
- spawnują z wysokości;
- zamrażają rack przez ekstremalne friction;
- ustawiają skrajne configi.

To jest prawidłowe dla testu mechanizmu, o ile receipt mówi wprost, że scenariusz jest syntetyczny.

Nie wolno prezentować wyniku jako replay zwykłego inputu kierowcy ani owner gameplay test.

## 6. Fixed execution profile

Wiele probes używa:

```text
dt = 1/60
substeps = 4
b3DefaultWorldDef
continuous = false przez smoke helper
```

Fresh engine default daje contact `30/10/3`.

To jest użyteczny pinned fixture, ale:

- custom host tuning nie jest vehicle session state;
- renderer/mobile profile nie może zmieniać tych wartości bez nowego receipt;
- wheel findings pokazują zależność wyników od substeps/contact convergence.

## 7. Asset authority layers

### Legacy audit metadata bridge

```text
source GLTF
→ tools/asset_audit.py
→ assets/reports/asset_audit_latest.json
→ runtime metadata
→ wheel dimensions/travel hints
```

Problemy:

- brak source GLTF hash w raporcie;
- brak audit-tool identity;
- runtime nie weryfikuje świeżości;
- built-in marker fallback może wejść bez twardego błędu;
- report może być nowym plikiem o starych danych.

### Asset Contract Runtime V1

```text
sidecar contract
+ source GLTF read directly
→ role bindings and composed transforms
```

Mocne strony:

- nodeIndexHint;
- name sanity check;
- composed parent transforms;
- duplicate warnings;
- `physicsAuthority=false` dla obecnych visual roles;
- source GLTF jest czytany runtime.

Ograniczenia:

- brak asset/contract content hash w runtime object;
- `nodePathHint` jest wymagany jako string, ale loader nie porównuje go z rzeczywistą parent-chain path;
- offline `asset_contract_audit.py` także tylko zapisuje nodePathHint, nie waliduje jego zgodności;
- node graph recursion nie ma jawnej cycle/duplicate-parent validation;
- source path jest rozwiązywany przez filesystem, bez source receipt;
- generic loader nie nadaje sam role-specific physics authority — robią to osobne validators;
- obecny wheel dimensions path nadal korzysta z legacy reportu, nie sidecara.

### Contract v2 draft

Prawidłowa zasada:

```text
visual_endpoint != physics_authority
```

Aktualny wheel sidecar ma radius/width/spin markers jako:

```text
roleCategory = physics_hint
physicsAuthority = false
```

To oznacza, że marker może informować generated primitive, ale nie jest samodzielną finalną tire physics authority.

## 8. M8/M9 visual failure lesson

M8 dokumentuje wcześniejszą porażkę:

- agent nie obejrzał frame;
- numeric tests były zielone;
- model był sztywnie przyklejony do jednego ciała;
- mimo tego został opisany jako zrigowany.

M9 izoluje visual rig i wymaga:

- travel;
- steer;
- visual-only spin;
- left/right mirror;
- socket dump;
- screenshot/owner inspection przed live vehicle integration.

Konsekwencja dla weba:

```text
node list + skin count + no exception
!=
rig visual integrated
```

Stary webowy front-rig preflight osiąga wyłącznie asset structure presence. Nie osiąga M9 visual evidence.

## 9. Contextual bindings M9 kontra M6

Sidecar steering suspension opisuje isolated M9 body graph. Live M6 mapuje te role do innej topologii:

```text
M9 carrier-like role
→ M6 lowerArm
```

To jest contextual binding, nie stale sidecar.

Wymagane:

```text
bindingContextId
required roles
role → topology body mapping
source contract hash
visual proof receipt
```

Nie wolno globalnie przepisać sidecara pod jeden runtime rig.

## 10. Wheel visual side contract — skorygowany status

Native M6 i stary web używają jednego wheel visual correction dla wszystkich corners. Current wheel asset jest zasadniczo symetryczny, więc nie ma dowodu, że bieżący obraz jest po jednej stronie błędny.

Potwierdzona luka:

- brak jawnej side/outboard identity;
- brak signed mount-face contractu;
- brak directional tread/asymmetric rim semantics;
- web testuje tylko root position;
- future tire/rim split wymaga side-aware binding.

Status:

```text
CURRENT_ASSET_NOT_PROVEN_WRONG
FUTURE_ASYMMETRIC_WHEEL_CONTRACT_GAP
```

## 11. Wheel Scope jako wzorzec dowodu

Najnowsza owner session ma mocne reguły:

- observation i exploration są jawnie rozdzielone;
- perturbacja zmienia status sesji;
- rig config zawiera dt/substeps;
- unknown key odrzuca load;
- pusty `format 1` odtwarza contract baseline;
- visual i headless są porównywane przez 600-step byte equivalence;
- owner odpowiada na pytania o naturalność;
- obserwacja nie wchodzi automatycznie do findings.

To jest właściwy wzorzec przyszłego webowego instrumentu koła.

Web host może zmieniać:

- sposób wyświetlania;
- touch/camera;
- telemetry layout;
- zapis obserwacji.

Nie może zmieniać:

- physics state sequence;
- rig config;
- perturbation classification;
- evidence status;
- backend bez jawnego rebuildu od kroku zero.

## 12. Jak native validator ma zasilać clean web

Nie kopiujemy bool probes 1:1 do TypeScript.

Native powinno generować machine-readable receipts:

```text
probeId
probeVersion
sourceCommit
fixtureConfigHash
solverProfile
asset/factory receipt
synthetic manipulations
measured metrics
assertions with severity
non-gating diagnostics
known scope
```

Web uruchamia:

- własny adapterowy test bindingu;
- ten sam opis scenariusza;
- porównanie metryk/trace w uzgodnionych tolerancjach;
- osobny owner visual/feel test.

## 13. Proponowana klasyfikacja probe

```text
LEVEL A — source/structural
  schema, field table, topology, IDs, mass data

LEVEL B — mechanism falsification
  frozen rack, assist off/on, derived dependency

LEVEL C — liveness/stress
  finite, no teleport, survives drop

LEVEL D — scenario equivalence
  native/web traces

LEVEL E — visual observation
  screenshot/interactive inspection

LEVEL F — owner feel verdict
  Jozz only
```

Końcowy raport nie może spłaszczać A–F do jednego `OK`.

## 14. Werdykt

Native validator zawiera kilka bardzo wartościowych, dojrzałych sond kierownicy i konfiguracji. Nie jest jednak monolityczną wyrocznią parytetu.

Największe ryzyka przy bezmyślnym porcie do weba:

- shared helper mistake;
- szerokie liveness thresholds;
- sphere-only terrain bias;
- niedokładna nazwa `vehicle state valid`;
- brak visual/owner gates;
- mieszanie historycznych i bieżących eksperymentów;
- asset metadata bez content provenance;
- nodePathHint przechowywany, lecz nieweryfikowany jako path.

Clean web ma konsumować receipts i pojedyncze falsyfikowalne mechanizmy, nie zielony napis z całego native executable.