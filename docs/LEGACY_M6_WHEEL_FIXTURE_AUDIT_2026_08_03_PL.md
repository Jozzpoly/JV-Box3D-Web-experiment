# Audyt efektywnego zachowania legacy M6 split wheel fixture

Data: 2026-08-03

Status: `SOURCE_FACT / PRODUCT_REJECTED_BY_F-04 / RETAINABLE_ONLY_AS_REGRESSION_FIXTURE`

Źródła:

```text
Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142
samples/jozz_vehicle_m6_suspension_rig.cpp
samples/jozz_vehicle_central_test_campus_builder.cpp
samples/jozz_vehicle_obstacle_kit.cpp

JV-Box3D-Web-experiment@agent/bootstrap-web-poc
src/physics/m6-rig.ts
src/scene/world.ts
```

## 1. Deklarowany mechanizm

`JOZZ_M6_ENVELOPE_SPLIT_SPHERE_SIDEWALL` buduje dwa shapes na jednym wheel body:

```text
rolling sphere
  maskBits = terrainCategoryBits
  density = wheelDensity
  pełny promień sfery

sidewall cylinder/hull
  maskBits = ~terrainCategoryBits
  density = 0
  prawdziwa szerokość koła
```

Intencja opisana w native:

- sfera ma zapewniać płynne toczenie po terenie bez facetów;
- cylinder ma ograniczać szerokość na props/walls/curbs;
- cylinder nie zwiększa mass/inertia, ponieważ density=0.

Web odtwarza ten podstawowy podział.

## 2. Efektywna klasyfikacja Central Test Campus

Native builder przekazuje ten sam `terrainCategoryBits` do:

```text
AddRockIsland(...)
AddBumperBank(...)
```

Obstacle kit ustawia:

```text
shapeDef.filter.categoryBits = terrainCategoryBits
```

Web robi dokładnie to samo:

```text
plate.categoryBits   = TERRAIN
bumper.categoryBits  = TERRAIN
rock.categoryBits    = TERRAIN
```

Centralny kampus zawiera:

```text
401 rock shapes
147 bumper capsule shapes
plate / podłoże
```

Wszystkie trafiają do kategorii `TERRAIN`.

## 3. Rzeczywisty wybór shape'u

Dla każdego z powyższych kontaktów:

```text
rolling sphere mask & obstacle category != 0
sidewall mask       & obstacle category == 0
```

W praktyce:

```text
podłoże   -> sfera
skały     -> sfera
progi     -> sfera
```

Sidewall cylinder nie bierze udziału w głównych terenowych stacjach, w których szerokość opony i kontakt z krawędzią są najbardziej istotne.

## 4. Konsekwencja dla interpretacji testów

Central Test Campus nie jest testem „sphere on ground + true-width tire on rocks”. Jest w większości testem sfery na wszystkich elementach oznaczonych jako terrain.

Dlatego wcześniejsze twierdzenia:

```text
split wheel rozwiązuje boczne bulging na skałach
central campus waliduje true-width sidewall
```

nie mają pokrycia w aktywnych filtrach.

Dopuszczalne twierdzenie:

```text
sidewall może wejść w kontakt z obiektami należącymi do nie-terrain categories,
jeśli druga strona filtrów również dopuszcza kontakt.
```

## 5. Dlaczego nie naprawiamy tego zmianą kategorii

Prosta zmiana skał z `TERRAIN` na `OBJECT` włączyłaby cylinder zamiast sfery. Byłoby to jednak dalsze utrwalanie odrzuconej zasady:

```text
category powierzchni wybiera naturę opony
```

Finding F-04 oraz N-01/N-02 odrzucają ten model produktowo. Kategoria może opisywać materiał i semantykę, ale nie może przełączać geometrii opony.

Zatem:

