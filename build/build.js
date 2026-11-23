#!/usr/bin/env node
/*
 * CappyGameStudio – skrypt budowania (bez zależności, wymaga Node.js 18+).
 * Skleja pliki z src/ w kolejności z build/manifest.json i tworzy:
 *   dist/index.html                     – kompletna strona (otwórz w przeglądarce lub wgraj na serwer)
 *   dist/cappygamestudio.fragment.html  – sama treść strony (bez <html>/<head>), np. do osadzenia
 *   index.html (w katalogu głównym)     – kopia dist/index.html dla GitHub Pages
 * Użycie:  node build/build.js           – jednorazowe budowanie
 *          node build/build.js --watch   – budowanie po każdej zmianie w src/
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function joinParts(list) { return list.map((p, i) => (i === 0 ? '' : p.join) + read(p.file)).join(''); }
// Zastępuje dokładnie jedno wystąpienie znacznika – bez interpretowania znaków $ w treści kodu.
function inject(text, marker, content) {
  const i = text.indexOf(marker);
  if (i < 0) throw new Error('Brak znacznika ' + marker + ' w src/shell.html');
  return text.slice(0, i) + content + text.slice(i + marker.length);
}

function build() {
  const t0 = Date.now();
  const manifest = JSON.parse(read('build/manifest.json'));
  let html = read('src/shell.html');
  html = inject(html, '/*CSS*/', joinParts(manifest.css));
  html = inject(html, '/*ENGINE*/', joinParts(manifest.engine));
  html = inject(html, '/*APP*/', joinParts(manifest.app));
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'cappygamestudio.fragment.html'), html);
  const page = '<!doctype html>\n<html lang="pl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<style>[hidden]{display:none!important}</style>\n</head>\n<body style="margin:0">\n' + html + '\n</body>\n</html>\n';
  fs.writeFileSync(path.join(DIST, 'index.html'), page);
  // Kopia w katalogu głównym repozytorium – z niej korzysta GitHub Pages (dist/ jest w .gitignore).
  fs.writeFileSync(path.join(ROOT, 'index.html'), page);
  const files = manifest.css.length + manifest.engine.length + manifest.app.length + 1;
  console.log('Zbudowano CappyGameStudio ' + manifest.version + ' z ' + files + ' plików → dist/index.html (' + Math.round(page.length / 1024) + ' KB) w ' + (Date.now() - t0) + ' ms');
}

function checkManifest() {
  const manifest = JSON.parse(read('build/manifest.json'));
  const listed = new Set([...manifest.css, ...manifest.engine, ...manifest.app].map(p => p.file));
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  walk(SRC).map(f => path.relative(ROOT, f).split(path.sep).join('/')).filter(f => /\.(js|css)$/.test(f)).forEach(f => {
    if (!listed.has(f)) console.warn('Uwaga: plik ' + f + ' nie jest w build/manifest.json, więc nie trafi do aplikacji.');
  });
}

checkManifest();
build();
if (process.argv.includes('--watch')) {
  let timer = null;
  console.log('Obserwuję src/ … (Ctrl+C – koniec)');
  fs.watch(SRC, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(() => { try { build(); } catch (e) { console.error(e.message); } }, 150); });
  fs.watch(path.join(ROOT, 'build', 'manifest.json'), () => { clearTimeout(timer); timer = setTimeout(() => { try { checkManifest(); build(); } catch (e) { console.error(e.message); } }, 150); });
}
