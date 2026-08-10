# JV Web — recursive orchestration vNext proposal

Updated: 2026-08-11
Status: **PROPOSAL FOR SUCCESSOR VALIDATION — NOT CURRENT STATE AUTHORITY**
Owner: Jozz

This document is a deliberately non-authoritative proposal distilled from the full 2026-08-10 orchestration conversation, the final S1-A..D experiment sequence and the current repository contracts.

It exists because the conversation exposed durable workflow requirements that are broader than the current vehicle campaign. The next orchestrator should validate, simplify and either integrate this proposal into the stable operating documents or replace it with something better.

## 0. Critical use rule

**Do not use this document during O1 — State Reconstruction.**

O1 is intentionally a blind test of the already-compacted current authority:

- `AGENTS.md`
- `AI_PROJECT_MEMORY.md`
- `docs/HANDOFF.md`
- named current-state/evidence documents only as required

The successor should prove that the existing handoff works without help from this proposal or the old conversation transcript.

Only after O1 has been independently returned and audited should this proposal be opened as input to O2 / workflow validation.

This separation is intentional:

```text
O1 tests whether current semantic compaction is sufficient.
O2 may then challenge and improve the operating system itself.
```

Do not silently promote any statement in this proposal into current product truth. Current Git/source/evidence and direct owner observations retain their normal authority.

---

## 1. Why this proposal exists

The S1 conversation did more than recover one wishbone attachment. It repeatedly changed the **method used to decide what is true**.

Important improvements were discovered only after practical failure:

- a reproducible artifact with green tests can still be visually wrong;
- a true diagnostic measurement can still be a bad regression contract;
- a useful mechanism can survive rejection of its calibration target;
- one source does not have to own all XYZ/orientation constraints;
- a view can support some degrees of freedom while falsifying others;
- transport/execution failures must not be confused with product failures;
- context health can degrade before obvious hallucination or failure;
- owner feedback and agent implementation require different workloads;
- exact conversation continuity is not the right long-term project datastore;
- a handoff is not finished when a summary is written — it is finished when a fresh orchestrator proves it can recover the project correctly.

Jozz explicitly wants this property to become recursive:

> each iteration should improve both the product and the procedure, so later iterations become easier, more attributable and less dependent on historical context.

This proposal turns that requirement into a durable operating model.

---

## 2. Core philosophy

### 2.1 Broad orchestration, narrow execution

The orchestrator should reason across the whole dependency graph, downstream consequences, evidence quality and long-term project direction.

The implementation unit should nevertheless remain very small whenever possible.

```text
broad strategic horizon
+
narrow causal implementation slice
```

Avoid both failure extremes:

- **myopic implementer:** fixes one number without understanding its mechanical/dependency meaning;
- **broad patch:** changes many related systems so the owner can no longer attribute the result.

### 2.2 Every iteration has two outputs

A bounded iteration should produce:

```text
PRODUCT OUTPUT
what changed / what was learned about the product

METHOD OUTPUT
what was learned about evidence, task framing, validation, tooling,
context management or owner interaction
```

Not every method lesson deserves a permanent rule. But every meaningful failure should be checked for one.

### 2.3 Acceptance is a scoped statement

Owner acceptance can be:

- one axis;
- one endpoint;
- one view-dependent static relationship;
- one live behavior;
- one asset proportion;
- one whole interface;
- one integrated subsystem.

`good enough at current precision` is a legitimate acceptance state when its precision and scope are explicit.

Never silently expand it.

### 2.4 Branch names, timestamps and recency are weak evidence

A newer branch name, newer timestamp or more commits does not prove a better or more authoritative product.

Compare:

- exact ancestry;
- exact tree/product bytes;
- current owner evidence;
- actual accepted constraints.

S1 inherited several historical labels whose apparent recency/quality was weaker than the exact current V0 evidence. Do not repeat that error.

---

## 3. Owner working contract

### 3.1 Owner role

Jozz owns:

