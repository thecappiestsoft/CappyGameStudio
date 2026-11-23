function exampleSokoban(objs, p) {
  setPlayer(objs, [comp('gridstep', { speed: 8, attack: 0, vision: 0, turns: false }, { prio: 3 })]);
  addDef(objs, defn('sfloor', 'Podłoga magazynu', 'Element środowiska', { type: 'ground', v: 'sand', color: '#e8d2a6' }, clone(BODY.none), [], { layer: 'tlo', tags: ['kafelek'] }));
  addDef(objs, defn('pcrate', 'Skrzynia do pchania', 'Element środowiska', { type: 'crate', v: 'wood' }, clone(BODY.wall), [comp('pushable')]));
  addDef(objs, defn('ppad', 'Pole docelowe', 'Obiekt interaktywny', { type: 'pad', v: 'target' }, clone(BODY.sensor), [comp('pad')], { layer: 'tlo' }));
  var L = { B: 'pcrate', T: 'ppad' };
  var maps = [['Magazyn 1', [
    '#########',
    '#.......#',
    '#.P.B.T.#',
    '#.......#',
    '#...B.T.#',
    '#.......#',
    '#########']], ['Magazyn 2', [
    '#########',
    '#...#...#',
    '#.B.#.T.#',
    '#.......#',
    '#.B.P.T.#',
    '#.B...T.#',
    '#########']], ['Magazyn 3', [
    '##########',
    '#....#...#',
    '#.B..#.T.#',
    '#..B...T.#',
    '#.P.##...#',
    '#..B...T.#',
    '#....#...#',
    '##########']]];
  var out = maps.map(function (mm, i) {
    var s = sceneFromMap2(mm[0], mm[1], objs, L);
    s.bg.theme = 'miasto'; floorUnder(s, objs, 'sfloor', []);
    s.complete = { mode: 'all', conds: [{ type: 'boxes' }], next: i === maps.length - 1 ? 'end' : 'next', count: 1 };
    return s;
  });
  p.mechanics.health = { maxHp: 1, lives: 3, invuln: 0, respawn: 'checkpoint' };
  hudOnly(p, ['scene']);
  p.flow.subtitle = 'Wepchnij wszystkie skrzynie na czerwone pola. Skrzyni nie da się ciągnąć ani pchać dwóch naraz. Utknąłeś? Klawisz R – plansza od nowa.';
  p.flow.winMsg = 'Wszystkie magazyny uporządkowane. Mistrz logiki!';
  return out;
}