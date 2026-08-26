# JV-Web — competing architecture hypotheses

Updated: 2026-08-26
Owner: Jozz
Gate: `6 — COMPETING ARCHITECTURE HYPOTHESES`
Status: `COMPARISON SET / NO WINNER / FIRST FALSIFIER NOT SELECTED / NO IMPLEMENTATION AUTHORIZED`
Grounded JV-Web source at Gate 6 entry: `de1bd9431c5972e493869bf0c7217644bd54b2c3`

This document is the Gate 6 comparison surface. It does not select the future architecture and does not authorize runtime implementation. Gate 7 must select a **first falsifier**, not a permanent architecture, from the uncertainty exposed here.

Authority order remains:

`live Git/current files -> executed evidence -> direct scoped Owner feedback/device evidence -> current docs -> historical plans/conversation memory`

Use `docs/INHERITANCE_MATRIX.md` for the Gate 5 claim-level synthesis and `docs/PROJECT_STATE.md` for current routing.

## 1. Gate 5 hardening carried into this comparison

Two wording corrections are binding during Gate 6 even if older Matrix V2 prose is encountered:

1. authored-element -> runtime-body/collider **1:1 mapping must not be assumed as an invariant**. Evidence supports keeping authored truth and runtime granularity separable; it does not yet prove one specific alternative lowering granularity;
2. `Front Mechanical Unit 01` is a **STRONG BOUNDED FALSIFIER CANDIDATE — NOT RANKED / NOT SELECTED**. It has no precedence before Gate 7.

Exact upper/lower outboard mating remains `OPEN / OWNER JUDGEMENT`. It is not a Gate 6 blocker and becomes blocking only if a selected later falsifier genuinely requires exact physical mating.

## 2. Source-grounded runtime facts that constrain the hypotheses

Current source does not expose a real interchangeable vehicle-backend architecture.

`src/runtime/vehicle-runtime-backend.ts` defines backend vocabulary including `legacy_ts_m6` and `native_jv_wasm`, plus command/trace/visual-frame contract versions. However, the current product path does not select between concrete vehicle backends.

`src/app/f4-vehicle-host.ts` directly:

- asserts `LEGACY_TS_M6_BACKEND`;
- loads `Box3DBoundary`;
- loads the pinned Native factory receipt;
- creates `createM6TopologyWorld(...)`;
- uses M6-specific trace/controller/world types.

`src/physics/box3d-boundary.ts` directly imports `box3d.js/inline` and exposes `createM6TopologyWorld(...)`. The pinned package is `box3d.js@0.0.2`; Box3D execution is already provided through a WebAssembly binding. Therefore the meaningful H1/H2 distinction is **where vehicle/mechanical policy, topology and controller authority live**, not simply "JavaScript versus WebAssembly physics".

`src/vehicle/m6/legacy-ts-m6-backend.ts` explicitly declares the current backend:

- `REFERENCE_BROWSER_FIXTURE`;
- `productPhysicsAuthority:false`;
- `nativeParity:NOT_PROVEN`;
- `acceptsNewProductPhysics:false`;
- known `maxDriveSpeed` semantic mismatch.

`src/vehicle/m6/m6-runtime-builder.ts` also demonstrates that current vehicle construction is materially coupled: procedural hardpoints, FL source-registered special handling, an extra FL suspension-carrier bridge, legacy split-wheel creation, arms, steering and joint ownership are assembled in the same runtime path. This is evidence against assuming that current subsystems are already cleanly swappable.

No active native-derived JV vehicle WASM implementation or build path exists in the current repo. The `native_jv_wasm` identifier is vocabulary/intent only, not implemented capability.

## 3. Shared non-negotiable constraints

A serious hypothesis is disqualified if it requires violating these merely for convenience:

- preserve accepted Web input/mobile/world/camera/fullscreen/publication behavior outside the declared experiment blast radius;
- preserve independent relation-local endpoint ownership where relational mechanical truth is involved;
- keep authored/neutral truth separate from runtime dynamics/contact/solver policy;
- do not assume one authored element equals one runtime body/collider;
- replace a selected mechanical mechanism coherently rather than mixing incompatible geometry authorities;
- do not invent an additional physical M6 carrier body;
- keep provenance and deterministic identity explicit;
- keep visual representation/binding from silently becoming mechanical authority;
- do not hide steering-return/contact debt with silent artificial centering;
- do not freeze JURE, current neutral schema, renderer, universal ontology or world-streaming architecture merely to execute a vehicle experiment;
- preserve legacy implementations as controls where their comparison value is useful.

These constraints do not imply one runtime technology or one lowering architecture.

## 4. H1 — Web-native mechanical core

Classification: `SERIOUS HYPOTHESIS / NEW WEB VEHICLE AUTHORITY`

### Boundary

```text
accepted Web product/input/world/presentation host
-> normalized vehicle commands
-> NEW Web-native vehicle/mechanical core
-> browser Box3D binding/world
-> state + trace + visual-frame semantics
-> existing Web presentation/evidence surfaces
```

Vehicle topology, force laws, control/mechanical policy and runtime assembly are owned by new repo-native Web code rather than `legacy_ts_m6`. The first implementation may remain TypeScript over the existing browser Box3D API, but the hypothesis is **not** "improve the legacy backend"; that backend remains a control fixture.

### Strongest case

- lowest language/tooling distance from the current product and tests;
- direct access to existing input timelines, fixed-step host, telemetry, world data, visual frame and browser debugging;
- smallest conceptual gap between experiment and Owner Preview/device validation;
- permits rebuilding current M6 mechanics coherently rather than preserving provisional FL/FR bridges;
- can keep JURE/schema/runtime lowering open unless a selected mechanism actually needs authored input;
- avoids importing Native application structure merely because Native is the primary donor.

### What it preserves

- browser/product shell and accepted controls;
- world/scan surfaces and current renderer unless causally challenged;
- fixed-step/presentation separation and observability techniques;
- existing visual-frame/binding capability where it remains adequate;
- current legacy vehicle as A/B/control evidence.

### What it replaces

When selected, it may replace the current M6 topology/controller/runtime builder, drivetrain semantics, steering bridges and contact implementation as separate evidence-backed stages. It does not require replacing all of them at once.

### Authored truth treatment

Authored relation/frame/provenance truth may be consumed when a real mechanism needs it, but H1 does not require JURE or a frozen serialized schema. Runtime body/collider granularity remains Web-owned and mechanism-specific.

### Healthy specialization

The vehicle core may be deliberately wheeled-vehicle/M6-specific. It must not pretend double-wishbone, tire or rack mechanics are universal machine abstractions.

### Strongest reason H1 could be wrong

The browser-facing Box3D API/binding or a TypeScript-owned vehicle layer may be a real capability/iteration ceiling for the mechanics JV wants. If important donor mechanisms require engine features not exposed cleanly by the Web binding, repeated source-level native behavior, or too much per-joint orchestration/translation, a Web-native rewrite could reproduce the same quality ceiling in cleaner code.

A second risk is epistemic: rewriting Native mechanisms from descriptions may introduce semantic drift that direct native-derived execution would avoid.

### Cheapest high-information falsifier

`WEB-NATIVE-CAPABILITY-SLICE`

Use one bounded, mechanically discriminating donor behavior selected in Gate 7 and prove whether a **new**, non-legacy Web-native implementation can express it through the browser Box3D boundary with deterministic command/state/trace evidence and without broad product changes.

Good candidate behaviors are those that stress actual mechanical capability rather than UI — for example a coherent steering/suspension relation or a wheel/contact behavior if Gate 7 selects that pressure cluster.

PASS signal:

- mechanism can be expressed coherently with a narrow new Web runtime path;
- no guessed geometry/authority;
- no broad product-host rewrite;
- deterministic evidence is practical;
- no essential engine capability is missing.

FAIL / strong downgrade signal:

