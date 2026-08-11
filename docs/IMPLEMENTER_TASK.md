# JV Web — implementer task

Updated: 2026-08-11
Status: **ACTIVE**
Task: **S2-OWNER — owner validation of FL corner role interpretation**
Mode: **OWNER-EVIDENCE / READ-ONLY / NO PRODUCT PATCH**

The technical S2-FL-ROLES investigation returned `REVIEW_READY`, but Jozz explicitly rejected treating that as validated understanding. This project has already gone through several earlier agent attempts where the agents were confident about the corner semantics and the visible result was wrong. Therefore S2 remains OPEN until the owner validates what we think the front-left mechanism actually is.

Do not proceed to S3.

## 1. Product boundary

Integrated product base remains:

```text
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450
```

Current `main` will be a docs-only descendant carrying this packet.

Remote write authority: **NONE**.

Do not rebuild the full repository identity proof again if the same exact product mirror from S2 is still available. A light continuity check is enough:

- verify current `main` equals the orchestrator-supplied CONTROL TIP;
- verify changes since `67d66ed...` are docs-only;
- reuse the already verified exact `f2e183...` product mirror.

Only repeat full reconstruction if continuity is actually broken.

## 2. What must be owner-validated

The owner must be able to verify our **semantic interpretation**, not merely that the current animation is numerically self-consistent.

Current technical hypothesis to present visibly:

### Chassis-side

- `Socket_ChassisMount_a`
- `Socket_SingleDamper_Mount`
- `Socket_SingleDamperUpper`
- `Socket_CardanDrive` — chassis-side role only; its authored position is NOT claimed as the final cardan endpoint

### Lower-arm-side

- `Chassis_Bottom` = lower wishbone visual part
- `Socket_SingleDamperLower` follows the lower arm

### Knuckle/upright-side

- `Socket_ChassisMount_b` despite its misleading name
- `Socket_WheelCenter`
- `Socket_SteeringRod` outboard role
- `Socket_CardanHub`

### Spanning / shared-joint interpretation

- `Chassis_Top` = accepted upper wishbone spanning chassis ↔ upper-ball region
- `Chassis_Bottom` = lower wishbone spanning chassis ↔ lower-ball region
- upper/lower ball locations are shared mechanical pivots, not evidence that one textual `partId` alone semantically owns the joint

Do not present any of the above as owner truth before Jozz accepts or corrects it.

## 3. Required owner-facing evidence

Prepare **clear visual material**, not another long numerical report.

### A. Static source-role map — mandatory

Show the actual front-left source rig geometry in a clean isolated view and visibly identify what each named node/part corresponds to.

Use a consistent role color/legend for:

- chassis-side;
- lower-arm-side;
- knuckle/upright-side;
- accepted upper-arm control;
- shared pivot/reference points.

Show the original authored geometry/hierarchy clearly enough that Jozz can say: “yes, that is the part/socket I meant” or correct us.

Do not hide semantic mistakes behind current calibrated placement.

### B. Runtime role demonstration — mandatory

Using the same visual legend, show the interpreted groups in the real integrated M6 runtime through a short natural suspension sequence.

Prefer several simple focused captures over one cluttered capture, for example:

1. chassis-side group vs moving corner;
2. lower-arm + its damper-lower point;
3. knuckle/upright-side group + shared upper/lower ball and wheel center.

Use fixed readable views. FRONT/TOP/SIDE or a close three-quarter view may be combined as needed. Hide or ghost unrelated geometry, especially the wheel, when it obscures the mechanism.

No steering is required unless a very short neutral-vs-steered control materially helps the owner understand which object we call the knuckle/upright. Do not turn this into steering validation.

### C. Explicit labels — mandatory

The material must state in plain language what we believe each highlighted element is and what it should move with. Node names alone are insufficient.

### D. Do not conceal known warnings

Mention visually or in the short accompanying note:

- authored steering socket position differs strongly from current physical steering arm (~0.222 m); this did NOT validate steering geometry;
- current interface-audit cardan endpoint path is stale relative to R3 and was not treated as authority;
- worst observed lower-ball shared-joint solver residual in the S2 technical run was about 6.263 mm; this was not classified as a body-role swap but remains evidence for later geometry work.

These warnings must not be used to ask the owner to accept those downstream geometries.

## 4. Owner question

After the material, ask exactly this top-level question:

> **Czy poprawnie rozumiemy przedni lewy corner: które elementy są związane z chassis, które z dolnym wahaczem, które ze zwrotnicą/uprightem oraz gdzie są wspólne punkty przegubów? Jeśli nie, wskaż proszę konkretnie co rozumiemy źle.**

A correction of one element is a valid answer. Do not force a binary yes/no if Jozz sees a semantic mistake.

## 5. Decision boundary

- `OWNER_ACCEPTED`: only if Jozz confirms the role interpretation strongly enough to proceed.
- `OWNER_CORRECTED` / `OWNER_REJECTED`: stop and return the corrected semantic map; orchestrator will replan before any geometry patch.
- `OWNER_UNCERTAIN`: improve the presentation/isolated view; do not proceed to S3.

No product code, tests, calibration, physics or remote refs may change in this task.

Do not begin FL lower geometry, upright/hub/wheel work, damper fixes, steering fixes, cardan fixes, FR work, stance or dynamics.

## 6. Return

Respond in Polish. Keep the technical recap short. Attach/show the owner-facing material directly so Jozz does not need to run Node, a dev server, scripts or local tools.

Return:

```text
TASK: S2-OWNER
CONTROL TIP:
PRODUCT BASE: 67d66ed412342fee5445b2901d85a663a084bf4e
PRODUCT BYTES UNCHANGED: YES expected
REMOTE WRITES: NONE expected
OWNER MATERIAL: links/attachments
KNOWN WARNINGS: concise
OWNER QUESTION: exact question from section 4
```
