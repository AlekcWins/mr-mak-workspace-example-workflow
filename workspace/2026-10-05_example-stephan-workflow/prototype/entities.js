/* OVERLORD unit, building and ability data. This is the single source of truth
   for the HUD prototype, the Units / Buildings / Combat pages and the Characters
   page. All values are fictional prototype numbers. Speeds are world px/s,
   ranges world px, cooldowns seconds. */
(() => {
  const OW = (window.OW ||= {});
  const data = (OW.data ||= {});

  const factions = {
    varn: { name: 'Crown of Varn', team: 'own' },
    barrow: { name: 'Barrow Host', team: 'enemy' },
  };

  const units = {
    general: {
      name: 'The General', faction: 'varn', role: 'Hero / Commander', hero: true,
      hp: 620, atk: 30, armor: 6, range: 22, speed: 64, cooldown: 1.1, cost: null, level: 5,
      tags: ['hero', 'infantry'], abilities: ['rally', 'charge', 'hold-line', 'banner'],
      traits: ['Leadership', 'Tactical', 'Defensive'],
      note: 'Banner aura: allies within 140 deal +10% damage.',
    },
    swordsman: {
      name: 'Swordsman', faction: 'varn', role: 'Frontline infantry',
      hp: 180, atk: 14, armor: 3, range: 18, speed: 56, cooldown: 1.0, cost: 60, level: 2,
      tags: ['infantry'], bonus: { light: 1.25 }, abilities: ['shield-wall', 'sprint'],
      traits: ['Reliable', 'Cheap', 'Strong against light units'],
    },
    spearman: {
      name: 'Spearman', faction: 'varn', role: 'Anti-cavalry line',
      hp: 160, atk: 12, armor: 2, range: 26, speed: 52, cooldown: 1.2, cost: 55, level: 1,
      tags: ['infantry'], bonus: { cavalry: 1.75, beast: 1.5 }, abilities: ['brace'],
      traits: ['Long reach', 'Counters cavalry and beasts'],
    },
    archer: {
      name: 'Archer', faction: 'varn', role: 'Ranged support',
      hp: 110, atk: 11, armor: 1, range: 150, speed: 58, cooldown: 1.4, cost: 70, level: 1,
      tags: ['ranged', 'light'], abilities: ['volley', 'fire-arrows'],
      traits: ['Fragile', 'Long range', 'Good from walls'],
    },
    crossbow: {
      name: 'Crossbowman', faction: 'varn', role: 'Armour-piercing ranged',
      hp: 120, atk: 17, armor: 2, range: 130, speed: 50, cooldown: 2.0, cost: 85, level: 1,
      tags: ['ranged'], pierce: 2, abilities: ['pierce'],
      traits: ['Slow reload', 'Ignores some armour'],
    },
    knight: {
      name: 'Knight', faction: 'varn', role: 'Shock cavalry',
      hp: 300, atk: 22, armor: 4, range: 20, speed: 96, cooldown: 1.3, cost: 140, level: 2,
      tags: ['cavalry'], bonus: { ranged: 1.3 }, abilities: ['lance-charge'],
      traits: ['Fast', 'Expensive', 'Hunts ranged units'],
    },
    priest: {
      name: 'Priest of Varn', faction: 'varn', role: 'Support / healer',
      hp: 90, atk: 5, armor: 0, range: 110, speed: 54, cooldown: 1.5, cost: 90, level: 1,
      tags: ['support', 'light'], abilities: ['mend'],
      traits: ['Heals allies', 'Keep behind the line'],
    },
    wight: {
      name: 'Barrow Wight', faction: 'barrow', role: 'Undead infantry', threat: 2,
      hp: 170, atk: 13, armor: 2, range: 18, speed: 50, cooldown: 1.1, level: 2,
      tags: ['infantry', 'undead'], abilities: ['grave-chill'],
      traits: ['Relentless', 'Slows on hit'], counter: 'Hold them with Swordsmen; crossbows pierce their armour.',
    },
    hound: {
      name: 'Grave Hound', faction: 'barrow', role: 'Fast flanker', threat: 1,
      hp: 100, atk: 10, armor: 0, range: 16, speed: 104, cooldown: 0.8, level: 1,
      tags: ['beast', 'light'], bonus: { ranged: 1.25 }, abilities: ['hamstring'],
      traits: ['Very fast', 'Targets archers'], counter: 'Spearmen deal +50% to beasts.',
    },
    'bone-archer': {
      name: 'Bone Archer', faction: 'barrow', role: 'Undead ranged', threat: 2,
      hp: 90, atk: 10, armor: 0, range: 140, speed: 48, cooldown: 1.6, level: 1,
      tags: ['ranged', 'light', 'undead'], abilities: ['black-arrows'],
      traits: ['Fragile', 'Stays behind wights'], counter: 'Knights close the distance; swordsmen deal +25%.',
    },
  };

  const buildings = {
    keep: {
      name: 'Varnhold Keep', faction: 'varn', role: 'Main keep', hp: 2400, armor: 8, radius: 122,
      garrison: 12, abilities: ['ring-bell', 'repair', 'train-swordsman', 'train-archer'],
      note: 'If the keep falls, the campaign is lost. The prototype stops damage at 15%.',
    },
    watchtower: {
      name: 'Watch Hill Tower', faction: 'varn', role: 'Outpost', hp: 700, armor: 5, radius: 30,
      garrison: 3, abilities: ['light-beacon'], note: 'Extends vision over the ford road.',
    },
    farmstead: {
      name: 'Millfield Farmstead', faction: 'varn', role: 'Economy', hp: 500, armor: 1, radius: 90,
      income: 4, abilities: ['harvest-festival'], note: 'Produces 4 gold per second while it stands.',
    },
    barrow: {
      name: 'The Old Barrow', faction: 'barrow', role: 'Enemy spawner', hp: 1800, armor: 6, radius: 90,
      threat: 3, spawnEvery: 40, abilities: ['raise-dead'],
      note: 'Razing a barrow needs siege engines, which the prototype does not include.',
    },
  };

  // type: cast | toggle | passive | train | command
  const abilities = {
    rally: { name: 'Rally', type: 'cast', cooldown: 15, icon: 'rally', desc: 'Restore 20% health to allies within 160.' },
    charge: { name: 'Charge', type: 'cast', cooldown: 10, icon: 'charge', desc: 'Double movement speed for 3 s.' },
    'hold-line': { name: 'Hold the Line', type: 'toggle', icon: 'shield', desc: '+3 armour for infantry within 160 of the General. The General moves 30% slower.' },
    banner: { name: 'Banner of Varn', type: 'passive', icon: 'banner', desc: 'Allies within 140 deal +10% damage.' },
    'shield-wall': { name: 'Shield Wall', type: 'toggle', icon: 'shields', desc: '+4 armour, 40% slower.' },
    sprint: { name: 'Sprint', type: 'cast', cooldown: 12, icon: 'sprint', desc: '+60% movement speed for 3 s.' },
    brace: { name: 'Brace', type: 'toggle', icon: 'brace', desc: '+50% damage against cavalry and beasts, 50% slower.' },
    volley: { name: 'Volley', type: 'cast', cooldown: 14, icon: 'volley', desc: 'The next shot also hits enemies within 40 of the target.' },
    'fire-arrows': { name: 'Fire Arrows', type: 'toggle', icon: 'flame', desc: '+40% damage against buildings.' },
    pierce: { name: 'Piercing Bolts', type: 'toggle', icon: 'pierce', desc: 'Ignore 3 more armour; reload 25% slower.' },
    'lance-charge': { name: 'Lance Charge', type: 'cast', cooldown: 12, icon: 'lance', desc: '+80% speed for 2.5 s; the next hit deals double damage.' },
    mend: { name: 'Mend', type: 'cast', cooldown: 8, icon: 'mend', desc: 'Heal the most wounded ally within 110 by 60.' },
    'grave-chill': { name: 'Grave Chill', type: 'passive', icon: 'chill', desc: 'Hits slow the target by 20% for 2 s.' },
    hamstring: { name: 'Hamstring', type: 'passive', icon: 'claw', desc: '+25% damage against ranged units.' },
    'black-arrows': { name: 'Black Arrows', type: 'passive', icon: 'arrow', desc: 'Long-range harassment from behind the wights.' },
    'raise-dead': { name: 'Raise Dead', type: 'passive', icon: 'skull', desc: 'Raises a Barrow Wight every 40 s while fewer than 12 guard it.' },
    'ring-bell': { name: 'Ring the Bell', type: 'cast', cooldown: 30, icon: 'bell', desc: 'Call 3 militia swordsmen to the gate.' },
    repair: { name: 'Repair', type: 'toggle', icon: 'hammer', desc: 'Restore 12 HP/s to the walls for 2 gold/s.' },
    'train-swordsman': { name: 'Train Swordsman', type: 'train', unit: 'swordsman', time: 4, icon: 'plus', desc: 'Queue a Swordsman at the gate.' },
    'train-archer': { name: 'Train Archer', type: 'train', unit: 'archer', time: 5, icon: 'plus', desc: 'Queue an Archer at the gate.' },
    'light-beacon': { name: 'Light Beacon', type: 'cast', cooldown: 20, icon: 'beacon', desc: 'Ping the area around the tower on the minimap.' },
    'harvest-festival': { name: 'Harvest Festival', type: 'cast', cooldown: 45, icon: 'wheat', desc: 'Gain 120 gold immediately.' },
    'attack-move': { name: 'Attack-move', type: 'command', icon: 'swords', desc: 'Move and fight anything on the way. Click ground or an enemy.' },
    stop: { name: 'Stop', type: 'command', icon: 'stop', desc: 'Cancel current orders.' },
  };

  /* Damage for one hit. Shared by the HUD simulation and the Combat page.
     opts: { mult, armorBonus, pierceBonus, defender: 'unit' | 'building' } */
  const damage = (attackerType, defenderType, opts = {}) => {
    const a = units[attackerType];
    const d = units[defenderType] || buildings[defenderType];
    if (!a || !d) return 0;
    const tags = d.tags || ['building'];
    let mult = opts.mult ?? 1;
    for (const [tag, m] of Object.entries(a.bonus || {})) if (tags.includes(tag)) mult *= m;
    const armor = Math.max(0, d.armor + (opts.armorBonus || 0) - (a.pierce || 0) - (opts.pierceBonus || 0));
    return Math.max(1, Math.round(a.atk * mult - armor));
  };

  data.entities = { factions, units, buildings, abilities, damage };
})();
