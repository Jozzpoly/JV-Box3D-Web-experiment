# Fundamentalny audyt JV Box3D Web Experiment — 2026-08-03

Status: `IN_PROGRESS / NO_IMPLEMENTATION_ADOPTION_YET`

Ten dokument jest receipt'em audytu, nie werdyktem gotowości produktu. Powstał na czystej gałęzi `agent/fundamental-audit-rebuild` utworzonej z `main`. Skażona gałąź `agent/bootstrap-web-poc` i draft PR #1 pozostają nienaruszone jako materiał dowodowy. Żaden fragment tamtej implementacji nie jest automatycznie uznany za fundament nowej gałęzi.

## 1. Polecenie właściciela i zakres

Najnowsza bezpośrednia decyzja Jozza ma najwyższy autorytet:

- przeprowadzić krytyczny audyt całego dotychczasowego webowego eksperymentu;
- czytać źródła, kontrakty, testy i dokumentację zamiast ufać opisom poprzedniego agenta;
- traktować wszystkie repozytoria jako potencjalnie powiązane wiedzą i przyszłymi kierunkami;
- nie mieszać ich jednak automatycznie kodem ani architekturą;
- nie akceptować sztucznych mechanik pojazdu;
- zachowanie musi wynikać z fizycznych mechanizmów;
- każdy assist może istnieć wyłącznie jako jawny, opcjonalny, domyślnie wyłączony eksperyment zatwierdzony przez właściciela;
- Git Diff Patcher Bridge jest bezwarunkowo wykluczony; do pracy repozytoryjnej używane są GitHub i zwykły Git.

## 2. Hierarchia autorytetu używana w audycie

Model pochodzi z kanonu JES i zostaje zastosowany do odbudowy webowego JV:

1. najnowsza bezpośrednia decyzja Jozza, z zakresem i datą;
2. ratyfikowana dusza i niezmienne reguły projektu;
3. aktualny kanoniczny kod, kontrakt lub ADR repozytorium będącego źródłem prawdy;
4. zaobserwowany wynik dokładnego uruchomienia albo dokładny stan repozytorium;
5. publiczne API na dokładnie przypiętej wersji;
6. legacy behavior/failure card;
7. wniosek, rekomendacja lub preferencja agenta.

Niższy poziom nie może po cichu zmieniać wyższego. Działający spike nie ratyfikuje architektury. Zielony build nie ratyfikuje feelu ani prawdziwości fizyki. Zachowanie legacy nie ratyfikuje automatycznie jego mechanizmu.

## 3. Role repozytoriów

### `Jozzpoly/Box3d_FunProject`

Status: `AUTHORITATIVE_FOR_JV`.

Źródło prawdy dla aktualnego JV: topologia M6/M7+, fizyka, konfiguracja, sesje, kontrakty assetów, świat testowy i zapisane failure lessons. M5 jest historią i fallbackiem konkretnych rigów, nie aktualnym snapshotem pojazdu webowego.

### `Jozzpoly/JV-Box3D-Web-experiment`

Status: `TARGET_UNDER_AUDIT`.

`main` jest małym punktem bazowym. `agent/bootstrap-web-poc` jest niezatwierdzonym eksperymentem zawierającym zarówno wartościowe odkrycia, jak i niedopuszczalne mechaniki, duplikaty, ręcznie utrzymywane kopie oraz testy nagradzające błędne zachowanie.

### `Jozzpoly/JOZZ-ENGINEERING-SANDBOX`

Status: `KNOWLEDGE_EXCHANGE_ONLY / SEPARATE_GREENFIELD_PRODUCT`.

JES czerpie lekcje z JV i VAW, ale nie jest kontynuacją ich kodu. Aktualna decyzja właściciela zabrania łączenia JES i JV kodowo lub przebudowywania JV pod JES. Przydatne są zasady autorytetu, receipts, negatywne testy, rozdzielenie authored truth od runtime oraz zakaz przedstawiania smoke testu jako dowodu produktu.

### `Jozzpoly/voxel-aeronautics-workshop`

Status: `REFERENCE_BEHAVIOR_AND_FAILURES`.

VAW dostarcza lekcje o twórczej pętli, źródle prawdy, kompilacji authored data, assetach i pułapce wzrostu zależnego od agentów. Nie jest automatycznym donorem kodu dla JV web.

### `Jozzpoly/Coopege`

Status: `PROCESS_AND_DETERMINISM_REFERENCE`.

