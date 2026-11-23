/* ================= GAME FLOW ================= */
var GF = { scene: null };
var CONDS = { reach: 'Dotarcie do celu', item: 'Zdobycie przedmiotu', score: 'Osiągnięcie wyniku', defeat: 'Pokonanie przeciwników', collect: 'Zebranie wszystkich przedmiotów', survive: 'Przetrwanie (czas)', 'var': 'Pamięć gry (zapamiętany wybór)', boxes: 'Skrzynie na polach (łamigłówka)', waves: 'Przetrwanie wszystkich fal (Tower Defense)', laps: 'Okrążenia (wyścig)', bricks: 'Rozbicie wszystkich cegiełek' };
ROUTES.przebieg = function (v) {
  v.className = 'full';
  if (!sceneById(GF.scene)) GF.scene = P.flow.start || (P.scenes[0] && P.scenes[0].id);
  var F = P.flow, order = F.order;
  var orderList = order.map(sceneById).filter(Boolean).concat(P.scenes.filter(function (s) { return order.indexOf(s.id) < 0; }));
  v.innerHTML = '<div class="studio two"><aside class="pane" aria-label="Sceny"><div class="row"><h3 class="grow" style="font-size:1.1rem">Poziomy</h3><button class="btn sm pri" data-act="gfAdd">' + I.plus + 'Dodaj</button></div><ol class="olist">' +
    orderList.map(function (s, i) { var inOrder = order.indexOf(s.id) >= 0; return '<li class="row" style="flex-wrap:nowrap;gap:4px"><button class="orow" data-act="gfPick" data-id="' + s.id + '" aria-current="' + (GF.scene === s.id) + '"><span class="meta"><b>' + (inOrder ? (order.indexOf(s.id) + 1) + '. ' : '') + esc(s.name) + '</b><small>' + (s.id === F.start ? 'Scena startowa · ' : '') + (inOrder ? '' : 'poza kolejnością · ') + s.cols + '×' + s.rows + '</small></span></button>' + (inOrder ? '<button class="icobtn" data-gfmv="' + s.id + ':-1" aria-label="Przesuń wyżej">' + I.up + '</button><button class="icobtn" data-gfmv="' + s.id + ':1" aria-label="Przesuń niżej">' + I.down + '</button>' : '') + '</li>'; }).join('') + '</ol>' +
    '<div class="soft"><b class="small">Ekran tytułowy</b><label class="sw"><input type="checkbox" id="gf-title"' + (F.title !== false ? ' checked' : '') + '>Pokaż przed grą</label><label class="f" for="gf-tt">Tytuł<input class="inp" id="gf-tt" maxlength="60" value="' + esc(F.titleText || '') + '"></label><label class="f" for="gf-st">Podtytuł<input class="inp" id="gf-st" maxlength="140" value="' + esc(F.subtitle || '') + '"></label></div>' +
    '<div class="soft"><b class="small">Ekrany końcowe</b><label class="f" for="gf-win">Zwycięstwo<input class="inp" id="gf-win" maxlength="140" value="' + esc(F.winMsg || '') + '"></label><label class="f" for="gf-lose">Porażka<input class="inp" id="gf-lose" maxlength="140" value="' + esc(F.loseMsg || '') + '"></label><p class="xs muted">Porażka: utrata wszystkich żyć' + (P.mechanics.timer.on ? ' lub upływ czasu' : '') + '. Pauza: P / Esc.</p></div></aside><div class="split" data-side="l"></div><section class="pane scroll" id="gf-main"></section></div>';
  bindSplits(v); gfMain();
  v.oninput = function (e) { var t = e.target, m = { 'gf-tt': 'titleText', 'gf-st': 'subtitle', 'gf-win': 'winMsg', 'gf-lose': 'loseMsg' }; if (m[t.id]) { pushUndo(t.id); F[m[t.id]] = t.value; touched({ quiet: true }); } };
  v.onchange = function (e) { if (e.target.id === 'gf-title') mut(function () { F.title = e.target.checked; }); };
  v.onclick = function (e) {
    var b = e.target.closest('[data-gfmv]'); if (!b) return;
    var p = b.dataset.gfmv.split(':'), i = order.indexOf(p[0]), j = i + (+p[1]); if (j < 0 || j >= order.length) return;
    mut(function () { var tmp = order[i]; order[i] = order[j]; order[j] = tmp; }); render();
  };
};
ACT.gfPick = function (a) { GF.scene = a.dataset.id; SE.sceneId = a.dataset.id; render(); };
ACT.gfAdd = function () {
  var s = newScene('Scena ' + (P.scenes.length + 1), P.settings.view === 'side' ? 30 : 20, 12);
  if (P.settings.view === 'side') for (var x = 0; x < s.cols; x++) { s.inst.push(newInst('grass', x, 10)); s.inst.push(newInst('dirt', x, 11)); }
  if (P.objects.player) s.inst.push(newInst('player', 2, P.settings.view === 'side' ? 9 : 2));
  mut(function () { P.scenes.push(s); P.flow.order.push(s.id); }); GF.scene = s.id; render(); toast('Dodano scenę. Postaw klocki w kroku „Plansza”.', 'ok');
};
function gfMain() {
  var el = $('#gf-main'); if (!el) return;
  var s = sceneById(GF.scene); if (!s) { el.innerHTML = '<div class="empty">Brak scen.</div>'; return; }
  var cm = s.complete = s.complete || { mode: 'all', conds: [], next: 'next', count: 1 }, items = itemNames(), order = P.flow.order;
  var h = '<div class="wrap" style="max-width:860px;gap:16px"><div class="row"><div class="grow"><p class="eyebrow">Poziom</p><h1 style="font-size:1.7rem">' + esc(s.name) + '</h1></div><button class="btn sm" data-x="edit">' + I.scene + 'Otwórz planszę</button><button class="btn sm" data-x="dup">' + I.copy + 'Duplikuj</button>' + (s.id !== P.flow.start ? '<button class="btn sm" data-x="start">' + I.flag + 'Ustaw jako startową</button>' : '<span class="chip ok">Scena startowa</span>') + '<button class="btn sm danger" data-x="del"' + (P.scenes.length < 2 ? ' disabled' : '') + '>' + I.trash + 'Usuń</button></div>' +
    '<section class="sec"><h3>' + I.flag + 'Kiedy poziom jest ukończony?</h3>' +
    '<fieldset style="border:0;padding:0;margin:0"><legend class="small" style="font-weight:600;margin-bottom:6px">Jak łączyć warunki?</legend><div class="row">' + [['all', 'Wszystkie wymagane'], ['any', 'Dowolny z nich'], ['count', 'Określona liczba']].map(function (m) { return '<label class="rad"><input type="radio" name="gf-mode" value="' + m[0] + '"' + (cm.mode === m[0] ? ' checked' : '') + '>' + m[1] + '</label>'; }).join('') + (cm.mode === 'count' ? '<label class="f" style="flex-direction:row;align-items:center;gap:6px" for="gf-cnt">Co najmniej<input class="inp" type="number" id="gf-cnt" min="1" max="' + Math.max(1, cm.conds.length) + '" value="' + (cm.count || 1) + '" style="width:5em"></label>' : '') + '</div></fieldset>' +
    (cm.conds.length ? cm.conds.map(function (cd, i) {
      var extra = cd.type === 'var' ? '<input class="inp" data-cf="item" data-i="' + i + '" maxlength="30" value="' + esc(cd.item || '') + '" placeholder="np. Przyjaźń" aria-label="Nazwa w pamięci gry"><label class="row" style="flex-wrap:nowrap;gap:6px"><span class="small">co najmniej</span><input class="inp" type="number" min="1" max="99999" data-cf="val" data-i="' + i + '" value="' + (cd.val || 1) + '" aria-label="Wymagana wartość" style="width:80px"></label>' : cd.type === 'item' ? '<select class="inp" data-cf="item" data-i="' + i + '" aria-label="Przedmiot">' + (items.length ? items : ['—']).map(function (n) { return '<option' + (n === cd.item ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select>' : (cd.type === 'score' || cd.type === 'survive' || cd.type === 'laps') ? '<label class="row" style="flex-wrap:nowrap;gap:6px"><input class="inp" type="number" min="1" max="99999" data-cf="val" data-i="' + i + '" value="' + (cd.val || 1) + '" aria-label="' + (cd.type === 'score' ? 'Wymagany wynik' : cd.type === 'laps' ? 'Liczba okrążeń' : 'Czas w sekundach') + '"><span class="small">' + (cd.type === 'score' ? 'pkt' : cd.type === 'laps' ? 'okr.' : 's') + '</span></label>' : '<span class="small muted">' + ({ reach: 'Gracz wchodzi do Strefy wyjścia.', defeat: 'Żaden przeciwnik nie zostaje aktywny.', collect: 'Na scenie nie zostaje przedmiot z punktami.', boxes: 'Każda skrzynia do pchania stoi na polu docelowym.', waves: 'Fale się skończyły i żaden wróg nie żyje.', bricks: 'Nie została żadna cegiełka do rozbicia.' })[cd.type] + '</span>';
      return '<div class="flowrow"><select class="inp" data-cf="type" data-i="' + i + '" aria-label="Rodzaj warunku ' + (i + 1) + '">' + Object.keys(CONDS).map(function (k) { return '<option value="' + k + '"' + (cd.type === k ? ' selected' : '') + '>' + CONDS[k] + '</option>'; }).join('') + '</select>' + extra + '<button class="icobtn" data-cfdel="' + i + '" aria-label="Usuń warunek ' + (i + 1) + '">' + I.trash + '</button></div>';
    }).join('') : '<p class="small muted">Brak warunków – scenę można opuścić tylko portalem.</p>') +
    '<div><button class="btn sm" data-x="addc">' + I.plus + 'Dodaj warunek</button></div>' +
    '<label class="f" for="gf-next">Po ukończeniu<select class="inp" id="gf-next"><option value="next"' + (cm.next === 'next' ? ' selected' : '') + '>Następna scena w kolejności' + (order.indexOf(s.id) === order.length - 1 ? ' (to ostatnia – koniec gry)' : '') + '</option><option value="end"' + (cm.next === 'end' ? ' selected' : '') + '>Koniec gry – zwycięstwo</option>' + P.scenes.filter(function (x) { return x.id !== s.id; }).map(function (x) { return '<option value="' + x.id + '"' + (cm.next === x.id ? ' selected' : '') + '>Przejdź do: ' + esc(x.name) + '</option>'; }).join('') + '</select></label>' +
    '<p class="sentence2">' + flowSentence(s) + '</p></section>' +
    '<section class="sec"><h3>' + I.info + 'Ustawienia sceny</h3><div class="g2"><label class="f" for="gf-name">Nazwa<input class="inp" id="gf-name" maxlength="40" value="' + esc(s.name) + '"></label><label class="sw"><input type="checkbox" id="gf-inorder"' + (order.indexOf(s.id) >= 0 ? ' checked' : '') + '>W kolejności gry</label></div><p class="xs muted">Scena poza kolejnością jest dostępna tylko przez portal (Strefa wyjścia → Przejdź do sceny).</p></section></div>';
  el.innerHTML = h;
  el.onchange = function (e) {
    var t = e.target;
    if (t.name === 'gf-mode') { mut(function () { cm.mode = t.value; }); gfMain(); return; }
    if (t.id === 'gf-cnt') { mut(function () { cm.count = clamp(+t.value || 1, 1, cm.conds.length || 1); }); gfMain(); return; }
    if (t.id === 'gf-next') { mut(function () { cm.next = t.value; }); gfMain(); return; }
    if (t.id === 'gf-inorder') { mut(function () { var o = P.flow.order; if (t.checked && o.indexOf(s.id) < 0) o.push(s.id); if (!t.checked) P.flow.order = o.filter(function (x) { return x !== s.id; }); }); render(); return; }
    if (t.dataset.cf) { var cd = cm.conds[+t.dataset.i]; mut(function () { if (t.dataset.cf === 'type') { cd.type = t.value; if (t.value === 'item') cd.item = items[0] || ''; if (t.value === 'score') cd.val = cd.val || 10; if (t.value === 'survive') cd.val = cd.val || 30; if (t.value === 'laps') cd.val = 3; if (t.value === 'var') { cd.item = ''; cd.val = 1; } } else if (t.dataset.cf === 'val') cd.val = clamp(+t.value || 1, 1, 99999); else cd.item = t.value; }); gfMain(); }
  };
  el.oninput = function (e) { if (e.target.id === 'gf-name') { pushUndo('gfname'); s.name = e.target.value.slice(0, 40) || 'Scena'; touched({ quiet: true }); } };
  el.onclick = function (e) {
    var b = e.target.closest('[data-cfdel]'); if (b) { mut(function () { cm.conds.splice(+b.dataset.cfdel, 1); }); gfMain(); return; }
    b = e.target.closest('[data-x]'); if (!b) return;
    var x = b.dataset.x;
    if (x === 'addc') { mut(function () { cm.conds.push({ type: cm.conds.some(function (c) { return c.type === 'reach'; }) ? 'score' : 'reach', val: 10 }); }); gfMain(); }
    if (x === 'edit') { SE.sceneId = s.id; SE.fitted = false; go('scena'); }
    if (x === 'start') { mut(function () { P.flow.start = s.id; if (P.flow.order.indexOf(s.id) < 0) P.flow.order.unshift(s.id); }); render(); }
    if (x === 'dup') { var c = clone(s); c.id = uid('s'); c.name = (s.name + ' (kopia)').slice(0, 40); c.inst.forEach(function (i) { i.id = uid('i'); }); mut(function () { P.scenes.push(c); P.flow.order.push(c.id); }); GF.scene = c.id; render(); }
    if (x === 'del') openModal({ title: 'Usunąć scenę „' + s.name + '”?', body: '<p>Scena i jej ' + s.inst.length + ' instancji zostaną usunięte. Możesz to cofnąć (Ctrl+Z).</p>', actions: [{ label: 'Nie' }, { label: 'Usuń scenę', cls: 'pri', fn: function () { mut(function () { P.scenes = P.scenes.filter(function (q) { return q.id !== s.id; }); P.flow.order = P.flow.order.filter(function (q) { return q !== s.id; }); if (P.flow.start === s.id) P.flow.start = P.flow.order[0] || (P.scenes[0] && P.scenes[0].id); }); GF.scene = P.flow.start; SE.sceneId = P.flow.start; render(); } }] });
  };
}
function flowSentence(s) {
  var cm = s.complete || {}, conds = cm.conds || [];
  if (!conds.length) return '<b>Ta scena nie ma warunku ukończenia.</b>';
  var parts = conds.map(function (cd) { return ({ reach: 'gracz dotrze do wyjścia', item: 'gracz ma „' + esc(cd.item) + '”', score: 'wynik wyniesie co najmniej ' + cd.val + ' pkt', defeat: 'wszyscy przeciwnicy zostaną pokonani', collect: 'zostaną zebrane wszystkie przedmioty', survive: 'gracz przetrwa ' + cd.val + ' s', boxes: 'wszystkie skrzynie staną na polach', waves: 'gracz obroni bazę przed wszystkimi falami', laps: 'gracz przejedzie ' + (cd.val || 3) + ' okrążenia', bricks: 'wszystkie cegiełki zostaną rozbite', 'var': 'gra zapamięta „' + esc(cd.item || '?') + '” (co najmniej ' + (cd.val || 1) + ')' })[cd.type]; });
  var join = cm.mode === 'any' ? ' <b>lub</b> ' : cm.mode === 'count' ? ', ' : ' <b>i</b> ';
  var lead = cm.mode === 'count' ? 'gdy spełnione będą co najmniej ' + (cm.count || 1) + ' z warunków: ' : 'gdy ';
  var nx = cm.next === 'end' ? 'gra kończy się zwycięstwem' : cm.next === 'next' || !cm.next ? (P.flow.order.indexOf(s.id) < P.flow.order.length - 1 && P.flow.order.indexOf(s.id) >= 0 ? 'gracz przechodzi do sceny „' + esc(sceneById(P.flow.order[P.flow.order.indexOf(s.id) + 1]).name) + '”' : 'gra kończy się zwycięstwem') : 'gracz przechodzi do sceny „' + esc((sceneById(cm.next) || {}).name || '?') + '”';
  return 'Scena kończy się, ' + lead + parts.join(join) + '. Wtedy ' + nx + '.';
}
