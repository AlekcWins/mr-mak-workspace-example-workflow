/* Discover › Overview. Describes the research → prototype workflow this
   workspace demonstrates, and traces one decision from research to test. */
(() => {
  const OW = (window.OW ||= {});
  const data = (OW.data ||= {});

  data.workflow = {
    meta: { status: 'Example project', confidence: 'High', source: 'This workspace', decision: 'Workflow: research → iterate', question: 'Which stage should an agent automate first?', prototype: 'HUD v0.5 playable', updated: '2026-10-05' },
    pipeline: [
      { id: 'research', label: 'Research', route: 'research/competitors' },
      { id: 'references', label: 'References', route: 'research/references' },
      { id: 'design', label: 'Design', route: 'research/decisions' },
      { id: 'prototype', label: 'Prototype', route: 'prototype/hud' },
      { id: 'test', label: 'Test', route: 'development/notes' },
      { id: 'iterate', label: 'Iterate', route: 'development/devlog' },
    ],
    stages: [
      { n: '01', title: 'Research', text: 'Study existing games, interfaces and UX patterns.',
        ai: 'Summarises play sessions and notes into comparable cards.', human: 'Plays the games and judges what feels right.',
        output: 'Competitor notes', route: 'research/competitors' },
      { n: '02', title: 'Extract', text: 'Identify reusable mechanics, interaction patterns and visual ideas.',
        ai: 'Turns notes into problem → pattern pairs and a reference board.', human: 'Picks which patterns fit the game.',
        output: 'UX patterns, references', route: 'research/ux-patterns' },
      { n: '03', title: 'Design', text: 'Turn research into explicit design decisions.',
        ai: 'Drafts decision records with alternatives and consequences.', human: 'Accepts, rejects or marks for testing.',
        output: 'Decision table', route: 'research/decisions' },
      { n: '04', title: 'Prototype', text: 'Generate a functional HTML prototype.',
        ai: 'Builds the HUD from the decisions and the unit data.', human: 'Reviews states and asks for changes.',
        output: 'Interactive HUD', route: 'prototype/hud' },
      { n: '05', title: 'Test', text: 'Interact with the prototype and identify problems.',
        ai: 'Proposes a playtest checklist; records observations.', human: 'Plays, watches testers, notes surprises.',
        output: 'Playtest notes', route: 'development/notes' },
      { n: '06', title: 'Iterate', text: 'Feed observations back into the design.',
        ai: 'Updates decisions and the prototype; logs the change.', human: 'Decides what changes and what stays.',
        output: 'DevLog entry', route: 'development/devlog' },
    ],
    trace: [
      { stage: 'Research', title: 'Warcraft III keeps hero buttons on screen', route: 'research/competitors?item=warcraft-iii' },
      { stage: 'Pattern', title: 'Hero visibility', route: 'research/ux-patterns?item=hero-visibility' },
      { stage: 'Decision', title: 'D-05 · Hero portrait fixed top-left', route: 'research/decisions?item=d-05' },
      { stage: 'Prototype', title: 'HUD state “The General (hero)”', route: 'prototype/hud?state=general' },
      { stage: 'Test', title: 'N-04 · Testers looked for gold at the bottom', route: 'development/notes?item=n-04' },
      { stage: 'Iterate', title: 'Day 05 · Gold moved beside the portrait', route: 'development/devlog?item=day-05' },
    ],
    folders: [
      ['index.html · style.css · script.js', 'The workspace shell: navigation, search, page renderers.'],
      ['research/', 'Competitor notes, UX patterns and the decision record.'],
      ['references/', 'Reference board data (images live in assets/references/).'],
      ['design/', 'Workflow, world and game-design content.'],
      ['prototype/', 'HUD engine, map, unit data, art kit and HUD state specs.'],
      ['notes/', 'Ideas, playtest notes, TODO and DevLog.'],
      ['assets/', 'Emblem and generated placeholder images.'],
    ],
  };
})();
