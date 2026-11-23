
/* ================= GENRE PROTOTYPES ================= */
function sceneFromMap2(name, rows, objects, legend) {
  var sc = newScene(name, rows[0].length, rows.length);
  rows.forEach(function (r, y) { for (var x = 0; x < r.length; x++) { var id = (legend && legend[r[x]]) || LEG[r[x]]; if (id && objects[id]) sc.inst.push(newInst(id, x, y, objects)); } });
  return sc;
}
function gridMap(W, H) { var rows = []; for (var y = 0; y < H; y++) rows.push(new Array(W + 1).join('.').split('')); return { rows: rows, put: function (x, y, ch) { if (rows[y] && x >= 0 && x < W) rows[y][x] = ch; }, out: function () { return rows.map(function (r) { return r.join(''); }); } }; }
function setPlayer(objs, comps, extra) { objs.player.data.comps = comps; if (extra) Object.keys(extra).forEach(function (k) { objs.player.data[k] = extra[k]; }); }
function addDef(objs, d) { objs[d.id] = d; return d; }
function compOf(def, type) { return (def.data.comps || []).filter(function (c) { return c.type === type; })[0]; }
function ovDialog(inst, def, p) { var c = compOf(def, 'dialog'); Object.keys(p).forEach(function (k) { inst.ov['comps#' + c.uid + '.p.' + k] = p[k]; }); }
function hudOnly(p, keys) { Object.keys(p.mechanics.hud).forEach(function (k) { p.mechanics.hud[k] = keys.indexOf(k) >= 0; }); }
