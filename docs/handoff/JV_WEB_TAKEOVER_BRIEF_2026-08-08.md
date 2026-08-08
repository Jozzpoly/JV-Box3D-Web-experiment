# JV Web — orchestrator takeover brief

Date: 2026-08-08
Status: **DRAFT V5 — ORCHESTRATOR TRANSFER LAYER / NOT A FROZEN ROADMAP**
Owner: Jozz

## 0. Why this handoff exists

This handoff exists to move JV-Web into a **new clean conversation without losing the project**.

Its job is not to preserve the previous agent's conclusions as authority and not to tell the next agent which commit to write. It must transfer enough verified context, evidence, resources and owner intent that a new orchestrator can:

```text
understand what JV-Web is and why it matters
→ verify the current reality independently
→ detect what changed or what the previous agent misunderstood
→ choose the next work intelligently
→ continue systematic development without resource archaeology
```

The desired tradeoff is deliberate:

```text
preserve project continuity
without preserving context bloat or stale planning authority
```

Current Git, live evidence and Jozz's current intent always outrank this brief.

## 1. Campaign identity and owner intent

```text
ACTIVE PRIVATE CORE
Jozzpoly/JV-Box3D-Web-experiment
development/jv-web-r1

PUBLIC CLOSED BASELINE / FRIEND-DEMO SURFACE
Jozzpoly/JV-Box3D-Web-Public
release/r0
https://jozzpoly.github.io/JV-Box3D-Web-Public/

NATIVE JV
Jozzpoly/Box3d_FunProject
READ-ONLY for this campaign; maintained by another agent
```

The current campaign is about finishing and polishing **JV-Web + Web-Public**, not advancing native JV.

Jozz wants a browser demo that increasingly feels like a real piece of his own game and gives useful motivation/confidence for the later long native-JV program. It should become enjoyable to launch, drive, tune and show friends.

Desired closure includes most of:

- Jozz's real authored vehicle;
- materially better racing-game chase camera and mobile view interaction;
- usable JSPREV2 scan and real-phone assessment;
- faster in-app location/teleport switching;
- Web-native presets/settings;
- FWD/RWD/AWD;
- a mechanically defined drivetrain/shaft lock;
- useful QoL and rebuilt Web/mobile UI;
- selected newer native `b3Wheel` port if technically sane.

Social-media polish is later. Actual play/feel is legitimate scheduling evidence. Do not preserve a roadmap when the product says otherwise.

## 2. Immutable baseline and evidence discipline

Public R0 is closed, published and owner-accepted. It is a rollback/regression reference, not the development branch.

```text
public release/r0:
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree f1c5c9a971208d89da05143f10913891a58b3b70

rollback/main:
401068f5734c841d43907b71484bc03a2396c604
```

Keep evidence levels separate:

```text
CURRENT FACT
HISTORICAL EXACT PROOF
OWNER OBSERVED / OWNER ACCEPTED
RECOVERED SOURCE
HYPOTHESIS
UNKNOWN
```

When sources disagree:

```text
1 current Git / current code / current live runtime
2 raw exact execution evidence + tied owner observation
3 exact recovered resources
4 historical documentation/plans
5 current interpretation/scheduling hypothesis
```

## 3. The next conversation's role: orchestrator first

Do not begin by implementing the first proposal in this document.

### O0 — RECONSTRUCT & CHALLENGE

Verify current private/public refs, live Pages, repository scope, owner intent and the resource pack's provenance. Check whether the handoff itself contains contradictions or stale authority.

Mandatory pack reading is deliberately small: `00_START_HERE.md`, `02_RESOURCE_MAP.md`, and only **Gate A** of `09_COLD_AGENT_TAKEOVER_CHECKLIST.md`.

### O1 — REVALIDATE OPTIONS

Use current source and only the resources needed to compare plausible next directions. Do not broadly preload the entire project.

### O2 — DESIGN EXECUTION

Before product writes, produce a takeover verdict:

```text
current state/authority
handoff defects found or none
revalidated opportunity ordering
chosen first bounded slice
why it wins now
explicit falsifiers / stop conditions
minimum evidence plan
owner input genuinely required, if any
```

Only after this should systematic implementation begin.

## 4. Current leading hypothesis — REAL CAR V1

The previous orchestration pass found **REAL CAR V1** to be the strongest current first owner-visible candidate:

```text
exact Nadwozie.gltf chassis
+ four exact Offroad_Big_Wheels.gltf visual channels
+ minimum authored pixel texture/material runtime
+ live authored-GLB draw bridge
+ current physics/world/camera unchanged
```

This is useful prepared work, not inherited authority.

### Why it currently looks strong

- exact owner assets, hashes and historical calibration are already recovered;
- frozen selective-salvage tooling exists for deterministic source→rigid-GLB packaging;
- current R1 already has semantic vehicle visual frames, GLB loading/validation, CPU mesh decode, GPU geometry upload and binding→world transforms;
- current live vehicle still renders procedurally, so success is immediately owner-visible;
- scan's decisive runtime revalidation is blocked by the absent exact textured pack;
- `b3Wheel` is a deeper Box3D/Emscripten/binding question and currently looks better as a bounded risk spike.

