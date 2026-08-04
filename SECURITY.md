# Security policy

## Current project status

JV Web is an experimental browser demonstrator and research repository. It is not yet a production service, hosted game or security-hardened public release.

The repository is currently private and GitHub Pages is disabled. This policy prepares the repository for later public visibility; it does not announce that a public service exists.

## Supported versions

Before the first tagged public release, only the exact current source-public candidate identified in `docs/PROJECT_STATE.md` is considered for security review.

Historical branches, quarantined pull requests, experimental receipts and old generated artifacts are preserved as evidence but are not supported release lines.

After releases exist, this section must be replaced with an explicit supported-version table.

## Reporting a vulnerability

Do not place any of the following in a public issue, pull request, discussion, screenshot or log excerpt:

- credentials, tokens or private keys;
- personal or location-sensitive data;
- exploit details that would create immediate risk;
- private asset URLs;
- unpublished source scans or photographs;
- repository secrets or environment contents.

When the repository becomes public, use GitHub's **Report a vulnerability** function on the repository Security page if private vulnerability reporting is enabled.

If that function is not available, open only a minimal non-sensitive issue asking the owner for a private reporting channel. Do not include exploit steps or secret material in that issue.

## What to include privately

A useful report contains:

- affected exact commit, tag or Pages deployment identity;
- browser, operating system and device;
- concise impact statement;
- minimal reproduction;
- whether the issue requires user interaction;
- whether credentials, local files, camera, location or cross-origin data are exposed;
- any temporary mitigation;
- confirmation that the report contains no unrelated personal data.

## Response expectations

JV Web currently has no guaranteed response-time or remediation SLA. The owner may acknowledge, investigate, request clarification, reject or defer a report according to project capacity and demonstrated impact.

Public disclosure should wait until the owner has had a reasonable opportunity to investigate and prepare a fix.

## Security boundaries

The project treats these as separate surfaces:

```text
source repository
portable build artifact
GitHub Pages deployment
browser runtime
WASM/native boundary
mobile input host
scene/scan assets
third-party dependencies
```

A finding on one surface does not automatically establish impact on every other surface.

## Known non-security limitations

The following are known engineering limitations and should not be reported as vulnerabilities unless they produce a concrete security impact:

- `legacy_ts_m6` is not native JV parity;
- driving feel and physics differences;
- unapproved RATE profiles;
- visual observer simplifications;
- missing mobile UI;
- bundle-size warnings;
- absent Pages deployment;
- incomplete scene/scan integration.

## Maintainer checklist before public visibility

- enable private vulnerability reporting after the repository becomes public;
- verify security-notification settings;
- confirm that this file is visible on the default branch;
- review Dependabot and code-scanning settings without creating unwanted workflow cost;
- verify no secret or private asset exists in current/history/cloud surfaces;
- document supported versions after the first release;
- test the private-reporting path without publishing sensitive content.