- required behavior needs custom native engine/API work before the vehicle experiment can even be represented;
- the implementation must reproduce large amounts of donor logic indirectly with ambiguous semantics;
- browser/API crossing or host coupling dominates the slice;
- preserving accepted product surfaces requires a broad rewrite.

### Expected blast radius of falsifier

`LOW-MEDIUM` if kept to an isolated mechanism/runtime test path; `HIGH` only if incorrectly attempted as whole-car replacement.

### Commitments if adopted

- Web repository becomes primary home of vehicle mechanical policy;
- browser Box3D API is accepted as the near-term execution boundary, subject to later challenge;
- Native becomes evidence/donor rather than executable vehicle authority.

### Decisions H1 can leave open

JURE/tool choice, serialized schema, final tire architecture, renderer, world streaming, one-app/multi-app split and future flight dynamics.

## 5. H2 — native-derived compiled vehicle core

Classification: `SERIOUS HYPOTHESIS / COMPILED VEHICLE AUTHORITY`

### Boundary

```text
accepted Web product/input/presentation host
-> narrow command/world/config contract
-> native-derived JV vehicle/mechanical core compiled for browser
   + Box3D solver ownership needed by that core
-> compact state/trace/visual-frame output
-> Web rendering/telemetry/Owner surfaces
```

This is not "use WASM because WASM is faster". The current Box3D binding already executes through WebAssembly. The architectural change is to move **vehicle topology/controller/mechanical policy** from TypeScript into a compiled native-derived core and expose a narrow product-facing semantic boundary.

### Strongest case

- can preserve more of the source semantics of proven Native mechanisms instead of re-translating them manually;
- can expose or compile against full engine capabilities needed by future vehicle/contact work rather than being limited by the current published binding surface;
- can keep high-frequency vehicle/solver orchestration inside one compiled module and return only product-relevant state/trace;
- may become a stronger long-term boundary if vehicle mechanics grow significantly more complex while Web remains the product host;
- keeps browser UI/input/world presentation independent from the internal language used by vehicle mechanics.

### What it preserves

- accepted Web controls and command semantics at the host boundary;
- product shell/mobile/camera/fullscreen;
- Web visual rendering and `VehicleVisualFrame`-like state boundary where proven useful;
- publication/provenance/telemetry requirements;
- Owner-facing worlds as product content, though physical world ingestion must be solved by the compiled core.

### What it replaces

- `legacy_ts_m6` as vehicle authority;
- TypeScript ownership of selected vehicle topology/controller/force/contact logic;
- current direct `F4 -> Box3DBoundary -> createM6TopologyWorld` vehicle path.

### Authored truth treatment

The compiled core must not own authored-source truth implicitly. It may consume a validated narrow neutral fragment or generated static data, but provenance/frames/relations remain explicit and tool-independent. Runtime identities remain runtime-owned.

### Healthy specialization

The compiled core may be a wheeled-vehicle core, not a universal machine runtime. A future drone core may be separate unless real evidence earns a shared dynamics layer.

### Strongest reason H2 could be wrong

The build/ABI/world-integration boundary may cost more than the mechanical value it buys. Because vehicle contact must exist in the same physical world as terrain, a useful compiled core cannot simply be a detached "vehicle algorithm DLL" while current Web owns a separate solver world. It must either own/shared-access the relevant Box3D world or expose a sufficiently coherent integration path.

That can create:

- custom native/Emscripten build maintenance;
- world/scan collider ingestion complexity;
- startup/memory/mobile cost;
- harder browser debugging and Owner-iteration loops;
- a large state/trace ABI;
- accidental 1:1 porting of Native debt that Gate 1 explicitly rejected.

Native itself is a donor, not a quality ceiling; compiling it does not make its architecture correct.

### Cheapest high-information falsifier

`NATIVE-CORE-BROWSER-VERTICAL-SLICE`

Build only the smallest compiled vertical slice that can answer whether this boundary is operationally sane:

- one deterministic physical world;
- one small but real mechanical relation/contact unit;
- one normalized command input;
- one compact state/trace/visual-frame output;
- one Web-defined static ground/world input;
- browser startup/step/disposal evidence.

