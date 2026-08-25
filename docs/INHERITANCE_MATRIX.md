# JV-Web — provisional Inheritance Matrix

Updated: 2026-08-25
Owner: Jozz
JV-Web recipient anchor: `Jozzpoly/JV-Box3D-Web-experiment@7d5705e4943eb12d1d412d89579fe09ba7d92bf8`
Status: `PROVISIONAL / JURE DONOR INTAKE #1 / JV_CORE PRIMARY DONOR PENDING / NO RUNTIME INTEGRATION AUTHORIZED`

This document begins the cross-project Inheritance Matrix against the grounded JV-Web recipient surface. It is deliberately provisional: the first real JURE donor claim is available, while the primary JV_CORE donor closure is still pending.

It does **not** freeze a shared schema, authorize JURE as a mandatory dependency, accept the current JURE outboard mating coordinates as physical truth, or authorize a JV-Web runtime substitution.

## 1. Current JURE donor evidence accepted for synthesis

Exact JURE machine anchors used by this intake:

- coherent neutral wishbone: `checkpoint/donor-03a-coherent-neutral-wishbone-2026-08-24@2af0e789d22eb4284e65ab2342ca933d21fe9315`;
- DONOR-03A validation run: `32782422063` — Linux + Windows browser/checkpoint PASS;
- Owner-correction-path head: `work/real-jv-rig-elements@53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4`;
- DONOR-03B validation run: `32846835489` — checkpoint browser gate SUCCESS.

Machine-grounded donor capability currently demonstrates:

- exact SOURCE identity/relink without mutating authored revision;
- 4 authored elements, 8 independently owner-local frames and 4 neutral relations;
- 2 inboard `revolute` + 2 outboard `spherical` relations;
- deterministic Save/Open/relink of neutral authored truth;
- source/provenance-backed frame authoring;
- Owner-facing relation creation/diagnostics/Undo/Redo;
- transient TEST separated from authored history;
- a browser correction path in which a carrier-side outboard frame can be moved by `+0.01 m`, produces a spherical residual/warning, and Undo restores the exact neutral state.

Critical limits remain:

- upper/lower outboard mating positions are still **Owner-open physical truth**;
- the current X-min candidates are not accepted ball-joint centers;
- no deterministic JURE -> JV-Web multi-relation consumer format is frozen;
- no multi-relation kinematic/physics solver is proven or required for this donor claim;
- real damper/spring/cardan representation authoring remains unproven;
- JURE remains optional and must not become a prerequisite for completing JV-Web.

## 2. Matrix — JURE donor intake #1

Decision vocabulary:

- `INHERIT REQUIREMENT` — carry the proven property into the first relevant JV-Web foundation even if implementation differs;
- `INHERIT SEMANTIC` — carry the mechanical/authority meaning, not donor code/schema;
- `REFERENCE` — useful evidence, but not yet a target requirement;
- `BLOCKED` — insufficient evidence for inheritance;
- `REJECT AS DEPENDENCY` — explicitly do not make JV-Web depend on this donor implementation/tool.

