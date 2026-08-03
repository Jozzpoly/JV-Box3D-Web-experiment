# Minimalny szew adopcji przyszłego koła w JV Web

Data: 2026-08-03

Status: `ARCHITECTURE_CANDIDATE / OWNER_DIRECTION_CAPTURED / NO_BACKEND_SELECTED / NO_IMPLEMENTATION`

## 1. Cel

Jozz chce, aby eksperymentalny port webowy nie został na stałe związany z męczącą fizyką sfery ani z odrzuconym split sphere/sidewall. Jednocześnie aktualny program kół nie wybrał jeszcze przyszłego backendu, a F-31/F-32 pokazały, że problem nie redukuje się do wyboru innej sztywnej bryły.

Celem tego dokumentu jest przygotowanie najmniejszej trwałej granicy, przez którą później można przyjąć nowe koło bez przebudowy całego pojazdu, inputu, renderera i telemetryki.

Nie jest celem:

- wybór konkretnego kształtu;
- port Wheel Scope do browsera;
- rozpoczęcie tire law;
- implementacja deformacji;
- zbudowanie uniwersalnego frameworka opon;
- wymuszanie tej architektury w native JV albo JES przed eksperymentem.

## 2. Co jest trwałe, a co otwarte

### Trwałe

- dane koła nie mogą zależeć od typu collidera;
- masa i bezwładność muszą być jawne;
- W2 contact representation musi być wymienne;
- W3 tire law nie może być zlane z W2;
- renderer nie może sterować fizyką;
- pełny zbiór kontaktów i agregat muszą być obserwowalne;
- legacy split musi być nazwanym fixture, nie globalnym modelem domeny;
- capability gaps bindingu muszą być jawne;
- jeden backend odpowiada za cały kontakt koła ze światem, bez terrain/object shape switching.

### Otwarte

- stock shapes, analytic shape, compound, compliant ring, deformable body albo engine patch;
- procedura manifoldu;
- liczba i rodzaj punktów kontaktu;
- sposób liczenia sił W3;
- właściciel rolling resistance;
- temperatura, zużycie, ciśnienie, damage;
- poziomy wierności;
- CPU budget pełnego pojazdu i telefonu.

## 3. Minimalny model danych W1

Pierwszy webowy snapshot nie potrzebuje pełnego przyszłego `TireSpec`. Potrzebuje minimalnego, źródłowego opisu, którego W2 nie może zmieniać:

```text
WheelSpecSnapshot
  schemaVersion
  sourceReceipt
    nativeCommit
    factoryReceiptHash
    wheelAssetHash
    markerContractVersion

  geometry
    outerRadius
    sectionWidth
    physicalCenter
    spinAxis
    mountFaceOffsetSigned

  massProperties
    mass
    centerOfMass
    inertiaTensor

  materialIntent
    nominalFriction
    nominalRollingResistanceOwner

  visualIdentity
    tireAssetId
    rimAssetId | null
```

### Reguły

1. Wymiary pochodzą z przypiętego authored asset/factory receipt, nie z ręcznych stałych TypeScript.
2. `mountFaceOffsetSigned` nie może używać `abs()`, ponieważ strona osi ma znaczenie.
3. Mass data jest ustawiana przez `b3Body_SetMassData` po zbudowaniu W2.
4. Zmiana backendu W2 nie może zmienić mass data nawet o błąd zaokrąglenia poza ustaloną tolerancją.
5. `nominalRollingResistanceOwner` jawnie wskazuje `BOX3D_MATERIAL`, `TIRE_LAW` albo `NONE`; nigdy oba równocześnie.
6. Pierwszy slice może mieć jeden tire/rim asset, ale schema nie może zakładać jednego wspólnego pliku na zawsze.

## 4. Wheel body ownership

Pojazd tworzy jedno fizyczne body koła i nadaje mu:

- transform;
- jawne mass properties;
- spin joint;
- relację z nośnikiem/knucklem;
- lifecycle.

Backend W2 nie jest właścicielem body. Otrzymuje istniejące body i buduje na nim reprezentację kontaktu.

To zapobiega zmianie:

- joint IDs;
- wheel-body identity;
- renderer binding;
- telemetry identity;
- mass/inertia

przy wymianie samego W2.

