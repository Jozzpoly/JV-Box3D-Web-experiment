# Native JV Core — audyt minimalnego source setu dla WASM v0

Updated: 2026-08-04
Status: `ACTIVE RESEARCH / SOURCE SET IDENTIFIED / BUILD NOT EXECUTED`
Architecture: ADR-0003
ABI: `docs/contracts/NATIVE_WASM_ABI_V0_PL.md`

## 1. Pytanie

Jaki najmniejszy zestaw istniejącego natywnego kodu może zbudować aktualny M6 bez Sokol, ImGui, mapy, rendererów i filesystem-based authoring pipeline — przy minimalnym ryzyku zmiany zachowania przed pierwszym native/WASM parity baseline?

## 2. Granica dowodu

Audytowany publiczny ref:

```text
repository: Jozzpoly/Box3d_FunProject
ref: JV_VAW-Experimental_Integration
```

Krytyczne blob identities:

```text
samples/CMakeLists.txt
6e79d08d316ca1379f8b4bca74e7fd3c93eb0319

samples/jozz_vehicle_m5_vehicle.cpp
4b14846fb34e24faa7f9cb3192199917a23a837b

samples/jozz_vehicle_m5_vehicle.h
850ccd3ced08b2bc20cfddded865939e9f8dfa56

samples/jozz_vehicle_m6_geometry.cpp
33dd14dace49decaa78362d0c2e27b9d99641b33

samples/jozz_vehicle_m6_geometry.h
dc0b9f244e5be8ac930122a3986f3bbcf2ba2720

samples/jozz_vehicle_m6_suspension_rig.cpp
a414ed155063211e2a3772b3879a1ad4f19c885b

samples/jozz_vehicle_m6_suspension_rig.h
c8643bfa21c6683b08f208d25f91ca9b9514b82c

spike/kernel_v0/kernel_v0.cpp
8daf817ba4b8b0c809f52fcde8489fec92ba6199
```

GitHub nie potwierdza lokalnych, niezacommitowanych zmian Jozza. Przed implementacją w native repo wymagany jest nowy local source receipt albo jawna decyzja pracy na tym przypiętym publicznym zestawie blobów.

## 3. Pierwszy ważny wynik

`JOZZ_VEHICLE_CORE_FILES` w `samples/CMakeLists.txt` jest **headless**, ale nie jest minimalnym runtime core.

Zawiera jednocześnie:

- fizykę M5/M6;
- pure geometry;
- config JSON/file IO;
- asset paths i metadata;
- asset contract parser;
- M7 contract import;
- steering visual/asset contract;
- parser `jsmn`.

To właściwy wspólny zestaw dla `samples` i rozbudowanego `jozz_vehicle_validation`, ale zbyt szeroki dla pierwszego WASM runtime.

Nie należy przenosić tej zmiennej 1:1 do webowego buildu i potem usuwać zależności metodą prób.

## 4. Dowód przenośności istnieje, ale nie dla M6

`spike/kernel_v0`:

- linkuje tylko Box3D;
- nie zależy od `samples` hosta, grafiki ani ImGui;
- tworzy własny katalog części, blueprint, stable `partId` i runtime mapping;
- wykonuje fixed-step oraz trajectory hash.

Dowodzi wykonalności architektury portable core.

Nie dowodzi parytetu M6, ponieważ buduje uproszczony rover z czterema kołami na revolute joints, a nie aktualny multi-body M6/M7.

## 5. Najmniejszy behavior-preserving M6 compile set

Dla skompilowania istniejącego, nieprzepisanego M6 wymagane są:

```text
Box3D public headers + library/source

samples/jozz_vehicle_m5_vehicle.h
samples/jozz_vehicle_m5_vehicle.cpp

samples/jozz_vehicle_m6_suspension_rig.h
samples/jozz_vehicle_m6_suspension_rig.cpp

samples/jozz_vehicle_m6_geometry.h
samples/jozz_vehicle_m6_geometry.cpp
```

### Dlaczego M5 nadal jest potrzebne

M6 bezpośrednio includuje `jozz_vehicle_m5_vehicle.h` i używa:

```text
GetJozzVehicleM5SteeringTargets
```

w gałęzi integrated-strut, aby współdzielić zwalidowaną matematykę Ackermanna i clampu.

Nawet jeżeli pierwszy fixture używa double wishbone na obu osiach, symbol pozostaje w skompilowanym `UpdateJozzVehicleM6Drive`, więc obecny linker nadal potrzebuje M5 TU.

