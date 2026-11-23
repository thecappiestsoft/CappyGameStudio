
/* ================= KARTY I TALIE (Hearthstone-style card editor) ================= */
var APP_VERSION = '1.7.0', APP_BUILD = '2026-11-19';
var KS = { sel: null, deck: null, filter: 'all' };
var KSPR = [['hero', 'Bohater'], ['npc', 'Postać'], ['enemy', 'Przeciwnik'], ['star', 'Gwiazdka'], ['gem', 'Kryształ'], ['fruit', 'Owoc'], ['potion', 'Mikstura'], ['heart', 'Serce'], ['key', 'Klucz'], ['coin', 'Moneta'], ['goal', 'Cel'], ['deco', 'Dekoracja'], ['lava', 'Lawa'], ['card', 'Karta']];
function ensureCards() {
  if (!Array.isArray(P.cards)) P.cards = clone(CGM.DEFAULT_CARDS);
  if (!Array.isArray(P.decks) || !P.decks.length) P.decks = [{ id: 'dk_me', name: 'Talia startowa', cards: clone(CGM.DEFAULT_DECK) }];
}
function cardById(id) { return (P.cards || []).filter(function (c) { return c.id === id; })[0] || null; }
function deckById(id) { return (P.decks || []).filter(function (d) { return d.id === id; })[0] || null; }
function deckSize(d) { return Object.keys(d.cards || {}).reduce(function (s, k) { return s + (cardById(k) ? d.cards[k] : 0); }, 0); }
(function () {
  var st = document.createElement('style');
  st.textContent = '' +
    '.kc-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,420px);gap:16px;align-items:start}' +
    '.kc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:14px 10px;padding:12px 6px 6px}' +
    '.kc-pick{border:0;background:none;padding:0;cursor:pointer;border-radius:16px;display:flex;justify-content:center}.kc-pick .hc{transform:scale(.86);transform-origin:top center;margin-bottom:-24px;transition:transform .12s}.kc-pick:hover .hc{transform:scale(.9) translateY(-3px)}' +
    '.kc-pick[aria-pressed=true] .hc{box-shadow:0 0 0 4px var(--m-mechaniki),0 3px 0 #1d2440}' +
    '.kc-prev{display:flex;justify-content:center;padding:16px 0 18px}.kc-prev .hc{transform:scale(1.15);transform-origin:top center;margin-bottom:28px}' +
    '.kc-form{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px}.kc-form .full{grid-column:1/-1}.kc-form .field{margin:0}' +
    '.kc-chk{display:flex;flex-wrap:wrap;gap:6px 14px}' +
    '.kc-filter{display:flex;gap:6px;flex-wrap:wrap}' +
    '.kc-decks{display:flex;gap:6px;flex-wrap:wrap;align-items:center}' +
    '.kc-row{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:10px;align-items:center;padding:6px 8px;border:2px solid var(--line,#d5d9e6);border-radius:12px;background:var(--card,#fff)}' +
    '.kc-row.in{border-color:var(--m-mechaniki);background:color-mix(in srgb,var(--m-mechaniki) 9%,var(--card,#fff))}' +
    '.kc-row img{width:44px;height:44px;border-radius:50%;border:2px solid #1d2440;background:#fff}.kc-row b{display:block;font-size:14px}.kc-row small{display:block;font-size:12px;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.kc-cnt{display:flex;align-items:center;gap:6px}.kc-cnt output{min-width:22px;text-align:center;font:800 18px "Baloo 2",sans-serif}' +
    '.kc-cost{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#2f7fd8;color:#fff;font:800 12px "Baloo 2",sans-serif;border:2px solid #1d2440;margin-right:4px;vertical-align:middle}' +
    '.kc-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:8px;max-height:520px;overflow:auto;padding:2px}' +
    '.kc-curve{display:flex;gap:4px;align-items:flex-end;height:70px;padding:4px 0}.kc-curve span{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;font-size:11px}.kc-curve i{display:block;width:100%;background:#5ab3ff;border:2px solid #1d2440;border-radius:4px 4px 0 0;min-height:2px}' +
    '.kc-duel{min-height:420px;display:flex;justify-content:center}.kc-duel .hs{max-height:none}' +
    '@media (max-width:900px){.kc-top{grid-template-columns:1fr}}';
  document.head.appendChild(st);
})();
function kcEditor(c) {
  if (!c) return '<p class="muted">Wybierz kartę z listy albo stwórz nową.</p>';
  var T = CGM.TYPES[c.sprite && c.sprite.type] || CGM.TYPES.hero, imgs = Object.keys(P.assets || {}).filter(function (k) { return P.assets[k].type === 'image'; });
  function sel(f, label, opts, val, full) { return '<div class="field' + (full ? ' full' : '') + '"><span class="lab"><label for="kc-' + f + '">' + label + '</label></span><select class="inp" id="kc-' + f + '" data-f="' + f + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>'; }
  function rng(f, label, min, max, val) { return '<div class="field"><span class="lab"><label for="kc-' + f + '">' + label + '</label></span><div class="rng" style="grid-template-columns:1fr auto"><input type="range" id="kc-' + f + '" data-f="' + f + '" min="' + min + '" max="' + max + '" value="' + (val || 0) + '"><output for="kc-' + f + '">' + (val || 0) + '</output></div></div>'; }
  function chk(f, label, help) { return '<label class="sw" title="' + esc(help) + '"><input type="checkbox" data-f="' + f + '"' + (c[f] ? ' checked' : '') + '>' + label + '</label>'; }
  function obj(m) { return Object.keys(m).map(function (k) { return [k, m[k]]; }); }
  var h = '<div class="kc-prev" id="kc-prev">' + CGM.cardHTML(c) + '</div><div class="kc-form">' +
    '<div class="field full"><span class="lab"><label for="kc-name">Nazwa karty</label></span><input class="inp" id="kc-name" data-f="name" maxlength="24" value="' + esc(c.name) + '"></div>' +
    sel('type', 'Rodzaj karty', obj(CGM.CARD_TYPES), c.type) + rng('cost', 'Koszt many', 0, 10, c.cost);
  if (c.type === 'minion') {
    h += rng('atk', 'Atak', 0, 12, c.atk) + rng('hp', 'Życie', 1, 15, c.hp) +
      '<div class="field full"><span class="lab">Umiejętności</span><div class="kc-chk">' + chk('charge', 'Szarża', 'Może atakować od razu w turze, w której wejdzie na stół.') + chk('taunt', 'Prowokacja', 'Przeciwnik musi najpierw zaatakować tego stwora.') + chk('life', 'Wampiryzm', 'Zadane obrażenia leczą twojego bohatera.') + '</div></div>' +
      sel('fx', 'Okrzyk bojowy (po zagraniu)', obj(CGM.BATTLECRY), c.fx || 'none', true) + (c.fx && c.fx !== 'none' ? rng('val', 'Siła okrzyku', 1, 10, c.val || 1) : '');
  } else if (c.type === 'spell') {
    h += sel('fx', 'Co robi czar', obj(CGM.SPELL_FX), c.fx || 'dmg', true) + rng('val', c.fx === 'buff' ? '+ Atak' : 'Siła', 1, 10, c.val || 1) + (c.fx === 'buff' ? rng('val2', '+ Życie', 0, 10, c.val2 || 0) : '');
  } else {
    h += sel('power', 'Stały efekt karty mocy', obj(CGM.POWERS), c.power || 'startDmg', true) + rng('val', 'Siła efektu', 1, 5, c.val || 1);
  }
  h += sel('spt', 'Obrazek – rodzaj', KSPR, c.sprite && c.sprite.img ? '' : (c.sprite || {}).type) +
    sel('spv', 'Obrazek – wygląd', T.variants, (c.sprite || {}).v) +
    '<div class="field"><span class="lab"><label for="kc-spc">Kolor</label></span><input class="inp" type="color" id="kc-spc" data-f="spc" value="' + esc((c.sprite || {}).color || '#ff9f1c') + '"></div>' +
    (imgs.length ? sel('spi', 'Albo twój obrazek', [['', '— brak —']].concat(imgs.map(function (k) { return [k, P.assets[k].name]; })), (c.sprite || {}).img || '') : '<p class="help" style="align-self:end">Własne obrazki wgrasz w module <a href="#zasoby">Obrazki i dźwięki</a>.</p>') +
    '<div class="row full" style="gap:8px;margin-top:6px"><button class="btn sm" data-k="nocolor">Kolor domyślny</button><button class="btn sm" data-k="dup">' + I.copy + '<span>Duplikuj</span></button><button class="btn sm danger" data-k="del">' + I.trash + '<span>Usuń kartę</span></button></div></div>';
  return h;
}
function kcDeck(d) {
  var n = deckSize(d), curve = [0, 0, 0, 0, 0, 0, 0, 0];
  Object.keys(d.cards || {}).forEach(function (k) { var c = cardById(k); if (c) curve[Math.min(7, c.cost || 0)] += d.cards[k]; });
  var mx = Math.max.apply(null, curve) || 1;
  var used = []; Object.keys(P.objects).forEach(function (id) { var r = R(id); if (r) CGM.activeComps(r).forEach(function (c) { if (c.type === 'cardduel' && (c.p.playerDeck === d.id || c.p.enemyDeck === d.id)) used.push(r.name); }); });
  return '<div class="row" style="gap:10px;align-items:end;flex-wrap:wrap"><div class="field" style="margin:0;min-width:220px"><span class="lab"><label for="kd-name">Nazwa talii</label></span><input class="inp" id="kd-name" maxlength="30" value="' + esc(d.name) + '"></div>' +
    '<span class="chip ' + (n < 6 ? 'warn' : 'ok') + '" style="align-self:center">' + n + ' kart' + (n < 6 ? ' – dodaj co najmniej 6' : n < 15 ? ' – zalecane 15–30' : '') + '</span>' +
    '<button class="btn sm pri" data-k="test">' + I.play + '<span>Zagraj próbny pojedynek</span></button><button class="btn sm" data-k="ddup">' + I.copy + '<span>Kopia talii</span></button><button class="btn sm danger" data-k="ddel"' + (P.decks.length < 2 ? ' disabled' : '') + '>' + I.trash + '<span>Usuń talię</span></button></div>' +
    '<p class="small muted" style="margin:8px 0">' + (used.length ? 'Tej talii używają: ' + used.map(esc).join(', ') + '.' : 'Żaden przeciwnik nie używa jeszcze tej talii. Wybierzesz ją w zachowaniu „Pojedynek na karty” (moduł „Co robią?”).') + ' W talii może być najwyżej 3 kopie jednej karty.</p>' +
    '<div class="g2" style="grid-template-columns:minmax(0,1fr) 220px;gap:14px;align-items:start"><div class="kc-list">' + P.cards.slice().sort(function (x, y) { return (x.cost || 0) - (y.cost || 0) || String(x.name).localeCompare(y.name); }).map(function (c) {
      var k = (d.cards || {})[c.id] || 0;
      return '<div class="kc-row' + (k ? ' in' : '') + '"><img alt="" src="' + CGM.cardArt(c) + '"><div style="min-width:0"><b><span class="kc-cost">' + (c.cost || 0) + '</span>' + esc(c.name) + '</b><small>' + CGM.CARD_TYPES[c.type] + (c.type === 'minion' ? ' ' + (c.atk || 0) + '/' + (c.hp || 1) : '') + ' · ' + esc(CGM.cardText(c) || 'Zwykły stwór') + '</small></div>' +
        '<div class="kc-cnt"><button class="icobtn" data-dm="' + c.id + '"' + (k ? '' : ' disabled') + ' aria-label="Usuń z talii: ' + esc(c.name) + '">−</button><output aria-label="Liczba kopii">' + k + '</output><button class="icobtn" data-dp="' + c.id + '"' + (k >= 3 ? ' disabled' : '') + ' aria-label="Dodaj do talii: ' + esc(c.name) + '">' + I.plus + '</button></div></div>';
    }).join('') + '</div>' +
    '<div class="sec" style="padding:10px"><b class="small">Krzywa many</b><div class="kc-curve" aria-label="Ile kart o danym koszcie">' + curve.map(function (v, i) { return '<span title="Koszt ' + i + (i === 7 ? '+' : '') + ': ' + v + '">' + (v || '') + '<i style="height:' + Math.round(v / mx * 70) + '%"></i>' + i + (i === 7 ? '+' : '') + '</span>'; }).join('') + '</div><p class="xs muted">Dobra talia ma dużo tanich kart (1–3) i kilka mocnych na koniec.</p></div></div>';
}
ROUTES.karty = function (v) {
  ensureCards(); CGM.ensureCss(); if (CGM.registerAssets) CGM.registerAssets(P.assets || {});
  if (!cardById(KS.sel)) KS.sel = P.cards[0] ? P.cards[0].id : null;
  if (!deckById(KS.deck)) KS.deck = P.decks[0].id;
  function draw() {
    var c = cardById(KS.sel), d = deckById(KS.deck);
    var list = P.cards.filter(function (q) { return KS.filter === 'all' || q.type === KS.filter; });
    v.innerHTML = '<div class="wrap" style="max-width:1240px"><div><h1>Karty i talie</h1><p class="muted" style="margin-top:6px;max-width:80ch">Pojedynki działają jak w Hearthstone: co turę masz o 1 manę więcej (do 10). <b>Stwory</b> zostają na stole i atakują od następnej tury, <b>czary</b> działają raz, a <b>karty mocy</b> działają do końca pojedynku.</p></div>' +
      '<div class="kc-top"><section class="sec"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap"><h3>Wszystkie karty (' + P.cards.length + ')</h3><div class="kc-filter">' + [['all', 'Wszystkie'], ['minion', 'Stwory'], ['spell', 'Czary'], ['power', 'Karty mocy']].map(function (f) { return '<button class="btn sm' + (KS.filter === f[0] ? ' pri' : '') + '" data-kf="' + f[0] + '" aria-pressed="' + (KS.filter === f[0]) + '">' + f[1] + '</button>'; }).join('') + '<button class="btn sm acc" data-k="new">' + I.plus + '<span>Nowa karta</span></button></div></div>' +
      '<div class="kc-grid">' + list.map(function (q) { return '<button class="kc-pick" data-ks="' + q.id + '" aria-pressed="' + (q.id === KS.sel) + '" aria-label="Edytuj kartę ' + esc(q.name) + '">' + CGM.cardHTML(q) + '</button>'; }).join('') + (list.length ? '' : '<p class="muted">Brak kart tego rodzaju.</p>') + '</div></section>' +
      '<section class="sec" id="kc-ed"><h3>' + I.sliders + 'Edytuj kartę</h3>' + kcEditor(c) + '</section></div>' +
      '<section class="sec"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap"><h3>Talie</h3><div class="kc-decks" role="tablist">' + P.decks.map(function (k) { return '<button class="btn sm' + (k.id === KS.deck ? ' pri' : '') + '" role="tab" aria-selected="' + (k.id === KS.deck) + '" data-kd="' + k.id + '">' + esc(k.name) + ' <span class="small">(' + deckSize(k) + ')</span></button>'; }).join('') + '<button class="btn sm acc" data-k="dnew">' + I.plus + '<span>Nowa talia</span></button></div></div>' + kcDeck(d) + '</section></div>';
  }
  function refreshPrev() { var c = cardById(KS.sel), pv = $('#kc-prev'); if (pv && c) pv.innerHTML = CGM.cardHTML(c); var b = v.querySelector('[data-ks="' + KS.sel + '"]'); if (b && c) b.innerHTML = CGM.cardHTML(c); }
  function keepFocus(fn) { var a = document.activeElement, id = a && a.id, ds = a && a.dataset ? Object.assign({}, a.dataset) : {}; fn(); var f = id ? document.getElementById(id) : null; if (!f) { var k = Object.keys(ds)[0]; if (k) f = v.querySelector('[data-' + k.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); }) + '="' + ds[k] + '"]'); } if (f) try { f.focus({ preventScroll: true }); } catch (e) { } }
  v.oninput = function (e) {
    var t = e.target, c = cardById(KS.sel);
    if (t.id === 'kd-name') { var d = deckById(KS.deck); pushUndo('dn:' + d.id); d.name = t.value.slice(0, 30) || 'Talia'; touched({ quiet: true }); var tb = v.querySelector('[data-kd="' + d.id + '"]'); if (tb) tb.firstChild.textContent = d.name + ' '; return; }
    if (!c || !t.dataset.f) return;
    var f = t.dataset.f, isR = t.type === 'range', val = isR ? +t.value : t.type === 'checkbox' ? t.checked : t.value;
    pushUndo('card:' + c.id + ':' + f);
    c.sprite = c.sprite || { type: 'hero', v: 'capy' };
    if (f === 'spt') { c.sprite = { type: val, v: (CGM.TYPES[val] || CGM.TYPES.hero).variants[0][0] }; }
    else if (f === 'spv') { c.sprite.v = val; delete c.sprite.img; }
    else if (f === 'spc') { c.sprite.color = val; }
    else if (f === 'spi') { if (val) c.sprite.img = val; else delete c.sprite.img; }
    else if (f === 'name') c.name = val.slice(0, 24) || 'Karta';
    else if (f === 'type') { c.type = val; if (val === 'minion') { c.atk = c.atk || 2; c.hp = c.hp || 2; c.fx = 'none'; } else if (val === 'spell') { c.fx = 'dmg'; c.val = c.val || 2; } else { c.power = c.power || 'startDmg'; c.val = Math.min(5, c.val || 1); } }
    else if (f === 'fx') { c.fx = val; if (val !== 'none') c.val = c.val || 1; }
    else c[f] = val;
    if (isR) { var o = t.parentNode.querySelector('output'); if (o) o.textContent = t.value; }
    touched({ quiet: true });
    if (t.tagName === 'SELECT' || t.type === 'checkbox') keepFocus(draw); else refreshPrev();
  };
  v.onchange = function (e) { if (e.target.dataset.f === 'spc' || e.target.id === 'kd-name') keepFocus(draw); };
  v.onclick = function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    var c = cardById(KS.sel), d = deckById(KS.deck), k = b.dataset.k;
    if (b.dataset.ks) { KS.sel = b.dataset.ks; keepFocus(draw); var ed = $('#kc-ed'); if (ed && innerWidth < 900) ed.scrollIntoView({ behavior: 'smooth' }); return; }
    if (b.dataset.kf) { KS.filter = b.dataset.kf; keepFocus(draw); return; }
    if (b.dataset.kd) { KS.deck = b.dataset.kd; keepFocus(draw); return; }
    if (b.dataset.dp) { mut(function () { d.cards = d.cards || {}; d.cards[b.dataset.dp] = Math.min(3, (d.cards[b.dataset.dp] || 0) + 1); }); keepFocus(draw); return; }
    if (b.dataset.dm) { mut(function () { var n = (d.cards[b.dataset.dm] || 0) - 1; if (n > 0) d.cards[b.dataset.dm] = n; else delete d.cards[b.dataset.dm]; }); keepFocus(draw); return; }
    if (k === 'new') { var nc = { id: uid('k'), name: 'Nowa karta', type: 'minion', cost: 2, atk: 2, hp: 3, fx: 'none', val: 1, sprite: { type: 'hero', v: 'capy' } }; mut(function () { P.cards.push(nc); }); KS.sel = nc.id; KS.filter = 'all'; draw(); var n = $('#kc-name'); if (n) { n.focus(); n.select(); } toast('Dodano nową kartę – nadaj jej nazwę i siłę.', 'ok'); return; }
    if (k === 'dup' && c) { var cp = clone(c); cp.id = uid('k'); cp.name = (c.name + ' 2').slice(0, 24); mut(function () { P.cards.push(cp); }); KS.sel = cp.id; draw(); return; }
    if (k === 'nocolor' && c && c.sprite) { mut(function () { delete c.sprite.color; }); keepFocus(draw); return; }
    if (k === 'del' && c) {
      openModal({ title: 'Usunąć kartę?', body: '<p>Karta „' + esc(c.name) + '” zniknie ze wszystkich talii.</p>', actions: [{ label: 'Anuluj' }, { label: 'Usuń', cls: 'danger', fn: function () { mut(function () { P.cards = P.cards.filter(function (q) { return q !== c; }); P.decks.forEach(function (dk) { if (dk.cards) delete dk.cards[c.id]; }); }); KS.sel = null; ROUTES.karty(v); } }] });
      return;
    }
    if (k === 'dnew') { var nd = { id: uid('dk'), name: 'Nowa talia', cards: {} }; mut(function () { P.decks.push(nd); }); KS.deck = nd.id; draw(); var dn = $('#kd-name'); if (dn) { dn.focus(); dn.select(); } return; }
    if (k === 'ddup') { var cd = clone(d); cd.id = uid('dk'); cd.name = (d.name + ' – kopia').slice(0, 30); mut(function () { P.decks.push(cd); }); KS.deck = cd.id; draw(); return; }
    if (k === 'ddel' && P.decks.length > 1) {
      openModal({ title: 'Usunąć talię?', body: '<p>Talia „' + esc(d.name) + '” zostanie usunięta. Przeciwnicy, którzy jej używali, dostaną pierwszą talię z listy.</p>', actions: [{ label: 'Anuluj' }, { label: 'Usuń', cls: 'danger', fn: function () { mut(function () { P.decks = P.decks.filter(function (q) { return q !== d; }); }); KS.deck = null; ROUTES.karty(v); } }] });
      return;
    }
    if (k === 'test') { kcTestDuel(d); return; }
  };
  draw();
};
function kcTestDuel(d) {
  var opts = P.decks.map(function (k) { return '<option value="' + esc(k.id) + '"' + (k.id === d.id ? ' selected' : '') + '>' + esc(k.name) + '</option>'; }).join('');
  openModal({ title: 'Próbny pojedynek', wide: true, body: '<div class="row" style="gap:12px;flex-wrap:wrap;margin-bottom:10px"><label class="f">Twoja talia<select class="inp" id="kt-me">' + opts + '</select></label><label class="f">Talia przeciwnika<select class="inp" id="kt-foe">' + opts + '</select></label><button class="btn pri" id="kt-go">' + I.play + 'Start</button></div><div class="kc-duel" id="kt-box"><p class="muted">Wybierz talie i kliknij Start. Wynik próbnego pojedynku nic nie zmienia w grze.</p></div>',
    onOpen: function (root) {
      var snd = CGM.Sound(); snd.set(SET.sound !== false, SET.volume == null ? 0.5 : SET.volume); var api = null;
      function key(e) { if (!api || !api.active || !document.getElementById('kt-box')) { document.removeEventListener('keydown', key, true); return; } if (e.target.tagName === 'SELECT') return; if (e.code === 'Escape' && !(api.state().sel)) return; if (api.key(e)) { e.preventDefault(); e.stopPropagation(); } }
      document.addEventListener('keydown', key, true);
      $('#kt-go', root).onclick = function () {
        snd.unlock();
        var me = deckById($('#kt-me', root).value), foe = deckById($('#kt-foe', root).value), box = $('#kt-box', root);
        api = CGM.cardDuel(box, { name: foe.name, sprite: { type: 'enemy', v: 'guard' }, psprite: { type: 'hero', v: 'capy' }, php: 20, ehp: 20, pdeck: CGM.expandDeck(me, P.cards), edeck: CGM.expandDeck(foe, P.cards) }, snd, { reduceMotion: !!SET.rm }, function (win) { box.hidden = false; box.innerHTML = '<p style="font-weight:700">' + (win ? 'Wygrałeś próbny pojedynek! 🎉' : 'Tym razem przegrana – popraw talię i spróbuj jeszcze raz.') + '</p>'; });
      };
    } });
}