- product intent;
- priorities;
- visual meaning;
- play/feel judgment;
- acceptance/rejection;
- when `good enough` is sufficient;
- when a deferred issue should become active.

The owner is **not** the technical debugger or terminal operator by default.

### 3.2 Agent role toward owner feedback

The agent should translate qualitative owner observations into technical hypotheses and discriminating tests.

Owner markup such as colored screenshot lines is valid observation evidence about direction, relative placement and visible mismatch.

Do not turn it into pixel-to-meter calibration unless a separately justified measurement process exists.

### 3.3 Owner burden budget

Prefer:

```text
agent:
  exact source identity
  technical diagnosis
  focused tests
  candidate packaging
  reproducible views/tools where useful

owner:
  inspect one clearly stated question
  report what is seen/felt
```

Do not ask Jozz to:

- diagnose code;
- invent numeric offsets from screenshots;
- run technical commands the agent can run/package;
- repeatedly rediscover Git identity;
- perform broad whole-car validation when one small question will answer the gate.

If tool/environment limitations genuinely require a file from Jozz, request the smallest exact file/archive early instead of spending long periods on brittle workarounds.

### 3.4 Partial acceptance is first-class

If FRONT is acceptable but TOP is wrong, do not classify the whole experiment as simply `bad` and reopen all coordinates.

Preserve the supported projection/DOF and reopen only the unresolved relationship.

This should be the default mental model for future owner validation.

---

## 4. Project state planes

Long-term reliability improves when different kinds of truth live in different planes.

### 4.1 Accepted product plane

```text
main
+ docs/PROJECT_STATE.md
+ accepted regression contracts
```

Represents integrated private product authority.

### 4.2 Transaction plane

```text
work/<topic>
+ docs/IMPLEMENTER_TASK.md when ACTIVE
+ exact CONTROL TIP / EXECUTABLE PRODUCT BASE
```

Contains bounded experimental work. It is not automatically accepted.

### 4.3 Owner evidence plane

```text
docs/OWNER_CHECKPOINTS.md
```

Stores explicit owner-visible acceptance/rejection at the smallest useful semantic scope.

### 4.4 Current orchestration plane

```text
docs/HANDOFF.md
AI_PROJECT_MEMORY.md as router
```

Stores the currently actionable semantic state, including frozen transactions and negative memory.

### 4.5 Campaign-method plane

```text
docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md
```

Stores domain-specific dependency/evidence methodology without becoming current-state authority.

### 4.6 Execution-protocol plane

```text
AGENTS.md
docs/ORCHESTRATOR_IMPLEMENTER_PROTOCOL.md
```

Stores durable rules governing agents and transactions.

### 4.7 Cold evidence plane

```text
Git history
exact candidate SHAs
tests/baselines
historical archives only when named
external conversation transcript when explicitly supplied
```

Cold evidence should be pulled only when a current question needs it.

---

## 5. The recursive operating loop

The desired long-running loop is:

```text
OWNER INTENT / CURRENT PROBLEM
        ↓
ORCHESTRATOR DEPENDENCY + EVIDENCE ANALYSIS
        ↓
ONE BOUNDED QUESTION / FALSIFIERS
        ↓
IMPLEMENTER TRANSACTION
        ↓
ORCHESTRATOR INDEPENDENT REVIEW
        ↓
FOCUSED OWNER GATE
        ↓
ACCEPT / PARTIAL / REJECT / REPLAN
        ↓
SEMANTIC MICRO-COMPACTION
        ↓
PROCESS RETROSPECTIVE
        ↓
INTEGRATE / FREEZE / ABANDON
        ↓
CONTEXT-HEALTH CHECK
        ↓
NEXT BOUNDED QUESTION OR CONTROLLED HANDOFF
```

The two often-missed steps are:

- semantic micro-compaction;
- process retrospective.

Without them, the product may improve while the workflow repeatedly relearns the same lesson.

---

## 6. Semantic micro-compaction after meaningful owner gates

After an owner-visible decision, record only what changed semantically.

