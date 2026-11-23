/* ================= BEHAVIOR STUDIO ================= */
var KIDCAT = { 'Ruch i sterowanie': 'Ruch', 'Fizyka i kolizje': 'Skoki i platformy', 'Interakcje': 'Przedmioty i drzwi', 'Walka': 'Walka', 'Przeciwnicy i NPC': 'Wrogowie i postacie', 'Kamera': 'Kamera' };
var BS = { def: 'player', q: '', cat: '', pick: null, showHidden: {} };
ROUTES.zachowania = function (v) {
  v.className = 'full';
  if (!P.objects[BS.def]) BS.def = Object.keys(P.objects)[0];
  v.innerHTML = '<div class="studio"><aside class="pane" aria-label="Obiekty"><h3 style="font-size:1.1rem">Obiekt</h3><div id="bs-list">' + objList(BS.def, 'bsPick', '') + '</div></aside><div class="split" data-side="l"></div><section class="pane scroll" id="bs-main" aria-label="Komponenty obiektu"></section><div class="split" data-side="r"></div><aside class="pane" id="bs-cat" aria-label="Katalog zachowań"></aside></div>';
  bindSplits(v); bsMain(); bsCat();
};
ACT.bsPick = function (a) { BS.def = a.dataset.id; OS.def = a.dataset.id; $$('#bs-list .orow').forEach(function (b) { b.setAttribute('aria-current', b.dataset.id === BS.def); }); bsMain(); bsCat(); };
function bsMain() {
  var el = $('#bs-main'); if (!el) return;
  var id = BS.def, d = P.objects[id], r = R(id); if (!r) return;
  var types = CGM.activeComps(r).map(function (c) { return c.type; });
  var h = '<div class="wrap" style="max-width:900px;gap:14px"><div class="ptitle"><img alt="" src="' + defIcon(id, 56) + '" style="width:56px;height:56px"><div class="grow"><p class="eyebrow">Zachowania</p><h1 style="font-size:1.7rem">' + esc(d.name) + '</h1><p class="small muted">Każde zachowanie to gotowy klocek. Możesz je włączać, wyłączać i zmieniać suwakami.</p></div><button class="btn sm" data-act="ucNew">' + I.package + 'Zapisz jako mój zestaw zachowań</button></div>';
  var comps = r.comps || [];
  if (!comps.length) h += '<div class="empty">' + I.behavior + '<b>Brak komponentów</b><span>Wybierz zachowanie z listy po prawej i kliknij „Dodaj”.</span></div>';
  var movers = CGM.activeComps(r).filter(function (c) { return COMP[c.type].group === 'ruch'; });
  if (movers.length > 1) h += '<div class="banner">' + I.alert + '<span>Ruchem sterują ' + movers.length + ' komponenty. Działa <b>' + COMP[movers[0].type].name + '</b> (najwyższy priorytet). Pozostałe są w gotowości – wyłącz je albo zmień priorytety.</span></div>';
  comps.forEach(function (cp) {
    var C = COMP[cp.type], own = !d.base || isOwnComp(d, cp.uid), base = 'comps#' + cp.uid;
    var uc = cp.from && cp.from.uc ? LIB.ucomps.filter(function (u) { return u.id === cp.from.uc; })[0] : null;
    var hideMode = uc && !BS.showHidden[cp.uid];
    var rq = C.req || {}, reqs = [];
    if (rq.body) reqs.push([r.body.type === rq.body, 'Typ ruchu: ' + ({ dynamic: 'Dynamiczny', kinematic: 'Kinetyczny', static: 'Statyczny' })[rq.body]]);
    if (rq.solid) reqs.push([!!r.body.solid, 'Obiekt blokuje ruch']);
    if (rq.comp) reqs.push([types.indexOf(rq.comp) >= 0, 'Komponent: ' + COMP[rq.comp].name]);
    (C.conflicts || []).forEach(function (cf) { reqs.push([types.indexOf(cf) < 0 || cp.on === false, 'Bez konfliktu z: ' + COMP[cf].name]); });
    if (C.view === 'side' || ['platformer', 'gravity', 'stomp', 'spring'].indexOf(cp.type) >= 0) reqs.push([P.settings.view === 'side', 'Widok z boku']);
    h += '<article class="comp cat-' + C.group + (cp.on === false ? ' off' : '') + '"><div class="comp-h"><b>' + C.name + '</b><span class="gchip bg-' + C.group + '">' + GROUPS2[C.group] + '</span>' + (own ? '' : '<span class="badge">dziedziczony</span>') + (uc ? '<span class="badge ov">' + esc(uc.name) + ' v' + cp.from.ver + '</span>' : '') +
      '<span class="grow"></span><label class="f" style="flex-direction:row;align-items:center;gap:6px" for="pr-' + cp.uid + '">Priorytet ' + inhBadge(id, base + '.prio') + '<select class="inp" id="pr-' + cp.uid + '" data-path="' + base + '.prio" data-kind="int" style="width:auto;min-height:34px;padding:2px 6px">' + [1, 2, 3, 4].map(function (n) { return '<option value="' + n + '"' + ((cp.prio || 2) === n ? ' selected' : '') + '>' + CGM.PRIO[n] + '</option>'; }).join('') + '</select></label>' +
      '<label class="sw" title="Wyłącz tymczasowo bez usuwania konfiguracji"><input type="checkbox" data-path="' + base + '.on" data-kind="bool"' + (cp.on !== false ? ' checked' : '') + '><span class="vh">Aktywny: ' + C.name + '</span><span class="st">' + (cp.on !== false ? 'Aktywny' : 'Wyłączony') + '</span></label>' +
      (own ? '<button class="icobtn" data-delcomp="' + cp.uid + '" aria-label="Usuń komponent ' + C.name + '">' + I.trash + '</button>' : '') + '</div>' +
      '<p class="xs muted">' + esc(C.desc) + '</p>' +
      (reqs.length ? '<div class="row" style="gap:4px 12px">' + reqs.map(function (q) { return '<span class="req ' + (q[0] ? 'ok' : 'bad') + '">' + (q[0] ? I.check : I.alert) + esc(q[1]) + '</span>'; }).join('') + '</div>' : '');
    if (uc && uc.version > cp.from.ver && cp.from.skip !== uc.version) h += '<div class="banner">' + I.info + '<span class="grow">Dostępna wersja v' + uc.version + ' komponentu „' + esc(uc.name) + '”.</span><button class="btn sm" data-ucup="' + cp.uid + '">Aktualizuj</button><button class="btn sm" data-ucdiff="' + cp.uid + '">Pokaż różnice</button><button class="btn sm" data-ucskip="' + cp.uid + '">Pozostaw</button></div>';
    var basic = '', adv = '';
    C.params.forEach(function (pp) {
      if (pp.showIf) { var cur = cp.p[pp.showIf[0]]; if (pp.showIf.slice(1).indexOf(cur) < 0) return; }
      if (hideMode && (uc.public || []).indexOf(cp.from.idx + '.' + pp.k) < 0) return;
      var path = base + '.p.' + pp.k, ctl = paramControl('bp-' + cp.uid + '-' + pp.k, pp, cp.p[pp.k], { path: path, badge: inhBadge(id, path) });
      if (pp.adv) adv += ctl; else basic += ctl;
    });
    h += '<div class="g2">' + basic + '</div>';
    if (adv) h += '<details><summary>Więcej ustawień</summary><div class="g2">' + adv + '</div></details>';
    if (uc) h += '<button class="linkbtn" data-showhid="' + cp.uid + '">' + (hideMode ? 'Pokaż ukryte parametry' : 'Ukryj parametry prywatne') + '</button>';
    if (C.table) h += aiTable(id, cp);
    var profs = LIB.profiles.filter(function (p) { return p.type === cp.type; });
    h += '<div class="row" style="border-top:2px solid var(--line);padding-top:8px"><span class="small muted">Ustawienia:</span><label class="vh" for="pf-' + cp.uid + '">Zastosuj profil</label><select class="inp" id="pf-' + cp.uid + '" data-profile="' + cp.uid + '" style="width:auto;min-height:34px;padding:2px 8px"><option value="">' + (profs.length ? 'Wczytaj zapisane ustawienia…' : 'Brak zapisanych ustawień') + '</option>' + profs.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + '</option>'; }).join('') + '</select><button class="btn sm" data-saveprof="' + cp.uid + '">' + I.save + 'Zapisz ustawienia</button></div>';
    h += '</article>';
  });
  h += '</div>';
  el.innerHTML = h;
  el.oninput = function (e) {
    var t = e.target; if (!t.dataset.path || t.dataset.kind === 'bool' || t.tagName === 'SELECT') return;
    pushUndo('bp:' + t.id); defSet(id, t.dataset.path, readCtl(t)); var o = t.parentNode.querySelector('output'); if (o) o.textContent = t.value; touched({ quiet: true });
  };
  el.onchange = function (e) {
    var t = e.target;
    if (t.dataset.profile) { var pr = LIB.profiles.filter(function (p) { return p.id === t.value; })[0]; if (pr) { mut(function () { Object.keys(pr.p).forEach(function (k) { defSet(id, 'comps#' + t.dataset.profile + '.p.' + k, pr.p[k]); }); }); toast('Zastosowano profil „' + pr.name + '”.', 'ok'); bsMain(); } return; }
    if (t.dataset.ai) { var cpU = t.dataset.ai, cur = clone(defGet(id, 'comps#' + cpU + '.p.rows') || []); var ix = +t.dataset.i, f = t.dataset.f; if (f === 'init') { mut(function () { defSet(id, 'comps#' + cpU + '.p.init', t.value); }); } else { cur[ix][f] = (f === 'val' || f === 'prio') ? +t.value : t.value; mut(function () { defSet(id, 'comps#' + cpU + '.p.rows', cur); }); } bsMain(); return; }
    if (t.dataset.path) { var val = t.dataset.kind === 'int' ? +t.value : readCtl(t); mut(function () { defSet(id, t.dataset.path, val); }); bsMain(); }
  };
  el.onclick = function (e) {
    var b;
    if ((b = e.target.closest('[data-reset]'))) { mut(function () { defReset(id, b.dataset.reset); }); bsMain(); return; }
    if ((b = e.target.closest('[data-delcomp]'))) { mut(function () { d.data.comps = d.data.comps.filter(function (c) { return c.uid !== b.dataset.delcomp; }); Object.keys(d.local || {}).forEach(function (k) { if (k.indexOf('comps#' + b.dataset.delcomp) === 0) delete d.local[k]; }); }); bsMain(); $('#bs-list').innerHTML = objList(BS.def, 'bsPick', ''); return; }
    if ((b = e.target.closest('[data-saveprof]'))) { saveProfileDlg(id, b.dataset.saveprof); return; }
    if ((b = e.target.closest('[data-showhid]'))) { BS.showHidden[b.dataset.showhid] = !BS.showHidden[b.dataset.showhid]; bsMain(); return; }
    if ((b = e.target.closest('[data-aiadd]'))) { var cur = clone(defGet(id, 'comps#' + b.dataset.aiadd + '.p.rows') || []); cur.push({ from: 'patrol', cond: 'see', val: 0, to: 'chase', prio: 2 }); mut(function () { defSet(id, 'comps#' + b.dataset.aiadd + '.p.rows', cur); }); bsMain(); return; }
    if ((b = e.target.closest('[data-aidel]'))) { var p2 = b.dataset.aidel.split(':'), cur2 = clone(defGet(id, 'comps#' + p2[0] + '.p.rows') || []); cur2.splice(+p2[1], 1); mut(function () { defSet(id, 'comps#' + p2[0] + '.p.rows', cur2); }); bsMain(); return; }
    if ((b = e.target.closest('[data-ucup]'))) { ucUpdate(id, b.dataset.ucup); return; }
    if ((b = e.target.closest('[data-ucskip]'))) { var cp = (r.comps || []).filter(function (c) { return c.uid === b.dataset.ucskip; })[0]; var ucx = LIB.ucomps.filter(function (u) { return u.id === cp.from.uc; })[0]; mut(function () { defSet(id, 'comps#' + cp.uid + '.from', Object.assign({}, cp.from, { skip: ucx.version })); }); bsMain(); return; }
    if ((b = e.target.closest('[data-ucdiff]'))) { ucDiff(id, b.dataset.ucdiff); }
  };
}
function aiTable(id, cp) {
  var p = cp.p, ST = CGM.AI_STATES, CN = CGM.AI_CONDS, rows = p.rows || [], iss = aiIssues(p);
  var h = '<div class="soft" style="background:var(--surface2)"><div class="row"><b class="grow">Kiedy co robi? (tabela stanów)</b><label class="f" style="flex-direction:row;align-items:center;gap:6px" for="ai-init-' + cp.uid + '">Stan początkowy<select class="inp" id="ai-init-' + cp.uid + '" data-ai="' + cp.uid + '" data-f="init" style="width:auto;min-height:34px;padding:2px 6px">' + Object.keys(ST).map(function (k) { return '<option value="' + k + '"' + (p.init === k ? ' selected' : '') + '>' + ST[k] + '</option>'; }).join('') + '</select></label></div>' +
    '<p class="xs muted">Każdy wiersz: gdy obiekt jest w stanie bieżącym i spełniony jest warunek, przechodzi do stanu docelowego. Wyższy priorytet sprawdzany jest pierwszy.</p>' +
    '<div class="tbl-wrap" style="border-width:0"><table class="st"><thead><tr><th>Stan bieżący</th><th>Warunek</th><th>N</th><th>Stan docelowy</th><th>Priorytet</th><th></th></tr></thead><tbody>' +
    rows.map(function (r2, i) {
      var sel = function (f, opts, val) { return '<select class="inp" data-ai="' + cp.uid + '" data-i="' + i + '" data-f="' + f + '" aria-label="' + f + ' wiersz ' + (i + 1) + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; };
      var needN = ['lost', 'near', 'hp', 'time'].indexOf(r2.cond) >= 0;
      return '<tr><td>' + sel('from', [['any', 'Dowolny']].concat(Object.keys(ST).map(function (k) { return [k, ST[k]]; })), r2.from) + '</td><td>' + sel('cond', Object.keys(CN).map(function (k) { return [k, CN[k]]; }), r2.cond) + '</td><td>' + (needN ? '<input class="inp" type="number" min="0" max="100" style="width:4.5em" data-ai="' + cp.uid + '" data-i="' + i + '" data-f="val" value="' + (r2.val || 0) + '" aria-label="Wartość N wiersz ' + (i + 1) + '">' : '<span class="muted">—</span>') + '</td><td>' + sel('to', Object.keys(ST).map(function (k) { return [k, ST[k]]; }), r2.to) + '</td><td>' + sel('prio', [[1, 'Niski'], [2, 'Średni'], [3, 'Wysoki'], [4, 'Najwyższy']], r2.prio || 2) + '</td><td><button class="icobtn" data-aidel="' + cp.uid + ':' + i + '" aria-label="Usuń wiersz ' + (i + 1) + '">' + I.trash + '</button></td></tr>';
    }).join('') + '</tbody></table></div><div><button class="btn sm" data-aiadd="' + cp.uid + '">' + I.plus + 'Dodaj przejście</button></div>' +
    (iss.length ? iss.map(function (m) { return '<div class="dg">' + lvChip(m[0]) + '<span>' + esc(m[1]) + '</span></div>'; }).join('') : '<div class="req ok">' + I.check + 'Tabela jest spójna.</div>') + '</div>';
  return h;
}
function saveProfileDlg(defId, cuid) {
  var cp = (R(defId).comps || []).filter(function (c) { return c.uid === cuid; })[0]; if (!cp) return;
  openModal({ title: 'Zapisz profil: ' + COMP[cp.type].name, body: '<p class="small muted">Profil to zapisana konfiguracja komponentu. Możesz go potem zastosować w dowolnym obiekcie i projekcie.</p><label class="f" for="prn">Nazwa profilu<input class="inp" id="prn" maxlength="40" autofocus placeholder="np. Szybki przeciwnik"></label>',
    actions: [{ label: 'Anuluj' }, { label: 'Zapisz profil', cls: 'pri', fn: function (root) { var n = $('#prn', root).value.trim() || COMP[cp.type].name + ' – profil'; LIB.profiles.push({ id: uid('pr'), name: n, type: cp.type, p: clone(cp.p) }); saveLib(); toast('Profil „' + n + '” zapisany w bibliotece.', 'ok'); bsMain(); } }] });
}
function bsCat() {
  var el = $('#bs-cat'); if (!el) return;
  var q = BS.q.toLowerCase(), r = R(BS.def), have = (r ? r.comps : []).map(function (c) { return c.type; });
  var list = Object.keys(COMP).filter(function (k) { var C = COMP[k]; return (!BS.cat || C.cat === BS.cat) && (!q || (C.name + ' ' + C.desc + ' ' + C.cat).toLowerCase().indexOf(q) >= 0); });
  var h = '<h3 style="font-size:1.1rem">Lista zachowań</h3><label class="vh" for="bs-q">Szukaj zachowania</label><input class="inp" id="bs-q" placeholder="Szukaj, np. skok, patrol…" value="' + esc(BS.q) + '">' +
    '<div class="row" style="gap:4px">' + ['', 'Ruch i sterowanie', 'Fizyka i kolizje', 'Interakcje', 'Walka', 'Przeciwnicy i NPC', 'Kamera'].map(function (c) { return '<button class="btn sm' + (BS.cat === c ? ' on' : '') + '" data-bscat="' + c + '" aria-pressed="' + (BS.cat === c) + '">' + (KIDCAT[c] || 'Wszystkie') + '</button>'; }).join('') + '</div>';
  h += '<div style="display:flex;flex-direction:column;gap:6px">' + list.map(function (k) { var C = COMP[k]; return '<button class="cat-item cat-' + C.group + '" data-bsp="' + k + '" aria-pressed="' + (BS.pick === k) + '"><b>' + C.name + (have.indexOf(k) >= 0 ? ' ✓' : '') + '</b><span>' + esc(C.desc.split('.')[0]) + '.</span></button>'; }).join('') + (list.length ? '' : '<p class="small muted">Nic nie pasuje do wyszukiwania.</p>') + '</div>';
  if (BS.pick && COMP[BS.pick]) {
    var C = COMP[BS.pick], rq = C.req || {};
    h += '<div class="soft"><b style="font-family:var(--f-display);font-size:1.05rem">' + C.name + '</b><p class="small">' + esc(C.desc) + '</p>' +
      '<p class="xs"><b>Wymagania:</b> ' + ([rq.body ? 'typ ruchu ' + ({ dynamic: 'Dynamiczny', kinematic: 'Kinetyczny', static: 'Statyczny' })[rq.body] : '', rq.solid ? 'obiekt blokuje ruch' : '', rq.comp ? 'komponent ' + COMP[rq.comp].name : ''].filter(Boolean).join(', ') || 'brak') + '</p>' +
      '<p class="xs"><b>Konflikty:</b> ' + ((C.conflicts || []).map(function (c) { return COMP[c].name; }).join(', ') || 'brak') + (C.group === 'ruch' ? '; w grupie Ruch działa jeden komponent naraz (wg priorytetu)' : '') + '</p>' +
      '<p class="xs"><b>Parametry:</b> ' + C.params.map(function (p) { return p.label; }).join(', ') + '</p>' +
      '<button class="btn sm pri" data-act="bsAdd">' + I.plus + 'Dodaj do: ' + esc(P.objects[BS.def].name) + '</button></div>';
  }
  h += '<h3 style="font-size:1.05rem;margin-top:6px">Moje zestawy zachowań</h3>' + (LIB.ucomps.length ? LIB.ucomps.map(function (u) { return '<div class="cat-item" style="cursor:default;border-left-color:var(--accent)"><b>' + esc(u.name) + ' <span class="badge">v' + u.version + '</span></b><span>' + esc(u.desc || '') + ' · ' + u.comps.length + ' ' + plural(u.comps.length, 'komponent', 'komponenty', 'komponentów') + '</span><div class="row" style="margin-top:4px"><button class="btn sm" data-ucadd="' + u.id + '">' + I.plus + 'Dodaj</button><button class="btn sm ghost" data-ucdel="' + u.id + '" aria-label="Usuń ' + esc(u.name) + ' z biblioteki">' + I.trash + '</button></div></div>'; }).join('') : '<p class="small muted">Zapisz zachowania postaci przyciskiem „Zapisz jako mój zestaw zachowań”, żeby użyć ich gdzie indziej.</p>');
  h += '<h3 style="font-size:1.05rem;margin-top:6px">Zapisane ustawienia</h3>' + (LIB.profiles.length ? '<ul class="olist">' + LIB.profiles.map(function (p) { return '<li class="row" style="flex-wrap:nowrap"><span class="grow small"><b>' + esc(p.name) + '</b> <span class="muted">· ' + COMP[p.type].name + '</span></span><button class="icobtn" data-prdel="' + p.id + '" aria-label="Usuń profil ' + esc(p.name) + '">' + I.trash + '</button></li>'; }).join('') + '</ul>' : '<p class="small muted">Brak zapisanych ustawień. Użyj przycisku „Zapisz ustawienia” przy zachowaniu.</p>');
  el.innerHTML = h;
  var qi = $('#bs-q'); qi.addEventListener('input', function () { BS.q = qi.value; var pos = qi.selectionStart; bsCat(); var n = $('#bs-q'); n.focus(); n.setSelectionRange(pos, pos); });
  el.onclick = function (e) {
    var b;
    if ((b = e.target.closest('[data-bscat]'))) { BS.cat = b.dataset.bscat; bsCat(); return; }
    if ((b = e.target.closest('[data-bsp]'))) { BS.pick = b.dataset.bsp; bsCat(); return; }
    if ((b = e.target.closest('[data-ucadd]'))) { ucAdd(b.dataset.ucadd); return; }
    if ((b = e.target.closest('[data-ucdel]'))) { LIB.ucomps = LIB.ucomps.filter(function (u) { return u.id !== b.dataset.ucdel; }); saveLib(); bsCat(); toast('Usunięto z biblioteki. Obiekty zachowują swoje kopie komponentów.'); return; }
    if ((b = e.target.closest('[data-prdel]'))) { LIB.profiles = LIB.profiles.filter(function (p) { return p.id !== b.dataset.prdel; }); saveLib(); bsCat(); bsMain(); }
  };
}
ACT.bsAdd = function () {
  var t = BS.pick, d = P.objects[BS.def], r = R(BS.def), C = COMP[t];
  var types = (r.comps || []).filter(function (c) { return c.on !== false; }).map(function (c) { return c.type; });
  var conf = (C.conflicts || []).filter(function (c) { return types.indexOf(c) >= 0; });
  mut(function () { d.data.comps = d.data.comps || []; d.data.comps.push(comp(t)); });
  bsMain(); bsCat(); $('#bs-list').innerHTML = objList(BS.def, 'bsPick', '');
  if (conf.length) toast('Uwaga: ' + C.name + ' koliduje z ' + conf.map(function (c) { return COMP[c].name; }).join(', ') + '. Wyłącz jeden z nich.', 'warn');
  else toast('Dodano zachowanie: ' + C.name + '. Zagraj, żeby je sprawdzić!', 'ok');
};
ACT.ucNew = function () {
  var r = R(BS.def), comps = r.comps || [];
  if (!comps.length) { toast('Ten obiekt nie ma komponentów do zapisania.', 'warn'); return; }
  openModal({ title: 'Utwórz komponent użytkownika', wide: true,
    body: '<p class="small muted">Komponent użytkownika to zapisany zestaw zachowań wielokrotnego użytku (np. „Przeciwnik dystansowy”). Wybierz, które parametry mają być publiczne – pozostałe będą ukryte przy użyciu komponentu. Zapis pod istniejącą nazwą tworzy nową wersję.</p>' +
      '<div class="g2"><label class="f" for="uc-n">Nazwa<input class="inp" id="uc-n" maxlength="40" autofocus list="uc-names" placeholder="np. Szybki strażnik"><datalist id="uc-names">' + LIB.ucomps.map(function (u) { return '<option value="' + esc(u.name) + '">'; }).join('') + '</datalist></label><label class="f" for="uc-c">Kategoria<select class="inp" id="uc-c">' + CGM.CATS.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="f" for="uc-d">Opis<input class="inp" id="uc-d" maxlength="120"></label>' +
      comps.map(function (cp, i) { var C = COMP[cp.type]; return '<div class="soft"><label class="sw"><input type="checkbox" data-ucc="' + i + '" checked><b>' + C.name + '</b></label><div class="row" style="gap:4px 14px">' + C.params.map(function (p) { return '<label class="sw xs"><input type="checkbox" data-ucp="' + i + '.' + p.k + '"' + (p.basic ? ' checked' : '') + '>' + esc(p.label) + '</label>'; }).join('') + '</div></div>'; }).join(''),
    actions: [{ label: 'Anuluj' }, { label: 'Zapisz w bibliotece', cls: 'pri', fn: function (root) {
      var n = $('#uc-n', root).value.trim(); if (!n) { toast('Podaj nazwę komponentu.', 'warn'); return true; }
      var chosen = $$('[data-ucc]', root).filter(function (c) { return c.checked; }).map(function (c) { return +c.dataset.ucc; });
      if (!chosen.length) { toast('Wybierz co najmniej jeden komponent.', 'warn'); return true; }
      var idxMap = {}; chosen.forEach(function (ci, j) { idxMap[ci] = j; });
      var pub = $$('[data-ucp]', root).filter(function (c) { return c.checked && idxMap[+c.dataset.ucp.split('.')[0]] != null; }).map(function (c) { var p = c.dataset.ucp.split('.'); return idxMap[+p[0]] + '.' + p[1]; });
      var ex = LIB.ucomps.filter(function (u) { return u.name.toLowerCase() === n.toLowerCase(); })[0];
      var data = { name: n, desc: $('#uc-d', root).value.trim(), category: $('#uc-c', root).value, comps: chosen.map(function (ci) { var cp = comps[ci]; return { type: cp.type, p: clone(cp.p), prio: cp.prio || 2, on: cp.on !== false }; }), public: pub };
      if (ex) { ex.backups = (ex.backups || []).concat([{ version: ex.version, comps: ex.comps, public: ex.public }]).slice(-5); Object.assign(ex, data); ex.version++; toast('Zapisano wersję v' + ex.version + ' komponentu „' + n + '”. Obiekty używające starszej wersji pokażą propozycję aktualizacji.', 'ok'); }
      else { LIB.ucomps.push(Object.assign({ id: uid('uc'), version: 1, created: now() }, data)); toast('Komponent „' + n + '” zapisany w bibliotece użytkownika.', 'ok'); }
      saveLib(); bsCat(); scheduleDiag();
    } }] });
};
function ucAdd(ucId) {
  var u = LIB.ucomps.filter(function (x) { return x.id === ucId; })[0], d = P.objects[BS.def]; if (!u) return;
  mut(function () { d.data.comps = d.data.comps || []; u.comps.forEach(function (c, i) { d.data.comps.push({ uid: uid('c'), type: c.type, on: c.on, prio: c.prio, p: clone(c.p), from: { uc: u.id, ver: u.version, idx: i } }); }); });
  bsMain(); bsCat(); toast('Dodano komponent „' + u.name + '”.', 'ok');
}
function ucUpdate(defId, cuid) {
  var d = P.objects[defId], cp = (d.data.comps || []).filter(function (c) { return c.uid === cuid; })[0];
  if (!cp) { toast('Aktualizuj komponent w obiekcie bazowym.', 'warn'); return; }
  var u = LIB.ucomps.filter(function (x) { return x.id === cp.from.uc; })[0]; if (!u) return;
  backup('Kopia przed aktualizacją komponentu „' + u.name + '”');
  var src = u.comps[cp.from.idx];
  mut(function () {
    var keep = {}; (u.public || []).forEach(function (pp) { var a = pp.split('.'); if (+a[0] === cp.from.idx && cp.p[a[1]] !== undefined) keep[a[1]] = cp.p[a[1]]; });
    if (src) { cp.type = src.type; cp.p = Object.assign(clone(src.p), keep); cp.prio = src.prio; }
    cp.from.ver = u.version; delete cp.from.skip;
  });
  bsMain(); toast('Zaktualizowano do v' + u.version + '. Wcześniejszy stan zapisano w kopiach projektu.', 'ok');
}
function ucDiff(defId, cuid) {
  var cp = (R(defId).comps || []).filter(function (c) { return c.uid === cuid; })[0]; var u = LIB.ucomps.filter(function (x) { return x.id === cp.from.uc; })[0]; var src = u && u.comps[cp.from.idx];
  var rows = src ? Object.keys(Object.assign({}, cp.p, src.p)).filter(function (k) { return JSON.stringify(cp.p[k]) !== JSON.stringify(src.p[k]); }).map(function (k) { var pd = COMP[src.type].params.filter(function (p) { return p.k === k; })[0]; return '<tr><td>' + esc(pd ? pd.label : k) + '</td><td class="mono">' + esc(JSON.stringify(cp.p[k])) + '</td><td class="mono">' + esc(JSON.stringify(src.p[k])) + '</td></tr>'; }) : [];
  openModal({ title: 'Różnice: v' + cp.from.ver + ' → v' + u.version, body: rows.length ? '<div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Parametr</th><th>W obiekcie</th><th>Nowa wersja</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div><p class="xs muted">Przy aktualizacji wartości parametrów publicznych z obiektu zostaną zachowane.</p>' : '<p>Parametry są takie same – zmieniła się tylko konfiguracja ukryta lub opis.</p>', actions: [{ label: 'Zamknij', cls: 'pri' }] });
}
