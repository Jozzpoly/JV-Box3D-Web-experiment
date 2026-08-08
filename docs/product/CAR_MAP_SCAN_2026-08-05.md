# JV Web — samochód + mapa E2R + teksturowany skan

Status: **HISTORICAL PRE-c8e0 PRODUCT/GATE PLAN — STATUS CLAIMS BELOW ARE SUPERSEDED**

> **Supersession note — 2026-08-08**
>
> This document is preserved because it records the original integrated car/E2R/JSPREV2 design, exact-pack validation model, budgets and ownership assumptions. Its old top-level state (`owner browser acceptance pending`, `DO NOT MERGE / NOT READY`) is no longer current authority.
>
> Later raw Windows evidence plus owner observation established `product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580` as the strongest preserved historical desktop baseline: exact gates PASS, scan rendering corrected, pixel smoothing OFF by default/toggleable, grid OFF by default/toggleable and vehicle collision observed working.
>
> Current R1 also still contains the LOCAL_FULL loader/product wiring and key c8e0 scan/view-policy code. Therefore current scan work starts from **current R1 + exact pack revalidation**, not from mechanically completing this old plan.
>
> Current authority: `AGENTS.md`, `docs/handoff/JV_WEB_TAKEOVER_BRIEF_2026-08-08.md`, `docs/PROJECT_STATE.md` and `docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md`.

## Cel produktu

Jedna scena webowa ma zawierać równocześnie:

1. zaakceptowany samochód webowy `legacy_ts_m6`;
2. aktywną mapę E2R z natywnego JV;
3. dokładnie wybrany, teksturowany pack JSPREV2;
4. rzeczywistą kolizję Box3D mapy i skanu;
5. jedną kamerę i jeden kontekst WebGL;
6. jawny wybór startu `Mapa E2R` albo `Skan JSPREV2`.

To nie są niezależne demonstratory. Samochód pozostaje sterowanym obiektem jednego wspólnego świata.

## Tożsamość źródeł

- samochód webowy: `d6aa218064c2653f918cf7956d2fcd20a940caf3`;
- natywna mapa E2R i zaakceptowany stan skanu: `Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142`;
- gałąź produktu: `product/jv-web-car-map-scan`.

Kod sterowania, napędu, zawieszenia, jointów i wejścia samochodu nie jest zmieniany przez ten produkt. Rozszerzane są jego świat, renderer i lokalna granica assetu.

## Mapa E2R

Port zachowuje aktywny natywny zakres:

- płytę 400 × 400 m z dziewięciu kafli;
- offroad 400 × 400 m, siatkę 321 × 321, komórkę 1,25 m i seed `1337`;
- natywne warstwy noise, domain warp, górę, ramiona góry, roughness, seam i edge fade;
- trzy aktywne wyspy skalne — 401 skał;
- trzynaście aktywnych banków bumperów — 147 kapsuł.

Odrzucony zachodni slice i niedokończony tor E3 nie są przywracane.

## JSPREV2 — exact pack i walidacja V2

Operator nie wybiera już packa heurystycznie po liczbie trójkątów, rozmiarze ani czasie modyfikacji.

Kolejność jest fail-closed:

1. jawny `JOZZ_SCAN_PREVIEW_PACK`, `JOZZ_SCAN_ACTIVE_PREVIEW` albo `--candidate`;
2. `ACTIVE_PREVIEW.json`, którego ścieżka względna jest rozwiązywana względem samego selektora;
3. wyjątkowo jeden i tylko jeden dokładny pack wykryty w ograniczonym katalogu.

Niepoprawny jawny pack nie może zostać zastąpiony innym znalezionym skanem. Wiele poprawnych packów bez jawnego selektora kończy walidację błędem zamiast zgadywania.

Wspólny inspektor używany przez operator i Vite sprawdza:

- magic `JSPREV2\0` oraz wersję 2;
- dokładnie 25 grup i 25 unikalnych tekstur;
- unikalne tile ID, pliki binarne i ścieżki tekstur;
- pełną tabelę deskryptorów każdego kafla;
- dokładny rozmiar payloadu wynikający z deskryptorów;
- zgodność liczników manifestu, kafla i grup;
- wszystkie floaty pozycji, normalnych i UV jako skończone;
- każdy indeks względem właściwego strumienia wierzchołków;
- regularne pliki bez symlinków i wyjścia poza pack;
- obsługiwane typy tekstur PNG/JPEG/WebP oraz ich sygnatury;
- rzeczywiste liczniki i budżety przed startem przeglądarki.

Receipt V2 zapisuje między innymi: kafle, grupy, tekstury, wierzchołki, indeksy, trójkąty, bajty binarne/tekstur/całości oraz estymowany koszt CPU/GPU.

## Budżety bezpieczeństwa packa

```text
kafle:                         <= 64
wierzchołki:                   <= 10 000 000
indeksy:                       <= 24 000 000
trójkąty:                      <= 8 000 000
binaria:                       <= 1 GiB
tekstury:                      <= 1 GiB
cały pack:                     <= 2 GiB
pojedyncza tekstura:           <= 128 MiB
estymowana geometria CPU:      <= 768 MiB
estymowana geometria GPU:      <= 512 MiB
```

