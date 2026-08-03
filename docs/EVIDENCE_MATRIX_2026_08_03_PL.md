# Evidence matrix odbudowy JV Web — 2026-08-03

Status dokumentu: `LIVE_AUDIT_INDEX / NO_PRODUCT_PASS`

Ten plik nie streszcza całego projektu. Określa, na jakim poziomie dowodu znajduje się każda kluczowa teza i czego nadal nie wolno z niej wywnioskować.

## Statusy

- `OWNER_RATIFIED` — bezpośrednia decyzja Jozza.
- `SOURCE_FACT` — odczyt z dokładnego commita/bloba źródła prawdy.
- `MEASURED_FACT` — wynik dokładnie opisanego uruchomienia/pomiaru.
- `AUDIT_FINDING` — wniosek z porównania co najmniej dwóch wskazanych źródeł.
- `INFERENCE` — racjonalna hipoteza wymagająca falsyfikacji.
- `NOT_RUN` — test nie został wykonany.
- `BLOCKED` — brakuje niezbędnego źródła, narzędzia lub owner decision.
- `REJECTED` — mechanizm/teza została odrzucona.
- `WITHDRAWN` — wcześniejsza hipoteza została obalona i nie może być cytowana jako finding.

## A. Dusza i polityka mechanik

| ID | Teza | Status | Locator / dowód | Dozwolony wniosek | Niedozwolony wniosek |
|---|---|---|---|---|---|
| SOUL-01 | Realistyczny default nie może zawierać sztucznych mechanik. | `OWNER_RATIFIED` | Najnowsze polecenie Jozza w rozmowie; receipt `NO_ARTIFICIAL_MECHANICS_CONTRACT_PL.md`. | Każda siła/target wymaga source receipt albo jawnej zgody assistu. | „Dobre odczucie” nie legalizuje hostowej korekty. |
| SOUL-02 | Self-centering może wynikać z fizyki caster/contact podczas ruchu. | `OWNER_RATIFIED + SOURCE_FACT` | `jozz_vehicle_m6_suspension_rig.h/.cpp@959aefb`. | Hands-off steering może być back-driven przez mechanikę. | Nie wolno wymuszać dokładnego zera ani centrowania na postoju. |
| SOUL-03 | `rackCenteringHertz>0` to opcjonalny arcade assist, default OFF. | `SOURCE_FACT` | `jozz_vehicle_m6_geometry.cpp`, `jozz_vehicle_m6_suspension_rig.cpp@959aefb`. | Import może go rozpoznać jako optional feature. | Nie wolno włączać go po cichu ani nazywać realistycznym defaultem. |
| SOUL-04 | Owner feel verdict należy wyłącznie do Jozza. | `OWNER_RATIFIED` | Rozmowa + kanon JES/VAW/Coopege. | CI raportuje mierzalne fakty i ograniczenia. | Agent/CI nie wydaje werdyktu „prowadzi się dobrze”. |

## B. Skażona implementacja PR #1

| ID | Teza | Status | Locator / dowód | Konsekwencja |
|---|---|---|---|---|
| BAD-01 | Host prowadził rack do środka po puszczeniu A/D. | `AUDIT_FINDING / REJECTED` | `src/input-model.ts`, `src/input.ts`, `m6-parity-controller.ts` na `agent/bootstrap-web-poc`. | Mechanizm i zależne testy usunąć; nie cherry-pickować. |
| BAD-02 | CI wymagało centrowania na postoju. | `AUDIT_FINDING / REJECTED` | `m6-probes.ts`, `main.ts`, `smoke-browser.mjs`. | Stare zielone CI nie jest dowodem fizycznej poprawności. |
| BAD-03 | Istnieją dwa rozbieżne kontrolery pojazdu. | `AUDIT_FINDING` | `M6WebRig.update()` oraz `M6ParityController.update()`. | Odbudowa ma jeden controller; rig topology-only. |
| BAD-04 | Nieobsługiwana sesja może zostać cicho zmieniona w inny samochód. | `AUDIT_FINDING` | `config-loader.ts`. | Import musi być fail-closed. |
| BAD-05 | Dokumentacja i pamięć awansowały workaround do fundamentu. | `AUDIT_FINDING` | `README`, `AI_PROJECT_MEMORY`, `WEB_CONVERSION_FOUNDATION`, PR #1 body. | Dokumenty z PR #1 są quarantine, nie kanonem. |

## C. Native source identity

| ID | Teza | Status | Locator / dowód | Ograniczenie |
|---|---|---|---|---|
| SRC-01 | Pierwszy audit baseline native to commit `959aefb…`. | `SOURCE_FACT` | `NATIVE_JV_SOURCE_RECEIPT_2026_08_03.md`. | Nie dowodzi lokalnych niezacommitowanych zmian Jozza. |
| SRC-02 | Krytyczne blob SHA M6 zostały zapisane. | `SOURCE_FACT` | Ten sam receipt. | Każda późniejsza aktualizacja wymaga nowego delta receipt. |
| SRC-03 | `jozz-scan-terrain-f0` jest 25 commitów przed `main` i zawiera bieżący program kół. | `SOURCE_FACT` | GitHub compare + `CURRENT_JV_WHEEL_PROGRAM_RECEIPT`. | Nazwa brancha nie określa jego aktualnej roli. |
| SRC-04 | Kod `jozz_vehicle_m6_*` nie zmienił się w porównaniu `main→jozz-scan-terrain-f0` w odczytanym compare. | `SOURCE_FACT_WITH_SCOPE` | GitHub compare file list. | Nie dowodzi braku lokalnych zmian poza GitHubem. |

