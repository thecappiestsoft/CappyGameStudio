/* ---------------- object library & templates ---------------- */
function comp(type, p, o) { return Object.assign({ uid: uid('c'), type: type, on: true, prio: 2, p: Object.assign(CGM.compDefaults(type), p || {}) }, o || {}); }
function defn(id, name, category, sprite, body, comps, extra) {
  return Object.assign({ id: id, name: name, category: category, desc: '', tags: [], base: null, layer: 'swiat', local: {}, data: { sprite: sprite, size: { w: 1, h: 1 }, body: body, params: {}, comps: comps || [] } }, extra || {});
}
var BODY = {
  wall: { type: 'static', solid: true, cat: 'Świat' }, sensor: { type: 'static', solid: false, cat: 'Interakcja' }, item: { type: 'static', solid: false, cat: 'Przedmiot' },
  player: { type: 'dynamic', solid: false, cat: 'Gracz' }, enemy: { type: 'dynamic', solid: false, cat: 'Przeciwnik' }, kin: { type: 'kinematic', solid: true, cat: 'Świat' }, none: { type: 'none', solid: false, cat: 'Świat' }
};
function baseLibrary(view) {
  var side = view !== 'top';
  var L = [
    defn('player', 'Kapibara', 'Postać grywalna', { type: 'hero', v: 'capy' }, clone(BODY.player), [side ? comp('platformer', {}, { prio: 3 }) : comp('topdown', {}, { prio: 3 }), comp('camera'), comp('shooter', { mode: 'key', interval: 0.4, damage: 1 }, { on: false })], { desc: 'Postać sterowana przez gracza.', tags: ['gracz'] }),
    defn('grass', 'Trawa', 'Element środowiska', { type: 'ground', v: 'grass' }, clone(BODY.wall), [], { tags: ['kafelek'] }),
    defn('dirt', 'Ziemia', 'Element środowiska', { type: 'ground', v: 'dirt' }, clone(BODY.wall), [], { tags: ['kafelek'] }),
    defn('stone', 'Kamień', 'Element środowiska', { type: 'ground', v: 'stone' }, clone(BODY.wall), [], { tags: ['kafelek'] }),
    defn('ice', 'Lód', 'Element środowiska', { type: 'ground', v: 'ice' }, clone(BODY.wall), [], { tags: ['kafelek'] }),
    defn('wall', 'Ściana z cegieł', 'Element środowiska', { type: 'wall', v: 'brick' }, clone(BODY.wall), [], { tags: ['kafelek'] }),
    defn('hedge', 'Żywopłot', 'Element środowiska', { type: 'wall', v: 'hedge' }, clone(BODY.wall), [], { tags: ['kafelek'] }),
    defn('platform', 'Platforma', 'Element środowiska', { type: 'platform', v: 'wood' }, clone(BODY.wall), []),
    defn('moving', 'Ruchoma platforma', 'Element środowiska', { type: 'platform', v: 'stone' }, clone(BODY.kin), [comp('mover')]),
    defn('crate', 'Skrzynka', 'Element środowiska', { type: 'crate', v: 'wood' }, clone(BODY.wall), []),
    defn('block', 'Blok kolizji', 'Element środowiska', { type: 'block', v: 'solid' }, clone(BODY.wall), [], { layer: 'kolizje', desc: 'Niewidzialna przeszkoda. W grze nie jest rysowana.' }),
    defn('spikes', 'Kolce', 'Element środowiska', { type: 'spikes', v: 'steel' }, clone(BODY.sensor), [comp('damage', { damage: 1, respawn: true })], { tags: ['pułapka'] }),
    defn('lava', 'Lawa', 'Element środowiska', { type: 'lava', v: 'lava' }, clone(BODY.sensor), [comp('damage', { damage: 3, respawn: true })], { tags: ['pułapka'] }),
    defn('spring', 'Trampolina', 'Element środowiska', { type: 'spring', v: 'red' }, clone(BODY.wall), [comp('spring')]),
    defn('coin', 'Moneta', 'Przedmiot', { type: 'coin', v: 'gold' }, clone(BODY.item), [comp('pickup', { points: 1 })]),
    defn('star', 'Gwiazdka', 'Przedmiot', { type: 'star', v: 'yellow' }, clone(BODY.item), [comp('pickup', { points: 5 })]),
    defn('gem', 'Kryształ', 'Przedmiot', { type: 'gem', v: 'blue' }, clone(BODY.item), [comp('pickup', { points: 10 })]),
    defn('key', 'Złoty klucz', 'Przedmiot', { type: 'key', v: 'gold' }, clone(BODY.item), [comp('pickup', { points: 0, toInv: true, item: 'Złoty klucz' })], { tags: ['ekwipunek'] }),
    defn('heart', 'Serce', 'Przedmiot', { type: 'heart', v: 'red' }, clone(BODY.item), [comp('pickup', { points: 0, heal: 1, sound: 'life' })]),
    defn('potion', 'Mikstura szybkości', 'Przedmiot', { type: 'potion', v: 'blue' }, clone(BODY.item), [comp('pickup', { points: 0, effect: 'speed', effectTime: 6 })]),
    defn('door', 'Drzwi na klucz', 'Element środowiska', { type: 'door', v: 'wood' }, clone(BODY.wall), [comp('door', { need: 'item', item: 'Złoty klucz' })]),
    defn('gate', 'Brama', 'Element środowiska', { type: 'door', v: 'metal' }, clone(BODY.wall), [comp('door', { need: 'switch', tag: 'A' })]),
    defn('lever', 'Dźwignia', 'Obiekt interaktywny', { type: 'lever', v: 'lever' }, clone(BODY.sensor), [comp('lever', { tag: 'A' })]),
    defn('goal', 'Wyjście', 'Obiekt interaktywny', { type: 'goal', v: 'flag' }, clone(BODY.sensor), [comp('goal')]),
    defn('portal', 'Portal', 'Obiekt interaktywny', { type: 'goal', v: 'portal' }, clone(BODY.sensor), [comp('goal', { action: 'goto' })]),
    defn('checkpoint', 'Punkt kontrolny', 'Obiekt interaktywny', { type: 'checkpoint', v: 'post' }, clone(BODY.sensor), [comp('checkpoint')]),
    defn('npc', 'Robot przewodnik', 'Przeciwnik', { type: 'npc', v: 'robot' }, { type: 'static', solid: false, cat: 'Interakcja' }, [comp('dialog')], { desc: 'Neutralna postać (NPC), z którą można porozmawiać.', category: 'Przeciwnik' }),
    defn('sign', 'Tablica', 'Obiekt interaktywny', { type: 'sign', v: 'wood' }, clone(BODY.sensor), [comp('dialog', { lines: 'Strzałki – ruch, spacja – skok, E – użyj.', trigger: 'touch' })]),
    defn('enemy', 'Strażnik', 'Przeciwnik', { type: 'enemy', v: 'robot' }, clone(BODY.enemy), [comp('ai', {}, { prio: 3 })].concat(side ? [comp('gravity'), comp('stomp')] : []).concat([comp('damage'), comp('health', { hp: 2, points: 5 })]), { desc: 'Patroluje, po wykryciu gracza rozpoczyna pościg.' }),
    defn('bat', 'Nietoperz', 'Przeciwnik', { type: 'enemy', v: 'bat' }, clone(BODY.enemy), [comp('patrol', { axis: 'v', distance: 3, speed: 3 }), comp('damage'), comp('health', { hp: 1, points: 3 })]),
    defn('turret', 'Wieżyczka', 'Przeciwnik', { type: 'enemy', v: 'guard' }, clone(BODY.enemy), [comp('shooter', { mode: 'auto', aim: 'player', interval: 2, speed: 5, range: 9 }), comp('damage'), comp('health', { hp: 3, points: 10 })].concat(side ? [comp('gravity')] : [])),
    defn('tree', 'Drzewo', 'Dekoracja', { type: 'deco', v: 'tree' }, clone(BODY.none), [], { layer: 'tlo' }),
    defn('bush', 'Krzak', 'Dekoracja', { type: 'deco', v: 'bush' }, clone(BODY.none), [], { layer: 'tlo' }),
    defn('flower', 'Kwiatek', 'Dekoracja', { type: 'deco', v: 'flower' }, clone(BODY.none), [], { layer: 'tlo' }),
    defn('cloud', 'Chmura', 'Dekoracja', { type: 'deco', v: 'cloud' }, clone(BODY.none), [], { layer: 'tlo' })
  ];
  var o = {}; L.forEach(function (d) { if (!side && (d.id === 'spring')) return; o[d.id] = d; });
  o.ice.data.params.slippery = { name: 'Śliska powierzchnia', type: 'bool', val: true };
  o.blob = { id: 'blob', name: 'Potworek', category: 'Przeciwnik', desc: 'Wariant Strażnika: szybszy w pościgu.', tags: [], base: 'enemy', layer: 'swiat', local: { 'sprite.v': 'blob' }, data: { comps: [] } };
  var ai = o.enemy.data.comps.filter(function (c) { return c.type === 'ai'; })[0];
  o.blob.local['comps#' + ai.uid + '.p.chaseSpeed'] = 6;
  o.blob.local['comps#' + ai.uid + '.p.detect'] = 7;
  return o;
}
function baseMechanics() {
  return { score: { on: true, start: 0, bonusLife: 0 }, health: { maxHp: 3, lives: 3, invuln: 1, respawn: 'checkpoint' }, inventory: { on: true, slots: 8 }, timer: { on: false, limit: 120, warn: 10 }, hud: { score: true, health: true, lives: true, inventory: true, timer: true, scene: true, memory: true }, matrix: {} };
}
var LEG = { 'G': 'grass', 'D': 'dirt', 'S': 'stone', 'I': 'ice', '#': 'wall', 'H': 'hedge', '=': 'platform', 'M': 'moving', 'B': 'crate', 'x': 'block', '^': 'spikes', 'L': 'lava', 'J': 'spring', 'c': 'coin', '*': 'star', 'g': 'gem', 'k': 'key', 'h': 'heart', 'p': 'potion', 'd': 'door', 'Q': 'gate', 'l': 'lever', 'X': 'goal', 'O': 'portal', 'C': 'checkpoint', 'n': 'npc', '?': 'sign', 'E': 'enemy', 'b': 'bat', 'F': 'blob', 'W': 'turret', 'P': 'player', 't': 'tree', 'u': 'bush', 'f': 'flower', 'o': 'cloud' };
function sceneFromMap(name, rows, objects) {
  var sc = newScene(name, rows[0].length, rows.length);
  rows.forEach(function (r, y) { for (var x = 0; x < r.length; x++) { var id = LEG[r[x]]; if (id && objects[id]) sc.inst.push(newInst(id, x, y, objects)); } });
  return sc;
}
function newScene(name, cols, rows) { return { id: uid('s'), name: name, cols: cols, rows: rows, bg: { theme: 'przyroda', color: '#ffffff', parallax: 0.3 }, inst: [], complete: { mode: 'all', conds: [{ type: 'reach' }], next: 'next', count: 1 } }; }
function newInst(objId, x, y, objects) { var d = (objects || P.objects)[objId]; return { id: uid('i'), obj: objId, x: x, y: y, layer: (d && d.layer) || 'swiat', ov: {}, flip: false, locked: false }; }
var VIEWS = { '20x12': [20, 12, '800 × 480 (5:3)'], '24x14': [24, 14, '960 × 560 (12:7)'], '16x12': [16, 12, '640 × 480 (4:3)'], '28x16': [28, 16, '1120 × 640 (7:4)'], '12x20': [12, 20, '480 × 800 (pionowo)'] };
function newProject(o) {
  var SIDE_T = { platformer: 1, souls: 1, metroid: 1, flappy: 1 };
  var GEN = { dungeon: exampleDungeon, looter: exampleLooter, towerdef: exampleTowerDef, sokoban: exampleSokoban, racing: exampleRacing, snake: exampleSnake, breakout: exampleBreakout };
  var view = o.template === 'empty' ? (o.view || 'side') : SIDE_T[o.template] ? 'side' : 'top';
  var vp = VIEWS[o.res || '20x12'] || VIEWS['20x12'];
  var p = { format: 'cgs-1', app: 'CappyGameStudio', id: uid('p'), meta: { name: (o.name || 'Nowa gra').slice(0, 60), author: (o.author || '').slice(0, 40), desc: (o.desc || '').slice(0, 300), version: '1.0.0', created: now(), updated: now() },
    settings: { view: view, viewW: vp[0], viewH: vp[1], res: o.res || '20x12', sound: true, touch: 'auto', target: 'html5', scaling: 'fit', fullscreenBtn: true },
    objects: baseLibrary(view), scenes: [], flow: { start: null, order: [], title: true, titleText: '', subtitle: '', winMsg: 'Gratulacje! Gra ukończona.', loseMsg: 'Spróbuj jeszcze raz.' },
    mechanics: baseMechanics(), prefabs: [], assets: {}, versions: [], export: { touch: 'auto', loading: '' }, cards: clone(CGM.DEFAULT_CARDS), decks: [{ id: 'dk_me', name: 'Talia startowa', cards: clone(CGM.DEFAULT_DECK) }] };
  var objs = p.objects, scs = [];
  if (o.template === 'platformer') scs = examplePlatformer(objs, p);
  else if (o.template === 'topdown') scs = exampleTopdown(objs, p);
  else if (o.template === 'arcade') scs = exampleArcade(objs, p);
  else if (o.template === 'rpg') scs = exampleRPG(objs, p);
  else if (o.template === 'vn') scs = exampleVN(objs, p);
  else if (o.template === 'cards') scs = exampleCards(objs, p);
  else if (o.template === 'souls') scs = exampleSouls(objs, p);
  else if (o.template === 'bullethell') scs = exampleBulletHell(objs, p);
  else if (o.template === 'bulletheaven') scs = exampleBulletHeaven(objs, p);
  else if (o.template === 'metroid') scs = exampleMetroid(objs, p);
  else if (o.template === 'clicker') scs = exampleClicker(objs, p);
  else if (o.template === 'flappy') scs = exampleFlappy(objs, p);
  else if (GEN[o.template]) scs = GEN[o.template](objs, p);
  else {
    var sc = newScene('Scena 1', view === 'side' ? 30 : 20, view === 'side' ? 12 : 12);
    if (view === 'side') { for (var x = 0; x < sc.cols; x++) { sc.inst.push(newInst('grass', x, 10, objs)); sc.inst.push(newInst('dirt', x, 11, objs)); } sc.inst.push(newInst('player', 2, 9, objs)); }
    else sc.inst.push(newInst('player', 2, 2, objs));
    sc.complete.conds = [];
    scs = [sc];
  }
  p.scenes = scs; p.flow.order = scs.map(function (s) { return s.id; }); p.flow.start = scs[0].id;
  if (!p.flow.titleText) p.flow.titleText = p.meta.name;
  return p;
}
function examplePlatformer(objs, p) {
  var W = 40, rows = [];
  for (var y = 0; y < 12; y++) rows.push(new Array(W + 1).join('.').split(''));
  function put(x, y, ch) { if (rows[y] && x >= 0 && x < W) rows[y][x] = ch; }
  for (var x = 0; x < W; x++) { put(x, 10, 'G'); put(x, 11, 'D'); }
  put(12, 10, '.'); put(13, 10, '.'); put(12, 11, '^'); put(13, 11, '^');
  for (x = 15; x <= 18; x++) put(x, 7, '='); for (x = 21; x <= 24; x++) put(x, 5, '=');
  put(23, 4, 'k'); put(16, 6, 'h'); put(26, 7, 'M');
  for (y = 0; y <= 8; y++) put(36, y, '#'); put(36, 9, 'd'); put(38, 9, 'X');
  put(2, 9, 'P'); put(5, 9, 'n'); put(9, 9, '?'); put(18, 9, 'C'); put(22, 9, 'E'); put(31, 4, 'b'); put(29, 9, 'J');
  [[7, 8], [8, 8], [15, 6], [17, 6], [21, 4], [22, 4], [27, 5], [28, 5], [33, 8], [34, 8]].forEach(function (q) { put(q[0], q[1], 'c'); });
  put(30, 2, '*');
  [[1, 1], [11, 2], [25, 1], [34, 2]].forEach(function (q) { put(q[0], q[1], 'o'); });
  [[0, 9], [10, 9], [20, 9], [33, 9]].forEach(function (q) { put(q[0], q[1], 't'); });
  var s1 = sceneFromMap('Las kapibary', rows.map(function (r) { return r.join(''); }), objs);
  s1.bg.theme = 'dzungla';
  s1.inst.forEach(function (i) { if (i.obj === 'npc') i.ov['comps#' + objs.npc.data.comps[0].uid + '.p.lines'] = 'Cześć, Kapibaro!\nZgubiłaś złoty klucz? Leży wysoko na platformach.\nUważaj na strażnika – gdy cię zobaczy, ruszy w pościg.'; });
  var s2 = sceneFromMap('Skarbiec', [
    '........................',
    '...o.............o......',
    '........................',
    '..............*.........',
    '...........======.......',
    '........................',
    '......c.c.c........W....',
    '....=====.......GGGGG...',
    '........................',
    '.P.....F.........c.c..X.',
    'GGGGGGGGGGGGGGGGGGGGGGGG',
    'DDDDDDDDDDDDDDDDDDDDDDDD'], objs);
  s2.bg.theme = 'historia';
  s1.complete = { mode: 'all', conds: [{ type: 'reach' }], next: 'next', count: 1 };
  s2.complete = { mode: 'all', conds: [{ type: 'reach' }, { type: 'score', val: 15 }], next: 'end', count: 1 };
  p.meta.name = p.meta.name || 'Kapibara i Zaginiony Klucz';
  p.flow.subtitle = 'Znajdź złoty klucz, otwórz drzwi i dotrzyj do skarbca.';
  return [s1, s2];
}
function exampleTopdown(objs, p) {
  var s = sceneFromMap('Lochy', [
    '######################',
    '#P...#........#..c...#',
    '#.##.#.######.#.####.#',
    '#.#c...#....#...#..c.#',
    '#.####.#.E..#####.##.#',
    '#......#....l...#....#',
    '###.####.########.####',
    '#...#..c.#.....b#....#',
    '#.#.#.####.###..#.##.#',
    '#.#k.....#..#...#.#X.#',
    '#.######.#..#.###Q#..#',
    '#........d..#.....#..#',
    '######################'], objs);
  s.bg.theme = 'kosmos';
  s.complete = { mode: 'all', conds: [{ type: 'reach' }], next: 'end', count: 1 };
  p.flow.subtitle = 'Znajdź klucz i przełącznik, by dotrzeć do wyjścia.';
  return [s];
}
function exampleArcade(objs, p) {
  var s = sceneFromMap('Arena', [
    'HHHHHHHHHHHHHHHHHHHH',
    'H..c....c....c...c.H',
    'H.c..W.....c....c..H',
    'H....HHH.....HHH...H',
    'H..c.......b....c..H',
    'H.c....c..P...c....H',
    'H....c.......c...c.H',
    'H..HHH...c.....HHH.H',
    'H.c....W.....c..W..H',
    'H...c....c.......c.H',
    'H.c....c....c..c...H',
    'HHHHHHHHHHHHHHHHHHHH'], objs);
  s.bg.theme = 'miasto';
  s.complete = { mode: 'all', conds: [{ type: 'collect' }], next: 'end', count: 1 };
  p.mechanics.timer = { on: true, limit: 60, warn: 10 };
  var pl = objs.player.data.comps.filter(function (c) { return c.type === 'shooter'; })[0]; if (pl) pl.on = true;
  p.flow.subtitle = 'Zbierz wszystkie monety w 60 sekund. Strzelaj klawiszem X.';
  return [s];
}
