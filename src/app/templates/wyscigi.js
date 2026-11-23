function exampleRacing(objs, p) {
  setPlayer(objs, [comp('car', { speed: 6, accel: 5, turn: 5, grass: 40, start: 'r' }, { prio: 3 }), comp('camera', { smooth: 40, dead: 0 })], { sprite: { type: 'car', v: 'red' } });
  objs.player.name = 'Bolid Cappy';
  addDef(objs, defn('asphalt', 'Asfalt', 'Element środowiska', { type: 'road', v: 'asphalt' }, clone(BODY.none), [comp('surface', { speed: 100 })], { layer: 'tlo', tags: ['kafelek'] }));
  addDef(objs, defn('finish', 'Linia mety', 'Obiekt interaktywny', { type: 'road', v: 'finish' }, clone(BODY.none), [comp('surface', { speed: 100 }), comp('lapgate', { n: 0 })], { layer: 'tlo' }));
  addDef(objs, defn('gate', 'Bramka okrążenia', 'Obiekt interaktywny', { type: 'block', v: 'solid' }, clone(BODY.none), [comp('lapgate', { n: 1 })], { layer: 'efekty', desc: 'Niewidzialna. Trzeba ją przejechać, żeby okrążenie się liczyło.' }));
  addDef(objs, defn('wp', 'Punkt trasy', 'Obiekt interaktywny', { type: 'block', v: 'solid' }, clone(BODY.none), [comp('waypoint', { n: 1, tag: 'A' })], { layer: 'efekty' }));
  addDef(objs, defn('rival1', 'Rywal Lisek', 'Postać neutralna', { type: 'car', v: 'blue' }, { type: 'dynamic', solid: false, cat: 'Interakcja' }, [comp('pathfollow', { speed: 8.6, loop: true, damage: 0, gold: 0 }, { prio: 3 })]));
  addDef(objs, defn('rival2', 'Rywal Robot', 'Postać neutralna', { type: 'car', v: 'yellow' }, { type: 'dynamic', solid: false, cat: 'Interakcja' }, [comp('pathfollow', { speed: 8, loop: true, damage: 0, gold: 0 }, { prio: 3 })]));
  addDef(objs, defn('tire', 'Opony', 'Element środowiska', { type: 'crate', v: 'metal', color: '#3b4252' }, clone(BODY.wall), []));
  var W = 32, H = 18, s = newScene('Tor Kapibarowo', W, H); s.bg.theme = 'przyroda';
  function onRoad(x, y) { return x >= 2 && x <= 29 && y >= 2 && y <= 15 && !(x >= 5 && x <= 26 && y >= 5 && y <= 12); }
  for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
    if (x === 0 || y === 0 || x === W - 1 || y === H - 1) s.inst.push(newInst('hedge', x, y, objs));
    else if (onRoad(x, y)) s.inst.push(newInst(x === 15 && y <= 4 ? 'finish' : 'asphalt', x, y, objs));
    else if (x >= 6 && x <= 25 && y >= 6 && y <= 11 && (x === 6 || x === 25 || y === 6 || y === 11)) s.inst.push(newInst('hedge', x, y, objs));
  }
  s.bg.theme = 'wlasny'; s.bg.color = '#86c86f';
  [[9, 8], [14, 9], [20, 8], [17, 7], [11, 10], [23, 9]].forEach(function (q) { s.inst.push(newInst('tree', q[0], q[1], objs)); });
  [[1, 1], [30, 1], [1, 16], [30, 16]].forEach(function (q) { s.inst.push(newInst('tire', q[0], q[1], objs)); });
  var gu = compOf(objs.gate, 'lapgate').uid;
  [[27, 8, 1], [28, 8, 1], [29, 8, 1], [15, 13, 2], [15, 14, 2], [15, 15, 2], [2, 8, 3], [3, 8, 3], [4, 8, 3]].forEach(function (q) { var g = newInst('gate', q[0], q[1], objs); g.ov['comps#' + gu + '.p.n'] = q[2]; s.inst.push(g); });
  var wu = compOf(objs.wp, 'waypoint').uid;
  [[27, 3], [28, 4], [28, 13], [27, 14], [4, 14], [3, 13], [3, 4], [4, 3], [15, 3]].forEach(function (q, i) { var w = newInst('wp', q[0], q[1], objs); w.ov['comps#' + wu + '.p.n'] = i + 1; s.inst.push(w); });
  s.inst.push(newInst('player', 17, 3, objs)); s.inst.push(newInst('rival1', 17, 2, objs)); s.inst.push(newInst('rival2', 17, 4, objs));
  s.complete = { mode: 'all', conds: [{ type: 'laps', val: 3 }], next: 'end', count: 1 };
  p.mechanics.health = { maxHp: 3, lives: 3, invuln: 1, respawn: 'checkpoint' };
  hudOnly(p, []);
  p.flow.subtitle = 'Strzałka w górę – gaz, w dół – hamulec, w bok – skręt. Trzymaj się asfaltu, bo na trawie auto zwalnia. Przejedź 3 okrążenia przed rywalami!';
  p.flow.winMsg = 'Zwycięstwo! Puchar Grand Prix jedzie do Cappy!';
  return [s];
}