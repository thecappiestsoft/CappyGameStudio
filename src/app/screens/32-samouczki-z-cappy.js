/* ================= SAMOUCZKI Z CAPPY ================= */
var TUT_CATS = [
  { id: 'start', name: 'Pierwsze kroki', color: 'var(--m-scena)', desc: 'Jak działa studio, pierwsza zmiana w grze i zapisywanie.' },
  { id: 'plansza', name: 'Budowanie planszy', color: 'var(--m-obiekty)', desc: 'Stawianie klocków, zaznaczanie i większy świat.' },
  { id: 'postacie', name: 'Postacie i zachowania', color: 'var(--m-zachowania)', desc: 'Wygląd postaci, zachowania i sprytni przeciwnicy.' },
  { id: 'zasady', name: 'Zasady i poziomy', color: 'var(--m-przebieg)', desc: 'Punkty, życia, czas, warunki wygranej i opowieści.' },
  { id: 'test', name: 'Testowanie i dzielenie się', color: 'var(--m-test)', desc: 'Szukanie błędów i pokazywanie gry innym.' },
  { id: 'extra', name: 'Dodatki', color: 'var(--m-mechaniki)', desc: 'Własne karty do pojedynków i własne obrazki.' }
];
function q1(s) { return document.querySelector(s); }
function cnt(id) { var sc = P && P.scenes.filter(function (s) { return s.id === SE.sceneId; })[0]; return sc ? sc.inst.filter(function (i) { return i.obj === id; }).length : 0; }
var TUTS = [
  { id: 'tour', cat: 'start', title: 'Poznaj studio', mins: 3, tpl: 'platformer', desc: 'Krótka wycieczka po menu, przyciskach i pomocnikach.', steps: [
    { t: 'Cześć! Jestem Cappy i będę twoim przewodnikiem. Przygotowałam dla ciebie grę do ćwiczeń. Zobaczmy razem, co tu jest!' },
    { sel: '#mnav', t: 'To twoja ścieżka. Grę robisz w 8 krokach: od planszy, przez postacie i zasady, aż do udostępnienia. Możesz skakać między krokami w dowolnej kolejności.' },
    { sel: '#mnav a.step[href="#scena"]', t: 'Krok 1 to Plansza. Tu układasz świat gry z klocków – teraz właśnie tu jesteśmy.' },
    { sel: '#modbar .cappy', t: 'Na każdym ekranie tu podpowiadam, co możesz zrobić. Zerkaj tu, gdy nie wiesz, co dalej.' },
    { sel: '#modbar .stepnav', t: 'Te przyciski prowadzą do poprzedniego i następnego kroku.' },
    { sel: '[data-act=undo]', t: 'Pomyłka? Nic się nie stało! „Cofnij” (albo Ctrl+Z) odwraca ostatnią zmianę. „Ponów” przywraca ją z powrotem.' },
    { sel: '[data-act=saveNow]', t: 'Gra zapisuje się sama. Tym przyciskiem robisz dodatkowo kopię – wersję, do której zawsze możesz wrócić.' },
    { sel: '#diag', t: 'To Sprawdzacz gry. Pilnuje, żeby w grze nie było błędów, i mówi, co poprawić. Gdy świeci „Wszystko gra!”, jest super.' },
    { sel: '[data-act=runScene]', wait: 'click', t: 'A teraz najlepsze: kliknij „Zagraj”, żeby wypróbować grę!' },
    { sel: '#ts-game', t: 'Gra działa! Kliknij „Start”, steruj strzałkami, skacz spacją. Pograj chwilę, a potem kliknij „Dalej”.' },
    { sel: '[data-act=stopTest]', wait: 'click', t: 'Kliknij „Wróć do planszy”, żeby wrócić do budowania.' },
    { t: 'Brawo! Znasz już studio. W następnej lekcji zmienisz coś w grze po swojemu.' }
  ] },
  { id: 'firstchange', cat: 'start', title: 'Pierwsza zmiana w grze', mins: 3, tpl: 'platformer', desc: 'Zmienisz wygląd bohatera i od razu zobaczysz to w grze.', steps: [
    { t: 'Zrobimy twoją pierwszą zmianę: bohater będzie wyglądał tak, jak chcesz.' },
    { sel: '#mnav a.step[href="#obiekty"]', wait: 'route:obiekty', t: 'Kliknij krok 2 „Postacie i rzeczy”.' },
    { sel: '#os-list', t: 'Tu jest lista wszystkich postaci i rzeczy w grze. Kapibara, czyli bohater, jest już wybrana.' },
    { sel: '.vchips', wait: 'click', t: 'Kliknij inny wygląd, np. Lisek albo Rycerz.' },
    { sel: '#o-color', wait: 'change', t: 'Teraz kliknij kolor i wybierz swój ulubiony.' },
    { sel: '[data-act=runScene]', wait: 'click', t: 'Sprawdźmy w grze! Kliknij „Zagraj”.' },
    { sel: '#ts-game', t: 'Widzisz? Twój bohater wygląda inaczej. Każda zmiana w studiu od razu działa w grze.' },
    { sel: '[data-act=stopTest]', wait: 'click', t: 'Wróć do planszy.' },
    { t: 'Super! To była twoja pierwsza zmiana. Tak samo możesz zmieniać przeciwników, monety i wszystko inne.' }
  ] },
  { id: 'saving', cat: 'start', title: 'Zapisywanie i wersje', mins: 2, desc: 'Gdzie są twoje gry i jak wrócić do starszej wersji.', steps: [
    { sel: '[data-act=saveNow]', wait: 'click', t: 'Kliknij „Zapisz”. Studio zapamięta tę wersję gry.' },
    { go: 'projekt', sel: '[data-act=backupNow]', t: 'W „Ustawieniach gry” jest lista zapisanych wersji. Jeśli coś zepsujesz, przywrócisz starszą jednym kliknięciem.' },
    { sel: '#mnav a[href="#start"]', wait: 'route:start', t: 'Kliknij „Moje gry” w menu.' },
    { t: 'Tu są wszystkie twoje gry. Zapisują się w tej przeglądarce, na tym komputerze. Chcesz przenieść grę gdzie indziej? W kroku „Udostępnij” zapiszesz plik projektu.' }
  ] },
  { id: 'blocks', cat: 'plansza', title: 'Stawiamy klocki', mins: 4, tpl: 'platformer', desc: 'Pędzel, prostokąt i gumka – budujesz świat jak z klocków.', steps: [
    { go: 'scena', sel: '#se-left', t: 'To pudełko z klockami. Są tu postacie, przedmioty, podłoże i dekoracje.' },
    { sel: '[data-act=seBrush][data-id=coin]', wait: 'click', t: 'Kliknij „Moneta”.' },
    { sel: '#se-cv', pre: function (s) { s.n = cnt('coin'); }, check: function (s) { return cnt('coin') >= s.n + 3; }, t: 'Klikaj na planszy w pustych miejscach. Postaw co najmniej 3 monety!' },
    { sel: '[data-act=seTool][data-t=rect]', t: 'Narzędzie „Wypełnij” stawia cały prostokąt klocków naraz – przeciągasz myszką od rogu do rogu. Świetne do podłogi i ścian.' },
    { sel: '[data-act=seTool][data-t=erase]', wait: 'click', t: 'Kliknij „Gumkę”.' },
    { sel: '#se-cv', pre: function (s) { s.n = P.scenes.reduce(function (a, x) { return a + x.inst.length; }, 0); }, check: function (s) { return P.scenes.reduce(function (a, x) { return a + x.inst.length; }, 0) < s.n; }, t: 'Kliknij jedną z monet, które postawiłeś – zniknie.' },
    { sel: '[data-act=undo]', t: 'Usunąłeś za dużo? „Cofnij” przywróci klocek.' },
    { t: 'Świetnie! Umiesz już stawiać i usuwać klocki. Postaw coś jeszcze i zagraj, żeby to sprawdzić.' }
  ] },
  { id: 'select', cat: 'plansza', title: 'Zaznaczanie i przesuwanie', mins: 3, tpl: 'platformer', desc: 'Wybierz element, przesuń go, zrób kopię albo usuń.', steps: [
    { go: 'scena', sel: '[data-act=seTool][data-t=select]', wait: 'click', t: 'Kliknij narzędzie „Wybierz” (strzałka).' },
    { sel: '#se-cv', check: function () { return SE.sel.length > 0; }, t: 'Kliknij dowolny element na planszy, np. przeciwnika albo monetę.' },
    { sel: '#se-right', t: 'Po prawej widzisz ustawienia tego jednego elementu. Możesz go np. odwrócić albo zmienić mu ustawienia tylko w tym miejscu.' },
    { sel: '#se-cv', t: 'Przeciągnij zaznaczony element myszką, żeby go przesunąć. Strzałki na klawiaturze też go przesuwają. Potem kliknij „Dalej”.' },
    { sel: '[data-act=seDup]', wait: 'click', t: 'Kliknij „Duplikuj” – powstanie kopia obok.' },
    { sel: '[data-act=seDel]', t: 'Kosz usuwa zaznaczone elementy. To samo robi klawisz Delete.' },
    { t: 'Brawo! Zaznaczanie to podstawa porządków na planszy.' }
  ] },
  { id: 'world', cat: 'plansza', title: 'Większy świat', mins: 3, tpl: 'platformer', desc: 'Rozmiar planszy, tło i to, co widać na ekranie.', steps: [
    { go: 'scena', pre: function () { SE.sel = []; if (typeof seRight === 'function') seRight(); }, sel: '#se-right', t: 'Gdy nic nie jest zaznaczone, po prawej są ustawienia całej planszy.' },
    { sel: '#sc-cols', wait: 'change', t: 'Zmień szerokość planszy – wpisz większą liczbę i naciśnij Enter.' },
    { sel: '#sc-theme', wait: 'change', t: 'Wybierz inne tło, np. Kosmos albo Zamek.' },
    { sel: '[data-act=seView]', t: 'Ten przycisk pokazuje ramkę „Tyle widać na ekranie”. Gdy plansza jest większa, kamera jedzie za bohaterem.' },
    { sel: '[data-act=seFit]', wait: 'click', t: 'Kliknij „Dopasuj”, żeby zobaczyć całą planszę naraz.' },
    { t: 'Super! Teraz twój świat może być tak duży, jak chcesz.' }
  ] },
  { id: 'looks', cat: 'postacie', title: 'Postacie i rzeczy', mins: 3, tpl: 'platformer', desc: 'Wygląd, rozmiar i to, jak rzeczy się zderzają.', steps: [
    { go: 'obiekty', sel: '[data-act=osPick][data-id=bat]', wait: 'click', t: 'Wybierz z listy „Nietoperz”.' },
    { sel: '#o-w', wait: 'change', t: 'Zrób nietoperza większym – zmień szerokość na 2.' },
    { sel: '#o-h', wait: 'change', t: 'I wysokość też na 2. Teraz to wielki nietoperz-boss!' },
    { sel: '#o-body', t: 'Tu ustawiasz, jak rzecz się porusza i zderza: czy stoi w miejscu, czy spada, czy blokuje drogę.' },
    { sel: '[data-act=osVariant]', t: '„Wariant” to kopia, która dziedziczy wszystko po oryginale. Zmieniasz tylko to, co ma być inne – np. szybszy potworek.' },
    { sel: '[data-act=runScene]', wait: 'click', t: 'Zagraj i znajdź wielkiego nietoperza!' },
    { sel: '[data-act=stopTest]', wait: 'click', t: 'Wróć do planszy.' },
    { t: 'Brawo! Zmiana w „Postaciach i rzeczach” działa na wszystkie nietoperze w grze naraz.' }
  ] },
  { id: 'behave', cat: 'postacie', title: 'Dodaj zachowanie', mins: 4, tpl: 'platformer', desc: 'Nietoperz nauczy się strzelać – bez pisania kodu.', steps: [
    { go: 'zachowania', sel: '[data-act=bsPick][data-id=bat]', wait: 'click', t: 'Kliknij „Nietoperz” na liście po lewej.' },
    { sel: '#bs-main', t: 'Na środku są jego zachowania. Każde to osobny klocek: Patrol (lata tam i z powrotem), Obrażenia (boli przy dotknięciu) i Zdrowie.' },
    { sel: '#bs-cat [data-bsp=shooter]', wait: 'click', t: 'Po prawej jest lista wszystkich zachowań. Kliknij „Atak dystansowy”.' },
    { sel: '[data-act=bsAdd]', wait: 'click', t: 'Kliknij „Dodaj”, żeby nietoperz dostał to zachowanie.' },
    { sel: '#bs-main', t: 'Nowy klocek pojawił się na środku. Suwakami zmienisz, jak często strzela i jak szybkie są pociski.' },
    { sel: '[data-act=runScene]', wait: 'click', t: 'Zagraj i uważaj na pociski!' },
    { sel: '[data-act=stopTest]', wait: 'click', t: 'Wróć do planszy.' },
    { t: 'Świetnie! Tak właśnie robi się gry w tym studiu: wybierasz postać i dokładasz jej zachowania jak klocki.' }
  ] },
  { id: 'brain', cat: 'postacie', title: 'Przeciwnik z mózgiem', mins: 4, tpl: 'platformer', desc: 'Stany i przejścia: patroluje, goni, wraca.', steps: [
    { go: 'zachowania', sel: '[data-act=bsPick][data-id=enemy]', wait: 'click', t: 'Wybierz „Strażnika”.' },
    { sel: '#bs-main', t: 'Strażnik ma zachowanie „Stany i przejścia”. To jego mózg: mówi, co robi w różnych sytuacjach.' },
    { sel: '#bs-main', t: 'Przeczytaj tabelę jak zdania: „Gdy patroluje i wykryje gracza → goni”. „Gdy goni i zgubi gracza na 3 sekundy → wraca”. Możesz zmieniać te liczby.' },
    { sel: '[data-act=runScene]', wait: 'click', t: 'Zagraj i podejdź do strażnika. Zobaczysz, jak zaczyna cię gonić!' },
    { sel: '#ts-insp', t: 'Kliknij strażnika w grze. W Podglądaczu zobaczysz, w jakim stanie jest teraz: Patrol, Pościg czy Powrót.' },
    { sel: '[data-act=stopTest]', wait: 'click', t: 'Wróć do planszy.' },
    { t: 'Brawo! Teraz wiesz, jak myślą przeciwnicy w grach.' }
  ] },
  { id: 'rules', cat: 'zasady', title: 'Punkty, życia i czas', mins: 3, tpl: 'platformer', desc: 'Zasady, które działają w całej grze.', steps: [
    { go: 'mechaniki', sel: '#m-lives', wait: 'change', t: 'Ile żyć ma gracz? Wpisz inną liczbę, np. 5.' },
    { sel: '#m-timer', wait: 'change', t: 'Włącz „Limit czasu”. Teraz gracz musi się spieszyć!' },
    { sel: '#m-tlimit', t: 'Tu ustawiasz, ile sekund trwa poziom.' },
    { sel: '#hud-timer', t: 'W sekcji „Co widać w czasie gry” decydujesz, co pokazuje się nad grą: wynik, życia, zegar…' },
    { sel: '[data-act=runScene]', wait: 'click', t: 'Zagraj i zobacz zegar nad grą.' },
    { sel: '[data-act=stopTest]', wait: 'click', t: 'Wróć do planszy.' },
    { t: 'Super! Zasady zmieniają charakter gry. Ten sam poziom z zegarem to zupełnie inne wyzwanie.' }
  ] },
  { id: 'win', cat: 'zasady', title: 'Kiedy wygrywam?', mins: 3, tpl: 'platformer', desc: 'Warunki ukończenia poziomu i kolejność poziomów.', steps: [
    { go: 'przebieg', sel: '#gf-main', t: 'W „Poziomach” ustalasz, kiedy poziom jest ukończony. Teraz: gdy gracz dotrze do wyjścia.' },
    { sel: '[data-x=addc]', wait: 'click', t: 'Dodajmy drugi warunek. Kliknij „Dodaj warunek”.' },
    { sel: '#gf-main', t: 'Z listy wybierz np. „Osiągnięcie wyniku” i wpisz, ile punktów trzeba zebrać. Wtedy samo dojście do wyjścia nie wystarczy!' },
    { sel: '#gf-next', t: 'Tu wybierasz, co się dzieje po ukończeniu: następny poziom albo koniec gry.' },
    { sel: '#gf-win', wait: 'change', t: 'Wpisz swój napis, który zobaczy zwycięzca, np. „Jesteś mistrzem!”.' },
    { t: 'Brawo! Teraz to ty decydujesz, jak wygrać w twojej grze.' }
  ] },
  { id: 'story', cat: 'zasady', title: 'Rozmowy i wybory', mins: 4, tpl: 'vn', desc: 'Opowieść, w której gracz decyduje, a gra pamięta wybory.', steps: [
    { t: 'Ta lekcja używa przykładowej opowieści „Pierwszy dzień w szkole”. Zobaczmy, jak działa.' },
    { sel: '[data-act=runScene]', wait: 'click', t: 'Kliknij „Zagraj”.' },
    { sel: '#ts-game', t: 'Kliknij „Start”, czytaj (Enter lub kliknięcie) i wybieraj klawiszami 1, 2, 3. Nad grą pojawia się „Pamięć” – to, co gra zapamiętała. Pograj, a potem kliknij „Dalej”.' },
    { sel: '[data-act=stopTest]', wait: 'click', t: 'Wróć do planszy.' },
    { sel: '#se-scene', t: 'Każda plansza to jedna scena opowieści. Wybory w rozmowie prowadzą do różnych plansz.' },
    { t: 'Rozmowę dodajesz zachowaniem „Rozmowa / komunikat”. Każda linia to jedna kwestia, a „Imię: tekst” zmienia mówiącego.' },
    { t: 'W ustawieniach zaawansowanych wybór może coś zapamiętać, np. „Odwaga”. Linia „[Odwaga] Brawo, jesteś dzielna!” pokaże się tylko wtedy, gdy gra to zapamiętała. Tak powstają różne zakończenia!' }
  ] },
  { id: 'detective', cat: 'test', title: 'Testuj jak detektyw', mins: 3, tpl: 'platformer', desc: 'Podglądacz, dziennik zdarzeń i ramki zderzeń.', steps: [
    { sel: '[data-act=runScene]', wait: 'click', t: 'Kliknij „Zagraj”.' },
    { sel: '#ts-game', t: 'Kliknij „Start” i pograj chwilę. Potem kliknij w grze dowolną postać.' },
    { sel: '#ts-insp', t: 'Podglądacz pokazuje, co dzieje się z klikniętą postacią: gdzie jest, ile ma życia, co robi.' },
    { sel: '#ts-logs', t: '„Co się wydarzyło” to dziennik gry: zebrane monety, trafienia, błędy. Detektyw zawsze tu zagląda!' },
    { sel: '#ts-hit', wait: 'change', t: 'Włącz „Pokaż ramki”. Zobaczysz prostokąty, którymi rzeczy się zderzają.' },
    { sel: '[data-act=stopTest]', wait: 'click', t: 'Wróć do planszy.' },
    { t: 'Brawo, detektywie! Gdy coś nie działa, testuj i czytaj dziennik.' }
  ] },
  { id: 'fixer', cat: 'test', title: 'Naprawiamy błędy', mins: 3, tpl: 'platformer', desc: 'Sprawdzacz gry pokaże, co zepsute, i zaprowadzi cię do problemu.', steps: [
    { t: 'Celowo zepsuję grę: usunę wyjście z pierwszego poziomu. Zobaczysz, jak Sprawdzacz to wyłapie. Kliknij „Dalej”.' },
    { pre: function () { mut(function () { var sc = P.scenes[0]; sc.inst = sc.inst.filter(function (i) { return i.obj !== 'goal'; }); }); render(); }, sel: '#diag', t: 'Widzisz? Sprawdzacz pokazuje błąd: poziom nie ma wyjścia, więc nie da się go ukończyć.' },
    { sel: '#diag [data-act=diagT]', t: 'Tym przyciskiem rozwijasz i zwijasz listę. Kliknięcie problemu na liście zabiera cię tam, gdzie trzeba go naprawić.' },
    { sel: '[data-act=undo]', check: function () { return !validateProject().some(function (d) { return d.lvl === 'error'; }); }, t: 'Naprawmy to. Kliknij „Cofnij”, aż wyjście wróci, a Sprawdzacz pokaże „Wszystko gra!”.' },
    { t: 'Brawo! Sprawdzaj go przed każdym udostępnieniem gry.' }
  ] },
  { id: 'share', cat: 'test', title: 'Pokaż grę światu', mins: 2, desc: 'Zapisz grę do pliku i dowiedz się, jak bezpiecznie się nią dzielić.', steps: [
    { go: 'eksport', sel: '#ex-name', t: 'W kroku „Udostępnij” ustawiasz nazwę i wersję gry.' },
    { sel: '[data-act=exHtml]', t: 'Ten przycisk zapisuje grę jako jeden plik. Otworzysz go w każdej przeglądarce, także bez internetu.' },
    { sel: '[data-act=exPwa]', t: 'Tu przygotujesz grę do zainstalowania na telefonie albo komputerze. Do tego przyda się pomoc dorosłego.' },
    { t: 'Ważne: w grze nie wpisuj swojego nazwiska, adresu ani numeru telefonu – wystarczy pseudonim. Zanim wyślesz grę komuś obcemu, zapytaj nauczyciela albo rodzica.' }
  ] },
  { id: 'cards', cat: 'extra', title: 'Własne karty', mins: 4, tpl: 'cards', desc: 'Wymyśl kartę, dodaj ją do talii i zagraj próbny pojedynek.', steps: [
    { go: 'karty', sel: '[data-k=new]', wait: 'click', t: 'To moduł „Karty i talie”. Kliknij „Nowa karta”.' },
    { sel: '#kc-name', wait: 'input', t: 'Nadaj karcie nazwę, np. „Super Kapibara”.' },
    { sel: '#kc-type', t: 'Wybierz rodzaj: stwór zostaje na stole, czar działa raz, a karta mocy działa do końca pojedynku.' },
    { sel: '#kc-prev', t: 'Tu widzisz podgląd karty. Zmieniaj koszt, atak i życie suwakami – podgląd od razu się zmienia.' },
    { sel: '.kc-list', t: 'Niżej jest talia. Przyciskiem + dodasz swoją kartę do talii (najwyżej 3 kopie).' },
    { sel: '[data-k=test]', wait: 'click', t: 'Kliknij „Zagraj próbny pojedynek” i sprawdź swoją kartę w akcji!' },
    { t: 'Brawo! Twoje karty pojawią się w pojedynkach z przeciwnikami w grze.' }
  ] },
  { id: 'assets', cat: 'extra', title: 'Własne obrazki i dźwięki', mins: 2, desc: 'Narysuj postać i dodaj ją do gry.', steps: [
    { go: 'zasoby', sel: '[data-act=asImport]', t: 'W „Obrazkach i dźwiękach” wgrywasz własne pliki: rysunki (PNG, JPG) i dźwięki.' },
    { sel: '#as-drop', t: 'Możesz też przeciągnąć plik tutaj. Najlepiej sprawdzają się kwadratowe obrazki z przezroczystym tłem.' },
    { go: 'obiekty', sel: '#o-img', t: 'Potem w „Postaciach i rzeczach” wybierasz swój obrazek jako wygląd postaci.' },
    { t: 'Pamiętaj: używaj własnych rysunków albo takich, na które masz zgodę. Nie wgrywaj zdjęć osób.' }
  ] }
];
var TUT = null, tutT = 0, tutGuide = '';
function tutGuideURL() {
  if (tutGuide) return tutGuide;
  var c = document.createElement('canvas'); c.width = c.height = 160; var x = c.getContext('2d');
  CGM.drawSprite(x, { type: 'hero', v: 'capy' }, 8, 26, 132, 132, 0, { dir: 1 });
  x.save(); x.translate(104, 32); x.rotate(-0.12); x.fillStyle = '#2d2547'; x.strokeStyle = '#2d2547'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(-34, 0); x.lineTo(0, -14); x.lineTo(34, 0); x.lineTo(0, 14); x.closePath(); x.fill();
  x.fillRect(-16, 2, 32, 14); x.strokeStyle = '#ffc233'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 0); x.lineTo(26, 6); x.lineTo(26, 24); x.stroke();
  x.fillStyle = '#ffc233'; x.beginPath(); x.arc(26, 26, 4, 0, 7); x.fill(); x.restore();
  return tutGuide = c.toDataURL();
}
(function () {
  var st = document.createElement('style');
  st.textContent = '' +
    '#tut-spot{position:fixed;z-index:8990;border-radius:12px;pointer-events:none;box-shadow:0 0 0 9999px rgba(20,14,40,.42);outline:4px solid var(--accent);outline-offset:3px;transition:all .25s ease}' +
    'html:not(.rm) #tut-spot{animation:tutp 1.4s ease-in-out infinite}@keyframes tutp{50%{outline-offset:8px}}' +
    '#tut-panel{position:fixed;z-index:9000;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));width:min(420px,calc(100vw - 32px));display:grid;grid-template-columns:96px minmax(0,1fr);gap:4px 10px;align-items:end;pointer-events:none}' +
    '#tut-panel.tp-top{bottom:auto;top:max(84px,env(safe-area-inset-top,0px))}#tut-panel.tp-left{right:auto;left:max(16px,env(safe-area-inset-left,0px))}#tut-panel.tp-mid{right:auto;left:50%;transform:translateX(-50%)}' +
    '#tut-panel>*{pointer-events:auto}' +
    '.tut-cappy{width:96px;height:96px;filter:drop-shadow(0 3px 0 var(--edge))}html:not(.rm) .tut-cappy{animation:tutb 2.4s ease-in-out infinite}@keyframes tutb{50%{transform:translateY(-6px) rotate(-3deg)}}' +
    '.tut-box{position:relative;background:var(--surface);color:var(--text);border:3px solid var(--edge);border-radius:18px;box-shadow:var(--sh-lg);padding:12px 14px;display:flex;flex-direction:column;gap:8px}' +
    '.tut-box:before{content:"";position:absolute;left:-12px;bottom:22px;width:18px;height:18px;background:var(--surface);border-left:3px solid var(--edge);border-bottom:3px solid var(--edge);transform:rotate(45deg)}' +
    '.tut-h{display:flex;align-items:center;gap:8px;font:800 .78rem var(--f-display);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.tut-h span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.tut-x{border:0;background:none;color:var(--muted);cursor:pointer;padding:2px;border-radius:6px;display:grid;place-items:center}.tut-x svg{width:20px;height:20px}' +
    '.tut-t{margin:0;font-size:1rem;line-height:1.45}' +
    '.tut-do svg{width:18px;height:18px;flex:none}.tut-btns svg{width:16px;height:16px}.tut-do{display:flex;align-items:center;gap:6px;font-size:.82rem;font-weight:700;color:var(--primary);background:var(--sky);border-radius:10px;padding:4px 10px}' +
    '.tut-bar{height:6px;border-radius:999px;background:var(--sunk);overflow:hidden}.tut-bar i{display:block;height:100%;background:var(--accent);border-radius:999px;transition:width .3s}' +
    '.tut-btns{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.tut-btns .grow{flex:1}' +
    '@media (max-width:640px){#tut-panel,#tut-panel.tp-top,#tut-panel.tp-left,#tut-panel.tp-mid{transform:none;left:max(10px,env(safe-area-inset-left,0px));right:max(10px,env(safe-area-inset-right,0px));top:auto;bottom:max(10px,env(safe-area-inset-bottom,0px));width:auto;grid-template-columns:64px minmax(0,1fr)}.tut-cappy{width:64px;height:64px}}' +
    '.th-hero{display:grid;grid-template-columns:140px minmax(0,1fr);gap:18px;align-items:center;background:linear-gradient(120deg,var(--sky),var(--accent-soft));border:3px solid var(--edge);border-radius:22px;padding:18px 22px;box-shadow:var(--sh-lg)}.th-hero img{width:140px;height:140px}' +
    '.th-prog{display:flex;align-items:center;gap:10px;font-weight:700;margin-top:10px}.th-prog .tut-bar{flex:1;max-width:320px;height:10px;background:var(--surface)}' +
    '.th-cat{display:flex;flex-direction:column;gap:10px}.th-cat h2{display:flex;align-items:center;gap:10px;font-size:1.35rem}.th-cat h2 i{width:14px;height:14px;border-radius:50%;background:var(--c);border:2px solid var(--edge)}' +
    '.th-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}' +
    '.th-card{display:flex;flex-direction:column;gap:6px;text-align:left;padding:14px;border:3px solid var(--edge);border-radius:16px;background:var(--surface);color:var(--text);box-shadow:var(--sh);cursor:pointer;font:inherit;border-top:8px solid var(--c)}' +
    '.th-card:hover{transform:translateY(-2px)}.th-card b{font:800 1.12rem var(--f-display)}.th-card small{color:var(--muted);font-size:.86rem}.th-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto}' +
    '.th-meta span{font-size:.74rem;font-weight:700;border-radius:999px;padding:1px 9px;background:var(--surface2);border:2px solid var(--line)}.th-meta .done{background:var(--ok-soft);color:var(--ok);border-color:var(--ok)}' +
    '@media (max-width:640px){.th-hero{grid-template-columns:1fr;text-align:center}.th-hero img{margin:auto;width:110px;height:110px}.th-prog{justify-content:center}}';
  document.head.appendChild(st);
})();
function tutDone() { return SET.tutDone || {}; }
function tutPanelHTML() {
  var L = TUT.lesson, s = L.steps[TUT.i], n = L.steps.length, last = TUT.i === n - 1, waiting = !!(s.wait || s.check) && !TUT.ok;
  return '<img class="tut-cappy" alt="" src="' + tutGuideURL() + '"><div class="tut-box" role="dialog" aria-label="Samouczek z Cappy: ' + esc(L.title) + '">' +
    '<div class="tut-h"><span>' + esc(L.title) + ' · krok ' + (TUT.i + 1) + ' z ' + n + '</span><button class="tut-x" data-tut="close" aria-label="Zakończ samouczek" title="Zakończ samouczek">' + I.x + '</button></div>' +
    '<div class="tut-bar" aria-hidden="true"><i style="width:' + Math.round((TUT.i + 1) / n * 100) + '%"></i></div>' +
    '<p class="tut-t" aria-live="polite">' + esc(s.t) + '</p>' +
    (TUT.miss ? '<p class="xs muted" style="margin:0">Nie widzę tego miejsca na ekranie. Spróbuj przewinąć albo kliknij „Pomiń”.</p>' : '') +
    (waiting ? '<div class="tut-do">' + I.hand + 'Zrób to, a pójdę dalej sama!</div>' : '') +
    '<div class="tut-btns">' + (TUT.i ? '<button class="btn sm" data-tut="back">' + I.back + 'Wstecz</button>' : '') + '<span class="grow"></span>' +
    (last ? '<button class="btn sm pri" data-tut="finish">' + I.check + 'Gotowe!</button>' : waiting ? '<button class="btn sm ghost" data-tut="next">Pomiń</button>' : '<button class="btn sm pri" data-tut="next">Dalej' + I.next + '</button>') + '</div></div>';
}
function tutEnsure() {
  var spot = $('#tut-spot'), pan = $('#tut-panel');
  if (!spot) { spot = document.createElement('div'); spot.id = 'tut-spot'; spot.hidden = true; document.body.appendChild(spot); }
  if (!pan) {
    pan = document.createElement('div'); pan.id = 'tut-panel'; document.body.appendChild(pan);
    pan.addEventListener('click', function (e) { var b = e.target.closest('[data-tut]'); if (!b) return; var a = b.dataset.tut; if (a === 'next') tutGo(TUT.i + 1); else if (a === 'back') tutGo(TUT.i - 1); else if (a === 'close') tutStop(false); else if (a === 'finish') tutStop(true); });
  }
  return { spot: spot, pan: pan };
}
function tutGo(i) {
  if (!TUT) return; var L = TUT.lesson; i = Math.max(0, Math.min(L.steps.length - 1, i));
  TUT.i = i; TUT.ok = false; TUT.miss = false; TUT.scrolled = false; TUT.st = {};
  var s = L.steps[i];
  if (s.go && route() !== s.go) go(s.go);
  setTimeout(function () { if (!TUT || TUT.i !== i) return; if (s.pre) try { s.pre(TUT.st); } catch (e) { } tutRender(true); }, s.go ? 250 : 30);
}
function tutRender(focus) {
  if (!TUT) return; var E = tutEnsure(); E.pan.innerHTML = tutPanelHTML(); tutPlace();
  if (focus) { var b = E.pan.querySelector('[data-tut=next],[data-tut=finish]'); if (b) try { b.focus({ preventScroll: true }); } catch (e) { } }
}
function tutTarget() { var s = TUT.lesson.steps[TUT.i]; if (!s.sel) return null; var el = document.querySelector(s.sel); if (!el) return null; var r = el.getBoundingClientRect(); return r.width || r.height ? { el: el, r: r } : null; }
function tutPlace() {
  if (!TUT) return; var E = tutEnsure(), s = TUT.lesson.steps[TUT.i], tg = tutTarget();
  var miss = !!s.sel && !tg; if (miss !== TUT.miss) { TUT.miss = miss; E.pan.innerHTML = tutPanelHTML(); }
  if (!tg) { E.spot.hidden = true; E.pan.className = ''; return; }
  if (!TUT.scrolled) { TUT.scrolled = true; var r0 = tg.r; if (r0.top < 60 || r0.bottom > innerHeight - 40) { try { tg.el.scrollIntoView({ block: 'nearest', behavior: document.documentElement.classList.contains('rm') ? 'auto' : 'smooth' }); } catch (e) { } } }
  var r = tg.el.getBoundingClientRect(), pad = 6;
  E.spot.hidden = false; E.spot.style.left = (r.left - pad) + 'px'; E.spot.style.top = (r.top - pad) + 'px'; E.spot.style.width = (r.width + pad * 2) + 'px'; E.spot.style.height = (r.height + pad * 2) + 'px';
  var pw = E.pan.offsetWidth, ph = E.pan.offsetHeight, W = innerWidth, H = innerHeight, m = 16;
  function ov(x, y) { return !(x + pw < r.left - 8 || x > r.right + 8 || y + ph < r.top - 8 || y > r.bottom + 8); }
  var cand = [['', W - m - pw, H - m - ph], ['tp-left', m, H - m - ph], ['tp-top', W - m - pw, 84], ['tp-top tp-left', m, 84], ['tp-mid', (W - pw) / 2, H - m - ph]];
  var pick = cand.filter(function (c) { return !ov(c[1], c[2]); })[0];
  if (W <= 640) pick = ['', 0, 0];
  E.pan.className = pick ? pick[0] : '';
}
function tutTick() {
  if (!TUT) return; var s = TUT.lesson.steps[TUT.i];
  if (!TUT.ok && s.check) { var ok = false; try { ok = s.check(TUT.st); } catch (e) { } if (ok) return tutAdvance(); }
  if (!TUT.ok && s.wait && s.wait.indexOf('route:') === 0 && route() === s.wait.slice(6)) return tutAdvance();
  tutPlace();
}
function tutAdvance() { if (!TUT || TUT.ok) return; TUT.ok = true; SND.play('collect'); var i = TUT.i; setTimeout(function () { if (TUT && TUT.i === i) tutGo(i + 1); }, 450); tutRender(false); }
function tutEvt(e) {
  if (!TUT || TUT.ok) return; var s = TUT.lesson.steps[TUT.i]; if (!s.sel || !s.wait) return;
  var el = document.querySelector(s.sel); if (!el || !(e.target === el || el.contains(e.target))) return;
  if ((s.wait === 'click' && e.type === 'click') || (s.wait === 'change' && e.type === 'change') || (s.wait === 'input' && e.type === 'input' && e.target.value.length > 2)) setTimeout(tutAdvance, 60);
}
document.addEventListener('click', tutEvt, true); document.addEventListener('change', tutEvt, true); document.addEventListener('input', tutEvt, true);
window.addEventListener('resize', function () { if (TUT) tutPlace(); }); window.addEventListener('scroll', function () { if (TUT) tutPlace(); }, true);
function tutStart(id) {
  var L = TUTS.filter(function (x) { return x.id === id; })[0]; if (!L) return;
  if (TUT) tutStop(false, true);
  function begin() { TUT = { lesson: L, i: 0 }; clearInterval(tutT); tutT = setInterval(tutTick, 300); tutGo(0); }
  if (L.tpl || !P) {
    var tpl = L.tpl || 'platformer', p = newProject({ name: 'Ćwiczenia z Cappy', template: tpl });
    p.meta.name = 'Ćwiczenia z Cappy'; p.flow.titleText = ({ platformer: 'Kapibara i Zaginiony Klucz', vn: 'Pierwszy dzień w szkole', cards: 'Wieża pojedynków' })[tpl] || p.meta.name;
    if (SET.tutPid) p.id = SET.tutPid; SET.tutPid = p.id;
    openProject(p, true); setTimeout(begin, 350);
  } else begin();
}
function tutStop(done, silent) {
  if (!TUT) return; var L = TUT.lesson; TUT = null; clearInterval(tutT);
  var sp = $('#tut-spot'), pn = $('#tut-panel'); if (sp) sp.remove(); if (pn) pn.remove();
  if (done) {
    SET.tutDone = tutDone(); SET.tutDone[L.id] = 1; saveSettings(); SND.play('win');
    var nx = TUTS[TUTS.indexOf(L) + 1];
    openModal({ title: 'Brawo! Lekcja ukończona', body: '<div style="display:flex;gap:14px;align-items:center"><img alt="" src="' + tutGuideURL() + '" style="width:96px;height:96px;flex:none"><p style="margin:0">Ukończyłeś lekcję „' + esc(L.title) + '”. Ukończone lekcje: <b>' + Object.keys(SET.tutDone).length + ' z ' + TUTS.length + '</b>.' + (nx ? ' Następna: „' + esc(nx.title) + '”.' : ' To była ostatnia lekcja – jesteś mistrzem studia!') + '</p></div>',
      actions: [{ label: 'Wszystkie lekcje', fn: function () { go('samouczki'); } }].concat(nx ? [{ label: 'Następna lekcja', cls: 'pri', fn: function () { tutStart(nx.id); } }] : []) });
  } else if (!silent) toast('Samouczek zamknięty. Wrócisz do niego w „Nauce z Cappy”.');
}
window.__tutSel = function () { if (!TUT) return null; var s = TUT.lesson.steps[TUT.i]; return { sel: s.sel, wait: s.wait || (s.check ? 'check' : '') }; };
ACT.tutHub = function () { go('samouczki'); };
ACT.tutStart = function (a) { tutStart(a.dataset.id); };
ROUTES.samouczki = function (v) {
  var D = tutDone(), n = TUTS.filter(function (t) { return D[t.id]; }).length, nx = TUTS.filter(function (t) { return !D[t.id]; })[0];
  v.innerHTML = '<div class="wrap" style="max-width:1180px">' +
    '<section class="th-hero"><img alt="" src="' + tutGuideURL() + '"><div><p class="small" style="margin:0;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--primary)">Nauka z Cappy</p><h1 style="margin:2px 0 6px">Samouczki krok po kroku</h1><p style="margin:0;max-width:62ch">Wybierz lekcję, a ja przeprowadzę cię przez studio. Pokażę palcem, gdzie kliknąć, i poczekam, aż to zrobisz. Każda lekcja trwa kilka minut i używa osobnej gry do ćwiczeń, więc twoje gry są bezpieczne.</p>' +
    '<div class="th-prog"><span>Ukończone: ' + n + ' z ' + TUTS.length + '</span><span class="tut-bar" aria-hidden="true"><i style="width:' + Math.round(n / TUTS.length * 100) + '%"></i></span></div>' +
    (nx ? '<div class="row" style="margin-top:12px"><button class="btn big acc" data-act="tutStart" data-id="' + nx.id + '">' + I.play + (n ? 'Dalej: ' + esc(nx.title) : 'Zacznij od początku') + '</button></div>' : '<p style="font-weight:700;margin:12px 0 0">Wszystkie lekcje ukończone – jesteś mistrzem studia!</p>') + '</div></section>' +
    TUT_CATS.map(function (c, ci) {
      var ls = TUTS.filter(function (t) { return t.cat === c.id; });
      return '<section class="th-cat" style="--c:' + c.color + '"><div><h2><i aria-hidden="true"></i>' + (ci + 1) + '. ' + c.name + '</h2><p class="small muted" style="margin:2px 0 0">' + c.desc + '</p></div><div class="th-grid">' + ls.map(function (t) {
        return '<button class="th-card" data-act="tutStart" data-id="' + t.id + '"><b>' + esc(t.title) + '</b><small>' + esc(t.desc) + '</small><span class="th-meta"><span>' + t.mins + ' min</span><span>' + t.steps.length + ' ' + plural(t.steps.length, 'krok', 'kroki', 'kroków') + '</span>' + (D[t.id] ? '<span class="done">✓ Ukończona</span>' : '') + (t.tpl ? '<span>gra do ćwiczeń</span>' : '') + '</span></button>';
      }).join('') + '</div></section>';
    }).join('') + '</div>';
};
