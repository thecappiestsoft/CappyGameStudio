/* ================= EXPORT ================= */
var LAST_REPORT = null;
ROUTES.eksport = function (v) {
  var E = P.export = P.export || { touch: 'auto', loading: '' }, diag = validateProject(), errs = diag.filter(function (d) { return d.lvl === 'error'; }), warns = diag.filter(function (d) { return d.lvl === 'warn'; });
  v.innerHTML = '<div class="wrap" style="max-width:1000px"><div><h1>Pokaż swoją grę światu</h1><p class="muted" style="margin-top:6px;max-width:70ch">Gra zapisze się jako jeden plik. Otworzysz go w każdej przeglądarce, także bez internetu – możesz go wysłać koledze albo pokazać na tablicy.</p></div>' +
    '<section class="sec"><h3>' + I.sliders + 'Ustawienia eksportu</h3><div class="g2"><label class="f" for="ex-name">Nazwa gry<input class="inp" id="ex-name" maxlength="60" value="' + esc(P.meta.name) + '"></label><label class="f" for="ex-ver">Wersja<input class="inp mono" id="ex-ver" maxlength="12" value="' + esc(P.meta.version) + '"></label>' +
    '<label class="f" for="ex-scale">Skalowanie<select class="inp" id="ex-scale"><option value="fit"' + (P.settings.scaling !== 'fixed' ? ' selected' : '') + '>Dopasuj do okna</option><option value="fixed"' + (P.settings.scaling === 'fixed' ? ' selected' : '') + '>Stały rozmiar (' + P.settings.viewW * T + '×' + P.settings.viewH * T + ')</option></select></label>' +
    '<label class="f" for="ex-touch">Sterowanie dotykowe<select class="inp" id="ex-touch"><option value="auto"' + (E.touch === 'auto' ? ' selected' : '') + '>Automatycznie na ekranach dotykowych</option><option value="on"' + (E.touch === 'on' ? ' selected' : '') + '>Zawsze</option><option value="off"' + (E.touch === 'off' ? ' selected' : '') + '>Nigdy</option></select></label>' +
    '<label class="f" for="ex-load">Tekst ekranu ładowania<input class="inp" id="ex-load" maxlength="60" value="' + esc(E.loading || '') + '" placeholder="np. Ładowanie przygody…"></label></div>' +
    '<label class="sw"><input type="checkbox" id="ex-fs"' + (P.settings.fullscreenBtn !== false ? ' checked' : '') + '>Przycisk pełnego ekranu</label></section>' +
    '<section class="sec"><h3>' + I.check + 'Czy gra jest gotowa?</h3>' + (errs.length ? '<div class="banner">' + I.alert + '<span><b>' + errs.length + ' ' + plural(errs.length, 'błąd', 'błędy', 'błędów') + '</b> – gra może nie działać poprawnie. Popraw je albo eksportuj mimo to.</span></div>' : '<div class="dg">' + lvChip('info') + '<span>Brak błędów konfiguracji.' + (warns.length ? ' Ostrzeżenia: ' + warns.length + '.' : '') + '</span></div>') +
    diag.filter(function (d) { return d.lvl === 'error' || d.lvl === 'warn'; }).slice(0, 12).map(function (d) { var i = DIAG.indexOf(d); return '<div class="dg">' + lvChip(d.lvl) + '<span class="grow">' + esc(d.msg) + '</span></div>'; }).join('') +
    '<div class="row"><button class="btn acc" data-act="exHtml"' + (errs.length ? ' data-force="0"' : '') + '>' + I.export + 'Zapisz grę do pliku</button>' + (errs.length ? '<button class="btn" data-act="exHtml" data-force="1">Zapisz mimo to</button>' : '') + '</div></section>' +
    '<section class="sec"><h3>' + I.package + 'Pliki projektu i komponentów</h3><div class="row"><button class="btn" data-act="exProj">' + I.save + 'Plik projektu (.cgs.json)</button><button class="btn" data-act="exPack">' + I.package + 'Paczka komponentów i profili (.json)</button><button class="btn" data-act="imPack">' + I.upload + 'Importuj paczkę</button></div><p class="xs muted">Paczka zawiera manifest, komponenty użytkownika z wersjami i profile. Sklep online ani konto nie są potrzebne.</p></section>' +
    platformSection() +
    (LAST_REPORT ? '<section class="sec"><h3>' + I.task2 + 'Raport ostatniego eksportu</h3>' + LAST_REPORT + '</section>' : '') + '</div>';
  v.oninput = function (e) { var t = e.target; if (t.id === 'ex-name') { pushUndo('exn'); P.meta.name = t.value || 'Gra'; touched({ quiet: true }); $('#pname').textContent = P.meta.name; } if (t.id === 'ex-ver') { pushUndo('exv'); P.meta.version = t.value; touched({ quiet: true }); } if (t.id === 'ex-load') { E.loading = t.value; saveProject(); } };
  v.onchange = function (e) { var t = e.target; if (t.id === 'ex-scale') mut(function () { P.settings.scaling = t.value; }); if (t.id === 'ex-touch') { E.touch = t.value; saveProject(); } if (t.id === 'ex-fs') mut(function () { P.settings.fullscreenBtn = t.checked; }); };
};
I.task2 = I.history;
function gameHTML(xo) {
  var eng = $('#engine').textContent;
  var used = {}; Object.keys(P.objects).forEach(function (id) { var r = R(id); if (!r) return; if (r.sprite && r.sprite.img) used[r.sprite.img] = 1; (r.comps || []).forEach(function (c) { if (c.p && c.p.sound && P.assets[c.p.sound]) used[c.p.sound] = 1; }); });
  var assets = {}; Object.keys(used).forEach(function (k) { if (P.assets[k]) assets[k] = { type: P.assets[k].type, data: P.assets[k].data, sheet: P.assets[k].sheet || null }; });
  var data = { format: P.format, meta: P.meta, settings: P.settings, objects: P.objects, scenes: P.scenes, flow: P.flow, mechanics: P.mechanics, cards: P.cards, decks: P.decks, assets: assets };
  var E = Object.assign({}, P.export || {}, xo || {}), fixed = P.settings.scaling === 'fixed';
  var json = JSON.stringify(data).replace(/</g, '\\u003c');
  var html = '<!doctype html>\n<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(P.meta.name) + '</title><meta name="generator" content="CappyGameStudio"><meta name="version" content="' + esc(P.meta.version) + '">' +
    '<style>html,body{margin:0;min-height:100%;background:#1f1a2e;color:#fff4e0;font-family:Lexend,"Segoe UI",system-ui,sans-serif}main{max-width:' + (fixed ? (P.settings.viewW * T + 40) + 'px' : '1200px') + ';margin:0 auto;padding:14px;display:flex;flex-direction:column;gap:10px}#load{position:fixed;inset:0;display:grid;place-items:center;background:#1f1a2e;font:800 24px "Baloo 2","Trebuchet MS",sans-serif}footer{text-align:center;font-size:12px;color:#aab3d3;padding:10px}.fsb{align-self:center;font:700 15px system-ui;padding:8px 16px;border:2px solid #04060e;border-radius:10px;background:#fff;color:#1d2440;box-shadow:0 3px 0 #04060e;cursor:pointer}.cgm{--cgm-text:#fff4e0}</style></head><body><div id="load">' + esc(E.loading || ('Ładowanie: ' + P.meta.name)) + '</div><main><div id="game"></div>' + (P.settings.fullscreenBtn !== false ? '<button class="fsb" id="fs">Pełny ekran</button>' : '') + '</main><footer>' + esc(P.meta.name) + ' v' + esc(P.meta.version) + (P.meta.author ? ' · ' + esc(P.meta.author) : '') + ' · Stworzone w CappyGameStudio ' + APP_VERSION + ' · © 2026 CappySoft.pl</footer>' +
    '<script>' + eng.replace(/<\/script/gi, '<\\/script') + '<\/script><script>var P=' + json + ';var g=CGM.mountGame(document.getElementById("game"),P,{maxH:"' + (fixed ? (P.settings.viewH * T) + 'px' : 'calc(100vh - 150px)') + '",touch:' + (E.touch === 'on') + ',soundOn:' + (P.settings.sound !== false) + '});' + (E.touch === 'off' ? 'document.querySelector(".cgm-touch").classList.remove("on");' : '') + 'document.getElementById("load").remove();var f=document.getElementById("fs");if(f)f.onclick=function(){var e=document.getElementById("game");if(e.requestFullscreen)e.requestFullscreen().catch(function(){});};document.addEventListener("fullscreenchange",function(){g.el.classList.toggle("fs",!!document.fullscreenElement)});<\/script></body></html>';
  return { html: html, assets: Object.keys(assets).length, assetBytes: Object.keys(assets).reduce(function (s, k) { return s + (P.assets[k].size || 0); }, 0), unused: Object.keys(P.assets).length - Object.keys(assets).length };
}
ACT.exHtml = function (a) {
  var errs = validateProject().filter(function (d) { return d.lvl === 'error'; });
  if (errs.length && a.dataset.force !== '1') { toast('Popraw błędy albo użyj „Eksportuj mimo błędów”.', 'warn'); return; }
  var r = gameHTML(), inst = P.scenes.reduce(function (s, x) { return s + x.inst.length; }, 0);
  var name = slug(P.meta.name) + '-' + slug(P.meta.version) + '.html';
  saveFile(name, r.html, 'text/html').then(function (ok) {
    LAST_REPORT = '<dl class="kv"><dt>Plik</dt><dd>' + esc(name) + '</dd><dt>Rozmiar</dt><dd>' + kb(r.html.length) + '</dd><dt>Data</dt><dd>' + fmtDate(now()) + '</dd><dt>Sceny</dt><dd>' + P.scenes.length + ' (start: ' + esc((sceneById(P.flow.start) || {}).name || '—') + ')</dd><dt>Obiekty</dt><dd>' + Object.keys(P.objects).length + ' definicji, ' + inst + ' instancji</dd><dt>Zasoby</dt><dd>' + r.assets + ' dołączonych (' + kb(r.assetBytes) + ')' + (r.unused ? ', ' + r.unused + ' nieużywanych pominięto' : '') + '</dd><dt>Sterowanie</dt><dd>klawiatura' + ((P.export || {}).touch !== 'off' ? ', dotyk' : '') + '</dd><dt>Błędy</dt><dd>' + errs.length + '</dd><dt>Wynik</dt><dd>' + (ok ? 'Zapisano' : 'Nie zapisano') + '</dd></dl>';
    if (route() === 'eksport') render();
  });
};
ACT.exProj = function () { saveFile(slug(P.meta.name) + '.cgs.json', JSON.stringify({ kind: 'cappygamestudio-project', format: P.format, project: P }), 'application/json'); };
ACT.exPack = function () {
  if (!LIB.ucomps.length && !LIB.profiles.length) { toast('Biblioteka komponentów i profili jest pusta.', 'warn'); return; }
  saveFile('komponenty-cappygamestudio.json', JSON.stringify({ kind: 'cappygamestudio-components', manifest: { app: 'CappyGameStudio', format: 1, exported: new Date().toISOString(), ucomps: LIB.ucomps.length, profiles: LIB.profiles.length }, ucomps: LIB.ucomps, profiles: LIB.profiles }, null, 1), 'application/json');
};
ACT.imPack = function () {
  pickFile('.json,application/json', false, function (fs) {
    var f = fs[0]; if (!f) return; var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result); if (d.kind !== 'cappygamestudio-components') throw new Error();
        var n = 0, m = 0;
        (d.ucomps || []).forEach(function (u) { if (!u || !Array.isArray(u.comps) || !u.comps.every(function (c) { return COMP[c.type]; })) return; var ex = LIB.ucomps.filter(function (x) { return x.id === u.id; })[0]; if (ex && ex.version >= u.version) return; if (ex) LIB.ucomps.splice(LIB.ucomps.indexOf(ex), 1); LIB.ucomps.push(u); n++; });
        (d.profiles || []).forEach(function (p) { if (!p || !COMP[p.type] || LIB.profiles.some(function (x) { return x.id === p.id; })) return; LIB.profiles.push(p); m++; });
        saveLib(); toast('Zaimportowano komponenty: ' + n + ', profile: ' + m + '.', 'ok');
      } catch (e) { toast('To nie jest paczka komponentów CappyGameStudio.', 'warn'); }
    }; r.readAsText(f);
  });
};
