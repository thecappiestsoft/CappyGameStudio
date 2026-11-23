  /* ---------- definition resolution (bases, variants, instance overrides) ---------- */
  function cloneJ(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
  function parsePath(p) { return p.split('.'); }
  function getP(obj, path) {
    var parts = parsePath(path), cur = obj;
    for (var i = 0; i < parts.length && cur != null; i++) {
      var s = parts[i];
      if (s.indexOf('comps#') === 0) { var uid = s.slice(6); cur = (cur.comps || []).filter(function (c) { return c.uid === uid; })[0]; }
      else cur = cur[s];
    }
    return cur;
  }
  function setP(obj, path, val) {
    var parts = parsePath(path), cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var s = parts[i];
      if (s.indexOf('comps#') === 0) { var uid = s.slice(6); cur = (cur.comps || []).filter(function (c) { return c.uid === uid; })[0]; if (!cur) return false; }
      else { if (cur[s] == null || typeof cur[s] !== 'object') cur[s] = {}; cur = cur[s]; }
    }
    cur[parts[parts.length - 1]] = val; return true;
  }
  function resolveDef(Pj, id, depth) {
    var d = Pj.objects[id]; if (!d) return null;
    depth = depth || 0;
    var r;
    if (d.base && Pj.objects[d.base] && depth < 6) {
      r = resolveDef(Pj, d.base, depth + 1);
      r.comps = r.comps.concat(cloneJ(d.data.comps || []));
      Object.keys(d.local || {}).forEach(function (p) { setP(r, p, cloneJ(d.local[p])); });
    } else r = cloneJ(d.data);
    r.comps = r.comps || []; r.params = r.params || {};
    r.id = id; r.name = d.name; r.category = d.category; r.layer = d.layer;
    return r;
  }
  function resolveInst(Pj, inst) {
    var r = resolveDef(Pj, inst.obj); if (!r) return null;
    Object.keys(inst.ov || {}).forEach(function (p) { setP(r, p, cloneJ(inst.ov[p])); });
    return r;
  }
  function activeComps(r) { return (r.comps || []).filter(function (c) { return c.on !== false && COMP[c.type]; }).sort(function (a, b) { return (b.prio || 2) - (a.prio || 2); }); }
  function hitFor(r, view) {
    if (r.hit) return r.hit;
    var d = TYPES[r.sprite.type] || {};
    if (d.hitTop) return view === 'side' ? d.hitSide : d.hitTop;
    return d.hit || [0, 0, 1, 1];
  }
