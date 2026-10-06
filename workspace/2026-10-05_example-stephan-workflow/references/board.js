/* Research › References. A visual board. Every image here is a generated
   placeholder block stored in assets/references/ — none is a real screenshot
   or an external source. Replace `image` and `source` when real references
   are collected. */
(() => {
  const OW = (window.OW ||= {});
  const data = (OW.data ||= {});

  data.references = {
    lead: 'A reference board grouped by what each item teaches. All images are generated placeholder blocks, labelled as such — swap in real captures when you collect them.',
    meta: { status: 'Collecting', confidence: 'Low', source: 'Placeholder blocks (generated)', decision: 'Visual direction: dark fantasy, readable', question: 'Which real game captures should replace the placeholders?', prototype: 'Palette and type in use', updated: '2026-10-02' },
    categories: ['UI', 'Environment', 'Character', 'Icons', 'Typography', 'Colour'],
    items: [
      { id: 'ref-console', category: 'UI', title: 'Bottom console layout', image: 'assets/references/ui-console-layout.svg',
        desc: 'Classic layout: minimap, portrait, stats and a 4×3 command grid along the bottom edge.',
        source: 'Placeholder — generated layout study, not a screenshot', learn: 'Grouping by job works; the full-width bar costs too much battlefield (→ D-01).' },
      { id: 'ref-cards', category: 'UI', title: 'Unit card strip', image: 'assets/references/ui-unit-cards.svg',
        desc: 'One card per unit with health underneath; composition reads instantly.',
        source: 'Placeholder — generated study after the Total War note', learn: 'Aggregate per type instead of per unit to stay readable (→ D-08).' },
      { id: 'ref-meadow', category: 'Environment', title: 'Top-down meadow', image: 'assets/references/env-meadow.svg',
        desc: 'Warm grass, a worn dirt road and plowed furrows seen from a high camera.',
        source: 'Placeholder — generated block', learn: 'Roads and fields give the eye paths to follow; keep terrain desaturated so units pop.' },
      { id: 'ref-forest', category: 'Environment', title: 'Forest edge', image: 'assets/references/env-forest-edge.svg',
        desc: 'Dense conifers framing the map with soft south-east shadows.',
        source: 'Placeholder — generated block', learn: 'Forests frame the play area and hide the world edge.' },
      { id: 'ref-commander', category: 'Character', title: 'Commander silhouette', image: 'assets/references/char-commander.svg',
        desc: 'Cape, crown and gold trim separate the hero from line infantry.',
        source: 'Placeholder — generated block', learn: 'Gold is reserved for the hero across portrait, ring and minimap dot.' },
      { id: 'ref-undead', category: 'Character', title: 'Undead silhouette', image: 'assets/references/char-undead.svg',
        desc: 'Tattered hood, bone face and glowing red eyes.',
        source: 'Placeholder — generated block', learn: 'Faction colour lives in the eyes and the ring, not the whole sprite.' },
      { id: 'ref-icons', category: 'Icons', title: 'Ability icon set', image: 'assets/references/icons-ability-set.svg',
        desc: 'Ten ability glyphs on one 24 px grid, stroke-only, round caps.',
        source: 'Workspace — drawn for this prototype (prototype/art.js)', learn: 'One stroke weight keeps a dense ability row calm.' },
      { id: 'ref-type', category: 'Typography', title: 'Type specimen', image: 'assets/references/type-specimen.svg',
        desc: 'Display serif for the wordmark, system sans for UI, monospace for numbers.',
        source: 'Placeholder — generated specimen using system fonts', learn: 'Numbers in monospace stop the HUD jittering as values change.' },
      { id: 'ref-colour', category: 'Colour', title: 'Palette', image: 'assets/references/color-palette.svg',
        desc: 'Near-black surfaces, a purple/blue accent, and reserved game colours for ownership and threat.',
        source: 'Workspace — tokens from style.css', learn: 'Green = yours, red = hostile, gold = hero. Accent purple only for interface focus.' },
    ],
  };
})();
