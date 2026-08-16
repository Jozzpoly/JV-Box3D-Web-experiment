# JV Web — operating contract

Updated: 2026-08-16
Owner: Jozz

JV Web is the browser product line for Jozz Vehicle. The product goal is a public build that is useful and enjoyable to launch, drive and show on desktop and phone, while remaining a practical R&D surface for later improvements.

## 1. Authority

- `main` is the accepted private source/product authority.
- `Jozzpoly/JV-Box3D-Web-Public` is an artifact/publication repository, not source authority.
- `release/r0` is immutable rollback/history; `release/friends-r1` is the moving Friends Pages line.
- Git/current source, reproducible runtime evidence and direct owner observation outrank stale documentation or branch names.
- `docs/PROJECT_STATE.md` names the **only active work lane** when work is intentionally ahead of `main`. Every other `work/*`, `candidate/*`, `repair/*` or `checkpoint/*` ref is historical/evidence unless that file explicitly activates it.

Owner acceptance is scoped. A working Friends build does not make provisional steering, rig geometry or handling final truth.

## 2. Accepted Friends baseline

Preserve unless the current task explicitly changes it:

- default start: Plac E2R;
- Offroad and the full approved JSPREV2 scan are available on desktop and phone;
- Pages project-path/subpath delivery works;
- current owner vehicle visual package loads and drives;
- debug is limited and closed by default;
- location switching by reload is acceptable for this release;
- the temporary symmetric front/drive bridge is sufficient to keep product work moving.

Current mobile performance foundation is owner-validated for the tested Galaxy A53 / Chrome / render-1x scan case. Do not generalize that result to larger worlds, other devices or higher render scales.

Known product debt includes mobile driving-control polish and final rig/steering/handling. Camera Manual Rig V1 and Fullscreen V1 are accepted foundations; future automatic camera behavior must remain additive to manual calibration.

## 3. JURE boundary

Rig authoring belongs in the separate Jozz Universal Rig Editor (JURE) line. JV Web should later consume explicit authored outputs; it should not grow another temporary rig editor or keep guessing hardpoints/frames to repair current visuals.

Do not revive old steering/rig campaigns by default. Final rig and steering work waits for better authored geometry unless current evidence gives a narrower reason.

## 4. Work style

Jozz defines vision, priorities and owner-visible acceptance. The agent is responsible for programming, repository work, technical analysis and release mechanics.

Do not ask Jozz to apply patches, run terminal commands or debug engineering machinery that the agent can handle. Owner intervention is for genuinely irreplaceable visual/feel/device judgement, inaccessible files or unavoidable owner-side platform actions.

Default loop:

`small need -> small vertical slice -> smallest relevant check -> rendered/device proof when relevant -> owner-visible result -> continue`

For ordinary work, run only checks that cover the changed risk. Full validation is for foundation/schema/toolchain changes, major integration boundaries and public releases. A passing build does not replace browser/device validation for user-visible work.

Validation claims must name the evidence actually executed. A planned command, package readme, script label or intended gate does not prove that command ran. If `npm run check` is claimed, the execution evidence must show `npm run check` (or its exact complete equivalent), not typecheck-only execution.

Keep validation classes separate:

- source/unit/type checks;
- build/artifact/path/identity checks;
- browser execution/rendered checks;
- owner-device/feel checks.

Static HTTP delivery or an exact `index.html` fetch is not browser execution evidence.

Avoid speculative abstractions. Prefer one clean implementation that can be extended later over infrastructure for hypothetical variants.

Do not mix product redesign, source recovery, delivery-harness invention and repository cleanup into one slice. Close the foundation boundary first, then resume product work.

## 5. Documentation discipline

A fresh agent normally needs only:

1. `AGENTS.md`;
2. `docs/PROJECT_STATE.md`;
3. source/tests for the current task.

`AI_PROJECT_MEMORY.md` is a compact router, not another project history. `docs/ARCHITECTURE.md` describes stable boundaries. `docs/OWNER_CHECKPOINTS.md` is consulted only when scoped owner acceptance matters.

Historical campaigns, handoffs, recovery notes, superseded roadmaps and old branch narratives belong in Git history. Do not recreate them for ordinary work. Update or remove stale current-state text instead.

Keep technical contracts/baselines only when they describe a real external, executable or reproducible boundary that source types alone do not communicate clearly. A durable interaction contract is appropriate when exact product behavior would otherwise be lost across implementation attempts.

## 6. Git discipline

Resolve repo/ref before writes. Use normal fast-forward history; no routine force pushes.

Keep at most one ordinary active work lane ahead of `main`. Create another branch only for a concrete isolation/rollback reason, not per agent, conversation, failed attempt or tiny feature.

A `checkpoint/*` ref requires a concrete rollback/evidence purpose. Once that checkpoint is safely ancestral to `main`, an immutable release, or a deliberately retained archive ref, retire the redundant checkpoint branch name instead of accumulating permanent refs.

For large cleanups, preserve branch archaeology in **one deliberate archive ref/manifest**, then remove obsolete ordinary branch names. Git history is the archive; branch names are working/navigation state, not trophies.

Do not infer authority from names such as `golden`, `candidate`, `repair` or `checkpoint`.

## 7. Release discipline

Public releases are artifacts produced from accepted private source.

- Never rewrite `release/r0`.
- Code-only Friends releases may carry forward the already-published exact scan.
- A scan-changing release must pin and validate the new exact approved scan input.
- Compressed HTTP `Content-Length` is not decoded scan integrity; validate downloaded payload and format.
- Keep rollback straightforward and verify exact public source/artifact identity after publication.
- Experimental mobile controls must be implemented in normal typed private source and built normally. Do not patch compiled `main.js` or use text-replacement loaders as a substitute for source integration.
- The moving Friends **root product must not inherit or inject executable JavaScript/CSS from an older public release layer**. Executable root behavior must be traceable to the exact private source build. Carry-forward is for explicitly approved static data/assets and necessary release metadata/byte-preservation files, not historical runtime overlays.
- Diagnostic/runtime overlays must be source-owned or isolated under an explicit test path. Do not silently extend the root product runtime from the public artifact repository.
- A build manifest source commit identifies the private product-source basis; if preserved data or release metadata is added afterward, record those artifact layers explicitly rather than implying every public byte was generated by that source commit.

## 8. Product boundaries

The browser Box3D vehicle is the current Web implementation, not proof of native JV parity or final vehicle physics.

Do not silently convert visual calibration, historical M5/M6 values, secondary contracts or convenience tests into mechanical authority.

Do not reduce phone scan content or physics quality merely for performance. Measure the real bottleneck first. LOD, streaming and world partitioning are scaling tools for evidence-backed future needs, not default fixes.

## 9. Stop conditions

Stop and investigate when:

- a write would modify the wrong repo/ref or overwrite rollback history;
- owner-visible behavior would change outside declared scope;
- work starts rebuilding rig/steering assumptions that JURE should author;
- documentation/process grows faster than product value;
- a release artifact cannot be tied to exact source and rollback;
- a public root candidate contains executable JS/CSS that is not traceable to the private source build;
- a validation summary claims commands or browser execution that the recorded evidence did not actually perform;
- third-party licensing/provenance is unclear;
- routine engineering work is about to be pushed onto Jozz;
- a new branch/checkpoint is being created without a concrete isolation or rollback reason;
- an experiment starts depending on compiled-runtime text surgery instead of normal source integration.
