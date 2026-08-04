# JV Box3D Web — kanoniczny stan projektu

Updated: 2026-08-04
Status: `CANONICAL CURRENT STATE`
Owner: Jozz

## 1. Cel produktu

JV Web ma być przeglądarkowym hostem tego samego mechanicznego systemu Jozz Vehicle, a nie niezależną grą imitującą natywne zachowanie.

Docelowy podział:

```text
native JV Core + Box3D WASM -> fizyka, blueprint compiler, telemetryka
TypeScript host             -> input, lifecycle, render, UI, eksperymenty
```

Architecture authority:

```text
decisions/ADR-0003-native-jv-core-wasm.md
```

## 2. Bieżąca gałąź

```text
agent/jv-web-refoundation
```

Punkt startowy:

```text
agent/f5-dynamic-steering-validation
0d938e402f618ae34e0d959a9862d97c2f88a926
```

Refoundation jest odseparowane od historycznych stacked PR-ów. Nic nie jest scalane ani oznaczane jako ready bez Jozza.

## 3. Zwalidowany reference baseline

Na headzie bezpośrednio poprzedzającym refoundation potwierdzono lokalnie:

```text
Node 24.16.0
npm 11.17.0
TypeScript PASS
75/75 tests PASS
Vite production build PASS
browser startup and physical drive PASS
```

Receipt:

```text
receipts/runtime/REFERENCE_RUNTIME_BASELINE_2026_08_04.md
```

Działający fixture posiada:

- deterministyczny fixed-step;
- timestamped steering i longitudinal input;
- transactional lifecycle;
- prawdziwy `box3d.js` WASM;
- receipt-derived M6 graph;
- 18 vehicle bodies / 29 joints / 9 shapes;
- fizyczny rack i tie-rody;
- `RELEASE | POSITION | RATE`;
- RATE `0.06 / 0.12 / 0.21 / 0.36 m/s`;
- read-only WebGL observer;
- wheel-motor drive/reverse/coast/brake;
- dynamic rack-excursion matrix.

To są wyniki liveness, determinizmu i internal consistency reference backendu. Nie są pełnym native parity ani owner approval całego prowadzenia.

## 4. Krytyczna rozbieżność napędu

Native JV:

```text
maxDriveSpeed = wheel rev limit in rad/s
motor target = ±maxDriveSpeed
throttle scales available torque
wheel spin determines torque taper
```

TypeScript reference backend:

```text
maxDriveSpeed interpreted as linear m/s target
throttle scales target speed
target wheel speed = linear target / wheel radius
chassis speed determines torque taper
```

Dla przypiętych wartości:

```text
maxDriveSpeed = 40
wheelRadius = 0.514062464 m
native full-throttle target ≈ 40 rad/s
legacy TypeScript target ≈ 77.8 rad/s
```

Wniosek:

```text
legacy_ts_m6 is deterministic and drivable
native drive semantic parity = FAIL / NOT PRODUCT AUTHORITY
```

Nie dodawać kolejnych produktowych mechanizmów M7 do TypeScriptu.

## 5. Backend status

### `legacy_ts_m6`

Rola:

```text
REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority = false
nativeParity = NOT_PROVEN
acceptsNewProductPhysics = false
```

Jawny contract istnieje w kodzie i ma focused test. World expose’uje backend identity. Trace/UI jeszcze go nie pokazują — to następny mały code step po lokalnym gate/review.

### `native_jv_wasm`

Status:

```text
architecture accepted
ABI v0 designed
minimal source set audited
implementation not started
```

Kontrakty:

```text
contracts/NATIVE_WASM_ABI_V0_PL.md
research/NATIVE_CORE_SOURCE_SET_AUDIT_2026_08_04_PL.md
```

## 6. Minimalny native source set

Publiczny audyt refu `JV_VAW-Experimental_Integration` wykazał:

```text
JOZZ_VEHICLE_CORE_FILES = headless, but not runtime-minimal
```

Pierwszy behavior-preserving spike linkuje jawnie:

```text
Box3D
jozz_vehicle_m5_vehicle.{h,cpp}
jozz_vehicle_m6_geometry.{h,cpp}
jozz_vehicle_m6_suspension_rig.{h,cpp}
new thin ABI/runtime adapter
```

M5 jest obecnie potrzebne linkowo, ponieważ M6 używa zwalidowanego helpera Ackermanna dla strut branch.

