/* Research › Competitors. Example research notes written to demonstrate the
   workflow. They are short impressions, not an authoritative analysis. */
(() => {
  const OW = (window.OW ||= {});
  const data = (OW.data ||= {});

  data.competitors = {
    lead: 'Four reference games studied for HUD and selection patterns. Each note ends with what to borrow and what to leave alone.',
    meta: { status: 'Draft notes', confidence: 'Medium', source: 'Example research (from play memory, not verified)', decision: 'Feeds D-01 – D-08', question: 'Which game handles large groups best?', prototype: 'Patterns used in HUD v0.5', updated: '2026-10-01' },
    items: [
      {
        id: 'warcraft-iii', name: 'Warcraft III', year: '2002', genre: 'Hero RTS', relevance: 'High', confidence: 'Medium',
        wellDone: 'Heroes are the centre of play. Hero buttons stay on screen and show health at a glance.',
        pattern: 'Bottom console: minimap left, portrait and stats centre, command grid right.',
        strength: 'Hero shortcut buttons make the most important unit reachable from anywhere.',
        weakness: 'The decorative console takes a large share of the screen.',
        idea: 'A persistent hero portrait that mirrors health and doubles as a select button.',
        avoid: 'A heavy ornamental frame around the whole HUD.',
        decisions: ['D-05'],
      },
      {
        id: 'age-of-empires-iv', name: 'Age of Empires IV', year: '2021', genre: 'Historical RTS', relevance: 'Medium', confidence: 'Medium',
        wellDone: 'Clear, modern readability. Idle workers and production are easy to find.',
        pattern: 'Wide bottom panel combining selection info and a command grid.',
        strength: 'Consistent grid hotkeys; information reads at a glance.',
        weakness: 'For our lighter economy the panel would show more than players need.',
        idea: 'Notification affordances clustered next to the minimap.',
        avoid: 'Economy-first information density.',
        decisions: ['D-03'],
      },
      {
        id: 'total-war', name: 'Total War: Warhammer III', year: '2022', genre: 'Battle tactics', relevance: 'High', confidence: 'Low',
        wellDone: 'Army composition is visible as a row of unit cards with per-card health.',
        pattern: 'Horizontal unit-card strip; detailed stats on hover.',
        strength: 'You understand an army’s make-up instantly.',
        weakness: 'Many icons and stats; steep for newcomers.',
        idea: 'Group view as one card per unit type with combined health.',
        avoid: 'Full stat sheets visible during combat.',
        decisions: ['D-08'],
      },
      {
        id: 'they-are-billions', name: 'They Are Billions', year: '2019', genre: 'Colony defence', relevance: 'High', confidence: 'Medium',
        wellDone: 'Incoming threats are unmistakable; pausing lets you plan.',
        pattern: 'Map alerts, wave warnings and a pause that still allows orders.',
        strength: 'Tension and clarity together: you know where to look.',
        weakness: 'Alerts can pile up during big waves (our impression).',
        idea: 'Direction-aware threat banner plus a minimap ping.',
        avoid: 'A constant high-intensity alarm cadence; we want readable, not stressful.',
        decisions: ['D-06', 'D-09'],
      },
    ],
    matrix: {
      rows: ['Selection panel', 'Hero emphasis', 'Group display', 'Threat alerts', 'Pause behaviour'],
      cols: ['Warcraft III', 'Age of Empires IV', 'Total War', 'They Are Billions', 'OVERLORD (ours)'],
      cells: [
        ['Bottom centre', 'Bottom wide', 'Bottom strip', 'Bottom', 'Contextual, right'],
        ['Strong', 'Light', 'Lords / heroes', 'None', 'Strong'],
        ['Portrait grid', 'Grid', 'Unit cards', 'Grid', 'Cards by type'],
        ['Sound + ping', 'Ping', 'Banner', 'Strong warnings', 'Layered light signals'],
        ['Menu', 'Menu', 'Tactical pause', 'Pause with orders', 'Sheet (testing)'],
      ],
    },
  };
})();