## D. Solver i host

| ID | Teza | Status | Locator / dowód | Konsekwencja |
|---|---|---|---|---|
| SOLVER-01 | Native default gravity = `-10`, web/probes = `-9.81`. | `AUDIT_FINDING` | `src/types.c@959aefb`, `sample.cpp`, web `main.ts`, `m6-probes.ts`. | Stare webowe liczby nie są native-baseline receipts. |
| SOLVER-02 | Native default host = 60 Hz, 4 substeps. | `SOURCE_FACT` | `samples/sample.h@959aefb`. | To host profile, nie część vehicle session. |
| SOLVER-03 | Web pinował 60 Hz, 4 substeps i contact 30/10/3. | `SOURCE_FACT` | PR #1 `main.ts`, `m6-probes.ts`. | Zgodne tylko z nazwanym default fixture. |
| SOLVER-04 | Substeps/contact hertz mogą zmieniać efektywny kontakt. | `SOURCE_FACT / PRELIMINARY_RESEARCH_CONTEXT` | `KOLA_FINDINGS.json` F-15/F-16. | Solver profile musi być receiptem; nie zakładać neutralności. |
| SOLVER-05 | `box3d.js@0.0.2` source identity jest częściowo rozwiązane. | `MEASURED_FACT` | Forensic workflow run #3: npm integrity, binding gitHead, tarball/WASM hashes. | Wciąż potrzebny upstream engine submodule SHA z rozszerzonego runu. |
| SOLVER-06 | Fork JV i npm WASM są semantycznie identyczne. | `BLOCKED / NOT_PROVEN` | Brak zakończonego engine-source delta audit. | Nie używać słowa parity na poziomie solvera. |

## E. Config i authored truth

| ID | Teza | Status | Locator / dowód | Konsekwencja |
|---|---|---|---|---|
| CFG-01 | Native session używa jednej typed field table do writer+reader. | `SOURCE_FACT` | `jozz_vehicle_m6_config_io.cpp@959aefb`. | Web nie powinien utrzymywać trzeciej ręcznej listy. |
| CFG-02 | Native serializuje 74 pola; `rackTravel` i runtime fields są deliberate non-serialized. | `SOURCE_FACT` | `CONFIG_AND_SESSION_SOURCE_AUDIT`. | Generator musi rozróżniać serialized/derived/runtime-only. |
| CFG-03 | Native session nie zapisuje wheel radius/width. | `SOURCE_FACT` | `kWheelEnvelopeFields` w native config I/O. | Wymiary muszą pochodzić z aktualnego asset/factory receipt. |
| CFG-04 | Web hardcodował wymiary koła i skalował aktualny GLTF do starego collidera. | `AUDIT_FINDING` | `rig-config.ts`, `config-loader.ts`, `wheel-asset-contract.ts`. | Dotychczasowy visual test mógł ukrywać utratę authored truth. |
| CFG-05 | Native factory baseline obejmuje asset-derived defaults i trailing-arm contract przed session overlay. | `SOURCE_FACT` | `jozz_vehicle_m6_rig_lab.cpp@959aefb`. | Sama sesja nie wystarcza do rekonstrukcji pojazdu. |
| CFG-06 | Web sanitizer odpowiada pełnemu native P6. | `REJECTED` | Porównanie `config-loader.ts` z `SanitizeJozzVehicleM6Config`. | Potrzebny native-generated validator/schema receipt. |

## F. Wheel program

| ID | Teza | Status | Locator / dowód | Konsekwencja |
|---|---|---|---|---|
| WHL-01 | Split sphere/sidewall jest legacy M6 runtime fixture. | `SOURCE_FACT` | `jozz_vehicle_m6_geometry.cpp/.cpp@959aefb`. | Może służyć do regresji starego pojazdu. |
| WHL-02 | Split envelope według kategorii jest odrzucony produktowo. | `OWNER_DECISION` | `KOLA_FINDINGS.json` F-04, `KOLA_00`, N-01/N-02. | Nie wolno nazywać go przyszłym systemem opony. |
| WHL-03 | Sidewall ma density 0 w native i web. | `AUDIT_FINDING / ALIGNED` | Native `CreateJozzVehicleM6WheelEnvelope`; web `createWheel()`. | Wycofuje hipotezę o podwójnej masie. |
| WHL-04 | Hipoteza „web dodaje ~29 kg przez sidewall” jest prawdziwa. | `WITHDRAWN` | Dokładny odczyt kodu ją obalił. | Nie cytować jako finding. |
| WHL-05 | Web sidewall material/filter jest identyczny z native. | `REJECTED / DELTA` | Web nie kopiuje rollingResistance i ustawia inne categoryBits. | Potrzebny filter/material truth-table test. |
| WHL-06 | Przyszła masa/bezwładność koła ma być jawna, niezależna od W2 collidera. | `OWNER_DECISION / PROGRAM_INVARIANT` | N-09, F-02 w wheel program. | Legacy density-derived mass nie może zostać API przyszłego WheelSpec. |
| WHL-07 | Torus/crown/prism jest gotowy do pojazdu/webu. | `REJECTED / NOT_READY` | R0.5 provisional, Q3 transfer pending, owner feel absent. | Nie portować bench candidate do vehicle runtime. |

