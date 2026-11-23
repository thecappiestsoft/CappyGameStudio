  /* ---------- sound ---------- */
  function Sound() {
    var ac = null, vol = 0.6, on = true;
    function ctx() {
      if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
      if (ac && ac.state === 'suspended') { try { ac.resume(); } catch (e) { } }
      return ac;
    }
    function tone(f, d, type, when, slide) {
      if (!on || vol <= 0) return;
      var a = ctx(); if (!a) return;
      var o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + (when || 0);
      o.type = type || 'square'; o.frequency.setValueAtTime(f, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.16 * vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + d + 0.03);
    }
    var fx = {
      collect: function () { tone(880, 0.08, 'square'); tone(1320, 0.1, 'square', 0.07); },
      jump: function () { tone(300, 0.15, 'triangle', 0, 620); },
      hurt: function () { tone(240, 0.28, 'sawtooth', 0, 110); },
      win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.2, 'triangle', i * 0.12); }); },
      lose: function () { [392, 330, 262].forEach(function (f, i) { tone(f, 0.24, 'triangle', i * 0.17); }); },
      door: function () { tone(200, 0.2, 'square', 0, 420); },
      hint: function () { tone(660, 0.08, 'sine'); tone(880, 0.08, 'sine', 0.08); },
      life: function () { tone(660, 0.1, 'triangle'); tone(990, 0.16, 'triangle', 0.1); },
      stomp: function () { tone(500, 0.1, 'square', 0, 200); }
    };
    return { play: function (n) { try { if (fx[n]) fx[n](); } catch (e) { } }, set: function (o, v) { on = !!o; vol = +v; }, unlock: ctx };
  }
