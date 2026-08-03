# Receipt aktualnego programu kół JV — 2026-08-03

Status: `FACTS_AND_OWNER_DECISIONS / R1_CONTACT_VISIBILITY_ADVANCED / PRODUCT_IMPLEMENTATION_NOT_STARTED`

## 1. Przypięty stan programu

```text
repository: Jozzpoly/Box3d_FunProject
branch:     jozz-scan-terrain-f0
commit:     761bd3ef60992f7dec3bcdddf1945fdbc1cb0825
relation:   26 commits ahead of main 959aefb78587ce60cf2b8eb03ff82797a4165142
commit date: 2026-08-03T15:27:08+02:00
```

Branch name jest historyczny. Aktualnie zawiera program Wheel Scope, quarter-car, evidence i najnowszy etap widzialności manifoldu.

Krytyczne dokumenty i blob SHA:

```text
docs/KOLA_00_INDEX_PL.md
cac6b93b1b387debbc1f7966d74c184c667d3fb7

docs/KOLA_FINDINGS.json
cef0dbf03b51b32b846545359816ac446731e857

docs/KOLA_02_ARCHITEKTURA_PL.md
c24986577e06ce3aa6f7131f5dceaf45d1695e25
```

Inventory exact tree receipt:

```text
tracked files: 588
tracked bytes: 14,832,058
text files: 586
text lines: 330,459
tree receipt SHA-256:
71a682b3d08a3a7f726544ef628975a4daa034fcf6be49a7547ba806560d39b0
```

## 2. Status programu

Program nadal nie jest implementacją produktową koła JV.

Nadal obowiązuje:

- wyniki bench/quarter-car mają własne statusy;
- geometria i backend produktowy nie zostały wybrane;
- owner feel verdict nie został wydany;
- wynik stendu nie awansuje automatycznie do pełnego pojazdu;
- W1–W4 jest trwałym kandydatem podziału odpowiedzialności, ale szczegóły konkretnego backendu pozostają otwarte.

Najnowszy commit zamknął pierwszy punkt R1 dotyczący rozkładu impulsów po punktach kontaktu. Nie zamknął wyboru opony.

## 3. Niezmienniki i decyzje właściciela istotne dla weba

### Jedna natura koła na nierozróżnionym świecie

`N-01/N-02` oraz finding `F-04`:

- ta sama podstawowa natura koła ma odpowiadać za kontakt z gruntem, skałą, ścianą, obiektem i innym pojazdem;
- kategorie mogą opisywać materiał, semantykę, gameplay i optymalizację;
- kategorie nie mogą przełączać natury collidera opony;
- split envelope sfera+cylinder według kategorii powierzchni jest produktowo odrzucony.

Konsekwencja: `SPLIT_SPHERE_SIDEWALL` z bieżącego runtime M6 jest legacy vehicle fixture, nie zaakceptowanym przyszłym fundamentem systemu koła.

### Jawna masa i bezwładność

`N-09` i `F-02`:

- masa i bezwładność nie mogą być przypadkowym wynikiem objętości reprezentacji W2;
- porównanie reprezentacji bez zamrożonej mass data jest nieważne;
- przyszły `WheelSpec` musi ustawiać mass/inertia jawnie, niezależnie od liczby shapes.

### Trzy równorzędne światy opon

System nie może zabetonować jednego punktu:

- drift / tor twardy;
- zwykła jazda / roleplay;
- ciężki offroad wtulający się w skały.

### Owner feel

Werdykt należy wyłącznie do Jozza. Bench, CI i web smoke nie wydają go.

### Patch policy

Każdy patch silnika/manifoldu ma mieć:

- jawny wyłącznik;
- semantics-off equivalence;
- dokładny source receipt;
- niezależny pomiar;
- brak awansu do produktu bez owner decision.

## 4. Trwały podział W1–W4

Aktualna architektura zachowuje wartościowy szew:

```text
W1 WheelSpec / TireSpec / WheelState — dane i jawna mass data
W2 reprezentacja kontaktu             — wymienna strategia
W3 prawo opony                        — siły i stan, oddzielone od W2
W4 wizualizacja                       — konsument danych/stanu
```

Reguła:

```text
W2 i W3 nie mogą być zmieniane jednocześnie w jednym eksperymencie.
```

`WheelContactSet` jest ważniejszy niż pojedynczy `ContactPatch`, ponieważ przyszły backend może mieć wiele shape'ów, manifoldów i punktów:

```text
contacts[]
  world/local point
  normal
  separation
  normal impulse
  feature identity
  persistence
  material / other body / other shape

aggregate
  resultant force/moment
  load centroid
  effective radius
  longitudinal/lateral frame
```

Web powinien przygotować ten seam, ale nie implementować dziś pustego pełnego tire-law frameworka.

## 5. Najnowszy wynik F-31 — sztywna rodzina nie daje plamy kontaktu