It must not port the whole M6.

PASS signal:

- reproducible build and browser load are simple enough for repo-native iteration;
- one solver/world owns both mechanism and ground without duplicated truth;
- command/state/trace ABI remains narrow and intelligible;
- debugging/provenance remain practical;
- runtime/mobile overhead is plausibly compatible with the product.

FAIL / strong downgrade signal:

- the spike requires a broad custom binding/toolchain campaign before meaningful mechanics can be tested;
- world integration forces duplicated solver/world representations;
- ABI/state synchronization grows toward raw-engine mirroring;
- browser iteration becomes materially slower or less observable than the mechanical benefit warrants.

### Expected blast radius of falsifier

`MEDIUM` in tooling/runtime foundation, but product UI/render/publication can remain untouched. A whole-car port would be `VERY HIGH` and is explicitly not the first falsifier.

### Commitments if adopted

- a native/Emscripten/browser build pipeline becomes product-critical;
- vehicle mechanical authority moves behind an ABI;
- world/contact ownership across that ABI must be explicit;
- debugging and telemetry must span TypeScript + compiled code.

### Decisions H2 can leave open

JURE/tool choice, final serialized authored schema, renderer, world visual streaming, future flight architecture and final tire model — although the compiled engine/binding capability influences the latter.

## 6. H3 — coherent-subsystem replacement in the current solver world

Classification: `SERIOUS HYPOTHESIS / INCREMENTAL MECHANICAL AUTHORITY MIGRATION`

### Boundary

```text
accepted current Web product + Box3D world
-> current legacy M6 remains migration shell/control
-> selected COMPLETE mechanical unit is replaced by new authority
-> unchanged unrelated current mechanics remain control
-> existing trace/visual/product surfaces compare old vs new
```

H3 treats whole-core selection as premature. It deliberately migrates one coherent unit at a time inside the current browser solver world, without building a universal backend/plugin framework.

### Strongest case

- smallest causal blast radius and easiest rollback;
- strongest direct A/B comparison with the accepted product/control specimen;
- preserves current worlds, host, inputs, visuals and telemetry;
- can target exactly the intersection of Owner pain and architecture debt;
- allows future runtime technology choice to remain open while gathering better mechanical evidence;
- fits the project loop: smallest meaningful change -> causal test -> faithful render/device evidence -> Owner judgement.

### What it preserves

Nearly all current product/browser capital plus any legacy mechanics outside the selected unit. Legacy code is preserved as a control, not as future authority.

### What it replaces

Only a selected coherent mechanism. It must replace all mutually dependent geometry/relations inside that unit together rather than splice isolated coordinates into procedural companions.

### Authored truth treatment

A unit may consume explicit authored frames/relations if required, but H3 does not freeze the producer or schema. Exact runtime representation is chosen for the unit and need not mirror authored element count.

### Healthy specialization

Every replacement can remain mechanism/domain-specific. No generic "component plugin" ontology is required.

### Strongest reason H3 could be wrong

Current M6 construction is not demonstrably modular. Source already intertwines procedural hardpoints, FL special carrier/steering treatment, wheel creation and control-arm/joint construction. A supposedly local replacement may therefore require changes across topology, steering, contact, trace and visuals.

If so, H3 can become the worst of both worlds:

- old and new mechanical truths coexist;
- temporary adapters become permanent;
- causal ownership becomes harder to reason about;
- each later unit pays another migration tax;
- the project recreates the exact incoherent-hybrid failure that Gate 1 rejected.

### Cheapest high-information falsifier

`COHERENT-UNIT-ISOLATION-PROBE`

Before using final Owner-open mating or changing product physics, test whether one coupling-heavy mechanical unit can be isolated as a **complete replacement boundary** using known/control geometry and existing deterministic traces.

The purpose is architectural isolation, not product acceptance.

PASS signal:

- all authority inside the chosen unit can be named explicitly;
- outside systems consume a narrow, stable set of state/relations;
- the unit can be replaced without retaining incompatible companion geometry;
- unrelated controls/world/rendering stay unchanged;
- rollback to the legacy control is clean.

