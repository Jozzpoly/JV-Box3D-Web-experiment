# Audyt źródła configu i sesji M6 — 2026-08-03

Status: `PASS_1_COMPLETE / CLEAN_SCHEMA_NOT_IMPLEMENTED`

Źródło native:

```text
Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142
samples/jozz_vehicle_m6_config_io.cpp
samples/jozz_vehicle_m6_geometry.cpp
samples/jozz_vehicle_m6_rig_lab.cpp
```

## 1. Prawidłowa ścieżka native

Native Rig Lab wykonuje:

```text
asset metadata / markers
→ JozzVehicleM3ADefaults
→ JozzVehicleM6DefaultConfig(current wheel radius, width, travel hint)
→ lab-specific factory topology/contracts
→ factory snapshot
→ overlay session JSON through one typed field table
→ SanitizeJozzVehicleM6Config
→ RecomputeRackTravel
```

To oznacza, że brak pola w sesji nie jest przypadkowym defaultem. Dziedziczy aktualny factory baseline, który może zależeć od bieżącego assetu i kontraktu.

## 2. Native serialized contract

Native używa jednej ordered typed field table dla writer i reader. Łącznie zapisuje 74 pola:

```text
root segment A        8
wishbone             13
trailingArm           4
root segment B        7
wheelEnvelope         3
root segment C       39
-----------------------
serialized total     74
```

### Root A

```text
chassisHalfExtents
chassisDensity
cgVerticalOffset
axleHalfSpacing
trackHalfWidth
restDrop
frontRigType
rearRigType
```

### Wishbone

```text
uprightHalfHeight
kingpinOffset
casterDeg
kingpinInclinationDeg
upperArmLength
lowerArmLength
armHalfSpread
steeringArmBack
ackermannTrapezoid
ackermannFraction
coiloverTopHeight
coiloverTopInboard
restArmDroopDeg
```

### Trailing arm

```text
pivotOffset
damperArmOffset
damperChassisOffset
armMass
```

### Root B

```text
knuckleMass
armMass
rackMass
rackHalfWidth
rackServoForce
rackServoSpeedGain
rackServoMaxSpeed
```

### Wheel envelope

```text
mode
cylinderSides
unionLayerCount
```

### Root C

```text
wheelDensity
wheelFriction
wheelRollingResistance
suspensionHertz
suspensionDampingRatio
frontSuspensionScale
rearSuspensionScale
reboundTravel
compressionTravel
suspensionPreloadFront
suspensionPreloadRear
arbFrontStiffness
arbRearStiffness
aeroDragArea
maxDriveSpeed
maxDriveTorque
driveTaperStart
brakeTorque
coastTorque
allWheelDrive
maxSteeringAngleDegrees
frontToeDeg
rearToeDeg
steeringHertz
steeringDampingRatio
maxSteeringTorque
rackFrictionBase
rackFrictionLoadCoeff
steeringFrictionTorque
steerInputDeadzone
rackCenteringHertz
ackermannGeometry
strutCasterDeg
uprightAssist
uprightHertz
uprightDampingRatio
bodyVisualModel
bodyVisualOffset
frontSuspensionVisualModel
```

## 3. Pola deliberate non-serialized

### `rackTravel`

Derived z geometrii, track/wheelbase/rack width/max steer. Po loadzie musi być przeliczony. Nie może być niezależnym authored polem.

### `filterGroupIndex`

Runtime-only. Nie należy do save/preset.

### `wheelEnvelope.radius`, `wheelEnvelope.width`, `terrainCategoryBits`

Nie są zapisane w session field table. Factory otrzymuje radius/width z aktualnych asset markers/defaults, a terrain category z aktualnego lab/runtime contractu.

### `trailingArm.loadedFromContract`

Diagnostic/runtime provenance, nie authored tunable.

## 4. Krytyczny błąd webowego wheel source

Web hardcoduje:

```text
wheelRadius = 0.5140625
wheelWidth  = 0.4375
```

Następnie `config-loader.ts` próbuje odczytać:

```text
raw.wheelEnvelope.radius
raw.wheelEnvelope.width
```

Native session tych pól nie zapisuje. W rezultacie:

- web synchronizuje bieżący `Offroad_Big_Wheels.gltf`;
- fizyczny collider zachowuje historyczne liczby TypeScript;
- visual adapter skaluje aktualny model do starego collidera;
- visual marker test przechodzi, ponieważ sprawdza zgodność po przeskalowaniu;
- authored wheel dimension truth zostaje utracone bez widocznego błędu.

Status: `CONFIRMED_FATAL_SOURCE_OF_TRUTH_BUG`.

Poprawna odbudowa:

