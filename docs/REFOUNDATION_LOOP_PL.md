# JV Web — rekurencyjna pętla refoundation

Updated: 2026-08-04
Status: `CANONICAL PROCESS`
Owner: Jozz

## 1. Cel

Doprowadzić JV Web do stanu, w którym każda istotna właściwość ma jedno źródło prawdy, każda mechanika ma jawne pochodzenie, a kolejne zmiany zmniejszają — zamiast zwiększać — niepewność projektu.

Ta pętla nie jest jednorazowym planem sprzątania. Jest sposobem prowadzenia projektu. Po każdej iteracji sama pętla podlega ocenie i może zostać uproszczona lub zaostrzona.

## 2. Niezmienne zasady

1. **Jedna aktywna hipoteza na iterację.**
   Nie łączyć refaktoru, nowej mechaniki, dokumentacji i strojenia w jeden krok.

2. **Najmniejsza zmiana, która może obalić lub potwierdzić hipotezę.**
   Duża zmiana nie jest bardziej fundamentalna tylko dlatego, że jest duża.

3. **Najpierw kontrakt i falsyfikacja, potem implementacja.**
   Test ma odróżniać właściwe zachowanie od zachowania tylko pozornie działającego.

4. **Mechanika pojazdu ma jedno źródło prawdy.**
   TypeScript nie może rozwijać równoległego modelu M6/M7, jeżeli docelowym źródłem jest natywny JV Core skompilowany do WASM.

5. **Receipt jest dowodem danych, nie substytutem algorytmu.**
   Każde pole przekraczające granicę musi mieć typ, jednostkę, semantykę i źródło.

6. **Dowód zachowujemy, narrację wygaszamy.**
   Stare raporty trafiają do archiwum. Nie pozostają aktywnymi instrukcjami tylko dlatego, że zawierają wartościowe fragmenty.

7. **Brak ukrytych assistów i brak ukrytych fallbacków.**
   Każdy eksperyment jest nazwany, jawny i domyślnie niezatwierdzony.

8. **Brak automatycznego merge i brak CI jako substytutu myślenia.**
   Jozz zachowuje decyzję produktową i owner-feel. Workflow nie naprawia architektury.

## 3. Jedna iteracja

Każda iteracja przechodzi kolejno przez dziesięć bramek.

### R0 — Odczyt stanu

Przeczytaj wyłącznie aktualny łańcuch wejściowy:

1. `AI_PROJECT_MEMORY.md`;
2. `docs/PROJECT_STATE.md`;
3. `docs/REFOUNDATION_LOOP_PL.md`;
4. aktywny ADR/kontrakt subsystemu;
5. ostatni właściwy receipt.

Archiwum czyta się tylko, gdy istnieje konkretne pytanie historyczne.

### R1 — Wybór najmniejszej sprzeczności

Wybierz jeden problem według kolejności:

1. błędne źródło prawdy;
2. ryzyko utraty danych lub nieodwracalności;
3. mechanika o błędnej semantyce/jednostce;
4. niekontrolowana granica zasobów;
5. brak falsyfikującego testu;
6. sprzeczna dokumentacja;
7. duplikacja;
8. ergonomia i polish.

### R2 — Karta hipotezy

Zapisz krótko:

```text
Obserwacja:
Hipoteza:
Konkurencyjne wyjaśnienia:
Najmniejszy test rozstrzygający:
Co pozostaje poza zakresem:
```

### R3 — Inwariant

Przekształć hipotezę w mierzalny kontrakt, np.:

```text
maxDriveSpeed ma jednostkę rad/s i nigdy nie jest interpretowane jako m/s.
```

albo:

```text
RELEASE wyłącza aktywny target w pierwszym fixed stepie.
```

### R4 — Falsyfikacja

Dodaj lub wskaż test, który przegrywa dla znanego złego zachowania. Test kierunku, liveness albo determinizmu nie wystarcza, jeśli pytanie dotyczy parytetu semantycznego.

Poziomy dowodu pozostają rozdzielone:

```text
SOURCE_FACT
MEASURED_FACT
MECHANISM_FALSIFICATION
INTERNAL_CONSISTENCY
LIVENESS_SMOKE
SCENARIO_EQUIVALENCE
VISUAL_OBSERVATION
OWNER_VALIDATED
```

### R5 — Minimalna zmiana

Zmień tylko jedną granicę. Preferowana wielkość kroku:

- jeden kontrakt;
- jeden adapter;
- jeden test;
- jeden niewielki moduł;
- jeden ruch dokumentacyjny;
- jeden odwracalny commit.

### R6 — Walidacja proporcjonalna do ryzyka

Nie każdy commit wymaga pełnego browser gate, ale każdy wymaga właściwego poziomu kontroli.

