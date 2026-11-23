/* ---------------- files ---------------- */
var dlCap;
function getDownloads() {
  if (dlCap !== undefined) return Promise.resolve(dlCap);
  if (!(window.claude && typeof window.claude.use === 'function')) { dlCap = null; return Promise.resolve(null); }
  return window.claude.use('downloads').then(function (d) { dlCap = d || null; return dlCap; }, function () { dlCap = null; return null; });
}
function saveFile(name, text, mime) {
  return getDownloads().then(function (d) {
    if (d) return d.save({ filename: name, data: text }).then(function () { toast('Plik gotowy: ' + name, 'ok'); return true; }, function (e) { if (e && e.code === 'declined') toast('Zapis pliku anulowany.'); else toast('Nie udało się zapisać pliku.', 'warn'); return false; });
    try { var blob = new Blob([text], { type: mime }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast('Pobieranie: ' + name, 'ok'); return true; } catch (e) { toast('Ta przeglądarka nie pozwala zapisać pliku.', 'warn'); return false; }
  });
}
function pickFile(accept, multiple, cb) {
  var i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.multiple = !!multiple; i.style.display = 'none';
  i.addEventListener('change', function () { cb(Array.prototype.slice.call(i.files)); i.remove(); });
  document.body.appendChild(i); i.click();
}
