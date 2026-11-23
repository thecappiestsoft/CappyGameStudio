/* ---------------- router & chrome ---------------- */
var ROUTES = {}, ACT = {};
var MODULE_ROUTES = { scena: 1, obiekty: 1, zachowania: 1, mechaniki: 1, przebieg: 1, zasoby: 1, test: 1, eksport: 1, projekt: 1, karty: 1 };
var NAV = [
  ['scena', 'Plansza', 'Układaj świat gry', I.scene, 'Wybierz klocek po lewej i klikaj na planszy – tak budujesz świat gry. Przeciągaj, żeby przesuwać.'],
  ['obiekty', 'Postacie i rzeczy', 'Jak wyglądają', I.object, 'Tu decydujesz, jak wygląda każda postać i rzecz: obrazek, kolor, rozmiar. Możesz też zrobić wariant, np. szybszego potworka.'],
  ['zachowania', 'Co robią?', 'Ruch, skoki, wrogowie', I.behavior, 'Wybierz postać z lewej i dodaj jej zachowanie z listy po prawej – np. skakanie, patrol albo strzelanie.'],
  ['mechaniki', 'Zasady', 'Punkty, życia, czas', I.mech, 'Ustal zasady całej gry: ile jest żyć, czy liczymy punkty, czy jest zegar.'],
  ['przebieg', 'Poziomy', 'Kolejność i cele', I.flow, 'Ułóż poziomy po kolei i powiedz, kiedy poziom jest ukończony – np. gdy gracz dojdzie do flagi.'],
  ['zasoby', 'Obrazki i dźwięki', 'Twoje własne pliki', I.asset, 'Wgraj własne rysunki i dźwięki. Gotowe obrazki z biblioteki już masz – nie musisz nic dodawać.'],
  ['test', 'Zagraj!', 'Sprawdź swoją grę', I.play, 'Zagraj i sprawdź, czy wszystko działa. Kliknij postać w grze, żeby podejrzeć, co robi.'],
  ['eksport', 'Udostępnij', 'Zapisz grę do pliku', I.export, 'Zapisz grę jako plik i pokaż ją znajomym – otworzy się w każdej przeglądarce.']
];
var NAVX = { projekt: ['Ustawienia gry', 'Nazwa, ekran, kopie', I.project, 'Tu zmienisz nazwę gry, rozmiar ekranu i przywrócisz starszą wersję, jeśli coś pójdzie nie tak.', 'var(--m-projekt)'], karty: ['Karty i talie', 'Własne karty do pojedynków', I.cards, 'Wymyśl własne karty: stwory, czary i karty mocy. Potem ułóż z nich talie dla siebie i przeciwników. Sprawdź je w próbnym pojedynku!', 'var(--m-mechaniki)'] };
function navInfo(r) { for (var i = 0; i < NAV.length; i++) if (NAV[i][0] === r) return { i: i, name: NAV[i][1], sub: NAV[i][2], icon: NAV[i][3], tip: NAV[i][4], color: 'var(--m-' + r + ')' }; var x = NAVX[r]; return x ? { i: -1, name: x[0], sub: x[1], icon: x[2], tip: x[3], color: x[4] } : null; }
var mascotURL = '';
function renderModbar(r) {
  var el = $('#modbar'), n = P && navInfo(r);
  document.documentElement.style.setProperty('--mod', n ? n.color : 'var(--primary)');
  if (!n || !MODULE_ROUTES[r]) { el.hidden = true; el.innerHTML = ''; return; }
  var prev = n.i > 0 ? NAV[n.i - 1] : null, next = n.i >= 0 && n.i < NAV.length - 1 ? NAV[n.i + 1] : null;
  el.hidden = false;
  el.innerHTML = '<span class="mt">' + n.icon + '</span><div class="mh"><small>' + (n.i >= 0 ? 'Krok ' + (n.i + 1) + ' z ' + NAV.length : r === 'karty' ? 'Dodatek' : 'Ustawienia') + '</small><b>' + n.name + '</b></div>' +
    '<div class="cappy"><img alt="" src="' + mascotURL + '"><p class="bubble"><span class="vh">Cappy podpowiada: </span>' + n.tip + '</p></div>' +
    '<div class="stepnav">' + (prev ? '<a class="btn sm" href="#' + prev[0] + '" title="Poprzedni krok: ' + prev[1] + '">' + I.back + '<span>' + prev[1] + '</span></a>' : '') + (next ? '<a class="btn sm pri" href="#' + next[0] + '" title="Następny krok: ' + next[1] + '"><span>Dalej: ' + next[1] + '</span>' + I.next + '</a>' : '') + '</div>';
}
function route() { return (location.hash || '#start').slice(1) || 'start'; }
function go(r) { if (location.hash !== '#' + r) location.hash = r; else render(); }
window.addEventListener('hashchange', render);
var cleanup = null;
function render() {
  var r = route();
  if (!ROUTES[r]) r = 'start';
  if (MODULE_ROUTES[r] && !P) { r = 'start'; }
  if (cleanup) { var cf = cleanup; cleanup = null; cf(); }
  var hasP = !!P && MODULE_ROUTES[r];
  $('#body').classList.toggle('nonav', !P);
  $('#mnav').hidden = !P;
  $('#mnav').innerHTML = P ? '<p class="navt">Twoja gra krok po kroku</p>' + NAV.map(function (n, i) { return '<a class="step' + (n[0] === 'test' ? ' play' : '') + '" href="#' + n[0] + '" style="--c:var(--m-' + n[0] + ')"' + (n[0] === r ? ' aria-current="page"' : '') + '><span class="ti">' + n[3] + '<span class="num" aria-hidden="true">' + (i + 1) + '</span></span><span class="tx"><b>' + n[1] + '</b><small>' + n[2] + '</small></span></a>'; }).join('') +
    '<hr><a class="small" href="#samouczki"' + (r === 'samouczki' ? ' aria-current="page"' : '') + '>' + I.help + '<span>Nauka z Cappy</span></a><a class="small" href="#karty"' + (r === 'karty' ? ' aria-current="page"' : '') + '>' + I.cards + '<span>Karty i talie</span></a><a class="small" href="#projekt"' + (r === 'projekt' ? ' aria-current="page"' : '') + '>' + I.project + '<span>Ustawienia gry</span></a><a class="small" href="#start"' + (r === 'start' ? ' aria-current="page"' : '') + '>' + I.folder + '<span>Moje gry</span></a><a class="small" href="#pomoc"' + (r === 'pomoc' ? ' aria-current="page"' : '') + '>' + I.help + '<span>Pomoc</span></a><a class="small" href="#ustawienia"' + (r === 'ustawienia' ? ' aria-current="page"' : '') + '>' + I.gear + '<span>Wygląd aplikacji</span></a>' : '';
  renderModbar(r);
  $('#pname').textContent = P ? P.meta.name : '';
  updTop();
  var v = $('#view'); v.className = ''; v.scrollTop = 0; v.onclick = null; v.oninput = null; v.onchange = null;
  ROUTES[r](v);
  renderDiag();
  if (!hasP) $('#diag').hidden = true;
}
function updTop() {
  var el = $('#topacts'); if (!el) return;
  var r = route();
  if (!P) { el.innerHTML = '<a class="btn sm ghost" href="#pomoc">' + I.help + '<span>Pomoc</span></a><a class="btn sm ghost" href="#ustawienia">' + I.gear + '<span>Wygląd</span></a>'; return; }
  el.innerHTML = '<button class="btn sm" data-act="undo" title="Cofnij (Ctrl+Z)"' + (UNDO.length ? '' : ' disabled') + '>' + I.undo + '<span>Cofnij</span></button>' +
    '<button class="btn sm" data-act="redo" title="Ponów (Ctrl+Y)"' + (REDO.length ? '' : ' disabled') + '>' + I.redo + '<span>Ponów</span></button>' +
    '<button class="btn sm" data-act="saveNow" title="Zapisz wersję (Ctrl+S)">' + I.save + '<span>Zapisz</span></button>' +
    (r === 'test' ? '<button class="btn big" data-act="stopTest" title="Wróć do planszy">' + I.stop + '<span>Wróć do planszy</span></button>' : '<button class="btn big acc" data-act="runScene" title="Zagraj w tę planszę (F5)">' + I.play + '<span>Zagraj</span></button>');
}
document.addEventListener('click', function (e) {
  var a = e.target.closest('[data-act]'); if (!a) return;
  var f = ACT[a.dataset.act]; if (f) { e.preventDefault(); f(a, e); }
});
ACT.undo = undo; ACT.redo = redo;
ACT.saveNow = function () { backup('Wersja zapisana ręcznie'); saveProject(true); toast('Zapisano wersję projektu. Znajdziesz ją w ustawieniach projektu.', 'ok'); };
ACT.runScene = function () { TS.start = SE.sceneId || P.flow.start; TS.auto = true; go('test'); };
ACT.stopTest = function () { go('scena'); };
ACT.goExport = function () { go('eksport'); };
ACT.diagT = function () { SET.diagOpen = !SET.diagOpen; saveSettings(); renderDiag(); };
ACT.diagGo = function (a) { goWhere(DIAG[+a.dataset.i].where); };
document.addEventListener('keydown', function (e) {
  if ($('#modal-root .modal') || !P) return;
  var t = e.target, field = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
  var mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); ACT.saveNow(); return; }
  if (route() === 'test') return;
  if (mod && !field && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
  if (mod && !field && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
  if (e.key === 'F5') { e.preventDefault(); ACT.runScene(); }
});

