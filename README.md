# CappyGameStudio 1.7.0 – kod źródłowy

Edukacyjne studio gier 2D „bez kodu, bez bloczków, bez AI” dla szkół Infotech.
Uczniowie składają gry z obiektów, komponentów (zachowań) i zasad, a potem grają w nie od razu w przeglądarce.

© 2026 CappySoft.pl. Wszelkie prawa zastrzeżone.

Aplikacja to **jedna strona HTML**. Nie potrzebuje serwera, bazy danych ani bibliotek z sieci, bo wszystkie skrypty i style są w środku pliku. Projekty uczniów zapisują się w przeglądarce (IndexedDB).
To repozytorium dzieli tę stronę na mniejsze pliki, żeby wygodnie się nad nią pracowało. Skrypt budowania skleja je z powrotem w jeden plik.

---

## Szybki start

Wymagany jest **Node.js 20 lub nowszy**. Sam build nie potrzebuje żadnych pakietów.

```bash
npm run build      # składa dist/index.html
npm run watch      # buduje ponownie po każdej zmianie w src/
npm run serve      # podgląd: http://localhost:8080
npm test           # szybki test składni (bez przeglądarki)
```

Testy w przeglądarce instaluje się jednorazowo:

```bash
npm install
npx playwright install chromium
npm run test:e2e   # każdy szablon gry musi przejść Sprawdzacz i się uruchomić
```

`dist/index.html` można też po prostu otworzyć dwuklikiem.

---

## Struktura katalogów

```
cappygamestudio/
├─ build/
│  ├─ build.js            skrypt budowania (skleja src/ → dist/)
│  └─ manifest.json       KOLEJNOŚĆ sklejania plików – najważniejszy plik budowania
├─ src/
│  ├─ shell.html          szkielet strony: nagłówek, menu, stopka i znaczniki /*CSS*/ /*ENGINE*/ /*APP*/
│  ├─ styles/             style studia (wspólne, warstwa dla dzieci, palety, styl Dashboard)
│  ├─ engine/             silnik gier „CGM” – działa też samodzielnie w wyeksportowanych grach
│  └─ app/
│     ├─ core/            narzędzia, ikony, zapis, okna, biblioteka obiektów, Sprawdzacz gry, router
│     ├─ templates/       prototypy gatunków (po jednym pliku na gatunek)
│     ├─ screens/         ekrany studia (moduły 1–8, karty, eksport, samouczki)
│     └─ 99-start-aplikacji.js   uruchomienie aplikacji (zawsze na końcu)
├─ tests/
│  ├─ skladnia.js         build + sprawdzenie składni + uruchomienie silnika w Node
│  └─ sprawdz-szablony.js test e2e wszystkich szablonów (Playwright)
├─ tools/serve.js         prosty serwer podglądu
├─ docs/
│  ├─ architektura.md     jak działa silnik i aplikacja
│  └─ format-projektu.md  opis pliku projektu (JSON „cgs-1”)
└─ dist/                  wynik budowania (nie edytuj ręcznie; jest w .gitignore)
```

### Silnik (`src/engine/`)

| Plik | Zawartość |
|---|---|
| `00-start.js` | początek modułu `var CGM = (function () {` i stałe (`T = 40` px na kratkę) |
| `01-pomocnicze-rysowanie.js` | `rr`, `fill`, `circ`, `ell`, `poly`, `line`, `shade` – rysowanie w układzie 0..1 |
| `02-typy-grafik.js` | `TYPES` – rodzaje grafik i ich warianty (bohater, ściana, moneta…) |
| `03-zachowania-junior.js` | proste zachowania z wersji Junior (zgodność wsteczna) |
| `04-motywy-tla.js` | `THEMES` i `drawBackground` – tła plansz |
| `05-grafiki.js` | `SPR.*` – wektorowe rysowanie wszystkich obiektów |
| `06-dzwieki.js` | `Sound()` – syntezowane dźwięki (WebAudio) |
| `07-grafiki-dodatkowe.js` | grafiki dodane później (przełącznik, rura, auto, wieża, cegiełka…) |
| `08-komponenty.js` | **`COMP` – katalog komponentów** (nazwa, opis, grupa, parametry) |
| `09-definicje-i-warianty.js` | `resolveDef`/`resolveInst` – dziedziczenie wariantów i nadpisania instancji |
| `10-runtime.js` | **`Runtime()` – pętla gry**: fizyka, ruch, walka, interakcje, warunki ukończenia, rysowanie |
| `11-css-gracza.js` | style odtwarzacza gry (HUD, ekran tytułowy, pauza, rozmowy) |
| `12-pojedynek-karciany.js` | pojedynek w stylu Hearthstone (`cardDuel`) i domyślne karty |
| `13-clicker.js` | interfejs gry klikanej (`clickerUI`) |
| `14-css-kart-i-clickera.js` | style kart i clickera, `ensureCss()` |
| `15-mount-game.js` | `mountGame()` – osadza grę w stronie: klawiatura, dotyk, HUD, menu |
| `99-eksport-api.js` | publiczne API `CGM` i zamknięcie modułu |

