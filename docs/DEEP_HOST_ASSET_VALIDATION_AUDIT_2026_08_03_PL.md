# Głęboki audyt hosta, assetów i walidacji — pass 2

Data: 2026-08-03

Status: `SEMANTIC_PASS_2 / PRODUCT_CODE_NOT_ADOPTED / OPEN_RUNTIME_TESTS_REMAIN`

Zakres:

- skażony branch `agent/bootstrap-web-poc`;
- przypięty native JV `959aefb…`;
- aktualny wheel program `761bd3ef…`;
- binding `box3d.js@0.0.2`;
- feedback Jozza dotyczący precyzyjnego skrętu, nowego koła i mobilki.

Dokument rozszerza wcześniejszy physics/config audit. Nie jest planem implementacji ani deklaracją pełnej semantycznej lektury wszystkich repozytoriów.

## 1. Input host — problem głębszy niż krzywa sterowania

### 1.1 Polling per render frame

Stary host wykonuje:

```text
rawInput = input.read()
driverInput = driverInputModel.update(rawInput, dt)

while accumulator >= fixedDt:
  controller.update(driverInput)
  world.step()
```

Ten sam snapshot wejścia jest używany dla wszystkich catch-up steps w jednej klatce renderu.

Skutki:

- szybki press/release między render frames może zostać zgubiony;
- świeży press może zostać zastosowany również do kilku zaległych kroków symulacji;
- długość aktywnej komendy zależy od render FPS i lag spike;
- desktop i telefon mogą generować inne sekwencje steering commands z tych samych działań użytkownika;
- testy wywołujące model wejścia bez DOM timeline nie wykrywają problemu.

Werdykt: `REWRITE_HOST_TIMELINE`.

### 1.2 Keyboard listeners nie mają lifecycle

`KeyboardInput` tworzy anonimowe `window.addEventListener` dla `keydown` i `keyup`, lecz nie przechowuje callbacków i nie ma `dispose()`.

Brakuje również jawnego resetu na:

- `blur`;
- `visibilitychange`;
- `pagehide`.

Skutek: wejście może pozostać aktywne po utracie focusu, a ponowne utworzenie hosta może dodać kolejne listenery.

### 1.3 Wartościowy rate limiter i błędny release

Ograniczenie narastania do `2.25/s` jest wartościowym kandydatem ergonomii urządzenia cyfrowego. Automatyczny return-to-zero i `0.35 s` centre hold pozostają odrzucone.

Nowy kontrakt jest opisany w `STEERING_INPUT_RESEARCH_2026_08_03_PL.md`.

## 2. Effective config zamiast pozornego configu

Stary loader nie raportuje, który mechanizm rzeczywiście konsumuje dane pole. Miesza:

```text
SUPPORTED_AND_ACTIVE
SUPPORTED_BUT_INACTIVE_FOR_THIS_RIG
PARSED_BUT_NOT_IMPLEMENTED
DERIVED
RUNTIME_ONLY
UNSUPPORTED_BUT_REINTERPRETED
```

### 2.1 Potwierdzona błędna walidacja max steer

Web clampuje:

```text
maxSteeringAngleDegrees: 15..60
```

Native clampuje:

```text
5..safeMax
safeMax = max(15, deadPointDeg - 13)
```

Konsekwencje weba:

- sesja z zakresem 5–14° jest cicho zwiększana do 15°;
- zmiana idzie dokładnie w stronę pogarsającą precyzyjne prowadzenie;
- górne 60° nie jest ograniczone geometrycznym dead pointem;
- ręcznie edytowana sesja może ominąć native P5/P6 fences.

Status: `CONFIRMED_CONFIG_SEMANTICS_BUG`.

### 2.2 Pola przyjęte, lecz niewykonywane

W stałym double-wishbone PoC:

```text
uprightAssist
uprightHertz
uprightDampingRatio
```

są parsowane, ale helper nie jest tworzony.

```text
maxSteeringTorque
steeringFrictionTorque
```

należą do innych ścieżek/rigów albo historycznych mechanizmów i nie sterują fizycznym rackiem w aktywnym controllerze wishbone.

```text
frontSuspensionVisualModel
```

jest parsowane i synchronizowany jest front-rig GLTF, ale właściwy renderer używa diagnostic primitives i nie konsumuje tego modelu.

