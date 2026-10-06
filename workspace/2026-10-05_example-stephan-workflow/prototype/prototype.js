/* HUD prototype states and the written spec for each one. hud.js implements
   the behaviour behind every state id; this file holds the wording, linked
   decisions and open questions so they can change without touching the engine. */
(() => {
  const OW = (window.OW ||= {});
  const data = (OW.data ||= {});

  data.prototype = {
    states: [
      { id: 'none', group: 'System', label: 'Nothing selected',
        spec: 'Selection panel hidden per spec — only the command bar, the gear and the minimap stay. Gold, army and holdings sit top-left.',
        decisions: ['D-01', 'D-03', 'D-05'], question: 'Is the minimap enough orientation for a first-time player?' },
      { id: 'command', group: 'System', label: 'Command armed', key: 'A',
        spec: 'Attack-move armed. The cursor becomes a reticle and a banner names the order and who receives it. Left-click ground or an enemy to confirm; Esc or right-click cancels.',
        decisions: ['D-07'], question: 'Should A with nothing selected command the whole army?' },
      { id: 'settings', group: 'System', label: 'Settings open', key: 'Space',
        spec: 'Space pauses and opens the system sheet. The battlefield stays visible behind the blur so the player keeps their bearings. Settings apply immediately.',
        decisions: ['D-09'], question: 'Should orders be allowed while paused?' },
      { id: 'fallen', group: 'System', label: 'General fallen',
        spec: 'The General’s portrait greys out with a respawn countdown, a banner explains the morale penalty and nothing else changes. No game over.',
        decisions: ['D-10'], question: 'Is 30 s the right respawn for a 20-minute match?' },

      { id: 'swordsman', group: 'Single unit', label: 'Swordsman (yours)',
        spec: 'Inspector shows portrait, level, health, effective stats and two abilities. Stats turn green when a buff changes them.',
        decisions: ['D-01', 'D-04'], question: 'Do players read effective stats or only the health bar?' },
      { id: 'general', group: 'Single unit', label: 'The General (hero)',
        spec: 'Larger gold-framed portrait, experience bar, four abilities (one passive) and a command row. The portrait top-left mirrors health.',
        decisions: ['D-05'], question: 'Should hero abilities also be reachable when the General is in a group?' },
      { id: 'enemy', group: 'Single unit', label: 'Enemy unit (inspect)',
        spec: 'Red hostile frame, threat pips and inspect-only abilities. No command buttons: the panel explains, it does not invite orders.',
        decisions: ['D-02', 'D-06'], question: 'Should the counter tip name a unit type or a tactic?' },

      { id: 'group3', group: 'Group', label: 'Group — 3 types',
        spec: 'One card per unit type with a count and health, in a single row. Formation and stance controls apply to the whole group. Click a card to narrow the selection.',
        decisions: ['D-08'], question: 'Is health per type enough, or do players need per-unit health?' },
      { id: 'group6', group: 'Group', label: 'Group — 6 types',
        spec: 'Six types wrap into two rows of three. The group health bar sums all units. Formation changes rearrange idle units immediately.',
        decisions: ['D-08'], question: 'What happens at 7+ types — scroll or collapse?' },

      { id: 'keep', group: 'Castles', label: 'Main Keep (yours)',
        spec: 'Building inspector: wall health, garrison, income and a training queue. Training spends gold and spawns units at the gate.',
        decisions: ['D-01', 'D-04'], question: 'Should training live on the keep or in a separate build menu?' },
      { id: 'keep-threat', group: 'Castles', label: 'Main Keep — under threat',
        spec: 'Several light signals at once: red edge pulse, alert banner, minimap ping, burning wall and a red inspector header. Ring the Bell is highlighted as the suggested answer.',
        decisions: ['D-06'], question: 'Which signal do players notice first? Test with sound off.' },
      { id: 'barrow', group: 'Castles', label: 'Enemy barrow (inspect)',
        spec: 'Hostile building: threat level, garrison and a live timer until the next Barrow Wight rises.',
        decisions: ['D-02'], question: 'Should the spawn timer be visible without scouting?' },
    ],

    // Checks a tester runs against the prototype; shown on the HUD page.
    playtest: [
      'Select a single unit, then click empty ground — the inspector should disappear.',
      'Drag a box around the archers near the gate — the group view shows one type.',
      'Press A with nothing selected — does "whole army" feel right?',
      'Trigger "Main Keep — under threat" with the sound off. Which signal did you notice first?',
      'Switch Inspector position to Bottom in Settings. Which position hides less of the battlefield?',
      'Kill the General by sending him alone to the barrow. Is the fallen state understandable without reading?',
    ],

    pages: {
      hud: {
        lead: 'A working HUD prototype for a fictional RTS. Every button in the HUD demo panel is a live state: click units, drag a selection box, give orders, open settings with Space and watch threats arrive.',
        meta: { status: 'Prototype', confidence: 'Medium', source: 'Decisions D-01 – D-10', decision: 'Contextual inspector (D-01)', question: 'Should selection information live on the right or bottom?', prototype: 'Interactive · v0.5', updated: '2026-10-05' },
      },
      units: {
        lead: 'Every unit in the prototype, read from the same data file the HUD uses. Change a number in prototype/entities.js and both update.',
        meta: { status: 'Draft balance', confidence: 'Low', source: 'Prototype data', decision: 'Six unit types per faction', question: 'Is the Crossbowman distinct enough from the Archer?', prototype: 'All units playable', updated: '2026-10-05' },
      },
      buildings: {
        lead: 'Buildings that can be selected in the prototype, with the abilities their inspectors expose.',
        meta: { status: 'Prototype', confidence: 'Medium', source: 'Prototype data', decision: 'Training lives on the keep (testing)', question: 'Does the barrow need to be destructible in the first playable?', prototype: '4 buildings selectable', updated: '2026-10-05' },
      },
      combat: {
        lead: 'One damage formula drives the prototype’s fights. The duel calculator below uses exactly the same function as the HUD simulation.',
        meta: { status: 'Draft', confidence: 'Low', source: 'Prototype formula', decision: 'Flat armour subtraction', question: 'Should armour be a percentage instead of a flat value?', prototype: 'Simulated in HUD', updated: '2026-10-04' },
      },
    },
  };
})();
