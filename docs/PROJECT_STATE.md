# JV Box3D Web — kanoniczny stan projektu

Updated: 2026-08-03
Status: `CANONICAL ACTIVE STATE`

## 1. Gdzie jesteśmy

Projekt ma obecnie cztery rozdzielone linie:

| Linia | Rola | Status |
|---|---|---|
| `main` | minimalny root repozytorium | bez implementacji |
| `agent/bootstrap-web-poc` / PR #1 | działający eksperyment i zbiór failure lessons | kwarantanna, nie scalać jako fundament |
| `agent/fundamental-audit-rebuild` / PR #2 | audyt, receipts, kontrakty i errata | dokumentacja fundamentu |
| `agent/clean-browser-core` / PR #4 | docelowa czysta implementacja | aktywna linia dalszego rozwoju |

Clean runtime nie jest jeszcze kompletnym portem ani pojazdem, ale pierwsza właściwa warstwa implementacji już istnieje:

```text
F1 clean host/input checkpoint
head: 8148b643aee66719993201b1b66a4fd2aba8a8c2
issue: #3
PR: #4
```

Zawiera project shell, transactional lifecycle, fixed-step clock, timestamped input timeline, semantyczne komendy kierownicy i testy. Nie zawiera jeszcze Box3D ani kodu pojazdu.

PR #1 uruchamia się i był testowany przez Jozza, ale zawiera odrzucone mechanizmy i nie może być rozwijany przez dokładanie kolejnych poprawek.

## 2. Cel najbliższego milestone'u

Pierwszy clean milestone nie jest pełną grą ani pełnym portem JV.

```text
Clean Browser Core M0
```

Ma udowodnić:

1. przypięty i opisany runtime Box3D/WASM;
2. transakcyjny lifecycle aplikacji;
3. fixed-step host z timestamped input timeline;
4. jawne `SteeringCommand: RELEASE | POSITION | RATE`;
5. minimalny płaski świat z przypiętym solver profile;
6. minimalną aktualną topologię M6 z jednym controllerem;
7. controller trace ujawniający wszystkie siły/targety kierownicy;
8. brak artificial centering na postoju;
9. desktopowy eksperyment małych tapów;
10. build/typecheck/test bez uruchamiania kosztownych sond przy zwykłym starcie.

Dopiero po M0 następują mobile input, wheel seam, realne visuals, campus i scan.

## 3. Nadrzędne decyzje właściciela

### Realizm

Domyślny pojazd nie zawiera ukrytych sił stabilizujących ani sztucznego self-centeringu.

```text
rackCenteringHertz = 0
uprightAssist = false
```

Puszczenie kierownicy oznacza natychmiastowy hands-off. Ewentualny powrót podczas toczenia wynika z fizyki.

### Precyzyjne sterowanie cyfrowe

Krótki tap ma dawać mały ruch, ale bez automatycznego powrotu do zera. Pierwszy badany model to rack-space `RATE` z natychmiastowym `RELEASE` po key-up/pointer-up.

F1 rozstrzyga wyłącznie sposób próbkowania czasu urządzenia:

```text
sub-frame tap
→ signed active time / fixed-step time
→ proporcjonalna komenda RATE
```

One-step latch nie jest domyślną polityką. Nie wybiera to jeszcze fizycznego rack rate ani feelu. Decyzję zapisuje `docs/decisions/ADR-0001-subframe-rate-integration.md`.

### Koło

Sfera i legacy split są zbyt ograniczające i nie definiują przyszłej opony. Web przygotowuje wymienny seam, lecz nie wybiera backendu bez wyniku programu Wheel Scope.

### Mobilka

Telefon jest bliskim celem testowym. Nie dostaje osobnej, uproszczonej fizyki. Dostaje inny input adapter, lżejszy render profile i mały świat.

### Owner verdict

Jozz ocenia feel, naturalność i obraz. Automatyzacja mierzy mechanizm, stabilność, zgodność scenariusza i granice.

## 4. Dokładne źródła użyte przez fundament

### Native JV baseline

```text
Jozzpoly/Box3d_FunProject
main@959aefb78587ce60cf2b8eb03ff82797a4165142
```

### Wheel research snapshot

```text
Jozzpoly/Box3d_FunProject
jozz-scan-terrain-f0@761bd3ef60992f7dec3bcdddf1945fdbc1cb0825
```

### Historical browser implementation

```text
Jozzpoly/JV-Box3D-Web-experiment
agent/bootstrap-web-poc@891c7561142b601f62ea76b68b0f55f8fababc6c
```

### Box3D browser dependency receipt

```text
box3d.js@0.0.2
binding: isaac-mason/box3d.js@2617a0ff763a60c9f17cee57c6ea72aab75a5077
engine:  erincatto/box3d@8441b4a06d6d09dcfb0b0f704df4d847d1437b92
```

JV fork jest potomkiem tego engine commita. Aktywna core delta dla continuous-disabled M6 fixture nie została znaleziona, ale pełna runtime equivalence nadal wymaga binding/body/joint/contact receipts.

## 5. Co zostało definitywnie odrzucone

- return-to-zero po puszczeniu A/D;
- `steeringEngaged` utrzymywane podczas automatycznego powrotu;
- centre-hold timer;
- test wymagający centrowania na postoju;
- speed/yaw/slip feedback ukryty w adapterze klawiatury;
- render-frame polling jako źródło komend fixed-step;
- one-step latch jako ukryta minimalna długość każdego tapu;
- silent fallback z invalid session do innego auta;
- ręczny webowy config mirror jako trwałe źródło prawdy;
- traktowanie legacy split jako future wheel;
- zmiana natury koła kategorią powierzchni;
- mobile physics profile zmieniany automatycznie;
- pełne sondy uruchamiane przy każdym normalnym starcie;
- stwierdzenie parity na podstawie build/smoke;
- wholesale merge/cherry-pick PR #1;
- używanie Git Diff Patcher Bridge.

