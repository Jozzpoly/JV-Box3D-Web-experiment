# Klasyfikacja 34 plików draft PR #1 — 2026-08-03

Status: `AUDIT_PASS_1_COMPLETE / IMPLEMENTATION_NOT_ADOPTED`

Zakres: wszystkie ścieżki zmienione w draft PR #1 (`agent/bootstrap-web-poc` względem `main`). Klasyfikacja opisuje los funkcji/pliku w odbudowie, nie pozwolenie na bezpośrednie kopiowanie.

Legenda:

- `KEEP_AFTER_PROOF` — cel jest prawidłowy; implementację można odtworzyć po niezależnym dowodzie.
- `REWRITE` — cel potrzebny, lecz obecna implementacja lub granica jest wadliwa.
- `DELETE` — mechanizm nie ma miejsca w realistycznym defaultcie.
- `QUARANTINE` — dokument/kod zawiera wymieszane fakty i błędne wnioski; odzyskiwać tylko wskazane fakty.
- `UPSTREAM_FIRST` — prawda musi zostać naprawiona/generowana w `Box3d_FunProject` przed importerem webowym.
- `PROVISIONAL` — spike przydatny badawczo, bez prawa do nazywania fundamentem.

| # | Ścieżka | Status | Werdykt audytu |
|---:|---|---|---|
| 1 | `.github/workflows/build.yml` | `REWRITE` | Sensowny minimalny workflow, lecz używa `ubuntu-latest`, `npm install`, ruchomego remote JV i nie ma lockfile/source receipt. W odbudowie: przypięty runner/toolchain tam, gdzie praktyczne, `npm ci`, pinned native SHA, oddzielne testy kontraktowe. |
| 2 | `.gitignore` | `REWRITE` | Słusznie ignoruje lokalną sesję i generowane assety, ale brak polityki lockfile/receiptów i rozróżnienia cache od wygenerowanego snapshotu. |
| 3 | `AI_PROJECT_MEMORY.md` | `QUARANTINE` | Zawiera poprawne locatory i historię wheel/WASM, ale awansuje artificial centre capture do kanonu. Nie może być pamięcią nowej gałęzi. |
| 4 | `LICENSE` | `KEEP_AFTER_PROOF` | MIT dla webowego kodu jest spójne z deklarowanym kierunkiem, lecz provenance kopiowanych assetów i fragmentów native musi pozostać osobno udokumentowane. |
| 5 | `README.md` | `QUARANTINE` | Instrukcje uruchomienia i workspace layout są użyteczne; statusy parytetu, steering host i gotowość są skażone. Napisać od zera po odbudowie. |
| 6 | `docs/PORTING_NOTES.md` | `QUARANTINE` | Dobre fakty o WASM i markerach koła są wymieszane z uzasadnieniem sztucznego centrowania i lokalnym override driftu kontraktu. |
| 7 | `docs/WEB_CONVERSION_FOUNDATION.md` | `QUARANTINE` | Dokument nazwany fundamentem zawiera zakazany centre-hold jako invariant i gate. Nie poprawiać kosmetycznie; zastąpić po audycie. |
| 8 | `index.html` | `KEEP_AFTER_PROOF` | Prosty shell canvas/HUD/error. Usunąć później fałszywe statusy telemetryczne, lecz struktura nie ingeruje w fizykę. |
| 9 | `package.json` | `REWRITE` | Zależności bez lockfile nie tworzą reprodukowalnego buildu. Skrypty mają łączyć się z pinned bridge i niezależnymi testami. |
| 10 | `public/assets/scan/README.md` | `REWRITE` | Dobre rozdzielenie visual/collision, ale „manifold-enough” jest nieprecyzyjne, a runtime maskuje invalid jako absent. Potrzebny jawny schema/preflight. |
| 11 | `public/assets/vehicle/README.md` | `REWRITE` | Tekst jest nieaktualny wobec późniejszej synchronizacji GLTF. Nowy dokument ma opisywać generowane/ignorowane assety i provenance receipt. |
| 12 | `src/input-model.ts` | `DELETE / REDESIGN_INPUT_BOUNDARY` | Centre return + `0.35 s` hold sztucznie centrują rack na postoju. Ewentualny rate limiter musi reprezentować tylko prędkość zmiany aktywnej komendy; key-up oznacza release, nie target zero. |
| 13 | `src/input.ts` | `REWRITE` | Odczyt klawiszy jest prosty, ale `steeringEngaged` umożliwia utrzymywanie servo bez aktywnego wejścia. Potrzebna jawna semantyka aktywnego momentu/komendy kierowcy. |
| 14 | `src/main.ts` | `REWRITE` | Composition root miesza preflight, skażone bramki produktu, UI i pętlę gry. Powinien składać zwalidowane komponenty; nie definiować kryteriów fizyki w HUD. |
| 15 | `src/physics/box3d-runtime.ts` | `KEEP_AFTER_PROOF` | Jawna granica native/WASM i shim są wartościowe. Wzmocnić typowanie, sygnatury, wersję paczki i single-source formułę shim. |
| 16 | `src/physics/config-loader.ts` | `UPSTREAM_FIRST / REWRITE` | Ręczne listy pól, niepełny sanitizer, warnings zamiast fail-closed, silent factory fallback. Potrzebny generowany/exportowany kontrakt native z wersją i receipt. |
| 17 | `src/physics/m6-parity-controller.ts` | `REWRITE` | Zawiera wiele poprawnych fragmentów native, ale nazwa parity jest nieudowodniona, artificial `steeringEngaged` skaża hands-on, optional centering nie odpowiada dokładnie native, a kod jest ręczną kopią. |
| 18 | `src/physics/m6-probes.ts` | `REWRITE / DELETE_LOW_SPEED_CAPTURE` | Straight/P1 są kandydatami po porównaniu z native. Keyboard/low-speed probes testują workaround i wymagają centrowania na postoju. Zastąpić negatywnym testem sił/trybu. |
| 19 | `src/physics/m6-rig.ts` | `REWRITE` | Topologia zawiera wiele wiernych mechanizmów, ale plik ma drugi, rozjechany kontroler i ręcznie skopiowaną matematykę. Rig ma być topology-only. |
| 20 | `src/physics/math.ts` | `KEEP_AFTER_PROOF` | Małe funkcje wartościowe. `normalize()` nie powinno cicho zwracać +Y dla wektora zerowego w kodzie mechaniki; wymagany fail/Result na granicach konstrukcyjnych. |
| 21 | `src/physics/rack-response-watchdog.ts` | `REWRITE` | Obserwator jest dobrym narzędziem, ale sam ponownie zgaduje stan kontrolera i używa skażonego `steeringEngaged`. Powinien konsumować jawny controller trace. |
| 22 | `src/physics/rig-config.ts` | `UPSTREAM_FIRST / REWRITE` | Factory snapshot ma poprawny default `rackCenteringHertz=0`, ale cały schema jest ręczną kopią podlegającą driftowi. |
| 23 | `src/render/capsule-geometry.ts` | `RENAME / KEEP_AS_VISUAL_STANDIN` | Lokalny cylinder jest dopuszczalnym visual-only stand-inem, ale nie może podszywać się pod Three `CapsuleGeometry`. |
| 24 | `src/render/front-rig-contract.ts` | `UPSTREAM_FIRST / REWRITE` | Słusznie wykrywa 13 nodes, ale lokalnie legalizuje drift JSON/runtime. Naprawić neutralną rolę w native contract, potem importować bez wyjątku. |
| 25 | `src/render/renderer.ts` | `REWRITE` | Camera/light/body/wheel loading są kandydatami. Debug wishbones idealizują połączenie chassis↔knuckle zamiast pokazywać realne arm bodies; prywatne `b3` wyciągane castem; hardcoded registry transform. |
| 26 | `src/render/vehicle-camera.ts` | `KEEP_AFTER_PROOF` | Czysta warstwa wizualna, orbit/zoom/reset, brak wpływu na fizykę. Wymaga tylko zwykłych testów lifecycle/input. |
| 27 | `src/render/wheel-asset-contract.ts` | `KEEP_AFTER_PROOF / STRENGTHEN` | Najbardziej wartościowy adapter: physical centre, marker scale, independent skeletons. Dodać duplicate rejection, Axis A/B check, signed mount offset, mirror contract i wymagany skin count. |
| 28 | `src/scene/world.ts` | `REWRITE` | Campus/rocks są ręcznymi kopiami bez pinned exported contract. Scan catch maskuje invalid jako absent i nie ma solidnej walidacji mesh/alignment. |
| 29 | `src/style.css` | `KEEP_AFTER_PROOF` | Prezentacyjny shell bez wpływu na mechanikę. |
| 30 | `tools/check-box3d-runtime.mjs` | `KEEP_AFTER_PROOF / STRENGTHEN` | Realne WASM i smoke są wartościowe. Regex nie wykrywa aliasowanych/destrukturyzowanych wywołań, nie sprawdza sygnatur i duplikuje shim. |
| 31 | `tools/smoke-browser.mjs` | `REWRITE` | Browser runtime check wartościowy, lecz obecnie egzekwuje zakazany centre capture. Rozdzielić startup/visual/physics receipts; żadnego owner-feel verdictu. |
| 32 | `tools/sync-jv-assets.mjs` | `REWRITE` | Dobry kierunek local-first + SHA, ale remote `main` jest ruchomy, cache nie ma resolved commit, sesja nie ma schema validation. Dwa tryby: local working tree i pinned snapshot. |
| 33 | `tsconfig.json` | `KEEP_AFTER_PROOF / STRENGTHEN` | `strict` i `noUncheckedIndexedAccess` są dobre. Usunąć mylący alias; ograniczać `any`; rozważyć `skipLibCheck=false` po kontroli bindingu. |
| 34 | `vite.config.ts` | `REWRITE` | `base`/target/sourcemap są sensowne. Alias podszywający lokalny cylinder pod addon Three usunąć. |

## Zbiorczy wynik

```text
KEEP_AFTER_PROOF / STRENGTHEN : 10
REWRITE / UPSTREAM_FIRST      : 19
DELETE                         : 1 mechanizm + jego skażone testy
QUARANTINE                     : 4 dokumenty
```

Liczby nie są oceną jakości procentowej. Jeden `FATAL` w granicy input→rack wystarcza, aby odrzucić gałąź jako fundament, nawet jeśli część infrastruktury i renderu jest użyteczna.

## Następna bramka

Przed pierwszym kodem na czystej gałęzi muszą powstać:

1. dokładny source receipt natywnego JV;
2. specyfikacja input semantics bez sztucznego centrowania;
3. specyfikacja pojedynczego kontrolera;
4. test negatywny `NO_ARTIFICIAL_CENTERING_AT_REST`;
5. plan generowania configu/sanitizera;
6. lista native/web różnic Box3D API;
7. pinned dependency/bootstrap plan.