FAIL / strong downgrade signal:

- isolation requires touching many unrelated runtime layers;
- old hardpoints/topology must remain authoritative inside the new unit;
- steering/contact/visual ownership cannot be separated without effectively rebuilding the whole core;
- adapters outnumber the actual new mechanism.

This probe can use control geometry; it does not require guessing or prematurely deciding exact JURE outboard mating.

### Expected blast radius of falsifier

`LOW-MEDIUM` if performed as structural/runtime isolation evidence. If the chosen unit forces whole-vehicle topology changes, that result itself falsifies the claimed low-blast architecture.

### Commitments if adopted

- temporary coexistence of legacy and new mechanical authorities during migration;
- explicit per-unit authority boundaries and rollback controls;
- discipline against generic plugin/framework expansion.

### Decisions H3 can leave open

TS vs native-derived compiled core for later units, JURE/schema, final tire architecture, renderer, world streaming and future machine architecture.

## 7. H0 — conservative semantic-correction control

Classification: `CONTROL HYPOTHESIS / NOT A NEXT-GENERATION ARCHITECTURE`

### Boundary

No new architecture boundary. Preserve the current product/runtime and test whether one tightly scoped Owner-visible problem is primarily a local semantic/behavior defect rather than evidence that a new core is immediately required.

The obvious existing example is the longitudinal `maxDriveSpeed` semantic mismatch plus Owner-observed low power/brake dominance, but Gate 7 may select another local control if it has better information value.

### Strongest case

- minimal implementation and validation cost;
- may deliver direct product evidence quickly;
- prevents architecture work from being justified only by aesthetic dislike of legacy code;
- gives a baseline for how much improvement a local correction can achieve before structural replacement is warranted.

### Strongest reason H0 could be wrong

It has low architecture information gain. A successful local fix may polish a backend that is explicitly not product-physics authority, while known suspension/steering/contact/rig debt remains. Repeated H0 slices would become a legacy-polish campaign rather than next-generation work.

### Cheapest high-information falsifier

A single headless/isolated semantic correction or A/B experiment with no broad product integration. If it cannot materially change the relevant behavior because the defect is structural, H0 is quickly rejected for that pressure cluster.

### Expected blast radius

`LOW`.

### Commitments if adopted

None beyond the one experiment. H0 must not silently become the future architecture.

## 8. Cross-hypothesis comparison

| Hypothesis | Vehicle authority | Main upside | Strongest failure reason | Cheapest falsifier | Falsifier blast radius | Major new commitment |
| --- | --- | --- | --- | --- | --- | --- |
| **H1 Web-native mechanical core** | New Web repo-native vehicle core over browser Box3D boundary | fastest product-integrated iteration; one repo/tooling context | browser binding/API or TS-side vehicle logic may be a real capability/semantic ceiling | `WEB-NATIVE-CAPABILITY-SLICE` | low-medium | Web owns vehicle policy; browser Box3D API is near-term execution boundary |
| **H2 native-derived compiled core** | compiled native-derived vehicle/mechanical core behind Web semantic ABI | closer executable relationship to donor/native mechanics; can own needed engine surface | build/ABI/world integration may overwhelm value and import Native debt | `NATIVE-CORE-BROWSER-VERTICAL-SLICE` | medium | native build + ABI + solver/world ownership become product-critical |
| **H3 coherent-subsystem replacement** | mixed migration: new coherent unit + legacy outside unit in one solver world | smallest causal blast; direct A/B/rollback; leaves runtime tech open | current topology may be too coupled; hybrid can become permanent patchwork | `COHERENT-UNIT-ISOLATION-PROBE` | low-medium | temporary dual authority and strict per-unit boundaries |
| **H0 conservative control** | current legacy fixture for one local A/B only | cheapest test that architecture work is actually necessary | low architecture information; can polish a non-authoritative backend | one local semantic A/B | low | none; cannot become architecture by inertia |

This table is **not a ranking**.

