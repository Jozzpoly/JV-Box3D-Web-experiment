# JURE -> JV-Web consumer boundary

Updated: 2026-08-24
Status: `JV CONSUMER FOUNDATION IN MAIN / CURRENT JURE STATE MUST BE RESOLVED LIVE / CONCRETE JURE DATA SCHEMA NOT YET FROZEN`

This contract defines ownership and integration invariants between Jozz Universal Rig Editor (JURE) and JV Web. It deliberately does **not** define the final serialized JURE consumer schema yet.

This document does not claim current operational JURE refs. Historical JURE evidence is retained only to explain how this boundary was derived. Before any new JURE -> JV work, resolve JURE live from its own current authority and grounding; conversation memory or dated anchors here are not proof of JURE state.

## 1. Shared program purpose

JURE and JV are complementary parts of the same vehicle-R&D direction.

The practical goal is that the Owner can eventually build, inspect, correct and export a complete vehicle rig through JURE itself: exact part placement, frames, mechanical relations, suspension/steering geometry and representation intent for moving real parts such as wishbones, steering links, dampers and springs. The engineering executor may implement the tooling, difficult math, diagnostics and automation, but must not remain a mandatory manual rig operator.

JV is the first demanding consumer/falsifier. It should consume deterministic authored neutral truth without contaminating that truth with browser, Box3D or runtime convenience.

The current M6 is the first integration target. The architecture should also support future vehicle rigs and later non-vehicle mechanisms when real use justifies them, without prematurely becoming a general mechanical framework.

A damper/spring pair illustrates the intended split: JURE should let the Owner author and visually/mechanically fit attachment frames, neutral axis/travel geometry and representation mapping; JV owns spring/damping force laws, solver/runtime state and current compression/extension used to animate the authored representation.

## 2. Authority split

### JURE owns

- exact SOURCE provenance needed by authored output;
- authored neutral element identity;
- authored local/root frames and their geometric meaning;
- authored neutral mechanical relations;
- authored representation intent/mappings when present;
- deterministic export of the consumer-facing authored subset;
- versioning of the authored consumer format.

### JV owns

- strict consumer parsing/validation;
- placement into JV rig space and later world space;
- Box3D/native runtime body/joint identity;
- mass, inertia and collision policy;
- damping, friction, spring/motor/force-law and solver configuration;
- vehicle-specific runtime topology beyond the authored neutral mechanism;
- controls, telemetry, rendering integration and public release behavior.

Neither side may silently absorb the other side's authority merely to simplify one integration.

## 3. Durable geometric falsifier

The first serious JV/JURE comparison established that:

- implicit identity placement is invalid;
- explicit rigid placement is acceptable only when proven from exact evidence;
- current procedural M6 wishbone geometry and the exact/JURE-authored wishbone geometry are **not rigid-congruent**;
- therefore no translation+rotation can make the two neutral shapes equivalent;
- replacing one authored hardpoint/relation while retaining the incompatible procedural companion geometry would create an incoherent hybrid.

This is a permanent integration constraint unless later exact evidence disproves it.

## 4. Coherent replacement rule

A JURE-authored mechanism must replace a coherent neutral geometric unit. Do not splice one authored hardpoint into an incompatible procedural shape or mutate authored frames merely to make the current runtime topology fit.

The first useful coherent target remains one side of the double wishbone:

- chassis reference;
- upper arm;
- lower arm;
- carrier reference;
- two inboard revolute relations;
- two outboard spherical relations.

This shape is a consumer target, not yet the frozen JURE serialized schema.

## 5. JV neutral consumer foundation now in `main`

JV `main` contains a deliberately small read-only consumer-side representation:

- `src/vehicle/neutral-mechanism.ts` — engine-neutral bodies, frames, relations and explicit `jv-rig-space/v1` coordinate convention;
- `src/vehicle/m6/m6-neutral-geometry.ts` — projection of the current procedural front-left M6 double-wishbone into that representation;
- `tests/jure-neutral-geometry.test.mjs` — equivalence/provenance/authority-boundary checks;
- `tools/write-jure-neutral-geometry-receipt.mjs` — deterministic diagnostic exporter.