| Capability / claim | Donor evidence | Owner status | Portable truth | JV-Web recipient seam | Provisional decision | Blocking challenge |
| --- | --- | --- | --- | --- | --- | --- |
| Exact source provenance + deterministic relink | JURE DONOR-03A/03B | No contrary Owner evidence | Authored truth must remain traceable to exact source bytes/revision; relink must not silently mutate authored state | Current Web neutral receipts/provenance and source-registered geometry | **INHERIT REQUIREMENT** | Consumer lowering must preserve enough provenance without copying the JURE project schema |
| Owner-local frame ownership | 8 independently owner-local frames in coherent wishbone | Machine-grounded; physical placement still partly Owner-open | A physical joint locator belongs independently to each owning body/element; equal world mating does not imply equal local pose | `JvNeutralFrameV1.ownerBody` and current wishbone projection | **INHERIT SEMANTIC** | Verify full frame orientation/role needs; current Web frame contract may be too lossy |
| Neutral `revolute` / `spherical` relation graph separate from dynamics | 2 revolute + 2 spherical, clean diagnostics | Machine-grounded | Mechanical intent must remain separate from mass, forces, motors, solver/contact policy | `JvNeutralMechanismV1.relations` already supports revolute/spherical | **INHERIT SEMANTIC** | JV_CORE must corroborate the real vehicle topology/physical roles before runtime substitution |
| Coherent four-relation wishbone topology as current candidate | DONOR-03A coherent neutral wishbone | Physical outboard mating still Owner-open | A double-wishbone can be represented coherently as one neutral mechanical unit instead of isolated hardpoints | Current Web procedural wishbone / FL special-case recipient surface | **REFERENCE — LIKELY FIRST-RIG UNIT** | Do not promote exact topology/locations to final Web truth until JV_CORE G-RIG + Owner mating corroborate it |
| Exact current outboard X-min mating coordinates | JURE candidate geometry | **Owner-open** | None yet beyond “these are provenance-backed candidates” | Current procedural/source-registered Web hardpoints | **BLOCKED** | Requires direct Owner physical judgement and primary-donor corroboration |
| Owner-correctable frame workflow with diagnostics + Undo | DONOR-03B browser path; `+10 mm -> warning/residual -> Undo` | Workflow machine-grounded; actual physical correction still Owner-open | Candidate rig truth must be inspectable/correctable without agent-side coordinate surgery | No equivalent authored Owner workflow inside JV-Web today | **INHERIT REQUIREMENT FOR AUTHORING PATH, NOT RUNTIME** | Decide later whether JURE itself supplies the tool or Codex/Web provides another authoring surface |
| Deterministic Save/Open/relink | DONOR-03A | Machine-grounded | Authored neutral rig should survive serialization/reopen/relink without coordinate drift | Web currently generates/derives rather than owns authored rig truth | **INHERIT REQUIREMENT** | Consumer contract must define deterministic lowering/placement separately from JURE persistence |
| Full JURE `RigDocument` schema | JURE kernel | Not frozen as Web consumer format | JURE owns its authoring model; consumer need not mirror it | Web has smaller `JvNeutralMechanismV1` lowering representation | **DO NOT INHERIT FORMAT** | Design a narrow lowering/adapter only after exact donor fragment and JV_CORE physical truth are available |
| JURE full frame pose/provenance richness | JURE `RigFrame.pose` + provenance/source binding | Machine-grounded capability | Full authored frame orientation/provenance may contain more truth than current Web lowering preserves | Web frame currently stores local position + optional primary axis | **REFERENCE / DESIGN PRESSURE** | Prove which orientation axes/roles must survive lowering; do not extend Web schema speculatively |
| JURE assembly hierarchy | Not required by DONOR-03A | Open future JURE feature | Neutral mechanical relation graph does not require durable hierarchy to exist | Web runtime already has its own ownership/topology | **DO NOT BLOCK FIRST STAGE** | Add hierarchy only if a real authoring/consumer need proves it necessary |
| JURE transient single-revolute TEST evaluator | Proven for Owner workflow | Useful but not final vehicle motion | Evaluation overlays must not mutate authored truth | Web runtime physics remains separate | **REFERENCE** | Do not mistake authoring TEST for suspension solver/vehicle physics evidence |
| Runtime suspension forces, damping, motor/solver/contact laws | Explicitly excluded from JURE relations | No JURE authority | Runtime dynamics remain consumer/JV-owned | `legacy_ts_m6` challenge surface; future JV_CORE evidence | **EXCLUDE FROM JURE INHERITANCE** | Primary donor + new Web experiments decide these |
| Damper/spring/cardan representation authoring | Structurally contemplated, real Owner mapping unproven | Open | None yet sufficient | R3 visual binding/calibration challenge surface | **BLOCKED** | Require real mechanism evidence before changing Web binding semantics |
| JURE as mandatory tool/runtime dependency | None required by donor evidence | Owner explicitly allows ignoring JURE | Useful authored truth must be portable independently of tool choice | JV-Web is priority product/heir | **REJECT AS DEPENDENCY** | Any integration must remain replaceable/exportable and fail without locking product development to JURE |
| Map authoring / Map ontology | Separate JURE line | Not relevant to current car-quality priority | None for first vehicle foundation | JV-Web map/scene product surfaces | **OUT OF FIRST-STAGE SCOPE** | Revisit only after vehicle quality/rig/feel priorities |

## 3. Compatibility challenge — why a direct schema merge is premature

JURE and JV-Web already share useful semantic granularity but not an identical contract.

### JURE authored side

Current JURE `RigDocument` provides:

- `units: m-rad`;
- right-handed, Y-up coordinate declaration;
- full element rigid poses;
- full frame rigid poses;
- frame provenance and optional exact source bindings;
- multiple neutral relation kinds.

### JV-Web consumer side

Current `JvNeutralMechanismV1` provides:

- explicit `jv-rig-space/v1` with metres, right-handed, `+X` forward, `+Y` up, `+Z` right and a neutral chassis root;
- body neutral poses;
- owner-local frame positions plus optional primary relation axis;
- only the relation types currently needed by the Web comparison seam (`revolute`, `spherical`).

### Consequence

The overlap is strong enough to justify a **lowering/adaptation seam**, but not strong enough to justify a shared schema.