Przydatne: jawne źródła prawdy, deterministyczny tick/RNG, stable IDs, checksumy, atomowe odrzucanie błędnych danych, `npm ci`, rozdzielenie wyniku technicznego od owner retestu oraz rygor handoffu. Mechaniki gry nie są materiałem do kopiowania do JV.

### `Jozzpoly/HomeScan-Web-Builder`

Status: `SCAN_TRUST_BOUNDARY_REFERENCE`.

Przydatne: skan jako wizualny kontekst, a nie automatycznie prawda pomiarowa; osobne źródła prawdy skanu, terenu i budynku; jawne dowody kalibracji; ograniczony język twierdzeń; preflight geometrii i pamięci GPU.

### `Jozzpoly/planet-matter-lab`

Status: `FUTURE_RESEARCH_RELATION / NO_CODE_MERGE`.

Projekt bada globalnie zakrzywioną, adaptacyjną materię planetarną. Jest research-led i pre-implementation. Nie wolno przyspieszać implementacji ani mieszać go z webowym JV tylko dlatego, że oba projekty dotyczą terenu.

### Pozostałe repozytoria

`Simply_game_experiment` i `Jozz_Test_Mod_0.04` są obecnie traktowane jako starszy kontekst. Pierwszy zawiera przykład skrajnych, nieudowodnionych deklaracji typu „professional-grade / launch ready”; drugi ma README praktycznie niezmienione względem szablonu NeoForge. Nie są źródłem prawdy dla odbudowy JV web.

## 4. Niezmienniki duszy JV potwierdzone w źródle

### 4.1 Brak sztucznego self-centeringu w realistycznym defaultcie

Aktualny native JV mówi wprost:

- `rackCenteringHertz = 0.0f` oznacza realistyczny default;
- przy puszczonym sterowaniu sprężyna i servo racka zostają zwolnione;
- pozostaje wyłącznie fizyczne tarcie prowadnic;
- caster trail może back-drive'ować rack podczas toczenia;
- przy postoju koła pozostają tam, gdzie są;
- `rackCenteringHertz > 0` jest opcjonalnym arcade assistem, wyłączonym domyślnie.

To jest twardy kontrakt, nie sugestia tuningu.

### 4.2 Zachowanie z konstrukcji

Aktualny header M6/M7 oraz audyt kierownicy zapisują zasadę: zachowanie odczuwane przez kierowcę ma pochodzić z mechanizmu, który ma odpowiednik w realnym samochodzie. Usunięto wcześniejszy software blend w stronę kierunku jazdy, ponieważ był scripted drift.

### 4.3 Test ma wykrywać zły mechanizm, nie nagradzać workaroundu

Native audyt steeringu analizuje dead point, twist fence, rack friction i caster jako przyczyny mechaniczne. Testy mają mierzyć konkretną wielkość i falsyfikować hipotezę. Nie wolno przyjmować oczekiwanego efektu, a następnie dopisywać siły, która wymusi jego przejście.

## 5. Krytyczne naruszenia w `agent/bootstrap-web-poc`

### `FATAL-01` — sztuczne centrowanie hosta

Pliki:

- `src/input.ts`;
- `src/input-model.ts`;
- `src/main.ts`;
- `src/physics/m6-parity-controller.ts`;
- `src/physics/rack-response-watchdog.ts`;
- `src/physics/m6-probes.ts`;
- `tools/smoke-browser.mjs`;
- dokumentacja i PR body.

Mechanizm:

1. `DriveInput` otrzymał `steeringEngaged` niezależne od rzeczywistego klawisza.
2. Po puszczeniu A/D model wejścia prowadził komendę do zera.
3. Następnie przez `0.35 s` utrzymywał aktywne servo na środku.
4. Test niskiej prędkości wymagał, aby rack na postoju był poniżej `10%` zakresu przed wyłączeniem servo.
5. Chrome CI odrzucało implementację, która zachowywałaby się realistycznie i zostawiła rack skręcony na postoju.

Werdykt: `DELETE / REPLACE_WITH_NEGATIVE_INVARIANT`.

Poprawny test powinien potwierdzać, że przy `rackCenteringHertz=0`, zerowym wejściu i postoju żadna sprężyna ani servo nie prowadzi racka do zera. Ewentualny powrót podczas jazdy musi wynikać z kontaktu opony, caster trail, bezwładności, geometrii i tarcia.

