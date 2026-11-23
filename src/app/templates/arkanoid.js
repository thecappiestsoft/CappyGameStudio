function exampleBreakout(objs, p) {
  setPlayer(objs, [comp('paddle', { speed: 7 }, { prio: 3 })], { sprite: { type: 'paddle', v: 'wood' }, size: { w: 3, h: 1 } });
  objs.player.name = 'Paletka';
  addDef(objs, defn('ball', 'Piłka-pomarańczka', 'Obiekt interaktywny', { type: 'ball', v: 'orange' }, { type: 'dynamic', solid: false, cat: 'Interakcja' }, [comp('ball', { speed: 6 }, { prio: 3 })]));
  addDef(objs, defn('mwall', 'Ściana z metalu', 'Element środowiska', { type: 'wall', v: 'metal' }, clone(BODY.wall), [], { tags: ['kafelek'] }));
  addDef(objs, defn('bheart', 'Serce (życie)', 'Przedmiot', { type: 'heart', v: 'red' }, clone(BODY.item), [comp('pickup', { points: 0, life: 1, sound: 'life', msg: 'Dodatkowe życie!' })]));
  var C = [['red', 1, 10], ['orange', 1, 10], ['yellow', 1, 10], ['green', 1, 10], ['blue', 2, 20], ['purple', 3, 30]];
  C.forEach(function (c) { addDef(objs, defn('br_' + c[0], 'Cegiełka (' + c[1] + ')', 'Przeszkoda', { type: 'brick', v: c[0] }, clone(BODY.wall), [comp('brick', { hp: c[1], points: c[2], drop: 'bheart', chance: 6 })])); });
  addDef(objs, defn('br_steel', 'Stalowa cegła', 'Element środowiska', { type: 'brick', v: 'steel' }, clone(BODY.wall), [], { desc: 'Nie da się jej rozbić – piłka się od niej odbija.' }));
  var s = newScene('Cegiełkowy zamek', 20, 12); s.bg.theme = 'kosmos';
  for (var x = 0; x < 20; x++) s.inst.push(newInst('mwall', x, 0, objs));
  for (var y = 1; y < 12; y++) { s.inst.push(newInst('mwall', 0, y, objs)); s.inst.push(newInst('mwall', 19, y, objs)); }
  var rows = ['purple', 'blue', 'red', 'orange', 'yellow', 'green'];
  rows.forEach(function (col, r) { for (var x2 = 2; x2 < 18; x2++) { var id = 'br_' + col; if (r === 2 && (x2 === 5 || x2 === 14)) id = 'br_steel'; s.inst.push(newInst(id, x2, 1 + r, objs)); } });
  s.inst.push(newInst('player', 8, 10, objs)); s.inst.push(newInst('ball', 9, 9, objs));
  s.complete = { mode: 'all', conds: [{ type: 'bricks' }], next: 'end', count: 1 };
  p.mechanics.health = { maxHp: 1, lives: 3, invuln: 0, respawn: 'checkpoint' };
  hudOnly(p, ['score', 'lives']);
  p.flow.subtitle = 'Steruj paletką strzałkami albo myszką. Spacja lub kliknięcie wypuszcza piłkę. Rozbij wszystkie cegiełki – fioletowe wytrzymują 3 uderzenia!';
  p.flow.winMsg = 'Zamek rozbity w drobny mak!';
  return [s];
}