In particular:

1. coordinate-system identity must be proved explicitly; Y-up/right-handed alone is not enough to assume the same forward/right/root convention;
2. lowering full JURE frame orientation to only `primaryAxisLocal` can be lossy;
3. provenance/source binding must not disappear merely because runtime only needs positions/axes;
4. JURE relation vocabulary is intentionally broader than current Web needs;
5. the consumer format should encode exactly the portable truth required by the selected Web mechanical replacement, not the complete JURE authoring ontology.

Therefore: **no unified schema, no direct `RigDocument` runtime intake and no extension of `JvNeutralMechanismV1` until a concrete donor fragment plus JV_CORE evidence proves the missing fields.**

## 4. Challenge — should JURE affect the first fundamental JV-Web stage?

### Argument to ignore JURE entirely

This would protect Web from cross-project coupling and avoid waiting for an unfinished editor.

**Rejected as too conservative.** JURE has now demonstrated properties that directly answer current Web weaknesses: authored/provenanced neutral truth, independently owned mating frames, deterministic reopen/relink and an Owner-correctable diagnostic workflow. Current Web explicitly lacks authored authority for its neutral geometry and contains procedural/legacy rig seams. Ignoring all JURE evidence would discard proven capability relevant to the recipient problem.

### Argument to make JURE the source of the first new Web rig

This would let Web import the coherent wishbone immediately.

**Rejected as premature.** Physical outboard mating remains Owner-open, primary JV_CORE G-RIG evidence is not yet ingested, consumer format is unfrozen and JURE does not own runtime dynamics. Doing this now would turn machine coherence into unjustified vehicle truth.

### Provisional verdict

**YES — JURE should influence the first fundamental JV-Web stage, but only as an authoring/provenance/neutral-mechanism donor. It does not yet choose the physical geometry, runtime topology or physics.**

JURE has earned **influence, not ownership**.

## 5. First fundamental stage — provisional definition

Do not start this runtime stage yet. Its definition may now be sharpened while waiting for JV_CORE.

Working intent:

**Rig Truth Intake & Mechanical Foundation**

The first coherent replacement unit should likely be one front suspension/wishbone mechanical unit rather than the whole vehicle.

Entry conditions:

1. JV_CORE G-RIG supplies sufficiently sealed physical/mechanical evidence for the target front-corner roles and mating geometry;
2. Owner physical mating judgement is available or deliberately performed in the chosen authoring workflow;
3. JURE donor evidence remains reproducible and exact;
4. a narrow authored-truth -> JV-Web lowering contract is designed from the actual fragment, without freezing the whole JURE schema;
5. accepted Web controls/product UX remain outside the causal blast radius.

Likely stage sequence after those conditions are met:

1. compare JURE-neutral, JV_CORE physical evidence and current Web procedural/source-registered geometry for one coherent front mechanical unit;
2. resolve conflicts explicitly at the level of role/frame/mating truth;
3. freeze the minimum authored neutral truth and provenance needed by Web;
4. lower that truth into a Web consumer representation with explicit coordinate-space conversion/validation;
5. validate neutral coherence and visual placement before touching runtime physics;
6. only then substitute one coherent runtime mechanical unit behind protected input/product behavior;
7. require stronger mechanical/render/Owner evidence than mere parity with `legacy_ts_m6`.

## 6. What remains pending from JV_CORE

The JURE donor is not sufficient to finalize this matrix. Primary-donor intake still has to answer, among other things:

- actual physical chassis/arm/carrier/knuckle/wheel role topology;
- authoritative or best-evidence mating frames/hardpoints;
- which historical visual-parent collapse findings must be eliminated;
- which suspension/steering geometry semantics are portable;
- what is Native-only implementation detail;
- later, feel and wheel/contact evidence for subsequent fundamental Web stages.

When JV_CORE G-RIG is sealed, challenge its claims against the JURE rows above rather than automatically preferring the primary donor. Evidence and Owner truth decide conflicts.

## 7. Current stop condition

No JURE code/schema/JSON is integrated into JV-Web runtime from this matrix.

Do not:

- import the current candidate wishbone as final Web geometry;
- freeze X-min outboard candidates;
- make JURE required to build/run JV-Web;
- rewrite `legacy_ts_m6` merely to prepare for a donor;
- build a general backend/plugin architecture in anticipation;
- extend neutral schema fields without a concrete lowering requirement;
- start damper/cardan/whole-car authoring from unproven representation evidence.

Next material matrix update should come from one of:

1. Owner acceptance/correction of JURE physical mating;
2. sealed JV_CORE G-RIG donor evidence;
3. evidence that the current Web lowering seam is insufficient for an actual donor fragment.