Do not append a chronological story of the task.

Capture:

```text
EXACT CANDIDATE / EVIDENCE IDENTITY
OWNER VERDICT
ACCEPTED CONSTRAINTS
REJECTED CONSTRAINTS
PROVISIONAL / UNKNOWN
DEFERRED
NEGATIVE MEMORY IF DURABLE
INTEGRATION STATE
```

A later orchestrator should not need to replay S1-B/S1-C to know why full-XYZ nearest `group5` is not current authority.

This is the primary mechanism by which long conversations become disposable.

---

## 7. Task design from interfaces and degrees of freedom

### 7.1 Work unit

Use an interface/relationship rather than a whole asset whenever possible.

For geometry, explicitly split:

```text
position X
position Y
position Z
orientation/frame
asset shape/scale
live body ownership
live articulation
```

For other domains define comparable independent constraints.

### 7.2 Hypothesis + falsifier before patch

A bounded task should begin with a question and the observations that would falsify the working hypothesis.

Do not turn the current favored explanation into task truth.

### 7.3 Change the minimum independent variable

If evidence says Y/Z are supported and X is not, modify/test X without silently recalibrating Y/Z.

This is not a requirement to hardcode per-axis solutions forever. It is a causal-debugging principle.

### 7.4 Separate defect categories

Always ask whether the active defect belongs to:

```text
MECHANISM
CALIBRATION
ASSET GEOMETRY
LIVE BEHAVIOR
```

A failure in one category is not automatic evidence against the others.

### 7.5 Stop on protected-boundary evidence

When the smallest correct solution requires changing a protected subsystem, stop/replan rather than silently broadening the task.

---

## 8. Evidence lifecycle

A useful default lifecycle is:

```text
OWNER/RUNTIME OBSERVATION
-> HYPOTHESIS
-> DIAGNOSTIC MEASUREMENT
-> DISCRIMINATING TEST
-> BOUNDED CANDIDATE
-> ORCHESTRATOR REVIEW
-> OWNER/RUNTIME ACCEPTANCE
-> DURABLE CONTRACT IF JUSTIFIED
```

### 8.1 Diagnostic is not regression

A test can accurately measure the current bad state and still be inappropriate as a permanent regression gate.

Before making a test durable ask:

> Is this an independently justified desired relationship, or merely today's measured output?

S1-A's temporary ~0.216 m evidence is the canonical warning.

### 8.2 Shared-assumption tests are weak evidence

When generator and test derive the same target from the same assumption, a green result proves consistency, not necessarily cross-asset correctness.

Classify the evidence layer honestly.

### 8.3 Owner acceptance does not erase unknowns

Static acceptance does not imply live acceptance.

Front-view acceptance does not imply top/side acceptance.

One accepted endpoint does not imply the neighboring wheel/upright package is correct.

---

## 9. Execution identity and transport integrity

### 9.1 CONTROL TIP and EXECUTABLE PRODUCT BASE

Keep separate:

```text
CONTROL TIP
= current remote write/transaction authority

EXECUTABLE PRODUCT BASE
= product bytes against which the technical task is evaluated
```

Docs-only commits may move CONTROL TIP without changing executable product state.

### 9.2 Exact local mirror

When direct checkout is unavailable, an exact source ZIP may be an execution mirror while GitHub remains write authority.

### 9.3 Candidate bytes must equal tested bytes

A local passing test is not evidence for a remote candidate until the final remote changed bytes are proven equal to tested bytes.

### 9.4 Transport failures are not product failures

Examples from S1:

- inaccessible canonical Node environment;
- lost workspace;
- truncated base64 transport;
- wrong staged blob SHA.

Correct response:

```text
classify environment/transport failure
preserve branch state
recover exact bytes
repeat the smallest necessary gate
```

Do not mutate product code to solve a transport problem.

### 9.5 BLOCKED can be a successful safety outcome

A transaction that refuses to write unverifiable bytes is preferable to a completed but epistemically invalid patch.

---