### Current source-level refinement

The seam is more precise than "add textures":

```text
GPU geometry layer:
  POSITION / NORMAL / TEXCOORD_0 / materialIndex already preserved

CPU material V1:
  baseColorFactor + doubleSided only

missing authored-material state:
  embedded image bytes
  baseColorTexture relation
  sampler state
  MASK alpha/cutoff

live M6WorldRenderer:
  still owns a simple procedural position+color shader and debug meshes
```

`M6WorldRenderer` is long-lived while the physics `F4VehicleHost` may be destroyed/restarted independently. Therefore the current **ownership hypothesis** is to keep authored vehicle visual resources in the renderer lifecycle rather than making the physics host own them. Revalidate this before coding; it is not an ABI promise.

The tiny full-rig GLB remains a diagnostic fallback only if direct real-asset integration leaves an ambiguous importer/package-vs-live-draw failure.

### Explicit falsifiers for REAL CAR V1

Reject, split or reprioritize this first-slice hypothesis if current revalidation shows any of the following:

1. current Git already contains an equivalent or newer real-owner live visual path;
2. exact chassis/wheel provenance or generated package cannot be validated from the available resources;
3. the current visual-frame/binding model cannot represent the five real channels without a prerequisite architectural redesign;
4. supporting the exact authored pixel materials requires a broad general-purpose renderer rewrite rather than a bounded subset;
5. correct resource ownership requires unrelated physics-host/lifecycle surgery, making the slice no longer isolated;
6. a newly available resource removes another lane's blocker and creates a smaller/higher-value owner-visible slice (for example the exact JSPREV2 pack is recovered and current LOCAL_FULL is immediately testable);
7. a bounded `b3Wheel` feasibility result reveals that current visual work would likely become disposable;
8. Jozz's current intent/feel materially changes the priority.

A falsifier is a reason to rethink, not a reason to force the task through.

## 5. Other opportunity lanes — load details only if compared/selected

### CAMERA / MOBILE VIEW

High owner-visible value. Current camera lives in `M6WorldRenderer`; touch driving already owns pointer interactions. Previous reasoning separated it from the first car-visual checkpoint to keep evidence attributable. Re-evaluate after O1 rather than assuming it must be second.

### WORLD / SCAN / TELEPORT

Current R1 still contains LOCAL_FULL scan wiring and key c8e0 code. The decisive next question is current-path revalidation with exact:

```text
source-preview-aee5242a20848294
```

That full textured pack is not in the handoff resources. Do not wholesale-recover c8e0 just to make progress. Once the pack is available, this lane may become extremely high-value quickly.

Local dev scan serving is not a GitHub Pages delivery design.

### VEHICLE CONFIG / PRESETS / DRIVETRAIN

Current fixture has RWD/AWD semantics; FWD is new bounded friend-demo work. Exact shaft-lock mechanics remain unresolved and must not be invented from the label. Load this lane only when it becomes a candidate.

### TRUE WHEEL / `b3Wheel`

Exact recovered native patch surfaces exist, but current Web binding does not expose them. Treat as a bounded feasibility/port investigation unless evidence makes it foundational. Port an existing selected mechanism; do not restart tire/contact R&D or the full native→WASM campaign.

### UI / QoL / PUBLIC DEMO

Build the final interface around capabilities that actually exist. Public promotion should correspond to meaningful owner-visible jumps and keep R0 frozen.

## 6. Known unknowns to preserve

Do not resolve these by prose:

- current accessible location of full textured JSPREV2 pack;
- actual scan phone cost and public asset delivery design;
- exact shaft-lock mechanics;
- exact current native wheel revision to target and Web build/binding cost;
- final chase-camera feel;
- final UI hierarchy;
- whether real owner-asset integration reveals a better visual contract.

## 7. Context-control rule

The handoff succeeds when the next orchestrator can find what it needs **without loading what it does not need**.

Do not automatically preload:

```text
AI_PROJECT_MEMORY.md
full PROJECT_STATE
full handoff CORE
all scan evidence
all b3Wheel evidence
all historical branch docs
```

Use `docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md` and the resource pack to retrieve targeted evidence when a question actually needs it.

The original large source ZIPs are fallback archaeology, not default context.

## 8. Orchestrator takeover success condition

Before implementation, the next orchestrator should be able to state in its own words:

1. what project it is controlling and what is out of scope;
2. what Jozz is trying to achieve and why the work order must stay adaptive;
3. what is verified current reality vs historical proof vs hypothesis;
4. whether this handoff itself has material defects;
5. which opportunity currently wins and what would falsify that choice;
6. the smallest current source seam it needs to inspect/change;
7. the minimum evidence needed before asking Jozz for a visual/feel/device verdict;
8. how it will keep context and validation work proportional to product value.

If it cannot do that without old-chat archaeology, repair the handoff before broad implementation.
