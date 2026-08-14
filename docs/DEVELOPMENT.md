# Developing JV Web

Updated: 2026-08-14

## Toolchain

```text
Node 24.16.0
npm >=11.13.0 <12
TypeScript 7.0.2
Vite 8.1.5
box3d.js 0.0.2
```

The Node line is exact. npm may move within supported 11.x; do not fail ordinary work merely because global npm has a newer supported 11.x release.

## Fast local loop

```text
npm ci
npm run dev -- --host 0.0.0.0
```

For an ordinary code slice, run the smallest relevant test file:

```text
npm test -- tests/<relevant>.test.mjs
```

The test runner still compiles the shared TypeScript test target first, then runs only the requested test files. `npm test` with no file arguments remains the full suite.

Use `npm run typecheck` when TypeScript boundaries changed. Use full `npm run check` for foundation/schema/toolchain changes, major integration checkpoints or before a release — not automatically after every small visual/product edit.

## Product loop

Preferred rhythm:

1. state one visible/mechanical question;
2. make the smallest attributable change;
3. run the smallest check that can falsify it;
4. render/drive it when the claim is visual/runtime/feel-related;
5. ask Jozz only for the part automation cannot judge;
6. integrate accepted work into `main` rather than accumulating transaction branches.

A green test is supporting evidence, not owner acceptance and not product value by itself.

## Friends scan development

Local/new-scan Friends builds use:

```text
JOZZ_SCAN_PREVIEW_PACK=<exact approved pack>
npm run build:friends-r1
```

The current approved public scan may be reused unchanged for code-only Friends hotfixes. Do not re-copy/re-export 111 MB of scan data merely to change frontend code when the release can safely carry forward the exact published scan receipt/index/payload.

When a release changes the scan, validate the new exact pack identity and public payload.

## Public release rules

- private `main` is source authority;
- public repo contains generated release artifacts;
- `release/r0` is immutable rollback/history;
- `release/friends-r1` is the current Friends Pages line;
- use normal fast-forward publication and verify the resulting public SHA;
- Pages settings normally remain pointed at `release/friends-r1` after the first switch;
- code-only pushes to that branch should trigger Pages rebuild automatically.

If Jozz must perform an owner-side action, make it one clear UI/device action. Do not turn routine release mechanics into repeated manual packets unless the environment genuinely leaves no other path.

## Owner vehicle

Current generated owner package:

```text
npm run generate:owner-full-rig-r3
```

Do not manually edit generated output. Do not use current visual mating as authority for unresolved rig geometry; JURE is the future authoring path.

## Documentation

Ordinary development should not require editing multiple status files. Update `docs/PROJECT_STATE.md` only when the project boundary/phase actually changes. Update `AGENTS.md` only for durable operating rules.

Historical recovery/handoff documents are cold evidence and should not be expanded during normal feature work.
