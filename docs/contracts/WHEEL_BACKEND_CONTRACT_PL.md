# JV/JES — kontrakt systemu koła i backendu kontaktu

Updated: 2026-08-04
Status: `ACTIVE CONTRACT / NO BACKEND WINNER`
Owner: Jozz

## 1. Zakres decyzji

Ten dokument nie wybiera finalnej opony. Ustala granice, dzięki którym:

- historyczny M6 może pozostać odtwarzalnym baseline’em;
- Wheel Scope może badać fundamentalnie inne mechanizmy;
- native JV Core może przyjąć wybrany system bez przebudowy inputu, renderera i całego pojazdu;
- web nie stworzy równoległej TypeScriptowej fizyki opony.

## 2. Niezmienniki produktu

### Jedna natura koła

Ta sama podstawowa natura koła odpowiada za kontakt z:

- gruntem;
- skałą;
- ścianą i krawędzią;
- dynamicznym propem;
- innym pojazdem.

Kategorie kolizji mogą opisywać materiał, gameplay i optymalizację. Nie mogą przełączać opony pomiędzy różnymi colliderami zależnie od rodzaju powierzchni.

### Jawna masa i bezwładność

Mass properties nie mogą być przypadkowym skutkiem objętości lub liczby shapes backendu kontaktu.

```text
mass
center of mass
inertia tensor
```

są częścią trwałego specu i pozostają niezmienne przy porównaniu backendów.

### Jedno źródło fizyki

Wheel/contact/tire mechanics należą do native JV Core kompilowanego z Box3D do desktop i WASM. TypeScript host tylko wybiera nazwany eksperyment i odczytuje snapshot.

### Owner authority

Bench, CI, browser smoke i contact metrics nie wybierają produktu. Jozz wydaje owner-feel verdict dla konkretnego kontekstu: drift, zwykła jazda/roleplay i ciężki offroad.

## 3. Warstwy odpowiedzialności

```text
W1 WheelSpec / WheelState
W2 contact representation and manifold mechanism
W3 tire law, pressure, compliance and force/state evolution
W4 visualization and authored assets
```

Podział służy kontroli eksperymentu i własności danych. Nie oznacza czterech niezależnych produktów.

Dla przyszłej opony deformacja i ciśnienie są elementami fundamentalnego wspólnego systemu stanu. Tread, shoulders, sidewalls, bead i rim mogą być modelowane warstwowo, ale nie mogą mieć sprzecznych, niezależnych prawd o tej samej oponie.

W jednym eksperymencie nie zmienia się jednocześnie W2 i W3, chyba że hipoteza wprost dotyczy ich nierozdzielnego mechanizmu i posiada osobny baseline.

## 4. Minimalny `WheelSpecSnapshot`

```text
schemaVersion
sourceReceipt
  nativeCoreCommit
  engineCommit
  wheelAssetHash
  markerContractVersion

geometry
  outerRadius_m
  sectionWidth_m
  physicalCenter_m
  spinAxis_unit
  mountFaceOffsetSigned_m

massProperties
  mass_kg
  centerOfMass_m
  inertiaTensor_kg_m2

materialIntent
  nominalFriction
  rollingResistanceOwner

visualIdentity
  tireAssetId
  rimAssetId | null
```

Reguły:

- authored dimensions pochodzą z przypiętego receipt, nie z ręcznej stałej JS;
- signed mount offset zachowuje stronę osi;
- W2 nie zmienia mass properties;
- rolling resistance ma jednego jawnego właściciela: Box3D material, tire law albo none;
- asset opony i felgi mają osobne identity nawet wtedy, gdy dziś są jednym plikiem.

## 5. Wheel body ownership

Vehicle/blueprint compiler tworzy fizyczne wheel body i posiada:

- stabilne `partId`/role;
- transform;
- mass properties;
- spin joint;
- relację z knucklem/carrierem;
- lifecycle.

W2 otrzymuje istniejące body. Nie może bez zgody zmienić jego identity, mass data ani spin-joint ownership.

## 6. `WheelContactBackend`

Minimalny kontrakt natywny:

```text
id
schemaVersion
provenance
capabilities
build(context) -> instance
destroy(instance)
```

Build context zawiera:

```text
world
wheel body
WheelSpecSnapshot
collision/material intent
experiment config
```

Instancja raportuje:

```text
backendId
shapeIds
auxiliaryBodyIds
auxiliaryJointIds
actualCapabilities
observer bindings
buildReceipt
```

Wymagania:

- transakcyjny build;
- idempotentny destroy;
- brak ukrytego fallbacku do innej natury koła;
- auxiliary bodies/joints tylko jawnie, z mass/energy ownership;
- ten sam backend na wszystkich rodzajach powierzchni;
- urządzenie mobilne nie wybiera po cichu innego backendu.

## 7. Capability report

Każde `true` wymaga testu i source/runtime locatora.

Przykładowe capabilities:

