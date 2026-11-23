
/* ================= OBJECT STUDIO ================= */
var OS = { def: 'player', q: '' };
function objList(cur, act, q) {
  var groups = {}; q = (q || '').toLowerCase();
  Object.keys(P.objects).forEach(function (id) { var d = P.objects[id]; if (q && (d.name + ' ' + (d.tags || []).join(' ') + ' ' + d.category).toLowerCase().indexOf(q) < 0) return; (groups[d.category] = groups[d.category] || []).push(id); });
  return CATEGORIES.map(function (cat) {
    if (!groups[cat]) return '';
    return '<p class="ogroup">' + cat + '</p><ul class="olist">' + groups[cat].map(function (id) { var d = P.objects[id], n = (R(id) || { comps: [] }).comps.length; return '<li><button class="orow" data-act="' + act + '" data-id="' + id + '" aria-current="' + (cur === id) + '"><img alt="" src="' + defIcon(id, 30) + '"><span class="meta"><b>' + esc(d.name) + '</b><small>' + (d.base ? 'wariant: ' + esc((P.objects[d.base] || {}).name || '?') + ' · ' : '') + n + ' ' + plural(n, 'komponent', 'komponenty', 'komponentów') + '</small></span></button></li>'; }).join('') + '</ul>';
  }).join('');
}
function usageCount(defId) { var n = 0; P.scenes.forEach(function (s) { s.inst.forEach(function (i) { if (i.obj === defId) n++; }); }); return n; }
function variantsOf(defId) { return Object.keys(P.objects).filter(function (k) { return P.objects[k].base === defId; }); }
function inhBadge(defId, path) {
  var d = P.objects[defId]; if (!d.base) return '';
  return defIsLocal(defId, path) ? '<span class="badge local">zmienione</span> <button class="linkbtn" data-reset="' + esc(path) + '">przywróć dziedziczone</button>' : '<span class="badge">dziedziczone</span>';
}
ROUTES.obiekty = function (v) {
  v.className = 'full';
  if (!P.objects[OS.def]) OS.def = Object.keys(P.objects)[0];
  v.innerHTML = '<div class="studio two"><aside class="pane" aria-label="Lista obiektów"><div class="row"><h3 class="grow" style="font-size:1.1rem">Obiekty</h3><button class="btn sm pri" data-act="osNew">' + I.plus + 'Nowy</button></div><label class="vh" for="os-q">Szukaj</label><input class="inp" id="os-q" placeholder="Szukaj po nazwie, tagu, kategorii…" value="' + esc(OS.q) + '"><div id="os-list">' + objList(OS.def, 'osPick', OS.q) + '</div></aside><div class="split" data-side="l"></div><section class="pane scroll" id="os-card" aria-label="Karta obiektu"></section></div>';
  bindSplits(v);
  $('#os-q').addEventListener('input', function (e) { OS.q = e.target.value; $('#os-list').innerHTML = objList(OS.def, 'osPick', OS.q); });
  osCard();
};
ACT.osPick = function (a) { OS.def = a.dataset.id; BS.def = a.dataset.id; $$('#os-list .orow').forEach(function (b) { b.setAttribute('aria-current', b.dataset.id === OS.def); }); osCard(); };
function osCard() {
  var el = $('#os-card'); if (!el) return;
  var id = OS.def, d = P.objects[id], r = R(id); if (!d || !r) { el.innerHTML = '<div class="empty">Wybierz obiekt.</div>'; return; }
  var sp = r.sprite, tdef = TYPES[sp.type] || {}, vars = variantsOf(id), used = usageCount(id);
  var imgAssets = Object.keys(P.assets).filter(function (k) { return P.assets[k].type === 'image'; });
  var h = '<div class="wrap" style="max-width:980px;gap:16px">';
  h += '<div class="ptitle"><img alt="" src="' + defIcon(id, 64) + '" style="width:64px;height:64px"><div class="grow"><p class="eyebrow">' + esc(d.category) + '</p><h1 style="font-size:1.8rem">' + esc(d.name) + '</h1><p class="small muted">Użyty w scenach: ' + used + ' ' + plural(used, 'raz', 'razy', 'razy') + (d.base ? ' · wariant obiektu „' + esc((P.objects[d.base] || {}).name || '?') + '”' : '') + '</p></div>' +
    '<div class="row"><button class="btn sm" data-act="osDup">' + I.copy + 'Duplikuj</button><button class="btn sm" data-act="osVariant">' + I.variant + 'Utwórz wariant</button><button class="btn sm" data-act="osToBS">' + I.behavior + 'Co robi?</button><button class="btn sm danger" data-act="osDel">' + I.trash + 'Usuń</button></div></div>';
  h += '<section class="sec"><h3>' + I.info + 'Nazwa i opis</h3><div class="g2"><label class="f" for="o-name">Nazwa<input class="inp" id="o-name" maxlength="40" value="' + esc(d.name) + '"></label>' +
    '<label class="f" for="o-cat">Kategoria<select class="inp" id="o-cat">' + CATEGORIES.map(function (c) { return '<option' + (c === d.category ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label>' +
    '<div class="field"><span class="lab">Identyfikator</span><code class="mono" style="padding:10px 0">' + esc(id) + '</code><span class="help">Stały – zmiana nazwy nie zrywa powiązań.</span></div></div>' +
    '<label class="f" for="o-desc">Opis<textarea class="inp" id="o-desc" maxlength="300">' + esc(d.desc || '') + '</textarea></label>' +
    '<label class="f" for="o-tags">Tagi (po przecinku)<input class="inp" id="o-tags" maxlength="120" value="' + esc((d.tags || []).join(', ')) + '"></label></section>';
  h += '<section class="sec"><h3>' + I.asset + 'Wygląd</h3><div class="g2">' +
    '<div class="field"><span class="lab"><label for="o-type">Grafika z biblioteki</label>' + inhBadge(id, 'sprite.type') + '</span><select class="inp" id="o-type" data-path="sprite.type">' + Object.keys(TYPES).filter(function (k) { return k !== 'bullet'; }).map(function (k) { return '<option value="' + k + '"' + (sp.type === k ? ' selected' : '') + '>' + TYPES[k].name + '</option>'; }).join('') + '</select></div>' +
    '<div class="field"><span class="lab"><label for="o-img">Własny obrazek (z kroku „Obrazki i dźwięki”)</label>' + inhBadge(id, 'sprite.img') + '</span><select class="inp" id="o-img" data-path="sprite.img"><option value="">— grafika z biblioteki —</option>' + imgAssets.map(function (k) { return '<option value="' + k + '"' + (sp.img === k ? ' selected' : '') + '>' + esc(P.assets[k].name) + (P.assets[k].sheet ? ' (animacja)' : '') + '</option>'; }).join('') + '</select></div>' +
    '<div class="field"><span class="lab"><label for="o-layer">Domyślna warstwa</label></span><select class="inp" id="o-layer">' + LAYERS.map(function (l) { return '<option value="' + l[0] + '"' + ((d.layer || 'swiat') === l[0] ? ' selected' : '') + '>' + l[1] + '</option>'; }).join('') + '</select></div></div>';
  if (tdef.variants && tdef.variants.length > 1 && !sp.img) h += '<div class="field"><span class="lab">Wariant grafiki ' + inhBadge(id, 'sprite.v') + '</span><div class="vchips" role="group" aria-label="Wariant grafiki">' + tdef.variants.map(function (vv) { return '<button class="vchip" data-variant="' + vv[0] + '" aria-pressed="' + (sp.v === vv[0]) + '"><img alt="" src="' + spriteURL({ type: sp.type, v: vv[0], color: sp.color }, 36) + '">' + esc(vv[1]) + '</button>'; }).join('') + '</div></div>';
  h += '<div class="g2"><div class="field"><span class="lab"><label for="o-color">Kolor</label>' + inhBadge(id, 'sprite.color') + '</span><div class="row" style="flex-wrap:nowrap"><input type="color" class="inp" id="o-color" value="' + (sp.color || '#888888') + '" style="padding:2px;height:40px"><button class="btn sm" data-x="nocolor"' + (sp.color ? '' : ' disabled') + '>Domyślny</button></div></div>' +
    '<div class="field"><span class="lab"><label for="o-w">Rozmiar (kratki) szer. × wys.</label>' + inhBadge(id, 'size.w') + '</span><div class="row" style="flex-wrap:nowrap"><input class="inp" type="number" id="o-w" min="1" max="6" value="' + (r.size.w || 1) + '" data-path="size.w"><input class="inp" type="number" id="o-h" min="1" max="6" value="' + (r.size.h || 1) + '" data-path="size.h"></div></div></div>';
  if (sp.img && P.assets[sp.img] && P.assets[sp.img].sheet) h += '<p class="small muted">Animacje stanów (idle, walk, jump) ustawisz w kroku „Obrazki i dźwięki”.</p>';
  h += '</section>';
  h += '<section class="sec"><h3>' + I.grid + 'Ruch i zderzenia</h3><div class="g2">' +
    '<div class="field"><span class="lab"><label for="o-body">Typ ruchu</label>' + inhBadge(id, 'body.type') + '</span><select class="inp" id="o-body" data-path="body.type">' + Object.keys(BODYTYPES).map(function (k) { return '<option value="' + k + '"' + (r.body.type === k ? ' selected' : '') + '>' + BODYTYPES[k].split(' – ')[0] + '</option>'; }).join('') + '</select><span class="help">' + esc(BODYTYPES[r.body.type] || '') + '</span></div>' +
    '<div class="field"><span class="lab"><label for="o-ccat">Kategoria kolizji</label>' + inhBadge(id, 'body.cat') + '</span><select class="inp" id="o-ccat" data-path="body.cat">' + COLCATS.map(function (c) { return '<option' + (r.body.cat === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select><span class="help">Co z czym się zderza – ustawisz w kroku „Zasady”.</span></div>' +
    '<div class="field"><span class="lab">Przenikanie ' + inhBadge(id, 'body.solid') + '</span><label class="sw"><input type="checkbox" id="o-solid" data-path="body.solid"' + (r.body.solid ? ' checked' : '') + '>Twardy – nie da się przez to przejść</label><span class="help">Wyłączone: można przez to przejść, np. moneta albo meta.</span></div></div>' +
    '<p class="xs muted">Obszar kolizji: prostokąt dopasowany do grafiki' + (tdef.hit ? ' (' + Math.round(tdef.hit[2] * 100) + '% × ' + Math.round(tdef.hit[3] * 100) + '% kratki)' : '') + '.</p></section>';
  var params = r.params || {};
  h += '<section class="sec"><h3>' + I.sliders + 'Własne ustawienia</h3><p class="small muted">Własne wartości obiektu: liczby, teksty, przełączniki i listy. Parametr „Śliska powierzchnia” zmienia hamowanie postaci na tym podłożu.</p>' +
    (Object.keys(params).length ? '<div class="tbl-wrap"><table class="tbl" style="min-width:520px"><thead><tr><th>Nazwa</th><th>Typ</th><th>Wartość</th><th></th></tr></thead><tbody>' + Object.keys(params).map(function (k) { var p = params[k], path = 'params.' + k + '.val'; return '<tr><td><b>' + esc(p.name) + '</b><div class="xs muted mono">' + esc(k) + '</div></td><td>' + ({ number: 'Liczba', text: 'Tekst', bool: 'Logiczna', choice: 'Wybór' })[p.type] + '</td><td>' + (p.type === 'bool' ? '<label class="sw"><input type="checkbox" data-param="' + k + '"' + (p.val ? ' checked' : '') + '><span class="vh">' + esc(p.name) + '</span></label>' : p.type === 'choice' ? '<select class="inp" data-param="' + k + '">' + String(p.opts || '').split(',').map(function (o) { o = o.trim(); return '<option' + (o === p.val ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>' : '<input class="inp" data-param="' + k + '"' + (p.type === 'number' ? ' type="number"' : '') + ' value="' + esc(p.val) + '">') + ' ' + inhBadge(id, path) + '</td><td>' + (d.base ? '' : '<button class="icobtn" data-delparam="' + k + '" aria-label="Usuń parametr ' + esc(p.name) + '">' + I.trash + '</button>') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="small muted">Brak parametrów.</p>') +
    (d.base ? '<p class="xs muted">Warianty dziedziczą parametry; nowe parametry dodawaj w obiekcie bazowym.</p>' : '<form class="row" id="o-addp"><input class="inp" id="o-pn" maxlength="30" placeholder="Nazwa parametru" style="flex:2;min-width:140px"><select class="inp" id="o-pt" style="flex:1;min-width:120px"><option value="number">Liczba</option><option value="text">Tekst</option><option value="bool">Logiczna</option><option value="choice">Wybór z listy</option></select><input class="inp" id="o-po" placeholder="Opcje: a, b, c" style="flex:1.5;min-width:120px"><button class="btn sm" type="submit">' + I.plus + 'Dodaj</button></form>') + '</section>';
  var comps = r.comps || [];
  h += '<section class="sec"><h3>' + I.behavior + 'Co robi ta postać lub rzecz</h3>' + (comps.length ? '<ul class="issues">' + comps.map(function (cp) { var C = COMP[cp.type]; return '<li class="issue"><span class="gchip bg-' + C.group + '">' + GROUPS2[C.group] + '</span><div class="grow"><b>' + C.name + '</b>' + (cp.on === false ? ' <span class="badge">wyłączony</span>' : '') + '<div class="xs muted">' + esc(C.desc) + '</div></div></li>'; }).join('') + '</ul>' : '<p class="small muted">Brak komponentów – obiekt jest tylko grafiką lub przeszkodą.</p>') + '<div><button class="btn sm pri" data-act="osToBS">' + I.behavior + 'Dodaj lub zmień zachowania</button></div></section>';
  var deps = objectDeps(id, r);
  h += '<section class="sec"><h3>' + I.link + 'Z czym się łączy</h3>' + (deps.length ? '<ul class="issues">' + deps.map(function (x) { return '<li class="issue ' + (x.ok ? 'good' : 'err') + '">' + (x.ok ? I.check : I.alert) + '<div><div class="lbl">' + esc(x.kind) + '</div>' + esc(x.text) + '</div></li>'; }).join('') + '</ul>' : '<p class="small muted">Obiekt nie ma wymaganych zależności.</p>') + '</section>';
  h += '<section class="sec"><h3>' + I.variant + 'Warianty</h3><p class="small muted">Wariant dziedziczy ustawienia obiektu bazowego i nadpisuje tylko wybrane wartości. Przy każdym polu widać, czy wartość jest dziedziczona, czy zmieniona.</p>' +
    (vars.length ? '<ul class="olist">' + vars.map(function (k) { var vd = P.objects[k], n = Object.keys(vd.local || {}).length; return '<li><button class="orow" data-act="osPick" data-id="' + k + '"><img alt="" src="' + defIcon(k, 30) + '"><span class="meta"><b>' + esc(vd.name) + '</b><small>' + n + ' ' + plural(n, 'zmiana', 'zmiany', 'zmian') + ' względem bazowego</small></span></button></li>'; }).join('') + '</ul>' : '<p class="small muted">Ten obiekt nie ma wariantów.</p>') +
    '<div><button class="btn sm" data-act="osVariant">' + I.variant + 'Utwórz wariant</button></div></section></div>';
  el.innerHTML = h;
  el.oninput = function (e) {
    var t = e.target;
    if (t.id === 'o-name') { pushUndo('oname'); d.name = t.value.slice(0, 40) || 'Obiekt'; touched({ quiet: true }); $('#os-list').innerHTML = objList(OS.def, 'osPick', OS.q); return; }
    if (t.id === 'o-desc') { pushUndo('odesc'); d.desc = t.value; touched({ quiet: true }); return; }
    if (t.id === 'o-tags') { pushUndo('otags'); d.tags = t.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean); touched({ quiet: true }); return; }
    if (t.id === 'o-color') { pushUndo('ocolor'); defSet(id, 'sprite.color', t.value); touched({ quiet: true }); spriteCache = {}; return; }
    if (t.dataset.param && t.type !== 'checkbox' && t.tagName !== 'SELECT') { pushUndo('p' + t.dataset.param); defSet(id, 'params.' + t.dataset.param + '.val', t.type === 'number' ? +t.value : t.value); touched({ quiet: true }); }
  };
  el.onchange = function (e) {
    var t = e.target;
    if (t.id === 'o-cat') { mut(function () { d.category = t.value; }); $('#os-list').innerHTML = objList(OS.def, 'osPick', OS.q); return; }
    if (t.id === 'o-layer') { mut(function () { d.layer = t.value; }); return; }
    if (t.id === 'o-color') { osCard(); return; }
    if (t.dataset.param && (t.type === 'checkbox' || t.tagName === 'SELECT')) { mut(function () { defSet(id, 'params.' + t.dataset.param + '.val', t.type === 'checkbox' ? t.checked : t.value); }); osCard(); return; }
    if (t.dataset.path) {
      var val = t.type === 'checkbox' ? t.checked : t.type === 'number' ? clamp(Math.round(+t.value || 1), 1, 6) : t.value;
      mut(function () { defSet(id, t.dataset.path, val); if (t.dataset.path === 'sprite.type') { var vs = (TYPES[val] || {}).variants; defSet(id, 'sprite.v', vs ? vs[0][0] : ''); } });
      spriteCache = {}; osCard(); $('#os-list').innerHTML = objList(OS.def, 'osPick', OS.q);
    }
  };
  el.onclick = function (e) {
    var rs = e.target.closest('[data-reset]'); if (rs) { mut(function () { defReset(id, rs.dataset.reset); }); spriteCache = {}; osCard(); return; }
    var vb = e.target.closest('[data-variant]'); if (vb) { mut(function () { defSet(id, 'sprite.v', vb.dataset.variant); }); spriteCache = {}; osCard(); $('#os-list').innerHTML = objList(OS.def, 'osPick', OS.q); return; }
    var dp = e.target.closest('[data-delparam]'); if (dp) { mut(function () { delete d.data.params[dp.dataset.delparam]; }); osCard(); return; }
    var x = e.target.closest('[data-x]'); if (x && x.dataset.x === 'nocolor') { mut(function () { if (d.base) defSet(id, 'sprite.color', null); else delete d.data.sprite.color; }); spriteCache = {}; osCard(); }
  };
  var fp = $('#o-addp'); if (fp) fp.addEventListener('submit', function (e) {
    e.preventDefault(); var nm = $('#o-pn').value.trim(); if (!nm) { toast('Wpisz nazwę parametru.', 'warn'); return; }
    var k = slug(nm).replace(/-/g, '_') || 'param', tp = $('#o-pt').value;
    while (d.data.params[k]) k += '_2';
    mut(function () { d.data.params[k] = { name: nm, type: tp, val: tp === 'number' ? 0 : tp === 'bool' ? false : tp === 'choice' ? ($('#o-po').value.split(',')[0] || '').trim() : '', opts: tp === 'choice' ? $('#o-po').value : undefined }; });
    osCard();
  });
}
var GROUPS2 = CGM.GROUPS;
function objectDeps(id, r) {
  var out = [], items = itemNames();
  CGM.activeComps(r).forEach(function (c) {
    var C = COMP[c.type], rq = C.req || {};
    if (rq.body) out.push({ kind: 'Wymaganie', text: C.name + ' wymaga typu ruchu „' + ({ dynamic: 'Dynamiczny', kinematic: 'Kinetyczny', static: 'Statyczny' })[rq.body] + '”.', ok: r.body.type === rq.body });
    if (rq.solid) out.push({ kind: 'Wymaganie', text: C.name + ' wymaga, by obiekt blokował ruch.', ok: !!r.body.solid });
    if (rq.comp) out.push({ kind: 'Wymaganie', text: C.name + ' wymaga komponentu ' + COMP[rq.comp].name + '.', ok: CGM.activeComps(r).some(function (x) { return x.type === rq.comp; }) });
    if (c.type === 'door' && c.p.need === 'item') out.push({ kind: 'Dane wejściowe', text: 'Ekwipunek → „' + c.p.item + '” (źródło: ' + (pickupSources(c.p.item).map(function (k) { return P.objects[k].name; }).join(', ') || 'brak') + ').', ok: items.indexOf(c.p.item) >= 0 });
    if (c.type === 'door' && c.p.need === 'switch') out.push({ kind: 'Dane wejściowe', text: 'Sygnał z kanału „' + (c.p.tag || 'A') + '” (przełączniki: ' + (leverSources(c.p.tag || 'A').map(function (k) { return P.objects[k].name; }).join(', ') || 'brak') + ').', ok: leverSources(c.p.tag || 'A').length > 0 });
    if (c.type === 'door' && c.p.need === 'score') out.push({ kind: 'Dane wejściowe', text: 'Punktacja → Wynik ≥ ' + c.p.score + '.', ok: P.mechanics.score.on !== false });
    if (c.type === 'pickup' && c.p.toInv) out.push({ kind: 'Dane wyjściowe', text: 'Dodaje do ekwipunku: „' + (c.p.item || r.name) + '”.', ok: true });
    if (c.type === 'pickup' && c.p.points) out.push({ kind: 'Dane wyjściowe', text: 'Punktacja → Wynik +' + c.p.points + '.', ok: P.mechanics.score.on !== false });
    if (c.type === 'lever') out.push({ kind: 'Dane wyjściowe', text: 'Sygnał na kanał „' + (c.p.tag || 'A') + '”.', ok: true });
    if (c.type === 'goal' && c.p.action === 'goto') out.push({ kind: 'Przejście', text: 'Do sceny „' + ((sceneById(c.p.scene) || {}).name || 'nie wybrano') + '”.', ok: !!sceneById(c.p.scene) });
    (C.conflicts || []).forEach(function (cf) { if (CGM.activeComps(r).some(function (x) { return x.type === cf; })) out.push({ kind: 'Konflikt', text: C.name + ' i ' + COMP[cf].name + ' nie mogą działać razem.', ok: false }); });
  });
  return out;
}
function pickupSources(item) { return Object.keys(P.objects).filter(function (k) { var r = R(k); return r && CGM.activeComps(r).some(function (c) { return c.type === 'pickup' && c.p.toInv && (c.p.item || r.name) === item; }); }); }
function leverSources(tag) { return Object.keys(P.objects).filter(function (k) { var r = R(k); return r && CGM.activeComps(r).some(function (c) { return c.type === 'lever' && (c.p.tag || 'A') === tag; }); }); }
ACT.osToBS = function () { BS.def = OS.def; go('zachowania'); };
ACT.osNew = function () {
  openModal({ title: 'Nowy obiekt', body: '<label class="f" for="nn">Nazwa<input class="inp" id="nn" maxlength="40" autofocus placeholder="np. Kolczasty jeż"></label><label class="f" for="nc">Kategoria<select class="inp" id="nc">' + CATEGORIES.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select></label><label class="f" for="nt">Grafika startowa<select class="inp" id="nt">' + Object.keys(TYPES).filter(function (k) { return k !== 'bullet'; }).map(function (k) { return '<option value="' + k + '">' + TYPES[k].name + '</option>'; }).join('') + '</select></label><p class="small muted">Typ ruchu i kategorię kolizji dobierzemy do kategorii – możesz je potem zmienić.</p>',
    actions: [{ label: 'Anuluj' }, { label: 'Utwórz', cls: 'pri', fn: function (root) {
      var nm = $('#nn', root).value.trim() || 'Nowy obiekt', cat = $('#nc', root).value, tp = $('#nt', root).value;
      var body = cat === 'Postać grywalna' ? BODY.player : cat === 'Przeciwnik' ? BODY.enemy : cat === 'Przedmiot' ? BODY.item : cat === 'Dekoracja' ? BODY.none : cat === 'Obiekt interaktywny' ? BODY.sensor : BODY.wall;
      var nid = uid('o'); mut(function () { P.objects[nid] = defn(nid, nm, cat, { type: tp, v: ((TYPES[tp].variants || [])[0] || [''])[0] }, clone(body), [], { layer: cat === 'Dekoracja' ? 'tlo' : 'swiat' }); });
      OS.def = nid; render();
    } }] });
};
ACT.osDup = function () { var d = P.objects[OS.def]; var nid = uid('o'); mut(function () { var c = clone(d); c.id = nid; c.name = (d.name + ' (kopia)').slice(0, 40); (c.data.comps || []).forEach(function (cp) { var old = cp.uid; cp.uid = uid('c'); Object.keys(c.local || {}).forEach(function (k) { if (k.indexOf('comps#' + old) === 0) { c.local[k.replace(old, cp.uid)] = c.local[k]; delete c.local[k]; } }); }); P.objects[nid] = c; }); OS.def = nid; render(); toast('Zduplikowano obiekt.', 'ok'); };
ACT.osVariant = function () { var d = P.objects[OS.def]; var nid = uid('o'); mut(function () { P.objects[nid] = { id: nid, name: (d.name + ' – wariant').slice(0, 40), category: d.category, desc: '', tags: (d.tags || []).slice(), base: OS.def, layer: d.layer, local: {}, data: { comps: [] } }; }); OS.def = nid; render(); toast('Utworzono wariant. Zmień wybrane wartości – reszta jest dziedziczona.', 'ok'); };
ACT.osDel = function () {
  var id = OS.def, d = P.objects[id], used = usageCount(id), vars = variantsOf(id);
  openModal({ title: 'Usunąć „' + d.name + '”?', body: '<p>' + (used ? 'Obiekt jest użyty w scenach ' + used + ' ' + plural(used, 'raz', 'razy', 'razy') + ' – te instancje też zostaną usunięte. ' : '') + (vars.length ? 'Ma ' + vars.length + ' ' + plural(vars.length, 'wariant', 'warianty', 'wariantów') + ', które staną się samodzielnymi obiektami. ' : '') + 'Możesz to cofnąć (Ctrl+Z).</p>',
    actions: [{ label: 'Nie, zostaw' }, { label: 'Usuń obiekt', cls: 'pri', fn: function () {
      mut(function () {
        vars.forEach(function (k) { var vd = P.objects[k], full = R(k); vd.data = { sprite: full.sprite, size: full.size, body: full.body, params: full.params, comps: full.comps }; vd.base = null; vd.local = {}; });
        delete P.objects[id]; P.scenes.forEach(function (s) { s.inst = s.inst.filter(function (i) { return i.obj !== id; }); });
      });
      OS.def = Object.keys(P.objects)[0]; render(); toast('Obiekt usunięty.');
    } }] });
};
