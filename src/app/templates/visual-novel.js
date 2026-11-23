function exampleVN(objs, p) {
  setPlayer(objs, [comp('topdown')]);
  addDef(objs, defn('narrator', 'Narrator', 'Obiekt interaktywny', { type: 'block', v: 'solid' }, clone(BODY.none), [comp('dialog', { trigger: 'start', lines: 'Tu wpisz kwestie.' })], { layer: 'efekty', desc: 'Niewidzialny w grze. Rozpoczyna rozmowę od razu po wejściu na planszę.' }));
  [['vncappy', 'Cappy', 'capy'], ['vnrobo', 'Robo', 'robot'], ['vnlis', 'Lisek', 'fox']].forEach(function (c) {
    var d = addDef(objs, defn(c[0], c[1], 'Postać grywalna', { type: 'npc', v: c[2] }, clone(BODY.none), [], { desc: 'Postać do opowieści – duża, bez ruchu.' }));
    d.category = 'Dekoracja'; d.data.size = { w: 4, h: 4 }; d.layer = 'swiat';
  });
  addDef(objs, defn('books', 'Książki', 'Dekoracja', { type: 'deco', v: 'books' }, clone(BODY.none), [], { layer: 'tlo' }));
  addDef(objs, defn('column', 'Kolumna', 'Dekoracja', { type: 'deco', v: 'column' }, clone(BODY.none), [], { layer: 'tlo' }));
  addDef(objs, defn('chestd', 'Skrzynia skarbu', 'Dekoracja', { type: 'goal', v: 'chest' }, clone(BODY.none), [], { layer: 'swiat' })).data.size = { w: 2, h: 2 };
  function sc(name, theme, chars, dlg, decos) {
    var s = newScene(name, 20, 12); s.bg.theme = theme; s.complete = { mode: 'all', conds: [], next: 'next', count: 1 };
    chars.forEach(function (c) { s.inst.push(newInst(c[0], c[1], 7, objs)); });
    (decos || []).forEach(function (d) { s.inst.push(newInst(d[0], d[1], d[2], objs)); });
    var n = newInst('narrator', 0, 0, objs); s.inst.push(n); s.dlgInst = n; s.dlg = dlg; return s;
  }
  var s1 = sc('Pierwszy dzień', 'szkola', [['vncappy', 2], ['vnrobo', 14]], { lines: 'Cappy: Cześć! To mój pierwszy dzień w nowej szkole.\nRobo: Hej, jestem Robo! Oprowadzę cię.\nRobo: Dokąd idziemy najpierw?' }, [['books', 9, 10]]);
  var s2 = sc('Biblioteka', 'historia', [['vncappy', 2], ['vnlis', 14]], { lines: 'Lisek: Psst! Znalazłam w tej książce starą mapę.\nLisek: Pokazuje skarb ukryty pod szkołą!\nCappy: Naprawdę? Co robimy?' }, [['books', 9, 10], ['column', 8, 9], ['column', 11, 9]]);
  var s3 = sc('Boisko', 'przyroda', [['vncappy', 2], ['vnrobo', 14]], { lines: 'Robo: Gramy w piłkę! Brakuje nam bramkarza.\n[Mapa] Cappy: (Na mapie Liska skrzynia jest zaraz pod boiskiem…)\n[!Mapa] Robo: Podobno pod szkołą jest stara piwnica. Ciekawe, co tam jest?\nRobo: To jak, pomożesz?' }, [['tree', 9, 9], ['flower', 10, 11]]);
  var s4 = sc('Stara piwnica', 'fantastyka', [['vncappy', 1], ['vnlis', 7], ['vnrobo', 14]], { lines: 'Lisek: Zeszliśmy do starej piwnicy. Ciemno tu!\n[Mapa] Lisek: Według mapy skrzynia stoi tuż przed nami.\n[!Mapa] Robo: Bez mapy trudno tu cokolwiek znaleźć…\n[Odwaga>=2] Cappy: Nie boję się ciemności. Dzisiaj już tyle odważnych rzeczy zrobiłam!' }, [['chestd', 11, 9]]);
  var s5 = sc('Koniec dnia', 'szkola', [['vncappy', 2]], { lines: 'Narrator: Dzwonek! Pierwszy dzień szkoły dobiega końca.\nNarrator: Cappy myśli o tym, co dziś przeżyła…' }, [['books', 9, 10]]);
  var s6 = sc('Rozstaje', 'szkola', [['vncappy', 2]], { lines: '' });
  var e1 = sc('Zakończenie: Paczka przyjaciół', 'przyroda', [['vncappy', 1], ['vnlis', 7], ['vnrobo', 14]], { lines: 'Robo: Jutro siadamy razem?\nLisek: Jasne! Jesteśmy teraz paczką.\nNarrator: Przyjaźń: {Przyjaźń}, Odwaga: {Odwaga}. Najlepszy skarb to przyjaciele!' }, [['tree', 9, 9]]);
  var e2 = sc('Zakończenie: Odważna odkrywczyni', 'fantastyka', [['vncappy', 2]], { lines: 'Narrator: Cała szkoła mówi o odważnej Cappy.\nNarrator: Odwaga: {Odwaga}. Może jutro czeka kolejna przygoda?' }, [['chestd', 11, 9]]);
  var e3 = sc('Zakończenie: Spokojny dzień', 'szkola', [['vncappy', 2]], { lines: 'Narrator: Był to spokojny, zwyczajny dzień.\nNarrator: Zagraj jeszcze raz i podejmij inne decyzje – zobaczysz inne zakończenie!' }, [['books', 9, 10]]);
  s1.dlg.choiceA = 'Do biblioteki'; s1.dlg.sceneA = s2.id; s1.dlg.setA = 'Przyjaźń';
  s1.dlg.choiceB = 'Na boisko!'; s1.dlg.sceneB = s3.id; s1.dlg.setB = 'Odwaga';
  s2.dlg.choiceA = 'Pomogę ci odczytać mapę'; s2.dlg.sceneA = s3.id; s2.dlg.setA = 'Przyjaźń, Mapa=1';
  s2.dlg.choiceB = 'Wolę poczytać w ciszy'; s2.dlg.sceneB = s3.id;
  s3.dlg.choiceA = 'Staję na bramce!'; s3.dlg.sceneA = s4.id; s3.dlg.setA = 'Odwaga';
  s3.dlg.choiceB = 'Wolę kibicować i nosić wodę'; s3.dlg.sceneB = s4.id; s3.dlg.setB = 'Przyjaźń';
  s4.dlg.choiceA = 'Otwórzmy skrzynię razem'; s4.dlg.sceneA = s5.id; s4.dlg.setA = 'Przyjaźń, punkty+10'; s4.dlg.needA = 'Mapa';
  s4.dlg.choiceB = 'Idę pierwsza w ciemność!'; s4.dlg.sceneB = s5.id; s4.dlg.setB = 'Odwaga, punkty+10'; s4.dlg.needB = 'Odwaga>=2';
  s4.dlg.choiceC = 'Wracamy na górę'; s4.dlg.sceneC = s5.id;
  s5.dlg.endIf = 'Przyjaźń>=2'; s5.dlg.endYes = e1.id; s5.dlg.endNo = s6.id;
  s6.dlg.endIf = 'Odwaga>=2'; s6.dlg.endYes = e2.id; s6.dlg.endNo = e3.id;
  [e1, e2, e3].forEach(function (e) { e.dlg.choiceA = 'Koniec opowieści'; e.dlg.sceneA = '__win'; });
  var all = [s1, s2, s3, s4, s5, s6, e1, e2, e3];
  all.forEach(function (s) { ovDialog(s.dlgInst, objs.narrator, s.dlg); delete s.dlgInst; delete s.dlg; });
  hudOnly(p, ['scene']); p.mechanics.hud.memory = true; p.mechanics.hud.score = true;
  p.flow.subtitle = 'Opowieść z wyborami. Gra zapamiętuje twoje decyzje (Przyjaźń, Odwaga, Mapa) – od nich zależy zakończenie!';
  p.flow.winMsg = 'Koniec opowieści! Zagraj jeszcze raz i wybierz inną drogę – są trzy zakończenia.';
  return all;
}
