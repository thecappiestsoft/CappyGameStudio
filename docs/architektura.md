# Architektura CappyGameStudio

## Dwa moduły

```
┌──────────────────────────── strona (src/shell.html) ────────────────────────────┐
│  <script id="engine">  var CGM = (function(){ … return API })();               │
│        silnik: typy grafik, komponenty, Runtime, mountGame, karty, clicker      │
│  <script>  (function(){ … })();                                                 │
│        aplikacja: zapis, router, ekrany studia, szablony, Sprawdzacz, eksport   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- **Silnik (`CGM`)** nie zna studia. Dostaje projekt (JSON) i element HTML, a potem uruchamia grę.
  Ten sam silnik jest wklejany do każdej wyeksportowanej gry (`gameHTML()` w `screens/26-udostepnij-eksport.js`).
- **Aplikacja** edytuje projekt, zapisuje go w IndexedDB i podaje silnikowi do podglądu.

## Model danych w skrócie

Projekt ma **definicje obiektów** (`objects`) i **plansze** (`scenes`). Na planszach stoją **instancje** tych obiektów.

```
definicja  ── base ──▶ definicja bazowa      (warianty dziedziczą; local = nadpisane pola)
   │ data.comps = [ { uid, type, on, prio, p:{parametry} } ]
   ▼
instancja na planszy  (x, y, warstwa, ov = nadpisania tylko dla tej instancji)
```

`resolveInst(Pj, inst)` łączy bazę, wariant i nadpisania w jeden obiekt `r`. Ścieżki nadpisań wyglądają tak: `sprite.v` albo `comps#<uid>.p.speed`.

## Pętla gry (`Runtime` w `engine/10-runtime.js`)

1. `loadScene()` tworzy obiekty `e` (`makeEnt`). Wybiera gracza: pierwszy obiekt z komponentem ruchu gracza z `PDRV`.
   Bez gracza plansza może być grą klikaną (`clicker`) albo Tower Defense (komponent `td`).
2. Co klatkę `update(dt)` robi kolejno:
   - wejście;
   - `updatePlayer` (zależnie od `e.driver`: platformowy, top-down, flappy, kratki, wąż, auto, paletka);
   - `updateNpc` dla pozostałych obiektów (patrol, pościg, AI stanów, ścieżka, wieża, piłka, fale);
   - pociski i łupy;
   - kontakty gracza z obiektami (`interact`);
   - warunki ukończenia (`checkComplete`).
3. `render()` rysuje tło, obiekty (`drawSprite2`), efekty, mgłę i podświetlenia.
4. `mountGame()` dodaje HUD, ekran tytułowy, pauzę, rozmowy, sterowanie dotykowe i obsługę klawiatury.

Ważne zmienne w `Runtime`:
- `G` – stan gry: wynik, życia, zdrowie, ekwipunek, pamięć wyborów (`vars`), złoto, okrążenia;
- `ents` – obiekty planszy;
- `SOL` – obiekty blokujące;
- `proj` – pociski;
- `drops` – łupy;
- `PATHS` – trasy z punktów trasy.

## Komponenty

Każdy komponent w `COMP` ma:
- `group` (ruch / fizyka / interakcja / walka / status / kamera);
- `cat` (kategoria w module „Co robią?”);
- `params` (z nich powstaje formularz);
- opcjonalnie `req` i `conflicts`.

Na obiekcie może działać tylko jeden komponent z grupy **ruch**: ten z najwyższym priorytetem (`prio`).

## Aplikacja

- `ROUTES[nazwa](viewEl)` rysuje ekran. Adres ma postać `#nazwa`, np. `#scena`, `#zachowania`, `#karty`, `#samouczki`.
- `ACT[nazwa](element)` obsługuje przyciski z atrybutem `data-act`.
- `mut(fn)` wykonuje zmianę projektu z obsługą Cofnij/Ponów i autozapisem.
- `validateProject()` zwraca listę uwag Sprawdzacza (`error`/`warn`/`info`/`tip`) z linkiem do miejsca problemu.