/* split panes */
function bindSplits(root) {
  $$('.split', root).forEach(function (sp) {
    var side = sp.dataset.side;
    sp.tabIndex = 0; sp.setAttribute('role', 'separator'); sp.setAttribute('aria-orientation', 'vertical'); sp.setAttribute('aria-label', 'Zmień szerokość panelu');
    function setW(w) { w = clamp(w, 180, 520); SET[side === 'l' ? 'leftw' : 'rightw'] = w; document.documentElement.style.setProperty(side === 'l' ? '--leftw' : '--rightw', w + 'px'); }
    sp.addEventListener('pointerdown', function (e) {
      sp.setPointerCapture(e.pointerId); sp.classList.add('on');
      var x0 = e.clientX, w0 = SET[side === 'l' ? 'leftw' : 'rightw'];
      function mv(ev) { setW(side === 'l' ? w0 + (ev.clientX - x0) : w0 - (ev.clientX - x0)); if (route() === 'scena') drawSE(); }
      function upf() { sp.classList.remove('on'); sp.removeEventListener('pointermove', mv); sp.removeEventListener('pointerup', upf); saveSettings(); }
      sp.addEventListener('pointermove', mv); sp.addEventListener('pointerup', upf);
    });
    sp.addEventListener('keydown', function (e) { var d = e.key === 'ArrowLeft' ? -16 : e.key === 'ArrowRight' ? 16 : 0; if (!d) return; e.preventDefault(); var w0 = SET[side === 'l' ? 'leftw' : 'rightw']; setW(side === 'l' ? w0 + d : w0 - d); saveSettings(); if (route() === 'scena') drawSE(); });
  });
}