### Aplikacja (`src/app/`)

| Plik | Zawartość |
|---|---|
| `core/00-start-i-narzedzia.js` | początek modułu aplikacji, `esc`, `uid`, `clone`, `plural`, `slug` |
| `core/02-zapis-indexeddb.js` | `STORE` (IndexedDB), ustawienia `SET`, lista projektów |
| `core/05-biblioteka-obiektow-i-szablony.js` | `baseLibrary`, `newProject`, mapa liter `LEG`, przykładowe plansze |
| `core/07-sprawdzacz-gry.js` | `validateProject()` – reguły Sprawdzacza gry |
| `core/08-router-i-menu.js` | `ROUTES`, `ACT`, menu kroków `NAV` |
| `screens/10-moje-gry.js` | ekran startowy, lista `TEMPLATES` (szablony i prototypy) |
| `screens/12-edytor-planszy.js` | moduł 1 – Plansza |
| `screens/20…27` | moduły 2–8 i Pomoc/Wygląd |
| `screens/30-karty-i-talie.js` | edytor kart i talii; **tu jest `APP_VERSION`** |
| `screens/31-eksport-na-platformy.js` | paczki ZIP: PWA, Electron (Windows/Mac/Linux), Capacitor (Android/iOS) |
| `screens/32-samouczki-z-cappy.js` | samouczki z kapibarą-przewodniczką (`TUTS`) |

---

## Jak działa budowanie

`build/manifest.json` ma trzy listy: `css`, `engine` i `app`. Każdy wpis to `{ "file": ścieżka, "join": łącznik }`.
Pliki są sklejane **dokładnie w tej kolejności**, a pole `join` mówi, co wstawić przed plikiem (zwykle znak nowej linii).
Wynik trafia w miejsce znaczników `/*CSS*/`, `/*ENGINE*/` i `/*APP*/` w `src/shell.html`.

Ważne:
- Silnik i aplikacja to **dwa duże moduły IIFE**. Ich pliki są kawałkami tej samej funkcji, więc nie są samodzielnymi modułami ES. Pierwszy plik otwiera moduł, a ostatni go zamyka. Kolejność ma znaczenie.
- **Nowy plik dopisz do `manifest.json`.** Build ostrzeże o pliku `.js`/`.css` w `src/`, którego tam nie ma.
- Kod jest pisany w stylu ES5 (`var`, `function`), tak jak reszta projektu. Działa na starszych komputerach szkolnych i nie wymaga transpilacji.

---

## Najczęstsze zadania

### Nowy komponent (zachowanie)
1. `src/engine/08-komponenty.js` – dopisz wpis do `COMP`:
   ```js
   magnes: { name: 'Magnes', cat: 'Interakcje', group: 'interakcja', desc: 'Przyciąga monety w promieniu.',
     params: [P('range', 'Zasięg (kratki)', 'range', 3, { min: 1, max: 10, basic: 1 })] },
   ```
   Typy parametrów: `range`, `num`, `bool`, `select` (z `opts`), `text`, `textarea`, `item`, `scene`, `sound`, `objdef`, `deck`.
   `basic: 1` pokazuje parametr od razu, `adv: 1` chowa go w „Więcej ustawień”.
   Komponent z `group: 'ruch'` steruje ruchem obiektu (`e.driver`). `player: true` oznacza ruch gracza.
2. `src/engine/10-runtime.js` – dodaj działanie, zwykle w `updatePlayer` (gracz) albo `updateNpc` (pozostałe obiekty).
   Parametry obiektu są w `e.comps.magnes`.
3. Jeśli komponent potrzebuje osobnego sprawdzenia, dopisz regułę w `src/app/core/07-sprawdzacz-gry.js`.

Komponent sam pojawi się w module „Co robią?”.

### Nowy rodzaj grafiki
`src/engine/07-grafiki-dodatkowe.js`:
```js
TYPES.rakieta = { name: 'Rakieta', layer: 'game', z: 6, variants: [['red', 'Czerwona']] };
SPR.rakieta = function (c, o, t, st) { /* rysuj w kwadracie 0..1 pomocnikami rr/fill/circ… */ };
```

