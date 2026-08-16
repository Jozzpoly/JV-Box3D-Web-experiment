# JURE -> JV-Web consumer boundary

Updated: 2026-08-16
Status: `BOUNDARY FROZEN / CONCRETE JURE DATA SCHEMA NOT YET FROZEN`

This contract defines ownership and integration invariants between Jozz Universal Rig Editor (JURE) and JV Web. It deliberately does **not** define the final serialized JURE consumer schema yet.

JURE is a separate project and authority. Resolve its current refs, PRs and status live before integration work.

## 1. Purpose

JURE should let the Owner create trustworthy authored rig truth once and hand a small deterministic result to consumers without an agent reconstructing hardpoints, frames or part relationships from screenshots, naming conventions or procedural guesses.

JV Web is the first real consumer/falsifier. Its job is to prove that an authored neutral mechanism can be consumed without contaminating authored truth with browser, Box3D or runtime convenience.

### Shared long-term program direction

JURE and JV are complementary parts of the same R&D direction, not unrelated tools that happen to exchange files.

The primary near-term purpose of JURE in the JV program is to let the Owner author and correct the mechanical and representation truth needed by JV vehicles: exact part placement, interface frames, relation topology, suspension and steering geometry, coherent replacement subgraphs, and the representation intent needed to bind real visual parts to the mechanism.

The current M6 is the first demanding integration target. The long-term target is broader:

- replace provisional procedural vehicle rig geometry with coherent authored mechanisms;
- make real vehicle parts fit their authored mechanical interfaces instead of compensating with hidden offsets;
- author new vehicle rigs without rebuilding the consumer architecture for every car;
- represent mechanisms such as wishbones, steering links, racks, dampers, springs, pistons, rotors and similar moving assemblies through explicit mechanical interfaces;
- keep the architecture open to future non-vehicle mechanisms when real use requires them, without prematurely turning either project into a general-purpose mechanical framework.

A damper/spring pair illustrates the intended responsibility split. JURE should let the Owner directly author and adjust its neutral attachment frames, axis/travel geometry and representation mapping until the real visual damper and spring fit and move correctly. JV owns the runtime force law, spring/damping parameters, solver state and current compression/extension. The visual layer should then animate the exact authored parts from that runtime state. JURE must not become the vehicle dynamics solver merely to support correct rigging and animation.

This shared direction does not make every JURE concept a JV API and does not make current JV procedural geometry authored truth. The projects should meet through the smallest explicit consumer boundary proven by real mechanisms.

### Owner end-to-end authoring invariant

JURE is **not** an agent-operated preprocessing step for JV. Its product goal is to make the Owner capable of carrying a real rigging task from beginning to end inside the workbench.

For a mechanism that JURE claims to support, the intended Owner workflow is:

`load/inspect exact SOURCE -> create/select authored parts -> author and adjust frames/relations -> fit mechanical geometry and representation -> inspect diagnostics -> kinematically test/reset -> correct the rig -> save/reopen -> export deterministic authored result`

The agent may implement the workbench, derive difficult math, add diagnostics, automate repetitive work and help investigate failures. It must not remain a mandatory rig-authoring operator whose manual coordinate edits or consumer-code changes are required every time the Owner wants to create or correct a rig. Repeated hard rigging operations should become inspectable Owner workflows in JURE rather than permanent agent-only procedures.

This is especially important for the JV program: the Owner must eventually be able to build and tune the complete vehicle rig in JURE, including exact part fit, suspension/steering relations and visual representation of moving assemblies such as dampers and springs, before handing deterministic authored truth to JV for runtime physics.

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
- consumer placement into JV vehicle rig space and later world space;
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

A JURE-authored mechanism must replace a coherent neutral geometric unit. Do not replace one JURE hardpoint inside an otherwise incompatible procedural mechanism, mix authored and procedural companion relations from different shapes, or mutate authored frames merely to make a consumer topology fit.

The minimum coherent unit is intentionally **not hard-coded here yet**. Current JURE work is proving a double-wishbone shape involving upper arm, lower arm, chassis reference, carrier reference, two inboard revolutes and two outboard spherical relations. JURE must finish the Owner workflow and freeze the intended multi-relation consumer fragment before JV-Web treats that shape as executable contract.

## 5. Requirements for the future JURE consumer fragment

When the concrete format is frozen, it must make explicit at least: schema/version identity; exact producer/source provenance; deterministic element/frame/relation identity; units; coordinate basis/handedness; authored neutral transforms and relation semantics; placement semantics; relation endpoints/kinds without consumer IDs; deterministic bytes/identity; and fail-closed behavior for unsupported versions or relations.

The exact field names, JSON layout and packaging are **not authority yet** and must not be guessed in JV-Web before JURE freezes them. Consumer dynamics do not belong in the authored fragment unless a later cross-project design explicitly creates a separate authored dynamics domain.

## 6. First JV-Web consumer experiment

The first real integration must remain isolated and private on one `jure/<specific-purpose>` branch. Sequence:

```text
freeze exact JURE fragment + producer
-> obtain exact bytes
-> strict independent parse
-> units/basis/provenance validation
-> explicit placement validation
-> internal neutral geometry proof
-> lower into the small JV consumer representation
-> compare against the coherent procedural unit
-> only then private runtime/Box3D substitution
-> browser/runtime proof
-> separate public decision
```

Do not skip from parser success directly to runtime substitution.

## 7. Fail-closed rules

Reject the experiment if schema/units/basis/provenance are ambiguous, locators are non-unique, placement requires guessing, identity placement is assumed, values are non-finite/incomplete, authored and procedural shapes are mixed, relation kinds need reinterpretation, or runtime dynamics would have to be written back into authored neutral truth.

A failed experiment must not mutate public Friends or accepted `main` runtime.

## 8. Relationship to current M6 source

Current JV-Web M6 geometry remains procedural/provisional consumer truth.

The `jure/neutral-geometry-receipt` preparation lane introduces a deliberately small read-only `JvNeutralMechanismV1` projection for the front-left coherent double-wishbone. Its diagnostic receipt is an **output mirror of current JV consumer truth**, not a second authored rig format and not a runtime input.

For stand-alone cross-project use the receipt carries the exact JV producer commit plus pinned factory-receipt path, Git blob identity and SHA-256 of canonical blob bytes. Moving branch names are intentionally not provenance authority. The exporter must also reject tracked source drift from `HEAD` before claiming that producer commit; a dirty tracked worktree cannot emit an authoritative cross-project receipt.

Do not create a second generic rig framework around this representation. Once JURE freezes a real consumer fragment, introduce only the smallest strict adapter/binding necessary to lower it into the proven consumer seam.

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

PR #4 is coordination evidence, not JV-Web authority.

## 10. Exit condition

This becomes an executable cross-project format contract only when JURE freezes one explicit versioned multi-relation fragment, validates deterministic export, JV-Web independently parses it, units/basis/placement/provenance are proven, neutral geometry coherence passes, the coherent procedural replacement unit is identified, and a private runtime substitution can be designed without modifying authored truth.

Until then: preserve the shared direction, exchange exact diagnostic evidence, and do not build speculative adapter architecture.
