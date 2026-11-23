function exampleSouls(objs, p) {
  setPlayer(objs, [comp('platformer', { speed: 5, jump: 3 }, { prio: 3 }), comp('camera'), comp('melee', { mode: 'key', damage: 1, range: 1, cooldown: 0.35 }), comp('dodge', { distance: 2.5, invuln: 0.4, cooldown: 0.7 })]);
  addDef(objs, defn('hollow', 'Rycerz Cienia', 'Przeciwnik', { type: 'enemy', v: 'guard', color: '#5b5f86' }, clone(BODY.enemy), [comp('ai', { detect: 5, patrolSpeed: 2, chaseSpeed: 3, distance: 3 }, { prio: 3 }), comp('gravity'), comp('melee', { mode: 'auto', damage: 1, range: 0.8, cooldown: 1.2, windup: 0.6 }), comp('health', { hp: 3, points: 10, invuln: 0.25 })], { desc: 'Nie rani dotykiem – tylko ciosem po zamachu (wykrzyknik!).' }));
  var boss = addDef(objs, defn('bossx', 'Strażnik Otchłani', 'Przeciwnik', { type: 'enemy', v: 'robot', color: '#7a2f8f' }, clone(BODY.enemy), [comp('ai', { detect: 9, patrolSpeed: 1, chaseSpeed: 2, distance: 2 }, { prio: 3 }), comp('gravity'), comp('melee', { mode: 'auto', damage: 2, range: 1.2, cooldown: 1.5, windup: 0.8 }), comp('shooter', { mode: 'auto', aim: 'player', pattern: 'spread3', interval: 2.6, speed: 4, damage: 1, range: 10 }), comp('health', { hp: 20, points: 100, invuln: 0.25, boss: true })]));
  boss.data.size = { w: 2, h: 2 };
  addDef(objs, defn('bonfire', 'Ognisko', 'Obiekt interaktywny', { type: 'checkpoint', v: 'post' }, clone(BODY.sensor), [comp('checkpoint', { msg: 'Odpoczywasz przy ognisku. Postęp zapisany.' })]));
  addDef(objs, defn('estus', 'Mikstura życia', 'Przedmiot', { type: 'potion', v: 'red' }, clone(BODY.item), [comp('pickup', { points: 0, heal: 3, sound: 'life', msg: 'Mikstura: +3 zdrowia' })]));
  var m = gridMap(48, 14), x, y;
  for (x = 0; x < 48; x++) { m.put(x, 12, 'G'); m.put(x, 13, 'D'); }
  [14, 15, 29, 30].forEach(function (q) { m.put(q, 12, '.'); m.put(q, 13, '^'); });
  for (x = 16; x <= 18; x++) m.put(x, 9, '='); for (x = 27; x <= 29; x++) m.put(x, 8, '=');
  for (y = 0; y <= 9; y++) m.put(39, y, '#');
  m.put(1, 11, 'P'); m.put(3, 11, 'K'); m.put(25, 11, 'K'); m.put(37, 11, 'K');
  m.put(10, 11, 'R'); m.put(20, 11, 'R'); m.put(33, 11, 'R'); m.put(44, 10, 'Q');
  m.put(17, 8, 'm'); m.put(28, 7, 'm'); m.put(6, 11, '?');
  [[8, 3], [22, 2], [42, 3]].forEach(function (q) { m.put(q[0], q[1], 'o'); });
  var s = sceneFromMap2('Ruiny zamku', m.out(), objs, { K: 'bonfire', R: 'hollow', Q: 'bossx', m: 'estus' });
  s.bg.theme = 'historia';
  var sg = s.inst.filter(function (i) { return i.obj === 'sign'; })[0];
  ovDialog(sg, objs.sign, { lines: 'Z – cios mieczem, C – unik (chwila nietykalności).\nWrogowie ranią tylko ciosem. Gdy zobaczysz czerwony wykrzyknik – zrób unik!\nOgnisko zapamiętuje, gdzie wrócisz po porażce.', trigger: 'touch' });
  s.complete = { mode: 'all', conds: [{ type: 'defeat' }], next: 'end', count: 1 };
  p.mechanics.health = { maxHp: 5, lives: 3, invuln: 0.6, respawn: 'checkpoint' };
  p.flow.subtitle = 'Trudne, ale uczciwe. Patrz na wykrzyknik i rób unik. Pokonaj Strażnika Otchłani!';
  return [s];
}
