  /* ================= CLICKER (incremental) ================= */
  function fmtN(n) {
    n = Math.floor(n);
    if (n >= 1e9) return (n / 1e9).toFixed(2).replace('.', ',') + ' mld';
    if (n >= 1e6) return (n / 1e6).toFixed(2).replace('.', ',') + ' mln';
    return n.toLocaleString('pl-PL');
  }
  function fmtR(n) { return n >= 100 ? fmtN(n) : (Math.round(n * 10) / 10).toString().replace('.', ','); }
  function clickerUI(el, cfg, ups, sound, opts, done) {
    ensureCss();
    var S = { amt: 0, total: 0, owned: {}, mult: 1, multT: 0, goalHit: false, clicks: 0, ms: 0, goldT: 25 + Math.random() * 15, gold: null, lastShop: '' };
    var cur = cfg.currency || 'Pomarańcze', goal = cfg.goal || 100000, MS = [100, 1000, 10000, 100000, 1000000, 10000000];
    function cost(u) { return Math.ceil(u.cost * Math.pow(1 + (u.growth == null ? 15 : u.growth) / 100, S.owned[u.id] || 0)); }
    function perClick() { return (cfg.click || 1) + ups.reduce(function (a, u) { return a + (u.kind === 'click' ? (u.bonus || 1) * (S.owned[u.id] || 0) : 0); }, 0); }
    function perSec() { return ups.reduce(function (a, u) { return a + (u.kind !== 'click' ? (u.bonus || 1) * (S.owned[u.id] || 0) : 0); }, 0) * S.mult; }
    function gain(n) { S.amt += n; S.total += n; while (S.ms < MS.length && S.total >= MS[S.ms]) { banner('Zebrano już ' + fmtN(MS[S.ms]) + ' – ' + cur.toLowerCase() + '!'); S.ms++; } if (!S.goalHit && S.total >= goal) { S.goalHit = true; sound.play('win'); renderAll(); } }
    var bannerT = 0;
    function banner(t) { var b = el.querySelector('.ck-banner'); if (!b) return; b.textContent = t; b.hidden = false; clearTimeout(bannerT); bannerT = setTimeout(function () { b.hidden = true; }, 2600); }
    function img(sp) { return cardArt({ sprite: sp }); }
    function shopHTML() {
      return ups.map(function (u) {
        var c = cost(u), own = S.owned[u.id] || 0, vis = own > 0 || S.total >= u.cost * 0.4, maxed = u.max > 0 && own >= u.max;
        if (!vis) return '<div class="ck-up locked"><span class="ck-q">?</span><span><b>???</b><small>Odblokujesz po zebraniu ' + fmtN(Math.ceil(u.cost * 0.4)) + '</small></span></div>';
        return '<button class="ck-up" data-u="' + u.id + '"' + (S.amt < c || maxed ? ' disabled' : '') + ' aria-label="Kup ' + esc2(u.name) + ' za ' + fmtN(c) + '"><img alt="" src="' + img(u.sprite) + '"><span><b>' + esc2(u.name) + '</b><small>' + (u.kind === 'click' ? '+' + fmtR(u.bonus) + ' za kliknięcie' : '+' + fmtR(u.bonus) + ' na sekundę') + '</small><small class="ck-cost">' + (maxed ? 'Maksimum' : 'Cena: ' + fmtN(c)) + '</small></span><span class="ck-own">' + own + '</span></button>';
      }).join('');
    }
    function renderAll() {
      el.innerHTML = '<div class="ck"><div class="ck-main"><div class="ck-amt"><b class="ck-n">' + fmtN(S.amt) + '</b><span>' + esc2(cur) + '</span></div><div class="ck-rate">' + fmtR(perSec()) + ' na sekundę · ' + fmtR(perClick()) + ' za kliknięcie' + (S.mult > 1 ? ' · <b>×' + S.mult + ' złoty bonus!</b>' : '') + '</div>' +
        '<button class="ck-big" aria-label="Kliknij: +' + fmtR(perClick()) + ' ' + esc2(cur) + '"><img alt="" src="' + img(cfg.sprite) + '"></button>' +
        '<div class="ck-goal"><span>Cel: ' + fmtN(goal) + '</span><span class="cgm-bar" aria-hidden="true"><i style="width:' + Math.min(100, S.total / goal * 100).toFixed(1) + '%"></i></span></div>' +
        (S.goalHit ? '<div class="ck-win"><b>Cel osiągnięty!</b> Możesz grać dalej albo zakończyć. <button class="cgm-btn go" data-x="finish">Zakończ – wygrana!</button></div>' : '') + '</div>' +
        '<div class="ck-shop"><h3>Sklep</h3><div class="ck-list">' + shopHTML() + '</div></div><div class="ck-banner" hidden></div>' + (S.gold ? '<button class="ck-gold" style="left:' + S.gold.x + '%;top:' + S.gold.y + '%" aria-label="Złota pomarańcza – kliknij szybko!">★</button>' : '') + '</div>';
      S.lastShop = shopSig();
    }
    function shopSig() { return ups.map(function (u) { var c = cost(u); return (S.owned[u.id] || 0) + ':' + (S.amt >= c ? 1 : 0) + ':' + (S.total >= u.cost * 0.4 ? 1 : 0); }).join('|') + (S.gold ? 'g' : '') + S.mult + S.goalHit; }
    function refresh() {
      if (shopSig() !== S.lastShop) { var focusU = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.u : null, big = document.activeElement && document.activeElement.classList.contains('ck-big'); renderAll(); if (focusU) { var f = el.querySelector('[data-u="' + focusU + '"]'); if (f) f.focus(); } else if (big) el.querySelector('.ck-big').focus(); return; }
      var n = el.querySelector('.ck-n'); if (n) n.textContent = fmtN(S.amt);
      var bar = el.querySelector('.ck-goal i'); if (bar) bar.style.width = Math.min(100, S.total / goal * 100).toFixed(1) + '%';
    }
    function floatTxt(x, y, t) {
      if (opts.reduceMotion) return;
      var s = document.createElement('span'); s.className = 'ck-float'; s.textContent = t; s.style.left = x + 'px'; s.style.top = y + 'px';
      var box = el.querySelector('.ck'); if (!box) return; box.appendChild(s); setTimeout(function () { s.remove(); }, 900);
    }
    el.onclick = function (ev) {
      var b = ev.target.closest('button'); if (!b || b.disabled) return;
      if (b.classList.contains('ck-big')) {
        var v = perClick() * (S.mult > 1 ? S.mult : 1); gain(v); S.clicks++; sound.play('collect');
        var r = el.querySelector('.ck').getBoundingClientRect(), x = ev.clientX ? ev.clientX - r.left : r.width * 0.3, y = ev.clientY ? ev.clientY - r.top : r.height * 0.5;
        floatTxt(x, y, '+' + fmtR(v)); if (!opts.reduceMotion) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
        refresh(); return;
      }
      if (b.dataset.u) { var u = ups.filter(function (q) { return q.id === b.dataset.u; })[0], c = cost(u); if (S.amt >= c) { S.amt -= c; S.owned[u.id] = (S.owned[u.id] || 0) + 1; sound.play('life'); renderAll(); var f = el.querySelector('[data-u="' + u.id + '"]'); if (f) f.focus(); } return; }
      if (b.classList.contains('ck-gold')) { S.gold = null; if (Math.random() < 0.5) { S.mult = 7; S.multT = 15; banner('Złota pomarańcza! Produkcja ×7 przez 15 sekund!'); } else { var bonus = Math.max(50, perSec() * 30 + perClick() * 20); gain(bonus); banner('Złota pomarańcza! +' + fmtN(bonus) + '!'); } sound.play('win'); renderAll(); return; }
      if (b.dataset.x === 'finish') { stop(); el.hidden = true; el.innerHTML = ''; api.active = false; done(true, Math.floor(S.total)); }
    };
    var last = performance.now(), iv = setInterval(function () {
      var nw = performance.now(), dt = Math.min(1, (nw - last) / 1000); last = nw;
      if (S.multT > 0) { S.multT -= dt; if (S.multT <= 0) { S.mult = 1; } }
      gain(perSec() * dt);
      if (cfg.golden !== false) {
        if (S.gold) { S.gold.t -= dt; if (S.gold.t <= 0) S.gold = null; }
        else { S.goldT -= dt; if (S.goldT <= 0) { S.goldT = 30 + Math.random() * 30; S.gold = { x: 8 + Math.random() * 50, y: 15 + Math.random() * 60, t: 7 }; } }
      }
      refresh();
    }, 100);
    function stop() { clearInterval(iv); }
    var api = { active: true, stop: stop, key: function () { return false; }, state: function () { return S; } };
    el.hidden = false; renderAll();
    return api;
  }