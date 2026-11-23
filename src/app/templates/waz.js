function exampleSnake(objs, p) {
  setPlayer(objs, [comp('snake', { speed: 4, length: 2, grow: 1, food: 'sfood', color: '#c98d4b' }, { prio: 3 })]);
  objs.player.name = 'Kapibara-wąż';
  addDef(objs, defn('sfood', 'Pomarańcza', 'Przedmiot', { type: 'fruit', v: 'orange' }, clone(BODY.item), [comp('pickup', { points: 1, sound: 'collect' })]));
  var m = gridMap(20, 12), x, y;
  for (x = 0; x < 20; x++) { m.put(x, 0, 'H'); m.put(x, 11, 'H'); } for (y = 0; y < 12; y++) { m.put(0, y, 'H'); m.put(19, y, 'H'); }
  [[6, 4], [6, 5], [13, 6], [13, 7]].forEach(function (q) { m.put(q[0], q[1], 'B'); });
  m.put(4, 8, 'P'); m.put(10, 5, 'o');
  var s = sceneFromMap2('Ogród węża', m.out(), objs, { o: 'sfood' });
  s.bg.theme = 'wlasny'; s.bg.color = '#a6d98f';
  s.complete = { mode: 'all', conds: [{ type: 'score', val: 15 }], next: 'end', count: 1 };
  p.mechanics.health = { maxHp: 1, lives: 3, invuln: 0, respawn: 'checkpoint' };
  hudOnly(p, ['score', 'lives']);
  p.flow.subtitle = 'Strzałką wybierz kierunek – kapibara ruszy sama. Zjadaj pomarańcze, a ogon będzie rósł. Nie wjedź w ścianę ani we własny ogon! Zbierz 15.';
  p.flow.winMsg = 'Ale długi ogon! Wygrałeś.';
  return [s];
}