## 9. Orthogonal decisions deliberately not collapsed into the hypotheses

Gate 6 found that several decisions are orthogonal to runtime-authority location and should not be multiplied into a combinatorial architecture matrix yet:

- final authored producer: JURE vs evolved JURE vs another tool;
- exact serialized neutral schema;
- exact authored->runtime lowering/body granularity;
- final tire/contact model;
- renderer/world-streaming architecture;
- one application vs cooperating tools;
- future flight dynamics architecture.

Any H1/H2/H3 implementation can be designed to keep these open until real evidence requires commitment.

## 10. Product-preservation audit

All serious hypotheses can, in principle, preserve the accepted browser product capital.

- H1 has the most direct access to existing Web host/tests but must avoid treating `F4VehicleHost` as already generic.
- H2 can preserve Web UI/rendering, but physical world ownership is the most dangerous integration surface.
- H3 has the smallest nominal product blast radius, but only if the chosen unit is genuinely isolatable.
- H0 naturally preserves the product but does not solve architecture uncertainty.

No hypothesis earns permission to rewrite input, mobile composition, camera, fullscreen, world loading, renderer or Preview merely because vehicle mechanics are changing.

## 11. Future-pressure / anti-platform audit

None of H1/H2/H3 requires a universal machine ontology.

- H1 can host a deliberately M6/wheeled-vehicle core and later add a separate flight domain.
- H2 can compile a wheeled-vehicle mechanical core without claiming every future machine must use it.
- H3 is explicitly per-mechanism/domain.

A hypothesis fails future-pressure review if it turns current M6 body counts, tire semantics, rack topology or JURE field names into universal machine truth.

Large-world ambition is not a reason to choose H1/H2/H3. The relevant constraint is only that vehicle-core choices must not silently own world rendering/streaming architecture. Physical world/collider ingestion is a real H2 integration concern; visual streaming remains separate.

## 12. Falsifier-quality review

A Gate 7 candidate falsifier should be rejected if it mainly tests implementation stamina rather than the hypothesis.

High-quality falsifiers should:

- answer one architecture uncertainty;
- have a bounded causal blast radius;
- produce deterministic machine evidence before Owner judgement where possible;
- reuse current control traces/fixtures rather than delete them;
- preserve accepted product behavior outside scope;
- have an explicit failure result that can downgrade a hypothesis;
- avoid requiring exact Owner-open mating unless the selected information question truly depends on it.

The hypothesis-specific candidates currently are:

- H1: `WEB-NATIVE-CAPABILITY-SLICE`;
- H2: `NATIVE-CORE-BROWSER-VERTICAL-SLICE`;
- H3: `COHERENT-UNIT-ISOLATION-PROBE`;
- H0: one local semantic A/B control.

Gate 7 may refine or reject all of them. Their presence here is not authorization.

## 13. Gate 6 verdict

The architecture space remains genuinely plural.

FACT:

- current Web contains strong product/browser/evidence capital and a non-authoritative legacy vehicle implementation;
- current backend vocabulary is ahead of actual backend interchangeability;
- no native-derived JV vehicle WASM core currently exists in the repo;
- current M6 construction is sufficiently coupled that incremental replacement cannot be assumed cheap;
- no current evidence proves that vehicle authority must live in TypeScript or in a compiled native core.

HYPOTHESIS:

- H1, H2 and H3 are all plausible enough to deserve falsification rather than rhetorical selection;
- H0 is useful only as a control against unnecessary architecture work.

NOT VALIDATED:

- whether current browser Box3D capabilities are sufficient for the highest-value next mechanics;
- whether a compiled native-derived vehicle boundary is operationally cheap enough for the Web product;
- whether a coherent unit can actually be isolated inside the current coupled M6 runtime;
- which pressure cluster gives the highest information gain and product value;
- which hypothesis should be preferred.

**Gate 6 does not choose a winner.**

The next stage is Gate 7: select the **first next-generation falsifier** by information gain + product value + bounded blast radius + reversibility, while preserving the right to discard the architecture hypothesis it tests.
