# JV Web — samochód + mapa E2R + teksturowany skan

Status: **IMPLEMENTATION CANDIDATE — EXACT LOCAL GATE AND OWNER BROWSER ACCEPTANCE PENDING**

## Cel produktu

Jedna scena webowa ma zawierać równocześnie:

1. działający samochód z zaakceptowanego baseline'u webowego;
2. aktywną mapę E2R z autorytatywnego repozytorium natywnego;
3. finalny, poprawnie teksturowany skan JSPREV2;
4. rzeczywistą kolizję Box3D mapy i skanu;
5. jedną kamerę oraz jeden kontekst WebGL.

To nie są trzy niezależne demonstratory. Samochód jest głównym obiektem sterowanym w jednym wspólnym świecie.

## Tożsamość źródeł

- działający samochód webowy: `d6aa218064c2653f918cf7956d2fcd20a940caf3`;
- natywna mapa E2R i zaakceptowany stan skanu: `Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142`;
- gałąź produktu: `product/jv-web-car-map-scan`.

Kod sterowania, napędu, zawieszenia, jointów i lifecycle'u samochodu nie został przepisany. Produkt rozszerza jego świat oraz renderer.

## Mapa E2R

Port zachowuje aktywny natywny zakres:

- płytę 400 × 400 m z dziewięciu kafli;
- offroad 400 × 400 m, siatkę 321 × 321, komórkę 1,25 m i seed `1337`;
- natywne warstwy noise, domain warp, górę, ramiona góry, roughness, seam i edge fade;
- trzy aktywne wyspy skalne: łącznie 401 skał;
- trzynaście aktywnych banków bumperów: łącznie 147 kapsuł.

Odrzucony zachodni slice i niedokończony tor E3 nie zostały przywrócone.

## Finalny skan

Akceptowany jest wyłącznie pack spełniający jednocześnie:

- magic `JSPREV2\0`;
- wersję binarną 2;
- dokładnie 25 grup renderowych;
- dokładnie 25 istniejących tekstur;
- zgodność liczby grup w każdym binarnym kaflu z `COMPLETE.json`;
- ścieżki względne pozostające wewnątrz wybranego packa;
- brak symlinków i brak ujawniania lokalnych ścieżek przeglądarce.

Ten sam pack i ten sam origin zasilają renderer oraz kolizję. Origin centruje skan na osi X, ustawia jego najniższy punkt na Y=0 i południową krawędź na Z=320.

## Własność mesha Box3D

`b3CreateMeshShape` nie kopiuje `b3MeshData`. Produkt utrzymuje dane mesha przez cały czas życia świata:

```text
utworzenie mesha -> utworzenie shape'a -> praca świata
-> zniszczenie świata -> b3DestroyMesh
```

Ta sama kolejność obowiązuje przy rollbacku częściowo zbudowanego świata.

## Renderer

- jeden `WebGLRenderingContext`;
- jedna macierz view/projection dla mapy, skanu i samochodu;
- statyczne elementy E2R są batchowane według materiału;
- offroad jest jednym meshem renderowym;
- skan zachowuje 25 osobnych grup teksturowanych;
- tekstury mają neutralny placeholder do chwili zakończenia dekodowania.

## Granice aktualnych twierdzeń

Można stwierdzić na podstawie kodu:

- mechanika zaakceptowanego auta nie została zmieniona;
- mapa, skan i samochód są spięte przez jeden kontrakt świata;
- mapa i skan tworzą rzeczywiste statyczne kształty Box3D;
- finalny asset jest wybierany fail-closed jako 25/25;
- przygotowano test rzeczywistego kontaktu kuli z meshem w przypiętym WASM Box3D;
- przygotowano pełny operator exact-SHA, pełnej bramki i lokalnego uruchomienia.

Nie można jeszcze stwierdzić bez wykonania lokalnej bramki i obserwacji właściciela:

- że TypeScript, wszystkie testy i portable build przechodzą na Windows w exact toolchainie;
- że finalny prywatny pack został odnaleziony na aktualnym komputerze;
- że pełny skan gotuje się w akceptowalnym czasie i mieści się w budżecie pamięci;
- że samochód przejeżdża po mapie i skanie bez nowych problemów kontaktowych;
- że wszystkie 25 tekstur wygląda poprawnie w realnej scenie.

## Znana różnica względem natywnego JV

Przypięty `box3d.js` ustawia dla `b3CreateMesh` spawanie wierzchołków, ale nie udostępnia jawnego przełącznika natywnego `identifyEdges=true`. Rzeczywisty kontakt z meshem jest testowany, lecz pełna równoważność jakości przejazdu po wewnętrznych krawędziach skanu **nie jest deklarowana**.

Samochód pozostaje zaakceptowanym webowym `legacy_ts_m6` z debugową reprezentacją wizualną. Native-JV parity ani finalny model pojazdu nie są deklarowane.

## Bramka i akceptacja

Operator kontrolny uruchamia kolejno:

1. exact branch i SHA;
2. izolowany zewnętrzny worktree;
3. pełny `run-demonstrator-foundation-gate.ps1`;
4. wybór exact packa JSPREV2 25/25;
5. zapis logu i JSON receipt poza repozytorium;
6. Vite na porcie 5175.

Końcowa obserwacja właściciela musi potwierdzić:

```text
samochód widoczny:
skręt:
jazda/hamulec:
rebuild:
kamera:
mapa E2R widoczna:
kontakt z mapą:
skan widoczny:
tekstury 25/25:
kontakt ze skanem:
stabilność:
konsola przeglądarki:
```

Do czasu przejścia tej sekwencji gałąź pozostaje kandydatem. Nie jest gotowa do merge ani oznaczenia Ready.
