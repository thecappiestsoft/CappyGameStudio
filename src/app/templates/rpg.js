function exampleRPG(objs, p) {
  setPlayer(objs, [comp('topdown', { speed: 5, dirs: '8' }, { prio: 3 }), comp('camera'), comp('melee', { mode: 'key', damage: 1, range: 1, cooldown: 0.35 }), comp('dodge', { distance: 2 })]);
  addDef(objs, defn('elder', 'Sołtys', 'Obiekt interaktywny', { type: 'npc', v: 'knight' }, { type: 'static', solid: true, cat: 'Interakcja' }, [comp('dialog', { lines: 'Sołtys: Witaj, wędrowcze!\nSołtys: Potwory porwały Kryształ Mocy do lasu.\nSołtys: Klucz do bramy leży w domku po lewej. Atakuj klawiszem Z, unikaj klawiszem C!' })]));
  addDef(objs, defn('smith', 'Kowalka', 'Obiekt interaktywny', { type: 'npc', v: 'fox' }, { type: 'static', solid: true, cat: 'Interakcja' }, [comp('dialog', { lines: 'Kowalka: Zielone glutki w lesie są powolne, ale wytrzymałe.\nKowalka: Zbieraj zioła – przydadzą się. A serca leczą rany!' })]));
  addDef(objs, defn('slime', 'Glutek', 'Przeciwnik', { type: 'enemy', v: 'blob' }, clone(BODY.enemy), [comp('ai', { detect: 4, patrolSpeed: 1, chaseSpeed: 2, distance: 2 }, { prio: 3 }), comp('damage'), comp('health', { hp: 3, points: 5, invuln: 0.3 })]));
  addDef(objs, defn('herb', 'Zioło', 'Przedmiot', { type: 'gem', v: 'green' }, clone(BODY.item), [comp('pickup', { points: 2, toInv: true, item: 'Zioło' })]));
  addDef(objs, defn('crystal', 'Kryształ Mocy', 'Przedmiot', { type: 'gem', v: 'red' }, clone(BODY.item), [comp('pickup', { points: 20, toInv: true, item: 'Kryształ Mocy', msg: 'Masz Kryształ Mocy! Zanieś go do wyjścia z lasu.' })]));
  var L = { e: 'elder', s: 'smith', F: 'slime', g: 'herb', R: 'crystal' };
  var village = sceneFromMap2('Wioska', [
    'HHHHHHHHHHHHHHHHHHHHHHHHHH',
    'H..t.....u......t....H...H',
    'H.####.......####....H...H',
    'H.#k.#...e...#..#....H...H',
    'H.#..#.......#.h#....H...H',
    'H.##.#.......##.#....H...H',
    'H....................H...H',
    'H.t....P.............d.O.H',
    'H....................H...H',
    'H...u.....s......t...H...H',
    'H....................H...H',
    'H..t.......f.........H...H',
    'H.......c....c.......H...H',
    'HHHHHHHHHHHHHHHHHHHHHHHHHH'], objs, L);
  village.bg.theme = 'przyroda'; village.complete = { mode: 'all', conds: [], next: 'next', count: 1 };
  var forest = sceneFromMap2('Las potworów', [
    'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
    'H.....t......F.......t.......H',
    'H.P...........g.......HHHH...H',
    'H......HHHH...........H..H.F.H',
    'H..t...H..H.....t.....H.RH...H',
    'H......H.gH...........H..H...H',
    'H......HH.H.....F.....HH.H...H',
    'H.................g..........H',
    'H...F.......t..........t.....H',
    'H.......g..........HHHHH.....H',
    'H..t...........F...H...H..g..H',
    'H..................H.X.H.....H',
    'H.......h..........HH.HH.....H',
    'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHH'], objs, L);
  forest.bg.theme = 'dzungla';
  forest.complete = { mode: 'all', conds: [{ type: 'item', item: 'Kryształ Mocy' }, { type: 'reach' }], next: 'end', count: 1 };
  var portal = village.inst.filter(function (i) { return i.obj === 'portal'; })[0], pc = compOf(objs.portal, 'goal');
  portal.ov['comps#' + pc.uid + '.p.scene'] = forest.id;
  p.flow.subtitle = 'Porozmawiaj z sołtysem, znajdź klucz do bramy i odzyskaj Kryształ Mocy z lasu.';
  p.mechanics.health = { maxHp: 5, lives: 3, invuln: 1, respawn: 'checkpoint' };
  return [village, forest];
}
