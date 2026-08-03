# Errata audytu fundamentalnego — 2026-08-03

Status: `SUPERSEDING_CORRECTIONS / APPLY_BEFORE_USING_EARLIER_REPORTS`

Ten dokument koryguje wcześniejsze wnioski audytu po przeczytaniu głębszych warstw native JV: `TECH_DEBT_PL.md`, M8/M9, asset contract runtime, live M6 steering visual integration, asset metadata/dimensions oraz walidatora.

Błędne wnioski nie są usuwane z historii. Pozostają widoczne razem z przyczyną pomyłki i dokładnym nowszym dowodem.

---

## E-01 — źródło bazowego contact tuningu `30 / 10 / 3`

### Wcześniejszy skrót

W kilku miejscach audytu zapisano lub zasugerowano, że native M6 lab ustawia przy starcie:

```text
contactHertz = 30
contactDampingRatio = 10
contactSpeed = 3
```

przez własne aktywne wywołanie `ApplyContactTuning()`.

### Dokładny stan

Konstruktor M6 ustawia pola UI:

```text
m_contactHertz = 30
m_contactDampingRatio = 10
m_contactSpeed = 3
```

ale nie wywołuje `ApplyContactTuning()` przy zwykłym starcie. Funkcja jest wywoływana dopiero po zmianie suwaków lub po użyciu przycisku resetu solvera.

Jednocześnie `b3DefaultWorldDef()` samego silnika ustawia dokładnie:

```text
contactHertz = 30
contactDampingRatio = 10
contactSpeed = 3
```

Dlatego świeży świat native faktycznie zaczyna z `30/10/3`, lecz przez dziedziczenie defaultu silnika, nie przez aktywne zastosowanie pól M6.

### Konsekwencja

Wcześniejszy wynik liczbowy pozostaje prawdziwy dla świeżego default fixture:

```text
native fresh default = 30 / 10 / 3
web pinned fixture   = 30 / 10 / 3
```

Korekta dotyczy źródła i persistence:

- wartości niestandardowe są ustawieniem hosta/sampla, nie vehicle configu;
- nie są zapisane w sesji M6;
- restart może cicho wrócić do defaultu silnika;
- import samej vehicle session nie odtwarza pełnego solver profile;
- clean receipt ma zapisywać rzeczywiście odczytane world tuning po utworzeniu świata.

### Wcześniejsze dokumenty objęte korektą

- `PHYSICS_DELTA_AUDIT_2026_08_03_PL.md`, sekcja D-WORLD-03;
- `MOBILE_HOST_READINESS_AUDIT_2026_08_03_PL.md` wszędzie, gdzie `30/10/3` występuje jako jawny pinned profile;
- `EVIDENCE_MATRIX_2026_08_03_PL.md`, SOLVER-03.

Poprawna formuła:

```text
ALIGNED_FRESH_ENGINE_DEFAULT,
NOT_PERSISTED_HOST_SESSION_STATE
```

---

## E-02 — `ChassisMount_b` i rzekomy drift kontraktu

### Wcześniejszy błędny wniosek

Pierwszy pass sklasyfikował:

```text
sidecar says ChassisMount_b rides knuckle
current M6 uses lowerArm
→ stale native contract
→ fix upstream first
```

Ten wniosek był zbyt uproszczony i jest wycofany.

### Dokładny stan źródeł

#### Kontekst M9 isolated visual bench

`one_sided_steering_suspension.asset.json` opisuje authored visual semantics modelu używanego najpierw w izolowanym M9 benchu.

Sidecar mówi między innymi:

```text
Socket_ChassisMount_b ridesBody = knuckle
Socket_WheelCenter   ridesBody = knuckle
Socket_SingleDamperLower ridesBody = lowerArm
Socket_SteeringRod   ridesBody = knuckle
```

M9 ma osobne ciała:

```text
chassis
carrier — travel, no steer
knuckle — travel + steer
```

W tym izolowanym modelu authored role i body assignment są świadomą częścią M9 visual experimentu.

