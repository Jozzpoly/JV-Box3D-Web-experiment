# JV Web Demonstrator — pętla walidacyjna, podważająca i polishująca

Updated: 2026-08-04
Status: `ACTIVE PRODUCT LOOP`
Owner: Jozz

## 1. Cel

Dostarczyć poważny demonstrator JV, który:

- uruchamia się jako statyczna strona;
- działa na desktopie i telefonie;
- ma przemyślane sterowanie mobilne;
- docelowo pozwala jeździć po przygotowanym skanie;
- może zostać udostępniony przez GitHub Pages bez własnego serwera;
- nie udaje native parity, dopóki jej nie zmierzono;
- nie publikuje się automatycznie.

## 2. Niezmienne granice

1. Repo pozostaje prywatne do `PUBLIC-READY PASS` i jawnej decyzji Jozza.
2. Pages pozostaje wyłączone do osobnego `PAGES-PUBLISH PASS`.
3. `legacy_ts_m6` nie otrzymuje nowych produktowych mechanik fizycznych.
4. Mobilny host może powstawać na fixture, ale UI i manifest pokazują jego prawdziwą rolę.
5. Skan źródłowy, pliki robocze i prywatne metadane nie trafiają automatycznie do publicznego repo.
6. Source scan, render mesh i collision mesh są odrębnymi artefaktami.
7. Zielony build nie zastępuje testu desktop browser ani realnego telefonu.
8. Każda bramka ma próbę przeciwną, która odrzuca znany zły przypadek.
9. Polish prezentacji nigdy nie zmienia fixed-step, fizyki, sterowania semantycznego ani authority labels.
10. Każde „nie wiem” daje `PENDING`, nie `PASS`.

## 3. Drabina dowodów

Statusów nie wolno przeskakiwać ani spłaszczać:

```text
SOURCE_PRESENT
→ STATIC_REVIEWED
→ NEGATIVE_TEST_PRESENT
→ LOCAL_NODE24_PASS
→ PORTABLE_STATIC_PASS
→ LOOPBACK_HTTP_PASS
→ DESKTOP_BROWSER_PASS
→ LAN_PHONE_PASS
→ OWNER_ACCEPTED
→ PUBLIC_READY_PASS
→ PAGES_HTTPS_PASS
```

Znaczenie:

- `SOURCE_PRESENT` — plik/implementacja istnieje;
- `STATIC_REVIEWED` — diff i kontrakty zostały przeczytane;
- `NEGATIVE_TEST_PRESENT` — gate potrafi odrzucić kontrolowany zły przypadek;
- `LOCAL_NODE24_PASS` — exact target toolchain wykonał testy;
- `PORTABLE_STATIC_PASS` — manifest, ścieżki, compliance i hashe są poprawne;
- `LOOPBACK_HTTP_PASS` — te same bajty działają pod root i project subpath;
- `DESKTOP_BROWSER_PASS` — rzeczywisty runtime/renderer/input bez console errors;
- `LAN_PHONE_PASS` — realny telefon, rzeczywisty touch/orientation/background;
- `OWNER_ACCEPTED` — Jozz akceptuje feel/UX dokładnego commita;
- `PUBLIC_READY_PASS` — źródło i historia mogą stać się publiczne;
- `PAGES_HTTPS_PASS` — dokładna paczka działa z rzeczywistego adresu Pages.

## 4. Mikroiteracja

Każdy krok:

```text
obserwacja
→ najmniejsza sprzeczność
→ hipoteza
→ konkurencyjne wyjaśnienie
→ inwariant
→ test przeciwny
→ najmniejsza odwracalna zmiana
→ proporcjonalny gate
→ krytyka wyniku
→ receipt albo jawne PENDING
→ kompresja stanu
```

Po maksymalnie trzech mikroiteracjach pętla ocenia samą siebie:

- czy test wykrywa realną klasę błędu;
- czy gate nie kopiuje sekretu do własnego raportu;
- czy nie dubluje istniejącego gate’u;
- czy koszt jest proporcjonalny;
- czy status mówi tylko to, co dowód naprawdę mierzy.

Bramka bez wartości ochronnej jest upraszczana lub usuwana.

## 5. Globalne stop conditions

Praca nie przechodzi do kolejnego poziomu, gdy występuje choć jedno:

```text
root-absolute runtime URL
manifest/payload hash drift
backend authority/parity elevation bez receipt
stuck steering/throttle/brake po cancel/blur/background
current lub history secret blocker
nieznane prawa do kodu/modelu/skanu
brak current project LICENSE przed public visibility
nieprzygotowany default branch
prywatny asset w release package
surowy scan użyty bez jawnej decyzji jako collider
browser runtime exception
phone crash / reload loop / unrecoverable blank screen
physics changed by quality profile
owner rejection dokładnego feel/UX
```

Stop condition prowadzi do najmniejszej naprawy albo świadomego ograniczenia zakresu. Nie prowadzi do obejścia gate’u.

