# JV Web — operating contract

Updated: 2026-08-22
Owner: Jozz

JV Web is the browser product line for Jozz Vehicle. The product goal is a build that is useful and enjoyable to launch, drive and show on desktop and phone, while remaining a practical R&D surface for later improvements.

## 1. Authority

- `main` of `Jozzpoly/JV-Box3D-Web-experiment` is accepted source/product authority. The repository is public.
- `Jozzpoly/JV-Box3D-Web-Public/main` is accepted Friends/public artifact authority, not source authority.
- `preview/owner-control` is a permanent operational Owner Preview control lane, not product source authority. `preview/owner.json` identifies one exact executable source commit and may additionally pin explicitly approved static artifact layers.
- A pinned Preview static layer never becomes product source authority. Its repository, exact commit and release receipt/provenance must remain explicit and independently auditable.
- Owner Preview Pages is the default iterative Owner-testing surface: `https://jozzpoly.github.io/JV-Box3D-Web-experiment/`.
- A source candidate being live on Owner Preview does not by itself make it accepted product truth or an accepted Friends release.
- Git/current source, executed evidence and direct Owner observation outrank stale documentation, branch names or old conversation history.
- `docs/PROJECT_STATE.md` names the active work lane when work is intentionally ahead of `main`. A branch name alone never activates work or grants authority.
- During an explicit grounding/handoff freeze, no new product implementation begins until current state and Owner intent are reconstructed.

Owner acceptance is scoped. A working Pages build does not make provisional steering tuning, rig geometry, handling or UI final truth.

## 2. Accepted product and Friends boundaries

Preserve unless the current task explicitly changes them:

- Plac E2R, Offroad and the approved JSPREV2 scan;
- current owner vehicle visual package;
- Camera Manual Rig V1 and Fullscreen V1;
- P1.2/P1.3/P1.3.1 mobile composition, utility drawer and steering-surface foundation;
- dual-mode source steering foundation: Owner-facing `DIRECT_ROTATION` / `Obrót` and `RELATIVE_X` / `Przeciąganie`, with final tuning still open;
- `X_POSITION` as internal historical/regression reference only;
- analog throttle/brake foundation, independent multitouch ownership, fail-closed lifecycle behavior and current D/R semantics;
- tested Samsung Galaxy A53 / Chrome render-1x scan performance boundary.

Do not generalize the A53 performance result to larger worlds, other devices or higher render scales.

The accepted Friends/Public artifact currently predates the dual-mode steering source integration. Do not imply that accepted source changes are already present in Friends/Public until a separate release is built, promoted and Owner-accepted.

Known product debt includes pedal mapping/mechanics/design, final steering tuning/design, portrait-specific composition, final rig geometry and handling.

## 3. JURE boundary

Rig authoring belongs in the separate Jozz Universal Rig Editor (JURE) line. JV Web is a consumer/falsifier, not a second rig editor.

JURE owns authored neutral rig truth: elements, frames, provenance, mechanical relations and representation intent. JV Web owns consumer/runtime concerns: Box3D identities, dynamics/force laws, vehicle runtime topology, controls, rendering integration and browser product behavior.

Current procedural M6 hardpoints and steering bridges are provisional consumer runtime geometry. They must not be upgraded into authored truth merely because they are working product code.

A JURE integration must not replace one authored hardpoint or relation while silently leaving an incompatible procedural shape around it. Cross-project evidence has already falsified the assumption that the procedural M6 wishbone and exact/JURE-authored wishbone are rigid-congruent. Replacement must use a coherent mechanical unit whose internal neutral geometry belongs to one authority.

Do not freeze a JV-Web import schema while JURE is still falsifying the minimum multi-relation export unit. When JURE freezes an explicit consumer fragment, validate it first on an isolated source branch named `jure/<specific-purpose>`.

First consumer path:

`versioned JURE output -> strict parse/validation -> coordinate/placement validation -> coherent neutral geometry mapping -> isolated runtime experiment only after geometry passes`

No agent-side coordinate guessing. No implicit identity transform. No accepted/public artifact change in the same first consumer slice.

See `docs/contracts/JURE_CONSUMER_BOUNDARY.md` for the durable cross-project boundary.

## 4. Work style

Jozz defines vision, priorities and Owner-visible acceptance. The agent is responsible for programming, repository work, technical analysis, build/CI mechanics, deployment and engineering troubleshooting.

Do not ask Jozz to apply patches, run terminal commands, debug CI, install dependencies or repair local engineering machinery that the agent can handle. Owner intervention is for genuinely irreplaceable visual/feel/device judgement, inaccessible files or unavoidable Owner-side platform actions.

Default product loop:

`small need -> smallest meaningful source change -> check matching causal blast radius -> Owner Preview Pages -> real device/render evidence -> Owner judgement -> next iteration`

Owner Preview Pages is the normal delivery path. ZIP/local-Windows preview is forensic/emergency fallback only, not a way to transfer agent-side tooling problems to the Owner.

For ordinary work, run only checks that cover the changed risk. Full canonical validation is for foundation/schema/toolchain changes, major integration boundaries, milestone close or accepted release. A passing build does not replace browser/device validation for user-visible work.

