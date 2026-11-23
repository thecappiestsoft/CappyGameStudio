function exampleTowerDef(objs, p) {
  delete objs.player.data.comps; objs.player.data.comps = [comp('topdown', {}, { prio: 3 })];
  addDef(objs, defn('tdbase', 'Sad (baza)', 'Obiekt interaktywny', { type: 'goal', v: 'house' }, clone(BODY.sensor), [comp('td', { gold: 140 })], { desc: 'Baza do obrony. Trzyma złoto na start.' })).data.size = { w: 2, h: 2 };
  addDef(objs, defn('tdroad', 'Ścieżka', 'Element środowiska', { type: 'road', v: 'sand' }, clone(BODY.none), [], { layer: 'tlo', tags: ['kafelek'] }));
  addDef(objs, defn('wp', 'Punkt trasy', 'Obiekt interaktywny', { type: 'block', v: 'solid' }, clone(BODY.none), [comp('waypoint', { n: 1, tag: 'A' })], { layer: 'efekty', desc: 'Niewidzialny w grze. Ustaw numer, żeby wyznaczyć kolejność trasy.' }));
  addDef(objs, defn('tdslime', 'Glutek', 'Przeciwnik', { type: 'enemy', v: 'blob' }, clone(BODY.enemy), [comp('pathfollow', { speed: 2, gold: 8, damage: 1 }, { prio: 3 }), comp('health', { hp: 3, points: 5, invuln: 0 })]));
  addDef(objs, defn('tdbot', 'Robot pancerny', 'Przeciwnik', { type: 'enemy', v: 'robot' }, clone(BODY.enemy), [comp('pathfollow', { speed: 2.5, gold: 15, damage: 1 }, { prio: 3 }), comp('health', { hp: 9, points: 10, invuln: 0 })]));
  addDef(objs, defn('tdbat', 'Szybki nietoperz', 'Przeciwnik', { type: 'enemy', v: 'bat' }, clone(BODY.enemy), [comp('pathfollow', { speed: 5, gold: 6, damage: 1 }, { prio: 3 }), comp('health', { hp: 2, points: 5, invuln: 0 })]));
  addDef(objs, defn('tdboss', 'Król glutów', 'Przeciwnik', { type: 'enemy', v: 'blob', color: '#9a6bff' }, clone(BODY.enemy), [comp('pathfollow', { speed: 1.5, gold: 80, damage: 5 }, { prio: 3 }), comp('health', { hp: 70, points: 100, invuln: 0, boss: true })]));
  addDef(objs, defn('tw1', 'Wieża łucznicza', 'Obiekt interaktywny', { type: 'tower', v: 'archer' }, clone(BODY.wall), [comp('tower', { range: 3, interval: 0.6, damage: 1, upCost: 40 })]));
  addDef(objs, defn('tw2', 'Wieża magiczna', 'Obiekt interaktywny', { type: 'tower', v: 'magic' }, clone(BODY.wall), [comp('tower', { range: 2.5, interval: 1.3, damage: 3, pattern: 'circle8', upCost: 60 })]));
  addDef(objs, defn('spot1', 'Pole: wieża łucznicza', 'Obiekt interaktywny', { type: 'pad', v: 'build' }, clone(BODY.sensor), [comp('buildspot', { tower: 'tw1', cost: 50 })]));
  addDef(objs, defn('spot2', 'Pole: wieża magiczna', 'Obiekt interaktywny', { type: 'pad', v: 'build', color: '#c9b8f2' }, clone(BODY.sensor), [comp('buildspot', { tower: 'tw2', cost: 90 })]));
  function wave(id, name, obj, delay, total, iv) { addDef(objs, defn(id, name, 'Obiekt interaktywny', { type: 'block', v: 'solid' }, clone(BODY.none), [comp('spawner', { obj: obj, where: 'here', delay: delay, total: total, interval: iv, max: 40, faster: false })], { layer: 'interakcje' })); }
  wave('wave1', 'Fala 1: glutki', 'tdslime', 4, 10, 1.6); wave('wave2', 'Fala 2: nietoperze', 'tdbat', 22, 10, 0.9); wave('wave3', 'Fala 3: roboty', 'tdbot', 36, 8, 2.2); wave('wave4', 'Fala 4: Król glutów', 'tdboss', 62, 1, 1);
  var s = newScene('Obrona sadu', 20, 12); s.bg.theme = 'przyroda';
  var pts = [[0, 2], [6, 2], [6, 8], [12, 8], [12, 3], [17, 3], [17, 9]], road = {};
  for (var k = 0; k < pts.length - 1; k++) { var a = pts[k], b = pts[k + 1], dx = Math.sign(b[0] - a[0]), dy = Math.sign(b[1] - a[1]), x = a[0], y = a[1]; while (true) { road[x + ',' + y] = 1; if (x === b[0] && y === b[1]) break; x += dx; y += dy; } }
  Object.keys(road).forEach(function (q) { var c = q.split(','); s.inst.push(newInst('tdroad', +c[0], +c[1], objs)); });
  pts.slice(1).forEach(function (q, i) { var w = newInst('wp', q[0], q[1], objs); w.ov['comps#' + compOf(objs.wp, 'waypoint').uid + '.p.n'] = i + 1; s.inst.push(w); });
  s.inst.push(newInst('tdbase', 16, 9, objs));
  ['wave1', 'wave2', 'wave3', 'wave4'].forEach(function (w, i) { s.inst.push(newInst(w, 0, 2, objs)); });
  [[3, 3], [4, 1], [5, 5], [7, 5], [9, 9], [9, 7], [11, 5], [13, 5], [15, 2], [16, 6], [18, 5], [10, 2]].forEach(function (q, i) { s.inst.push(newInst(i % 3 === 2 ? 'spot2' : 'spot1', q[0], q[1], objs)); });
  [[1, 7], [2, 10], [14, 10], [19, 1], [8, 0], [3, 8]].forEach(function (q) { s.inst.push(newInst('tree', q[0], q[1], objs)); });
  s.bg.theme = 'wlasny'; s.bg.color = '#86c86f';
  s.complete = { mode: 'all', conds: [{ type: 'waves' }], next: 'end', count: 1 };
  p.mechanics.health = { maxHp: 1, lives: 10, invuln: 0, respawn: 'checkpoint' };
  hudOnly(p, ['score', 'lives']);
  p.flow.subtitle = 'Glutki idą ścieżką do sadu! Klikaj kamienne pola, żeby stawiać wieże za złoto, a klikaj wieże, żeby je ulepszać. Przetrwaj 4 fale.';
  p.flow.winMsg = 'Sad obroniony! Wszystkie fale pokonane.';
  return [s];
}