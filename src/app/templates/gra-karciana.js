var CARDS_EXTRA = [
  { id: 'k17', name: 'Glutek', type: 'minion', cost: 1, atk: 1, hp: 1, charge: true, sprite: { type: 'enemy', v: 'blob', color: '#7ed957' } },
  { id: 'k18', name: 'Zielony olbrzym', type: 'minion', cost: 5, atk: 3, hp: 7, taunt: true, sprite: { type: 'enemy', v: 'blob', color: '#3c9a3c' } },
  { id: 'k19', name: 'Giermek', type: 'minion', cost: 2, atk: 2, hp: 3, fx: 'armor', val: 2, sprite: { type: 'npc', v: 'knight' } },
  { id: 'k20', name: 'Królewska straż', type: 'minion', cost: 4, atk: 3, hp: 5, taunt: true, fx: 'heal', val: 3, sprite: { type: 'enemy', v: 'guard', color: '#ff7e6b' } },
  { id: 'k21', name: 'Smoczy oddech', type: 'spell', cost: 5, fx: 'dmgall', val: 3, sprite: { type: 'lava', v: 'lava' } },
  { id: 'k22', name: 'Smocze jajo', type: 'minion', cost: 2, atk: 0, hp: 4, taunt: true, fx: 'draw', val: 1, sprite: { type: 'gem', v: 'red' } },
  { id: 'k23', name: 'Skarbiec smoka', type: 'power', cost: 3, power: 'startArmor', val: 2, sprite: { type: 'goal', v: 'chest' } },
  { id: 'k24', name: 'Królewski rozkaz', type: 'spell', cost: 3, fx: 'buff', val: 2, val2: 3, sprite: { type: 'key', v: 'gold' } }
];
function exampleCards(objs, p) {
  setPlayer(objs, [comp('topdown', { speed: 5, dirs: '4' }, { prio: 3 }), comp('camera')]);
  p.cards = clone(CGM.DEFAULT_CARDS).concat(clone(CARDS_EXTRA));
  p.decks = [
    { id: 'dk_me', name: 'Talia Cappy', cards: clone(CGM.DEFAULT_DECK) },
    { id: 'dk_e1', name: 'Talia Skrzata', cards: { k1: 3, k17: 3, k3: 2, k8: 2, k10: 2, k12: 2, k7: 1, k2: 1 } },
    { id: 'dk_e2', name: 'Talia Rycerza', cards: { k19: 3, k2: 2, k20: 2, k5: 2, k24: 2, k13: 2, k15: 1, k4: 2, k8: 1 } },
    { id: 'dk_e3', name: 'Talia Smoka', cards: { k22: 3, k7: 2, k18: 2, k21: 2, k6: 2, k23: 1, k14: 1, k9: 1, k8: 2, k11: 1, k4: 1 } }
  ];
  function duelist(id, name, v, color, cfg) { var d = addDef(objs, defn(id, name, 'Przeciwnik', { type: 'enemy', v: v, color: color }, { type: 'static', solid: true, cat: 'Przeciwnik' }, [comp('cardduel', cfg)])); return d; }
  duelist('duel1', 'Skrzat Karciarz', 'blob', '#7ed957', { php: 20, ehp: 12, playerDeck: 'dk_me', enemyDeck: 'dk_e1', points: 10 });
  duelist('duel2', 'Rycerz Kier', 'guard', '#ff7e6b', { php: 20, ehp: 18, playerDeck: 'dk_me', enemyDeck: 'dk_e2', points: 20 });
  duelist('duel3', 'Smok Asów', 'bat', '#8b5cf6', { php: 20, ehp: 25, playerDeck: 'dk_me', enemyDeck: 'dk_e3', points: 40 });
  var s = sceneFromMap2('Wieża pojedynków', [
    '######################',
    '#.....#....#....#....#',
    '#.?...#....#....#....#',
    '#P....A....B....D..X.#',
    '#..h..#..h.#.h..#....#',
    '#.....#....#....#....#',
    '######################'], objs, { A: 'duel1', B: 'duel2', D: 'duel3' });
  s.bg.theme = 'fantastyka';
  var sg = s.inst.filter(function (i) { return i.obj === 'sign'; })[0];
  ovDialog(sg, objs.sign, { lines: 'Podejdź do przeciwnika, a zacznie się pojedynek na karty.\nCo turę dostajesz więcej many (niebieskie romby). Karta kosztuje tyle many, ile pokazuje liczba w rogu.\nStwory zostają na stole i atakują od następnej tury. Kliknij swojego stwora, a potem cel.\nCzary działają od razu, a karty mocy działają do końca pojedynku.\nSwoje karty i talie zmienisz w module „Karty i talie”!' });
  s.complete = { mode: 'all', conds: [{ type: 'reach' }], next: 'end', count: 1 };
  hudOnly(p, ['score', 'lives', 'scene']);
  p.flow.subtitle = 'Pokonaj trzech mistrzów kart i dojdź na szczyt wieży. Karty i talie możesz zmieniać!';
  return [s];
}
