# JV Core ↔ WebAssembly — kontrakt ABI v0

Updated: 2026-08-04
Status: `ACTIVE DESIGN CONTRACT / SOURCE-SET AUDIT PENDING`
Owner: Jozz
Architecture authority: ADR-0003

## 1. Cel v0

Najmniejszy wspólny rdzeń ma uruchomić tę samą mechanikę w dwóch hostach:

```text
native headless executable
browser WebAssembly module
```

v0 obejmuje wyłącznie:

- utworzenie jednego runtime;
- jeden mały świat testowy;
- jeden pojazd z natywnego JV Core;
- semantyczne sterowanie;
- fixed-step;
- immutable snapshot;
- deterministic/parity trace;
- pełny lifecycle i błędy.

v0 nie obejmuje jeszcze:

- edytora pojazdu;
- hot reload assetów;
- pełnego systemu presetów;
- skanu/mapy;
- multiplayer/networking;
- finalnego Wheel Scope backendu;
- callbacków JS w środku solver step;
- pustych frameworków temperatury/damage.

## 2. Zasady granicy

1. **C ABI, bez C++ ABI.**
   Żaden `std::string`, `std::vector`, wyjątek, RTTI ani klasa C++ nie przechodzi przez granicę.

2. **Box3D handles pozostają wewnątrz.**
   `b3WorldId`, `b3BodyId`, `b3JointId` i `b3ShapeId` nigdy nie są trwałym browser identity.

3. **Każda liczba ma jednostkę i frame.**
   Pole bez jawnej semantyki nie może wejść do ABI.

4. **Version + struct size.**
   Każda publiczna struktura zaczyna się od:

   ```text
   abiVersion
   structSizeBytes
   ```

5. **Fail closed.**
   Nieznana wersja, rozmiar, enum, nie-finite value, brak capability albo zły hash odrzucają operację przed utworzeniem zasobów fizyki.

6. **Jedna własność pamięci.**
   Każdy pointer/buffer ma jawnego właściciela i lifetime.

7. **Brak device-dependent physics.**
   ABI nie zna typu telefonu/desktopu. Host przekazuje nazwany physics config, nie urządzenie.

## 3. Nazewnictwo jednostek

Nazwy pól wire contractu mają suffix, gdy jednostka nie wynika bezspornie z typu:

```text
_s                 seconds
_ms                milliseconds, host diagnostics only
_m                 meters
_mps               meters per second
_mps2              meters per second squared
_rad               radians
_radps              radians per second
_N                 newtons
_Nm                newton-meters
_kg                kilograms
_kg_m2              kilogram-meter squared
_ratio              dimensionless ratio
_unit               normalized unit vector
_norm               normalized command -1..1 or 0..1
```

Niedozwolone w ABI:

```text
maxDriveSpeed
speed
angle
force
position
rate
```

bez suffixu albo jednoznacznego lokalnego contractu.

Przykład naprawiający obecny failure mode:

```text
wheelRevLimit_radps
```

nie:

```text
maxDriveSpeed
```

## 4. Układ współrzędnych

Runtime info zapisuje i testuje:

```text
forward = +X
up      = +Y
right   = +Z
left    = -Z
positive steering = left
quaternion order = x, y, z, w
angles = radians
world positions = meters
```

Każdy vector field posiada frame w nazwie lub schema metadata:

```text
worldPosition_m
chassisLocalPoint_m
wheelLocalPoint_m
worldLinearVelocity_mps
```

Nie wolno przesłać anonimowego `vec3 position`.

## 5. Typy wire

Ostateczny wybór `f32/f64` musi zostać potwierdzony przez source-set audit i parity spike. v0 wymaga jednak jednego jawnego scalar profile:

```text
JV_SCALAR_PROFILE_F32
JV_SCALAR_PROFILE_MIXED_WORLD_F64
```

Runtime zwraca aktywny profil w `JvRuntimeInfo`.

Host nie zakłada profilu na podstawie platformy.

Zasady:

- command values są finite;
- timestamps/step index używają integer lub f64 z jawną rozdzielczością;
- `partId` jest 64-bitowym stabilnym ID;
- enums mają jawny `uint32` wire representation;
- booleans są `uint32 0/1`, nie compiler-dependent C++ `bool` w publicznym wire struct;
- buffers używają byte offsets/counts, nie native pointers zapisanych na później przez JS.

## 6. Runtime identity

`JvRuntimeInfo` zawiera co najmniej:

```text
abiVersion
structSizeBytes
abiSchemaHash
scalarProfile
engineCommit
jvCoreCommit
jvCoreTreeOrSourceReceiptHash
buildToolchainId
buildVariant
coordinateConventionId
capabilityBits
```

