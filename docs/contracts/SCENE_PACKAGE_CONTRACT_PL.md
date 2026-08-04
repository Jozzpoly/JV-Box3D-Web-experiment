# JV Web — kontrakt pakietu sceny v0

Updated: 2026-08-04
Status: `ACTIVE CONTRACT / IMPLEMENTATION NOT STARTED`
Owner: Jozz

## 1. Cel

Ten sam seam obsługuje:

- mały synthetic test course;
- późniejszy centralny campus;
- przygotowany skan realnego miejsca;
- lokalny/LAN build;
- przyszły publiczny Pages release.

Zmiana sceny nie może wymagać przebudowy pojazdu, inputu ani hosta. Pakiet sceny jest danymi i kontraktem, nie miejscem dla mechaniki pojazdu.

## 2. Trzy odrębne reprezentacje

```text
source scan
  pełny materiał roboczy/provenance
  nie trafia automatycznie do release

render representation
  uproszczone meshe, materiały, tekstury, LOD/chunks

collision representation
  jawny proxy fizyczny, bez szumu fotogrametrii
```

Ten sam surowy mesh nie jest domyślnie renderem i colliderem. Użycie source mesh jako collidera wymaga nazwanego eksperymentu, kosztu, contact receipt i owner decyzji.

## 3. Coordinate contract

Runtime scene coordinates:

```text
units: metres
handedness: right-handed
world up: +Y
horizontal plane: XZ
quaternion order: x, y, z, w
angles in files: radians unless field suffix says _deg
```

Świat nie ma globalnego „forward”. Każdy spawn posiada position i quaternion. Chassis-local `+X` pozostaje markerem przodu pojazdu, ale nie definiuje osi świata.

Importer musi jawnie konwertować osie i skalę źródłowego skanu. Nie wolno zgadywać `cm/mm/m` z rozmiaru modelu.

## 4. Pakiet release

```text
scenes/<sceneId>/
  scene-manifest.json
  render/
  collision/
  textures/
  optional metadata/
```

Source scan, projekty DCC, fotografie, cache i pliki robocze pozostają poza release package, chyba że osobna decyzja Jozza mówi inaczej.

Wszystkie wewnętrzne ścieżki są względne wobec `scene-manifest.json`, nie wobec domeny.

## 5. Manifest v0

Minimalny logiczny model:

```text
schemaVersion
sceneId
sceneRevision
contentSha256
coordinateSystem
sourceProvenance
releasePolicy
spawnPoints[]
resetPolicy
playableBounds
renderVariants[]
collisionAsset
materials[]
files[]
knownLimitations[]
```

### Identity

```text
schemaVersion = 0
sceneId = trwała semantyczna nazwa
sceneRevision = jawny numer/ID rewizji
contentSha256 = hash kanonicznego payloadu manifestu
```

Nazwa pliku ani folderu nie zastępuje identity.

### Source provenance

Publiczny manifest może zawierać:

```text
sourceKind
capture/import date
conversion tool/version
coordinate conversion summary
owner/rights classification
```

Nie zawiera prywatnych lokalnych ścieżek, danych GPS ani pełnej listy source photos, jeżeli nie są jawnie przeznaczone do publikacji.

### Release policy

Każdy pakiet deklaruje:

```text
publicReleaseAllowed: boolean
sourceAssetsIncluded: boolean
licenseOrRightsId
containsLocationSensitiveMetadata: boolean
```

`publicReleaseAllowed=false` jest twardym blockerem publikacji, ale nie lokalnego testu.

## 6. File table

Każdy release file posiada:

```text
path
role
bytes
sha256
mediaType
optional decodedMemoryEstimateBytes
```

Role:

```text
RENDER_MESH
COLLISION_MESH
TEXTURE
MATERIAL_DATA
SCENE_METADATA
```

Niedozwolone:

- absolute paths;
- `..`;
- backslash w wire path;
- query/fragment;
- symlink;
- plik poza sceną;
- brak rekordu hash dla runtime assetu.

Top-level portable manifest deklaruje `scene-manifest.json` jako runtime asset, a scene manifest odpowiada za wewnętrzną tabelę sceny.

## 7. Spawn i reset

Każdy spawn:

```text
spawnId
position_m: [x, y, z]
rotation_xyzw
allowedVehicleTags[]
clearanceRadius_m
```

Obowiązkowy spawn `default`.

Reset policy jawnie określa:

- docelowy spawn;
- minimalny clearance;
- czy reset zeruje input timeline;
- czy reset tworzy nową generation;
- czy reset zachowuje kamerę;
- co dzieje się przy pojeździe poza bounds lub pod collision surface.

Reset nie może teleportować pojazdu podczas aktywnego fixed-step bez generation/trace markeru.

## 8. Bounds

```text
playableBounds:
  min_m: [x,y,z]
  max_m: [x,y,z]
```

Manifest może posiadać warning/reset volumes, ale nie ukryte siły zawracające pojazd.

Wyjście poza bounds prowadzi do jawnego UI/reset policy. Nie dodaje niewidzialnego sterowania ani siły do chassis.

## 9. Render variants

Przykład:

```text
LOW
MEDIUM
HIGH
```

Każdy wariant deklaruje:

- meshe/chunki;
- LOD policy;
- tekstury i maksymalny rozmiar;
- estimated transfer bytes;
- estimated decoded memory;
- required WebGL capabilities;
- fallback variant.

Zmiana render variant nie zmienia collisionAsset ani physics identity.

AUTO wybiera wyłącznie spośród zwalidowanych render variants.

## 10. Collision asset

Collision reprezentacja deklaruje:

```text
format/backend
units/axes already converted to runtime contract
vertex/index/triangle counts
bounds
sha256
material-region mapping
finite/index/degenerate validation result
source relation
```

Twarde wymagania:

- wszystkie liczby finite;
- indeksy w zakresie;
- brak NaN/Inf;
- jawna polityka degenerate triangles;
- jawna winding/normals policy;
- zgodność bounds z renderem w przypiętej tolerancji;
- brak niekontrolowanego mikroszumu;
- collision proxy przechodzi driving/contact fixture.

Próg trójkątów i pamięci nie jest jeszcze ustalony. Zostanie przypięty po audycie realnych plików skanu i telefonu, nie przez zgadywanie.

## 11. Materiały fizyczne

Scene manifest może mapować regiony collision na nazwane material IDs, np.:

```text
ASPHALT
CONCRETE
SOIL
GRASS
CURB
ROCK
```

V0 może mapować wszystkie regiony na jeden baseline material. Nie wolno jednak kodować przyszłych właściwości opony w rendererze ani na podstawie koloru tekstury.

Material ID jest danymi sceny; jego prawo kontaktowe należy do native physics authority.

## 12. Lifecycle i transakcja

Ładowanie:

```text
fetch manifest
→ validate schema/paths/rights
→ preflight file table and device budget
→ fetch/verify assets
→ decode render representation
→ build/verify collision representation
→ create scene resources
→ commit generation
```

Przy błędzie:

```text
zero częściowo aktywnej sceny
pełne disposal staged resources
czytelny error code/UI
retry bez page reload
```

Zmiana sceny niszczy starą generację dopiero po poprawnym zbudowaniu nowej albo stosuje jawny two-phase swap. Nigdy połowiczny świat.

## 13. Loading i failure UX contract

Host raportuje klasy zasobów:

```text
MANIFEST
RENDER_GEOMETRY
TEXTURES
COLLISION
WORLD_BUILD
FIRST_USEFUL_FRAME
```

Nie udaje precyzyjnego procentu, gdy content-length nie jest znany. Błąd pokazuje:

- sceneId/revision;
- etap;
- bezpieczny error code;
- retry/back action;
- brak lokalnej ścieżki lub sekretu.

## 14. Memory/preflight

Przed dekodowaniem host ocenia:

```text
transfer bytes
decoded vertex/index bytes
texture decoded estimate
peak duplicate copies
collision build estimate
current render profile/device budget
```

Przekroczenie budżetu daje kontrolowany fallback do niższego render variant albo czytelny reject. Nie powoduje cichego obcięcia collision physics.

## 15. Synthetic campus v0

Pierwsza scena kontraktowa ma być mała i deterministyczna:

- płaska nawierzchnia;
- łagodna pochylnia;
- krótki bump/washboard;
- krawężnik;
- ściana/bounds marker;
- jeden default spawn;
- prosty render i osobny collision proxy;
- ten sam manifest/file table co przyszły skan.

Jej celem jest test seam/loading/mobile, nie zastąpienie badań Wheel Scope.

## 16. Testy przeciwne

- manifest z `../private/scan.glb` -> FAIL;
- root-absolute asset -> FAIL;
- hash drift -> FAIL;
- `publicReleaseAllowed=false` -> local PASS / publication FAIL;
- NaN/Inf/invalid index -> collision FAIL;
- brak default spawn -> FAIL;
- render i collision bounds poza tolerancją -> FAIL/review według policy;
- source scan oznaczony jako release render bez explicit conversion -> FAIL;
- scene swap failure -> stara generacja pozostaje albo całość jest czysto zatrzymana;
- niższy render variant nie zmienia collision hash;
- private metadata nie może pojawić się w public build manifest.

## 17. Evidence ladder

```text
CONTRACT_PRESENT
→ MANIFEST_VALIDATOR_PASS
→ SYNTHETIC_SCENE_LOAD_PASS
→ COLLISION_FIXTURE_PASS
→ DESKTOP_BROWSER_PASS
→ LAN_PHONE_PASS
→ REAL_SCAN_AUDIT_PASS
→ CONVERTED_SCAN_DESKTOP_PASS
→ CONVERTED_SCAN_PHONE_PASS
→ OWNER_DRIVE_ACCEPTED
→ PUBLIC_SCENE_RIGHTS_PASS
```

## 18. Stop conditions

Nie integrujemy realnego skanu, gdy:

- jednostki/osie są nieznane;
- prawa do publikacji są niejasne;
- source i release assets są pomieszane;
- collision proxy nie istnieje;
- pakiet przekracza telefoniczny budżet bez fallbacku;
- noisy collider destabilizuje kontakty;
- brak transakcyjnego cleanupu;
- scene manifest wymaga zmian w pojeździe lub input host;
- owner nie akceptuje zachowania na scenie.
