# JV Web — samochód + mapa E2R + teksturowany skan

Status: **IMPLEMENTATION CANDIDATE — EXACT LOCAL GATE AND OWNER BROWSER ACCEPTANCE PENDING**

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

## Granice twierdzeń

Bez wykonania exact lokalnej bramki nie można jeszcze stwierdzić, że:

- TypeScript 7, wszystkie testy i portable build przechodzą na Windows;
- realny prywatny pack mieści się w powyższych budżetach;
- wszystkie 25 tekstur dekoduje się i wygląda poprawnie w przeglądarce;
- pierwszy start i pełny mesh mieszczą się w praktycznym budżecie czasu/pamięci;
- jakość kontaktu na wewnętrznych krawędziach odpowiada natywnemu `identifyEdges=true`;
- produkt przeszedł ocenę desktopową i telefoniczną właściciela.

Przypięty `box3d.js` spawa wierzchołki podczas `b3CreateMesh`, lecz nie udostępnia jawnego natywnego `identifyEdges=true`. Native parity nie jest deklarowane.

## Bramka końcowa

Operator wykonuje kolejno:

1. exact branch i SHA;
2. czysty zewnętrzny worktree;
3. pełny `run-demonstrator-foundation-gate.ps1`;
4. głęboką selekcję exact packa JSPREV2 V2;
5. log i JSON receipt poza repozytorium;
6. Vite na porcie 5175.

Dopiero potem właściciel sprawdza oddzielnie mapę i skan. Do czasu tej sekwencji kandydat pozostaje `DO NOT MERGE / NOT READY`.
