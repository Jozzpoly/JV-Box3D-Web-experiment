# Security policy

JV Web is an experimental browser project, not a production online service.

The authoritative source repository `Jozzpoly/JV-Box3D-Web-experiment` is public. Treat every committed source file, issue, pull request, workflow and repository artifact as potentially immediately public. `Jozzpoly/JV-Box3D-Web-Public` remains the accepted Friends/public artifact repository, but public source visibility means it is no longer a confidentiality boundary.

## Do not publish sensitive material

Do not commit or publish credentials, access tokens, private keys, personal data, private asset URLs, unpublished sensitive scans, exploit details or other secrets to either repository.

If a sensitive value is required for an unavoidable platform operation, use the platform's appropriate secret mechanism and keep it out of Git history, logs and generated public artifacts.

## Reporting

Report a suspected vulnerability to Jozz through an already-established private channel. If no private channel is available, publish only a minimal non-sensitive request to establish one; do not include exploit details in that request.

A useful private report includes:

- exact source commit and, when relevant, Preview/Friends build identity;
- affected browser, operating system and device;
- impact and minimal reproduction;
- whether local files, credentials, camera, location, network or cross-origin data are involved;
- a sanitized log excerpt when useful.

## Evidence boundary

A lack of GitHub security alerts is not proof that a revision is secure. Dependency, code and release-security claims must identify the checks that actually ran.

The August 2026 publish-readiness audit found no credential/private-key/password/API/local-path/email blockers in the live source/unique active branches and recent inspected history, but it was not an exhaustive every-blob forensic secret scan. Do not promote that scoped result into a universal claim about all repository history.

## Fix and release discipline

Security fixes belong in normal source and must be rebuilt/validated before a corrected Preview or accepted Friends artifact is published. Do not patch compiled public JavaScript/CSS as the normal remediation path.

Owner Preview is an R&D/testing surface and does not by itself constitute accepted release authority. The accepted Friends artifact repository remains separate from source acceptance.

There is currently no guaranteed response-time SLA.
