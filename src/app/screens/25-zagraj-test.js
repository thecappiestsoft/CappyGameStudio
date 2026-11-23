/* ================= TEST ================= */
var TS = { start: null, auto: false, logs: [], filter: '', view: '', showHit: false, inst: null, sel: null, tick: 0 };
window.__cgsGame = function () { return TS.inst; };
ROUTES.test = function (v) {
  v.className = 'full';
  if (!sceneById(TS.start)) TS.start = P.flow.start;
  v.innerHTML = '<div class="testgrid"><div class="gamebox"><div class="playbar"><label class="vh" for="ts-scene">Scena</label><select class="inp" id="ts-scene" style="width:auto;min-height:38px;padding:4px 8px">' + P.scenes.map(function (s) { return '<option value="' + s.id + '"' + (s.id === TS.start ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>' +
    '<button class="btn sm acc" data-act="tsRun">' + I.play + 'Zagraj w tę planszę</button><button class="btn sm" data-act="tsFromStart">' + I.restart + 'Cała gra od początku</button><button class="btn sm" data-act="tsPause">' + I.pause + 'Pauza</button><button class="btn sm" data-act="tsRestartScene">' + I.restart + 'Jeszcze raz</button>' +
    '<label class="vh" for="ts-view">Proporcje</label><select class="inp" id="ts-view" style="width:auto;min-height:38px;padding:4px 8px"><option value="">Ekran projektu (' + P.settings.viewW + '×' + P.settings.viewH + ')</option>' + Object.keys(VIEWS).map(function (k) { return '<option value="' + k + '"' + (TS.view === k ? ' selected' : '') + '>' + VIEWS[k][2] + '</option>'; }).join('') + '</select>' +
    '<label class="sw small"><input type="checkbox" id="ts-hit"' + (TS.showHit ? ' checked' : '') + '>Pokaż ramki</label><label class="sw small"><input type="checkbox" id="ts-snd"' + (SET.sound ? ' checked' : '') + '>Dźwięk</label><button class="btn sm" data-act="tsFull">' + I.full + 'Pełny ekran</button></div><div id="ts-game"></div></div>' +
    '<aside class="sec insp" aria-label="Inspektor działania"><h3>' + I.search + 'Podglądacz</h3><p class="small muted">Kliknij postać lub rzecz w grze, żeby zobaczyć, co teraz robi.</p><div id="ts-insp"></div></aside>' +
    '<section class="sec logbox" aria-label="Logi"><div class="row"><h3 class="grow">' + I.history + 'Co się wydarzyło</h3><div class="seg" role="group" aria-label="Filtr logów">' + [['', 'Wszystkie'], ['warn', 'Ostrzeżenia'], ['error', 'Błędy']].map(function (f) { return '<button data-lf="' + f[0] + '" aria-pressed="' + (TS.filter === f[0]) + '">' + f[1] + '</button>'; }).join('') + '</div><button class="btn sm" data-act="tsClear">Wyczyść</button></div><div class="logs" id="ts-logs" role="log" aria-live="off"></div></section></div>';
  $('#ts-scene').addEventListener('change', function (e) { TS.start = e.target.value; tsMount(); });
  $('#ts-view').addEventListener('change', function (e) { TS.view = e.target.value; tsMount(); });
  $('#ts-hit').addEventListener('change', function (e) { TS.showHit = e.target.checked; tsMount(); });
  $('#ts-snd').addEventListener('change', function (e) { SET.sound = e.target.checked; saveSettings(); tsMount(); });
  v.onclick = function (e) { var b = e.target.closest('[data-lf]'); if (b) { TS.filter = b.dataset.lf; $$('[data-lf]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.lf === TS.filter); }); renderLogs(); } };
  TS.logs = []; tsMount(TS.auto); TS.auto = false;
  var iv = setInterval(function () { renderInsp(); }, 300);
  var onFs = function () { if (TS.inst) TS.inst.el.classList.toggle('fs', !!document.fullscreenElement); };
  document.addEventListener('fullscreenchange', onFs);
  cleanup = function () { clearInterval(iv); document.removeEventListener('fullscreenchange', onFs); if (TS.inst) { TS.inst.destroy(); TS.inst = null; } };
};
function tsMount(autostart) {
  if (TS.inst) TS.inst.destroy();
  TS.sel = null; TS.logs.push({ t: 0, lvl: 'info', msg: '— Uruchomienie testu: scena „' + ((sceneById(TS.start) || {}).name || '') + '” —' });
  var vv = TS.view && VIEWS[TS.view];
  TS.inst = CGM.mountGame($('#ts-game'), P, {
    sound: SND, soundOn: SET.sound, volume: SET.volume, reduceMotion: SET.rm, debug: true, showHit: TS.showHit, startScene: TS.start, forceTitle: false,
    viewW: vv ? vv[0] : null, viewH: vv ? vv[1] : null, maxH: 'max(260px, calc(100vh - 420px))', escPause: true,
    onBack: function () { go('scena'); },
    onLog: function (l) { TS.logs.push(l); if (TS.logs.length > 500) TS.logs.shift(); renderLogs(); },
    onPick: function (id) { TS.sel = id; renderInsp(); }
  });
  renderLogs();
  if (autostart) { var b = $('#ts-game [data-a=start]'); if (b) b.click(); }
}
function renderLogs() {
  var el = $('#ts-logs'); if (!el) return;
  var list = TS.logs.filter(function (l) { return !TS.filter || l.lvl === TS.filter || (TS.filter === 'warn' && l.lvl === 'error'); }).slice(-200);
  el.innerHTML = list.map(function (l) { return '<div class="l-' + l.lvl + '"><time>' + (l.t || 0).toFixed(1) + ' s</time><span>' + (l.lvl === 'error' ? '[błąd] ' : l.lvl === 'warn' ? '[uwaga] ' : '') + esc(l.msg) + '</span></div>'; }).join('') || '<div><span class="muted">Brak wpisów.</span></div>';
  el.scrollTop = el.scrollHeight;
}
function renderInsp() {
  var el = $('#ts-insp'); if (!el || !TS.inst) return;
  var info = TS.sel ? TS.inst.rt().inspect() : null, G = TS.inst.rt().game();
  var h = '';
  if (G) h += '<dl class="kv"><dt>Wynik</dt><dd>' + G.score + '</dd><dt>Zdrowie</dt><dd>' + Math.max(0, G.hp) + '</dd><dt>Życia</dt><dd>' + G.lives + '</dd><dt>Ekwipunek</dt><dd>' + (Object.keys(G.inv).map(function (k) { return esc(k) + ' ×' + G.inv[k]; }).join(', ') || '—') + '</dd><dt>Czas sceny</dt><dd>' + (G.sceneTime || 0).toFixed(1) + ' s</dd></dl>';
  if (info) h += '<hr style="border:0;border-top:2px solid var(--line);width:100%"><b>' + esc(info.name) + '</b><dl class="kv"><dt>Aktywny</dt><dd>' + (info.alive ? 'tak' : 'nie (usunięty)') + '</dd><dt>Kategoria</dt><dd>' + esc(info.cat) + '</dd><dt>Pozycja</dt><dd>' + info.x + ', ' + info.y + '</dd><dt>Prędkość</dt><dd>' + info.vx + ', ' + info.vy + '</dd><dt>Zdrowie</dt><dd>' + info.hp + '</dd><dt>Stan</dt><dd>' + esc(info.state) + '</dd><dt>Steruje ruchem</dt><dd>' + esc(info.driver) + '</dd><dt>Na ziemi</dt><dd>' + info.ground + '</dd><dt>Komponenty</dt><dd>' + esc(info.comps.join(', ')) + '</dd></dl>' +
    '<p class="small muted">Ostatnie reakcje:</p><div class="logs">' + TS.logs.filter(function (l) { return l.ent === info.id; }).slice(-5).map(function (l) { return '<div><time>' + l.t.toFixed(1) + ' s</time><span>' + esc(l.msg) + '</span></div>'; }).join('') + '</div>';
  else h += '<p class="small muted">Nie wybrano obiektu.</p>';
  if (el.innerHTML !== h) el.innerHTML = h;
}
ACT.tsRun = function () { tsMount(true); };
ACT.tsFromStart = function () { TS.start = P.flow.start; var s = $('#ts-scene'); if (s) s.value = TS.start; tsMount(true); };
ACT.tsPause = function () { if (TS.inst) TS.inst.pause(); };
ACT.tsRestartScene = function () { if (TS.inst && TS.inst.rt().state() === 'play') TS.inst.restartScene(); else tsMount(true); };
ACT.tsClear = function () { TS.logs = []; renderLogs(); };
ACT.tsFull = function () { var el = $('#ts-game'); try { var r = el.requestFullscreen && el.requestFullscreen(); if (r && r.catch) r.catch(function () { toast('Pełny ekran nie jest tu dostępny. Działa w wyeksportowanej grze.', 'warn'); }); else if (!r) toast('Pełny ekran nie jest tu dostępny.', 'warn'); } catch (e) { toast('Pełny ekran nie jest tu dostępny.', 'warn'); } };