### 2.3 Pola niepełnie walidowane

Między innymi:

- `chassisHalfExtents` per component;
- `rackHalfWidth` względem track;
- wishbone arm lengths/spread/steering arm;
- suspension scales;
- preloads;
- rack servo force/gain/max speed;
- drive, brake, coast i aero ranges;
- visual keys i offsets;
- cross-field geometry;
- dead-point relation.

### 2.4 Wymagany effective-config receipt

Każdy zbudowany fixture ma raport:

```text
field path
input value
sanitized value
status
owner mechanism
source locator
derived dependencies
unsupported reason
```

Przykład:

```text
rackCenteringHertz
  value: 0
  status: SUPPORTED_ACTIVE_REALISTIC_DEFAULT
  owner: wishbone rack controller

uprightAssist
  value: true
  status: UNSUPPORTED_OPTIONAL_ASSIST
  action: reject fixture

maxSteeringTorque
  status: INACTIVE_FOR_DOUBLE_WISHBONE
  action: do not imply effect
```

## 3. Runtime-only collision identity

Native factory i stary web mają:

```text
filterGroupIndex = -19
```

Box3D group semantics:

- identyczny ujemny index: shapes nigdy się nie zderzają;
- non-zero group index wygrywa z mask bits.

Dla jednego pojazdu wyłącza to self-collision. Dla dwóch pojazdów z tym samym `-19` wyłączy również vehicle-to-vehicle collision.

`filterGroupIndex` jest deliberate runtime-only i nie jest serializowany w native session.

Werdykt:

```text
vehicle instance allocator
→ unikalny ujemny group index per vehicle
```

Factory receipt może zapisać przydzieloną wartość, lecz authored vehicle config nie może jej posiadać jako stałej tożsamości modelu.

## 4. Legacy wheel i świat testowy

Szczegółowy finding znajduje się w `LEGACY_M6_WHEEL_FIXTURE_AUDIT_2026_08_03_PL.md`.

Najważniejszy efekt:

```text
plate, 401 rocks i 147 bumpers = TERRAIN category
rolling sphere mask            = TERRAIN
sidewall cylinder mask         = NOT TERRAIN
```

Zatem główny campus używa sfery również na skałach i progach. Sidewall nie jest tam testowany.

To jest zgodność web/native, lecz zgodność z ograniczeniem historycznego fixture, nie argument za jego dalszym rozwojem.

## 5. Wheel visual contract — centrum przechodzi, strona może być błędna

### 5.1 Brak side identity

`WheelVisualTarget` zawiera tylko:

```text
bodyId
root
fallback
```

Nie zawiera:

```text
corner ID
left/right
front/rear
outboard direction
required mirror/handedness
```

### 5.2 Utrata znaku mount offset

Marker resolver liczy `mountOffset` przez wartość bezwzględną. Kontrakt wie, jak daleko socket leży od środka, ale nie wie po której stronie osi.

### 5.3 Identyczny transform czterech klonów

Ten sam source clone i ten sam contract transform są nakładane na wszystkie cztery wheel roots. Fizyczne wheel bodies mają tę samą orientację lokalnej osi spin, podczas gdy kierunek `outboard` jest przeciwny dla lewej i prawej strony.

Dla symetrycznej opony może to wyglądać poprawnie. Dla asymetrycznej felgi/piasty/tread jedna strona może mieć mount face skierowane do wnętrza.

### 5.4 Fałszywie wystarczający test

`validateWheelBodyBindings` mierzy jedynie world position wheel root wobec body position. Nie porównuje:

- quaterniona root/body;
- osi spin;
- kierunku outboard;
- signed mount face;
- zachowania po obrocie koła;
- left/right symmetry.

Browser smoke czyta ten sam jednorazowy report, więc wspólny brak przechodzi.

Werdykt: `REWRITE_WHEEL_VISUAL_CONTRACT`.

Wymagane testy:

- signed axial markers;
- axis basis/handedness;
- outboard direction per corner;
- mount socket world pose per corner;
- root quaternion error;
- spin przez kilka pełnych obrotów;
- asymetryczny test asset fixture.

## 6. Body visual contract nie istnieje jako authored contract

Renderer rozpoznaje tylko:

```text
brak
rama_rurowa
```