This is **not** the JURE authored file format and not a second generic rig schema. It is the smallest proven JV lowering/diagnostic seam needed to compare future authored data against current consumer geometry.

The current diagnostic receipt is `jv-neutral-geometry-receipt/v1`. For stand-alone evidence it records:

- exact JV repository identity;
- exact producer commit;
- exact factory-receipt path;
- exact factory-receipt Git blob;
- SHA-256 of canonical factory-receipt blob bytes;
- explicit JV rig units/basis/root;
- coherent neutral bodies/frames/relations.

The exporter fails closed if tracked source differs from `HEAD` or if `origin` does not identify `Jozzpoly/JV-Box3D-Web-experiment`. Moving branch names are intentionally not provenance authority.

The neutral representation contains no Box3D IDs, mass, density, collision, damping, spring/motor/solver settings or control policy.

## 6. Requirements for a future JURE consumer fragment

When current JURE work eventually freezes a concrete consumer format, it must make explicit at least:

- schema/version identity;
- exact producer/source provenance;
- deterministic element/frame/relation identity;
- units and coordinate basis/handedness;
- authored neutral transforms and relation semantics;
- placement semantics sufficient to avoid implicit identity;
- relation endpoints/kinds without JV runtime IDs;
- deterministic serialization/identity;
- fail-closed compatibility behavior.

Exact field names and JSON/package layout are **not authority yet**. JV must not guess them before JURE freezes a real multi-relation fragment.

## 7. Future integration sequence

When authored-rig work becomes necessary again:

```text
resolve current JURE authority and freeze exact JURE fragment + producer
-> obtain exact bytes
-> strict independent parse
-> schema / units / basis / provenance validation
-> explicit placement validation
-> internal neutral geometry proof
-> lower into the JV neutral consumer representation
-> compare coherent authored and procedural units
-> only then isolated runtime/Box3D substitution experiment
-> browser/runtime proof
-> separate public-release decision
```

Do not skip from parser success directly to runtime substitution. Do not change Friends in the first consumer/runtime experiment.

A temporary branch is justified only when an actual risky integration/runtime experiment starts. The accepted steady state of JV itself is `main`-only.

## 8. Fail-closed rules

Reject the fragment/experiment if schema, units, basis or provenance are ambiguous; required locators are non-unique; placement requires guessing; identity placement is assumed; values are non-finite/incomplete; authored and procedural shapes are mixed; relation kinds need reinterpretation; or consumer runtime dynamics would have to be written back into authored neutral truth.

## 9. Historical JURE anchors — evidence only

The following refs describe the JURE state used when this JV-side boundary was established on 2026-08-16. They are **historical evidence, not current JURE authority**:

```text
historical JURE accepted main observed then:
  d971b8bef5dd7c65b78884b6b449e1f5ab0e7425

historical clean validated foundation candidate / closed PR #3:
  4db04eee4da0216f6bd3df6b6b0c82aa20afab5a

historical paused real-JV authoring checkpoint / closed PR #4:
  checkpoint/paused-jv-authoring-2026-08-16
  @f0f8cd91aca583610dc2dedd34e537a145a01b61
```

Do not use these refs to plan new integration without independently resolving JURE's current live Git and current project-state documentation. If JURE's own pre-Codex grounding produces a newer frozen consumer boundary, compare it explicitly against this JV contract before changing either side.

## 10. Exit condition for full rig integration

This boundary becomes an executable JURE->JV format contract only when JURE freezes a real deterministic multi-relation fragment, JV independently validates its version/provenance/units/basis/placement, neutral geometry coherence passes, and a coherent runtime replacement can be designed without modifying authored truth.

Until then the `main` neutral seam exists to preserve JV's current mechanical truth in a form that future Owner-authored rigs can be compared against rigorously.