- nie zmieniamy rock/bumper categories jako „fixa koła”;
- nie dodajemy kolejnych kategorii w celu sterowania envelope;
- legacy fixture pozostaje zamrożonym dowodem historycznym;
- przyszły backend używa jednej natury na wszystkich powierzchniach.

## 6. Pozostałe różnice web ↔ native

### Sidewall rolling resistance

Native kopiuje cały podstawowy `shapeDef`, więc sidewall dziedziczy `wheelRollingResistance`.

Web tworzy nowy `sidewallDef` i nie ustawia rolling resistance, więc pozostaje ono domyślne.

Ta delta jest obecnie w większości niewidoczna na kampusie, ponieważ sidewall nie kontaktuje terrain obstacles. Może ujawnić się na non-terrain props/walls.

### Category bits koła

Native pozostawia `categoryBits` z default shape definition. Web ustawia `OBJECT_CATEGORY` dla sfery i sidewalla.

Maski dzielą kontakt podobnie dla obecnego świata, ale query/filter semantics nie są identyczne. Potrzebny truth-table test.

### Liczba shapes/mass

W obu split implementations:

- sfera ma wheel density;
- cylinder ma density 0;
- masa pochodzi ze sfery.

Wcześniejsza hipoteza o podwójnej masie została wycofana.

## 7. Brak testu aktywacji sidewalla

Stare web probes nie zawierają kontrolowanego scenariusza:

```text
sfera odfiltrowana
sidewall aktywny
kontakt boczny z non-terrain obiektem
```

Browser smoke sprawdza istnienie world/probes/visuals, ale nie potwierdza, że oba shapes split envelope są kiedykolwiek aktywne zgodnie z intencją.

Obowiązkowy historyczny test, jeżeli fixture zostaje:

### LEGACY-W1 — filter truth table

Dla `TERRAIN`, `OBJECT`, drugiego pojazdu i query:

- oczekiwane pary shape/category;
- rzeczywiste contact begin/data;
- brak podwójnego kontaktu;
- jawny sidewall material.

### LEGACY-W2 — sidewall contact fixture

Prawdziwy cylinder ma dotknąć pionowej non-terrain ściany bokiem bez kontaktu sfery. Testuje tylko historyczny kontrakt, nie akceptację produktu.

### LEGACY-W3 — campus effective-shape trace

Observer zapisuje, który wheel shape generuje kontakty na plate/bumper/rock. Oczekiwany wynik historyczny ma jawnie pokazać sferę.

## 8. Runtime collision group

Factory ustawia `filterGroupIndex=-19` dla wszystkich vehicle shapes. Ujemna grupa wyłącza kolizję shapes z tym samym indexem i wygrywa z mask bits.

Dla jednego pojazdu zapobiega self-collision. Dla dwóch pojazdów z identycznym `-19` wyłączy również vehicle-to-vehicle collision.

`filterGroupIndex` jest runtime-only i nie jest serializowany. Clean host musi przydzielać unikalny ujemny group index per vehicle instance.

## 9. Status legacy fixture

Dozwolone zastosowania:

- odtworzenie snapshotu M6;
- native/web regression comparison;
- test bindingu i wheel seam;
- kontrola starego save/asset pipeline;
- kontrast wobec nowego backendu.

Niedozwolone nazwy i zastosowania:

- `current wheel`;
- `physical tire`;
- `offroad wheel solution`;
- fundament przyszłego WheelSpec;
- owner validation nowego koła;
- mobilny backend wybierany dla wydajności.

Canonical ID:

```text
legacy_m6_split_sphere_sidewall
```

## 10. Najważniejszy wniosek

Stary split fixture nie tylko przełącza naturę koła według kategorii. Jego główny terenowy poligon przypisuje skały i progi do tej samej kategorii co grunt, więc na najważniejszych przeszkodach pozostaje sferą.

To ograniczenie nie powinno być dalej tuningowane. Powinno zostać zachowane jako nazwany historyczny fixture i zastąpione dopiero przez backend spełniający jedną naturę koła na całym świecie.