Dla `rama_rurowa` hardcoduje:

```text
scale = 0.35
rotation Y = -90°
position Y = -0.60 + session offset
```

Nie ma:

- asset contract version;
- physical/body origin marker;
- axis marker;
- source scale receipt;
- bounding/attachment validation;
- proof that hardcoded offset belongs to current asset commit.

Unknown model key cicho przechodzi na fallback przez warning. To jest visual fallback, nie akceptacja configu.

## 7. Front-rig asset preflight — koszt bez runtime ownership

Startup ładuje:

```text
OneSided_Steering_Suspension_Rig.gltf
one_sided_steering_suspension.asset.json
```

Preflight sprawdza node names, skin counts i lokalny override ownership drift. Właściwy renderer nie używa tego GLTF do rysowania zawieszenia; tworzy prymitywne odcinki.

Problemy:

- dodatkowy download/parse przed grą;
- „asset loaded” brzmi jak runtime integration, której nie ma;
- node-count gate nie sprawdza transformów, bind pose ani zgodności z live bodies;
- lokalny override naprawia native contract po stronie konsumenta;
- smoke akceptuje `contractVersion >= 2` zamiast przypiętej obsługiwanej wersji.

Werdykt:

- naprawić kontrakt upstream;
- przenieść preflight do asset validation CI, dopóki renderer go nie konsumuje;
- runtime nie ładuje niewykorzystywanego assetu.

## 8. Asset bridge provenance

### 8.1 Ruchomy ref

Default:

```text
JV_SOURCE_REF = main
```

Manifest zapisuje nazwę refa, nie resolved commit.

### 8.2 Cache może zostać błędnie przypisany do nowego refa

Gdy brak local source i target już istnieje, bridge:

1. waliduje istniejący target;
2. zwraca go jako `cached-jv-asset`;
3. nie pobiera ani nie porównuje żądanego refa;
4. manifest nadal zapisuje aktualne `sourceRef` na poziomie root.

Stary cache może więc zostać opisany jako artefakt nowego refa.

### 8.3 Local working tree bez tożsamości

Manifest zapisuje:

```text
nativeRef = local-working-tree
```

Nie zapisuje:

- repo commit;
- branch;
- dirty state;
- hash całego relevant source set;
- lokalnej ścieżki tylko jako receipt-local data.

### 8.4 Brak transakcyjności

Assety są zapisywane kolejno, manifest dopiero na końcu. Awaria późnego pliku może pozostawić część nowych targetów z poprzednim manifestem.

### 8.5 Niekompletne GLTF dependency handling

Bridge kopiuje wyłącznie tekst `.gltf`. Validator nie odrzuca ani nie synchronizuje external:

- buffer URI;
- image URI;
- textures.

Bieżący wheel asset ma data-URI buffer, więc działa jako jeden plik. Przyszły GLTF z `.bin` albo teksturą może zostać skopiowany niekompletnie.

### 8.6 Słaba walidacja kontraktu

- required node names są sprawdzane przez `Set`, więc duplikaty mogą przejść;
- brak accessor/buffer bounds validation;
- brak finite transform validation;
- brak external URI policy;
- native contract `source.gltf` nie jest cross-checkowany z faktycznie synchronizowanym plikiem i jego SHA;
- session JSON sprawdzane jest tylko jako root object;
- session nie wchodzi do asset manifestu.

### 8.7 Nieużywane assety

Bridge synchronizuje również rear mount i damper, mimo że obecny web renderer ich nie konsumuje. Build/development ponosi koszt i tworzy pozór szerszej integracji.

Werdykt: `REWRITE_ASSET_BRIDGE_TRANSACTIONALLY`.

## 9. Runtime export smoke — właściwa klasyfikacja

`tools/check-box3d-runtime.mjs` jest wartościowy jako szybki test instancjacji, ale jego obecny komunikat zawyża dowód.

### Potwierdzone ograniczenia

- regex wykrywa wyłącznie literalne `b3.b3Foo(...)`;
- alias, destrukturyzacja lub inna nazwa modułu omija scan;
- sprawdzane jest `typeof function`, nie sygnatura;
- tworzy dynamiczną sferę na wysokości 2 m, lecz wykonuje tylko 4 kroki;
- sfera nie osiąga ground shape, więc kontakt nie jest testowany;
- nie tworzy żadnego distance/revolute/prismatic/spherical jointu;
- quaternion shim testuje tylko normę, nie oczekiwany wynik ani order;
- formuła shimu jest skopiowana drugi raz;
- używa gravity `-9.81`;
- nie testuje BigInt filters, mass data, material properties, constraint force ani contact data.