Zmiana tych progów wymaga osobnej decyzji opartej na pomiarze rzeczywistego komputera i telefonu.

## Render i kolizja skanu

Ogólna preliminarna zasada repozytorium zakłada osobne assety renderu i uproszczonej kolizji. Ten kandydat ma jawny, ograniczony wyjątek wynikający z autorytatywnego natywnego stanu `959aefb…`:

- jeden niezmienny pack JSPREV2 jest źródłem obu warstw;
- renderer zachowuje `POSITION + NORMAL + UV + texture` per grupa;
- collider tworzy osobne własne bufory wyłącznie `POSITION + indices`;
- renderer i collider używają tego samego originu oraz liczników packa;
- ciężka kolizja nie jest przedstawiana jako rozwiązanie docelowe ani LOD.

W przyszłości uproszczony collider może zastąpić tę warstwę bez zmiany kontraktu sterowania samochodu. Na obecnym etapie ważniejsza jest zgodność z już zaakceptowanym natywnym skanem niż wprowadzenie niezwalidowanej automatycznej redukcji geometrii.

## Własność Box3D

`b3CreateMeshShape` nie kopiuje `b3MeshData`. Dane mesha żyją do zniszczenia świata:

```text
utworzenie mesha -> utworzenie shape'a -> praca świata
-> zniszczenie świata -> b3DestroyMesh
```

Ta sama kolejność obowiązuje przy rollbacku częściowo zbudowanego świata.

## Renderer mobilny

- jeden `WebGLRenderingContext` i jedna macierz view/projection;
- statyczne elementy E2R są batchowane według materiału;
- duże meshe są deterministycznie dzielone na części z indeksami `Uint16`;
- błędy `bufferData` i `texImage2D` zgłaszane przez `getError()` kończą konstrukcję/render zamiast pozostawiać częściowy GPU asset;
- zasoby GPU są zwalniane odwrotnie i idempotentnie;
- błędy dekodowania rzeczywistych tekstur pozostają częścią obserwacji browserowej właściciela; asset gate sprawdza plik, typ i sygnaturę, ale nie deklaruje pełnego dekodowania obrazu bez przeglądarki.

## Spawn

- `Mapa E2R` zachowuje zaakceptowany spawn samochodu;
- `Skan JSPREV2` używa środka aktualnego AABB packa;
- wysokość jest najwyższym przecięciem rzeczywistego mesha w tym punkcie;
- wszystkie publikowane zera są kanonizowane do `+0`, aby origin i receipt były deterministyczne.

## Dowody przygotowane w kodzie

- pełny test E2R tworzy 558 statycznych elementów świata;
- zaakceptowany M6 osiada i utrzymuje kontakty na płycie E2R;
- drugi M6 osiada na proceduralnym offroadzie;
- samochód rusza do przodu na produktowym świecie;
- test mesha potwierdza rzeczywisty kontakt Box3D i kolejność teardownu;
- testy packa odrzucają 24/24, niejednoznaczny wybór, niepoprawny jawny wybór, ucięty payload i rozjazd metryk;
- testy WebGL odrzucają cichy błąd uploadu.

## Historyczne granice twierdzeń z chwili napisania dokumentu

Poniższa lista była prawdziwa **przed** późniejszym c8e0 gate/owner run i jest zachowana jako historia tego etapu:

- TypeScript 7, wszystkie testy i portable build nie były jeszcze potwierdzone na exact Windows gate;
- realny prywatny pack nie był jeszcze potwierdzony w powyższych budżetach;
- wszystkie 25 tekstur nie miało jeszcze owner browser verdict;
- pierwszy start i pełny mesh nie miały jeszcze bieżącego verdictu czasu/pamięci;
- jakość kontaktu względem natywnego `identifyEdges=true` pozostawała nieudowodniona;
- owner desktop/phone acceptance była wtedy pending.

Późniejsze c8e0 evidence supersedes część tych punktów dla **historycznego c8e0 desktop run**, ale nie automatycznie dowodzi current-R1 ani real-phone scan performance.

Przypięty `box3d.js` spawa wierzchołki podczas `b3CreateMesh`, lecz nie udostępnia jawnego natywnego `identifyEdges=true`. Native parity nie jest deklarowane.

## Historyczna bramka końcowa

Oryginalny operator zakładał kolejno:

1. exact branch i SHA;
2. czysty zewnętrzny worktree;
3. pełny `run-demonstrator-foundation-gate.ps1`;
4. głęboką selekcję exact packa JSPREV2 V2;
5. log i JSON receipt poza repozytorium;
6. Vite na porcie 5175.

Ta sekwencja jest zachowana jako provenance historycznego kandydata. Nie jest automatycznym gate'em dla każdego current-R1 scan tasku. Obecnie należy najpierw odzyskać exact pack i zwalidować istniejący current-R1 LOCAL_FULL path z minimalnym odpowiednim dowodem.