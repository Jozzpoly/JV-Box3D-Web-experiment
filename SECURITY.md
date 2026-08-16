# Security policy

JV Web is an experimental browser project, not a production online service.

The authoritative source repository is intentionally private. Public deployment artifacts live separately in `Jozzpoly/JV-Box3D-Web-Public`; making the public artifact available does not make this source repository a public disclosure channel.

## Reporting

Do not publish credentials, private keys, personal data, private asset URLs, unpublished scans, exploit details or sensitive reproduction data in a public issue, pull request or public artifact repository.

Report a suspected vulnerability to Jozz through an already-established private channel. If no private channel is available, publish only a minimal non-sensitive request to establish one; do not include exploit details in that request.

A useful private report includes:

- exact private commit or public build identity;
- affected browser, operating system and device;
- impact and minimal reproduction;
- whether local files, credentials, camera, location, network or cross-origin data are involved;
- a sanitized log excerpt when useful.

## Evidence boundary

A lack of GitHub security alerts is not proof that a revision is secure. Dependency, code and release-security claims must identify the checks that actually ran. Current project gates use explicit dependency/build/runtime evidence where relevant.

Security fixes belong in the private source repository and must be rebuilt/validated before a corrected public artifact is promoted. Do not patch compiled public JavaScript/CSS as the normal remediation path.

There is currently no guaranteed response-time SLA.
