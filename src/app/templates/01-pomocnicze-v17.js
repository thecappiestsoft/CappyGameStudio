/* ================= NOWE GATUNKI (v1.7) ================= */
function floorUnder(sc, objs, id, skip) {
  var taken = {}; sc.inst.forEach(function (i) { if (skip.indexOf(i.obj) >= 0) taken[i.x + ',' + i.y] = 1; });
  var fl = []; for (var y = 0; y < sc.rows; y++) for (var x = 0; x < sc.cols; x++) if (!taken[x + ',' + y]) fl.push(newInst(id, x, y, objs));
  sc.inst = fl.concat(sc.inst);
}