function exampleDungeon(objs, p) {
  setPlayer(objs, [comp('gridstep', { speed: 7, attack: 1, vision: 4.5 }, { prio: 3 }), comp('camera', { smooth: 50, dead: 0 })], { sprite: { type: 'hero', v: 'knight' } });
  objs.player.name = 'Rycerz Cappy';
  addDef(objs, defn('dfloor', 'Posadzka lochu', 'Element środowiska', { type: 'ground', v: 'stone', color: '#5d5670' }, clone(BODY.none), [], { layer: 'tlo', tags: ['kafelek'] }));
  addDef(objs, defn('dwall', 'Mur lochu', 'Element środowiska', { type: 'wall', v: 'brick', color: '#4a4258' }, clone(BODY.wall), [], { tags: ['kafelek'] }));
  addDef(objs, defn('dslime', 'Glut lochów', 'Przeciwnik', { type: 'enemy', v: 'blob', color: '#9a6bff' }, clone(BODY.enemy), [comp('turnai', { detect: 5, damage: 1 }, { prio: 3 }), comp('health', { hp: 2, points: 10, invuln: 0 })]));
  addDef(objs, defn('dbat', 'Nietoperz jaskiniowy', 'Przeciwnik', { type: 'enemy', v: 'bat' }, clone(BODY.enemy), [comp('turnai', { detect: 7, damage: 1 }, { prio: 3 }), comp('health', { hp: 1, points: 5, invuln: 0 })]));
  addDef(objs, defn('dboss', 'Strażnik lochu', 'Przeciwnik', { type: 'enemy', v: 'guard', color: '#e04a5a' }, clone(BODY.enemy), [comp('turnai', { detect: 6, damage: 2, wander: false }, { prio: 3 }), comp('health', { hp: 6, points: 50, invuln: 0, boss: true, drop: 'key' })]));
  addDef(objs, defn('hpot', 'Mikstura zdrowia', 'Przedmiot', { type: 'potion', v: 'red' }, clone(BODY.item), [comp('pickup', { points: 0, heal: 2, sound: 'life', msg: 'Zdrowie +2' })]));
  addDef(objs, defn('stairs', 'Schody w dół', 'Obiekt interaktywny', { type: 'pad', v: 'stairs' }, clone(BODY.sensor), [comp('goal')]));
  addDef(objs, defn('dchest', 'Skarb lochu', 'Obiekt interaktywny', { type: 'goal', v: 'chest' }, clone(BODY.sensor), [comp('goal')]));
  var L = { '#': 'dwall', F: 'dslime', b: 'dbat', B: 'dboss', p: 'hpot', S: 'stairs', T: 'dchest' };
  var f1 = sceneFromMap2('Loch – poziom 1', [
    '######################',
    '#P...#.......#.......#',
    '#....#..F....#...g...#',
    '#....d.......#.......#',
    '#....#.......###.#####',
    '###.##...p...#.....F.#',
    '#....#.......#.......#',
    '#.k..#####.###.......#',
    '#....#.........b.....#',
    '#..F.#..g......#####.#',
    '#....#.........#..S..#',
    '######################'], objs, L);
  var f2 = sceneFromMap2('Loch – sala strażnika', [
    '######################',
    '#P.......#...........#',
    '#..p.....#...b.......#',
    '#....................#',
    '#........#.....B.....#',
    '####.#####...........#',
    '#........#..F.....F..#',
    '#..F.....#...........#',
    '#..h.....######d######',
    '#........#...........#',
    '#....g...#.....T.....#',
    '######################'], objs, L);
  [f1, f2].forEach(function (s) { s.bg.theme = 'fantastyka'; floorUnder(s, objs, 'dfloor', ['dwall']); });
  f1.complete = { mode: 'all', conds: [{ type: 'reach' }], next: 'next', count: 1 };
  f2.complete = { mode: 'all', conds: [{ type: 'reach' }], next: 'end', count: 1 };
  p.mechanics.health = { maxHp: 6, lives: 3, invuln: 0.15, respawn: 'checkpoint' };
  hudOnly(p, ['score', 'health', 'lives', 'inventory', 'scene']);
  p.flow.subtitle = 'Każdy twój krok to tura – potem ruszają się potwory. Wejdź na potwora, żeby go zaatakować. Znajdź klucz, zejdź schodami i pokonaj Strażnika lochu!';
  p.flow.winMsg = 'Skarb lochu jest twój! Prawdziwy z ciebie poszukiwacz przygód.';
  return [f1, f2];
}