## 6. Co pozostaje otwarte

- finalny rack rate i target-lead cap;
- target Node 24/TypeScript 7/Vite 8 oraz prawdziwy browser run F1;
- wygenerowanie i commit `package-lock.json`;
- zakres native-generated config/factory export;
- wybór długoterminowy: upstream WASM z delta contractem kontra binding z JV fork;
- future wheel backend i poziom ingerencji w manifold/solver;
- właściwy visual body/wheel/front-rig contract;
- peak memory i mesh semantics dla scanów;
- mobile performance budget na prawdziwym urządzeniu;
- lokalne, niezacommitowane różnice w working tree Jozza.

Proporcjonalne signed-time integration jest przyjętą polityką F1, ale nadal wymaga target-browser validation. Otwarte pytanie nie blokuje M0, jeżeli nie należy do minimalnego slice'u.

## 7. Granice pierwszej implementacji

### Wchodzi do M0

- mały, typed app shell;
- jeden lifecycle owner;
- fixed-step scheduler;
- timestamped raw input events;
- keyboard adapter;
- `RELEASE/POSITION/RATE` contract;
- minimalny runtime capability receipt;
- jawny physics profile;
- minimalny ground fixture;
- M6 topology/controller w niezbędnym zakresie;
- primitive renderer i debug trace;
- deterministic tests input/controller;
- desktop manual drive route.

### Nie wchodzi do M0

- Central Test Campus;
- scan;
- real body/wheel/suspension GLTF;
- touch UI;
- nowy wheel backend;
- tire law;
- PWA;
- replay editor;
- pełny native session importer;
- wiele pojazdów;
- backward compatibility starego webowego formatu.

## 8. Wymagane warstwy odpowiedzialności

```text
AppHost
  lifecycle, startup, route, diagnostics

FixedStepClock
  render time -> physics steps

RawDeviceEventTimeline
  keyboard/pointer/gamepad events with timestamps

InputAdapter
  device events -> semantic driver command

VehicleController
  exactly one owner of drive/steering/ARB/aero updates

VehicleRig
  topology, body/joint IDs and state only

PhysicsRuntimeAdapter
  typed Box3D/WASM boundary and compatibility helpers

Config/FactoryReceipt
  source values, derived values, feature support and provenance

Renderer
  observer only; never physics authority

Diagnostics
  consumes controller/runtime trace; never reimplements control laws
```

## 9. Dowody wymagane przy odzyskiwaniu kodu PR #1

Każdy odzyskiwany mechanizm otrzymuje kartę:

```text
behavior/component name
old file/function
native source locator or explicit new experiment
known defects in old version
clean API boundary
independent tests
remaining deltas
owner verdict status
```

Brak karty oznacza implementację od zera, nie kopiowanie.

## 10. Polityka CI i narzędzi

### Zwykłe CI produktu

Docelowo:

```text
npm ci
format/lint
strict typecheck
unit tests
build
small Node/WASM contract tests
small headless browser startup/input test
```

Na etapie F1 nie uruchamiamy GitHub Actions tylko po to, aby wygenerować lockfile albo powtórzyć testy możliwe lokalnie.

### Forensic workflows

Trzy istniejące workflowy audytowe są manual-only. Nie uruchamiać ich przy dokumentacyjnych commitach ani zwykłym PR.

### Runtime probes

Pełne sondy są osobną trasą/komendą CI. Nie blokują first useful frame normalnej aplikacji.

### Operacyjny tracker

- issue #3: bieżące bramki i checkpoint F1;
- PR #4: wyłącznie diff implementacyjny clean core;
- README: szybki status i narzędzia;
- broad audit docs nie są codziennym backlogiem.

## 11. Warunek przejścia do dalszych etapów

F1 jest gotowe dopiero, gdy:

- istnieje przypięty `package-lock.json`;
- `npm ci`, `npm run check` i `npm run build` przechodzą na Node 24;
- prawdziwa przeglądarka potwierdza host i lifecycle klawiatury;
- zwykły startup nie wykonuje physics probes;
- input trace jest niezależny od render FPS;
- sub-frame tap nie znika ani nie jest automatycznie rozciągany do pełnego kroku;
- focus/visibility release działa w pierwszym właściwym fixed-step interval;
- nie ma claimu o rack physics ani feelu.

M0 jest gotowe dopiero później, gdy dodatkowo:

- release wyłącza fizyczny hands-on w pierwszym fixed step;
- brak targetu do centrum jest widoczny w controller trace;
- minimalny Box3D fixture jest finite i ma source/config receipt;
- minimalny M6 controller jest jedynym właścicielem sił;
- Jozz może wykonać desktopowy test krótkich tapów;
- nie ma claimu o feelu przed jego werdyktem.

## 12. Następny ruch

Rozwój odbywa się na:

```text
agent/clean-browser-core
```

Najbliższa kolejność:

```text
bezpieczne odzyskanie i przełączenie lokalnego brancha
→ wygenerowanie clean package-lock z package.json F1
→ npm ci / check / build na Node 24
→ real browser F1 smoke i korekty
→ zamknięcie issue #3
→ dopiero potem F2: typed Box3D/WASM boundary
```

Nie dodawać kodu pojazdu przed przejściem bramek F1.