## 5. Minimalny kontrakt W2

```text
WheelContactBackend
  id
  schemaVersion
  provenance
  capabilities

  build(context) -> WheelContactInstance
  destroy(instance)
```

```text
WheelContactBuildContext
  box3dRuntime
  worldId
  wheelBodyId
  wheelSpec
  collisionFilter
  materialIntent
```

```text
WheelContactInstance
  backendId
  bodyId
  shapeIds[]
  auxiliaryBodyIds[]
  auxiliaryJointIds[]
  observerBindings
  actualCapabilities
  buildReceipt
```

### Lifecycle

- `build` jest transakcyjne: albo zwraca kompletną instancję, albo sprząta wszystkie utworzone zasoby;
- `destroy` jest idempotentne;
- backend nie modyfikuje wheel body mass data;
- backend nie tworzy terrain-specific i object-specific natury koła;
- auxiliary bodies/joints są dozwolone tylko dla backendu, który jawnie ich wymaga;
- ich energia i mass ownership muszą być wtedy osobnym receiptem.

## 6. Capability report zamiast założeń

```text
WheelBackendCapabilities
  stockShapeOnly
  analyticContact
  compoundContact
  auxiliaryBodies
  supportsMesh
  supportsHeightField
  supportsDynamicBodies
  supportsWallsAndEdges
  supportsCCD
  exposesPerPointImpulse
  exposesStableFeatureIdentity
  exposesPersistentContacts
  supportsCustomManifoldProcedure
  supportsPreSolve
  supportsMaterialCallbacks
  supportsRuntimeRebuild
  browserBindingLimitations[]
```

Capability nie jest marketingową deklaracją backendu. Każde `true` wymaga testu i locatora.

Przykład dla starego bindingu mesh:

```text
weldVertices      = forced true
useMedianSplit    = forced false
identifyEdges     = forced false
```

Dlatego `supportsMesh=true` nie wystarcza. Build receipt musi zapisać dokładne opcje, których binding faktycznie użył.

## 7. Legacy backend

Pierwszy dostępny backend może być wyłącznie jawnie nazwany:

```text
legacy_m6_split_sphere_sidewall
```

Nie:

```text
current
standard
physical
default_tire
```

Jego opis zawiera:

- zgodność z przypiętym runtime M6;
- terrain/object split;
- fakt odrzucenia produktowego przez F-04;
- sidewall density 0;
- jego filter/material semantics;
- ograniczenia szerokości i kontaktu;
- brak statusu przyszłego systemu koła.

Służy do:

- odtworzenia starego M6;
- porównania native/web;
- testowania seam/lifecycle;
- utrzymania jezdnego fixture przed wyborem nowego backendu.

Nie służy do:

- definiowania `WheelSpec`;
- ustalania przyszłego API;
- owner verdictu nowej opony;
- porównania feelu nowych kandydatów bez transfer gate.

## 8. Neutralny observer kontaktu

W2 nie może zwracać jedynie `isGrounded` albo jednego punktu.

Minimalny observer:

```text
WheelContactObserver
  sample(instance, stepContext) -> WheelContactSet
```

```text
WheelContactPoint
  shapeId
  otherShapeId
  otherBodyId
  worldPoint
  wheelLocalPoint
  normal
  separation
  normalImpulse
  totalNormalImpulse
  featureId
  triangleIndex
  persisted
  userMaterialIds
```

```text
WheelContactManifold
  identity
  points[]
  frictionImpulse
  rollingImpulse
  twistImpulse
```

```text
WheelContactAggregate
  activePointCount
  effectiveLoadPointCountNios
  maxPointLoadFraction
  activeManifoldCount
  resultantImpulse
  resultantMomentAboutWheelCenter
  loadCentroid
```

### Ograniczenia interpretacji

- `totalNormalImpulse` nie jest automatycznie dowodem trwałego podparcia;
- liczba punktów nie jest plamą kontaktu;
- friction/rolling/twist impulse może należeć do manifoldu, nie punktu;
- `triangleIndex` i `featureId` wymagają sprawdzenia stabilności dla danego backendu;
- observer zbiera dane, ale nie wydaje decyzji tire law.

## 9. W3 w pierwszym clean slice

Pierwsza czysta wersja nie posiada nowego W3.