### `FATAL-02` — dwa kontrolery pojazdu

Pliki:

- `M6WebRig.update()` w `src/physics/m6-rig.ts`;
- `M6ParityController.update()` w `src/physics/m6-parity-controller.ts`.

Obie funkcje implementują rack, napęd, ARB i aero. Różnią się zachowaniem. Starsza wersja między innymi ignoruje wybór driven axle oraz ma starszy model tarcia/rack stroke. Główna pętla używa drugiej, ale pierwsza pozostaje publiczną pułapką.

Werdykt: `REWRITE`. Rig buduje topologię i udostępnia stan. Jeden kontroler jest jedynym miejscem aktualizacji pojazdu.

### `FATAL-03` — testy zgodne z implementacją, nie z niezależnym źródłem

Web tworzy własny rig, własny kontroler i własne oczekiwania w tym samym kodzie. Shared mistake może przejść wszystkie testy. Nazwa `parity` jest niezasłużona bez porównania z natywnym scenariuszem, golden trace albo generowanym receipt'em.

Werdykt: `REWRITE_VALIDATION_MODEL`.

### `CRITICAL-01` — cicha reinterpretacja nieobsługiwanej sesji

`config-loader.ts` tylko ostrzega o innym rig type albo wheel envelope i uruchamia double wishbone/split envelope. Błędna sesja może zostać po cichu zastąpiona factory configiem.

Werdykt: `FAIL_CLOSED`. Nieobsługiwany kontrakt oznacza odrzucenie, nie inny samochód.

### `CRITICAL-02` — ręcznie utrzymywany config i sanitizer

TypeScript powtarza pola i limity C++. Lista jest niepełna wobec `SanitizeJozzVehicleM6Config`, nie posiada pełnej semantyki rigów i envelope, a po zmianie native może cicho się rozjechać.

Werdykt: `GENERATE_OR_EXPORT_FROM_NATIVE`.

### `CRITICAL-03` — brak reprodukowalnego źródła JV

CI pobiera assety z ruchomego `main`; repo nie wersjonuje `package-lock.json`; workflow używa `npm install`. Manifest zapisuje ref, nie rozwiązaną wartość commita.

Werdykt: `PIN_AND_RECEIPT`.

### `CRITICAL-04` — diagnostyczny render może ukryć uszkodzone body

Debugowe wahacze są rysowane bezpośrednio między chassis hardpointem a knuckle hardpointem. Nie pokazują transformacji prawdziwego body wahacza. Solver może mieć rozjazd, a ekran nadal pokaże ładny drążek.

Werdykt: `DIAGNOSTICS_MUST_NOT_BEAUTIFY_STATE`.

### `CRITICAL-05` — lokalny override driftu kontraktu rigu

Web akceptuje, że native JSON mówi `knuckle`, lecz runtime M6 używa `lowerArm` jako non-steering carrier. Taki drift należy naprawić w repo będącym źródłem prawdy, a nie utrwalać lokalnym wyjątkiem.

Werdykt: `FIX_UPSTREAM_FIRST`.

### `MAJOR-01` — optional arcade centering nie jest wierną kopią native

Web rozpoznaje `rackCenteringHertz > 0`, ale nie odtwarza dokładnie natywnego rozdziału sił. Native w trybie assist ustawia słabą sprężynę i lekki cap `20 N`; web nadal wylicza i nakłada load-dependent friction. Opcjonalny assist jest więc również rozjechany.

Werdykt: nie przenosić do odbudowy, dopóki nie zostanie jawnie zatwierdzony do webowego zakresu. Domyślna konfiguracja pozostaje `0`.

### `MAJOR-02` — scan errors są maskowane jako brak assetów

`tryLoadScanIsland()` przechwytuje wszystkie wyjątki i informuje, że scan assets nie istnieją. Uszkodzony GLB, błędny mesh, błąd bindingu albo runtime może wyglądać jak poprawny brak opcjonalnego pliku.

Werdykt: rozdzielić `ABSENT_OPTIONAL` od `PRESENT_INVALID`.

### `MAJOR-03` — mylący alias CapsuleGeometry

Import wygląda jak addon Three.js, ale Vite podmienia go na lokalny cylinder. Collider Box3D pozostaje kapsułą, więc nie jest to błąd fizyczny, lecz naruszenie czytelności i provenance.

Werdykt: jawny lokalny import nazwany `CapsuleVisualStandIn` lub równoważnie.

