# JV Web — lokalna bramka refoundation

Updated: 2026-08-04
Status: `ACTIVE RUNBOOK`

## Cel

Jedna komenda ma zweryfikować aktualny refoundation branch bez ręcznej sekwencji poleceń i bez GitHub Actions.

Skrypt:

```text
tools/run-refoundation-gate.ps1
```

## Co sprawdza

Skrypt zatrzymuje się bez modyfikacji projektu, jeżeli:

- uruchomiono go poza właściwym repo;
- aktywny branch nie jest `agent/jv-web-refoundation`;
- working tree nie jest czysty;
- Node nie jest w majorze 24;
- brakuje przypiętego receiptu.

Dla znanego problemu Windows `core.autocrlf=true` porównuje bajty receiptu z blobem Gita. Tylko gdy różnią się, wykonuje kontrolowany `git restore` tego jednego tracked artifactu z bieżącego `HEAD` i ponownie potwierdza hash.

Następnie wykonuje:

```text
npm ci
npm run check:docs
npm run check
npm run build:bundle
```

`npm run check` uruchamia TypeScript i testy dokładnie raz. Ostatni krok buduje wyłącznie produkcyjny bundle; nie powtarza całej walidacji.

Zwykłe publiczne polecenie:

```text
npm run build
```

nadal zachowuje samodzielną semantykę `check + bundle` dla użytkownika uruchamiającego tylko build.

Skrypt nie tworzy commita, nie pushuje, nie uruchamia workflowa i nie zmienia brancha.

## Uruchomienie

Z dowolnego PowerShella po przełączeniu lokalnego repo na właściwy branch:

```powershell
Set-Location "C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JV-Box3D-Web-experiment\JV-Box3D-Web-experiment"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-refoundation-gate.ps1"
```

Aby po zielonej bramce uruchomić Vite:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-refoundation-gate.ps1" -StartDev
```

## Interpretacja

```text
REFOUNDATION LOCAL GATE: PASS
```

oznacza wyłącznie:

- zależności odtwarzają się z lockfile;
- lokalne linki Markdown istnieją;
- TypeScript i testy przechodzą;
- produkcyjny bundle się buduje.

Nie oznacza:

- native/WASM parity;
- poprawionego napędu produktu;
- owner-feel approval;
- gotowości mobile;
- zatwierdzenia backendu koła;
- zgody na merge.

## Browser gate

`-StartDev` uruchamia wyłącznie serwer. Manualny browser smoke zapisuje osobny receipt wtedy, gdy iteracja faktycznie dotyczy:

- renderera;
- browser lifecycle;
- inputu urządzenia;
- WASM startup;
- user-visible behavior.

Zmiana wyłącznie dokumentacji nie wymaga udawania browser validation.

## Zasady błędu

Po błędzie zachowaj pierwszy pełny komunikat. Nie odpowiadaj automatycznie przez:

```text
git reset --hard
git clean
git switch -f
wyłączenie engine-strict
ręczną edycję package-lock
zmianę workflowa
```

Najpierw klasyfikujemy błąd jako:

```text
document link
TypeScript contract
test falsification
WASM/runtime
bundle/browser
local checkout/provenance
```

Dopiero potem powstaje jedna minimalna poprawka.
