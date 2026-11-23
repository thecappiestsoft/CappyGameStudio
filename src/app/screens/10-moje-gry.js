/* ================= PROJECT MANAGER ================= */
var TEMPLATES = [
  ['platformer', 'Przygoda z kluczem', 'Gotowa gra o kapibarze: dwa poziomy, klucz, drzwi i strażnik. Najlepszy start!', 'var(--m-zachowania)', 'Polecamy'],
  ['topdown', 'Labirynt', 'Widok z góry: znajdź klucz i przełącznik, a otworzysz wyjście.', 'var(--m-scena)', 'Z góry'],
  ['arcade', 'Wyścig z czasem', 'Zbierz wszystkie monety w minutę. Strzelaj klawiszem X!', 'var(--m-przebieg)', 'Na czas'],
  ['empty', 'Pusta plansza', 'Budujesz wszystko sam. Wybierasz, czy gra jest z boku, czy z góry.', 'var(--m-mechaniki)', 'Od zera'],
  ['rpg', 'RPG', 'Wioska, rozmowy z mieszkańcami, miecz i las pełen glutków. Odzyskaj Kryształ Mocy!', 'var(--m-zachowania)', 'Przygoda', 'g'],
  ['vn', 'Visual Novel', 'Opowieść z wyborami: czytasz, a potem decydujesz, dokąd iść. Kilka zakończeń!', 'var(--m-przebieg)', 'Opowieść', 'g'],
  ['cards', 'Gra karciana', 'Pojedynki jak w Hearthstone: mana, stwory, czary i karty mocy. Twórz własne karty i talie!', 'var(--m-mechaniki)', 'Karty', 'g'],
  ['souls', 'Souls-like', 'Trudna walka mieczem: patrz na wykrzyknik, rób unik, odpoczywaj przy ogniskach. Na końcu boss!', 'var(--m-eksport)', 'Wyzwanie', 'g'],
  ['bullethell', 'Bullet Hell', 'Twój statek strzela sam, a ty lawirujesz między spiralami pocisków.', 'var(--m-test)', 'Zręczność', 'g'],
  ['bulletheaven', 'Bullet Heaven', 'Strzelasz automatycznie, a fale potworów rosną. Przetrwaj 90 sekund!', 'var(--m-zasoby)', 'Przetrwanie', 'g'],
  ['clicker', 'Cappy Clicker', 'Klikaj wielką pomarańczę, kupuj pomocników i buduj sad. Gra, która rośnie sama!', 'var(--m-obiekty)', 'Klikanie', 'g'],
  ['flappy', 'Flappy Cappy', 'Latająca kapibara! Jedno naciśnięcie – jedno machnięcie skrzydełkami. Przeleć między pędami bambusa aż do mety!', 'var(--m-scena)', 'Refleks', 'g'],
  ['dungeon', 'Dungeon Crawler', 'Lochy krok po kroku: ruszasz się o jedną kratkę, a potwory po tobie. Widzisz tylko tyle, ile oświetla pochodnia.', 'var(--m-eksport)', 'Turowa', 'g'],
  ['looter', 'Looter Shooter', 'Strzelaj, otwieraj skrzynie i zbieraj losowe bronie: zwykłe, rzadkie, epickie i legendarne!', 'var(--m-test)', 'Łupy', 'g'],
  ['towerdef', 'Tower Defense', 'Stawiaj wieże przy ścieżce i ulepszaj je za złoto. Nie przepuść żadnej fali do bazy!', 'var(--m-zachowania)', 'Strategia', 'g'],
  ['sokoban', 'Łamigłówka ze skrzyniami', 'Sokoban: wepchnij wszystkie skrzynie na pola. Myśl, zanim pchniesz – skrzyni nie da się ciągnąć!', 'var(--m-mechaniki)', 'Logika', 'g'],
  ['racing', 'Wyścigi', 'Gaz, hamulec, zakręt! Przejedź 3 okrążenia szybciej niż dwa auta rywali.', 'var(--m-przebieg)', 'Wyścig', 'g'],
  ['snake', 'Wąż', 'Klasyka: zjadaj pomarańcze i rośnij. Nie uderz w ścianę ani we własny ogon!', 'var(--m-zasoby)', 'Klasyka', 'g'],
  ['breakout', 'Arkanoid', 'Odbijaj piłkę paletką i rozbijaj kolorowe cegiełki. Niektóre wytrzymują kilka uderzeń!', 'var(--m-obiekty)', 'Odbijanie', 'g'],
  ['metroid', 'Metroidvania', 'Duże jaskinie do odkrywania. Zdobądź podwójny skok, a dosięgniesz nowych miejsc.', 'var(--m-scena)', 'Eksploracja', 'g']
];
var tplCache = {};
function tplThumb(t) { if (!tplCache[t]) { try { tplCache[t] = projectThumb(newProject({ name: 'x', template: t, view: 'side' })); } catch (e) { tplCache[t] = ''; } } return tplCache[t]; }
ROUTES.start = function (v) {
  var list = INDEX.slice().sort(function (a, b) { return b.updated - a.updated; });
  v.innerHTML = '<div class="wrap">' +
    (STORE.mode() === 'mem' ? '<div class="banner">' + I.alert + '<span>Ta przeglądarka nie pozwala zapisywać danych. Projekty znikną po zamknięciu strony – eksportuj je do pliku.</span></div>' : '') +
    '<section class="hero-band"><span id="mascot"></span><div><p class="eyebrow">Cześć, tu Cappy!</p><h1>Zbudujmy razem grę.</h1><p>Układasz planszę z klocków, wybierasz postacie i mówisz im, co mają robić. Bez pisania kodu – wszystko klikasz i ustawiasz. A potem od razu grasz!</p>' +
    '<div class="row" style="margin-top:14px"><button class="btn big acc" data-act="newProj" data-t="platformer">' + I.play + 'Zacznij przygodę</button><button class="btn" data-act="newProj">' + I.plus + 'Nowa gra</button><button class="btn" data-act="openFile">' + I.upload + 'Otwórz z pliku</button><button class="btn" data-act="tutHub">' + I.help + 'Nauka z Cappy</button>' + (SET.last && INDEX.some(function (x) { return x.id === SET.last; }) ? '<button class="btn" data-act="openProj" data-id="' + SET.last + '">' + I.history + 'Wróć do ostatniej gry</button>' : '') + '</div></div></section>' +
    '<section><h2 style="font-size:1.45rem;margin-bottom:12px">Od czego zaczynasz?</h2><div class="tplgrid">' + TEMPLATES.filter(function (t) { return !t[5]; }).map(function (t) { return '<button class="tpl" data-act="newProj" data-t="' + t[0] + '" style="--c:' + t[3] + '"><img alt="" src="' + tplThumb(t[0]) + '"><span class="tb"><span class="tag">' + t[4] + '</span><b>' + t[1] + '</b><span>' + t[2] + '</span></span></button>'; }).join('') + '</div></section>' +
    '<section><h2 style="font-size:1.45rem;margin-bottom:4px">Prototypy gatunków</h2><p class="muted" style="margin-bottom:12px">Gotowe przykłady znanych rodzajów gier. Zagraj, zajrzyj do środka i zmieniaj, co chcesz!</p><div class="tplgrid">' + TEMPLATES.filter(function (t) { return t[5]; }).map(function (t) { return '<button class="tpl" data-act="newProj" data-t="' + t[0] + '" style="--c:' + t[3] + '"><img alt="" src="' + tplThumb(t[0]) + '"><span class="tb"><span class="tag">' + t[4] + '</span><b>' + t[1] + '</b><span>' + t[2] + '</span></span></button>'; }).join('') + '</div></section>' +
    '<section><h2 style="font-size:1.45rem;margin-bottom:12px">Moje gry (' + list.length + ')</h2>' +
    (list.length ? '<div class="grid">' + list.map(function (p) { return '<article class="pcard">' + (p.thumb ? '<img class="thumb" src="' + p.thumb + '" alt="Podgląd sceny startowej: ' + esc(p.name) + '">' : '<div class="thumb"></div>') + '<div class="pb"><h3>' + esc(p.name) + '</h3><p class="xs muted">Wersja ' + esc(p.version) + (p.author ? ' · ' + esc(p.author) : '') + ' · ' + fmtDate(p.updated) + '</p><div class="acts"><button class="btn pri sm" data-act="openProj" data-id="' + p.id + '">Otwórz</button><button class="btn sm icon" data-act="projMore" data-id="' + p.id + '" aria-label="Więcej opcji: ' + esc(p.name) + '">' + I.dots + '</button></div></div></article>'; }).join('') + '</div>' : '<div class="empty">Nie masz jeszcze żadnej gry. Wybierz początek powyżej – najlepiej „Przygoda z kluczem”!</div>') + '</section></div>';
  var c = document.createElement('canvas'); c.width = c.height = 300; var x = c.getContext('2d'); x.scale(2, 2); CGM.drawSprite(x, { type: 'hero', v: 'capy' }, 0, 0, 150, 150, 0, { dir: 1 }); $('#mascot').appendChild(c);
};
ACT.newProj = function (a) {
  var t = (a && a.dataset.t) || 'empty';
  openModal({
    title: 'Nowa gra',
    body: '<form id="npf" style="display:flex;flex-direction:column;gap:12px">' +
      '<label class="f" for="np-name">Jak nazywa się twoja gra?<input class="inp" id="np-name" maxlength="60" value="' + ({ platformer: 'Kapibara i Zaginiony Klucz', topdown: 'Tajemniczy labirynt', arcade: 'Wyścig z czasem', rpg: 'Kryształ Mocy', vn: 'Pierwszy dzień w szkole', cards: 'Wieża pojedynków', souls: 'Ruiny zamku', bullethell: 'Gwiezdna burza', bulletheaven: 'Polana przetrwania', metroid: 'Jaskinie echa', clicker: 'Cappy Clicker', flappy: 'Flappy Cappy', dungeon: 'Lochy Cappy', looter: 'Łowcy łupów', towerdef: 'Obrona sadu', sokoban: 'Magazyn skrzyń', racing: 'Grand Prix Kapibar', snake: 'Kapibarowy wąż', breakout: 'Cegiełkowy zamek' }[t] || '') + '" placeholder="np. Kosmiczna przygoda" autofocus></label>' +
      '<div class="row"><label class="f grow" for="np-author">Autor<input class="inp" id="np-author" maxlength="40" placeholder="Pseudonim lub nazwa zespołu"></label><label class="f grow" for="np-res">Rozdzielczość ekranu gry<select class="inp" id="np-res">' + Object.keys(VIEWS).map(function (k) { return '<option value="' + k + '">' + VIEWS[k][2] + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="f" for="np-desc">Opis<textarea class="inp" id="np-desc" maxlength="300" placeholder="O czym jest gra?"></textarea></label>' +
      '<fieldset style="border:0;padding:0;margin:0"><legend class="small" style="font-weight:600;margin-bottom:6px">Od czego zaczynasz?</legend><div class="choice-grid" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">' + TEMPLATES.map(function (x) { return '<label class="choice"><input type="radio" name="np-t" value="' + x[0] + '"' + (x[0] === t ? ' checked' : '') + '><span class="tick">' + I.check + '</span><b>' + x[1] + '</b><span class="xs">' + x[2] + '</span></label>'; }).join('') + '</div></fieldset>' +
      '<label class="f" for="np-view" id="np-viewl">Widok (dla pustego projektu)<select class="inp" id="np-view"><option value="side">Z boku – platformówka, side-scroller</option><option value="top">Z góry – top-down</option></select></label></form>',
    actions: [{ label: 'Anuluj' }, { label: 'Stwórz grę', cls: 'pri', fn: function (root) {
      var name = $('#np-name', root).value.trim(); if (!name) { toast('Wpisz nazwę gry – wystarczy kilka słów.', 'warn'); $('#np-name', root).focus(); return true; }
      var tt = ($('input[name=np-t]:checked', root) || {}).value || 'empty';
      var p = newProject({ name: name, author: $('#np-author', root).value.trim(), desc: $('#np-desc', root).value.trim(), template: tt, res: $('#np-res', root).value, view: $('#np-view', root).value });
      p.meta.name = name; p.flow.titleText = name;
      openProject(p, true); toast('Gra gotowa! Zacznij od planszy albo od razu kliknij „Zagraj”.', 'ok');
    } }]
  });
};
ACT.openFile = function () {
  pickFile('.json,application/json', false, function (fs) {
    var f = fs[0]; if (!f) return;
    if (f.size > 40 * 1024 * 1024) { toast('Plik jest za duży (limit 40 MB).', 'warn'); return; }
    var r = new FileReader(); r.onload = function () {
      try { var d = JSON.parse(r.result), p = d.project || d; if (!p || p.format !== 'cgs-1' || !p.objects || !Array.isArray(p.scenes)) throw new Error('bad'); p.id = uid('p'); p.meta.updated = now(); p.assets = p.assets || {}; p.prefabs = p.prefabs || []; p.versions = p.versions || []; p.mechanics = Object.assign(baseMechanics(), p.mechanics || {}); openProject(p, true); toast('Projekt otwarty z pliku.', 'ok'); }
      catch (e) { toast('To nie jest plik projektu CappyGameStudio (.cgs.json).', 'warn'); }
    }; r.readAsText(f);
  });
};
ACT.openProj = function (a) { STORE.get('p:' + a.dataset.id).then(function (p) { if (!p) { toast('Nie znaleziono projektu.', 'warn'); return; } openProject(p, false); }); };
ACT.projMore = function (a) {
  var row = INDEX.filter(function (x) { return x.id === a.dataset.id; })[0]; if (!row) return;
  openModal({ title: row.name, body: '<div class="row"><button class="btn" data-x="dup">' + I.copy + 'Duplikuj</button><button class="btn" data-x="exp">' + I.download + 'Eksportuj plik projektu</button></div><div class="soft" id="delbox"><p class="small"><b>Usuń projekt</b> – tej operacji nie da się cofnąć.</p><div><button class="btn sm danger" data-x="del">' + I.trash + 'Usuń</button></div></div>',
    onOpen: function (root) {
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-x]'); if (!b) return; var x = b.dataset.x;
        if (x === 'dup' || x === 'exp') STORE.get('p:' + row.id).then(function (p) {
          if (!p) return;
          if (x === 'exp') { saveFile(slug(p.meta.name) + '.cgs.json', JSON.stringify({ kind: 'cappygamestudio-project', project: p }), 'application/json'); return; }
          p.id = uid('p'); p.meta.name = (p.meta.name + ' (kopia)').slice(0, 60); p.meta.updated = now();
          STORE.set('p:' + p.id, p).then(function () { INDEX.unshift({ id: p.id, name: p.meta.name, version: p.meta.version, updated: p.meta.updated, author: p.meta.author, thumb: row.thumb }); STORE.set('index', INDEX); closeModal(); render(); toast('Zrobiono kopię projektu.', 'ok'); });
        });
        if (x === 'del') $('#delbox', root).innerHTML = '<p class="small"><b>Na pewno usunąć „' + esc(row.name) + '”?</b></p><div class="row"><button class="btn sm danger" data-x="del2">Tak, usuń</button><button class="btn sm" data-x="no">Nie</button></div>';
        if (x === 'no') closeModal();
        if (x === 'del2') { STORE.del('p:' + row.id); INDEX = INDEX.filter(function (r) { return r.id !== row.id; }); STORE.set('index', INDEX); if (P && P.id === row.id) P = null; closeModal(); render(); toast('Projekt usunięty.'); }
      });
    } });
};
function openProject(p, isNew) {
  P = p; UNDO = []; REDO = []; lastBackup = now();
  P.mechanics = Object.assign(baseMechanics(), P.mechanics || {});
  P.prefabs = P.prefabs || []; P.assets = P.assets || {}; P.versions = P.versions || [];
  CGM.registerAssets(P.assets);
  SE.sceneId = P.flow.start || (P.scenes[0] && P.scenes[0].id); SE.sel = []; SE.fitted = false;
  OS.def = 'player'; BS.def = 'player'; GF.scene = SE.sceneId; AS.sel = null; TS.logs = [];
  SET.last = P.id; saveSettings();
  if (isNew) saveProject(true);
  go('scena');
}