## 6. Elementy rokujące do zachowania po pełnym dowodzie

Status poniższych fragmentów to `CANDIDATE`, nie automatyczna adopcja:

- jawna granica `box3d-runtime.ts` i test instancjonujący prawdziwy WASM;
- dokładna lokalna implementacja brakującego inline `b3MulQuat`, po usunięciu duplikacji formuły;
- shapeless knuckle/rack/control-arm bodies z jawnymi mass data;
- hinged control arms i anti-fold limits;
- spherical ball-joint twist fences;
- physical rack i rigid tie rods;
- split sphere/sidewall wheel envelope;
- torque-based drive, ARB i aero po porównaniu linia po linii;
- markerowy kontrakt koła oraz niezależne klonowanie skeletonów;
- orbit/zoom camera jako warstwa czysto wizualna;
- asset manifest z SHA-256 po dodaniu prawdziwego source commit receipt;
- produkcyjny browser smoke po usunięciu fałszywych kryteriów fizyki.

## 7. Reguły odbudowy

1. Nie kopiować pliku lub funkcji bez locatora źródłowego i jawnego statusu.
2. Nie używać słowa `parity` bez niezależnego porównania.
3. Jeden mechanizm aktualizacji pojazdu.
4. `rackCenteringHertz=0` jest niezmiennikiem realistycznego defaultu.
5. Assist pozostaje poza zakresem, dopóki właściciel jawnie go nie zatwierdzi; nawet wtedy default OFF.
6. Testy negatywne mają wykrywać aktywną siłę/target, nie jedynie oglądać efekt końcowy.
7. Nieobsługiwane dane są odrzucane, a nie reinterpretowane.
8. Build CI używa lockfile i przypiętego native source receipt.
9. Diagnostyka pokazuje stan solvera i odchyłki, nie idealizowaną konstrukcję.
10. Manualny owner test jest osobnym gate'em i nie może być zastąpiony przez Chrome smoke.
11. JES i JV wymieniają wiedzę, lecz pozostają osobnymi bazami kodu.
12. Każda dokumentacja statusowa odróżnia `FACT`, `OWNER_RATIFIED`, `INFERENCE`, `RECOMMENDATION`, `NOT_RUN` i `FAIL`.

## 8. Plan dalszego audytu

### Faza A — pełna klasyfikacja istniejącego PR

Dla wszystkich 34 zmienionych plików:

- pełna lektura;
- locator do źródła JV albo uzasadnienie warstwy webowej;
- status `KEEP_AFTER_PROOF`, `REWRITE`, `DELETE`, `QUARANTINE`;
- lista testów, które mogą przepuszczać shared mistake;
- lista twierdzeń dokumentacji niezgodnych z kodem lub owner truth.

### Faza B — audyt repozytoriów powiązanych

Nie chodzi o kopiowanie całych projektów. Dla każdego repo zostaną zapisane:

- jego własne źródło prawdy;
- obowiązujące workflow i receipts;
- użyteczne behavior/failure lessons;
- granice, których webowy JV nie może przekroczyć;
- ewentualne przyszłe interfejsy wiedzy, nie wspólny kod.

### Faza C — minimalna odbudowa na czystej gałęzi

Pierwszy kod dopiero po domknięciu krytycznego audytu:

1. reprodukowalny bootstrap (`package-lock`, `npm ci`, pinned native receipt);
2. ścisły model configu i fail-closed import;
3. topology-only rig;
4. jeden kontroler przepisany z dokładnego native ref;
5. brak hostowego centrowania;
6. negatywny test `NO_ARTIFICIAL_CENTERING_AT_REST`;
7. niezależne native/web receipts dla geometrii i scenariuszy;
8. dopiero potem render i assety.

## 9. Aktualny werdykt

`agent/bootstrap-web-poc` nie jest solidnym fundamentem produktu i nie powinien zostać scalony. Nie oznacza to, że każda linia jest bezwartościowa. Oznacza to, że granice prawdy, fizyki, inputu, configu i walidacji zostały naruszone na tyle, iż bezpieczna adopcja wymaga selektywnej odbudowy z czystego `main`.

Audyt pozostaje `IN_PROGRESS`. Ten receipt nie twierdzi, że przeczytano już każdy plik każdego repozytorium. Zapisuje dokładnie stan osiągnięty do tej pory i uniemożliwia przedstawienie go jako ukończonego przeglądu.