## 10. Owner-validation ergonomics as engineering infrastructure

Repeated owner-validation friction is evidence that validation tooling may have high ROI.

### 10.1 Fixed views

The S1 process strongly justified reproducible FRONT/TOP/SIDE views.

Use view geometry as projection evidence:

```text
FRONT -> Y/Z
TOP   -> X/Z
SIDE  -> X/Y
```

A future debug-only fixed-view surface can reduce ambiguity and make screenshots comparable across iterations.

### 10.2 Isolation/masking

When visual clutter forces the owner to repeatedly draw markup just to identify one part, selective debug-only masking/isolation becomes valuable infrastructure.

Do not build it before a real task needs it. But do not treat repeated validation friction as free.

### 10.3 One owner question

Each candidate should state:

- what to judge;
- from which view/state;
- what explicitly to ignore.

This protects causal attribution and owner attention.

---

## 11. Integration lifecycle and integration debt

Partial owner acceptance on a divergent work branch creates **integration debt**, not permission for wholesale merge.

### 11.1 Curated integration principle

When an experimental branch contains:

- useful final product semantics;
- diagnostic/test history;
- stale task/governance commits;
- partial owner acceptance;

prefer a clean integration descendant of current `main` that deliberately re-applies/re-derives only the reviewed product/test subset.

Do not merge/cherry-pick historical task/governance state merely because it is in the same branch.

### 11.2 Integration claim must match evidence level

Before integrating ask:

- What exactly has been owner/runtime accepted?
- What remains unknown?
- Does integration create a stronger implied claim than the evidence supports?
- Is a frozen branch temporarily safer until one more gate closes?

### 11.3 Close temporary branches

After a clean integration or explicit abandonment:

- record exact evidence/checkpoint;
- remove unnecessary temporary branch names;
- do not preserve branch cemeteries as project memory.

### 11.4 Recency is not authority

A branch being newer by time, having more commits or carrying a later-sounding name is not a reason to choose it as integration input.

This should be explicitly checked during takeover/integration decisions.

---

## 12. Context health

There is no need to wait for visible hallucination before migration.

### GREEN

- current problem and protected constraints are easy to state;
- no repeated historical recap is needed;
- rejected hypotheses are not competing with current truth;
- source/evidence retrieval remains targeted.

### YELLOW

- the orchestrator repeatedly reconstructs old decisions;
- several historical hypotheses compete in active reasoning;
- responses require long recap before the next decision;
- a new subsystem would require broad archaeology;
- current workflow/document roles themselves are becoming a major active topic.

Action:

- finish current bounded transaction if safe;
- perform micro-compaction;
- consider transcript retrospective;
- plan controlled migration before another large subsystem.

### RED

- uncertainty about current branch/candidate/protected scope depends on chat memory;
- rejected approaches are being accidentally revived;
- context pressure causes missing constraints or contradictory instructions;
- agent cannot distinguish accepted product from experimental history.

Action:

- stop product work;
- freeze exact state;
- reconstruct current truth from Git/evidence;
- prepare controlled handoff.

---

## 13. Full-conversation transcript retrospective

Jozz discovered during S1 handoff preparation that a full conversation transcript contains materially more workflow evidence than ordinary context compression preserves.

This should become a deliberate recurring tool, not a last-resort dump.

### 13.1 When to run it

Recommended triggers:

- before a major orchestrator handoff;
- at a campaign/phase boundary;
- after several bounded iterations that materially changed the method;
- after a significant orchestration/transport/context failure;
- when Jozz explicitly supplies the full transcript because implicit intent may have been lost;
- when context health is YELLOW and the conversation contains valuable process evolution worth distilling before migration.

Do **not** run it mechanically after every microtask.

### 13.2 What the transcript is good for

The transcript can reveal:

- direct owner intent that disappeared from compact state;
- repeated owner corrections to agent behavior;
- recurring workflow friction;
- process lessons that arose only after failure;
- owner-visible incidental observations lost during compaction;
- places where assistant proposals were accidentally treated like owner requirements;
- historical hypotheses that are now clearly superseded;
- context-health signals.

