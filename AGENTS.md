# JV Web — operating contract

Updated: 2026-08-20
Owner: Jozz

JV Web is the browser product line for Jozz Vehicle. The product goal is a build that is useful and enjoyable to launch, drive and show on desktop and phone, while remaining a practical R&D surface for later improvements.

## 1. Authority

- `main` of `Jozzpoly/JV-Box3D-Web-experiment` is the accepted source/product authority. The repository is public.
- `Jozzpoly/JV-Box3D-Web-Public` remains the accepted Friends/public artifact repository. Its `main` is accepted artifact/release authority, not source authority.
- `preview/owner-control` is a permanent operational Owner Preview control lane, not product source authority. `preview/owner.json` points to the exact source commit currently deployed for Owner testing.
- Owner Preview Pages is the default iterative Owner-testing surface: `https://jozzpoly.github.io/JV-Box3D-Web-experiment/`.
- A candidate being live on Owner Preview does not make it accepted product truth or an accepted Friends release.
- Git/current source, executed evidence and direct Owner observation outrank stale documentation, branch names or old conversation history.
- `docs/PROJECT_STATE.md` names the only active work lane when work is intentionally ahead of `main`. A branch name alone never activates work or grants authority.
- During an explicit grounding/handoff freeze, no new product implementation begins unless current state and Owner intent are first reconstructed.

Owner acceptance is scoped. A working Pages build does not make provisional steering, rig geometry, handling or UI final truth.

## 2. Accepted Friends baseline

Preserve unless the current task explicitly changes it:

- default start: Plac E2R;
- Offroad and the full approved JSPREV2 scan are available on the accepted Friends surface on desktop and phone;
- Pages project-path/subpath delivery works;
- current owner vehicle visual package loads and drives;
- debug is limited and closed by default;
- location switching by reload is acceptable for this release;
- the temporary symmetric front/drive bridge is sufficient to keep product work moving;
- Camera Manual Rig V1 and Fullscreen V1 are accepted foundations;
- P1.2/P1.3/P1.3.1 mobile composition, utility drawer and steering-surface foundation are accepted within their documented scope;
- current accepted steering reference remains the previously accepted X-only analog `POSITION` interaction until a later steering experiment is explicitly accepted and integrated.

Current mobile performance foundation is owner-validated for the tested Galaxy A53 / Chrome / render-1x scan case. Do not generalize that result to larger worlds, other devices or higher render scales.

Known product debt includes pedal mapping/mechanics/design, final steering gesture/design, portrait-specific composition, final rig geometry and handling.

## 3. JURE boundary

Rig authoring belongs in the separate Jozz Universal Rig Editor (JURE) line. JV Web is a consumer/falsifier, not a second rig editor.

JURE owns authored neutral rig truth: elements, frames, provenance, mechanical relations and representation intent. JV Web owns consumer/runtime concerns: Box3D identities, dynamics/force laws, vehicle runtime topology, controls, rendering integration and browser product behavior.

Current procedural M6 hardpoints and steering bridges are provisional consumer runtime geometry. They must not be upgraded into authored truth merely because they are working product code.

A JURE integration must not replace one authored hardpoint or relation while silently leaving an incompatible procedural shape around it. Current cross-project evidence has already falsified the assumption that the procedural M6 wishbone and the exact/JURE-authored wishbone are rigid-congruent. A replacement must therefore use a coherent mechanical unit whose internal neutral geometry belongs to one authority.

Do not freeze a JV-Web import schema while JURE is still falsifying the minimum multi-relation export unit. When JURE freezes an explicit consumer fragment, validate it first on an isolated source branch named `jure/<specific-purpose>`.

The first JV-Web consumer path must be fail-closed and data-first:

`versioned JURE output -> strict parse/validation -> coordinate/placement validation -> coherent neutral geometry mapping -> isolated runtime experiment only after geometry passes`

No agent-side coordinate guessing. No implicit identity transform. No accepted/public artifact change in the same first consumer slice.

See `docs/contracts/JURE_CONSUMER_BOUNDARY.md` for the durable cross-project boundary.

## 4. Work style

Jozz defines vision, priorities and owner-visible acceptance. The agent is responsible for programming, repository work, technical analysis, build/CI mechanics, deployment and engineering troubleshooting.

Do not ask Jozz to apply patches, run terminal commands, debug CI, install dependencies or repair local engineering machinery that the agent can handle. Owner intervention is for genuinely irreplaceable visual/feel/device judgement, inaccessible files or unavoidable owner-side platform actions.

Default product loop:

`small need -> smallest meaningful source change -> check matching causal blast radius -> Owner Preview Pages -> real device/render evidence -> Owner judgement -> next iteration`

Owner Preview Pages is the normal delivery path for iterative JV-Web work. ZIP/local-Windows preview is forensic/emergency fallback only, not the default workflow and not a way to transfer agent-side tooling problems to the Owner.

For ordinary work, run only checks that cover the changed risk. Full canonical validation is for foundation/schema/toolchain changes, major integration boundaries, milestone close or accepted release. A passing build does not replace browser/device validation for user-visible work.

Validation claims must name the evidence actually executed. A planned command, package readme, script label or intended gate does not prove that command ran.

