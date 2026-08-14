# JV Web — operating contract

Updated: 2026-08-14
Owner: Jozz

JV Web is the browser product line for Jozz Vehicle. The current product goal is simple: a public build that is useful and enjoyable to launch, drive and show on desktop and phone, while remaining a practical R&D surface for later improvements.

## 1. Current authority

- `main` is the accepted private source/product authority.
- `Jozzpoly/JV-Box3D-Web-Public` is an artifact/publication repository, not the source of product semantics.
- `release/r0` is immutable rollback/history.
- `release/friends-r1` is the current live Friends Pages line.
- Git/current source, reproducible runtime evidence and direct owner observation outrank stale documentation or historical branch names.

Owner acceptance is always scoped. A working Friends build does not make provisional steering, rig geometry or handling final truth.

## 2. Accepted Friends baseline

Preserve unless the current task explicitly changes it:

- default start: Plac E2R;
- Offroad is available and driveable;
- full approved JSPREV2 scan is public and selectable on desktop and phone;
- Pages project-path/subpath delivery works;
- current owner vehicle visual package loads and drives;
- debug is limited and closed by default;
- location switching by reload is acceptable for this release;
- the temporary symmetric front/drive bridge is good enough to keep product work moving.

Known debt is not a blocker for this baseline:

- phone camera/framing and some responsive UI need work;
- full scan is heavy on phone and currently acts as an intentional stress test;
- final rig, lower wishbone/mating, steering physics/back-drive and final handling are not accepted.

## 3. JURE boundary

Rig authoring belongs in the separate Jozz Universal Rig Editor (JURE) line. JV Web should consume explicit authored outputs later; it should not grow another temporary rig editor or keep guessing hardpoints/frames to repair current visuals.

Do not revive the old `R1-STEER-COUPLING-01` research task as the default next step. Final steering/rig work waits for better authored geometry unless new evidence gives a narrower reason.

## 4. Work style

Jozz defines vision, priorities and owner-visible acceptance. The agent is responsible for programming, repository work, technical analysis and release mechanics.

Do not ask Jozz to apply patches, run terminal commands or debug engineering machinery that the agent can handle. Ask for owner intervention only when it is genuinely irreplaceable: visual/feel/device judgement, an inaccessible file, or one unavoidable owner-side platform action.

Prefer:

`small need -> small vertical slice -> smallest relevant check -> owner-visible result -> continue`

Do not build process for its own sake. Tests, manifests, scripts and documentation are tools to reach product truth; they are not product value by themselves.

For ordinary changes run only the checks that cover the changed risk. Full validation is for foundation/schema/toolchain changes, major integration boundaries and public releases.

## 5. Documentation discipline

Fresh work should normally need only:

1. `AGENTS.md`;
2. `docs/PROJECT_STATE.md`;
3. source/tests for the current task.

`AI_PROJECT_MEMORY.md` is a compact router, not a second project history.

Historical campaign notes, old handoffs, recovery documents and archived branch evidence are cold evidence. Open them only for a named historical question. Do not create dated handoff stacks, RFC chains or parallel roadmaps for ordinary work. Update or remove stale current-state text; Git keeps history.

## 6. Git and branch discipline

Resolve repo/ref before writes. Use normal fast-forward history; no routine force pushes.

Temporary branches require a concrete isolation reason. Do not create branches per agent or conversation. Prefer integrating accepted work into `main` and retiring the transaction branch.

Old branch names such as `golden` do not establish authority.

## 7. Release discipline

Public releases are built artifacts from accepted private source.

- Never rewrite `release/r0`.
- Code-only Friends hotfixes may carry forward the already-published exact scan.
- A release that changes the scan must pin and validate the new exact approved scan input.
- Do not treat HTTP transport metadata such as compressed `Content-Length` as integrity of decoded scan bytes; validate the actual downloaded payload and format.
- Keep rollback straightforward and verify the exact public commit after publication.

## 8. Product boundaries

The browser Box3D vehicle is the current Web implementation, not proof of native JV parity or final vehicle physics.

Do not silently convert visual calibration, historical M5/M6 values, secondary contracts or convenience tests into mechanical authority.

Do not disable the phone scan merely because it is slow; measure first and optimize the real bottleneck. Do not add LOD, streaming or complex architecture before simpler evidence-backed wins are exhausted.

## 9. Stop conditions

Stop and investigate when:

- a write would modify the wrong repo/ref or overwrite rollback history;
- a change would alter an owner-accepted visible behavior outside declared scope;
- a task starts rebuilding rig/steering assumptions that JURE is intended to author;
- validation/documentation machinery grows faster than product value;
- a release artifact cannot be tied to exact source and rollback;
- third-party licensing/provenance is unclear;
- the agent is about to push routine programming work onto Jozz.