## G. Geometria i jointy

| ID | Teza | Status | Locator / dowód | Konsekwencja |
|---|---|---|---|---|
| GEO-01 | Web wishbone zawiera shapeless bodies, explicit mass, hinges, spherical joints, coilovers, tie-rods. | `SOURCE_FACT_ABOUT_WEB` | `m6-rig.ts`. | To kandydat do odzysku, nie parity proof. |
| GEO-02 | Web i native local frames/mass data są już udowodnione jako identyczne. | `NOT_RUN` | Brak exported joint/body receipt. | Potrzebne numeric golden receipts per corner. |
| GEO-03 | Chassis 8-point hull jest równoważny native offset box hull. | `OPEN_EQUIVALENCE` | Porównanie builderów. | Zmierzyć centroid/mass/inertia/hull. |
| GEO-04 | Static toe jest ustawiane w tym samym etapie. | `REJECTED / DELTA` | Native podczas joint creation; web post-build controller constructor. | W clean builderze tworzyć prawidłową długość od razu. |
| GEO-05 | `normalize(zero)->+Y` jest bezpiecznym sanitizerem. | `REJECTED` | web `math.ts` vs native P6. | Invalid geometry ma zostać odrzucone. |

## H. Rendering, assety i scan

| ID | Teza | Status | Locator / dowód | Konsekwencja |
|---|---|---|---|---|
| VIS-01 | Wheel marker adapter naprawił skeleton aliasing i physical-center mapping w starym PoC. | `MEASURED_FACT_WITHIN_OLD_RUNTIME` | PR #1 Chrome receipts i owner screenshots. | Adapter jest kandydatem; nie dowodzi poprawnych physics dimensions source. |
| VIS-02 | Debug wishbone renderer pokazuje rzeczywisty stan arm bodies. | `REJECTED` | `renderer.ts` rysuje idealized endpoints. | Nowa diagnostyka pokazuje actual body pose + constraint error. |
| VIS-03 | Front-rig JSON/runtime drift może być legalnie override'owany w webie. | `REJECTED` | Native JSON vs current M6 runtime. | Naprawić upstream contract, potem konsumować. |
| SCAN-01 | Brak opcjonalnego scan assetu i invalid scan asset są tym samym stanem. | `REJECTED` | `world.ts` catch-all. | Rozdzielić ABSENT od PRESENT_INVALID. |
| SCAN-02 | Scan visual jest automatycznie survey/collision truth. | `REJECTED` | HomeScan authority map. | Osobne visual/collider/calibration receipts. |

## I. Product/readiness

| ID | Teza | Status | Locator / dowód | Konsekwencja |
|---|---|---|---|---|
| READY-01 | PR #1 jest solidnym fundamentem produktu. | `REJECTED` | Wszystkie dokumenty audytu PR #2. | Nie scalać; zachować jako evidence. |
| READY-02 | PR #2 zawiera odbudowaną implementację. | `REJECTED` | PR #2 ma status audit only. | Na tej fazie nie ma product code adoption. |
| READY-03 | Pełny audyt każdego pliku każdego repo jest zakończony. | `NOT_RUN / FALSE` | Brak complete recursive inventory dla wszystkich dużych repo. | Nie wolno twierdzić ukończenia. |
| READY-04 | Remote GitHub odtwarza lokalny working tree Jozza. | `FALSE` | Narzędzia nie widzą local uncommitted files. | Lokalny source receipt będzie osobnym wymaganiem. |
| READY-05 | Zielony WASM/Chrome smoke oznacza poprawny feel. | `REJECTED` | Owner rule + cross-project canon. | Smoke dowodzi wyłącznie określonego poziomu infrastruktury. |

## Najbliższe zmiany statusów

1. `SOLVER-05/06`: po zakończeniu expanded dependency workflow i engine delta audit.
2. `GEO-02/03`: po native exporterze body/joint/hardpoint receipts.
3. `CFG-02..05`: po native-generated schema/factory artifact.
4. `VIS-03`: po upstream correction asset contractu.
5. `READY-02`: dopiero po osobnym owner-approved implementation planie i pierwszym czystym kodzie.

Każda zmiana statusu wymaga commitowanego locatora albo owner decision receipt. Tekst w PR body nie jest źródłem prawdy.