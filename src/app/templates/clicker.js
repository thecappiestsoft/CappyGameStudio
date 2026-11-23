function exampleClicker(objs, p) {
  var big = addDef(objs, defn('bigorange', 'Wielka pomarańcza', 'Obiekt interaktywny', { type: 'fruit', v: 'orange' }, clone(BODY.none), [comp('clicker', { currency: 'Pomarańcze', click: 1, goal: 100000, golden: true })], { desc: 'Klikasz ją, żeby zbierać pomarańcze.' }));
  big.data.size = { w: 4, h: 4 };
  var UPS = [
    ['up1', 'Łapka pomocnika', { type: 'hero', v: 'capy', color: '#c98d4b' }, 'click', 1, 15],
    ['up2', 'Mała kapibara', { type: 'npc', v: 'capy' }, 'auto', 1, 50],
    ['up3', 'Sad pomarańczowy', { type: 'deco', v: 'tree', color: '#ff9f1c' }, 'auto', 5, 400],
    ['up4', 'Złota łapka', { type: 'star', v: 'yellow' }, 'click', 10, 2500],
    ['up5', 'Robot zbieracz', { type: 'npc', v: 'robot' }, 'auto', 25, 3000],
    ['up6', 'Kapibarowa fabryka', { type: 'goal', v: 'house' }, 'auto', 150, 20000],
    ['up7', 'Pomarańczowa rakieta', { type: 'deco', v: 'planet' }, 'auto', 1000, 150000]
  ];
  UPS.forEach(function (u) { addDef(objs, defn(u[0], u[1], 'Obiekt interaktywny', u[2], clone(BODY.none), [comp('upgrade', { kind: u[3], bonus: u[4], cost: u[5], growth: 15 })], { desc: 'Ulepszenie w sklepie gry klikanej.' })); });
  var s = newScene('Sad Cappy', 20, 12); s.bg.theme = 'przyroda'; s.complete = { mode: 'all', conds: [], next: 'end', count: 1 };
  s.inst.push(newInst('bigorange', 3, 4, objs));
  UPS.forEach(function (u, i) { s.inst.push(newInst(u[0], 10 + (i % 4) * 2, 3 + Math.floor(i / 4) * 3, objs)); });
  for (var x = 0; x < 20; x++) s.inst.push(newInst('grass', x, 11, objs));
  hudOnly(p, ['score']);
  p.flow.subtitle = 'Klikaj wielką pomarańczę, kupuj pomocników i zbierz 100 000 pomarańczy!';
  p.flow.winMsg = 'Brawo! Twój sad to prawdziwe imperium pomarańczy!';
  return [s];
}
