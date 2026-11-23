/* ---------------- icons ---------------- */
var I = (function () {
  function s(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  return {
    plus: s('<path d="M12 5v14M5 12h14"/>'), cards: s('<rect x="3" y="6" width="11" height="15" rx="2"/><path d="M8 3.5l10.5 2.3a2 2 0 0 1 1.5 2.4l-2.6 11.6"/><path d="M8.5 11.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.5-1.4 2-.3z"/>'), folder: s('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    help: s('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><path d="M12 17.5v.01"/>'),
    gear: s('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
    play: s('<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>'), pause: s('<path d="M8 5v14M16 5v14"/>'), stop: s('<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>'),
    undo: s('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'), redo: s('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'),
    copy: s('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>'), trash: s('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    save: s('<path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M7 3v6h8V3M7 21v-7h10v7"/>'),
    zin: s('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>'), zout: s('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/>'),
    back: s('<path d="M15 18l-6-6 6-6"/>'), next: s('<path d="M9 18l6-6-6-6"/>'), up: s('<path d="M6 15l6-6 6 6"/>'), down: s('<path d="M6 9l6 6 6-6"/>'),
    check: s('<path d="M5 12.5l4.5 4.5L19 7.5"/>'), x: s('<path d="M6 6l12 12M18 6L6 18"/>'),
    alert: s('<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/>'), info: s('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>'),
    bulb: s('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'), err: s('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>'),
    lock: s('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'), unlock: s('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>'),
    eye: s('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'), eyeoff: s('<path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/>'),
    download: s('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'), upload: s('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>'),
    cursor: s('<path d="M5 3l6 17 2.5-7.5L21 10z"/>'), brush: s('<path d="M18.4 3.6a2 2 0 0 1 2.8 2.8L12 15.6 8.4 12z"/><path d="M8.4 12C5 12 4 15 4 17c0 1.5-1 2.5-2 3 4 1 9 0 10-4.4"/>'),
    rect: s('<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 12h16M12 5v14" opacity=".5"/>'), eraser: s('<path d="M20 20H8l-4.6-4.6a2 2 0 0 1 0-2.8L13 3a2 2 0 0 1 2.8 0l5 5a2 2 0 0 1 0 2.8L12 19.6"/><path d="M7.5 9.5l7 7"/>'),
    hand: s('<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L3 14.6a1.5 1.5 0 0 1 2.4-1.8L8 15"/>'),
    full: s('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'), restart: s('<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v5h5"/>'),
    grid: s('<path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18"/>'), scene: s('<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/><circle cx="16" cy="8.5" r="1.5"/>'),
    object: s('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>'), behavior: s('<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8.5 6h7M7.2 8.2l3.6 7.6M16.8 8.2l-3.6 7.6"/>'),
    mech: s('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'), flow: s('<rect x="3" y="4" width="6" height="5" rx="1"/><rect x="15" y="4" width="6" height="5" rx="1"/><rect x="9" y="15" width="6" height="5" rx="1"/><path d="M9 6.5h6M6 9v3.5h6V15M18 9v3.5h-6"/>'),
    asset: s('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>'), test: s('<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>'),
    export: s('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'), project: s('<path d="M4 4h16v16H4z"/><path d="M4 9h16M9 9v11"/>'),
    flag: s('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
    star: s('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'), history: s('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/>'),
    variant: s('<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7M8.5 6.5c4 0 7 2 7.5 3.5M8.5 17.5c4 0 7-2 7.5-3.5"/>'), link: s('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    music: s('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'), package: s('<path d="M21 8l-9-5-9 5 9 5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>'),
    search: s('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'), dots: s('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
    prefab: s('<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M11 7h4a2 2 0 0 1 2 2v4"/>'), layers: s('<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'),
    sliders: s('<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="7" cy="18" r="2" fill="currentColor"/>')
  };
})();
var LVL = { error: ['Do naprawy', I.err], warn: ['Uwaga', I.alert], info: ['Info', I.info], tip: ['Podpowiedź', I.bulb] };
function lvChip(l) { return '<span class="lv ' + l + '">' + LVL[l][1] + LVL[l][0] + '</span>'; }
