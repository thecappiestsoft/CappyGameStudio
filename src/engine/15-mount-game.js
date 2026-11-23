  function mountGame(root, Pj, opts) {
    opts = opts || {};
    ensureCss();
    var sound = opts.sound || Sound();
    var view = Pj.settings.view;
    root.innerHTML = '<div class="cgm"><div class="cgm-hud" role="status"></div><div class="cgm-stage"><canvas role="img" aria-label="Gra ' + esc2(Pj.meta.name) + '"></canvas><div class="cgm-toast" aria-live="polite" hidden></div><div class="cgm-key" hidden></div><div class="cgm-dlg" aria-live="polite" hidden></div><div class="cgm-duel" hidden></div><div class="cgm-over"></div></div>' +
      '<div class="cgm-touch"><div class="cgm-pad"><span></span><button class="cgm-tb" data-k="u" aria-label="Góra">▲</button><span></span><button class="cgm-tb" data-k="l" aria-label="Lewo">◀</button><button class="cgm-tb" data-k="d" aria-label="Dół">▼</button><button class="cgm-tb" data-k="r" aria-label="Prawo">▶</button></div><div class="cgm-acts"><button class="cgm-tb" data-k="act" aria-label="Użyj">E</button><button class="cgm-tb" data-k="melee" aria-label="Atak wręcz">Z</button><button class="cgm-tb" data-k="fire" aria-label="Strzał">X</button><button class="cgm-tb" data-k="dodge" aria-label="Unik">C</button>' + (view !== 'top' ? '<button class="cgm-tb big" data-k="jump">SKOK</button>' : '') + '</div></div></div>';
    var box = root.firstChild, hud = box.querySelector('.cgm-hud'), cv = box.querySelector('canvas'), toastEl = box.querySelector('.cgm-toast'), keyEl = box.querySelector('.cgm-key'), dlg = box.querySelector('.cgm-dlg'), duelEl = box.querySelector('.cgm-duel'), duelSt = null, over = box.querySelector('.cgm-over'), touch = box.querySelector('.cgm-touch');
    var input = { l: 0, r: 0, u: 0, d: 0, run: 0, fire: 0 }, rt = null, tT = 0, kT = 0, lastHud = '';
    var coarse = false; try { coarse = matchMedia('(pointer: coarse)').matches; } catch (e) { }
    if ((coarse || opts.touch) && Pj.export !== false) touch.classList.add('on');
    function toast(m) { toastEl.textContent = m; toastEl.hidden = false; clearTimeout(tT); tT = setTimeout(function () { toastEl.hidden = true; }, 2600); }
    function hintKey(m) { keyEl.textContent = m; keyEl.hidden = false; clearTimeout(kT); kT = setTimeout(function () { keyEl.hidden = true; }, 2000); }
    function dialog(name, line, i, n, choices) {
      if (!name) { dlg.hidden = true; return; }
      dlg.innerHTML = '<b>' + esc2(name) + '</b><span>' + esc2(line) + '</span>' + (choices ? '<div class="cgm-choices">' + choices.map(function (c, k) { return '<button class="cgm-choice" data-ch="' + k + '">' + (k + 1) + '. ' + esc2(c.text) + '</button>'; }).join('') + '</div><small>Wybierz: kliknij albo naciśnij ' + choices.map(function (c, k) { return k + 1; }).join(' / ') + '</small>' : '<small>' + i + '/' + n + ' · E / Enter / kliknij – dalej</small>');
      dlg.hidden = false;
      if (choices) setTimeout(function () { var b = dlg.querySelector('.cgm-choice'); if (b) try { b.focus({ preventScroll: true }); } catch (er) { } }, 30);
    }
    function duel(cfg, done) {
      duelSt = cardDuel(duelEl, cfg, sound, { reduceMotion: opts.reduceMotion, fast: opts.fastDuel }, function (win) { duelSt = null; done(win); });
    }
    var clickSt = null;
    function clicker(cfg, ups, done) {
      clickSt = clickerUI(duelEl, cfg, ups, sound, { reduceMotion: opts.reduceMotion }, function (win, total) { clickSt = null; done(win, total); });
    }
    var HUD = (Pj.mechanics && Pj.mechanics.hud) || {};
    function renderHud(G, maxHp, scene, state, paused, boss) {
      var M = Pj.mechanics || {}, p = [];
      var sv = ((scene.complete || {}).conds || []).filter(function (c) { return c.type === 'survive'; })[0];
      if (sv && state === 'play') p.push('<span class="cgm-pill">' + IC.clock + 'Przetrwaj: ' + fmt(Math.max(0, (sv.val || 30) - G.sceneTime)) + '</span>');
      if (boss) p.push('<span class="cgm-boss">' + esc2(boss.name) + ' <span class="cgm-bar" aria-hidden="true"><i style="width:' + Math.round(boss.hp / boss.max * 100) + '%"></i></span>' + boss.hp + '/' + boss.max + '</span>');
      if (HUD.scene !== false && (Pj.scenes || []).length > 1) p.push('<span class="cgm-pill">' + IC.flag + esc2(scene.name) + '</span>');
      if (HUD.score !== false && M.score && M.score.on !== false) p.push('<span class="cgm-pill">' + IC.star + 'Wynik: ' + G.score + '</span>');
      if (HUD.health !== false) p.push('<span class="cgm-pill">' + IC.heart + 'Zdrowie <span class="cgm-bar" aria-hidden="true"><i style="width:' + Math.round(Math.max(0, G.hp) / maxHp * 100) + '%"></i></span>' + Math.max(0, G.hp) + '/' + maxHp + '</span>');
      if (HUD.lives !== false) p.push('<span class="cgm-pill">' + IC.life + (rt && rt.mode() === 'td' ? 'Baza: ' : 'Życia: ') + G.lives + '</span>');
      if (G.gold != null) p.push('<span class="cgm-pill">' + IC.star + 'Złoto: ' + G.gold + '</span>');
      if (G.weapon) p.push('<span class="cgm-pill" style="border-color:' + G.weapon.color + ';box-shadow:0 2px 0 ' + G.weapon.color + '">' + esc2(G.weapon.name) + '</span>');
      if (G.moves != null) p.push('<span class="cgm-pill">Ruchy: ' + G.moves + '</span>');
      var lpc = ((scene.complete || {}).conds || []).filter(function (c) { return c.type === 'laps'; })[0]; if (lpc) { p.push('<span class="cgm-pill">' + IC.flag + 'Okrążenie: ' + Math.min(G.lap + 1, lpc.val || 3) + '/' + (lpc.val || 3) + '</span>'); if (G.racers > 1) p.push('<span class="cgm-pill">Miejsce: ' + G.place + '/' + G.racers + '</span>'); }
      if (HUD.inventory !== false && M.inventory && M.inventory.on !== false) { var it = Object.keys(G.inv).map(function (k) { return esc2(k) + (G.inv[k] > 1 ? ' ×' + G.inv[k] : ''); }); p.push('<span class="cgm-pill">' + IC.bag + (it.length ? it.join(', ') : 'Ekwipunek pusty') + '</span>'); }
      if (HUD.timer !== false && M.timer && M.timer.on) p.push('<span class="cgm-pill">' + IC.clock + 'Czas: ' + fmt(G.time) + '</span>');
      if (HUD.memory !== false && G.vars) { var vk = Object.keys(G.vars).filter(function (k) { return G.vars[k]; }); if (vk.length) p.push('<span class="cgm-pill">' + IC.star + 'Pamięć: ' + vk.map(function (k) { return esc2(k) + (G.vars[k] !== 1 ? ' ' + G.vars[k] : ''); }).join(', ') + '</span>'); }
      if (paused) p.push('<span class="cgm-pill">Pauza</span>');
      var h = p.join(''); if (h !== lastHud) { hud.innerHTML = h; lastHud = h; }
    }
    function controls() {
      var md = rt ? rt.mode() : '';
      if (md === 'grid') return 'Ruch o kratkę: strzałki / WASD · Wejdź na wroga, żeby go zaatakować · Pchaj skrzynie · R – plansza od nowa · Pauza: P';
      if (md === 'car') return 'Gaz: ▲ · Hamulec i wsteczny: ▼ · Skręt: ◀ ▶ · Jedź po drodze i przejeżdżaj bramki po kolei · Pauza: P';
      if (md === 'snake') return 'Zmieniaj kierunek strzałkami. Jedz przysmaki, nie wjeżdżaj w ściany ani w ogon · Pauza: P';
      if (md === 'paddle') return 'Paletka: ◀ ▶ albo mysz/palec · Start piłki: spacja lub kliknięcie · Pauza: P';
      if (md === 'td') return 'Kliknij pole budowy, żeby postawić wieżę (albo X – wybór pola, E – buduj). Kliknij wieżę, żeby ją ulepszyć · Pauza: P';
      if (md === 'loot') return 'Ruch: strzałki / WASD · Strzał: przytrzymaj X (w stronę ruchu) · Podnieś łup: E · Unik: C · Pauza: P';
      return (view === 'top' ? 'Ruch: strzałki / WASD' : 'Ruch: ◀ ▶ / A D · Skok: spacja / ▲') + ' · Bieg: Shift · Użyj: E · Cios: Z · Strzał: X · Unik: C · Pauza: P';
    }
    function title() {
      var F = Pj.flow || {};
      if (!rt.hasPlayer()) { over.innerHTML = '<div class="cgm-card"><h2>Brak postaci gracza</h2><p>Scena „' + esc2(rt.sceneName()) + '” nie ma obiektu z komponentem ruchu gracza.</p>' + (opts.onBack ? '<div class="cgm-btns"><button class="cgm-btn go" data-a="back">Wróć do edytora</button></div>' : '') + '</div>'; over.hidden = false; return; }
      if (F.title === false && !opts.forceTitle) { begin(); return; }
      over.innerHTML = '<div class="cgm-card"><h2>' + esc2(F.titleText || Pj.meta.name) + '</h2>' + (F.subtitle ? '<p>' + esc2(F.subtitle) + '</p>' : '') + '<p class="cgm-keys">' + controls() + '</p><div class="cgm-btns"><button class="cgm-btn go" data-a="start">Start</button></div></div>';
      over.hidden = false;
      var b = over.querySelector('[data-a=start]'); if (b && opts.autofocus !== false) setTimeout(function () { try { b.focus({ preventScroll: true }); } catch (e) { } }, 30);
    }
    function pauseMenu(on) {
      if (on) { over.innerHTML = '<div class="cgm-card"><h2>Pauza</h2><div class="cgm-btns"><button class="cgm-btn go" data-a="resume">Wznów</button><button class="cgm-btn" data-a="rscene">Restart sceny</button><button class="cgm-btn" data-a="again">Od początku</button></div></div>'; over.hidden = false; }
      else { over.hidden = true; over.innerHTML = ''; }
    }
    function onEnd(res) {
      var F = Pj.flow || {};
      over.innerHTML = '<div class="cgm-card"><h2>' + (res.win ? 'Wygrana!' : 'Koniec gry') + '</h2><p>' + esc2(res.win ? (F.winMsg || 'Gratulacje!') : ((res.reason === 'time' ? 'Skończył się czas. ' : res.reason === 'race' ? 'Rywal dojechał do mety pierwszy. ' : res.reason === 'base' ? 'Wrogowie zniszczyli bazę. ' : 'Skończyły się życia. ') + (F.loseMsg || 'Spróbuj jeszcze raz.'))) + '</p><p class="cgm-keys">Wynik: ' + res.score + ' · Czas: ' + fmt(res.time) + '</p><div class="cgm-btns"><button class="cgm-btn go" data-a="again">Zagraj ponownie</button>' + (opts.onBack ? '<button class="cgm-btn" data-a="back">Wróć do edytora</button>' : '') + '</div></div>';
      over.hidden = false;
      if (opts.onEnd) opts.onEnd(res);
    }
    function build() {
      if (rt) rt.stop();
      if (clickSt) { clickSt.stop(); clickSt = null; } duelSt = null; duelEl.hidden = true; duelEl.innerHTML = '';
      lastHud = ''; sound.set(opts.soundOn !== false, opts.volume == null ? 0.6 : opts.volume);
      rt = Runtime(Pj, cv, { input: input, sound: sound, soundOn: opts.soundOn, volume: opts.volume, toast: toast, hintKey: hintKey, dialog: dialog, hud: renderHud, duel: duel, clicker: clicker, onEnd: onEnd, log: opts.onLog, onScene: opts.onScene }, { reduceMotion: opts.reduceMotion, debug: opts.debug, showHit: opts.showHit, viewW: opts.viewW, viewH: opts.viewH, startScene: opts.startScene });
      var ratio = rt.size.w / rt.size.h;
      cv.style.width = 'min(100%, calc(' + (opts.maxH || '62vh') + ' * ' + ratio.toFixed(4) + '))';
      toastEl.hidden = true; dlg.hidden = true; keyEl.hidden = true;
      title();
    }
    function begin() { sound.unlock(); over.hidden = true; over.innerHTML = ''; if (rt.play()) { try { cv.focus({ preventScroll: true }); } catch (e) { } } }
    over.addEventListener('click', function (e) {
      var a = e.target.closest('[data-a]'); if (!a) return;
      var x = a.dataset.a;
      if (x === 'start') begin(); else if (x === 'again') { build(); begin(); } else if (x === 'back' && opts.onBack) opts.onBack();
      else if (x === 'resume') { rt.pause(false); pauseMenu(false); } else if (x === 'rscene') { rt.restartScene(); pauseMenu(false); }
    });
    dlg.addEventListener('click', function (ev) { var b = ev.target.closest('[data-ch]'); if (b) { rt.choose(+b.dataset.ch); return; } rt.press('act'); });
    var KEYS = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd' };
    function field(t) { return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT'); }
    function kd(e) {
      if (field(e.target) || (opts.keyScope && !opts.keyScope())) return;
      var k = KEYS[e.code], st = rt.state();
      if (duelSt) { if (duelSt.key(e)) e.preventDefault(); return; }
      if (clickSt) return;
      if (/^Digit[1-3]$/.test(e.code) && st === 'play') { rt.choose(+e.code.slice(5) - 1); }
      if (k) { input[k] = 1; if (st === 'play') e.preventDefault(); if (k === 'u' && view !== 'top' && !e.repeat) rt.press('jump'); }
      if (e.code === 'Space' && st === 'play') { e.preventDefault(); if (!e.repeat) rt.press('jump'); }
      if (e.key === 'Shift') input.run = 1;
      if (e.code === 'KeyE' && !e.repeat) rt.press('act');
      if (e.code === 'Enter' && rt.dialogOpen()) { e.preventDefault(); rt.press('enter'); }
      if ((e.code === 'KeyX' || e.code === 'KeyJ') && !e.repeat) rt.press('fire');
      if (e.code === 'KeyX' || e.code === 'KeyJ') input.fire = 1;
      if (e.code === 'KeyR' && !e.repeat && st === 'play' && rt.mode() === 'grid') { rt.restartScene(); toast('Plansza od nowa.'); }
      if ((e.code === 'KeyZ' || e.code === 'KeyK') && !e.repeat) rt.press('melee');
      if ((e.code === 'KeyC' || e.code === 'KeyL') && !e.repeat) rt.press('dodge');
      if ((e.code === 'KeyP' || (e.code === 'Escape' && opts.escPause !== false)) && st === 'play') { e.preventDefault(); var p = rt.pause(); pauseMenu(p); }
    }
    function ku(e) { var k = KEYS[e.code]; if (k) input[k] = 0; if (e.key === 'Shift') input.run = 0; if (e.code === 'KeyX' || e.code === 'KeyJ') input.fire = 0; }
    function blur() { input.l = input.r = input.u = input.d = input.run = input.fire = 0; }
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); window.addEventListener('blur', blur);
    touch.addEventListener('pointerdown', function (e) { var b = e.target.closest('[data-k]'); if (!b) return; e.preventDefault(); var k = b.dataset.k; if (k === 'jump' || k === 'act' || k === 'fire' || k === 'melee' || k === 'dodge') { rt.press(k); if (k === 'fire') input.fire = 1; } else { input[k] = 1; if (k === 'u' && view !== 'top') rt.press('jump'); } try { b.setPointerCapture(e.pointerId); } catch (er) { } });
    function up(e) { var b = e.target.closest('[data-k]'); if (b && input[b.dataset.k] != null) input[b.dataset.k] = 0; if (b && b.dataset.k === 'fire') input.fire = 0; }
    touch.addEventListener('pointerup', up); touch.addEventListener('pointercancel', up);
    function cvPt(e) { var r = cv.getBoundingClientRect(), s = rt.size.w / r.width; return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s }; }
    cv.addEventListener('pointerdown', function (e) { if (rt && rt.tapJump()) { e.preventDefault(); rt.press('jump'); return; } if (rt && rt.wantsTap()) { e.preventDefault(); var q = cvPt(e); rt.tap(q.x, q.y); rt.aim(q.x); } });
    cv.addEventListener('pointermove', function (e) { if (rt && rt.wantsTap() && rt.mode() === 'paddle' && (e.pointerType === 'mouse' || e.buttons)) { var q = cvPt(e); rt.aim(q.x); } });
    cv.addEventListener('click', function (e) {
      if (!opts.onPick) return;
      var r = cv.getBoundingClientRect(), s = rt.size.w / r.width;
      opts.onPick(rt.pick((e.clientX - r.left) * s, (e.clientY - r.top) * s), rt);
    });
    build();
    return {
      rt: function () { return rt; },
      restart: function () { build(); begin(); },
      restartScene: function () { rt.restartScene(); pauseMenu(false); },
      pause: function () { if (rt.state() !== 'play') return false; var p = rt.pause(); pauseMenu(p); return p; },
      destroy: function () { if (rt) rt.stop(); if (clickSt) clickSt.stop(); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('blur', blur); root.innerHTML = ''; },
      el: box
    };
  }