Poprawna nazwa poziomu:

```text
EXPORT_PRESENCE_AND_ALLOCATION_SMOKE
```

Nie:

```text
physics parity
vehicle runtime verified
```

## 10. Browser smoke — właściwa klasyfikacja

### Co faktycznie dowodzi

- Vite preview odpowiada;
- Chrome/SwiftShader tworzy canvas;
- aplikacja przechodzi własny startup;
- status/HUD pojawiają się;
- wewnętrzne sondy zwracają oczekiwany przez siebie report;
- asset fallback nie powoduje uncaught exception w wybranych ścieżkach.

### Czego nie dowodzi

#### Prawdziwy GPU/mobile browser

Chrome startuje z:

```text
--disable-gpu
--enable-unsafe-swiftshader
```

Nie testuje sterownika GPU, telefonu, Safari/WebKit, Android Chrome ani realnego WebGL performance profile.

#### Prawdziwe input events

Smoke nie wysyła keyboard ani pointer events. „keyboard handling pulse” jest wewnętrzną funkcją sondy, nie testem DOM input pipeline.

#### Wheel orientation

Czyta jednorazowy report position/marker contract. Nie testuje quaterniona, side identity ani bindingu po wielu frames.

#### Console/resource failures

CDP klient zbiera `Runtime.exceptionThrown`, ale nie zbiera pełnego `console.error/warn`, failed network resources ani jawnych fallback events. Kod może złapać błąd assetu, wypisać warning i nadal przejść.

#### Independent truth

Smoke czyta `window.__JV_PROBE_REPORT__` utworzony przez tę samą implementację i testy. Shared mistake pozostaje możliwy.

Werdykt:

```text
HEADLESS_STARTUP_AND_UI_SMOKE
```

## 11. Startup probe gate

Stary zwykły runtime wykonuje przed pierwszym aktywnym światem:

```text
2154 world steps
8616 solver substeps
```

Pełne sondy są więc jednocześnie:

- produkcyjnym startup kosztem;
- gate'em opartym na skażonym centre-capture;
- źródłem dodatkowych build/destroy cykli;
- blokadą głównego wątku;
- szczególnym problemem telefonu.

Werdykt: probe suite żyje w osobnym CI/dev route. Manual host nie uruchamia jej automatycznie.

## 12. Resource ownership i rollback

### Input

- brak dispose keyboard listeners;
- brak focus/visibility reset.

### Render

`RenderContext.dispose()` usuwa resize listener, camera listeners i niszczy renderer, ale nie przechodzi po scenie w celu jawnego dispose:

- geometry;
- material;
- texture;
- skinned resources;
- loaded GLTF resources.

### Rig visuals

`createRigVisuals()` nie zwraca dispose handle dla materiałów, geometry i segmentów.

### World

`WorldResources.dispose()` niszczy tylko `b3MeshData` scanów. Static bodies są później usuwane przez destroy całego świata, ale Three objects/materials nie mają własnego ownera.

### Partial startup failure

`start().catch()` jedynie pokazuje błąd. Jeżeli failure nastąpi po częściowym utworzeniu world/render/asset resources, nie istnieje transakcyjny cleanup stack.

### Restart

`R` wykonuje `window.location.reload()`, co maskuje lifecycle leaks i nie testuje deterministycznego destroy/rebuild.

Werdykt:

```text
transactional startup
+ explicit DisposableStack/resource owners
+ repeatable build/destroy tests
```

## 13. Scan path — transaction i peak memory

### Visual przed colliderem

Visual GLTF jest dodawany do sceny przed zakończeniem tworzenia collision mesh. Jeżeli późniejszy etap zawiedzie, catch zwraca null, lecz dodany visual może pozostać.

### Catch-all

Każdy exception jest opisany jak brak opcjonalnych assetów. Uszkodzony/present-invalid scan staje się pozornym `ABSENT_OPTIONAL`.

### Wielokrotne kopie danych