Keep validation classes separate:

- source/unit/type checks;
- build/artifact/path/identity checks;
- browser execution/rendered checks;
- Owner-device/feel checks.

Static HTTP delivery or an exact `index.html` fetch is not browser execution evidence.

Avoid speculative abstractions. Prefer one clean implementation that can be extended later over infrastructure for hypothetical variants.

Do not mix product redesign, recovery, delivery-harness invention and repository cleanup into one slice. Helper/tooling failure is not automatically product failure.

## 5. Documentation discipline

A fresh agent normally needs only:

1. `AGENTS.md`;
2. `docs/PROJECT_STATE.md`;
3. source/tests for the current task.

During an explicit conversation/repository takeover, read `docs/HANDOFF.md` immediately after `docs/PROJECT_STATE.md`. It is a takeover snapshot, not a competing source of truth.

`AI_PROJECT_MEMORY.md` is a compact router, not another project history. `docs/ARCHITECTURE.md` describes stable boundaries. `docs/OWNER_CHECKPOINTS.md` records durable scoped Owner acceptance and must not be used to manufacture acceptance for a still-open experiment.

Historical campaigns, handoffs, recovery notes, superseded roadmaps and old branch narratives belong in Git history. Do not recreate them for ordinary work. Update or remove stale current-state text instead.

Keep technical contracts/baselines only when they describe a real external, executable or reproducible boundary that source types alone do not communicate clearly.

## 6. Git discipline

Resolve repo/ref before writes. Use normal fast-forward history; no routine force pushes.

Keep at most one ordinary active product work lane ahead of accepted `main`. Create another branch only for a concrete isolation/rollback reason, not per agent, conversation, failed attempt or tiny feature.

`preview/owner-control` is a special permanent operational control lane and does not count as a competing product work lane. It must only point at exact committed source candidates and must not become a second source tree.

Cross-project JURE work in this repository uses `jure/<specific-purpose>`. While such a branch is active, `docs/PROJECT_STATE.md` must name its exact purpose and make clear that authored-rig authority remains in JURE.

A `checkpoint/*` ref requires a concrete rollback/evidence purpose. Once safely ancestral to accepted history or deliberately retained archive evidence, retire redundant checkpoint branch names rather than accumulating permanent refs.

Git history/tags are the archive; branch names are working/navigation state, not trophies. Do not infer authority from names such as `golden`, `candidate`, `repair` or `checkpoint`.

## 7. Preview and release discipline

Owner Preview is an R&D/testing surface produced from an exact committed source candidate. It is not accepted release authority.

- `preview/owner.json` must identify one exact 40-character source SHA.
- Preview build identity must match that exact source candidate and a clean committed tree.
- A failed preview candidate must fail closed and must not replace the previously deployed working preview.
- Do not patch compiled Preview JavaScript/CSS as a substitute for source integration.

Accepted Friends releases are artifacts produced from accepted source.

- Rollback authority is an exact known commit in normal public `main` ancestry; do not recreate permanent release/checkpoint branch families merely for archival comfort.
- Code-only Friends releases may carry forward the already-published exact scan.
- A scan-changing release must pin and validate the new exact approved scan input.
- Compressed HTTP `Content-Length` is not decoded scan integrity; validate downloaded payload and format.
- Keep rollback straightforward and verify exact source/artifact identity after publication.
- Experimental controls must be implemented in normal typed source and built normally. Do not patch compiled `main.js` or use text-replacement loaders as a substitute for source integration.
- Accepted Friends root behavior must not inherit executable JavaScript/CSS from an older artifact layer. Executable behavior must be traceable to exact source. Carry-forward is for explicitly approved static data/assets and necessary release metadata, not historical runtime overlays.
- Diagnostic/runtime overlays must be source-owned or isolated under an explicit test path.
- A build manifest source commit identifies the product-source basis; if preserved data or release metadata is added afterward, record those artifact layers explicitly rather than implying every artifact byte was generated by that source commit.

## 8. Product boundaries

The browser Box3D vehicle is the current Web implementation, not proof of native JV parity or final vehicle physics.

Do not silently convert visual calibration, historical M5/M6 values, secondary contracts or convenience tests into mechanical authority.

Do not reduce phone scan content or physics quality merely for performance. Measure the real bottleneck first. LOD, streaming and world partitioning are scaling tools for evidence-backed future needs, not default fixes.

## 9. Stop conditions

Stop and investigate when:

- a write would modify the wrong repo/ref or overwrite rollback history;
- Owner-visible behavior would change outside declared scope;
- work starts rebuilding rig/steering assumptions that JURE should author;
- a JURE experiment starts mixing an authored partial mechanism with incompatible procedural M6 geometry;
- a consumer adapter starts inventing coordinates, units, frame transforms or source identity that JURE did not export explicitly;
- documentation/process grows faster than product value;
- an artifact cannot be tied to exact source and rollback;
- a validation summary claims commands or browser execution that the recorded evidence did not actually perform;
- third-party licensing/provenance is unclear;
- routine engineering work is about to be pushed onto Jozz;
- a new branch/checkpoint is being created without a concrete isolation or rollback reason;
- an experiment starts depending on compiled-runtime text surgery instead of normal source integration.
