/* ================= ASSET MANAGER ================= */
var AS = { sel: null, q: '', type: '' };
var ASSET_LIMITS = { image: 2 * 1024 * 1024, audio: 4 * 1024 * 1024 };
ROUTES.zasoby = function (v) {
  var q = AS.q.toLowerCase();
  var keys = Object.keys(P.assets).filter(function (k) { var a = P.assets[k]; return (!AS.type || a.type === AS.type) && (!q || (a.name + ' ' + (a.tags || []).join(' ')).toLowerCase().indexOf(q) >= 0); });
  var total = Object.keys(P.assets).reduce(function (s, k) { return s + (P.assets[k].size || 0); }, 0);
  v.innerHTML = '<div class="wrap" style="max-width:1200px"><div class="row"><div class="grow"><h1>Twoje obrazki i dźwięki</h1><p class="small muted">' + Object.keys(P.assets).length + ' zasobów · ' + kb(total) + '. Grafiki: PNG, JPG, WebP (do 2 MB). Dźwięki: WAV, OGG, MP3 (do 4 MB).</p></div><button class="btn pri" data-act="asImport">' + I.upload + 'Importuj pliki</button></div>' +
    '<div class="drop" id="as-drop">Przeciągnij tu pliki graficzne lub dźwiękowe</div>' +
    '<div class="row"><label class="vh" for="as-q">Szukaj</label><input class="inp" id="as-q" placeholder="Szukaj po nazwie lub tagu…" value="' + esc(AS.q) + '" style="max-width:320px"><div class="seg" role="group" aria-label="Typ zasobu">' + [['', 'Wszystkie'], ['image', 'Grafiki'], ['audio', 'Dźwięki']].map(function (t) { return '<button data-astype="' + t[0] + '" aria-pressed="' + (AS.type === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div></div>' +
    '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,340px);gap:16px;align-items:start" class="as-split"><div class="assetgrid">' + (keys.length ? keys.map(function (k) { var a = P.assets[k], used = assetUsage(k); return '<button class="acard" data-assel="' + k + '" aria-pressed="' + (AS.sel === k) + '"><div class="pv">' + (a.type === 'image' ? '<img alt="" src="' + a.data + '">' : I.music) + '</div><div class="ab"><b>' + esc(a.name) + '</b><span class="muted">' + (a.type === 'image' ? a.w + '×' + a.h + (a.sheet ? ' · animacja ' + a.sheet.cols + '×' + a.sheet.rows : '') : (a.dur ? a.dur.toFixed(1).replace('.', ',') + ' s' : 'audio')) + ' · ' + kb(a.size) + '</span><span class="' + (used ? '' : 'muted') + '">' + (used ? 'Używany: ' + used : 'Nieużywany') + '</span></div></button>'; }).join('') : '<div class="empty">Nie masz jeszcze własnych plików. To nic – gra używa gotowych obrazków i dźwięków.</div>') + '</div><aside class="sec" id="as-det">' + assetDetail() + '</aside></div></div>';
  var drop = $('#as-drop');
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('on'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('on'); }); });
  drop.addEventListener('drop', function (e) { importAssets(Array.prototype.slice.call(e.dataTransfer.files || [])); });
  $('#as-q').addEventListener('input', function (e) { AS.q = e.target.value; var p = e.target.selectionStart; render(); var n = $('#as-q'); n.focus(); n.setSelectionRange(p, p); });
  v.onclick = function (e) {
    var b;
    if ((b = e.target.closest('[data-astype]'))) { AS.type = b.dataset.astype; render(); return; }
    if ((b = e.target.closest('[data-assel]'))) { AS.sel = b.dataset.assel; $$('[data-assel]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.assel === AS.sel); }); $('#as-det').innerHTML = assetDetail(); animPreview(); return; }
    if ((b = e.target.closest('[data-asdel]'))) { var k = AS.sel, used = assetUsage(k); if (b.dataset.asdel === '1' && used) { $('#as-delbox').innerHTML = '<p class="small"><b>Zasób jest używany ' + used + '×.</b> Obiekty wrócą do grafiki z biblioteki.</p><div class="row"><button class="btn sm danger" data-asdel="2">Usuń mimo to</button></div>'; return; } removeAsset(k); return; }
    if ((b = e.target.closest('[data-asplay]'))) { try { var au = new Audio(P.assets[AS.sel].data); au.volume = SET.volume; au.play().catch(function () { }); } catch (er) { } }
  };
  v.oninput = function (e) {
    var t = e.target, a = P.assets[AS.sel]; if (!a) return;
    if (t.id === 'as-name') { a.name = t.value.slice(0, 40) || 'zasób'; saveProject(); }
    if (t.id === 'as-tags') { a.tags = t.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean); saveProject(); }
  };
  v.onchange = function (e) {
    var t = e.target, a = P.assets[AS.sel]; if (!a) return;
    if (t.id === 'as-sheet') { a.sheet = t.checked ? { cols: 4, rows: 1, fps: 8, anims: { idle: [0, 0], walk: [0, 3], jump: [1, 1] } } : null; }
    if (a.sheet && /^sh-/.test(t.id)) {
      var f = t.id.slice(3), n = Math.max(0, Math.round(+t.value || 0));
      if (f === 'cols' || f === 'rows') a.sheet[f] = clamp(n || 1, 1, 32); else if (f === 'fps') a.sheet.fps = clamp(n || 1, 1, 30);
      else { var p = f.split('-'); a.sheet.anims[p[0]] = a.sheet.anims[p[0]] || [0, 0]; a.sheet.anims[p[0]][p[1] === 'a' ? 0 : 1] = clamp(n, 0, a.sheet.cols * a.sheet.rows - 1); }
    }
    CGM.registerAssets(P.assets); spriteCache = {}; saveProject(); scheduleDiag();
    $('#as-det').innerHTML = assetDetail(); animPreview();
  };
  animPreview();
};
function assetUsage(k) { var n = 0; Object.keys(P.objects).forEach(function (id) { var r = R(id); if (!r) return; if (r.sprite && r.sprite.img === k) n++; (r.comps || []).forEach(function (c) { if (c.p && c.p.sound === k) n++; }); }); return n; }
function assetDetail() {
  var a = P.assets[AS.sel]; if (!a) return '<p class="small muted">Wybierz zasób, aby zobaczyć szczegóły, metadane i ustawienia animacji.</p>';
  var dup = Object.keys(P.assets).filter(function (k) { return k !== AS.sel && P.assets[k].size === a.size && P.assets[k].data === a.data; });
  var h = '<h3>' + (a.type === 'image' ? I.asset : I.music) + 'Szczegóły zasobu</h3><label class="f" for="as-name">Nazwa<input class="inp" id="as-name" maxlength="40" value="' + esc(a.name) + '"></label><label class="f" for="as-tags">Tagi<input class="inp" id="as-tags" value="' + esc((a.tags || []).join(', ')) + '"></label>' +
    '<dl class="kv"><dt>Typ</dt><dd>' + (a.type === 'image' ? 'Obraz' : 'Audio') + ' (' + esc(a.mime) + ')</dd>' + (a.type === 'image' ? '<dt>Wymiary</dt><dd>' + a.w + ' × ' + a.h + ' px</dd>' : '<dt>Długość</dt><dd>' + (a.dur ? a.dur.toFixed(2) + ' s' : '—') + '</dd>') + '<dt>Rozmiar</dt><dd>' + kb(a.size) + '</dd><dt>Użycia</dt><dd>' + assetUsage(AS.sel) + '</dd><dt>ID</dt><dd>' + esc(AS.sel) + '</dd></dl>' +
    (dup.length ? '<div class="dg">' + lvChip('tip') + '<span>Duplikat zasobu „' + esc(P.assets[dup[0]].name) + '”.</span></div>' : '') +
    (a.type === 'image' && (a.w > 1024 || a.h > 1024) ? '<div class="dg">' + lvChip('tip') + '<span>Obraz jest większy niż zalecane 1024 px.</span></div>' : '');
  if (a.type === 'audio') h += '<div><button class="btn sm" data-asplay="1">' + I.play + 'Odtwórz</button></div><p class="xs muted">Dźwięk ustawisz w kroku „Co robią?” → Podnoszenie → Dźwięk.</p>';
  if (a.type === 'image') {
    h += '<label class="sw"><input type="checkbox" id="as-sheet"' + (a.sheet ? ' checked' : '') + '>Sprite sheet (animacja)</label>';
    if (a.sheet) {
      var s = a.sheet, total = s.cols * s.rows;
      h += '<div class="g2" style="grid-template-columns:repeat(3,1fr)"><label class="f" for="sh-cols">Kolumny<input class="inp" type="number" id="sh-cols" min="1" max="32" value="' + s.cols + '"></label><label class="f" for="sh-rows">Wiersze<input class="inp" type="number" id="sh-rows" min="1" max="32" value="' + s.rows + '"></label><label class="f" for="sh-fps">Klatki/s<input class="inp" type="number" id="sh-fps" min="1" max="30" value="' + s.fps + '"></label></div>' +
        '<p class="xs muted">Klatki numerowane od 0 do ' + (total - 1) + '. Przypisz zakresy do stanów obiektu.</p>' +
        ['idle', 'walk', 'jump'].map(function (st) { var r = s.anims[st] || [0, 0]; return '<div class="row" style="flex-wrap:nowrap"><b class="small" style="width:3.5em">' + ({ idle: 'Spoczynek', walk: 'Chód', jump: 'Skok' })[st] + '</b><label class="vh" for="sh-' + st + '-a">Od</label><input class="inp" type="number" id="sh-' + st + '-a" min="0" max="' + (total - 1) + '" value="' + r[0] + '"><span>–</span><label class="vh" for="sh-' + st + '-b">Do</label><input class="inp" type="number" id="sh-' + st + '-b" min="0" max="' + (total - 1) + '" value="' + r[1] + '"></div>'; }).join('') +
        '<div class="row">' + ['idle', 'walk', 'jump'].map(function (st) { return '<canvas class="animpv" data-anim="' + st + '" width="128" height="128" style="width:64px;height:64px;border:2px solid var(--edge);border-radius:8px;background:var(--surface2)" aria-label="Podgląd animacji ' + st + '"></canvas>'; }).join('') + '</div>';
    }
  }
  h += '<div class="soft" id="as-delbox"><div><button class="btn sm danger" data-asdel="1">' + I.trash + 'Usuń zasób</button></div></div>';
  return h;
}
var animRaf = 0;
function animPreview() {
  cancelAnimationFrame(animRaf);
  var cvs = $$('.animpv'); if (!cvs.length) return;
  var t0 = performance.now();
  (function loop(now) {
    if (!document.body.contains(cvs[0])) return;
    cvs.forEach(function (c) { var x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 128, 128); CGM.drawSprite(x, { type: 'hero', img: AS.sel }, 8, 8, 112, 112, (now - t0) / 1000, { anim: c.dataset.anim, dir: 1 }); });
    animRaf = requestAnimationFrame(loop);
  })(t0);
}
ACT.asImport = function () { pickFile('image/png,image/jpeg,image/webp,audio/wav,audio/x-wav,audio/ogg,audio/mpeg,.wav,.ogg,.mp3', true, importAssets); };
function importAssets(files) {
  files.forEach(function (f) {
    var type = /^image\/(png|jpeg|webp)$/.test(f.type) ? 'image' : (/^audio\//.test(f.type) || /\.(wav|ogg|mp3)$/i.test(f.name)) ? 'audio' : null;
    if (!type) { toast('„' + f.name + '”: nieobsługiwany format. Grafiki: PNG, JPG, WebP; dźwięki: WAV, OGG, MP3.', 'warn'); return; }
    if (f.size > ASSET_LIMITS[type]) { toast('„' + f.name + '” jest za duży (limit ' + kb(ASSET_LIMITS[type]) + ').', 'warn'); return; }
    var r = new FileReader();
    r.onload = function () {
      var data = r.result, id = uid('as'), a = { name: f.name.replace(/\.[^.]+$/, '').slice(0, 40), type: type, mime: f.type || 'audio', size: f.size, data: data, tags: [], added: now() };
      var finish = function () { P.assets[id] = a; CGM.registerAssets(P.assets); AS.sel = id; saveProject(); scheduleDiag(); if (route() === 'zasoby') render(); toast('Zaimportowano: ' + a.name, 'ok'); };
      if (type === 'image') { var im = new Image(); im.onload = function () { a.w = im.naturalWidth; a.h = im.naturalHeight; finish(); }; im.onerror = function () { toast('Nie udało się odczytać obrazu „' + f.name + '”.', 'warn'); }; im.src = data; }
      else { var au = new Audio(); au.onloadedmetadata = function () { a.dur = isFinite(au.duration) ? au.duration : 0; finish(); }; au.onerror = function () { a.dur = 0; finish(); }; au.src = data; }
    };
    r.readAsDataURL(f);
  });
}
function removeAsset(k) {
  pushUndo();
  Object.keys(P.objects).forEach(function (id) { var d = P.objects[id]; if (d.data.sprite && d.data.sprite.img === k) delete d.data.sprite.img; if (d.local && d.local['sprite.img'] === k) delete d.local['sprite.img']; (d.data.comps || []).forEach(function (c) { if (c.p && c.p.sound === k) c.p.sound = 'collect'; }); });
  delete P.assets[k]; AS.sel = null; spriteCache = {}; touched(); render(); toast('Zasób usunięty.');
}