Nie włączać do runtime v0:

- filesystem config IO;
- JSON/asset paths/metadata;
- contract import;
- Sokol/ImGui/renderer;
- map/campus/scan.

Najpierw niezmienione source files i native/WASM baseline; dopiero potem structural extraction pod ochroną parity.

## 7. ABI v0

ABI contract wymaga:

- C ABI i opaque generational runtime handle;
- version + struct size;
- jawnych suffixów jednostek;
- coordinate frames;
- stable `partId`, bez eksportu `b3BodyId`;
- immutable snapshot z tabelami offset/count;
- jawnego memory lifetime;
- structured error codes;
- runtime/source/build identity;
- control frame niezależnego od urządzenia;
- native/WASM scenario trace.

Błąd typu `maxDriveSpeed` bez jednostki jest odrzucany przez samą definicję przyszłego schema.

## 8. Sterowanie i rack

Default:

```text
rackCenteringHertz = 0
uprightAssist = false
```

Dynamiczny reference measurement:

```text
stationary held RATE excess: 0.000 mm
driving held RATE excess:    <= 0.284 mm
post-RELEASE peak:            2.541–2.817 mm
contacts:                     4
```

Interpretacja:

```text
command clamp: PASS
active held compliance: measured, small
post-RELEASE mechanism: not isolated
force-clamp fix: rejected without native comparison
```

Pierwszy native/WASM parity corpus użyje POSITION-like native input. RATE wchodzi dopiero po podstawowym baseline, aby nie łączyć portu M6 i nowego native actuatora w jeden eksperyment.

## 9. Koło

Reference backend:

```text
legacy_m6_split_sphere_sidewall
```

Rola:

```text
regression baseline / fallback / failure reference
```

Nie jest przyszłą oponą.

Future Wheel Scope wchodzi przez native backend seam opisany w:

```text
contracts/WHEEL_BACKEND_CONTRACT_PL.md
```

Nowszy lokalny Wheel Scope może wykraczać poza publiczny snapshot 2026-08-03 i wymaga nowego exact source receipt.

## 10. Dokumentacja i operacje

Wykonano:

- skrócony read-first chain do pięciu pozycji;
- nowe README/state/memory/index;
- usunięcie broad audits, handoffów i starej roadmapy z aktywnego drzewa;
- kompresję steering/wheel/mobile do aktywnych kontraktów;
- indexed recovery z exact blob SHA;
- fizyczną organizację receiptów na source/runtime/inventory;
- usunięcie sześciu one-shot workflows;
- jeden lokalny gate i Markdown link checker;
- kompresję konstytucji braku sztucznych mechanik.

Indeksy:

```text
DOCUMENT_INDEX.md
receipts/INDEX.md
archive/*.md
```

## 11. Walidacja bieżącego brancha

```text
new docs/code source: PRESENT
link checker syntax + synthetic pass/fail: PASS
full npm run check:docs: NOT YET EXECUTED
full npm run check: NOT YET EXECUTED
production build: NOT YET EXECUTED
browser smoke: NOT REQUIRED YET / NOT EXECUTED
```

Nie twierdzić, że refoundation branch jest zielony, dopóki nie przejdzie:

```text
tools/run-refoundation-gate.ps1
```

## 12. Workflow bezpieczeństwa

- brak merge bez Jozza;
- brak ready-for-review bez Jozza;
- brak Actions;
- brak samomodyfikujących workflowów;
- brak cross-repo commit loop;
- brak Git Diff Patcher Bridge;
- historyczne PR-y nietknięte;
- usunięte docs odzyskiwalne z przypiętej historii Gita.

## 13. Następna sekwencja

```text
1. pełny lokalny refoundation gate
2. naprawa linków wykrytych przez check:docs
3. runtime backend ID przez trace/UI/receipt
4. exact native local/public source receipt
5. native unchanged-source POSITION adapter
6. ten sam adapter w Emscripten/WASM
7. settle/drive/brake/POSITION parity receipt
8. structural extraction M5 dependency/types/diagnostics
9. shared native RATE actuator
10. Wheel Scope backend dopiero po nowym source receipt
```

Nie rozpoczynać nowej fizyki koła, drivetrainu, kampusu ani mobile UI przed podstawowym native/WASM parity baseline.
