# JV Web

JV Web is the browser product line for Jozz Vehicle: a driveable desktop/mobile build used both as an R&D surface and as the source for accepted public Friends artifacts.

## Authority and publication

```text
Jozzpoly/JV-Box3D-Web-experiment
  public source / development / accepted main
  preview/owner-control -> Owner Preview Pages control lane

Jozzpoly/JV-Box3D-Web-Public
  accepted Friends artifact / release main
```

Source `main` is accepted source/product authority. `preview/owner-control` is an operational deployment lane only: `preview/owner.json` pins one exact executable source candidate and may additionally pin explicitly approved static artifact layers with separate provenance. A candidate being live on Owner Preview does not make it accepted product truth.

Owner Preview V2 keeps executable and preserved-data authority separate. The executable may be accepted `main` or a scoped experimental source candidate; the already-approved JSPREV2 scan is composed from an exact accepted Friends/Public commit and validated against its release receipt. Preserved static data never becomes source authority.

`Jozzpoly/JV-Box3D-Web-Public/main` remains accepted Friends artifact/release authority, not source authority. Source acceptance and Friends release acceptance are separate decisions.

Owner Preview Pages is the default iterative Owner-testing surface. It should preserve accepted capabilities unrelated to the active experiment unless an omission is deliberate, explicit and scoped. ZIP/local-Windows preview is forensic/emergency fallback only.

Rig authoring belongs to the separate Jozz Universal Rig Editor (JURE). JV Web consumes explicit authored neutral truth through `docs/contracts/JURE_CONSUMER_BOUNDARY.md`; it must not grow a second rig editor.

## Current product direction

Accepted source `main` contains:

- dual-mode steering foundation: `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X`, with final tuning open;
- absolute-position analog pedal foundation: current pointer Y maps directly inside pedal geometry frozen at pointer-down, with final neutral/contact-zone, value-curve and mechanical-feedback tuning open;
- independent throttle/brake ownership and fail-closed lifecycle behavior;
- existing core D/R command/sign semantics.

The next functional control problem is D/R multitouch acquisition. Owner real-device testing showed that D/R does not switch reliably while throttle remains held. Source evidence localizes the weak boundary to click-dependent acquisition rather than drivetrain semantics; treat it as a focused input/lifecycle problem.

The current Friends artifact predates the later steering and pedal source integrations. Do not infer that source `main` and Friends/Public are at feature parity.

Exact moving anchors and the current active lane belong in `docs/PROJECT_STATE.md`, not here.

## Canonical toolchain

```text
Node 24.16.0
npm >=11.13.0 <12
TypeScript 7.0.2
Vite 8.1.5
box3d.js 0.0.2
```

For source work:

```text
npm ci
npm run dev -- --host 0.0.0.0
```

Use checks proportional to causal blast radius. Use full `npm run build` for foundation/integration boundaries and accepted releases, not routine polish. User-visible work still needs rendered/browser/device evidence; a passing build is not Owner acceptance.

## Start here

A fresh agent normally reads:

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. source/tests needed for the selected task

During explicit takeover/handoff, read `docs/HANDOFF.md` immediately after `docs/PROJECT_STATE.md`.

Then, only when relevant:

- `docs/ARCHITECTURE.md` — stable system boundaries;
- `docs/OWNER_CHECKPOINTS.md` — scoped Owner acceptance;
- `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` — durable mobile-control/polish intent and falsifiers;
- `docs/contracts/JURE_CONSUMER_BOUNDARY.md` — JURE/JV ownership.

`AI_PROJECT_MEMORY.md` is a compact router. Dated audits and old Git refs are historical evidence, not current instructions.

## Workflow

Prefer:

`small need -> smallest coherent source change -> causal check -> Owner Preview Pages -> faithful render/device proof -> Owner judgement -> continue`

Use temporary branches/checkpoints only for a concrete isolation or rollback need. Do not create process machinery merely because a new agent, conversation or small polish iteration exists.

Third-party notices are in `THIRD_PARTY_NOTICES.md`.