```text
stockShapeOnly
analyticContact
compoundContact
auxiliaryBodies
supportsMesh
supportsHeightField
supportsDynamicBodies
supportsWallsAndEdges
supportsCCD
perPointImpulse
stableFeatureIdentity
persistentContacts
customManifoldProcedure
preSolve
materialCallbacks
runtimeRebuild
browserBindingLimitations[]
```

Samo `supportsMesh=true` nie wystarcza. Receipt zapisuje dokładne opcje buildera i ograniczenia bindingu.

## 8. Neutralny observer

Backend nie może redukować wyniku do jednego `isGrounded`.

```text
WheelContactSet
  manifolds[]
    identity
    points[]
      world/local point
      normal
      separation
      normal/total impulse
      feature identity
      triangle index
      persistence
      material / other body / shape
    friction/rolling/twist impulse

  aggregate
    active point/manifold count
    resultant impulse
    resultant moment about wheel center
    load centroid
    effective load-point measures
```

Observer opisuje kontakt. Nie podejmuje decyzji tire law i nie dodaje sił.

Liczba punktów nie jest automatycznie fizyczną plamą kontaktu. `totalNormalImpulse`, `featureId` i persistence wymagają interpretacji konkretnego backendu.

## 9. Legacy baseline

Canonical ID:

```text
legacy_m6_split_sphere_sidewall
```

Mechanizm:

```text
rolling sphere
  terrain-only mask
  wheel density

sidewall cylinder/hull
  non-terrain mask
  density = 0
```

Znane ograniczenia:

- kategoria powierzchni przełącza naturę kontaktu;
- centralny kampus oznaczał plate, skały i progi jako terrain, więc główne przeszkody kontaktowały sferę, nie true-width sidewall;
- brak historycznego kontrolowanego testu aktywacji sidewalla;
- web i native różniły się detalami rolling resistance i category bits;
- identyczny ujemny collision group dla wielu pojazdów wyłączyłby vehicle-to-vehicle collision — runtime musi przydzielać unikalną grupę per instance.

Dozwolone role:

- regresja M6;
- native/web reference;
- lifecycle/seam test;
- failure-mode baseline;
- tymczasowy jezdny fixture.

Niedozwolone role/nazwy:

```text
current wheel
physical tire
offroad solution
future default
mobile performance backend
```

Nie naprawiać legacy przez dodawanie kolejnych kategorii powierzchni. To utrwala odrzucony mechanizm.

## 10. Wiedza z Wheel Scope

Przypięty snapshot z 2026-08-03 mierzył sztywne, wieloshape’owe reprezentacje i rozkład impulsów. W dozwolonym zakresie wykazał, że badana rodzina zwykle miała około 1–3 efektywne punkty obciążenia, a kosztowny rekord około 5 wymagał 576 shapes i 32 substeps.

Nie wolno rozszerzać tego na twierdzenie, że żadna sztywna reprezentacja nigdy nie może dać plamy kontaktu.

Trwałe lekcje:

- liczba shapes i substeps oddziałują zbieżnościowo, nie tylko kosztowo;
- obniżenie substeps dla mobile zmienia fizykę;
- przyszły system może wymagać zmian manifoldu, compliance, observera i solver integration, nie tylko innej listy shapes;
- benchmark nie awansuje automatycznie do vehicle backendu;
- lineage eksperymentu i failure modes są częścią wyniku.

Nowszy lokalny Wheel Scope może wykraczać poza przypięty snapshot. Przed użyciem wymaga nowego exact source receipt.

## 11. W4 — wizualizacja

Renderer korzysta z:

```text
WheelSpecSnapshot
stable partId/role
wheel body transform
WheelStateView | null
```

Nie wyprowadza physical dimensions ani mass data z shape IDs lub bounding boxu render assetu.

Zmiana assetu wizualnego nie zmienia contact trace ani fizyki.

## 12. Minimalne testy seam’u

```text
WHEEL-S1 mass/inertia invariance across W2
WHEEL-S2 stable wheel body/part identity
WHEEL-S3 transactional lifecycle and leak baseline
WHEEL-S4 capability honesty and fail-closed behavior
WHEEL-S5 one nature across terrain/wall/prop/vehicle
WHEEL-S6 observer completeness
WHEEL-S7 no hidden forces/tire law
WHEEL-S8 visual independence
WHEEL-S9 native/WASM scenario equivalence
```

Legacy-only tests:

```text
filter truth table
sidewall contact with controlled non-terrain wall
campus effective-shape trace
```

Służą reprodukcji, nie akceptacji produktu.

## 13. Warunek implementacji kolejnego backendu

Przed kodem:

1. exact native/asset/engine receipt;
2. jawna hipoteza mechanizmu;
3. baseline i konkurencyjne wyjaśnienia;
4. capability contract;
5. frozen mass properties;
6. neutralny observer;
7. native/WASM parity scenario;
8. koszt pełnego pojazdu, nie tylko jednego koła;
9. owner test plan;
10. brak automatycznego promotion do defaultu.
