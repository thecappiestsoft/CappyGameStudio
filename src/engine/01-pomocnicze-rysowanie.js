  /* ---------- drawing helpers (unit coordinates 0..1) ---------- */
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function fill(c, col, lw) {
    c.fillStyle = col; c.fill();
    if (lw !== 0) { c.lineWidth = lw || LW; c.strokeStyle = INK; c.stroke(); }
  }
  function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
  function ell(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, Math.max(rx, 0.001), Math.max(ry, 0.001), 0, 0, Math.PI * 2); }
  function poly(c, pts) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); }
  function line(c, x1, y1, x2, y2, col, w) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col || INK; c.lineWidth = w || LW; c.lineCap = 'round'; c.stroke(); }
  function shade(hex, amt) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return hex;
    var n = parseInt(m[1], 16), r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function star(c, cx, cy, ro, ri, n) {
    c.beginPath();
    for (var i = 0; i < n * 2; i++) {
      var r = i % 2 ? ri : ro, a = -Math.PI / 2 + i * Math.PI / n;
      c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    c.closePath();
  }
  function eye(c, x, y, r) { circ(c, x, y, r); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 0.03; c.strokeStyle = INK; c.stroke(); circ(c, x + r * 0.25, y, r * 0.5); c.fillStyle = INK; c.fill(); }
  function srand(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
