# JV Web — operating contract

Updated: 2026-08-26
Owner: Jozz

JV Web is the browser product line for Jozz Vehicle. It must remain useful, enjoyable to drive, stable on desktop and phone, and practical as an R&D surface.

## 1. Authority

- Live `main` of `Jozzpoly/JV-Box3D-Web-experiment` is accepted source/product authority.
- `Jozzpoly/JV-Box3D-Web-Public/main` is accepted Friends/public artifact authority, not source authority.
- `preview/owner-control` is the permanent operational Owner Preview control lane, not product source authority. `preview/owner.json` identifies one exact executable source commit and may pin approved static layers with separate provenance.
- Git/current source, executed evidence and direct Owner observation outrank stale docs, branch names and conversation history.
- `docs/PROJECT_STATE.md` owns current routing. During explicit takeover, read `docs/HANDOFF.md` immediately after it.
- A new chat, executor or model context does not authorize a takeover rewrite, new branch family, new gates, schema, abstraction or runtime slice.

Owner acceptance is scoped. A working Pages build does not make provisional tuning, rig geometry, handling or UI final truth.

## 2. Protected accepted product capital

Preserve unless the current task explicitly changes it:

- Plac E2R, Offroad and approved JSPREV2;
- current owner-vehicle visual package;
- Camera Manual Rig V1 and Fullscreen V1;
- accepted mobile composition;
- Direct Rotation / Relative-X steering interaction foundations, with final tuning open;
- absolute-position analog throttle/brake using pointer-down acquisition geometry;
- independent throttle/brake pointer ownership and simultaneous use;
- steering + pedal multitouch;
- D/R explicit pointer ownership/lifecycle while other continuous controls remain held;
- fail-closed pointer/lifecycle behavior;
- browser tap-highlight suppression on custom mobile driving controls;
- desktop/mobile capability hygiene;
- accepted wide fine-pointer desktop HUD cleanup;
- accepted Samsung Galaxy A53 / Chrome render-1x scan boundary;
- exact-source Owner Preview and static-layer provenance discipline.

These are stability boundaries, not permanent implementation architecture. A later focused redesign may replace them when it produces a materially better evidence-backed result.

Pedal Contact + Mechanical Feedback V1/V1.1 is **NOT ACCEPTED / DEFERRED**. Do not recover, merge or resume it by default.

## 3. Program roles and inheritance

- **JV-Web** — priority heir/product.
- **JV_CORE / Native** — sealed primary donor/research record; active development stopped. Do not port it 1:1 and do not reopen it without a specific unresolved Web decision.
- **JURE** — optional authoring/mechanical-truth donor and current useful inspection/correction tool. It is not a mandatory JV-Web dependency and is not frozen as the final authoring application/schema.
- **Codex** — future repo-native executor after the pre-Codex analysis/handoff is coherent. It may challenge implementation technique and report contradictions, but it may not silently override live evidence, scoped Owner truth, the selected experiment question or its result semantics.

Inheritance order:

`Owner product truth -> portable mechanical/semantic truth -> candidate technique -> legacy code/defaults/docs`.

Primary donor does not win automatically.

## 4. Current next-generation routing

Gate 7 selected the first next-generation falsifier:

`FRONT-CORNER-AUTHORITY-ISOLATION-01`

Classification:

`M1 STRUCTURAL FALSIFIER / CONTROL-EQUIVALENCE PROBE / NOT PRODUCT-MECHANICS ACCEPTANCE`

The exact experiment contract is `docs/FIRST_FALSIFIER.md`. It supersedes older FMU01-first routing.

`Front Mechanical Unit 01` is **not** the selected first implementation stage. Do not begin FMU reconstruction, improve the current FL mechanics, resolve coordinates by guessing, or freeze a consumer/lowering contract as part of the selected isolation probe.

Current sequence is owned by `docs/PROJECT_STATE.md`:

- Gates 0-8 evidence reconstruction, architecture comparison, falsifier selection and responsibility boundary — complete;
- final pre-Codex source/document close + canonical validation — current;
- read-only Codex cold takeover;
- implementation only after that reconstruction passes.

A JURE -> Web lowering/space-conversion receipt is **not a pre-Codex freeze requirement**. Pre-Codex work freezes truth, constraints, provenance, negative knowledge, selected experiment semantics and remaining unknowns. The future consumer/lowering architecture remains challengeable.

## 5. Authored truth / runtime boundary

Portable high-confidence constraints currently include:

- mechanical relations are first-class;
- each relation endpoint owns independent local-frame truth;
- coherent mechanical units must not mix incompatible partial geometry authorities;
- real front roles include chassis / upper arm / lower arm / knuckle-upright / wheel plus rack-knuckle steering relation;
- do not invent an additional physical carrier body because an authoring representation uses `carrier` terminology;
- authored/neutral truth must remain separable from runtime dynamics, contact and solver policy;
- source provenance and deterministic persistence/relink are valuable requirements for authored truth;
- visual binding metadata or convenience parenting is not mechanical authority.

JURE may provide authored neutral evidence, but JV-Web remains the consumer/falsifier and owns runtime identities, dynamics, controls, rendering integration and browser product behavior. Equivalent future authored truth may come from another replaceable tool if evidence supports it.

Do not guess coordinates, units, basis, handedness, transforms, relation semantics or source identity on behalf of an authoring source.

## 6. Current technical-debt boundary

Known recipient challenge surfaces include the `legacy_ts_m6` reference backend, drivetrain semantic mismatch, legacy split-sphere contact, procedural wishbones, provisional FL steering registration, temporary FR symmetric bridge, provisional rack/full-lock mapping, and the separation between R3 visual calibration and physical authority.

These are not an automatic repair queue. The selected first falsifier is structural isolation/equivalence, not permission to repair any of these mechanics.

Tool/helper failure is not product failure. Do not create cleanup/tooling campaigns unless their result can change the decision of the current slice.

## 7. Selected-falsifier responsibility boundary

This section freezes **responsibility and authority to judge**, not future vehicle architecture or implementation API.

### Orchestrator responsibilities

The orchestrator owns:

- preserving the exact selected question, protected baseline and causal scope;
- deciding whether evidence answers the selected question rather than a nearby easier question;
- interpreting the final result as `PASS`, `FAIL` or `INCONCLUSIVE` according to `docs/FIRST_FALSIFIER.md`;
- rejecting hidden scope expansion, framework tax or semantic reinterpretation;
- deciding post-result routing and whether a competing hypothesis must be reopened;
- re-grounding live authority when source/ref/evidence drift invalidates assumptions.

The orchestrator must not prescribe a concrete file layout, API shape or refactor technique merely to retain control. Those are executor decisions unless they change the experiment semantics.

### Codex / repo-native executor responsibilities

The repo-native executor owns normal engineering execution:

- inspect the live source and relevant tests before changing code;
- choose the smallest coherent implementation/refactor technique that satisfies the experiment contract;
- write and modify source and focused tests;
- reproduce baseline evidence, create the smallest useful structural RED, reach causal GREEN, debug failures and run validation proportional to the actual diff;
- perform Git/source analysis, build/CI/toolchain troubleshooting and exact diff review;
- report evidence that suggests the selected boundary is intrinsically too small or the assumptions are wrong.

The executor may challenge implementation assumptions. It may **not** unilaterally:

- change the selected question or PASS/FAIL/INCONCLUSIVE semantics;
- widen the slice from structural control-equivalence into improved vehicle mechanics;
- select A1 or A2 as permanent authority architecture;
- hide a boundary failure behind a generic backend/plugin/ontology/adapter framework;
- guess unresolved mating or authored truth;
- ask the Owner to accept a behavior delta in order to make a structural-equivalence probe pass.

If a materially wider authority unit appears necessary, record the coupling and stop for orchestration judgement rather than silently widening scope.

### Machine-evidence authority

For `FRONT-CORNER-AUTHORITY-ISOLATION-01`, machine evidence is sufficient to judge the intended no-behavior structural result when it covers the causal question. It may establish:

- owned construction and teardown boundaries;
- explicit cross-unit references versus leaked/duplicated authority;
- topology and trace equivalence;
- deterministic command/trace behavior at existing asserted precision;
- focused regression controls;
- typecheck/build status;
- exact diff scope;
- faithful clean-source browser startup/control-path smoke.

A passing build alone is not proof of the structural boundary. Conversely, unrelated helper/toolchain failure is not evidence that M1 failed.

### Owner responsibilities

Jozz owns vision, priorities and genuinely Owner-visible qualitative truth.

Owner judgement is required when the work actually introduces or discovers:

- a visible presentation change that must be accepted rather than treated as regression;
- a driving/handling/interaction feel decision;
- real-device-only evidence that machine/browser automation cannot resolve;
- unresolved authored mechanical truth such as a physical mating choice;
- a strategic scope/priority decision outside the selected falsifier.

