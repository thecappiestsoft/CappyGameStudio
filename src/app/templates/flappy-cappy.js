function exampleFlappy(objs, p) {
  setPlayer(objs, [comp('flappy', { flap: 5, gravity: 5, speed: 4 }, { prio: 3 }), comp('camera', { smooth: 0, dead: 0 })], { sprite: { type: 'hero', v: 'capyfly' } });
  objs.player.name = 'Latająca Cappy';
  addDef(objs, defn('bamboo', 'Pęd bambusa', 'Pułapka', { type: 'bamboo', v: 'body' }, clone(BODY.sensor), [comp('damage', { damage: 9, respawn: true })], { desc: 'Dotknięcie bambusa cofa do punktu kontrolnego.' }));
  addDef(objs, defn('bambootop', 'Czubek bambusa', 'Pułapka', { type: 'bamboo', v: 'top' }, clone(BODY.sensor), [comp('damage', { damage: 9, respawn: true })]));
  addDef(objs, defn('flground', 'Groźna trawa', 'Pułapka', { type: 'ground', v: 'grass' }, clone(BODY.sensor), [comp('damage', { damage: 9, respawn: true })]));
  var W = 120, H = 12, m = gridMap(W, H), seed = 7;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  for (var x = 0; x < W; x++) m.put(x, 11, '_');
  m.put(3, 5, 'P');
  for (var px = 12, k = 0; px < W - 8; px += 8, k++) {
    var gap = k < 4 ? 4 : 3, top = 2 + Math.floor(rnd() * (8 - gap));
    for (var y = 0; y < 11; y++) { if (y < top - 1 || y > top + gap) m.put(px, y, '|'); else if (y === top - 1 || y === top + gap) m.put(px, y, 'T'); }
    m.put(px, top + Math.floor(gap / 2), 'c');
    if (k % 4 === 3) m.put(px + 4, 5, 'C');
  }
  for (y = 0; y < 11; y++) m.put(W - 4, y, 'X');
  var s = sceneFromMap2('Bambusowy las', m.out(), objs, { '|': 'bamboo', 'T': 'bambootop', '_': 'flground' });
  s.bg.theme = 'dzungla';
  s.complete = { mode: 'all', conds: [{ type: 'reach' }], next: 'end', count: 1 };
  p.mechanics.health.maxHp = 1; p.mechanics.health.lives = 5; p.mechanics.health.invuln = 1;
  hudOnly(p, ['score', 'lives']);
  p.flow.winMsg = 'Brawo! Cappy przeleciała przez cały bambusowy las!';
  p.flow.subtitle = 'Spacja, strzałka w górę albo kliknięcie – Cappy macha skrzydełkami. Przeleć między pędami bambusa aż do mety!';
  return [s];
}
