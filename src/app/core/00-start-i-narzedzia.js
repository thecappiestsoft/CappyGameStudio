(function () {
'use strict';
var T = CGM.T, TYPES = CGM.TYPES, THEMES = CGM.THEMES, COMP = CGM.COMP;
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function uid(p) { return (p || '') + Math.random().toString(36).slice(2, 9); }
function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function now() { return Date.now(); }
function fmtDate(t) { try { return new Date(t).toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
function plural(n, a, b, c) { if (n === 1) return a; var d = n % 10, t = n % 100; return (d >= 2 && d <= 4 && (t < 12 || t > 14)) ? b : c; }
function slug(s) { var m = { 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' }; return (String(s || 'gra').toLowerCase().replace(/[ąćęłńóśźż]/g, function (c) { return m[c]; }).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'gra').slice(0, 40); }
function kb(n) { return n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1).replace('.', ',') + ' KB' : (n / 1048576).toFixed(2).replace('.', ',') + ' MB'; }
