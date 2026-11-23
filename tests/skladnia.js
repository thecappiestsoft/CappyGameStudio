#!/usr/bin/env node
// Szybki test bez przeglądarki: buduje aplikację i sprawdza składnię silnika oraz aplikacji.
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
execFileSync(process.execPath, [path.join(ROOT, 'build', 'build.js')], { stdio: 'inherit' });
const html = fs.readFileSync(path.join(ROOT, 'dist', 'cappygamestudio.fragment.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let ok = true;
scripts.forEach((code, i) => {
  try { new vm.Script(code, { filename: 'skrypt-' + (i + 1) + '.js' }); }
  catch (e) { ok = false; console.error('Błąd składni w skrypcie ' + (i + 1) + ': ' + e.message); }
});
// Silnik da się uruchomić bez DOM-u: sprawdzamy katalog komponentów.
try {
  const ctx = { console, Math, JSON, Date, setTimeout, clearTimeout };
  vm.createContext(ctx);
  vm.runInContext(scripts[0] + '\nthis.CGM = CGM;', ctx);
  const n = Object.keys(ctx.CGM.COMP).length;
  if (n < 30) { ok = false; console.error('Za mało komponentów w katalogu: ' + n); }
  else console.log('Silnik: ' + n + ' komponentów, ' + Object.keys(ctx.CGM.TYPES).length + ' rodzajów grafik.');
} catch (e) { ok = false; console.error('Silnik nie uruchomił się poza przeglądarką: ' + e.message); }
console.log(ok ? 'OK – składnia poprawna.' : 'BŁĘDY – zobacz wyżej.');
process.exit(ok ? 0 : 1);
