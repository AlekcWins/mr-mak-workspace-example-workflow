/* Research › Design Decisions. A lightweight decision record. Status values:
   Accepted | Testing | Open | Rejected. `state` links a row to a HUD preset. */
(() => {
  const OW = (window.OW ||= {});
  const data = (OW.data ||= {});

  data.decisions = {
    lead: 'Every interface choice gets a row: what we decided, why, what else we considered, and how sure we are. Click a row for the full record.',
    meta: { status: 'Living document', confidence: 'Medium', source: 'Research + playtest notes', decision: '6 accepted · 3 testing · 1 open · 1 rejected', question: 'Should selection information live on the right or bottom?', prototype: 'Decisions mirrored in HUD v0.5', updated: '2026-10-05' },
    items: [
      { id: 'd-01', decision: 'Contextual selection panel', reason: 'Reduce HUD clutter', alternatives: 'Permanent panel', status: 'Accepted', state: 'swordsman',
        context: 'Competitor HUDs keep a large panel on screen even with nothing selected. Our battles are small, so the battlefield should own the screen.',
        consequence: 'The inspector slides in on selection and disappears on deselect. Resources must live elsewhere (see D-05).', sources: ['age-of-empires-iv', 'information-density'] },
      { id: 'd-02', decision: 'Circular unit indicator', reason: 'Clear selection at any zoom', alternatives: 'Outline only; tinted sprite', status: 'Accepted', state: 'enemy',
        context: 'Outlines disappear on busy grass. A ground ring reads at every zoom level and colour-codes ownership.',
        consequence: 'Green for yours, red for hostile, gold for the hero. Rings animate slowly to stay noticeable without flashing.', sources: ['selection-feedback'] },
      { id: 'd-03', decision: 'Minimal default HUD', reason: 'Increase visual clarity', alternatives: 'Dense HUD', status: 'Testing', state: 'none',
        context: 'With nothing selected only the command bar, the gear and the minimap remain.',
        consequence: 'Playtest note N-04: two testers looked for gold at the bottom first. Keep testing before accepting.', sources: ['information-density', 'n-04'] },
      { id: 'd-04', decision: 'Right-side inspector', reason: 'Familiar workflow', alternatives: 'Bottom panel', status: 'Accepted', state: 'keep',
        context: 'Right-side panels follow tool conventions (inspector on the right) and keep the bottom edge free for the minimap.',
        consequence: 'Settings include a Right/Bottom switch so the alternative can be compared in the prototype.', sources: ['warcraft-iii'] },
      { id: 'd-05', decision: 'Hero portrait fixed top-left', reason: 'The General is the core unit', alternatives: 'Hero only in group bar', status: 'Accepted', state: 'general',
        context: 'Inspired by hero buttons in Warcraft III. The portrait shows health and selects the General on click or F.',
        consequence: 'Resources sit beside the portrait so the top-left reads as “you”.', sources: ['warcraft-iii', 'hero-visibility'] },
      { id: 'd-06', decision: 'Layered threat signals', reason: 'Redundant lightweight cues', alternatives: 'Full-screen alarm banner', status: 'Testing', state: 'keep-threat',
        context: 'Red edge pulse, banner, minimap ping, burning wall and a red inspector header. Sound is not in the prototype yet.',
        consequence: 'Needs a test with sound off to see which signal players notice first.', sources: ['they-are-billions', 'threat-communication'] },
      { id: 'd-07', decision: 'A with empty selection commands the whole army', reason: 'Fewer clicks when defending', alternatives: 'Require a selection first', status: 'Open', state: 'command',
        context: 'Pressing A without a selection currently arms attack-move for every unit you own.',
        consequence: 'Fast, but risky: players may pull archers off the walls by accident.', sources: ['command-confirmation'] },
      { id: 'd-08', decision: 'Group view by unit type', reason: 'Composition at a glance', alternatives: 'One portrait per unit', status: 'Accepted', state: 'group6',
        context: 'One card per type with count and combined health; cards narrow the selection when clicked.',
        consequence: 'Six types fit in two rows. Seven or more is unresolved.', sources: ['total-war', 'group-readability'] },
      { id: 'd-09', decision: 'Pause opens the system sheet', reason: 'Planning without pressure', alternatives: 'Tactical pause with orders', status: 'Testing', state: 'settings',
        context: 'Space pauses and shows settings over a dimmed battlefield.',
        consequence: 'Players may want to give orders while paused, as in They Are Billions.', sources: ['they-are-billions'] },
      { id: 'd-10', decision: 'The General respawns after 30 s', reason: 'Keep the hero loop without game over', alternatives: 'Permadeath', status: 'Accepted', state: 'fallen',
        context: 'A fallen General costs morale (−15% damage) and time, not the match.',
        consequence: 'Respawn time needs tuning against match length.', sources: ['soft-failure'] },
      { id: 'd-11', decision: 'Per-unit health in group view', reason: 'Spot the weakest unit', alternatives: 'Health per type', status: 'Rejected', state: 'group3',
        context: 'Tested in an earlier sketch: twenty bars were unreadable at a glance.',
        consequence: 'Replaced by combined health per type (D-08).', sources: ['group-readability'] },
    ],
  };
})();
