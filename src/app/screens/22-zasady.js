/* ================= MECHANICS STUDIO ================= */
ROUTES.mechaniki = function (v) {
  var M = P.mechanics;
  function sw(id, on, label) { return '<label class="sw"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '>' + label + '</label>'; }
  function num(id, label, val, min, max, help) { return '<label class="f" for="' + id + '">' + label + '<input class="inp" type="number" id="' + id + '" min="' + min + '" max="' + max + '" value="' + val + '">' + (help ? '<span class="help">' + help + '</span>' : '') + '</label>'; }
  function data(list) { return '<div class="row" style="gap:4px">' + list.map(function (d) { return '<span class="chip plum mono">' + d + '</span>'; }).join('') + '</div>'; }
  var deps = dataLinks();
  v.innerHTML = '<div class="wrap" style="max-width:1040px"><div><h1>Zasady całej gry</h1><p class="muted" style="margin-top:6px;max-width:70ch">Te ustawienia działają w każdym poziomie: punkty, życia, plecak z przedmiotami i zegar.</p></div>' +
    '<div class="g2" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">' +
    '<section class="sec"><h3>' + I.star + 'Punktacja</h3>' + sw('m-score', M.score.on !== false, 'Włączona') + '<div class="g2">' + num('m-sstart', 'Wynik startowy', M.score.start || 0, 0, 9999) + num('m-sbonus', 'Dodatkowe życie co (pkt)', M.score.bonusLife || 0, 0, 9999, '0 = wyłączone') + '</div><p class="xs muted">Udostępnia:</p>' + data(['Score.Total']) + '</section>' +
    '<section class="sec"><h3>' + I.check + 'Zdrowie i życia</h3><div class="g2">' + num('m-hp', 'Zdrowie gracza (maks.)', M.health.maxHp, 1, 20) + num('m-lives', 'Liczba żyć', M.health.lives, 1, 99) + num('m-inv', 'Nietykalność po trafieniu (s)', M.health.invuln, 0, 5) + '</div><label class="f" for="m-resp">Odrodzenie po utracie życia<select class="inp" id="m-resp"><option value="checkpoint"' + (M.health.respawn !== 'start' ? ' selected' : '') + '>Ostatni punkt kontrolny</option><option value="start"' + (M.health.respawn === 'start' ? ' selected' : '') + '>Punkt startowy sceny</option></select></label><p class="xs muted">Udostępnia:</p>' + data(['Player.Health', 'Player.Lives']) + '</section>' +
    '<section class="sec"><h3>' + I.package + 'Plecak (ekwipunek)</h3>' + sw('m-inv-on', M.inventory.on !== false, 'Włączony') + num('m-slots', 'Liczba slotów', M.inventory.slots, 1, 30) + '<p class="small">Przedmioty w grze: ' + (itemNames().map(function (n) { return '<span class="chip">' + esc(n) + '</span>'; }).join(' ') || '<span class="muted">brak</span>') + '</p><p class="xs muted">Udostępnia:</p>' + data(['Inventory.ItemCount', 'Inventory.Has(„przedmiot”)']) + '</section>' +
    '<section class="sec"><h3>' + I.history + 'Limit czasu</h3>' + sw('m-timer', M.timer.on, 'Włączony (na każdą scenę)') + '<div class="g2">' + num('m-tlimit', 'Limit (s)', M.timer.limit, 10, 3600) + num('m-twarn', 'Ostrzeżenie przy (s)', M.timer.warn, 0, 300) + '</div><p class="xs muted">Upływ czasu = porażka. Udostępnia:</p>' + data(['Timer.Remaining']) + '</section>' +
    '<section class="sec"><h3>' + I.grid + 'Co widać w czasie gry</h3><p class="small muted">Widoczne elementy interfejsu gry.</p>' + [['score', 'Wynik'], ['health', 'Pasek zdrowia'], ['lives', 'Życia'], ['inventory', 'Ekwipunek'], ['timer', 'Zegar'], ['scene', 'Nazwa sceny'], ['memory', 'Pamięć gry (wybory w rozmowach)']].map(function (x) { return sw('hud-' + x[0], M.hud[x[0]] !== false, x[1]); }).join('') + '</section>' +
    '</div>' +
    '<section class="sec"><h3>' + I.grid + 'Co z czym się zderza</h3><p class="small muted">Zaznacz, które kategorie blokują się nawzajem (fizyczne zderzenie). Kontakt bez blokowania – np. obrażenia, podnoszenie – działa zawsze przez komponenty.</p><div class="tbl-wrap" style="border:0"><table class="matrix"><thead><tr><th></th>' + COLCATS.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>' + COLCATS.map(function (a, i) { return '<tr><th scope="row">' + a + '</th>' + COLCATS.map(function (b, j) { if (j < i) return '<td></td>'; var on = blocksUI(a, b); return '<td><input type="checkbox" data-mx="' + a + '|' + b + '"' + (on ? ' checked' : '') + ' aria-label="' + a + ' blokuje ' + b + '"></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></section>' +
    '<section class="sec"><h3>' + I.link + 'Połączenia w grze</h3><p class="small muted">Wszystkie powiązania danych w projekcie: źródło → cel. Program sprawdza, czy źródło istnieje i czy typy się zgadzają.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Źródło</th><th>Typ</th><th>Cel</th><th>Stan</th></tr></thead><tbody>' + (deps.length ? deps.map(function (x) { return '<tr><td class="mono">' + esc(x.src) + '</td><td>' + x.type + '</td><td>' + esc(x.dst) + '</td><td>' + (x.ok ? '<span class="lv info">' + I.check + 'OK</span>' : '<span class="lv error">' + I.err + esc(x.why || 'Brak źródła') + '</span>') + '</td></tr>'; }).join('') : '<tr><td colspan="4" class="muted">Brak powiązań.</td></tr>') + '</tbody></table></div></section></div>';
  v.onchange = function (e) {
    var t = e.target, n = +t.value;
    mut(function () {
      if (t.id === 'm-score') M.score.on = t.checked; if (t.id === 'm-sstart') M.score.start = clamp(n || 0, 0, 9999); if (t.id === 'm-sbonus') M.score.bonusLife = clamp(n || 0, 0, 9999);
      if (t.id === 'm-hp') M.health.maxHp = clamp(n || 1, 1, 20); if (t.id === 'm-lives') M.health.lives = clamp(n || 1, 1, 99); if (t.id === 'm-inv') M.health.invuln = clamp(n || 0, 0, 5); if (t.id === 'm-resp') M.health.respawn = t.value;
      if (t.id === 'm-inv-on') M.inventory.on = t.checked; if (t.id === 'm-slots') M.inventory.slots = clamp(n || 1, 1, 30);
      if (t.id === 'm-timer') M.timer.on = t.checked; if (t.id === 'm-tlimit') M.timer.limit = clamp(n || 60, 10, 3600); if (t.id === 'm-twarn') M.timer.warn = clamp(n || 0, 0, 300);
      if (t.id.indexOf('hud-') === 0) M.hud[t.id.slice(4)] = t.checked;
      if (t.dataset.mx) { M.matrix = M.matrix || {}; M.matrix[t.dataset.mx] = t.checked; }
    });
    if (t.id === 'm-score' || t.id === 'm-inv-on' || t.id === 'm-timer') render();
  };
};
function blocksUI(a, b) { var M = P.mechanics.matrix || {}, k1 = a + '|' + b, k2 = b + '|' + a; if (k1 in M) return M[k1]; if (k2 in M) return M[k2]; var D = { 'Gracz|Świat': 1, 'Przeciwnik|Świat': 1, 'Pocisk|Świat': 1, 'Przedmiot|Świat': 1, 'Świat|Gracz': 1, 'Świat|Przeciwnik': 1, 'Świat|Pocisk': 1, 'Świat|Przedmiot': 1 }; return !!(D[k1] || D[k2]); }
function dataLinks() {
  var out = [], items = itemNames();
  Object.keys(P.objects).forEach(function (id) {
    var r = R(id); if (!r) return;
    CGM.activeComps(r).forEach(function (c) {
      if (c.type === 'door' && c.p.need === 'item') out.push({ src: 'Inventory.Has(„' + c.p.item + '”)', type: 'logiczna', dst: r.name + ' → Otwieranie', ok: items.indexOf(c.p.item) >= 0, why: 'Żaden obiekt nie daje tego przedmiotu' });
      if (c.type === 'door' && c.p.need === 'score') out.push({ src: 'Score.Total ≥ ' + c.p.score, type: 'liczba', dst: r.name + ' → Otwieranie', ok: P.mechanics.score.on !== false, why: 'Punktacja wyłączona' });
      if (c.type === 'door' && c.p.need === 'switch') out.push({ src: 'Switch.„' + (c.p.tag || 'A') + '”', type: 'logiczna', dst: r.name + ' → Otwieranie', ok: leverSources(c.p.tag || 'A').length > 0, why: 'Brak przełącznika na tym kanale' });
      if (c.type === 'pickup' && c.p.toInv) out.push({ src: r.name + ' → Podnoszenie', type: 'przedmiot', dst: 'Inventory: „' + (c.p.item || r.name) + '”', ok: P.mechanics.inventory.on !== false, why: 'Ekwipunek wyłączony' });
      if (c.type === 'goal' && c.p.action === 'goto') out.push({ src: r.name + ' → Strefa wyjścia', type: 'scena', dst: 'Scena: ' + ((sceneById(c.p.scene) || {}).name || '—'), ok: !!sceneById(c.p.scene), why: 'Nie wybrano sceny' });
    });
  });
  P.scenes.forEach(function (s) { ((s.complete || {}).conds || []).forEach(function (cd) {
    if (cd.type === 'score') out.push({ src: 'Score.Total ≥ ' + cd.val, type: 'liczba', dst: 'Game Flow: ' + s.name, ok: P.mechanics.score.on !== false, why: 'Punktacja wyłączona' });
    if (cd.type === 'item') out.push({ src: 'Inventory.Has(„' + cd.item + '”)', type: 'logiczna', dst: 'Game Flow: ' + s.name, ok: items.indexOf(cd.item) >= 0, why: 'Żaden obiekt nie daje tego przedmiotu' });
  }); });
  var H = P.mechanics.hud;
  if (H.score !== false) out.push({ src: 'Score.Total', type: 'liczba', dst: 'HUD: Wynik', ok: P.mechanics.score.on !== false, why: 'Punktacja wyłączona – element HUD się nie pokaże' });
  if (H.inventory !== false) out.push({ src: 'Inventory.Items', type: 'lista', dst: 'HUD: Ekwipunek', ok: P.mechanics.inventory.on !== false, why: 'Ekwipunek wyłączony – element HUD się nie pokaże' });
  if (H.timer !== false && P.mechanics.timer.on) out.push({ src: 'Timer.Remaining', type: 'liczba', dst: 'HUD: Zegar', ok: true });
  return out;
}
