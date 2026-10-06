/* Game Design › Mechanics, Interface, Controls, Progression, Storytelling.
   Prototype status values: Implemented | Partial | Not started. */
(() => {
  const OW = (window.OW ||= {});
  const data = (OW.data ||= {});

  data.mechanics = {
    lead: 'Each mechanic is written as Concept → Rule → UI representation → Prototype status, so it is clear what the HUD must show and what already works.',
    meta: { status: 'Draft', confidence: 'Medium', source: 'Design notes', decision: 'Small battles, few systems', question: 'Is economy too passive with a single income source?', prototype: '6 of 8 implemented', updated: '2026-10-04' },
    items: [
      { id: 'movement', title: 'Movement', concept: 'Units walk where you point and keep formation.', rule: 'Right-click moves; groups keep their formation facing the move direction.', ui: 'Green ground marker; units turn toward travel.', status: 'Implemented', state: 'group3' },
      { id: 'selection', title: 'Selection', concept: 'Pick one unit, a group or a building.', rule: 'Click, Shift-click, drag a box, double-click for all of a type.', ui: 'Ground ring + contextual inspector.', status: 'Implemented', state: 'swordsman' },
      { id: 'group-control', title: 'Group control', concept: 'Shape and temperament for a whole group.', rule: 'Line, column, wedge or loose; aggressive, defensive or hold stance.', ui: 'Segmented controls in the group inspector.', status: 'Implemented', state: 'group6' },
      { id: 'combat', title: 'Combat', concept: 'Short, readable fights.', rule: 'Damage = attack × bonuses − armour (minimum 1). Ranged units shoot from range.', ui: 'Health bars, hit flashes, projectile lines.', status: 'Implemented', route: 'prototype/combat' },
      { id: 'buildings', title: 'Buildings', concept: 'Holdings to protect and use.', rule: 'Keep trains units; farmstead pays gold; tower lights a beacon.', ui: 'Building inspector with queue and abilities.', status: 'Implemented', state: 'keep' },
      { id: 'economy', title: 'Economy', concept: 'One gentle income source.', rule: '+4 gold/s while the farmstead stands; spent on training and repairs.', ui: 'Gold counter top-left with income.', status: 'Partial', state: 'none' },
      { id: 'hero-abilities', title: 'Hero abilities', concept: 'The General shapes every fight.', rule: 'Rally, Charge, Hold the Line, Banner aura; respawn after 30 s.', ui: 'Gold inspector, top-left portrait, fallen banner.', status: 'Implemented', state: 'general' },
      { id: 'castle-defense', title: 'Castle defence', concept: 'Waves test the walls.', rule: 'Enemies near the keep raise the threat state until cleared.', ui: 'Layered threat signals (D-06).', status: 'Partial', state: 'keep-threat' },
    ],
  };

  data.interfaceSpec = {
    lead: 'The HUD anatomy: six zones, when each appears, and which decision put it there.',
    meta: { status: 'Spec v3', confidence: 'Medium', source: 'Decisions D-01 – D-10', decision: 'Contextual inspector (D-01)', question: 'Should selection information live on the right or bottom?', prototype: 'All zones implemented', updated: '2026-10-05' },
    zones: [
      { n: 1, name: 'Command bar', where: 'Top-left', content: 'General portrait, gold, army, holdings', visible: 'Always', decision: 'D-05' },
      { n: 2, name: 'Banners', where: 'Top-centre', content: 'Pending command, threat, fallen General', visible: 'When a mode or alert is active', decision: 'D-06' },
      { n: 3, name: 'System', where: 'Top-right', content: 'Gear button, pause tag, toasts', visible: 'Always', decision: 'D-09' },
      { n: 4, name: 'Minimap', where: 'Bottom-left', content: 'Terrain, units, camera frame, pings', visible: 'Always', decision: 'D-03' },
      { n: 5, name: 'Inspector', where: 'Bottom-right', content: 'Unit, group or building details and abilities', visible: 'Only with a selection', decision: 'D-01 / D-04' },
      { n: 6, name: 'Battlefield', where: 'Everything else', content: 'Rings, health bars, markers', visible: 'Always', decision: 'D-02' },
    ],
    matrix: {
      states: ['Nothing selected', 'Command armed', 'Settings open', 'General fallen', 'Single unit', 'Group', 'Keep under threat'],
      zones: ['Command bar', 'Banners', 'Inspector', 'Settings sheet', 'Red edge pulse'],
      cells: [
        [1, 0, 0, 0, 0], [1, 1, 2, 0, 0], [1, 0, 0, 1, 0], [1, 1, 0, 0, 0], [1, 0, 1, 0, 0], [1, 0, 1, 0, 0], [1, 1, 1, 0, 1],
      ],
    },
  };

  data.controls = {
    lead: 'Every binding below works in the HUD prototype. Mouse first, keyboard for speed.',
    meta: { status: 'Implemented', confidence: 'High', source: 'prototype/hud.js', decision: 'A = attack-move, Space = pause', question: 'Should S be Stop or Shield Wall for swordsmen?', prototype: 'All bindings live', updated: '2026-10-05' },
    groups: [
      { title: 'Mouse', rows: [
        ['Left-click unit or building', 'Select it', 'Shift adds or removes your units'],
        ['Left-click empty ground', 'Clear selection', ''],
        ['Left-drag', 'Box-select your units', 'Shift adds to the selection'],
        ['Double-click a unit', 'Select all of that type on screen', ''],
        ['Right-click ground', 'Move in formation', 'Needs your units selected'],
        ['Right-click enemy', 'Attack it', ''],
        ['Middle-drag or Alt-drag', 'Pan the camera', ''],
        ['Wheel', 'Zoom', 'After clicking the battlefield'],
        ['Minimap click or drag', 'Move the camera', ''],
      ] },
      { title: 'Keyboard', rows: [
        ['A', 'Arm attack-move', 'Nothing selected = whole army (D-07)'],
        ['S', 'Stop', ''],
        ['Q W E R', 'Abilities of the selected unit or building', ''],
        ['F', 'Select the General', ''],
        ['H', 'Camera to the keep', ''],
        ['J', 'Camera to the current threat', ''],
        ['Arrow keys', 'Pan the camera', ''],
        ['+ / −', 'Zoom', ''],
        ['Space', 'Pause and open settings', ''],
        ['Esc', 'Close settings, cancel command, clear selection', 'In that order'],
      ] },
      { title: 'Workspace', rows: [
        ['/ or Ctrl+K', 'Search pages and run commands', ''],
        ['Esc', 'Close search', ''],
      ] },
    ],
  };

  data.progression = {
    lead: 'How units, the keep and the General grow over a match. Mostly unbuilt — this page exists so the HUD reserves space for it.',
    meta: { status: 'Concept', confidence: 'Low', source: 'Design notes', decision: 'Levels shown as LV badge', question: 'Do unit levels matter in 20-minute matches?', prototype: 'Badges only', updated: '2026-09-30' },
    ranks: [
      { name: 'Recruit', levels: 'LV 1', bonus: 'Base stats', hud: 'Plain portrait' },
      { name: 'Veteran', levels: 'LV 2–3', bonus: '+10% health, +1 armour', hud: 'Silver LV badge' },
      { name: 'Elite', levels: 'LV 4–5', bonus: '+20% health, +2 attack', hud: 'Gold LV badge' },
    ],
    keep: ['Palisade', 'Stone keep', 'Citadel'],
    tree: [
      { branch: 'Leadership', skills: ['Rally', 'Banner of Varn', 'Second Wind'] },
      { branch: 'Tactics', skills: ['Charge', 'Flanking Orders', 'Tactics II'] },
      { branch: 'Defence', skills: ['Hold the Line', 'Shield Bearer', 'Last Stand'] },
    ],
    timeline: [
      ['0–5 min', 'Secure Millfield, scout the barrow road.'],
      ['5–15 min', 'Hold the first waves; train archers for the walls.'],
      ['15+ min', 'March on the Old Barrow with the General.'],
    ],
  };

  data.storytelling = {
    lead: 'A small story told mostly through the HUD: alerts, the General’s portrait and what the barrows do.',
    meta: { status: 'Concept', confidence: 'Low', source: 'Design notes', decision: 'Story through UI, not cutscenes', question: 'Should the General speak in barks during alerts?', prototype: 'Not started', updated: '2026-09-29' },
    premise: 'The kingdom has fallen back to one keep. To the north-east, the old barrows are waking. The General has one season to hold Varnhold — and to find out what is under the hills.',
    acts: [
      { n: 'Act I', title: 'The Waking', text: 'Hold the keep through the first waves. Learn the HUD one state at a time.' },
      { n: 'Act II', title: 'Ashwood', text: 'Push through the forest, protect the villages, seal the smaller barrows.' },
      { n: 'Act III', title: 'The Barrow King', text: 'March on the Old Barrow. The General may not come back.' },
    ],
    tone: ['Bleak but warm', 'Few words', 'The interface is a character'],
    devices: [
      ['Alert banner', 'Short, specific lines: “Varnhold Keep is under attack”.'],
      ['General portrait', 'Grey when fallen; later, a wound overlay in act III.'],
      ['Barrow timer', 'Inspecting the barrow reveals when the next dead will rise.'],
    ],
  };
})();
