# JV Web — implementer task

Updated: 2026-08-11
Status: **ACTIVE — O3 PACKET / EXECUTION BLOCKED UNTIL O3 AUDIT PASS**
Task: **S1-LIVE — FL upper live-articulation integration gate**
Mode: **VALIDATION-FIRST / NO PRODUCTION PATCH**

This packet authorizes exactly one bounded validation question. It does **not** authorize product implementation, integration, calibration changes, branch cleanup or continuation into another suspension/corner task.

Do not execute this task until the orchestrator explicitly reports that the O3 packet audit passed.

## 0. Technical question

Answer exactly this:

> Does the exact frozen S1-D FL upper binding preserve its owner-accepted static attachment relationship and a continuous, mechanically coherent orientation while the **real M6 suspension** articulates through representative live states?

The gate is about the exact FL upper binding only:

```text
bindingId:   owner.fl.upper-arm
source kind: PART_PAIR_ROLL_PINNED_STRETCH
startPartId: m6.chassis
endPartId:   m6.fl.upper-arm
```

Do not open steering as a separate acceptance dimension. Steering is outside the owner question. A steering state may be used only as a cheap regression/control sample if current source inspection proves a material coupling to one of the two bound endpoint bodies and the sample does not broaden the task.

## 1. Authority and exact identities

### Current accepted/integration-target product context at packet creation

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
branch:     main
commit:     56f8d23f258ce3b49998fcf8d296bbbcf26f3e7b
tree:       29415b4a59b315f67e7afa016a3a0808c4dff496
role:       accepted/integrated private product context
```

The commit that activates this O3 packet is expected to be a **docs-only descendant** of that context. At execution time, the orchestrator must supply the exact live `main` CONTROL TIP carrying this ACTIVE packet. Verify it before doing technical work and confirm that the O3 docs commit did not change product bytes.

`main` is **context for a later integration decision only**. This task does not integrate anything into `main` and does not prepare a curated-integration plan.

### Exact frozen validation source

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
branch:     work/owner-rig-s1-attachment-authority
commit:     393ef4600be5c83ef42bced4a8a451446e372c32
tree:       92c896a8b0579a66b3c5381b777baf853a469908
state:      FROZEN / READ-ONLY VALIDATION SOURCE
```

This exact commit is the owner-reviewed S1-D candidate. It is **not write authority** for this task.

Before execution verify the remote branch still points exactly to `393ef4600be5c83ef42bced4a8a451446e372c32`. If it moved, STOP and report `BLOCKED`.

Do not create another remote branch for this validation gate.

## 2. Task/control packet vs executable source

This is an intentional read-only validation transaction across divergent state:

```text
CURRENT CONTROL / TASK AUTHORITY
  current main carrying this ACTIVE docs/IMPLEMENTER_TASK.md

EXECUTABLE VALIDATION SOURCE
  frozen work/owner-rig-s1-attachment-authority@393ef460...

REMOTE WRITE AUTHORITY
  NONE
```

Read current `AGENTS.md` and this ACTIVE task packet from the orchestrator-supplied current-main CONTROL TIP.

The frozen execution snapshot contains historical task/governance documents from the S1 transaction. **Do not treat those copies as current task authority.** They are executable-source baggage only.

Do not preload `AI_PROJECT_MEMORY.md`, `docs/HANDOFF.md`, `docs/PROJECT_STATE.md`, archived branches or old chats. The accepted constraint needed for this task is stated below.

## 3. Execution mode

```text
EXECUTION MODE: SOURCE_ZIP_REQUIRED
```

Use an exact source execution mirror of frozen commit `393ef4600be5c83ef42bced4a8a451446e372c32`.

A GitHub Download ZIP has no `.git`; remote GitHub ref/SHA remains identity authority. Verify the bytes of every executed/inspected candidate file that matters to the gate against the exact frozen source before claiming evidence for `393ef...`.

If the exact source packet is not available, request that exact packet immediately and return `BLOCKED` until it is supplied. Do not spend time on brittle clone/DNS/`gh` workarounds.

For canonical automated evidence prefer the repository-pinned toolchain:

```text
Node: 24.16.0
npm:  11.13.0
```

