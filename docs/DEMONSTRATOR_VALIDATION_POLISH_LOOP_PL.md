# JV Web Demonstrator — pętla walidacyjna, podważająca i polishująca

Updated: 2026-08-04
Status: `ACTIVE PRODUCT LOOP`
Owner: Jozz

## 1. Cel

Dostarczyć poważny demonstrator JV, który:

- uruchamia się jako statyczna strona;
- działa na desktopie i telefonie;
- posiada przemyślane sterowanie mobilne;
- docelowo pozwala jeździć po zoptymalizowanym skanie;
- może zostać udostępniony przez GitHub Pages bez własnego serwera;
- nie udaje native parity, dopóki jej nie zmierzono;
- nie publikuje się automatycznie.

## 2. Niezmienne granice

1. Repo pozostaje prywatne do `PUBLIC-READY PASS` i jawnej decyzji Jozza.
2. Pages pozostaje wyłączone do osobnego `PAGES-PUBLISH PASS`.
3. `legacy_ts_m6` nie otrzymuje nowych produktowych mechanik fizycznych.
4. Mobilny host może być rozwijany na backendzie referencyjnym, ale publiczny HUD pokazuje prawdziwą tożsamość builda.
5. Skan źródłowy, pliki robocze i prywatne metadane nie trafiają automatycznie do publicznego repo.
6. Render mesh, collision mesh i source scan są trzema odrębnymi artefaktami.
7. Jeden zielony test nie zastępuje testu na realnym telefonie.
8. Każda bramka ma próbę przeciwną, która ma wykazać, że potrafi odrzucić znany zły przypadek.

## 3. Mikroiteracja

Każdy krok ma dokładnie tę postać:

```text
Obserwacja
→ hipoteza
→ konkurencyjne wyjaśnienie
→ test przeciwny
→ najmniejsza zmiana
→ właściwy gate
→ krytyka rezultatu
→ receipt albo jawne PENDING
```

Po trzech mikroiteracjach pętla sama jest oceniana. Bramka, która nie wykrywa realnego błędu ani nie chroni ważnego inwariantu, zostaje uproszczona lub usunięta.

## 4. Macierz walidacji

### V0 — public safety i provenance

Claim:

```text
Repo może stać się publiczne bez przypadkowego ujawnienia sekretów,
prywatnych assetów albo niejasnych praw do kodu.
```

Wymagane:

- `LICENSE`;
- `THIRD_PARTY_NOTICES.md`;
- current-tree secret/privacy scan;
- reachable-history scan wszystkich branchy/refów;
- klasyfikacja każdego review finding;
- audit dużych i binarnych blobów;
- publiczny README;
- osobna decyzja o prawach do skanu i modeli.

Test przeciwny:

- sztuczny token i plik `.env` muszą dać FAIL;
- usunięty w późniejszym commicie sekret nadal musi zostać znaleziony w historii.

Owner gate:

```text
Jozz akceptuje dokładnie to, co stanie się publiczne.
```

### V1 — portable static artifact

Claim:

```text
Jedna paczka działa z root path i nested repository path.
```

Wymagane:

- względna baza Vite;
- `.nojekyll`;
- `index.html` w korzeniu;
- manifest plików z SHA-256;
- brak source map;
- brak root-absolute runtime URL;
- wszystkie lokalne odwołania istnieją;
- build nie publikuje niczego.

Test przeciwny:

- `/assets/app.js` musi dać FAIL;
- brakujący CSS asset musi dać FAIL;
- zmiana pliku po stworzeniu manifestu musi dać FAIL.

### V2 — desktop runtime

Claim:

```text
Gotowa paczka uruchamia fizykę i renderer z lokalnego HTTP.
```

Wymagane:

- Chrome/Edge smoke;
- root path;
- sztuczny nested path;
- startup/restart;
- focus loss;
- tab hide/resume;
- brak uncaught errors;
- build identity widoczna w Lab Mode.

Test przeciwny:

- brak WASM lub receipt musi prowadzić do czytelnego failure UX, nie pustego ekranu.

### V3 — mobile shell

Claim:

```text
Interfejs mieści się i pozostaje obsługiwalny na realnym telefonie.
```

Wymagane:

- landscape-first layout;
- safe-area insets;
- brak browser zoom przy sterowaniu;
- orientation change;
- background/resume;
- fullscreen jako opcja, nie warunek;
- loading i error state.

Test przeciwny:

- mały viewport i notch nie mogą zasłaniać resetu ani podstawowego sterowania.

### V4 — touch input ownership

Claim:

```text
Każdy palec ma jednego właściciela, a puszczenie sterowania daje RELEASE.
```

Wymagane:

- steering RATE pad;
- throttle;
- brake/reverse;
- camera gesture w osobnej strefie;
- pointer/touch capture;
- cancel, blur, visibility i dispose;
- równoczesny steering + throttle + camera;
- brak `POSITION(0)` przy puszczeniu RATE.

Test przeciwny:

- skrzyżowane palce, touchcancel i wyjście palca poza element nie mogą pozostawić aktywnego gazu lub hands-on.

Owner gate:

```text
Jozz ocenia precyzję, czytelność i zmęczenie dłoni na własnym telefonie.
```

### V5 — mobile performance

Claim:

```text
Demonstrator pozostaje grywalny i stabilny termicznie.
```

Mierzymy osobno:

