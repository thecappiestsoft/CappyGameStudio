  /* ---------- runtime ---------- */
  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  var DEFAULT_MATRIX = { 'Gracz|Świat': true, 'Przeciwnik|Świat': true, 'Pocisk|Świat': true, 'Przedmiot|Świat': true, 'Gracz|Przeciwnik': false, 'Przeciwnik|Przeciwnik': false };
  function blocks(M, a, b) { var k1 = a + '|' + b, k2 = b + '|' + a; if (M && k1 in M) return !!M[k1]; if (M && k2 in M) return !!M[k2]; if (k1 in DEFAULT_MATRIX) return DEFAULT_MATRIX[k1]; if (k2 in DEFAULT_MATRIX) return DEFAULT_MATRIX[k2]; return b === 'Świat'; }

  function Runtime(Pj, cv, ui, opts) {
    opts = opts || {};
    var S = Pj.settings || {}, M = Pj.mechanics || {}, view = S.view === 'top' ? 'top' : 'side';
    var VW = (opts.viewW || S.viewW || 20) * T, VH = (opts.viewH || S.viewH || 12) * T;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = VW * dpr; cv.height = VH * dpr;
    var c = cv.getContext('2d');
    registerAssets2(Pj.assets);
    var input = ui.input;
    var G, scene, ents, SOL, player, proj, parts, cam, t = 0, state = 'title', reached = false, warnedMove = {}, pressed = {}, dialog = null;
    var maxHp = Math.max(1, (M.health && M.health.maxHp) || 3);
    function log(lvl, msg, e) { if (ui.log) ui.log({ t: G ? G.elapsed : 0, lvl: lvl, msg: msg, ent: e ? e.id : null }); }
    function sfx(n) {
      if (!n || n === 'none') return;
      if (AUD[n]) { if (ui.soundOn === false) return; try { var a = new Audio(AUD[n]); a.volume = Math.min(1, ui.volume == null ? 0.6 : ui.volume); a.play().catch(function () { }); } catch (e) { } return; }
      if (ui.sound) ui.sound.play(n);
    }
    function msg(m) { if (ui.toast && m) ui.toast(m); }
    function newGame() {
      maxHp = Math.max(1, (M.health && M.health.maxHp) || 3); G = { bonusJumps: 0, score: (M.score && M.score.start) || 0, lives: (M.health && M.health.lives) || 3, hp: maxHp, inv: {}, flags: {}, vars: {}, elapsed: 0, sceneTime: 0, inv_t: 0, speed_t: 0, nextBonus: (M.score && M.score.bonusLife) || 0, sceneIdx: 0 };
    }
    function sceneById(id) { return (Pj.scenes || []).filter(function (s) { return s.id === id; })[0]; }
    function makeEnt(inst) {
      var r = resolveInst(Pj, inst); if (!r) return null;
      var w = (r.size && r.size.w) || 1, h = (r.size && r.size.h) || 1, hb = hitFor(r, view);
      var e = { id: inst.id, inst: inst, r: r, name: r.name, layer: inst.layer || r.layer || 'swiat', cat: (r.body && r.body.cat) || 'Świat', body: (r.body && r.body.type) || 'static', solid: !!(r.body && r.body.solid),
        sx0: inst.x * T, sy0: inst.y * T, sw: w * T, sh: h * T, x: (inst.x + hb[0] * w) * T, y: (inst.y + hb[1] * h) * T, w: hb[2] * w * T, h: hb[3] * h * T, ox: hb[0] * w * T, oy: hb[1] * h * T,
        alive: true, vx: 0, vy: 0, dir: inst.flip ? -1 : 1, st: {}, cs: {}, comps: {}, list: activeComps(r), touch: {}, hp: 0, inv: 0, ground: null, events: [] };
      e.sx = e.x; e.sy = e.y;
      e.list.forEach(function (cp) { if (!e.comps[cp.type]) e.comps[cp.type] = cp.p || {}; });
      var movers = e.list.filter(function (cp) { return COMP[cp.type].group === 'ruch'; });
      e.driver = movers[0] ? movers[0].type : null;
      if (movers.length > 1) log('warn', 'Obiekt „' + e.name + '”: ' + movers.length + ' komponenty sterują ruchem. Działa ten z najwyższym priorytetem: ' + COMP[movers[0].type].name + '.', e);
      if (e.comps.health) e.hp = e.comps.health.hp || 1;
      if (e.comps.ai) { e.ai = { s: e.comps.ai.init || 'patrol', t: 0, lostT: 0 }; }
      if (e.comps.lever) e.st.on = false;
      if (e.comps.gridstep || e.comps.turnai || e.comps.pushable || e.comps.snake) { e.cs.gx = inst.x; e.cs.gy = inst.y; }
      if (e.comps.brick) { e.cs.hp = e.comps.brick.hp || 1; }
      if (e.comps.car) e.cs.ang = { r: 0, d: Math.PI / 2, l: Math.PI, u: -Math.PI / 2 }[e.comps.car.start || 'r'];
      if (e.comps.ball) e.cs.held = true;
      if (e.comps.shooter && e.comps.shooter.mode === 'auto') e.cs.cool = 1.2 + Math.random() * 0.6;
      e.face = { x: e.dir, y: 0 };
      if (e.comps.door && e.comps.door.need === 'none') e.st.lockedNone = true;
      return e;
    }
    function loadScene(id, keepPos) {
      scene = sceneById(id) || (Pj.scenes || [])[0];
      if (!scene) return;
      G.sceneIdx = Math.max(0, (Pj.flow.order || []).indexOf(scene.id));
      ents = []; proj = []; parts = []; reached = false; dialog = null; G.sceneTime = 0; G.flags = {}; warnedMove = {};
      G.time = (M.timer && M.timer.on) ? (M.timer.limit || 120) : 0;
      (scene.inst || []).forEach(function (inst) { var e = makeEnt(inst); if (e) ents.push(e); });
      var LO = { tlo: 0, swiat: 1, kolizje: 2, interakcje: 3, efekty: 5 };
      ents.forEach(function (e) { e.lo = (LO[e.layer] || 1) + ((TYPES[e.r.sprite.type] || {}).z || 0) / 20; });
      ents.sort(function (a, b) { return a.lo - b.lo; });
      player = ents.filter(function (e) { return e.list.some(function (cp) { return PDRV[cp.type]; }); })[0] || null;
      clickEnt = player ? null : ents.filter(function (e) { return e.comps.clicker; })[0] || null; clickerOn = false;
      tdEnt = player ? null : ents.filter(function (e) { return e.comps.td; })[0] || null;
      drops = []; G.tdSel = 0; G.gold = tdEnt ? (tdEnt.comps.td.gold || 0) : (G.gold != null && !tdEnt ? null : G.gold); if (!tdEnt) G.gold = null;
      PATHS = {}; ents.forEach(function (w) { if (w.comps.waypoint) { var tg = w.comps.waypoint.tag || 'A'; (PATHS[tg] = PATHS[tg] || []).push({ n: w.comps.waypoint.n || 1, x: w.x + w.w / 2, y: w.y + w.h / 2 }); } });
      Object.keys(PATHS).forEach(function (k) { PATHS[k].sort(function (x, y) { return x.n - y.n; }); });
      GATES = ents.filter(function (g) { return g.comps.lapgate; }).map(function (g) { return g.comps.lapgate.n || 0; }).sort(function (x, y) { return x - y; }).filter(function (v, i, arr) { return arr.indexOf(v) === i; });
      G.lap = 0; G.gateI = 1 % Math.max(1, GATES.length); G.cd = (player && player.comps.car) ? 3.2 : 0; G.moves = (player && player.comps.gridstep) ? 0 : null;
      if (player && player.comps.snake) snakeReset(player);
      G.cdShown = null; if (player && G.weapon && player.comps.shooter) player.comps.shooter = Object.assign({}, G.weapon);
      if (player) { player.isPlayer = true; G.cp = { x: player.x, y: player.y }; player.lo = 4; ents.sort(function (a, b) { return a.lo - b.lo; }); }
      cam = { x: 0, y: 0 };
      if (player) centerCam(true); else { cam.x = sceneW() < VW ? -(VW - sceneW()) / 2 : 0; cam.y = sceneH() < VH ? -(VH - sceneH()) / 2 : 0; }
      startDlg = ents.filter(function (e) { return e.comps.dialog && e.comps.dialog.trigger === 'start'; })[0] || null;
      duelOn = false;
      log('info', 'Scena „' + scene.name + '” wczytana: ' + ents.length + ' obiektów.');
      if (!player && !startDlg && !clickEnt && !tdEnt) log('error', 'Scena „' + scene.name + '” nie ma postaci gracza (komponent Ruch platformowy lub Ruch top-down).');
      if (ui.onScene) ui.onScene(scene);
    }
    var startDlg = null, duelOn = false, spawnN = 0, clickEnt = null, clickerOn = false, tdEnt = null, drops = [], PATHS = {}, GATES = [], tapAt = null, aimX = null;
    var PDRV = { platformer: 1, topdown: 1, flappy: 1, gridstep: 1, car: 1, snake: 1, paddle: 1 };
    function sceneW() { return scene.cols * T; }
    function sceneH() { return scene.rows * T; }
    function centerCam(snap) {
      var W = sceneW(), H = sceneH(), cp = player && player.comps.camera;
      if (!player) return;
      var tx = player.x + player.w / 2 - VW / 2, ty = player.y + player.h / 2 - VH / 2;
      if (cp && !snap) {
        var dz = (cp.dead || 0) * T, cx = cam.x + VW / 2, cy = cam.y + VH / 2, px = player.x + player.w / 2, py = player.y + player.h / 2;
        tx = cam.x; ty = cam.y;
        if (px > cx + dz) tx = cam.x + (px - cx - dz); else if (px < cx - dz) tx = cam.x + (px - cx + dz);
        if (py > cy + dz) ty = cam.y + (py - cy - dz); else if (py < cy - dz) ty = cam.y + (py - cy + dz);
        var k = 1 - (cp.smooth == null ? 80 : cp.smooth) / 100; k = Math.max(0.05, k);
        tx = cam.x + (tx - cam.x) * Math.min(1, k * 1.2); ty = cam.y + (ty - cam.y) * Math.min(1, k * 1.2);
      } else if (!cp && !snap) { tx = cam.x; ty = cam.y; }
      if (!cp && snap) { tx = 0; ty = 0; if (player.x + player.w > VW) tx = player.x - VW / 2; if (player.y + player.h > VH) ty = player.y - VH / 2; }
      cam.x = Math.max(0, Math.min(Math.max(0, W - VW), tx)); cam.y = Math.max(0, Math.min(Math.max(0, H - VH), ty));
      if (W < VW) cam.x = -(VW - W) / 2; if (H < VH) cam.y = -(VH - H) / 2;
    }
    function rebuildSolids() { SOL = ents.filter(function (e) { return e.alive && e.solid && !e.st.open; }); }
    function moveBody(e, dx, dy) {
      var res = { l: 0, r: 0, u: 0, d: null }, steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 6)), sx = dx / steps, sy = dy / steps, i, j, s;
      var cat = e.cat;
      for (i = 0; i < steps; i++) {
        if (sx) { e.x += sx; for (j = 0; j < SOL.length; j++) { s = SOL[j]; if (s === e || !blocks(Pj.mechanics.matrix, cat, s.cat) || !overlap(e, s)) continue; if (sx > 0) { e.x = s.x - e.w; res.r = 1; } else { e.x = s.x + s.w; res.l = 1; } } }
        if (sy) { e.y += sy; for (j = 0; j < SOL.length; j++) { s = SOL[j]; if (s === e || !blocks(Pj.mechanics.matrix, cat, s.cat) || !overlap(e, s)) continue; if (sy > 0) { e.y = s.y - e.h; res.d = s; } else { e.y = s.y + s.h; res.u = 1; } } }
      }
      var W = sceneW(), H = sceneH();
      if (e.x < 0) { e.x = 0; res.l = 1; } if (e.x + e.w > W) { e.x = W - e.w; res.r = 1; }
      if (e.y < 0) { e.y = 0; res.u = 1; }
      if (view === 'top' && e.y + e.h > H) { e.y = H - e.h; res.d = true; }
      return res;
    }
    function grav(strength) { return 500 + (strength || 5) * 160; }
    function dist(a, b) { var dx = (b.x + b.w / 2) - (a.x + a.w / 2), dy = (b.y + b.h / 2) - (a.y + a.h / 2); return { dx: dx, dy: dy, d: Math.sqrt(dx * dx + dy * dy) }; }

    /* ---------- grid / turn-based movement ---------- */
    function tileRect(tx, ty) { return { x: tx * T + 3, y: ty * T + 3, w: T - 6, h: T - 6 }; }
    function solidAt(tx, ty, ignore) { var r = tileRect(tx, ty); for (var j = 0; j < SOL.length; j++) { var s = SOL[j]; if (s !== ignore && s.alive && overlap(r, s)) return s; } return null; }
    function foeAt(tx, ty, ignore) { var r = tileRect(tx, ty); for (var j = 0; j < ents.length; j++) { var o = ents[j]; if (o !== ignore && o !== player && o.alive && o.cat === 'Przeciwnik' && o.comps.health) { var gx = o.cs.mv ? o.cs.mv.tx : o.cs.gx, gy = o.cs.mv ? o.cs.mv.ty : o.cs.gy; if (gx != null ? (gx === tx && gy === ty) : overlap(r, o)) return o; } } return null; }
    function inGrid(tx, ty) { return tx >= 0 && ty >= 0 && tx < scene.cols && ty < scene.rows; }
    function startMv(e, tx, ty, dur) { e.cs.mv = { fx: e.cs.gx, fy: e.cs.gy, tx: tx, ty: ty, t: 0, d: dur }; e.cs.gx = tx; e.cs.gy = ty; e.moving = true; }
    function stepMv(e, dt) {
      var m = e.cs.mv; if (!m) return false;
      m.t = Math.min(1, m.t + dt / m.d); var k = m.t < 1 ? 1 - Math.pow(1 - m.t, 2) : 1;
      e.x = (m.fx + (m.tx - m.fx) * k) * T + e.ox; e.y = (m.fy + (m.ty - m.fy) * k) * T + e.oy;
      if (m.t >= 1) { e.cs.mv = null; return true; } return false;
    }
    function gridPlayer(dt) {
      var e = player, gs = e.comps.gridstep, dur = Math.max(0.07, 0.34 - (gs.speed || 6) * 0.026);
      if (e.cs.rep > 0) e.cs.rep -= dt;
      if (e.cs.mv) { stepMv(e, dt); e.anim = 'walk'; return; }
      e.moving = false; e.anim = 'idle';
      var k = input, dx = (k.r ? 1 : 0) - (k.l ? 1 : 0), dy = dx ? 0 : (k.d ? 1 : 0) - (k.u ? 1 : 0);
      if (!dx && !dy) { e.cs.rep = 0; return; }
      if (e.cs.rep > 0) return;
      e.cs.rep = 0.17; if (dx) e.dir = dx; e.face = { x: dx, y: dy };
      var tx = e.cs.gx + dx, ty = e.cs.gy + dy;
      if (!inGrid(tx, ty)) return;
      var foe = foeAt(tx, ty);
      if (foe) { if (gs.attack > 0) { e.cs.slash = 0.18; e.cs.sbox = { x: tx * T, y: ty * T, w: T, h: T }; sfx('stomp'); damageEnt(foe, gs.attack || 1, 'atak'); } G.moves++; endTurn(dur); return; }
      var s = solidAt(tx, ty);
      if (s && s.comps.door && !s.st.open) { if (!e.cs.bumped) tryDoor(s); e.cs.bumped = true; return; }
      if (s && s.comps.pushable) {
        var bx = tx + dx, by = ty + dy;
        if (!inGrid(bx, by) || solidAt(bx, by, s) || foeAt(bx, by)) { if (!e.cs.bumped) { sfx('hint'); } e.cs.bumped = true; return; }
        startMv(s, bx, by, dur); sfx(s.comps.pushable.sound || 'door'); s = null;
      }
      if (s) return;
      e.cs.bumped = false; startMv(e, tx, ty, dur); G.moves++; endTurn(dur);
    }
    function endTurn(dur) {
      var gs = player && player.comps.gridstep; if (!gs || gs.turns === false) return;
      ents.forEach(function (o) {
        if (!o.alive || !o.comps.turnai || o === player) return;
        var ai = o.comps.turnai, px = player.cs.gx, py = player.cs.gy, dx = px - o.cs.gx, dy = py - o.cs.gy, md = Math.abs(dx) + Math.abs(dy);
        if (md === 1) { o.dir = dx < 0 ? -1 : dx > 0 ? 1 : o.dir; o.cs.slash = 0.2; o.cs.sbox = { x: px * T, y: py * T, w: T, h: T }; hurt(ai.damage || 1, false, o, 'atak „' + o.name + '”'); return; }
        var opts2 = [];
        if (md <= (ai.detect || 5)) { var sx = Math.sign(dx), sy = Math.sign(dy); if (Math.abs(dx) >= Math.abs(dy)) { if (sx) opts2.push([sx, 0]); if (sy) opts2.push([0, sy]); } else { if (sy) opts2.push([0, sy]); if (sx) opts2.push([sx, 0]); } }
        else if (ai.wander !== false && Math.random() < 0.4) { var dd = [[1, 0], [-1, 0], [0, 1], [0, -1]]; opts2.push(dd[Math.floor(Math.random() * 4)]); }
        for (var i = 0; i < opts2.length; i++) {
          var nx = o.cs.gx + opts2[i][0], ny = o.cs.gy + opts2[i][1];
          if (!inGrid(nx, ny) || solidAt(nx, ny) || foeAt(nx, ny, o) || (nx === px && ny === py)) continue;
          if (opts2[i][0]) o.dir = opts2[i][0]; startMv(o, nx, ny, dur * 1.1); break;
        }
      });
    }
    /* ---------- snake ---------- */
    function snakeReset(e) { var sn = e.comps.snake; e.cs.gx = Math.round((e.x - e.ox) / T); e.cs.gy = Math.round((e.y - e.oy) / T); e.cs.dir = [1, 0]; e.cs.next = [1, 0]; e.cs.body = []; for (var i = 1; i <= (sn.length || 0); i++) e.cs.body.push([e.cs.gx - i, e.cs.gy]); e.cs.grow = 0; e.cs.iv = Math.max(0.06, 0.36 - (sn.speed || 5) * 0.028); e.cs.acc = 0; e.cs.wait = true; }
    function snakePlayer(dt) {
      var e = player, sn = e.comps.snake, k = input, nd = null;
      if (k.r) nd = [1, 0]; else if (k.l) nd = [-1, 0]; else if (k.u) nd = [0, -1]; else if (k.d) nd = [0, 1];
      if (nd && !(nd[0] === -e.cs.dir[0] && nd[1] === -e.cs.dir[1])) { e.cs.next = nd; e.cs.wait = false; }
      if (e.cs.wait) { e.anim = 'idle'; return; }
      e.cs.acc += dt; e.moving = true; e.anim = 'walk';
      if (e.cs.acc < e.cs.iv) return;
      e.cs.acc = 0; e.cs.dir = e.cs.next; if (e.cs.dir[0]) e.dir = e.cs.dir[0];
      var tx = e.cs.gx + e.cs.dir[0], ty = e.cs.gy + e.cs.dir[1];
      var hitSelf = e.cs.body.some(function (b, i) { return b[0] === tx && b[1] === ty && i < e.cs.body.length - (e.cs.grow ? 0 : 1); });
      if (!inGrid(tx, ty) || solidAt(tx, ty) || hitSelf) { G.inv_t = 0; hurt(1, true, null, hitSelf ? 'ugryzienie własnego ogona' : 'zderzenie ze ścianą'); return; }
      e.cs.body.unshift([e.cs.gx, e.cs.gy]); if (e.cs.grow > 0) e.cs.grow--; else e.cs.body.pop();
      e.cs.gx = tx; e.cs.gy = ty; e.x = tx * T + e.ox; e.y = ty * T + e.oy;
    }
    function snakeAte(e) {
      var sn = e.comps.snake; e.cs.grow += sn.grow || 1; if (sn.faster !== false) e.cs.iv = Math.max(0.05, e.cs.iv * 0.96);
      if (sn.food && Pj.objects[sn.food]) {
        for (var tries = 0; tries < 200; tries++) {
          var x = Math.floor(Math.random() * scene.cols), y = Math.floor(Math.random() * scene.rows);
          if (solidAt(x, y) || (x === e.cs.gx && y === e.cs.gy) || e.cs.body.some(function (b) { return b[0] === x && b[1] === y; })) continue;
          var r = tileRect(x, y); if (ents.some(function (o) { return o.alive && o.comps.pickup && overlap(r, o); })) continue;
          spawnAt(sn.food, x, y); break;
        }
      }
    }
    /* ---------- car ---------- */
    function carPlayer(dt) {
      var e = player, cr = e.comps.car, k = input;
      if (G.cd > 0) { e.cs.v = 0; return; }
      var vmax = 60 + (cr.speed || 6) * 28, acc = 60 + (cr.accel || 5) * 30, cx = e.x + e.w / 2, cy = e.y + e.h / 2, sf = (cr.grass || 45) / 100;
      for (var i = 0; i < ents.length; i++) { var o = ents[i]; if (o.alive && o.comps.surface && cx >= o.x && cx <= o.x + o.w && cy >= o.y && cy <= o.y + o.h) { sf = Math.max(sf, (o.comps.surface.speed || 100) / 100); } }
      if (G.speed_t > 0) sf *= 1.3;
      var v = e.cs.v || 0, th = k.u ? 1 : k.d ? -1 : 0;
      if (th > 0) v += acc * dt; else if (th < 0) v -= (v > 0 ? acc * 1.8 : acc * 0.7) * dt; else v *= Math.max(0, 1 - 1.6 * dt);
      var top = vmax * sf; if (v > top) v = Math.max(top, v - acc * 2 * dt); if (v < -top * 0.45) v = -top * 0.45;
      var steer = (k.r ? 1 : 0) - (k.l ? 1 : 0);
      if (steer && Math.abs(v) > 4) e.cs.ang += steer * (1.2 + (cr.turn || 5) * 0.32) * dt * Math.sign(v) * Math.min(1, Math.abs(v) / 90);
      var r = moveBody(e, Math.cos(e.cs.ang) * v * dt, Math.sin(e.cs.ang) * v * dt);
      if (r.l || r.r || r.u || r.d) { if (Math.abs(v) > 60) sfx('stomp'); v *= -0.25; }
      e.cs.v = v; e.moving = Math.abs(v) > 5; e.anim = e.moving ? 'walk' : 'idle';
    }
    /* ---------- paddle & ball ---------- */
    function paddlePlayer(dt) {
      var e = player, pd = e.comps.paddle, sp = (120 + (pd.speed || 7) * 45) * (G.speed_t > 0 ? 1.4 : 1), ix = (input.r ? 1 : 0) - (input.l ? 1 : 0);
      if (ix) { aimX = null; e.x += ix * sp * dt; }
      else if (aimX != null) { var tx = aimX - e.w / 2, d = tx - e.x; e.x += Math.sign(d) * Math.min(Math.abs(d), sp * 1.6 * dt); }
      e.x = Math.max(0, Math.min(sceneW() - e.w, e.x)); e.moving = !!ix;
      if (pressed.jump || pressed.act || tapAt) ents.forEach(function (b) { if (b.alive && b.comps.ball && b.cs.held) launchBall(b); });
    }
    function launchBall(b) { var sp = 160 + (b.comps.ball.speed || 6) * 40, an = -Math.PI / 2 + (Math.random() - 0.5) * 0.9; b.cs.held = false; b.vx = Math.cos(an) * sp; b.vy = Math.sin(an) * sp; b.cs.sp = sp; sfx('jump'); }
    function updateBall(b, dt) {
      if (b.cs.held) { if (player) { b.x = player.x + player.w / 2 - b.w / 2; b.y = player.y - b.h - 2; } return; }
      var steps = Math.max(1, Math.ceil(Math.max(Math.abs(b.vx), Math.abs(b.vy)) * dt / 5)), sx = b.vx * dt / steps, sy = b.vy * dt / steps;
      for (var s = 0; s < steps; s++) {
        b.x += sx; var h = ballHit(b); if (h || b.x < 0 || b.x + b.w > sceneW()) { b.x -= sx; b.vx = -b.vx; sx = -sx; if (h) brickHit(h); }
        b.y += sy; h = ballHit(b); if (h || b.y < 0) { b.y -= sy; b.vy = -b.vy; sy = -sy; if (h) brickHit(h); }
        if (player && player.comps.paddle && b.vy > 0 && overlap(b, player)) {
          var rel = Math.max(-1, Math.min(1, ((b.x + b.w / 2) - (player.x + player.w / 2)) / (player.w / 2))), an = -Math.PI / 2 + rel * 1.05;
          if (b.comps.ball.faster !== false) b.cs.sp = Math.min(b.cs.sp * 1.025, 620);
          b.vx = Math.cos(an) * b.cs.sp; b.vy = Math.sin(an) * b.cs.sp; sx = b.vx * dt / steps; sy = b.vy * dt / steps; b.y = player.y - b.h - 1; sfx('jump');
        }
      }
      if (b.y > sceneH() + T) { log('warn', 'Piłka spadła.', b); b.cs.held = true; G.inv_t = 0; hurt(maxHp, false, null, 'piłka spadła'); }
    }
    function ballHit(b) { for (var j = 0; j < SOL.length; j++) { var s = SOL[j]; if (s !== b && s !== player && s.alive && overlap(b, s)) return s; } return null; }
    function brickHit(s) {
      if (!s.comps.brick) { sfx('hint'); return; }
      var br = s.comps.brick; s.cs.hp--; burst(s.x + s.w / 2, s.y + s.h / 2, '#ffffff'); sfx('stomp');
      if (s.cs.hp <= 0) {
        s.alive = false; addScore(br.points || 0); burst(s.x + s.w / 2, s.y + s.h / 2, '#ffd23f'); rebuildSolids();
        if (br.drop && Math.random() * 100 < (br.chance == null ? 15 : br.chance)) { var d = spawnAt(br.drop, Math.floor((s.x + s.w / 2) / T), Math.floor((s.y + s.h / 2) / T)); if (d) d.cs.fall = true; }
      }
    }
    /* ---------- loot ---------- */
    var RAR = [{ n: 'Zwykły', c: '#cfd6e2' }, { n: 'Rzadki', c: '#3fa7ff' }, { n: 'Epicki', c: '#b36bff' }, { n: 'Legendarny', c: '#ffa62b' }];
    var WPN = [{ n: 'Blaster', pattern: 'single', interval: 0.36, damage: 1, speed: 7 }, { n: 'Rozpryskiwacz', pattern: 'spread3', interval: 0.6, damage: 1, speed: 6 }, { n: 'Karabinek', pattern: 'single', interval: 0.17, damage: 1, speed: 9 }, { n: 'Wachlarz', pattern: 'spread5', interval: 0.85, damage: 1, speed: 6 }, { n: 'Ciężki miotacz', pattern: 'single', interval: 0.9, damage: 3, speed: 5 }];
    function genWeapon(minRar) {
      var roll = Math.random() * 100, rar = roll < 60 ? 0 : roll < 88 ? 1 : roll < 98 ? 2 : 3; rar = Math.max(rar, +minRar || 0);
      var b = WPN[Math.floor(Math.random() * WPN.length)];
      return { name: RAR[rar].n + ' ' + b.n + (rar === 3 ? ' Cappy' : ''), rar: rar, color: RAR[rar].c, mode: 'hold', pattern: b.pattern, interval: +(b.interval * (1 - rar * 0.13)).toFixed(2), damage: Math.round(b.damage * (1 + rar * 0.7)), speed: b.speed + rar, range: 8 + rar * 1.5, aim: 'facing', look: 'orb' };
    }
    function wpnInfo(w) { return w.name + ' (obrażenia ' + w.damage + ', ' + (1 / w.interval).toFixed(1).replace('.', ',') + ' strz./s)'; }
    function dropLoot(e, force) {
      var lt = e.comps.loot; if (!lt) return;
      if (!force && Math.random() * 100 >= (lt.chance == null ? 35 : lt.chance)) return;
      var w = genWeapon(lt.minRar); drops.push({ x: e.x + e.w / 2 - T * 0.35, y: e.y + e.h / 2 - T * 0.35, w: T * 0.7, h: T * 0.7, wpn: w, t: 0 });
      log('info', 'Wypadł łup: ' + wpnInfo(w) + '.', e); if (w.rar >= 2) msg(w.rar === 3 ? 'LEGENDARNY łup!' : 'Epicki łup!');
    }
    function updateDrops(dt) {
      if (!player) return;
      for (var i = drops.length - 1; i >= 0; i--) {
        var d = drops[i]; d.t += dt;
        if (!overlap(player, d)) { d.near = false; continue; }
        if (!d.near && ui.hintKey) ui.hintKey('E – weź: ' + d.wpn.name);
        if (!d.near) msg(wpnInfo(d.wpn)); d.near = true;
        if (pressed.act) {
          var old = G.weapon; player.comps.shooter = Object.assign({}, d.wpn); G.weapon = d.wpn; drops.splice(i, 1); sfx('collect');
          msg('Masz: ' + d.wpn.name + '!'); log('info', 'Nowa broń: ' + wpnInfo(d.wpn) + '.', player);
          if (old) drops.push({ x: player.x, y: player.y, w: T * 0.7, h: T * 0.7, wpn: old, t: 0, near: true });
          pressed.act = false; break;
        }
      }
    }
    /* ---------- tower defense ---------- */
    function tdSpots() { return ents.filter(function (o) { return o.alive && o.comps.buildspot && !o.st.built; }); }
    function tdBuild(s) {
      var bs = s.comps.buildspot, cost = bs.cost || 0;
      if (!Pj.objects[bs.tower]) { msg('To pole nie ma wybranej wieży.'); return; }
      if (G.gold < cost) { msg('Za mało złota! Wieża kosztuje ' + cost + '.'); sfx('hint'); return; }
      var tw = spawnAt(bs.tower, Math.round((s.x - s.ox) / T), Math.round((s.y - s.oy) / T)); if (!tw) return;
      G.gold -= cost; s.st.built = tw; tw.lvl = 1; tw.cs.cool = 0.3; sfx('door'); burst(tw.x + tw.w / 2, tw.y + tw.h / 2, '#ffd23f');
      log('info', 'Postawiono wieżę „' + tw.name + '” za ' + cost + ' złota.', tw);
    }
    function tdUpgrade(tw) {
      var tc = tw.comps.tower, cost = (tc.upCost || 40) * (tw.lvl || 1);
      if ((tw.lvl || 1) >= 3) { msg('Ta wieża ma już najwyższy poziom.'); return; }
      if (G.gold < cost) { msg('Ulepszenie kosztuje ' + cost + ' złota.'); sfx('hint'); return; }
      G.gold -= cost; tw.lvl = (tw.lvl || 1) + 1; sfx('life'); msg('Wieża ulepszona do poziomu ' + tw.lvl + '!'); log('info', 'Ulepszono wieżę „' + tw.name + '” (poziom ' + tw.lvl + ').', tw);
    }
    function tdInput() {
      var sp = tdSpots();
      if (pressed.fire && sp.length) { G.tdSel = (G.tdSel + 1) % sp.length; }
      if (G.tdSel >= sp.length) G.tdSel = 0;
      if (pressed.act && sp[G.tdSel]) tdBuild(sp[G.tdSel]);
      if (tapAt) {
        var hit = null; ents.forEach(function (o) { if (o.alive && (o.comps.buildspot || o.comps.tower) && tapAt.x >= o.x - 4 && tapAt.x <= o.x + o.w + 4 && tapAt.y >= o.y - 4 && tapAt.y <= o.y + o.h + 4) hit = o; });
        if (hit && hit.comps.tower) tdUpgrade(hit); else if (hit && !hit.st.built) { G.tdSel = Math.max(0, tdSpots().indexOf(hit)); tdBuild(hit); } else if (hit && hit.st.built && hit.st.built.alive) tdUpgrade(hit.st.built);
      }
    }
    function updateTower(e, dt) {
      var tc = e.comps.tower, lv = e.lvl || 1; e.cs.cool = (e.cs.cool || 0) - dt;
      if (e.cs.cool > 0) return;
      var rg = (tc.range || 3) + (lv - 1) * 0.75;
      if (!nearestEnemy(e, rg)) { e.cs.cool = 0.1; return; }
      e.cs.cool = 0;
      fire(e, { interval: Math.max(0.1, (tc.interval || 0.8) * (1 - (lv - 1) * 0.15)), damage: (tc.damage || 1) + (lv - 1), speed: 9, range: rg + 0.5, aim: 'nearest', pattern: tc.pattern || 'single', look: 'orb', mode: 'auto' }, true);
    }
    function updatePath(e, dt) {
      var pf = e.comps.pathfollow, path = PATHS[pf.tag || 'A'];
      if (!path || !path.length) return;
      if (pf.loop && G.cd > 0) return;
      if (e.cs.wi == null) e.cs.wi = 0;
      var tgt = path[e.cs.wi], cx = e.x + e.w / 2, cy = e.y + e.h / 2, dx = tgt.x - cx, dy = tgt.y - cy, d = Math.sqrt(dx * dx + dy * dy), sp = (20 + (pf.speed || 3) * 18) * (e.cs.slow > 0 ? 0.5 : 1);
      if (d < 3 || d < sp * dt) {
        e.x += dx; e.y += dy; e.cs.wi++;
        if (e.cs.wi >= path.length) {
          if (pf.loop) { e.cs.wi = 0; e.cs.laps = (e.cs.laps || 0) + 1; raceCheck(e); }
          else { e.alive = false; if (pf.damage) { G.lives -= pf.damage; sfx('hurt'); msg('Wróg dotarł do bazy! Zostało: ' + Math.max(0, G.lives) + '.'); log('warn', '„' + e.name + '” dotarł do bazy (−' + pf.damage + ').', e); if (G.lives <= 0) { G.lives = 0; end(false, 'base'); } } }
        }
      } else { e.x += dx / d * sp * dt; e.y += dy / d * sp * dt; }
      if (Math.abs(dx) > 0.5) e.dir = dx < 0 ? -1 : 1;
      if (e.comps.pathfollow.loop) e.cs.ang = Math.atan2(dy, dx);
      e.moving = true;
    }
    /* ---------- racing laps ---------- */
    function lapTarget() { var cd = ((scene.complete || {}).conds || []).filter(function (c) { return c.type === 'laps'; })[0]; return cd ? (cd.val || 3) : 3; }
    function raceCheck(r) { if (state !== 'play') return; var N = lapTarget(); if ((r.cs.laps || 0) >= N && G.lap < N) { log('warn', 'Rywal „' + r.name + '” ukończył wyścig pierwszy.', r); end(false, 'race'); } }
    function racePlace() {
      var path = null, mine = G.lap * 1000 + (GATES.length ? ((G.gateI + GATES.length - 1) % GATES.length) / GATES.length * 1000 : 0), place = 1, n = 1;
      ents.forEach(function (o) { if (o.alive && o.comps.pathfollow && o.comps.pathfollow.loop) { n++; path = PATHS[o.comps.pathfollow.tag || 'A'] || []; var theirs = (o.cs.laps || 0) * 1000 + (path.length ? (o.cs.wi || 0) / path.length * 1000 : 0); if (theirs > mine) place++; } });
      G.place = place; G.racers = n;
    }
    function gateCheck() {
      if (!player || !GATES.length) return;
      ents.forEach(function (g) {
        if (!g.alive || !g.comps.lapgate || !overlap(player, g)) return;
        var n = g.comps.lapgate.n || 0, want = GATES[G.gateI];
        if (n !== want) return;
        if (n === GATES[0] && G.gateI === 0) { G.lap++; var N = lapTarget(); sfx(G.lap >= N ? 'win' : 'life'); if (G.lap < N) msg('Okrążenie ' + (G.lap + 1) + ' z ' + N + '!'); log('info', 'Okrążenie ' + G.lap + ' ukończone.'); }
        G.gateI = (G.gateI + 1) % GATES.length;
      });
    }
    /* player */
    function updatePlayer(dt) {
      var e = player, k = input, pc = e.comps.platformer, tc = e.comps.topdown;
      if (e.cs.dcool > 0) e.cs.dcool -= dt; if (e.cs.mcool > 0) e.cs.mcool -= dt; if (e.cs.slash > 0) e.cs.slash -= dt;
      var fx0 = (k.r ? 1 : 0) - (k.l ? 1 : 0), fy0 = (k.d ? 1 : 0) - (k.u ? 1 : 0);
      if (fx0 || fy0) e.face = { x: fx0, y: view === 'top' ? fy0 : 0 };
      if (e.cs.dashT > 0) {
        e.cs.dashT -= dt; var dr = moveBody(e, e.cs.dvx * dt, e.cs.dvy * dt); if (view === 'side') e.vy = 0;
        e.anim = 'jump'; e.moving = true; if (dr.l || dr.r) e.cs.dashT = 0; return;
      }
      if (pressed.dodge && e.comps.dodge && !(e.cs.dcool > 0)) {
        var dg = e.comps.dodge, dur = 0.18, fx = e.face.x || (view === 'top' && e.face.y ? 0 : e.dir), fy = view === 'top' ? e.face.y : 0, fl = Math.sqrt(fx * fx + fy * fy) || 1;
        e.cs.dashT = dur; e.cs.dvx = fx / fl * (dg.distance || 2.5) * T / dur; e.cs.dvy = fy / fl * (dg.distance || 2.5) * T / dur; e.cs.dcool = dg.cooldown || 0.8;
        G.inv_t = Math.max(G.inv_t, dg.invuln || 0.35); G.dodgeFlag = true; sfx('jump'); log('info', 'Unik!', e); return;
      }
      if (pressed.melee && e.comps.melee && e.comps.melee.mode !== 'auto' && !(e.cs.mcool > 0)) meleeHit(e, e.comps.melee, true);
      var run = k.run ? ((pc || tc).run || 150) / 100 : 1, boost = G.speed_t > 0 ? 1.5 : 1;
      var ix = (k.r ? 1 : 0) - (k.l ? 1 : 0), iy = (k.d ? 1 : 0) - (k.u ? 1 : 0);
      if (ix) e.dir = ix;
      var fp = e.comps.flappy;
      if (e.driver === 'gridstep') { gridPlayer(dt); }
      else if (e.driver === 'snake') { snakePlayer(dt); }
      else if (e.driver === 'car') { carPlayer(dt); }
      else if (e.driver === 'paddle') { paddlePlayer(dt); }
      else if (e.driver === 'flappy' && fp) {
        var gF = 500 + (fp.gravity || 5) * 140, vF = 40 + (fp.speed || 4) * 30;
        e.dir = 1;
        if (!e.cs.started && fp.wait !== false) {
          e.vx = 0; e.vy = Math.sin(t * 5) * 30; moveBody(e, 0, e.vy * dt); e.anim = 'idle'; e.moving = true;
          if (pressed.jump) { e.cs.started = true; e.vy = -(160 + (fp.flap || 5) * 40); sfx('jump'); }
        } else {
          e.cs.started = true; e.vx = vF;
          e.vy = Math.min(e.vy + gF * dt, 720);
          if (pressed.jump) { e.vy = -(160 + (fp.flap || 5) * 40); sfx('jump'); }
          var rF = moveBody(e, e.vx * dt, e.vy * dt);
          if (rF.u && e.vy < 0) e.vy = 0;
          if (rF.d && e.vy > 0) e.vy = 0;
          if (rF.r) { G.inv_t = 0; hurt(maxHp, true, null, 'zderzenie'); }
          e.moving = true; e.anim = 'jump';
          if (e.y > sceneH() + T) { G.inv_t = 0; hurt(maxHp, true, null, 'upadek'); }
        }
      } else if (e.driver === 'topdown' && tc) {
        var spd = (60 + (tc.speed || 5) * 22) * run * boost;
        if (String(tc.dirs) === '4' && ix && iy) iy = 0;
        if (ix && iy) { ix *= 0.7071; iy *= 0.7071; }
        var sm = (tc.smooth || 0) / 100, kk = sm ? Math.min(1, (1 - sm) * 20 * dt) : 1;
        e.vx += (ix * spd - e.vx) * kk; e.vy += (iy * spd - e.vy) * kk;
        moveBody(e, e.vx * dt, e.vy * dt);
        e.moving = Math.abs(e.vx) + Math.abs(e.vy) > 10; e.anim = e.moving ? 'walk' : 'idle';
      } else if (pc) {
        var sp = (60 + (pc.speed || 5) * 22) * run * boost, g = grav(pc.gravity);
        var onIce = !!(e.ground && e.ground.r && e.ground.r.params && e.ground.r.params.slippery && e.ground.r.params.slippery.val);
        var acc = e.ground ? (onIce ? 2.5 : 16) : 16 * ((pc.air == null ? 80 : pc.air) / 100);
        e.vx += (ix * sp - e.vx) * Math.min(1, acc * dt);
        e.vy = Math.min(e.vy + g * dt, 760);
        if (e.ground) { e.coy = (pc.coyote == null ? 100 : pc.coyote) / 1000; e.jumps = 0; } else e.coy = (e.coy || 0) - dt;
        if (pressed.jump) e.buf = (pc.buffer == null ? 120 : pc.buffer) / 1000; else e.buf = (e.buf || 0) - dt;
        if (e.buf > 0) {
          var jv = -Math.sqrt(2 * g * ((pc.jump || 3) * T + T * 0.35));
          if (e.coy > 0) { e.vy = jv; e.coy = 0; e.buf = 0; e.jumps = 0; sfx('jump'); }
          else if (pressed.jump && (e.jumps || 0) < (pc.extraJumps || 0) + (G.bonusJumps || 0)) { e.vy = jv * 0.9; e.jumps = (e.jumps || 0) + 1; e.buf = 0; sfx('jump'); }
        }
        var r = moveBody(e, e.vx * dt, e.vy * dt);
        if (r.d && e.vy >= 0) { if (r.d.comps && r.d.comps.spring) { e.vy = -Math.sqrt(2 * g * (r.d.comps.spring.power || 6) * T); sfx('jump'); log('info', 'Trampolina wybiła gracza.', r.d); e.ground = null; } else { e.vy = 0; e.ground = r.d; } } else e.ground = null;
        if (r.u && e.vy < 0) e.vy = 0;
        e.moving = Math.abs(e.vx) > 12 && !!e.ground; e.anim = !e.ground ? 'jump' : e.moving ? 'walk' : 'idle';
        if (e.y > sceneH() + T) { log('warn', 'Gracz spadł poza scenę.'); G.inv_t = 0; hurt(maxHp, true, null, 'upadek'); }
      }
      if (e.cs.cool > 0) e.cs.cool -= dt;
      if (pressed.fire && e.comps.shooter && e.comps.shooter.mode === 'key') fire(e, e.comps.shooter, true);
      if (e.comps.shooter && e.comps.shooter.mode === 'auto' && !(e.cs.cool > 0)) fire(e, e.comps.shooter, true);
      if (e.comps.shooter && e.comps.shooter.mode === 'hold' && (input.fire || pressed.fire)) fire(e, e.comps.shooter, true);
    }
    function meleeBox(e, R) {
      var f = e.face || { x: e.dir, y: 0 };
      if (view === 'top' && f.y && !f.x) return { x: e.x - 6, y: f.y > 0 ? e.y + e.h : e.y - R, w: e.w + 12, h: R };
      var dx = f.x || e.dir;
      return { x: dx > 0 ? e.x + e.w : e.x - R, y: e.y - 6, w: R, h: e.h + 12 };
    }
    function meleeHit(e, m, isPlayer) {
      var R = (m.range || 1) * T; e.cs.mcool = m.cooldown || 0.4; e.cs.slash = 0.18; e.cs.sbox = meleeBox(e, R);
      sfx('stomp');
      if (isPlayer) { var hit = 0; ents.forEach(function (o) { if (o !== e && o.alive && o.comps.health && overlap(e.cs.sbox, o)) { damageEnt(o, m.damage || 1, 'atak wręcz'); hit++; if (o.body === 'dynamic') moveBody(o, (o.x < e.x ? -1 : 1) * 14, 0); } }); if (!hit) log('info', 'Cios w powietrze.', e); }
      else if (player && overlap(e.cs.sbox, player)) hurt(m.damage || 1, false, e, 'cios „' + e.name + '”');
    }
    function spawnAt(defId, tx, ty) {
      if (!Pj.objects[defId] || ents.length > 400) return null;
      var inst = { id: 'sp' + (++spawnN), obj: defId, x: tx, y: ty, layer: 'swiat', ov: {} }, ne = makeEnt(inst); if (!ne) return null;
      ne.lo = 1 + ((TYPES[ne.r.sprite.type] || {}).z || 0) / 20; ne.spawned = true; ents.push(ne); ents.sort(function (a2, b2) { return a2.lo - b2.lo; });
      return ne;
    }
    function nearestEnemy(e, range) {
      var best = null, bd = range * T;
      ents.forEach(function (o) { if (o.alive && o !== e && o.comps.health && o.cat === 'Przeciwnik') { var q = dist(e, o); if (q.d < bd) { bd = q.d; best = o; } } });
      return best;
    }
    /* npc / enemies / platforms */
    function patrolStep(e, p, dt, spd) {
      var dist = Math.max(1, p.distance || 3) * T, vert = p.axis === 'v', sp = 20 + (spd || p.speed || 3) * 18;
      if (e.cs.pause > 0) { e.cs.pause -= dt; return; }
      var flip = function () { e.dir *= -1; if (p.pause) e.cs.pause = p.pause; };
      if (vert && !(view === 'side' && e.comps.gravity)) {
        var r = moveBody(e, 0, e.dir * sp * dt);
        if (e.y > e.sy + dist) { e.y = e.sy + dist; flip(); } else if (e.y < e.sy) { e.y = e.sy; flip(); } else if (r.u || r.d) flip();
      } else {
        var r2 = moveBody(e, e.dir * sp * dt, 0);
        if (e.x > e.sx + dist) { e.x = e.sx + dist; flip(); } else if (e.x < e.sx) { e.x = e.sx; flip(); } else if (r2.l || r2.r) flip();
      }
      e.moving = true;
    }
    function chaseStep(e, spd, stop, dt) {
      if (!player) return;
      var q = dist(e, player), sp = 20 + (spd || 3) * 16;
      if (q.d <= (stop || 0) * T + 2) return;
      if (view === 'top' || !e.comps.gravity) moveBody(e, q.dx / q.d * sp * dt, q.dy / q.d * sp * dt);
      else moveBody(e, (q.dx < 0 ? -1 : 1) * Math.min(Math.abs(q.dx), sp * dt), 0);
      e.dir = q.dx < 0 ? -1 : 1; e.moving = true;
    }
    function backStep(e, spd, dt) {
      var dx = e.sx - e.x, dy = e.sy - e.y, d = Math.sqrt(dx * dx + dy * dy), sp = 20 + (spd || 2) * 18;
      if (d < 3) { e.x = e.sx; if (view === 'top' || !e.comps.gravity) e.y = e.sy; return; }
      if (view === 'top' || !e.comps.gravity) moveBody(e, dx / d * Math.min(d, sp * dt), dy / d * Math.min(d, sp * dt)); else moveBody(e, Math.sign(dx) * Math.min(Math.abs(dx), sp * dt), 0);
      e.dir = dx < 0 ? -1 : 1; e.moving = true;
    }
    function aiCond(e, row) {
      var a = e.comps.ai, q = player ? dist(e, player) : { d: 1e9 };
      switch (row.cond) {
        case 'see': return q.d < (a.detect || 5) * T;
        case 'lost': return e.ai.lostT >= (row.val || 3);
        case 'home': return Math.abs(e.x - e.sx) < 4 && (view === 'side' || Math.abs(e.y - e.sy) < 4);
        case 'near': return q.d < (row.val || 2) * T;
        case 'hp': return e.comps.health ? (e.hp / (e.comps.health.hp || 1)) * 100 < (row.val || 30) : false;
        case 'time': return e.ai.t >= (row.val || 3);
      }
      return false;
    }
    function updateAI(e, dt) {
      var a = e.comps.ai, q = player ? dist(e, player) : { d: 1e9 };
      e.ai.t += dt;
      if (q.d < (a.detect || 5) * T) e.ai.lostT = 0; else e.ai.lostT += dt;
      var rows = (a.rows || []).filter(function (r) { return r.from === e.ai.s || r.from === 'any'; }).sort(function (x, y) { return (y.prio || 2) - (x.prio || 2); });
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].to !== e.ai.s && aiCond(e, rows[i])) { log('info', '„' + e.name + '”: ' + (AI_STATES[e.ai.s] || e.ai.s) + ' → ' + (AI_STATES[rows[i].to] || rows[i].to) + ' (' + AI_CONDS[rows[i].cond] + ')', e); e.ai.s = rows[i].to; e.ai.t = 0; break; }
      }
      var s = e.ai.s;
      if (s === 'patrol') patrolStep(e, { distance: a.distance, axis: a.axis }, dt, a.patrolSpeed);
      else if (s === 'chase') chaseStep(e, a.chaseSpeed, 0, dt);
      else if (s === 'back') backStep(e, a.patrolSpeed, dt);
      else if (s === 'flee' && player) { var qq = dist(e, player); if (qq.d > 0) moveBody(e, -qq.dx / qq.d * (20 + (a.chaseSpeed || 4) * 16) * dt, view === 'top' ? -qq.dy / qq.d * (20 + (a.chaseSpeed || 4) * 16) * dt : 0); e.dir = qq.dx < 0 ? 1 : -1; }
    }
    function updateNpc(e, dt) {
      e.moving = false;
      var d = e.driver;
      if (e.cs.fall) { e.y += 130 * dt; if (e.y > sceneH() + T) e.alive = false; }
      if (e.comps.tower) { updateTower(e, dt); return; }
      if (d === 'turnai' || e.comps.pushable) { if (e.cs.slash > 0) e.cs.slash -= dt; if (e.cs.mv) stepMv(e, dt); if (e.inv > 0) e.inv -= dt; return; }
      if (d === 'pathfollow') { updatePath(e, dt); if (e.inv > 0) e.inv -= dt; return; }
      if (d === 'ball') { updateBall(e, dt); return; }
      if (e.cs.slash > 0) e.cs.slash -= dt; if (e.cs.mcool > 0) e.cs.mcool -= dt;
      if (e.comps.spawner) {
        var spc = e.comps.spawner; e.cs.age = (e.cs.age || 0) + dt;
        if (e.cs.age >= (spc.delay || 0) && (player || tdEnt) && !(spc.total > 0 && (e.cs.made || 0) >= spc.total)) {
          var iv = (spc.interval || 2) * (spc.faster !== false ? Math.max(0.35, 1 - e.cs.age / 180) : 1);
          e.cs.spT = (e.cs.spT == null ? 0 : e.cs.spT) - dt;
          e.cs.kids = (e.cs.kids || []).filter(function (k2) { return k2.alive; });
          if (e.cs.spT <= 0 && e.cs.kids.length < (spc.max || 10)) {
            e.cs.spT = iv; var tx, ty;
            if (spc.where === 'here') { tx = e.inst.x; ty = e.inst.y; }
            else if (player) { var ang = Math.random() * 6.283, rad = Math.max(VW, VH) / 2 + T; tx = Math.floor((player.x + player.w / 2 + Math.cos(ang) * rad) / T); ty = Math.floor((player.y + player.h / 2 + Math.sin(ang) * rad) / T); tx = Math.max(0, Math.min(scene.cols - 1, tx)); ty = Math.max(0, Math.min(scene.rows - 1, ty)); }
            var kid = spawnAt(spc.obj, tx, ty); if (kid) { e.cs.kids.push(kid); e.cs.made = (e.cs.made || 0) + 1; }
          }
        }
      }
      if (e.comps.melee && e.comps.melee.mode === 'auto' && player) {
        var ml = e.comps.melee, qd = dist(e, player).d, reach = (ml.range || 1) * T + e.w / 2 + player.w / 2;
        if (e.cs.wind > 0) { e.cs.wind -= dt; e.dir = player.x < e.x ? -1 : 1; e.face = { x: e.dir, y: view === 'top' ? (Math.abs(player.y - e.y) > Math.abs(player.x - e.x) ? (player.y > e.y ? 1 : -1) : 0) : 0 }; if (view === 'top' && e.face.y) e.face.x = 0; if (e.cs.wind <= 0) meleeHit(e, ml, false); applyGrav(e, dt); return; }
        if (qd < reach && !(e.cs.mcool > 0)) { e.cs.wind = ml.windup || 0.5; return; }
      }
      if (d === 'mover') {
        var p = e.comps.mover, dd = Math.max(1, p.distance || 3) * T, sp = 20 + (p.speed || 2) * 18, ox = e.x, oy = e.y;
        var riding = player && player.ground === e && p.carry !== false;
        if (e.cs.pause > 0) e.cs.pause -= dt;
        else if (p.axis === 'v') { e.y += e.dir * sp * dt; if (e.y > e.sy + dd) { e.y = e.sy + dd; e.dir = -1; e.cs.pause = p.pause || 0; } if (e.y < e.sy) { e.y = e.sy; e.dir = 1; e.cs.pause = p.pause || 0; } }
        else { e.x += e.dir * sp * dt; if (e.x > e.sx + dd) { e.x = e.sx + dd; e.dir = -1; e.cs.pause = p.pause || 0; } if (e.x < e.sx) { e.x = e.sx; e.dir = 1; e.cs.pause = p.pause || 0; } }
        if (riding) { player.y = e.y - player.h; moveBody(player, e.x - ox, 0); }
        return;
      }
      if (d === 'ai') updateAI(e, dt);
      else if (d === 'patrol') patrolStep(e, e.comps.patrol, dt);
      else if (d === 'follow' && player) { var q = dist(e, player); if (q.d < (e.comps.follow.range || 5) * T) chaseStep(e, e.comps.follow.speed, e.comps.follow.stop, dt); }
      applyGrav(e, dt);
      if (e.comps.shooter && e.comps.shooter.mode !== 'key') {
        e.cs.cool = (e.cs.cool || 0) - dt;
        if (e.cs.cool <= 0 && player && dist(e, player).d < (e.comps.shooter.range || 8) * T) fire(e, e.comps.shooter, false);
      }
      if (e.inv > 0) e.inv -= dt;
    }
    function applyGrav(e, dt) {
      if (view === 'side' && e.comps.gravity && e.body === 'dynamic') {
        e.vy = Math.min(e.vy + grav(e.comps.gravity.strength) * dt, 800);
        var r = moveBody(e, 0, e.vy * dt); if (r.d) e.vy = 0;
        if (e.y > sceneH() + T) { e.alive = false; log('info', '„' + e.name + '” spadł poza scenę.', e); }
      }
    }
    function fire(e, sc, isPlayer) {
      e.cs.cool = e.cs.cool || 0;
      if (isPlayer && e.cs.cool > 0) return;
      e.cs.cool = sc.interval || 1;
      var dx = e.dir, dy = 0;
      if (sc.aim === 'player' && player && !isPlayer) { var q = dist(e, player); dx = q.dx / q.d; dy = q.dy / q.d; e.dir = q.dx < 0 ? -1 : 1; }
      else if (sc.aim === 'nearest' && isPlayer) { var tg = nearestEnemy(e, sc.range || 8); if (!tg) { e.cs.cool = 0.1; return; } var q2 = dist(e, tg); dx = q2.dx / q2.d; dy = q2.dy / q2.d; }
      else if (sc.aim === 'up') { dx = 0; dy = -1; } else if (sc.aim === 'down') { dx = 0; dy = 1; }
      else if (view === 'top' && isPlayer && e.face && (e.face.x || e.face.y)) { var fl = Math.sqrt(e.face.x * e.face.x + e.face.y * e.face.y); dx = e.face.x / fl; dy = e.face.y / fl; }
      var sp = 80 + (sc.speed || 6) * 40, s = 14, base = Math.atan2(dy, dx), angs = [0];
      if (sc.pattern === 'spread3') angs = [-0.26, 0, 0.26]; else if (sc.pattern === 'spread5') angs = [-0.5, -0.25, 0, 0.25, 0.5];
      else if (sc.pattern === 'circle8') angs = [0, 1, 2, 3, 4, 5, 6, 7].map(function (k3) { return k3 * Math.PI / 4; });
      else if (sc.pattern === 'spiral') { e.cs.spin = (e.cs.spin || 0) + 0.35; base = e.cs.spin; angs = [0, Math.PI / 2, Math.PI, Math.PI * 1.5]; }
      angs.forEach(function (da) { var an = base + da, vx = Math.cos(an), vy = Math.sin(an);
        proj.push({ x: e.x + e.w / 2 - s / 2, y: e.y + e.h / 2 - s / 2, w: s, h: s, vx: vx * sp, vy: vy * sp, dmg: sc.damage || 1, owner: isPlayer ? 'player' : 'enemy', src: e, left: (sc.range || 8) * T, o: { type: 'bullet', v: sc.look || 'orb', color: isPlayer ? '#5ff0ff' : '#ffd23f' }, dir: vx < 0 ? -1 : 1, cat: 'Pocisk' }); });
      if (proj.length > 600) proj.splice(0, proj.length - 600);
      if (!isPlayer || sc.mode === 'key') sfx('jump');
    }
    function damageEnt(e, n, by) {
      if (!e.comps.health || e.inv > 0) return;
      e.hp -= n; e.inv = e.comps.health.invuln || 0.3; burst(e.x + e.w / 2, e.y + e.h / 2, '#ffffff');
      log('info', '„' + e.name + '” otrzymał ' + n + ' obrażeń (' + by + '). Zdrowie: ' + Math.max(0, e.hp) + '.', e);
      if (e.hp <= 0) { e.alive = false; if (e.comps.loot) dropLoot(e); if (e.comps.pathfollow && tdEnt) { G.gold += e.comps.pathfollow.gold || 0; } if (e.comps.health.drop) spawnAt(e.comps.health.drop, Math.floor((e.x + e.w / 2) / T), Math.floor((e.y + e.h / 2) / T)); addScore(e.comps.health.points || 0); sfx('stomp'); log('info', '„' + e.name + '” pokonany. +' + (e.comps.health.points || 0) + ' pkt', e); }
    }
    function updateProj(dt) {
      for (var i = proj.length - 1; i >= 0; i--) {
        var p = proj[i], dx = p.vx * dt, dy = p.vy * dt, dead = false;
        p.x += dx; p.y += dy; p.left -= Math.abs(dx) + Math.abs(dy);
        if (p.left <= 0 || p.x < -20 || p.y < -20 || p.x > sceneW() + 20 || p.y > sceneH() + 20) dead = true;
        for (var j = 0; j < SOL.length && !dead; j++) if (SOL[j] !== p.src && !SOL[j].comps.tower && blocks(Pj.mechanics.matrix, 'Pocisk', SOL[j].cat) && overlap(p, SOL[j])) dead = true;
        if (!dead && p.owner === 'player') for (j = 0; j < ents.length; j++) { var e = ents[j]; if (e.alive && e !== player && e.comps.health && overlap(p, e)) { damageEnt(e, p.dmg, 'pocisk'); dead = true; break; } }
        if (!dead && p.owner === 'enemy' && player && overlap(p, player)) { hurt(p.dmg, false, p.src, 'pocisk'); dead = true; }
        if (dead) proj.splice(i, 1);
      }
    }
    function burst(x, y, col) { if (opts.reduceMotion) return; for (var i = 0; i < 10; i++) { var a = Math.random() * 6.28, sp = 60 + Math.random() * 120; parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, l: 0.5, col: col }); } }
    function addScore(n) {
      if (!n) return;
      G.score += n;
      var bl = M.score && M.score.bonusLife;
      if (bl > 0) while (G.score >= G.nextBonus) { G.lives = Math.min(99, G.lives + 1); G.nextBonus += bl; sfx('life'); msg('Dodatkowe życie za ' + bl + ' pkt!'); log('info', 'Punktacja → Zdrowie: dodatkowe życie (próg ' + bl + ' pkt).'); }
    }
    function respawn() { player.x = G.cp.x; player.y = G.cp.y; player.vx = player.vy = 0; player.cs.started = false; player.cs.mv = null; if (player.comps.gridstep) { player.cs.gx = Math.round((player.x - player.ox) / T); player.cs.gy = Math.round((player.y - player.oy) / T); } if (player.comps.snake) snakeReset(player); if (player.comps.car) { player.cs.v = 0; player.cs.ang = { r: 0, d: Math.PI / 2, l: Math.PI, u: -Math.PI / 2 }[player.comps.car.start || 'r']; } if (player.comps.paddle) ents.forEach(function (b) { if (b.comps.ball) { b.cs.held = true; } }); centerCam(true); }
    function hurt(n, trap, src, why) {
      if (state !== 'play') return;
      if (G.inv_t > 0 && why !== 'upadek') return;
      G.hp -= n; sfx('hurt'); G.inv_t = (M.health && M.health.invuln) || 1;
      log('warn', 'Gracz traci ' + n + ' pkt zdrowia (' + (why || (src ? src.name : 'obrażenia')) + '). Zdrowie: ' + Math.max(0, G.hp) + '/' + maxHp + '.', src);
      if (G.hp <= 0) {
        G.lives--; log('warn', 'Gracz traci życie. Pozostało: ' + G.lives + '.');
        if (G.lives <= 0) { G.lives = 0; G.hp = 0; end(false, 'lives'); return; }
        G.hp = maxHp; msg('Tracisz życie! Zostało: ' + G.lives + '.');
        respawn(); return;
      }
      if (trap) respawn();
      else if (src && view === 'side') { player.vy = -260; player.vx = (player.x < src.x ? -1 : 1) * ((src.comps.damage && src.comps.damage.knock) || 4) * 50; }
    }
    function interact(e) {
      var p = player, cp = e.comps, keyE = pressed.act;
      if (cp.pickup) {
        var pk = cp.pickup; e.alive = false; addScore(pk.points || 0);
        if (pk.toInv) { var nm = pk.item || e.name; G.inv[nm] = (G.inv[nm] || 0) + 1; log('info', 'Ekwipunek: +1 „' + nm + '”.', e); }
        if (pk.heal) G.hp = Math.min(maxHp, G.hp + pk.heal);
        if (pk.life) G.lives = Math.min(99, G.lives + pk.life);
        if (pk.effect === 'speed') { G.speed_t = pk.effectTime || 5; msg('Przyspieszenie na ' + G.speed_t + ' s!'); }
        if (pk.effect === 'shield') { G.inv_t = pk.effectTime || 5; msg('Tarcza na ' + (pk.effectTime || 5) + ' s!'); }
        if (pk.effect === 'doublejump') { G.bonusJumps = (G.bonusJumps || 0) + 1; msg('Nowa umiejętność: podwójny skok! Skocz drugi raz w powietrzu.'); log('info', 'Umiejętność: +1 skok w powietrzu.', e); }
        if (pk.effect === 'maxhp') { maxHp++; G.hp = maxHp; msg('Masz więcej zdrowia!'); }
        if (p.comps.snake) snakeAte(p);
        sfx(pk.sound || 'collect'); burst(e.x + e.w / 2, e.y + e.h / 2, '#ffd23f');
        if (pk.msg) msg(pk.msg); else if (pk.toInv) msg('Masz: ' + (pk.item || e.name));
        log('info', 'Podniesiono „' + e.name + '”' + (pk.points ? ' (+' + pk.points + ' pkt)' : '') + '.', e);
        return;
      }
      if (cp.loot && !cp.health && !e.st.open) { e.st.open = true; sfx('door'); dropLoot(e, true); log('info', 'Otwarto skrzynię „' + e.name + '”.', e); }
      if (cp.damage) {
        if (view === 'side' && cp.stomp && p.vy > 0 && p.y + p.h - e.y < 18) {
          p.vy = -Math.sqrt(2 * grav((p.comps.platformer || {}).gravity) * ((cp.stomp.bounce || 2) * T)); damageEnt(e, cp.stomp.damage || 1, 'skok z góry'); return;
        }
        hurt(cp.damage.damage || 1, !!cp.damage.respawn, e);
      }
      if (cp.checkpoint && !e.st.on) { ents.forEach(function (o) { if (o.comps.checkpoint) o.st.on = false; }); e.st.on = true; G.cp = { x: e.x + e.w / 2 - p.w / 2, y: e.y + e.h - p.h }; sfx('hint'); msg(cp.checkpoint.msg || 'Punkt kontrolny'); log('info', 'Punkt kontrolny aktywowany.', e); }
      if (cp.lever && (cp.lever.trigger === 'touch' ? !e.touch.in : keyE)) toggleLever(e);
      if (cp.dialog && cp.dialog.trigger !== 'start' && !e.st.done && (cp.dialog.trigger === 'touch' ? !e.touch.in : keyE)) openDialog(e);
      if (cp.cardduel && !e.touch.in && !duelOn) startDuel(e);
      if (cp.goal && !e.touch.in) {
        if (cp.goal.action === 'goto' && sceneById(cp.goal.scene)) { log('info', 'Przejście do sceny „' + sceneById(cp.goal.scene).name + '”.', e); pendingScene = cp.goal.scene; }
        else { reached = true; log('info', 'Gracz dotarł do strefy wyjścia „' + e.name + '”.', e); if (!checkComplete(true)) msg(missingText()); }
      }
    }
    var pendingScene = null;
    function toggleLever(e) {
      var lv = e.comps.lever; if (lv.mode === 'once' && e.st.on) return;
      e.st.on = !e.st.on; var tag = lv.tag || 'A'; G.flags['sw:' + tag] = e.st.on; sfx('door');
      log('info', 'Przełącznik „' + e.name + '” → kanał ' + tag + ': ' + (e.st.on ? 'WŁ' : 'WYŁ') + '.', e);
      ents.forEach(function (d) { if (d.comps.door && d.comps.door.need === 'switch' && (d.comps.door.tag || 'A') === tag) { d.st.open = e.st.on; log('info', 'Drzwi „' + d.name + '” ' + (d.st.open ? 'otwarte' : 'zamknięte') + ' przez kanał ' + tag + '.', d); } });
      rebuildSolids();
    }
    function tryDoor(e) {
      var d = e.comps.door, ok = false, why = '';
      if (d.need === 'score') { ok = G.score >= (d.score || 1); why = 'Potrzebujesz ' + d.score + ' pkt (masz ' + G.score + ').'; }
      else if (d.need === 'item') { ok = (G.inv[d.item] || 0) > 0; why = 'Potrzebujesz: ' + d.item + '.'; if (ok && d.consume !== false) { G.inv[d.item]--; if (!G.inv[d.item]) delete G.inv[d.item]; } }
      else if (d.need === 'none') ok = true;
      else if (d.need === 'switch') { why = 'Te drzwi otwiera przełącznik (kanał ' + (d.tag || 'A') + ').'; }
      if (ok) { e.st.open = true; sfx('door'); msg('Otwarte!'); log('info', 'Drzwi „' + e.name + '” otwarte' + (d.need === 'item' ? ' (Ekwipunek → ' + d.item + ')' : '') + '.', e); rebuildSolids(); }
      else if (!e.touch.near) { msg(d.msg || why); sfx('hint'); log('info', 'Drzwi „' + e.name + '” zamknięte: ' + why, e); }
    }
    function varVal(n) { n = String(n || '').trim(); if (/^(punkty|wynik)$/i.test(n)) return G.score; return G.vars[n] || 0; }
    function testVar(expr) {
      expr = String(expr || '').trim(); if (!expr) return true;
      return expr.split(',').every(function (x) {
        x = x.trim(); if (!x) return true;
        if (x[0] === '!') return varVal(x.slice(1)) <= 0;
        var m = /^(.+?)\s*(>=|<=|=|>|<)\s*(-?\d+)$/.exec(x);
        if (!m) return varVal(x) > 0;
        var v = varVal(m[1]), n = +m[3];
        return m[2] === '>=' ? v >= n : m[2] === '<=' ? v <= n : m[2] === '>' ? v > n : m[2] === '<' ? v < n : v === n;
      });
    }
    function applySet(expr) {
      String(expr || '').split(',').forEach(function (x) {
        x = x.trim(); if (!x) return;
        var m = /^(.+?)\s*([+\-=])\s*(-?\d+)$/.exec(x), n = m ? m[1].trim() : x, cur = G.vars[n] || 0;
        if (/^(punkty|wynik)$/i.test(n)) { addScore(m ? (m[2] === '-' ? -(+m[3]) : +m[3]) : 1); return; }
        G.vars[n] = !m ? cur + 1 : m[2] === '=' ? +m[3] : m[2] === '+' ? cur + (+m[3]) : cur - (+m[3]);
        log('info', 'Pamięć: ' + n + ' = ' + G.vars[n] + '.');
      });
    }
    function subst(s) { return String(s).replace(/\{([^}]{1,30})\}/g, function (_, n) { return varVal(n); }); }
    function goTarget(sc) { if (sc === '__win') end(true); else if (sc === '__lose') end(false, 'choice'); else if (sceneById(sc)) pendingScene = sc; }
    function dlgShow() {
      var ln = dialog.lines[dialog.i], m = /^([^:]{1,24}):\s+(.+)$/.exec(ln), who = m ? m[1] : dialog.e.name, txt = m ? m[2] : ln;
      var last = dialog.i === dialog.lines.length - 1;
      if (ui.dialog) ui.dialog(who, txt, dialog.i + 1, dialog.lines.length, last && dialog.choices.length ? dialog.choices : null);
    }
    function openDialog(e) {
      var dc = e.comps.dialog, lines = String(dc.lines || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      lines = lines.filter(function (s) { var m = /^\[([^\]]{1,40})\]\s*/.exec(s); return !m || testVar(m[1]); }).map(function (s) { return subst(s.replace(/^\[[^\]]{1,40}\]\s*/, '')); }).filter(Boolean);
      if (!lines.length) { if (dc.endIf) goTarget(testVar(dc.endIf) ? dc.endYes : dc.endNo); return; }
      var ch = [['choiceA', 'sceneA', 'setA', 'needA'], ['choiceB', 'sceneB', 'setB', 'needB'], ['choiceC', 'sceneC', 'setC', 'needC']].filter(function (k4) { return dc[k4[0]] && String(dc[k4[0]]).trim() && testVar(dc[k4[3]]); }).map(function (k4) { return { text: subst(dc[k4[0]]), scene: dc[k4[1]], set: dc[k4[2]] }; });
      dialog = { e: e, lines: lines, i: 0, choices: ch }; if (dc.once) e.st.done = true;
      log('info', 'Rozmowa z „' + e.name + '”.', e);
      dlgShow();
    }
    function advanceDialog() {
      if (!dialog) return;
      if (dialog.i === dialog.lines.length - 1 && dialog.choices.length) return;
      dialog.i++;
      if (dialog.i >= dialog.lines.length) { var dce = dialog.e.comps.dialog; dialog = null; if (ui.dialog) ui.dialog(null); if (dce.endIf) { var ok = testVar(dce.endIf); log('info', 'Pamięć: warunek „' + dce.endIf + '” ' + (ok ? 'spełniony' : 'niespełniony') + '.'); goTarget(ok ? dce.endYes : dce.endNo); } }
      else dlgShow();
    }
    function choose(i) {
      if (!dialog || dialog.i !== dialog.lines.length - 1 || !dialog.choices[i]) return;
      var c = dialog.choices[i]; dialog = null; if (ui.dialog) ui.dialog(null); sfx('hint');
      log('info', 'Wybór: „' + c.text + '”.');
      if (c.set) applySet(c.set);
      goTarget(c.scene);
    }
    function startDuel(e) {
      duelOn = true; log('info', 'Pojedynek na karty z „' + e.name + '”.', e); sfx('door');
      var cd = e.comps.cardduel, decks = Pj.decks || [];
      function dk(id) { return decks.filter(function (d) { return d.id === id; })[0] || null; }
      var cfg = Object.assign({ name: e.name, sprite: e.r.sprite, psprite: player ? player.r.sprite : null }, cd);
      cfg.pdeck = expandDeck(dk(cd.playerDeck) || decks[0], Pj.cards); cfg.edeck = expandDeck(dk(cd.enemyDeck) || dk(cd.playerDeck) || decks[0], Pj.cards);
      var done = function (win) {
        duelOn = false;
        if (win) { e.alive = false; addScore(cfg.points || 0); burst(e.x + e.w / 2, e.y + e.h / 2, '#ffd23f'); sfx('win'); msg('Wygrałeś pojedynek z: ' + e.name + '!'); log('info', 'Wygrany pojedynek z „' + e.name + '”.', e); rebuildSolids(); }
        else { G.lives--; log('warn', 'Przegrany pojedynek. Życia: ' + G.lives + '.', e); if (G.lives <= 0) { G.lives = 0; end(false, 'lives'); return; } G.hp = maxHp; msg('Przegrany pojedynek – tracisz życie. Spróbuj jeszcze raz!'); respawn(); }
        e.touch.in = true;
      };
      if (ui.duel) ui.duel(cfg, done); else done(true);
    }
    function startClicker() {
      clickerOn = true; var ce = clickEnt; log('info', 'Gra klikana: „' + ce.name + '”.', ce);
      var ups = ents.filter(function (o) { return o.alive && o.comps.upgrade; }).map(function (o) { var u = o.comps.upgrade; return { id: o.id, name: o.name, sprite: o.r.sprite, kind: u.kind, bonus: +u.bonus || 1, cost: +u.cost || 10, growth: u.growth, max: u.max || 0 }; }).sort(function (x, y) { return x.cost - y.cost; });
      var cfg = Object.assign({ sprite: ce.r.sprite, name: ce.name }, ce.comps.clicker);
      ui.clicker(cfg, ups, function (win, total) {
        clickerOn = false; clickEnt = null; addScore(Math.floor(total || 0)); log('info', 'Gra klikana zakończona. Zebrano: ' + Math.floor(total || 0) + '.');
        if (win) completeScene(); else end(false, 'choice');
      });
    }
    function condState(cd) {
      switch (cd.type) {
        case 'reach': return reached;
        case 'item': return (G.inv[cd.item] || 0) > 0;
        case 'score': return G.score >= (cd.val || 1);
        case 'defeat': return !ents.some(function (e) { return e.alive && e.cat === 'Przeciwnik'; });
        case 'collect': return !ents.some(function (e) { return e.alive && e.comps.pickup && (e.comps.pickup.points > 0 || e.comps.pickup.toInv); });
        case 'survive': return G.sceneTime >= (cd.val || 30);
        case 'var': return varVal(cd.item) >= (cd.val || 1);
        case 'boxes': { var bx = ents.filter(function (o) { return o.alive && o.comps.pushable; }); return bx.length > 0 && bx.every(function (o) { return o.st.on; }); }
        case 'waves': { var spn = ents.filter(function (o) { return o.comps.spawner; }); return spn.length > 0 && spn.every(function (o) { return (o.comps.spawner.total || 0) > 0 && (o.cs.made || 0) >= o.comps.spawner.total; }) && !ents.some(function (o) { return o.alive && o.cat === 'Przeciwnik' && o.comps.health; }); }
        case 'laps': return G.lap >= (cd.val || 3);
        case 'bricks': return !ents.some(function (o) { return o.alive && o.comps.brick; });
      }
      return false;
    }
    function condText(cd) {
      return { reach: 'dotrzyj do wyjścia', item: 'zdobądź: ' + cd.item, score: 'zdobądź ' + cd.val + ' pkt', defeat: 'pokonaj wszystkich przeciwników', collect: 'zbierz wszystkie przedmioty', survive: 'przetrwaj ' + cd.val + ' s', boxes: 'wepchnij wszystkie skrzynie na pola', waves: 'przetrwaj wszystkie fale', laps: 'przejedź ' + (cd.val || 3) + ' okrążenia', bricks: 'rozbij wszystkie cegiełki', 'var': 'zapamiętaj: ' + cd.item + ' (' + (cd.val || 1) + ')' }[cd.type] || '';
    }
    function missingText() {
      var cm = scene.complete || {}; var miss = (cm.conds || []).filter(function (cd) { return cd.type !== 'reach' && !condState(cd); });
      return miss.length ? 'Jeszcze nie! ' + miss.map(condText).join(', ') + '.' : '';
    }
    function checkComplete(atGoal) {
      var cm = scene.complete || { mode: 'all', conds: [{ type: 'reach' }] }, conds = cm.conds || [];
      if (!conds.length) return false;
      var hasReach = conds.some(function (c2) { return c2.type === 'reach'; });
      var n = conds.filter(condState).length, ok;
      if (cm.mode === 'any') ok = n > 0; else if (cm.mode === 'count') ok = n >= Math.min(conds.length, cm.count || 1); else ok = n === conds.length;
      if (!ok) return false;
      if (hasReach && cm.mode === 'all' && !atGoal) return false;
      completeScene(); return true;
    }
    function completeScene() {
      var cm = scene.complete || {}, order = Pj.flow.order || [];
      log('info', 'Scena „' + scene.name + '” ukończona.');
      var nxt = cm.next || 'next';
      if (nxt === 'end') { end(true); return; }
      if (nxt !== 'next' && sceneById(nxt)) { pendingScene = nxt; return; }
      var i = order.indexOf(scene.id);
      if (i >= 0 && i < order.length - 1) pendingScene = order[i + 1]; else end(true);
    }
    function end(win, reason) {
      if (state === 'end') return; state = 'end'; sfx(win ? 'win' : 'lose');
      log(win ? 'info' : 'warn', win ? 'Wygrana! Wynik: ' + G.score + '.' : 'Porażka (' + (reason === 'time' ? 'koniec czasu' : reason === 'choice' ? 'wybór w rozmowie' : reason === 'race' ? 'rywal szybszy' : reason === 'base' ? 'baza zniszczona' : 'brak żyć') + ').');
      if (ui.onEnd) ui.onEnd({ win: win, reason: reason, score: G.score, time: G.elapsed, scene: scene.name });
    }

    function update(dt) {
      t += dt;
      if (state !== 'play' || paused) { pressed = {}; return; }
      if (duelOn || clickerOn) { pressed = {}; return; }
      if (clickEnt && !dialog && !startDlg && ui.clicker) { startClicker(); pressed = {}; return; }
      if (G.cd > 0) { var c0 = Math.ceil(G.cd); G.cd -= dt; var c1 = Math.ceil(G.cd); if (c1 !== c0 || G.cdShown == null) { G.cdShown = c1; msg(c1 > 0 ? String(c1) : 'START!'); sfx(c1 > 0 ? 'hint' : 'win'); } }
      if (startDlg && !dialog) { var sd = startDlg; startDlg = null; openDialog(sd); }
      if (dialog) { if (pressed.act || pressed.jump || pressed.enter) advanceDialog(); pressed = {}; return; }
      G.elapsed += dt; G.sceneTime += dt;
      if (G.inv_t > 0) G.inv_t -= dt; if (G.speed_t > 0) G.speed_t -= dt;
      if (M.timer && M.timer.on) { var before = G.time; G.time -= dt; if (M.timer.warn && before > M.timer.warn && G.time <= M.timer.warn) { msg('Zostało ' + M.timer.warn + ' s!'); log('warn', 'Ostrzeżenie: zostało ' + M.timer.warn + ' s.'); } if (G.time <= 0) { G.time = 0; end(false, 'time'); return; } }
      rebuildSolids();
      if (player) updatePlayer(dt);
      if (tdEnt) tdInput();
      for (var i = 0; i < ents.length; i++) { var e = ents[i]; if (e.alive && e !== player) updateNpc(e, dt); }
      rebuildSolids();
      updateProj(dt);
      updateDrops(dt);
      if (player && player.comps.car) { gateCheck(); racePlace(); }
      ents.forEach(function (o) { if (o.comps.pushable && o.alive) { var on = ents.some(function (pd) { return pd.alive && pd.comps.pad && Math.abs((pd.x + pd.w / 2) - (o.x + o.w / 2)) < 8 && Math.abs((pd.y + pd.h / 2) - (o.y + o.h / 2)) < 8; }); if (on && !o.st.on && !o.cs.mv) sfx('collect'); o.st.on = on && !o.cs.mv; } });
      ents.forEach(function (pd) { if (pd.comps.pad) pd.st.on = ents.some(function (o) { return o.alive && o.comps.pushable && o.st.on && Math.abs((pd.x + pd.w / 2) - (o.x + o.w / 2)) < 8 && Math.abs((pd.y + pd.h / 2) - (o.y + o.h / 2)) < 8; }); });
      if (player && state === 'play') {
        var hr = { x: player.x + 2, y: player.y + 2, w: player.w - 4, h: player.h - 4 };
        for (i = 0; i < ents.length && state === 'play'; i++) {
          e = ents[i]; if (e === player || !e.alive || e.layer === 'tlo' || e.layer === 'efekty') continue;
          if (e.comps.door && !e.st.open) { var ex = { x: e.x - 4, y: e.y - 4, w: e.w + 8, h: e.h + 8 }, nr = overlap(player, ex); if (nr && e.comps.door.need !== 'switch') tryDoor(e); else if (nr && !e.touch.near) tryDoor(e); e.touch.near = nr; continue; }
          var near = e.comps.lever || e.comps.cardduel || (e.comps.dialog && e.comps.dialog.trigger === 'key');
          var zone = near ? { x: e.x - T * 0.6, y: e.y - T * 0.6, w: e.w + T * 1.2, h: e.h + T * 1.2 } : e;
          var touching = overlap(hr, zone);
          if (touching) { interact(e); e.touch.in = true; if (near && !e.touch.hinted && ui.hintKey) { ui.hintKey(e.comps.cardduel ? 'Pojedynek!' : 'E – ' + (e.comps.lever ? 'użyj' : 'rozmawiaj')); e.touch.hinted = true; } }
          else { e.touch.in = false; e.touch.hinted = false; }
        }
      }
      if (state === 'play' && !pendingScene) checkComplete(false);
      if (pendingScene && state === 'play') { var ps = pendingScene; pendingScene = null; var keepHp = G.hp; loadScene(ps); G.hp = keepHp; }
      for (i = parts.length - 1; i >= 0; i--) { var p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.l -= dt; if (p.l <= 0) parts.splice(i, 1); }
      if (player) centerCam(false);
      pressed = {}; tapAt = null;
    }
    var paused = false, selected = null;
    function render() {
      if (!scene) return;
      var tt = opts.reduceMotion ? 0 : t;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.fillStyle = '#141a30'; c.fillRect(0, 0, VW, VH);
      var bg = scene.bg || {}, par = bg.parallax == null ? 0.3 : bg.parallax;
      var bw = VW + Math.max(0, sceneW() - VW) * par, bh = VH + Math.max(0, sceneH() - VH) * par;
      c.save(); c.translate(-Math.max(0, cam.x) * par, -Math.max(0, cam.y) * par);
      if (sceneW() < VW || sceneH() < VH) { c.restore(); c.save(); c.translate(-cam.x, -cam.y); bw = sceneW(); bh = sceneH(); }
      drawBackground(c, bg.theme || 'przyroda', bw, bh, tt, bg.color);
      c.restore();
      c.save(); c.translate(-Math.round(cam.x), -Math.round(cam.y));
      for (var i = 0; i < ents.length; i++) {
        var e = ents[i]; if (!e.alive || e.layer === 'kolizje' || (e.r.sprite && e.r.sprite.type === 'block')) continue;
        if (e.x + e.w < cam.x - 2 * T || e.x > cam.x + VW + 2 * T || e.y > cam.y + VH + 2 * T || e.y + e.h < cam.y - 2 * T) continue;
        if (e === player && G.inv_t > 0 && state === 'play') c.globalAlpha = opts.reduceMotion ? 0.55 : (Math.floor(t * 12) % 2 ? 0.35 : 0.9);
        if (e !== player && e.inv > 0 && !opts.reduceMotion) c.globalAlpha = 0.5;
        var o = e.r.sprite || {};
        if (e === player && e.comps.snake && e.cs.body) { var scol = e.comps.snake.color || '#7ed957'; e.cs.body.forEach(function (b, bi) { c.fillStyle = bi % 2 ? scol : shade(scol, 25); c.strokeStyle = INK; c.lineWidth = 2; var pad = 4 + Math.min(6, bi * 0.3); c.beginPath(); if (c.roundRect) c.roundRect(b[0] * T + pad, b[1] * T + pad, T - pad * 2, T - pad * 2, 8); else c.rect(b[0] * T + pad, b[1] * T + pad, T - pad * 2, T - pad * 2); c.fill(); c.stroke(); }); }
        if (e.cs.ang != null && (e.comps.car || (e.comps.pathfollow && e.comps.pathfollow.loop))) { c.save(); c.translate(e.x + e.w / 2, e.y + e.h / 2); c.rotate(e.cs.ang); drawSprite2(c, { type: o.type, v: o.v, color: o.color, img: o.img }, -e.sw / 2, -e.sh / 2, e.sw, e.sh, tt, { dir: 1 }); c.restore(); c.globalAlpha = 1; continue; }
        drawSprite2(c, { type: o.type, v: o.v, color: o.color, img: o.img, b: { door: e.comps.door } }, e.x - e.ox, e.y - e.oy, e.sw, e.sh, tt + i * 0.37, { lvl: e.lvl, crack: e.comps.brick && e.cs.hp < (e.comps.brick.hp || 1), dir: e.dir, open: e.st.open, on: e.st.on, moving: e.moving && !opts.reduceMotion, anim: e.anim || (e.moving ? 'walk' : 'idle') });
        c.globalAlpha = 1;
        if (opts.debug && e === selected) { c.strokeStyle = '#ffbf00'; c.lineWidth = 2; c.setLineDash([5, 4]); c.strokeRect(e.x, e.y, e.w, e.h); c.setLineDash([]); }
        if (opts.debug && opts.showHit) { c.strokeStyle = e.solid ? 'rgba(107,79,160,.9)' : 'rgba(18,128,106,.9)'; c.lineWidth = 1; c.strokeRect(e.x + .5, e.y + .5, e.w - 1, e.h - 1); }
      }
      for (i = 0; i < ents.length; i++) {
        var se = ents[i]; if (!se.alive) continue;
        if (se.cs.slash > 0 && se.cs.sbox) { var b = se.cs.sbox; c.save(); c.globalAlpha = Math.min(1, se.cs.slash * 6); c.strokeStyle = se === player ? '#ffffff' : '#ff5a5f'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, 0, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.restore(); }
        if (se.cs.wind > 0) { c.save(); c.fillStyle = '#ff3b3b'; c.strokeStyle = '#1d2440'; c.lineWidth = 2; c.beginPath(); c.arc(se.x + se.w / 2, se.y - 14, 11, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.font = 'bold 16px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('!', se.x + se.w / 2, se.y - 8); c.restore(); }
      }
      for (i = 0; i < drops.length; i++) { var dr = drops[i], bob = opts.reduceMotion ? 0 : Math.sin(t * 4 + i) * 3; c.save(); c.globalAlpha = 0.28; c.fillStyle = dr.wpn.color; c.fillRect(dr.x + dr.w / 2 - 5, dr.y - T * 1.2, 10, T * 1.2 + dr.h / 2); c.restore(); drawSprite2(c, { type: 'gem', v: 'blue', color: dr.wpn.color }, dr.x, dr.y + bob, dr.w, dr.h, 0, {}); }
      if (tdEnt && state === 'play') { var spots = tdSpots(), sel = spots[G.tdSel]; if (sel) { c.save(); c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.setLineDash([6, 4]); c.strokeRect(sel.x - 2, sel.y - 2, sel.w + 4, sel.h + 4); c.setLineDash([]); var tdef = Pj.objects[sel.comps.buildspot.tower], tr = tdef ? resolveDef(Pj, sel.comps.buildspot.tower) : null, tcp = tr ? activeComps(tr).filter(function (q) { return q.type === 'tower'; })[0] : null; if (tcp) { c.beginPath(); c.arc(sel.x + sel.w / 2, sel.y + sel.h / 2, (tcp.p.range || 3) * T, 0, 7); c.fillStyle = 'rgba(255,210,63,.1)'; c.fill(); c.strokeStyle = 'rgba(255,210,63,.6)'; c.lineWidth = 2; c.stroke(); } c.fillStyle = '#1d2440'; c.font = 'bold 13px system-ui,sans-serif'; c.textAlign = 'center'; var lbl = (sel.comps.buildspot.cost || 0) + ' zł'; c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(sel.x + sel.w / 2 - 22, sel.y - 20, 44, 17); c.fillStyle = '#1d2440'; c.fillText(lbl, sel.x + sel.w / 2, sel.y - 7); c.restore(); } }
      for (i = 0; i < proj.length; i++) { var p = proj[i]; drawSprite2(c, p.o, p.x - 8, p.y - 8, 30, 30, 0, { dir: p.dir }); }
      for (i = 0; i < parts.length; i++) { var q = parts[i]; c.globalAlpha = Math.max(0, q.l * 2); c.fillStyle = q.col; c.fillRect(q.x - 3, q.y - 3, 6, 6); }
      c.globalAlpha = 1;
      if (player && player.comps.gridstep && player.comps.gridstep.vision > 0) { var vr = player.comps.gridstep.vision * T, pcx = player.x + player.w / 2, pcy = player.y + player.h / 2, gr = c.createRadialGradient(pcx, pcy, vr * 0.35, pcx, pcy, vr); gr.addColorStop(0, 'rgba(8,6,18,0)'); gr.addColorStop(1, 'rgba(8,6,18,.94)'); c.fillStyle = gr; c.fillRect(cam.x - 4, cam.y - 4, VW + 8, VH + 8); }
      c.restore();
    }
    var raf = 0, last = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = last ? Math.min(0.04, (now - last) / 1000) : 0.016; last = now;
      update(dt); render();
      if (ui.hud && G && scene) {
        var boss = null; ents.forEach(function (o) { if (!boss && o.alive && o.comps.health && o.comps.health.boss && (!player || dist(o, player).d < Math.max(VW, VH))) boss = { name: o.name, hp: Math.max(0, o.hp), max: o.comps.health.hp || 1 }; });
        ui.hud(G, maxHp, scene, state, paused, boss);
      }
    }
    function startAt(sceneId) { newGame(); loadScene(sceneId || Pj.flow.start || (Pj.scenes[0] && Pj.scenes[0].id)); }
    startAt(opts.startScene);
    raf = requestAnimationFrame(frame);
    return {
      play: function () { if (!player && !startDlg && !clickEnt && !tdEnt) { log('error', 'Nie można uruchomić: brak postaci gracza w scenie.'); return false; } state = 'play'; paused = false; return true; },
      press: function (k) { pressed[k] = true; },
      pause: function (v) { paused = v == null ? !paused : !!v; return paused; },
      paused: function () { return paused; },
      state: function () { return state; },
      dialogOpen: function () { return !!dialog; },
      restartScene: function () { var id = scene.id; var sc = G.score; loadScene(id); state = 'play'; paused = false; },
      restart: function (id) { startAt(id); state = 'title'; paused = false; },
      stop: function () { cancelAnimationFrame(raf); },
      hasPlayer: function () { return !!player || !!startDlg || !!dialog || !!clickEnt || clickerOn || !!tdEnt; },
      tap: function (px, py) { tapAt = { x: px + cam.x, y: py + cam.y }; },
      aim: function (px) { aimX = px + cam.x; },
      wantsTap: function () { return state === 'play' && !paused && (!!tdEnt || !!(player && player.comps.paddle)); },
      mode: function () { return tdEnt ? 'td' : !player ? '' : player.comps.gridstep ? 'grid' : player.comps.car ? 'car' : player.comps.snake ? 'snake' : player.comps.paddle ? 'paddle' : (player.comps.shooter && player.comps.shooter.mode === 'hold') ? 'loot' : ''; },
      tapJump: function () { return !!(player && player.driver === 'flappy' && state === 'play' && !paused); },
      vars: function () { return G ? G.vars : {}; },
      dbg: function () { return { player: player, ents: ents, G: G, drops: drops, T: T }; },
      choose: choose,
      duelOn: function () { return duelOn; },
      sceneName: function () { return scene ? scene.name : ''; },
      size: { w: VW, h: VH },
      pick: function (px, py) {
        var x = px + cam.x, y = py + cam.y, best = null;
        ents.forEach(function (e) { if (e.alive && x >= e.x - 4 && x <= e.x + e.w + 4 && y >= e.y - 4 && y <= e.y + e.h + 4 && e.layer !== 'tlo') best = e; });
        selected = best; return best ? best.id : null;
      },
      inspect: function () {
        var e = selected; if (!e) return null;
        return { id: e.id, name: e.name, alive: e.alive, cat: e.cat, x: (e.x / T).toFixed(2), y: (e.y / T).toFixed(2), vx: (e.vx / T).toFixed(2), vy: (e.vy / T).toFixed(2), hp: e === player ? G.hp + '/' + maxHp : (e.comps.health ? Math.max(0, e.hp) + '/' + e.comps.health.hp : '—'), state: e.ai ? (AI_STATES[e.ai.s] || e.ai.s) + ' (' + e.ai.t.toFixed(1) + ' s)' : (e.st.open ? 'otwarte' : e.st.on ? 'włączony' : '—'), driver: e.driver ? COMP[e.driver].name : '—', comps: e.list.map(function (cp) { return COMP[cp.type].name; }), ground: e.ground ? 'tak' : 'nie' };
      },
      game: function () { return G; }
    };
  }