To jest zależność implementacyjna, nie dowód, że cały M5 jest częścią konceptualnego M6 Core.

### Dlaczego geometry header nie jest jeszcze naprawdę niezależny

`jozz_vehicle_m6_geometry.h` nazywa się world-free, ale includuje pełne:

```text
jozz_vehicle_m6_suspension_rig.h
```

ponieważ wspólne config/geometry structs nadal mieszkają w nagłówku runtime physics.

Pure geometry TU nie dotyka świata, lecz typologicznie nadal zależy od runtime headeru.

## 6. Zestaw, którego v0 nie potrzebuje w runtime

### Authoring/package pipeline

```text
jozz_vehicle_asset_contract.*
jozz_vehicle_asset_dimensions.*
jozz_vehicle_asset_metadata.*
jozz_vehicle_asset_paths.*
jozz_vehicle_json.*
jozz_vehicle_m6_config_io.*
jozz_vehicle_m7_suspension_import.*
jozz_vehicle_steering_suspension_contract.*
jsmn.h
```

Te pliki są wartościowe dla:

- generowania factory config/receiptu;
- odczytu asset markers;
- presetów/sesji;
- contract importu.

Nie powinny być ładowane do pierwszego runtime WASM, ponieważ wprowadzają:

- filesystem paths;
- `std::filesystem` i file streams;
- JSON parsing;
- runtime fallback strings;
- authoring policy.

v0 otrzymuje wcześniej zwalidowany, versioned config/blueprint blob albo kompiluje przypięty test fixture z natywnych default functions i receipt dimensions.

### Host/UI/render/map

Całkowicie poza v0:

```text
sample/host
Sokol
ImGui/ImPlot
visual mesh/GLTF renderer
rig lab UI/persistence
campus/terrain/scan
screenshot tools
asset image decode
```

## 7. Najbezpieczniejszy pierwszy spike

### Zasada

Najpierw parity istniejącego kodu, potem refactor.

Nie przenosić od razu structów, nie rozcinać M5 dependency i nie zastępować `printf`. Każda taka zmiana przed baseline’em tworzy dodatkową zmienną.

### Adapter v0

Nowy cienki adapter, linkowany z dokładnym source setem z §5:

1. tworzy Box3D world;
2. ustawia solver profile z przypiętego receipt;
3. tworzy minimalny statyczny ground;
4. wywołuje `JozzVehicleM6DefaultConfig` z przypiętym radius/width/travel hint;
5. ustawia aktywny front/rear rig na double wishbone;
6. recomputuje derived rack travel natywną funkcją;
7. wymusza assists OFF i unique negative collision group;
8. wywołuje `CreateJozzVehicleM6`;
9. mapuje stable `partId` na istniejące runtime body IDs wewnątrz adaptera;
10. przyjmuje semantyczny control frame;
11. wywołuje `UpdateJozzVehicleM6Drive` i `b3World_Step`;
12. kopiuje snapshot;
13. niszczy vehicle/world transakcyjnie.

## 8. Zakres pierwszego parity scenario

Pierwszy spike nie powinien zaczynać od RATE.

Istniejące natywne API M6 przyjmuje:

```text
drive float -1..1
steer float -1..1 jako POSITION-like command
brake bool
```

Pierwszy corpus:

```text
settle
coast
forward throttle
reverse
brake
POSITION left
POSITION right
destroy/recreate
```

RATE jest bardzo ważne, ale obecnie istnieje tylko jako webowy K2b mapper. Dodanie go przed pierwszym native baseline’em połączyłoby:

- port M6;
- nowy native actuator;
- nowe ABI;
- nową parytetową macierz.

RATE wchodzi jako druga, osobna iteracja po potwierdzeniu podstawowego core.

## 9. Stable identity bez modyfikowania M6

Obecny `JozzVehicleM6` już wystawia adapterowi:

```text
chassisId
rackId
corners[].knuckleId
corners[].upperArmId
corners[].lowerArmId
corners[].trailingArmId
corners[].wheelId
```

Adapter może zbudować deterministic mapping:

```text
partId -> private b3BodyId
```

bez eksportowania handles i bez zmiany fizyki.

Pierwsze IDs muszą być generowane z blueprint/role/corner identity, nie z kolejności przydziału Box3D.

## 10. Znane granice obecnego kodu