### 13.3 What the transcript is not

The transcript is **not current technical authority** for:

- live branch tips;
- current code;
- current artifact bytes;
- current public deployment;
- whether an old hypothesis still matches present source.

Use transcript-derived technical claims as retrieval questions, then validate against current Git/evidence.

### 13.4 Retrospective classification

For each potentially useful item classify it as one of:

```text
A. DIRECT OWNER INTENT / WORKING PREFERENCE
B. DURABLE PROJECT-GLOBAL PROCESS RULE
C. CAMPAIGN-SPECIFIC METHOD
D. OWNER OBSERVATION / CHECKPOINT CANDIDATE
E. HISTORICAL TECHNICAL CLAIM — REQUIRES CURRENT VALIDATION
F. ASSISTANT PROPOSAL — NOT OWNER REQUIREMENT
G. SUPERSEDED / NEGATIVE MEMORY
H. ONE-OFF OPERATIONAL DETAIL — DO NOT PERSIST
```

This prevents a large transcript from becoming a new unstructured source of truth.

### 13.5 Retrospective procedure

1. Read the full supplied transcript end-to-end before editing current authority.
2. Extract direct owner statements separately from assistant interpretations.
3. Identify repeated corrections/patterns rather than only memorable single events.
4. Compare extracted items against current Git/current owner checkpoints.
5. Search for important owner facts that were lost in compaction.
6. Identify process rules already represented — do not duplicate them.
7. Promote only the smallest durable semantic delta into existing documents.
8. Do not store the raw transcript in Git by default.
9. Record current technical facts only after independent current-source validation.
10. Let the successor challenge the resulting workflow rather than treating the retrospective as final authority.

### 13.6 Output routing

```text
project-global rule
-> AGENTS.md or stable execution protocol

campaign-specific rule
-> campaign contract

owner-visible fact
-> OWNER_CHECKPOINTS.md

current accepted state
-> PROJECT_STATE.md

active/frozen semantic state
-> HANDOFF.md

branch lifecycle consequence
-> BRANCH_ROLES.md

historical detail
-> cold Git/evidence, not current-state prose
```

The objective is semantic compression, not a better chronological summary.

---

## 14. Handoff as a tested artifact

Writing a handoff is not enough. A handoff must be experimentally validated.

### 14.1 O1 should remain blind

The fresh orchestrator should reconstruct from current authority documents and live refs without receiving:

- the old full conversation transcript;
- this vNext proposal;
- the old orchestrator's detailed S1 explanation.

Otherwise the project cannot prove that its repo-based compaction actually works.

### 14.2 Audit the successor after O1

After the successor returns O1, the old orchestrator/owner may compare it against:

- current Git;
- owner checkpoints;
- full transcript retrospective;
- known negative memory.

Classify any mismatch:

```text
SUCCESSOR_ERROR
  current authority was sufficient but misread

HANDOFF_GAP
  important truth was not represented clearly enough

AUTHORITY_AMBIGUITY
  two current documents/refs imply incompatible meanings

STALE_CURRENT_DOC
  supposedly current documentation was outdated

UNKNOWN
  evidence itself is insufficient
```

### 14.3 Fix the project before tutoring the successor

If the failure is a handoff/document gap:

- improve the repo/current authority;
- ask the successor to re-evaluate the corrected state;
- do not primarily patch its understanding by narrating the old chat.

This keeps future conversation independence real.

### 14.4 O2 should challenge continuation and integration

After O1 passes, O2 should not merely choose the next task.

It should first identify any unresolved **integration boundary** created by partial acceptance on divergent work.

For the current handoff this includes the exact S1-D static checkpoint on `393ef...` versus current `main`.

The successor should independently decide whether the safest next state is:

- keep the frozen experiment while another prerequisite gate closes;
- prepare a curated integration descendant of current `main`;
- replace/rederive the result if new evidence invalidates it;
- or explicitly abandon the branch after preserving the accepted semantic relationship another way.

