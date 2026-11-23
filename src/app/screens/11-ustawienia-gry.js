/* ================= PROJECT SETTINGS ================= */
ROUTES.projekt = function (v) {
  var m = P.meta, s = P.settings;
  v.innerHTML = '<div class="wrap" style="max-width:980px"><div><h1>Ustawienia gry</h1></div>' +
    '<section class="sec"><h3>' + I.project + 'Metadane</h3><div class="g2">' +
    '<label class="f" for="pm-name">Nazwa<input class="inp" id="pm-name" maxlength="60" value="' + esc(m.name) + '"></label>' +
    '<label class="f" for="pm-author">Autor<input class="inp" id="pm-author" maxlength="40" value="' + esc(m.author) + '"></label>' +
    '<label class="f" for="pm-ver">Wersja<input class="inp mono" id="pm-ver" maxlength="12" value="' + esc(m.version) + '"></label></div>' +
    '<label class="f" for="pm-desc">Opis<textarea class="inp" id="pm-desc" maxlength="300">' + esc(m.desc) + '</textarea></label></section>' +
    '<section class="sec"><h3>' + I.scene + 'Ekran i widok</h3><div class="g2">' +
    '<label class="f" for="pm-res">Rozdzielczość bazowa<select class="inp" id="pm-res">' + Object.keys(VIEWS).map(function (k) { return '<option value="' + k + '"' + (s.res === k ? ' selected' : '') + '>' + VIEWS[k][2] + '</option>'; }).join('') + '</select><span class="help">Orientacja: ' + (s.viewW >= s.viewH ? 'pozioma' : 'pionowa') + '. Rozmiar ekranu w kratkach: ' + s.viewW + ' × ' + s.viewH + '.</span></label>' +
    '<label class="f" for="pm-view">Typ gry bazowej<select class="inp" id="pm-view"><option value="side"' + (s.view === 'side' ? ' selected' : '') + '>Widok z boku (platformówka, side-scroller)</option><option value="top"' + (s.view === 'top' ? ' selected' : '') + '>Widok z góry (top-down)</option></select><span class="help">Zmiana widoku nie usuwa komponentów – Diagnostyka pokaże te, które nie pasują.</span></label></div></section>' +
    '<section class="sec"><h3>' + I.sliders + 'Dźwięk, sterowanie, platforma</h3><label class="sw"><input type="checkbox" id="pm-snd"' + (s.sound !== false ? ' checked' : '') + '>Dźwięki w grze domyślnie włączone</label>' +
    '<div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Akcja</th><th>Klawisze</th><th>Dotyk</th></tr></thead><tbody><tr><td>Ruch</td><td>Strzałki, W A S D</td><td>Krzyżak</td></tr><tr><td>Skok</td><td>Spacja, ↑, W</td><td>SKOK</td></tr><tr><td>Bieg</td><td>Shift</td><td>—</td></tr><tr><td>Użyj / rozmawiaj</td><td>E</td><td>E</td></tr><tr><td>Cios (atak wręcz)</td><td>Z, K</td><td>Z</td></tr><tr><td>Strzał</td><td>X, J</td><td>X</td></tr><tr><td>Unik</td><td>C, L</td><td>C</td></tr><tr><td>Wybór w rozmowie / karta</td><td>1, 2, 3…</td><td>klik</td></tr><tr><td>Koniec tury w pojedynku</td><td>Enter</td><td>przycisk</td></tr><tr><td>Machnięcie skrzydłami (Flappy)</td><td>spacja, ↑</td><td>klik w grę</td></tr><tr><td>Pauza</td><td>P, Esc</td><td>—</td></tr></tbody></table></div>' +
    '<p class="small">Docelowa platforma: <b>HTML5 (przeglądarka)</b>. Windows, macOS, Linux, Android i iOS – kolejne etapy po walidacji technicznej.</p></section>' +
    '<section class="sec"><h3>' + I.history + 'Kopie zapasowe i wersje</h3><p class="small muted">Projekt zapisuje się automatycznie po każdej zmianie. Co 5 minut pracy powstaje automatyczna kopia. Przywrócenie wersji najpierw zapisuje kopię obecnego stanu.</p>' +
    '<div><button class="btn sm" data-act="backupNow">' + I.save + 'Utwórz kopię teraz</button></div>' +
    (P.versions.length ? '<ul class="issues">' + P.versions.slice().reverse().map(function (x) { return '<li class="issue">' + I.history + '<div class="grow"><b>' + esc(x.label) + '</b><div class="xs muted">' + fmtDate(x.at) + '</div></div><button class="btn sm" data-act="restoreVer" data-id="' + x.id + '">Przywróć</button></li>'; }).join('') + '</ul>' : '<p class="small muted">Brak kopii.</p>') + '</section></div>';
  v.oninput = function (e) {
    var t = e.target, map = { 'pm-name': 'name', 'pm-author': 'author', 'pm-ver': 'version', 'pm-desc': 'desc' };
    if (map[t.id]) { pushUndo(t.id); m[map[t.id]] = t.value; if (t.id === 'pm-name') { $('#pname').textContent = t.value; if (!P.flow.titleText || P.flow.titleText === P.meta.name) P.flow.titleText = t.value; } touched({ quiet: true }); }
  };
  v.onchange = function (e) {
    var t = e.target;
    if (t.id === 'pm-res') mut(function () { s.res = t.value; s.viewW = VIEWS[t.value][0]; s.viewH = VIEWS[t.value][1]; }), render();
    if (t.id === 'pm-view') mut(function () { s.view = t.value; }), render();
    if (t.id === 'pm-snd') mut(function () { s.sound = t.checked; });
  };
};
ACT.backupNow = function () { backup('Kopia ręczna'); saveProject(true); render(); toast('Kopia zapasowa utworzona.', 'ok'); };
ACT.restoreVer = function (a) {
  var vv = P.versions.filter(function (x) { return x.id === a.dataset.id; })[0]; if (!vv) return;
  backup('Kopia przed przywróceniem'); pushUndo(); restoreCore(vv.data); saveProject(true); render(); toast('Przywrócono: ' + vv.label, 'ok');
};