Stringi są stałej maksymalnej długości UTF-8 albo dostępne przez read-only string table z offset/length. Brak nieograniczonych pointerów C string bez length.

## 7. Lifecycle API

Kierunek funkcji:

```c
JvResult jvGetRuntimeInfo(JvRuntimeInfo* outInfo);

JvResult jvCreateRuntime(
    const JvRuntimeConfig* config,
    JvRuntimeHandle* outRuntime);

JvResult jvDestroyRuntime(JvRuntimeHandle runtime);

JvResult jvResetRuntime(
    JvRuntimeHandle runtime,
    const JvResetConfig* config);

JvResult jvSetControlFrame(
    JvRuntimeHandle runtime,
    const JvControlFrame* control);

JvResult jvStep(
    JvRuntimeHandle runtime,
    const JvStepRequest* request,
    JvStepReceipt* outReceipt);

JvResult jvGetSnapshotView(
    JvRuntimeHandle runtime,
    JvSnapshotView* outView);

JvResult jvCopySnapshot(
    JvRuntimeHandle runtime,
    void* destination,
    uint32_t destinationBytes,
    uint32_t* outRequiredBytes);
```

`JvRuntimeHandle` jest nieprzezroczystym generacyjnym handlem rdzenia, nie Box3D ID.

`destroy` jest idempotentne tylko dla poprawnie rozpoznanego, jeszcze niewycofanego handle’a według jawnej polityki. Stale handle musi zwrócić błąd, nie trafić w nowy runtime.

## 8. Runtime config

Minimalny `JvRuntimeConfig`:

```text
abiVersion
structSizeBytes
physicsProfileId
fixedDt_s
substeps
contactHertz
contactDampingRatio
contactSpeed_mps
enableContinuous_u32
workerCount
vehicleBlueprintHash
vehicleConfigHash
wheelBackendId
assistFlags
spawnWorldPosition_m
spawnWorldRotation_xyzw
```

Reguły:

- fixed dt i substeps są częścią identity scenariusza;
- config/blueprint/backend hashes są sprawdzane przed buildem;
- brak fallbacku do innego pojazdu lub koła;
- assist flags muszą być zgodne z nazwanym profilem;
- rejected config nie pozostawia world/body/joint allocations.

W przyszłości duże blueprint/config data mogą wejść jako osobny versioned blob. v0 nie próbuje serializować całego edytora w jednej strukturze.

## 9. Semantyczny control frame

`JvControlFrame` opisuje przedział fixed-step, nie stan klawiatury:

```text
abiVersion
structSizeBytes
sequence
intervalStart_s
intervalEnd_s

steeringMode
  RELEASE
  POSITION
  RATE

steeringValue_norm
throttle_norm
brake_norm
```

Dla RATE runtime profile zawiera:

```text
rackRate_mps
maxTargetLead_m
rebaseOnEngage_u32
rebaseOnReverse_u32
```

Host odpowiada za timestamped device timeline. Native core odpowiada za fizyczny actuator i RELEASE.

Niedozwolone control inputs:

- yaw correction;
- slip correction;
- hidden speed sensitivity;
- device type;
- centre timer;
- browser frame delta jako physics dt.

## 10. Step request i receipt

`JvStepRequest`:

```text
abiVersion
structSizeBytes
stepCount
fixedDt_s
expectedPreviousStepIndex
```

v0 może ograniczyć `stepCount=1`, jeśli uprości dowód. Batch step nie może zmieniać semantyki command timeline.

`JvStepReceipt`:

```text
runtimeGeneration
firstStepIndex
lastStepIndex
worldCounterSummary
snapshotRevision
stateHash64
warningBits
```

Nie-fatal warning ma enum/bit i trace. Nie jest tekstem ukrywającym fallback.

## 11. Stable part identity

Blueprint posiada stabilne:

```text
partId_u64
partRole_u32
parentPartId_u64 | none
catalogKeyHash
```

Runtime utrzymuje prywatne mapowanie:

```text
partId -> b3BodyId / joints / shapes
```

Snapshot i renderer używają `partId`/role, nie Box3D handles.

Minimalne role v0:

```text
CHASSIS
RACK
FRONT_LEFT_KNUCKLE
FRONT_RIGHT_KNUCKLE
REAR_LEFT_KNUCKLE
REAR_RIGHT_KNUCKLE
UPPER_ARM
LOWER_ARM
WHEEL
```

Role nie zastępują unikalnego `partId`; wiele części może mieć tę samą rolę z różnym corner/instance identity.

## 12. Snapshot

Snapshot jest versioned binary layout z headerem i tabelami offset/count.

Header:

```text
abiVersion
schemaVersion
snapshotBytes
runtimeGeneration
stepIndex
simulationTime_s
stateHash64
partCount
wheelCount
contactManifoldCount
contactPointCount
offsets...
```

Part transform:

```text
partId_u64
partRole_u32
flags
worldPosition_m
worldRotation_xyzw
worldLinearVelocity_mps
worldAngularVelocity_radps
```

Vehicle state:

```text
chassisPartId
forwardSpeed_mps
rackTranslation_m
rackSpeed_mps
steeringActuatorMode
driveMode
activePhysicsProfileHash
```

Wheel state minimum:

```text
partId
cornerRole
spinSpeed_radps
steeringAngle_rad
suspensionTravel_m
suspensionLoad_N
groundContact_u32
```

Optional telemetry such as slip/camber enters only when source semantics are confirmed and carries capability bits.

## 13. Snapshot memory ownership

Two allowed paths:

### Borrowed view

`jvGetSnapshotView` returns offset + byte count into WASM memory.

Lifetime:

```text
valid until the next mutating JV call or memory growth
```

JS musi skopiować dane, jeżeli przechowuje je po następnym stepie.

### Explicit copy

`jvCopySnapshot` copies into a caller-provided WASM buffer or reports required bytes.

Renderer receives an immutable JavaScript snapshot copied/decoded by one adapter. It never retains a raw typed-array view across a mutating call.

## 14. Errors

`JvResult` contains a stable code family:

```text
OK
INVALID_ARGUMENT
ABI_VERSION_MISMATCH
STRUCT_SIZE_MISMATCH
NON_FINITE_VALUE
UNSUPPORTED_CAPABILITY
SOURCE_IDENTITY_MISMATCH
INVALID_RUNTIME_HANDLE
STALE_RUNTIME_HANDLE
INVALID_STATE_TRANSITION
BUFFER_TOO_SMALL
BUILD_FAILED
STEP_FAILED
INTERNAL_ERROR
```

Detailed diagnostics are read through:

```c
JvResult jvGetLastError(
    JvRuntimeHandle runtimeOrZero,
    JvErrorInfo* outError);
```

Error info has code, subsystem, stable message ID and bounded UTF-8 detail. Browser logic nie parsuje tekstu, aby podjąć decyzję.

C++ exceptions nie przekraczają ABI; są przechwytywane i mapowane przed powrotem.

## 15. Determinism i parity trace

State hash nie jest jedynym dowodem. Scenario receipt zawiera:

```text
runtime identity
config/blueprint/backend hashes
control timeline hash
per-step or sampled quantized state
final state hash
mechanism telemetry checkpoints
```

Pierwsze scenariusze:

```text
settle
coast
forward throttle
reverse
brake
POSITION left/right
RATE engage/reverse
RELEASE
stationary full lock
rolling release
wheel impact
throttle + lock + brake
```

Bit-identical hash jest celem badawczym, nie założeniem. Jeśli native/WASM różnią się przez scalar/toolchain semantics, parity contract definiuje:

- kwantyzację;
- tolerancję per pole;
- checkpoint cadence;
- dozwolone i niedozwolone rozbieżności.

Nie wolno zastąpić mechanizm-specific comparison samym final displacement.

## 16. Threading v0

v0 jest single-threaded i nie wywołuje JS callbacków podczas `jvStep`.

Worker/multithread build jest osobnym wariantem z osobnym build receipt i parity gate. Nie może zostać włączony tylko dla urządzenia bez zmiany runtime identity.

## 17. Security i robustness

- validate all counts, offsets and multiplications against overflow;
- reject NaN/Inf before core allocation;
- cap blueprint/snapshot sizes;
- no host pointer persisted after call;
- no unbounded recursion from authored data;
- no file-system path inside runtime ABI;
- no raw asset URL in native core;
- no logging loop as error transport;
- fuzz/parsing tests before accepting external blueprint blobs.

## 18. Gate przed implementacją

Przed napisaniem bindings:

1. source-set audit natywnego core;
2. wybór scalar profile;
3. C/C++ compile probe potwierdzający layout/size/alignment;
4. TypeScript decoder generated lub checked against one schema;
5. unit-name lint/schema test;
6. stale handle test;
7. rejected config allocation test;
8. snapshot lifetime test;
9. one native scenario;
10. ten sam WASM scenario.

## 19. Odrzucone skróty

- eksportowanie `b3BodyId` do renderera;
- JSON per physics step jako produktowy transport;
- pola bez jednostek;
- ręczne duplikowanie structów bez schema/size tests;
- JS callback per contact point podczas solver step;
- drugi niezależny TypeScript actuator;
- device detection w native physics;
- silent ABI downgrade;
- fallback do legacy backendu po błędzie nowego backendu.
