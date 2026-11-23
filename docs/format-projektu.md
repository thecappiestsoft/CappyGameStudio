# Format projektu „cgs-1”

Plik projektu (`*.cgs.json`) i wpis w IndexedDB mają ten sam kształt:

```jsonc
{
  "format": "cgs-1", "app": "CappyGameStudio", "id": "p…",
  "meta": { "name": "Moja gra", "author": "", "desc": "", "version": "1.0" },
  "settings": { "view": "side" | "top", "viewW": 20, "viewH": 12, "res": "20x12", "sound": true, "touch": "auto", "scaling": "fit" },
  "objects": { "<id>": Definicja, … },
  "scenes": [ Plansza, … ],
  "flow": { "start": "<id planszy>", "order": ["…"], "title": true, "titleText": "", "subtitle": "", "winMsg": "", "loseMsg": "" },
  "mechanics": {
    "score": { "on": true, "start": 0, "bonusLife": 0 },
    "health": { "maxHp": 3, "lives": 3, "invuln": 1, "respawn": "checkpoint" },
    "inventory": { "on": true, "slots": 8 },
    "timer": { "on": false, "limit": 120, "warn": 10 },
    "hud": { "score": true, "health": true, "lives": true, "inventory": true, "timer": true, "scene": true, "memory": true },
    "matrix": { … }                  // kto z kim się zderza (kategorie)
  },
  "assets": { "<klucz>": { "type": "image" | "audio", "name": "", "data": "data:…", "sheet": null } },
  "cards": [ Karta, … ], "decks": [ { "id": "", "name": "", "cards": { "<id karty>": 2 } } ],
  "prefabs": [], "versions": [], "export": { "touch": "auto", "loading": "" }
}
```

**Definicja**
```jsonc
{ "id": "enemy", "name": "Strażnik", "category": "Przeciwnik", "desc": "", "tags": [],
  "base": null, "layer": "swiat", "local": { "sprite.v": "blob" },
  "data": { "sprite": { "type": "enemy", "v": "robot", "color": "#…", "img": "<klucz zasobu>" },
            "size": { "w": 1, "h": 1 },
            "body": { "type": "static" | "dynamic" | "kinematic" | "none", "solid": false, "cat": "Przeciwnik" },
            "params": {}, "comps": [ { "uid": "c…", "type": "patrol", "on": true, "prio": 2, "p": { … } } ] } }
```

**Plansza**
```jsonc
{ "id": "s…", "name": "Las", "cols": 40, "rows": 12,
  "bg": { "theme": "przyroda", "color": "#ffffff", "parallax": 0.3 },
  "inst": [ { "id": "i…", "obj": "enemy", "x": 5, "y": 9, "layer": "swiat", "ov": { "comps#c….p.speed": 4 }, "flip": false, "locked": false } ],
  "complete": { "mode": "all" | "any" | "count", "count": 1, "next": "next" | "end" | "<id planszy>",
                "conds": [ { "type": "reach" | "item" | "score" | "defeat" | "collect" | "survive" | "var" | "boxes" | "waves" | "laps" | "bricks", "val": 10, "item": "" } ] } }
```

Warstwy instancji: `tlo`, `swiat`, `kolizje` (niewidoczne w grze), `interakcje`, `efekty`. Obiekty z warstw `tlo` i `efekty` nie reagują na dotyk gracza.