If exact toolchain execution is unavailable, clearly label any substitute-environment result as supplemental. Do not silently promote it to canonical candidate evidence.

## 4. Accepted starting constraint — preserve, do not re-solve

The following owner-accepted result is an input to this gate, not a new hypothesis to redesign:

```text
FL UPPER — STATIC / CURRENT VISUAL PRECISION

INBOARD X
  midpoint(current physical upperFront + upperRear).x

INBOARD Y/Z
  S1-C semantic-main-chassis calibration components

FINAL INBOARD POINT
  constraint-composed visual attachment
  literal chassis-mesh contact claim: NONE

OUTBOARD XYZ
  existing physical upper ball
  preserved through S1

STATIC MECHANISM
  PART_PAIR_ROLL_PINNED_STRETCH result supported

LIVE ARTICULATION
  UNKNOWN — this task exists to test it
```

Owner acceptance is limited to the reviewed static FL upper FRONT + TOP relationship at current precision. It does not imply live-motion acceptance, FR acceptance, wheel-side packaging acceptance, final mesh scale or physical suspension topology.

The exact frozen implementation/evidence is the reviewed technical reference. Do not solve S1 again from memory and do not invent a different mechanism in this task.

## 5. Mechanism validation vs geometry/calibration modification

### In scope — mechanism validation

Determine whether the **existing exact frozen implementation**, without candidate-source changes:

1. preserves the accepted rest/static FL upper relationship;
2. keeps its declared chassis-side and upper-arm-side endpoints attached through real suspension motion;
3. maintains a continuous roll-pinned local frame as suspension motion changes the live endpoint relationship;
4. avoids flip, twist, discontinuity or singular behavior under representative real M6 suspension articulation;
5. remains attributable to the FL upper binding rather than neighboring unresolved corner geometry.

### Out of scope — geometry/calibration modification

Do not modify or retune the geometry/calibration to make the gate pass.

A live failure is evidence for a later replan. It is **not permission to fix the failure in this task**.

## 6. Allowed actions

You may:

- inspect only source/tests directly required to understand and execute this exact binding;
- rerun existing focused `PART_PAIR_ROLL_PINNED_STRETCH` / S1-D tests unchanged;
- run the exact frozen owner vehicle in the existing runtime;
- obtain representative suspension articulation through the actual M6 runtime/product path;
- capture numerical runtime evidence for the two binding endpoints and resolved visual frame;
- use disposable external/local diagnostic code that does not alter candidate source bytes, if needed to observe exact runtime values;
- capture focused screenshots/video/measurements needed to make one FL-upper owner gate attributable.

Prefer existing runtime and tests over new tooling.

If real M6 evidence cannot be obtained without adding persistent source/test instrumentation, report the smallest missing diagnostic capability and return `REPLAN`. Do not commit that instrumentation as part of this task.

## 7. Protected scope — no changes

The task must leave all remote refs and candidate source bytes unchanged.

Do **not** change:

- `PART_PAIR_ROLL_PINNED_STRETCH` schema or implementation;
- S1-D split-axis calibration or provenance semantics;
- physical hardpoints or physics;
- FR upper or any other FR geometry;
- FL lower arm;
- upright / hub / wheel geometry or placement;
- wishbone mesh geometry, length or scale;
- dampers / springs;
- steering geometry, steering tuning or steering acceptance scope;
- cardans;
- stance / ride height;
- handling, suspension stability, tire/contact, drivetrain or steering feel;
- native JV;
- public R0/R1;
- current `main` product source;
- frozen S1 branch contents or ref.

Expected remote files changed by the implementer: **NONE**.

If the smallest technically correct next action requires changing any protected item, return `REPLAN` with evidence.

## 8. Evidence separation

Keep these evidence classes explicit.

### A. Synthetic mechanism control

Existing transform/package tests may show that the generic roll-pinned mapping:

- maps reference endpoints to supplied live endpoints;
- behaves deterministically under synthetic oblique/mirrored endpoint states;
- avoids the previously insufficient shortest-arc roll ambiguity.

Rerun the smallest relevant existing tests unchanged.