No option is preselected by this proposal.

### 14.5 O3 tests task-framing quality

The first new `IMPLEMENTER_TASK.md` should itself be audited before implementation.

Evaluate:

- exact identity;
- one technical question;
- evidence assumptions;
- protected scope;
- execution packet availability;
- falsifiers/stop conditions;
- owner question;
- whether it reopens accepted constraints without evidence;
- whether it carries stale history the implementer does not need.

### 14.6 Optional shadow-audit period

If Jozz wants additional confidence, after O3 passes the old orchestrator may remain a **read-only auditor** for the first new orchestrator transaction or integration decision.

This must not create dual authority:

- new orchestrator owns the active project after O3;
- old orchestrator only audits/reports concerns;
- Jozz resolves disagreements.

Retire the old orchestrator once the successor demonstrates stable independent operation.

---

## 15. Recursive handoff improvement loop

Handoffs themselves should improve recursively.

```text
old orchestrator compacts current truth
-> fresh orchestrator performs blind O1
-> old orchestrator + owner audit O1
-> classify successor error vs handoff gap
-> fix docs/process if required
-> O2 continuation reasoning
-> audit
-> O3 implementer packet
-> audit
-> first supervised transaction if requested
-> record what the handoff process itself taught us
```

The handoff process is therefore another bounded experiment with observable success/failure criteria.

---

## 16. Generalized failure patterns learned from S1

These should be recognized in future campaigns even when the domain is not vehicle geometry.

### Green-test trap

A deterministic pipeline can perfectly reproduce the wrong model.

### Shared-assumption trap

Generator and test agree because they share the same wrong source assumption.

### Diagnostic-becomes-contract trap

A measured bad value is accidentally frozen as a desired regression threshold.

### One-authority-owns-everything trap

One source/pivot/asset is assumed to own all degrees of freedom despite mixed semantics.

### Projection-overreach trap

A single view is used to infer a 3D correction outside the dimensions it meaningfully constrains.

### Downstream-compensation trap

A later subsystem/stance adjustment hides an unresolved upstream relationship.

### Mechanism/calibration conflation

A rejected placement causes an otherwise useful mechanism to be rewritten prematurely.

### Product/environment conflation

A packaging, DNS, toolchain or transport failure is treated as product evidence.

### Owner-debugger trap

The owner is asked to solve technical details that the agent should derive.

### Whole-product-validation fatigue

The owner repeatedly judges a cluttered whole system instead of one attributable question.

### Conversation-per-microtask fragmentation

Useful local technical context is thrown away and conversation count explodes.

### Eternal-conversation trap

A long orchestrator conversation is kept alive past the point where stale hypotheses and context-management overhead threaten quality.

### Handoff-by-story trap

A huge chronology is transferred instead of a compact semantic state.

### Chat-patched-handoff trap

A weak repo handoff is hidden by explaining missing facts directly to the successor instead of fixing current authority.

### Branch-cemetery trap

Branch names are used as memory instead of exact SHAs/checkpoints and cleanup.

### Tooling-becomes-project trap

Validation infrastructure grows faster than its demonstrated reduction in owner/engineering uncertainty.

---

## 17. Current project-specific implications to preserve during validation

These are not new authority; validate against current `HANDOFF`, `PROJECT_STATE` and owner ledger.

At proposal time the intended semantic boundary is:

- the exact S1-D FL upper static FRONT+TOP relationship is owner accepted only at current precision;
- frozen S1 code is not integrated into `main`;
- live articulation remains unknown;
- FR remains unopened;
- wheel-side upright/hub/wheel packaging remains unresolved and visibly invades/occupies the wheel region;
- visible wishbone stretching is intentionally deferred unless later correct rigging requires change;
- dynamics/handling regression is high-severity owner-observed but deliberately deferred until visual recovery closes;
- scan loading/working during V0 is an incidental owner observation, not an active lane or release claim;
- public R0 remains immutable;
- native JV remains read-only reference for this campaign.

