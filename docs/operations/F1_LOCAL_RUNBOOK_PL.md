# F1 — bezpieczne odzyskanie lokalnego repo i walidacja

Data: 2026-08-03
Status: `ACTIVE LOCAL RUNBOOK`

Dotyczy katalogu:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JV-Box3D-Web-experiment\JV-Box3D-Web-experiment
```

Cel:

- naprawić working tree po częściowo nieudanym przełączeniu brancha;
- zachować nieśledzone pliki starego prototypu;
- przełączyć lokalne repo na `agent/clean-browser-core`;
- wygenerować prawdziwy lockfile na Node 24;
- uruchomić target-toolchain test/build/browser gate F1.

Procedura nie używa `reset --hard`, `clean`, `restore` dla nieśledzonych plików ani wymuszonego przełączania.

---

## 1. Potwierdź katalog i bieżący branch

```powershell
Get-Location
git status --short --branch
```

Nie kontynuuj, jeżeli `Get-Location` nie wskazuje dokładnie repozytorium wymienionego na początku dokumentu.

## 2. Cofnij wyłącznie częściową podmianę tracked files

Będąc nadal na `agent/bootstrap-web-poc`:

```powershell
git restore --source=HEAD --staged --worktree -- .
git status --short --branch
```

Ta operacja przywraca tracked files bieżącego commita. Nie usuwa nieśledzonych:

- `package-lock.json`;
- wygenerowanych `public/...`;
- `node_modules`.

Po komendzie nie powinny już pozostać masowe staged `A/D/M` dotyczące clean dokumentów i starego kodu.

## 3. Zachowaj nieśledzone pliki starego prototypu

```powershell
git stash push --include-untracked -m "bootstrap generated files before clean browser core"
git status --short --branch
git stash list -n 3
```

Oczekiwany efekt:

- tracked working tree jest czysty;
- nieśledzony stary `package-lock.json` i wygenerowane assety znajdują się w stashu;
- ignorowany `node_modules` może pozostać fizycznie w katalogu — późniejsze `npm ci` zastąpi go zgodnie z clean lockfile.

Nie wykonuj `git stash pop` na clean branchu. Stash należy do historycznego prototypu i może zostać odzyskany później wyłącznie po powrocie na `agent/bootstrap-web-poc`.

## 4. Napraw refspec zdalnych branchy

Lokalny clone był ograniczony tylko do starego brancha. Ustaw normalne pobieranie wszystkich branchy:

```powershell
git config --replace-all remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git fetch origin --prune
git config --get-all remote.origin.fetch
git branch -r --list "origin/agent/clean-browser-core"
```

Oczekiwany refspec:

```text
+refs/heads/*:refs/remotes/origin/*
```

## 5. Przełącz clean branch bez zgadywania, czy lokalny branch istnieje

```powershell
git show-ref --verify --quiet refs/heads/agent/clean-browser-core
if ($LASTEXITCODE -eq 0) {
    git switch agent/clean-browser-core
    git branch --set-upstream-to=origin/agent/clean-browser-core
    git pull --ff-only
} else {
    git switch --create agent/clean-browser-core --track origin/agent/clean-browser-core
}
```

Potem:

```powershell
git status --short --branch
git rev-parse --short HEAD
git rev-parse --short origin/agent/clean-browser-core
```

Dwa ostatnie hashe muszą być identyczne. Nie wpisujemy do runbooka stałego SHA, ponieważ branch rozwija się podczas F1.

## 6. Sprawdź docelowe narzędzia

```powershell
node --version
npm --version
```

Wymaganie clean brancha:

```text
Node major = 24
```

`.npmrc` ma `engine-strict=true`, więc instalacja na innym majorze powinna zakończyć się błędem zamiast utworzyć lockfile z niewłaściwego środowiska.

Jeżeli `node --version` nie zaczyna się od `v24.`, zatrzymaj procedurę na tym miejscu. Nie omijaj `engine-strict`.

## 7. Wygeneruj lockfile bez instalacyjnych skryptów

```powershell
npm install --package-lock-only --ignore-scripts
git status --short
```

Oczekiwany nowy tracked candidate:

```text
?? package-lock.json
```

`package.json` nie powinien zostać zmieniony, ponieważ zależności mają dokładne wersje, a `.npmrc` wymusza `save-exact=true`.

## 8. Sprawdź czystą reprodukcję

```powershell
npm ci
npm run check
npm run build
```

Bramka przechodzi tylko wtedy, gdy wszystkie trzy komendy kończą się kodem 0.

`npm ci` może usunąć i odtworzyć istniejący `node_modules`. Jest to oczekiwane — katalog jest regenerowalnym outputem, nie źródłem projektu.

Nie dodawaj do Git:

- `node_modules`;
- `dist`;
- `.test-dist`.

## 9. Ręczny test przeglądarkowy F1

```powershell
npm run dev
```

W przeglądarce sprawdź:

1. strona pokazuje `Clean Browser Core — F1`;
2. status mówi, że nie ma Box3D ani startup probes;
3. krótkie A/D lub strzałki pokazują proporcjonalne `RATE`, nie zawsze pełne `±1`;
4. puszczenie klawisza przechodzi do `RELEASE`;
5. przełączenie karty/okna z aktywnym klawiszem nie zostawia zablokowanego skrętu;
6. przycisk `Restart host` nie przeładowuje strony i host nadal reaguje raz na każde zdarzenie;
7. konsola nie pokazuje uncaught exceptions.

Ten test potwierdza host/input lifecycle. Nie testuje fizycznej kierownicy ani pojazdu.

Zatrzymaj Vite przez `Ctrl+C` po teście.

## 10. Commit lockfile dopiero po zielonej walidacji

```powershell
git status --short
git add package-lock.json
git commit -m "Pin F1 npm dependency graph"
git push
```

Nie używaj `git add .`. Commit ma zawierać tylko świadomie zweryfikowany lockfile, chyba że osobny fix target-toolchain był konieczny i został wcześniej przejrzany.

Po pushu zapisz w issue #3:

```text
node version
npm version
npm ci result
npm run check result
npm run build result
manual browser observations
new commit SHA
```

## 11. Warunek zatrzymania

Zatrzymaj się i zachowaj pełny komunikat, jeżeli wystąpi:

- konflikt przy `git switch`;
- brak Node 24;
- zmiana `package.json` podczas generowania lockfile;
- błąd `npm ci`;
- błąd typecheck/test/build;
- zablokowane wejście po blur/visibility change;
- więcej niż jedna reakcja hosta po jednym zdarzeniu po restarcie.

Nie używaj w odpowiedzi na błąd:

- `git reset --hard`;
- `git clean`;
- wymuszonego `git switch -f`;
- ręcznego edytowania lockfile;
- wyłączenia `engine-strict`.

Najpierw diagnozujemy konkretny stan i zachowujemy dane.