  /* ================= CARD GAME (Hearthstone-style) ================= */
  var CARD_TYPES = { minion: 'Stwór', spell: 'Czar', power: 'Karta mocy' };
  var SPELL_FX = { dmg: 'Zadaj obrażenia wybranemu wrogowi', dmgall: 'Obrażenia wszystkim wrogim stworom', heal: 'Ulecz swojego bohatera', draw: 'Dobierz karty', buff: 'Wzmocnij swojego stwora (+atak/+życie)', armor: 'Pancerz dla bohatera', mana: 'Dodatkowa mana w tej turze' };
  var BATTLECRY = { none: 'Brak', dmg: 'Zadaj obrażenia wrogiemu bohaterowi', heal: 'Ulecz swojego bohatera', draw: 'Dobierz karty', armor: 'Pancerz dla bohatera', buffall: '+atak dla innych twoich stworów' };
  var POWERS = { startDmg: 'Na początku twojej tury: obrażenia wrogiemu bohaterowi', startDraw: 'Na początku twojej tury: dobierz karty', startHeal: 'Na początku twojej tury: ulecz bohatera', startArmor: 'Na początku twojej tury: pancerz', allyAtk: 'Twoje stwory mają więcej ataku', manaPlus: 'Od razu +mana na stałe' };
  function cardText(c) {
    var v = c.val || 0, t = [];
    if (c.type === 'minion') {
      if (c.charge) t.push('Szarża.'); if (c.taunt) t.push('Prowokacja.'); if (c.life) t.push('Wampiryzm.');
      var b = c.fx || 'none';
      if (b === 'dmg') t.push('Okrzyk: zadaj ' + v + ' obrażeń wrogiemu bohaterowi.');
      if (b === 'heal') t.push('Okrzyk: ulecz się o ' + v + '.');
      if (b === 'draw') t.push('Okrzyk: dobierz ' + v + ' ' + (v === 1 ? 'kartę' : 'karty') + '.');
      if (b === 'armor') t.push('Okrzyk: +' + v + ' pancerza.');
      if (b === 'buffall') t.push('Okrzyk: inne twoje stwory +' + v + ' ataku.');
    } else if (c.type === 'spell') {
      t.push({ dmg: 'Zadaj ' + v + ' obrażeń.', dmgall: 'Zadaj ' + v + ' obrażeń wszystkim wrogim stworom.', heal: 'Ulecz swojego bohatera o ' + v + '.', draw: 'Dobierz ' + v + ' ' + (v === 1 ? 'kartę' : 'karty') + '.', buff: 'Daj stworowi +' + v + '/+' + (c.val2 || 0) + '.', armor: 'Zyskaj ' + v + ' pancerza.', mana: 'Zyskaj ' + v + ' many w tej turze.' }[c.fx || 'dmg'] || '');
    } else {
      t.push('Trwale: ' + ({ startDmg: 'na początku twojej tury zadaj ' + v + ' obrażeń wrogowi.', startDraw: 'na początku twojej tury dobierz ' + v + '.', startHeal: 'na początku twojej tury ulecz się o ' + v + '.', startArmor: 'na początku twojej tury +' + v + ' pancerza.', allyAtk: 'twoje stwory mają +' + v + ' ataku.', manaPlus: '+' + v + ' maksymalnej many.' }[c.power || 'startDmg'] || ''));
    }
    return t.join(' ');
  }
  var artCache = {};
  function cardArt(c) {
    var sp = c.sprite || { type: 'enemy', v: 'robot' }, key = [sp.type, sp.v, sp.color || '', sp.img || ''].join('|');
    if (artCache[key]) return artCache[key];
    var cv = document.createElement('canvas'); cv.width = cv.height = 96; var x = cv.getContext('2d');
    drawSprite2(x, sp, 8, 8, 80, 80, 0, { dir: 1 });
    var u = cv.toDataURL(); if (!sp.img) artCache[key] = u; return u;
  }
  function cardHTML(c, o) {
    o = o || {};
    return '<span class="hc t-' + c.type + (o.cls ? ' ' + o.cls : '') + '"><span class="hc-cost" title="Koszt many">' + (c.cost || 0) + '</span><img class="hc-art" alt="" src="' + cardArt(c) + '"><b class="hc-name">' + esc2(c.name) + '</b><span class="hc-type">' + CARD_TYPES[c.type] + '</span><span class="hc-txt">' + esc2(cardText(c)) + '</span>' + (c.type === 'minion' ? '<span class="hc-atk" title="Atak">' + (c.atk || 0) + '</span><span class="hc-hp" title="Życie">' + (c.hp || 1) + '</span>' : '') + '</span>';
  }
  var DEFAULT_CARDS = [
    { id: 'k1', name: 'Pomarańczowy skrzat', type: 'minion', cost: 1, atk: 1, hp: 2, sprite: { type: 'enemy', v: 'blob', color: '#ff9f1c' } },
    { id: 'k2', name: 'Kapibara strażnik', type: 'minion', cost: 2, atk: 1, hp: 4, taunt: true, sprite: { type: 'hero', v: 'capy' } },
    { id: 'k3', name: 'Szybki lisek', type: 'minion', cost: 2, atk: 3, hp: 1, charge: true, sprite: { type: 'hero', v: 'fox' } },
    { id: 'k4', name: 'Robot obrońca', type: 'minion', cost: 3, atk: 2, hp: 5, taunt: true, sprite: { type: 'hero', v: 'robot' } },
    { id: 'k5', name: 'Rycerz kier', type: 'minion', cost: 4, atk: 4, hp: 4, fx: 'dmg', val: 2, sprite: { type: 'hero', v: 'knight' } },
    { id: 'k6', name: 'Smok asów', type: 'minion', cost: 6, atk: 6, hp: 6, sprite: { type: 'enemy', v: 'bat', color: '#8b5cf6' } },
    { id: 'k7', name: 'Nietoperz wampir', type: 'minion', cost: 3, atk: 3, hp: 2, life: true, sprite: { type: 'enemy', v: 'bat' } },
    { id: 'k8', name: 'Ognista kula', type: 'spell', cost: 2, fx: 'dmg', val: 3, sprite: { type: 'star', v: 'yellow', color: '#ff6a2b' } },
    { id: 'k9', name: 'Burza gwiazd', type: 'spell', cost: 4, fx: 'dmgall', val: 2, sprite: { type: 'star', v: 'pink' } },
    { id: 'k10', name: 'Leczący napar', type: 'spell', cost: 1, fx: 'heal', val: 4, sprite: { type: 'potion', v: 'red' } },
    { id: 'k11', name: 'Mądra księga', type: 'spell', cost: 2, fx: 'draw', val: 2, sprite: { type: 'deco', v: 'books' } },
    { id: 'k12', name: 'Siła kapibary', type: 'spell', cost: 1, fx: 'buff', val: 2, val2: 2, sprite: { type: 'fruit', v: 'orange' } },
    { id: 'k13', name: 'Kryształowa tarcza', type: 'spell', cost: 1, fx: 'armor', val: 4, sprite: { type: 'gem', v: 'blue' } },
    { id: 'k14', name: 'Wieża magów', type: 'power', cost: 4, power: 'startDmg', val: 1, sprite: { type: 'deco', v: 'column' } },
    { id: 'k15', name: 'Sztandar odwagi', type: 'power', cost: 3, power: 'allyAtk', val: 1, sprite: { type: 'goal', v: 'flag' } },
    { id: 'k16', name: 'Pomarańczowy sad', type: 'power', cost: 3, power: 'startHeal', val: 2, sprite: { type: 'deco', v: 'tree', color: '#ff9f1c' } }
  ];
  var DEFAULT_DECK = { k1: 2, k2: 2, k3: 2, k4: 1, k5: 2, k6: 1, k7: 1, k8: 2, k9: 1, k10: 1, k11: 1, k12: 2, k13: 1, k15: 1 };
  function expandDeck(deck, cards) {
    var map = {}; (cards && cards.length ? cards : DEFAULT_CARDS).forEach(function (c) { map[c.id] = c; });
    var counts = deck && deck.cards ? deck.cards : null, out = [];
    if (counts) Object.keys(counts).forEach(function (id) { for (var i = 0; i < (counts[id] || 0); i++) if (map[id]) out.push(cloneJ(map[id])); });
    if (out.length < 5) { var dm = {}; DEFAULT_CARDS.forEach(function (c) { dm[c.id] = c; }); Object.keys(DEFAULT_DECK).forEach(function (id) { for (var i = 0; i < DEFAULT_DECK[id]; i++) out.push(cloneJ(dm[id])); }); }
    return out;
  }

  function cardDuel(el, cfg, sound, opts, done) {
    ensureCss();
    var uidc = 0, cap = cfg.maxMana || 10;
    function shuffle(a) { for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), x = a[k]; a[k] = a[j]; a[j] = x; } return a; }
    function side(deck, hp, name, sprite) { return { name: name, sprite: sprite, hp: hp, max: hp, armor: 0, mana: 0, maxMana: Math.max(0, (cfg.startMana || 1) - 1), deck: shuffle(deck.map(function (c) { return Object.assign({}, c, { u: ++uidc }); })), hand: [], board: [], powers: [], fat: 0 }; }
    var S = { me: side(cfg.pdeck, cfg.php || 20, 'Ty', cfg.psprite || { type: 'hero', v: 'capy' }), foe: side(cfg.edeck, cfg.ehp || 20, cfg.name || 'Przeciwnik', cfg.sprite), turn: 'me', sel: null, log: [], over: null, busy: false };
    function other(s) { return s === S.me ? S.foe : S.me; }
    function say(t) { S.log.unshift(t); S.log = S.log.slice(0, 3); }
    function draw(s, n) {
      for (var k = 0; k < n; k++) {
        if (!s.deck.length) { s.fat++; dmgHero(s, s.fat); say((s === S.me ? 'Twoja talia jest pusta' : 'Talia przeciwnika jest pusta') + ' – zmęczenie: ' + s.fat + ' obrażeń.'); continue; }
        var c = s.deck.pop(); if (s.hand.length < 8) s.hand.push(c); else say('Ręka pełna – karta „' + c.name + '” przepada.');
      }
    }
    function allyAtk(s) { return s.powers.reduce(function (a, p) { return a + (p.power === 'allyAtk' ? (p.val || 0) : 0); }, 0); }
    function atkOf(s, m) { return Math.max(0, m.atk + allyAtk(s)); }
    function dmgHero(s, n) { var a = Math.min(s.armor, n); s.armor -= a; s.hp -= (n - a); }
    function heal(s, n) { s.hp = Math.min(s.max, s.hp + n); }
    function check() { if (S.over) return; if (S.foe.hp <= 0) { S.over = 'win'; sound.play('win'); } else if (S.me.hp <= 0) { S.over = 'lose'; sound.play('lose'); } }
    function cleanup() { [S.me, S.foe].forEach(function (s) { s.board = s.board.filter(function (m) { if (m.hp <= 0) { say('„' + m.c.name + '” pada.'); return false; } return true; }); }); check(); }
    function startTurn(s) {
      s.maxMana = Math.min(cap, s.maxMana + 1); s.mana = s.maxMana;
      s.board.forEach(function (m) { m.ready = true; m.attacked = false; });
      draw(s, 1);
      s.powers.forEach(function (p) {
        if (p.power === 'startDmg') dmgHero(other(s), p.val || 1);
        else if (p.power === 'startDraw') draw(s, p.val || 1);
        else if (p.power === 'startHeal') heal(s, p.val || 1);
        else if (p.power === 'startArmor') s.armor += p.val || 1;
      });
      cleanup();
    }
    function needsTarget(c) { return c.type === 'spell' && (c.fx === 'dmg' || c.fx === 'buff'); }
    function targetsFor(s, kind) {
      var o = other(s);
      if (kind === 'spell-dmg') return [{ k: 'hero', s: o }].concat(o.board.map(function (m) { return { k: 'm', s: o, m: m }; }));
      if (kind === 'buff') return s.board.map(function (m) { return { k: 'm', s: s, m: m }; });
      var taunt = o.board.filter(function (m) { return m.taunt; });
      if (taunt.length) return taunt.map(function (m) { return { k: 'm', s: o, m: m }; });
      return [{ k: 'hero', s: o }].concat(o.board.map(function (m) { return { k: 'm', s: o, m: m }; }));
    }
    function play(s, idx, tgt) {
      var c = s.hand[idx]; if (!c || c.cost > s.mana) return false;
      if (c.type === 'minion' && s.board.length >= 6) { if (s === S.me) say('Na stole jest już 6 stworów.'); return false; }
      s.mana -= c.cost; s.hand.splice(idx, 1); var v = c.val || 0, o = other(s);
      if (c.type === 'minion') {
        var m = { c: c, u: c.u, atk: c.atk || 0, hp: c.hp || 1, max: c.hp || 1, taunt: !!c.taunt, life: !!c.life, ready: !!c.charge, attacked: false };
        s.board.push(m);
        if (c.fx === 'dmg') dmgHero(o, v); else if (c.fx === 'heal') heal(s, v); else if (c.fx === 'draw') draw(s, v); else if (c.fx === 'armor') s.armor += v;
        else if (c.fx === 'buffall') s.board.forEach(function (q) { if (q !== m) q.atk += v; });
      } else if (c.type === 'spell') {
        if (c.fx === 'dmg' && tgt) { if (tgt.k === 'hero') dmgHero(tgt.s, v); else tgt.m.hp -= v; }
        else if (c.fx === 'dmgall') o.board.forEach(function (q) { q.hp -= v; });
        else if (c.fx === 'heal') heal(s, v);
        else if (c.fx === 'draw') draw(s, v);
        else if (c.fx === 'buff' && tgt && tgt.m) { tgt.m.atk += v; tgt.m.hp += (c.val2 || 0); tgt.m.max += (c.val2 || 0); }
        else if (c.fx === 'armor') s.armor += v;
        else if (c.fx === 'mana') s.mana = Math.min(10, s.mana + v);
      } else {
        s.powers.push({ name: c.name, power: c.power, val: v, c: c });
        if (c.power === 'manaPlus') { s.maxMana = Math.min(cap, s.maxMana + v); s.mana = Math.min(cap, s.mana + v); }
      }
      sound.play('collect'); cleanup(); return true;
    }
    function attack(s, m, tgt) {
      var a = atkOf(s, m), o = other(s);
      if (tgt.k === 'hero') { dmgHero(o, a); say('„' + m.c.name + '” atakuje bohatera: ' + a + ' obrażeń.'); }
      else { tgt.m.hp -= a; m.hp -= atkOf(o, tgt.m); say('„' + m.c.name + '” walczy z „' + tgt.m.c.name + '”.'); }
      if (m.life) heal(s, a);
      m.attacked = true; m.ready = false; sound.play('stomp'); cleanup();
    }
    function aiStep() {
      if (S.over) { S.busy = false; render(); return; }
      var s = S.foe, o = S.me;
      var playable = s.hand.map(function (c, i) { return { c: c, i: i }; }).filter(function (x) {
        var c = x.c; if (c.cost > s.mana) return false;
        if (c.type === 'minion' && s.board.length >= 6) return false;
        if (c.type === 'spell' && c.fx === 'buff' && !s.board.length) return false;
        if (c.type === 'spell' && c.fx === 'dmgall' && !o.board.length) return false;
        if (c.type === 'spell' && c.fx === 'heal' && s.hp > s.max - Math.ceil((c.val || 2) / 2)) return false;
        return true;
      }).sort(function (a, b) { return b.c.cost - a.c.cost; });
      if (playable.length) {
        var x = playable[0], c = x.c, tgt = null;
        if (c.type === 'spell' && c.fx === 'dmg') { var kill = o.board.filter(function (m) { return m.hp <= (c.val || 0); }).sort(function (a, b) { return b.atk - a.atk; })[0]; tgt = kill ? { k: 'm', s: o, m: kill } : { k: 'hero', s: o }; }
        if (c.type === 'spell' && c.fx === 'buff') { var best = s.board.slice().sort(function (a, b) { return b.atk - a.atk; })[0]; tgt = { k: 'm', s: s, m: best }; }
        play(s, x.i, tgt); say(S.foe.name + ' zagrywa: „' + c.name + '”.'); render(); setTimeout(aiStep, opts.fast ? 30 : 750); return;
      }
      var att = s.board.filter(function (m) { return m.ready && !m.attacked && atkOf(s, m) > 0; })[0];
      if (att) {
        var tg = targetsFor(s, 'attack'), pick = tg[0];
        if (tg[0].k === 'hero') {
          var trade = tg.filter(function (t) { return t.k === 'm' && atkOf(s, att) >= t.m.hp && atkOf(o, t.m) < att.hp; }).sort(function (a, b) { return b.m.atk - a.m.atk; })[0];
          pick = trade || tg[0];
        }
        attack(s, att, pick); render(); setTimeout(aiStep, opts.fast ? 30 : 650); return;
      }
      S.turn = 'me'; S.busy = false; startTurn(S.me); say('Twoja tura!'); render();
    }
    function endTurn() {
      if (S.over || S.turn !== 'me' || S.busy) return;
      S.sel = null; S.turn = 'foe'; S.busy = true; startTurn(S.foe); say('Tura przeciwnika…'); render(); setTimeout(aiStep, opts.fast ? 30 : 700);
    }
    function heroHTML(s, isFoe, tgts) {
      var isT = tgts && tgts.some(function (t) { return t.k === 'hero' && t.s === s; });
      return '<div class="hs-hero"><button class="hs-face' + (isT ? ' tgt' : '') + '" data-h="' + (isFoe ? 'foe' : 'me') + '"' + (isT ? '' : ' tabindex="-1"') + ' aria-label="' + esc2(s.name) + ', życie ' + Math.max(0, s.hp) + '"><img alt="" src="' + cardArt({ sprite: s.sprite }) + '"><span class="hs-hp">' + Math.max(0, s.hp) + '</span>' + (s.armor ? '<span class="hs-ar">' + s.armor + '</span>' : '') + '</button>' +
        '<div class="hs-info"><b>' + esc2(s.name) + '</b><span class="hs-mana" aria-label="Mana ' + s.mana + ' z ' + s.maxMana + '">' + Array.apply(null, Array(Math.max(s.maxMana, 0))).map(function (_, k) { return '<i class="' + (k < s.mana ? '' : 'off') + '"></i>'; }).join('') + ' <small>' + s.mana + '/' + s.maxMana + '</small></span><small>Talia: ' + s.deck.length + (isFoe ? ' · Ręka: ' + s.hand.length : '') + '</small></div>' +
        '<div class="hs-pows">' + s.powers.map(function (p) { return '<span class="hs-pow" title="' + esc2(cardText(p.c)) + '">' + esc2(p.name) + '</span>'; }).join('') + '</div></div>';
    }
    function boardHTML(s, mine, tgts) {
      if (!s.board.length) return '<div class="hs-board"><span class="hs-empty">' + (mine ? 'Twój stół – zagraj tu stwory' : 'Stół przeciwnika') + '</span></div>';
      return '<div class="hs-board">' + s.board.map(function (m) {
        var isT = tgts && tgts.some(function (t) { return t.m === m; }), canAtk = mine && S.turn === 'me' && m.ready && !m.attacked && !S.over, selA = S.sel && S.sel.k === 'atk' && S.sel.m === m;
        return '<button class="hs-m' + (m.taunt ? ' taunt' : '') + (isT ? ' tgt' : '') + (canAtk ? ' ready' : '') + (selA ? ' sel' : '') + '" data-m="' + (mine ? 'me' : 'foe') + ':' + m.u + '" aria-label="' + esc2(m.c.name) + ', atak ' + atkOf(s, m) + ', życie ' + m.hp + (m.taunt ? ', prowokacja' : '') + (canAtk ? ', może atakować' : '') + '" title="' + esc2(m.c.name + ' – ' + cardText(m.c)) + '"><img alt="" src="' + cardArt(m.c) + '"><span class="hc-atk">' + atkOf(s, m) + '</span><span class="hc-hp' + (m.hp < m.max ? ' hurt' : '') + '">' + m.hp + '</span>' + (mine && !m.ready && !m.attacked ? '<span class="hs-zz">Zzz</span>' : '') + (m.life ? '<span class="hs-kw">♥</span>' : '') + '</button>';
      }).join('') + '</div>';
    }
    function render() {
      var tgts = null;
      if (S.sel && S.sel.k === 'atk') tgts = targetsFor(S.me, 'attack');
      if (S.sel && S.sel.k === 'card') { var sc = S.me.hand[S.sel.i]; tgts = targetsFor(S.me, sc.fx === 'buff' ? 'buff' : 'spell-dmg'); }
      var hint = S.over ? '' : S.turn !== 'me' ? 'Przeciwnik myśli…' : S.sel ? (S.sel.k === 'atk' ? 'Wybierz cel ataku (świecący na czerwono). Esc – anuluj.' : 'Wybierz cel czaru. Esc – anuluj.') : 'Zagraj kartę (kliknij albo 1–8). Kliknij swojego gotowego stwora, żeby zaatakować.';
      el.innerHTML = '<div class="hs" role="dialog" aria-label="Pojedynek na karty">' + heroHTML(S.foe, true, tgts) + boardHTML(S.foe, false, tgts) +
        '<div class="hs-mid"><p class="hs-log" aria-live="polite">' + (S.log.length ? esc2(S.log[0]) : '') + (S.log[1] ? '<small> · ' + esc2(S.log[1]) + '</small>' : '') + '</p>' + (S.over ? '' : '<button class="cgm-btn go hs-end" data-x="end"' + (S.turn !== 'me' ? ' disabled' : '') + '>Koniec tury</button>') + '</div>' +
        boardHTML(S.me, true, tgts) + heroHTML(S.me, false, tgts) +
        '<p class="hs-hint">' + hint + '</p>' +
        '<div class="hs-hand">' + S.me.hand.map(function (c, k) { var can = S.turn === 'me' && !S.over && c.cost <= S.me.mana; return '<button class="hs-card' + (can ? ' can' : '') + (S.sel && S.sel.k === 'card' && S.sel.i === k ? ' sel' : '') + '" data-c="' + k + '" aria-label="Karta ' + (k + 1) + ': ' + esc2(c.name) + ', koszt ' + c.cost + '. ' + esc2(cardText(c)) + '">' + cardHTML(c) + '</button>'; }).join('') + '</div>' +
        (S.over ? '<div class="hs-over"><div class="cgm-card"><h2>' + (S.over === 'win' ? 'Wygrana!' : 'Przegrana') + '</h2><p>' + (S.over === 'win' ? 'Pokonałeś: ' + esc2(S.foe.name) + '!' : 'Tym razem lepszy był ' + esc2(S.foe.name) + '. Spróbuj innej strategii!') + '</p><div class="cgm-btns"><button class="cgm-btn go" data-x="close">Dalej</button></div></div></div>' : '') + '</div>';
      var f = el.querySelector('[data-x=close]') || (S.sel ? el.querySelector('.tgt') : null); if (f) try { f.focus({ preventScroll: true }); } catch (er) { }
    }
    function findM(code) { var p = code.split(':'), s = p[0] === 'me' ? S.me : S.foe; return { s: s, m: s.board.filter(function (m) { return String(m.u) === p[1]; })[0] }; }
    function useTarget(t) {
      if (S.sel.k === 'atk') { var ok = targetsFor(S.me, 'attack').some(function (x) { return (x.k === 'hero' && t.k === 'hero' && x.s === t.s) || (x.m && x.m === t.m); }); if (!ok) { say(t.k === 'm' && t.s === S.foe ? 'Najpierw musisz zaatakować stwora z Prowokacją!' : 'Tego nie można zaatakować.'); render(); return; } attack(S.me, S.sel.m, t); }
      else { var c = S.me.hand[S.sel.i]; var ok2 = targetsFor(S.me, c.fx === 'buff' ? 'buff' : 'spell-dmg').some(function (x) { return (x.k === 'hero' && t.k === 'hero' && x.s === t.s) || (x.m && x.m === t.m); }); if (!ok2) { say('To nie jest dobry cel dla tej karty.'); render(); return; } say('Zagrywasz „' + c.name + '”.'); play(S.me, S.sel.i, t); }
      S.sel = null; render();
    }
    function clickCard(k) {
      if (S.over || S.turn !== 'me') return; var c = S.me.hand[k]; if (!c) return;
      if (S.sel && S.sel.k === 'card' && S.sel.i === k) { S.sel = null; render(); return; }
      if (c.cost > S.me.mana) { say('Za mało many na „' + c.name + '” (potrzeba ' + c.cost + ').'); render(); return; }
      if (needsTarget(c)) { if (c.fx === 'buff' && !S.me.board.length) { say('Najpierw postaw stwora, którego wzmocnisz.'); render(); return; } S.sel = { k: 'card', i: k }; render(); return; }
      if (play(S.me, k, null)) say('Zagrywasz „' + c.name + '”.'); S.sel = null; render();
    }
    el.onclick = function (ev) {
      var b = ev.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.x === 'end') { endTurn(); return; }
      if (b.dataset.x === 'close') { el.hidden = true; el.innerHTML = ''; api.active = false; done(S.over === 'win'); return; }
      if (S.over || S.turn !== 'me') return;
      if (b.dataset.c != null) { clickCard(+b.dataset.c); return; }
      if (b.dataset.h) { if (S.sel) useTarget({ k: 'hero', s: b.dataset.h === 'foe' ? S.foe : S.me }); return; }
      if (b.dataset.m) {
        var f = findM(b.dataset.m); if (!f.m) return;
        if (S.sel) { if (S.sel.k === 'atk' && S.sel.m === f.m) { S.sel = null; render(); return; } if (!(S.sel.k === 'atk' && f.s === S.me)) { useTarget({ k: 'm', s: f.s, m: f.m }); return; } }
        if (f.s === S.me) { if (f.m.ready && !f.m.attacked) { S.sel = { k: 'atk', m: f.m }; render(); } else { say(f.m.attacked ? 'Ten stwór już atakował w tej turze.' : 'Zzz – stwór odpoczywa po wejściu na stół (chyba że ma Szarżę).'); render(); } }
      }
    };
    var api = {
      active: true,
      key: function (e) {
        if (e.code === 'Escape') { S.sel = null; render(); return true; }
        var ae = document.activeElement; if ((e.code === 'Enter' || e.code === 'Space') && ae && ae.tagName === 'BUTTON' && el.contains(ae)) return false;
        if (/^Digit[1-8]$/.test(e.code)) { clickCard(+e.code.slice(5) - 1); return true; }
        if (e.code === 'Enter') { var cl = el.querySelector('[data-x=close]'); if (cl) cl.click(); else endTurn(); return true; }
        return false;
      },
      state: function () { return S; }
    };
    draw(S.me, 3); draw(S.foe, 4); startTurn(S.me); say('Pojedynek z: ' + S.foe.name + '. Twoja tura!');
    el.hidden = false; render();
    return api;
  }
