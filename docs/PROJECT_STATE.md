# JV Box3D Web — kanoniczny stan projektu

Updated: 2026-08-03
Status: `CANONICAL ACTIVE STATE`

## 1. Linie projektu

| Linia | Rola | Status |
|---|---|---|
| `main` | minimalny root repozytorium | bez implementacji |
| `agent/bootstrap-web-poc` / PR #1 | działający eksperyment i failure lessons | kwarantanna, nie scalać jako fundament |
| `agent/fundamental-audit-rebuild` / PR #2 | audyt, receipts, kontrakty i errata | dokumentacja fundamentu |
| `agent/clean-browser-core` / PR #4 | czysta implementacja | aktywna linia rozwoju |

Dokładny ruchomy HEAD jest odczytywany z PR #4. Nie jest przypinany w tym dokumencie, ponieważ zmienia się przy każdym checkpointcie.

Operacyjny tracker bieżącej pracy:

```text
issue #3 — F1 Clean host and deterministic input timeline
PR #4    — F1 implementation diff
```

## 2. Gdzie jesteśmy

Pierwsza właściwa warstwa clean implementation już istnieje.

F1 zawiera:

- strict TypeScript project shell;
- Node major 24 i dokładne wersje zależności w `package.json`;
- transactional resource ownership i startup rollback;
- bounded fixed-step clock;
- jawne dropped-time intervals;
- timestamped input event timeline;
- `SteeringCommand = RELEASE | POSITION | RATE`;
- proporcjonalne signed-time integration krótkich tapów;
- deterministic same-timestamp/reversal ordering;
- disposable keyboard/focus/visibility lifecycle;
- restart hosta bez przeładowania strony;
- testy host/input;
- ADR-0001 dla polityki sub-frame taps.

F1 celowo nie zawiera:

- Box3D;
- pojazdu ani rack actuatora;
- Three.js i assetów;
- mobile touch controls;
- campus/scan;
- startup physics probes.

## 3. Aktualny poziom dowodu

Izolowana walidacja pomocnicza:

```text
TypeScript 5.8.3 strict compile — PASS
Node 22 deterministic tests     — 19/19 PASS
```

To jest wartościowy test logiki, ale nie kończy F1.

Brakujące bramki target environment:

1. wygenerowany i commitowany `package-lock.json`;
2. Node 24;
3. `npm ci`;
4. `npm run check`;
5. `npm run build`;
6. real-browser host/input lifecycle smoke.

Bez tych bramek nie używać statusu `F1 COMPLETE`.

## 4. Przyjęta polityka sub-frame taps

F1 rozstrzyga wyłącznie próbkowanie czasu urządzenia:

```text
LEFT  = +1
RIGHT = -1
both/neither = 0

RATE value = signed active time / fixed-step time
```

Konsekwencje:

- bardzo krótki tap nie znika;
- tap nie jest sztucznie rozciągany do pełnego kroku;
- event na końcu interwału działa od następnego kroku;
- ten sam timestamp jest porządkowany monotoniczną sekwencją;
- dropped interval konsumuje eventy i aktualizuje stan, lecz nie emituje komendy pojazdu;
- key-up nie uruchamia return-to-zero ani centre hold.

Źródło decyzji:

```text
docs/decisions/ADR-0001-subframe-rate-integration.md
```

Ta decyzja nie wybiera jeszcze:

- fizycznego rack rate;
- target-lead cap;
- serwa;
- feelu kierownicy.

## 5. Nadrzędne reguły mechaniki

Domyślny realistyczny pojazd:

```text
rackCenteringHertz = 0
uprightAssist = false
```

Release oznacza natychmiastowy hands-off. Nie istnieje:

- target do zera;
- centre timer;
- hostowa stabilizacja z yaw/slip/speed;
- wymaganie centrowania na postoju.

Ewentualny powrót podczas toczenia ma pochodzić z kontaktu, casteru, geometrii, linkage i bezwładności.

## 6. Kierunek M0

Po F1 kolejność jest zamknięta:

```text
F2 typed Box3D/WASM boundary + minimal contact fixture
F3 native-generated config/factory receipt
F4 minimal current M6 topology + one controller + trace
F5 precise RATE steering experiment + owner verdict
F6 touch adapter and first real mobile test
F7 minimal wheel adoption seam
F8 real visual assets one corner at a time
F9 campus
F10 scan
```

Nie rozpoczynać F2 przed przejściem target-toolchain i browser gate F1.

## 7. Koło i mobilka

### Koło

```text
legacy_m6_split_sphere_sidewall
```

jest tylko historycznym fixture regresyjnym. Nie jest future tire architecture.

Przyszły seam zachowuje:

```text
W1 WheelSpecSnapshot + explicit mass/inertia
W2 replaceable contact backend
neutral contact observer
W4 visual binding independent from W2
W3 absent until justified
```

Nie wybieramy backendu bez wystarczającego wyniku Wheel Scope.

### Mobilka

Telefon dostaje:

- touch adapter;
- pointer ownership;
- low visual profile;
- mały świat testowy.

Nie dostaje po cichu:

- innych substeps;
- innego contact tuningu;
- innego koła;
- innych mass data;
- urządzeniowo zależnej sztucznej kierownicy.

## 8. Źródła prawdy

Kolejność:

1. najnowsza bezpośrednia decyzja Jozza;
2. `AI_PROJECT_MEMORY.md`;
3. ten dokument;
4. `AUDIT_ERRATA_2026_08_03_PL.md`;
5. focused receipts i subsystem docs;
6. wcześniejsze broad audits;
7. dokumentacja PR #1.

Native baseline audytu:

```text
Jozzpoly/Box3d_FunProject
main@959aefb78587ce60cf2b8eb03ff82797a4165142
```

Wheel research snapshot:

```text
jozz-scan-terrain-f0@761bd3ef60992f7dec3bcdddf1945fdbc1cb0825
```

GitHub nie dowodzi lokalnych, niezacommitowanych zmian Jozza.

## 9. Narzędzia i dyscyplina

- GitHub connector dla pracy repozytoryjnej;
- normalne lokalne Git/Node/npm tylko tam, gdzie potrzebny jest prawdziwy working tree lub browser;
- issue #3 jako bieżący dziennik i bramki;
- PR #4 jako czysty diff implementacyjny;
- manual-only forensic workflows;
- brak automatycznych Actions dla dokumentacji i generowania lockfile;
- local/unit tests przed browser testem;
- browser test przed Box3D integration;
- jeden aktywny etap naraz.

Bezpieczna procedura lokalna:

```text
docs/operations/F1_LOCAL_RUNBOOK_PL.md
```

## 10. Najbliższy ruch

```text
safe local recovery/switch
→ package-lock generation on Node 24
→ npm ci / check / build
→ real browser F1 smoke
→ fixes, if any
→ close issue #3
→ begin F2
```

Nie dodawać pojazdu, Box3D ani mobile controls przed zamknięciem tych bramek.