### `printf` w runtime

M6 drukuje warning dla stale `rackTravel`.

W produkcyjnym core warning powinien stać się structured warning bit/error telemetry. Nie zmieniać go przed baseline’em; w spike’u przechwycić stdout albo zagwarantować spójny derived value, aby warning nie wystąpił.

### Config zawiera pola visual identity

`JozzVehicleM6Config` zawiera między innymi fixed char arrays dla body/suspension visual model. Nie eksportować tego structu bezpośrednio jako ABI wire type.

Adapter tłumaczy jawny wire config na native config wewnątrz modułu.

### `bool` i layout C++

Native config/runtime używa C++ `bool` i Box3D structs. Żaden z tych layoutów nie jest wire ABI.

### Brake v0

Native M6 ma `bool brake`, podczas gdy przyszły host może chcieć analog brake. v0 capability zapisuje digital brake semantics. Analogizacja jest osobnym mechanicznym change’em, nie konwersją transportu.

### Full M6 TU zawiera trzy rig types

Nawet przy double-wishbone fixture kompilowane są strut i trailing branches. Nie specjalizować ich preprocesorem przed baseline’em, bo zmieni to source set i utrudni porównanie.

## 11. Refactor dopiero pod ochroną parity

Po native/WASM baseline można wykonać małe etapy:

### N1 — shared types

Wydzielić neutralny header:

```text
jozz_vehicle_m6_types.h
```

z config/geometry structs, bez world functions.

### N2 — shared steering geometry

Przenieść czystą funkcję Ackermann targets z M5 do neutralnego modułu i zachować byte-/trace-equivalent output. Wtedy M6 przestanie linkować cały M5 wyłącznie dla jednego helpera.

### N3 — structured diagnostics

Zastąpić `printf` warningiem w trace/error channel.

### N4 — authoring/runtime split

Zbudować osobne biblioteki:

```text
jv_core_runtime
jv_core_authoring
jv_core_validation
```

### N5 — blueprint compiler

Przenieść wzorzec stable part IDs z `kernel_v0` do prawdziwego M6 buildera.

Każdy etap wymaga native-before/native-after oraz WASM comparison. Nie wystarczy compile PASS.

## 12. Proponowana docelowa struktura natywna

To kierunek po baseline, nie polecenie masowego move teraz:

```text
jv_core/
  include/
    jv_core_types.h
    jv_core_runtime.h
    jv_core_snapshot.h
    jv_core_abi.h

  src/
    jv_vehicle_geometry.cpp
    jv_vehicle_m6_runtime.cpp
    jv_vehicle_steering_geometry.cpp
    jv_blueprint_compiler.cpp
    jv_snapshot.cpp
    jv_abi.cpp

authoring/
  asset_contract
  metadata
  config_io
  blueprint_serialization

validation/
  native parity runner
  scenario corpus
```

## 13. Build gates source setu

### S0 — dependency proof

Native and Emscripten targets list exact files explicitly. Nie używać globów ani całego `JOZZ_VEHICLE_CORE_FILES`.

### S1 — no host linkage

Binary/link map nie może zawierać:

```text
imgui
implot
sokol
nfd
sample host
visual mesh
filesystem config IO
```

### S2 — exact config receipt

Runtime prints/exports config and derived hashes before first step. Native i WASM muszą zgadzać się przed scenario comparison.

### S3 — topology receipt

```text
body/joint/shape counts
stable part roles
collision groups
assist flags
wheel backend ID
```

### S4 — lifecycle

```text
create
step
destroy
stale handle rejected
create again
zero leaked world resources
```

### S5 — native/WASM trace

Mechanism-specific fields, nie tylko final displacement.

## 14. Werdykt

Minimalny M6 WASM spike jest możliwy bez przenoszenia całego `samples` core i bez wcześniejszego wielkiego refactoru.

Najbezpieczniejszy compile set to istniejące M5 + M6 geometry + M6 suspension runtime + Box3D, opakowane nowym adapterem ABI.

Największym błędem byłoby teraz „najpierw idealnie wydzielić bibliotekę”. Bez baseline’u nie odróżnilibyśmy czyszczenia struktury od zmiany mechaniki.

Kolejność:

```text
exact source receipt
→ unchanged-source native adapter
→ unchanged-source WASM adapter
→ basic POSITION parity
→ dopiero structural extraction
→ RATE actuator
→ Wheel Scope backend
```
