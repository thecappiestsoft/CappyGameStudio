/* ---------------- definitions helpers ---------------- */
function R(defId) { return CGM.resolveDef(P, defId); }
function RI(inst) { return CGM.resolveInst(P, inst); }
function sceneById(id) { return P.scenes.filter(function (s) { return s.id === id; })[0]; }
function curScene() { var s = sceneById(SE.sceneId); if (!s) { s = P.scenes[0]; SE.sceneId = s && s.id; } return s; }
function instById(id) { var s = curScene(); return s ? s.inst.filter(function (i) { return i.id === id; })[0] : null; }
function isOwnComp(def, cuid) { return (def.data.comps || []).some(function (c) { return c.uid === cuid; }); }
function pathComp(path) { var m = /^comps#([^.]+)/.exec(path); return m ? m[1] : null; }
function defGet(defId, path) { return CGM.getP(R(defId), path); }
function defSet(defId, path, val) {
  var d = P.objects[defId]; if (!d) return;
  var cu = pathComp(path);
  if (d.base && !(cu && isOwnComp(d, cu))) { d.local = d.local || {}; d.local[path] = clone(val); }
  else CGM.setP(d.data, path, clone(val));
}
function defIsLocal(defId, path) { var d = P.objects[defId]; return !!(d && d.base && d.local && path in d.local); }
function defReset(defId, path) { var d = P.objects[defId]; if (d && d.local) delete d.local[path]; }
function spriteOf(r) { return r && r.sprite ? r.sprite : { type: 'block', v: 'solid' }; }
var spriteCache = {};
function spriteURL(sp, size, st) {
  size = size || 48;
  var key = [sp.type, sp.v, sp.color || '', sp.img || '', size, st ? JSON.stringify(st) : ''].join('|');
  if (sp.img && P && P.assets[sp.img] && P.assets[sp.img].type === 'image' && !(P.assets[sp.img].sheet)) return P.assets[sp.img].data;
  if (spriteCache[key]) return spriteCache[key];
  var c = document.createElement('canvas'); c.width = c.height = size * 2;
  var x = c.getContext('2d'); x.scale(2, 2);
  CGM.drawSprite(x, sp, size * 0.08, size * 0.08, size * 0.84, size * 0.84, 0, Object.assign({ dir: 1, editor: true }, st || {}));
  var u = c.toDataURL(); if (!sp.img) spriteCache[key] = u; return u;
}
function defIcon(defId, size) { var r = R(defId); return spriteURL(spriteOf(r), size); }
function projectThumb(p) {
  try {
    var sc = p.scenes.filter(function (s) { return s.id === p.flow.start; })[0] || p.scenes[0]; if (!sc) return '';
    var w = 280, s = w / (sc.cols * T), h = Math.round(sc.rows * T * s);
    if (h > 168) { s = 168 / (sc.rows * T); h = 168; w = Math.round(sc.cols * T * s); }
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d'); x.scale(s, s);
    CGM.registerAssets(p.assets);
    CGM.drawBackground(x, sc.bg.theme, sc.cols * T, sc.rows * T, 0, sc.bg.color);
    var save = P; P = p;
    sc.inst.forEach(function (i) { var r = RI(i); if (!r) return; CGM.drawSprite(x, spriteOf(r), i.x * T, i.y * T, (r.size.w || 1) * T, (r.size.h || 1) * T, 0, { dir: i.flip ? -1 : 1 }); });
    P = save;
    return c.toDataURL('image/jpeg', 0.72);
  } catch (e) { return ''; }
}
var CATEGORIES = ['Postać grywalna', 'Przeciwnik', 'Przedmiot', 'Element środowiska', 'Pocisk', 'Obiekt interaktywny', 'Dekoracja', 'UI'];
var LAYERS = [['tlo', 'Tło'], ['swiat', 'Świat'], ['kolizje', 'Kolizje'], ['interakcje', 'Interakcje'], ['efekty', 'Efekty']];
var LAYERNAME = {}; LAYERS.forEach(function (l) { LAYERNAME[l[0]] = l[1]; });
var COLCATS = ['Świat', 'Gracz', 'Przeciwnik', 'Przedmiot', 'Pocisk', 'Interakcja'];
var BODYTYPES = { static: 'Statyczny – nieruchoma przeszkoda lub element', dynamic: 'Dynamiczny – porusza się i reaguje na grawitację', kinematic: 'Kinetyczny – poruszany przez komponent (np. platforma)', none: 'Bez fizyki – tylko grafika' };