### Nowy prototyp gatunku
1. Utwórz `src/app/templates/moj-gatunek.js` z funkcją `exampleMojGatunek(objs, p)`. Ma ona zwrócić tablicę plansz.
   Przydatne pomocniki: `defn`, `comp`, `addDef`, `setPlayer`, `sceneFromMap2`, `gridMap`, `hudOnly`, `floorUnder`.
2. Dopisz plik do `manifest.json` (sekcja `app`, przed `screens/20-…`).
3. `src/app/core/05-biblioteka-obiektow-i-szablony.js` – dodaj gatunek do mapy `GEN` w `newProject`. Jeśli gra jest widziana z boku, dopisz go też do `SIDE_T`.
4. `src/app/screens/10-moje-gry.js` – dodaj wpis do `TEMPLATES` (`'g'` na końcu = sekcja „Prototypy gatunków”) i nazwę gry w mapie tytułów.
5. Uruchom `npm run test:e2e`. Nowy szablon musi przejść Sprawdzacz bez uwag.

### Nowy warunek ukończenia poziomu
- `src/engine/10-runtime.js`: `condState()` (czy spełniony) i `condText()` (opis dla gracza);
- `src/app/screens/23-poziomy.js`: `CONDS` (nazwa w liście), opis w polu warunku, zdanie w `flowSentence`.

### Nowy ekran (moduł)
Zdefiniuj `ROUTES.nazwa = function (v) { v.innerHTML = '…'; }`. Akcje przycisków przypisz przez `data-act="x"` i `ACT.x = function (el) {…}`.
Ekrany projektu dopisz do `MODULE_ROUTES`, a pozycję menu do `NAV`/`NAVX` (`core/08-router-i-menu.js`).

### Nowa lekcja samouczka
`src/app/screens/32-samouczki-z-cappy.js` – dopisz obiekt do `TUTS`. Każdy krok może mieć:
`sel` (co podświetlić), `t` (tekst Cappy), `go` (przejście do ekranu), `wait` (`'click'`, `'change'`, `'input'`, `'route:nazwa'`), `check(st)` (funkcja warunku) oraz `pre(st)` (akcja na początku kroku).

### Wygląd studia
- palety kolorów: `src/styles/30-palety.css` (atrybut `data-palette` na `<html>`);
- styl Dashboard: `src/styles/40-styl-dashboard.css` (atrybut `data-skin="corona"`);
- kolory modułów: zmienne `--m-*` w `20-warstwa-dla-dzieci.css`.

Pilnuj kontrastu tekstu: co najmniej 4,5:1 (WCAG AA).

### Nowa wersja programu
Zmień numer w czterech miejscach: `APP_VERSION`/`APP_BUILD` w `screens/30-karty-i-talie.js`, stopka w `src/shell.html` (`id="appver"`), `version` w `package.json` i `build/manifest.json`.

---

## Testowanie i debugowanie

- `npm test` – szybko, bez przeglądarki. Uruchamia też silnik w Node i liczy komponenty.
- `npm run test:e2e` – wszystkie szablony w Chromium.
- W konsoli przeglądarki, na ekranie „Zagraj!”: `window.__cgsGame().rt().dbg()` zwraca gracza, obiekty i stan gry (`G`). Przydaje się przy testach automatycznych.
- Moduł „Zagraj!” ma Podglądacz, dziennik „Co się wydarzyło” i przełącznik „Pokaż ramki” (prostokąty kolizji).

## Publikacja

- `dist/index.html` to cała aplikacja. Można ją wgrać na dowolny serwer statyczny albo otworzyć z dysku.
- `dist/cappygamestudio.fragment.html` to sama treść strony bez `<html>`/`<head>`, do osadzania w innym szablonie.
- Zapisywanie plików korzysta z `window.claude.use("downloads")`, gdy aplikacja działa jako artefakt Claude. Poza nim używa zwykłego pobierania z przeglądarki.

## Zasady projektu

- Interfejs jest po polsku i pisany dla dzieci: krótkie zdania, bez żargonu.
- Dostępność: obsługa klawiaturą, widoczny fokus, `prefers-reduced-motion` (ustawienie `SET.rm`), etykiety ARIA.
- Ochrona małoletnich: aplikacja nie zbiera danych osobowych, wszystko zostaje w przeglądarce. Teksty w aplikacji przypominają, żeby nie wpisywać w grach nazwisk, adresów ani zdjęć osób.
- Brak zależności w czasie działania i brak zapytań do sieci.
