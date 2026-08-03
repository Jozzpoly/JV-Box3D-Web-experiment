# Receipt aktualnego programu kół JV — 2026-08-03

Status: `FACTS_AND_OWNER_DECISIONS / PRODUCT_IMPLEMENTATION_NOT_STARTED`

## Położenie programu

```text
repository: Jozzpoly/Box3d_FunProject
branch:     jozz-scan-terrain-f0
relation:   25 commits ahead of main 959aefb78587ce60cf2b8eb03ff82797a4165142
```

Branch name jest historyczny; aktualnie zawiera program Wheel Scope / quarter-car i evidence kół.

Krytyczne dokumenty i blob SHA:

```text
docs/KOLA_00_INDEX_PL.md
b5fb0328413fd5317dd5c88fb5db137cbaae8365

docs/KOLA_FINDINGS.json
f60aa0611de31a919be99fb18dac083bb2684cea

docs/KOLA_02_ARCHITEKTURA_PL.md
c24986577e06ce3aa6f7131f5dceaf45d1695e25

docs/KOLA_04_PETLA_BADAWCZA_PL.md
316352201e285f9340fe84fb78915d1b6459eb82
```

## Status programu

`KOLA_00` mówi wprost:

- R0.5, kalibracja instrumentu;
- wyniki provisional;
- geometria pozostaje pytaniem otwartym;
- implementacja produktowa nie rozpoczęta;
- Q3 Quarter Car Lab jest następnym poziomem transferu;
- owner feel verdict nie został wydany.

Webowy projekt nie może przedstawiać żadnego kandydata benchowego jako gotowej opony JV.

## Niezmienniki i decyzje właściciela istotne dla weba

### Jedna natura koła na nierozróżnionym świecie

`N-01/N-02` oraz finding `F-04`:

- ta sama podstawowa geometria koła ma odpowiadać za kontakt z gruntem, skałą, ścianą, obiektem i innym pojazdem;
- kategorie mogą opisywać materiał, semantykę, gameplay i optymalizację;
- kategorie nie mogą przełączać natury collidera opony;
- split envelope sfera+cylinder według kategorii powierzchni jest produktowo odrzucony.

Konsekwencja: `SPLIT_SPHERE_SIDEWALL` z aktualnego runtime M6 jest legacy vehicle baseline, nie zaakceptowanym przyszłym fundamentem systemu koła.

### Jawna masa i bezwładność

`N-09` i `F-02`:

- masa/bezwładność nie mogą być przypadkowym wynikiem objętości wybranej reprezentacji collidera;
- porównanie reprezentacji bez zamrożonej mass data jest nieważne.

Konsekwencja: clean web port nie może budować przyszłego WheelSpec z `wheelDensity` mnożonego niezależnie przez kilka shapes. Dla legacy fixture trzeba zmierzyć faktyczną mass data i jawnie opisać ograniczenie.

### Trzy równorzędne światy opon

System nie może zabetonować jednego punktu:

- drift / tor twardy;
- zwykła jazda / roleplay;
- ciężki offroad wtulający się w skały.

### Werdykt feelu

Należy wyłącznie do Jozza. Bench, CI i przeglądarka nie wydają takiego werdyktu.

### Patch policy

Każdy patch silnika ma mieć wyłącznik i semantics-off equivalence. Web adapter nie może przemycać nowego prawa opony jako drobnego workaroundu.

## Warstwy badawcze, których web nie może zlewać

Aktualna propozycja zachowuje wartościowy podział:

```text
W1 WheelSpec / TireSpec / WheelState — dane
W2 reprezentacja kolizji             — strategia kontaktu
W3 prawo opony                       — siły i stan
W4 wizualizacja                      — konsument danych/stanu
```

W2 i W3 nie mogą być zmieniane jednocześnie w jednym eksperymencie, bo wynik staje się nieinterpretowalny.

Ta architektura ma status propozycji, nie gotowej implementacji. Web może jednak zachować seam, aby nie związać pojazdu na stałe z legacy envelope.

## Aktualne findings ważne metodologicznie

- `F-04`: split envelope odrzucony decyzją właściciela.
- `F-06`: ranking stendu może zmieniać się w pojeździe; bench != vehicle.
- `F-07`: superseded; nie cytować.
- `F-08`: preliminary koszt w konkretnym stanie, nie czysty koszt bryły.
- `F-15/F-16`: Box3D contact update i substeps/contact hertz są sprzężone; zmiana substeps może zmienić materiał kontaktu, nie tylko dokładność.
- `F-18`: `suspensionHertz` wheel jointu odnosi się do masy zredukowanej więzu, nie bezpośrednio sprung mass.
- `F-26`: finding wycofany po odkryciu, że sweep nie zmieniał bryły.
- `F-27`: sama liczba shapes/contact points zmienia wynik nawet przy identycznym envelope.
- `F-28/F-29/F-30`: profil poprzeczny jest mierzalny dopiero przy odpowiednim fixture; rozdzielczość może mieć ekstremalny koszt.

## Konsekwencja dla odbudowy JV Web

1. Nie nazywać split envelope „current wheel system”.
2. Nie portować torus/prism/crown do pojazdu bez transfer gate Q3/Q4 i owner verdictu.
3. Oddzielić `legacy_vehicle_wheel_fixture` od przyszłego `wheel_research_adapter`.
4. Zapisać actual mass/inertia legacy koła; nie zakładać, że config density daje pożądaną masę.
5. Utrzymać W1/W2/W3/W4 seam bez implementowania papierowego frameworka.
6. Nie dodawać tire law, deformacji, temperatury ani damage jako pustych klas.
7. Przy kolejnej aktualizacji źródła użyć machine-readable statusów z `KOLA_FINDINGS.json`, nie opisów historycznych z dowolnego markdownu.