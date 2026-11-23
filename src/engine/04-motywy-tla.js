  /* ---------- themes ---------- */
  var THEMES = {
    przyroda: { name: 'Przyroda', sw: '#9fdcf5' },
    dzungla: { name: 'Dżungla', sw: '#6cc58a' },
    kosmos: { name: 'Kosmos', sw: '#241d58' },
    woda: { name: 'Podwodny świat', sw: '#2f8fc4' },
    szkola: { name: 'Szkoła', sw: '#fff6d6' },
    historia: { name: 'Historia', sw: '#e5c98e' },
    matematyka: { name: 'Matematyka', sw: '#eef6ff' },
    fantastyka: { name: 'Fantastyka', sw: '#e3c9ff' },
    miasto: { name: 'Miasto', sw: '#ffc9a8' },
    wlasny: { name: 'Własny pomysł', sw: '#ffffff' }
  };

  function drawBackground(c, theme, w, h, t, custom) {
    var g, r = srand(7), i;
    c.save();
    switch (theme) {
      case 'kosmos':
        g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0f1433'); g.addColorStop(1, '#2d1f63');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        for (i = 0; i < w * h / 2500; i++) { var tw = 0.5 + 0.5 * Math.sin(t * 2 + i); c.globalAlpha = 0.4 + 0.6 * (t ? tw : 0.8); c.fillStyle = '#fff'; c.fillRect(r() * w, r() * h, 2, 2); }
        c.globalAlpha = 1; break;
      case 'woda':
        g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#62d0ec'); g.addColorStop(1, '#1d5f9c');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 2;
        for (i = 0; i < w / 60; i++) { var bx = r() * w, by = (r() * h - t * 30 * (0.5 + r())) % h; if (by < 0) by += h; c.beginPath(); c.arc(bx, by, 3 + r() * 6, 0, 7); c.stroke(); }
        break;
      case 'szkola':
        c.fillStyle = '#fff8dc'; c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(80,130,210,.25)'; c.lineWidth = 1;
        for (i = 20; i < h; i += 20) { c.beginPath(); c.moveTo(0, i + .5); c.lineTo(w, i + .5); c.stroke(); }
        c.strokeStyle = 'rgba(220,60,60,.35)'; c.beginPath(); c.moveTo(60.5, 0); c.lineTo(60.5, h); c.stroke(); break;
      case 'historia':
        g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6e6c2'); g.addColorStop(1, '#e2c48a');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(160,120,60,.25)';
        for (i = 0; i < w; i += 180) { c.fillRect(i + 20, h - 120, 70, 120); for (var k = 0; k < 4; k++) c.fillRect(i + 20 + k * 20, h - 135, 12, 15); c.fillRect(i + 95, h - 80, 60, 80); }
        break;
      case 'matematyka':
        c.fillStyle = '#f4f9ff'; c.fillRect(0, 0, w, h);
        c.lineWidth = 1;
        for (i = 0; i <= w; i += 20) { c.strokeStyle = i % 100 ? 'rgba(70,120,200,.13)' : 'rgba(70,120,200,.3)'; c.beginPath(); c.moveTo(i + .5, 0); c.lineTo(i + .5, h); c.stroke(); }
        for (i = 0; i <= h; i += 20) { c.strokeStyle = i % 100 ? 'rgba(70,120,200,.13)' : 'rgba(70,120,200,.3)'; c.beginPath(); c.moveTo(0, i + .5); c.lineTo(w, i + .5); c.stroke(); }
        break;
      case 'fantastyka':
        g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#f7d9ff'); g.addColorStop(1, '#c8d4ff');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(255,255,255,.8)';
        for (i = 0; i < w * h / 6000; i++) { var sx = r() * w, sy = r() * h, ss = 2 + r() * 3 + (t ? Math.sin(t * 3 + i) : 0); c.save(); c.translate(sx, sy); c.scale(Math.max(ss, 1), Math.max(ss, 1)); star(c, 0, 0, 1, 0.4, 4); c.fill(); c.restore(); }
        break;
      case 'miasto':
        g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffd9b8'); g.addColorStop(1, '#ffeedd');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(120,90,140,.22)';
        for (i = 0; i < w; i += 70) { var bh = 80 + r() * 160; c.fillRect(i, h - bh, 56, bh); }
        break;
      case 'dzungla':
        g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#c7f0dc'); g.addColorStop(1, '#eaf8d6');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(60,150,90,.22)';
        for (i = -40; i < w; i += 120) { c.beginPath(); c.ellipse(i + 60, h, 110, 120 + r() * 60, 0, 0, Math.PI * 2); c.fill(); }
        c.strokeStyle = 'rgba(40,120,70,.3)'; c.lineWidth = 3;
        for (i = 30; i < w; i += 160) { c.beginPath(); c.moveTo(i, 0); c.quadraticCurveTo(i + 15, 50, i - 5, 90 + r() * 40); c.stroke(); }
        break;
      case 'wlasny':
        c.fillStyle = custom || '#ffffff'; c.fillRect(0, 0, w, h); break;
      default:
        g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9fdcf5'); g.addColorStop(1, '#e6f7ff');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(255,214,90,.9)'; c.beginPath(); c.arc(w - 70, 60, 30, 0, 7); c.fill();
        c.fillStyle = 'rgba(110,190,100,.3)';
        for (i = -60; i < w; i += 200) { c.beginPath(); c.ellipse(i + 100, h + 20, 160, 110, 0, 0, Math.PI * 2); c.fill(); }
    }
    c.restore();
  }
