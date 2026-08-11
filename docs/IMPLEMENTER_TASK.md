# JV Web — implementer task

Updated: 2026-08-11
Status: **ACTIVE**
Task: **S2-PARITY — recover the golden native FL front-corner rig contract**
Mode: **PARITY / ROOT-CAUSE / OWNER-VALIDATION-FIRST / NO PRODUCT PATCH**

## Why this task supersedes the narrow axis audit

Owner feedback exposed a broader failure mode behind the current axis regression and likely a substantial part of the last several days of unsuccessful rig recovery.

The original practical goal was to bring the already-working native/core JV front-corner rig behavior into JV-Web. Instead, successive Web iterations increasingly reconstructed a new rig from native factory receipts, generic M6 hardpoints, copied contracts, calibration helpers and project documentation.

There is now direct evidence that those secondary layers can contradict the working native rig and the authored source asset.

Known smoking-gun example:

- native M6 rig-lab explicitly puts `Socket_ChassisMount_b` on the NON-STEERING lower-arm/carrier frame and `Socket_WheelCenter` on the steering knuckle frame;
- the copied `one_sided_steering_suspension.asset.json` contract says BOTH `Socket_ChassisMount_b` and `Socket_WheelCenter` `ridesBody: "knuckle"`;
- current Web R2/R3 packaging follows that collapsed interpretation and groups both as front knuckle pieces;
- the authored source itself contains `Axis_SuspensionTravel_Top` / `Axis_SuspensionTravel_Bottom` with `Socket_WheelCenter` exactly on their line, while generic M6 hardpoints generate a different kingpin from caster/KPI values.

This means a self-consistent Web implementation can be technically green while still being a regression relative to the mechanism we were supposed to copy.

Do not implement another local fix until the golden native/source contract is recovered and owner-validated.

## Authority order

For this front-corner recovery task use:

1. **OWNER + exact authored source asset** — authority for intended visual geometry, authored sockets/axes and owner-corrected semantics.
2. **Exact working native/core JV behavior** — golden implementation reference to copy where it agrees with owner/source. Identify the exact working path; do not treat every native helper/config as equally authoritative.
3. **Current JV-Web code/runtime** — target to audit and repair, not truth.
4. **Docs, JSON contracts, factory receipts, calibration prose/tests** — potentially stale/corrupted evidence. They must be revalidated against owner/source/golden native behavior before being trusted.

If a secondary contract or test contradicts owner/source/golden working behavior, classify the secondary artifact as suspect; do not average the interpretations.

## Protected owner truth already established

- yellow suspension-side member and red steerable member are separate;
- yellow follows suspension articulation but must not inherit steering rotation;
- red steers relative to yellow;
- wheel spin is a separate DOF;
- `Socket_ChassisMount_b` belongs to the non-steering suspension-side behavior, not the same steering frame as `Socket_WheelCenter`;
- `Socket_WheelCenter` is steerable and does not wheel-spin as a structural reference;
- `Axis_SuspensionTravel_Top` + `Axis_SuspensionTravel_Bottom` define the intended authored steering-axis placement for this asset;
- `Socket_WheelCenter` lies exactly on that authored axis;
- the previous displaced blue axis and one-knuckle interpretation are rejected;
- integrated S1 FL-upper static/live owner acceptance remains protected unless a direct parity contradiction is demonstrated.

## One bounded question

> What exact FL front-corner rig behavior should JV-Web copy from the golden native implementation and authored source, where does current JV-Web diverge from that behavior, and what is the smallest coherent repair program that restores parity without redesigning the mechanism from secondary documentation?

This is a copy/parity investigation, not a fresh suspension design exercise.

## Product / write boundary

```text
JV-Web integrated product base:
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450
```

Remote/product write authority: **NONE**.

Do not patch the product or create a work branch in this task. Disposable local probes/prototypes are allowed.

## Implementer freedom

Own this investigation. The orchestrator deliberately does NOT prescribe an implementation file list or algorithm.

Inspect whichever exact native/core JV and JV-Web files are necessary. Use local scripts, source extraction, diagrams, runtime probes, side-by-side renders or disposable parity prototypes as useful.

Do not repeat full repository archaeology if continuity is intact. Spend the effort on the mechanism and divergence, not ceremony.

## Required result

### A. Establish the golden native reference

Resolve the exact current native/core JV SHA and identify the code path(s) that actually express the working front-corner rig behavior the owner intended to copy.

At minimum investigate the relationship between:

- working M6 front-corner visual rig behavior;
- M9 steering-rig bench where useful as semantic cross-check;
- generic M6 physical hardpoint/steering geometry.

