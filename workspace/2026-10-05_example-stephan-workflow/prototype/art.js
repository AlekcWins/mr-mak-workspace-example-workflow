/* OVERLORD art kit: inline SVG icons, portraits, top-down unit sprites and
   building illustrations. Everything is generated code (no image files), so it
   can be restyled here and reused by the HUD and the workspace pages. */
(() => {
  const OW = (window.OW ||= {});

  /* ---------- Icons: 24×24 strokes, coloured with currentColor ---------- */
  const dots = pts => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7" fill="currentColor" stroke="none"/>`).join('');
  const ICONS = {
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    pattern: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    decision: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
    pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    castle: '<path d="M4 21V8h3V5h2v3h2V5h2v3h2V5h2v3h3v13z"/><path d="M10 21v-5a2 2 0 0 1 4 0v5"/>',
    cog: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    monitor: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    sword: '<path d="M4 20l3-3"/><path d="M5.5 14.5l4 4"/><path d="M7.5 16.5L19 5V4h-1L6.5 15.5"/>',
    tower: '<path d="M7 21V9L6 4h12l-1 5v12z"/><path d="M6 4h2v2h2V4h4v2h2V4h2"/><path d="M10 21v-4h4v4"/>',
    swords: '<path d="M5 3l9.5 9.5M19 3l-9.5 9.5"/><path d="M3 5V3h2M21 5V3h-2"/><path d="M8 13l-3 3M16 13l3 3M4 15l5 5M20 15l-5 5"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    note: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 12h8M8 16h6"/>',
    list: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11"/><circle cx="6" cy="18" r="1.4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    command: '<path d="M4 17l6-6-6-6M12 19h8"/>',
    loop: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5"/><path d="M4 3v5.5h5.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    // Game
    gold: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M14.6 9.6c-.4-.9-1.4-1.4-2.6-1.4-1.6 0-2.6.8-2.6 1.8 0 2.4 5.4 1.4 5.4 4 0 1.1-1.1 1.8-2.8 1.8-1.3 0-2.4-.5-2.8-1.5"/>',
    helmet: '<path d="M5 15a7 7 0 0 1 14 0v4h-5v-4h-4v4H5z"/><path d="M12 8v7"/>',
    rally: '<path d="M4 10v4h3l6 4V6l-6 4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
    charge: '<path d="M5 17l5-5-5-5M12 17l5-5-5-5"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
    banner: '<path d="M6 21V3"/><path d="M6 4h12v9l-6-2.5L6 13"/>',
    shields: '<path d="M3 7l4-2 4 2v4.5c0 3-2 5-4 6-2-1-4-3-4-6z"/><path d="M13 7l4-2 4 2v4.5c0 3-2 5-4 6-2-1-4-3-4-6z"/>',
    sprint: '<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',
    brace: '<path d="M4 20L18 6"/><path d="M14 5h5v5"/><path d="M4 14l6 6"/>',
    volley: '<path d="M3 13L13 3M9 3h4v4"/><path d="M7 17L17 7M13 7h4v4"/><path d="M11 21L21 11M17 11h4v4"/>',
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 0 2 1 3 2 3 0-3-1-5.5.5-8z"/>',
    pierce: '<path d="M3 12h15M14 8l4 4-4 4"/><path d="M10 5v14"/>',
    lance: '<path d="M3 21L16 8"/><path d="M14 4h6v6l-4-2z"/><path d="M6 14l4 4"/>',
    mend: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v9M7.5 12h9"/>',
    chill: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M10 5l2 2 2-2M10 19l2-2 2 2"/>',
    claw: '<path d="M6 4c2 5 2 11 0 16M12 4c2 5 2 11 0 16M18 4c2 5 2 11 0 16"/>',
    arrowShot: '<path d="M4 20L18 6"/><path d="M12 6h6v6"/><path d="M4 16v4h4"/>',
    skull: '<path d="M12 3a7 7 0 0 0-7 7c0 3 2 4 2 6v2h10v-2c0-2 2-3 2-6a7 7 0 0 0-7-7z"/><circle cx="9.5" cy="11" r="1.4"/><circle cx="14.5" cy="11" r="1.4"/><path d="M10 21v-3M14 21v-3"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    hammer: '<path d="M14 3l7 7-3 3-7-7z"/><path d="M12.5 8.5L4 17l3 3 8.5-8.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    beacon: '<path d="M8 21h8M9 21l1-9h4l1 9"/><path d="M12 9c-2-2-1-4 0-6 1 2 2 4 0 6z"/><path d="M5 6l2 1M19 6l-2 1"/>',
    wheat: '<path d="M12 22V9"/><path d="M12 9c-3-.5-4-3-4-5 3 0 4 2.5 4 5zm0 0c3-.5 4-3 4-5-3 0-4 2.5-4 5z"/><path d="M12 15c-3-.5-4-3-4-5 3 0 4 2.5 4 5zm0 0c3-.5 4-3 4-5-3 0-4 2.5-4 5z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
    focus: '<circle cx="12" cy="12" r="3.5"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',
    arrowIcon: '<path d="M4 20L18 6"/><path d="M12 6h6v6"/>',
    'f-line': dots([[4, 12], [9.3, 12], [14.7, 12], [20, 12], [6.7, 17], [12, 17], [17.3, 17]]),
    'f-column': dots([[9, 4], [15, 4], [9, 9.3], [15, 9.3], [9, 14.6], [15, 14.6], [9, 20], [15, 20]]),
    'f-wedge': dots([[12, 5], [8.5, 10], [15.5, 10], [5, 15], [12, 15], [19, 15], [8.5, 20], [15.5, 20]]),
    'f-loose': dots([[5, 6], [13, 4.5], [19, 9], [8, 12.5], [15.5, 14], [4.5, 19], [12, 20], [19.5, 19]]),
  };
  const icon = (name, cls = '') =>
    `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.target}</svg>`;

  /* ---------- Brand and faction emblems ---------- */
  const emblem = (cls = '') => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="ow-em-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e4f4"/><stop offset="1" stop-color="#8f88a8"/></linearGradient></defs>
    <path d="M32 6c-6 6-17 8-24 6 1 14 6 26 14 31M32 6c6 6 17 8 24 6-1 14-6 26-14 31" fill="none" stroke="#8b7cf6" stroke-width="1.4" opacity=".75"/>
    <path d="M12 16c5 1 10 0 14-3M52 16c-5 1-10 0-14-3" fill="none" stroke="#8b7cf6" stroke-width="1" opacity=".5"/>
    <path d="M32 9l3 6v29l-3 6-3-6V15z" fill="url(#ow-em-steel)"/>
    <path d="M22 44h20" stroke="#d9b45a" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M32 46v10" stroke="#6b5537" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="58.5" r="2.4" fill="#d9b45a"/>
    <path d="M27 6l2 3h6l2-3-2.5 1.5L32 4l-2.5 3.5z" fill="#d9b45a"/>
  </svg>`;

  const factionCrest = kind => {
    const c = {
      varn: { fill: '#22355f', rim: '#7ea4f0', glyph: '<path d="M22 42V26h4v-5h3v5h6v-5h3v5h4v16z" fill="#c9d6f5"/><path d="M29 42v-6a3 3 0 0 1 6 0v6" fill="#22355f"/>' },
      barrow: { fill: '#3a1517', rim: '#e2555a', glyph: '<path d="M32 18a10 10 0 0 0-10 10c0 4 3 6 3 8v4h14v-4c0-2 3-4 3-8a10 10 0 0 0-10-10z" fill="#d8cfb4"/><circle cx="28" cy="29" r="2.4" fill="#3a1517"/><circle cx="36" cy="29" r="2.4" fill="#3a1517"/><path d="M29 40v3M32 40v3M35 40v3" stroke="#3a1517" stroke-width="1.4"/>' },
      villages: { fill: '#26361f', rim: '#9cc46a', glyph: '<path d="M32 44V22" stroke="#e3cf8a" stroke-width="2"/><path d="M32 26c-4-1-6-4-6-7 4 0 6 3 6 7zm0 0c4-1 6-4 6-7-4 0-6 3-6 7zM32 34c-4-1-6-4-6-7 4 0 6 3 6 7zm0 0c4-1 6-4 6-7-4 0-6 3-6 7z" fill="#e3cf8a"/>' },
    }[kind] || {};
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6l20 7v16c0 13-9 22-20 29C21 51 12 42 12 29V13z" fill="${c.fill}" stroke="${c.rim}" stroke-width="1.6"/>${c.glyph || ''}</svg>`;
  };

  /* ---------- Portraits: 96×96 busts ---------- */
  const SKIN = '#c8957a', SKIN_D = '#9c6c55';
  const bgFor = kind => {
    const enemy = ['wight', 'hound', 'bone-archer', 'barrow'].includes(kind);
    if (kind === 'general') return ['#5a4520', '#140f08'];
    return enemy ? ['#5a1f20', '#120808'] : ['#2b3756', '#0c0f17'];
  };
  const face = (y = 47, beard = '') => `
    <rect x="41" y="${y + 10}" width="14" height="12" fill="${SKIN_D}"/>
    <ellipse cx="48" cy="${y}" rx="13" ry="15" fill="${SKIN}"/>
    <path d="M48 ${y - 15}a13 15 0 0 1 0 30 9 15 0 0 0 0-30z" fill="${SKIN_D}" opacity=".45"/>
    <ellipse cx="43" cy="${y + 1}" rx="1.8" ry="1.3" fill="#2a1d18"/><ellipse cx="53" cy="${y + 1}" rx="1.8" ry="1.3" fill="#2a1d18"/>
    <path d="M40 ${y - 3}h6M50 ${y - 3}h6" stroke="#5b3d2e" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M45 ${y + 9}q3 1.6 6 0" stroke="#7a4a3a" stroke-width="1.2" fill="none" stroke-linecap="round"/>${beard}`;
  const steel = id => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d5dbe4"/><stop offset=".55" stop-color="#8e97a5"/><stop offset="1" stop-color="#4c535f"/></linearGradient>`;
  const shoulders = (fill, extra = '') => `<path d="M6 96C8 77 24 67 48 67s40 10 42 29z" fill="${fill}"/>${extra}`;

  const PORTRAITS = {
    general: id => `<defs>${steel(id + 's')}<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d27a"/><stop offset="1" stop-color="#a77a26"/></linearGradient></defs>
      <path d="M0 96C2 70 20 56 48 56s46 14 48 40z" fill="#8e1f24"/><path d="M0 96C2 70 20 56 48 56" fill="none" stroke="#b8323a" stroke-width="2"/>
      ${shoulders('#3a4252')}
      <ellipse cx="22" cy="77" rx="15" ry="9" fill="url(#${id}s)"/><ellipse cx="74" cy="77" rx="15" ry="9" fill="url(#${id}s)"/>
      <ellipse cx="22" cy="77" rx="15" ry="9" fill="none" stroke="url(#${id}g)" stroke-width="2"/><ellipse cx="74" cy="77" rx="15" ry="9" fill="none" stroke="url(#${id}g)" stroke-width="2"/>
      <path d="M40 70h16l-3 26H43z" fill="#2a4a96"/><path d="M48 74l3 5-3 5-3-5z" fill="url(#${id}g)"/>
      ${face(45, `<path d="M35 50q13 28 26 0-3 10-13 11-10-1-13-11z" fill="#c9c2b4"/><path d="M42 55q6 3 12 0" stroke="#8d867a" stroke-width="1.4" fill="none"/>`)}
      <path d="M35 40q-1-14 13-15 14 1 13 15-3-7-13-7t-13 7z" fill="#bdb6a8"/>
      <path d="M34 37l3-9 4 5 3-8 4 7 4-7 3 8 4-5 3 9z" fill="url(#${id}g)" stroke="#6d5016" stroke-width=".8"/>
      <circle cx="48" cy="31" r="1.8" fill="#c9343c"/>
      <path d="M56 44l3 9" stroke="#8a5545" stroke-width="1.2" opacity=".7"/>`,
    swordsman: id => `<defs>${steel(id + 's')}</defs>
      ${shoulders(`url(#${id}s)`)}<path d="M36 70h24l-3 26H39z" fill="#2f5bb7"/><path d="M48 74v18M42 81h12" stroke="#d9e2f5" stroke-width="2"/>
      ${face(48, '<path d="M37 52q11 14 22 0" stroke="#7b5440" stroke-width="2.4" fill="none" opacity=".55"/>')}
      <path d="M31 43q17-30 34 0z" fill="url(#${id}s)"/><ellipse cx="48" cy="43" rx="24" ry="5" fill="#6f7784"/><ellipse cx="48" cy="42" rx="24" ry="4" fill="none" stroke="#c4cad4" stroke-width="1"/>
      <circle cx="40" cy="34" r="1" fill="#e9edf3"/><circle cx="48" cy="31" r="1" fill="#e9edf3"/><circle cx="56" cy="34" r="1" fill="#e9edf3"/>`,
    spearman: id => `<defs>${steel(id + 's')}</defs>
      <path d="M82 96L90 6" stroke="#7a5a34" stroke-width="3"/><path d="M90 2l-4 9h8z" fill="#d6dbe3"/>
      ${shoulders('#5d636d')}<path d="M18 80q30-12 60 0" stroke="#7d848f" stroke-width="5" stroke-dasharray="2 2" fill="none"/>
      <path d="M38 70h20l-2 26H40z" fill="#2f5bb7"/>
      <path d="M33 58q15 10 30 0v8q-15 8-30 0z" fill="#7d848f"/>
      ${face(48)}
      <path d="M33 44L48 19l15 25z" fill="url(#${id}s)"/><rect x="46.5" y="38" width="3" height="13" rx="1" fill="#9aa3b0"/>`,
    archer: id => `<defs><linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a6b3c"/><stop offset="1" stop-color="#26391f"/></linearGradient></defs>
      <path d="M78 6q22 42 0 88" stroke="#8a5a2b" stroke-width="3" fill="none"/><path d="M78 6v88" stroke="#d8d2c0" stroke-width=".8"/>
      ${shoulders('#3a4a2e')}<path d="M20 70L74 96" stroke="#6b4a2a" stroke-width="4"/>
      ${face(49)}
      <path d="M26 66q-4-42 22-44 26 2 22 44-6-12-22-14-16 2-22 14z" fill="url(#${id}h)"/>
      <path d="M35 40q13-8 26 0" stroke="#1e2d18" stroke-width="3" fill="none" opacity=".6"/>`,
    crossbow: id => `<defs>${steel(id + 's')}</defs>
      ${shoulders('#4a5160')}<path d="M38 70h20l-2 26H40z" fill="#2f5bb7"/>
      <path d="M62 64l26-8M78 50l6 16" stroke="#6b4a2a" stroke-width="3" stroke-linecap="round"/>
      ${face(50)}
      <ellipse cx="48" cy="40" rx="27" ry="6" fill="#6b7380"/><path d="M34 40q14-24 28 0z" fill="url(#${id}s)"/><ellipse cx="48" cy="39" rx="27" ry="5" fill="none" stroke="#c4cad4" stroke-width="1"/>`,
    knight: id => `<defs>${steel(id + 's')}</defs>
      <path d="M52 22q10-20 26-14-12 2-18 14z" fill="#b8323a"/>
      ${shoulders(`url(#${id}s)`)}<path d="M34 70h28l-4 26H38z" fill="#2f5bb7"/><path d="M48 72l6 9-6 9-6-9z" fill="#d9b45a"/>
      <path d="M30 30q18-16 36 0v32q-18 8-36 0z" fill="url(#${id}s)"/>
      <rect x="33" y="41" width="30" height="3.6" rx="1" fill="#14161b"/><path d="M48 44v16" stroke="#5b626e" stroke-width="2"/>
      <g fill="#14161b"><circle cx="41" cy="52" r="1"/><circle cx="41" cy="56" r="1"/><circle cx="55" cy="52" r="1"/><circle cx="55" cy="56" r="1"/></g>`,
    priest: id => `<defs><radialGradient id="${id}h"><stop offset=".7" stop-color="#f1d688" stop-opacity="0"/><stop offset=".85" stop-color="#f1d688" stop-opacity=".55"/><stop offset="1" stop-color="#f1d688" stop-opacity="0"/></radialGradient></defs>
      <circle cx="48" cy="42" r="30" fill="url(#${id}h)"/>
      ${shoulders('#e6dfcd')}<path d="M40 68l-3 28M56 68l3 28" stroke="#d9b45a" stroke-width="3"/>
      ${face(49)}
      <path d="M27 66q-4-42 21-44 25 2 21 44-6-12-21-14-15 2-21 14z" fill="#efe9da"/><path d="M33 34q15-8 30 0" stroke="#d9b45a" stroke-width="2" fill="none"/>`,
    wight: id => `<defs><radialGradient id="${id}e"><stop offset="0" stop-color="#ff6b4a"/><stop offset=".4" stop-color="#ff2d1f" stop-opacity=".6"/><stop offset="1" stop-color="#ff2d1f" stop-opacity="0"/></radialGradient></defs>
      <path d="M18 80L24 30q24-26 48 0l6 50-8-8-6 8-6-8-6 8-6-8-6 8-6-8-6 8z" fill="#1d1a1f"/>
      ${shoulders('#4d3e33')}<path d="M18 82l10-6 6 8 8-6 6 8 6-8 8 6 6-8 10 6" stroke="#2a2123" stroke-width="3" fill="none"/>
      <ellipse cx="48" cy="52" rx="16" ry="20" fill="#0e0c10"/>
      <ellipse cx="48" cy="50" rx="13" ry="16" fill="#cdc6ad"/><path d="M48 34a13 16 0 0 1 0 32 9 16 0 0 0 0-32z" fill="#8f876f" opacity=".5"/>
      <ellipse cx="42.5" cy="48" rx="4" ry="4.6" fill="#1b0d0d"/><ellipse cx="53.5" cy="48" rx="4" ry="4.6" fill="#1b0d0d"/>
      <circle cx="42.5" cy="48" r="8" fill="url(#${id}e)"/><circle cx="53.5" cy="48" r="8" fill="url(#${id}e)"/>
      <circle cx="42.5" cy="48" r="1.6" fill="#ffd2c4"/><circle cx="53.5" cy="48" r="1.6" fill="#ffd2c4"/>
      <path d="M48 53l-2 5h4z" fill="#1b0d0d"/><path d="M41 61h14M44 59v4M48 59v4M52 59v4" stroke="#3a2a22" stroke-width="1.2"/>
      <path d="M31 46q17-26 34 0q-4-14-17-15-13 1-17 15z" fill="#1d1a1f"/>`,
    hound: id => `<defs><radialGradient id="${id}e"><stop offset="0" stop-color="#ff6b4a"/><stop offset="1" stop-color="#ff2d1f" stop-opacity="0"/></radialGradient></defs>
      <path d="M8 96q4-34 34-40l26 6q18 10 20 34z" fill="#231f1f"/>
      <path d="M26 34l-6-22 16 14zM58 30l10-20 2 22z" fill="#2e2828"/>
      <path d="M24 40q12-18 34-14 16 4 20 22l-4 14q-10 8-22 6l-14-6q-14-8-14-22z" fill="#2e2828"/>
      <path d="M60 54q12 6 18 0l-2 8q-8 6-16 2z" fill="#1a1616"/><path d="M62 60l2 4 2-4 2 4 2-4 2 4" stroke="#e9e2cf" stroke-width="1" fill="none"/>
      <circle cx="44" cy="40" r="7" fill="url(#${id}e)"/><circle cx="60" cy="38" r="7" fill="url(#${id}e)"/>
      <circle cx="44" cy="40" r="1.8" fill="#ffd2c4"/><circle cx="60" cy="38" r="1.8" fill="#ffd2c4"/>
      <path d="M30 30l6 4M36 26l4 5M44 24l2 5" stroke="#cfc6aa" stroke-width="1.6" stroke-linecap="round"/>`,
    'bone-archer': id => `<defs><radialGradient id="${id}e"><stop offset="0" stop-color="#ff6b4a"/><stop offset="1" stop-color="#ff2d1f" stop-opacity="0"/></radialGradient></defs>
      <path d="M80 8q20 40 0 84" stroke="#cfc6aa" stroke-width="3" fill="none"/><path d="M80 8v84" stroke="#8f876f" stroke-width=".8"/>
      ${shoulders('#3a2f2a')}<path d="M30 76q18 10 36 0M32 84q16 8 32 0" stroke="#cfc6aa" stroke-width="2" fill="none"/>
      <ellipse cx="48" cy="50" rx="12" ry="15" fill="#d6cfb6"/>
      <ellipse cx="43" cy="48" rx="3.6" ry="4.2" fill="#1b0d0d"/><ellipse cx="53" cy="48" rx="3.6" ry="4.2" fill="#1b0d0d"/>
      <circle cx="43" cy="48" r="6" fill="url(#${id}e)"/><circle cx="53" cy="48" r="6" fill="url(#${id}e)"/>
      <path d="M42 60h12M45 58v4M48 58v4M51 58v4" stroke="#3a2a22" stroke-width="1.2"/>
      <path d="M33 42q2-16 15-16 13 0 15 16l-6-4-3 4-6-5-6 5-3-4z" fill="#5a5146"/>`,
    keep: () => `<path d="M10 90h76v6H10z" fill="#2b2f24"/>
      <path d="M16 46h64v44H16z" fill="#8d887d"/><path d="M16 46h64v6H16z" fill="#a9a396"/>
      <path d="M16 46v-5h5v5h5v-5h5v5h5v-5h5v5h5v-5h5v5h5v-5h5v5h5v-5h5v5" fill="#a9a396"/>
      <path d="M8 30h16v60H8zM72 30h16v60H72z" fill="#7a756a"/><path d="M6 31L16 10l10 21zM70 31L80 10l10 21z" fill="#3d5ba3"/><path d="M16 10l10 21h-10zM80 10l10 21H80z" fill="#2a417c"/>
      <path d="M34 32h28v30H34z" fill="#9a9488"/><path d="M31 33L48 6l17 27z" fill="#4a6bb5"/><path d="M48 6l17 27H48z" fill="#2f4a8a"/>
      <path d="M40 90V74q8-10 16 0v16z" fill="#2a1f19"/><path d="M42 90V76q6-7 12 0v14z" fill="#7a3b26"/>
      <rect x="44" y="40" width="3" height="7" rx="1.5" fill="#1c1a17"/><rect x="50" y="40" width="3" height="7" rx="1.5" fill="#1c1a17"/>
      <path d="M48 6V0M48 0h8l-2 2 2 2h-8" stroke="#2f5bb7" stroke-width="1.2" fill="#2f5bb7"/>`,
    watchtower: () => `<path d="M14 90h68v6H14z" fill="#2b2f24"/>
      <path d="M34 40h28v50H34z" fill="#8d887d"/><path d="M34 40h6v50h-6z" fill="#a9a396"/>
      <path d="M28 30h40v12H28z" fill="#6b4a2e"/><path d="M28 30h40" stroke="#3d2a1a" stroke-width="2"/>
      <path d="M24 31L48 8l24 23z" fill="#8a4f33"/><path d="M48 8l24 23H48z" fill="#5e3522"/>
      <rect x="45" y="56" width="6" height="10" rx="3" fill="#1c1a17"/><path d="M48 8V0h8l-2 2.5 2 2.5h-8" fill="#2f5bb7" stroke="#2f5bb7"/>`,
    farmstead: () => `<path d="M6 90h84v6H6z" fill="#2b2f24"/>
      <path d="M10 56h40v34H10z" fill="#9a8a70"/><path d="M6 58l24-22 24 22z" fill="#b08850"/><path d="M30 36l24 22H30z" fill="#8a6639"/>
      <rect x="25" y="72" width="10" height="18" fill="#4a3324"/>
      <path d="M68 90V40h10v50z" fill="#9a8f7e"/><path d="M64 42l9-12 9 12z" fill="#7a3a28"/>
      <g transform="translate(73 38)" stroke="#6b5a42" stroke-width="1"><path d="M0 0l-22-14 3-4zM0 0l14-22 4 3zM0 0l22 14-3 4zM0 0l-14 22-4-3z" fill="#e2d7bf"/></g><circle cx="73" cy="38" r="2.6" fill="#4a3a2a"/>`,
    barrow: id => `<defs><radialGradient id="${id}g" cx=".4" cy=".75"><stop offset="0" stop-color="#ff3b2a" stop-opacity=".9"/><stop offset="1" stop-color="#ff3b2a" stop-opacity="0"/></radialGradient></defs>
      <path d="M2 92q10-46 46-50 36 4 46 50z" fill="#33402a"/><path d="M2 92q10-46 46-50" stroke="#4d5c3a" stroke-width="2" fill="none"/>
      <circle cx="40" cy="78" r="20" fill="url(#${id}g)"/>
      <path d="M28 92V66h6v26zM46 92V66h6v26z" fill="#8a867c"/><path d="M24 62h32v6H24z" fill="#a19d92"/><path d="M34 92V68h12v24z" fill="#0b0606"/>
      <path d="M66 50q2-14 8-20M72 38l8-4M70 44l-6-6" stroke="#2a2219" stroke-width="2.4" stroke-linecap="round" fill="none"/>`,
  };

  const portrait = (kind, cls = '') => {
    const id = `pt-${kind}`;
    const [inner, outer] = bgFor(kind);
    const body = (PORTRAITS[kind] || PORTRAITS.swordsman)(id);
    return `<svg class="portrait ${cls}" viewBox="0 0 96 96" aria-hidden="true"><defs><radialGradient id="${id}-bg" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="${inner}"/><stop offset="1" stop-color="${outer}"/></radialGradient></defs><rect width="96" height="96" fill="url(#${id}-bg)"/>${body}</svg>`;
  };

  /* ---------- Top-down unit sprites (local origin, facing up) ---------- */
  const OWN = { main: '#3566c8', dark: '#1f3c7a', trim: '#a7b3c9' };
  const SPRITES = {
    general: `<path d="M-9 0q-2 12 9 14 11-2 9-14z" fill="#9b2228"/><circle r="7.6" fill="#2a4a96"/><circle r="7.6" fill="none" stroke="#d9b45a" stroke-width="1.2"/>
      <circle cy="-1" r="4.4" fill="#c5ccd6"/><circle cy="-1" r="4.4" fill="none" stroke="#e7c35a" stroke-width="1.5" stroke-dasharray="1.6 1.2"/>
      <path d="M7.2 2V-14" stroke="#f0f2f6" stroke-width="2" stroke-linecap="round"/><path d="M4.7 1h5" stroke="#d9b45a" stroke-width="1.6"/>`,
    swordsman: `<path d="M-9 -4h5v8.5q-2.5 2.6-5 0z" fill="${OWN.dark}" stroke="${OWN.trim}" stroke-width=".8"/><circle r="6.2" fill="${OWN.main}"/>
      <circle cy="-.5" r="3.6" fill="#b9c0cb"/><circle cx="-1" cy="-1.6" r="1.2" fill="#eef1f6" opacity=".8"/>
      <path d="M5.5 2V-11" stroke="#dfe4ec" stroke-width="1.6" stroke-linecap="round"/><path d="M3.5 1h4" stroke="#8a6a3a" stroke-width="1.4"/>`,
    spearman: `<circle cx="-6" cy="1" r="3.4" fill="${OWN.dark}" stroke="${OWN.trim}" stroke-width=".7"/><circle r="6" fill="${OWN.main}"/>
      <path d="M0-4.6L3.2 0 0 1.2-3.2 0z" fill="#b9c0cb"/><circle cy="-.6" r="3" fill="#aab2be"/>
      <path d="M4.5 7V-19" stroke="#8a6a3a" stroke-width="1.3"/><path d="M4.5-21l-1.7 3.4h3.4z" fill="#e3e7ee"/>`,
    archer: `<rect x="1.5" y="2" width="3" height="7" rx="1" fill="#6b4a2a"/><circle r="5.8" fill="${OWN.main}"/><circle cy="-.4" r="3.6" fill="#3d5a34"/>
      <path d="M-7-5q7-7.5 14 0" stroke="#8a5a2b" stroke-width="1.5" fill="none"/><path d="M-7-5h14" stroke="#e1dccb" stroke-width=".5"/>`,
    crossbow: `<circle r="6" fill="${OWN.main}"/><circle cy="-.4" r="4.6" fill="#7d8592"/><circle cy="-.4" r="3" fill="#b2b9c4"/>
      <path d="M-6.5-8.5h13" stroke="#6b4a2a" stroke-width="1.7" stroke-linecap="round"/><path d="M0-11v8" stroke="#6b4a2a" stroke-width="1.9"/>`,
    knight: `<ellipse cy="2" rx="5.6" ry="12" fill="#5a3d2a"/><ellipse cy="-11.5" rx="3" ry="4.6" fill="#4a3222"/>
      <ellipse cy="3" rx="6.4" ry="7.6" fill="#2a54a8"/><path d="M-6.4 3h12.8" stroke="#d9b45a" stroke-width=".8"/>
      <circle cy="1" r="4.6" fill="${OWN.main}"/><circle cy=".5" r="3" fill="#c3c9d3"/><circle cy="-1" r="1.1" fill="#b8323a"/>
      <path d="M4 6L6.5-21" stroke="#d8c59a" stroke-width="1.3" stroke-linecap="round"/>`,
    priest: `<circle r="6" fill="#e8e1cf"/><circle r="6" fill="none" stroke="#d9b45a" stroke-width="1"/><circle r="3.2" fill="#f6f2e8"/>
      <path d="M0-5v10M-3 0h6" stroke="#d9b45a" stroke-width="1"/><path d="M6.4 4v-13" stroke="#8a6a3a" stroke-width="1.2"/><circle cx="6.4" cy="-10" r="1.8" fill="#ffe9a8"/>`,
    wight: `<path d="M0-8l5 3 2.5 6-1.5 6-3-2-3 3.5-3-3.5-3 2-1.5-6 2.5-6z" fill="#2a2329"/><circle r="7" fill="none" stroke="#8a1f1f" stroke-width=".8" opacity=".8"/>
      <circle cy="-1.5" r="3.6" fill="#cfc6aa"/><circle cx="-1.3" cy="-3" r=".95" fill="#ff4636"/><circle cx="1.3" cy="-3" r=".95" fill="#ff4636"/>
      <path d="M5 2v-12" stroke="#8a6d5a" stroke-width="1.5" stroke-linecap="round"/>`,
    hound: `<ellipse cy="1" rx="4.3" ry="10" fill="#2b2626"/><ellipse cy="-9" rx="3" ry="4" fill="#353030"/>
      <path d="M-2.6-11l-1-3.5 2 1.5zM2.6-11l1-3.5-2 1.5z" fill="#2b2626"/><path d="M0-5v13" stroke="#cfc6aa" stroke-width="1" stroke-dasharray="1.2 1.4"/>
      <circle cx="-1.2" cy="-10.5" r=".8" fill="#ff4636"/><circle cx="1.2" cy="-10.5" r=".8" fill="#ff4636"/>`,
    'bone-archer': `<path d="M0-6.5l4.5 2.5 2 5-1.5 5-5 2-5-2-1.5-5 2-5z" fill="#2a2329"/><circle cy="-1" r="3.3" fill="#d6cfb6"/>
      <circle cx="-1.2" cy="-2.4" r=".85" fill="#ff4636"/><circle cx="1.2" cy="-2.4" r=".85" fill="#ff4636"/>
      <path d="M-6.5-5q6.5-7 13 0" stroke="#cfc6aa" stroke-width="1.4" fill="none"/>`,
  };
  const RADIUS = { general: 9.5, knight: 8, hound: 7 };
  const sprite = type => {
    const r = RADIUS[type] || 7;
    return `<ellipse cx="2.5" cy="3.5" rx="${r}" ry="${r * 0.8}" fill="#000" opacity=".38"/>${SPRITES[type] || SPRITES.swordsman}<circle class="u-flash" r="${r + 1}" fill="#fff"/>`;
  };

  /* ---------- Buildings in world space (local origin at the centre) ---------- */
  const tower = (x, y, r = 25) => `<g transform="translate(${x} ${y})">
    <circle cy="${r * 0.28}" r="${r}" fill="#5f5a51"/><circle r="${r}" fill="#a39d90"/>
    <circle r="${r - 1}" fill="none" stroke="#cbc5b6" stroke-width="3" stroke-dasharray="4.5 3.5"/>
    <circle r="${r * 0.76}" fill="url(#ow-roof)"/>
    <path d="M0 0V${-r * 0.76}M0 0L${r * 0.66} ${r * 0.38}M0 0L${-r * 0.66} ${r * 0.38}M0 0L${r * 0.52} ${-r * 0.52}M0 0L${-r * 0.52} ${-r * 0.52}" stroke="#1f2f5a" stroke-width=".8" opacity=".55"/>
    <circle r="2.4" fill="#d9b45a"/></g>`;
  const flag = (x, y, color = '#2f5bb7', delay = 0) => `<g transform="translate(${x} ${y})"><path d="M0 0V-18" stroke="#3a2f22" stroke-width="1.6"/><path class="flag-cloth" style="animation-delay:${delay}s" d="M0-18h13l-3 3.6 3 3.6H0z" fill="${color}"/></g>`;
  const windows = (x0, y, n, gap) => Array.from({ length: n }, (_, i) => `<rect x="${x0 + i * gap}" y="${y}" width="5" height="9" rx="2.5" fill="#1d1a17"/>`).join('');

  const BUILDINGS = {
    keep: `<rect x="-140" y="-114" width="288" height="256" rx="18" fill="#000" opacity=".16" transform="translate(12 14)"/>
      <rect x="-118" y="-100" width="236" height="210" fill="url(#ow-cobble)"/>
      <rect x="-112" y="-96" width="224" height="10" fill="#000" opacity=".26"/><rect x="-112" y="-96" width="9" height="198" fill="#000" opacity=".18"/>
      <rect x="-128" y="117" width="256" height="14" fill="#68635a"/><rect x="127" y="-112" width="8" height="243" fill="#4d4943"/>
      <path d="M-120-104H120V110H-120Z" fill="none" stroke="#a8a294" stroke-width="16"/>
      <path d="M-127-111H127V117H-127Z" fill="none" stroke="#cbc5b6" stroke-width="3" stroke-dasharray="5 4"/>
      <path d="M-113-97H113V103H-113Z" fill="none" stroke="#8b8577" stroke-width="2"/>
      <g class="keep-props"><circle cx="-82" cy="64" r="9" fill="#77726a"/><circle cx="-82" cy="64" r="5.5" fill="#1d2a30"/>
        <circle cx="-92" cy="-62" r="8" fill="#c9a24e"/><circle cx="-78" cy="-70" r="6" fill="#b8913f"/>
        <circle cx="86" cy="70" r="4.5" fill="#6b4a2e"/><circle cx="96" cy="66" r="4.5" fill="#6b4a2e"/><circle cx="91" cy="76" r="4.5" fill="#5d3f27"/>
        <rect x="64" y="-84" width="34" height="18" fill="#5a4330"/><path d="M62-84h38l-4-8H66z" fill="#7a5a3a"/></g>
      <rect x="-64" y="18" width="128" height="32" fill="#7d776c"/>${windows(-52, 26, 5, 11)}${windows(16, 26, 4, 11)}
      <path d="M-9 50V38q9-8 18 0v12z" fill="#2a2018"/>
      <path d="M-68-70H68L40-26H-40Z" fill="#5876bd"/><path d="M-68-70L-40-26-68 18Z" fill="#4a67a8"/>
      <path d="M68-70L40-26 68 18Z" fill="#2c447d"/><path d="M-68 18H68L40-26H-40Z" fill="#3a5594"/>
      <path d="M-58 8H58M-50-4H50M-44-15H44" stroke="#2c4378" stroke-width="1" opacity=".7"/>
      <path d="M-68-70L-40-26M68-70L40-26M-68 18L-40-26M68 18L40-26" stroke="#24366a" stroke-width="1.2"/>
      <path d="M-40-26H40" stroke="#c8d4f0" stroke-width="2.5"/>
      ${tower(-66, -68, 14)}${tower(66, -68, 14)}${tower(-66, 18, 12)}${tower(66, 18, 12)}${tower(0, -26, 11)}
      <rect x="-36" y="94" width="26" height="30" fill="#9d978a"/><rect x="10" y="94" width="26" height="30" fill="#9d978a"/>
      <rect x="-36" y="124" width="26" height="9" fill="#625d54"/><rect x="10" y="124" width="26" height="9" fill="#625d54"/>
      <path d="M-36 94l13-9 13 9zM10 94l13-9 13 9z" fill="#3d5ba3"/>
      <rect x="-10" y="104" width="20" height="28" fill="#2a2420"/><path d="M-8 133V116q8-8 16 0v17z" fill="#7a3b26"/><path d="M0 109v24M-8 122h16" stroke="#4a2416" stroke-width="1"/>
      ${tower(-120, -104)}${tower(120, -104)}${tower(-120, 110)}${tower(120, 110)}
      ${flag(-23, 85, '#2f5bb7', 0)}${flag(23, 85, '#2f5bb7', 0.4)}${flag(0, -37, '#9b2228', 0.8)}${flag(-120, -122, '#2f5bb7', 0.2)}${flag(120, -122, '#2f5bb7', 0.6)}
      <g class="keep-fire"><g class="fire"><circle cx="96" cy="-104" r="9"/><circle cx="104" cy="-110" r="6"/><circle cx="122" cy="-62" r="8"/><circle cx="72" cy="-60" r="6"/></g>
        <g class="smoke"><circle cx="98" cy="-120" r="10"/><circle cx="122" cy="-78" r="12"/><circle cx="74" cy="-74" r="9"/></g></g>`,
    watchtower: `<rect x="-24" y="-22" width="52" height="60" rx="8" fill="#000" opacity=".22" transform="translate(8 9)"/>
      <rect x="-18" y="-12" width="36" height="30" fill="#9b9588"/><rect x="-18" y="18" width="36" height="11" fill="#5d584f"/>
      <rect x="-23" y="-26" width="46" height="24" fill="#6b4a2e" stroke="#3d2a1a" stroke-width="1.5"/><rect x="-23" y="-2" width="46" height="6" fill="#4a3220"/>
      <path d="M-25-28L0-40 25-28 0-16z" fill="#8a4f33"/><path d="M0-40L25-28 0-16z" fill="#5e3522"/><path d="M-25-28L0-16V-12L-25-24z" fill="#74412a"/>
      ${flag(0, -40, '#2f5bb7', 0.3)}`,
    farmstead: `<g fill="#000" opacity=".2" transform="translate(8 9)"><rect x="-70" y="-38" width="58" height="40"/><rect x="12" y="-8" width="46" height="34"/><rect x="-48" y="30" width="72" height="44"/></g>
      <path d="M-74 4V-40M-74 4H70M70 4V80M-74 4V84H70" fill="none" stroke="#6b5236" stroke-width="2" stroke-dasharray="2 5"/>
      <rect x="-66" y="-10" width="52" height="10" fill="#8a7a62"/><path d="M-68-40H-12V-24H-68z" fill="#b08850"/><path d="M-68-24H-12V-8H-68z" fill="#8a6639"/><path d="M-68-24H-12" stroke="#d1ad70" stroke-width="2"/>
      <rect x="-48" y="-6" width="7" height="6" fill="#2b1f15"/>
      <rect x="14" y="18" width="42" height="8" fill="#8a7a62"/><path d="M12-8H58V6H12z" fill="#a0533a"/><path d="M12 6H58V20H12z" fill="#7a3a28"/><path d="M12 6H58" stroke="#c26a4d" stroke-width="1.6"/>
      <rect x="-46" y="62" width="68" height="10" fill="#4a3424"/><path d="M-48 30H24V46H-48z" fill="#6a4c34"/><path d="M-48 46H24V62H-48z" fill="#4f3826"/><path d="M-48 46H24" stroke="#8a6a48" stroke-width="1.6"/>
      <circle cx="30" cy="-28" r="8" fill="#77726a"/><circle cx="30" cy="-28" r="4.5" fill="#1d2a30"/>
      <circle cx="54" cy="52" r="9" fill="#c9a24e"/><circle cx="54" cy="52" r="9" fill="none" stroke="#8a6a2e" stroke-width="1.2"/><circle cx="62" cy="36" r="7" fill="#c9a24e"/>
      <g transform="translate(140 -64)"><ellipse cx="6" cy="8" rx="17" ry="14" fill="#000" opacity=".25"/><circle r="14" fill="#9a8f7e"/><circle r="8" fill="#5e3a28"/>
        <g class="mill-blades" stroke="#5b4a34" stroke-width="1"><path d="M0 0L-30-6-29-12 0-3z" fill="#e2d7bf"/><path d="M0 0L6-30 12-29 3 0z" fill="#e2d7bf"/><path d="M0 0L30 6 29 12 0 3z" fill="#e2d7bf"/><path d="M0 0L-6 30-12 29-3 0z" fill="#e2d7bf"/></g>
        <circle r="2.6" fill="#3a2a1c"/></g>`,
    barrow: `<ellipse cx="8" cy="14" rx="104" ry="76" fill="#000" opacity=".25"/>
      <ellipse rx="98" ry="72" fill="url(#ow-mound)"/>
      <g fill="#2a3520" opacity=".7"><circle cx="-30" cy="-30" r="10"/><circle cx="20" cy="-40" r="8"/><circle cx="50" cy="10" r="11"/><circle cx="-10" cy="10" r="7"/></g>
      <g fill="#8d8a80" stroke="#4a4842" stroke-width="1">${Array.from({ length: 13 }, (_, i) => { const a = i / 13 * Math.PI * 2; return `<path transform="translate(${(Math.cos(a) * 110).toFixed(1)} ${(Math.sin(a) * 82).toFixed(1)})" d="M-5-4l4-3 5 2 1 5-4 3-5-1z"/>`; }).join('')}</g>
      <path d="M36-26q4-26 14-34M46-44l14-6M42-36l-10-10M50-56l4-12" stroke="#2a2219" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle class="barrow-glow" cx="-38" cy="46" r="64" fill="url(#ow-glow)"/>
      <path d="M-58 62V30h10v32zM-28 62V30h10v32z" fill="#8a867c"/><path d="M-62 24h48v10h-48z" fill="#a19d92"/><path d="M-48 62V34h20v28z" fill="#140404"/>
      <ellipse class="barrow-glow" cx="-38" cy="52" rx="6" ry="8" fill="#ff3b2a" opacity=".7"/>
      <path d="M-70 70l8-2M-20 72l6 3M-66 78l5 4" stroke="#e9e2cf" stroke-width="1.6" stroke-linecap="round"/><circle cx="-12" cy="66" r="2.4" fill="#e9e2cf"/>
      <g class="mist"><ellipse cx="-40" cy="54" rx="40" ry="10"/><ellipse cx="20" cy="40" rx="50" ry="12"/></g>`,
  };
  const building = type => BUILDINGS[type] || '';

  // Shared SVG defs used by building art; rendered once per battlefield.
  const defs = `<pattern id="ow-cobble" width="10" height="8" patternUnits="userSpaceOnUse"><rect width="10" height="8" fill="#6a6358"/><path d="M0 4H10M5 0V4M0 4V8M10 4V8" stroke="#555046" stroke-width=".8"/></pattern>
    <radialGradient id="ow-roof" fx=".32" fy=".28"><stop offset="0" stop-color="#8aa6e8"/><stop offset=".55" stop-color="#3d5ba3"/><stop offset="1" stop-color="#22366b"/></radialGradient>
    <radialGradient id="ow-mound" cx=".42" cy=".36"><stop offset="0" stop-color="#55633a"/><stop offset=".7" stop-color="#36452a"/><stop offset="1" stop-color="#25301c"/></radialGradient>
    <radialGradient id="ow-glow"><stop offset="0" stop-color="#ff3b2a" stop-opacity=".9"/><stop offset=".45" stop-color="#ff3b2a" stop-opacity=".38"/><stop offset="1" stop-color="#ff3b2a" stop-opacity="0"/></radialGradient>`;

  const campfire = `<g class="campfire"><circle r="14" fill="#2a241c" opacity=".55"/><path d="M-8-3L8 3M-8 3L8-3" stroke="#5a3d24" stroke-width="3" stroke-linecap="round"/>
    <g class="fire"><circle r="5"/><circle cx="2" cy="-3" r="3.5"/></g><g class="smoke"><circle cy="-14" r="6"/><circle cx="4" cy="-26" r="8"/></g></g>`;

  OW.art = { icon, emblem, factionCrest, portrait, sprite, building, defs, campfire, radius: type => RADIUS[type] || 7, ICONS };
})();