#### Kontekst live M6 vehicle visual integration

Jeżdżący M6 double-wishbone nie posiada osobnego carrier body odpowiadającego M9. Native integracja wizualna zapisuje jawnie:

```text
chassisId  -> chassis-mounted brackets
lowerArmId -> rola travel-but-no-steer
knuckleId  -> WheelCenter i elementy steerujące
```

Dla M6 `Socket_ChassisMount_b` jest więc mapowany na `lowerArmId`, ponieważ Jozz wymagał, aby poruszał się ze skokiem, lecz nie skręcał z WheelCenter.

To nie jest globalna korekta authored sidecara. Jest kontekstowym bindingiem visual role → live vehicle body graph.

### Poprawna architektura

Potrzebne są dwa jawne konteksty:

```text
M9_ISOLATED_STEERING_BENCH_BINDING
M6_LIVE_DOUBLE_WISHBONE_VISUAL_BINDING
```

Sidecar zachowuje authored semantics i ogólne role. Adapter konkretnego rigu mapuje role na ciała dostępne w danej topologii.

Webowy `FRONT_RIG_M6_BINDINGS` jest wartościowym zalążkiem takiego adaptera. Jego problemem jest komentarz i raport nazywający różnicę `known historical JSON ownership drift`, nie sam fakt istnienia mapy M6.

### Wycofana rekomendacja

Nie należy globalnie zmieniać:

```text
ChassisMount_b ridesBody = lowerArm
```

w sidecarze tylko po to, aby dopasować go do M6.

Należy:

- nazwać kontekst bindingu;
- walidować role wymagane przez ten kontekst;
- mapować je na topology-specific bodies;
- nie udawać, że M9 i M6 mają identyczny body graph;
- nie używać name substring jako authority;
- zachować `physicsAuthority=false` dla visual contractu.

### Wcześniejsze dokumenty objęte korektą

Następujące wnioski `UPSTREAM_FIRST`/`contract drift` są superseded:

- `FUNDAMENTAL_AUDIT_2026_08_03_PL.md`, CRITICAL-05;
- `PR1_FILE_CLASSIFICATION_2026_08_03_PL.md`, pozycja `front-rig-contract.ts`;
- `PHYSICS_DELTA_AUDIT_2026_08_03_PL.md`, front-rig ownership drift;
- `EVIDENCE_MATRIX_2026_08_03_PL.md`, VIS-03;
- `DEEP_HOST_ASSET_VALIDATION_AUDIT_2026_08_03_PL.md`, front-rig preflight.

Nowy status:

```text
KEEP_CONCEPT_AFTER_REWRITE
CONTEXTUAL_BINDING_REQUIRED
MISNAMED_AS_DRIFT
RUNTIME_ASSET_STILL_NOT_CONSUMED_BY_OLD_WEB_RENDERER
```

---

## E-03 — native asset-derived wheel dimensions nie są jeszcze doskonałym authored truth chain

### Wcześniejszy niepełny obraz

Pierwszy config audit słusznie wykazał, że web hardkodował wheel radius/width i nie odtwarzał asset-derived factory baseline native. Sformułowanie mogło jednak sugerować, że native zawsze czyta aktualne markery bezpośrednio z bieżącego GLTF.

Tak nie jest.

### Dokładna ścieżka native

`GetJozzVehicleM3ADefaults()` pobiera markery przez `JozzVehicleAuditMetadata`:

```text
assets/source/*.gltf
  ↓ offline tools/asset_audit.py
assets/reports/asset_audit_latest.json
  ↓ runtime LoadJozzVehicleAuditMetadata()
semantic marker positions
  ↓ GetJozzVehicleM3ADefaults()
wheel radius / width / travel hint
```

Jeżeli raportu nie ma albo marker nie zostanie znaleziony, runtime używa built-in fallback table w `jozz_vehicle_asset_metadata.cpp`.

### Potwierdzone ograniczenia

`asset_audit_latest.json` zawiera:

- file name;
- generator;
- node/mesh/skin counts;
- semantic positions;
- bounds;
- triangle/vertex counts.

