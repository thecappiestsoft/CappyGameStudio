/* ---------------- storage (IndexedDB with fallbacks) ---------------- */
var STORE = (function () {
  var db = null, mem = {}, mode = 'mem';
  function open() {
    return new Promise(function (res) {
      try {
        var r = indexedDB.open('cappygamestudio', 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
        r.onsuccess = function () { db = r.result; mode = 'idb'; res(); };
        r.onerror = function () { tryLS(); res(); };
        r.onblocked = function () { tryLS(); res(); };
      } catch (e) { tryLS(); res(); }
    });
  }
  function tryLS() { try { localStorage.setItem('cgs-test', '1'); localStorage.removeItem('cgs-test'); mode = 'ls'; } catch (e) { mode = 'mem'; } }
  function get(k) {
    if (mode === 'idb') return new Promise(function (res) { try { var q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = function () { res(q.result == null ? null : q.result); }; q.onerror = function () { res(null); }; } catch (e) { res(null); } });
    if (mode === 'ls') { try { var v = localStorage.getItem('cgs:' + k); return Promise.resolve(v ? JSON.parse(v) : null); } catch (e) { return Promise.resolve(null); } }
    return Promise.resolve(mem[k] == null ? null : clone(mem[k]));
  }
  function set(k, v) {
    if (mode === 'idb') return new Promise(function (res) { try { var tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = function () { res(true); }; tx.onerror = function () { res(false); }; } catch (e) { res(false); } });
    if (mode === 'ls') { try { localStorage.setItem('cgs:' + k, JSON.stringify(v)); return Promise.resolve(true); } catch (e) { return Promise.resolve(false); } }
    mem[k] = clone(v); return Promise.resolve(true);
  }
  function del(k) {
    if (mode === 'idb') return new Promise(function (res) { try { var tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').delete(k); tx.oncomplete = function () { res(true); }; } catch (e) { res(false); } });
    if (mode === 'ls') { try { localStorage.removeItem('cgs:' + k); } catch (e) { } return Promise.resolve(true); }
    delete mem[k]; return Promise.resolve(true);
  }
  return { open: open, get: get, set: set, del: del, mode: function () { return mode; } };
})();

var SET = { theme: 'system', palette: 'sad', scale: 100, rm: false, sound: true, volume: 0.6, last: null, diagOpen: false, leftw: 270, rightw: 330 };
var INDEX = [];            // [{id,name,version,updated,author,thumb}]
var LIB = { profiles: [], ucomps: [] };
var P = null;              // current project
var saveT = 0, lastBackup = 0;
function saveSettings() { STORE.set('settings', SET); }
function saveLib() { STORE.set('lib', LIB); }
function saveProject(immediate) {
  if (!P) return;
  clearTimeout(saveT);
  var run = function () {
    P.meta.updated = now();
    STORE.set('p:' + P.id, P).then(function (ok) { setSaved(ok); });
    var row = { id: P.id, name: P.meta.name, version: P.meta.version, updated: P.meta.updated, author: P.meta.author, thumb: projectThumb(P) };
    INDEX = INDEX.filter(function (r) { return r.id !== P.id; }); INDEX.unshift(row);
    STORE.set('index', INDEX);
    if (now() - lastBackup > 5 * 60 * 1000) { lastBackup = now(); backup('Automatyczna kopia'); }
  };
  if (immediate) run(); else saveT = setTimeout(run, 700);
}
function setSaved(ok) { var s = $('#savedst'); if (s) s.innerHTML = ok ? I.check + '<span>Zapisano ' + new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) + '</span>' : I.alert + '<span>Nie zapisano</span>'; }
function backup(label) {
  P.versions = P.versions || [];
  var snap = coreSnap();
  P.versions.push({ id: uid('v'), at: now(), label: label, data: snap });
  var autos = P.versions.filter(function (v) { return v.label === 'Automatyczna kopia'; });
  if (autos.length > 8) P.versions.splice(P.versions.indexOf(autos[0]), 1);
  if (P.versions.length > 20) P.versions.shift();
}
function coreSnap() { return JSON.stringify({ meta: P.meta, settings: P.settings, objects: P.objects, scenes: P.scenes, flow: P.flow, mechanics: P.mechanics, prefabs: P.prefabs, cards: P.cards, decks: P.decks }); }
function restoreCore(s) { var d = JSON.parse(s); ['meta', 'settings', 'objects', 'scenes', 'flow', 'mechanics', 'prefabs', 'cards', 'decks'].forEach(function (k) { if (d[k] !== undefined) P[k] = d[k]; }); }

/* undo/redo */
var UNDO = [], REDO = [], lastTag = '', lastAt = 0;
function pushUndo(tag) {
  var t = now(); if (tag && tag === lastTag && t - lastAt < 1200) { lastAt = t; return; }
  lastTag = tag || ''; lastAt = t; UNDO.push(coreSnap()); if (UNDO.length > 100) UNDO.shift(); REDO = []; updTop();
}
function touched(opt) { saveProject(); scheduleDiag(); if (!(opt && opt.quiet)) updTop(); }
function mut(fn, tag) { pushUndo(tag); fn(); touched(); }
function undo() { if (!UNDO.length) return; REDO.push(coreSnap()); restoreCore(UNDO.pop()); lastTag = ''; afterHistory(); toast('Cofnięto zmianę.'); }
function redo() { if (!REDO.length) return; UNDO.push(coreSnap()); restoreCore(REDO.pop()); lastTag = ''; afterHistory(); toast('Ponowiono zmianę.'); }
function afterHistory() { SE.sel = SE.sel.filter(function (id) { return instById(id); }); touched(); render(); }
