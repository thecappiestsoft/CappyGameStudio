function exampleBulletHell(objs, p) {
  setPlayer(objs, [comp('topdown', { speed: 6, dirs: '8' }, { prio: 3 }), comp('shooter', { mode: 'auto', aim: 'up', pattern: 'single', interval: 0.18, damage: 1, speed: 12, range: 14 }), comp('dodge', { distance: 2, invuln: 0.35, cooldown: 0.8 })], { hit: [0.36, 0.36, 0.28, 0.28] });
  objs.player.data.sprite = { type: 'hero', v: 'astro' };
  objs.player.desc = 'Strzela sam w górę. Trafić można ją tylko w sam środek – mały punkt!';
  addDef(objs, defn('spiralship', 'Spiralowiec', 'Przeciwnik', { type: 'enemy', v: 'robot', color: '#ff5a8a' }, clone(BODY.enemy), [comp('patrol', { axis: 'h', distance: 8, speed: 2 }), comp('shooter', { mode: 'auto', aim: 'facing', pattern: 'spiral', interval: 0.22, speed: 3, damage: 1, range: 14 }), comp('damage'), comp('health', { hp: 40, points: 100, boss: true, invuln: 0.05 })]));
  objs.spiralship.data.size = { w: 2, h: 2 };
  addDef(objs, defn('ringship', 'Pierścieniowiec', 'Przeciwnik', { type: 'enemy', v: 'guard', color: '#5ff0ff' }, clone(BODY.enemy), [comp('patrol', { axis: 'h', distance: 3, speed: 3 }), comp('shooter', { mode: 'auto', aim: 'facing', pattern: 'circle8', interval: 1.6, speed: 3, damage: 1, range: 14 }), comp('damage'), comp('health', { hp: 8, points: 20, invuln: 0.05 })]));
  addDef(objs, defn('dartbat', 'Rakietowy nietoperz', 'Przeciwnik', { type: 'enemy', v: 'bat' }, clone(BODY.enemy), [comp('patrol', { axis: 'v', distance: 2, speed: 3 }), comp('shooter', { mode: 'auto', aim: 'player', pattern: 'spread3', interval: 1.4, speed: 4, damage: 1, range: 14 }), comp('damage'), comp('health', { hp: 4, points: 10, invuln: 0.05 })]));
  var s = sceneFromMap2('Gwiezdna burza', [
    '....................',
    '...o.....S......o...',
    '....................',
    '..r.............r...',
    '.......b....b.......',
    '....................',
    '....................',
    '....................',
    '....................',
    '..........P.........',
    '....................',
    '....................'], objs, { S: 'spiralship', r: 'ringship', b: 'dartbat', o: 'cloud' });
  s.inst = s.inst.filter(function (i) { return i.obj !== 'cloud'; });
  s.bg.theme = 'kosmos';
  s.complete = { mode: 'all', conds: [{ type: 'defeat' }], next: 'end', count: 1 };
  p.mechanics.health = { maxHp: 1, lives: 5, invuln: 1.5, respawn: 'start' };
  hudOnly(p, ['score', 'lives', 'scene']);
  p.flow.subtitle = 'Twój statek strzela sam. Lataj między pociskami (C – unik) i pokonaj wszystkich!';
  return [s];
}