Do **not** route ordinary engineering work to the Owner: TypeScript/compiler errors, Git, Box3D API use, tests, CI, build failures, refactor technique, ownership bookkeeping and toolchain troubleshooting remain executor/orchestrator responsibilities.

### Result semantics are not negotiable during execution

- `PASS` means only that front-corner structural isolation is viable enough to continue M1-style evidence gathering at this granularity.
- `FAIL` means this front-corner granularity is not a trustworthy low-blast migration boundary under the experiment contract; it does not automatically select A2.
- `INCONCLUSIVE` means an unrelated execution/source/environment blocker prevented the architecture question from being answered; it is not product/mechanical evidence.

The executor reports evidence. The result is classified against the pre-existing contract; criteria must not be weakened after seeing the outcome.

## 8. Work style

Default loop:

`small need -> smallest meaningful source change -> check matching causal blast radius -> render/device evidence only when causally relevant -> Owner judgement only when genuinely qualitative -> next iteration`.

Use only checks that cover changed risk. Full canonical validation is for foundation/toolchain/integration boundaries, milestone close and release. A passing build does not replace browser/device evidence for visible work, and visible/device evidence is not required for a purely structural no-behavior change unless behavior actually changes.

Avoid speculative abstractions. Do not mix product redesign, recovery, delivery-harness invention and cleanup into one slice.

## 9. Git discipline

Resolve repo/ref before writes. Use normal fast-forward history; no routine force pushes.

Keep at most one ordinary active product work lane ahead of `main`. Create another branch/checkpoint only for a concrete isolation/rollback reason, not per chat/agent/tiny feature.

`preview/owner-control` is special operational infrastructure and does not count as an ordinary product lane.

Historical `work/*`, checkpoint and accidental/noop refs are not authority. Do not revive or clean them merely because their names are visible.

## 10. Preview and release discipline

Owner Preview is an R&D/testing surface produced from one exact committed executable source candidate. It is not accepted source/release authority.

- exact executable SHA must remain explicit;
- preserved static layers retain separate exact provenance;
- failed candidate/static validation must fail closed;
- do not patch compiled Preview JS/CSS as source integration;
- Friends/Public promotion is separate from source acceptance.

Do not promote `FRONT-CORNER-AUTHORITY-ISOLATION-01` to Owner Preview/Public merely to prove structural isolation.

## 11. Documentation discipline

Fresh executor:

1. `AGENTS.md`;
2. `docs/PROJECT_STATE.md`;
3. `docs/FIRST_FALSIFIER.md` when the selected experiment is relevant;
4. relevant source/tests.

Explicit takeover additionally reads `docs/HANDOFF.md` immediately after `PROJECT_STATE`.

Supporting evidence:

- `docs/ARCHITECTURE_HYPOTHESES.md` — Gate 6 authority/migration comparison; no architecture winner;
- `docs/INHERITANCE_MATRIX.md` — Gate 5 decision synthesis; later current-state corrections outrank stale wording;
- `docs/NEXT_GENERATION_TAKEOVER_LOOP_2026-08-25.md` — rationale and staged loop;
- `docs/RECIPIENT_SURFACE.md` — Recipient V1 evidence map; phase-status is historical;
- `docs/donors/JV_CORE_DONOR_SEAL_2026-08-25.md` — canonical Native closure receipt;
- `docs/OWNER_CHECKPOINTS.md` — scoped Owner acceptance;
- `docs/ARCHITECTURE.md` — stable current boundaries, not a future architecture freeze.

Update stale current-state text instead of multiplying new current-status documents.

## 12. Stop conditions

Stop and re-ground or return to orchestration when:

- a write would target the wrong repo/ref or overwrite rollback history;
- live source no longer matches the experiment assumptions;
- runtime implementation begins before current routing authorizes it;
- the selected falsifier is being broadened into new product mechanics, FMU reconstruction or whole-core rewrite;
- a materially wider authority unit is required to proceed;
- PASS would require changing existing behavior or loosening control evidence;
- PASS is being interpreted as acceptance of current FL geometry/carrier/contact/steering or as selection of A1;
- FAIL is being interpreted automatically as selection of A2;
- unresolved mating/coordinates are being guessed;
- JURE or another tool becomes mandatory without evidence;
- a donor implementation is promoted because of its label rather than its evidence;
- accepted controls/UI/world capability changes outside declared scope;
- an unrelated tooling failure is being classified as mechanical evidence;
- documentation/process/tooling grows faster than product/evidence value;
- an artifact cannot be tied to exact source and provenance;
- routine engineering work is being pushed onto Jozz.
