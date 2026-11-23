/* ---------------- validation ---------------- */
function validateProject() {
  var out = [], view = P.settings.view;
  function add(lvl, msg, where) { out.push({ lvl: lvl, msg: msg, where: where || null }); }
  var itemSources = {}, levers = {}, usedDefs = {}, usedDecks = {};
  P.scenes.forEach(function (sc) { sc.inst.forEach(function (i) { usedDefs[i.obj] = 1; }); });
  Object.keys(P.objects).forEach(function (id) {
    var r = R(id); if (!r) return;
    CGM.activeComps(r).forEach(function (c) { if (c.type === 'pickup' && c.p.toInv) itemSources[c.p.item || r.name] = (itemSources[c.p.item || r.name] || []).concat(id); if (c.type === 'lever') levers[c.p.tag || 'A'] = true; });
  });
  if (!P.scenes.length) add('error', 'Gra nie ma jeszcze żadnej planszy.', { route: 'przebieg' });
  if (!sceneById(P.flow.start)) add('error', 'Nie wybrano planszy, od której zaczyna się gra.', { route: 'przebieg' });
  P.scenes.forEach(function (sc) {
    var W = { route: 'scena', scene: sc.id };
    var players = [], enemies = 0, pts = 0, goals = 0, clickers = 0, upgrades = 0;
    sc.inst.forEach(function (i) {
      var d = P.objects[i.obj];
      if (!d) { add('error', 'Scena „' + sc.name + '”: instancja odwołuje się do usuniętego obiektu.', { route: 'scena', scene: sc.id, inst: i.id }); return; }
      var r = RI(i);
      if (i.x < 0 || i.y < 0 || i.x >= sc.cols || i.y >= sc.rows) add('error', 'Scena „' + sc.name + '”: „' + d.name + '” leży poza sceną.', { route: 'scena', scene: sc.id, inst: i.id });
      var ac = CGM.activeComps(r), types = ac.map(function (c) { return c.type; });
      if (['platformer', 'topdown', 'flappy', 'gridstep', 'car', 'snake', 'paddle'].some(function (q) { return types.indexOf(q) >= 0; })) players.push(i);
      if (types.indexOf('td') >= 0) clickers++;
      ac.forEach(function (c) { if (c.type === 'buildspot' && !P.objects[c.p.tower]) add('error', '„' + d.name + '”: Miejsce na wieżę nie ma wybranej wieży.', { route: 'zachowania', def: i.obj }); });
      if (types.indexOf('clicker') >= 0) clickers++; if (types.indexOf('upgrade') >= 0) upgrades++;
      ac.forEach(function (c) { if (c.type === 'cardduel') ['playerDeck', 'enemyDeck'].forEach(function (k) { if (c.p[k] && !(P.decks || []).some(function (dd) { return dd.id === c.p[k]; })) add('error', '„' + d.name + '”: pojedynek używa usuniętej talii. Wybierz talię w zachowaniu Pojedynek na karty.', { route: 'zachowania', def: i.obj }); else if (c.p[k]) usedDecks[c.p[k]] = 1; }); });
      if (r.body.cat === 'Przeciwnik' && types.indexOf('dialog') < 0) enemies++;
      ac.forEach(function (c) { if (c.type === 'goal' && c.p.action === 'goto' && !sceneById(c.p.scene)) add('error', 'Plansza „' + sc.name + '”: portal „' + d.name + '” nie prowadzi do żadnej planszy.', { route: 'scena', scene: sc.id, inst: i.id }); });
      ac.forEach(function (c) { if (c.type === 'dialog') [['choiceA', 'sceneA'], ['choiceB', 'sceneB'], ['choiceC', 'sceneC']].forEach(function (k) { if (c.p[k[0]] && c.p[k[1]] && c.p[k[1]] !== '__win' && c.p[k[1]] !== '__lose' && !sceneById(c.p[k[1]])) add('error', 'Plansza „' + sc.name + '”: wybór „' + c.p[k[0]] + '” w rozmowie nie prowadzi do żadnej planszy.', { route: 'scena', scene: sc.id, inst: i.id }); }); });
      ac.forEach(function (c) { if (c.type === 'pickup') pts += c.p.points || 0; if (c.type === 'health') pts += c.p.points || 0; if (c.type === 'goal' && c.p.action !== 'goto') goals++; });
    });
    var startD = sc.inst.some(function (i) { var r0 = RI(i); return r0 && CGM.activeComps(r0).some(function (c) { return c.type === 'dialog' && c.p.trigger === 'start'; }); });
    var gotoGoal = sc.inst.some(function (i) { var r0 = RI(i); return r0 && CGM.activeComps(r0).some(function (c) { return c.type === 'goal' && c.p.action === 'goto'; }); });
    if (upgrades && !clickers) add('warn', 'Na planszy „' + sc.name + '” są ulepszenia sklepu, ale nie ma obiektu z komponentem Gra klikana.', W);
    if (!players.length && !startD && !clickers) add('error', 'Na planszy „' + sc.name + '” brakuje bohatera. Postaw postać z grupy „Postać grywalna”.', W);
    if (players.length > 1) add('warn', 'Scena „' + sc.name + '” ma ' + players.length + ' postacie gracza. Sterowana będzie tylko pierwsza.', W);
    var cm = sc.complete || {}, conds = cm.conds || [];
    var W2 = { route: 'przebieg', scene: sc.id };
    if (!conds.length && !startD && !gotoGoal && !clickers) add('warn', 'Scena „' + sc.name + '” nie ma celu – nie da się jej ukończyć (chyba że przez portal).', W2);
    conds.forEach(function (cd) {
      if (cd.type === 'var' && !String(cd.item || '').trim()) add('error', 'Scena „' + sc.name + '”: warunek „Pamięć gry” nie ma wpisanej nazwy.', W2);
      if (cd.type === 'reach' && !goals) add('error', 'Scena „' + sc.name + '”: warunek „Dotarcie do celu” wymaga obiektu ze Strefą wyjścia (działanie: Ukończ scenę).', W2);
      if (cd.type === 'item' && !itemSources[cd.item]) add('error', 'Scena „' + sc.name + '”: warunek wymaga przedmiotu „' + cd.item + '”, ale żaden obiekt go nie daje.', W2);
      var endless = sc.inst.some(function (i) { var r0 = RI(i); return r0 && CGM.activeComps(r0).some(function (c) { return (c.type === 'snake' && c.p.food) || c.type === 'spawner' || c.type === 'td'; }); });
      if (cd.type === 'score' && pts < (cd.val || 0) && cm.mode !== 'any' && !endless) add('warn', 'Scena „' + sc.name + '”: do ukończenia trzeba ' + cd.val + ' pkt, a w scenie da się zdobyć ok. ' + pts + ' pkt.', W2);
      if (cd.type === 'defeat' && !enemies) add('warn', 'Scena „' + sc.name + '”: warunek „Pokonanie przeciwników”, ale w scenie nie ma przeciwników.', W2);
    });
    if (cm.next && cm.next !== 'next' && cm.next !== 'end' && !sceneById(cm.next)) add('error', 'Scena „' + sc.name + '”: przejście prowadzi do usuniętej sceny.', W2);
    if (players.length && (sc.cols > P.settings.viewW || sc.rows > P.settings.viewH)) {
      var pr = RI(players[0]); if (!CGM.activeComps(pr).some(function (c) { return c.type === 'camera'; })) add('warn', 'Scena „' + sc.name + '” jest większa niż ekran, a postać gracza nie ma komponentu Podążanie kamery.', { route: 'zachowania', def: players[0].obj });
    }
    if (P.flow.order.indexOf(sc.id) < 0) add('info', 'Scena „' + sc.name + '” nie jest w kolejności gry – dostępna tylko przez portal.', W2);
  });
  Object.keys(usedDecks).forEach(function (k) { var dk = (P.decks || []).filter(function (x) { return x.id === k; })[0]; if (!dk) return; var n = Object.keys(dk.cards || {}).reduce(function (s, c) { return s + ((P.cards || []).some(function (q) { return q.id === c; }) ? dk.cards[c] : 0); }, 0); if (n < 6) add('warn', 'Talia „' + dk.name + '” ma tylko ' + n + ' kart. W pojedynku zostanie użyta talia startowa – dodaj co najmniej 6 kart.', { route: 'karty' }); });
  Object.keys(P.objects).forEach(function (id) {
    var d = P.objects[id], r = R(id); if (!r) return;
    var W = { route: 'zachowania', def: id };
    if (d.base && !P.objects[d.base]) add('error', 'Obiekt „' + d.name + '” jest wariantem usuniętego obiektu bazowego.', { route: 'obiekty', def: id });
    if (!usedDefs[id]) return;
    var ac = CGM.activeComps(r), types = ac.map(function (c) { return c.type; });
    ac.forEach(function (c) {
      var C = COMP[c.type], rq = C.req || {};
      if (rq.body && r.body.type !== rq.body) add('error', '„' + d.name + '”: komponent ' + C.name + ' wymaga typu fizyki „' + ({ dynamic: 'Dynamiczny', kinematic: 'Kinetyczny', static: 'Statyczny' })[rq.body] + '”.', { route: 'obiekty', def: id });
      if (rq.solid && !r.body.solid) add('error', '„' + d.name + '”: komponent ' + C.name + ' wymaga, aby obiekt blokował ruch.', { route: 'obiekty', def: id });
      if (rq.comp && types.indexOf(rq.comp) < 0) add('error', '„' + d.name + '”: komponent ' + C.name + ' wymaga komponentu ' + COMP[rq.comp].name + '.', W);
      (C.conflicts || []).forEach(function (cf) { if (types.indexOf(cf) >= 0 && c.type < cf) add('error', '„' + d.name + '”: ' + C.name + ' i ' + COMP[cf].name + ' nie mogą działać jednocześnie.', W); });
      if (view === 'top' && ['platformer', 'gravity', 'stomp', 'spring'].indexOf(c.type) >= 0) add('warn', '„' + d.name + '”: ' + C.name + ' nie działa w grze z widokiem z góry.', W);
      if (view === 'side' && c.type === 'topdown') add('warn', '„' + d.name + '”: Ruch top-down w grze z widokiem z boku – postać nie będzie skakać.', W);
      if (c.type === 'door' && c.p.need === 'item' && !itemSources[c.p.item]) add('error', '„' + d.name + '”: drzwi wymagają przedmiotu „' + c.p.item + '”, ale żaden obiekt nie dodaje go do ekwipunku.', W);
      if (c.type === 'door' && c.p.need === 'switch' && !levers[c.p.tag || 'A']) add('error', '„' + d.name + '”: drzwi czekają na sygnał z kanału „' + (c.p.tag || 'A') + '”, ale nie ma przełącznika z tym kanałem.', W);
      if (c.type === 'door' && c.p.need === 'score' && P.mechanics.score.on === false) add('error', '„' + d.name + '”: drzwi za punkty wymagają włączonej mechaniki Punktacja.', { route: 'mechaniki' });
      if (c.type === 'spawner' && !P.objects[c.p.obj]) add('error', '„' + d.name + '”: Fala przeciwników nie ma wybranego obiektu do tworzenia.', W);
      if (c.type === 'health' && c.p.drop && !P.objects[c.p.drop]) add('warn', '„' + d.name + '”: po pokonaniu ma zostawić usunięty obiekt.', W);

      if (c.type === 'pickup' && c.p.toInv && P.mechanics.inventory.on === false) add('warn', '„' + d.name + '”: przedmiot trafia do ekwipunku, ale mechanika Ekwipunek jest wyłączona.', { route: 'mechaniki' });
      if (c.type === 'ai') aiIssues(c.p).forEach(function (m) { add(m[0], '„' + d.name + '” – Stany i przejścia: ' + m[1], W); });
      if (c.from && c.from.uc) { var uc = LIB.ucomps.filter(function (u) { return u.id === c.from.uc; })[0]; if (uc && uc.version > c.from.ver && c.from.skip !== uc.version) add('info', '„' + d.name + '”: dostępna nowsza wersja komponentu użytkownika „' + uc.name + '” (v' + uc.version + ').', W); }
    });
    var movers = ac.filter(function (c) { return COMP[c.type].group === 'ruch'; });
    if (movers.length > 1) add('warn', '„' + d.name + '”: ' + movers.length + ' komponenty sterują ruchem (' + movers.map(function (c) { return COMP[c.type].name; }).join(', ') + '). Działa ten z najwyższym priorytetem.', W);
    if (r.sprite && r.sprite.img && !P.assets[r.sprite.img]) add('error', '„' + d.name + '”: brakuje zasobu graficznego.', { route: 'obiekty', def: id });
    ac.forEach(function (c) { if (c.type === 'pickup' && c.p.sound && /^a/.test(c.p.sound) && c.p.sound.indexOf('as') === 0 && !P.assets[c.p.sound]) add('error', '„' + d.name + '”: brakuje zasobu dźwiękowego.', W); });
  });
  var seen = {};
  Object.keys(P.assets).forEach(function (k) {
    var a = P.assets[k], h = a.size + ':' + (a.data || '').slice(-40);
    if (seen[h]) add('tip', 'Zasoby „' + a.name + '” i „' + P.assets[seen[h]].name + '” wyglądają na duplikaty.', { route: 'zasoby', asset: k }); else seen[h] = k;
    if (a.type === 'image' && (a.w > 1024 || a.h > 1024)) add('tip', 'Obraz „' + a.name + '” (' + a.w + '×' + a.h + ') jest większy niż zalecane 1024 px.', { route: 'zasoby', asset: k });
  });
  var anyDamage = Object.keys(P.objects).some(function (id) { return CGM.activeComps(R(id)).some(function (c) { return c.type === 'damage'; }); });
  if (!anyDamage && !P.mechanics.timer.on) add('tip', 'Gra nie ma warunku porażki: brak obiektów zadających obrażenia i limitu czasu.', { route: 'mechaniki' });
  return out;
}
function aiIssues(p) {
  var res = [], rows = p.rows || [], states = {};
  if (!p.init || !CGM.AI_STATES[p.init]) res.push(['error', 'nie wskazano stanu początkowego.']);
  rows.forEach(function (r) { if (r.from !== 'any') states[r.from] = 1; states[r.to] = 1; });
  var reach = {}; reach[p.init] = 1; var changed = true;
  while (changed) { changed = false; rows.forEach(function (r) { if ((reach[r.from] || r.from === 'any') && !reach[r.to]) { reach[r.to] = 1; changed = true; } }); }
  Object.keys(states).forEach(function (s) { if (!reach[s]) res.push(['warn', 'stan „' + (CGM.AI_STATES[s] || s) + '” jest nieosiągalny ze stanu początkowego.']); });
  Object.keys(reach).forEach(function (s) { if (!rows.some(function (r) { return r.from === s || r.from === 'any'; }) && s !== 'idle') res.push(['info', 'ze stanu „' + (CGM.AI_STATES[s] || s) + '” nie ma wyjścia.']); });
  var keyset = {};
  rows.forEach(function (r) { var k = r.from + '|' + r.prio; if (keyset[k] && keyset[k] !== r.to) res.push(['warn', 'dwa przejścia ze stanu „' + (CGM.AI_STATES[r.from] || 'Dowolny') + '” mają ten sam priorytet i różne cele – ustaw różne priorytety.']); keyset[k] = keyset[k] || r.to; });
  rows.forEach(function (r) { if (r.from === r.to) res.push(['warn', 'przejście „' + (CGM.AI_STATES[r.from] || r.from) + '” → ten sam stan nic nie zmienia.']); });
  return res;
}
var DIAG = [], diagT = 0;
function scheduleDiag() { clearTimeout(diagT); diagT = setTimeout(renderDiag, 350); }
function renderDiag() {
  var el = $('#diag'); if (!P || !el || !MODULE_ROUTES[route()]) { if (el) el.hidden = true; return; }
  DIAG = validateProject();
  var cnt = { error: 0, warn: 0, info: 0, tip: 0 }; DIAG.forEach(function (d) { cnt[d.lvl]++; });
  el.hidden = false;
  el.innerHTML = '<div class="diag-bar"><button class="tg" data-act="diagT" aria-expanded="' + !!SET.diagOpen + '">' + (SET.diagOpen ? I.down : I.up) + 'Sprawdzacz gry</button>' +
    (cnt.error + cnt.warn === 0 ? '<span class="lv info">' + I.check + 'Wszystko gra!</span>' : '<span class="lv error">' + I.err + cnt.error + ' do naprawy</span><span class="lv warn">' + I.alert + cnt.warn + ' ' + plural(cnt.warn, 'uwaga', 'uwagi', 'uwag') + '</span>') + '<span class="lv info">' + I.info + cnt.info + '</span><span class="lv tip">' + I.bulb + cnt.tip + '</span><span class="grow"></span><span class="xs muted" id="savedst"></span></div>' +
    (SET.diagOpen ? '<div class="diag-list">' + (DIAG.length ? DIAG.map(function (d, i) { return '<div class="dg">' + lvChip(d.lvl) + '<span class="grow">' + esc(d.msg) + '</span>' + (d.where ? '<button class="btn sm" data-act="diagGo" data-i="' + i + '">Pokaż</button>' : '') + '</div>'; }).join('') : '<div class="dg">' + lvChip('info') + '<span>Wszystko gra! Nic nie trzeba naprawiać.</span></div>') + '</div>' : '');
}
function goWhere(w) {
  if (!w) return;
  if (w.scene) SE.sceneId = w.scene;
  if (w.inst) SE.sel = [w.inst];
  if (w.def) { OS.def = w.def; BS.def = w.def; }
  if (w.asset) AS.sel = w.asset;
  if (w.scene && w.route === 'przebieg') GF.scene = w.scene;
  if (route() === w.route) render(); else go(w.route);
}
