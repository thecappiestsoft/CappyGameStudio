function exampleLooter(objs, p) {
  setPlayer(objs, [comp('topdown', { speed: 5, dirs: '8' }, { prio: 3 }), comp('camera', { smooth: 60 }), comp('shooter', { mode: 'hold', interval: 0.4, damage: 1, speed: 7, range: 8, pattern: 'single' }), comp('dodge', { distance: 2.5 })]);
  addDef(objs, defn('lbot', 'Robot-strzelec', 'Przeciwnik', { type: 'enemy', v: 'robot' }, clone(BODY.enemy), [comp('follow', { range: 7, speed: 2, stop: 3 }, { prio: 3 }), comp('shooter', { mode: 'auto', aim: 'player', interval: 2.2, speed: 4, range: 8 }), comp('damage'), comp('health', { hp: 3, points: 10, invuln: 0.1 }), comp('loot', { chance: 40 })]));
  addDef(objs, defn('lblob', 'Glut-zbieracz', 'Przeciwnik', { type: 'enemy', v: 'blob', color: '#ff9f1c' }, clone(BODY.enemy), [comp('follow', { range: 6, speed: 3 }, { prio: 3 }), comp('damage'), comp('health', { hp: 2, points: 5, invuln: 0.1 }), comp('loot', { chance: 25 })]));
  var boss = addDef(objs, defn('lboss', 'Strażnik Skarbca', 'Przeciwnik', { type: 'enemy', v: 'guard', color: '#b36bff' }, clone(BODY.enemy), [comp('ai', { detect: 7, patrolSpeed: 1, chaseSpeed: 2, distance: 2 }, { prio: 3 }), comp('shooter', { mode: 'auto', aim: 'player', pattern: 'circle8', interval: 2, speed: 4, range: 10 }), comp('damage', { damage: 2 }), comp('health', { hp: 30, points: 100, invuln: 0.05, boss: true }), comp('loot', { chance: 100, minRar: '3' })]));
  boss.data.size = { w: 2, h: 2 };
  addDef(objs, defn('lchest', 'Skrzynia z łupem', 'Obiekt interaktywny', { type: 'goal', v: 'chest' }, clone(BODY.sensor), [comp('loot', { chance: 100, minRar: '1' })], { desc: 'Otwiera się po dotknięciu i wyrzuca broń (co najmniej rzadką).' }));
  var m = gridMap(34, 20), x, y;
  for (x = 0; x < 34; x++) { m.put(x, 0, 'H'); m.put(x, 19, 'H'); } for (y = 0; y < 20; y++) { m.put(0, y, 'H'); m.put(33, y, 'H'); }
  for (y = 1; y < 19; y++) if (y !== 5 && y !== 6 && y !== 14) { m.put(11, y, '#'); m.put(22, y, '#'); }
  for (x = 23; x < 33; x++) if (x !== 27 && x !== 28) m.put(x, 10, '#');
  [[3, 3], [6, 15], [16, 3], [17, 16], [26, 4]].forEach(function (q) { m.put(q[0], q[1], 'K'); });
  [[8, 4], [5, 10], [14, 8], [18, 12], [15, 15], [25, 6], [30, 3], [26, 13]].forEach(function (q) { m.put(q[0], q[1], 'R'); });
  [[9, 13], [16, 6], [19, 9], [29, 7], [24, 16]].forEach(function (q) { m.put(q[0], q[1], 'Y'); });
  [[4, 17], [20, 2], [31, 12]].forEach(function (q) { m.put(q[0], q[1], 'h'); });
  m.put(28, 15, 'Z'); m.put(31, 17, 'X'); m.put(2, 2, 'P');
  var s = sceneFromMap2('Opuszczona baza', m.out(), objs, { K: 'lchest', R: 'lbot', Y: 'lblob', Z: 'lboss' });
  s.bg.theme = 'kosmos';
  s.complete = { mode: 'all', conds: [{ type: 'defeat' }, { type: 'reach' }], next: 'end', count: 1 };
  p.mechanics.health = { maxHp: 8, lives: 3, invuln: 0.8, respawn: 'checkpoint' };
  hudOnly(p, ['score', 'health', 'lives']);
  p.flow.subtitle = 'Przytrzymaj X, żeby strzelać. Pokonani wrogowie i skrzynie wyrzucają losowe bronie – podnieś je klawiszem E. Szukaj legendarnej!';
  p.flow.winMsg = 'Baza oczyszczona, a twój arsenał robi wrażenie!';
  return [s];
}