Collision positions/indices przechodzą przez:

```text
Three BufferAttribute
→ JS number[]
→ Float32Array/Uint32Array
→ embind conversion
→ C++ std::vector
→ Box3D mesh
```

Brakuje limitów i preflight:

- vertices/triangles;
- finite values;
- index range;
- degenerate triangles;
- memory estimate;
- alignment transform;
- mesh options unavailable in bindingu.

Werdykt: scan poza pierwszym mobile i clean vehicle gate.

## 14. World contract i ręczna kopia kampusu

Web ręcznie kopiuje station/rock/bumper specs do TypeScript. Native ma własne validators i builder używający tego samego data source. Web nie uruchamia native layout/content validators i nie ma generated campus contract.

Shared drift może dotyczyć:

- count;
- dimensions;
- seed;
- friction;
- category;
- accepted/rejected station slices.

Dla pierwszego clean slice nie należy portować pełnego kampusu. Minimalny fixture jest niezależny. Pełny campus później powinien pochodzić z wygenerowanego data receipt.

## 15. Wake/sleep — otwarta hipoteza

Native controller wywołuje `b3Joint_WakeBodies(rackJointId)` przy każdym update, także w hands-off. Stary web candidate robi to samo.

Możliwy skutek:

- steering-connected island może być stale budzona;
- wyższy idle CPU/battery cost, szczególnie na telefonie.

Status:

```text
OPEN_INFERENCE / NOT_MEASURED
```

Nie wolno usuwać tego wywołania tylko po stronie weba bez:

- sprawdzenia native intent;
- sleep-state trace;
- parked vehicle test;
- caster/rack response regression test.

## 16. Skrypty i CI

`predev`:

```text
sync-assets
verify-runtime
dev
```

`build`:

```text
typecheck
verify-runtime
vite build
```

CI:

```text
npm install
npm run build
npm run smoke-browser
```

Problemy:

- brak lockfile / `npm ci`;
- asset sync z ruchomego źródła podczas build;
- dev i CI mogą konsumować cache o innej provenance;
- browser smoke jest osobnym krokiem CI, ale zwykły app i tak uruchamia pełne sondy przy starcie;
- source maps i inline WASM powiększają artefakt;
- `ubuntu-latest` jest ruchome.

## 17. Minimalne bramki odbudowy wynikające z passu 2

### H0 — host input

- timestamped event timeline;
- `RELEASE/POSITION/RATE`;
- dispose/focus reset;
- render-FPS independence.

### C0 — config

- generated native schema;
- exact feature support matrix;
- effective-config receipt;
- fail closed;
- native dead-point sanitizer.

### A0 — assets

- pinned source commit;
- transaction staging;
- full GLTF dependency inventory;
- duplicate/finite/accessor validation;
- session/contract provenance;
- no unused runtime preloads.

### B0–B5 — binding

- artifact identity;
- export presence;
- value-object round-trip;
- lifetime;
- primitive numeric equivalence;
- body/joint fixture receipts.

### V0 — visuals

- body authored contract;
- signed wheel side/mount contract;
- orientation tests;
- explicit fallback events;
- disposal.

### W0 — world

- minimal generated fixture;
- unique vehicle group allocator;
- no category-switched future wheel;
- scan separate.

### M0 — mobile

- low visual profile only;
- same physics profile;
- touch pointer router;
- real device test.

## 18. Werdykt passu 2

Pierwszy pass poprawnie odrzucił artificial centering i niepełny config. Pass 2 pokazuje, że skażenie było szersze:

- input zależał od render frame timeline;
- config nie mówił, które pola naprawdę działają;
- wheel visual test nie sprawdzał strony/orientacji;
- asset bridge mógł błędnie przypisać cache do refa;
- runtime smoke nie testował kontaktu ani jointów;
- browser smoke nie testował realnego inputu ani GPU;
- startup wykonywał tysiące substepów diagnostycznych;
- lifecycle nie był transakcyjny;
- historyczny campus był praktycznie testem sfery;
- stały collision group blokował przyszłe multi-vehicle collisions.

To nadal nie oznacza, że każdy fragment starego PoC jest bezwartościowy. Oznacza, że odzysk wymaga nowych granic prawdy i niezależnych receipts, a nie kopiowania istniejących plików.