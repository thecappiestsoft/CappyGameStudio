/* ================= EKSPORT NA PLATFORMY (PWA, komputer, telefon) ================= */
var CRC_T = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u) { var c = 0xFFFFFFFF; for (var i = 0; i < u.length; i++) c = CRC_T[(c ^ u[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function makeZip(files) {
  var enc = new TextEncoder(), parts = [], central = [], off = 0, d = new Date();
  var dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF, dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
  files.forEach(function (f) {
    var name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(data);
    var h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, dt, true); h.setUint16(12, dd, true);
    h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    var c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, dt, true); c.setUint16(14, dd, true);
    c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true);
    central.push(new Uint8Array(c.buffer), name);
    off += 30 + name.length + data.length;
  });
  var csize = central.reduce(function (s, u) { return s + u.length; }, 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csize, true); e.setUint32(16, off, true);
  return new Blob(parts.concat(central, [new Uint8Array(e.buffer)]), { type: 'application/zip' });
}
function iconPNG(size) {
  var cv = document.createElement('canvas'); cv.width = cv.height = size; var c = cv.getContext('2d');
  var g = c.createLinearGradient(0, 0, size, size); g.addColorStop(0, '#ffd08a'); g.addColorStop(1, '#ff9f1c');
  c.fillStyle = g; c.beginPath(); if (c.roundRect) c.roundRect(0, 0, size, size, size * 0.22); else c.rect(0, 0, size, size); c.fill();
  var pl = Object.keys(P.objects).map(function (k) { return R(k); }).filter(function (r) { return r && CGM.activeComps(r).some(function (cp) { return COMP[cp.type] && COMP[cp.type].player; }); })[0];
  CGM.drawSprite(c, (pl && pl.sprite) || { type: 'hero', v: 'capy' }, size * 0.14, size * 0.14, size * 0.72, size * 0.72, 0, { dir: 1 });
  var b64 = cv.toDataURL('image/png').split(',')[1], bin = atob(b64), u = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
function semver(v) { var m = String(v || '').match(/\d+/g) || []; return [m[0] || 1, m[1] || 0, m[2] || 0].map(Number).join('.'); }
function appId(s) { return 'pl.cappysoft.gry.' + (slug(s).replace(/-/g, '').replace(/^(\d)/, 'g$1') || 'gra'); }
function pwaFiles(touch) {
  var name = P.meta.name, sl = slug(name), portrait = P.settings.viewH > P.settings.viewW;
  var html = gameHTML({ touch: touch || (P.export || {}).touch || 'auto' }).html
    .replace('<meta name="viewport" content="width=device-width,initial-scale=1">', '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">')
    .replace('</head>', '<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#1f1a2e"><link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-192.png"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"></head>')
    .replace('</body>', '<script>if("serviceWorker" in navigator&&location.protocol!=="file:")navigator.serviceWorker.register("sw.js").catch(function(){});<\/script></body>');
  var man = { name: name, short_name: name.slice(0, 12), description: P.meta.desc || ('Gra stworzona w CappyGameStudio'), start_url: './index.html', scope: './', display: 'fullscreen', orientation: portrait ? 'portrait' : 'landscape', background_color: '#1f1a2e', theme_color: '#1f1a2e', lang: 'pl', icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }] };
  var sw = "var C='" + sl + "-" + semver(P.meta.version) + "-" + Date.now().toString(36) + "';\nself.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png']);}));self.skipWaiting();});\nself.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C;}).map(function(x){return caches.delete(x);}));}));});\nself.addEventListener('fetch',function(e){e.respondWith(caches.match(e.request).then(function(r){return r||fetch(e.request);}));});\n";
  return { html: html, manifest: JSON.stringify(man, null, 2), sw: sw, i192: iconPNG(192), i512: iconPNG(512) };
}
var README_HEAD = function (title) { return title + '\n' + new Array(title.length + 1).join('=') + '\nGra: ' + P.meta.name + ' (wersja ' + P.meta.version + ')\nPrzygotowano w CappyGameStudio · © 2026 CappySoft.pl\n\n'; };
ACT.exPwa = function () {
  var f = pwaFiles('auto'), sl = slug(P.meta.name);
  var rd = README_HEAD('Gra do zainstalowania (PWA)') +
    'Ta paczka to gra, którą można ZAINSTALOWAĆ jak aplikację – na telefonie z Androidem,\nna iPhonie/iPadzie oraz na komputerze z Windows, macOS, Linux i ChromeOS.\nPo pierwszym uruchomieniu działa także bez internetu.\n\n' +
    'JAK TO ZROBIĆ (najlepiej razem z nauczycielem lub rodzicem):\n' +
    '1. Rozpakuj ten plik ZIP.\n2. Wgraj CAŁY folder na stronę z adresem https:// – np. szkolny serwer, GitHub Pages albo Netlify Drop\n   (na Netlify Drop wystarczy przeciągnąć folder na stronę).\n3. Otwórz adres gry w przeglądarce:\n   - Android (Chrome): menu ⋮ → „Zainstaluj aplikację” / „Dodaj do ekranu głównego”.\n   - iPhone/iPad (Safari): przycisk Udostępnij → „Do ekranu początkowego”.\n   - Komputer (Chrome/Edge): ikonka instalacji na pasku adresu.\n\n' +
    'Uwaga: otwarcie pliku index.html prosto z dysku też uruchomi grę, ale instalacja\ni tryb offline działają dopiero ze strony https://.\n\n' +
    'CHCESZ PLIK APK DO SKLEPU GOOGLE PLAY? Gdy gra jest już na stronie https://, wpisz jej adres\nna stronie pwabuilder.com i wybierz „Android” – dostaniesz gotową paczkę.\nPamiętaj: publikowanie w sklepach wymaga konta dorosłej osoby.\n';
  saveFile(sl + '-aplikacja-pwa.zip', makeZip([{ name: sl + '/index.html', data: f.html }, { name: sl + '/manifest.webmanifest', data: f.manifest }, { name: sl + '/sw.js', data: f.sw }, { name: sl + '/icon-192.png', data: f.i192 }, { name: sl + '/icon-512.png', data: f.i512 }, { name: sl + '/CZYTAJ_MNIE.txt', data: rd }]), 'application/zip');
};
ACT.exDesktop = function () {
  var f = pwaFiles(P.export && P.export.touch === 'on' ? 'on' : 'off'), sl = slug(P.meta.name), name = P.meta.name, W = P.settings.viewW * T, H = P.settings.viewH * T;
  var pkg = { name: sl, productName: name, version: semver(P.meta.version), description: P.meta.desc || 'Gra stworzona w CappyGameStudio', author: P.meta.author || 'Autor gry', license: 'UNLICENSED', private: true, main: 'main.js',
    scripts: { start: 'electron .', 'dist:win': 'electron-builder --win --publish never', 'dist:mac': 'electron-builder --mac --publish never', 'dist:linux': 'electron-builder --linux --publish never' },
    devDependencies: { electron: '^33.0.0', 'electron-builder': '^25.1.8' },
    build: { appId: appId(name), productName: name, artifactName: '${name}-${version}-${os}-${arch}.${ext}', files: ['main.js', 'game/**'], directories: { output: 'dist' }, publish: [], win: { target: ['nsis', 'portable'], icon: 'game/icon-512.png' }, mac: { target: 'dmg', icon: 'game/icon-512.png', category: 'public.app-category.games' }, linux: { target: ['AppImage', 'deb'], icon: 'game/icon-512.png', category: 'Game' }, nsis: { oneClick: false, allowToChangeInstallationDirectory: true } } };
  var main = "// Okno gry – CappyGameStudio\nconst { app, BrowserWindow, Menu, shell } = require('electron');\nconst path = require('path');\nfunction createWindow() {\n  const win = new BrowserWindow({\n    width: " + (W + 60) + ", height: " + (H + 170) + ", minWidth: 480, minHeight: 360,\n    title: " + JSON.stringify(name) + ", backgroundColor: '#1f1a2e', autoHideMenuBar: true,\n    icon: path.join(__dirname, 'game', 'icon-512.png'),\n    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false }\n  });\n  win.loadFile(path.join(__dirname, 'game', 'index.html'));\n  // linki zewnętrzne otwieramy w przeglądarce, nie w oknie gry\n  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });\n  win.webContents.on('will-navigate', (e) => e.preventDefault());\n  // F11 – pełny ekran\n  win.webContents.on('before-input-event', (e, input) => { if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); } });\n}\nMenu.setApplicationMenu(null);\napp.whenReady().then(createWindow);\napp.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });\napp.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });\n";
  var rd = README_HEAD('Gra na komputer: Windows, macOS, Linux') +
    'Ta paczka to projekt programu (Electron). Z niego powstaje prawdziwy plik instalacyjny gry:\n  Windows – instalator .exe oraz wersja „portable” bez instalacji,\n  macOS   – plik .dmg,\n  Linux   – plik .AppImage i pakiet .deb.\n\n' +
    'CZEGO POTRZEBUJESZ (to zadanie dla nauczyciela lub rodzica):\n  – komputer z internetem,\n  – Node.js w wersji 20 lub nowszej (https://nodejs.org).\n\n' +
    'KROKI:\n1. Rozpakuj ZIP i otwórz terminal (wiersz poleceń) w folderze „' + sl + '-komputer”.\n2. Wpisz:  npm install            (jednorazowo, pobiera narzędzia)\n3. Sprawdź grę w oknie:  npm start\n4. Zbuduj plik do rozdania:\n     Windows:  npm run dist:win\n     macOS:    npm run dist:mac\n     Linux:    npm run dist:linux\n5. Gotowe pliki znajdziesz w folderze „dist”.\n\n' +
    'WSKAZÓWKI\n  – Najprościej budować wersję dla systemu, na którym pracujesz (wersję dla macOS da się zbudować tylko na Macu).\n  – Program nie jest podpisany certyfikatem, więc Windows (SmartScreen) lub macOS mogą zapytać,\n    czy na pewno uruchomić grę. To normalne dla gier szkolnych – wybierz „Uruchom mimo to” / „Otwórz”.\n  – Grę zmieniasz w CappyGameStudio, eksportujesz paczkę ponownie i powtarzasz kroki 2–4.\n';
  var root = sl + '-komputer/';
  saveFile(sl + '-komputer-windows-mac-linux.zip', makeZip([{ name: root + 'package.json', data: JSON.stringify(pkg, null, 2) }, { name: root + 'main.js', data: main }, { name: root + 'game/index.html', data: f.html }, { name: root + 'game/icon-512.png', data: f.i512 }, { name: root + 'game/icon-192.png', data: f.i192 }, { name: root + 'CZYTAJ_MNIE.txt', data: rd }]), 'application/zip');
};
ACT.exMobile = function () {
  var f = pwaFiles('on'), sl = slug(P.meta.name), name = P.meta.name, portrait = P.settings.viewH > P.settings.viewW;
  var pkg = { name: sl, version: semver(P.meta.version), private: true, description: P.meta.desc || 'Gra stworzona w CappyGameStudio', scripts: { 'android': 'npx cap add android && npx cap sync android && npx cap open android', 'ios': 'npx cap add ios && npx cap sync ios && npx cap open ios', sync: 'npx cap sync' },
    dependencies: { '@capacitor/core': '^6.1.2', '@capacitor/android': '^6.1.2', '@capacitor/ios': '^6.1.2', '@capacitor/screen-orientation': '^6.0.0' }, devDependencies: { '@capacitor/cli': '^6.1.2' } };
  var cfg = { appId: appId(name), appName: name, webDir: 'www', backgroundColor: '#1f1a2e', android: { allowMixedContent: false }, server: { androidScheme: 'https' } };
  var html = f.html.replace('</body>', '<script>(function(){try{var so=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.ScreenOrientation;if(so)so.lock({orientation:"' + (portrait ? 'portrait' : 'landscape') + '"});}catch(e){}})();<\/script></body>');
  var rd = README_HEAD('Gra na telefon i tablet: Android (APK) i iOS') +
    'Ta paczka to projekt aplikacji mobilnej (Capacitor). Gra ma włączone przyciski dotykowe\ni ' + (portrait ? 'pionowy' : 'poziomy') + ' układ ekranu.\n\n' +
    'CZEGO POTRZEBUJESZ (to zadanie dla nauczyciela lub rodzica):\n  – Node.js 20 lub nowszy (https://nodejs.org),\n  – Android Studio (https://developer.android.com/studio) – dla Androida,\n  – Mac z programem Xcode – tylko dla iPhone/iPad.\n\n' +
    'ANDROID – PLIK APK\n1. Rozpakuj ZIP i otwórz terminal w folderze „' + sl + '-telefon”.\n2. Wpisz:  npm install\n3. Wpisz:  npm run android        (doda projekt Androida i otworzy Android Studio)\n4. W Android Studio: menu Build → Build App Bundle(s) / APK(s) → Build APK(s).\n5. Plik APK pojawi się w folderze android/app/build/outputs/apk/debug.\n   Możesz go przesłać na telefon i zainstalować (telefon zapyta o zgodę na instalację z nieznanego źródła).\n\n' +
    'iOS (tylko na Macu)\n  npm install, potem  npm run ios  – otworzy się Xcode. Do instalacji na iPhonie potrzebne jest konto Apple.\n\n' +
    'BEZ ANDROID STUDIO? Skorzystaj z eksportu „Gra do zainstalowania (PWA)” – działa na telefonach bez budowania.\n\n' +
    'Publikacja w Google Play lub App Store wymaga konta dorosłej osoby i podpisania aplikacji.\n';
  var root = sl + '-telefon/';
  saveFile(sl + '-telefon-android-ios.zip', makeZip([{ name: root + 'package.json', data: JSON.stringify(pkg, null, 2) }, { name: root + 'capacitor.config.json', data: JSON.stringify(cfg, null, 2) }, { name: root + 'www/index.html', data: html }, { name: root + 'www/manifest.webmanifest', data: f.manifest }, { name: root + 'www/icon-192.png', data: f.i192 }, { name: root + 'www/icon-512.png', data: f.i512 }, { name: root + 'resources/icon.png', data: f.i512 }, { name: root + 'CZYTAJ_MNIE.txt', data: rd }]), 'application/zip');
};
function platformSection() {
  function card(act, icon, title, chips, txt, note) { return '<div class="sec" style="padding:14px;display:flex;flex-direction:column;gap:8px;box-shadow:none"><h4 style="margin:0;display:flex;gap:8px;align-items:center">' + icon.replace('<svg ', '<svg width="24" height="24" style="flex:none" ') + title + '</h4><div class="row" style="gap:4px">' + chips.map(function (c) { return '<span class="chip">' + c + '</span>'; }).join('') + '</div><p class="small" style="margin:0">' + txt + '</p><p class="xs muted" style="margin:0">' + note + '</p><button class="btn' + (act === 'exPwa' ? ' acc' : '') + '" data-act="' + act + '" style="margin-top:auto">' + I.download + 'Pobierz paczkę (.zip)</button></div>'; }
  return '<section class="sec"><h3>' + I.package + 'Gra na komputer i telefon</h3><p class="small muted" style="margin:0 0 10px">Każda paczka zawiera instrukcję CZYTAJ_MNIE.txt krok po kroku. Ikona aplikacji powstaje z wyglądu twojego bohatera.</p><div class="g2" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">' +
    card('exPwa', I.play, 'Aplikacja do zainstalowania', ['Android', 'iPhone/iPad', 'Windows', 'macOS', 'Linux'], 'Najprostsza droga: wgraj folder na stronę https://, otwórz w przeglądarce i kliknij „Zainstaluj”. Działa też bez internetu.', 'Nie trzeba niczego budować. Z gotowej strony zrobisz też APK w serwisie PWABuilder.') +
    card('exDesktop', I.save, 'Gra na komputer', ['Windows .exe', 'macOS .dmg', 'Linux .AppImage'], 'Projekt programu (Electron), z którego powstaje instalator gry z własną ikoną i oknem.', 'Budowanie: Node.js i jedno polecenie – zadanie dla nauczyciela lub rodzica.') +
    card('exMobile', I.upload, 'Gra na telefon', ['Android .apk', 'iOS'], 'Projekt aplikacji mobilnej (Capacitor) z przyciskami dotykowymi i zablokowanym obrotem ekranu.', 'Budowanie: Android Studio (APK) albo Mac z Xcode (iOS) – z pomocą dorosłego.') +
    '</div></section>';
}
