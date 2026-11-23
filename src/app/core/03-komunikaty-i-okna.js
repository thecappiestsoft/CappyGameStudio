/* ---------------- toasts & modal ---------------- */
function toast(msg, kind) {
  var el = document.createElement('div'); el.className = 'toast ' + (kind || '');
  el.innerHTML = (kind === 'warn' ? I.alert : kind === 'ok' ? I.check : I.info) + '<span>' + esc(msg) + '</span>';
  $('#toasts').appendChild(el); setTimeout(function () { el.remove(); }, 3600);
}
var modalReturn = null;
function openModal(o) {
  modalReturn = document.activeElement;
  var root = $('#modal-root');
  root.innerHTML = '<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt"' + (o.wide ? ' style="max-width:860px"' : '') + '><div class="modal-h"><h2 id="mt">' + esc(o.title) + '</h2><button class="btn sm icon ghost" data-mclose aria-label="Zamknij">' + I.x + '</button></div><div class="modal-b">' + o.body + '</div>' + (o.actions ? '<div class="modal-f"></div>' : '') + '</div></div>';
  var foot = $('.modal-f', root);
  (o.actions || []).forEach(function (a) {
    var b = document.createElement('button'); b.className = 'btn ' + (a.cls || ''); b.innerHTML = (a.icon || '') + esc(a.label);
    b.addEventListener('click', function () { var keep = a.fn && a.fn(root); if (keep !== true) closeModal(); });
    foot.appendChild(b);
  });
  $('[data-mclose]', root).addEventListener('click', closeModal);
  $('.modal-bg', root).addEventListener('mousedown', function (e) { if (e.target.classList.contains('modal-bg')) closeModal(); });
  if (o.onOpen) o.onOpen(root);
  var f = $('[autofocus]', root) || $('.modal-f .btn.pri', root) || $('.modal .btn', root);
  if (f) setTimeout(function () { f.focus(); }, 20);
}
function closeModal() { $('#modal-root').innerHTML = ''; if (modalReturn && modalReturn.focus) { try { modalReturn.focus(); } catch (e) { } } }
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && $('#modal-root').innerHTML) { closeModal(); e.stopPropagation(); }
  if (e.key === 'Tab' && $('#modal-root .modal')) {
    var f = $$('#modal-root button, #modal-root input, #modal-root select, #modal-root textarea, #modal-root summary').filter(function (x) { return !x.disabled && x.offsetParent; });
    if (!f.length) return; var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && document.activeElement === z) { a.focus(); e.preventDefault(); }
  }
}, true);
