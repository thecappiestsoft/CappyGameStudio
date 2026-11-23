#!/usr/bin/env node
// Test w przeglądarce (Playwright): każdy szablon gry musi przejść Sprawdzacz bez błędów i dać się uruchomić.
// Instalacja jednorazowa: npm install && npx playwright install chromium
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
execFileSync(process.execPath, [path.join(ROOT, 'build', 'build.js')], { stdio: 'inherit' });
const { chromium } = require('playwright');
(async () => {
  const url = 'file://' + path.join(ROOT, 'dist', 'index.html');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url); await page.waitForTimeout(1200);
  const ids = await page.evaluate(() => [...document.querySelectorAll('.tpl[data-t]')].map(b => b.dataset.t).filter(t => t !== 'empty'));
  let failed = 0;
  for (const t of ids) {
    await page.goto(url + '#start'); await page.waitForTimeout(300);
    await page.click('.tpl[data-t=' + t + ']'); await page.click('.modal-f .btn.pri'); await page.waitForTimeout(700);
    const res = await page.evaluate(() => { const L = [...document.querySelectorAll('.diag-list .dg')].map(x => x.innerText.replace(/\s+/g, ' ')); return L; });
    const bad = res.filter(x => /Do naprawy|Uwaga/i.test(x));
    await page.click('[data-act=runScene]'); await page.waitForTimeout(900);
    const start = await page.$('#ts-game .cgm-btn.go'); if (start) await start.click(); await page.waitForTimeout(500);
    const state = await page.evaluate(() => window.__cgsGame && window.__cgsGame() ? window.__cgsGame().rt().state() : '?');
    const ok = !bad.length && state === 'play';
    if (!ok) failed++;
    console.log((ok ? 'OK   ' : 'BŁĄD ') + t.padEnd(14) + (bad.length ? ' ' + bad.join(' | ') : '') + (state !== 'play' ? ' (stan gry: ' + state + ')' : ''));
  }
  await browser.close();
  if (errors.length) { failed++; console.error('Błędy JavaScript na stronie:\n' + errors.join('\n')); }
  console.log(failed ? '\nNieudane: ' + failed : '\nWszystkie szablony działają (' + ids.length + ').');
  process.exit(failed ? 1 : 0);
})();
