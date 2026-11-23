function exampleMetroid(objs, p) {
  setPlayer(objs, [comp('platformer', { speed: 5, jump: 3, extraJumps: 0 }, { prio: 3 }), comp('camera'), comp('melee', { mode: 'key', damage: 1, range: 1, cooldown: 0.35 }), comp('dodge', { distance: 2.5 })]);
  addDef(objs, defn('feather', 'Pióro skoczka', 'Przedmiot', { type: 'star', v: 'pink' }, clone(BODY.item), [comp('pickup', { points: 10, effect: 'doublejump', sound: 'life' })], { desc: 'Daje nową umiejętność: podwójny skok.' }));
  var m = gridMap(48, 24), x, y;
  for (x = 0; x < 48; x++) { m.put(x, 22, 'G'); m.put(x, 23, 'D'); }
  for (x = 6; x <= 8; x++) m.put(x, 19, '='); m.put(7, 18, 'v');
  for (x = 26; x <= 28; x++) m.put(x, 18, '='); for (x = 30; x <= 33; x++) m.put(x, 14, '='); for (x = 35; x <= 38; x++) m.put(x, 10, '=');
  for (x = 18; x <= 43; x++) m.put(x, 6, '=');
  m.put(22, 5, 'k'); m.put(30, 5, 'E'); [[20, 5], [25, 5], [36, 5], [40, 5]].forEach(function (q) { m.put(q[0], q[1], 'c'); });
  for (y = 0; y <= 20; y++) m.put(44, y, '#'); m.put(44, 21, 'd'); m.put(46, 21, 'X');
  m.put(2, 21, 'P'); m.put(14, 21, 'E'); m.put(24, 21, 'C'); m.put(12, 21, 'h'); m.put(31, 16, 'b'); m.put(4, 21, '?');
  [[3, 3], [16, 2], [30, 1], [41, 3]].forEach(function (q) { m.put(q[0], q[1], 'o'); });
  [[1, 21], [10, 21], [20, 21], [35, 21]].forEach(function (q) { m.put(q[0], q[1], 't'); });
  var s = sceneFromMap2('Jaskinie echa', m.out(), objs, { v: 'feather' });
  s.bg.theme = 'kosmos';
  var sg = s.inst.filter(function (i) { return i.obj === 'sign'; })[0];
  ovDialog(sg, objs.sign, { lines: 'Wysokie półki są za wysoko na zwykły skok.\nGdzieś po lewej leży Pióro skoczka – da ci podwójny skok!\nKlucz do drzwi z prawej jest na górnym korytarzu.', trigger: 'touch' });
  s.complete = { mode: 'all', conds: [{ type: 'reach' }], next: 'end', count: 1 };
  p.flow.subtitle = 'Odkrywaj jaskinie. Zdobądź podwójny skok, znajdź klucz i otwórz drzwi do wyjścia.';
  return [s];
}
