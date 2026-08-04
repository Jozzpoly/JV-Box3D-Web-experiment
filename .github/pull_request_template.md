## Claim

What exact source, artifact, browser, mobile, parity or public-readiness claim does this pull request test?

## Exact scope

```text
base:
head:
source/tool/asset identities:
```

List the intentionally changed subsystems. State explicitly what is not changed.

## Counterexample or negative test

Which controlled bad case must fail before this change can pass?

## Evidence

```text
SOURCE_PRESENT:
STATIC_REVIEWED:
LOCAL_NODE24_PASS:
PORTABLE_STATIC_PASS:
LOOPBACK_HTTP_PASS:
DESKTOP_BROWSER_PASS:
LAN_PHONE_PASS:
OWNER_ACCEPTED:
```

Do not mark an evidence level that was not executed on this exact head.

## Physics and input boundary

- [ ] This does not add new product physics to `legacy_ts_m6`.
- [ ] Renderer/UI code cannot mutate physics directly.
- [ ] `RELEASE` remains hands-off in the first fixed step.
- [ ] No hidden centering, stabilization, speed-sensitive control or unnamed assist was added.
- [ ] Any native-parity statement is backed by an exact native/WASM scenario comparison.

Explain any item that is not applicable.

## Lifecycle and failure behavior

- [ ] Startup failure creates zero committed partial resources.
- [ ] Runtime failure/disposal releases owned resources and active input.
- [ ] Rebuild/retry does not require a page reload unless that limitation is explicit.
- [ ] Logs and errors contain no credentials, private paths or personal data.

## Dependencies, licenses and assets

- [ ] No dependency was added, or exact version/license/bundle cost/notices were reviewed.
- [ ] No model, scan, texture, font, audio, logo or third-party asset was added, or an exact rights record is included.
- [ ] Source/private assets are not copied into the portable package.
- [ ] `THIRD_PARTY_NOTICES.md` and package validation were updated where required.

## Publication safety

- [ ] This pull request does not merge itself, change repository visibility, move the default branch, enable Pages or publish an artifact.
- [ ] Package scripts contain no hidden publish/deploy path.
- [ ] Public/history reports remain secret-safe and local unless explicitly reviewed as receipts.

## Known limitations and open decisions

List every unproven claim, owner decision and manual gate still pending.

## Owner gates

State precisely which decisions still require Jozz and the exact commit/artifact they apply to.