- fixed-step debt;
- render FPS/frame time;
- JS heap, gdy dostępny;
- WASM memory;
- GPU-heavy scene cost;
- request count i transfer bytes;
- cold load i warm load;
- 1, 5 i 15 minut jazdy;
- powrót z tła.

Quality profiles:

```text
LOW
MEDIUM
HIGH
AUTO
```

AUTO nie może zmieniać fizyki. Może zmieniać wyłącznie render/scene quality.

### V6 — native JV WASM parity

Claim:

```text
Web wykonuje tę samą mechanikę co przypięty native JV Core.
```

Wymagane:

- jeden Box3D + JV Core WASM;
- jawne jednostki ABI;
- stable partId;
- native i WASM scenario trace;
- settle, POSITION, throttle, reverse, brake, RELEASE;
- różnice kwantowane i raportowane;
- brak zmiany mechaniki podczas portu.

Kierunek jazdy i determinizm nie wystarczają jako parity proof.

### V7 — scene/scan seam

Claim:

```text
Skan można podmienić bez przebudowy pojazdu i hosta.
```

Wymagane:

- scene manifest;
- source provenance;
- jednostki i osie;
- spawn/reset/bounds;
- oddzielny render mesh;
- oddzielny collision proxy;
- LOD/chunks według pomiaru;
- budżety telefonu;
- brak prywatnych source assets w publicznym release.

Test przeciwny:

- surowy noisy mesh jako collider ma zostać odrzucony przez pipeline albo jawnie oznaczony jako eksperyment.

### V8 — Pages publication

Claim:

```text
Dokładnie zwalidowany artefakt jest dostępny pod stabilnym linkiem.
```

Wymagane:

- publiczne repo po `PUBLIC-READY PASS`;
- osobna generated publishing branch;
- branch zawiera wyłącznie release package;
- Pages `Deploy from a branch`;
- immutable build receipt;
- telefon i desktop przez rzeczywisty adres HTTPS;
- procedura unpublish;
- jawna zgoda Jozza.

## 5. Pętla podważająca

Przed zamknięciem każdej fazy pytamy:

- Czy PASS może wystąpić dla deterministycznie błędnej fizyki?
- Czy build działa tylko w `/`, ale nie w repo subpath?
- Czy telefon działa tylko po Wi-Fi cache?
- Czy dotyk może pozostać aktywny po `touchcancel`?
- Czy AUTO quality zmieniło fizykę zamiast renderingu?
- Czy scan collider mierzy szum fotogrametrii zamiast terenu?
- Czy publiczny branch zawiera coś więcej niż release?
- Czy usunięty plik nadal istnieje w osiągalnej historii?
- Czy informacja o licencji pochodzi z dokładnej wersji zależności?
- Czy owner approval dotyczył dokładnie tego commita i paczki?

Każde „nie wiem” zamienia status na `PENDING`, nie na PASS.

## 6. Pętla polishująca

Polish nie zaczyna się od shaderów. Kolejność:

### P0 — truth polish

- nazwa produktu;
- backend identity;
- parity status;
- build/version;
- known limitations;
- brak inżynierskich twierdzeń bez receipt.

### P1 — startup polish

- czytelny loading;
- progress per resource class;
- fallback/error screen;
- retry;
- unsupported-browser message;
- brak pustego canvasu.

### P2 — interaction polish

- duże touch targets;
- haptic feedback tylko opcjonalnie;
- wyraźny hands-on state;
- reset dostępny, ale odporny na przypadkowe tapnięcie;
- kamera nie walczy ze steeringiem;
- pauza po tle.

### P3 — driving polish

- kamera follow;
- speed readability;
- orientacja świata;
- spawn i reset;
- brak debug clutter w Demo Mode;
- Lab Mode zachowuje pełną obserwowalność.

### P4 — performance polish

- usunięcie pracy bez wartości;
- render LOD;
- tekstury i kompresja;
- request batching tylko po pomiarze;
- brak optymalizacji zmieniającej fizykę.

### P5 — presentation polish

- branding;
- krótka instrukcja;
- about/credits/licencje;
- screenshot/thumbnail;
- link i QR dopiero po publikacji.

## 7. Warunki finalizacji v0.1

Demonstrator v0.1 jest finalizowany, gdy:

```text
PUBLIC-READY PASS
portable artifact PASS
desktop root+nested PASS
mobile shell PASS
touch ownership PASS
minimum performance budget PASS
native parity scope jawnie PASS albo jawnie ograniczone
one scene PASS
owner mobile drive PASS
Pages HTTPS PASS
immutable receipt zapisany
```

Brak pełnego Wheel Scope nie blokuje v0.1, o ile legacy wheel jest jawnie opisany jako baseline. Brak native parity blokuje nazywanie produktu wiernym JV, ale może dopuścić prywatny/reference preview oznaczony zgodnie z prawdą.

## 8. Aktualny checkpoint

```text
refoundation local gate: 77/77 PASS
portable package foundation: IMPLEMENTING
public repository decision: APPROVED IN PRINCIPLE
repository visibility: PRIVATE
Pages: DISABLED
LICENSE: MISSING / DECISION PENDING
THIRD_PARTY_NOTICES: MISSING
mobile controls: NOT STARTED
native_jv_wasm: NOT STARTED
scan integration: WAITING FOR LOCAL FILES
```