These are **synthetic mechanism controls**. They do not prove real M6 live correctness.

### B. Real M6 live-motion evidence — required

The integration-critical gate requires actual M6 runtime frames in which the relevant part transforms are produced by the normal suspension/product path.

Do not hand-edit `VehicleVisualFrame` endpoint transforms and call that real M6 evidence.

For every sampled real state derive the live binding endpoints through the same declared source semantics used by the candidate:

```text
start world endpoint
  m6.chassis transform
  × binding startLocalPosition

end world endpoint
  m6.fl.upper-arm transform
  × binding endLocalPosition
```

Then evaluate the resolved `owner.fl.upper-arm` visual transform from the exact candidate.

### C. Owner visual evidence — conditional final gate

Only after technical evidence is coherent should the orchestrator expose a focused owner candidate.

The implementer does not classify `OWNER ACCEPTED`.

## 9. Representative live suspension states

Use real suspension articulation, not synthetic endpoint injection.

At minimum capture:

1. **REST / accepted reference state**;
2. at least one meaningful **compression/bump** state;
3. at least one meaningful **extension/rebound** state;
4. a **continuous transition sequence** spanning enough intermediate frames to detect frame flips/twist/discontinuity rather than judging only isolated endpoints.

Choose states from normal/current M6 behavior and report how they were produced. Do not invent arbitrary hardcoded suspension offsets merely to satisfy the list.

Default steering state is neutral.

Only if current source proves that steering materially changes one of the two exact bound endpoint-body transforms may one cheap steering control state be sampled. If used, classify it as a regression/control state only; do not expand the owner question or steering acceptance scope.

## 10. Required measurements / checks

### 10.1 Exact identity

Record:

- current-main task/control tip supplied by orchestrator;
- confirmation that its product context descends docs-only from `56f8d23...` for this O3 activation;
- frozen remote branch tip;
- frozen tree;
- execution-mirror identity and relevant candidate-byte comparison.

### 10.2 Rest preservation

On exact `393ef...`:

- rerun the smallest focused S1-D/static evidence needed to confirm the reviewed split-axis relation is unchanged;
- confirm FL upper binding still uses the reviewed start/end and roll-pinned source semantics;
- confirm the source GLB identity remains the reviewed owner-rig identity;
- do not reinterpret or reopen the already accepted static FRONT + TOP calibration.

If the launched runtime cannot reproduce the exact reviewed rest candidate identity/state, return `BLOCKED` or `REPLAN` before asking the owner to judge motion.

### 10.3 Endpoint attachment through motion

For every representative real M6 state:

- compute the declared live start/end world endpoints;
- transform the corresponding reference start/end points through the resolved visual binding matrix;
- report endpoint error for both ends;
- report maximum error across the sampled motion sequence;
- justify the numerical tolerance used rather than pinning an accidental observed value as a new product contract.

Any visible/macroscopic endpoint detachment is a gate failure.

### 10.4 Roll/frame continuity

Across the continuous real-motion sequence, inspect the resolved local frame, not raw quaternion sign alone.

At minimum track enough transformed basis information to determine whether:

- the long axis changes continuously with the endpoint relationship;
- the roll-pinned up/width directions remain coherent;
- no abrupt 180-degree visual inversion, flip, twist or discontinuous frame branch occurs under continuous suspension input;
- no degenerate/singular state is encountered in the representative travel tested.

Report the worst observed frame change and the state transition where it occurs. Do not create a permanent threshold unless independently justified.

### 10.5 Attribution

Keep the judgment on the FL upper binding.

Known unresolved wheel-side upright/hub packaging, dampers, cardans, stance and handling must not be misclassified as failures of this gate unless they directly prevent observation of the FL upper mechanism. If clutter makes the gate genuinely unobservable, report that limitation rather than repairing neighboring systems.

## 11. Decision conditions

### `REVIEW_READY`

Return `REVIEW_READY` only if:

- exact identities are proven;
- focused existing synthetic controls pass or any discrepancy is honestly explained;
- real M6 suspension states were obtained through the actual runtime path;
- accepted rest semantics remain intact;
- both binding endpoints remain attached through the sampled motion within justified numerical precision;
- roll/frame behavior is continuous with no observed flip/twist/discontinuity or singularity;
- no protected-scope modification was required;
- evidence is strong enough to present exactly one focused owner decision.

