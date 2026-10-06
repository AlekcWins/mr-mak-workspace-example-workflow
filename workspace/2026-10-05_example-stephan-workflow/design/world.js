/* The World › Characters, Factions, Locations, Buildings. Fictional lore for
   OVERLORD. Unit stats are read from prototype/entities.js, not duplicated. */
(() => {
  const OW = (window.OW ||= {});
  const data = (OW.data ||= {});

  data.characters = {
    lead: 'The cast the HUD has to communicate. Stats come straight from the prototype data, so these cards always match what you can select.',
    meta: { status: 'Draft', confidence: 'Medium', source: 'Design notes', decision: 'Hero-led army (D-05)', question: 'Does the General need a name, or is the title stronger?', prototype: '5 of 6 playable', updated: '2026-10-03' },
    items: [
      { id: 'general', unit: 'general', title: 'The General', quote: 'Hold here. The keep holds if we hold.',
        bio: 'Last commander of the Crown of Varn. Old, stubborn and the only reason the army has not scattered.',
        abilities: ['Rally', 'Charge', 'Hold the Line'] },
      { id: 'swordsman', unit: 'swordsman', title: 'Swordsman', quote: 'Shields up, lads.',
        bio: 'Farmers turned soldiers. Cheap, dependable, and the first line between the barrows and the fields.' },
      { id: 'archer', unit: 'archer', title: 'Archer', quote: 'Give me a wall and a reason.',
        bio: 'Hunters from Ashwood. Deadly from cover, helpless when caught in the open.' },
      { id: 'priest', unit: 'priest', title: 'Priest of Varn', quote: 'Stand. You are not finished yet.',
        bio: 'Keeps the line standing between fights; the only healer the army has left.' },
      { id: 'wight', unit: 'wight', title: 'Barrow Wight', quote: '…',
        bio: 'The old kings’ guards, raised from the hills. They do not tire, and their touch numbs the living.' },
      { id: 'barrow-king', unit: null, portrait: 'wight', title: 'The Barrow King', role: 'Enemy hero · not in prototype', quote: 'Your keep was built on my road.',
        bio: 'The power under the Old Barrow. Planned as the final encounter of the first campaign.',
        traits: ['Commander', 'Necromancer', 'Patient'], abilities: ['Raise Dead', 'Grave Tide', 'Crown of Ash'] },
    ],
  };

  data.factions = {
    lead: 'Three sides with clear visual rules: blue and steel for the Crown, bone and ember for the Barrow Host, green and straw for the villages.',
    meta: { status: 'Draft', confidence: 'Medium', source: 'Design notes', decision: 'Colour = ownership', question: 'Should the villages be capturable by the enemy?', prototype: '2 factions playable', updated: '2026-10-02' },
    items: [
      { id: 'varn', crest: 'varn', name: 'The Crown of Varn', role: 'Player faction', colour: '#3566c8',
        text: 'The last loyal legion, holding Varnhold Keep with farmers, hunters and a tired General.',
        style: 'Defensive, hero-led, strong formations.', units: ['general', 'swordsman', 'spearman', 'archer', 'crossbow', 'knight', 'priest'] },
      { id: 'barrow', crest: 'barrow', name: 'The Barrow Host', role: 'Enemy faction', colour: '#e2555a',
        text: 'The dead under the hills, rising in waves from the barrows to the north-east.',
        style: 'Attrition: endless, slow infantry and fast flankers.', units: ['wight', 'hound', 'bone-archer'] },
      { id: 'villages', crest: 'villages', name: 'The Free Villages', role: 'Neutral', colour: '#9cc46a',
        text: 'Millfield’s farmers. They pay the army in grain and gold as long as the fields are safe.',
        style: 'Economy: protect them and gold flows (+4 per second in the prototype).', units: [] },
    ],
    relations: [['', 'Crown', 'Barrow', 'Villages'], ['Crown', '—', 'War', 'Protector'], ['Barrow', 'War', '—', 'Prey'], ['Villages', 'Taxed', 'Fear', '—']],
  };

  data.locations = {
    lead: 'Places on the prototype map. Each card renders a crop of the real terrain; “Show in HUD” flies the prototype camera there.',
    meta: { status: 'Blocked out', confidence: 'Medium', source: 'prototype/map.js', decision: 'One compact map for the first playable', question: 'Is the barrow too close to the keep for a first mission?', prototype: 'All locations on the map', updated: '2026-10-04' },
    items: [
      { id: 'varnhold', type: 'Stronghold', text: 'The keep at the crossroads. Every road on the map leads here.', note: 'Gate faces south; the army musters there.' },
      { id: 'millfield', type: 'Farmland', text: 'Plowed furrows, barley and wheat feeding the army.', note: 'Source of the +4 gold income.' },
      { id: 'ashwood', type: 'Forest', text: 'Dark conifers between the barrow road and the river.', note: 'Future idea: ambush cover (see Ideas).' },
      { id: 'barrows', type: 'Enemy ground', text: 'The Old Barrow and its standing stones. Wights gather here.', note: 'Spawns a Barrow Wight every 40 s.' },
      { id: 'greywater-ford', type: 'Crossing', text: 'Shallow stones where the ford road crosses the river.', note: 'The only river crossing in the prototype.' },
      { id: 'watch-hill', type: 'Outpost', text: 'A wooden-topped tower watching the ford road.', note: 'Light Beacon pings the minimap.' },
    ],
  };

  data.worldBuildings = {
    lead: 'What each building means in the world. The Prototype › Buildings page lists the numbers the HUD uses.',
    meta: { status: 'Draft', confidence: 'Medium', source: 'Design notes', decision: 'Training on the keep (testing)', question: 'Do we need a separate barracks?', prototype: '4 of 6 selectable', updated: '2026-10-03' },
    items: [
      { id: 'keep', portrait: 'keep', name: 'Varnhold Keep', role: 'Main keep', text: 'Curtain walls, four drum towers and a slate-roofed hall. Losing it ends the campaign.', upgrades: ['Palisade', 'Stone keep', 'Citadel'], inPrototype: true },
      { id: 'watchtower', portrait: 'watchtower', name: 'Watch Hill Tower', role: 'Outpost', text: 'Extends vision and warns of anything crossing the ford.', upgrades: ['Beacon', 'Garrison loft'], inPrototype: true },
      { id: 'farmstead', portrait: 'farmstead', name: 'Millfield Farmstead', role: 'Economy', text: 'Houses, a barn and a windmill. Pays the army while the fields are safe.', upgrades: ['Granary', 'Mill'], inPrototype: true },
      { id: 'barrow', portrait: 'barrow', name: 'The Old Barrow', role: 'Enemy spawner', text: 'A grave mound older than the kingdom. Something breathes inside.', upgrades: ['Sealed in act 2'], inPrototype: true },
      { id: 'barracks', portrait: 'keep', name: 'Barracks', role: 'Training (planned)', text: 'Would move training out of the keep if the keep panel gets crowded.', upgrades: ['Drill yard'], inPrototype: false },
      { id: 'shrine', portrait: 'priest', name: 'Shrine of Varn', role: 'Support (planned)', text: 'Trains priests and could extend healing range.', upgrades: ['Reliquary'], inPrototype: false },
    ],
  };
})();
