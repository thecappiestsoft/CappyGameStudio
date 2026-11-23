  /* ---------- player shell (HUD, title, pause, dialog, end) ---------- */
  var CSS2 = '' +
    '.cgm [hidden]{display:none!important}' +
    '.cgm{--k:#1d2440;display:flex;flex-direction:column;gap:8px;font-family:"Lexend","Segoe UI",system-ui,sans-serif;color:var(--cgm-text,#1d2440)}' +
    '.cgm-hud{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;min-height:36px}' +
    '.cgm-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border:2px solid var(--k);border-radius:999px;background:#fff;color:var(--k);font-weight:700;font-variant-numeric:tabular-nums;box-shadow:0 2px 0 var(--k);font-size:14px;white-space:nowrap}' +
    '.cgm-pill svg{width:18px;height:18px;flex:none}' +
    '.cgm-bar{display:inline-block;width:70px;height:10px;border:2px solid var(--k);border-radius:6px;background:#eee;overflow:hidden}.cgm-bar i{display:block;height:100%;background:#ff4d6d}' +
    '.cgm-stage{position:relative;display:flex;justify-content:center;align-items:center}' +
    '.cgm-stage canvas{display:block;border:3px solid var(--k);border-radius:12px;background:#141a30;max-width:100%;height:auto;touch-action:none}' +
    '.cgm-toast{position:absolute;left:50%;top:12px;transform:translateX(-50%);max-width:88%;background:#fff;color:var(--k);border:2px solid var(--k);border-radius:12px;padding:7px 14px;font-weight:600;box-shadow:0 3px 0 var(--k);text-align:center;pointer-events:none}' +
    '.cgm-key{position:absolute;right:14px;top:14px;background:#fff6c7;color:var(--k);border:2px solid var(--k);border-radius:10px;padding:4px 10px;font-weight:700;font-size:13px;pointer-events:none}' +
    '.cgm-dlg{position:absolute;left:4%;right:4%;bottom:14px;background:#fff;color:var(--k);border:3px solid var(--k);border-radius:14px;box-shadow:0 4px 0 var(--k);padding:12px 16px;display:flex;flex-direction:column;gap:4px;cursor:pointer}' +
    '.cgm-dlg b{font-family:"Baloo 2","Trebuchet MS",sans-serif;font-size:17px}.cgm-dlg small{opacity:.7;align-self:flex-end}' +
    '.cgm-over{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(20,26,48,.6);border-radius:12px;padding:12px}' +
    '.cgm-card{background:#fff;color:var(--k);border:3px solid var(--k);border-radius:18px;box-shadow:0 5px 0 var(--k);padding:18px 22px;max-width:460px;width:100%;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center;max-height:100%;overflow:auto}' +
    '.cgm-card h2{margin:0;font-family:"Baloo 2","Trebuchet MS",sans-serif;font-size:30px;line-height:1.1}.cgm-card p{margin:0;line-height:1.45}.cgm-keys{font-size:13px;opacity:.85}' +
    '.cgm-btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}' +
    '.cgm-btn{font:700 17px "Baloo 2","Trebuchet MS",sans-serif;padding:8px 18px;min-height:44px;border:2px solid var(--k);border-radius:12px;background:#fff;color:var(--k);box-shadow:0 3px 0 var(--k);cursor:pointer}' +
    '.cgm-btn.go{background:#12806a;color:#fff}.cgm-btn:active{transform:translateY(2px);box-shadow:0 1px 0 var(--k)}' +
    '.cgm-btn:focus-visible,.cgm-tb:focus-visible{outline:3px solid #ffbf00;outline-offset:2px}' +
    '.cgm-touch{display:none;justify-content:space-between;gap:12px;user-select:none;-webkit-user-select:none}.cgm-touch.on{display:flex}' +
    '.cgm-pad{display:grid;grid-template-columns:repeat(3,56px);grid-template-rows:repeat(2,50px);gap:6px}.cgm-acts{display:flex;gap:8px;align-items:center}' +
    '.cgm-tb{border:2px solid var(--k);border-radius:12px;background:#fff;color:var(--k);font:700 18px system-ui;box-shadow:0 3px 0 var(--k);touch-action:none;min-width:56px;min-height:50px}' +
    '.cgm-tb.big{width:84px;height:84px;border-radius:50%;background:#e8962e;font:800 16px "Baloo 2",sans-serif}' +
    '.cgm-choices{display:flex;flex-direction:column;gap:6px;margin-top:6px}.cgm-choice{text-align:left;font:700 16px "Baloo 2","Trebuchet MS",sans-serif;padding:8px 12px;border:2px solid var(--k);border-radius:10px;background:#ffe3bd;color:var(--k);box-shadow:0 2px 0 var(--k);cursor:pointer}.cgm-choice:hover{background:#ffd08a}.cgm-choice:focus-visible{outline:3px solid #ffbf00}' +
    '.cgm-boss{display:inline-flex;align-items:center;gap:8px;padding:4px 12px;border:2px solid var(--k);border-radius:999px;background:#2d1f3f;color:#fff;font-weight:800;font-size:14px;box-shadow:0 2px 0 var(--k)}.cgm-boss .cgm-bar{width:160px;background:#4a3b55}.cgm-boss .cgm-bar i{background:#ff3b5c}' +
    '.cgm-duel{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(20,26,48,.86);padding:10px}' +
    '.cgm-dp{width:100%;max-width:760px;max-height:100%;overflow:auto;background:#fff8ec;color:var(--k);border:3px solid var(--k);border-radius:18px;box-shadow:0 5px 0 var(--k);padding:12px 14px;display:flex;flex-direction:column;gap:10px}' +
    '.cgm-dh{display:flex;gap:12px;align-items:center}.cgm-dh canvas{width:64px;height:64px;flex:none;border:2px solid var(--k);border-radius:12px;background:#fff}.cgm-dh b{font:800 20px "Baloo 2","Trebuchet MS",sans-serif}' +
    '.cgm-hb{display:flex;align-items:center;gap:6px;font-weight:700;font-size:14px}.cgm-hb .cgm-bar{width:150px}.cgm-intent{margin-left:auto;padding:4px 10px;border:2px solid var(--k);border-radius:10px;background:#ffd6d6;font-weight:800;font-size:14px}.cgm-intent.def{background:#d6e6ff}' +
    '.cgm-dlog{font-size:14px;min-height:20px;text-align:center;font-weight:600}' +
    '.cgm-hand{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}' +
    '.cgm-c{width:112px;min-height:150px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 6px;border:3px solid var(--k);border-radius:14px;box-shadow:0 4px 0 var(--k);cursor:pointer;color:var(--k);font-family:"Lexend",system-ui,sans-serif;transition:transform .1s}' +
    '.cgm-c:hover:not(:disabled){transform:translateY(-6px)}.cgm-c:disabled{opacity:.45;cursor:not-allowed}.cgm-c:focus-visible{outline:3px solid #ffbf00;outline-offset:2px}' +
    '.cgm-c .cn{font:800 15px "Baloo 2",sans-serif}.cgm-c .cv{font:800 34px/1 "Baloo 2",sans-serif}.cgm-c .cd{font-size:11px;text-align:center;line-height:1.2}.cgm-c .cc{align-self:flex-start;font:800 12px "Baloo 2",sans-serif;background:#1d2440;color:#fff;border-radius:999px;padding:0 7px}' +
    '.cgm-c.atk{background:#ffd1cf}.cgm-c.def{background:#d3e4ff}.cgm-c.heal{background:#d2f5e1}.cgm-c.big{background:#ffe0a8}' +
    '.cgm-pf{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.cgm-en{display:flex;gap:4px}.cgm-en i{width:16px;height:16px;border-radius:50%;border:2px solid var(--k);background:#ffd23f}.cgm-en i.off{background:#ddd}' +
    '.cgm.fs{background:#141a30;padding:14px;height:100%;box-sizing:border-box;justify-content:center}.cgm.fs .cgm-stage canvas{max-height:calc(100vh - 130px);width:auto!important}';
  var IC = {
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" fill="#ffd23f" stroke="#1d2440" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5S3 15 3 8.8C3 6.1 5.1 4 7.7 4c1.8 0 3.3 1 4.3 2.5C13 5 14.5 4 16.3 4 18.9 4 21 6.1 21 8.8 21 15 12 20.5 12 20.5z" fill="#ff4d6d" stroke="#1d2440" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9h14l-1.2 11H6.2z" fill="#6fd3a8" stroke="#1d2440" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 9V7a3 3 0 0 1 6 0v2" fill="none" stroke="#1d2440" stroke-width="1.8"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="#bfe1ff" stroke="#1d2440" stroke-width="1.8"/><path d="M12 7.5V12l3 2" fill="none" stroke="#1d2440" stroke-width="1.8" stroke-linecap="round"/></svg>',
    life: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="#ffe3bd" stroke="#1d2440" stroke-width="1.8"/><path d="M8 13l3 3 5-7" fill="none" stroke="#1d2440" stroke-width="2" stroke-linecap="round"/></svg>',
    flag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4h11l-2 4 2 4H6" fill="#9ee6c9" stroke="#1d2440" stroke-width="1.8" stroke-linejoin="round"/></svg>'
  };
  function esc2(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function fmt(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
