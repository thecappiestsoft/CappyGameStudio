/* ================= boot ================= */
var SND = CGM.Sound();
(function boot() {
  var c = document.createElement('canvas'); c.width = c.height = 88; var x = c.getContext('2d'); CGM.drawSprite(x, { type: 'hero', v: 'capy' }, 0, 0, 88, 88, 0, { dir: 1 }); $('#logo').src = mascotURL = c.toDataURL(); var av = $('#appver'); if (av) { av.textContent = 'wersja ' + APP_VERSION; av.title = 'Wydanie z ' + APP_BUILD; }
  $('#view').innerHTML = '<div class="wrap"><p class="muted">Wczytywanie projektów…</p></div>';
  STORE.open().then(function () { return Promise.all([STORE.get('settings'), STORE.get('index'), STORE.get('lib')]); }).then(function (r) {
    if (r[0]) SET = Object.assign(SET, r[0]);
    INDEX = Array.isArray(r[1]) ? r[1] : [];
    if (r[2]) LIB = { profiles: r[2].profiles || [], ucomps: r[2].ucomps || [] };
    applySettings();
    var rt = route();
    if (MODULE_ROUTES[rt] && SET.last && INDEX.some(function (x) { return x.id === SET.last; })) {
      return STORE.get('p:' + SET.last).then(function (p) { if (p) { P = p; P.mechanics = Object.assign(baseMechanics(), P.mechanics || {}); P.prefabs = P.prefabs || []; P.assets = P.assets || {}; P.versions = P.versions || []; CGM.registerAssets(P.assets); SE.sceneId = P.flow.start; GF.scene = P.flow.start; TS.start = P.flow.start; } render(); });
    }
    render();
  });
  window.addEventListener('beforeunload', function () { if (P) { clearTimeout(saveT); STORE.set('p:' + P.id, P); } });
})();
})();
