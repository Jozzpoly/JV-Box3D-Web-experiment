# JURE -> JV-Web consumer boundary

Updated: 2026-08-16
Status: `BOUNDARY FROZEN / CONCRETE DATA SCHEMA NOT YET FROZEN`

This contract defines ownership and integration invariants between Jozz Universal Rig Editor (JURE) and JV Web. It deliberately does **not** define the final serialized JURE consumer schema yet.

JURE is a separate project and authority. Resolve its current refs, PRs and status live before integration work.

## 1. Purpose

JURE should let the Owner create trustworthy authored rig truth once and hand a small deterministic result to consumers without an agent reconstructing hardpoints/frames from screenshots, naming conventions or procedural guesses.

JV Web is the first real consumer/falsifier. Its job is to prove that an authored neutral mechanism can be consumed without contaminating authored truth with browser/Box3D/runtime convenience.

## 2. Authority split

### JURE owns

- exact SOURCE provenance needed by authored output;
- authored neutral `RigElement` identity;
- authored local/root frames and their intended geometric meaning;
- authored neutral mechanical relations;
- authored representation intent/mappings when present;
- deterministic export of the consumer-facing authored subset;
- versioning of that authored consumer format.

### JV Web owns

- strict consumer parsing/validation;
- consumer placement into the JV-Web vehicle/world coordinate system;
- Box3D/native runtime body/joint identity;
- mass, inertia and collision policy;
- damping, friction, springs, motors, force laws and solver/runtime configuration;
- vehicle-specific runtime topology beyond the authored neutral mechanism;
- driving controls, telemetry, rendering integration and public release behavior.

Neither side may silently absorb the other side's authority merely to simplify one integration.

## 3. Current critical falsifier

The first serious JURE/JV consumer work falsified a tempting partial-integration strategy:

- implicit identity placement was rejected;
- explicit rigid placement is a valid abstraction when proven from exact evidence;
- the current procedural M6 wishbone geometry and the exact/JURE-authored wishbone geometry are **not rigid-congruent**;
- therefore no translation+rotation can make the two neutral shapes equivalent;
- replacing one authored lower hinge while retaining the rest of the procedural wishbone would create an incoherent hybrid mechanism.

This result is a durable architectural constraint, not merely a failed experiment.

## 4. Coherent replacement rule

A JURE-authored mechanism must replace a coherent neutral geometric unit.

Do not:

- replace one JURE hardpoint inside an otherwise incompatible procedural arm;
- mix one JURE-authored relation with procedural companion relations whose neutral geometry belongs to another shape;
- keep procedural inboard/outboard points merely because the runtime already has them;
- project or mutate authored frames to make an incompatible consumer topology fit.

The minimum coherent unit is intentionally **not hard-coded in this document yet**. Current JURE work is proving a double-wishbone shape involving upper arm, lower arm, chassis reference, carrier reference, two inboard revolutes and two outboard spherical relations. JURE must finish the Owner workflow and freeze the intended multi-relation consumer fragment before JV-Web treats that shape as executable contract.

## 5. Requirements for the future JURE consumer fragment

When the concrete format is frozen, it must be sufficient for an independent consumer to reject ambiguity without agent interpretation.

At minimum the format/associated immutable evidence must make explicit:

- schema/version identity;
- exact source/revision provenance when source-derived data matters;
- deterministic element/frame/relation identity;
- units;
- coordinate basis/handedness conventions;
- authored neutral frame transforms and relation semantics;
- enough placement information to distinguish source-local/authored-local/root/consumer placement;
- relation endpoints and relation kind without consumer-specific body/joint IDs;
- deterministic serialization/bytes or an equivalently strict canonical identity;
- compatibility/failure behavior for unsupported versions or relation kinds.

The exact field names, JSON layout and packaging are **not authority yet** and must not be guessed in JV-Web before JURE freezes them.

Consumer dynamics do not belong in this authored fragment unless a future cross-project design explicitly establishes a separate authored dynamics domain.

## 6. First JV-Web consumer experiment

The first real integration must be isolated and private.

### Branch

Use exactly one branch named:

`jure/<specific-purpose>`

`docs/PROJECT_STATE.md` must name the branch and the exact JURE producer/checkpoint while it is active.

### Sequence

```text
1. freeze/pin exact JURE fragment + producer/checkpoint
2. obtain exact bytes/evidence without text/checkout transformation
3. strict independent parser in JV-Web
4. validate schema version and supported relation vocabulary
5. validate units / basis / handedness / finite values
6. validate provenance and exact source identity where required
7. validate explicit placement; reject implicit identity
8. prove internal neutral geometry coherence independently
9. map into a consumer-neutral intermediate representation
10. compare that coherent unit against the procedural M6 unit it would replace
11. only after geometry passes, experiment with runtime/Box3D substitution
12. validate browser/runtime behavior privately
13. decide separately whether any public Friends experiment is warranted
```

Do not skip from parser success directly to runtime substitution.

## 7. Fail-closed rules

Reject the consumer fragment/experiment if:

- schema version is unknown;
- units or basis are implicit;
- a required source revision/provenance cannot be proven;
- a frame/relation locator cannot be resolved uniquely;
- placement depends on agent guessing or screenshot interpretation;
- identity transform is assumed rather than demonstrated;
- any required value is non-finite or structurally incomplete;
- the proposed replacement mixes incompatible authored/procedural neutral geometry;
- a relation kind would need to be silently reinterpreted as a different consumer mechanism;
- runtime dynamics would have to be written back into JURE-authored neutral truth.

A failed consumer experiment must not mutate public Friends or current accepted `main` runtime.

## 8. Relationship to current M6 source

Current JV-Web M6 code already exposes geometry as explicit typed values/functions, including `M6WishboneHardpoints` and `m6WishboneHardpoints(...)`. This is a useful consumer seam, but the current values remain procedural/provisional.

Do not create a second generic rig framework around them pre-emptively. Once JURE freezes a real consumer fragment, introduce only the smallest adapter/intermediate necessary to replace the proven coherent unit.

Current source-registration and temporary steering bridges remain valid product intermediates until a separately validated coherent authored replacement exists.

## 9. Current JURE coordination snapshot

Snapshot from 2026-08-16; re-resolve live before use:

```text
repo: Jozzpoly/Jozz-Universal-Rig-Editor
accepted baseline: main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425
clean foundation candidate / PR #3:
  promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a
active real-JV product line / draft PR #4:
  work/real-jv-rig-elements@7b385e8e591d13c3ccab06647390d9d28e06a1d4
```

PR #4 is coordination evidence, not JV-Web authority. It may advance after this snapshot.

## 10. Exit condition for this boundary

This boundary becomes an executable cross-project format contract only when all of the following exist:

1. JURE freezes one explicit versioned multi-relation consumer fragment;
2. JURE validates deterministic save/export for the exact real mechanism;
3. JV-Web independently parses and validates the exact fragment;
4. units/basis/placement/provenance are proven without guessing;
5. neutral geometry coherence passes;
6. the coherent procedural replacement unit is identified;
7. an isolated private runtime substitution test can be designed without modifying authored truth.

Until then: document the boundary, do not build speculative adapter architecture.