```text
TireLaw = NONE / STOCK_BOX3D_CONTACT_ONLY
```

To oznacza:

- brak dodatkowych sił zależnych od slip angle;
- brak temperatury;
- brak zużycia;
- brak ciśnienia runtime;
- brak deformacji wizualnej sterującej fizyką;
- brak podwójnego rolling resistance.

Observer może już zapisywać dane potrzebne przyszłemu W3. Nie może sam dopisywać sił.

## 10. W4 — wizualizacja

Renderer otrzymuje:

```text
WheelSpecSnapshot
wheel body transform
future WheelStateView | null
```

Nie otrzymuje shape IDs jako źródła wymiarów ani mass data.

Minimalna poprawa wobec starego adaptera:

- marker names muszą być unikalne;
- axis basis i handedness są walidowane;
- signed mount offset zostaje zachowany;
- orientation binding jest testowany, nie tylko root position;
- source asset hash wchodzi do reportu;
- skeleton independence jest testowana per unikalny skeleton, nie przez założenie `mesh count == skeleton count`;
- fallback jest jawnie `VISUAL_FALLBACK`, nie innym physics source;
- tire i rim identity są rozdzielone w schema, nawet jeśli dziś wskazują jeden asset.

## 11. Testy seam

### WHEEL-S1 — mass invariance

Dwa backendy W2 zbudowane na tym samym `WheelSpecSnapshot` muszą pozostawić identyczne:

- body mass;
- center of mass;
- inertia tensor.

### WHEEL-S2 — one body identity

Zmiana W2 nie może zmienić wheel body ID ani spin-joint ownership.

### WHEEL-S3 — lifecycle

Wielokrotne build/destroy nie może zwiększać liczby bodies, joints, shapes, meshes ani JS listeners.

### WHEEL-S4 — capability honesty

Backend odrzuca fixture wymagający capability, którego nie posiada. Nie fallbackuje do innej natury koła.

### WHEEL-S5 — one nature across surfaces

Ten sam backend i te same shape IDs są używane na terrain, wall, prop i drugim pojeździe. Material może się różnić, geometria nie jest przełączana kategorią.

### WHEEL-S6 — observer completeness

Dla kontrolowanego contact fixture observer odtwarza liczbę manifoldów/punktów, impulsy, identity i persistence zgodnie z native/binding receipt.

### WHEEL-S7 — no hidden tire law

W2 nie aplikuje sił przez host poza tym, co jawnie należy do jego mechanizmu i receiptów.

### WHEEL-S8 — visual independence

Zmiana visual assetu nie zmienia body mass, shape geometry ani contact trace.

## 12. Mobile boundary

Przygotowanie koła na telefon nie może oznaczać innego physics backendu wybieranego ukrycie na podstawie urządzenia.

Dozwolone profile mobilne:

- mniej cieni;
- mniejszy DPR;
- mniej wizualnych detali;
- wyłączone debug meshes;
- lazy-loaded scan visual;
- rzadszy HUD.

Niedozwolone bez osobnego physics receipt:

- mniej substeps;
- inny contact hertz;
- inny wheel backend;
- mniej shape'ów reprezentacji;
- inna mass data;
- inne filtry/material law.

## 13. Granica transferu do native JV i JES

Web może dostarczyć behavior/contract card:

- minimalny `WheelSpecSnapshot`;
- capability model;
- lifecycle;
- observer data;
- negatywne testy;
- owner verdict.

Native JV implementuje własną wersję po zatwierdzeniu. JES może później wykorzystać te same lekcje we własnej architekturze. Nie powstaje dzisiaj wspólny package ani zależność kodowa.

## 14. Warunek wejścia implementacji

Przed pierwszym kodem seam potrzebne są:

1. exact factory receipt z asset-derived radius/width i mass data;
2. lista publicznych binding APIs potrzebnych observerowi;
3. test round-trip contact data w WASM;
4. rozstrzygnięcie, czy legacy backend ma powstać przez odzysk starego buildera czy mały port od zera;
5. limit zakresu pierwszego fixture;
6. owner akceptacja, że seam nie wybiera jeszcze nowej opony.

Dopiero potem powstaje minimalna implementacja W1/W2/observer. W3 pozostaje nieobecne.