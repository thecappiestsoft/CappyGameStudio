  /* ---------- types ---------- */
  var TYPES = {
    hero: { name: 'Bohater', layer: 'game', z: 9, variants: [['capy', 'Kapibara'], ['robot', 'Robot'], ['astro', 'Astronauta'], ['knight', 'Rycerz'], ['fox', 'Lisek'], ['bird', 'Ptaszek'], ['capyfly', 'Latająca kapibara']], hitTop: [0.15, 0.15, 0.7, 0.7], hitSide: [0.15, 0.12, 0.7, 0.88] },
    ground: { name: 'Podłoże', layer: 'game', z: 1, variants: [['grass', 'Trawa'], ['dirt', 'Ziemia'], ['stone', 'Kamień'], ['sand', 'Piasek'], ['ice', 'Lód']] },
    wall: { name: 'Ściana', layer: 'game', z: 1, variants: [['brick', 'Cegły'], ['hedge', 'Żywopłot'], ['metal', 'Metal']] },
    platform: { name: 'Platforma', layer: 'game', z: 1, variants: [['wood', 'Drewno'], ['cloud', 'Chmurka'], ['stone', 'Kamień']], hit: [0, 0, 1, 0.45] },
    spikes: { name: 'Kolce', layer: 'game', z: 2, variants: [['steel', 'Stalowe']], hit: [0.1, 0.5, 0.8, 0.5] },
    lava: { name: 'Lawa', layer: 'game', z: 2, variants: [['lava', 'Lawa'], ['acid', 'Zielona maź'], ['water', 'Głęboka woda']], hit: [0, 0.3, 1, 0.7] },
    door: { name: 'Drzwi', layer: 'game', z: 2, variants: [['wood', 'Drewniane'], ['metal', 'Metalowe']] },
    coin: { name: 'Moneta', layer: 'game', z: 4, variants: [['gold', 'Złota'], ['silver', 'Srebrna']], hit: [0.2, 0.2, 0.6, 0.6] },
    star: { name: 'Gwiazdka', layer: 'game', z: 4, variants: [['yellow', 'Żółta'], ['pink', 'Różowa']], hit: [0.18, 0.18, 0.64, 0.64] },
    fruit: { name: 'Owoc', layer: 'game', z: 4, variants: [['apple', 'Jabłko'], ['cherry', 'Wiśnie'], ['orange', 'Pomarańcza'], ['pear', 'Gruszka']], hit: [0.2, 0.2, 0.6, 0.6] },
    key: { name: 'Klucz', layer: 'game', z: 4, variants: [['gold', 'Złoty']], hit: [0.15, 0.25, 0.7, 0.5] },
    gem: { name: 'Kryształ', layer: 'game', z: 4, variants: [['blue', 'Niebieski'], ['green', 'Zielony'], ['red', 'Czerwony']], hit: [0.2, 0.18, 0.6, 0.64] },
    heart: { name: 'Serce', layer: 'game', z: 4, variants: [['red', 'Czerwone']], hit: [0.2, 0.2, 0.6, 0.6] },
    card: { name: 'Karta z zadaniem', layer: 'game', z: 4, variants: [['blue', 'Niebieska'], ['yellow', 'Żółta']], hit: [0.2, 0.15, 0.6, 0.7] },
    enemy: { name: 'Przeciwnik', layer: 'game', z: 7, variants: [['robot', 'Robot'], ['bat', 'Nietoperz'], ['blob', 'Potworek'], ['guard', 'Strażnik']], hit: [0.12, 0.16, 0.76, 0.84] },
    goal: { name: 'Cel', layer: 'game', z: 3, variants: [['flag', 'Meta z flagą'], ['portal', 'Portal'], ['chest', 'Skrzynia'], ['house', 'Domek']], hit: [0.15, 0.1, 0.7, 0.9] },
    sign: { name: 'Tablica', layer: 'game', z: 3, variants: [['wood', 'Drewniana'], ['board', 'Szkolna']], hit: [0.1, 0.1, 0.8, 0.9] },
    deco: { name: 'Dekoracja', layer: 'deco', z: 0, variants: [['tree', 'Drzewo'], ['bush', 'Krzak'], ['flower', 'Kwiatek'], ['cloud', 'Chmura'], ['rock', 'Kamyk'], ['planet', 'Planeta'], ['shell', 'Muszla'], ['column', 'Kolumna'], ['books', 'Książki']] }
  };