Commit `761bd3ef…` dodaje pomiar rozkładu `totalNormalImpulse` po punktach manifoldu i miary:

```text
nios = (sum p)^2 / sum(p^2)
max% = udział największego punktu
anchors = liczba nośnych manifoldów
```

Potwierdzony zakres bieżącej rodziny sztywnych reprezentacji:

- zazwyczaj około 1–3 efektywnych punktów przenoszących obciążenie;
- rekord około 5 efektywnych punktów;
- rekord wymagał 576 shape'ów i 32 substeps;
- koszt wyniósł około 1.59 ms na krok dla jednego koła w badanym stanowisku;
- sfera kontrolna daje `nios = 1.00`, `max = 100%`.

Wniosek w dozwolonym zakresie:

```text
badana rodzina sztywnych obwiedni nie tworzy użytecznej rozłożonej plamy kontaktu przy akceptowalnym koszcie.
```

Niedozwolone rozszerzenie:

```text
żadna sztywna reprezentacja w żadnym możliwym algorytmie nie może dać plamy kontaktu.
```

Otwarte pozostaje, czy ograniczenie wynika z:

- rodziny badanych brył;
- procedury generowania/redukcji manifoldu;
- podłoża;
- zbieżności solvera;
- kombinacji tych elementów.

## 6. F-32 — mechanizm wcześniejszego szumu liczby shapes

Dla identycznej obwiedni, 64 kontra 576 shape'ów:

```text
4 substeps:  775.0 -> 816.1 W   około 5.3%
32 substeps: 636.0 -> 634.4 W   około 0.25%
```

Interpretacja:

- wcześniejsza różnica F-27 nie była prostym „kosztem liczby shapes”;
- była głównie niedozbieżnością redundantnych więzów kontaktowych przy 4 substeps;
- liczba shapes i substeps oddziałują multiplikatywnie;
- F-27 pozostaje ważny dla protokołu Q3, ponieważ Q3 używa 4 substeps;
- zmiana substeps zmienia równocześnie efektywny contact hertz, więc nie jest neutralnym pokrętłem jakości.

Konsekwencja dla weba:

```text
mobile/low-quality profile nie może po cichu zmniejszać substeps,
bo zmieni fizykę kontaktu, a nie tylko koszt CPU.
```

## 7. Nowa granica problemu

„Nowy typ koła” nie może być modelowany jedynie jako:

```text
WheelColliderFactory -> inne shapes
```

F-31 pokazuje, że przyszły system może wymagać wymiany lub rozszerzenia również:

- obserwacji kontaktu;
- agregacji manifoldów;
- procedury tworzenia/redukcji manifoldu;
- modelu podatności;
- W3 tire law;
- integracji z solverem.

Dlatego webowy seam musi pozostawić jawne capability flags i neutralny contact telemetry contract, zamiast zakładać, że każda przyszła opona jest statyczną listą stockowych shape'ów.

## 8. Czego web nie może teraz zrobić

- wybrać torusa, crown, prism, ellipsoidę albo multi-body jako zwycięzcę;
- przenieść bench candidate bez vehicle transfer gate;
- udawać deformację przez większą liczbę sztywnych shapes;
- zmienić W2 i W3 jednocześnie;
- budować pełnego systemu temperatury, zużycia, przebicia i damage jako pustych klas;
- traktować scan mesh jako survey/contact truth;
- obniżyć solver profile dla mobilki bez jawnego physics delta;
- nazywać sphere/split „current wheel architecture”.

## 9. Minimalny zakres przygotowania JV Web

Web powinien przygotować tylko trwałe granice:

1. `WheelSpecSnapshot` z wymiarami, asset provenance i jawną mass/inertia;
2. `WheelContactBackend` tworzący i niszczący W2 oraz raportujący capability/shape IDs;
3. `WheelContactObserver` wystawiający neutralny `WheelContactSet` bez tire-law decisions;
4. brak W3 w pierwszym slice poza stockowym zachowaniem jawnie nazwanym legacy;
5. W4 oddzielone od W2, przygotowane na osobny asset opony i felgi;
6. `legacy_split_m6` jako jeden plugin fixture, nie centralny typ danych;
7. test potwierdzający, że zmiana W2 nie zmienia mass/inertia;
8. binding capability report dla mesh/manifold/callback/event APIs.

Szczegółowy kontrakt: `WHEEL_ADOPTION_SEAM_2026_08_03_PL.md`.

## 10. Następne warunki aktualizacji

Ten receipt nie śledzi ruchomego brancha automatycznie. Każdy kolejny update wymaga:

- nowego exact commit;
- nowych blob/tree hashes;
- przeglądu statusów w `KOLA_FINDINGS.json`;
- jawnej delty wobec tego dokumentu;
- odróżnienia nowego engine fact od bench preliminary, design inference i owner decision.