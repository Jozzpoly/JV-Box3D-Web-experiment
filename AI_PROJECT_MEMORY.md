# AI project memory — JV Box3D Web

Updated: 2026-08-04
Status: `CANONICAL / READ_FIRST`
Owner: Jozz

## 1. Current mission

Prepare JV Web as a clean browser host for the same mechanical system as native Jozz Vehicle and as a future JES research surface.

Do not evolve a second product physics implementation in TypeScript.

Accepted architecture:

```text
Box3D source + portable native JV Core
                    ↓
          one WebAssembly module
                    ↓
      stable C ABI + immutable snapshots
                    ↓
        TypeScript input/render/UI host
```

Read:

```text
docs/PROJECT_STATE.md
docs/REFOUNDATION_LOOP_PL.md
docs/decisions/ADR-0003-native-jv-core-wasm.md
```

## 2. Active branch

```text
agent/jv-web-refoundation
```

Started from validated reference head:

```text
agent/f5-dynamic-steering-validation
0d938e402f618ae34e0d959a9862d97c2f88a926
```

Earlier stacked PRs remain untouched historical evidence. Do not merge or mark ready without Jozz.

## 3. Validated reference runtime

Pre-refoundation evidence:

```text
Node 24.16.0
npm 11.17.0
TypeScript PASS
75/75 tests PASS
Vite build PASS
browser startup and physical drive PASS
```

Receipt:

```text
docs/receipts/runtime/REFERENCE_RUNTIME_BASELINE_2026_08_04.md
```

Reference backend:

```text
id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
acceptsNewProductPhysics: false
```

## 4. Critical drive mismatch

Native JV:

```text
maxDriveSpeed unit = rad/s
motor target = ±maxDriveSpeed
throttle scales available torque
wheel spin drives torque taper
```

TypeScript fixture:

```text
maxDriveSpeed interpreted as m/s
target wheel speed = throttle * value / wheelRadius
chassis speed drives torque taper
```

Pinned values imply approximately:

```text
native target 40 rad/s
legacy TS target 77.8 rad/s at full throttle
```

Drive direction/liveness/determinism PASS did not prove native behavior.

Do not add product drivetrain, anti-roll, aero, tire or suspension mechanics to `legacy_ts_m6`.

## 5. Steering truth

Default:

```text
rackCenteringHertz = 0
uprightAssist = false
```

`RELEASE` disables hands-on target in the first fixed step. Wheels may remain turned at standstill.

RATE remains an unapproved rack-space experiment:

```text
0.06 / 0.12 / 0.21 / 0.36 m/s
max lead 0.008 m
```

Dynamic reference measurement:

```text
stationary held excess: 0.000 mm
driving held excess:    <= 0.284 mm
post-RELEASE peak:       2.541–2.817 mm
contacts:                4
```

Do not force-clamp before native comparison.

Contract:

```text
docs/contracts/STEERING_COMMAND_CONTRACT_PL.md
```

## 6. Wheel direction

```text
legacy_m6_split_sphere_sidewall
= regression baseline / fallback / failure reference
```

Future Wheel Scope physics belongs to native JV Core. Deformation and pressure are foundational shared state, not a later visual patch.

Contract:

```text
docs/contracts/WHEEL_BACKEND_CONTRACT_PL.md
```

A newer local Wheel Scope requires a fresh exact source receipt before reuse.

## 7. ABI v0

Contract:

```text
docs/contracts/NATIVE_WASM_ABI_V0_PL.md
```

Required:

- C ABI;
- version + struct size;
- explicit unit suffixes;
- coordinate frames;
- opaque generational runtime handles;
- stable `partId`, never persistent `b3BodyId`;
- immutable versioned snapshot;
- explicit memory lifetime;
- structured errors;
- runtime/source/build identity;
- device-independent control frame;
- native/WASM scenario trace.

Anonymous fields such as `maxDriveSpeed` are not allowed in wire ABI.

## 8. Minimal native source set

Focused audit:

```text
docs/research/NATIVE_CORE_SOURCE_SET_AUDIT_2026_08_04_PL.md
```

First behavior-preserving compile set:

```text
Box3D
jozz_vehicle_m5_vehicle.{h,cpp}
jozz_vehicle_m6_geometry.{h,cpp}
jozz_vehicle_m6_suspension_rig.{h,cpp}
new thin adapter
```

`JOZZ_VEHICLE_CORE_FILES` is headless but too broad for runtime v0 because it also includes filesystem config IO, JSON, metadata and asset contract import.

Do not refactor the native files before a native/WASM baseline. Use unchanged source, obtain POSITION parity, then extract shared types/M5 helper/structured diagnostics under trace protection.

RATE is phase two; first parity corpus uses the existing native POSITION-like steering API.

## 9. Documentation refoundation

Completed:

- five-item read-first chain;
- current README/state/memory/index;
- broad audits/handoff/old roadmap removed from active tree with exact recovery hashes;
- steering/wheel/mobile compressed to contracts;
- receipts organized under `docs/receipts/`;
- six one-shot workflows removed;
- one local gate and Markdown link checker;
- mechanics constitution compressed;
- focused ABI and native source-set documents added.

Indexes:

```text
docs/DOCUMENT_INDEX.md
docs/receipts/INDEX.md
docs/archive/*.md
```

Do not create new broad audits or session handoffs.

## 10. Refoundation loop

```text
read current state
→ select one smallest contradiction
→ hypothesis/invariant
→ falsifying test
→ minimal reversible change
→ proportional validation
→ critique
→ compress state
→ improve loop
```

Full process:

```text
docs/REFOUNDATION_LOOP_PL.md
```

## 11. Validation status of this branch

```text
link checker syntax + synthetic pass/fail: PASS
full npm run check:docs: NOT EXECUTED
full npm run check: NOT EXECUTED
build: NOT EXECUTED
browser smoke: not yet required / not executed
```

Use one command later:

```text
tools/run-refoundation-gate.ps1
```

Never claim this branch green before that receipt.

## 12. Next program

```text
1 local refoundation gate and broken-link fixes
2 backend ID through trace/UI/receipt
3 exact native source receipt
4 unchanged-source native adapter
5 same adapter in Emscripten
6 settle/drive/brake/POSITION parity
7 structural native extraction
8 shared native RATE actuator
9 fresh Wheel Scope source receipt
10 future wheel backend
```

## 13. Workflow rules

- respond to Jozz in Polish;
- GitHub connector and ordinary Git only;
- Git Diff Patcher Bridge forbidden;
- do not shift routine repo work onto Jozz;
- no merge or ready transition without Jozz;
- no Actions, self-modifying CI, cross-repo loops or repeated CI debugging;
- no owner-feel claim without Jozz;
- no parity claim from internal green tests;
- no hidden fallback or assist;
- no destructive deletion without source recovery and link audit.

## 14. Local paths

```text
native:
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\box3d

web:
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JV-Box3D-Web-experiment\JV-Box3D-Web-experiment
```

GitHub does not prove local uncommitted state.
