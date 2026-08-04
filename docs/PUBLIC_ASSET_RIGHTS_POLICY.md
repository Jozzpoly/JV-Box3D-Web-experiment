# JV Web — public asset and scan rights policy

Updated: 2026-08-04
Status: `CANONICAL PUBLIC-ASSET POLICY`
Owner: Jozz

## 1. Purpose

A public source-code license does not automatically license models, scans, photographs, textures, audio, fonts, logos or scene data.

JV Web therefore treats code, third-party software and assets as separate legal/provenance surfaces.

No asset enters a source-public candidate or playable Pages package merely because it is technically loadable.

## 2. Asset classes

```text
OWNER_AUTHORED_SOURCE
  editable owner files such as Blender/Blockbench projects

OWNER_AUTHORED_RELEASE
  exported models/textures intentionally approved for redistribution

CAPTURE_SOURCE
  source photographs, video, drone captures, LiDAR or scan projects

DERIVED_SCAN_RENDER
  optimized visual representation derived from capture source

DERIVED_SCAN_COLLISION
  simplified physical collision representation

THIRD_PARTY_REDISTRIBUTABLE
  asset with exact license and redistribution rights

THIRD_PARTY_REFERENCE_ONLY
  asset usable for local study but not public redistribution

PRIVATE_OR_SENSITIVE
  personal, location-sensitive, contractual or otherwise non-public material
```

## 3. Default-deny rule

Unless a committed rights record explicitly says otherwise:

```text
publicReleaseAllowed = false
sourceAssetsIncluded = false
```

Unknown origin, uncertain ownership or missing license is a publication blocker, not a reason to assume fair use or implied permission.

## 4. Required rights record

Every public release asset requires a record containing:

```text
assetId
assetRole
sourceKind
sourceOwner
copyrightHolder
licenseOrPermissionId
publicReleaseAllowed
modificationAllowed
commercialUseAllowed
attributionText
sourceAssetsIncluded
locationSensitiveMetadata
personalDataPresent
exact file paths
bytes and SHA-256
conversion/export tool and version
known limitations
ownerApprovalCommit
```

The record must distinguish facts from assumptions. Empty legal fields do not mean permission.

## 5. Owner-authored models

Before publication, confirm:

- Jozz created the geometry or controls the rights;
- no copied game model, texture, logo or trademarked livery is embedded;
- fonts and decals have separate permission;
- source project metadata does not expose local paths, usernames or private references;
- export contains only intended meshes/materials/animations;
- release rights are explicit even when source files remain private.

Owner-authored does not automatically mean every source file should be public.

## 6. Scans and source captures

Source captures remain outside the public repository by default.

Audit before any release:

- ownership of the captured location/object;
- permission to capture and redistribute;
- visible people, faces, license plates, addresses and documents;
- GPS/EXIF/location metadata;
- neighboring private property;
- trademarks, artwork or copyrighted signage;
- drone-flight and site-access conditions;
- contract or platform restrictions;
- whether the public scene reveals a sensitive real-world layout.

Required separation:

```text
CAPTURE_SOURCE
→ private working storage
→ reviewed conversion
→ DERIVED_SCAN_RENDER
→ DERIVED_SCAN_COLLISION
→ public scene package only after approval
```

Removing EXIF alone is not a complete privacy review; geometry and textures may still reveal location or personal information.

## 7. Third-party assets

Every third-party asset needs:

- exact source URL or immutable receipt;
- creator/rightsholder;
- exact license text/version;
- redistribution and modification permissions;
- attribution requirements;
- commercial-use and share-alike conditions;
- file/hash identity;
- compatibility with the project's intended distribution.

A marketplace download, search result, social-media upload or asset found inside another project is not sufficient provenance.

`THIRD_PARTY_NOTICES.md` currently covers software dependencies only unless an asset section is added explicitly.

## 8. Fonts, audio and branding

High-risk categories:

- fonts often have embedding/redistribution terms separate from ordinary file use;
- music and sound effects may require attribution or prohibit redistribution;
- vehicle brands, logos and liveries may raise trademark or design-right questions;
- the names `JV`, `Jozz Vehicle` and future logos are not granted as trademarks merely because code is open sourced.

The public package should prefer owner-authored or clearly permissive resources with exact receipts.

## 9. Repository and build boundaries

Private/source asset workspaces are never build inputs by implicit directory scanning.

The public build consumes only assets declared by:

```text
portable build manifest
→ runtime asset declaration
→ scene manifest
→ scene file table
→ rights record
```

A file absent from the declared chain must not be copied into `dist/`.

The build must reject:

- absolute source paths;
- `..` and escaping paths;
- undeclared files;
- symlinks;
- source maps containing private paths;
- embedded private URLs;
- rights records with `publicReleaseAllowed=false` during public packaging;
- payload/hash drift.

## 10. Public-code versus public-asset licenses

Possible policy:

```text
JV Web source code: one owner-selected software license
owner assets: separate asset license or all-rights-reserved notice
third-party assets: their exact original licenses
source scans: not distributed
```

Do not place all files under the root software license by implication. README, release receipts and asset records must state exclusions clearly.

## 11. Real-scan acceptance ladder

```text
FILES_RECEIVED_PRIVATELY
→ FORMAT/INTEGRITY AUDIT
→ RIGHTS/PRIVACY CLASSIFICATION
→ SOURCE KEPT OUTSIDE PUBLIC TREE
→ COORDINATE/UNIT CONVERSION
→ RENDER DERIVATION
→ COLLISION DERIVATION
→ METADATA SCRUB + VISUAL PRIVACY REVIEW
→ DESKTOP PACKAGE PASS
→ PHONE PACKAGE PASS
→ OWNER DRIVE ACCEPTED
→ PUBLIC RIGHTS RECORD APPROVED
→ PUBLIC SCENE RELEASE ALLOWED
```

No technical success can skip the rights/privacy stages.

## 12. Stop conditions

Publication stops when:

- ownership or redistribution permission is uncertain;
- a person, plate, address or private document remains visible;
- GPS/EXIF or sensitive location context is unresolved;
- source scans are accidentally staged;
- a marketplace/third-party license cannot be reproduced exactly;
- attribution cannot be satisfied inside the package;
- a font, logo, sound or texture lacks a rights record;
- the public build contains undeclared files;
- asset hashes differ from approved records;
- Jozz has not approved the exact release bytes.

## 13. Current state

```text
public project code license: pending ADR-0005 owner decision
third-party software notices: present
public art assets on active candidate: none intentionally approved
real scan files: not yet received into the project workflow
public scene package: not yet created
asset rights inventory: required before first asset-bearing release
```