No production patch is expected for `REVIEW_READY`.

### `REPLAN`

Return `REPLAN` — without fixing the candidate — if evidence shows or strongly indicates:

- live flip/twist/discontinuity;
- endpoint detachment;
- a singular roll/frame condition in representative suspension travel;
- the accepted static relationship cannot coexist with coherent live motion under the current mechanism;
- obtaining valid real M6 evidence requires persistent candidate instrumentation/source changes;
- the smallest correct remedy enters protected scope.

Preserve the accepted static S1-D constraint unless the new evidence specifically falsifies that static claim.

### `BLOCKED`

Return `BLOCKED` if exact source/runtime identity or a real M6 suspension execution path cannot be established.

### `NO_PATCH_JUSTIFIED`

Use `NO_PATCH_JUSTIFIED` only when the investigation conclusively answers the bounded technical question without a source change but there is no meaningful owner visual gate left to expose. Explain why.

Do not broaden into a fix merely to avoid a non-patch result.

## 12. Owner gate

If technical/runtime evidence reaches `REVIEW_READY`, prepare one attributable owner decision focused only on the exact FL upper mechanism during suspension motion.

Owner question:

> **Czy FL upper zachowuje naturalne położenie/orientację i zaakceptowane mocowanie podczas rzeczywistej pracy zawieszenia?**

The candidate presentation should make clear:

- what FL upper part to watch;
- that suspension articulation is the subject;
- that rest FRONT + TOP attachment was previously accepted and should remain intact;
- that wheel-side upright/hub packaging, dampers, mesh proportion and whole-car behavior are explicitly not being judged here.

Do not ask the owner to judge the whole car.

Do not ask the owner to diagnose code, measure offsets or determine the root cause of any failure.

## 13. What this task does not decide

This task does **not** decide:

- whether S1-D should now be integrated into `main`;
- what a curated integration diff should contain;
- whether the frozen S1 branch should be deleted;
- FR mirroring;
- final wheel/upright/hub packaging;
- wishbone mesh scale/proportion;
- dynamics/handling recovery;
- any later campaign stage.

Those are orchestrator decisions after this gate returns.

## 14. Return contract

Return compactly:

```text
TASK: S1-LIVE — FL upper live-articulation integration gate
RESULT: REVIEW_READY | BLOCKED | NO_PATCH_JUSTIFIED | REPLAN

TASK CONTROL TIP (current main):
INTEGRATION-TARGET PRODUCT CONTEXT: 56f8d23f258ce3b49998fcf8d296bbbcf26f3e7b
FROZEN VALIDATION SOURCE SHA: 393ef4600be5c83ef42bced4a8a451446e372c32
FROZEN VALIDATION SOURCE TREE: 92c896a8b0579a66b3c5381b777baf853a469908
EXECUTION MIRROR / TOOLCHAIN:
CANDIDATE BYTES VERIFIED AGAINST FROZEN SOURCE:

REMOTE FILES CHANGED: NONE expected
REMOTE REFS CHANGED: NONE expected

SYNTHETIC MECHANISM CONTROL:
REAL M6 MOTION PATH USED:
REPRESENTATIVE STATES:
REST CONSTRAINT PRESERVATION:
ENDPOINT ATTACHMENT RESULTS:
MAX START-ENDPOINT ERROR:
MAX END-ENDPOINT ERROR:
ROLL/FRAME CONTINUITY RESULT:
WORST OBSERVED FRAME TRANSITION:
STEERING CONTROL USED: NO by default / YES with source-coupling justification

PROTECTED SCOPE CONFIRMED:
ASSUMPTIONS / UNKNOWNS:
WHAT WAS NOT TESTED:
OWNER GATE READY: YES | NO
EVIDENCE PACKAGE / LAUNCH INSTRUCTIONS IF OWNER_READY:
RECOMMENDED ORCHESTRATOR ACTION:
```

Do not propose or implement curated integration in this return. Report only what this live gate establishes and return control to the orchestrator.
