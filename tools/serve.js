#!/usr/bin/env node
// Prosty serwer podglądu dist/ (bez zależności). Użycie: node tools/serve.js [port]
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const DIST = path.resolve(__dirname, '..', 'dist'), port = +process.argv[2] || 8080;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
http.createServer((req, res) => {
  const rel = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const file = path.join(DIST, rel);
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Nie znaleziono'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, () => console.log('CappyGameStudio: http://localhost:' + port + '  (Ctrl+C – koniec)'));
