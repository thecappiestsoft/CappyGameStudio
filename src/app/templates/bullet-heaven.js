function exampleBulletHeaven(objs, p) {
  setPlayer(objs, [comp('topdown', { speed: 5, dirs: '8' }, { prio: 3 }), comp('camera', { smooth: 60 }), comp('shooter', { mode: 'auto', aim: 'nearest', pattern: 'single', interval: 0.55, damage: 1, speed: 9, range: 7 })]);
  addDef(objs, defn('xp', 'Kryształek', 'Przedmiot', { type: 'gem', v: 'blue' }, clone(BODY.item), [comp('pickup', { points: 1, sound: 'collect' })]));
  addDef(objs, defn('zombie', 'Zombie-glutek', 'Przeciwnik', { type: 'enemy', v: 'blob', color: '#9bd06a' }, clone(BODY.enemy), [comp('follow', { range: 40, speed: 2 }), comp('damage'), comp('health', { hp: 2, points: 1, drop: 'xp', invuln: 0.1 })]));
  addDef(objs, defn('swarm', 'Nietoperz roju', 'Przeciwnik', { type: 'enemy', v: 'bat' }, clone(BODY.enemy), [comp('follow', { range: 40, speed: 4 }), comp('damage'), comp('health', { hp: 1, points: 2, drop: 'xp', invuln: 0.1 })]));
  addDef(objs, defn('spawn1', 'Fala glutków', 'Obiekt interaktywny', { type: 'block', v: 'solid' }, clone(BODY.none), [comp('spawner', { obj: 'zombie', interval: 1.4, max: 30, where: 'around', delay: 1 })], { layer: 'interakcje', desc: 'Niewidzialny w grze. Co chwilę tworzy glutki wokół gracza.' }));
  addDef(objs, defn('spawn2', 'Fala nietoperzy', 'Obiekt interaktywny', { type: 'block', v: 'solid' }, clone(BODY.none), [comp('spawner', { obj: 'swarm', interval: 3, max: 12, where: 'around', delay: 25 })], { layer: 'interakcje' }));
  addDef(objs, defn('power', 'Mikstura mocy', 'Przedmiot', { type: 'potion', v: 'green' }, clone(BODY.item), [comp('pickup', { points: 0, effect: 'maxhp' })]));
  var m = gridMap(40, 28), x, y;
  for (x = 0; x < 40; x++) { m.put(x, 0, 'H'); m.put(x, 27, 'H'); } for (y = 0; y < 28; y++) { m.put(0, y, 'H'); m.put(39, y, 'H'); }
  [[8, 6], [30, 7], [12, 20], [28, 21], [20, 4], [6, 14], [33, 15]].forEach(function (q) { m.put(q[0], q[1], 'B'); });
  [[10, 10], [29, 11], [18, 22]].forEach(function (q) { m.put(q[0], q[1], 'h'); });
  [[5, 4], [34, 23]].forEach(function (q) { m.put(q[0], q[1], 'w'); });
  [[3, 3], [15, 8], [25, 18], [35, 5], [7, 24], [22, 13]].forEach(function (q) { m.put(q[0], q[1], 'f'); });
  m.put(20, 14, 'P'); m.put(1, 1, '1'); m.put(2, 1, '2');
  var s = sceneFromMap2('Polana przetrwania', m.out(), objs, { w: 'power', '1': 'spawn1', '2': 'spawn2' });
  s.bg.theme = 'dzungla';
  s.complete = { mode: 'all', conds: [{ type: 'survive', val: 90 }], next: 'end', count: 1 };
  p.mechanics.health = { maxHp: 5, lives: 1, invuln: 0.8, respawn: 'start' };
  hudOnly(p, ['score', 'health', 'scene']);
  p.flow.subtitle = 'Strzelasz sam! Ty tylko uciekaj przed falami potworów i zbieraj kryształki. Przetrwaj 90 sekund.';
  return [s];
}