```text
dokumentacja/archiwizacja -> link audit + diff audit
czysta logika TS          -> typecheck + focused tests
WASM boundary             -> real WASM tests + lifecycle
fizyka                    -> native/WASM scenario comparison
render/input browser      -> browser smoke
feel/default              -> owner test Jozza
```

### R7 — Krytyka własnego rozwiązania

Przed uznaniem iteracji za zamkniętą odpowiedz:

- Czy test mógł przejść dla deterministycznie błędnej implementacji?
- Czy wprowadzono nową jednostkę bez nazwania jej?
- Czy powstało drugie źródło prawdy?
- Czy dokument aktywny przeczy kodowi?
- Czy usunięto informację, której nie ma w historii Gita?
- Czy rozwiązanie utrudnia przyszły JES lub Wheel Scope?

### R8 — Kompresja stanu

Po zmianie aktualizuje się tylko:

- `AI_PROJECT_MEMORY.md` — operacyjny checkpoint;
- `docs/PROJECT_STATE.md` — krótki stan produktu;
- właściwy ADR/kontrakt;
- receipt, jeśli faktycznie wykonano pomiar.

Nie tworzyć nowego broad audit reportu per iteracja.

### R9 — Retrospektywa pętli

Po każdych 3–5 iteracjach oceń:

```text
Co pętla wykryła wcześnie?
Co wykryła za późno?
Która bramka była rytuałem bez wartości?
Gdzie powstał nowy dług?
Czy kolejność priorytetów nadal jest właściwa?
```

Zmiana samej pętli wymaga krótkiego uzasadnienia w historii tego dokumentu.

## 4. Pętle nadrzędne

### Pętla dokumentacji

```text
inventory
→ klasyfikacja
→ ekstrakcja trwałej wiedzy
→ archiwizacja źródła
→ naprawa linków
→ wyszukanie sprzeczności
→ ponowna klasyfikacja
```

### Pętla architektury

```text
własność danych
→ granica API
→ jednostki i semantyka
→ lifecycle
→ falsyfikacja
→ minimalny spike
→ parity comparison
→ dopiero integracja
```

### Pętla fizyki

```text
obserwacja Jozza
→ hipotezy mechanizmu
→ reproduktor
→ pomiar natywny
→ pomiar WASM
→ mechanizm odróżniający
→ implementacja
→ owner feel
```

### Pętla Wheel Scope

```text
kandydat
→ zamrożony eksperyment
→ ręczne przejęcie
→ wariant/fork z lineage
→ obserwacje i telemetryka
→ failure mode
→ porównanie A/B
→ wiedza do JV/JES, nie automatyczny merge kodu
```

## 5. Warunki czystości dokumentacji

Repo jest dokumentacyjnie czyste, gdy:

- łańcuch `Read first` ma maksymalnie pięć pozycji;
- każdy aktywny dokument ma właściciela roli i status;
- nie istnieją dwa aktywne opisy bieżącego milestone'u;
- historyczne branch SHA i stare wyniki nie są przedstawiane jako bieżący stan;
- broad audits nie znajdują się w katalogu aktywnym;
- receipts są oddzielone od opinii i planów;
- archiwum posiada indeks i powód zachowania;
- usunięte pliki nie zawierały unikalnej wiedzy poza historią Gita;
- link audit nie wykazuje odwołań do przeniesionych aktywnych ścieżek.

## 6. Warunki czystości kodu

- jedna ścieżka fixed-step;
- jeden właściciel lifecycle;
- jeden semantic input timeline;
- renderer tylko obserwuje snapshoty;
- brak trwałej semantyki opartej o `b3BodyId`;
- każda część ma stabilne `partId`/role;
- Box3D i JV Core docelowo tworzą jeden moduł WASM;
- legacy TypeScript M6 jest nazwanym backendem referencyjnym, nie produkcyjnym źródłem prawdy;
- pola ABI mają jednostki;
- native/WASM parity harness istnieje przed rozwojem dalszej fizyki;
- legacy wheel backend nie jest rozszerzany do roli przyszłej opony.

## 7. Stop conditions

Pętla nie ma kończyć się „nigdy”, ale nie może też kończyć się na pierwszym zielonym teście.

Iteracja zatrzymuje się, gdy:

- hipoteza została rozstrzygnięta;
- inwariant jest chroniony;
- nie powstało nowe źródło prawdy;
- stan został skompresowany;
- następny problem jest jawnie zapisany.

Cały program refoundation może przejść do normalnego rozwoju, gdy:

1. dokumentacja spełnia warunki z §5;
2. architektura WASM ma zaakceptowany ADR i minimalny parity spike;
3. semantyczny błąd napędu nie istnieje w domyślnym backendzie;
4. legacy TS backend jest wyraźnie odseparowany;
5. Jozz może uruchomić jedną prostą komendę i zobaczyć aktualny produkt bez archeologii branchy.
