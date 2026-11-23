  /* ================= CappyGameStudio runtime ================= */
  // extra sprite types
  TYPES.lever = { name: 'Przełącznik', layer: 'game', z: 3, variants: [['lever', 'Dźwignia'], ['button', 'Przycisk']], hit: [0.1, 0.3, 0.8, 0.7] };
  TYPES.checkpoint = { name: 'Punkt kontrolny', layer: 'game', z: 3, variants: [['post', 'Słupek']], hit: [0.25, 0.1, 0.5, 0.9] };
  TYPES.spring = { name: 'Trampolina', layer: 'game', z: 2, variants: [['red', 'Czerwona'], ['green', 'Zielona']], hit: [0.05, 0.55, 0.9, 0.45] };
  TYPES.crate = { name: 'Skrzynka', layer: 'game', z: 1, variants: [['wood', 'Drewniana'], ['metal', 'Metalowa']] };
  TYPES.block = { name: 'Blok kolizji', layer: 'game', z: 1, variants: [['solid', 'Niewidzialny']] };
  TYPES.potion = { name: 'Mikstura', layer: 'game', z: 4, variants: [['red', 'Czerwona'], ['blue', 'Niebieska'], ['green', 'Zielona']], hit: [0.22, 0.15, 0.56, 0.75] };
  TYPES.npc = { name: 'Postać neutralna', layer: 'game', z: 6, variants: [['capy', 'Kapibara'], ['robot', 'Robot'], ['astro', 'Astronauta'], ['knight', 'Rycerz'], ['fox', 'Lisek']], hit: [0.1, 0.1, 0.8, 0.9] };
  TYPES.bullet = { name: 'Pocisk', layer: 'game', z: 8, variants: [['orb', 'Kula'], ['arrow', 'Strzała']], hit: [0.3, 0.3, 0.4, 0.4] };
  SPR.lever = function (c, o, t, st) {
    var on = st && st.on;
    if (o.v === 'button') { rr(c, 0.15, 0.8, 0.7, 0.15, 0.04); fill(c, '#6f7a90'); rr(c, 0.25, on ? 0.72 : 0.6, 0.5, on ? 0.1 : 0.22, 0.06); fill(c, on ? '#3ddc84' : '#ff5a5f'); return; }
    rr(c, 0.18, 0.74, 0.64, 0.2, 0.05); fill(c, '#6f7a90');
    line(c, 0.5, 0.78, on ? 0.78 : 0.22, 0.32, '#8a5a32', 0.08);
    circ(c, on ? 0.78 : 0.22, 0.3, 0.1); fill(c, on ? '#3ddc84' : '#ff5a5f');
  };
  SPR.checkpoint = function (c, o, t, st) {
    rr(c, 0.45, 0.1, 0.08, 0.84, 0.03); fill(c, '#d8dde8');
    rr(c, 0.3, 0.88, 0.4, 0.08, 0.03); fill(c, '#8a94a8');
    var up = st && st.on;
    poly(c, [0.53, up ? 0.12 : 0.55, 0.88, up ? 0.22 : 0.65, 0.53, up ? 0.34 : 0.76]); fill(c, up ? '#3ddc84' : '#b9c0cc');
  };
  SPR.spring = function (c, o) {
    var col = o.color || (o.v === 'green' ? '#3ddc84' : '#ff5a5f');
    rr(c, 0.05, 0.86, 0.9, 0.12, 0.03); fill(c, '#6f7a90');
    for (var i = 0; i < 3; i++) line(c, 0.25, 0.84 - i * 0.08, 0.75, 0.8 - i * 0.08, '#55627a', 0.05);
    rr(c, 0.05, 0.55, 0.9, 0.12, 0.05); fill(c, col);
  };
  SPR.crate = function (c, o) {
    var col = o.color || (o.v === 'metal' ? '#8794a8' : '#c98d4b');
    rr(c, 0.03, 0.03, 0.94, 0.94, 0.06); fill(c, col);
    line(c, 0.1, 0.1, 0.9, 0.9, shade(col, -45), 0.06); line(c, 0.9, 0.1, 0.1, 0.9, shade(col, -45), 0.06);
    rr(c, 0.03, 0.03, 0.94, 0.94, 0.06); c.lineWidth = 0.06; c.strokeStyle = shade(col, -45); c.stroke();
  };
  SPR.block = function (c, o, t, st) {
    if (!(st && st.editor)) return;
    c.fillStyle = 'rgba(107,79,160,.25)'; c.fillRect(0, 0, 1, 1);
    c.setLineDash([0.12, 0.08]); c.lineWidth = 0.05; c.strokeStyle = '#6b4fa0'; c.strokeRect(0.04, 0.04, 0.92, 0.92); c.setLineDash([]);
    line(c, 0.15, 0.15, 0.85, 0.85, '#6b4fa0', 0.04); line(c, 0.85, 0.15, 0.15, 0.85, '#6b4fa0', 0.04);
  };
  SPR.potion = function (c, o) {
    var col = o.color || ({ red: '#ff4d6d', blue: '#4d8dff', green: '#3ddc84' })[o.v || 'red'];
    rr(c, 0.42, 0.12, 0.16, 0.16, 0.03); fill(c, '#c98d4b');
    c.beginPath(); c.moveTo(0.4, 0.28); c.lineTo(0.6, 0.28); c.lineTo(0.6, 0.42); c.quadraticCurveTo(0.8, 0.5, 0.78, 0.7); c.quadraticCurveTo(0.76, 0.9, 0.5, 0.9); c.quadraticCurveTo(0.24, 0.9, 0.22, 0.7); c.quadraticCurveTo(0.2, 0.5, 0.4, 0.42); c.closePath();
    fill(c, '#eef6ff');
    c.beginPath(); c.moveTo(0.25, 0.62); c.quadraticCurveTo(0.5, 0.56, 0.75, 0.62); c.quadraticCurveTo(0.76, 0.88, 0.5, 0.88); c.quadraticCurveTo(0.24, 0.88, 0.25, 0.62); c.closePath(); c.fillStyle = col; c.fill();
  };
  TYPES.pipe = { name: 'Rura', layer: 'game', z: 2, variants: [['body', 'Rura – środek'], ['top', 'Rura – wylot']] };
  TYPES.bamboo = { name: 'Pęd bambusa', layer: 'game', z: 2, variants: [['body', 'Pęd – środek'], ['top', 'Pęd – czubek z liśćmi']] };
  SPR.bamboo = function (c, o) {
    var col = o.color || '#7cc24a', dk = shade(col, -45), lt = shade(col, 40);
    function stalk(x, w) {
      c.fillStyle = col; c.fillRect(x, 0, w, 1); c.fillStyle = lt; c.fillRect(x + w * 0.18, 0, w * 0.14, 1); c.fillStyle = dk; c.fillRect(x + w * 0.74, 0, w * 0.12, 1);
      c.strokeStyle = INK; c.lineWidth = 0.04; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 1); c.moveTo(x + w, 0); c.lineTo(x + w, 1); c.stroke();
      rr(c, x - 0.03, 0.44, w + 0.06, 0.1, 0.04); fill(c, dk, 0.035);
    }
    stalk(0.18, 0.4); stalk(0.6, 0.26);
    if (o.v === 'top') {
      c.fillStyle = '#b6e07a'; c.strokeStyle = INK; c.lineWidth = 0.035;
      [[0.38, 0.2, -0.6], [0.5, 0.15, 0.5], [0.72, 0.3, 0.9], [0.28, 0.62, -0.9], [0.8, 0.7, 0.7]].forEach(function (l) { c.save(); c.translate(l[0], l[1]); c.rotate(l[2]); c.beginPath(); c.ellipse(0, -0.14, 0.06, 0.16, 0, 0, 7); c.fill(); c.stroke(); c.restore(); });
    }
  };
  SPR.pipe = function (c, o) {
    var col = o.color || '#3cb562', dk = shade(col, -40), lt = shade(col, 45);
    if (o.v === 'top') { rr(c, 0.02, 0.06, 0.96, 0.88, 0.06); fill(c, col); c.fillStyle = lt; c.fillRect(0.14, 0.14, 0.1, 0.72); c.fillStyle = dk; c.fillRect(0.76, 0.14, 0.1, 0.72); return; }
    c.fillStyle = col; c.fillRect(0.1, 0, 0.8, 1); c.fillStyle = lt; c.fillRect(0.2, 0, 0.1, 1); c.fillStyle = dk; c.fillRect(0.72, 0, 0.1, 1);
    c.strokeStyle = INK; c.lineWidth = 0.05; c.beginPath(); c.moveTo(0.1, 0); c.lineTo(0.1, 1); c.moveTo(0.9, 0); c.lineTo(0.9, 1); c.stroke();
  };

  TYPES.car = { name: 'Samochód', layer: 'game', z: 8, variants: [['red', 'Czerwony'], ['blue', 'Niebieski'], ['yellow', 'Żółty'], ['green', 'Zielony']], hit: [0.2, 0.2, 0.6, 0.6] };
  SPR.car = function (c, o) {
    var col = o.color || { red: '#ef4a4a', blue: '#3f7fe0', yellow: '#ffc233', green: '#2fb36b' }[o.v] || '#ef4a4a';
    rr(c, 0.06, 0.2, 0.88, 0.6, 0.16); fill(c, col);
    c.fillStyle = INK; [[0.18, 0.12], [0.62, 0.12], [0.18, 0.78], [0.62, 0.78]].forEach(function (w) { rr(c, w[0], w[1], 0.2, 0.1, 0.04); c.fill(); });
    rr(c, 0.52, 0.28, 0.2, 0.44, 0.06); fill(c, '#bfe6ff', 0.035);
    rr(c, 0.2, 0.3, 0.16, 0.4, 0.05); fill(c, shade(col, -35), 0);
    c.fillStyle = '#fff6a8'; c.fillRect(0.88, 0.25, 0.06, 0.1); c.fillRect(0.88, 0.65, 0.06, 0.1);
    line(c, 0.1, 0.5, 0.48, 0.5, shade(col, 40), 0.05);
  };
  TYPES.road = { name: 'Droga', layer: 'game', z: 0, variants: [['asphalt', 'Asfalt'], ['finish', 'Linia mety'], ['sand', 'Piaszczysta']] };
  SPR.road = function (c, o) {
    if (o.v === 'finish') { for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#1d2440' : '#ffffff'; c.fillRect(i / 4, j / 4, 0.25, 0.25); } return; }
    c.fillStyle = o.color || (o.v === 'sand' ? '#e3c58b' : '#5b6170'); c.fillRect(0, 0, 1, 1);
    c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(0.1, 0.2, 0.12, 0.06); c.fillRect(0.6, 0.7, 0.1, 0.05);
  };
  TYPES.tower = { name: 'Wieża', layer: 'game', z: 6, variants: [['archer', 'Łucznicza'], ['magic', 'Magiczna'], ['cannon', 'Armatka']] };
  SPR.tower = function (c, o, t, st) {
    var col = o.color || { archer: '#c98d4b', magic: '#8a55e0', cannon: '#6f7a8c' }[o.v] || '#c98d4b';
    ell(c, 0.5, 0.86, 0.38, 0.1); c.fillStyle = 'rgba(0,0,0,.2)'; c.fill();
    rr(c, 0.22, 0.32, 0.56, 0.56, 0.06); fill(c, col);
    poly(c, [0.16, 0.36, 0.84, 0.36, 0.84, 0.2, 0.72, 0.2, 0.72, 0.28, 0.6, 0.28, 0.6, 0.2, 0.4, 0.2, 0.4, 0.28, 0.28, 0.28, 0.28, 0.2, 0.16, 0.2]); fill(c, shade(col, 25));
    rr(c, 0.42, 0.52, 0.16, 0.22, 0.08); fill(c, INK, 0);
    if (o.v === 'magic') { circ(c, 0.5, 0.1, 0.09 + Math.sin(t * 5) * 0.015); fill(c, '#c9a8ff'); }
    else if (o.v === 'cannon') { rr(c, 0.45, 0.02, 0.1, 0.22, 0.04); fill(c, '#3b4252'); }
    else { line(c, 0.5, 0.04, 0.5, 0.2, INK, 0.04); poly(c, [0.5, 0.04, 0.68, 0.09, 0.5, 0.14]); fill(c, '#ff5a5f'); }
    var lv = st && st.lvl || 1; for (var k = 0; k < lv; k++) { circ(c, 0.36 + k * 0.14, 0.44, 0.045); fill(c, '#ffd23f', 0.025); }
  };
  TYPES.pad = { name: 'Pole', layer: 'game', z: 0, variants: [['build', 'Miejsce na wieżę'], ['target', 'Pole docelowe'], ['stairs', 'Schody w dół']] };
  SPR.pad = function (c, o, t, st) {
    if (o.v === 'stairs') { rr(c, 0.06, 0.06, 0.88, 0.88, 0.08); fill(c, '#3b3346'); for (var i = 0; i < 4; i++) { c.fillStyle = shade('#8a7d9c', -i * 22); c.fillRect(0.14 + i * 0.05, 0.16 + i * 0.18, 0.72 - i * 0.1, 0.12); } return; }
    if (o.v === 'target') { var on = st && st.on; circ(c, 0.5, 0.5, 0.32); c.fillStyle = on ? 'rgba(61,220,132,.35)' : 'rgba(255,90,95,.18)'; c.fill(); c.lineWidth = 0.06; c.strokeStyle = on ? '#2fa36a' : '#e04a5a'; c.setLineDash([0.08, 0.06]); c.stroke(); c.setLineDash([]); line(c, 0.36, 0.36, 0.64, 0.64, on ? '#2fa36a' : '#e04a5a', 0.06); line(c, 0.64, 0.36, 0.36, 0.64, on ? '#2fa36a' : '#e04a5a', 0.06); return; }
    ell(c, 0.5, 0.56, 0.42, 0.34); fill(c, '#b9b2a6'); ell(c, 0.5, 0.5, 0.36, 0.28); fill(c, '#d8d1c4', 0.035);
    line(c, 0.5, 0.36, 0.5, 0.64, '#7a7266', 0.07); line(c, 0.36, 0.5, 0.64, 0.5, '#7a7266', 0.07);
  };
  TYPES.paddle = { name: 'Paletka', layer: 'game', z: 8, variants: [['wood', 'Drewniana'], ['neon', 'Neonowa']], hit: [0, 0.25, 1, 0.5] };
  SPR.paddle = function (c, o) {
    var col = o.color || (o.v === 'neon' ? '#3fd0ff' : '#c98d4b');
    rr(c, 0.02, 0.28, 0.96, 0.44, 0.2); fill(c, col);
    rr(c, 0.08, 0.34, 0.84, 0.12, 0.06); c.fillStyle = shade(col, 45); c.fill();
  };
  TYPES.ball = { name: 'Piłka', layer: 'game', z: 9, variants: [['orange', 'Pomarańczka'], ['steel', 'Stalowa']], hit: [0.2, 0.2, 0.6, 0.6] };
  SPR.ball = function (c, o) {
    var col = o.color || (o.v === 'steel' ? '#b8c2d1' : '#ff9a1f');
    circ(c, 0.5, 0.5, 0.3); fill(c, col);
    circ(c, 0.4, 0.4, 0.08); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
    if (o.v !== 'steel') { ell(c, 0.56, 0.2, 0.08, 0.04); fill(c, '#3cb562', 0.025); }
  };
  TYPES.brick = { name: 'Cegiełka', layer: 'game', z: 2, variants: [['red', 'Czerwona'], ['orange', 'Pomarańczowa'], ['yellow', 'Żółta'], ['green', 'Zielona'], ['blue', 'Niebieska'], ['purple', 'Fioletowa'], ['steel', 'Stalowa']] };
  SPR.brick = function (c, o, t, st) {
    var col = o.color || { red: '#ef5b5b', orange: '#ff9a3c', yellow: '#ffd23f', green: '#45c66e', blue: '#4a8cf0', purple: '#9a6bff', steel: '#9aa4b4' }[o.v] || '#ef5b5b';
    rr(c, 0.03, 0.12, 0.94, 0.76, 0.1); fill(c, col);
    rr(c, 0.1, 0.2, 0.8, 0.16, 0.06); c.fillStyle = shade(col, 50); c.fill();
    if (o.v === 'steel') { circ(c, 0.15, 0.7, 0.04); fill(c, '#5d6676', 0); circ(c, 0.85, 0.7, 0.04); fill(c, '#5d6676', 0); }
    if (st && st.crack) { line(c, 0.3, 0.2, 0.42, 0.5, INK, 0.04); line(c, 0.42, 0.5, 0.36, 0.8, INK, 0.04); line(c, 0.42, 0.5, 0.6, 0.6, INK, 0.04); }
  };
  SPR.npc = function (c, o, t, st) { SPR.hero(c, { v: o.v || 'robot', color: o.color }, 0, st); };
  SPR.bullet = function (c, o) {
    if (o.v === 'arrow') { line(c, 0.15, 0.5, 0.85, 0.5, '#8a5a32', 0.08); poly(c, [0.95, 0.5, 0.75, 0.38, 0.75, 0.62]); fill(c, '#d4dbe7', 0.03); return; }
    circ(c, 0.5, 0.5, 0.2); fill(c, o.color || '#ffd23f', 0.04);
  };
  TYPES.npc.hitTop = TYPES.hero.hitTop; TYPES.npc.hitSide = TYPES.hero.hitSide;

  var SHEETS = {};
  var AUD = {};
  function registerAssets2(assets) {
    Object.keys(assets || {}).forEach(function (k) {
      var a = assets[k]; if (!a || !a.data) return;
      if (a.type === 'image') {
        if (!IMGS[k] || IMGS[k].src !== a.data) { var im = new Image(); im.src = a.data; IMGS[k] = im; }
        SHEETS[k] = a.sheet && a.sheet.cols > 0 && a.sheet.rows > 0 ? a.sheet : null;
      } else if (a.type === 'audio') AUD[k] = a.data;
    });
  }
  function drawSprite2(c, o, x, y, w, h, t, st) {
    st = st || {};
    var flip = st.dir < 0;
    c.save(); c.translate(x, y);
    var im = o.img && IMGS[o.img];
    if (im && im.complete && im.naturalWidth) {
      if (flip) { c.translate(w, 0); c.scale(-1, 1); }
      var sh = SHEETS[o.img];
      if (sh) {
        var fw = im.naturalWidth / sh.cols, fh = im.naturalHeight / sh.rows, total = sh.cols * sh.rows, fr = 0;
        var range = (sh.anims && sh.anims[st.anim || 'idle']) || (sh.anims && sh.anims.idle) || [0, total - 1];
        var a = Math.max(0, Math.min(total - 1, range[0] | 0)), b = Math.max(a, Math.min(total - 1, range[1] | 0));
        fr = a + (t ? Math.floor(t * (sh.fps || 8)) % (b - a + 1) : 0);
        c.imageSmoothingEnabled = false;
        c.drawImage(im, (fr % sh.cols) * fw, Math.floor(fr / sh.cols) * fh, fw, fh, 0, 0, w, h);
      } else c.drawImage(im, 0, 0, w, h);
    } else if (SPR[o.type]) {
      c.scale(w, h);
      c.lineJoin = 'round'; c.lineCap = 'round';
      if (flip && (o.type === 'hero' || o.type === 'enemy' || o.type === 'npc')) { c.translate(1, 0); c.scale(-1, 1); }
      SPR[o.type](c, o, t || 0, st);
    }
    c.restore();
  }