## 6. Macierz walidacji

### V0 — public safety, historia i licencje

Claim:

```text
Repo może stać się publiczne bez przypadkowego ujawnienia sekretów,
prywatnych assetów albo sprzecznych warunków licencyjnych.
```

Wymagane:

- current project `LICENSE` wybrany przez Jozza;
- exact `THIRD_PARTY_NOTICES.md`;
- current-tree i dirty-state audit;
- reachable blobs, commit/tag metadata i ref-name audit;
- reachable-license inventory;
- klasyfikacja każdego blocker/review finding;
- GitHub PR/issues/reviews/logs/artifacts/releases/packages audit;
- public README;
- intended default branch;
- osobna decyzja o prawach do modeli/skanu.

Testy przeciwne:

- token i `.env` dają FAIL;
- sekret usunięty w późniejszym commicie nadal jest znaleziony;
- token-like branch/tag jest znaleziony, ale nie skopiowany do JSON;
- historyczny MIT usunięty z HEAD nadal pojawia się w license inventory;
- dirty tree nie może otrzymać public-ready reportu.

Owner gate:

```text
Jozz akceptuje dokładny public candidate, historię i licencję.
```

### V1 — portable static artifact

Claim:

```text
Jedna niepublikująca paczka jest integralna i path-portable.
```

Wymagane:

- Vite base `./`;
- `.nojekyll`;
- manifest exact commit + clean source;
- runtime assets i compliance files;
- SHA-256 każdego payload file;
- brak source maps;
- brak root-absolute runtime URL;
- backend pozostaje non-authoritative;
- public/Pages approval pozostaje false;
- third-party notice jest częścią artefaktu.

Testy przeciwne:

- `/assets/...` i `/receipts/...` dają FAIL;
- missing nested CSS asset daje FAIL;
- payload drift daje FAIL;
- escaping runtime/compliance path daje FAIL;
- manifest nie może sam ogłosić parity/public readiness.

### V2 — loopback HTTP i desktop runtime

Claim A:

```text
Każdy plik artefaktu jest dostępny jako identyczne bajty pod root i repo subpath.
```

Loopback smoke pobiera całą manifest table spod:

```text
/
/JV-Box3D-Web-experiment/
```

i porównuje bytes/SHA-256.

Claim B:

```text
Gotowa paczka uruchamia fizykę, renderer i input w prawdziwej przeglądarce.
```

Wymagane browser smoke:

- startup/restart;
- receipt/runtime asset fetch;
- focus loss;
- hide/resume;
- czytelny error state po brakującym zasobie;
- zero uncaught errors;
- backend/build identity w Lab Mode.

Loopback HTTP PASS nie jest browser PASS.

### V3 — mobile shell

Claim:

```text
Interfejs mieści się i pozostaje obsługiwalny na realnym telefonie.
```

Wymagane:

- landscape-first;
- safe-area insets;
- duże touch targets;
- brak browser zoom/scroll podczas aktywnego control gesture;
- orientation change;
- background/resume;
- fullscreen opcjonalny;
- loading/error/retry;
- reset zawsze dostępny, ale odporny na przypadkowy tap.

### V4 — touch ownership

Claim:

```text
Każdy pointer ma jednego właściciela, a jego koniec daje semantyczny release.
```

Wymagane:

- relative RATE steering pad;
- throttle;
- brake/reverse;
- camera gestures w odrębnej strefie;
- pointer capture;
- `pointerup`, `pointercancel`, blur, visibility, pagehide i dispose;
- jednoczesny steering + throttle + camera;
- brak `POSITION(0)` po puszczeniu RATE.

Test przeciwny:

- skrzyżowane palce, utrata capture i background nie pozostawiają aktywnego sterowania.

Owner gate:

```text
Jozz ocenia precyzję, czytelność i zmęczenie dłoni na własnym telefonie.
```

### V5 — mobile performance

Claim:

```text
Demonstrator pozostaje grywalny, odzyskiwalny i termicznie stabilny.
```

Mierzymy osobno:

- physics fixed-step debt i dropped intervals;
- render frame time/FPS;
- JS heap, gdy dostępny;
- WASM memory;
- GPU scene cost;
- request count i transfer bytes;
- cold/warm load;
- 1, 5 i 15 minut jazdy;
- background/resume;
- crash/reload/blank-screen incidence.

Profile:

```text
LOW
MEDIUM
HIGH
AUTO
```

AUTO zmienia tylko rendering/scene quality. Liczbowe budżety zostaną przypięte dopiero do nazwanych urządzeń po pierwszym baseline; wcześniej są hipotezą, nie gate’em.

### V6 — native JV WASM parity

Claim:

```text
Web wykonuje tę samą przypiętą mechanikę co native JV Core.
```

Wymagane:

- jeden Box3D + JV Core WASM;
- jawne jednostki ABI;
- stable `partId`;
- native i WASM scenario traces;
- settle, POSITION, throttle, reverse, brake, RELEASE;
- kwantowane różnice;
- brak refaktoru mechaniki przed baseline.