Validation claims must name evidence actually executed. Keep source/unit/type, build/artifact/path/identity, browser/rendered and Owner-device/feel evidence separate.

Avoid speculative abstractions. Prefer one clean implementation that can be extended later over infrastructure for hypothetical variants. Do not mix product redesign, recovery, delivery-harness invention and repository cleanup into one slice. Helper/tooling failure is not automatically product failure.

## 5. Documentation discipline

A fresh agent normally needs only:

1. `AGENTS.md`;
2. `docs/PROJECT_STATE.md`;
3. source/tests for the current task.

During explicit takeover, read `docs/HANDOFF.md` immediately after `docs/PROJECT_STATE.md`. It is a takeover snapshot, not a competing source of truth.

`AI_PROJECT_MEMORY.md` is a compact router. `docs/ARCHITECTURE.md` describes stable boundaries. `docs/OWNER_CHECKPOINTS.md` records durable scoped Owner acceptance and must not manufacture acceptance for open tuning or future work.

Historical campaigns, superseded handoffs/roadmaps and old branch narratives belong in Git history. Update or remove stale current-state text instead of reproducing archaeology.

## 6. Git discipline

Resolve repo/ref before writes. Use normal fast-forward history; no routine force pushes.

Keep at most one ordinary active product work lane ahead of accepted `main`. Create another branch only for a concrete isolation/rollback reason, not per agent, conversation, failed attempt or tiny feature.

`preview/owner-control` is a special permanent operational lane and does not count as a competing product work lane. It may point only at exact committed executable source candidates and explicitly pinned approved static layers; it must not become a second source tree.

Cross-project JURE work in this repository uses `jure/<specific-purpose>` and must remain explicitly isolated while authored-rig authority stays in JURE.

A `checkpoint/*` ref requires a concrete rollback/evidence purpose. Once safely ancestral to accepted history or deliberately retained evidence, retire redundant branch names rather than accumulating permanent refs.

Git history/tags are the archive; branch names are working/navigation state, not trophies. Do not infer authority from names such as `golden`, `candidate`, `repair`, `checkpoint` or old `work/*` refs.

After the 2026-08-22 dual-mode steering close there is no ordinary active product lane. A still-visible `work/direct-rotation-steering` ref is historical/redundant navigation, not active steering work.

## 7. Preview and release discipline

Owner Preview is an R&D/testing surface produced from one exact committed executable source candidate. It is not accepted release authority.

- `preview/owner.json` must identify one exact 40-character executable source SHA.
- If Preview composes approved static data not generated by that source, the pointer must pin repository/commit/provenance and the deployed artifact must record composition separately from executable identity.
- Preview build identity must match the exact executable source and clean committed tree.
- Preserved data must be integrity-checked against approved provenance before deploy.
- Owner Preview should preserve accepted capabilities unrelated to the active experiment. A deliberate omission must be explicit, scoped and treated as a Preview gap.
- A failed Preview candidate or static-layer validation must fail closed and must not replace the previously deployed working Preview.
- Do not patch compiled Preview JavaScript/CSS as a substitute for source integration.

The temporary heavy Windows integration gate used for a milestone close is not normal Preview cadence. Keep ordinary Preview lightweight unless the current blast radius genuinely requires a broader gate.

Accepted Friends releases are separate artifacts produced from accepted source.

- rollback authority is an exact known commit in normal public `main` ancestry;
- code-only Friends releases may carry forward the already-published exact scan;
- a scan-changing release must pin and validate the new exact approved scan input;
- executable behavior must be traceable to exact source; carry-forward is only for explicitly approved static data/assets and necessary release metadata;
- a build-manifest source commit identifies the executable source basis; preserved layers must retain separate provenance;
- source acceptance does not automatically advance Friends/Public.

## 8. Product boundaries

The browser Box3D vehicle is the current Web implementation, not proof of native JV parity or final vehicle physics.

Do not silently convert visual calibration, historical M5/M6 values, secondary contracts or convenience tests into mechanical authority.

Do not reduce phone scan content or physics quality merely for performance. Measure the real bottleneck first. LOD, streaming and world partitioning are evidence-backed future tools, not default fixes.

## 9. Stop conditions

Stop and investigate when:

- a write would modify the wrong repo/ref or overwrite rollback history;
- Owner-visible behavior would change outside declared scope;
- work starts rebuilding rig/steering assumptions that JURE should author;
- a JURE experiment starts mixing authored partial geometry with incompatible procedural M6 geometry;
- a consumer adapter starts inventing coordinates, units, frame transforms or source identity not explicitly exported by JURE;
- documentation/process grows faster than product value;
- an artifact cannot be tied to exact source and rollback;
- a validation summary claims commands or browser execution that evidence did not perform;
- third-party licensing/provenance is unclear;
- routine engineering work is about to be pushed onto Jozz;
- a new branch/checkpoint is being created without a concrete isolation or rollback reason;
- an experiment depends on compiled-runtime text surgery instead of normal source integration.