Nie zawiera:

- SHA-256 source GLTF;
- Git blob/source commit;
- contract SHA;
- audit tool version/commit;
- czasu albo receipt ID pozwalającego udowodnić świeżość wobec source assetu.

Runtime loader również nie porównuje raportu z source GLTF hash.

W rezultacie native może używać starego raportu po zmianie GLTF albo built-in fallbacku, jeśli audit report nie został poprawnie odtworzony.

### Relacja do sidecar contract runtime

`ASSET_CONTRACT_RUNTIME_V1_PL.md` definiuje silniejszy kierunek:

```text
assets/contracts/*.asset.json + assets/source/*.gltf
→ runtime binding source
assets/reports/*latest*
→ diagnostics only
```

Ale legacy M3A primitive dimensions nadal korzystają z audit metadata bridge. To przejściowa luka, nie powód do kopiowania słabszego mechanizmu do weba.

### Poprawny kierunek clean web

Web nie powinien sam wybierać pomiędzy source GLTF, sidecarem, reportem i built-in table.

Native/export tooling powinno wygenerować factory receipt:

```text
nativeCommit
assetSourcePath
assetGitBlob
assetSHA256
contractPath
contractGitBlob
contractSHA256
auditReportPath
auditReportGitBlob
auditReportSHA256
auditToolIdentity
resolvedMarkers
fallbackUsed
fallbackReason
metersPerBlockbenchUnit
derivedWheelRadius
derivedWheelWidth
derivedTravelHint
```

Dopiero taki artefakt jest wejściem do webowego `WheelSpecSnapshot` i factory configu.

### Status wcześniejszego findingu webowego

Pozostaje ważny:

```text
web hardcoded wheel dimensions
+ native session intentionally omits radius/width
→ web lost native factory/asset-derived truth
```

Korekta brzmi:

```text
native ma lepszy, ale nadal przejściowy asset metadata chain;
clean web powinien konsumować wzmocniony native-generated receipt,
nie kopiować ani webowego hardcode, ani słabego report fallbacku.
```

---

## E-04 — wizualna walidacja M8/M9 jest osobnym poziomem dowodu

### Nowy kontekst

M8 repair plan dokumentuje wcześniejszą porażkę procesu:

- agent nie obejrzał ani jednej klatki;
- green numeric validator i `0 sokol errors` dały fałszywą pewność;
- wieloczęściowy model został nazwany zrigowanym mimo sztywnego przyklejenia całej bryły do jednego ciała;
- shared wrong model przeszedł implementację i testy.

M9 powstał jako izolowany bench właśnie po to, aby rozdzielić:

- travel;
- steer;
- visual wheel spin;
- authored role mapping;
- lewą/prawą stronę;
- obraz i socket dump przed integracją z pojazdem.

### Konsekwencja dla weba

Node/skin preflight starego weba nie jest substytutem M8/M9 visual gate.

Poprawny poziom dowodu wymaga:

- renderu jednego narożnika;
- jawnego binding context;
- per-part ownership;
- pełnej orientacji i side mapping;
- screenshot albo inny odczytywalny obraz;
- owner visual verdict;
- dopiero potem czterech narożników i ruchu.

To wzmacnia wcześniejszy finding o niewykorzystywanym front-rig GLTF, ale zmienia jego diagnozę z `stale sidecar` na `insufficient contextual visual integration`.

---

## E-05 — polityka używania wcześniejszych dokumentów

W przypadku konfliktu obowiązuje kolejność:

1. najnowsza bezpośrednia decyzja Jozza;
2. ten plik errata;
3. exact source receipt i nowsze subsystem audit docs;
4. wcześniejsze dokumenty pass 1;
5. skażona dokumentacja PR #1.

Każdy przyszły plan odbudowy musi jawnie uwzględnić E-01–E-04. Nie wolno cytować superseded `UPSTREAM_FIRST` dla `ChassisMount_b` ani twierdzić, że native runtime zawsze wylicza koło bezpośrednio z aktualnego GLTF.