```text
synchronized/pinned wheel asset + marker contract
→ native-generated asset defaults receipt
→ physical wheel dimensions
→ visual adapter verifies no unexplained scale drift
```

Nie wolno ponownie wpisywać markerowych wartości do TypeScript factory snapshotu.

## 5. Krytyczny błąd factory overlay

Native prefill przed session load zawiera:

- aktualne asset-derived wheel dimensions;
- current suspension travel hint;
- current trailing-arm contract geometry;
- lab-selected rig topology;
- current visual identity defaults.

Web prefill jest ręcznym snapshotem i nie zawiera pełnej topologii. Nawet poprawnie sparsowana session może więc dziedziczyć inny baseline dla pól nieobecnych/starszych.

Status: `CONFIRMED_DELTA`.

## 6. Braki webowego schema

Web nie reprezentuje lub nie importuje jako prawdziwy config:

```text
frontRigType
rearRigType
trailingArm.*
wheelEnvelope.mode
wheelEnvelope.cylinderSides
wheelEnvelope.unionLayerCount
ackermannGeometry
strutCasterDeg
```

`wheelEnvelope.mode` i rig types są jedynie odczytywane do warningów. Runtime i tak buduje double wishbone + split envelope.

## 7. Sanitizer delta

Web sanitizer obejmuje tylko część pól. Potwierdzone brakujące klasy native checks:

### Geometria strukturalna

- wszystkie składowe `chassisHalfExtents`;
- `uprightHalfHeight`;
- upper/lower arm lengths;
- arm spread;
- steering arm length;
- kingpin offset;
- rack width zależny od track;
- pełne geometry-dependent dead-point clamp.

### Masa i trailing arm

- `trailingArm.armMass`;
- pełne cross-field constraints.

### Zawieszenie

- front/rear suspension scale;
- preload ranges;
- pozostałe pola i relacje z design length.

### Steering/drive/material

- steering damping;
- servo force/gain/speed;
- max steering torque;
- deadzone;
- optional assists;
- friction/drive/aero/brake/coast ranges zgodne z native.

### Visual identity

- allowed key characters;
- model key termination/cap;
- dozwolone `frontSuspensionVisualModel`;
- body visual offset bounds.

Cichy fallback `normalize(zero) -> +Y` w web math nie zastępuje sanitizera. Buduje inny mechanizm zamiast odrzucić degenerację.

## 8. Legacy migrations native

Native reader zawiera jawne migracje/diagnostykę między innymi dla:

- starego pojedynczego `suspensionPreload` → front/rear;
- starych rack-friction keys, które opisują inny model i nie mają uczciwej konwersji do P4b.

Web nie ma wersjonowanego modelu migracji. Best-effort field copy nie wystarcza.

## 9. Nieprawidłowa polityka błędów weba

```text
404 session          -> factory
HTTP error           -> warning + factory
invalid JSON         -> warning + factory
unsupported topology -> warning + inna topologia
invalid field        -> pominięcie/clamp
```

Taka polityka nadaje factory fallbackowi kilka różnych znaczeń i zaciera dowody.

Czysta polityka:

```text
ABSENT_SESSION
→ jawny pinned factory fixture

PRESENT_VALID_SESSION
→ pełny validated import

PRESENT_INVALID_SESSION
→ STOP, receipt błędu

PRESENT_UNSUPPORTED_FEATURE
→ STOP, lista dokładnych feature flags

MIGRATED_SESSION
→ jawna migracja z input/output hash i raportem
```

## 10. Native generator requirement

Clean web nie będzie ręcznie kopiował 74 pól. Native repo powinno generować lub eksportować artefakt zawierający co najmniej:

```text
schemaVersion
nativeCommit
field path
type
serialized / derived / runtime-only
default source
min/max lub named validator
feature ownership
migration aliases
optional-assist classification
```

Dodatkowo factory receipt powinien zawierać już rozwiązane:

```text
wheel asset hash
wheel radius/width from markers
suspension travel hint
trailing-arm contract hash/geometry
front/rear rig type
wheel envelope fixture
visual registry keys
rackTravel derived value
```

## 11. Pierwszy clean-slice support policy

Aby odbudowa była mała i uczciwa, pierwszy vertical slice może obsługiwać tylko dokładnie jeden nazwany fixture:

```text
frontRigType = DOUBLE_WISHBONE
rearRigType  = DOUBLE_WISHBONE
rackCenteringHertz = 0
uprightAssist = false
legacy wheel fixture jawnie nazwany i odseparowany od future wheel program
```

Każde inne pole feature-level kończy się `UNSUPPORTED`, a nie reinterpretacją.

To nie oznacza usunięcia pozostałych rigów z JV. Oznacza uczciwe ograniczenie zakresu webowego portu.