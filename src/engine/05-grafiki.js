  /* ---------- sprites ---------- */
  var SPR = {};
  SPR.hero = function (c, o, t, st) {
    var v = o.v || 'capy', bob = st && st.moving ? Math.abs(Math.sin(t * 12)) * 0.04 : 0;
    c.translate(0, -bob);
    if (v === 'capy') {
      var col = o.color || '#a8703f', dk = shade(col, -45);
      rr(c, 0.2, 0.76, 0.13, 0.18, 0.04); fill(c, dk); rr(c, 0.58, 0.76, 0.13, 0.18, 0.04); fill(c, dk);
      rr(c, 0.06, 0.4, 0.74, 0.46, 0.22); fill(c, col);
      rr(c, 0.5, 0.24, 0.44, 0.38, 0.16); fill(c, col);
      circ(c, 0.6, 0.25, 0.06); fill(c, dk);
      rr(c, 0.8, 0.38, 0.15, 0.17, 0.07); fill(c, dk);
      circ(c, 0.74, 0.35, 0.035); c.fillStyle = INK; c.fill();
      circ(c, 0.68, 0.19, 0.075); fill(c, '#ff9f1c');
      line(c, 0.68, 0.11, 0.71, 0.07, '#3b8f3b', 0.04);
    } else if (v === 'robot') {
      var rc = o.color || '#7fa7c9';
      rr(c, 0.28, 0.8, 0.14, 0.14, 0.03); fill(c, '#55627a'); rr(c, 0.58, 0.8, 0.14, 0.14, 0.03); fill(c, '#55627a');
      rr(c, 0.2, 0.44, 0.6, 0.4, 0.08); fill(c, rc);
      rr(c, 0.4, 0.55, 0.2, 0.12, 0.03); fill(c, '#ffd23f');
      rr(c, 0.24, 0.12, 0.52, 0.34, 0.1); fill(c, shade(rc, 20));
      line(c, 0.5, 0.12, 0.5, 0.03); circ(c, 0.5, 0.03, 0.04); fill(c, '#ff5a5f');
      circ(c, 0.4, 0.29, 0.06); fill(c, '#5ff0ff'); circ(c, 0.62, 0.29, 0.06); fill(c, '#5ff0ff');
    } else if (v === 'astro') {
      var ac = o.color || '#f2f4fa';
      rr(c, 0.06, 0.46, 0.18, 0.32, 0.05); fill(c, '#c3cbe0');
      rr(c, 0.28, 0.78, 0.15, 0.16, 0.04); fill(c, ac); rr(c, 0.57, 0.78, 0.15, 0.16, 0.04); fill(c, ac);
      rr(c, 0.2, 0.44, 0.6, 0.42, 0.14); fill(c, ac);
      rr(c, 0.42, 0.56, 0.16, 0.1, 0.03); fill(c, '#ff6b6b');
      circ(c, 0.52, 0.28, 0.25); fill(c, ac);
      rr(c, 0.38, 0.18, 0.38, 0.2, 0.1); fill(c, '#3b6fd8');
      rr(c, 0.45, 0.21, 0.1, 0.05, 0.02); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
    } else if (v === 'knight') {
      var kc = o.color || '#3d63c9';
      rr(c, 0.28, 0.8, 0.15, 0.14, 0.03); fill(c, '#55627a'); rr(c, 0.57, 0.8, 0.15, 0.14, 0.03); fill(c, '#55627a');
      rr(c, 0.22, 0.44, 0.56, 0.42, 0.1); fill(c, kc);
      poly(c, [0.5, 0.52, 0.6, 0.6, 0.5, 0.74, 0.4, 0.6]); fill(c, '#ffd23f', 0.03);
      ell(c, 0.5, 0.08, 0.1, 0.07); fill(c, '#ff5a5f');
      rr(c, 0.27, 0.1, 0.46, 0.38, 0.18); fill(c, '#c2c9d6');
      rr(c, 0.4, 0.26, 0.3, 0.06, 0.02); c.fillStyle = INK; c.fill();
    } else if (v === 'capyfly') {
      var fw = st && st.moving ? Math.sin(t * 22) * 0.14 : 0;
      c.save(); c.translate(0.08, 0.1); c.scale(0.86, 0.86); SPR.hero(c, { v: 'capy', color: o.color }, 0, {}); c.restore();
      poly(c, [0.36, 0.5, 0.06, 0.26 - fw, 0.12, 0.44 - fw * 0.5, 0.02, 0.5 - fw * 0.3, 0.3, 0.62]); fill(c, '#ffffff');
      line(c, 0.14, 0.4 - fw * 0.6, 0.3, 0.54, '#c9d6ea', 0.03);
    } else if (v === 'bird') {
      var bc = o.color || '#ffd23f', fl = st && st.moving ? Math.sin(t * 22) * 0.12 : 0;
      ell(c, 0.48, 0.55, 0.36, 0.3); fill(c, bc);
      ell(c, 0.56, 0.66, 0.2, 0.12); fill(c, '#fff3c4', 0);
      poly(c, [0.2, 0.52 - fl, 0.44, 0.46, 0.4, 0.66 + fl * 0.4]); fill(c, shade(bc, -30));
      circ(c, 0.66, 0.42, 0.11); fill(c, '#fff');
      circ(c, 0.69, 0.42, 0.045); c.fillStyle = INK; c.fill();
      poly(c, [0.8, 0.5, 1.0, 0.56, 0.8, 0.64]); fill(c, '#ff7a2b');
      poly(c, [0.14, 0.5, 0.02, 0.42, 0.04, 0.6]); fill(c, shade(bc, -30));
    } else if (v === 'fox') {
      var fc = o.color || '#f07c2b';
      poly(c, [0.04, 0.5, 0.2, 0.62, 0.12, 0.78]); fill(c, fc);
      rr(c, 0.24, 0.78, 0.12, 0.16, 0.04); fill(c, INK, 0); rr(c, 0.58, 0.78, 0.12, 0.16, 0.04); c.fillStyle = INK; c.fill();
      rr(c, 0.14, 0.44, 0.62, 0.4, 0.18); fill(c, fc);
      poly(c, [0.48, 0.3, 0.56, 0.06, 0.66, 0.26]); fill(c, fc);
      poly(c, [0.72, 0.26, 0.84, 0.06, 0.88, 0.32]); fill(c, fc);
      rr(c, 0.46, 0.22, 0.46, 0.34, 0.15); fill(c, fc);
      poly(c, [0.78, 0.4, 0.98, 0.46, 0.8, 0.54]); fill(c, '#fff');
      circ(c, 0.71, 0.34, 0.035); c.fillStyle = INK; c.fill();
      circ(c, 0.97, 0.46, 0.03); c.fill();
    }
  };
  SPR.enemy = function (c, o, t, st) {
    var v = o.v || 'robot', col;
    if (v === 'robot') {
      col = o.color || '#e0524a';
      rr(c, 0.22, 0.82, 0.14, 0.12, 0.03); fill(c, '#55627a'); rr(c, 0.64, 0.82, 0.14, 0.12, 0.03); fill(c, '#55627a');
      rr(c, 0.14, 0.2, 0.72, 0.64, 0.12); fill(c, col);
      eye(c, 0.5, 0.45, 0.13);
      line(c, 0.34, 0.27, 0.48, 0.33, INK, 0.06); line(c, 0.66, 0.27, 0.52, 0.33, INK, 0.06);
      rr(c, 0.34, 0.66, 0.32, 0.07, 0.02); c.fillStyle = INK; c.fill();
    } else if (v === 'bat') {
      col = o.color || '#6b4fa0';
      var f = Math.sin(t * 14) * 0.12;
      poly(c, [0.45, 0.45, 0.04, 0.3 + f, 0.14, 0.6, 0.45, 0.58]); fill(c, shade(col, -20));
      poly(c, [0.55, 0.45, 0.96, 0.3 + f, 0.86, 0.6, 0.55, 0.58]); fill(c, shade(col, -20));
      circ(c, 0.5, 0.5, 0.2); fill(c, col);
      poly(c, [0.36, 0.38, 0.38, 0.22, 0.46, 0.33]); fill(c, col); poly(c, [0.64, 0.38, 0.62, 0.22, 0.54, 0.33]); fill(c, col);
      eye(c, 0.43, 0.48, 0.06); eye(c, 0.57, 0.48, 0.06);
    } else if (v === 'blob') {
      col = o.color || '#4fbf6a';
      var w = t ? Math.sin(t * 6) * 0.03 : 0;
      c.beginPath(); c.moveTo(0.08, 0.92); c.bezierCurveTo(0.04 - w, 0.2, 0.96 + w, 0.2, 0.92, 0.92); c.closePath(); fill(c, col);
      eye(c, 0.38, 0.55, 0.1); eye(c, 0.62, 0.55, 0.1);
      c.beginPath(); c.arc(0.5, 0.72, 0.08, 0.2, Math.PI - 0.2); c.lineWidth = 0.04; c.strokeStyle = INK; c.stroke();
    } else {
      col = o.color || '#e8962e';
      rr(c, 0.26, 0.8, 0.14, 0.14, 0.03); fill(c, INK, 0); rr(c, 0.6, 0.8, 0.14, 0.14, 0.03); c.fillStyle = INK; c.fill();
      rr(c, 0.2, 0.3, 0.6, 0.54, 0.16); fill(c, col);
      rr(c, 0.16, 0.16, 0.68, 0.16, 0.05); fill(c, '#2d3a66');
      rr(c, 0.28, 0.06, 0.44, 0.14, 0.05); fill(c, '#2d3a66');
      eye(c, 0.4, 0.47, 0.07); eye(c, 0.6, 0.47, 0.07);
      line(c, 0.4, 0.66, 0.6, 0.66, INK, 0.05);
    }
  };
  SPR.coin = function (c, o, t) {
    var sx = t ? Math.max(0.15, Math.abs(Math.cos(t * 3))) : 1;
    var col = o.color || (o.v === 'silver' ? '#cfd6e2' : '#f5c542');
    ell(c, 0.5, 0.5, 0.27 * sx, 0.28); fill(c, col);
    ell(c, 0.5, 0.5, 0.15 * sx, 0.16); c.lineWidth = 0.04; c.strokeStyle = shade(col, -50); c.stroke();
  };
  SPR.star = function (c, o, t) {
    var s = t ? 1 + Math.sin(t * 4) * 0.06 : 1;
    star(c, 0.5, 0.52, 0.34 * s, 0.15 * s, 5); fill(c, o.color || (o.v === 'pink' ? '#ff7eb6' : '#ffd23f'));
  };
  SPR.fruit = function (c, o) {
    var v = o.v || 'apple';
    if (v === 'cherry') {
      line(c, 0.35, 0.6, 0.55, 0.15, '#3b6b2a', 0.04); line(c, 0.68, 0.62, 0.55, 0.15, '#3b6b2a', 0.04);
      circ(c, 0.33, 0.66, 0.16); fill(c, o.color || '#d7263d'); circ(c, 0.68, 0.68, 0.16); fill(c, o.color || '#d7263d');
      ell(c, 0.62, 0.17, 0.1, 0.05); fill(c, '#4caf50', 0.03);
    } else if (v === 'orange') {
      circ(c, 0.5, 0.56, 0.28); fill(c, o.color || '#ff9f1c');
      ell(c, 0.58, 0.26, 0.1, 0.05); fill(c, '#4caf50', 0.03);
    } else if (v === 'pear') {
      c.beginPath(); c.arc(0.5, 0.64, 0.25, 0, Math.PI * 2); c.moveTo(0.5, 0.28); fill(c, o.color || '#b5d334');
      circ(c, 0.5, 0.4, 0.16); fill(c, o.color || '#b5d334');
      line(c, 0.5, 0.24, 0.54, 0.12, '#6b4a2b', 0.04);
    } else {
      circ(c, 0.5, 0.57, 0.27); fill(c, o.color || '#e8443a');
      line(c, 0.5, 0.32, 0.52, 0.17, '#6b4a2b', 0.05);
      ell(c, 0.62, 0.22, 0.1, 0.05); fill(c, '#4caf50', 0.03);
      ell(c, 0.4, 0.48, 0.05, 0.08); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
    }
  };
  SPR.key = function (c, o, t) {
    var col = o.color || '#f5c542', b = t ? Math.sin(t * 3) * 0.04 : 0;
    c.translate(0, b);
    rr(c, 0.38, 0.45, 0.48, 0.1, 0.03); fill(c, col);
    rr(c, 0.68, 0.53, 0.07, 0.13, 0.02); fill(c, col); rr(c, 0.78, 0.53, 0.07, 0.1, 0.02); fill(c, col);
    circ(c, 0.28, 0.5, 0.15); fill(c, col);
    circ(c, 0.28, 0.5, 0.06); c.fillStyle = INK; c.fill();
  };
  SPR.gem = function (c, o, t) {
    var col = o.color || ({ blue: '#43c6e8', green: '#3ddc84', red: '#ff5470' })[o.v || 'blue'];
    poly(c, [0.5, 0.18, 0.78, 0.4, 0.5, 0.84, 0.22, 0.4]); fill(c, col);
    poly(c, [0.5, 0.18, 0.62, 0.4, 0.5, 0.84, 0.38, 0.4]); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
    line(c, 0.22, 0.4, 0.78, 0.4, INK, 0.03);
    if (t) { c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 5); star(c, 0.72, 0.24, 0.07, 0.02, 4); c.fillStyle = '#fff'; c.fill(); c.globalAlpha = 1; }
  };
  SPR.heart = function (c, o, t) {
    var s = t ? 1 + Math.sin(t * 6) * 0.05 : 1;
    c.translate(0.5, 0.52); c.scale(s, s); c.translate(-0.5, -0.52);
    c.beginPath(); c.moveTo(0.5, 0.82);
    c.bezierCurveTo(0.1, 0.55, 0.12, 0.2, 0.34, 0.2); c.bezierCurveTo(0.44, 0.2, 0.5, 0.28, 0.5, 0.34);
    c.bezierCurveTo(0.5, 0.28, 0.56, 0.2, 0.66, 0.2); c.bezierCurveTo(0.88, 0.2, 0.9, 0.55, 0.5, 0.82); c.closePath();
    fill(c, o.color || '#ff4d6d');
  };
  SPR.card = function (c, o) {
    var col = o.color || (o.v === 'yellow' ? '#ffd23f' : '#6fa8ff');
    c.save(); c.translate(0.5, 0.5); c.rotate(-0.12); c.translate(-0.5, -0.5);
    rr(c, 0.22, 0.14, 0.56, 0.72, 0.08); fill(c, col);
    rr(c, 0.32, 0.28, 0.36, 0.06, 0.02); c.fillStyle = INK; c.fill();
    rr(c, 0.32, 0.42, 0.28, 0.05, 0.02); c.fill(); rr(c, 0.32, 0.54, 0.32, 0.05, 0.02); c.fill();
    c.restore();
  };
  SPR.goal = function (c, o, t, st) {
    var v = o.v || 'flag';
    if (v === 'flag') {
      rr(c, 0.12, 0.86, 0.36, 0.1, 0.03); fill(c, '#8a94a8');
      rr(c, 0.26, 0.06, 0.07, 0.84, 0.03); fill(c, '#d8dde8');
      var w = t ? Math.sin(t * 5) * 0.05 : 0;
      c.beginPath(); c.moveTo(0.33, 0.1); c.quadraticCurveTo(0.6, 0.12 + w, 0.88, 0.2); c.quadraticCurveTo(0.6, 0.3 - w, 0.33, 0.44); c.closePath(); fill(c, o.color || '#2fb36b');
      c.fillStyle = '#fff'; c.fillRect(0.42, 0.18, 0.08, 0.08); c.fillRect(0.58, 0.22, 0.08, 0.08);
    } else if (v === 'portal') {
      var col = o.color || '#8b5cf6';
      ell(c, 0.5, 0.5, 0.32, 0.44); fill(c, col);
      for (var i = 0; i < 3; i++) { ell(c, 0.5, 0.5, 0.24 - i * 0.07 + (t ? Math.sin(t * 4 + i) * 0.02 : 0), 0.34 - i * 0.09); c.lineWidth = 0.04; c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke(); }
    } else if (v === 'chest') {
      var cc = o.color || '#b86b2b';
      rr(c, 0.12, 0.42, 0.76, 0.46, 0.06); fill(c, cc);
      rr(c, 0.12, 0.22, 0.76, 0.24, 0.12); fill(c, shade(cc, 20));
      rr(c, 0.12, 0.42, 0.76, 0.08, 0.02); fill(c, '#f5c542', 0.03);
      rr(c, 0.43, 0.38, 0.14, 0.18, 0.03); fill(c, '#f5c542');
    } else {
      var hc = o.color || '#f4a259';
      poly(c, [0.08, 0.46, 0.5, 0.1, 0.92, 0.46]); fill(c, '#d1495b');
      rr(c, 0.16, 0.44, 0.68, 0.48, 0.03); fill(c, hc);
      rr(c, 0.42, 0.6, 0.18, 0.32, 0.04); fill(c, '#7a4f2b');
      rr(c, 0.22, 0.52, 0.14, 0.14, 0.02); fill(c, '#bfe8f7');
    }
  };
  SPR.sign = function (c, o) {
    rr(c, 0.45, 0.5, 0.1, 0.44, 0.02); fill(c, '#8a5a32');
    var bd = o.v === 'board';
    rr(c, 0.08, 0.12, 0.84, 0.46, 0.06); fill(c, o.color || (bd ? '#2f5d50' : '#d79a5b'));
    var tc = bd ? '#f4f4f4' : INK;
    rr(c, 0.44, 0.2, 0.12, 0.2, 0.04); c.fillStyle = tc; c.fill();
    circ(c, 0.5, 0.48, 0.05); c.fill();
  };
  SPR.ground = function (c, o) {
    var v = o.v || 'grass', i;
    var base = { grass: '#9a6a43', dirt: '#9a6a43', stone: '#9aa3b2', sand: '#e8cf8a', ice: '#bfe8f7' }[v];
    if (o.color) base = o.color;
    c.fillStyle = base; c.fillRect(0, 0, 1, 1);
    if (v === 'grass') { c.fillStyle = '#5cbf4a'; c.fillRect(0, 0, 1, 0.28); c.fillStyle = '#7bd65f'; for (i = 0; i < 4; i++) c.fillRect(0.06 + i * 0.25, 0.26, 0.1, 0.07); }
    if (v === 'grass' || v === 'dirt') { c.fillStyle = shade(base, -30); c.fillRect(0.2, 0.55, 0.08, 0.08); c.fillRect(0.65, 0.7, 0.1, 0.08); c.fillRect(0.5, 0.42, 0.06, 0.06); }
    if (v === 'stone') { line(c, 0.1, 0.3, 0.45, 0.35, shade(base, -40), 0.04); line(c, 0.55, 0.65, 0.9, 0.6, shade(base, -40), 0.04); line(c, 0.3, 0.75, 0.4, 0.95, shade(base, -40), 0.04); }
    if (v === 'sand') { c.fillStyle = shade(base, -35); [[0.2, 0.3], [0.6, 0.2], [0.4, 0.6], [0.8, 0.7], [0.15, 0.8]].forEach(function (p) { c.fillRect(p[0], p[1], 0.05, 0.05); }); }
    if (v === 'ice') { line(c, 0.15, 0.5, 0.45, 0.2, 'rgba(255,255,255,.9)', 0.06); line(c, 0.4, 0.8, 0.8, 0.4, 'rgba(255,255,255,.7)', 0.05); }
    c.lineWidth = 0.03; c.strokeStyle = 'rgba(29,36,64,.55)'; c.strokeRect(0.015, 0.015, 0.97, 0.97);
  };
  SPR.wall = function (c, o) {
    var v = o.v || 'brick', i;
    if (v === 'hedge') {
      c.fillStyle = o.color || '#3e9a4a'; c.fillRect(0, 0, 1, 1);
      c.fillStyle = shade(o.color || '#3e9a4a', 25);
      [[0.25, 0.25], [0.7, 0.3], [0.3, 0.72], [0.75, 0.75], [0.5, 0.5]].forEach(function (p) { circ(c, p[0], p[1], 0.16); c.fill(); });
    } else if (v === 'metal') {
      c.fillStyle = o.color || '#8794a8'; c.fillRect(0, 0, 1, 1);
      c.fillStyle = shade(o.color || '#8794a8', 30); c.fillRect(0.06, 0.06, 0.88, 0.12);
      c.fillStyle = shade(o.color || '#8794a8', -40);
      [[0.15, 0.15], [0.85, 0.15], [0.15, 0.85], [0.85, 0.85]].forEach(function (p) { circ(c, p[0], p[1], 0.05); c.fill(); });
    } else {
      var bc = o.color || '#c4553b';
      c.fillStyle = bc; c.fillRect(0, 0, 1, 1);
      c.strokeStyle = shade(bc, -55); c.lineWidth = 0.05;
      for (i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, i * 0.25); c.lineTo(1, i * 0.25); c.stroke(); var off = i % 2 ? 0.25 : 0.5; c.beginPath(); c.moveTo(off, i * 0.25); c.lineTo(off, i * 0.25 + 0.25); c.stroke(); if (i % 2) { c.beginPath(); c.moveTo(0.75, i * 0.25); c.lineTo(0.75, i * 0.25 + 0.25); c.stroke(); } }
    }
    c.lineWidth = 0.03; c.strokeStyle = 'rgba(29,36,64,.6)'; c.strokeRect(0.015, 0.015, 0.97, 0.97);
  };
  SPR.platform = function (c, o) {
    var v = o.v || 'wood';
    if (v === 'cloud') {
      c.fillStyle = o.color || '#ffffff';
      [[0.2, 0.25, 0.2], [0.45, 0.18, 0.24], [0.75, 0.25, 0.2]].forEach(function (p) { circ(c, p[0], p[1], p[2]); c.fill(); });
      rr(c, 0.02, 0.2, 0.96, 0.24, 0.12); c.fill();
      rr(c, 0.02, 0.2, 0.96, 0.24, 0.12); c.lineWidth = 0.03; c.strokeStyle = 'rgba(29,36,64,.45)'; c.stroke();
    } else {
      var pc = o.color || (v === 'stone' ? '#9aa3b2' : '#c98d4b');
      rr(c, 0, 0, 1, 0.45, 0.07); fill(c, pc, 0.04);
      line(c, 0.05, 0.22, 0.95, 0.22, shade(pc, -40), 0.03);
      c.fillStyle = shade(pc, -40); circ(c, 0.12, 0.12, 0.03); c.fill(); circ(c, 0.88, 0.12, 0.03); c.fill();
    }
  };
  SPR.spikes = function (c, o) {
    rr(c, 0, 0.84, 1, 0.16, 0.03); fill(c, '#6f7a90', 0.03);
    for (var i = 0; i < 3; i++) { poly(c, [0.04 + i * 0.32, 0.86, 0.2 + i * 0.32, 0.42, 0.36 + i * 0.32, 0.86]); fill(c, o.color || '#d4dbe7', 0.035); }
  };
  SPR.lava = function (c, o, t) {
    var v = o.v || 'lava';
    var base = o.color || { lava: '#ff6a2b', acid: '#7ed957', water: '#2f7fd8' }[v], top = shade(base, 45);
    c.fillStyle = base; c.fillRect(0, 0.3, 1, 0.7);
    c.beginPath(); c.moveTo(0, 0.34);
    for (var x = 0; x <= 1.001; x += 0.125) c.lineTo(x, 0.3 + Math.sin(x * 12 + t * 3) * 0.04);
    c.lineTo(1, 0.45); c.lineTo(0, 0.45); c.closePath(); c.fillStyle = top; c.fill();
    c.fillStyle = shade(top, 30);
    var b1 = t ? (t * 0.6) % 1 : 0.4; circ(c, 0.3, 0.9 - b1 * 0.5, 0.05); c.fill(); circ(c, 0.72, 0.85 - ((b1 + 0.5) % 1) * 0.45, 0.04); c.fill();
  };
  SPR.door = function (c, o, t, st) {
    var met = o.v === 'metal', col = o.color || (met ? '#7d8aa0' : '#a0663a');
    rr(c, 0.08, 0.02, 0.84, 0.98, 0.1); fill(c, '#4a3b55');
    if (st && st.open) {
      rr(c, 0.16, 0.1, 0.68, 0.9, 0.06); c.fillStyle = '#211a2e'; c.fill();
      poly(c, [0.16, 0.1, 0.3, 0.16, 0.3, 0.94, 0.16, 1]); fill(c, col, 0.03);
      return;
    }
    rr(c, 0.16, 0.1, 0.68, 0.9, 0.06); fill(c, col, 0.03);
    if (met) { line(c, 0.2, 0.4, 0.8, 0.4, shade(col, -40), 0.04); line(c, 0.2, 0.7, 0.8, 0.7, shade(col, -40), 0.04); }
    else { line(c, 0.38, 0.12, 0.38, 0.98, shade(col, -40), 0.03); line(c, 0.6, 0.12, 0.6, 0.98, shade(col, -40), 0.03); }
    var need = o.b && o.b.door ? o.b.door.need : 'key';
    if (need === 'key') { circ(c, 0.66, 0.54, 0.06); fill(c, '#f5c542', 0.03); rr(c, 0.645, 0.56, 0.03, 0.08, 0.01); c.fillStyle = INK; c.fill(); }
    else { star(c, 0.5, 0.3, 0.12, 0.05, 5); fill(c, '#ffd23f', 0.03); }
  };
  SPR.deco = function (c, o, t) {
    var v = o.v || 'tree';
    if (v === 'tree') {
      rr(c, 0.42, 0.55, 0.16, 0.42, 0.03); fill(c, '#8a5a32');
      circ(c, 0.5, 0.36, 0.3); fill(c, o.color || '#4caf50');
      circ(c, 0.4, 0.3, 0.07); c.fillStyle = 'rgba(255,255,255,.25)'; c.fill();
    } else if (v === 'bush') {
      c.fillStyle = o.color || '#5cb85c';
      c.beginPath(); c.arc(0.3, 0.7, 0.2, 0, 7); c.arc(0.55, 0.6, 0.24, 0, 7); c.arc(0.75, 0.72, 0.18, 0, 7); c.fill();
      c.lineWidth = 0.03; c.strokeStyle = 'rgba(29,36,64,.5)'; c.stroke();
    } else if (v === 'flower') {
      line(c, 0.5, 0.5, 0.5, 0.95, '#3b8f3b', 0.05);
      ell(c, 0.62, 0.78, 0.1, 0.05); fill(c, '#4caf50', 0.02);
      var pc = o.color || '#ff7eb6';
      for (var i = 0; i < 5; i++) { var a = i / 5 * Math.PI * 2 + (t ? Math.sin(t) * 0.2 : 0); circ(c, 0.5 + Math.cos(a) * 0.13, 0.4 + Math.sin(a) * 0.13, 0.1); fill(c, pc, 0.025); }
      circ(c, 0.5, 0.4, 0.08); fill(c, '#ffd23f', 0.025);
    } else if (v === 'cloud') {
      c.fillStyle = o.color || '#ffffff'; c.globalAlpha = 0.95;
      c.beginPath(); c.arc(0.3, 0.55, 0.17, 0, 7); c.arc(0.5, 0.45, 0.22, 0, 7); c.arc(0.72, 0.56, 0.16, 0, 7); c.fill(); c.globalAlpha = 1;
    } else if (v === 'rock') {
      poly(c, [0.12, 0.92, 0.22, 0.55, 0.48, 0.42, 0.78, 0.5, 0.9, 0.92]); fill(c, o.color || '#9aa3b2');
    } else if (v === 'planet') {
      circ(c, 0.5, 0.5, 0.26); fill(c, o.color || '#ff9f6b');
      ell(c, 0.5, 0.5, 0.42, 0.1); c.lineWidth = 0.05; c.strokeStyle = '#ffd23f'; c.stroke();
    } else if (v === 'shell') {
      c.beginPath(); c.moveTo(0.5, 0.88); c.lineTo(0.14, 0.42); c.quadraticCurveTo(0.5, 0.05, 0.86, 0.42); c.closePath(); fill(c, o.color || '#ffb3c7');
      for (var j = 0; j < 4; j++) line(c, 0.5, 0.86, 0.22 + j * 0.19, 0.32, 'rgba(29,36,64,.5)', 0.03);
    } else if (v === 'column') {
      rr(c, 0.22, 0.04, 0.56, 0.12, 0.02); fill(c, o.color || '#efe3c6'); rr(c, 0.3, 0.16, 0.4, 0.7, 0.02); fill(c, o.color || '#efe3c6');
      rr(c, 0.2, 0.86, 0.6, 0.1, 0.02); fill(c, o.color || '#efe3c6');
    } else if (v === 'books') {
      rr(c, 0.14, 0.72, 0.72, 0.2, 0.03); fill(c, '#5b8def'); rr(c, 0.2, 0.52, 0.64, 0.2, 0.03); fill(c, '#ff6b6b'); rr(c, 0.16, 0.32, 0.6, 0.2, 0.03); fill(c, '#ffd23f');
    }
  };

  var IMGS = {};
  function registerAssets(assets) {
    Object.keys(assets || {}).forEach(function (k) {
      if (IMGS[k] && IMGS[k].src === assets[k]) return;
      var im = new Image(); im.src = assets[k]; IMGS[k] = im;
    });
  }
  function drawSprite(c, o, x, y, s, t, st) {
    c.save();
    c.translate(x, y); c.scale(s, s);
    c.lineJoin = 'round'; c.lineCap = 'round';
    if (o.img && IMGS[o.img] && IMGS[o.img].complete && IMGS[o.img].naturalWidth) {
      if (st && st.dir < 0) { c.translate(1, 0); c.scale(-1, 1); }
      c.drawImage(IMGS[o.img], 0, 0, 1, 1);
    } else if (SPR[o.type]) {
      if (st && st.dir < 0 && (o.type === 'hero' || o.type === 'enemy')) { c.translate(1, 0); c.scale(-1, 1); }
      SPR[o.type](c, o, t || 0, st || {});
    }
    c.restore();
  }
  function hitOf(o, view) {
    var d = TYPES[o.type] || {};
    if (o.type === 'hero') return view === 'side' ? d.hitSide : d.hitTop;
    return d.hit || [0, 0, 1, 1];
  }
