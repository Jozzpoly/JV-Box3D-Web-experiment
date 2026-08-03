# Mapa autorytetu między projektami Jozza — 2026-08-03

Status: `IN_PROGRESS / KNOWLEDGE_BOUNDARIES_ONLY`

Cel: ustalić, co każdy projekt może wnieść do audytu JV Web oraz czego nie wolno z niego kopiować lub wywnioskować. Dokument nie tworzy wspólnej architektury ani wspólnej bazy kodu.

## Zasada nadrzędna

Podobieństwo problemu nie tworzy automatycznie współdzielonego rozwiązania. Każdy transfer przechodzi przez:

```text
observed fact / owner-ratified behavior
→ named lesson or clean contract candidate
→ project-local decision
→ project-local implementation and tests
```

Nigdy:

```text
legacy code or successful demo
→ bezpośredni fundament innego projektu
```

## 1. Jozz Vehicle / Box3d_FunProject

### Autorytet

- aktualna topologia, geometria, config i zachowanie pojazdu;
- fizyczny model kierownicy, racka, casteru, tie-rodów i tarcia;
- failure lessons M6/M7+;
- session/preset contract;
- asset contracts i aktualny runtime ownership;
- Central Test Campus i diagnostyka JV.

### Zasada duszy

Zachowanie kierowcy ma wynikać z mechanizmu. Software blend do kierunku jazdy został usunięty jako scripted drift. Realistyczny default ma `rackCenteringHertz=0`; przy postoju nie istnieje fizyczna siła casteru zdolna sama wycentrować koła.

### Dozwolony transfer do JV Web

- dokładny port zachowania na wskazanym native SHA;
- generowane config/schema/receipts;
- eksportowane scenariusze i golden measurements;
- jawne adaptery różnic native Box3D ↔ box3d.js;
- assety i kontrakty w zakresie autoryzowanym przez właściciela.

### Niedozwolony transfer

- M5 jako aktualny vehicle snapshot;
- magiczne liczby bez locatora;
- ręczna kopia opisana jako parity bez niezależnego porównania;
- ukryty assist wprowadzony po stronie hosta;
- lokalny override błędnego native contract zamiast upstream fix.

## 2. JV Box3D Web Experiment

### Rola

Browser host i adapter aktualnego JV, nie niezależna gra z własną interpretacją pojazdu.

### Źródła prawdy

- config/topologia/fizyka: przypięty native JV;
- runtime WebAssembly: dokładnie przypięty `box3d.js` i rzeczywiste eksporty;
- wizualne assety: synchronizowany source hash + authored contract;
- host input/camera/UI: web-local, ale nie może dodawać sił ani stabilizacji do pojazdu;
- owner feel: wyłącznie test Jozza, osobny od CI.

### Zakaz

Web nie może „naprawiać” niepożądanego feelu przez niejawny input model, sztuczny target racka, yaw feedback, counter-steer, upright assist, traction assist ani dowolną inną energię/siłę nieobecną w zatwierdzonym configu JV.

## 3. JOZZ Engineering Sandbox

### Autorytet

JES jest osobnym greenfieldowym produktem. Jego kanon dostarcza rygor procesu:

- FACT / OWNER_RATIFIED / INFERENCE / RECOMMENDATION;
- authored semantic document jako prawda;
- runtime, renderer i physics jako odbudowywalne projekcje;
- smoke/build nie dowodzi produktu;
- failure budget i negatywne testy;
- brak native handles w authored truth;
- agent nie wydaje owner feel verdictu.

### Dozwolona wymiana wiedzy

- model source authority;
- receipts i rozdział dowodów;
- fail-closed import;
- transakcyjne build/runtime boundaries;
- zasada, że visual binding nie zmienia mechaniki;
- nazwanie statusu `NOT_RUN` zamiast udawania PASS.

### Niedozwolona wymiana

- wspólna baza kodu w obecnym etapie;
- przebudowa JV pod JES;
- kopiowanie kodu, schema, helperów lub magicznych liczb JV/VAW do JES;
- przedstawianie JES jako następcy technicznego aktualnego JV.

## 4. Voxel Aeronautics Workshop

### Autorytet

VAW dostarcza sprawdzone lekcje o:

- pętli build → test → observe → improve;
- pojedynczym authored source of truth;
- compilerze jako jedynej drodze do runtime data;
- oddzieleniu structural/mechanical/signal graphs;
- renderer-only visual asset packs;
- niezależnych instancjach importowanych zasobów;
- procedural fallbackach, które nie przejmują authored truth;
- pułapce rozwoju zależnego od agentów.

### Przydatność dla JV Web

- wheel/front-rig adapter powinien mieć jawny source asset, normalized contract i disposable renderer instance;
- reload/reimport nie może cicho zmienić mechaniki;
- fallback ma zgłaszać porażkę, a nie udawać poprawny produkt.

### Zakaz

- automatyczne przenoszenie `CraftModel`, compiler stacku, visual pack schema lub runtime frameworka do JV Web;
- traktowanie VAW jako uniwersalnego engine foundation.

## 5. Coopege

### Autorytet

Coopege pokazuje dojrzałe praktyki dla aplikacji webowej:

- `npm ci --ignore-scripts` i jawny validation entrypoint;
- fixed tick, deterministyczny RNG, stable IDs, checksumy;
- canonical `GameWorld` niezależny od DOM/cam/render;
- atomowe odrzucanie uszkodzonego save;
- wersjonowane protokoły i migracje;
- techniczne PASS oddzielone od owner retestu;
- negatywny owner test ponownie otwiera gate mimo zielonej automatyzacji.

### Przydatność dla JV Web

- lockfile i `npm ci`;
- deterministic scenario receipts;
- jawne statusy `TECH_VERIFIED`, `OWNER_RETEST_REQUIRED`, `FAIL`;
- runtime state niezależny od renderera;
- brak awansu gate'u po samym CI.

### Zakaz

- przenoszenie modelu 30 Hz, save schema, LAN protocol lub gameplay systems do JV;
- używanie deterministycznego game-world patternu jako dowodu bitowej deterministyczności Box3D/WASM bez pomiaru.

## 6. HomeScan Web Builder

### Autorytet

- skan, site i building są osobnymi źródłami prawdy;
- consumer photogrammetry jest locked visual reference, nie survey truth;
- raw bytes żyją poza project document;
- importer wykonuje bounded inspection przed renderem;
- preview derivative ma hash/provenance;
- renderer nie mutuje dokumentu;
- ciężki lub błędny asset jest blokowany, a nie dekodowany dla efektownego demo.

### Przydatność dla JV Web

- scan visual i scan collider muszą być osobnymi, jawnie powiązanymi derivative'ami;
- każdy ma source hash, transform/alignment evidence i bezpieczeństwo pamięci/rozmiaru;
- `ABSENT_OPTIONAL` i `PRESENT_INVALID` są odrębnymi stanami;
- photogrammetry nie staje się automatycznie collision/survey truth.

### Zakaz

- używanie scan visual jako physics collider bez osobnej recepty;
- twierdzenie o dokładności metrycznej bez calibration evidence;
- serializacja Three.js objects lub lokalnych ścieżek jako project truth.

## 7. Planet Matter Lab

### Stan zaobserwowany

Aktualny `main` ma jeden commit i tylko `README.md`. README deklaruje formal research foundation oraz odsyła do `AI_PROJECT_MEMORY.md` i `docs/`, których w repo nie ma.

### Werdykt

`INCOMPLETE_BOOTSTRAP / PRE_IMPLEMENTATION`.

### Przydatność dla JV Web

Na dziś wyłącznie świadomość przyszłego problemu: globalnie zakrzywiona, adaptacyjna materia i terrain research nie mogą zostać redukowane do prostego „spherical voxel map”. Brak jednak repozytoryjnego kontraktu, który wolno już konsumować.

### Zakaz

- implementowanie planetarnego terrain systemu w JV Web;
- nazywanie brakujących dokumentów istniejącym kanonem;
- używanie rozmów/pamięci agenta jako zamiennika brakującego source receipt w repo.

## 8. Simply_game_experiment

### Stan zaobserwowany

README deklaruje „professional-grade”, „commercial-quality” i „launch ready”, wymieniając bardzo szeroki zestaw funkcji. Sam tekst nie stanowi dowodu ich działania ani owner acceptance.

### Lekcja

To negatywny przykład języka statusu. Lista funkcji i duży README nie są receipt'em produktu.

### Zakaz

- kopiowanie systemów, dynamic difficulty, procedural generation lub architektury bez odrębnego audytu kodu;
- używanie marketingowego języka tego README jako standardu dokumentacji.

## 9. Jozz_Test_Mod_0.04

### Stan zaobserwowany

README jest zasadniczo szablonem NeoForge/MDK i nie opisuje unikalnego celu, stanu ani źródła prawdy moda.

### Lekcja

Repo może zawierać realną pracę, której root documentation nie reprezentuje. Przed jakimkolwiek transferem potrzebny jest osobny inventory/code audit.

### Zakaz

- traktowanie README jako dowodu architektury moda;
- przenoszenie wersji NeoForge, mappings lub scaffoldingu do innych projektów.

## 10. Granice wspólne

### Dozwolone wspólne wzorce

- source authority i locatory;
- receipts z dokładnym SHA/toolchainem;
- negatywne testy;
- fail-closed validation;
- authored/runtime/render separation;
- manual owner gate oddzielony od automation;
- jawny status ograniczeń;
- provenance assetów;
- odwracalne eksperymenty.

### Wspólny zakaz

- silent fallback zmieniający znaczenie danych;
- magic stabilization;
- agentowy owner verdict;
- „smoke passed” → „product ready”;
- renderer/UI jako mechanika;
- legacy code jako automatyczny fundament;
- ruchomy dependency/source bez receipt;
- dokument opisujący przyszłość tak, jakby już była wykonana.

## 11. Otwarte części audytu

- pełny inventory drzew dużych prywatnych repozytoriów pozostaje ograniczony przez brak recursive-tree action w dostępnym connectorze;
- Coopege, VAW, JES i HomeScan wymagają dalszego task-specific czytania, nie bezmyślnego eksportu całych dokumentacji do JV Web;
- `Jozz_Test_Mod_0.04` i `Simply_game_experiment` wymagają osobnego code audit, zanim otrzymają jakąkolwiek rolę poza kontekstem historycznym;
- Planet Matter Lab wymaga uzupełnienia repozytoryjnego kanonu w jego własnym projekcie, nie w JV Web.