Do not assume all three are equally authoritative. If the working visual rig and generic physical geometry disagree, report that explicitly.

Extract the golden behavior in plain mechanical terms:

```text
chassis attachment
suspension-side / non-steering member
steerable member
wheel center
steering axis
steering link
wheel steering
wheel spin
suspension articulation
```

### B. Build a parity matrix: golden/source vs current Web

For each important front-left role/DOF, classify current Web as:

```text
PARITY
INTENTIONAL ADAPTATION — justify why it is required in Web
REGRESSION
UNKNOWN
```

Include at least:

- `Socket_ChassisMount_b` ownership/frame;
- `Socket_WheelCenter` ownership/frame;
- yellow/red member split;
- authored Top↔Bottom steering axis;
- upper/lower ball / kingpin generation;
- caster/KPI influence;
- wheel center and wheel steering transform;
- wheel spin separation;
- steering-link outboard reference;
- relevant wishbone outboard/shared-joint semantics;
- any calibration stage that shears/repositions the authored rig toward generated M6 hardpoints.

### C. Trace the regression chain

Identify where the wrong interpretation entered or was reinforced.

Audit, as evidence rather than assumed truth:

- copied asset contract semantics;
- native factory receipt / Web topology config;
- Web `m6WishboneHardpoints` / runtime kingpin construction;
- R2/R3 owner-rig package generation;
- R3 front reference/knuckle calibration;
- tests/docs that currently certify or repeat the collapsed model.

Find the smallest set of stale/corrupted/secondary authorities that can explain repeated regression back to the wrong rig.

Do not merely list differences: explain the causal path by which an agent following the current repo can reasonably arrive at the wrong result.

### D. Determine the correct repair boundary

Recommend the smallest **coherent** future production repair that copies the golden mechanism.

Decide from evidence whether the repair must change:

- visual/binding topology only;
- physical hardpoints/steering axis;
- both;
- or another bounded surface you discover.

Do not preserve generic caster/KPI/hardpoint values simply because they are currently in code or receipts. If they contradict the authored/golden target, they are implementation candidates for replacement/correction.

Equally, do not invent extra physics bodies if the golden M6 implementation achieves the correct behavior using existing bodies/frames.

### E. Anti-regression design

The future repair must not rely on another agent remembering this conversation.

Propose how to make the correct source/golden semantics executable and difficult to regress, for example through source-derived roles/axis, parity tests or retirement/correction of stale secondary artifacts.

Tests should check parity with the intended mechanism, not merely self-consistency of generated Web data.

### F. Owner-facing golden-contract gate

Prepare a concise visual/mechanical board for Jozz before implementation.

It should make it easy to verify:

- yellow non-steering member;
- red steering member;
- authored Top↔Bottom axis;
- WheelCenter on that axis;
- how steering occurs relative to suspension travel;
- wheel spin as a separate DOF;
- where current Web differs from the golden/source target.

Prefer direct source/native-vs-Web comparison over abstract diagrams alone. Label uncertainties honestly.

If useful, make a disposable `GOLDEN PARITY PROTOTYPE — NOT PRODUCT` that reproduces the native/source mechanism in isolation. This is allowed and encouraged if it reduces ambiguity.

## Decision states

`OWNER_GATE_READY` — golden native/source contract is reconstructed, the Web regression chain is explained, and one coherent repair direction is ready for owner validation.

`REPLAN` — native/source evidence itself contains multiple materially different plausible golden paths or a new owner-level ambiguity appears. Return the competing interpretations and best discriminator.

`BLOCKED` — an exact artifact required for the parity reconstruction cannot be accessed. Ask early for the specific missing file/artifact rather than spending a long cycle on workarounds.

No product patch or downstream S3 is authorized before owner verdict on this parity reconstruction.

## Return

Return compactly in Polish. Prioritize discoveries and causality over process narration:

```text
TASK: S2-PARITY
RESULT: OWNER_GATE_READY | REPLAN | BLOCKED
CONTROL TIP:
PRODUCT BYTES CHANGED: NO
REMOTE WRITES: NONE

GOLDEN NATIVE REFERENCE:
GOLDEN FRONT-CORNER CONTRACT:
PARITY MATRIX:
CURRENT WEB REGRESSIONS:
ROOT-CAUSE CHAIN:
STALE/CORRUPTED SECONDARY AUTHORITIES:
CORRECT REPAIR BOUNDARY:
ANTI-REGRESSION PLAN:
UNCERTAINTIES / FALSIFIERS:
OWNER MATERIAL:
```

If `OWNER_GATE_READY`, finish with one focused owner question that asks whether the reconstructed golden/source mechanism is now correctly understood. Do not ask for final product acceptance yet.
