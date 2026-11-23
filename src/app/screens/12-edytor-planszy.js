/* ================= SCENE EDITOR ================= */
var SE = { sceneId: null, tool: 'select', brush: 'grass', sel: [], zoom: 1, left: 'obiekty', vis: {}, lock: {}, hover: null, cursor: { x: 0, y: 0 }, focus: false, clip: [], prefab: null, search: '', showView: true, fitted: false };
ROUTES.scena = function (v) {
  v.className = 'full';
  var sc = curScene(); if (!sc) { v.innerHTML = '<div class="wrap"><div class="empty">Nie ma jeszcze planszy. Dodaj ją w kroku „Poziomy”.</div></div>'; return; }
  v.innerHTML = '<div class="studio"><aside class="pane" id="se-left" aria-label="Biblioteka i hierarchia"></aside><div class="split" data-side="l"></div>' +
    '<section class="pane center" style="display:flex;flex-direction:column"><div class="tools" role="toolbar" aria-label="Narzędzia sceny">' +
    '<label class="vh" for="se-scene">Scena</label><select class="inp" id="se-scene" style="width:auto;min-height:38px;padding:4px 8px">' + P.scenes.map(function (s) { return '<option value="' + s.id + '"' + (s.id === sc.id ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>' +
    '<div class="seg labels" role="group" aria-label="Narzędzie">' + [['select', 'Wybierz', 'V', I.cursor], ['brush', 'Rysuj', 'B', I.brush], ['rect', 'Wypełnij', 'R', I.rect], ['erase', 'Gumka', 'E', I.eraser], ['hand', 'Przesuń', 'H', I.hand]].map(function (t) { return '<button data-act="seTool" data-t="' + t[0] + '" aria-pressed="' + (SE.tool === t[0]) + '" title="' + t[1] + ' (' + t[2] + ')">' + t[3] + '<span>' + t[1] + '</span></button>'; }).join('') + '</div>' +
    '<button class="btn sm icon" data-act="seDup" title="Duplikuj (Ctrl+D)" aria-label="Duplikuj zaznaczone">' + I.copy + '</button><button class="btn sm icon" data-act="seDel" title="Usuń (Delete)" aria-label="Usuń zaznaczone">' + I.trash + '</button>' +
    '<span class="grow"></span><button class="btn sm icon" data-act="seZoom" data-z="-1" aria-label="Pomniejsz">' + I.zout + '</button><span class="zoomv" id="se-zoomv">' + Math.round(SE.zoom * 100) + '%</span><button class="btn sm icon" data-act="seZoom" data-z="1" aria-label="Powiększ">' + I.zin + '</button><button class="btn sm" data-act="seFit">Dopasuj</button>' +
    '<button class="btn sm' + (SE.showView ? ' on' : '') + '" data-act="seView" aria-pressed="' + SE.showView + '" title="Pokaż, ile widać na ekranie gry">' + I.scene + 'Ekran gry</button></div>' +
    '<div class="ed-canvas" id="se-wrap"><canvas id="se-cv" tabindex="0" role="application" aria-label="Viewport sceny. Strzałki przesuwają kursor lub zaznaczenie, Enter wstawia obiekt, Delete usuwa."></canvas></div>' +
    '<div class="hintbar" id="se-hint" aria-live="polite"></div></section><div class="split" data-side="r"></div><aside class="pane" id="se-right" aria-label="Inspektor"></aside></div>';
  $('#se-scene').addEventListener('change', function (e) { SE.sceneId = e.target.value; SE.sel = []; SE.fitted = false; render(); });
  bindSplits(v); seLeft(); seRight(); bindSE(); drawSE(); seHint();
  if (!SE.fitted) { SE.fitted = true; seFit(); }
};
function seLeft() {
  var el = $('#se-left'); if (!el) return;
  var h = '<div class="ptabs" role="tablist">' + [['obiekty', 'Klocki'], ['hier', 'Warstwy'], ['prefaby', 'Zestawy']].map(function (t) { return '<button role="tab" aria-selected="' + (SE.left === t[0]) + '" data-act="seLeft" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>';
  if (SE.left === 'obiekty') {
    h += '<label class="vh" for="se-q">Szukaj obiektu</label><input class="inp" id="se-q" placeholder="Szukaj klocka…" value="' + esc(SE.search) + '">';
    var q = SE.search.toLowerCase(), groups = {};
    Object.keys(P.objects).forEach(function (id) { var d = P.objects[id]; if (q && (d.name + ' ' + (d.tags || []).join(' ')).toLowerCase().indexOf(q) < 0) return; (groups[d.category] = groups[d.category] || []).push(id); });
    CATEGORIES.forEach(function (cat) {
      if (!groups[cat]) return;
      h += '<p class="ogroup">' + cat + '</p><ul class="olist">' + groups[cat].map(function (id) { var d = P.objects[id]; return '<li><button class="orow" draggable="true" data-act="seBrush" data-id="' + id + '" aria-pressed="' + (SE.brush === id && SE.tool !== 'select' && SE.tool !== 'hand' && !SE.prefab) + '"><img alt="" src="' + defIcon(id, 30) + '"><span class="meta"><b>' + esc(d.name) + '</b><small>' + (d.base ? 'wariant · ' : '') + LAYERNAME[d.layer || 'swiat'] + '</small></span></button></li>'; }).join('') + '</ul>';
    });
    h += '<a class="btn sm" href="#obiekty">' + I.object + 'Zmień wygląd postaci i rzeczy</a>';
  } else if (SE.left === 'hier') {
    var sc = curScene();
    h += '<p class="small muted">Warstwy rysowane od dołu do góry. Ukryta warstwa nie jest edytowalna; zablokowanej nie można zaznaczyć.</p>';
    LAYERS.slice().reverse().forEach(function (l) {
      var items = sc.inst.filter(function (i) { return (i.layer || 'swiat') === l[0]; }), vis = SE.vis[l[0]] !== false, lk = !!SE.lock[l[0]];
      h += '<div class="layerrow"><b>' + l[1] + ' <span class="muted xs">(' + items.length + ')</span></b><button class="icobtn" data-act="seVis" data-l="' + l[0] + '" aria-pressed="' + vis + '" aria-label="' + (vis ? 'Ukryj' : 'Pokaż') + ' warstwę ' + l[1] + '">' + (vis ? I.eye : I.eyeoff) + '</button><button class="icobtn" data-act="seLock" data-l="' + l[0] + '" aria-pressed="' + !lk + '" aria-label="' + (lk ? 'Odblokuj' : 'Zablokuj') + ' warstwę ' + l[1] + '">' + (lk ? I.lock : I.unlock) + '</button></div>';
      if (items.length && items.length <= 60) h += '<ul class="olist">' + items.map(function (i) { var d = P.objects[i.obj]; return '<li><button class="orow" data-act="seSelInst" data-id="' + i.id + '" aria-current="' + (SE.sel.indexOf(i.id) >= 0) + '"><img alt="" src="' + (d ? defIcon(i.obj, 30) : '') + '"><span class="meta"><b>' + esc(d ? d.name : '(usunięty obiekt)') + (i.locked ? ' 🔒' : '') + '</b><small class="mono">x ' + i.x + ', y ' + i.y + '</small></span></button></li>'; }).join('') + '</ul>';
      else if (items.length) h += '<p class="xs muted">' + items.length + ' elementów – zaznaczaj je na viewporcie.</p>';
    });
  } else {
    h += '<p class="small muted">Zestaw to zapisana grupa klocków, np. domek albo pułapka. Zaznacz kilka klocków narzędziem „Wybierz” i kliknij „Zapisz zestaw” po prawej.</p>';
    h += P.prefabs.length ? '<ul class="olist">' + P.prefabs.map(function (pf) { return '<li class="row" style="flex-wrap:nowrap"><button class="orow" data-act="sePrefab" data-id="' + pf.id + '" aria-pressed="' + (SE.prefab === pf.id) + '"><span class="meta"><b>' + esc(pf.name) + '</b><small>' + pf.items.length + ' elementów</small></span></button><button class="icobtn" data-act="seDelPrefab" data-id="' + pf.id + '" aria-label="Usuń prefabrykat ' + esc(pf.name) + '">' + I.trash + '</button></li>'; }).join('') + '</ul>' : '<div class="empty">Nie masz jeszcze zestawów.</div>';
  }
  el.innerHTML = h;
  var qi = $('#se-q'); if (qi) qi.addEventListener('input', function () { SE.search = qi.value; var pos = qi.selectionStart; seLeft(); var n = $('#se-q'); n.focus(); n.setSelectionRange(pos, pos); });
  $$('.orow[draggable]', el).forEach(function (b) { b.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', 'def:' + b.dataset.id); }); });
}
ACT.seLeft = function (a) { SE.left = a.dataset.t; seLeft(); };
ACT.seBrush = function (a) { SE.brush = a.dataset.id; SE.prefab = null; if (SE.tool === 'select' || SE.tool === 'hand' || SE.tool === 'erase') SE.tool = 'brush'; SE.sel = []; seLeft(); seTools(); seRight(); drawSE(); seHint(); };
ACT.sePrefab = function (a) { SE.prefab = a.dataset.id; SE.tool = 'brush'; seLeft(); seTools(); seHint(); };
ACT.seDelPrefab = function (a) { mut(function () { P.prefabs = P.prefabs.filter(function (p) { return p.id !== a.dataset.id; }); }); if (SE.prefab === a.dataset.id) SE.prefab = null; seLeft(); };
ACT.seVis = function (a) { SE.vis[a.dataset.l] = SE.vis[a.dataset.l] === false; seLeft(); drawSE(); };
ACT.seLock = function (a) { SE.lock[a.dataset.l] = !SE.lock[a.dataset.l]; SE.sel = SE.sel.filter(function (id) { var i = instById(id); return i && !SE.lock[i.layer]; }); seLeft(); seRight(); drawSE(); };
ACT.seSelInst = function (a) { SE.sel = [a.dataset.id]; SE.tool = 'select'; seTools(); seLeft(); seRight(); drawSE(); scrollToInst(instById(a.dataset.id)); };
ACT.seTool = function (a) { SE.tool = a.dataset.t; if (SE.tool !== 'brush') SE.prefab = null; seTools(); seLeft(); seHint(); drawSE(); };
function seTools() { $$('.seg [data-t]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.t === SE.tool); }); var cv = $('#se-cv'); if (cv) cv.classList.toggle('hand', SE.tool === 'hand'); }
ACT.seZoom = function (a) { setZoom(SE.zoom + (+a.dataset.z) * 0.1); };
ACT.seFit = function () { seFit(); };
ACT.seView = function (a) { SE.showView = !SE.showView; a.classList.toggle('on', SE.showView); a.setAttribute('aria-pressed', SE.showView); drawSE(); };
function setZoom(z) { SE.zoom = clamp(Math.round(z * 10) / 10, 0.2, 2.5); var e = $('#se-zoomv'); if (e) e.textContent = Math.round(SE.zoom * 100) + '%'; drawSE(); }
function seFit() { var w = $('#se-wrap'), sc = curScene(); if (!w || !sc) return; var z = Math.min((w.clientWidth - 50) / (sc.cols * T), (w.clientHeight - 50) / (sc.rows * T)); setZoom(clamp(Math.floor(z * 10) / 10, 0.2, 1.5)); }
function scrollToInst(i) { var w = $('#se-wrap'); if (!i || !w) return; w.scrollTo({ left: i.x * T * SE.zoom - w.clientWidth / 2, top: i.y * T * SE.zoom - w.clientHeight / 2 }); }
function instRect(i) { var r = RI(i); var w = r ? (r.size.w || 1) : 1, h = r ? (r.size.h || 1) : 1; return { x: i.x, y: i.y, w: w, h: h }; }
function instAt(x, y) {
  var sc = curScene(), best = null, bl = -1;
  var order = { tlo: 0, swiat: 1, kolizje: 2, interakcje: 3, efekty: 4 };
  sc.inst.forEach(function (i) {
    if (SE.vis[i.layer] === false || SE.lock[i.layer]) return;
    var r = instRect(i); if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) { var l = order[i.layer] || 1; if (l >= bl) { bl = l; best = i; } }
  });
  return best;
}
function placeDef(defId, x, y) {
  var sc = curScene(); if (x < 0 || y < 0 || x >= sc.cols || y >= sc.rows) return null;
  var d = P.objects[defId]; if (!d) return null;
  var layer = d.layer || 'swiat';
  var ex = sc.inst.filter(function (i) { return i.x === x && i.y === y && (i.layer || 'swiat') === layer; })[0];
  if (ex && ex.obj === defId) return ex;
  if (ex) sc.inst.splice(sc.inst.indexOf(ex), 1);
  var inst = newInst(defId, x, y); sc.inst.push(inst); return inst;
}
function placePrefab(pf, x, y) {
  var sc = curScene(), ids = [];
  pf.items.forEach(function (it) {
    var nx = x + it.dx, ny = y + it.dy; if (nx < 0 || ny < 0 || nx >= sc.cols || ny >= sc.rows || !P.objects[it.obj]) return;
    sc.inst = sc.inst.filter(function (i) { return !(i.x === nx && i.y === ny && i.layer === it.layer); });
    var inst = { id: uid('i'), obj: it.obj, x: nx, y: ny, layer: it.layer, ov: clone(it.ov || {}), flip: !!it.flip, locked: false }; sc.inst.push(inst); ids.push(inst.id);
  });
  return ids;
}
var drag = null;
function cellOf(e) { var cv = $('#se-cv'), r = cv.getBoundingClientRect(), sc = curScene(), s = r.width / (sc.cols * T); return { x: Math.floor((e.clientX - r.left) / (T * s)), y: Math.floor((e.clientY - r.top) / (T * s)) }; }
function inScene(c) { var sc = curScene(); return c.x >= 0 && c.y >= 0 && c.x < sc.cols && c.y < sc.rows; }
function bindSE() {
  var cv = $('#se-cv'), wrap = $('#se-wrap'); if (!cv) return;
  seTools();
  cv.addEventListener('pointerdown', function (e) {
    if (e.button === 1 || SE.tool === 'hand' || SE.space) { drag = { mode: 'pan', x: e.clientX, y: e.clientY, sl: wrap.scrollLeft, st: wrap.scrollTop }; cv.setPointerCapture(e.pointerId); return; }
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    cv.focus({ preventScroll: true }); SE.focus = false; try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    var c = cellOf(e); if (!inScene(c)) return; SE.cursor = c;
    if (SE.tool === 'brush') {
      if (SE.prefab) { var pf = P.prefabs.filter(function (p) { return p.id === SE.prefab; })[0]; if (pf) { pushUndo(); SE.sel = placePrefab(pf, c.x, c.y); touched(); seRight(); drawSE(); } return; }
      pushUndo(); placeDef(SE.brush, c.x, c.y); drag = { mode: 'paint', last: c.x + ',' + c.y }; touched(); drawSE();
    } else if (SE.tool === 'rect') { drag = { mode: 'rect', a: c, b: c }; }
    else if (SE.tool === 'erase') { pushUndo(); var t = instAt(c.x, c.y); if (t && !t.locked) { curScene().inst.splice(curScene().inst.indexOf(t), 1); touched(); } drag = { mode: 'erase' }; drawSE(); }
    else {
      var hit = instAt(c.x, c.y);
      if (hit) {
        if (e.shiftKey || e.ctrlKey || e.metaKey) { SE.sel = SE.sel.indexOf(hit.id) >= 0 ? SE.sel.filter(function (i) { return i !== hit.id; }) : SE.sel.concat(hit.id); drag = null; }
        else { if (SE.sel.indexOf(hit.id) < 0) SE.sel = [hit.id]; var movable = SE.sel.map(instById).filter(function (i) { return i && !i.locked; }); drag = { mode: 'move', start: c, orig: movable.map(function (i) { return { i: i, x: i.x, y: i.y }; }), moved: false }; }
      } else { if (!e.shiftKey) SE.sel = []; drag = { mode: 'marq', a: c, b: c, add: e.shiftKey }; }
      seRight(); drawSE(); seHint(); if (SE.left === 'hier') seLeft();
    }
  });
  cv.addEventListener('pointermove', function (e) {
    if (drag && drag.mode === 'pan') { wrap.scrollLeft = drag.sl - (e.clientX - drag.x); wrap.scrollTop = drag.st - (e.clientY - drag.y); return; }
    var c = cellOf(e), hv = inScene(c) ? c : null;
    if (!drag) { if ((hv && (!SE.hover || SE.hover.x !== hv.x || SE.hover.y !== hv.y)) || (!hv && SE.hover)) { SE.hover = hv; drawSE(); } return; }
    SE.hover = hv; if (!hv) return;
    if (drag.mode === 'paint') { var k = c.x + ',' + c.y; if (k !== drag.last) { drag.last = k; placeDef(SE.brush, c.x, c.y); touched({ quiet: true }); drawSE(); } }
    else if (drag.mode === 'erase') { var t = instAt(c.x, c.y); if (t && !t.locked) { curScene().inst.splice(curScene().inst.indexOf(t), 1); touched({ quiet: true }); drawSE(); } }
    else if (drag.mode === 'rect' || drag.mode === 'marq') { drag.b = c; drawSE(); }
    else if (drag.mode === 'move' && drag.orig.length) {
      var sc = curScene(), dx = c.x - drag.start.x, dy = c.y - drag.start.y;
      var mnx = Math.min.apply(null, drag.orig.map(function (q) { return q.x; })), mxx = Math.max.apply(null, drag.orig.map(function (q) { return q.x; })), mny = Math.min.apply(null, drag.orig.map(function (q) { return q.y; })), mxy = Math.max.apply(null, drag.orig.map(function (q) { return q.y; }));
      dx = clamp(dx, -mnx, sc.cols - 1 - mxx); dy = clamp(dy, -mny, sc.rows - 1 - mxy);
      if ((dx || dy) && !drag.moved) { pushUndo(); drag.moved = true; }
      drag.orig.forEach(function (q) { q.i.x = q.x + dx; q.i.y = q.y + dy; }); drawSE();
    }
  });
  function up() {
    if (!drag) return;
    var sc = curScene();
    if (drag.mode === 'rect') {
      var a = drag.a, b = drag.b; pushUndo();
      for (var y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++) for (var x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++) placeDef(SE.brush, x, y);
      touched();
    }
    if (drag.mode === 'marq') {
      var x1 = Math.min(drag.a.x, drag.b.x), x2 = Math.max(drag.a.x, drag.b.x), y1 = Math.min(drag.a.y, drag.b.y), y2 = Math.max(drag.a.y, drag.b.y);
      var found = sc.inst.filter(function (i) { return SE.vis[i.layer] !== false && !SE.lock[i.layer] && i.x >= x1 && i.x <= x2 && i.y >= y1 && i.y <= y2; }).map(function (i) { return i.id; });
      SE.sel = drag.add ? SE.sel.concat(found.filter(function (i) { return SE.sel.indexOf(i) < 0; })) : found;
      seRight(); seHint(); if (SE.left === 'hier') seLeft();
    }
    if (drag.mode === 'move' && drag.moved) {
      var moved = drag.orig.map(function (q) { return q.i; }), ids = {}; moved.forEach(function (i) { ids[i.id] = 1; });
      sc.inst = sc.inst.filter(function (o) { if (ids[o.id]) return true; return !moved.some(function (m) { return m.x === o.x && m.y === o.y && m.layer === o.layer; }); });
      touched(); seRight(); if (SE.left === 'hier') seLeft();
    }
    if (drag.mode === 'paint' || drag.mode === 'erase') { updTop(); if (SE.left === 'hier') seLeft(); }
    drag = null; drawSE();
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointerleave', function () { if (!drag) { SE.hover = null; drawSE(); } });
  cv.addEventListener('focus', function () { SE.focus = true; drawSE(); });
  cv.addEventListener('blur', function () { SE.focus = false; drawSE(); });
  cv.addEventListener('dragover', function (e) { e.preventDefault(); var c = cellOf(e); SE.hover = inScene(c) ? c : null; drawSE(); });
  cv.addEventListener('drop', function (e) { e.preventDefault(); var d = e.dataTransfer.getData('text/plain'); if (d.indexOf('def:') !== 0) return; var c = cellOf(e); if (!inScene(c)) return; pushUndo(); var i = placeDef(d.slice(4), c.x, c.y); SE.tool = 'select'; SE.sel = i ? [i.id] : []; touched(); seTools(); seRight(); drawSE(); });
  wrap.addEventListener('wheel', function (e) { if (e.ctrlKey) { e.preventDefault(); setZoom(SE.zoom + (e.deltaY < 0 ? 0.1 : -0.1)); } }, { passive: false });
  var onResize = function () { drawSE(); }; window.addEventListener('resize', onResize);
  cleanup = function () { window.removeEventListener('resize', onResize); };
}
function drawSE() {
  var cv = $('#se-cv'), sc = curScene(); if (!cv || !sc) return;
  CGM.registerAssets(P.assets);
  var W = sc.cols * T, H = sc.rows * T, z = SE.zoom, dpr = Math.min(2, window.devicePixelRatio || 1);
  var pw = Math.round(W * z * dpr), ph = Math.round(H * z * dpr);
  if (cv.width !== pw) cv.width = pw; if (cv.height !== ph) cv.height = ph;
  cv.style.width = W * z + 'px'; cv.style.height = H * z + 'px';
  var c = cv.getContext('2d'); c.setTransform(dpr * z, 0, 0, dpr * z, 0, 0);
  CGM.drawBackground(c, sc.bg.theme, W, H, 0, sc.bg.color);
  var order = { tlo: 0, swiat: 1, kolizje: 2, interakcje: 3, efekty: 4 };
  var list = sc.inst.slice().sort(function (a, b) { return (order[a.layer] || 1) - (order[b.layer] || 1); });
  var selMap = {}; SE.sel.forEach(function (i) { selMap[i] = 1; });
  list.forEach(function (i) {
    if (SE.vis[i.layer] === false) return;
    var r = RI(i); if (!r) { c.fillStyle = 'rgba(180,42,60,.4)'; c.fillRect(i.x * T, i.y * T, T, T); return; }
    var w = (r.size.w || 1) * T, h = (r.size.h || 1) * T;
    if (SE.lock[i.layer]) c.globalAlpha = 0.6;
    CGM.drawSprite(c, spriteOf(r), i.x * T, i.y * T, w, h, 0, { dir: i.flip ? -1 : 1, editor: true });
    c.globalAlpha = 1;
    if (i.locked) { c.fillStyle = 'rgba(29,36,64,.55)'; c.fillRect(i.x * T + w - 12, i.y * T + 2, 10, 10); }
    if (Object.keys(i.ov || {}).length) { c.fillStyle = '#6b4fa0'; c.beginPath(); c.arc(i.x * T + 6, i.y * T + 6, 4, 0, 7); c.fill(); }
  });
  c.strokeStyle = 'rgba(29,36,64,.15)'; c.lineWidth = 1 / z; c.beginPath();
  for (var x = 0; x <= sc.cols; x++) { c.moveTo(x * T, 0); c.lineTo(x * T, H); }
  for (var y = 0; y <= sc.rows; y++) { c.moveTo(0, y * T); c.lineTo(W, y * T); }
  c.stroke();
  if (SE.showView) {
    var pl = sc.inst.filter(function (i) { var r = RI(i); return r && CGM.activeComps(r).some(function (cc) { return cc.type === 'platformer' || cc.type === 'topdown'; }); })[0];
    if (pl) {
      var vw = P.settings.viewW * T, vh = P.settings.viewH * T, vx = clamp(pl.x * T + T / 2 - vw / 2, 0, Math.max(0, W - vw)), vy = clamp(pl.y * T + T / 2 - vh / 2, 0, Math.max(0, H - vh));
      c.save(); c.setLineDash([10, 6]); c.lineWidth = 3 / z; c.strokeStyle = '#12806a'; c.strokeRect(vx + 1, vy + 1, Math.min(vw, W) - 2, Math.min(vh, H) - 2);
      c.fillStyle = '#12806a'; c.font = 'bold ' + (12 / z) + 'px system-ui'; c.fillText('Tyle widać na ekranie', vx + 6 / z, vy + 16 / z); c.restore();
    }
  }
  SE.sel.map(instById).forEach(function (i) {
    if (!i) return; var r = RI(i), rc = instRect(i);
    c.save();
    if (r) CGM.activeComps(r).forEach(function (cc) {
      c.setLineDash([6, 5]); c.lineWidth = 2.5 / z; c.strokeStyle = '#6b4fa0';
      if (cc.type === 'patrol' || cc.type === 'mover' || cc.type === 'ai') { var d = cc.p.distance || 3; if (cc.p.axis === 'v') c.strokeRect(i.x * T + 4, i.y * T + 4, T - 8, (d + 1) * T - 8); else c.strokeRect(i.x * T + 4, i.y * T + 4, (d + 1) * T - 8, T - 8); }
      if (cc.type === 'follow' || cc.type === 'ai') { c.beginPath(); c.arc(i.x * T + T / 2, i.y * T + T / 2, (cc.p.range || cc.p.detect || 5) * T, 0, 7); c.stroke(); }
      if (cc.type === 'shooter') { c.strokeStyle = '#c43d4b'; c.beginPath(); c.arc(i.x * T + T / 2, i.y * T + T / 2, (cc.p.range || 8) * T, 0, 7); c.stroke(); }
    });
    c.setLineDash([]); c.lineWidth = 3 / z; c.strokeStyle = '#fff'; c.strokeRect(rc.x * T + 1.5, rc.y * T + 1.5, rc.w * T - 3, rc.h * T - 3);
    c.setLineDash([5, 4]); c.strokeStyle = '#e8962e'; c.strokeRect(rc.x * T + 1.5, rc.y * T + 1.5, rc.w * T - 3, rc.h * T - 3); c.restore();
  });
  if (drag && (drag.mode === 'rect' || drag.mode === 'marq')) {
    var a = drag.a, b = drag.b, x1 = Math.min(a.x, b.x), y1 = Math.min(a.y, b.y), w2 = Math.abs(a.x - b.x) + 1, h2 = Math.abs(a.y - b.y) + 1;
    c.fillStyle = drag.mode === 'rect' ? 'rgba(18,128,106,.2)' : 'rgba(232,150,46,.15)'; c.fillRect(x1 * T, y1 * T, w2 * T, h2 * T);
    c.setLineDash([6, 4]); c.strokeStyle = drag.mode === 'rect' ? '#12806a' : '#e8962e'; c.lineWidth = 2 / z; c.strokeRect(x1 * T, y1 * T, w2 * T, h2 * T); c.setLineDash([]);
  }
  var hv = SE.hover;
  if (hv && SE.tool === 'brush' && !drag) {
    c.globalAlpha = 0.55;
    if (SE.prefab) { var pf = P.prefabs.filter(function (p) { return p.id === SE.prefab; })[0]; if (pf) pf.items.forEach(function (it) { var r = R(it.obj); if (r) CGM.drawSprite(c, spriteOf(r), (hv.x + it.dx) * T, (hv.y + it.dy) * T, T, T, 0, { editor: true }); }); }
    else { var r = R(SE.brush); if (r) CGM.drawSprite(c, spriteOf(r), hv.x * T, hv.y * T, (r.size.w || 1) * T, (r.size.h || 1) * T, 0, { editor: true }); }
    c.globalAlpha = 1; c.strokeStyle = '#12806a'; c.lineWidth = 2 / z; c.strokeRect(hv.x * T + 1, hv.y * T + 1, T - 2, T - 2);
  }
  if (hv && SE.tool === 'erase') { c.strokeStyle = '#b42a3c'; c.lineWidth = 3 / z; c.strokeRect(hv.x * T + 1.5, hv.y * T + 1.5, T - 3, T - 3); }
  if (SE.focus) { var k = SE.cursor; c.save(); c.lineWidth = 3 / z; c.strokeStyle = '#1d2440'; c.setLineDash([4, 3]); c.strokeRect(k.x * T + 2, k.y * T + 2, T - 4, T - 4); c.restore(); }
}
function seHint() {
  var h = $('#se-hint'); if (!h) return;
  var t = SE.tool === 'brush' ? (SE.prefab ? 'Kliknij, aby wstawić prefabrykat.' : 'Rysuj: klikaj albo przeciągaj po planszy, żeby postawić „' + esc((P.objects[SE.brush] || {}).name || '') + '”.') :
    SE.tool === 'rect' ? 'Wypełnij: przeciągnij prostokąt – cały obszar wypełni się klockiem „' + esc((P.objects[SE.brush] || {}).name || '') + '”.' :
      SE.tool === 'erase' ? 'Gumka: klikaj klocki, które chcesz usunąć. Pomyłka? Kliknij „Cofnij”.' :
        SE.tool === 'hand' ? 'Przesuń: złap planszę i przeciągnij, żeby zobaczyć inną część.' :
          SE.sel.length ? 'Przeciągnij, żeby przesunąć. Ustawienia klocka są po prawej. Shift + klik – wybierz kilka.' : 'Kliknij klocek, żeby go wybrać. Żeby postawić nowy – wybierz go z listy po lewej.';
  h.innerHTML = I.bulb + '<span>' + t + '</span>';
}
document.addEventListener('keydown', function (e) {
  if (route() !== 'scena' || !P || $('#modal-root .modal')) return;
  var t = e.target, field = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT'); if (field) return;
  var mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  if (e.code === 'Space' && t && t.id === 'se-cv') { SE.space = true; e.preventDefault(); }
  if (mod && k === 'c') { SE.clip = SE.sel.map(instById).filter(Boolean).map(clone); if (SE.clip.length) toast('Skopiowano: ' + SE.clip.length); return; }
  if (mod && k === 'v') { if (SE.clip.length) pasteInst(SE.clip); e.preventDefault(); return; }
  if (mod && k === 'd') { e.preventDefault(); ACT.seDup(); return; }
  if (mod) return;
  if (e.key === 'Delete' || e.key === 'Backspace') { if (SE.sel.length) { e.preventDefault(); ACT.seDel(); } return; }
  if (e.key === 'Escape') { SE.sel = []; seRight(); drawSE(); seHint(); return; }
  var tools = { v: 'select', b: 'brush', r: 'rect', e: 'erase', h: 'hand' };
  if (tools[k]) { SE.tool = tools[k]; seTools(); seHint(); drawSE(); return; }
  var dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
  if (dir && t && t.id === 'se-cv') {
    e.preventDefault(); var sc = curScene();
    var sel = SE.sel.map(instById).filter(function (i) { return i && !i.locked; });
    if (sel.length && SE.tool === 'select') { if (sel.every(function (i) { return inScene({ x: i.x + dir[0], y: i.y + dir[1] }); })) { pushUndo('kmove'); sel.forEach(function (i) { i.x += dir[0]; i.y += dir[1]; }); touched({ quiet: true }); drawSE(); seRight(); } }
    else { SE.cursor.x = clamp(SE.cursor.x + dir[0], 0, sc.cols - 1); SE.cursor.y = clamp(SE.cursor.y + dir[1], 0, sc.rows - 1); drawSE(); }
  }
  if ((e.key === 'Enter') && t && t.id === 'se-cv') {
    e.preventDefault(); var q = SE.cursor;
    if (SE.tool === 'brush' || SE.tool === 'rect') { pushUndo(); placeDef(SE.brush, q.x, q.y); touched(); drawSE(); }
    else if (SE.tool === 'erase') { var it = instAt(q.x, q.y); if (it) { pushUndo(); curScene().inst.splice(curScene().inst.indexOf(it), 1); touched(); drawSE(); } }
    else { var hit = instAt(q.x, q.y); SE.sel = hit ? [hit.id] : []; seRight(); drawSE(); }
  }
});
document.addEventListener('keyup', function (e) { if (e.code === 'Space') SE.space = false; });
function pasteInst(list) {
  var sc = curScene(); pushUndo(); var ids = [];
  list.forEach(function (src) { var i = clone(src); i.id = uid('i'); i.x = Math.min(sc.cols - 1, i.x + 1); i.y = Math.min(sc.rows - 1, i.y + 1); i.locked = false; sc.inst = sc.inst.filter(function (q) { return !(q.x === i.x && q.y === i.y && q.layer === i.layer); }); sc.inst.push(i); ids.push(i.id); });
  SE.sel = ids; SE.tool = 'select'; touched(); seTools(); seRight(); drawSE();
}
ACT.seDup = function () { var s = SE.sel.map(instById).filter(Boolean); if (!s.length) { toast('Najpierw zaznacz obiekty narzędziem Zaznacz.'); return; } pasteInst(s.map(clone)); };
ACT.seDel = function () { var s = SE.sel.slice(); if (!s.length) { toast('Najpierw zaznacz obiekty.'); return; } var sc = curScene(); var n = 0; mut(function () { sc.inst = sc.inst.filter(function (i) { var del = s.indexOf(i.id) >= 0 && !i.locked; if (del) n++; return !del; }); }); SE.sel = []; seRight(); drawSE(); if (SE.left === 'hier') seLeft(); if (n < s.length) toast('Zablokowanych elementów nie usunięto.'); };

/* inspector (scene) */
function paramControl(id, p, val, ctx) {
  var lab = '<span class="lab"><label for="' + id + '">' + esc(p.label) + '</label>' + (ctx && ctx.badge ? ctx.badge : '') + '</span>';
  var h = p.help ? '<p class="help">' + esc(p.help) + '</p>' : '';
  var d = ' data-path="' + esc(ctx.path) + '" data-kind="' + p.type + '"';
  if (p.type === 'range') return '<div class="field">' + lab + '<div class="rng" style="grid-template-columns:1fr auto"><input type="range" id="' + id + '" min="' + p.min + '" max="' + p.max + '" step="' + (p.step || 1) + '" value="' + val + '"' + d + '><output for="' + id + '">' + val + '</output></div>' + h + '</div>';
  if (p.type === 'bool') return '<div class="field"><label class="sw"><input type="checkbox" id="' + id + '"' + (val ? ' checked' : '') + d + '>' + esc(p.label) + '</label>' + (ctx && ctx.badge ? '<span>' + ctx.badge + '</span>' : '') + h + '</div>';
  if (p.type === 'select') return '<div class="field">' + lab + '<select class="inp" id="' + id + '"' + d + '>' + p.opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>' + h + '</div>';
  if (p.type === 'item') { var items = itemNames(); if (val && items.indexOf(val) < 0) items.push(val); return '<div class="field">' + lab + '<select class="inp" id="' + id + '"' + d + '>' + items.map(function (n) { return '<option' + (n === val ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select><p class="help">Lista przedmiotów, które obiekty dodają do ekwipunku (źródło danych: Ekwipunek).</p></div>'; }
  if (p.type === 'scene') return '<div class="field">' + lab + '<select class="inp" id="' + id + '"' + d + '><option value="">— wybierz planszę —</option>' + P.scenes.map(function (s) { return '<option value="' + s.id + '"' + (s.id === val ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + (p.specials ? '<option value="__win"' + (val === '__win' ? ' selected' : '') + '>Koniec gry – wygrana</option><option value="__lose"' + (val === '__lose' ? ' selected' : '') + '>Koniec gry – przegrana</option>' : '') + '</select>' + h + '</div>';
  if (p.type === 'num') return '<div class="field">' + lab + '<input class="inp" type="number" id="' + id + '" min="' + (p.min || 0) + '" max="' + (p.max || 1e9) + '" step="any" value="' + esc(val) + '"' + d + '>' + h + '</div>';
  if (p.type === 'deck') return '<div class="field">' + lab + '<select class="inp" id="' + id + '"' + d + '><option value="">— pierwsza talia —</option>' + (P.decks || []).map(function (k) { return '<option value="' + esc(k.id) + '"' + (k.id === val ? ' selected' : '') + '>' + esc(k.name) + '</option>'; }).join('') + '</select><p class="help">Talie układasz w module <a href="#karty">Karty i talie</a>.</p></div>';
  if (p.type === 'objdef') return '<div class="field">' + lab + '<select class="inp" id="' + id + '"' + d + '><option value="">— nic —</option>' + Object.keys(P.objects).map(function (k) { return '<option value="' + k + '"' + (k === val ? ' selected' : '') + '>' + esc(P.objects[k].name) + '</option>'; }).join('') + '</select>' + h + '</div>';
  if (p.type === 'sound') return '<div class="field">' + lab + '<select class="inp" id="' + id + '"' + d + '>' + [['collect', 'Zebranie'], ['life', 'Bonus'], ['door', 'Mechanizm'], ['hint', 'Sygnał'], ['none', 'Bez dźwięku']].concat(Object.keys(P.assets).filter(function (k) { return P.assets[k].type === 'audio'; }).map(function (k) { return [k, 'Zasób: ' + P.assets[k].name]; })).map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>';
  if (p.type === 'textarea') return '<div class="field">' + lab + '<textarea class="inp" id="' + id + '" maxlength="' + (p.max || 400) + '"' + d + '>' + esc(val) + '</textarea>' + h + '</div>';
  return '<div class="field">' + lab + '<input class="inp" id="' + id + '" maxlength="' + (p.max || 60) + '" value="' + esc(val) + '"' + d + '>' + h + '</div>';
}
function itemNames() { var s = {}; Object.keys(P.objects).forEach(function (id) { var r = R(id); if (r) CGM.activeComps(r).forEach(function (c) { if (c.type === 'pickup' && c.p.toInv) s[c.p.item || r.name] = 1; }); }); return Object.keys(s); }
function readCtl(t) { var k = t.dataset.kind; return k === 'range' ? +t.value : k === 'num' ? Math.max(+t.min || 0, Math.min(+t.max || 1e9, +t.value || 0)) : k === 'bool' ? t.checked : t.value; }
function seRight() {
  var el = $('#se-right'); if (!el) return;
  var sc = curScene(), sel = SE.sel.map(instById).filter(Boolean);
  if (!sel.length) {
    el.innerHTML = '<div><p class="sec-t">Plansza</p><h3>' + esc(sc.name) + '</h3></div>' +
      '<label class="f" for="sc-name">Nazwa planszy<input class="inp" id="sc-name" maxlength="40" value="' + esc(sc.name) + '"></label>' +
      '<div class="row"><label class="f grow" for="sc-cols">Szerokość (kratki)<input class="inp" type="number" id="sc-cols" min="8" max="120" value="' + sc.cols + '"></label><label class="f grow" for="sc-rows">Wysokość<input class="inp" type="number" id="sc-rows" min="6" max="60" value="' + sc.rows + '"></label></div>' +
      '<label class="f" for="sc-theme">Tło<select class="inp" id="sc-theme">' + Object.keys(THEMES).map(function (k) { return '<option value="' + k + '"' + (sc.bg.theme === k ? ' selected' : '') + '>' + THEMES[k].name + '</option>'; }).join('') + '</select></label>' +
      (sc.bg.theme === 'wlasny' ? '<label class="f" for="sc-color">Kolor tła<input type="color" class="inp" id="sc-color" value="' + sc.bg.color + '" style="padding:2px;height:40px"></label>' : '') +
      '<div class="field"><span class="lab"><label for="sc-par">Paralaksa tła</label></span><div class="rng" style="grid-template-columns:1fr auto"><input type="range" id="sc-par" min="0" max="1" step="0.1" value="' + (sc.bg.parallax == null ? 0.3 : sc.bg.parallax) + '"><output>' + (sc.bg.parallax == null ? 0.3 : sc.bg.parallax) + '</output></div><p class="help">0 – tło stoi w miejscu, 1 – przesuwa się razem ze sceną.</p></div>' +
      '<div class="soft small"><b>' + sc.inst.length + ' ' + plural(sc.inst.length, 'instancja', 'instancje', 'instancji') + '</b><span class="muted">Ekran gry: ' + P.settings.viewW + '×' + P.settings.viewH + ' kratek.</span></div>' +
      '<p class="small muted">Kliknij klocek narzędziem „Wybierz”, żeby go ustawić.</p>';
    el.oninput = function (e) {
      var t = e.target;
      if (t.id === 'sc-name') { pushUndo('scname'); sc.name = t.value.slice(0, 40) || 'Scena'; touched({ quiet: true }); var o = $('#se-scene option[value="' + sc.id + '"]'); if (o) o.textContent = sc.name; }
      if (t.id === 'sc-par') { pushUndo('par'); sc.bg.parallax = +t.value; t.parentNode.querySelector('output').textContent = t.value; touched({ quiet: true }); }
      if (t.id === 'sc-color') { pushUndo('bgc'); sc.bg.color = t.value; touched({ quiet: true }); drawSE(); }
    };
    el.onchange = function (e) {
      var t = e.target;
      if (t.id === 'sc-cols' || t.id === 'sc-rows') { mut(function () { sc[t.id === 'sc-cols' ? 'cols' : 'rows'] = clamp(+t.value || 10, t.id === 'sc-cols' ? 8 : 6, t.id === 'sc-cols' ? 120 : 60); }); drawSE(); seRight(); }
      if (t.id === 'sc-theme') { mut(function () { sc.bg.theme = t.value; }); drawSE(); seRight(); }
    };
    el.onclick = null;
    return;
  }
  if (sel.length > 1) {
    el.innerHTML = '<div><p class="sec-t">Zaznaczenie</p><h3>' + sel.length + ' ' + plural(sel.length, 'element', 'elementy', 'elementów') + '</h3></div><div class="row"><button class="btn sm" data-act="seDup">' + I.copy + 'Duplikuj</button><button class="btn sm danger" data-act="seDel">' + I.trash + 'Usuń</button></div>' +
      '<label class="f" for="ms-layer">Przenieś na warstwę<select class="inp" id="ms-layer"><option value="">—</option>' + LAYERS.map(function (l) { return '<option value="' + l[0] + '">' + l[1] + '</option>'; }).join('') + '</select></label>' +
      '<div class="row"><button class="btn sm" data-x="lockall">' + I.lock + 'Zablokuj</button><button class="btn sm" data-x="unlockall">' + I.unlock + 'Odblokuj</button></div>' +
      '<div class="soft"><b class="small">Zestaw klocków</b><p class="xs muted">Zapisz te klocki razem, żeby wstawiać je jednym kliknięciem.</p><div class="row"><input class="inp" id="pf-name" maxlength="30" placeholder="Nazwa zestawu, np. Domek" style="flex:1"><button class="btn sm pri" data-x="prefab">' + I.prefab + 'Zapisz zestaw</button></div></div>';
    el.onchange = function (e) { if (e.target.id === 'ms-layer' && e.target.value) { mut(function () { sel.forEach(function (i) { i.layer = e.target.value; }); }); drawSE(); if (SE.left === 'hier') seLeft(); } };
    el.oninput = null;
    el.onclick = function (e) {
      var b = e.target.closest('[data-x]'); if (!b) return;
      if (b.dataset.x === 'lockall' || b.dataset.x === 'unlockall') { mut(function () { sel.forEach(function (i) { i.locked = b.dataset.x === 'lockall'; }); }); drawSE(); }
      if (b.dataset.x === 'prefab') {
        var nm = ($('#pf-name').value || '').trim() || 'Zestaw ' + (P.prefabs.length + 1);
        var mx = Math.min.apply(null, sel.map(function (i) { return i.x; })), my = Math.min.apply(null, sel.map(function (i) { return i.y; }));
        mut(function () { P.prefabs.push({ id: uid('pf'), name: nm.slice(0, 30), items: sel.map(function (i) { return { obj: i.obj, dx: i.x - mx, dy: i.y - my, layer: i.layer, ov: clone(i.ov || {}), flip: !!i.flip }; }) }); });
        SE.left = 'prefaby'; seLeft(); toast('Zestaw zapisany – znajdziesz go w zakładce „Zestawy”.', 'ok');
      }
    };
    return;
  }
  var i = sel[0], d = P.objects[i.obj], r = RI(i);
  if (!d || !r) { el.innerHTML = '<div class="banner">' + I.alert + '<span>Ta instancja odwołuje się do usuniętego obiektu.</span></div><div><button class="btn sm danger" data-act="seDel">' + I.trash + 'Usuń instancję</button></div>'; return; }
  var rd = R(i.obj);
  var h = '<div class="ptitle"><img alt="" src="' + defIcon(i.obj, 52) + '"><div><p class="sec-t">Klocek na planszy · ' + esc(d.category) + '</p><h3>' + esc(d.name) + '</h3><button class="linkbtn" data-x="editdef">Zmień wygląd tej postaci lub rzeczy</button></div></div>';
  h += '<div class="row"><label class="f grow" for="in-x">X<input class="inp" type="number" id="in-x" min="0" max="' + (sc.cols - 1) + '" value="' + i.x + '"></label><label class="f grow" for="in-y">Y<input class="inp" type="number" id="in-y" min="0" max="' + (sc.rows - 1) + '" value="' + i.y + '"></label></div>';
  h += '<label class="f" for="in-layer">Warstwa<select class="inp" id="in-layer">' + LAYERS.map(function (l) { return '<option value="' + l[0] + '"' + (i.layer === l[0] ? ' selected' : '') + '>' + l[1] + '</option>'; }).join('') + '</select></label>';
  h += '<div class="row"><label class="sw"><input type="checkbox" id="in-flip"' + (i.flip ? ' checked' : '') + '>Odbij w poziomie</label><label class="sw"><input type="checkbox" id="in-lock"' + (i.locked ? ' checked' : '') + '>Zablokuj</label></div>';
  var comps = CGM.activeComps(rd);
  h += '<p class="sec-t">Tylko dla tego klocka</p><p class="xs muted">Zmiany tutaj dotyczą tylko tego jednego klocka. Inne takie same klocki się nie zmienią.</p>';
  if (!comps.length) h += '<p class="small muted">Ten obiekt nie ma komponentów.</p>';
  comps.forEach(function (cp) {
    var C = COMP[cp.type], fromUc = cp.from && cp.from.uc;
    h += '<div class="comp cat-' + C.group + '" style="box-shadow:none"><div class="comp-h"><b>' + C.name + '</b></div>';
    C.params.forEach(function (pp) {
      if (!pp.basic) return;
      if (pp.showIf) { var cur = CGM.getP(r, 'comps#' + cp.uid + '.p.' + pp.showIf[0]); if (pp.showIf.slice(1).indexOf(cur) < 0) return; }
      var path = 'comps#' + cp.uid + '.p.' + pp.k, ov = i.ov && path in i.ov;
      h += paramControl('ov-' + cp.uid + '-' + pp.k, pp, CGM.getP(r, path), { path: path, badge: ov ? '<span class="badge ov">zmienione</span> <button class="linkbtn" data-reset="' + esc(path) + '">przywróć</button>' : '' });
    });
    if (fromUc) h += '<p class="xs muted">Komponent użytkownika.</p>';
    h += '</div>';
  });
  h += '<div class="row" style="margin-top:4px"><button class="btn sm" data-act="seDup">' + I.copy + 'Duplikuj</button><button class="btn sm danger" data-act="seDel">' + I.trash + 'Usuń</button></div>';
  el.innerHTML = h;
  el.oninput = function (e) {
    var t = e.target;
    if (t.dataset.path) { pushUndo('ov:' + t.id); i.ov = i.ov || {}; i.ov[t.dataset.path] = readCtl(t); var o = t.parentNode.querySelector('output'); if (o) o.textContent = t.value; touched({ quiet: true }); drawSE(); return; }
  };
  el.onchange = function (e) {
    var t = e.target;
    if (t.id === 'in-x' || t.id === 'in-y') { mut(function () { i[t.id === 'in-x' ? 'x' : 'y'] = clamp(Math.round(+t.value || 0), 0, (t.id === 'in-x' ? sc.cols : sc.rows) - 1); }); drawSE(); }
    if (t.id === 'in-layer') { mut(function () { i.layer = t.value; }); drawSE(); if (SE.left === 'hier') seLeft(); }
    if (t.id === 'in-flip') { mut(function () { i.flip = t.checked; }); drawSE(); }
    if (t.id === 'in-lock') { mut(function () { i.locked = t.checked; }); drawSE(); }
    if (t.dataset.path) seRight();
  };
  el.onclick = function (e) {
    var rs = e.target.closest('[data-reset]'); if (rs) { mut(function () { delete i.ov[rs.dataset.reset]; }); seRight(); drawSE(); return; }
    var b = e.target.closest('[data-x]'); if (b && b.dataset.x === 'editdef') { OS.def = i.obj; go('obiekty'); }
  };
}