The successor must re-resolve exact live refs rather than trusting proposal-time identities.

---

## 18. Questions the successor should challenge in O2

After blind O1 succeeds, use this proposal as something to attack, not obey.

Questions:

1. Is the current document responsibility split actually minimal, or can it be simplified without losing authority clarity?
2. Should transcript retrospective live inside the existing orchestrator/implementer protocol, in `AGENTS.md`, or remain a separate stable protocol?
3. Which rules derived from S1 are genuinely project-global versus only vehicle-campaign-specific?
4. Does the current frozen S1 checkpoint need one more live gate before curated integration, or is a clean static integration useful/safe now?
5. If integration occurs, what exact product/test subset should be re-derived from current `main`, and which experimental/governance branch history should be deliberately left behind?
6. Should fixed-view or isolation tooling become the next enabling investment once product work resumes, based on repeated owner-validation friction?
7. Is GitHub branch protection/ruleset hardening worth adding after takeover, given that the current freeze is procedural rather than platform-enforced?
8. Are O1/O2/O3 sufficient, or should the first successor transaction receive a temporary shadow audit before the old orchestrator retires?
9. Which current documents still duplicate state and could be further compressed?
10. What evidence would prove that this vNext workflow actually makes later iterations faster/easier rather than simply more bureaucratic?

---

## 19. Success criteria for vNext

The workflow is successful only if it produces observable improvements.

Expected signs:

- fresh orchestrators reconstruct current truth without old-chat archaeology;
- implementer task packets become smaller and require less project history;
- owner validation asks fewer, clearer questions;
- accepted constraints survive later downstream work;
- repeated geometry/mechanism problems require less rediscovery;
- environment/transport failures cause safe BLOCK rather than product contamination;
- temporary branches disappear after their transaction purpose closes;
- current-state documents remain short enough to read deliberately;
- transcript retrospectives find fewer lost durable facts over time;
- handoffs require less corrective tutoring from the previous orchestrator;
- process/tooling work is justified by reduced uncertainty, not by elegance alone.

Failure signs:

- more documents but no reduction in confusion;
- longer task packets;
- repeated whole-history archaeology;
- the owner still has to diagnose technical issues;
- old rejected hypotheses repeatedly return;
- one task routinely opens several mechanisms;
- branch/document counts grow as memory substitutes;
- successor can only operate after receiving the old conversation.

If vNext increases ceremony without reducing uncertainty, simplify it.

---

## 20. Proposed validation sequence for this document

Do not integrate this proposal into stable authority yet.

Recommended sequence:

```text
1. Fresh orchestrator performs blind O1 using existing current authority only.
2. Jozz + previous orchestrator audit O1 using current Git and transcript evidence.
3. If O1 exposes a handoff gap, fix current authority and re-evaluate before O2.
4. After O1 PASS, give the successor this vNext proposal.
5. Successor performs O2 with two outputs:
   a) continuation/integration reasoning for the product;
   b) critical review of this workflow proposal.
6. Previous orchestrator + Jozz review O2.
7. Successor integrates only the justified workflow deltas into stable docs and removes/replaces this proposal if appropriate.
8. Successor prepares O3 first implementer packet.
9. Audit O3 before execution.
10. Optionally shadow-audit the first successor transaction.
```

This makes the workflow transformation itself testable and reversible.

---

## 21. Final intent

JV-Web should not depend on one giant orchestrator conversation being remembered forever.

It should become a project where:

- the owner can communicate naturally;
- the orchestrator maintains broad causal understanding;
- the implementer works on a very small exact question;
- evidence levels remain explicit;
- owner acceptance can freeze only what was actually proven;
- every failure can improve the method;
- context is compacted before it becomes dangerous;
- transcripts can be mined deliberately for lost intent/process lessons without becoming technical authority;
- a fresh agent can prove that the project is understandable before being allowed to change it.

The goal is not bureaucracy. The goal is **increasingly low-cost, high-confidence iteration over a long-lived project**.