Kierunek jazdy i determinizm nie wystarczają jako parity proof.

### V7 — scene/scan seam

Claim:

```text
Świat można podmienić bez przebudowy pojazdu i hosta.
```

Wymagane:

- scene manifest;
- source provenance;
- jednostki/osie;
- spawn/reset/bounds;
- render mesh;
- collision proxy;
- LOD/chunks według pomiaru;
- phone budgets;
- brak prywatnych source assets w release.

Test przeciwny:

- noisy source mesh jako collider jest odrzucany albo jawnie oznaczony jako eksperyment.

### V8 — Pages publication

Claim:

```text
Dokładnie zwalidowany artefakt działa pod stabilnym HTTPS linkiem.
```

Wymagane:

- PUBLIC-READY owner approval;
- public intended default branch;
- generated publishing branch zawiera wyłącznie release package;
- immutable receipt;
- systemowy Pages deployment dopiero po zgodzie;
- desktop i phone test rzeczywistego URL;
- procedura unpublish/rollback.

## 7. Pętla podważająca

Przed zamknięciem fazy pytamy:

- Czy PASS może wystąpić dla deterministycznie błędnej fizyki?
- Czy raport bezpieczeństwa sam przechowuje wykrytą wartość?
- Czy historyczny branch ma inną licencję niż HEAD?
- Czy build działa tylko pod `/`?
- Czy HTTP smoke sprawdził tylko obecność, a nie bajty?
- Czy browser działa wyłącznie dzięki cache?
- Czy dotyk pozostaje aktywny po cancel/background?
- Czy AUTO zmieniło fizykę?
- Czy collider mierzy szum skanu?
- Czy publishing branch zawiera źródła lub prywatne pliki?
- Czy owner approval dotyczył dokładnego commita i paczki?

## 8. Pętla polishująca

Polish zawsze idzie w tej kolejności:

### P0 — truth

- nazwa produktu;
- backend identity;
- parity/authority status;
- exact build/version;
- known limitations;
- credits/licencje;
- brak twierdzeń bez receipt.

### P1 — startup/failure

- czytelny loading;
- progress per resource class;
- error reason;
- retry;
- unsupported-browser message;
- brak pustego canvasu.

### P2 — interaction

- touch targety i safe areas;
- wyraźny hands-on state;
- reset confirmation/hold policy;
- camera/steering ownership;
- pause/release po tle;
- opcjonalne haptics dopiero po zgodzie.

### P3 — driving presentation

- follow camera;
- speed/world orientation;
- spawn/reset;
- Demo Mode bez debug clutter;
- Lab Mode z pełną obserwowalnością.

### P4 — measured performance

- usunięcie pracy bez wartości;
- render LOD;
- tekstury/kompresja;
- request strategy po pomiarze;
- żadna optymalizacja nie zmienia fizyki.

### P5 — public presentation

- branding;
- krótka instrukcja;
- About/Credits/Licenses;
- screenshot/thumbnail;
- link/QR dopiero po publikacji.

Po każdym poziomie polish wracamy do odpowiedniej walidacji V0–V8. Polish bez rewalidacji nie jest finalizacją.

## 9. Finalizacja v0.1

```text
PUBLIC-READY PASS
portable static + loopback HTTP PASS
desktop browser PASS
mobile shell/touch ownership PASS
named-device performance baseline PASS
native parity scope jawnie PASS albo jawnie ograniczone
one scene PASS
owner mobile drive ACCEPTED
Pages HTTPS PASS
immutable receipt
```

Brak pełnego Wheel Scope nie blokuje v0.1, jeżeli legacy wheel jest jawnie baseline’em. Brak native parity blokuje określenie „wierna webowa wersja JV”, ale nie blokuje prywatnego/reference preview oznaczonego zgodnie z prawdą.

## 10. Aktualny checkpoint

```text
refoundation base: 77/77 PASS
first demonstrator gate: 81/81 PASS + portable path FAIL
root-absolute receipt bug: FIXED IN SOURCE + REGRESSION PRESENT
portable manifest/authority/compliance hardening: SOURCE PRESENT
loopback root/nested HTTP smoke: SOURCE PRESENT
public Git-history tests: SOURCE PRESENT
reachable-license inventory: SOURCE PRESENT
THIRD_PARTY_NOTICES: PRESENT + INSTALLED-PACKAGE VERIFIER
current project LICENSE: MISSING / OWNER DECISION PENDING
historical PR #1 MIT: MEASURED FACT
public README candidate: PRESENT ON ACTIVE BRANCH
main/default branch: NOT PUBLIC-READY
current newer head Node 24 gate: PENDING
mobile controls: NOT STARTED
native_jv_wasm: NOT STARTED
scan integration: WAITING FOR LOCAL FILES
repository visibility: PRIVATE
Pages: DISABLED
```